import { describe, it, expect, vi } from 'vitest';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import setupProjectGenerator from './generator';

describe('setup-project generator', () => {
  it('should create project configuration', async () => {
    const tree = createTreeWithEmptyWorkspace();

    // Create a project structure
    tree.write(
      'test-project/project.json',
      JSON.stringify({
        name: 'test-project',
        targets: {},
      })
    );

    await setupProjectGenerator(tree, {
      project: 'test-project',
      version: '1.0.0',
      schemaDirectory: 'weaver/',
      outputDirectory: 'dist/weaver/',
      enabled: true,
      verbose: true,
    });

    // Check project configuration
    expect(tree.exists('test-project/weaver.json')).toBe(true);
    const projectConfig = JSON.parse(tree.read('test-project/weaver.json', 'utf-8') || '{}');
    expect(projectConfig.enabled).toBe(true);
    expect(projectConfig.version).toBe('1.0.0');
    expect(projectConfig.schemaDirectory).toBe('weaver/');
    expect(projectConfig.outputDirectory).toBe('dist/weaver/');

    // Check directory structure
    expect(tree.exists('test-project/weaver/')).toBe(true);
    expect(tree.exists('test-project/dist/weaver/')).toBe(true);

    // Check initial schema
    expect(tree.exists('test-project/weaver/schema.yaml')).toBe(true);
    const schema = tree.read('test-project/weaver/schema.yaml', 'utf-8') || '';
    expect(schema).toContain('name: "weaver"');

    // Check documentation
    expect(tree.exists('test-project/README-weaver.md')).toBe(true);

    // Check project targets
    const projectJson = JSON.parse(tree.read('test-project/project.json', 'utf-8') || '{}');
    expect(projectJson.targets.validate).toBeDefined();
    expect(projectJson.targets.generate).toBeDefined();
    expect(projectJson.targets.docs).toBeDefined();
    expect(projectJson.targets.clean).toBeDefined();
  });

  it('should throw error for non-existent project', async () => {
    const tree = createTreeWithEmptyWorkspace();

    await expect(
      setupProjectGenerator(tree, {
        project: 'non-existent-project',
        verbose: true,
      })
    ).rejects.toThrow("Project 'non-existent-project' does not exist");
  });

  it('should skip target generation when requested', async () => {
    const tree = createTreeWithEmptyWorkspace();

    // Create a project structure
    tree.write(
      'test-project/project.json',
      JSON.stringify({
        name: 'test-project',
        targets: {},
      })
    );

    await setupProjectGenerator(tree, {
      project: 'test-project',
      skipTargets: true,
      verbose: true,
    });

    // Should not add Weaver targets
    const projectJson = JSON.parse(tree.read('test-project/project.json', 'utf-8') || '{}');
    expect(projectJson.targets.validate).toBeUndefined();
    expect(projectJson.targets.generate).toBeUndefined();
  });

  it('should use default values when options not provided', async () => {
    const tree = createTreeWithEmptyWorkspace();

    // Create a project structure
    tree.write(
      'test-project/project.json',
      JSON.stringify({
        name: 'test-project',
        targets: {},
      })
    );

    await setupProjectGenerator(tree, {
      project: 'test-project',
      verbose: true,
    });

    const projectConfig = JSON.parse(tree.read('test-project/weaver.json', 'utf-8') || '{}');
    expect(projectConfig.enabled).toBe(true);
    expect(projectConfig.schemaDirectory).toBe('weaver/');
    expect(projectConfig.outputDirectory).toBe('dist/weaver/');
  });

  it('should handle disabled project', async () => {
    const tree = createTreeWithEmptyWorkspace();

    // Create a project structure
    tree.write(
      'test-project/project.json',
      JSON.stringify({
        name: 'test-project',
        targets: {},
      })
    );

    await setupProjectGenerator(tree, {
      project: 'test-project',
      enabled: false,
      verbose: true,
    });

    const projectConfig = JSON.parse(tree.read('test-project/weaver.json', 'utf-8') || '{}');
    expect(projectConfig.enabled).toBe(false);
  });

  it('should preserve existing project.json targets', async () => {
    const tree = createTreeWithEmptyWorkspace();

    // Create a project structure with existing targets
    tree.write(
      'test-project/project.json',
      JSON.stringify({
        name: 'test-project',
        targets: {
          build: {
            executor: '@nx/webpack:webpack',
            options: {},
          },
          test: {
            executor: '@nx/jest:jest',
            options: {},
          },
        },
      })
    );

    await setupProjectGenerator(tree, {
      project: 'test-project',
      verbose: true,
    });

    const projectJson = JSON.parse(tree.read('test-project/project.json', 'utf-8') || '{}');
    expect(projectJson.targets.build).toBeDefined();
    expect(projectJson.targets.test).toBeDefined();
    expect(projectJson.targets.validate).toBeDefined();
    expect(projectJson.targets.generate).toBeDefined();
  });
});
