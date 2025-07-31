/**
 * Configuration for Weaver workspace settings.
 *
 * @example
 * ```json
 * {
 *   "defaultVersion": "1.0.0",
 *   "schemaDirectory": "weaver/",
 *   "enabledByDefault": true
 * }
 * ```
 */
export interface WeaverWorkspaceConfig {
  /** Default Weaver version to use for projects */
  defaultVersion?: string;

  /** Default arguments for Weaver commands */
  defaultArgs?: WeaverArgs;

  /** Default environment variables for Weaver operations */
  defaultEnvironment?: Record<string, string>;

  /** Directory containing Weaver schema files (default: "weaver/") */
  schemaDirectory?: string;

  /** Directory for generated files (default: "dist/weaver/") */
  outputDirectory?: string;

  /** Whether Weaver is enabled by default for new projects (default: true) */
  enabledByDefault?: boolean;

  /** Directory for caching Weaver executables and results (default: ".nx-weaver-cache/") */
  cacheDirectory?: string;

  /** Download timeout in milliseconds (default: 30000) */
  downloadTimeout?: number;

  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;

  /** Whether to verify downloaded executable hashes (default: true) */
  verifyHashes?: boolean;

  /** Custom download URL template for Weaver executables */
  downloadUrl?: string;

  /** Custom hash URL template for Weaver executable verification */
  hashUrl?: string;
}

/**
 * Configuration for individual Weaver projects.
 *
 * @example
 * ```json
 * {
 *   "enabled": true,
 *   "version": "1.0.0",
 *   "schemaDirectory": "schemas/",
 *   "skipValidation": false
 * }
 * ```
 */
export interface WeaverProjectConfig {
  /** Whether Weaver is enabled for this project */
  enabled?: boolean;

  /** Weaver version to use for this project */
  version?: string;

  /** Project-specific Weaver arguments */
  args?: WeaverArgs;

  /** Project-specific environment variables */
  environment?: Record<string, string>;

  /** Directory containing schema files for this project */
  schemaDirectory?: string;

  /** Directory for generated files for this project */
  outputDirectory?: string;

  /** Skip validation step during execution */
  skipValidation?: boolean;

  /** Skip generation step during execution */
  skipGeneration?: boolean;

  /** Skip documentation generation step */
  skipDocs?: boolean;

  /** Project-specific cache directory */
  cacheDirectory?: string;

  /** Project-specific download timeout */
  downloadTimeout?: number;

  /** Project-specific retry attempts */
  maxRetries?: number;
}

/**
 * Arguments for Weaver commands.
 *
 * @example
 * ```json
 * {
 *   "validate": ["schema1.graphql", "schema2.graphql"],
 *   "generate": ["types", "resolvers"],
 *   "docs": ["api"]
 * }
 * ```
 */
export interface WeaverArgs {
  /** Schema files to validate */
  validate?: string[];

  /** Code generation targets */
  generate?: string[];

  /** Documentation generation targets */
  docs?: string[];

  /** Files/directories to clean */
  clean?: string[];

  /** Additional command-specific arguments */
  [command: string]: string[] | undefined;
}

/**
 * Validation result for Weaver configuration.
 *
 * @example
 * ```typescript
 * {
 *   isValid: true,
 *   errors: [],
 *   warnings: ["Deprecated option used"],
 *   suggestions: ["Consider using newer syntax"]
 * }
 * ```
 */
export interface WeaverConfigValidation {
  /** Whether the configuration is valid */
  isValid: boolean;

  /** List of validation errors */
  errors: string[];

  /** List of validation warnings */
  warnings: string[];

  /** List of improvement suggestions */
  suggestions: string[];
}
