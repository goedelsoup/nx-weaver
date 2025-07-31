import { describe, it, expect, vi, beforeEach } from 'vitest';
import validateExecutor from './executor';

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
    output: 'Validation passed',
    validationResult: {
      valid: true,
      errors: [],
      warnings: [],
    },
  }),
  generateCacheKey: vi.fn().mockReturnValue('test-cache-key'),
  isCacheValid: vi.fn().mockResolvedValue(false),
  storeCacheResult: vi.fn().mockResolvedValue(undefined),
}));

describe('validateExecutor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return success for valid options', async () => {
    const options = {
      verbose: false,
      dryRun: false,
      strict: false,
      ignoreWarnings: false,
    };

    const context = {
      projectName: 'test-project',
      root: '/test/project',
      workspace: { root: '/test/workspace' },
    };

    const result = await validateExecutor(options, context);

    expect(result.success).toBe(true);
    expect(result.output).toContain('Validation passed');
  });

  it('should handle dry run mode', async () => {
    const options = {
      verbose: true,
      dryRun: true,
      strict: true,
      ignoreWarnings: false,
    };

    const context = {
      projectName: 'test-project',
      root: '/test/project',
      workspace: { root: '/test/workspace' },
    };

    const result = await validateExecutor(options, context);

    expect(result.success).toBe(true);
    expect(result.output).toContain('DRY RUN');
  });

  it('should handle validation failures', async () => {
    const { runWeaverCommand } = await import('../../utils/executor-utils.js');
    vi.mocked(runWeaverCommand).mockResolvedValueOnce({
      success: false,
      output: '',
      error: 'Schema validation failed',
      validationResult: {
        valid: false,
        errors: ['Invalid schema'],
        warnings: [],
      },
    });

    const options = {
      verbose: false,
      dryRun: false,
      strict: true,
      ignoreWarnings: false,
    };

    const context = {
      projectName: 'test-project',
      root: '/test/project',
      workspace: { root: '/test/workspace' },
    };

    const result = await validateExecutor(options, context);

    expect(result.success).toBe(false);
    expect(result.output).toContain('Schema validation failed');
  });

  it('should handle validation warnings', async () => {
    const { runWeaverCommand } = await import('../../utils/executor-utils.js');
    vi.mocked(runWeaverCommand).mockResolvedValueOnce({
      success: true,
      output: 'Validation passed with warnings',
      validationResult: {
        valid: true,
        errors: [],
        warnings: ['Deprecated field used'],
      },
    });

    const options = {
      verbose: true,
      dryRun: false,
      strict: false,
      ignoreWarnings: false,
    };

    const context = {
      projectName: 'test-project',
      root: '/test/project',
      workspace: { root: '/test/workspace' },
    };

    const result = await validateExecutor(options, context);

    expect(result.success).toBe(true);
    expect(result.output).toContain('Validation passed with warnings');
  });
});
