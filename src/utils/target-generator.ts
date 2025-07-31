import { join } from 'node:path';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { TargetConfiguration } from '@nx/devkit';
import type { WeaverProjectConfig, WeaverWorkspaceConfig } from '../types/index.js';
import { resolveWorkspacePath, fileExists, readFile, writeFile } from './index.js';

/**
 * Weaver target names
 */
export const WEAVER_TARGETS = {
  VALIDATE: 'weaver-validate',
  GENERATE: 'weaver-generate',
  DOCS: 'weaver-docs',
  CLEAN: 'weaver-clean',
} as const;

/**
 * Weaver target configuration templates
 */
export const WEAVER_TARGET_TEMPLATES = {
  [WEAVER_TARGETS.VALIDATE]: {
    executor: '@nx-weaver/validate',
    options: {},
    dependsOn: ['^weaver-validate'] as string[],
    inputs: [
      'default',
      '{projectRoot}/weaver/**/*',
      '{projectRoot}/weaver.json',
      '{projectRoot}/project.json',
    ] as string[],
    outputs: [] as string[],
  },
  [WEAVER_TARGETS.GENERATE]: {
    executor: '@nx-weaver/generate',
    options: {},
    dependsOn: ['^weaver-generate', 'weaver-validate'] as string[],
    inputs: [
      'default',
      '{projectRoot}/weaver/**/*',
      '{projectRoot}/weaver.json',
      '{projectRoot}/project.json',
    ] as string[],
    outputs: ['{projectRoot}/dist/weaver/**/*'] as string[],
  },
  [WEAVER_TARGETS.DOCS]: {
    executor: '@nx-weaver/docs',
    options: {},
    dependsOn: ['weaver-validate'] as string[],
    inputs: [
      'default',
      '{projectRoot}/weaver/**/*',
      '{projectRoot}/weaver.json',
      '{projectRoot}/project.json',
    ] as string[],
    outputs: ['{projectRoot}/dist/weaver-docs/**/*'] as string[],
  },
  [WEAVER_TARGETS.CLEAN]: {
    executor: '@nx-weaver/clean',
    options: {},
    dependsOn: [] as string[],
    inputs: ['default'] as string[],
    outputs: [] as string[],
  },
} as const;

/**
 * Build target types that should integrate with Weaver
 */
export const BUILD_TARGET_TYPES = [
  '@nx/js:tsc',
  '@nx/webpack:webpack',
  '@nx/vite:build',
  '@nx/esbuild:esbuild',
  '@nx/rollup:rollup',
  '@nx/bundler:esbuild',
  '@nx/bundler:rollup',
  '@nx/bundler:webpack',
  '@nx/bundler:vite',
] as const;

/**
 * Generates Weaver targets for a project
 */
export function generateWeaverTargets(
  project: string,
  config: WeaverProjectConfig
): Record<string, TargetConfiguration> {
  const targets: Record<string, TargetConfiguration> = {};

  // Generate validate target
  if (!config.skipValidation) {
    targets[WEAVER_TARGETS.VALIDATE] = {
      ...WEAVER_TARGET_TEMPLATES[WEAVER_TARGETS.VALIDATE],
      options: {
        project,
        ...WEAVER_TARGET_TEMPLATES[WEAVER_TARGETS.VALIDATE].options,
      },
    };
  }

  // Generate generate target
  if (!config.skipGeneration) {
    targets[WEAVER_TARGETS.GENERATE] = {
      ...WEAVER_TARGET_TEMPLATES[WEAVER_TARGETS.GENERATE],
      options: {
        project,
        ...WEAVER_TARGET_TEMPLATES[WEAVER_TARGETS.GENERATE].options,
      },
    };
  }

  // Generate docs target
  if (!config.skipDocs) {
    targets[WEAVER_TARGETS.DOCS] = {
      ...WEAVER_TARGET_TEMPLATES[WEAVER_TARGETS.DOCS],
      options: {
        project,
        ...WEAVER_TARGET_TEMPLATES[WEAVER_TARGETS.DOCS].options,
      },
    };
  }

  // Always generate clean target
  targets[WEAVER_TARGETS.CLEAN] = {
    ...WEAVER_TARGET_TEMPLATES[WEAVER_TARGETS.CLEAN],
    options: {
      project,
      ...WEAVER_TARGET_TEMPLATES[WEAVER_TARGETS.CLEAN].options,
    },
  };

  return targets;
}

/**
 * Integrates Weaver generation with build targets
 */
