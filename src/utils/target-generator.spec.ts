import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  WEAVER_TARGETS,
  WEAVER_TARGET_TEMPLATES,
  BUILD_TARGET_TYPES,
  generateWeaverTargets,
  integrateWithBuildTarget,
  detectExistingTargets,
  updateTargetConfiguration,
  updateProjectTargets,
  generateTargetDependencies,
  removeWeaverTargets,
  updateProjectConfiguration,
  updateWorkspaceConfiguration,
  validateTargetConfiguration,
  getWeaverTargets,
  hasWeaverTargets,
  getBuildTargets,
} from './target-generator.js';
import type { WeaverProjectConfig, WeaverWorkspaceConfig } from '../types/index.js';
import type { TargetConfiguration } from '@nx/devkit';

// Mock the file system utilities
vi.mock('./index.js', () => ({
  resolveWorkspacePath: vi.fn((path: string) => `/workspace/${path}`),
  fileExists: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

import { resolveWorkspacePath, fileExists, readFile, writeFile } from './index.js';

describe('Target Generator', () => {
  const mockProject = 'test-project';
  const mockConfig: WeaverProjectConfig = {
    enabled: true,
    version: '1.0.0',
    schemaDirectory: 'weaver',
    outputDirectory: 'dist/weaver',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Constants', () => {
    it('should export Weaver target names', () => {
      expect(WEAVER_TARGETS.VALIDATE).toBe('weaver-validate');
      expect(WEAVER_TARGETS.GENERATE).toBe('weaver-generate');
      expect(WEAVER_TARGETS.DOCS).toBe('weaver-docs');
      expect(WEAVER_TARGETS.CLEAN).toBe('weaver-clean');
    });

    it('should export Weaver target templates', () => {
      expect(WEAVER_TARGET_TEMPLATES[WEAVER_TARGETS.VALIDATE]).toBeDefined();
      expect(WEAVER_TARGET_TEMPLATES[WEAVER_TARGETS.GENERATE]).toBeDefined();
      expect(WEAVER_TARGET_TEMPLATES[WEAVER_TARGETS.DOCS]).toBeDefined();
      expect(WEAVER_TARGET_TEMPLATES[WEAVER_TARGETS.CLEAN]).toBeDefined();
    });

    it('should export build target types', () => {
      expect(BUILD_TARGET_TYPES).toContain('@nx/js:tsc');
      expect(BUILD_TARGET_TYPES).toContain('@nx/webpack:webpack');
      expect(BUILD_TARGET_TYPES).toContain('@nx/vite:build');
    });
  });

  describe('generateWeaverTargets', () => {
    it('should generate all Weaver targets when no skips are configured', () => {
      const targets = generateWeaverTargets(mockProject, mockConfig);

      expect(targets[WEAVER_TARGETS.VALIDATE]).toBeDefined();
      expect(targets[WEAVER_TARGETS.GENERATE]).toBeDefined();
      expect(targets[WEAVER_TARGETS.DOCS]).toBeDefined();
      expect(targets[WEAVER_TARGETS.CLEAN]).toBeDefined();
    });

    it('should skip validation target when skipValidation is true', () => {
      const configWithSkipValidation = { ...mockConfig, skipValidation: true };
      const targets = generateWeaverTargets(mockProject, configWithSkipValidation);

      expect(targets[WEAVER_TARGETS.VALIDATE]).toBeUndefined();
      expect(targets[WEAVER_TARGETS.GENERATE]).toBeDefined();
      expect(targets[WEAVER_TARGETS.DOCS]).toBeDefined();
      expect(targets[WEAVER_TARGETS.CLEAN]).toBeDefined();
    });

    it('should skip generation target when skipGeneration is true', () => {
      const configWithSkipGeneration = { ...mockConfig, skipGeneration: true };
      const targets = generateWeaverTargets(mockProject, configWithSkipGeneration);

      expect(targets[WEAVER_TARGETS.VALIDATE]).toBeDefined();
      expect(targets[WEAVER_TARGETS.GENERATE]).toBeUndefined();
      expect(targets[WEAVER_TARGETS.DOCS]).toBeDefined();
      expect(targets[WEAVER_TARGETS.CLEAN]).toBeDefined();
    });

    it('should skip docs target when skipDocs is true', () => {
      const configWithSkipDocs = { ...mockConfig, skipDocs: true };
      const targets = generateWeaverTargets(mockProject, configWithSkipDocs);

      expect(targets[WEAVER_TARGETS.VALIDATE]).toBeDefined();
      expect(targets[WEAVER_TARGETS.GENERATE]).toBeDefined();
      expect(targets[WEAVER_TARGETS.DOCS]).toBeUndefined();
      expect(targets[WEAVER_TARGETS.CLEAN]).toBeDefined();
    });

    it('should always include project in target options', () => {
      const targets = generateWeaverTargets(mockProject, mockConfig);

      Object.values(targets).forEach((target) => {
        expect(target.options?.project).toBe(mockProject);
      });
    });
  });

  describe('integrateWithBuildTarget', () => {
    const mockBuildTarget: TargetConfiguration = {
      executor: '@nx/js:tsc',
      options: { tsConfig: 'tsconfig.json' },
    };

    it('should integrate Weaver generation with supported build targets', () => {
      const integrated = integrateWithBuildTarget(mockProject, mockBuildTarget, mockConfig);

      expect(integrated.dependsOn).toContain(WEAVER_TARGETS.GENERATE);
    });

    it('should not integrate when skipGeneration is true', () => {
      const configWithSkipGeneration = { ...mockConfig, skipGeneration: true };
      const integrated = integrateWithBuildTarget(
        mockProject,
        mockBuildTarget,
        configWithSkipGeneration
      );

      expect(integrated).toEqual(mockBuildTarget);
    });

    it('should not integrate with unsupported executors', () => {
      const unsupportedTarget: TargetConfiguration = {
        executor: '@nx/test:jest',
        options: {},
      };

      const integrated = integrateWithBuildTarget(mockProject, unsupportedTarget, mockConfig);

      expect(integrated).toEqual(unsupportedTarget);
    });

    it('should preserve existing dependencies', () => {
      const targetWithDeps: TargetConfiguration = {
        executor: '@nx/js:tsc',
        options: {},
        dependsOn: ['existing-dep'],
      };

      const integrated = integrateWithBuildTarget(mockProject, targetWithDeps, mockConfig);

      expect(integrated.dependsOn).toContain('existing-dep');
      expect(integrated.dependsOn).toContain(WEAVER_TARGETS.GENERATE);
    });
  });

  describe('detectExistingTargets', () => {
    it('should return empty object when project.json does not exist', () => {
      vi.mocked(fileExists).mockReturnValue(false);

      const targets = detectExistingTargets(mockProject);

      expect(targets).toEqual({});
    });

    it('should read targets from apps project.json', () => {
      const mockTargets = { build: { executor: '@nx/js:tsc' } };
      vi.mocked(fileExists).mockImplementation((path: string) => path.includes('apps'));
      vi.mocked(readFile).mockReturnValue(JSON.stringify({ targets: mockTargets }));

      const targets = detectExistingTargets(mockProject);

      expect(targets).toEqual(mockTargets);
    });

    it('should read targets from libs project.json', () => {
      const mockTargets = { build: { executor: '@nx/js:tsc' } };
      vi.mocked(fileExists).mockImplementation((path: string) => path.includes('libs'));
      vi.mocked(readFile).mockReturnValue(JSON.stringify({ targets: mockTargets }));

      const targets = detectExistingTargets(mockProject);

      expect(targets).toEqual(mockTargets);
    });

    it('should handle JSON parsing errors gracefully', () => {
      vi.mocked(fileExists).mockReturnValue(true);
      vi.mocked(readFile).mockReturnValue('invalid json');

      const targets = detectExistingTargets(mockProject);

      expect(targets).toEqual({});
    });
  });

  describe('updateTargetConfiguration', () => {
    it('should update target configuration successfully', async () => {
      const mockProjectJson = { targets: { existing: { executor: 'test' } } };
      vi.mocked(fileExists).mockReturnValue(true);
      vi.mocked(readFile).mockReturnValue(JSON.stringify(mockProjectJson));

      await updateTargetConfiguration(mockProject, 'test-target', { executor: '@nx/test' });

      expect(writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"test-target"')
      );
    });

    it('should throw error when project not found', async () => {
      vi.mocked(fileExists).mockReturnValue(false);

      await expect(
        updateTargetConfiguration(mockProject, 'test-target', { executor: '@nx/test' })
      ).rejects.toThrow(`Project ${mockProject} not found`);
    });
  });

  describe('updateProjectTargets', () => {
    it('should update project targets with Weaver configuration', async () => {
      const mockProjectJson = { targets: {} };
      vi.mocked(fileExists).mockReturnValue(true);
      vi.mocked(readFile).mockReturnValue(JSON.stringify(mockProjectJson));

      await updateProjectTargets(mockProject, mockConfig);

      expect(writeFile).toHaveBeenCalled();
    });
  });

  describe('generateTargetDependencies', () => {
    const mockProjects = ['project1', 'project2', 'project3'];

    it('should generate dependencies for validation target', () => {
      const dependencies = generateTargetDependencies(mockProject, mockProjects, mockConfig);

      expect(dependencies[WEAVER_TARGETS.VALIDATE]).toEqual([
        'project1:weaver-validate',
        'project2:weaver-validate',
        'project3:weaver-validate',
      ]);
    });

    it('should generate dependencies for generation target', () => {
      const dependencies = generateTargetDependencies(mockProject, mockProjects, mockConfig);

      expect(dependencies[WEAVER_TARGETS.GENERATE]).toEqual([
        'project1:weaver-generate',
        'project2:weaver-generate',
        'project3:weaver-generate',
        `${mockProject}:weaver-validate`,
      ]);
    });

    it('should exclude current project from cross-project dependencies', () => {
      const dependencies = generateTargetDependencies(mockProject, mockProjects, mockConfig);

      expect(dependencies[WEAVER_TARGETS.VALIDATE]).not.toContain(`${mockProject}:weaver-validate`);
    });

    it('should handle skipValidation configuration', () => {
      const configWithSkipValidation = { ...mockConfig, skipValidation: true };
      const dependencies = generateTargetDependencies(
        mockProject,
        mockProjects,
        configWithSkipValidation
      );

      expect(dependencies[WEAVER_TARGETS.GENERATE]).not.toContain(`${mockProject}:weaver-validate`);
    });
  });

  describe('removeWeaverTargets', () => {
    it('should remove Weaver targets from project', async () => {
      const mockProjectJson = {
        targets: {
          [WEAVER_TARGETS.VALIDATE]: { executor: '@nx-weaver/validate' },
          [WEAVER_TARGETS.GENERATE]: { executor: '@nx-weaver/generate' },
          build: {
            executor: '@nx/js:tsc',
            dependsOn: [WEAVER_TARGETS.GENERATE],
          },
        },
      };

      vi.mocked(fileExists).mockReturnValue(true);
      vi.mocked(readFile).mockReturnValue(JSON.stringify(mockProjectJson));

      await removeWeaverTargets(mockProject);

      expect(writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.not.stringContaining('weaver-validate')
      );
    });

    it('should clean up Weaver dependencies from build targets', async () => {
      const mockProjectJson = {
        targets: {
          build: {
            executor: '@nx/js:tsc',
            dependsOn: [WEAVER_TARGETS.GENERATE, 'other-dep'],
          },
        },
      };

      vi.mocked(fileExists).mockReturnValue(true);
      vi.mocked(readFile).mockReturnValue(JSON.stringify(mockProjectJson));

      await removeWeaverTargets(mockProject);

      expect(writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('other-dep')
      );
    });
  });

  describe('updateProjectConfiguration', () => {
    it('should update project configuration with Weaver settings', async () => {
      const mockProjectJson = {};
      vi.mocked(fileExists).mockReturnValue(true);
      vi.mocked(readFile).mockReturnValue(JSON.stringify(mockProjectJson));

      await updateProjectConfiguration(mockProject, mockConfig);

      expect(writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"weaver"')
      );
    });
  });

  describe('updateWorkspaceConfiguration', () => {
    it('should update workspace configuration with Weaver defaults', async () => {
      const mockNxJson = {};
      const workspaceConfig: WeaverWorkspaceConfig = {
        defaultVersion: '1.0.0',
        enabledByDefault: true,
      };

      vi.mocked(fileExists).mockReturnValue(true);
      vi.mocked(readFile).mockReturnValue(JSON.stringify(mockNxJson));

      await updateWorkspaceConfiguration(workspaceConfig);

      expect(writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"weaver"')
      );
    });

    it('should throw error when nx.json not found', async () => {
      vi.mocked(fileExists).mockReturnValue(false);

      await expect(updateWorkspaceConfiguration({})).rejects.toThrow('nx.json not found');
    });
  });

  describe('validateTargetConfiguration', () => {
    it('should validate target configuration successfully', () => {
      const validTarget: TargetConfiguration = {
        executor: '@nx/test',
        options: { project: 'test' },
      };

      const result = validateTargetConfiguration('test-target', validTarget);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing executor', () => {
      const invalidTarget: TargetConfiguration = {
        options: { project: 'test' },
      };

      const result = validateTargetConfiguration('test-target', invalidTarget);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Target test-target is missing executor');
    });

    it('should validate Weaver target specific requirements', () => {
      const weaverTarget: TargetConfiguration = {
        executor: '@nx-weaver/validate',
        options: {},
      };

      const result = validateTargetConfiguration(WEAVER_TARGETS.VALIDATE, weaverTarget);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        `Weaver target ${WEAVER_TARGETS.VALIDATE} is missing project option`
      );
    });
  });

  describe('getWeaverTargets', () => {
    it('should return Weaver targets for a project', () => {
      const mockTargets = {
        [WEAVER_TARGETS.VALIDATE]: { executor: '@nx-weaver/validate' },
        [WEAVER_TARGETS.GENERATE]: { executor: '@nx-weaver/generate' },
        build: { executor: '@nx/js:tsc' },
      };

      vi.mocked(fileExists).mockReturnValue(true);
      vi.mocked(readFile).mockReturnValue(JSON.stringify({ targets: mockTargets }));

      const weaverTargets = getWeaverTargets(mockProject);

      expect(weaverTargets).toContain(WEAVER_TARGETS.VALIDATE);
      expect(weaverTargets).toContain(WEAVER_TARGETS.GENERATE);
      expect(weaverTargets).not.toContain('build');
    });
  });

  describe('hasWeaverTargets', () => {
    it('should return true when project has Weaver targets', () => {
      const mockTargets = {
        [WEAVER_TARGETS.VALIDATE]: { executor: '@nx-weaver/validate' },
      };

      vi.mocked(fileExists).mockReturnValue(true);
      vi.mocked(readFile).mockReturnValue(JSON.stringify({ targets: mockTargets }));

      const hasTargets = hasWeaverTargets(mockProject);

      expect(hasTargets).toBe(true);
    });

    it('should return false when project has no Weaver targets', () => {
      const mockTargets = {
        build: { executor: '@nx/js:tsc' },
      };

      vi.mocked(fileExists).mockReturnValue(true);
      vi.mocked(readFile).mockReturnValue(JSON.stringify({ targets: mockTargets }));

      const hasTargets = hasWeaverTargets(mockProject);

      expect(hasTargets).toBe(false);
    });
  });

  describe('getBuildTargets', () => {
    it('should return build targets that should integrate with Weaver', () => {
      const mockTargets = {
        build: { executor: '@nx/js:tsc' },
        test: { executor: '@nx/test:jest' },
        serve: { executor: '@nx/vite:build' },
      };

      vi.mocked(fileExists).mockReturnValue(true);
      vi.mocked(readFile).mockReturnValue(JSON.stringify({ targets: mockTargets }));

      const buildTargets = getBuildTargets(mockProject);

      expect(buildTargets).toContain('build');
      expect(buildTargets).toContain('serve');
      expect(buildTargets).not.toContain('test');
    });
  });
});
