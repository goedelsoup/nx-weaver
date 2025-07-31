import type { ExecutorContext } from '@nx/devkit';
import { join, dirname } from 'node:path';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { WeaverManager } from './weaver-manager.js';
import { getProjectConfig, getWorkspaceConfig } from './config-manager.js';
import { CacheManager } from './cache-manager.js';
import type {
  WeaverProjectConfig,
  WeaverWorkspaceConfig,
  WeaverValidationResult,
  WeaverGenerationResult,
  WeaverDocsResult,
  WeaverCleanResult,
} from '../types/index.js';

/**
 * Weaver executor context containing all necessary information for execution
 */
export interface WeaverExecutorContext {
  projectName: string;
  projectRoot: string;
  workspaceRoot: string;
  weaverPath: string;
  config: WeaverProjectConfig;
  workspaceConfig: WeaverWorkspaceConfig;
  schemaFiles: string[];
  outputPath: string;
}

/**
 * Common options for Weaver executor operations
 */
export interface WeaverExecutorOptions {
  dryRun?: boolean;
  verbose?: boolean;
  [key: string]: any;
}

/**
 * Result from Weaver command execution
 */
export interface WeaverResult {
  success: boolean;
  output: string;
  error?: string;
  filesGenerated?: string[];
  validationResult?: WeaverValidationResult;
  generationResult?: WeaverGenerationResult;
  docsResult?: WeaverDocsResult;
  cleanResult?: WeaverCleanResult;
}

// Global cache manager instance
let cacheManager: CacheManager | null = null;

/**
 * Get or create cache manager instance
 */
function getCacheManager(workspaceRoot: string): CacheManager {
  if (!cacheManager) {
    cacheManager = new CacheManager({
      cacheDirectory: join(workspaceRoot, '.nx-weaver-cache'),
    });
  }
  return cacheManager;
}

/**
 * Build complete Weaver execution context
 */
export async function buildWeaverContext(context: ExecutorContext): Promise<WeaverExecutorContext> {
  const { projectName } = context;
  const projectRoot = context.root || process.cwd();
  const workspaceRoot = (context as any).workspace?.root || process.cwd();

  // Ensure projectName is always a string
  if (!projectName) {
    throw new Error('Project name is required for Weaver operations');
  }

  // Load configurations
  const workspaceConfig = getWorkspaceConfig(workspaceRoot);
  const projectConfig = getProjectConfig(projectRoot, workspaceConfig);
  const mergedConfig = { ...workspaceConfig, ...projectConfig };

  // Initialize Weaver manager
  const weaverManager = new WeaverManager({
    cacheDirectory: mergedConfig.cacheDirectory,
    downloadTimeout: mergedConfig.downloadTimeout,
    maxRetries: mergedConfig.maxRetries,
    downloadUrl: mergedConfig.downloadUrl,
    verifyHashes: mergedConfig.verifyHashes,
  });

  // Get Weaver executable path
  const version = (projectConfig.version || workspaceConfig.defaultVersion || 'latest') as string;
  const weaverPath = await weaverManager.downloadWeaver(version);

  // Collect schema files
  const schemaDirectory =
    projectConfig.schemaDirectory || workspaceConfig.schemaDirectory || 'weaver/';
  const schemaPath = join(projectRoot, schemaDirectory);
  const schemaFiles = await collectSchemaFiles(schemaPath);

  // Set up output directory
  const outputDirectory =
    projectConfig.outputDirectory || workspaceConfig.outputDirectory || 'dist/weaver/';
  const outputPath = join(projectRoot, outputDirectory);

  return {
    projectName,
    projectRoot,
    workspaceRoot,
    weaverPath,
    config: projectConfig,
    workspaceConfig,
    schemaFiles,
    outputPath,
  };
}

/**
 * Execute Weaver commands with proper arguments
 */