export function integrateWithBuildTarget(
  _project: string,
  buildTarget: TargetConfiguration,
  config: WeaverProjectConfig
): TargetConfiguration {
  // Skip if generation is disabled
  if (config.skipGeneration) {
    return buildTarget;
  }

  // Check if this is a build target that should integrate with Weaver
  const executor = buildTarget.executor || '';
  const shouldIntegrate = BUILD_TARGET_TYPES.some((type) => executor.includes(type));

  if (!shouldIntegrate) {
    return buildTarget;
  }

  // Create a copy of the build target
  const integratedTarget: TargetConfiguration = {
    ...buildTarget,
    dependsOn: [...(buildTarget.dependsOn || []), WEAVER_TARGETS.GENERATE],
  };

  return integratedTarget;
}

/**
 * Detects existing targets in a project
 */
export function detectExistingTargets(project: string): Record<string, TargetConfiguration> {
  const projectJsonPath = resolveWorkspacePath(`apps/${project}/project.json`);
  const libProjectJsonPath = resolveWorkspacePath(`libs/${project}/project.json`);

  let projectJsonPathToUse: string | null = null;

  if (fileExists(projectJsonPath)) {
    projectJsonPathToUse = projectJsonPath;
  } else if (fileExists(libProjectJsonPath)) {
    projectJsonPathToUse = libProjectJsonPath;
  }

  if (!projectJsonPathToUse) {
    return {};
  }

  try {
    const projectJson = JSON.parse(readFile(projectJsonPathToUse));
    return projectJson.targets || {};
  } catch (error) {
    console.warn(`Failed to read project.json for ${project}:`, error);
    return {};
  }
}

/**
 * Updates target configuration for a project
 */
export async function updateTargetConfiguration(
  project: string,
  targetName: string,
  updates: Partial<TargetConfiguration>
): Promise<void> {
  const projectJsonPath = resolveWorkspacePath(`apps/${project}/project.json`);
  const libProjectJsonPath = resolveWorkspacePath(`libs/${project}/project.json`);

  let projectJsonPathToUse: string | null = null;

  if (fileExists(projectJsonPath)) {
    projectJsonPathToUse = projectJsonPath;
  } else if (fileExists(libProjectJsonPath)) {
    projectJsonPathToUse = libProjectJsonPath;
  }

  if (!projectJsonPathToUse) {
    throw new Error(`Project ${project} not found`);
  }

  try {
    const projectJson = JSON.parse(readFile(projectJsonPathToUse));

    if (!projectJson.targets) {
      projectJson.targets = {};
    }

    projectJson.targets[targetName] = {
      ...projectJson.targets[targetName],
      ...updates,
    };

    writeFile(projectJsonPathToUse, JSON.stringify(projectJson, null, 2));
  } catch (error) {
    throw new Error(`Failed to update target configuration for ${project}: ${error}`);
  }
}

/**
 * Updates project targets with Weaver configuration
 */
export async function updateProjectTargets(
  project: string,
  config: WeaverProjectConfig
): Promise<void> {
  const existingTargets = detectExistingTargets(project);
  const weaverTargets = generateWeaverTargets(project, config);

  // Add or update Weaver targets
  for (const [targetName, targetConfig] of Object.entries(weaverTargets)) {
    await updateTargetConfiguration(project, targetName, targetConfig);
  }

  // Integrate with existing build targets
  for (const [targetName, targetConfig] of Object.entries(existingTargets)) {
    const integratedTarget = integrateWithBuildTarget(project, targetConfig, config);

    if (integratedTarget !== targetConfig) {
      await updateTargetConfiguration(project, targetName, integratedTarget);
    }
  }
}

/**
 * Generates target dependencies for cross-project relationships
 */
export function generateTargetDependencies(
  project: string,
  projects: string[],
  config: WeaverProjectConfig
): Record<string, string[]> {
  const dependencies: Record<string, string[]> = {};

  // Generate dependencies for Weaver targets
  if (!config.skipValidation) {
    dependencies[WEAVER_TARGETS.VALIDATE] = projects
      .filter((p) => p !== project)
      .map((p) => `${p}:weaver-validate`);
  }

  if (!config.skipGeneration) {
    dependencies[WEAVER_TARGETS.GENERATE] = [
      ...projects.filter((p) => p !== project).map((p) => `${p}:weaver-generate`),
      ...(config.skipValidation ? [] : [`${project}:weaver-validate`]),
    ];
  }

  if (!config.skipDocs) {
    dependencies[WEAVER_TARGETS.DOCS] = config.skipValidation ? [] : [`${project}:weaver-validate`];
  }

  return dependencies;
}

/**
 * Removes Weaver targets from a project
 */
