# Generator Implementations

## Task Description
Implement the generator functionality for initializing Weaver configuration in workspaces and setting up Weaver for individual projects.

## Requirements

### Core Generator Infrastructure
Implement shared generator utilities in `src/utils/generator-utils.ts`:

#### 1. Configuration Generation
```typescript
generateWeaverConfig(
  options: WeaverConfigOptions,
  context: GeneratorContext
): Promise<void>
```
- Generate Weaver configuration files
- Handle different configuration formats
- Apply user preferences and defaults
- Validate generated configuration

#### 2. File Generation
```typescript
generateWeaverFiles(
  templatePath: string,
  targetPath: string,
  variables: Record<string, any>
): Promise<void>
```
- Generate files from templates
- Handle template variable substitution
- Create directories as needed
- Preserve existing files when appropriate

#### 3. Project Setup
```typescript
setupProjectStructure(
  projectPath: string,
  config: WeaverProjectConfig
): Promise<void>
```
- Create project directory structure
- Set up Weaver schema directories
- Configure output directories
- Handle existing project structure

### Init Generator
Implement `src/generators/init/generator.ts`:

#### Functionality
- Initialize Weaver configuration in workspace
- Set up workspace-level defaults
- Create initial project structure
- Configure Weaver for the entire workspace

#### Options
```typescript
interface InitGeneratorOptions {
  defaultVersion?: string;
  schemaDirectory?: string;
  outputDirectory?: string;
  enabledByDefault?: boolean;
  skipInstall?: boolean;
  verbose?: boolean;
}
```

#### Implementation
```typescript
export default async function initGenerator(
  tree: Tree,
  options: InitGeneratorOptions
): Promise<void> {
  const workspaceRoot = getWorkspaceRoot(tree);
  
  // Generate workspace configuration
  await generateWorkspaceConfig(tree, options);
  
  // Create initial project structure
  await setupWorkspaceStructure(tree, options);
  
  // Update nx.json with Weaver defaults
  await updateNxConfiguration(tree, options);
  
  // Install Weaver if requested
  if (!options.skipInstall) {
    await installWeaver(tree, options.defaultVersion);
  }
  
  // Generate documentation
  await generateSetupDocumentation(tree, options);
}
```

#### Generated Files
- `weaver-workspace.json` - Workspace configuration
- `weaver/` - Default schema directory
- `docs/weaver-setup.md` - Setup documentation
- Updated `nx.json` - Weaver defaults

### Setup Project Generator
Implement `src/generators/setup-project/generator.ts`:

#### Functionality
- Set up Weaver for a specific project
- Create project-specific configuration
- Generate initial schema files
- Configure project targets

#### Options
```typescript
interface SetupProjectGeneratorOptions {
  project: string;
  version?: string;
  schemaDirectory?: string;
  outputDirectory?: string;
  enabled?: boolean;
  skipTargets?: boolean;
  verbose?: boolean;
}
```

#### Implementation
```typescript
export default async function setupProjectGenerator(
  tree: Tree,
  options: SetupProjectGeneratorOptions
): Promise<void> {
  const projectPath = getProjectPath(tree, options.project);
  
  // Validate project exists
  if (!projectExists(tree, options.project)) {
    throw new Error(`Project '${options.project}' does not exist`);
  }
  
  // Generate project configuration
  await generateProjectConfig(tree, options);
  
  // Create project structure
  await setupProjectStructure(tree, options);
  
  // Generate initial schema files
  await generateInitialSchemas(tree, options);
  
  // Update project targets
  if (!options.skipTargets) {
    await updateProjectTargets(tree, options);
  }
  
  // Generate project documentation
  await generateProjectDocumentation(tree, options);
}
```

#### Generated Files
- `{project}/weaver.json` - Project configuration
- `{project}/weaver/` - Schema directory
- `{project}/weaver/schema.yaml` - Initial schema file
- Updated `{project}/project.json` - Weaver targets

