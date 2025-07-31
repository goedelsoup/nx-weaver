# Weaver Generators

This directory contains the Nx generators for setting up OpenTelemetry Weaver in your workspace and projects.

## Generators

### Init Generator

The `init` generator initializes Weaver configuration in your workspace.

#### Usage

```bash
nx generate @nx-weaver/plugin:init
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `defaultVersion` | `string` | `'latest'` | Default Weaver version for the workspace |
| `schemaDirectory` | `string` | `'weaver/'` | Default schema directory for projects |
| `outputDirectory` | `string` | `'dist/weaver/'` | Default output directory for generated files |
| `enabledByDefault` | `boolean` | `true` | Whether Weaver is enabled by default for new projects |
| `skipInstall` | `boolean` | `false` | Skip Weaver executable installation |
| `verbose` | `boolean` | `false` | Enable verbose output |

#### Generated Files

- `weaver-workspace.json` - Workspace configuration
- `weaver/` - Default schema directory
- `dist/weaver/` - Default output directory
- `.weaver-cache/` - Cache directory
- `docs/weaver-setup.md` - Setup documentation
- Updated `nx.json` - Weaver defaults
- Updated `.gitignore` - Weaver file exclusions

#### Example

```bash
nx generate @nx-weaver/plugin:init \
  --defaultVersion=1.0.0 \
  --schemaDirectory=schemas/ \
  --outputDirectory=generated/ \
  --enabledByDefault=true \
  --verbose
```

### Setup Project Generator

The `setup-project` generator sets up Weaver for a specific project.

#### Usage

```bash
nx generate @nx-weaver/plugin:setup-project <project-name>
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `project` | `string` | - | Name of the project to set up (required) |
| `version` | `string` | - | Weaver version for this project |
| `schemaDirectory` | `string` | - | Schema directory for this project |
| `outputDirectory` | `string` | - | Output directory for generated files |
| `enabled` | `boolean` | `true` | Whether Weaver is enabled for this project |
| `skipTargets` | `boolean` | `false` | Skip target generation |
| `verbose` | `boolean` | `false` | Enable verbose output |

#### Generated Files

- `{project}/weaver.json` - Project configuration
- `{project}/weaver/` - Schema directory
- `{project}/weaver/schema.yaml` - Initial schema file
- `{project}/dist/weaver/` - Output directory
- `{project}/README-weaver.md` - Project documentation
- Updated `{project}/project.json` - Weaver targets

#### Example

```bash
nx generate @nx-weaver/plugin:setup-project my-app \
  --version=1.0.0 \
  --schemaDirectory=schemas/ \
  --outputDirectory=generated/ \
  --enabled=true \
  --verbose
```

## Configuration Files

### Workspace Configuration (`weaver-workspace.json`)

```json
{
  "defaultVersion": "latest",
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
  "cacheDirectory": ".weaver-cache",
  "downloadTimeout": 30000,
  "maxRetries": 3,
  "verifyHashes": true
}
```

### Project Configuration (`{project}/weaver.json`)

```json
{
  "enabled": true,
  "version": "latest",
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

### Initial Schema (`{project}/weaver/schema.yaml`)

```yaml
name: "project-name"
version: "1.0.0"
description: "OpenTelemetry schema for project-name"

metrics:
  - name: "example_metric"
    type: "counter"
    description: "Example metric for project-name"
    unit: "1"
    attributes:
      - name: "service"
        type: "string"
        description: "Service name"

traces:
  - name: "example_span"
    description: "Example span for project-name"
    attributes:
      - name: "operation"
        type: "string"
        description: "Operation name"
```

## Generated Targets

The setup-project generator adds the following targets to your project's `project.json`:

### Validate Target

```json
{
  "validate": {
    "executor": "@nx-weaver/validate",
    "options": {
      "strict": true
    }
  }
}
```

### Generate Target

```json
{
  "generate": {
    "executor": "@nx-weaver/generate",
    "options": {
      "outputFormat": "typescript"
    }
  }
}
```

### Docs Target

```json
{
  "docs": {
    "executor": "@nx-weaver/docs",
    "options": {
      "format": "markdown"
    }
  }
}
```

### Clean Target

```json
{
  "clean": {
    "executor": "@nx-weaver/clean",
    "options": {}
  }
}
```

## Usage Examples

### Complete Workspace Setup

1. Initialize Weaver in your workspace:

```bash
nx generate @nx-weaver/plugin:init \
  --defaultVersion=1.0.0 \
  --schemaDirectory=schemas/ \
  --outputDirectory=generated/ \
  --enabledByDefault=true
```

2. Set up Weaver for specific projects:

```bash
nx generate @nx-weaver/plugin:setup-project api \
  --version=1.0.0 \
  --schemaDirectory=schemas/ \
  --outputDirectory=generated/

nx generate @nx-weaver/plugin:setup-project web \
  --version=1.0.0 \
  --schemaDirectory=schemas/ \
  --outputDirectory=generated/
```

3. Use the generated targets:

```bash
# Validate all schemas
nx run-many --target=validate --all

# Generate code for all projects
nx run-many --target=generate --all

# Generate documentation
nx run-many --target=docs --all

# Clean generated files
nx run-many --target=clean --all
```

### Project-Specific Usage

```bash
# Validate project schema
nx run api:validate

# Generate TypeScript code
nx run api:generate

# Generate documentation
nx run api:docs

# Clean generated files
nx run api:clean
```

## Best Practices

1. **Initialize workspace first**: Always run the init generator before setting up individual projects
2. **Use consistent versions**: Use the same Weaver version across all projects when possible
3. **Organize schemas**: Keep schema files organized in a dedicated directory
4. **Version control**: Commit schema files to version control, but ignore generated files
5. **Documentation**: Review and update generated documentation for your specific use cases
6. **Validation**: Always validate schemas before generating code
7. **Testing**: Test generated code integration in your applications

## Troubleshooting

### Common Issues

1. **Project not found**: Ensure the project exists and has a valid `project.json` file
2. **Permission errors**: Check file permissions for output directories
3. **Version conflicts**: Ensure Weaver version compatibility across projects
4. **Schema validation errors**: Review schema files for syntax and semantic errors

### Debug Mode

Enable verbose output to see detailed information:

```bash
nx generate @nx-weaver/plugin:init --verbose
nx generate @nx-weaver/plugin:setup-project my-app --verbose
```

## Architecture

The generators use a shared utility module (`src/utils/generator-utils.ts`) that provides:

- Configuration generation functions
- File generation utilities
- Project structure setup
- Documentation generation
- Template processing

This modular approach ensures consistency across generators and makes the code maintainable and testable. 