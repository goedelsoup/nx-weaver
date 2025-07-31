# Generators

The Weaver plugin provides two generators for setting up Weaver in your workspace and projects.

## Init Generator

Initializes Weaver configuration in your workspace.

### Usage

```bash
nx g @nx-weaver/plugin:init
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `defaultVersion` | string | '1.0.0' | Default Weaver version to use |
| `schemaDirectory` | string | 'weaver/' | Directory for schema files |
| `outputDirectory` | string | 'dist/weaver/' | Directory for generated files |
| `enabledByDefault` | boolean | true | Enable Weaver by default for new projects |
| `cacheDirectory` | string | '.nx-weaver-cache/' | Cache directory |
| `downloadTimeout` | number | 30000 | Download timeout in milliseconds |
| `maxRetries` | number | 3 | Maximum retry attempts |
| `verifyHashes` | boolean | true | Verify downloaded executable hashes |

### Examples

```bash
# Basic initialization
nx g @nx-weaver/plugin:init

# Initialize with custom version
nx g @nx-weaver/plugin:init --defaultVersion=1.1.0

# Initialize with custom directories
nx g @nx-weaver/plugin:init --schemaDirectory=schemas/ --outputDirectory=generated/

# Initialize with custom cache settings
nx g @nx-weaver/plugin:init --cacheDirectory=.cache/weaver/ --downloadTimeout=60000

# Initialize with hash verification disabled
nx g @nx-weaver/plugin:init --verifyHashes=false
```

### Generated Files

The init generator creates the following files:

```
weaver-workspace.json          # Workspace configuration
.nx-weaver-cache/              # Cache directory
```

### Workspace Configuration

The generator creates a `weaver-workspace.json` file with workspace defaults:

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

### Nx Defaults

The generator also configures Nx defaults for Weaver operations:

```json
{
  "generators": {
    "@nx-weaver/plugin:setup-project": {
      "version": "1.0.0",
      "enabled": true,
      "schemaDirectory": "weaver/",
      "outputDirectory": "dist/weaver/"
    }
  }
}
```

## Setup Project Generator

Sets up Weaver for a specific project.

### Usage

```bash
nx g @nx-weaver/plugin:setup-project <project>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `project` | string | - | Name of the project to set up |
| `version` | string | workspace default | Weaver version for this project |
| `enabled` | boolean | true | Whether to enable Weaver for this project |
| `schemaDirectory` | string | workspace default | Schema directory for this project |
| `outputDirectory` | string | workspace default | Output directory for this project |
| `skipValidation` | boolean | false | Skip validation operations |
| `skipGeneration` | boolean | false | Skip code generation |
| `skipDocs` | boolean | false | Skip documentation generation |

### Examples

```bash
# Basic project setup
nx g @nx-weaver/plugin:setup-project my-project

# Setup with custom version
nx g @nx-weaver/plugin:setup-project my-project --version=1.1.0

# Setup with custom directories
nx g @nx-weaver/plugin:setup-project my-project --schemaDirectory=schemas/ --outputDirectory=generated/

# Setup with operations disabled
nx g @nx-weaver/plugin:setup-project my-project --skipValidation=true --skipDocs=true

# Setup disabled project
nx g @nx-weaver/plugin:setup-project my-project --enabled=false
```

### Generated Files

The setup project generator creates the following files:

```
<project>/
├── weaver.json               # Project configuration
├── weaver/                   # Schema directory
│   └── schema.yaml          # Initial schema file
└── project.json             # Updated with Weaver targets
```

### Project Configuration

The generator creates a `weaver.json` file for the project:

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

### Initial Schema

The generator creates an initial schema file at `weaver/schema.yaml`:

```yaml
name: "my-project"
version: "1.0.0"
description: "Telemetry schema for my-project"

metrics:
  - name: "requests_total"
    type: "counter"
    description: "Total number of requests"
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
  - name: "request"
    description: "Request span"
    attributes:
      - name: "method"
        type: "string"
        description: "HTTP method"
      - name: "endpoint"
        type: "string"
        description: "API endpoint"
      - name: "duration"
        type: "double"
        description: "Request duration in seconds"

logs:
  - name: "request_log"
    description: "Request log entry"
    attributes:
      - name: "level"
        type: "string"
        description: "Log level"
      - name: "message"
        type: "string"
        description: "Log message"
```

### Nx Targets

The generator adds Weaver targets to the project's `project.json`:

```json
{
  "targets": {
    "weaver-validate": {
      "executor": "@nx-weaver/validate",
      "options": {
        "project": "my-project"
      }
    },
    "weaver-generate": {
      "executor": "@nx-weaver/generate",
      "options": {
        "project": "my-project"
      },
      "dependsOn": ["weaver-validate"]
    },
    "weaver-docs": {
      "executor": "@nx-weaver/docs",
      "options": {
        "project": "my-project"
      },
      "dependsOn": ["weaver-validate"]
    },
    "weaver-clean": {
      "executor": "@nx-weaver/clean",
      "options": {
        "project": "my-project"
      }
    }
  }
}
```

