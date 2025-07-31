# Nx Weaver Plugin

An Nx plugin for integrating OpenTelemetry Weaver into your Nx workspace. This plugin provides executors and generators to validate, generate, and manage Weaver configurations and generated code.

## Features

- **Validate Executor**: Validate Weaver configuration files and schemas
- **Generate Executor**: Generate code from Weaver configurations
- **Docs Executor**: Generate documentation from Weaver configurations
- **Clean Executor**: Clean generated Weaver assets
- **Init Generator**: Initialize Weaver configuration in your workspace
- **Setup Project Generator**: Set up Weaver for specific projects

## Documentation

For comprehensive documentation, see the [Documentation Guide](docs/README.md).

- [Getting Started](docs/getting-started/) - Installation and basic setup
- [User Guide](docs/user-guide/) - Detailed usage instructions
- [API Reference](docs/api/) - TypeScript types and utilities
- [Examples](docs/examples/) - Real-world usage examples

## Installation

```bash
pnpm add @nx-weaver/plugin
```

## Usage

### Initializing Weaver in Your Workspace

```bash
nx generate @nx-weaver/plugin:init
```

This will create a default `weaver.yaml` configuration file in your workspace root.

### Setting Up Weaver for a Specific Project

```bash
nx generate @nx-weaver/plugin:setup-project my-project
```

This will create a project-specific Weaver configuration and documentation.

### Running Executors

#### Validate Configuration

```bash
nx run my-project:validate
```

Options:
- `--config`: Path to the Weaver configuration file (default: `weaver.yaml`)
- `--schema`: Path to the schema file to validate against
- `--verbose`: Enable verbose output
- `--dryRun`: Perform a dry run without making changes

#### Generate Code

```bash
nx run my-project:generate
```

Options:
- `--config`: Path to the Weaver configuration file (default: `weaver.yaml`)
- `--output`: Output directory for generated files
- `--template`: Template to use for code generation
- `--verbose`: Enable verbose output
- `--dryRun`: Perform a dry run without making changes

#### Generate Documentation

```bash
nx run my-project:docs
```

Options:
- `--config`: Path to the Weaver configuration file (default: `weaver.yaml`)
- `--output`: Output directory for documentation files
- `--format`: Output format (`markdown`, `html`, or `json`)
- `--verbose`: Enable verbose output
- `--dryRun`: Perform a dry run without making changes

#### Clean Generated Files

```bash
nx run my-project:clean
```

Options:
- `--patterns`: File patterns to clean
- `--output`: Output directory to clean
- `--verbose`: Enable verbose output
- `--dryRun`: Perform a dry run without making changes

## Configuration

### Weaver Configuration File (`weaver.yaml`)

```yaml
version: "1.0"
name: "my-weaver-workspace"

# Component definitions
components:
  my-service:
    name: "my-service"
    type: "service"
    language: "typescript"
    path: "./src"

# Pipeline definitions
pipelines:
  my-pipeline:
    name: "my-pipeline"
    components: ["my-service"]

# Output configuration
output:
  directory: "./generated"
  format: "typescript"
```

### Project Configuration

Add Weaver targets to your `project.json`:

```json
{
  "targets": {
    "validate": {
      "executor": "@nx-weaver/plugin:validate",
      "options": {
        "config": "weaver.yaml"
      }
    },
    "generate": {
      "executor": "@nx-weaver/plugin:generate",
      "options": {
        "config": "weaver.yaml",
        "output": "generated"
      }
    },
    "docs": {
      "executor": "@nx-weaver/plugin:docs",
      "options": {
        "config": "weaver.yaml",
        "output": "docs",
        "format": "markdown"
      }
    },
    "clean": {
      "executor": "@nx-weaver/plugin:clean",
      "options": {
        "patterns": ["generated/**/*"]
      }
    }
  }
}
```

## Development

### Building the Plugin

```bash
pnpm run build
# or
nx build nx-weaver
```

### Running Tests

```bash
pnpm test
# or
nx test nx-weaver
```

**Note**: This project uses Vitest for testing, which provides faster test execution and better TypeScript support compared to Jest.

### Linting and Formatting

```bash
pnpm run lint        # Run Biome linter
pnpm run format      # Format code with Biome
pnpm run check       # Run both linting and formatting checks
# or
nx lint nx-weaver    # Run linter
nx format nx-weaver  # Run formatter
nx check nx-weaver   # Run both
```

**Note**: This project uses Biome for linting and formatting, which provides faster execution and better TypeScript support compared to ESLint + Prettier.

## Architecture

The plugin follows the standard Nx plugin structure:

```
src/
├── executors/          # Executor implementations
│   ├── validate/       # Configuration validation
│   ├── generate/       # Code generation
│   ├── docs/          # Documentation generation
│   └── clean/         # Asset cleanup
├── generators/         # Generator implementations
│   ├── init/          # Workspace initialization
│   └── setup-project/ # Project setup
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── index.ts           # Main exports
```

## Testing

This project uses **Vitest** for testing, which provides:
- ⚡ **Faster execution** compared to Jest
- 🔧 **Better TypeScript support** with native ESM
- 🎯 **Jest-compatible API** for easy migration
- 📊 **Built-in coverage reporting**
- 🔍 **Watch mode with smart file tracking**

## Code Quality

This project uses **Biome** for linting and formatting, which provides:
- ⚡ **Lightning-fast performance** written in Rust
- 🔧 **Unified tool** replacing ESLint + Prettier
- 🎯 **Zero configuration** with sensible defaults
- 📊 **Built-in formatter** with consistent output
- 🔍 **TypeScript-first** with excellent type checking

## Available Commands

### pnpm Commands
```bash
pnpm install          # Install dependencies
pnpm run build        # Build the plugin
pnpm test            # Run tests
pnpm run lint        # Run Biome linter
pnpm run format      # Format code with Biome
pnpm run check       # Run both linting and formatting
pnpm run clean       # Clean pnpm store
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT
