import { existsSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import * as yaml from 'js-yaml';
import type { WeaverWorkspaceConfig, WeaverProjectConfig, WeaverArgs } from '../types/index.js';

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Configuration loading options
 */
export interface ConfigLoadOptions {
  skipValidation?: boolean;
  skipEnvironmentVars?: boolean;
  strict?: boolean;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<WeaverWorkspaceConfig> = {
  defaultVersion: 'latest',
  defaultArgs: {},
  defaultEnvironment: {},
  schemaDirectory: 'weaver/',
  outputDirectory: 'dist/weaver/',
  enabledByDefault: true,
  cacheDirectory: '.nx-weaver-cache/',
  downloadTimeout: 30000,
  maxRetries: 3,
  verifyHashes: true,
  downloadUrl:
    'https://github.com/open-telemetry/weaver/releases/download/v{version}/weaver-{platform}-{arch}',
  hashUrl:
    'https://github.com/open-telemetry/weaver/releases/download/v{version}/weaver-{platform}-{arch}.sha256',
};

/**
 * Environment variable prefix for Weaver configuration
 */
const ENV_PREFIX = 'WEAVER_';

/**
 * Configuration file names to check
 */
const WORKSPACE_CONFIG_FILES = [
  'weaver-workspace.json',
  'weaver-workspace.yaml',
  'weaver-workspace.yml',
];

const PROJECT_CONFIG_FILES = ['weaver.json', 'weaver.yaml', 'weaver.yml'];

/**
 * Loads workspace-level Weaver configuration from multiple sources
 */
export function getWorkspaceConfig(
  workspaceRoot: string,
  options: ConfigLoadOptions = {}
): WeaverWorkspaceConfig {
  const config: WeaverWorkspaceConfig = { ...DEFAULT_CONFIG };

  // Load from nx.json Weaver section
  const nxConfig = loadNxConfig(workspaceRoot);
  if (nxConfig.weaver) {
    mergeConfig(config, nxConfig.weaver);
  }

  // Load from dedicated configuration files
  for (const fileName of WORKSPACE_CONFIG_FILES) {
    const filePath = join(workspaceRoot, fileName);
    if (existsSync(filePath)) {
      const fileConfig = loadConfigFile(filePath);
      mergeConfig(config, fileConfig);
      break; // Use first found file
    }
  }

  // Apply environment variable overrides
  if (!options.skipEnvironmentVars) {
    applyEnvironmentOverrides(config);
  }

  // Validate configuration if not skipped
  if (!options.skipValidation) {
    const validation = validateWorkspaceConfig(config);
    if (!validation.valid && options.strict) {
      throw new Error(`Invalid workspace configuration: ${validation.errors.join(', ')}`);
    }
  }

  return config;
}

/**
 * Loads project-specific Weaver configuration and merges with workspace defaults
 */
export function getProjectConfig(
  projectPath: string,
  workspaceConfig?: WeaverWorkspaceConfig,
  options: ConfigLoadOptions = {}
): WeaverProjectConfig {
  const workspaceRoot = findWorkspaceRoot(projectPath);

  // Get workspace config without applying environment overrides to avoid double application
  const workspace =
    workspaceConfig ||
    getWorkspaceConfig(workspaceRoot, {
      ...options,
      skipEnvironmentVars: true,
    });

  // Start with empty project config
  const projectConfig: WeaverProjectConfig = {};

  // Load project-specific configuration files
  for (const fileName of PROJECT_CONFIG_FILES) {
    const filePath = join(projectPath, fileName);
    if (existsSync(filePath)) {
      const fileConfig = loadConfigFile(filePath);
      mergeConfig(projectConfig, fileConfig);
      break; // Use first found file
    }
  }

  // Load from project.json Weaver section
  const projectJsonPath = join(projectPath, 'project.json');
  if (existsSync(projectJsonPath)) {
    const projectJson = loadConfigFile(projectJsonPath);
    if (projectJson.weaver) {
      mergeConfig(projectConfig, projectJson.weaver);
    }
  }

  // Apply environment variable overrides
  if (!options.skipEnvironmentVars) {
    applyEnvironmentOverrides(projectConfig);
  }

  // Merge with workspace configuration
  const mergedConfig = mergeConfigs(workspace, projectConfig);

  // Validate final configuration if not skipped
  if (!options.skipValidation) {
    const validation = validateConfig(mergedConfig);
    if (!validation.valid && options.strict) {
      throw new Error(`Invalid project configuration: ${validation.errors.join(', ')}`);
    }
  }

  return mergedConfig;
}

/**
 * Validates a project configuration
 */
export function validateConfig(config: WeaverProjectConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate version format
  if (config.version && !isValidVersion(config.version)) {
    errors.push(`Invalid version format: ${config.version}`);
  }

  // Validate paths
  if (config.schemaDirectory) {
    const schemaPath = resolve(config.schemaDirectory);
    if (!existsSync(schemaPath)) {
      warnings.push(`Schema directory does not exist: ${schemaPath}`);
    }
  }

  if (config.outputDirectory) {
    const outputPath = resolve(config.outputDirectory);
    const outputDir = dirname(outputPath);
    if (!existsSync(outputDir)) {
      warnings.push(`Output directory parent does not exist: ${outputDir}`);
    }
  }

  // Validate Weaver arguments
  if (config.args) {
    const argsValidation = validateWeaverArgs(config.args);
    errors.push(...argsValidation.errors);
    warnings.push(...argsValidation.warnings);
  }

  // Validate environment variables
  if (config.environment) {
    const envValidation = validateEnvironment(config.environment);
    errors.push(...envValidation.errors);
    warnings.push(...envValidation.warnings);
  }

  // Validate numeric values
  if (config.downloadTimeout !== undefined && config.downloadTimeout <= 0) {
    errors.push('downloadTimeout must be a positive number');
  }

  if (config.maxRetries !== undefined && config.maxRetries < 0) {
    errors.push('maxRetries must be a non-negative number');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates workspace configuration
 */
export function validateWorkspaceConfig(config: WeaverWorkspaceConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate version format
  if (config.defaultVersion && !isValidVersion(config.defaultVersion)) {
    errors.push(`Invalid default version format: ${config.defaultVersion}`);
  }

  // Validate paths
  if (config.schemaDirectory) {
    const schemaPath = resolve(config.schemaDirectory);
    if (!existsSync(schemaPath)) {
      warnings.push(`Default schema directory does not exist: ${schemaPath}`);
    }
  }

  if (config.outputDirectory) {
    const outputPath = resolve(config.outputDirectory);
    const outputDir = dirname(outputPath);
    if (!existsSync(outputDir)) {
      warnings.push(`Default output directory parent does not exist: ${outputDir}`);
    }
  }

  // Validate Weaver arguments
  if (config.defaultArgs) {
    const argsValidation = validateWeaverArgs(config.defaultArgs);
    errors.push(...argsValidation.errors);
    warnings.push(...argsValidation.warnings);
  }

  // Validate environment variables
  if (config.defaultEnvironment) {
    const envValidation = validateEnvironment(config.defaultEnvironment);
    errors.push(...envValidation.errors);
    warnings.push(...envValidation.warnings);
  }

  // Validate numeric values
  if (config.downloadTimeout !== undefined && config.downloadTimeout <= 0) {
    errors.push('downloadTimeout must be a positive number');
  }

  if (config.maxRetries !== undefined && config.maxRetries < 0) {
    errors.push('maxRetries must be a non-negative number');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Merges workspace defaults with project overrides
 */
export function mergeConfigs(
  workspace: WeaverWorkspaceConfig,
  project: WeaverProjectConfig
): WeaverProjectConfig {
  const merged: WeaverProjectConfig = {
    // Project config takes precedence
    enabled: project.enabled ?? workspace.enabledByDefault,
    version: project.version ?? workspace.defaultVersion,
    schemaDirectory: project.schemaDirectory ?? workspace.schemaDirectory,
    outputDirectory: project.outputDirectory ?? workspace.outputDirectory,
    cacheDirectory: project.cacheDirectory ?? workspace.cacheDirectory,
    downloadTimeout: project.downloadTimeout ?? workspace.downloadTimeout,
    maxRetries: project.maxRetries ?? workspace.maxRetries,

    // Merge Weaver arguments
    args: mergeWeaverArgs(workspace.defaultArgs, project.args),

    // Merge environment variables
    environment: { ...workspace.defaultEnvironment, ...project.environment },

    // Project-specific flags
    skipValidation: project.skipValidation,
    skipGeneration: project.skipGeneration,
    skipDocs: project.skipDocs,
  };

  return merged;
}

/**
 * Loads configuration from a file (JSON or YAML)
 */
function loadConfigFile(filePath: string): any {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const ext = filePath.split('.').pop()?.toLowerCase();

    if (ext === 'json') {
      return JSON.parse(content);
    }
    if (['yaml', 'yml'].includes(ext ?? '')) {
      return yaml.load(content) as any;
    }
    throw new Error(`Unsupported file format: ${ext ?? 'unknown'}`);
  } catch (error) {
    throw new Error(`Failed to load configuration file ${filePath}: ${error}`);
  }
}

/**
 * Loads nx.json configuration
 */
function loadNxConfig(workspaceRoot: string): any {
  const nxJsonPath = join(workspaceRoot, 'nx.json');
  if (existsSync(nxJsonPath)) {
    try {
      return loadConfigFile(nxJsonPath);
    } catch (error) {
      console.warn(`Failed to load nx.json: ${error}`);
      return {};
    }
  }
  return {};
}

/**
 * Merges two configuration objects
 */
function mergeConfig(target: any, source: any): void {
  for (const [key, value] of Object.entries(source)) {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        target[key] = target[key] || {};
        mergeConfig(target[key], value);
      } else {
        target[key] = value;
      }
    }
  }
}

/**
 * Applies environment variable overrides to configuration
 */
function applyEnvironmentOverrides(config: any): void {
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith(ENV_PREFIX)) {
      const configKey = key.slice(ENV_PREFIX.length);
      const configValue = parseEnvironmentValue(value);

      if (configValue !== undefined) {
        // Convert from SCREAMING_SNAKE_CASE to camelCase
        const camelCaseKey = configKey
          .toLowerCase()
          .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        setNestedValue(config, camelCaseKey, configValue);
      }
    }
  }
}

/**
 * Parses environment variable value to appropriate type
 */
function parseEnvironmentValue(value: string | undefined): any {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (value === 'undefined') return undefined;

  // Try to parse as number
  const num = Number(value);
  if (!Number.isNaN(num)) return num;

  // Return as string
  return value;
}

/**
 * Sets a nested value in an object using dot notation
 */
function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
}

