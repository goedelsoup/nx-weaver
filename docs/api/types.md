# TypeScript Types

This document describes the TypeScript types and interfaces provided by the Weaver plugin.

## Configuration Types

### WeaverWorkspaceConfig

Workspace-level configuration for Weaver settings.

```typescript
interface WeaverWorkspaceConfig {
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
  hashUrl?: string; // Weaver hash URL template
  platforms?: Record<string, string>; // Platform mapping
  architectures?: Record<string, string>; // Architecture mapping
}
```

**Properties:**

- `defaultVersion`: Default Weaver version to use for projects
- `defaultArgs`: Default arguments for Weaver commands
- `defaultEnvironment`: Default environment variables for Weaver operations
- `schemaDirectory`: Directory containing Weaver schema files
- `outputDirectory`: Directory for generated files
- `enabledByDefault`: Whether Weaver is enabled by default for new projects
- `cacheDirectory`: Directory for caching Weaver executables and results
- `downloadTimeout`: Download timeout in milliseconds
- `maxRetries`: Maximum number of retry attempts
- `verifyHashes`: Whether to verify downloaded executable hashes
- `downloadUrl`: Custom download URL template for Weaver executables
- `hashUrl`: Custom hash URL template for Weaver executables
- `platforms`: Platform name mapping (e.g., "darwin" -> "macos")
- `architectures`: Architecture name mapping (e.g., "x64" -> "amd64")

### WeaverProjectConfig

Project-specific configuration for Weaver settings.

```typescript
interface WeaverProjectConfig {
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
  templates?: Record<string, string>; // Custom templates
  postProcess?: Record<string, string[]>; // Post-processing steps
}
```

**Properties:**

- `enabled`: Whether Weaver is enabled for this project
- `version`: Weaver version for this project
- `args`: Arguments for Weaver commands
- `environment`: Environment variables for Weaver operations
- `schemaDirectory`: Schema directory for this project
- `outputDirectory`: Output directory for generated files
- `skipValidation`: Skip validation operations
- `skipGeneration`: Skip code generation operations
- `skipDocs`: Skip documentation generation operations
- `cacheDirectory`: Cache directory for this project
- `downloadTimeout`: Download timeout for this project
- `maxRetries`: Maximum retries for this project
- `templates`: Custom template paths for different output formats
- `postProcess`: Post-processing commands for generated files

### WeaverArgs

Arguments for Weaver commands.

```typescript
interface WeaverArgs {
  validate?: string[];
  generate?: string[];
  docs?: string[];
  clean?: string[];
  [command: string]: string[] | undefined;
}
```

**Properties:**

- `validate`: Arguments for validate command
- `generate`: Arguments for generate command
- `docs`: Arguments for docs command
- `clean`: Arguments for clean command
- `[command]`: Additional command arguments

## Executor Types

### WeaverExecutorContext

Context for Weaver executor operations.

```typescript
interface WeaverExecutorContext {
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
```

**Properties:**

- `projectName`: Name of the project being processed
- `projectRoot`: Root directory of the project
- `workspaceRoot`: Root directory of the workspace
- `config`: Merged configuration for the project
- `weaverPath`: Path to the Weaver executable
- `schemaFiles`: List of schema files to process
- `outputPath`: Output directory for generated files
- `cachePath`: Cache directory for the project
- `environment`: Environment variables for Weaver operations

### WeaverResult

Result of a Weaver operation.

```typescript
interface WeaverResult {
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
```

**Properties:**

- `success`: Whether the operation was successful
- `output`: Standard output from Weaver
- `error`: Error output from Weaver (if any)
- `duration`: Duration of the operation in milliseconds
- `filesGenerated`: List of files that were generated
- `filesModified`: List of files that were modified
- `filesDeleted`: List of files that were deleted
- `cacheKey`: Cache key used for the operation
- `metadata`: Additional metadata about the operation

## Error Types

### WeaverError

Base error class for Weaver operations.

```typescript
class WeaverError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true,
    public suggestions: string[] = [],
    public context?: Record<string, any>
  );
}
```

**Properties:**

- `message`: Error message
- `code`: Error code for programmatic handling
- `recoverable`: Whether the error is recoverable
- `suggestions`: Suggested solutions for the error
- `context`: Additional context about the error

### WeaverValidationError

Error thrown during configuration validation.

```typescript
class WeaverValidationError extends WeaverError {
  constructor(
    message: string,
    public field: string,
    public value: any,
    suggestions: string[] = []
  );
}
```

**Properties:**

- `field`: Name of the field that failed validation
- `value`: Value that failed validation
- `suggestions`: Suggested fixes for the validation error

### WeaverDownloadError

Error thrown during Weaver executable download.

```typescript
class WeaverDownloadError extends WeaverError {
  constructor(
    message: string,
    public version: string,
    public platform: string,
    suggestions: string[] = []
  );
}
```

**Properties:**

- `version`: Weaver version that failed to download
- `platform`: Platform for which download failed
- `suggestions`: Suggested solutions for download issues

