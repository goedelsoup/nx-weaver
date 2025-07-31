/**
 * Example usage of the Target Generator utility
 *
 * This file demonstrates how to use the target generator to:
 * 1. Generate Weaver targets for projects
 * 2. Integrate with existing build targets
 * 3. Manage target dependencies
 * 4. Update project configurations
 */

import {
  generateWeaverTargets,
  integrateWithBuildTarget,
  updateProjectTargets,
  generateTargetDependencies,
  removeWeaverTargets,
  updateProjectConfiguration,
  updateWorkspaceConfiguration,
  getWeaverTargets,
  hasWeaverTargets,
  getBuildTargets,
  WEAVER_TARGETS,
  BUILD_TARGET_TYPES,
} from './target-generator.js';
import type { WeaverProjectConfig, WeaverWorkspaceConfig } from '../types/index.js';
import type { TargetConfiguration } from '@nx/devkit';

/**
 * Example 1: Basic Weaver target generation
 */
export async function exampleBasicTargetGeneration() {
  console.log('=== Example 1: Basic Weaver Target Generation ===');

  const projectName = 'my-api';
  const config: WeaverProjectConfig = {
    enabled: true,
    version: '1.0.0',
    schemaDirectory: 'weaver',
    outputDirectory: 'dist/weaver',
    skipValidation: false,
    skipGeneration: false,
    skipDocs: false,
  };

  // Generate Weaver targets for the project
  const weaverTargets = generateWeaverTargets(projectName, config);

  console.log('Generated Weaver targets:');
  Object.entries(weaverTargets).forEach(([targetName, targetConfig]) => {
    console.log(`  ${targetName}:`, {
      executor: targetConfig.executor,
      dependsOn: targetConfig.dependsOn,
      inputs: targetConfig.inputs,
      outputs: targetConfig.outputs,
    });
  });

  return weaverTargets;
}

/**
 * Example 2: Build target integration
 */
export function exampleBuildTargetIntegration() {
  console.log('\n=== Example 2: Build Target Integration ===');

  const projectName = 'my-api';
  const config: WeaverProjectConfig = {
    enabled: true,
    skipGeneration: false,
  };

  // Example build targets
  const buildTargets: Record<string, TargetConfiguration> = {
    build: {
      executor: '@nx/js:tsc',
      options: {
        tsConfig: 'apps/my-api/tsconfig.json',
        outputPath: 'dist/apps/my-api',
      },
    },
    buildVite: {
      executor: '@nx/vite:build',
      options: {
        configFile: 'apps/my-api/vite.config.ts',
      },
    },
    test: {
      executor: '@nx/test:jest',
      options: {
        jestConfig: 'apps/my-api/jest.config.ts',
      },
    },
  };

  console.log('Original build targets:');
  Object.entries(buildTargets).forEach(([targetName, targetConfig]) => {
    console.log(`  ${targetName}:`, {
      executor: targetConfig.executor,
      dependsOn: targetConfig.dependsOn,
    });
  });

  console.log('\nIntegrated build targets:');
  Object.entries(buildTargets).forEach(([targetName, targetConfig]) => {
    const integrated = integrateWithBuildTarget(projectName, targetConfig, config);
    console.log(`  ${targetName}:`, {
      executor: integrated.executor,
      dependsOn: integrated.dependsOn,
    });
  });
}

/**
 * Example 3: Cross-project dependencies
 */
export function exampleCrossProjectDependencies() {
  console.log('\n=== Example 3: Cross-Project Dependencies ===');

  const currentProject = 'my-api';
  const allProjects = ['shared-lib', 'auth-service', 'my-api', 'user-service'];
  const config: WeaverProjectConfig = {
    enabled: true,
    skipValidation: false,
    skipGeneration: false,
    skipDocs: false,
  };

  // Generate dependencies for the current project
  const dependencies = generateTargetDependencies(currentProject, allProjects, config);

  console.log(`Dependencies for project '${currentProject}':`);
  Object.entries(dependencies).forEach(([targetName, deps]) => {
    console.log(`  ${targetName}:`, deps);
  });
}

/**
 * Example 4: Project target management
 */
export async function exampleProjectTargetManagement() {
  console.log('\n=== Example 4: Project Target Management ===');

  const projectName = 'my-api';
  const config: WeaverProjectConfig = {
    enabled: true,
    version: '1.0.0',
    schemaDirectory: 'weaver',
    outputDirectory: 'dist/weaver',
    skipValidation: false,
    skipGeneration: false,
    skipDocs: false,
  };

  try {
    // Update project targets with Weaver configuration
    await updateProjectTargets(projectName, config);
    console.log(`✅ Successfully updated targets for project '${projectName}'`);

    // Update project configuration
    await updateProjectConfiguration(projectName, config);
    console.log(`✅ Successfully updated configuration for project '${projectName}'`);

    // Check if project has Weaver targets
    const hasTargets = hasWeaverTargets(projectName);
    console.log(`Project '${projectName}' has Weaver targets:`, hasTargets);

    if (hasTargets) {
      const weaverTargets = getWeaverTargets(projectName);
      console.log('Weaver targets found:', weaverTargets);

      const buildTargets = getBuildTargets(projectName);
      console.log('Build targets that integrate with Weaver:', buildTargets);
    }
  } catch (error) {
    console.error('❌ Error managing project targets:', error);
  }
}

