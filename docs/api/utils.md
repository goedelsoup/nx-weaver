# Utility Functions

This document describes the utility functions and helpers provided by the Weaver plugin.

## Configuration Utilities

### loadWorkspaceConfig

Load and validate workspace configuration.

```typescript
function loadWorkspaceConfig(workspaceRoot: string): WeaverWorkspaceConfig
```

**Parameters:**
- `workspaceRoot`: Root directory of the workspace

**Returns:**
- `WeaverWorkspaceConfig`: Loaded workspace configuration

**Throws:**
- `WeaverValidationError`: If configuration is invalid

**Example:**
```typescript
import { loadWorkspaceConfig } from '@nx-weaver/plugin';

const config = loadWorkspaceConfig('/path/to/workspace');
console.log('Default version:', config.defaultVersion);
```

### loadProjectConfig

Load and validate project configuration.

```typescript
function loadProjectConfig(
  projectRoot: string,
  workspaceConfig?: WeaverWorkspaceConfig
): WeaverProjectConfig
```

**Parameters:**
- `projectRoot`: Root directory of the project
- `workspaceConfig`: Optional workspace configuration for inheritance

**Returns:**
- `WeaverProjectConfig`: Loaded project configuration

**Throws:**
- `WeaverValidationError`: If configuration is invalid

**Example:**
```typescript
import { loadProjectConfig, loadWorkspaceConfig } from '@nx-weaver/plugin';

const workspaceConfig = loadWorkspaceConfig('/path/to/workspace');
const projectConfig = loadProjectConfig('/path/to/project', workspaceConfig);
console.log('Project version:', projectConfig.version);
```

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

**Example:**
```typescript
import { mergeConfigs } from '@nx-weaver/plugin';

const merged = mergeConfigs(workspaceConfig, projectConfig);
console.log('Merged config:', merged);
```

### validateConfig

Validate a Weaver configuration.

```typescript
function validateConfig(config: any): ValidationResult
```

**Parameters:**
- `config`: Configuration to validate

**Returns:**
- `ValidationResult`: Validation result with errors and warnings

**Example:**
```typescript
import { validateConfig } from '@nx-weaver/plugin';

const result = validateConfig(config);
if (!result.isValid) {
  console.error('Validation errors:', result.errors);
}
```

## Schema Utilities

### loadSchema

Load and parse a Weaver schema file.

```typescript
function loadSchema(schemaPath: string): WeaverSchema
```

**Parameters:**
- `schemaPath`: Path to the schema file

**Returns:**
- `WeaverSchema`: Parsed schema object

**Throws:**
- `WeaverValidationError`: If schema is invalid

**Example:**
```typescript
import { loadSchema } from '@nx-weaver/plugin';

const schema = loadSchema('weaver/schema.yaml');
console.log('Schema name:', schema.name);
```

### parseSchema

Parse a Weaver schema from string content.

```typescript
function parseSchema(content: string): WeaverSchema
```

**Parameters:**
- `content`: Schema content as string

**Returns:**
- `WeaverSchema`: Parsed schema object

**Throws:**
- `WeaverValidationError`: If schema is invalid

**Example:**
```typescript
import { parseSchema } from '@nx-weaver/plugin';

const schemaContent = `
name: "my-service"
version: "1.0.0"
metrics:
  - name: "requests_total"
    type: "counter"
    description: "Total requests"
`;

const schema = parseSchema(schemaContent);
```

### validateSchema

Validate a Weaver schema.

```typescript
function validateSchema(schema: WeaverSchema): ValidationResult
```

**Parameters:**
- `schema`: Schema to validate

**Returns:**
- `ValidationResult`: Validation result with errors and warnings

**Example:**
```typescript
import { validateSchema } from '@nx-weaver/plugin';

const result = validateSchema(schema);
if (result.isValid) {
  console.log('Schema is valid');
} else {
  console.error('Schema errors:', result.errors);
}
```

### findSchemaFiles

Find all schema files in a directory.

```typescript
function findSchemaFiles(
  directory: string,
  patterns?: string[]
): string[]
```

**Parameters:**
- `directory`: Directory to search
- `patterns`: Optional file patterns (default: `['*.yaml', '*.yml', '*.json']`)

**Returns:**
- `string[]`: Array of schema file paths

