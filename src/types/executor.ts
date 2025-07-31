import type { WeaverProjectConfig } from './config';

/**
 * Context information for Weaver executor operations.
 *
 * @example
 * ```typescript
 * {
 *   projectName: "my-api",
 *   projectRoot: "/workspace/apps/my-api",
 *   workspaceRoot: "/workspace",
 *   config: { enabled: true, version: "1.0.0" },
 *   weaverPath: "/workspace/.nx-weaver-cache/weaver-1.0.0",
 *   schemaFiles: ["schema.graphql"],
 *   outputPath: "/workspace/apps/my-api/dist/weaver",
 *   cachePath: "/workspace/.nx-weaver-cache/my-api",
 *   environment: { NODE_ENV: "development" }
 * }
 * ```
 */
export interface WeaverExecutorContext {
  /** Name of the project being processed */
  projectName: string;

  /** Root directory of the project */
  projectRoot: string;

  /** Root directory of the workspace */
  workspaceRoot: string;

  /** Project-specific Weaver configuration */
  config: WeaverProjectConfig;

  /** Path to the Weaver executable */
  weaverPath: string;

  /** List of schema files to process */
  schemaFiles: string[];

  /** Output directory for generated files */
  outputPath: string;

  /** Cache directory for this project */
  cachePath: string;

  /** Environment variables for Weaver execution */
  environment: Record<string, string>;
}

/**
 * Common options for Weaver executor operations.
 *
 * @example
 * ```typescript
 * {
 *   dryRun: false,
 *   verbose: true,
 *   force: false,
 *   watch: false,
 *   timeout: 30000,
 *   retries: 3
 * }
 * ```
 */
export interface WeaverExecutorOptions {
  /** Whether to perform a dry run without making changes */
  dryRun?: boolean;

  /** Whether to enable verbose output */
  verbose?: boolean;

  /** Whether to force execution even if files exist */
  force?: boolean;

  /** Whether to watch for changes and re-execute */
  watch?: boolean;

  /** Execution timeout in milliseconds */
  timeout?: number;

  /** Number of retry attempts on failure */
  retries?: number;
}

/**
 * Result of a Weaver operation.
 *
 * @example
 * ```typescript
 * {
 *   success: true,
 *   output: "Generated 5 files successfully",
 *   duration: 1250,
 *   filesGenerated: ["types.ts", "resolvers.ts"],
 *   cacheKey: "abc123"
 * }
 * ```
 */
export interface WeaverResult {
  /** Whether the operation was successful */
  success: boolean;

  /** Output from the Weaver operation */
  output: string;

  /** Error message if operation failed */
  error?: string;

  /** Duration of the operation in milliseconds */
  duration: number;

  /** List of files that were generated */
  filesGenerated?: string[];

  /** List of files that were modified */
  filesModified?: string[];

  /** List of files that were deleted */
  filesDeleted?: string[];

  /** Cache key used for this operation */
  cacheKey?: string;

  /** Additional metadata about the operation */
  metadata?: Record<string, any>;
}

/**
 * Standard executor result format for Nx executors.
 *
 * @example
 * ```typescript
 * {
 *   success: true,
 *   output: "Operation completed successfully"
 * }
 * ```
 */
export interface ExecutorResult {
  /** Whether the executor operation was successful */
  success: boolean;

  /** Output message from the executor */
  output: string;

  /** Error message if the operation failed */
  error?: string;
}

/**
 * Base options interface for all executors.
 *
 * @example
 * ```typescript
 * {
 *   verbose: true,
 *   dryRun: false
 * }
 * ```
 */
export interface BaseExecutorOptions {
  /** Whether to enable verbose output */
  verbose?: boolean;

  /** Whether to perform a dry run without making changes */
  dryRun?: boolean;
}

/**
 * Options for the validate executor.
 *
 * @example
 * ```typescript
 * {
 *   verbose: true,
 *   dryRun: false,
 *   strict: true,
 *   ignoreWarnings: false
 * }
 * ```
 */
export interface ValidateExecutorOptions extends BaseExecutorOptions {
  /** Whether to use strict validation rules */
  strict?: boolean;

  /** Whether to ignore validation warnings */
  ignoreWarnings?: boolean;
}

/**
 * Options for the generate executor.
 *
 * @example
 * ```typescript
 * {
 *   verbose: true,
 *   dryRun: false,
 *   force: false,
 *   watch: false,
 *   outputFormat: "typescript"
 * }
 * ```
 */
export interface GenerateExecutorOptions extends BaseExecutorOptions {
  /** Whether to force generation even if files exist */
  force?: boolean;

  /** Whether to watch for changes and re-generate */
  watch?: boolean;

  /** Output format for generated code */
  outputFormat?: 'typescript' | 'javascript' | 'json';
}

/**
 * Options for the docs executor.
 *
 * @example
 * ```typescript
 * {
 *   verbose: true,
 *   dryRun: false,
 *   format: "markdown",
 *   outputPath: "docs/",
 *   includeExamples: true
 * }
 * ```
 */
export interface DocsExecutorOptions extends BaseExecutorOptions {
  /** Output format for documentation */
  format?: 'markdown' | 'html' | 'json';

  /** Output path for generated documentation */
  outputPath?: string;

  /** Whether to include code examples in documentation */
  includeExamples?: boolean;
}

/**
 * Options for the clean executor.
 *
 * @example
 * ```typescript
 * {
 *   verbose: true,
 *   dryRun: false,
 *   includeCache: true,
 *   includeTemp: false
 * }
 * ```
 */
export interface CleanExecutorOptions extends BaseExecutorOptions {
  /** Whether to clean cache files */
  includeCache?: boolean;

  /** Whether to clean temporary files */
  includeTemp?: boolean;
}
