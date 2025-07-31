import { createHash } from 'node:crypto';
import { join, dirname, basename } from 'node:path';
import { platform, arch } from 'node:os';
import { existsSync, chmodSync, mkdirSync, readdirSync, unlinkSync, rmdirSync } from 'node:fs';
import { writeFile, readFile, fileExists } from './index.js';
import axios from 'axios';
import fs from 'fs-extra';

export interface DownloadOptions {
  timeout?: number;
  maxRetries?: number;
  verifyHashes?: boolean;
  onProgress?: (progress: number) => void;
}

export interface WeaverManagerConfig {
  cacheDirectory?: string;
  downloadTimeout?: number;
  maxRetries?: number;
  downloadUrl?: string;
  hashUrl?: string;
  verifyHashes?: boolean;
  enableLogging?: boolean;
  minDiskSpace?: number; // Minimum disk space in MB
}

export interface WeaverMetadata {
  version: string;
  platform: string;
  architecture: string;
  downloadUrl: string;
  hash?: string;
  downloadedAt: string;
  executablePath: string;
  fileSize?: number;
}

export interface DownloadProgress {
  downloaded: number;
  total: number;
  percentage: number;
}

export class WeaverManager {
  private config: Required<WeaverManagerConfig>;
  private metadataFile: string;

  constructor(config: WeaverManagerConfig = {}) {
    this.config = {
      cacheDirectory: config.cacheDirectory || '.nx-weaver-cache',
      downloadTimeout: config.downloadTimeout || 30000,
      maxRetries: config.maxRetries || 3,
      downloadUrl:
        config.downloadUrl ||
        'https://github.com/open-telemetry/weaver/releases/download/v{version}/weaver-{platform}.tar.xz',
      hashUrl:
        config.hashUrl ||
        'https://github.com/open-telemetry/weaver/releases/download/v{version}/weaver-{platform}.tar.xz.sha256',
      verifyHashes: config.verifyHashes !== false,
      enableLogging: config.enableLogging !== false,
      minDiskSpace: config.minDiskSpace || 100, // 100MB minimum
    };

    this.metadataFile = join(this.config.cacheDirectory, 'metadata.json');
    this.ensureCacheDirectory();
  }

  /**
   * Download Weaver executable for specified version
   */
  async downloadWeaver(version: string, options: DownloadOptions = {}): Promise<string> {
    this.log(`Starting download for Weaver version ${version}`);

    // Validate version format
    if (!this.isValidVersion(version)) {
      throw new Error(`Invalid version format: ${version}. Expected format: x.y.z`);
    }

    // Check if already downloaded
    if (await this.validateWeaver(version)) {
      this.log(`Weaver version ${version} already exists and is valid`);
      return this.getWeaverPath(version);
    }

    // Validate disk space
    await this.validateDiskSpace();

    const downloadOptions = {
      timeout: options.timeout || this.config.downloadTimeout,
      maxRetries: options.maxRetries || this.config.maxRetries,
      verifyHashes: options.verifyHashes !== false ? this.config.verifyHashes : false,
      onProgress: options.onProgress || (() => {}),
    };

    try {
      const downloadUrl = this.buildDownloadUrl(version);
      this.log(`Download URL: ${downloadUrl}`);

      const tempPath = await this.downloadFile(downloadUrl, version, downloadOptions);

      // Extract and set permissions
      const executablePath = await this.extractAndSetupExecutable(tempPath, version);

      // Download and verify hash if verification is enabled
      let fileHash: string | undefined;
      if (downloadOptions.verifyHashes) {
        this.log('Downloading and verifying hash...');
        const expectedHash = await this.downloadAndVerifyHash(version, executablePath);
        fileHash = expectedHash;
      }

      // Save metadata
      await this.saveMetadata(version, downloadUrl, executablePath, fileHash);

      this.log(`Successfully downloaded and installed Weaver version ${version}`);
      return executablePath;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(`Failed to download Weaver version ${version}: ${errorMessage}`, 'error');
      throw new Error(`Failed to download Weaver version ${version}: ${errorMessage}`);
    }
  }

  /**
   * Get cached executable path for version
   */
  getWeaverPath(version: string): string {
    const versionPath = this.getVersionPath(version);
    const executableName = this.getExecutableName();
    return join(versionPath, executableName);
  }

