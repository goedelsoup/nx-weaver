// Export all configuration types
export * from './config';

// Export all executor types
export * from './executor';

// Export all cache types
export * from './cache';

// Export all project types
export * from './project';

// Export all Weaver-specific types
export * from './weaver';

// Export all error types
export * from './errors';

// Export all event types
export * from './events';

// Export all validation types
export * from './validation';

// Export all type guards
export * from './guards';

// Export all utility functions
export * from './utils';

// Legacy exports for backward compatibility
export interface BaseExecutorOptions {
  verbose?: boolean;
  dryRun?: boolean;
}

export interface ValidateExecutorOptions extends BaseExecutorOptions {
  strict?: boolean;
  ignoreWarnings?: boolean;
}

export interface GenerateExecutorOptions extends BaseExecutorOptions {
  force?: boolean;
  watch?: boolean;
  outputFormat?: 'typescript' | 'javascript' | 'json';
}

export interface DocsExecutorOptions extends BaseExecutorOptions {
  format?: 'markdown' | 'html' | 'json';
  outputPath?: string;
  includeExamples?: boolean;
}

export interface CleanExecutorOptions extends BaseExecutorOptions {
  includeCache?: boolean;
  includeTemp?: boolean;
}

export interface InitGeneratorOptions {
  defaultVersion?: string;
  schemaDirectory?: string;
  outputDirectory?: string;
  enabledByDefault?: boolean;
  skipInstall?: boolean;
  verbose?: boolean;
}

export interface SetupProjectGeneratorOptions {
  project: string;
  version?: string;
  schemaDirectory?: string;
  outputDirectory?: string;
  enabled?: boolean;
  skipTargets?: boolean;
  verbose?: boolean;
}

// Legacy result types for backward compatibility
export interface WeaverValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface WeaverGenerationResult {
  generatedFiles: string[];
  errors: string[];
}

export interface WeaverDocsResult {
  outputFiles: string[];
  errors: string[];
}

export interface WeaverCleanResult {
  cleanedFiles: string[];
  errors: string[];
}

// Additional utility types for internal use
export interface WeaverConfigOptions {
  configPath?: string;
  workspaceRoot?: string;
  workspace?: any;
  projects?: string[];
  defaultVersion?: string;
  schemaDirectory?: string;
  outputDirectory?: string;
  enabledByDefault?: boolean;
  enabled?: boolean;
  version?: string;
}

export interface GeneratorContext {
  tree: any;
  workspaceRoot: string;
  projectName?: string;
}
