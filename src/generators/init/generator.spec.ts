import { describe, it, expect, vi } from 'vitest';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import initGenerator from './generator';

describe('init generator', () => {
  it('should create workspace configuration', async () => {
    const tree = createTreeWithEmptyWorkspace();

    await initGenerator(tree, {
      defaultVersion: '1.0.0',
      schemaDirectory: 'weaver/',
      outputDirectory: 'dist/weaver/',
      enabledByDefault: true,
      verbose: true,
    });

    // Check workspace configuration
    expect(tree.exists('weaver-workspace.json')).toBe(true);
    const workspaceConfig = JSON.parse(tree.read('weaver-workspace.json', 'utf-8') || '{}');
    expect(workspaceConfig.defaultVersion).toBe('1.0.0');
    expect(workspaceConfig.schemaDirectory).toBe('weaver/');
    expect(workspaceConfig.outputDirectory).toBe('dist/weaver/');
    expect(workspaceConfig.enabledByDefault).toBe(true);

    // Check directory structure
    expect(tree.exists('weaver/')).toBe(true);
    expect(tree.exists('dist/weaver/')).toBe(true);
    expect(tree.exists('.weaver-cache/')).toBe(true);

    // Check documentation
    expect(tree.exists('docs/weaver-setup.md')).toBe(true);

    // Check .gitignore
    const gitignore = tree.read('.gitignore', 'utf-8') || '';
    expect(gitignore).toContain('# Weaver generated files');
    expect(gitignore).toContain('dist/weaver/');
    expect(gitignore).toContain('.weaver-cache/');
  });

  it('should handle existing configuration gracefully', async () => {
    const tree = createTreeWithEmptyWorkspace();

    // Create existing configuration
    tree.write(
      'weaver-workspace.json',
      JSON.stringify({
        defaultVersion: '0.9.0',
        schemaDirectory: 'existing/',
        outputDirectory: 'existing-dist/',
        enabledByDefault: false,
      })
    );

    await initGenerator(tree, {
      defaultVersion: '1.0.0',
      schemaDirectory: 'weaver/',
      outputDirectory: 'dist/weaver/',
      enabledByDefault: true,
      verbose: true,
    });

    // Should not overwrite existing configuration
    const workspaceConfig = JSON.parse(tree.read('weaver-workspace.json', 'utf-8') || '{}');
    expect(workspaceConfig.defaultVersion).toBe('0.9.0');
    expect(workspaceConfig.schemaDirectory).toBe('existing/');
  });

  it('should update nx.json with Weaver defaults', async () => {
    const tree = createTreeWithEmptyWorkspace();

    // Create existing nx.json
    tree.write(
      'nx.json',
      JSON.stringify({
        version: 2,
        generators: {},
      })
    );

    await initGenerator(tree, {
      defaultVersion: '1.0.0',
      schemaDirectory: 'weaver/',
      outputDirectory: 'dist/weaver/',
      enabledByDefault: true,
      verbose: true,
    });

    const nxConfig = JSON.parse(tree.read('nx.json', 'utf-8') || '{}');
    expect(nxConfig.weaver).toBeDefined();
    expect(nxConfig.weaver.defaultVersion).toBe('1.0.0');
    expect(nxConfig.weaver.schemaDirectory).toBe('weaver/');
    expect(nxConfig.weaver.outputDirectory).toBe('dist/weaver/');
    expect(nxConfig.weaver.enabledByDefault).toBe(true);
  });

  it('should skip installation when requested', async () => {
    const tree = createTreeWithEmptyWorkspace();

    await initGenerator(tree, {
      skipInstall: true,
      verbose: true,
    });

    // Should not create install script
    expect(tree.exists('install-weaver.sh')).toBe(false);
  });

  it('should use default values when options not provided', async () => {
    const tree = createTreeWithEmptyWorkspace();

    await initGenerator(tree, {
      verbose: true,
    });

    const workspaceConfig = JSON.parse(tree.read('weaver-workspace.json', 'utf-8') || '{}');
    expect(workspaceConfig.defaultVersion).toBe('latest');
    expect(workspaceConfig.schemaDirectory).toBe('weaver/');
    expect(workspaceConfig.outputDirectory).toBe('dist/weaver/');
    expect(workspaceConfig.enabledByDefault).toBe(true);
  });
});