**Example:**
```typescript
import { findSchemaFiles } from '@nx-weaver/plugin';

const schemaFiles = findSchemaFiles('weaver/');
console.log('Found schema files:', schemaFiles);
```

## Weaver Executable Utilities

### downloadWeaver

Download Weaver executable for the specified version and platform.

```typescript
function downloadWeaver(
  version: string,
  platform: string,
  architecture: string,
  options?: DownloadOptions
): Promise<string>
```

**Parameters:**
- `version`: Weaver version to download
- `platform`: Target platform (e.g., 'darwin', 'linux', 'win32')
- `architecture`: Target architecture (e.g., 'x64', 'arm64')
- `options`: Optional download options

**Returns:**
- `Promise<string>`: Path to downloaded executable

**Throws:**
- `WeaverDownloadError`: If download fails

**Example:**
```typescript
import { downloadWeaver } from '@nx-weaver/plugin';

const weaverPath = await downloadWeaver('1.0.0', 'darwin', 'x64');
console.log('Weaver downloaded to:', weaverPath);
```

### getWeaverPath

Get the path to Weaver executable, downloading if necessary.

```typescript
function getWeaverPath(
  version: string,
  platform: string,
  architecture: string,
  cacheDirectory?: string
): Promise<string>
```

**Parameters:**
- `version`: Weaver version
- `platform`: Target platform
- `architecture`: Target architecture
- `cacheDirectory`: Optional cache directory

**Returns:**
- `Promise<string>`: Path to Weaver executable

**Example:**
```typescript
import { getWeaverPath } from '@nx-weaver/plugin';

const weaverPath = await getWeaverPath('1.0.0', 'darwin', 'x64');
console.log('Weaver path:', weaverPath);
```

### executeWeaver

Execute a Weaver command.

```typescript
function executeWeaver(
  weaverPath: string,
  command: string,
  args: string[],
  options?: ExecutionOptions
): Promise<WeaverResult>
```

**Parameters:**
- `weaverPath`: Path to Weaver executable
- `command`: Weaver command to execute
- `args`: Command arguments
- `options`: Optional execution options

**Returns:**
- `Promise<WeaverResult>`: Execution result

**Throws:**
- `WeaverExecutionError`: If execution fails

**Example:**
```typescript
import { executeWeaver } from '@nx-weaver/plugin';

const result = await executeWeaver(
  weaverPath,
  'validate',
  ['--strict', 'schema.yaml']
);

if (result.success) {
  console.log('Validation successful');
} else {
  console.error('Validation failed:', result.error);
}
```

## Cache Utilities

### getCacheKey

Generate a cache key for Weaver operations.

```typescript
function getCacheKey(
  operation: string,
  inputs: Record<string, any>
): string
```

**Parameters:**
- `operation`: Operation name
- `inputs`: Operation inputs

**Returns:**
- `string`: Cache key

**Example:**
```typescript
import { getCacheKey } from '@nx-weaver/plugin';

const cacheKey = getCacheKey('generate', {
  schema: 'schema.yaml',
  version: '1.0.0',
  outputFormat: 'typescript'
});
console.log('Cache key:', cacheKey);
```

### getCacheEntry

Get a cache entry by key.

```typescript
function getCacheEntry(
  cacheDirectory: string,
  key: string
): CacheEntry | null
```

**Parameters:**
- `cacheDirectory`: Cache directory
- `key`: Cache key

**Returns:**
- `CacheEntry | null`: Cache entry or null if not found

**Example:**
```typescript
import { getCacheEntry } from '@nx-weaver/plugin';

const entry = getCacheEntry('.nx-weaver-cache/', cacheKey);
if (entry) {
  console.log('Cache hit:', entry.result);
}
```

### setCacheEntry

Set a cache entry.

```typescript
function setCacheEntry(
  cacheDirectory: string,
  key: string,
  result: WeaverResult,
  metadata?: CacheMetadata
): Promise<void>
```

**Parameters:**
- `cacheDirectory`: Cache directory
- `key`: Cache key
- `result`: Operation result
- `metadata`: Optional cache metadata

**Returns:**
- `Promise<void>`

**Example:**
```typescript
import { setCacheEntry } from '@nx-weaver/plugin';

await setCacheEntry('.nx-weaver-cache/', cacheKey, result, {
  created: new Date(),
  size: 1024
});
```

