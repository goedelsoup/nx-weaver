import type { CleanExecutorOptions } from '../../types';
import {
  buildWeaverContext,
  getGeneratedFiles,
  cleanGeneratedFiles,
} from '../../utils/executor-utils.js';

interface ExecutorResult {
  success: boolean;
  output?: string;
  error?: string;
}

export default async function cleanExecutor(
  options: CleanExecutorOptions,
  context: any
): Promise<ExecutorResult> {
  try {
    console.log('Running Weaver cleanup...');

    if (options.verbose) {
      console.log('Cleanup options:', options);
    }

    // Build Weaver context
    const weaverContext = await buildWeaverContext(context);

    // Get list of files to clean
    const filesToClean = await getGeneratedFiles(weaverContext.projectName);

    if (options.dryRun) {
      const fileList =
        filesToClean.length > 0 ? `\n${filesToClean.join('\n')}` : 'No files found to clean';

      console.log('DRY RUN: Would clean files');
      return {
        success: true,
        output: `DRY RUN: Would clean ${filesToClean.length} files:${fileList}`,
      };
    }

    if (filesToClean.length === 0) {
      console.log('No files found to clean');
      return {
        success: true,
        output: 'No files found to clean',
      };
    }

    // Clean generated files
    const cleanedFiles = await cleanGeneratedFiles(filesToClean);

    console.log(`Cleaned ${cleanedFiles.length} files successfully`);
    return {
      success: true,
      output: `Cleaned ${cleanedFiles.length} files`,
    };
  } catch (error) {
    console.error('Cleanup executor error:', error);
    return {
      success: false,
      output: error instanceof Error ? error.message : 'Unknown cleanup error',
    };
  }
}
