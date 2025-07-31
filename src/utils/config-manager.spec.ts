import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getWorkspaceConfig,
  getProjectConfig,
  validateConfig,
  mergeConfigs,
  getDefaultConfig,
  createMinimalConfig,
} from './config-manager';
import {
  createMockWorkspaceConfig,
  createMockProjectConfig,
  createTempWorkspace,
  cleanupTempWorkspace,
} from '../test/utils';
import fs from 'node:fs';
import path from 'node:path';

describe('ConfigManager', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempWorkspace();
  });

  afterEach(() => {
    cleanupTempWorkspace(tempDir);
  });

  describe('getWorkspaceConfig', () => {
    it('should load workspace configuration from file', () => {
      const config = createMockWorkspaceConfig();
      fs.writeFileSync(path.join(tempDir, 'weaver-workspace.json'), JSON.stringify(config));

      const result = getWorkspaceConfig(tempDir);
      // Check that the result contains the expected properties
      expect(result.defaultVersion).toBe(config.defaultVersion);
      expect(result.schemaDirectory).toBe(config.schemaDirectory);
      expect(result.outputDirectory).toBe(config.outputDirectory);
    });

    it('should return defaults when no config file exists', () => {
      const result = getWorkspaceConfig(tempDir);
      expect(result.schemaDirectory).toBe('weaver/');
      expect(result.enabledByDefault).toBe(true);
    });

    it('should handle malformed JSON gracefully', () => {
      fs.writeFileSync(path.join(tempDir, 'weaver-workspace.json'), 'invalid json content');

      // Should throw an error for malformed JSON
      expect(() => getWorkspaceConfig(tempDir)).toThrow('Failed to load configuration file');
    });
  });

  describe('getProjectConfig', () => {
    it('should load project configuration from file', () => {
      const config = createMockProjectConfig();
      const projectDir = path.join(tempDir, 'test-project');
      fs.mkdirSync(projectDir, { recursive: true });

      fs.writeFileSync(path.join(projectDir, 'weaver.json'), JSON.stringify(config));

      const result = getProjectConfig(projectDir);
      // Check that the result contains the expected properties
      expect(result.enabled).toBe(config.enabled);
      expect(result.version).toBe(config.version);
      expect(result.schemaDirectory).toBe(config.schemaDirectory);
    });

    it('should return defaults when no project config exists', () => {
      const projectDir = path.join(tempDir, 'test-project');
      const result = getProjectConfig(projectDir);
      expect(result.enabled).toBe(true);
      expect(result.version).toBe('latest');
    });

    it('should handle missing project directory', () => {
      const projectDir = path.join(tempDir, 'non-existent-project');
      const result = getProjectConfig(projectDir);
      expect(result.enabled).toBe(true);
      expect(result.version).toBe('latest');
    });
  });

  describe('mergeConfigs', () => {
    it('should merge workspace and project configs correctly', () => {
      const workspaceConfig = createMockWorkspaceConfig({
        defaultVersion: '1.0.0',
        schemaDirectory: 'weaver/',
      });

      const projectConfig = createMockProjectConfig({
        version: '2.0.0',
        schemaDirectory: 'custom-weaver/',
      });

      const result = mergeConfigs(workspaceConfig, projectConfig);

      expect(result.version).toBe('2.0.0');
      expect(result.schemaDirectory).toBe('custom-weaver/');
      expect(result.enabled).toBe(true);
    });

    it('should use workspace defaults when project config is missing values', () => {
      const workspaceConfig = createMockWorkspaceConfig({
        defaultVersion: '1.0.0',
        schemaDirectory: 'weaver/',
      });

      const projectConfig = createMockProjectConfig({
        enabled: true,
        // Missing version and schemaDirectory
      });

      const result = mergeConfigs(workspaceConfig, projectConfig);

      expect(result.version).toBe('1.0.0');
      expect(result.schemaDirectory).toBe('weaver/');
      expect(result.enabled).toBe(true);
    });

    it('should handle empty project config', () => {
      const workspaceConfig = createMockWorkspaceConfig({
        defaultVersion: '1.0.0',
        schemaDirectory: 'weaver/',
      });

      const projectConfig = {};

      const result = mergeConfigs(workspaceConfig, projectConfig);

      expect(result.version).toBe('1.0.0');
      expect(result.schemaDirectory).toBe('weaver/');
      expect(result.enabled).toBe(true);
    });
  });

  describe('validateConfig', () => {
    it('should validate correct configuration', () => {
      const config = createMockProjectConfig();
      const result = validateConfig(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid schema directory', () => {
      const config = createMockProjectConfig({
        schemaDirectory: '/invalid/path',
      });

      const result = validateConfig(config);

      expect(result.valid).toBe(true); // Should be valid, just warnings
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should detect invalid version format', () => {
      const config = createMockProjectConfig({
        version: 'invalid-version',
      });

      const result = validateConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect invalid output directory', () => {
      const config = createMockProjectConfig({
        outputDirectory: '/invalid/output/path',
      });

      const result = validateConfig(config);

      expect(result.valid).toBe(true); // Should be valid, just warnings
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('getDefaultConfig', () => {
    it('should return default configuration', () => {
      const config = getDefaultConfig();
      expect(config.defaultVersion).toBe('latest');
      expect(config.schemaDirectory).toBe('weaver/');
      expect(config.outputDirectory).toBe('dist/weaver/');
      expect(config.enabledByDefault).toBe(true);
    });
  });

  describe('createMinimalConfig', () => {
    it('should return minimal configuration', () => {
      const config = createMinimalConfig();
      expect(config.enabled).toBe(true);
      expect(config.version).toBe('latest');
    });
  });
});
