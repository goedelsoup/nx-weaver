import type { Tree } from '@nx/devkit';
import type {
  WeaverProjectConfig,
  WeaverWorkspaceConfig,
  WeaverConfigOptions,
  GeneratorContext,
} from '../types';

/**
 * Generate Weaver configuration files
 */
export async function generateWeaverConfig(
  options: WeaverConfigOptions,
  context: GeneratorContext
): Promise<void> {
  const { tree, workspaceRoot } = context;

  // Generate workspace configuration
  if (options.workspace) {
    await generateWorkspaceConfig(tree, workspaceRoot, options);
  }

  // Generate project configurations
  if (options.projects) {
    for (const project of options.projects) {
      await generateProjectConfig(tree, project, options);
    }
  }
}

/**
 * Generate workspace configuration
 */
export async function generateWorkspaceConfig(
  tree: Tree,
  workspaceRoot: string,
  options: WeaverConfigOptions
): Promise<void> {
  const configPath = `${workspaceRoot}/weaver-workspace.json`;

  // Check if configuration already exists
  if (tree.exists(configPath)) {
    // Don't overwrite existing configuration
    return;
  }

  const workspaceConfig: WeaverWorkspaceConfig = {
    defaultVersion: options.defaultVersion || 'latest',
    schemaDirectory: options.schemaDirectory || 'weaver/',
    outputDirectory: options.outputDirectory || 'dist/weaver/',
    enabledByDefault: options.enabledByDefault !== false,
    defaultArgs: {
      validate: ['--strict'],
      generate: ['--typescript'],
      docs: ['--markdown'],
    },
    defaultEnvironment: {
      WEAVER_LOG_LEVEL: 'info',
    },
    cacheDirectory: '.weaver-cache',
    downloadTimeout: 30000,
    maxRetries: 3,
    verifyHashes: true,
  };

  tree.write(configPath, JSON.stringify(workspaceConfig, null, 2));

  // Create default schema directory
  const schemaDir = `${workspaceRoot}/${workspaceConfig.schemaDirectory}`;
  if (!tree.exists(schemaDir)) {
    tree.write(`${schemaDir}/.gitkeep`, '');
  }

  // Create output directory
  const outputDir = `${workspaceRoot}/${workspaceConfig.outputDirectory}`;
  if (!tree.exists(outputDir)) {
    tree.write(`${outputDir}/.gitkeep`, '');
  }
}

/**
 * Generate project configuration
 */
export async function generateProjectConfig(
  tree: Tree,
  projectPath: string,
  options: WeaverConfigOptions
): Promise<void> {
  const configPath = `${projectPath}/weaver.json`;

  const projectConfig: WeaverProjectConfig = {
    enabled: options.enabled !== false,
    version: options.version || options.defaultVersion || 'latest',
    schemaDirectory: options.schemaDirectory || 'weaver/',
    outputDirectory: options.outputDirectory || 'dist/weaver/',
    args: {
      validate: ['--strict'],
      generate: ['--typescript'],
      docs: ['--markdown'],
    },
    environment: {
      WEAVER_LOG_LEVEL: 'info',
    },
  };

  tree.write(configPath, JSON.stringify(projectConfig, null, 2));
}

/**
 * Generate files from templates
 */
export async function generateWeaverFiles(
  templatePath: string,
  targetPath: string,
  variables: Record<string, any>
): Promise<void> {
  // This would typically use a template engine like handlebars or ejs
  // For now, we'll implement a simple variable substitution
  const template = await readTemplate(templatePath);
  const content = substituteVariables(template, variables);
  await writeFile(targetPath, content);
}

/**
 * Setup project structure
 */
export async function setupProjectStructure(
  tree: Tree,
  projectPath: string,
  config: WeaverProjectConfig
): Promise<void> {
  // Create schema directory
  const schemaDir = `${projectPath}/${config.schemaDirectory}`;
  if (!tree.exists(schemaDir)) {
    tree.write(`${schemaDir}/.gitkeep`, '');
  }

  // Create output directory
  const outputDir = `${projectPath}/${config.outputDirectory}`;
  if (!tree.exists(outputDir)) {
    tree.write(`${outputDir}/.gitkeep`, '');
  }

  // Create initial schema file
  const schemaFile = `${schemaDir}/schema.yaml`;
  if (!tree.exists(schemaFile)) {
    const initialSchema = generateInitialSchema(config);
    tree.write(schemaFile, initialSchema);
  }
}

/**
 * Generate initial schema content
 */
function generateInitialSchema(config: WeaverProjectConfig): string {
  const projectName = getProjectNameFromPath(config.schemaDirectory || '');

  return `name: "${projectName}"
version: "1.0.0"
description: "OpenTelemetry schema for ${projectName}"

metrics:
  - name: "example_metric"
    type: "counter"
    description: "Example metric for ${projectName}"
    unit: "1"
    attributes:
      - name: "service"
        type: "string"
        description: "Service name"

traces:
  - name: "example_span"
    description: "Example span for ${projectName}"
    attributes:
      - name: "operation"
        type: "string"
        description: "Operation name"
`;
}

/**
 * Update Nx configuration with Weaver defaults
 */
export async function updateNxConfiguration(
  tree: Tree,
  options: WeaverConfigOptions
): Promise<void> {
  const nxConfigPath = 'nx.json';

  if (!tree.exists(nxConfigPath)) {
    return;
  }

  const nxConfig = JSON.parse(tree.read(nxConfigPath, 'utf-8') || '{}');

  // Add Weaver defaults to nx.json
  if (!nxConfig.weaver) {
    nxConfig.weaver = {
      defaultVersion: options.defaultVersion || 'latest',
      schemaDirectory: options.schemaDirectory || 'weaver/',
      outputDirectory: options.outputDirectory || 'dist/weaver/',
      enabledByDefault: options.enabledByDefault !== false,
    };
  }

  tree.write(nxConfigPath, JSON.stringify(nxConfig, null, 2));
}