/**
 * Merges Weaver arguments with proper precedence
 */
function mergeWeaverArgs(defaultArgs: WeaverArgs = {}, projectArgs: WeaverArgs = {}): WeaverArgs {
  const merged: WeaverArgs = { ...defaultArgs };

  for (const [command, args] of Object.entries(projectArgs)) {
    if (args && args.length > 0) {
      merged[command] = args;
    }
  }

  return merged;
}

/**
 * Validates Weaver arguments
 */
function validateWeaverArgs(args: WeaverArgs): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [command, commandArgs] of Object.entries(args)) {
    if (commandArgs && !Array.isArray(commandArgs)) {
      errors.push(`Arguments for command '${command}' must be an array`);
    }

    if (
      commandArgs &&
      Array.isArray(commandArgs) &&
      commandArgs.some((arg) => typeof arg !== 'string')
    ) {
      errors.push(`All arguments for command '${command}' must be strings`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validates environment variables
 */
function validateEnvironment(env: Record<string, string>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    if (typeof key !== 'string' || key.trim() === '') {
      errors.push('Environment variable keys must be non-empty strings');
    }

    if (typeof value !== 'string') {
      errors.push(`Environment variable value for '${key}' must be a string`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validates version format
 */
function isValidVersion(version: string): boolean {
  // Accept 'latest', specific versions like 'v0.1.0', or semver
  if (version === 'latest') return true;
  if (version.startsWith('v')) return true;

  // Basic semver validation
  const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
  return semverRegex.test(version);
}

/**
 * Finds the workspace root by looking for nx.json or package.json
 */
function findWorkspaceRoot(startPath: string): string {
  let currentPath = resolve(startPath);

  while (currentPath !== dirname(currentPath)) {
    if (existsSync(join(currentPath, 'nx.json')) || existsSync(join(currentPath, 'package.json'))) {
      return currentPath;
    }
    currentPath = dirname(currentPath);
  }

  // Fallback to current working directory
  return process.cwd();
}

/**
 * Gets the default configuration values
 */
export function getDefaultConfig(): Required<WeaverWorkspaceConfig> {
  return { ...DEFAULT_CONFIG };
}

/**
 * Creates a minimal valid configuration
 */
export function createMinimalConfig(): WeaverProjectConfig {
  return {
    enabled: true,
    version: 'latest',
    args: {},
    environment: {},
    schemaDirectory: 'weaver/',
    outputDirectory: 'dist/weaver/',
  };
}
