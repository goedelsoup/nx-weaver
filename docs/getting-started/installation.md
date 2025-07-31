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

Or using pnpm:

```bash
pnpm add @nx-weaver/plugin
```

Or using yarn:

```bash
yarn add @nx-weaver/plugin
```

### 2. Initialize Weaver in Your Workspace

```bash
nx g @nx-weaver/plugin:init
```

This command will:
- Create workspace-level Weaver configuration
- Set up default schema directories
- Configure Nx defaults for Weaver operations

#### Initialization Options

```bash
nx g @nx-weaver/plugin:init --defaultVersion=1.0.0 --schemaDirectory=weaver/ --outputDirectory=dist/weaver/
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `defaultVersion` | string | '1.0.0' | Default Weaver version to use |
| `schemaDirectory` | string | 'weaver/' | Directory for schema files |
| `outputDirectory` | string | 'dist/weaver/' | Directory for generated files |
| `enabledByDefault` | boolean | true | Enable Weaver by default for new projects |

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

#### Setup Project Options

```bash
nx g @nx-weaver/plugin:setup-project --project=my-project --version=1.0.0 --enabled=true
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `project` | string | - | Name of the project to set up |
| `version` | string | workspace default | Weaver version for this project |
| `enabled` | boolean | true | Whether to enable Weaver for this project |
| `schemaDirectory` | string | workspace default | Schema directory for this project |
| `outputDirectory` | string | workspace default | Output directory for this project |

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

**Configuration Options:**

- `defaultVersion`: Default Weaver version to use for projects
- `schemaDirectory`: Directory containing Weaver schema files
- `outputDirectory`: Directory for generated files
- `enabledByDefault`: Whether Weaver is enabled by default for new projects
- `defaultArgs`: Default arguments for Weaver commands
- `defaultEnvironment`: Default environment variables for Weaver operations
- `cacheDirectory`: Directory for caching Weaver executables and results
- `downloadTimeout`: Download timeout in milliseconds
- `maxRetries`: Maximum number of retry attempts
- `verifyHashes`: Whether to verify downloaded executable hashes

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
  },
  "environment": {
    "WEAVER_LOG_LEVEL": "info"
  },
  "skipValidation": false,
  "skipGeneration": false,
  "skipDocs": false
}
```

**Configuration Options:**

- `enabled`: Whether Weaver is enabled for this project
- `version`: Weaver version for this project
- `schemaDirectory`: Schema directory for this project
- `outputDirectory`: Output directory for generated files
- `args`: Arguments for Weaver commands
- `environment`: Environment variables for Weaver operations
- `skipValidation`: Skip validation operations
- `skipGeneration`: Skip code generation operations
- `skipDocs`: Skip documentation generation operations

## Environment Variables

The plugin supports the following environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `WEAVER_LOG_LEVEL` | 'info' | Log level for Weaver operations |
| `WEAVER_CACHE_DIR` | '.nx-weaver-cache/' | Cache directory |
| `WEAVER_DOWNLOAD_TIMEOUT` | '30000' | Download timeout in milliseconds |
| `WEAVER_MAX_RETRIES` | '3' | Maximum retry attempts |
| `WEAVER_VERIFY_HASHES` | 'true' | Whether to verify hashes |

## Troubleshooting Installation

### Common Issues

1. **Plugin not found**
   ```bash
   # Ensure the plugin is installed
   npm list @nx-weaver/plugin
   
   # Reinstall if needed
   npm install @nx-weaver/plugin
   ```

2. **Generator not found**
   ```bash
   # Check if the generator is available
   nx list @nx-weaver/plugin
   
   # Clear Nx cache
   nx reset
   ```

3. **Permission errors**
   ```bash
   # Fix permissions for cache directory
   chmod -R 755 .nx-weaver-cache/
   ```

4. **Network issues during Weaver download**
   ```bash
   # Increase timeout
   export WEAVER_DOWNLOAD_TIMEOUT=60000
   
   # Use proxy if needed
   export HTTP_PROXY=http://proxy.company.com:8080
   export HTTPS_PROXY=http://proxy.company.com:8080
   ```

### Verification Commands

```bash
# Check plugin installation
npm list @nx-weaver/plugin

# Check available generators
nx list @nx-weaver/plugin

# Check available executors
nx list @nx-weaver/plugin

# Test Weaver download
nx weaver-validate my-project --verbose
```

## Next Steps

- [Quick Start Guide](quick-start.md) - Learn the basics
- [Configuration Guide](configuration.md) - Advanced configuration options
- [User Guide](../user-guide/) - Detailed usage instructions 