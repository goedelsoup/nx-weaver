import type { DocsExecutorOptions } from '../../types';
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

export default async function docsExecutor(
  options: DocsExecutorOptions,
  context: any
): Promise<ExecutorResult> {
  try {
    console.log('Running Weaver documentation generation...');

    if (options.verbose) {
      console.log('Documentation options:', options);
    }

    if (options.dryRun) {
      console.log('DRY RUN: Would generate documentation');
      return { success: true, output: 'DRY RUN: Would generate documentation from Weaver schemas' };
    }

    // Build Weaver context
    const weaverContext = await buildWeaverContext(context);

    // Check cache first
    const cacheKey = generateCacheKey('docs', weaverContext);
    if (await isCacheValid(cacheKey, weaverContext)) {
      return { success: true, output: 'Documentation generated (cached)' };
    }

    // Run documentation generation
    const result = await runWeaverCommand('docs', weaverContext, options);

    // Store result in cache
    await storeCacheResult(cacheKey, result, weaverContext, 'docs');

    if (result.success) {
      console.log('Documentation generation completed successfully');
      return {
        success: true,
        output: result.output || 'Documentation generation completed',
      };
    }

    console.error('Documentation generation failed:', result.error);
    return {
      success: false,
      output: result.error || 'Documentation generation failed',
    };
  } catch (error) {
    console.error('Documentation executor error:', error);
    return {
      success: false,
      output: error instanceof Error ? error.message : 'Unknown documentation error',
    };
  }
}
