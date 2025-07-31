import { describe, it, expect, vi, beforeEach } from 'vitest';
import docsExecutor from './executor';

// Mock the executor utils
vi.mock('../../utils/executor-utils.js', () => ({
  buildWeaverContext: vi.fn().mockResolvedValue({
    projectName: 'test-project',
    projectRoot: '/test/project',
    workspaceRoot: '/test/workspace',
    weaverPath: '/test/weaver',
    config: {},
    workspaceConfig: {},
    schemaFiles: ['/test/schema.yaml'],
    outputPath: '/test/output',
  }),
  runWeaverCommand: vi.fn().mockResolvedValue({
    success: true,
    output: 'Documentation generation completed',
    docsResult: {
      outputFiles: ['/test/output/README.md', '/test/output/api.md'],
      errors: [],
    },
  }),
  generateCacheKey: vi.fn().mockReturnValue('test-cache-key'),
  isCacheValid: vi.fn().mockResolvedValue(false),
  storeCacheResult: vi.fn().mockResolvedValue(undefined),
}));

describe('docsExecutor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return success for valid options', async () => {
    const options = {
      verbose: false,
      dryRun: false,
      format: 'markdown' as const,
      outputPath: '/test/docs',
      includeExamples: true,
    };

    const context = {
      projectName: 'test-project',
      root: '/test/project',
      workspace: { root: '/test/workspace' },
    };

    const result = await docsExecutor(options, context);

    expect(result.success).toBe(true);
    expect(result.output).toContain('Documentation generation completed');
  });

  it('should handle different output formats', async () => {
    const options = {
      verbose: true,
      dryRun: true,
      format: 'html' as const,
      outputPath: '/test/docs',
      includeExamples: false,
    };

    const context = {
      projectName: 'test-project',
      root: '/test/project',
      workspace: { root: '/test/workspace' },
    };

    const result = await docsExecutor(options, context);

    expect(result.success).toBe(true);
    expect(result.output).toContain('DRY RUN');
  });

  it('should handle documentation generation failures', async () => {
    const { runWeaverCommand } = await import('../../utils/executor-utils.js');
    vi.mocked(runWeaverCommand).mockResolvedValueOnce({
      success: false,
      output: '',
      error: 'Documentation generation failed',
    });

    const options = {
      verbose: false,
      dryRun: false,
      format: 'markdown' as const,
      outputPath: '/test/docs',
      includeExamples: true,
    };

    const context = {
      projectName: 'test-project',
      root: '/test/project',
      workspace: { root: '/test/workspace' },
    };

    const result = await docsExecutor(options, context);

    expect(result.success).toBe(false);
    expect(result.output).toContain('Documentation generation failed');
  });
});
