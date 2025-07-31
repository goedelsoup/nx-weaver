import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { gzip, gunzip } from 'node:zlib';
import { promisify } from 'node:util';
import type {
  WeaverProjectConfig,
  WeaverValidationResult,
  WeaverGenerationResult,
  WeaverDocsResult,
  WeaverCleanResult,
} from '../types/index.js';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

/**
 * Weaver operation result union type
 */
export type WeaverResult =
  | WeaverValidationResult
  | WeaverGenerationResult
  | WeaverDocsResult
  | WeaverCleanResult;

/**
 * Cache entry metadata
 */
export interface CacheMetadata {
  created: Date;
  expires: Date;
  project: string;
  operation: string;
  fileHashes: Record<string, string>;
  configHash: string;
  weaverVersion: string;
  environment: Record<string, string>;
}

/**
 * Cache entry structure
 */
export interface CacheEntry {
  key: string;
  result: WeaverResult;
  metadata: CacheMetadata;
  integrity: string;
  compressed?: boolean;
}

/**
 * Cache validation options
 */
export interface CacheValidationOptions {
  ttl?: number;
  checkIntegrity?: boolean;
  checkFiles?: boolean;
  checkConfig?: boolean;
}

/**
 * Cache storage options
 */
export interface CacheStorageOptions {
  ttl?: number;
  compress?: boolean;
  maxSize?: number;
}

/**
 * Cache key generation options
 */
export interface CacheKeyOptions {
  includeEnvironment?: boolean;
  includeConfig?: boolean;
  customComponents?: Record<string, string>;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}

/**
 * Cache manager configuration
 */
export interface CacheManagerConfig {
  cacheDirectory: string;
  defaultTTL: number;
  maxCacheSize: number;
  compressionThreshold: number;
  enableCompression: boolean;
  enableIntegrityCheck: boolean;
  weaverVersion: string;
}

/**
 * Default cache manager configuration
 */
const DEFAULT_CONFIG: Required<CacheManagerConfig> = {
  cacheDirectory: '.nx-weaver-cache/',
  defaultTTL: 3600000, // 1 hour
  maxCacheSize: 100 * 1024 * 1024, // 100MB
  compressionThreshold: 1024, // 1KB
  enableCompression: true,
  enableIntegrityCheck: true,
  weaverVersion: '1.0.0',
};

/**
 * Operation-specific TTL values (in milliseconds)
 */
const OPERATION_TTL: Record<string, number> = {
  validate: 24 * 60 * 60 * 1000, // 24 hours
  generate: 60 * 60 * 1000, // 1 hour
  docs: 12 * 60 * 60 * 1000, // 12 hours
  clean: 0, // No caching
};

/**
 * Cache Manager for Weaver operations
 */
export class CacheManager {
  private config: Required<CacheManagerConfig>;
  private cacheDir: string;
  private stats: {
    hits: number;
    misses: number;
    stores: number;
    invalidations: number;
  };

  constructor(config: Partial<CacheManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cacheDir = resolve(this.config.cacheDirectory);
    this.stats = {
      hits: 0,
      misses: 0,
      stores: 0,
      invalidations: 0,
    };

    this.ensureCacheDirectory();
  }

  /**
   * Generate a unique cache key for Weaver operations
   */
  getCacheKey(
    project: string,
    operation: string,
    files: string[],
    config: WeaverProjectConfig,
    options: CacheKeyOptions = {}
  ): string {
    const components: string[] = [project, operation, this.config.weaverVersion];

    // Add file hashes
    const fileHashes = this.getFileHashes(files);
    components.push(this.hashObject(fileHashes));

    // Add configuration hash if requested
    if (options.includeConfig !== false) {
      const configHash = this.getConfigHash(config);
      components.push(configHash);
    }

    // Add environment hash if requested
    if (options.includeEnvironment !== false) {
      const envHash = this.getEnvironmentHash(config.environment || {});
      components.push(envHash);
    }

    // Add custom components
    if (options.customComponents) {
      components.push(this.hashObject(options.customComponents));
    }

    // Generate final cache key
    const keyString = components.join('|');
    return this.hashString(keyString);
  }

