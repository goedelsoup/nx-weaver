/**
 * Base event interface for Weaver operations.
 *
 * @example
 * ```typescript
 * {
 *   type: "execution",
 *   timestamp: new Date(),
 *   project: "my-api",
 *   operation: "generate",
 *   duration: 1250,
 *   success: true,
 *   metadata: { filesGenerated: 5 }
 * }
 * ```
 */
export interface WeaverEvent {
  /** Type of event */
  type: string;

  /** When the event occurred */
  timestamp: Date;

  /** Name of the project (if applicable) */
  project?: string;

  /** Type of operation (if applicable) */
  operation?: string;

  /** Duration of the operation in milliseconds (if applicable) */
  duration?: number;

  /** Whether the operation was successful (if applicable) */
  success?: boolean;

  /** Error message if the operation failed (if applicable) */
  error?: string;

  /** Additional event metadata */
  metadata?: Record<string, any>;
}

/**
 * Event emitted when downloading Weaver executables.
 *
 * @example
 * ```typescript
 * {
 *   type: "download",
 *   timestamp: new Date(),
 *   version: "1.0.0",
 *   platform: "darwin",
 *   progress: 75,
 *   metadata: { bytesDownloaded: 1536000, totalBytes: 2048000 }
 * }
 * ```
 */
export interface WeaverDownloadEvent extends WeaverEvent {
  type: 'download';

  /** Version being downloaded */
  version: string;

  /** Platform being downloaded for */
  platform: string;

  /** Download progress percentage (0-100) */
  progress?: number;
}

/**
 * Event emitted when executing Weaver commands.
 *
 * @example
 * ```typescript
 * {
 *   type: "execution",
 *   timestamp: new Date(),
 *   project: "my-api",
 *   operation: "generate",
 *   args: ["types", "resolvers"],
 *   exitCode: 0,
 *   output: "Generated 5 files successfully",
 *   duration: 1250,
 *   success: true
 * }
 * ```
 */
export interface WeaverExecutionEvent extends WeaverEvent {
  type: 'execution';

  /** Type of operation being executed */
  operation: string;

  /** Arguments passed to the command */
  args: string[];

  /** Exit code from the command */
  exitCode: number;

  /** Output from the command */
  output: string;
}

/**
 * Event emitted for cache operations.
 *
 * @example
 * ```typescript
 * {
 *   type: "cache",
 *   timestamp: new Date(),
 *   project: "my-api",
 *   action: "hit",
 *   key: "my-api:generate:abc123",
 *   size: 1024000,
 *   metadata: { cacheHit: true }
 * }
 * ```
 */
export interface WeaverCacheEvent extends WeaverEvent {
  type: 'cache';

  /** Type of cache action */
  action: 'hit' | 'miss' | 'store' | 'invalidate' | 'clear';

  /** Cache key being operated on */
  key: string;

  /** Size of the cache entry in bytes (if applicable) */
  size?: number;
}

/**
 * Event emitted for validation operations.
 *
 * @example
 * ```typescript
 * {
 *   type: "validation",
 *   timestamp: new Date(),
 *   project: "my-api",
 *   operation: "validate",
 *   schemaFiles: ["schema.graphql"],
 *   errors: [],
 *   warnings: ["Deprecated field used"],
 *   duration: 500,
 *   success: true
 * }
 * ```
 */
export interface WeaverValidationEvent extends WeaverEvent {
  type: 'validation';

  /** Schema files being validated */
  schemaFiles: string[];

  /** Validation errors found */
  errors: string[];

  /** Validation warnings found */
  warnings: string[];
}

/**
 * Event emitted for generation operations.
 *
 * @example
 * ```typescript
 * {
 *   type: "generation",
 *   timestamp: new Date(),
 *   project: "my-api",
 *   operation: "generate",
 *   targets: ["types", "resolvers"],
 *   filesGenerated: ["types.ts", "resolvers.ts"],
 *   duration: 1250,
 *   success: true
 * }
 * ```
 */
export interface WeaverGenerationEvent extends WeaverEvent {
  type: 'generation';

  /** Generation targets */
  targets: string[];

  /** Files that were generated */
  filesGenerated: string[];
}

/**
 * Event emitted for documentation operations.
 *
 * @example
 * ```typescript
 * {
 *   type: "documentation",
 *   timestamp: new Date(),
 *   project: "my-api",
 *   operation: "docs",
 *   format: "markdown",
 *   outputFiles: ["api.md", "schema.md"],
 *   duration: 800,
 *   success: true
 * }
 * ```
 */
export interface WeaverDocumentationEvent extends WeaverEvent {
  type: 'documentation';

  /** Documentation format */
  format: string;

  /** Documentation files that were generated */
  outputFiles: string[];
}

/**
 * Event emitted for cleanup operations.
 *
 * @example
 * ```typescript
 * {
 *   type: "cleanup",
 *   timestamp: new Date(),
 *   project: "my-api",
 *   operation: "clean",
 *   filesDeleted: ["old-types.ts", "temp-resolvers.ts"],
 *   duration: 200,
 *   success: true
 * }
 * ```
 */
export interface WeaverCleanupEvent extends WeaverEvent {
  type: 'cleanup';

  /** Files that were deleted */
  filesDeleted: string[];
}

/**
 * Union type of all Weaver events.
 */
export type WeaverEventUnion =
  | WeaverDownloadEvent
  | WeaverExecutionEvent
  | WeaverCacheEvent
  | WeaverValidationEvent
  | WeaverGenerationEvent
  | WeaverDocumentationEvent
  | WeaverCleanupEvent;

/**
 * Event listener function type.
 */
export type WeaverEventListener<T extends WeaverEvent = WeaverEvent> = (event: T) => void;

/**
 * Event emitter interface for Weaver operations.
 */
export interface WeaverEventEmitter {
  /** Add an event listener */
  on<T extends WeaverEvent>(eventType: T['type'], listener: WeaverEventListener<T>): void;

  /** Remove an event listener */
  off<T extends WeaverEvent>(eventType: T['type'], listener: WeaverEventListener<T>): void;

  /** Emit an event */
  emit<T extends WeaverEvent>(event: T): void;

  /** Remove all listeners for an event type */
  removeAllListeners(eventType?: string): void;
}
