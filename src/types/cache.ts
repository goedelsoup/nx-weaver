import type { WeaverResult } from './executor';

/**
 * A cache entry storing the result of a Weaver operation.
 *
 * @example
 * ```typescript
 * {
 *   key: "my-api:generate:abc123",
 *   result: { success: true, output: "Generated files", duration: 1250 },
 *   metadata: {
 *     created: new Date(),
 *     expires: new Date(Date.now() + 3600000),
 *     project: "my-api",
 *     operation: "generate"
 *   },
 *   integrity: "sha256:abc123..."
 * }
 * ```
 */
export interface CacheEntry {
  /** Unique cache key for this entry */
  key: string;

  /** The cached Weaver operation result */
  result: WeaverResult;

  /** Metadata about the cache entry */
  metadata: CacheMetadata;

  /** Hash for integrity validation */
  integrity: string;
}

/**
 * Metadata associated with a cache entry.
 *
 * @example
 * ```typescript
 * {
 *   created: new Date(),
 *   expires: new Date(Date.now() + 3600000),
 *   project: "my-api",
 *   operation: "generate",
 *   fileHashes: { "schema.graphql": "sha256:abc123" },
 *   configHash: "sha256:def456",
 *   weaverVersion: "1.0.0",
 *   environment: { NODE_ENV: "development" }
 * }
 * ```
 */
export interface CacheMetadata {
  /** When the cache entry was created */
  created: Date;

  /** When the cache entry expires */
  expires: Date;

  /** Name of the project this cache entry belongs to */
  project: string;

  /** Type of operation that was cached */
  operation: string;

  /** Hashes of input files used in the operation */
  fileHashes: Record<string, string>;

  /** Hash of the configuration used for the operation */
  configHash: string;

  /** Version of Weaver used for the operation */
  weaverVersion: string;

  /** Environment variables that were active during the operation */
  environment: Record<string, string>;
}

/**
 * Options for cache validation operations.
 *
 * @example
 * ```typescript
 * {
 *   checkIntegrity: true,
 *   maxAge: 3600000,
 *   validateFiles: true
 * }
 * ```
 */
export interface CacheValidationOptions {
  /** Whether to verify the integrity hash of cached results */
  checkIntegrity?: boolean;

  /** Maximum age of cache entries in milliseconds */
  maxAge?: number;

  /** Whether to validate that input files still exist and match hashes */
  validateFiles?: boolean;
}

/**
 * Options for cache storage operations.
 *
 * @example
 * ```typescript
 * {
 *   compress: true,
 *   ttl: 3600000,
 *   metadata: { priority: "high" }
 * }
 * ```
 */
export interface CacheStorageOptions {
  /** Whether to compress cache entries */
  compress?: boolean;

  /** Time-to-live for cache entries in milliseconds */
  ttl?: number;

  /** Additional metadata to store with the cache entry */
  metadata?: Record<string, any>;
}

/**
 * Statistics about cache usage.
 *
 * @example
 * ```typescript
 * {
 *   totalEntries: 150,
 *   totalSize: 1024000,
 *   hitRate: 0.85,
 *   missRate: 0.15,
 *   oldestEntry: new Date(),
 *   newestEntry: new Date()
 * }
 * ```
 */
export interface CacheStats {
  /** Total number of cache entries */
  totalEntries: number;

  /** Total size of cache in bytes */
  totalSize: number;

  /** Cache hit rate (0-1) */
  hitRate: number;

  /** Cache miss rate (0-1) */
  missRate: number;

  /** Date of the oldest cache entry */
  oldestEntry: Date;

  /** Date of the newest cache entry */
  newestEntry: Date;
}

/**
 * Result of a cache operation.
 *
 * @example
 * ```typescript
 * {
 *   success: true,
 *   action: "hit",
 *   key: "my-api:generate:abc123",
 *   result: { success: true, output: "Generated files" },
 *   duration: 50
 * }
 * ```
 */
export interface CacheOperationResult {
  /** Whether the cache operation was successful */
  success: boolean;

  /** Type of cache action performed */
  action: 'hit' | 'miss' | 'store' | 'invalidate' | 'clear';

  /** Cache key that was operated on */
  key: string;

  /** Cached result (if applicable) */
  result?: WeaverResult;

  /** Duration of the cache operation in milliseconds */
  duration: number;

  /** Error message if the operation failed */
  error?: string;
}
