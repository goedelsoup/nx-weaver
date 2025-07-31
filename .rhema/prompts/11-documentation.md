# Documentation Implementation

## Task Description
Implement comprehensive documentation for the Weaver plugin, including user guides, API documentation, examples, and migration guides.

## Requirements

### Documentation Structure
Create a comprehensive documentation structure:

```
docs/
├── README.md
├── getting-started/
│   ├── installation.md
│   ├── quick-start.md
│   └── configuration.md
├── user-guide/
│   ├── executors.md
│   ├── generators.md
│   ├── configuration.md
│   └── troubleshooting.md
├── api/
│   ├── types.md
│   ├── utils.md
│   └── plugins.md
├── examples/
│   ├── basic-setup.md
│   ├── advanced-configuration.md
│   └── integration-examples.md
├── migration/
│   ├── from-manual-weaver.md
│   └── version-upgrades.md
└── contributing/
    ├── development.md
    ├── testing.md
    └── contributing.md
```

### Main README
Implement comprehensive main README:

```markdown
# Nx OpenTelemetry Weaver Plugin

[![npm version](https://badge.fury.io/js/@nx-weaver%2Fplugin.svg)](https://badge.fury.io/js/@nx-weaver%2Fplugin)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful Nx plugin that integrates OpenTelemetry Weaver into Nx workspaces, providing transparent telemetry schema management and code generation for enterprise-scale development teams.

## Features

- 🔄 **Transparent Integration**: Automatic Weaver command execution without manual intervention
- 🚀 **Enterprise Scale**: Support for 1000+ engineers with consistent tooling
- 🛡️ **Type Safety**: Full TypeScript support with compile-time validation
- ⚡ **Performance**: Nx caching integration for minimal build impact
- 🔧 **Flexible Configuration**: Workspace and project-level configuration
- 📦 **Executable Management**: Automatic Weaver version management
- 🎯 **Build Integration**: Seamless integration with existing Nx build targets

## Quick Start

### Installation

```bash
npm install @nx-weaver/plugin
```

### Initialize Weaver in Workspace

```bash
nx g @nx-weaver/plugin:init
```

### Set up Weaver for a Project

```bash
nx g @nx-weaver/plugin:setup-project --project=my-project
```

### Run Weaver Operations

```bash
# Validate schemas
nx weaver-validate my-project

# Generate code
nx weaver-generate my-project

# Generate documentation
nx weaver-docs my-project

# Clean generated files
nx weaver-clean my-project
```

## Documentation

- [Getting Started](docs/getting-started/) - Installation and basic setup
- [User Guide](docs/user-guide/) - Detailed usage instructions
- [API Reference](docs/api/) - TypeScript types and utilities
- [Examples](docs/examples/) - Real-world usage examples
- [Migration Guide](docs/migration/) - Upgrading from manual Weaver usage

## Contributing

We welcome contributions! Please see our [Contributing Guide](docs/contributing/) for details.

## License

MIT License - see [LICENSE](LICENSE) for details.
```

### Getting Started Guide
Implement `docs/getting-started/installation.md`:

```markdown
# Installation

## Prerequisites

- Node.js 16.0.0 or later
- Nx 16.0.0 or later
- TypeScript 4.9.0 or later (for type definitions)

## Installation Steps

### 1. Install the Plugin

```bash
npm install @nx-weaver/plugin
```

### 2. Initialize Weaver in Your Workspace

```bash
nx g @nx-weaver/plugin:init
```

This command will:
- Create workspace-level Weaver configuration
- Set up default schema directories
- Configure Nx defaults for Weaver operations

### 3. Set up Weaver for Your Projects

For each project that needs Weaver integration:

```bash
nx g @nx-weaver/plugin:setup-project --project=my-project
```

This will:
- Create project-specific Weaver configuration
- Set up schema directories
- Generate initial schema files
- Configure Nx targets for the project

### 4. Verify Installation

Test that everything is working:

```bash
# Check if Weaver is properly configured
nx weaver-validate my-project

# Generate code from schemas
nx weaver-generate my-project
```

## Configuration

### Workspace Configuration

The plugin creates a `weaver-workspace.json` file with workspace defaults:

```json
{
  "defaultVersion": "1.0.0",
  "schemaDirectory": "weaver/",
  "outputDirectory": "dist/weaver/",
  "enabledByDefault": true,
  "defaultArgs": {
    "validate": ["--strict"],
    "generate": ["--typescript"],
    "docs": ["--markdown"]
  }
}
```

### Project Configuration

Each project can have its own `weaver.json` configuration:

```json
{
  "enabled": true,
  "version": "1.0.0",
  "schemaDirectory": "weaver/",
  "outputDirectory": "dist/weaver/",
  "args": {
    "validate": ["--strict"],
    "generate": ["--typescript"],
    "docs": ["--markdown"]
  }
}
```

## Next Steps

- [Quick Start Guide](quick-start.md) - Learn the basics
- [Configuration Guide](configuration.md) - Advanced configuration options
- [User Guide](../user-guide/) - Detailed usage instructions
```

