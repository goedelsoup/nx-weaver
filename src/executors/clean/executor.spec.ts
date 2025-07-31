import { describe, it, expect, vi, beforeEach } from 'vitest';
import cleanExecutor from './executor';

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
  getGeneratedFiles: vi
    .fn()
    .mockResolvedValue(['/test/output/types.ts', '/test/output/client.ts', '/test/output/docs.md']),
  cleanGeneratedFiles: vi
    .fn()
    .mockResolvedValue(['/test/output/types.ts', '/test/output/client.ts', '/test/output/docs.md']),
  generateCacheKey: vi.fn().mockReturnValue('test-cache-key'),
}));

describe('cleanExecutor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return success for valid options', async () => {
    const options = {
      verbose: false,
      dryRun: false,
      includeCache: false,
      includeTemp: false,
    };

    const context = {
      projectName: 'test-project',
      root: '/test/project',
      workspace: { root: '/test/workspace' },
    };

    const result = await cleanExecutor(options, context);

    expect(result.success).toBe(true);
    expect(result.output).toContain('Cleaned 3 files');
  });

  it('should handle dry run mode', async () => {
    const options = {
      verbose: true,
      dryRun: true,
      includeCache: true,
      includeTemp: true,
    };

    const context = {
      projectName: 'test-project',
      root: '/test/project',
      workspace: { root: '/test/workspace' },
    };

    const result = await cleanExecutor(options, context);

    expect(result.success).toBe(true);
    expect(result.output).toContain('DRY RUN');
    expect(result.output).toContain('Would clean 3 files');
  });

  it('should handle empty file list', async () => {
    const { getGeneratedFiles } = await import('../../utils/executor-utils.js');
    vi.mocked(getGeneratedFiles).mockResolvedValueOnce([]);

    const options = {
      verbose: false,
      dryRun: false,
      includeCache: false,
      includeTemp: false,
    };

    const context = {
      projectName: 'test-project',
      root: '/test/project',
      workspace: { root: '/test/workspace' },
    };

    const result = await cleanExecutor(options, context);

    expect(result.success).toBe(true);
    expect(result.output).toContain('No files found to clean');
  });

  it('should handle cleanup failures', async () => {
    const { cleanGeneratedFiles } = await import('../../utils/executor-utils.js');
    vi.mocked(cleanGeneratedFiles).mockResolvedValueOnce([]);

    const options = {
      verbose: false,
      dryRun: false,
      includeCache: false,
      includeTemp: false,
    };

    const context = {
      projectName: 'test-project',
      root: '/test/project',
      workspace: { root: '/test/workspace' },
    };

    const result = await cleanExecutor(options, context);

    expect(result.success).toBe(true);
    expect(result.output).toContain('Cleaned 0 files');
  });
});
