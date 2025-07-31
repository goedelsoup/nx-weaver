import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { ExecutorContext } from '@nx/devkit';
import type { WeaverWorkspaceConfig, WeaverProjectConfig, WeaverResult } from '../types';

export function createMockWorkspaceConfig(
  overrides?: Partial<WeaverWorkspaceConfig>
): WeaverWorkspaceConfig {
  return {
    defaultVersion: '1.0.0',
    schemaDirectory: 'weaver/',
    outputDirectory: 'dist/weaver/',
    enabledByDefault: true,
    cacheDirectory: '.nx-weaver-cache/',
    downloadTimeout: 30000,
    maxRetries: 3,
    verifyHashes: true,
    ...overrides,
  };
}

export function createMockProjectConfig(
  overrides?: Partial<WeaverProjectConfig>
): WeaverProjectConfig {
  return {
    enabled: true,
    version: '1.0.0',
    schemaDirectory: 'weaver/',
    outputDirectory: 'dist/weaver/',
    skipValidation: false,
    skipGeneration: false,
    skipDocs: false,
    ...overrides,
  };
}

export function createMockExecutorContext(overrides?: Partial<ExecutorContext>): ExecutorContext {
  return {
    projectName: 'test-project',
    projectGraph: {
      nodes: {},
      dependencies: {},
    },
    workspace: {
      version: 2,
      projects: {},
    },
    root: '/tmp/test-workspace',
    cwd: '/tmp/test-workspace',
    isVerbose: false,
    ...overrides,
  };
}

export function createTempWorkspace(): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nx-weaver-test-'));
  return tempDir;
}

export function cleanupTempWorkspace(workspacePath: string): void {
  fs.rmSync(workspacePath, { recursive: true, force: true });
}

export function createMockWeaverResult(overrides?: Partial<WeaverResult>) {
  return {
    success: true,
    output: 'test output',
    duration: 100,
    ...overrides,
  };
}

export function createMockValidationResult(overrides?: Partial<any>) {
  return {
    valid: true,
    errors: [],
    warnings: [],
    ...overrides,
  };
}

export function createTestSchemaFile(
  workspacePath: string,
  schemaContent = 'name: test\nversion: 1.0.0'
): string {
  const schemaDir = path.join(workspacePath, 'weaver');
  fs.mkdirSync(schemaDir, { recursive: true });
  const schemaPath = path.join(schemaDir, 'schema.yaml');
  fs.writeFileSync(schemaPath, schemaContent);
  return schemaPath;
}

export function createTestProjectStructure(workspacePath: string, projectName: string): void {
  const projectDir = path.join(workspacePath, projectName);
  fs.mkdirSync(projectDir, { recursive: true });

  // Create project.json
  const projectConfig = {
    name: projectName,
    sourceRoot: `${projectName}/src`,
    projectType: 'library',
    targets: {
      build: {
        executor: '@nx/js:tsc',
        options: {},
      },
    },
  };

  fs.writeFileSync(path.join(projectDir, 'project.json'), JSON.stringify(projectConfig, null, 2));
}
