import type { ValidateExecutorOptions } from '../../types';
import {
  buildWeaverContext,
  runWeaverCommand,
  generateCacheKey,
  isCacheValid,
  storeCacheResult,
} from '../../utils/executor-utils.js';

interface ExecutorResult {
  success: boolean;
  output?: string;
  error?: string;
}

export default async function validateExecutor(
  options: ValidateExecutorOptions,
  context: any
): Promise<ExecutorResult> {
  try {
    console.log('Running Weaver validation...');

    if (options.verbose) {
      console.log('Validation options:', options);
    }

    if (options.dryRun) {
      console.log('DRY RUN: Would validate configuration');
      return { success: true, output: 'DRY RUN: Would validate Weaver schemas' };
    }

    // Build Weaver context
    const weaverContext = await buildWeaverContext(context);

    // Check cache first
    const cacheKey = generateCacheKey('validate', weaverContext);
    if (await isCacheValid(cacheKey, weaverContext)) {
      return { success: true, output: 'Validation passed (cached)' };
    }

    // Run validation
    const result = await runWeaverCommand('validate', weaverContext, options);

    // Store result in cache
    await storeCacheResult(cacheKey, result, weaverContext, 'validate');

    if (result.success) {
      if (result.validationResult?.warnings.length) {
        console.warn('Validation warnings:', result.validationResult.warnings);
      }
      console.log('Validation completed successfully');
      return {
        success: true,
        output: result.output || 'Validation passed',
      };
    }

    console.error('Validation failed:', result.error);
    return {
      success: false,
      output: result.error || 'Validation failed',
    };
  } catch (error) {
    console.error('Validation executor error:', error);
    return {
      success: false,
      output: error instanceof Error ? error.message : 'Unknown validation error',
    };
  }
}