  /**
   * Validate Weaver executable
   */
  async validateWeaver(version: string): Promise<boolean> {
    try {
      const executablePath = this.getWeaverPath(version);

      // Check if executable exists
      if (!existsSync(executablePath)) {
        this.log(`Executable not found: ${executablePath}`);
        return false;
      }

      // Check if executable is accessible
      try {
        await fs.access(executablePath, fs.constants.X_OK);
      } catch {
        this.log(`Executable not accessible: ${executablePath}`);
        return false;
      }

      // Test basic functionality
      const { exec } = await import('node:child_process');
      const { promisify } = await import('node:util');
      const execAsync = promisify(exec);

      try {
        await execAsync(`"${executablePath}" --version`, { timeout: 10000 });
        this.log(`Weaver validation successful for version ${version}`);
        return true;
      } catch (execError) {
        this.log(
          `Weaver validation failed for version ${version}: ${execError instanceof Error ? execError.message : String(execError)}`
        );
        return false;
      }
    } catch (error) {
      this.log(
        `Validation error for version ${version}: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  }

  /**
   * Clean up old versions
   */
  async cleanupOldVersions(keepVersions: string[] = []): Promise<void> {
    try {
      const cacheDir = this.config.cacheDirectory;
      if (!existsSync(cacheDir)) {
        this.log('Cache directory does not exist, nothing to cleanup');
        return;
      }

      const entries = readdirSync(cacheDir, { withFileTypes: true });
      let cleanedCount = 0;

      for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== 'metadata.json') {
          const version = entry.name;
          if (!keepVersions.includes(version)) {
            const versionPath = join(cacheDir, version);
            await fs.remove(versionPath);
            cleanedCount++;
            this.log(`Cleaned up Weaver version: ${version}`);
          }
        }
      }

      // Clean up temporary files
      const tempFiles = readdirSync(cacheDir).filter((file: string) => file.startsWith('temp-'));
      for (const tempFile of tempFiles) {
        const tempPath = join(cacheDir, tempFile);
        await fs.remove(tempPath);
        this.log(`Cleaned up temporary file: ${tempFile}`);
      }

      this.log(
        `Cleanup completed. Removed ${cleanedCount} versions and ${tempFiles.length} temporary files`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(`Warning: Failed to cleanup old versions: ${errorMessage}`, 'warn');
    }
  }

  /**
   * Get list of installed versions
   */
  getInstalledVersions(): string[] {
    try {
      const cacheDir = this.config.cacheDirectory;
      if (!existsSync(cacheDir)) {
        return [];
      }

      return readdirSync(cacheDir, { withFileTypes: true })
        .filter((entry: any) => entry.isDirectory())
        .map((entry: any) => entry.name)
        .filter((name: string) => name !== 'metadata.json');
    } catch (error) {
      this.log(
        `Error getting installed versions: ${error instanceof Error ? error.message : String(error)}`
      );
      return [];
    }
  }

  /**
   * Get Weaver metadata for a version
   */
  async getMetadata(version: string): Promise<WeaverMetadata | null> {
    try {
      if (!existsSync(this.metadataFile)) {
        return null;
      }

      const metadata = JSON.parse(readFile(this.metadataFile));
      return metadata[version] || null;
    } catch (error) {
      this.log(
        `Error reading metadata for version ${version}: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalVersions: number;
    totalSize: number;
    versions: Array<{ version: string; size: number; lastUsed: string }>;
  }> {
    try {
      const versions = this.getInstalledVersions();
      const stats = {
        totalVersions: versions.length,
        totalSize: 0,
        versions: [] as Array<{ version: string; size: number; lastUsed: string }>,
      };

      for (const version of versions) {
        const metadata = await this.getMetadata(version);
        const versionPath = this.getVersionPath(version);

        if (existsSync(versionPath)) {
          const size = await this.getDirectorySize(versionPath);
          stats.totalSize += size;
          stats.versions.push({
            version,
            size,
            lastUsed: metadata?.downloadedAt || 'unknown',
          });
        }
      }

      return stats;
    } catch (error) {
      this.log(
        `Error getting cache stats: ${error instanceof Error ? error.message : String(error)}`
      );
      return { totalVersions: 0, totalSize: 0, versions: [] };
    }
  }

  private log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    if (!this.config.enableLogging) return;

    const timestamp = new Date().toISOString();
    const prefix = `[WeaverManager] [${timestamp}]`;

    switch (level) {
      case 'error':
        console.error(`${prefix} ERROR: ${message}`);
        break;
      case 'warn':
        console.warn(`${prefix} WARN: ${message}`);
        break;
      default:
        console.log(`${prefix} ${message}`);
    }
  }

  private isValidVersion(version: string): boolean {
    // Basic semver validation
    const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
    return semverRegex.test(version);
  }

  private async validateDiskSpace(): Promise<void> {
    try {
      const { exec } = await import('node:child_process');
      const { promisify } = await import('node:util');
      const execAsync = promisify(exec);

      const platformName = platform();
      let command: string;

      if (platformName === 'win32') {
        command = `wmic logicaldisk where "DeviceID='${this.config.cacheDirectory.charAt(0)}:'" get freespace /value`;
      } else {
        command = `df -P "${this.config.cacheDirectory}" | tail -1 | awk '{print $4}'`;
      }

      const result = await execAsync(command);
      const freeSpaceKB = Number.parseInt(result.stdout.trim().split('\n').pop() || '0', 10);
      const freeSpaceMB = freeSpaceKB / 1024;

      if (freeSpaceMB < this.config.minDiskSpace) {
        throw new Error(
          `Insufficient disk space. Available: ${freeSpaceMB.toFixed(2)}MB, Required: ${this.config.minDiskSpace}MB`
        );
      }

      this.log(`Disk space validation passed. Available: ${freeSpaceMB.toFixed(2)}MB`);
    } catch (error) {
      this.log(
        `Disk space validation failed: ${error instanceof Error ? error.message : String(error)}`,
        'warn'
      );
      // Don't throw error for disk space validation failure, just warn
    }
  }

  private async getDirectorySize(dirPath: string): Promise<number> {
    try {
      const { exec } = await import('node:child_process');
      const { promisify } = await import('node:util');
      const execAsync = promisify(exec);

      const platformName = platform();
      let command: string;

      if (platformName === 'win32') {
        command = `dir /s "${dirPath}" | find "File(s)"`;
      } else {
        command = `du -sk "${dirPath}" | cut -f1`;
      }

      const result = await execAsync(command);
      return Number.parseInt(result.stdout.trim(), 10) * 1024; // Convert to bytes
    } catch {
      return 0;
    }
  }

  private ensureCacheDirectory(): void {
    if (!existsSync(this.config.cacheDirectory)) {
      mkdirSync(this.config.cacheDirectory, { recursive: true });
      this.log(`Created cache directory: ${this.config.cacheDirectory}`);
    }
  }

  private getVersionPath(version: string): string {
    // Sanitize version string to prevent path traversal
    const sanitizedVersion = version.replace(/[^a-zA-Z0-9.-]/g, '');
    return join(this.config.cacheDirectory, sanitizedVersion);
  }

  private getExecutableName(): string {
    const platformName = platform();

    if (platformName === 'win32') {
      return 'weaver.exe';
    }

    return 'weaver';
  }

  private async downloadAndVerifyHash(version: string, executablePath: string): Promise<string> {
    try {
      const hashUrl = this.buildHashUrl(version);
      this.log(`Downloading hash from: ${hashUrl}`);

      const response = await axios.get(hashUrl, {
        timeout: this.config.downloadTimeout,
        maxRedirects: 5,
      });

      const expectedHash = response.data.trim().split(/\s+/)[0]; // Extract hash from "hash filename" format

      if (!expectedHash || expectedHash.length < 32) {
        throw new Error('Invalid hash format received');
      }

      // Calculate actual file hash
      const actualHash = await this.calculateFileHash(executablePath);

      if (actualHash !== expectedHash) {
        throw new Error(`Hash verification failed. Expected: ${expectedHash}, Got: ${actualHash}`);
      }

      this.log('Hash verification successful');
      return expectedHash;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(`Hash verification failed: ${errorMessage}`, 'error');
      throw new Error(`Hash verification failed: ${errorMessage}`);
    }
  }

  private buildHashUrl(version: string): string {
    const platformName = platform();
    const architecture = arch();

    let platformKey: string;

    switch (platformName) {
      case 'win32':
        platformKey = 'x86_64-pc-windows-msvc';
        break;
      case 'darwin':
        if (architecture === 'arm64') {
          platformKey = 'aarch64-apple-darwin';
        } else {
          platformKey = 'x86_64-apple-darwin';
        }
        break;
      case 'linux':
        platformKey = 'x86_64-unknown-linux-gnu';
        break;
      default:
        throw new Error(`Unsupported platform: ${platformName}`);
    }

    return this.config.hashUrl.replace('{version}', version).replace('{platform}', platformKey);
  }

  private buildDownloadUrl(version: string): string {
    const platformName = platform();
    const architecture = arch();

    let platformKey: string;

    switch (platformName) {
      case 'win32':
        platformKey = 'x86_64-pc-windows-msvc';
        break;
      case 'darwin':
        if (architecture === 'arm64') {
          platformKey = 'aarch64-apple-darwin';
        } else {
          platformKey = 'x86_64-apple-darwin';
        }
        break;
      case 'linux':
        platformKey = 'x86_64-unknown-linux-gnu';
        break;
      default:
        throw new Error(`Unsupported platform: ${platformName}`);
    }

    // For Weaver, the architecture is embedded in the platform key
    return this.config.downloadUrl.replace('{version}', version).replace('{platform}', platformKey);
  }

  private async downloadFile(
    url: string,
    version: string,
    options: Required<DownloadOptions>
  ): Promise<string> {
    const tempPath = join(this.config.cacheDirectory, `temp-${version}-${Date.now()}`);
    const versionPath = this.getVersionPath(version);

    // Ensure version directory exists
    if (!existsSync(versionPath)) {
      mkdirSync(versionPath, { recursive: true });
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= options.maxRetries; attempt++) {
      try {
        this.log(`Downloading Weaver ${version} (attempt ${attempt}/${options.maxRetries})...`);

        const response = await axios({
          method: 'GET',
          url,
          responseType: 'stream',
          timeout: options.timeout,
          maxRedirects: 5,
          onDownloadProgress: (progressEvent) => {
            if (options.onProgress && progressEvent.total) {
              const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
              options.onProgress(percentage);
            }
          },
        });

        const writer = fs.createWriteStream(tempPath);

        await new Promise<void>((resolve, reject) => {
          response.data.pipe(writer);
          writer.on('finish', resolve);
          writer.on('error', reject);
          response.data.on('error', reject);
        });

        this.log(`Download completed for Weaver ${version}`);
        return tempPath;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.log(`Download attempt ${attempt} failed: ${lastError.message}`, 'warn');

        // Clean up failed download
        if (existsSync(tempPath)) {
          await fs.remove(tempPath);
        }

        if (attempt < options.maxRetries) {
          // Exponential backoff
          const delay = Math.min(1000 * 2 ** (attempt - 1), 10000);
          this.log(`Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(
      `Failed to download after ${options.maxRetries} attempts: ${lastError?.message}`
    );
  }

  private async extractAndSetupExecutable(tempPath: string, version: string): Promise<string> {
    const versionPath = this.getVersionPath(version);
    const executableName = this.getExecutableName();
    const executablePath = join(versionPath, executableName);

    try {
      this.log(`Extracting Weaver executable for version ${version}...`);

      // Extract tar.xz file
      const { exec } = await import('node:child_process');
      const { promisify } = await import('node:util');
      const execAsync = promisify(exec);

      // Extract the tar.xz file to the version directory
      await execAsync(`tar -xJf "${tempPath}" -C "${versionPath}" --strip-components=1`);

      // Set executable permissions
      chmodSync(executablePath, 0o755);

      // Clean up temp file
      await fs.remove(tempPath);

      this.log(`Successfully extracted Weaver executable for version ${version}`);
      return executablePath;
    } catch (error) {
      // Clean up on failure
      if (existsSync(tempPath)) {
        await fs.remove(tempPath);
      }
      throw new Error(
        `Failed to extract executable: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async saveMetadata(
    version: string,
    downloadUrl: string,
    executablePath: string,
    hash?: string
  ): Promise<void> {
    const metadata: Record<string, WeaverMetadata> = {};

    // Load existing metadata
    if (existsSync(this.metadataFile)) {
      try {
        Object.assign(metadata, JSON.parse(readFile(this.metadataFile)));
      } catch {
        // Ignore parse errors, start fresh
      }
    }

    // Get file size
    let fileSize: number | undefined;
    try {
      const stats = await fs.stat(executablePath);
      fileSize = stats.size;
    } catch {
      // Ignore size calculation errors
    }

    // Add new metadata
    metadata[version] = {
      version,
      platform: platform(),
      architecture: arch(),
      downloadUrl,
      hash,
      downloadedAt: new Date().toISOString(),
      executablePath,
      fileSize,
    };

    writeFile(this.metadataFile, JSON.stringify(metadata, null, 2));
    this.log(`Saved metadata for Weaver version ${version}`);
  }

  private async calculateFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }
}

// Export a default instance
export const weaverManager = new WeaverManager();
