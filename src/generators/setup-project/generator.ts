import type { Tree } from '@nx/devkit';
import type { SetupProjectGeneratorOptions } from '../../types';
import {
  projectExists,
  getProjectPath,
  generateProjectConfig,
  setupProjectStructure,
  generateProjectDocumentation,
} from '../../utils/generator-utils';

export default async function setupProjectGenerator(
  tree: Tree,
  options: SetupProjectGeneratorOptions
): Promise<void> {
  if (options.verbose) {
    console.log(`Setting up Weaver for project: ${options.project}`);
  }

  const projectPath = getProjectPath(tree, options.project);

  // Validate project exists
  if (!projectExists(tree, options.project)) {
    throw new Error(`Project '${options.project}' does not exist`);
  }

  // Generate project configuration
  await generateProjectConfig(tree, projectPath, {
    enabled: options.enabled,
    version: options.version,
    schemaDirectory: options.schemaDirectory,
    outputDirectory: options.outputDirectory,
  });

  // Create project structure
  await setupProjectStructure(tree, projectPath, {
    enabled: options.enabled,
    schemaDirectory: options.schemaDirectory,
    outputDirectory: options.outputDirectory,
  });

  // Generate initial schema files
  await generateInitialSchemas(tree, options);

  // Update project targets
  if (!options.skipTargets) {
    await updateProjectTargets(tree, options);
  }

  // Generate project documentation
  await generateProjectDocumentation(tree, projectPath, {
    version: options.version,
    schemaDirectory: options.schemaDirectory,
    outputDirectory: options.outputDirectory,
  });

  if (options.verbose) {
    console.log(`Weaver setup completed successfully for ${options.project}`);
  }
}

/**
 * Generate initial schema files
 */
async function generateInitialSchemas(
  tree: Tree,
  options: SetupProjectGeneratorOptions
): Promise<void> {
  const projectPath = getProjectPath(tree, options.project);
  const schemaDir = `${projectPath}/${options.schemaDirectory || 'weaver/'}`;
  const schemaFile = `${schemaDir}/schema.yaml`;

  if (!tree.exists(schemaFile)) {
    const initialSchema = generateInitialSchema(options.project);
    tree.write(schemaFile, initialSchema);
  }
}

/**
 * Generate initial schema content
 */
function generateInitialSchema(projectName: string): string {
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
 * Update project targets
 */
async function updateProjectTargets(
  tree: Tree,
  options: SetupProjectGeneratorOptions
): Promise<void> {
  const projectJsonPath = `${options.project}/project.json`;

  if (!tree.exists(projectJsonPath)) {
    return;
  }

  const projectJson = JSON.parse(tree.read(projectJsonPath, 'utf-8') || '{}');

  // Add Weaver targets
  if (!projectJson.targets) {
    projectJson.targets = {};
  }

  projectJson.targets.validate = {
    executor: '@nx-weaver/validate',
    options: {
      strict: true,
    },
  };

  projectJson.targets.generate = {
    executor: '@nx-weaver/generate',
    options: {
      outputFormat: 'typescript',
    },
  };

  projectJson.targets.docs = {
    executor: '@nx-weaver/docs',
    options: {
      format: 'markdown',
    },
  };

  projectJson.targets.clean = {
    executor: '@nx-weaver/clean',
    options: {},
  };

  tree.write(projectJsonPath, JSON.stringify(projectJson, null, 2));
}
