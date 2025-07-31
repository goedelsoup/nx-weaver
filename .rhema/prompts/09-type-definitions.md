# TypeScript Type Definitions and Interfaces

## Task Description
Implement comprehensive TypeScript type definitions and interfaces for the Weaver plugin, including configuration types, executor types, and utility types.

## Requirements

### Core Type Definitions
Implement `src/types/index.ts` with comprehensive type exports:

#### 1. Configuration Types
```typescript
// src/types/config.ts
export interface WeaverWorkspaceConfig {
  defaultVersion?: string;
  defaultArgs?: WeaverArgs;
  defaultEnvironment?: Record<string, string>;
  schemaDirectory?: string; // default: "weaver/"
  outputDirectory?: string; // default: "dist/weaver/"
  enabledByDefault?: boolean; // default: true
  cacheDirectory?: string; // default: ".nx-weaver-cache/"
  downloadTimeout?: number; // default: 30000ms
  maxRetries?: number; // default: 3
  verifyHashes?: boolean; // default: true
  downloadUrl?: string; // Weaver download URL template
}

export interface WeaverProjectConfig {
  enabled?: boolean;
  version?: string;
  args?: WeaverArgs;
  environment?: Record<string, string>;
  schemaDirectory?: string;
  outputDirectory?: string;
  skipValidation?: boolean;
  skipGeneration?: boolean;
  skipDocs?: boolean;
  cacheDirectory?: string;
  downloadTimeout?: number;
  maxRetries?: number;
}

export interface WeaverArgs {
  validate?: string[];
  generate?: string[];
  docs?: string[];
  clean?: string[];
  [command: string]: string[] | undefined;
}

export interface WeaverConfigValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}
```

#### 2. Executor Types
```typescript
// src/types/executor.ts
export interface WeaverExecutorContext {
  projectName: string;
  projectRoot: string;
  workspaceRoot: string;
  config: WeaverProjectConfig;
  weaverPath: string;
  schemaFiles: string[];
  outputPath: string;
  cachePath: string;
  environment: Record<string, string>;
}

export interface WeaverExecutorOptions {
  dryRun?: boolean;
  verbose?: boolean;
  force?: boolean;
  watch?: boolean;
  timeout?: number;
  retries?: number;
}

export interface WeaverResult {
  success: boolean;
  output: string;
  error?: string;
  duration: number;
  filesGenerated?: string[];
  filesModified?: string[];
  filesDeleted?: string[];
  cacheKey?: string;
  metadata?: Record<string, any>;
}

export interface ExecutorResult {
  success: boolean;
  output: string;
  error?: string;
}
```

#### 3. Cache Types
```typescript
// src/types/cache.ts
export interface CacheEntry {
  key: string;
  result: WeaverResult;
  metadata: CacheMetadata;
  integrity: string; // Hash for validation
}

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

export interface CacheValidationOptions {
  checkIntegrity?: boolean;
  maxAge?: number;
  validateFiles?: boolean;
}

export interface CacheStorageOptions {
  compress?: boolean;
  ttl?: number;
  metadata?: Record<string, any>;
}
```

#### 4. Project Types
```typescript
// src/types/project.ts
export interface WeaverProject {
  name: string;
  path: string;
  schemaFiles: string[];
  config: WeaverProjectConfig;
  enabled: boolean;
  version?: string;
  lastModified: Date;
  generatedFiles?: string[];
  cacheEntries?: string[];
}

export interface ProjectDetectionResult {
  projects: WeaverProject[];
  totalProjects: number;
  enabledProjects: number;
  disabledProjects: number;
  errors: string[];
  warnings: string[];
}
```

#### 5. Weaver Types
```typescript
// src/types/weaver.ts
export interface WeaverExecutable {
  version: string;
  path: string;
  platform: string;
  architecture: string;
  hash: string;
  downloaded: Date;
  lastUsed: Date;
}

export interface WeaverCommand {
  operation: string;
  args: string[];
  environment: Record<string, string>;
  timeout: number;
  cwd: string;
}

export interface WeaverCommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
  success: boolean;
}

export interface WeaverDownloadOptions {
  version: string;
  platform?: string;
  architecture?: string;
  timeout?: number;
  retries?: number;
  verifyHash?: boolean;
}
```

