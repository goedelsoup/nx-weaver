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
| `config` | string | auto | Path to Weaver configuration file |
| `schema` | string | auto | Path to schema file to validate |

### Examples

```bash
# Basic validation
nx weaver-validate my-project

# Verbose validation with strict mode
nx weaver-validate my-project --verbose --strict

# Dry run to see what would be validated
nx weaver-validate my-project --dryRun

# Validate specific schema file
nx weaver-validate my-project --schema=weaver/custom-schema.yaml

# Validate with custom config
nx weaver-validate my-project --config=weaver/custom-config.json
```

### Validation Process

1. **Configuration Loading**: Loads project and workspace configurations
2. **Schema Discovery**: Finds schema files in the configured directory
3. **Syntax Validation**: Validates YAML/JSON syntax
4. **Structure Validation**: Validates schema structure and types
5. **Cross-Reference Validation**: Validates references between schemas
6. **Output Generation**: Reports validation results

### Validation Output

```bash
$ nx weaver-validate my-project --verbose

✓ Loading configuration for project 'my-project'
✓ Found 2 schema files in 'weaver/'
✓ Validating schema: weaver/schema.yaml
✓ Validating schema: weaver/extensions.yaml
✓ All schemas are valid
✓ Validation completed in 0.5s
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
| `config` | string | auto | Path to Weaver configuration file |
| `template` | string | auto | Template to use for generation |

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

# Generate with custom template
nx weaver-generate my-project --template=custom-template

# Dry run to see what would be generated
nx weaver-generate my-project --dryRun
```

### Generation Process

1. **Configuration Loading**: Loads project and workspace configurations
2. **Schema Loading**: Loads and validates schema files
3. **Template Selection**: Selects appropriate template for output format
4. **Code Generation**: Generates code from schemas using templates
5. **File Writing**: Writes generated files to output directory
6. **Post-Processing**: Applies any post-generation transformations

### Generated Files

The executor generates the following files:

```
dist/weaver/
├── index.ts              # Main export file
├── types.ts              # TypeScript type definitions
├── metrics.ts            # Metrics implementation
├── traces.ts             # Traces implementation
├── logs.ts               # Logs implementation
└── utils.ts              # Utility functions
```

### Using Generated Code

```typescript
// Import generated code
import { createMetrics, createTraces } from '../dist/weaver';

// Create instances
const metrics = createMetrics();
const traces = createTraces();

// Use metrics
metrics.http_requests_total.add(1, {
  method: 'GET',
  endpoint: '/api/users',
  status_code: 200
});

// Use traces
const span = traces.http_request.start({
  method: 'GET',
  endpoint: '/api/users'
});

// ... your code here ...

span.end({ duration: 0.5 });
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
| `config` | string | auto | Path to Weaver configuration file |
| `template` | string | auto | Template to use for documentation |

### Examples

```bash
# Generate Markdown documentation
nx weaver-docs my-project

# Generate HTML documentation
nx weaver-docs my-project --format=html

# Generate documentation with custom output path
nx weaver-docs my-project --outputPath=docs/api

# Generate without code examples
nx weaver-docs my-project --includeExamples=false

# Generate with custom template
nx weaver-docs my-project --template=custom-docs-template

# Dry run to see what would be generated
nx weaver-docs my-project --dryRun
```

### Documentation Process

1. **Configuration Loading**: Loads project and workspace configurations
2. **Schema Loading**: Loads and validates schema files
3. **Template Selection**: Selects appropriate template for output format
4. **Documentation Generation**: Generates documentation from schemas
5. **Example Generation**: Generates code examples if enabled
6. **File Writing**: Writes documentation files to output directory

### Generated Documentation

The executor generates comprehensive documentation including:

- **API Reference**: Complete API documentation
- **Type Definitions**: TypeScript type documentation
- **Usage Examples**: Code examples for all features
- **Configuration Guide**: Configuration options and examples
- **Migration Guide**: Migration instructions and examples

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
| `config` | string | auto | Path to Weaver configuration file |
| `patterns` | string[] | auto | File patterns to clean |

### Examples

```bash
# Clean generated files
nx weaver-clean my-project