  /**
   * Check if a cache entry is valid
   */
  async isCacheValid(key: string, options: CacheValidationOptions = {}): Promise<boolean> {
    try {
      const entry = await this.getCacheEntry(key);
      if (!entry) {
        return false;
      }

      // Check TTL
      if (Date.now() > entry.metadata.expires.getTime()) {
        return false;
      }

      // Check integrity if enabled
      if (options.checkIntegrity !== false && this.config.enableIntegrityCheck) {
        const expectedIntegrity = this.calculateIntegrity(entry);
        if (entry.integrity !== expectedIntegrity) {
          return false;
        }
      }

      // Check if files have changed
      if (options.checkFiles !== false) {
        const currentFileHashes = this.getFileHashes(Object.keys(entry.metadata.fileHashes));
        for (const [file, hash] of Object.entries(entry.metadata.fileHashes)) {
          if (currentFileHashes[file] !== hash) {
            return false;
          }
        }
      }

      // Check if config has changed
      if (options.checkConfig !== false) {
        // This would require the current config to be passed in
        // For now, we'll skip this check
        // TODO: Implement config change detection
      }

      return true;
    } catch (error) {
      console.warn(`Cache validation error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Store a Weaver operation result in cache
   */
  async storeCacheResult(
    key: string,
    result: WeaverResult,
    project: string,
    operation: string,
    files: string[],
    config: WeaverProjectConfig,
    options: CacheStorageOptions = {}
  ): Promise<void> {
    try {
      // Skip caching for clean operations
      if (operation === 'clean') {
        return;
      }

      const ttl = options.ttl ?? OPERATION_TTL[operation] ?? this.config.defaultTTL;
      const expires = new Date(Date.now() + ttl);

      const metadata: CacheMetadata = {
        created: new Date(),
        expires,
        project,
        operation,
        fileHashes: this.getFileHashes(files),
        configHash: this.getConfigHash(config),
        weaverVersion: this.config.weaverVersion,
        environment: config.environment || {},
      };

      const entry: CacheEntry = {
        key,
        result,
        metadata,
        integrity: '',
      };

      // Calculate integrity
      entry.integrity = this.calculateIntegrity(entry);

      // Compress if needed
      const shouldCompress =
        options.compress !== false &&
        this.config.enableCompression &&
        JSON.stringify(entry).length > this.config.compressionThreshold;

      if (shouldCompress) {
        entry.result = await this.compressResult(entry.result);
        entry.compressed = true;
      }

      // Store cache entry
      await this.writeCacheEntry(key, entry);
      this.stats.stores++;

      // Cleanup old entries if cache is too large
      await this.cleanupCache(options.maxSize ?? this.config.maxCacheSize);
    } catch (error) {
      console.warn(`Failed to store cache result for key ${key}:`, error);
    }
  }

  /**
   * Retrieve a cached Weaver operation result
   */
  async getCacheResult(key: string): Promise<WeaverResult | null> {
    try {
      const entry = await this.getCacheEntry(key);
      if (!entry) {
        this.stats.misses++;
        return null;
      }

      // Decompress if needed
      let result = entry.result;
      if (entry.compressed) {
        result = await this.decompressResult(result);
      }

      this.stats.hits++;
      return result;
    } catch (error) {
      console.warn(`Failed to retrieve cache result for key ${key}:`, error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Invalidate cache entries for a project
   */
  async invalidateCache(project: string, operation?: string): Promise<void> {
    try {
      const entries = this.getAllCacheEntries();
      const keysToDelete: string[] = [];

      for (const entry of entries) {
        const key = entry.key;
        // Check if this key belongs to the project
        if (key.startsWith(project)) {
          if (operation) {
            // Check if it's the specific operation
            if (key.includes(`-${operation}-`)) {
              keysToDelete.push(key);
            }
          } else {
            // Delete all entries for this project
            keysToDelete.push(key);
          }
        }
      }

      for (const key of keysToDelete) {
        await this.deleteCacheEntry(key);
      }

      this.stats.invalidations += keysToDelete.length;
    } catch (error) {
      console.warn(`Failed to invalidate cache for project ${project}:`, error);
    }
  }

  /**
   * Clear all cache entries
   */
  async clearCache(): Promise<void> {
    try {
      if (existsSync(this.cacheDir)) {
        rmSync(this.cacheDir, { recursive: true, force: true });
      }
      this.ensureCacheDirectory();
      this.stats = { hits: 0, misses: 0, stores: 0, invalidations: 0 };
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    const entries = this.getAllCacheEntries();
    const totalSize = entries.reduce((size, entry) => size + entry.size, 0);
    const hitRate =
      this.stats.hits + this.stats.misses > 0
        ? this.stats.hits / (this.stats.hits + this.stats.misses)
        : 0;

    const dates = entries.map((entry) => entry.mtime).sort();

    return {
      totalEntries: entries.length,
      totalSize,
      hitRate,
      oldestEntry: dates.length > 0 ? dates[0] : null,
      newestEntry: dates.length > 0 ? dates[dates.length - 1] : null,
    };
  }

  /**
   * Get cache entry file path
   */
  private getCacheEntryPath(key: string): string {
    return join(this.cacheDir, `${key}.json`);
  }

  /**
   * Ensure cache directory exists
   */
  private ensureCacheDirectory(): void {
    try {
      if (!existsSync(this.cacheDir)) {
        mkdirSync(this.cacheDir, { recursive: true });
      }
    } catch (error) {
      // Silently fail - cache operations will handle this gracefully
      console.warn(`Failed to create cache directory ${this.cacheDir}:`, error);
    }
  }

  /**
   * Write cache entry to file
   */
  private async writeCacheEntry(key: string, entry: CacheEntry): Promise<void> {
    const filePath = this.getCacheEntryPath(key);
    const dir = dirname(filePath);

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(filePath, JSON.stringify(entry, null, 2));
  }

  /**
   * Read cache entry from file
   */
  private async getCacheEntry(key: string): Promise<CacheEntry | null> {
    const filePath = this.getCacheEntryPath(key);

    if (!existsSync(filePath)) {
      return null;
    }

    try {
      const content = readFileSync(filePath, 'utf-8');
      const entry: CacheEntry = JSON.parse(content);

      // Convert date strings back to Date objects
      entry.metadata.created = new Date(entry.metadata.created);
      entry.metadata.expires = new Date(entry.metadata.expires);

      return entry;
    } catch (error) {
      console.warn(`Failed to read cache entry ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete cache entry
   */
  private async deleteCacheEntry(key: string): Promise<void> {
    const filePath = this.getCacheEntryPath(key);
    if (existsSync(filePath)) {
      rmSync(filePath, { force: true });
    }
  }

  /**
   * Find cache entries matching pattern
   */
  private findCacheEntries(pattern: string): string[] {
    if (!existsSync(this.cacheDir)) {
      return [];
    }

    const files = readdirSync(this.cacheDir);
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));

    return files
      .filter((file) => file.endsWith('.json'))
      .map((file) => file.replace('.json', ''))
      .filter((key) => regex.test(key));
  }

  /**
   * Get all cache entries with metadata
   */
  private getAllCacheEntries(): Array<{ key: string; size: number; mtime: Date }> {
    if (!existsSync(this.cacheDir)) {
      return [];
    }

    const files = readdirSync(this.cacheDir);
    return files
      .filter((file) => file.endsWith('.json'))
      .map((file) => {
        const filePath = join(this.cacheDir, file);
        const stats = statSync(filePath);
        return {
          key: file.replace('.json', ''),
          size: stats.size,
          mtime: stats.mtime,
        };
      })
      .filter((entry) => {
        // Only include valid cache entries (not test files or other JSON files)
        return !entry.key.includes('test') && entry.key.length > 10; // Cache keys are long hashes
      });
  }

  /**
   * Cleanup cache entries to maintain size limit
   */
  private async cleanupCache(maxSize: number): Promise<void> {
    const entries = this.getAllCacheEntries();
    const totalSize = entries.reduce((size, entry) => size + entry.size, 0);

    if (totalSize <= maxSize) {
      return;
    }

    // Sort by modification time (oldest first)
    const sortedEntries = entries.sort((a, b) => a.mtime.getTime() - b.mtime.getTime());

    let currentSize = totalSize;
    for (const entry of sortedEntries) {
      if (currentSize <= maxSize) {
        break;
      }

      await this.deleteCacheEntry(entry.key);
      currentSize -= entry.size;
    }
  }

  /**
   * Get file hashes for input files
   */
  private getFileHashes(files: string[]): Record<string, string> {
    const hashes: Record<string, string> = {};

    for (const file of files) {
      try {
        if (existsSync(file)) {
          const content = readFileSync(file, 'utf-8');
          hashes[file] = this.hashString(content);
        } else {
          hashes[file] = 'missing';
        }
      } catch (error) {
        hashes[file] = 'error';
      }
    }

    return hashes;
  }

  /**
   * Get configuration hash
   */
  private getConfigHash(config: WeaverProjectConfig): string {
    // Only include relevant configuration options that affect the operation
    return this.hashObject({
      version: config.version,
      args: config.args,
      environment: config.environment,
      schemaDirectory: config.schemaDirectory,
      outputDirectory: config.outputDirectory,
    });
  }

  /**
   * Get environment hash
   */
  private getEnvironmentHash(environment: Record<string, string>): string {
    return this.hashObject(environment);
  }

  /**
   * Calculate integrity hash for cache entry
   */
  private calculateIntegrity(entry: Omit<CacheEntry, 'integrity'>): string {
    return this.hashObject({
      result: entry.result,
      metadata: entry.metadata,
    });
  }

  /**
   * Hash a string
   */
  private hashString(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }

  /**
   * Hash an object
   */
  private hashObject(obj: any): string {
    const jsonString = JSON.stringify(obj, Object.keys(obj).sort());
    return this.hashString(jsonString);
  }

  /**
   * Compress result data
   */
  private async compressResult(result: WeaverResult): Promise<any> {
    const jsonString = JSON.stringify(result);
    const compressed = await gzipAsync(Buffer.from(jsonString, 'utf-8'));
    return compressed.toString('base64');
  }

  /**
   * Decompress result data
   */
  private async decompressResult(compressedResult: any): Promise<WeaverResult> {
    const buffer = Buffer.from(compressedResult, 'base64');
    const decompressed = await gunzipAsync(buffer);
    return JSON.parse(decompressed.toString('utf-8'));
  }
}

/**
 * Create a cache manager instance with default configuration
 */
export function createCacheManager(config?: Partial<CacheManagerConfig>): CacheManager {
  return new CacheManager(config);
}

/**
 * Get default cache manager configuration
 */
export function getDefaultCacheConfig(): Required<CacheManagerConfig> {
  return { ...DEFAULT_CONFIG };
}