/**
 * Install Weaver if requested
 */
export async function installWeaver(tree: Tree, version?: string): Promise<void> {
  // This would typically use a package manager to install Weaver
  // For now, we'll just create a placeholder
  const installScript = `#!/bin/bash
# Install Weaver ${version || 'latest'}
echo "Installing Weaver ${version || 'latest'}..."
# Add actual installation logic here
`;

  tree.write('install-weaver.sh', installScript);
  tree.write('install-weaver.sh', installScript);
}

/**
 * Generate setup documentation
 */
export async function generateSetupDocumentation(
  tree: Tree,
  options: WeaverConfigOptions
): Promise<void> {
  const docsPath = 'docs/weaver-setup.md';

  const documentation = `# Weaver Setup Guide

This workspace has been configured with OpenTelemetry Weaver for telemetry generation.

## Installation

Weaver has been installed with the following configuration:
- Version: ${options.defaultVersion || 'latest'}
- Schema Directory: ${options.schemaDirectory || 'weaver/'}
- Output Directory: ${options.outputDirectory || 'dist/weaver/'}
- Enabled by Default: ${options.enabledByDefault !== false}

## Usage

### Workspace Commands

1. **Validate all schemas:**
   \`\`\`bash
   nx run-many --target=validate --all
   \`\`\`

2. **Generate code for all projects:**
   \`\`\`bash
   nx run-many --target=generate --all
   \`\`\`

3. **Generate documentation:**
   \`\`\`bash
   nx run-many --target=docs --all
   \`\`\`

### Project Commands

For individual projects, use:
\`\`\`bash
nx run <project-name>:validate
nx run <project-name>:generate
nx run <project-name>:docs
nx run <project-name>:clean
\`\`\`

## Configuration

- Workspace configuration: \`weaver-workspace.json\`
- Project configurations: \`{project}/weaver.json\`
- Schema files: \`{project}/weaver/schema.yaml\`

## Best Practices

1. Keep schemas in version control
2. Use descriptive metric and trace names
3. Include proper documentation in schemas
4. Validate schemas before generating code
5. Review generated code before committing

## Troubleshooting

If you encounter issues:

1. Check the Weaver version compatibility
2. Validate your schema files
3. Check the output directory permissions
4. Review the Weaver logs

For more information, see the [Weaver documentation](https://github.com/open-telemetry/weaver).
`;

  // Ensure docs directory exists
  const docsDir = 'docs';
  if (!tree.exists(docsDir)) {
    tree.write(`${docsDir}/.gitkeep`, '');
  }

  tree.write(docsPath, documentation);
}

/**
 * Generate project documentation
 */
export async function generateProjectDocumentation(
  tree: Tree,
  projectPath: string,
  options: WeaverConfigOptions
): Promise<void> {
  const projectName = getProjectNameFromPath(projectPath);
  const docsPath = `${projectPath}/README-weaver.md`;

  const documentation = `# Weaver Configuration for ${projectName}

This project is configured with OpenTelemetry Weaver for telemetry generation.

## Configuration

- Configuration file: \`weaver.json\`
- Schema directory: \`${options.schemaDirectory || 'weaver/'}\`
- Output directory: \`${options.outputDirectory || 'dist/weaver/'}\`
- Weaver version: ${options.version || options.defaultVersion || 'latest'}

## Usage

1. **Validate Configuration:**
   \`\`\`bash
   nx run ${projectName}:validate
   \`\`\`

2. **Generate Code:**
   \`\`\`bash
   nx run ${projectName}:generate
   \`\`\`

3. **Generate Documentation:**
   \`\`\`bash
   nx run ${projectName}:docs
   \`\`\`

4. **Clean Generated Files:**
   \`\`\`bash
   nx run ${projectName}:clean
   \`\`\`

## Schema Files

Schema files are located in the \`${options.schemaDirectory || 'weaver/'}\` directory. 
The main schema file is \`schema.yaml\`.

## Generated Files

Generated files are placed in the \`${options.outputDirectory || 'dist/weaver/'}\` directory 
and are automatically ignored by Git.

## Integration

To use the generated telemetry code in your application:

1. Import the generated types and functions
2. Initialize the telemetry system
3. Use the generated metrics and traces in your code

Example:
\`\`\`typescript
import { createMeter, createTracer } from './dist/weaver/generated';

const meter = createMeter();
const tracer = createTracer();

// Use the generated telemetry
\`\`\`
`;

  tree.write(docsPath, documentation);
}

/**
 * Validate project exists
 */
export function projectExists(tree: Tree, projectName: string): boolean {
  // Check if project.json exists for the project
  const projectJsonPath = `${projectName}/project.json`;
  return tree.exists(projectJsonPath);
}

/**
 * Get project path
 */
export function getProjectPath(tree: Tree, projectName: string): string {
  return projectName;
}

/**
 * Get project name from path
 */
function getProjectNameFromPath(path: string): string {
  // Extract project name from path like 'test-project' or 'test-project/'
  const parts = path.split('/').filter((part) => part.length > 0);
  return parts[parts.length - 1] || 'unknown';
}

/**
 * Read template file
 */
async function readTemplate(templatePath: string): Promise<string> {
  // This would read the template file
  // For now, return a placeholder
  return '';
}

/**
 * Substitute variables in template
 */
function substituteVariables(template: string, variables: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match;
  });
}

/**
 * Write file
 */
async function writeFile(path: string, content: string): Promise<void> {
  // This would write the file
  // For now, it's a placeholder
}