### User Guide
Implement `docs/user-guide/executors.md`:

```markdown
# Executors

The Weaver plugin provides four main executors for different Weaver operations.

## Weaver Validate Executor

Validates Weaver schema files for syntax and structure.

### Usage

```bash
nx weaver-validate <project>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `dryRun` | boolean | false | Show what would be validated without executing |
| `verbose` | boolean | false | Enable verbose output |
| `strict` | boolean | false | Enable strict validation mode |
| `ignoreWarnings` | boolean | false | Ignore validation warnings |

### Examples

```bash
# Basic validation
nx weaver-validate my-project

# Verbose validation with strict mode
nx weaver-validate my-project --verbose --strict

# Dry run to see what would be validated
nx weaver-validate my-project --dryRun
```

## Weaver Generate Executor

Generates code from Weaver schema files.

### Usage

```bash
nx weaver-generate <project>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `dryRun` | boolean | false | Show what would be generated without executing |
| `verbose` | boolean | false | Enable verbose output |
| `force` | boolean | false | Force regeneration even if files exist |
| `watch` | boolean | false | Watch for schema changes and regenerate |
| `outputFormat` | string | 'typescript' | Output format (typescript, javascript, json) |

### Examples

```bash
# Generate TypeScript code
nx weaver-generate my-project

# Generate JavaScript code
nx weaver-generate my-project --outputFormat=javascript

# Force regeneration
nx weaver-generate my-project --force

# Watch mode for development
nx weaver-generate my-project --watch
```

## Weaver Docs Executor

Generates documentation from Weaver schema files.

### Usage

```bash
nx weaver-docs <project>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `dryRun` | boolean | false | Show what would be generated without executing |
| `verbose` | boolean | false | Enable verbose output |
| `format` | string | 'markdown' | Output format (markdown, html, json) |
| `outputPath` | string | auto | Custom output path |
| `includeExamples` | boolean | true | Include code examples |

### Examples

```bash
# Generate Markdown documentation
nx weaver-docs my-project

# Generate HTML documentation
nx weaver-docs my-project --format=html

# Generate documentation with custom output path
nx weaver-docs my-project --outputPath=docs/api
```

## Weaver Clean Executor

Removes generated files and cleans up temporary files.

### Usage

```bash
nx weaver-clean <project>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `dryRun` | boolean | false | Show what would be cleaned without executing |
| `verbose` | boolean | false | Enable verbose output |
| `includeCache` | boolean | false | Also clean cache files |
| `includeTemp` | boolean | false | Also clean temporary files |

### Examples

```bash
# Clean generated files
nx weaver-clean my-project

# Clean everything including cache
nx weaver-clean my-project --includeCache

# Dry run to see what would be cleaned
nx weaver-clean my-project --dryRun
```

## Build Integration

The Weaver plugin automatically integrates with your build targets. When you run:

```bash
nx build my-project
```

The build will automatically:
1. Validate Weaver schemas
2. Generate code from schemas
3. Build your project with the generated code

This integration is transparent and requires no additional configuration.

## Caching

All Weaver operations are cached by Nx. Subsequent runs with unchanged schemas will be much faster:

```bash
# First run - downloads Weaver and generates code
nx weaver-generate my-project

# Second run - uses cache, much faster
nx weaver-generate my-project
```

Cache keys are based on:
- Schema file contents
- Weaver version
- Configuration options
- Environment variables

## Error Handling

Weaver operations are designed to be non-blocking. If Weaver operations fail:

- Builds continue with warnings
- Clear error messages are provided
- Suggestions for fixing issues are included
- Cached results are used when possible

## Performance

The plugin is optimized for performance:
- **Cache hit rate**: >80% for unchanged schemas
- **Build impact**: <5 seconds for unchanged schemas
- **Memory usage**: <100MB additional memory
- **Parallel execution**: Weaver operations run in parallel across projects
```

### API Documentation
Implement `docs/api/types.md`:

```markdown
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

## Type Guards

### isWeaverConfig

Check if an object is a Weaver workspace configuration.

```typescript
function isWeaverConfig(obj: any): obj is WeaverWorkspaceConfig
```

### isWeaverProjectConfig

Check if an object is a Weaver project configuration.

```typescript
function isWeaverProjectConfig(obj: any): obj is WeaverProjectConfig
```

### isWeaverResult

Check if an object is a Weaver result.

```typescript
function isWeaverResult(obj: any): obj is WeaverResult
```

### isWeaverError

Check if an error is a Weaver error.

```typescript
function isWeaverError(error: any): error is WeaverError
```

## Utility Functions

### createWeaverConfig

Create a Weaver workspace configuration with defaults.

```typescript
function createWeaverConfig(overrides?: Partial<WeaverWorkspaceConfig>): WeaverWorkspaceConfig
```

### createProjectConfig

Create a Weaver project configuration with defaults.

```typescript
function createProjectConfig(overrides?: Partial<WeaverProjectConfig>): WeaverProjectConfig
```

### mergeConfigs

Merge workspace and project configurations.

```typescript
function mergeConfigs(
  base: WeaverWorkspaceConfig,
  overrides: WeaverProjectConfig
): WeaverProjectConfig
```
```

### Examples
Implement `docs/examples/basic-setup.md`:

```markdown
# Basic Setup Example

This example demonstrates how to set up Weaver in a typical Nx workspace with multiple projects.

## Workspace Structure

```
my-workspace/
├── apps/
│   ├── api/
│   │   ├── weaver/
│   │   │   └── schema.yaml
│   │   └── project.json
│   └── web/
│       ├── weaver/
│       │   └── schema.yaml
│       └── project.json
├── libs/
│   └── shared/
│       ├── weaver/
│       │   └── schema.yaml
│       └── project.json
├── weaver-workspace.json
└── nx.json
```

## Step 1: Install the Plugin

```bash
npm install @nx-weaver/plugin
```

## Step 2: Initialize Weaver

```bash
nx g @nx-weaver/plugin:init --defaultVersion=1.0.0
```

This creates `weaver-workspace.json`:

```json
{
  "defaultVersion": "1.0.0",
  "schemaDirectory": "weaver/",
  "outputDirectory": "dist/weaver/",
  "enabledByDefault": true,
  "defaultArgs": {
    "validate": ["--strict"],
    "generate": ["--typescript"],
    "docs": ["--markdown"]
  },
  "defaultEnvironment": {
    "WEAVER_LOG_LEVEL": "info"
  }
}
```

## Step 3: Set up Projects

Set up Weaver for each project:

```bash
# Set up API project
nx g @nx-weaver/plugin:setup-project --project=api --version=1.0.0

# Set up Web project
nx g @nx-weaver/plugin:setup-project --project=web --version=1.0.0

# Set up Shared library
nx g @nx-weaver/plugin:setup-project --project=shared --version=1.0.0
```

## Step 4: Create Schema Files

### API Schema (`apps/api/weaver/schema.yaml`)

```yaml
name: "api"
version: "1.0.0"
description: "API service telemetry schema"

metrics:
  - name: "http_requests_total"
    type: "counter"
    description: "Total number of HTTP requests"
    unit: "1"
    attributes:
      - name: "method"
        type: "string"
        description: "HTTP method"
      - name: "endpoint"
        type: "string"
        description: "API endpoint"
      - name: "status_code"
        type: "int"
        description: "HTTP status code"

traces:
  - name: "http_request"
    description: "HTTP request span"
    attributes:
      - name: "method"
        type: "string"
        description: "HTTP method"
      - name: "endpoint"
        type: "string"
        description: "API endpoint"
      - name: "status_code"
        type: "int"
        description: "HTTP status code"
```

### Web Schema (`apps/web/weaver/schema.yaml`)

```yaml
name: "web"
version: "1.0.0"
description: "Web application telemetry schema"

metrics:
  - name: "page_views_total"
    type: "counter"
    description: "Total number of page views"
    unit: "1"
    attributes:
      - name: "page"
        type: "string"
        description: "Page name"
      - name: "user_type"
        type: "string"
        description: "Type of user"

traces:
  - name: "page_load"
    description: "Page load span"
    attributes:
      - name: "page"
        type: "string"
        description: "Page name"
      - name: "load_time"
        type: "double"
        description: "Page load time in seconds"
```

### Shared Schema (`libs/shared/weaver/schema.yaml`)

```yaml
name: "shared"
version: "1.0.0"
description: "Shared telemetry schema"