## Generator Workflow

### Typical Setup Workflow

1. **Initialize Workspace**
   ```bash
   nx g @nx-weaver/plugin:init --defaultVersion=1.0.0
   ```

2. **Set up Projects**
   ```bash
   # Set up multiple projects
   nx g @nx-weaver/plugin:setup-project api --version=1.0.0
   nx g @nx-weaver/plugin:setup-project web --version=1.0.0
   nx g @nx-weaver/plugin:setup-project shared --version=1.0.0
   ```

3. **Customize Schemas**
   ```bash
   # Edit generated schema files
   vim api/weaver/schema.yaml
   vim web/weaver/schema.yaml
   vim shared/weaver/schema.yaml
   ```

4. **Validate and Generate**
   ```bash
   # Validate all projects
   nx run-many --target=weaver-validate --all
   
   # Generate code for all projects
   nx run-many --target=weaver-generate --all
   ```

### Advanced Setup Workflow

1. **Initialize with Custom Settings**
   ```bash
   nx g @nx-weaver/plugin:init \
     --defaultVersion=1.1.0 \
     --schemaDirectory=schemas/ \
     --outputDirectory=generated/ \
     --cacheDirectory=.cache/weaver/ \
     --downloadTimeout=60000
   ```

2. **Set up Projects with Different Configurations**
   ```bash
   # Production project with strict validation
   nx g @nx-weaver/plugin:setup-project api \
     --version=1.1.0 \
     --schemaDirectory=schemas/ \
     --outputDirectory=generated/
   
   # Development project with relaxed settings
   nx g @nx-weaver/plugin:setup-project dev-api \
     --version=1.0.0 \
     --skipValidation=true \
     --skipDocs=true
   ```

3. **Customize Configurations**
   ```bash
   # Edit project configurations
   vim api/weaver.json
   vim dev-api/weaver.json
   ```

## Generator Best Practices

### 1. Use Consistent Versions

Use the same Weaver version across related projects:

```bash
# Initialize with specific version
nx g @nx-weaver/plugin:init --defaultVersion=1.0.0

# All projects will use the same version by default
nx g @nx-weaver/plugin:setup-project api
nx g @nx-weaver/plugin:setup-project web
nx g @nx-weaver/plugin:setup-project shared
```

### 2. Organize by Project Type

Use different configurations for different project types:

```bash
# Backend services with full telemetry
nx g @nx-weaver/plugin:setup-project api \
  --schemaDirectory=telemetry/ \
  --outputDirectory=dist/telemetry/

# Frontend apps with minimal telemetry
nx g @nx-weaver/plugin:setup-project web \
  --schemaDirectory=metrics/ \
  --outputDirectory=src/generated/

# Shared libraries
nx g @nx-weaver/plugin:setup-project shared \
  --schemaDirectory=schemas/ \
  --outputDirectory=lib/generated/
```

### 3. Use Environment-Specific Configurations

Set up different configurations for different environments:

```bash
# Production configuration
nx g @nx-weaver/plugin:setup-project api-prod \
  --version=1.0.0 \
  --enabled=true

# Development configuration
nx g @nx-weaver/plugin:setup-project api-dev \
  --version=1.0.0 \
  --enabled=true \
  --skipValidation=true
```

### 4. Customize Generated Schemas

After running generators, customize the generated schemas:

```yaml
# api/weaver/schema.yaml
name: "api-service"
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
      - name: "service"
        type: "string"
        description: "Service name"
        value: "api-service"
```

## Troubleshooting Generators

### Common Issues

1. **Generator not found**
   ```bash
   # Check if generator is available
   nx list @nx-weaver/plugin
   
   # Reinstall plugin if needed
   npm install @nx-weaver/plugin
   ```

2. **Project not found**
   ```bash
   # Check available projects
   nx list
   
   # Create project first if needed
   nx g @nx/js:library my-project
   ```

3. **Permission errors**
   ```bash
   # Fix permissions
   chmod -R 755 .nx-weaver-cache/
   ```

4. **Configuration conflicts**
   ```bash
   # Remove existing configuration
   rm weaver-workspace.json
   rm -rf .nx-weaver-cache/
   
   # Reinitialize
   nx g @nx-weaver/plugin:init
   ```

### Verification Commands

```bash
# Check generator availability
nx list @nx-weaver/plugin

# Check generated files
ls -la weaver-workspace.json
ls -la my-project/weaver.json
ls -la my-project/weaver/schema.yaml

# Validate generated configuration
nx weaver-validate my-project --verbose
```

## Next Steps

- [Executors](executors.md) - Learn about executors for operations
- [Configuration](configuration.md) - Advanced configuration options
- [Examples](../examples/) - Real-world setup examples 