### Generator Schemas
Create JSON schemas for each generator:

#### Init Generator Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "defaultVersion": {
      "type": "string",
      "description": "Default Weaver version for the workspace"
    },
    "schemaDirectory": {
      "type": "string",
      "default": "weaver/",
      "description": "Default schema directory for projects"
    },
    "outputDirectory": {
      "type": "string",
      "default": "dist/weaver/",
      "description": "Default output directory for generated files"
    },
    "enabledByDefault": {
      "type": "boolean",
      "default": true,
      "description": "Whether Weaver is enabled by default for new projects"
    },
    "skipInstall": {
      "type": "boolean",
      "default": false,
      "description": "Skip Weaver executable installation"
    },
    "verbose": {
      "type": "boolean",
      "default": false,
      "description": "Enable verbose output"
    }
  }
}
```

#### Setup Project Generator Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "project": {
      "type": "string",
      "description": "Name of the project to set up"
    },
    "version": {
      "type": "string",
      "description": "Weaver version for this project"
    },
    "schemaDirectory": {
      "type": "string",
      "description": "Schema directory for this project"
    },
    "outputDirectory": {
      "type": "string",
      "description": "Output directory for generated files"
    },
    "enabled": {
      "type": "boolean",
      "default": true,
      "description": "Whether Weaver is enabled for this project"
    },
    "skipTargets": {
      "type": "boolean",
      "default": false,
      "description": "Skip target generation"
    },
    "verbose": {
      "type": "boolean",
      "default": false,
      "description": "Enable verbose output"
    }
  },
  "required": ["project"]
}
```

### Template Generation
Create templates for generated files:

#### Workspace Configuration Template
```yaml
# weaver-workspace.json
{
  "defaultVersion": "{{defaultVersion}}",
  "schemaDirectory": "{{schemaDirectory}}",
  "outputDirectory": "{{outputDirectory}}",
  "enabledByDefault": {{enabledByDefault}},
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

#### Project Configuration Template
```yaml
# weaver.json
{
  "enabled": {{enabled}},
  "version": "{{version}}",
  "schemaDirectory": "{{schemaDirectory}}",
  "outputDirectory": "{{outputDirectory}}",
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

#### Initial Schema Template
```yaml
# schema.yaml
name: "{{projectName}}"
version: "1.0.0"
description: "OpenTelemetry schema for {{projectName}}"

metrics:
  - name: "example_metric"
    type: "counter"
    description: "Example metric for {{projectName}}"
    unit: "1"
    attributes:
      - name: "service"
        type: "string"
        description: "Service name"

traces:
  - name: "example_span"
    description: "Example span for {{projectName}}"
    attributes:
      - name: "operation"
        type: "string"
        description: "Operation name"
```

### Documentation Generation
Generate comprehensive documentation:

#### Setup Documentation
- Installation instructions
- Configuration guide
- Usage examples
- Troubleshooting guide
- Best practices

#### Project Documentation
- Project-specific setup
- Schema examples
- Generated code usage
- Integration guide

## Implementation Details

### Configuration Generation Strategy
1. Load existing configuration if present
2. Merge with user options and defaults
3. Validate configuration structure
4. Generate configuration files
5. Update existing files as needed

### File Generation Strategy
1. Use template engine for file generation
2. Handle variable substitution
3. Preserve existing files when appropriate
4. Create directories as needed
5. Validate generated files

### Project Setup Strategy
1. Validate project exists and is accessible
2. Create project-specific configuration
3. Set up directory structure
4. Generate initial schema files
5. Update project targets

## Success Criteria
- Generates proper Weaver configuration for workspaces and projects
- Creates appropriate directory structure
- Generates useful initial schema files
- Updates project targets correctly
- Provides comprehensive documentation
- Handles existing configurations gracefully
- Includes comprehensive unit tests
- Provides clear error messages and guidance 