### WeaverExecutionError

Error thrown during Weaver command execution.

```typescript
class WeaverExecutionError extends WeaverError {
  constructor(
    message: string,
    public operation: string,
    public exitCode: number,
    public output: string,
    suggestions: string[] = []
  );
}
```

**Properties:**

- `operation`: Weaver operation that failed
- `exitCode`: Exit code from Weaver process
- `output`: Output from Weaver process
- `suggestions`: Suggested solutions for execution issues

## Utility Types

### ValidationResult

Result of configuration validation.

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}
```

**Properties:**

- `isValid`: Whether the configuration is valid
- `errors`: List of validation errors
- `warnings`: List of validation warnings
- `suggestions`: List of suggestions for improvement

### CacheEntry

Cache entry for Weaver operations.

```typescript
interface CacheEntry {
  key: string;
  result: WeaverResult;
  metadata: CacheMetadata;
  integrity: string; // Hash for validation
}
```

**Properties:**

- `key`: Cache key for the entry
- `result`: Result of the cached operation
- `metadata`: Metadata about the cache entry
- `integrity`: Hash for integrity validation

### CacheMetadata

Metadata for cache entries.

```typescript
interface CacheMetadata {
  created: Date;
  lastAccessed: Date;
  accessCount: number;
  size: number;
  ttl?: number; // Time to live in milliseconds
}
```

**Properties:**

- `created`: When the cache entry was created
- `lastAccessed`: When the cache entry was last accessed
- `accessCount`: Number of times the entry has been accessed
- `size`: Size of the cached data in bytes
- `ttl`: Time to live for the cache entry

## Schema Types

### WeaverSchema

Structure of a Weaver schema file.

```typescript
interface WeaverSchema {
  name: string;
  version: string;
  description?: string;
  metrics?: MetricDefinition[];
  traces?: TraceDefinition[];
  logs?: LogDefinition[];
}
```

**Properties:**

- `name`: Name of the schema
- `version`: Version of the schema
- `description`: Description of the schema
- `metrics`: List of metric definitions
- `traces`: List of trace definitions
- `logs`: List of log definitions

### MetricDefinition

Definition of a metric in a schema.

```typescript
interface MetricDefinition {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  description: string;
  unit?: string;
  attributes?: AttributeDefinition[];
}
```

**Properties:**

- `name`: Name of the metric
- `type`: Type of the metric
- `description`: Description of the metric
- `unit`: Unit of measurement
- `attributes`: List of attribute definitions

### TraceDefinition

Definition of a trace in a schema.

```typescript
interface TraceDefinition {
  name: string;
  description: string;
  attributes?: AttributeDefinition[];
}
```

**Properties:**

- `name`: Name of the trace
- `description`: Description of the trace
- `attributes`: List of attribute definitions

### LogDefinition

Definition of a log in a schema.

```typescript
interface LogDefinition {
  name: string;
  description: string;
  attributes?: AttributeDefinition[];
}
```

**Properties:**

- `name`: Name of the log
- `description`: Description of the log
- `attributes`: List of attribute definitions

### AttributeDefinition

Definition of an attribute in a schema.

```typescript
interface AttributeDefinition {
  name: string;
  type: 'string' | 'int' | 'double' | 'bool';
  description: string;
  value?: any; // Default value
}
```

**Properties:**

- `name`: Name of the attribute
- `type`: Type of the attribute
- `description`: Description of the attribute
- `value`: Default value for the attribute

## Type Guards

### isWeaverConfig

Check if an object is a Weaver workspace configuration.

```typescript
function isWeaverConfig(obj: any): obj is WeaverWorkspaceConfig
```

**Parameters:**
- `obj`: Object to check

**Returns:**
- `boolean`: True if the object is a valid Weaver workspace configuration

### isWeaverProjectConfig

Check if an object is a Weaver project configuration.

```typescript
function isWeaverProjectConfig(obj: any): obj is WeaverProjectConfig
```

**Parameters:**
- `obj`: Object to check

**Returns:**
- `boolean`: True if the object is a valid Weaver project configuration

### isWeaverResult

Check if an object is a Weaver result.

```typescript
function isWeaverResult(obj: any): obj is WeaverResult
```

**Parameters:**
- `obj`: Object to check

**Returns:**
- `boolean`: True if the object is a valid Weaver result

### isWeaverError

Check if an error is a Weaver error.

```typescript
function isWeaverError(error: any): error is WeaverError
```

**Parameters:**
- `error`: Error to check

**Returns:**
- `boolean`: True if the error is a Weaver error

### isWeaverSchema

Check if an object is a valid Weaver schema.

```typescript
function isWeaverSchema(obj: any): obj is WeaverSchema
```

**Parameters:**
- `obj`: Object to check

**Returns:**
- `boolean`: True if the object is a valid Weaver schema

## Utility Functions

### createWeaverConfig

Create a Weaver workspace configuration with defaults.

```typescript
function createWeaverConfig(overrides?: Partial<WeaverWorkspaceConfig>): WeaverWorkspaceConfig
```

**Parameters:**
- `overrides`: Optional overrides for default values

**Returns:**
- `WeaverWorkspaceConfig`: New configuration object with defaults applied

### createProjectConfig

Create a Weaver project configuration with defaults.

```typescript
function createProjectConfig(overrides?: Partial<WeaverProjectConfig>): WeaverProjectConfig
```

**Parameters:**
- `overrides`: Optional overrides for default values

**Returns:**
- `WeaverProjectConfig`: New configuration object with defaults applied

### mergeConfigs

Merge workspace and project configurations.

```typescript
function mergeConfigs(
  base: WeaverWorkspaceConfig,
  overrides: WeaverProjectConfig
): WeaverProjectConfig
```

**Parameters:**
- `base`: Base workspace configuration
- `overrides`: Project-specific overrides

**Returns:**
- `WeaverProjectConfig`: Merged configuration

### validateConfig

Validate a Weaver configuration.

```typescript
function validateConfig(config: any): ValidationResult
```

**Parameters:**
- `config`: Configuration to validate

**Returns:**
- `ValidationResult`: Validation result with errors and warnings

### parseSchema

Parse a Weaver schema from YAML or JSON.

```typescript
function parseSchema(content: string): WeaverSchema
```

**Parameters:**
- `content`: Schema content as string

**Returns:**
- `WeaverSchema`: Parsed schema object

**Throws:**
- `WeaverValidationError`: If schema is invalid

### validateSchema

Validate a Weaver schema.

```typescript
function validateSchema(schema: WeaverSchema): ValidationResult
```

**Parameters:**
- `schema`: Schema to validate

**Returns:**
- `ValidationResult`: Validation result with errors and warnings

## Generated Code Types

### GeneratedMetrics

Type for generated metrics code.

```typescript
interface GeneratedMetrics {
  [metricName: string]: {
    add: (value: number, attributes?: Record<string, any>) => void;
    record?: (value: number, attributes?: Record<string, any>) => void;
  };
}
```

### GeneratedTraces

Type for generated traces code.

```typescript
interface GeneratedTraces {
  [traceName: string]: {
    start: (attributes?: Record<string, any>) => {
      end: (attributes?: Record<string, any>) => void;
      setAttributes: (attributes: Record<string, any>) => void;
    };
  };
}
```

### GeneratedLogs

Type for generated logs code.

```typescript
interface GeneratedLogs {
  [logName: string]: {
    info: (attributes: Record<string, any>) => void;
    warn: (attributes: Record<string, any>) => void;
    error: (attributes: Record<string, any>) => void;
    debug: (attributes: Record<string, any>) => void;
  };
}
```

## Usage Examples

### Creating Configurations

```typescript
import { createWeaverConfig, createProjectConfig } from '@nx-weaver/plugin';

// Create workspace configuration
const workspaceConfig = createWeaverConfig({
  defaultVersion: '1.0.0',
  schemaDirectory: 'weaver/',
  outputDirectory: 'dist/weaver/'
});

// Create project configuration
const projectConfig = createProjectConfig({
  version: '1.0.0',
  enabled: true,
  args: {
    validate: ['--strict'],
    generate: ['--typescript']
  }
});
```

### Validating Configurations

```typescript
import { validateConfig, isWeaverConfig } from '@nx-weaver/plugin';

const config = { /* ... */ };

if (isWeaverConfig(config)) {
  const result = validateConfig(config);
  
  if (!result.isValid) {
    console.error('Configuration errors:', result.errors);
    console.log('Suggestions:', result.suggestions);
  }
}
```

### Working with Schemas

```typescript
import { parseSchema, validateSchema, isWeaverSchema } from '@nx-weaver/plugin';

const schemaContent = `
name: "my-service"
version: "1.0.0"
metrics:
  - name: "requests_total"
    type: "counter"
    description: "Total requests"
`;

try {
  const schema = parseSchema(schemaContent);
  
  if (isWeaverSchema(schema)) {
    const result = validateSchema(schema);
    
    if (result.isValid) {
      console.log('Schema is valid');
    } else {
      console.error('Schema errors:', result.errors);
    }
  }
} catch (error) {
  console.error('Failed to parse schema:', error.message);
}
```

### Error Handling

```typescript
import { isWeaverError, WeaverError } from '@nx-weaver/plugin';

try {
  // Weaver operation
} catch (error) {
  if (isWeaverError(error)) {
    console.error(`Weaver error (${error.code}):`, error.message);
    
    if (error.suggestions.length > 0) {
      console.log('Suggestions:', error.suggestions);
    }
    
    if (error.context) {
      console.log('Context:', error.context);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Next Steps

- [Utils](utils.md) - Utility functions and helpers
- [Plugins](plugins.md) - Plugin architecture and extensions
- [Examples](../examples/) - Real-world usage examples 