### clearCache

Clear cache entries.

```typescript
function clearCache(
  cacheDirectory: string,
  pattern?: string
): Promise<void>
```

**Parameters:**
- `cacheDirectory`: Cache directory
- `pattern`: Optional pattern to match cache keys

**Returns:**
- `Promise<void>`

**Example:**
```typescript
import { clearCache } from '@nx-weaver/plugin';

// Clear all cache
await clearCache('.nx-weaver-cache/');

// Clear specific pattern
await clearCache('.nx-weaver-cache/', 'generate-*');
```

## File System Utilities

### ensureDirectory

Ensure a directory exists, creating it if necessary.

```typescript
function ensureDirectory(path: string): Promise<void>
```

**Parameters:**
- `path`: Directory path

**Returns:**
- `Promise<void>`

**Example:**
```typescript
import { ensureDirectory } from '@nx-weaver/plugin';

await ensureDirectory('dist/weaver/');
```

### copyFile

Copy a file with optional transformation.

```typescript
function copyFile(
  source: string,
  destination: string,
  transform?: (content: string) => string
): Promise<void>
```

**Parameters:**
- `source`: Source file path
- `destination`: Destination file path
- `transform`: Optional content transformation function

**Returns:**
- `Promise<void>`

**Example:**
```typescript
import { copyFile } from '@nx-weaver/plugin';

await copyFile('template.ts', 'generated.ts', (content) => {
  return content.replace('{{NAME}}', 'MyService');
});
```

### removeFile

Remove a file or directory.

```typescript
function removeFile(path: string): Promise<void>
```

**Parameters:**
- `path`: File or directory path

**Returns:**
- `Promise<void>`

**Example:**
```typescript
import { removeFile } from '@nx-weaver/plugin';

await removeFile('dist/weaver/');
```

## Template Utilities

### loadTemplate

Load a template file.

```typescript
function loadTemplate(templatePath: string): string
```

**Parameters:**
- `templatePath`: Path to template file

**Returns:**
- `string`: Template content

**Throws:**
- `Error`: If template file not found

**Example:**
```typescript
import { loadTemplate } from '@nx-weaver/plugin';

const template = loadTemplate('templates/typescript.tmpl');
```

### renderTemplate

Render a template with variables.

```typescript
function renderTemplate(
  template: string,
  variables: Record<string, any>
): string
```

**Parameters:**
- `template`: Template content
- `variables`: Variables to substitute

**Returns:**
- `string`: Rendered template

**Example:**
```typescript
import { renderTemplate } from '@nx-weaver/plugin';

const rendered = renderTemplate(template, {
  serviceName: 'MyService',
  version: '1.0.0'
});
```

## Environment Utilities

### getEnvironment

Get environment variables with defaults.

```typescript
function getEnvironment(
  variables: Record<string, string>
): Record<string, string>
```

**Parameters:**
- `variables`: Variable names with default values

**Returns:**
- `Record<string, string>`: Environment variables

**Example:**
```typescript
import { getEnvironment } from '@nx-weaver/plugin';

const env = getEnvironment({
  WEAVER_LOG_LEVEL: 'info',
  WEAVER_CACHE_DIR: '.nx-weaver-cache/'
});
```

### expandVariables

Expand environment variables in a string.

```typescript
function expandVariables(
  text: string,
  variables: Record<string, string>
): string
```

**Parameters:**
- `text`: Text with variable placeholders
- `variables`: Variables to substitute

**Returns:**
- `string`: Text with expanded variables

**Example:**
```typescript
import { expandVariables } from '@nx-weaver/plugin';

const expanded = expandVariables(
  'Hello ${NAME}!',
  { NAME: 'World' }
);
// Result: 'Hello World!'
```

## Platform Utilities

### getPlatform

Get the current platform.

```typescript
function getPlatform(): string
```

**Returns:**
- `string`: Platform name (e.g., 'darwin', 'linux', 'win32')

**Example:**
```typescript
import { getPlatform } from '@nx-weaver/plugin';

const platform = getPlatform();
console.log('Current platform:', platform);
```

### getArchitecture

Get the current architecture.

```typescript
function getArchitecture(): string
```

**Returns:**
- `string`: Architecture name (e.g., 'x64', 'arm64')

