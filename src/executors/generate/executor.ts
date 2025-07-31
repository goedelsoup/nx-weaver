import type { GenerateExecutorOptions } from '../../types';
import {
  buildWeaverContext,
  runWeaverCommand,
  ensureDirectory,
  trackGeneratedFiles,
  generateCacheKey,
  isCacheValid,
  storeCacheResult,
} from '../../utils/executor-utils.js';

interface ExecutorResult {
  success: boolean;
  output?: string;
  error?: string;
}

export default async function generateExecutor(
  options: GenerateExecutorOptions,
  context: any
): Promise<ExecutorResult> {
  try {
    console.log('Running Weaver code generation...');

    if (options.verbose) {
      console.log('Generation options:', options);
    }

    if (options.dryRun) {
      console.log('DRY RUN: Would generate code');
      return { success: true, output: 'DRY RUN: Would generate code from Weaver schemas' };
    }

    // Build Weaver context
    const weaverContext = await buildWeaverContext(context);

    // Check cache first
    const cacheKey = generateCacheKey('generate', weaverContext);
    if (await isCacheValid(cacheKey, weaverContext)) {
      return { success: true, output: 'Code generation completed (cached)' };
    }

    // Ensure output directory exists
    await ensureDirectory(weaverContext.outputPath);

    // Run generation
    const result = await runWeaverCommand('generate', weaverContext, options);

    // Track generated files
    if (result.success && result.filesGenerated) {
      await trackGeneratedFiles(weaverContext.projectName, result.filesGenerated);
    }

    // Store result in cache
    await storeCacheResult(cacheKey, result, weaverContext, 'generate');

    if (result.success) {
      console.log('Code generation completed successfully');
      return {
        success: true,
        output: result.output || 'Code generation completed',
      };
    }

    console.error('Code generation failed:', result.error);
    return {
      success: false,
      output: result.error || 'Code generation failed',
    };
  } catch (error) {
    console.error('Generation executor error:', error);
    return {
      success: false,
      output: error instanceof Error ? error.message : 'Unknown generation error',
    };
  }
}