### Utility Types
Implement utility types for common patterns:

#### 1. Error Types
```typescript
// src/types/errors.ts
export class WeaverError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true,
    public suggestions: string[] = [],
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'WeaverError';
  }
}

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
```

#### 2. Event Types
```typescript
// src/types/events.ts
export interface WeaverEvent {
  type: string;
  timestamp: Date;
  project?: string;
  operation?: string;
  duration?: number;
  success?: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface WeaverDownloadEvent extends WeaverEvent {
  type: 'download';
  version: string;
  platform: string;
  progress?: number;
}

export interface WeaverExecutionEvent extends WeaverEvent {
  type: 'execution';
  operation: string;
  args: string[];
  exitCode: number;
  output: string;
}

export interface WeaverCacheEvent extends WeaverEvent {
  type: 'cache';
  action: 'hit' | 'miss' | 'store' | 'invalidate';
  key: string;
  size?: number;
}
```

#### 3. Validation Types
```typescript
// src/types/validation.ts
export interface ValidationRule<T> {
  name: string;
  validate: (value: T, context?: any) => ValidationResult;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface SchemaValidationResult extends ValidationResult {
  schema: string;
  errors: SchemaError[];
  warnings: SchemaWarning[];
}

export interface SchemaError {
  path: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface SchemaWarning {
  path: string;
  message: string;
  code: string;
  suggestion?: string;
}
```

### Type Guards and Utilities
Implement type guards and utility functions:

#### 1. Type Guards
```typescript
// src/types/guards.ts
export function isWeaverConfig(obj: any): obj is WeaverWorkspaceConfig {
  return obj && typeof obj === 'object' && 'schemaDirectory' in obj;
}

export function isWeaverProjectConfig(obj: any): obj is WeaverProjectConfig {
  return obj && typeof obj === 'object' && 'enabled' in obj;
}

export function isWeaverResult(obj: any): obj is WeaverResult {
  return obj && typeof obj === 'object' && 'success' in obj && 'output' in obj;
}

export function isWeaverError(error: any): error is WeaverError {
  return error instanceof WeaverError;
}
```

#### 2. Utility Functions
```typescript
// src/types/utils.ts
export function createWeaverConfig(overrides?: Partial<WeaverWorkspaceConfig>): WeaverWorkspaceConfig {
  return {
    schemaDirectory: 'weaver/',
    outputDirectory: 'dist/weaver/',
    enabledByDefault: true,
    cacheDirectory: '.nx-weaver-cache/',
    downloadTimeout: 30000,
    maxRetries: 3,
    verifyHashes: true,
    ...overrides
  };
}

export function createProjectConfig(overrides?: Partial<WeaverProjectConfig>): WeaverProjectConfig {
  return {
    enabled: true,
    skipValidation: false,
    skipGeneration: false,
    skipDocs: false,
    ...overrides
  };
}

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
    skipDocs: overrides.skipDocs
  };
}
```

### JSDoc Documentation
Add comprehensive JSDoc comments:

```typescript
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
}
```

## Implementation Details

### Type Organization
- Group related types in separate files
- Use barrel exports for clean imports
- Maintain backward compatibility
- Provide comprehensive JSDoc documentation

### Type Safety
- Use strict TypeScript configuration
- Implement proper type guards
- Provide utility functions for type manipulation
- Ensure compile-time type checking

### Documentation
- Add JSDoc comments for all public types
- Include usage examples
- Document default values and constraints
- Provide migration guides for type changes

## Success Criteria
- Comprehensive type coverage for all plugin functionality
- Full TypeScript type safety and IntelliSense support
- Clear and well-documented type definitions
- Proper error handling types
- Utility types for common operations
- Backward compatibility maintained
- Includes comprehensive JSDoc documentation
- Supports IDE autocompletion and type checking 