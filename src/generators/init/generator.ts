import type { Tree } from '@nx/devkit';
import { workspaceRoot } from '@nx/devkit';
import type { InitGeneratorOptions } from '../../types';
import {
  generateWorkspaceConfig,
  updateNxConfiguration,
  installWeaver,
  generateSetupDocumentation,
  generateWeaverConfig,
} from '../../utils/generator-utils';

export default async function initGenerator(
  tree: Tree,
  options: InitGeneratorOptions
): Promise<void> {
  if (options.verbose) {
    console.log('Initializing Weaver configuration...');
  }

  const workspaceRoot = '.';

  // Generate workspace configuration
  await generateWorkspaceConfig(tree, workspaceRoot, {
    defaultVersion: options.defaultVersion,
    schemaDirectory: options.schemaDirectory,
    outputDirectory: options.outputDirectory,
    enabledByDefault: options.enabledByDefault,
    workspace: true,
  });

  // Create initial project structure
  await setupWorkspaceStructure(tree, options);

  // Update nx.json with Weaver defaults
  await updateNxConfiguration(tree, {
    defaultVersion: options.defaultVersion,
    schemaDirectory: options.schemaDirectory,
    outputDirectory: options.outputDirectory,
    enabledByDefault: options.enabledByDefault,
  });

  // Install Weaver if requested
  if (!options.skipInstall) {
    await installWeaver(tree, options.defaultVersion);
  }

  // Generate documentation
  await generateSetupDocumentation(tree, {
    defaultVersion: options.defaultVersion,
    schemaDirectory: options.schemaDirectory,
    outputDirectory: options.outputDirectory,
    enabledByDefault: options.enabledByDefault,
  });

  // Update .gitignore
  updateGitignore(tree);

  if (options.verbose) {
    console.log('Weaver initialization completed successfully');
  }
}

/**
 * Setup workspace structure
 */
async function setupWorkspaceStructure(tree: Tree, options: InitGeneratorOptions): Promise<void> {
  const workspaceRoot = '.';

  // Create default schema directory
  const schemaDir = `${workspaceRoot}/${options.schemaDirectory || 'weaver/'}`;
  if (!tree.exists(schemaDir)) {
    tree.write(`${schemaDir}/.gitkeep`, '');
  }

  // Create output directory
  const outputDir = `${workspaceRoot}/${options.outputDirectory || 'dist/weaver/'}`;
  if (!tree.exists(outputDir)) {
    tree.write(`${outputDir}/.gitkeep`, '');
  }

  // Create cache directory
  const cacheDir = `${workspaceRoot}/.weaver-cache`;
  if (!tree.exists(cacheDir)) {
    tree.write(`${cacheDir}/.gitkeep`, '');
  }
}

/**
 * Update .gitignore for Weaver files
 */
function updateGitignore(tree: Tree): void {
  const gitignorePath = '.gitignore';
  const gitignoreContent = tree.exists(gitignorePath)
    ? tree.read(gitignorePath, 'utf-8') || ''
    : '';

  const weaverEntries = [
    '# Weaver generated files',
    'dist/weaver/',
    '.weaver-cache/',
    'weaver-generated/',
  ];

  let updatedContent = gitignoreContent;
  for (const entry of weaverEntries) {
    if (!gitignoreContent.includes(entry)) {
      updatedContent += `\n${entry}`;
    }
  }

  if (updatedContent !== gitignoreContent) {
    tree.write(gitignorePath, updatedContent);
  }
}
