/**
 * Information about a Weaver executable.
 *
 * @example
 * ```typescript
 * {
 *   version: "1.0.0",
 *   path: "/workspace/.nx-weaver-cache/weaver-1.0.0",
 *   platform: "darwin",
 *   architecture: "x64",
 *   hash: "sha256:abc123...",
 *   downloaded: new Date(),
 *   lastUsed: new Date()
 * }
 * ```
 */
export interface WeaverExecutable {
  /** Version of the Weaver executable */
  version: string;

  /** Path to the executable file */
  path: string;

  /** Platform the executable was built for */
  platform: string;

  /** Architecture the executable was built for */
  architecture: string;

  /** Hash of the executable for integrity verification */
  hash: string;

  /** When the executable was downloaded */
  downloaded: Date;

  /** When the executable was last used */
  lastUsed: Date;
}

/**
 * A Weaver command to be executed.
 *
 * @example
 * ```typescript
 * {
 *   operation: "generate",
 *   args: ["types", "resolvers"],
 *   environment: { NODE_ENV: "development" },
 *   timeout: 30000,
 *   cwd: "/workspace/apps/my-api"
 * }
 * ```
 */
export interface WeaverCommand {
  /** The operation to perform */
  operation: string;

  /** Arguments for the operation */
  args: string[];

  /** Environment variables for the command */
  environment: Record<string, string>;

  /** Timeout for the command in milliseconds */
  timeout: number;

  /** Working directory for the command */
  cwd: string;
}

/**
 * Result of executing a Weaver command.
 *
 * @example
 * ```typescript
 * {
 *   exitCode: 0,
 *   stdout: "Generated 5 files successfully",
 *   stderr: "",
 *   duration: 1250,
 *   success: true
 * }
 * ```
 */
export interface WeaverCommandResult {
  /** Exit code from the command */
  exitCode: number;

  /** Standard output from the command */
  stdout: string;

  /** Standard error from the command */
  stderr: string;

  /** Duration of the command in milliseconds */
  duration: number;

  /** Whether the command was successful */
  success: boolean;
}

/**
 * Options for downloading Weaver executables.
 *
 * @example
 * ```typescript
 * {
 *   version: "1.0.0",
 *   platform: "darwin",
 *   architecture: "x64",
 *   timeout: 30000,
 *   retries: 3,
 *   verifyHash: true
 * }
 * ```
 */
export interface WeaverDownloadOptions {
  /** Version of Weaver to download */
  version: string;

  /** Platform to download for (auto-detected if not specified) */
  platform?: string;

  /** Architecture to download for (auto-detected if not specified) */
  architecture?: string;

  /** Download timeout in milliseconds */
  timeout?: number;

  /** Number of retry attempts */
  retries?: number;

  /** Whether to verify the downloaded file hash */
  verifyHash?: boolean;
}

/**
 * Information about available Weaver versions.
 *
 * @example
 * ```typescript
 * {
 *   latest: "1.2.0",
 *   stable: "1.1.0",
 *   versions: ["1.0.0", "1.1.0", "1.2.0"],
 *   platforms: ["darwin", "linux", "win32"],
 *   architectures: ["x64", "arm64"]
 * }
 * ```
 */
export interface WeaverVersionInfo {
  /** Latest available version */
  latest: string;

  /** Latest stable version */
  stable: string;

  /** List of all available versions */
  versions: string[];

  /** Supported platforms */
  platforms: string[];

  /** Supported architectures */
  architectures: string[];
}

/**
 * Progress information for Weaver operations.
 *
 * @example
 * ```typescript
 * {
 *   operation: "download",
 *   current: 1024000,
 *   total: 2048000,
 *   percentage: 50,
 *   speed: 1024000,
 *   eta: 1000
 * }
 * ```
 */
export interface WeaverProgress {
  /** Type of operation being performed */
  operation: string;

  /** Current progress value */
  current: number;

  /** Total value to reach */
  total: number;

  /** Progress percentage (0-100) */
  percentage: number;

  /** Speed of operation (bytes per second) */
  speed?: number;

  /** Estimated time to completion in milliseconds */
  eta?: number;
}
