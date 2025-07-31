# Configuration

Learn how to configure the Nx Weaver Plugin for your workspace and projects.

## Overview

The plugin uses a two-level configuration system:
- **Workspace Configuration**: Global defaults and settings
- **Project Configuration**: Project-specific settings that override workspace defaults

## Workspace Configuration

The workspace configuration is stored in `weaver-workspace.json` and provides defaults for all projects.

### Basic Configuration

```json
{
  "defaultVersion": "1.0.0",
  "schemaDirectory": "weaver/",
  "outputDirectory": "dist/weaver/",
  "enabledByDefault": true
}
```

### Full Configuration

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
  },
  "cacheDirectory": ".nx-weaver-cache/",
  "downloadTimeout": 30000,
  "maxRetries": 3,
  "verifyHashes": true
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `defaultVersion` | string | '1.0.0' | Default Weaver version for projects |
| `schemaDirectory` | string | 'weaver/' | Directory for schema files |
| `outputDirectory` | string | 'dist/weaver/' | Directory for generated files |
| `enabledByDefault` | boolean | true | Enable Weaver by default |
| `defaultArgs` | object | {} | Default arguments for Weaver commands |
| `defaultEnvironment` | object | {} | Default environment variables |
| `cacheDirectory` | string | '.nx-weaver-cache/' | Cache directory |
| `downloadTimeout` | number | 30000 | Download timeout in ms |
| `maxRetries` | number | 3 | Maximum retry attempts |
| `verifyHashes` | boolean | true | Verify downloaded hashes |

## Project Configuration

Each project can have its own `weaver.json` configuration that overrides workspace defaults.

### Basic Project Configuration

```json
{
  "enabled": true,
  "version": "1.0.0"
}
```

### Full Project Configuration

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
    "WEAVER_LOG_LEVEL": "debug"
  },
  "skipValidation": false,
  "skipGeneration": false,
  "skipDocs": false
}
```

### Project Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | workspace default | Enable Weaver for this project |
| `version` | string | workspace default | Weaver version for this project |
| `schemaDirectory` | string | workspace default | Schema directory |
| `outputDirectory` | string | workspace default | Output directory |
| `args` | object | workspace default | Weaver command arguments |
| `environment` | object | workspace default | Environment variables |
| `skipValidation` | boolean | false | Skip validation operations |
| `skipGeneration` | boolean | false | Skip code generation |
| `skipDocs` | boolean | false | Skip documentation generation |

## Weaver Arguments

Configure arguments passed to Weaver commands.

### Validation Arguments

```json
{
  "args": {
    "validate": ["--strict", "--verbose"]
  }
}
```

Common validation arguments:
- `--strict`: Enable strict validation mode
- `--verbose`: Enable verbose output
- `--ignore-warnings`: Ignore validation warnings

### Generation Arguments

```json
{
  "args": {
    "generate": ["--typescript", "--output-dir=dist/weaver"]
  }
}
```

Common generation arguments:
- `--typescript`: Generate TypeScript code
- `--javascript`: Generate JavaScript code
- `--output-dir`: Specify output directory
- `--template`: Use custom template

### Documentation Arguments

```json
{
  "args": {
    "docs": ["--markdown", "--output-dir=docs/api"]
  }
}
```

Common documentation arguments:
- `--markdown`: Generate Markdown documentation
- `--html`: Generate HTML documentation
- `--output-dir`: Specify output directory
- `--include-examples`: Include code examples

## Environment Variables

Configure environment variables for Weaver operations.

### Workspace Environment

```json
{
  "defaultEnvironment": {
    "WEAVER_LOG_LEVEL": "info",
    "WEAVER_CACHE_DIR": ".nx-weaver-cache/",
    "WEAVER_DOWNLOAD_TIMEOUT": "30000"
  }
}
```

### Project Environment

```json
{
  "environment": {
    "WEAVER_LOG_LEVEL": "debug",
    "WEAVER_CACHE_DIR": "my-project/.weaver-cache/"
  }
}
```

## Configuration Inheritance

Project configurations inherit from workspace configurations:

1. **Workspace defaults** are applied first
2. **Project overrides** are applied second
3. **Final configuration** is the merged result

### Example

**Workspace Configuration:**
```json
{
  "defaultVersion": "1.0.0",
  "schemaDirectory": "weaver/",
  "defaultArgs": {
    "validate": ["--strict"]
  }
}
```

**Project Configuration:**
```json
{
  "version": "1.1.0",
  "args": {
    "validate": ["--strict", "--verbose"]
  }
}
```

**Final Configuration:**
```json
{
  "version": "1.1.0",
  "schemaDirectory": "weaver/",
  "args": {
    "validate": ["--strict", "--verbose"]
  }
}
```

## Configuration Validation

The plugin validates configurations automatically:

```bash
# Validate workspace configuration
nx weaver-validate --config=weaver-workspace.json

# Validate project configuration
nx weaver-validate my-project --config=weaver.json
```

## Configuration Best Practices

### 1. Use Workspace Defaults

Set common defaults in workspace configuration:

```json
{
  "defaultVersion": "1.0.0",
  "schemaDirectory": "weaver/",
  "outputDirectory": "dist/weaver/",
  "defaultArgs": {
    "validate": ["--strict"],
    "generate": ["--typescript"],
    "docs": ["--markdown"]
  }
}
```

### 2. Override Only When Needed

Only override workspace defaults in project configurations when necessary:

```json
{
  "version": "1.1.0",  // Different version
  "args": {
    "generate": ["--typescript", "--custom-template"]  // Custom template
  }
}
```

### 3. Use Environment Variables for Secrets

Don't hardcode secrets in configuration files:

```json
{
  "environment": {
    "WEAVER_API_KEY": "${WEAVER_API_KEY}"
  }
}
```

### 4. Version Consistency

Use consistent Weaver versions across related projects:

```json
{
  "defaultVersion": "1.0.0"  // All projects use same version
}
```

## Next Steps

- [Advanced Configuration](../user-guide/configuration.md) - Learn about advanced configuration options
- [User Guide](../user-guide/) - Detailed usage instructions
- [Examples](../examples/) - Real-world configuration examples 