/**
 * Example 5: Workspace configuration
 */
export async function exampleWorkspaceConfiguration() {
  console.log('\n=== Example 5: Workspace Configuration ===');

  const workspaceConfig: WeaverWorkspaceConfig = {
    defaultVersion: '1.0.0',
    defaultArgs: {
      validate: ['--strict'],
      generate: ['--watch'],
      docs: ['--format', 'markdown'],
    },
    defaultEnvironment: {
      WEAVER_CACHE_DIR: '.weaver-cache',
      WEAVER_LOG_LEVEL: 'info',
    },
    schemaDirectory: 'weaver',
    outputDirectory: 'dist/weaver',
    enabledByDefault: true,
    cacheDirectory: '.weaver-cache',
    downloadTimeout: 30000,
    maxRetries: 3,
    verifyHashes: true,
    downloadUrl: 'https://github.com/weaveworks/weaver/releases/download',
  };

  try {
    await updateWorkspaceConfiguration(workspaceConfig);
    console.log('✅ Successfully updated workspace configuration');
  } catch (error) {
    console.error('❌ Error updating workspace configuration:', error);
  }
}

/**
 * Example 6: Target removal
 */
export async function exampleTargetRemoval() {
  console.log('\n=== Example 6: Target Removal ===');

  const projectName = 'my-api';

  try {
    // Check if project has Weaver targets before removal
    const hasTargets = hasWeaverTargets(projectName);
    console.log(`Project '${projectName}' has Weaver targets before removal:`, hasTargets);

    if (hasTargets) {
      // Remove Weaver targets
      await removeWeaverTargets(projectName);
      console.log(`✅ Successfully removed Weaver targets from project '${projectName}'`);

      // Verify removal
      const hasTargetsAfter = hasWeaverTargets(projectName);
      console.log(`Project '${projectName}' has Weaver targets after removal:`, hasTargetsAfter);
    } else {
      console.log(`Project '${projectName}' has no Weaver targets to remove`);
    }
  } catch (error) {
    console.error('❌ Error removing Weaver targets:', error);
  }
}

/**
 * Example 7: Conditional target generation
 */
export function exampleConditionalTargetGeneration() {
  console.log('\n=== Example 7: Conditional Target Generation ===');

  const projectName = 'my-api';

  // Configuration with some operations disabled
  const configWithSkips: WeaverProjectConfig = {
    enabled: true,
    version: '1.0.0',
    skipValidation: true, // Skip validation
    skipGeneration: false, // Keep generation
    skipDocs: true, // Skip docs
  };

  const targets = generateWeaverTargets(projectName, configWithSkips);

  console.log('Conditionally generated targets:');
  Object.entries(targets).forEach(([targetName, targetConfig]) => {
    console.log(`  ${targetName}:`, {
      executor: targetConfig.executor,
      options: targetConfig.options,
    });
  });

  // Verify that skipped targets are not generated
  console.log('\nVerification:');
  console.log('  Validation target generated:', WEAVER_TARGETS.VALIDATE in targets);
  console.log('  Generation target generated:', WEAVER_TARGETS.GENERATE in targets);
  console.log('  Docs target generated:', WEAVER_TARGETS.DOCS in targets);
  console.log('  Clean target generated:', WEAVER_TARGETS.CLEAN in targets);
}

/**
 * Example 8: Build target type detection
 */
export function exampleBuildTargetTypeDetection() {
  console.log('\n=== Example 8: Build Target Type Detection ===');

  console.log('Supported build target types:');
  BUILD_TARGET_TYPES.forEach((type) => {
    console.log(`  - ${type}`);
  });

  // Example of checking if an executor is supported
  const testExecutors = [
    '@nx/js:tsc',
    '@nx/webpack:webpack',
    '@nx/vite:build',
    '@nx/test:jest',
    '@nx/lint:eslint',
  ];

  console.log('\nExecutor support check:');
  testExecutors.forEach((executor) => {
    const isSupported = BUILD_TARGET_TYPES.some((type) => executor.includes(type));
    console.log(`  ${executor}: ${isSupported ? '✅ Supported' : '❌ Not supported'}`);
  });
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('🚀 Running Target Generator Examples\n');

  try {
    // Run all examples
    await exampleBasicTargetGeneration();
    exampleBuildTargetIntegration();
    exampleCrossProjectDependencies();
    await exampleProjectTargetManagement();
    await exampleWorkspaceConfiguration();
    await exampleTargetRemoval();
    exampleConditionalTargetGeneration();
    exampleBuildTargetTypeDetection();

    console.log('\n✅ All examples completed successfully!');
  } catch (error) {
    console.error('\n❌ Error running examples:', error);
  }
}