export async function removeWeaverTargets(project: string): Promise<void> {
  const projectJsonPath = resolveWorkspacePath(`apps/${project}/project.json`);
  const libProjectJsonPath = resolveWorkspacePath(`libs/${project}/project.json`);

  let projectJsonPathToUse: string | null = null;

  if (fileExists(projectJsonPath)) {
    projectJsonPathToUse = projectJsonPath;
  } else if (fileExists(libProjectJsonPath)) {
    projectJsonPathToUse = libProjectJsonPath;
  }

  if (!projectJsonPathToUse) {
    throw new Error(`Project ${project} not found`);
  }

  try {
    const projectJson = JSON.parse(readFile(projectJsonPathToUse));

    if (!projectJson.targets) {
      return;
    }

    // Remove Weaver targets
    for (const targetName of Object.values(WEAVER_TARGETS)) {
      delete projectJson.targets[targetName];
    }

    // Remove Weaver dependencies from build targets
    for (const [, targetConfig] of Object.entries(projectJson.targets)) {
      const typedTargetConfig = targetConfig as any;
      if (typedTargetConfig.dependsOn && Array.isArray(typedTargetConfig.dependsOn)) {
        typedTargetConfig.dependsOn = typedTargetConfig.dependsOn.filter(
          (dep: string) => !Object.values(WEAVER_TARGETS).includes(dep as any)
        );
      }
    }

    writeFile(projectJsonPathToUse, JSON.stringify(projectJson, null, 2));
  } catch (error) {
    throw new Error(`Failed to remove Weaver targets from ${project}: ${error}`);
  }
}

/**
 * Updates project configuration with Weaver settings
 */
export async function updateProjectConfiguration(
  project: string,
  config: WeaverProjectConfig
): Promise<void> {
  const projectJsonPath = resolveWorkspacePath(`apps/${project}/project.json`);
  const libProjectJsonPath = resolveWorkspacePath(`libs/${project}/project.json`);

  let projectJsonPathToUse: string | null = null;

  if (fileExists(projectJsonPath)) {
    projectJsonPathToUse = projectJsonPath;
  } else if (fileExists(libProjectJsonPath)) {
    projectJsonPathToUse = libProjectJsonPath;
  }

  if (!projectJsonPathToUse) {
    throw new Error(`Project ${project} not found`);
  }

  try {
    const projectJson = JSON.parse(readFile(projectJsonPathToUse));

    // Add Weaver configuration
    if (!projectJson.weaver) {
      projectJson.weaver = {};
    }

    projectJson.weaver = {
      ...projectJson.weaver,
      ...config,
    };

    writeFile(projectJsonPathToUse, JSON.stringify(projectJson, null, 2));
  } catch (error) {
    throw new Error(`Failed to update project configuration for ${project}: ${error}`);
  }
}

/**
 * Updates workspace configuration with Weaver defaults
 */
export async function updateWorkspaceConfiguration(
  workspaceConfig: WeaverWorkspaceConfig
): Promise<void> {
  const nxJsonPath = resolveWorkspacePath('nx.json');

  if (!fileExists(nxJsonPath)) {
    throw new Error('nx.json not found');
  }

  try {
    const nxJson = JSON.parse(readFile(nxJsonPath));

    // Add Weaver configuration
    if (!nxJson.weaver) {
      nxJson.weaver = {};
    }

    nxJson.weaver = {
      ...nxJson.weaver,
      ...workspaceConfig,
    };

    writeFile(nxJsonPath, JSON.stringify(nxJson, null, 2));
  } catch (error) {
    throw new Error(`Failed to update workspace configuration: ${error}`);
  }
}

/**
 * Validates target configuration
 */
export function validateTargetConfiguration(
  targetName: string,
  targetConfig: TargetConfiguration
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!targetConfig.executor) {
    errors.push(`Target ${targetName} is missing executor`);
  }

  // Check Weaver target specific validation
  const weaverTargetValues = Object.values(WEAVER_TARGETS);
  if (weaverTargetValues.includes(targetName as any)) {
    if (!targetConfig.options?.project) {
      errors.push(`Weaver target ${targetName} is missing project option`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Gets all Weaver targets for a project
 */
export function getWeaverTargets(project: string): string[] {
  const targets = detectExistingTargets(project);
  return Object.keys(targets).filter((targetName) =>
    Object.values(WEAVER_TARGETS).includes(targetName as any)
  );
}

/**
 * Checks if a project has Weaver targets
 */
export function hasWeaverTargets(project: string): boolean {
  return getWeaverTargets(project).length > 0;
}

/**
 * Gets build targets that should integrate with Weaver
 */
export function getBuildTargets(project: string): string[] {
  const targets = detectExistingTargets(project);
  return Object.entries(targets)
    .filter(([, targetConfig]) => {
      const executor = (targetConfig as TargetConfiguration).executor || '';
      return BUILD_TARGET_TYPES.some((type) => executor.includes(type));
    })
    .map(([targetName]) => targetName);
}
