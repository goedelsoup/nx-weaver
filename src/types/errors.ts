/**
 * Base error class for Weaver operations.
 *
 * @example
 * ```typescript
 * throw new WeaverError(
 *   "Failed to download Weaver executable",
 *   "DOWNLOAD_ERROR",
 *   true,
 *   ["Check your internet connection", "Verify the version exists"],
 *   { version: "1.0.0", platform: "darwin" }
 * );
 * ```
 */
export class WeaverError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable = true,
    public suggestions: string[] = [],
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'WeaverError';
  }
}

/**
 * Error thrown when configuration validation fails.
 *
 * @example
 * ```typescript
 * throw new WeaverValidationError(
 *   "Invalid schema directory path",
 *   "schemaDirectory",
 *   "/invalid/path",
 *   ["Use absolute paths", "Ensure directory exists"]
 * );
 * ```
 */
export class WeaverValidationError extends WeaverError {
  constructor(
    message: string,
    public field: string,
    public value: any,
    suggestions: string[] = []
  ) {
    super(message, 'VALIDATION_ERROR', true, suggestions);
    this.name = 'WeaverValidationError';
  }
}

/**
 * Error thrown when Weaver executable download fails.
 *
 * @example
 * ```typescript
 * throw new WeaverDownloadError(
 *   "Failed to download Weaver v1.0.0 for darwin",
 *   "1.0.0",
 *   "darwin",
 *   ["Check your internet connection", "Verify the version exists"]
 * );
 * ```
 */
export class WeaverDownloadError extends WeaverError {
  constructor(
    message: string,
    public version: string,
    public platform: string,
    suggestions: string[] = []
  ) {
    super(message, 'DOWNLOAD_ERROR', true, suggestions);
    this.name = 'WeaverDownloadError';
  }
}

/**
 * Error thrown when Weaver command execution fails.
 *
 * @example
 * ```typescript
 * throw new WeaverExecutionError(
 *   "Weaver generate command failed with exit code 1",
 *   "generate",
 *   1,
 *   "Error: Invalid schema file",
 *   ["Check schema syntax", "Validate schema files"]
 * );
 * ```
 */
export class WeaverExecutionError extends WeaverError {
  constructor(
    message: string,
    public operation: string,
    public exitCode: number,
    public output: string,
    suggestions: string[] = []
  ) {
    super(message, 'EXECUTION_ERROR', false, suggestions);
    this.name = 'WeaverExecutionError';
  }
}

/**
 * Error thrown when cache operations fail.
 *
 * @example
 * ```typescript
 * throw new WeaverCacheError(
 *   "Failed to store cache entry",
 *   "my-api:generate:abc123",
 *   ["Check disk space", "Verify cache directory permissions"]
 * );
 * ```
 */
export class WeaverCacheError extends WeaverError {
  constructor(
    message: string,
    public cacheKey: string,
    suggestions: string[] = []
  ) {
    super(message, 'CACHE_ERROR', true, suggestions);
    this.name = 'WeaverCacheError';
  }
}

/**
 * Error thrown when project detection fails.
 *
 * @example
 * ```typescript
 * throw new WeaverProjectError(
 *   "Failed to detect Weaver projects",
 *   "my-api",
 *   ["Check project configuration", "Verify schema files exist"]
 * );
 * ```
 */
export class WeaverProjectError extends WeaverError {
  constructor(
    message: string,
    public projectName: string,
    suggestions: string[] = []
  ) {
    super(message, 'PROJECT_ERROR', true, suggestions);
    this.name = 'WeaverProjectError';
  }
}

/**
 * Error thrown when configuration file operations fail.
 *
 * @example
 * ```typescript
 * throw new WeaverConfigError(
 *   "Failed to read configuration file",
 *   "weaver.config.json",
 *   ["Check file permissions", "Verify JSON syntax"]
 * );
 * ```
 */
export class WeaverConfigError extends WeaverError {
  constructor(
    message: string,
    public configPath: string,
    suggestions: string[] = []
  ) {
    super(message, 'CONFIG_ERROR', true, suggestions);
    this.name = 'WeaverConfigError';
  }
}

/**
 * Error thrown when file system operations fail.
 *
 * @example
 * ```typescript
 * throw new WeaverFileSystemError(
 *   "Failed to create output directory",
 *   "/workspace/apps/my-api/dist/weaver",
 *   ["Check permissions", "Verify disk space"]
 * );
 * ```
 */
export class WeaverFileSystemError extends WeaverError {
  constructor(
    message: string,
    public filePath: string,
    suggestions: string[] = []
  ) {
    super(message, 'FILESYSTEM_ERROR', true, suggestions);
    this.name = 'WeaverFileSystemError';
  }
}