# Clean everything including cache
nx weaver-clean my-project --includeCache

# Clean temporary files
nx weaver-clean my-project --includeTemp

# Clean with custom patterns
nx weaver-clean my-project --patterns="dist/weaver/**/*" --patterns="*.tmp"

# Dry run to see what would be cleaned
nx weaver-clean my-project --dryRun
```

### Cleanup Process

1. **Configuration Loading**: Loads project and workspace configurations
2. **File Discovery**: Finds files matching cleanup patterns
3. **Safety Checks**: Performs safety checks before deletion
4. **File Removal**: Removes files and directories
5. **Cache Cleanup**: Cleans cache files if requested
6. **Report Generation**: Reports cleanup results

## Build Integration

The Weaver plugin automatically integrates with your build targets. When you run:

```bash
nx build my-project
```

The build will automatically:
1. Validate Weaver schemas
2. Generate code from schemas
3. Build your project with the generated code

### Build Configuration

Add Weaver dependencies to your build targets:

```json
{
  "targets": {
    "build": {
      "executor": "@nx/js:tsc",
      "options": {
        "main": "apps/my-project/src/main.ts",
        "outputPath": "dist/apps/my-project"
      },
      "dependsOn": ["weaver-generate"]
    },
    "weaver-generate": {
      "executor": "@nx-weaver/generate",
      "options": {
        "project": "my-project"
      },
      "dependsOn": ["weaver-validate"]
    },
    "weaver-validate": {
      "executor": "@nx-weaver/validate",
      "options": {
        "project": "my-project"
      }
    }
  }
}
```

## Caching

All Weaver operations are cached by Nx. Subsequent runs with unchanged schemas will be much faster:

```bash
# First run - downloads Weaver and generates code
nx weaver-generate my-project

# Second run - uses cache, much faster
nx weaver-generate my-project
```

### Cache Keys

Cache keys are based on:
- Schema file contents (MD5 hashes)
- Weaver version
- Configuration options
- Environment variables
- Template files

### Cache Management

```bash
# Clear Weaver cache
nx weaver-clean my-project --includeCache

# Clear all Nx cache
nx reset

# View cache information
nx weaver-generate my-project --verbose
```

## Error Handling

Weaver operations are designed to be non-blocking. If Weaver operations fail:

- Builds continue with warnings
- Clear error messages are provided
- Suggestions for fixing issues are included
- Cached results are used when possible

### Common Errors

1. **Schema Validation Errors**
   ```bash
   Error: Schema validation failed
   - Invalid metric type 'invalid_type' in schema.yaml:10
   - Missing required field 'description' in schema.yaml:15
   ```

2. **Weaver Download Errors**
   ```bash
   Error: Failed to download Weaver executable
   - Network timeout after 30 seconds
   - Invalid hash for downloaded file
   ```

3. **Configuration Errors**
   ```bash
   Error: Invalid configuration
   - Unknown option 'invalidOption' in weaver.json
   - Missing required field 'version' in weaver.json
   ```

### Error Recovery

```bash
# Retry with verbose output
nx weaver-generate my-project --verbose

# Clear cache and retry
nx weaver-clean my-project --includeCache
nx weaver-generate my-project

# Check Weaver installation
nx weaver-validate my-project --verbose
```

## Performance

The plugin is optimized for performance:
- **Cache hit rate**: >80% for unchanged schemas
- **Build impact**: <5 seconds for unchanged schemas
- **Memory usage**: <100MB additional memory
- **Parallel execution**: Weaver operations run in parallel across projects

### Performance Monitoring

```bash
# Monitor performance with verbose output
nx weaver-generate my-project --verbose

# Check cache hit rates
nx weaver-generate my-project --verbose | grep "cache"

# Profile Weaver operations
time nx weaver-generate my-project
```

## Next Steps

- [Generators](generators.md) - Learn about generators for setup
- [Configuration](configuration.md) - Advanced configuration options
- [Troubleshooting](troubleshooting.md) - Common issues and solutions 