import type { WeaverWorkspaceConfig, WeaverProjectConfig } from './config';

/**
 * Creates a default Weaver workspace configuration with optional overrides.
 *
 * @example
 * ```typescript
 * const config = createWeaverConfig({
 *   defaultVersion: "1.0.0",
 *   schemaDirectory: "schemas/"
 * });
 * ```
 */
export function createWeaverConfig(
  overrides?: Partial<WeaverWorkspaceConfig>
): WeaverWorkspaceConfig {
  return {
    schemaDirectory: 'weaver/',
    outputDirectory: 'dist/weaver/',
    enabledByDefault: true,
    cacheDirectory: '.nx-weaver-cache/',
    downloadTimeout: 30000,
    maxRetries: 3,
    verifyHashes: true,
    ...overrides,
  };
}

/**
 * Creates a default Weaver project configuration with optional overrides.
 *
 * @example
 * ```typescript
 * const config = createProjectConfig({
 *   enabled: true,
 *   version: "1.0.0",
 *   skipValidation: false
 * });
 * ```
 */
export function createProjectConfig(overrides?: Partial<WeaverProjectConfig>): WeaverProjectConfig {
  return {
    enabled: true,
    skipValidation: false,
    skipGeneration: false,
    skipDocs: false,
    ...overrides,
  };
}

/**
 * Merges workspace and project configurations, with project config taking precedence.
 *
 * @example
 * ```typescript
 * const workspaceConfig = createWeaverConfig({ defaultVersion: "1.0.0" });
 * const projectConfig = createProjectConfig({ version: "1.1.0" });
 * const merged = mergeConfigs(workspaceConfig, projectConfig);
 * // merged.version will be "1.1.0"
 * ```
 */
export function mergeConfigs(
  base: WeaverWorkspaceConfig,
  overrides: WeaverProjectConfig
): WeaverProjectConfig {
  return {
    enabled: overrides.enabled ?? base.enabledByDefault,
    version: overrides.version ?? base.defaultVersion,
    args: { ...base.defaultArgs, ...overrides.args },
    environment: { ...base.defaultEnvironment, ...overrides.environment },
    schemaDirectory: overrides.schemaDirectory ?? base.schemaDirectory,
    outputDirectory: overrides.outputDirectory ?? base.outputDirectory,
    cacheDirectory: overrides.cacheDirectory ?? base.cacheDirectory,
    downloadTimeout: overrides.downloadTimeout ?? base.downloadTimeout,
    maxRetries: overrides.maxRetries ?? base.maxRetries,
    skipValidation: overrides.skipValidation,
    skipGeneration: overrides.skipGeneration,
    skipDocs: overrides.skipDocs,
  };
}

/**
 * Generates a cache key for a Weaver operation.
 *
 * @example
 * ```typescript
 * const key = generateCacheKey("my-api", "generate", {
 *   schemaFiles: ["schema.graphql"],
 *   config: { version: "1.0.0" }
 * });
 * // Returns: "my-api:generate:abc123"
 * ```
 */
export function generateCacheKey(
  projectName: string,
  operation: string,
  context: Record<string, any>
): string {
  const contextHash = JSON.stringify(context);
  const hash = require('node:crypto')
    .createHash('md5')
    .update(contextHash)
    .digest('hex')
    .substring(0, 8);
  return `${projectName}:${operation}:${hash}`;
}

/**
 * Validates a Weaver version string.
 *
 * @example
 * ```typescript
 * if (isValidVersion("1.0.0")) {
 *   console.log("Valid version");
 * }
 * ```
 */
export function isValidVersion(version: string): boolean {
  return /^\d+\.\d+\.\d+/.test(version);
}

/**
 * Normalizes a file path for cross-platform compatibility.
 *
 * @example
 * ```typescript
 * const normalized = normalizePath("path\\to\\file");
 * // Returns: "path/to/file"
 * ```
 */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}

/**
 * Resolves a path relative to a base directory.
 *
 * @example
 * ```typescript
 * const resolved = resolvePath("/workspace", "apps/my-api");
 * // Returns: "/workspace/apps/my-api"
 * ```
 */
export function resolvePath(base: string, relative: string): string {
  return normalizePath(require('node:path').resolve(base, relative));
}

/**
 * Checks if a file exists.
 *
 * @example
 * ```typescript
 * if (fileExists("/workspace/schema.graphql")) {
 *   console.log("Schema file exists");
 * }
 * ```
 */
export function fileExists(filePath: string): boolean {
  try {
    return require('node:fs').existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Checks if a directory exists.
 *
 * @example
 * ```typescript
 * if (directoryExists("/workspace/apps/my-api")) {
 *   console.log("Project directory exists");
 * }
 * ```
 */
export function directoryExists(dirPath: string): boolean {
  try {
    const stats = require('fs').statSync(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Creates a directory if it doesn't exist.
 *
 * @example
 * ```typescript
 * ensureDirectory("/workspace/apps/my-api/dist");
 * ```
 */
export function ensureDirectory(dirPath: string): void {
  if (!directoryExists(dirPath)) {
    require('fs').mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Gets the file extension from a path.
 *
 * @example
 * ```typescript
 * const ext = getFileExtension("schema.graphql");
 * // Returns: "graphql"
 * ```
 */
export function getFileExtension(filePath: string): string {
  return require('path').extname(filePath).slice(1);
}

/**
 * Checks if a file has a specific extension.
 *
 * @example
 * ```typescript
 * if (hasExtension("schema.graphql", "graphql")) {
 *   console.log("GraphQL schema file");
 * }
 * ```
 */
export function hasExtension(filePath: string, extension: string): boolean {
  return getFileExtension(filePath).toLowerCase() === extension.toLowerCase();
}

/**
 * Formats a duration in milliseconds to a human-readable string.
 *
 * @example
 * ```typescript
 * const formatted = formatDuration(1250);
 * // Returns: "1.25s"
 * ```
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Formats file size in bytes to a human-readable string.
 *
 * @example
 * ```typescript
 * const formatted = formatFileSize(1024000);
 * // Returns: "1MB"
 * ```
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)}${units[unitIndex]}`;
}
