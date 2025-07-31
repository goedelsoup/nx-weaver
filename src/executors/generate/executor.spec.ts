import { describe, it, expect, vi, beforeEach } from 'vitest';
import generateExecutor from './executor';

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
    output: 'Code generation completed',
    filesGenerated: ['/test/output/types.ts', '/test/output/client.ts'],
  }),
  ensureDirectory: vi.fn().mockResolvedValue(undefined),
  trackGeneratedFiles: vi.fn().mockResolvedValue(undefined),
  generateCacheKey: vi.fn().mockReturnValue('test-cache-key'),
  isCacheValid: vi.fn().mockResolvedValue(false),
  storeCacheResult: vi.fn().mockResolvedValue(undefined),
}));

describe('generateExecutor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return success for valid options', async () => {
    const options = {
      verbose: false,
      dryRun: false,
      force: false,
      watch: false,
      outputFormat: 'typescript' as const,
    };

    const context = {
      projectName: 'test-project',
      root: '/test/project',
      workspace: { root: '/test/workspace' },
    };

    const result = await generateExecutor(options, context);

    expect(result.success).toBe(true);
    expect(result.output).toContain('Code generation completed');
  });

  it('should handle dry run mode', async () => {
    const options = {
      verbose: true,
      dryRun: true,
      force: true,
      watch: false,
      outputFormat: 'javascript' as const,
    };

    const context = {
      projectName: 'test-project',
      root: '/test/project',
      workspace: { root: '/test/workspace' },
    };

    const result = await generateExecutor(options, context);

    expect(result.success).toBe(true);
    expect(result.output).toContain('DRY RUN');
  });

  it('should handle generation failures', async () => {
    const { runWeaverCommand } = await import('../../utils/executor-utils.js');
    vi.mocked(runWeaverCommand).mockResolvedValueOnce({
      success: false,
      output: '',
      error: 'Code generation failed',
    });

    const options = {
      verbose: false,
      dryRun: false,
      force: false,
      watch: false,
      outputFormat: 'typescript' as const,
    };

    const context = {
      projectName: 'test-project',
      root: '/test/project',
      workspace: { root: '/test/workspace' },
    };

    const result = await generateExecutor(options, context);

    expect(result.success).toBe(false);
    expect(result.output).toContain('Code generation failed');
  });
});