metrics:
  - name: "database_queries_total"
    type: "counter"
    description: "Total number of database queries"
    unit: "1"
    attributes:
      - name: "table"
        type: "string"
        description: "Database table"
      - name: "operation"
        type: "string"
        description: "Database operation"

traces:
  - name: "database_query"
    description: "Database query span"
    attributes:
      - name: "table"
        type: "string"
        description: "Database table"
      - name: "operation"
        type: "string"
        description: "Database operation"
      - name: "query_time"
        type: "double"
        description: "Query execution time in seconds"
```

## Step 5: Validate Schemas

Validate all schemas:

```bash
# Validate individual projects
nx weaver-validate api
nx weaver-validate web
nx weaver-validate shared

# Validate all projects
nx run-many --target=weaver-validate --all
```

## Step 6: Generate Code

Generate code from schemas:

```bash
# Generate code for individual projects
nx weaver-generate api
nx weaver-generate web
nx weaver-generate shared

# Generate code for all projects
nx run-many --target=weaver-generate --all
```

This creates generated files in each project's `dist/weaver/` directory.

## Step 7: Build Projects

Build projects with generated code:

```bash
# Build individual projects
nx build api
nx build web
nx build shared

# Build all projects
nx run-many --target=build --all
```

The build process automatically:
1. Validates Weaver schemas
2. Generates code from schemas
3. Builds the project with generated code

## Step 8: Generate Documentation

Generate documentation:

```bash
# Generate docs for individual projects
nx weaver-docs api
nx weaver-docs web
nx weaver-docs shared

# Generate docs for all projects
nx run-many --target=weaver-docs --all
```

## Step 9: Use Generated Code

The generated code can be imported and used in your applications:

```typescript
// In your API service
import { createMetrics, createTraces } from '../dist/weaver';

const metrics = createMetrics();
const traces = createTraces();

// Use the generated telemetry
metrics.http_requests_total.add(1, {
  method: 'GET',
  endpoint: '/api/users',
  status_code: 200
});

traces.http_request.start({
  method: 'GET',
  endpoint: '/api/users',
  status_code: 200
});
```

## Step 10: Clean Up

Clean generated files when needed:

```bash
# Clean individual projects
nx weaver-clean api
nx weaver-clean web
nx weaver-clean shared

# Clean all projects
nx run-many --target=weaver-clean --all
```

## Configuration Files

### Project Configuration (`apps/api/weaver.json`)

```json
{
  "enabled": true,
  "version": "1.0.0",
  "schemaDirectory": "weaver/",
  "outputDirectory": "dist/weaver/",
  "args": {
    "validate": ["--strict"],
    "generate": ["--typescript"],
    "docs": ["--markdown"]
  },
  "environment": {
    "WEAVER_LOG_LEVEL": "info"
  }
}
```

### Nx Project Configuration (`apps/api/project.json`)

```json
{
  "name": "api",
  "targets": {
    "weaver-validate": {
      "executor": "@nx-weaver/validate",
      "options": {
        "project": "api"
      }
    },
    "weaver-generate": {
      "executor": "@nx-weaver/generate",
      "options": {
        "project": "api"
      },
      "dependsOn": ["weaver-validate"]
    },
    "weaver-docs": {
      "executor": "@nx-weaver/docs",
      "options": {
        "project": "api"
      },
      "dependsOn": ["weaver-validate"]
    },
    "weaver-clean": {
      "executor": "@nx-weaver/clean",
      "options": {
        "project": "api"
      }
    },
    "build": {
      "executor": "@nx/js:tsc",
      "options": {
        "main": "apps/api/src/main.ts",
        "outputPath": "dist/apps/api"
      },
      "dependsOn": ["weaver-generate"]
    }
  }
}
```

## Next Steps

- [Advanced Configuration](../user-guide/configuration.md) - Learn about advanced configuration options
- [Integration Examples](integration-examples.md) - See real-world integration examples
- [Troubleshooting](../user-guide/troubleshooting.md) - Common issues and solutions
```

## Implementation Details

### Documentation Generation
- Use Markdown for all documentation
- Include code examples and configuration samples
- Provide clear step-by-step instructions
- Include troubleshooting sections

### API Documentation
- Generate from TypeScript types
- Include JSDoc comments
- Provide usage examples
- Document all public APIs

### Examples
- Real-world usage scenarios
- Complete working examples
- Best practices
- Common patterns

## Success Criteria
- Comprehensive documentation coverage
- Clear and accessible writing
- Working code examples
- Complete API reference
- Migration guides
- Troubleshooting guides
- Searchable documentation
- Version-specific documentation 