export async function runWeaverCommand(
  operation: string,
  weaverContext: WeaverExecutorContext,
  options: WeaverExecutorOptions
): Promise<WeaverResult> {
  const { weaverPath, config } = weaverContext;
  const { dryRun, verbose, ...commandOptions } = options;

  try {
    if (dryRun) {
      return {
        success: true,
        output: `DRY RUN: Would execute Weaver ${operation} command`,
      };
    }

    // Build command arguments
    const args = buildCommandArgs(operation, weaverContext, commandOptions);

    if (verbose) {
      console.log(`Executing: ${weaverPath} ${args.join(' ')}`);
    }

    // Execute command
    const result = execSync(`${weaverPath} ${args.join(' ')}`, {
      cwd: weaverContext.projectRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        ...config.environment,
        ...weaverContext.workspaceConfig.defaultEnvironment,
      },
      timeout: 30000, // 30 second timeout
    });

    // Parse result based on operation
    const parsedResult = parseWeaverResult(operation, result);

    return {
      success: true,
      output: result,
      ...parsedResult,
    };
  } catch (error) {
    return handleWeaverError(error, weaverContext);
  }
}

/**
 * Handle Weaver errors and convert to structured results
 */
export function handleWeaverError(error: any, _context: WeaverExecutorContext): WeaverResult {
  let errorMessage = 'Unknown error occurred';
  let isValidationError = false;

  if (error instanceof Error) {
    errorMessage = error.message;

    // Check for specific error types
    if (error.message.includes('validation') || error.message.includes('schema')) {
      isValidationError = true;
    }
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  // Provide actionable error messages
  let suggestion = '';
  if (isValidationError) {
    suggestion = 'Check your schema files for syntax errors or missing dependencies.';
  } else if (errorMessage.includes('timeout')) {
    suggestion = 'Try increasing the timeout or check your network connection.';
  } else if (errorMessage.includes('permission')) {
    suggestion = 'Check file permissions and ensure you have write access to the output directory.';
  }

  const fullMessage = suggestion ? `${errorMessage}\n\nSuggestion: ${suggestion}` : errorMessage;

  return {
    success: false,
    output: '',
    error: fullMessage,
  };
}

/**
 * Generate cache key for operation
 */
export function generateCacheKey(operation: string, context: WeaverExecutorContext): string {
  const cacheManager = getCacheManager(context.workspaceRoot);
  return cacheManager.getCacheKey(
    context.projectName,
    operation,
    context.schemaFiles,
    context.config
  );
}

/**
 * Check if cache is valid
 */
export async function isCacheValid(key: string, context: WeaverExecutorContext): Promise<boolean> {
  const cacheManager = getCacheManager(context.workspaceRoot);
  return await cacheManager.isCacheValid(key);
}

/**
 * Store cache result
 */
export async function storeCacheResult(
  key: string,
  result: WeaverResult,
  context: WeaverExecutorContext,
  operation: string
): Promise<void> {
  const cacheManager = getCacheManager(context.workspaceRoot);
  await cacheManager.storeCacheResult(
    key,
    result as any, // Type assertion to handle the union type
    context.projectName,
    operation,
    context.schemaFiles,
    context.config
  );
}

/**
 * Ensure directory exists
 */
export async function ensureDirectory(path: string): Promise<void> {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

/**
 * Track generated files for cleanup
 */
export async function trackGeneratedFiles(projectName: string, files: string[]): Promise<void> {
  // Simple file tracking - could be enhanced with cache manager
  console.log(`Tracking ${files.length} generated files for project ${projectName}`);
}

/**
 * Get list of generated files for cleanup
 */
export async function getGeneratedFiles(_projectName: string): Promise<string[]> {
  // Simple implementation - could be enhanced with cache manager
  return [];
}

/**
 * Clean generated files
 */
export async function cleanGeneratedFiles(files: string[]): Promise<string[]> {
  const { unlink } = await import('node:fs/promises');
  const cleanedFiles: string[] = [];

  for (const file of files) {
    try {
      await unlink(file);
      cleanedFiles.push(file);
    } catch (error) {
      console.warn(`Failed to clean file ${file}:`, error);
    }
  }

  return cleanedFiles;
}

// Helper functions

/**
 * Collect schema files from directory
 */
async function collectSchemaFiles(schemaPath: string): Promise<string[]> {
  if (!existsSync(schemaPath)) {
    return [];
  }

  const files: string[] = [];
  const items = readdirSync(schemaPath, { withFileTypes: true });

  for (const item of items) {
    const fullPath = join(schemaPath, item.name);

    if (item.isDirectory()) {
      const subFiles = await collectSchemaFiles(fullPath);
      files.push(...subFiles);
    } else if (item.isFile() && isSchemaFile(item.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Check if file is a schema file
 */
function isSchemaFile(filename: string): boolean {
  const schemaExtensions = ['.yaml', '.yml', '.json', '.proto'];
  return schemaExtensions.some((ext) => filename.endsWith(ext));
}

/**
 * Build command arguments for Weaver
 */
function buildCommandArgs(
  operation: string,
  context: WeaverExecutorContext,
  options: any
): string[] {
  const args: string[] = ['registry'];

  // Map operations to Weaver commands
  switch (operation) {
    case 'validate':
      args.push('check');
      break;
    case 'generate':
      args.push('generate');
      break;
    case 'docs':
      args.push('generate'); // Weaver generates docs as part of generation
      break;
    case 'clean':
      // Weaver doesn't have a clean command, we'll handle this separately
      return ['--help']; // Just return help to avoid errors
    default:
      args.push(operation);
  }

  // Add registry path (schema directory)
  if (context.schemaFiles.length > 0) {
    // Use the first schema file's directory as the registry
    const schemaDir = dirname(context.schemaFiles[0]);
    args.push('--registry', schemaDir);
  }

  // Add output path for generate operations
  if (['generate', 'docs'].includes(operation)) {
    args.push('--output', context.outputPath);
  }

  // Add operation-specific arguments
  const operationArgs = context.config.args?.[operation] || [];
  args.push(...operationArgs);

  // Add options as flags
  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null) {
      if (typeof value === 'boolean') {
        if (value) {
          args.push(`--${key}`);
        }
      } else {
        args.push(`--${key}`, String(value));
      }
    }
  }

  return args;
}

/**
 * Parse Weaver command result based on operation
 */
function parseWeaverResult(operation: string, output: string): any {
  switch (operation) {
    case 'validate':
      return parseValidationResult(output);
    case 'generate':
      return parseGenerationResult(output);
    case 'docs':
      return parseDocsResult(output);
    case 'clean':
      return parseCleanResult(output);
    default:
      return {};
  }
}

/**
 * Parse validation result
 */
function parseValidationResult(output: string): { validationResult?: WeaverValidationResult } {
  const lines = output.split('\n');
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const line of lines) {
    if (line.toLowerCase().includes('error')) {
      errors.push(line.trim());
    } else if (line.toLowerCase().includes('warning')) {
      warnings.push(line.trim());
    }
  }

  return {
    validationResult: {
      valid: errors.length === 0,
      errors,
      warnings,
    },
  };
}

/**
 * Parse generation result
 */
function parseGenerationResult(output: string): { filesGenerated?: string[] } {
  const lines = output.split('\n');
  const generatedFiles: string[] = [];

  for (const line of lines) {
    if (line.includes('Generated:') || line.includes('Created:')) {
      const fileMatch = line.match(/['"]([^'"]+)['"]/);
      if (fileMatch) {
        generatedFiles.push(fileMatch[1]);
      }
    }
  }

  return { filesGenerated: generatedFiles };
}

/**
 * Parse docs result
 */
function parseDocsResult(output: string): { docsResult?: WeaverDocsResult } {
  const lines = output.split('\n');
  const outputFiles: string[] = [];

  for (const line of lines) {
    if (line.includes('Documentation generated:')) {
      const fileMatch = line.match(/['"]([^'"]+)['"]/);
      if (fileMatch) {
        outputFiles.push(fileMatch[1]);
      }
    }
  }

  return {
    docsResult: {
      outputFiles,
      errors: [],
    },
  };
}

/**
 * Parse clean result
 */
function parseCleanResult(output: string): { cleanResult?: WeaverCleanResult } {
  const lines = output.split('\n');
  const cleanedFiles: string[] = [];

  for (const line of lines) {
    if (line.includes('Cleaned:') || line.includes('Removed:')) {
      const fileMatch = line.match(/['"]([^'"]+)['"]/);
      if (fileMatch) {
        cleanedFiles.push(fileMatch[1]);
      }
    }
  }

  return {
    cleanResult: {
      cleanedFiles,
      errors: [],
    },
  };
}