**Example:**
```typescript
import { getArchitecture } from '@nx-weaver/plugin';

const arch = getArchitecture();
console.log('Current architecture:', arch);
```

### isSupported

Check if a platform/architecture combination is supported.

```typescript
function isSupported(
  platform: string,
  architecture: string
): boolean
```

**Parameters:**
- `platform`: Platform name
- `architecture`: Architecture name

**Returns:**
- `boolean`: True if supported

**Example:**
```typescript
import { isSupported } from '@nx-weaver/plugin';

const supported = isSupported('darwin', 'x64');
console.log('Supported:', supported);
```

## Logging Utilities

### createLogger

Create a logger instance.

```typescript
function createLogger(
  level: string,
  options?: LoggerOptions
): Logger
```

**Parameters:**
- `level`: Log level
- `options`: Optional logger options

**Returns:**
- `Logger`: Logger instance

**Example:**
```typescript
import { createLogger } from '@nx-weaver/plugin';

const logger = createLogger('info', {
  format: 'json',
  output: 'file'
});

logger.info('Weaver operation started');
```

### Logger Interface

```typescript
interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}
```

## Error Utilities

### createError

Create a Weaver error with context.

```typescript
function createError(
  code: string,
  message: string,
  context?: Record<string, any>
): WeaverError
```

**Parameters:**
- `code`: Error code
- `message`: Error message
- `context`: Optional error context

**Returns:**
- `WeaverError`: Created error

**Example:**
```typescript
import { createError } from '@nx-weaver/plugin';

const error = createError(
  'CONFIG_INVALID',
  'Invalid configuration',
  { field: 'version', value: 'invalid' }
);
```

### isRecoverable

Check if an error is recoverable.

```typescript
function isRecoverable(error: Error): boolean
```

**Parameters:**
- `error`: Error to check

**Returns:**
- `boolean`: True if error is recoverable

**Example:**
```typescript
import { isRecoverable } from '@nx-weaver/plugin';

try {
  // Weaver operation
} catch (error) {
  if (isRecoverable(error)) {
    console.log('Error is recoverable, retrying...');
  } else {
    console.error('Fatal error:', error);
  }
}
```

## Usage Examples

### Complete Workflow

```typescript
import {
  loadWorkspaceConfig,
  loadProjectConfig,
  getWeaverPath,
  executeWeaver,
  findSchemaFiles,
  validateSchema
} from '@nx-weaver/plugin';

async function processProject(projectRoot: string) {
  // Load configurations
  const workspaceConfig = loadWorkspaceConfig('/path/to/workspace');
  const projectConfig = loadProjectConfig(projectRoot, workspaceConfig);

  // Find schema files
  const schemaFiles = findSchemaFiles(`${projectRoot}/weaver/`);

  // Validate schemas
  for (const schemaFile of schemaFiles) {
    const schema = loadSchema(schemaFile);
    const result = validateSchema(schema);
    
    if (!result.isValid) {
      console.error('Schema validation failed:', result.errors);
      continue;
    }
  }

  // Get Weaver executable
  const weaverPath = await getWeaverPath(
    projectConfig.version!,
    getPlatform(),
    getArchitecture()
  );

  // Execute Weaver
  const result = await executeWeaver(
    weaverPath,
    'generate',
    ['--typescript', '--output-dir=dist/weaver/']
  );

  if (result.success) {
    console.log('Code generation successful');
  } else {
    console.error('Code generation failed:', result.error);
  }
}
```

### Error Handling

```typescript
import {
  createError,
  isRecoverable,
  WeaverError
} from '@nx-weaver/plugin';

function handleWeaverError(error: Error) {
  if (error instanceof WeaverError) {
    console.error(`Weaver error (${error.code}):`, error.message);
    
    if (error.suggestions.length > 0) {
      console.log('Suggestions:', error.suggestions);
    }
    
    if (error.context) {
      console.log('Context:', error.context);
    }
    
    if (isRecoverable(error)) {
      console.log('Error is recoverable, retrying...');
      return true; // Retry
    }
  } else {
    console.error('Unexpected error:', error);
  }
  
  return false; // Don't retry
}
```

## Next Steps

- [Types](types.md) - TypeScript types and interfaces
- [Plugins](plugins.md) - Plugin architecture and extensions
- [Examples](../examples/) - Real-world usage examples 