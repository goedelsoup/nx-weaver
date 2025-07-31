import { join, resolve, extname, basename } from 'node:path';
import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs';
import type {
  WeaverProject,
  WeaverProjectConfig,
  WeaverWorkspaceConfig,
  ProjectDetectionResult,
} from '../types/index.js';
import { fileExists, readFile, validateYamlConfig } from './index.js';

/**
 * Default Weaver configuration values
 */
const DEFAULT_CONFIG: WeaverProjectConfig = {
  enabled: true,
  schemaDirectory: 'weaver',
  outputDirectory: 'dist/weaver',
  skipValidation: false,
  skipGeneration: false,
  skipDocs: false,
  cacheDirectory: '.nx-weaver-cache',
  downloadTimeout: 30000,
  maxRetries: 3,
};

/**
 * Default workspace configuration values
 */
const DEFAULT_WORKSPACE_CONFIG: WeaverWorkspaceConfig = {
  enabledByDefault: true,
  schemaDirectory: 'weaver',
  outputDirectory: 'dist/weaver',
  cacheDirectory: '.nx-weaver-cache',
  downloadTimeout: 30000,
  maxRetries: 3,
  verifyHashes: true,
};

/**
 * Detects all Weaver projects in the workspace
 */
export function detectWeaverProjects(
  workspaceRoot: string,
  workspaceConfig?: WeaverWorkspaceConfig
): WeaverProject[] {
  const projects: WeaverProject[] = [];
  const errors: string[] = [];

  try {
    // Get all projects from Nx workspace
    const nxJsonPath = join(workspaceRoot, 'nx.json');
    if (!fileExists(nxJsonPath)) {
      throw new Error('nx.json not found in workspace root');
    }

    const nxJson = JSON.parse(readFile(nxJsonPath));
    const projectNames = Object.keys(nxJson.projects || {});

    for (const projectName of projectNames) {
      try {
        const projectPath = resolve(
          workspaceRoot,
          nxJson.projects[projectName].root || projectName
        );

        // Check if project has Weaver schemas
        const schemaFiles = getSchemaFiles(projectPath);

        if (schemaFiles.length > 0) {
          // Detect project configuration
          const config = detectProjectConfig(projectPath, workspaceConfig);

          // Check if Weaver is enabled for this project
          const enabled = isWeaverEnabled(config || undefined);

          // Get project metadata
          const lastModified = getLastModifiedTime(projectPath);

          const project: WeaverProject = {
            name: projectName,
            path: projectPath,
            schemaFiles,
            config: config || DEFAULT_CONFIG,
            enabled,
            version: config?.version,
            lastModified,
          };

          projects.push(project);
        }
      } catch (error) {
        const errorMsg = `Error detecting project ${projectName}: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
      }
    }
  } catch (error) {
    const errorMsg = `Error scanning workspace: ${error instanceof Error ? error.message : String(error)}`;
    errors.push(errorMsg);
  }

  if (errors.length > 0) {
    console.warn('Project detection completed with errors:', errors);
  }

  return projects;
}

/**
 * Recursively finds all YAML files in a directory
 */
function findYamlFilesRecursively(dirPath: string): string[] {
  const files: string[] = [];

  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and .git directories
        if (entry.name === 'node_modules' || entry.name === '.git') {
          continue;
        }
        files.push(...findYamlFilesRecursively(fullPath));
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        if (ext === '.yaml' || ext === '.yml') {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.warn(`Error reading directory ${dirPath}:`, error);
  }

  return files;
}

/**
 * Gets all Weaver schema files in a project
 */
export function getSchemaFiles(projectPath: string, config?: WeaverProjectConfig): string[] {
  const schemaDir = config?.schemaDirectory || DEFAULT_CONFIG.schemaDirectory;
  if (!schemaDir) return [];

  const schemaPath = join(projectPath, schemaDir);

  if (!existsSync(schemaPath)) {
    return [];
  }

  try {
    // Find all YAML files in the schema directory recursively
    const yamlFiles = findYamlFilesRecursively(schemaPath);

    // Filter for valid Weaver schema files
    return yamlFiles.filter((file: string) => isValidWeaverSchema(file));
  } catch (error) {
    console.warn(`Error scanning schema directory ${schemaPath}:`, error);
    return [];
  }
}

/**
 * Checks if a file is a valid Weaver schema
 */
function isValidWeaverSchema(filePath: string): boolean {
  try {
    // Check file extension
    const ext = extname(filePath).toLowerCase();
    if (!['.yaml', '.yml'].includes(ext)) {
      return false;
    }

    // Check if file is readable and has content
    if (!fileExists(filePath)) {
      return false;
    }

    const content = readFile(filePath);
    if (!content.trim()) {
      return false;
    }

    // Basic YAML validation
    if (!validateYamlConfig(filePath)) {
      return false;
    }

    // Check for common Weaver schema patterns
    const fileName = basename(filePath, ext);
    const hasWeaverPatterns =
      content.includes('weaver') ||
      content.includes('opentelemetry') ||
      content.includes('otel') ||
      fileName.includes('weaver') ||
      fileName.includes('schema');

    return hasWeaverPatterns;
  } catch {
    return false;
  }
}

/**
 * Checks if Weaver is enabled for a project
 */
export function isWeaverEnabled(config?: WeaverProjectConfig): boolean {
  // If config explicitly disables Weaver, return false
  if (config?.enabled === false) {
    return false;
  }

  // If config explicitly enables Weaver, return true
  if (config?.enabled === true) {
    return true;
  }

  // Default to enabled if not specified
  return true;
}

/**
 * Detects Weaver configuration for a project
 */
export function detectProjectConfig(
  projectPath: string,
  workspaceConfig?: WeaverWorkspaceConfig
): WeaverProjectConfig | null {
  const configSources = [
    () => readWeaverJsonConfig(projectPath),
    () => readProjectJsonWeaverConfig(projectPath),
    () => readWeaverYamlConfig(projectPath),
  ];

  let projectConfig: WeaverProjectConfig | null = null;

  // Try each configuration source
  for (const source of configSources) {
    try {
      const config = source();
      if (config) {
        projectConfig = config;
        break;
      }
    } catch {
      // Continue to next source
    }
  }

  // If no project config found, return null
  if (!projectConfig) {
    return null;
  }

  // Merge with workspace defaults
  return mergeConfigs(workspaceConfig || DEFAULT_WORKSPACE_CONFIG, projectConfig);
}

/**
 * Reads Weaver configuration from weaver.json
 */
function readWeaverJsonConfig(projectPath: string): WeaverProjectConfig | null {
  const configPath = join(projectPath, 'weaver.json');
  if (!fileExists(configPath)) {
    return null;
  }

  try {
    const content = readFile(configPath);
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Reads Weaver configuration from weaver.yaml/yml
 */
function readWeaverYamlConfig(projectPath: string): WeaverProjectConfig | null {
  const configPaths = [join(projectPath, 'weaver.yaml'), join(projectPath, 'weaver.yml')];

  for (const configPath of configPaths) {
    if (fileExists(configPath)) {
      try {
        const yaml = require('js-yaml');
        const content = readFile(configPath);
        return yaml.load(content);
      } catch {
        // Continue to next config file
      }
    }
  }

  return null;
}

/**
 * Reads Weaver configuration from project.json
 */
function readProjectJsonWeaverConfig(projectPath: string): WeaverProjectConfig | null {
  const configPath = join(projectPath, 'project.json');
  if (!fileExists(configPath)) {
    return null;
  }

  try {
    const content = readFile(configPath);
    const projectJson = JSON.parse(content);

    // Check for Weaver section in project.json
    if (projectJson.weaver) {
      return projectJson.weaver;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Merges workspace and project configurations
 */
function mergeConfigs(
  workspace: WeaverWorkspaceConfig,
  project: WeaverProjectConfig
): WeaverProjectConfig {
  return {
    // Use project config if specified, otherwise workspace defaults
    enabled: project.enabled ?? workspace.enabledByDefault,
    version: project.version ?? workspace.defaultVersion,
    args: { ...workspace.defaultArgs, ...project.args },
    environment: { ...workspace.defaultEnvironment, ...project.environment },
    schemaDirectory: project.schemaDirectory ?? workspace.schemaDirectory,
    outputDirectory: project.outputDirectory ?? workspace.outputDirectory,
    skipValidation: project.skipValidation,
    skipGeneration: project.skipGeneration,
    skipDocs: project.skipDocs,
    cacheDirectory: project.cacheDirectory ?? workspace.cacheDirectory,
    downloadTimeout: project.downloadTimeout ?? workspace.downloadTimeout,
    maxRetries: project.maxRetries ?? workspace.maxRetries,
  };
}

/**
 * Gets the last modified time of a project
 */
function getLastModifiedTime(projectPath: string): Date {
  try {
    const stats = statSync(projectPath);
    return stats.mtime;
  } catch {
    return new Date();
  }
}

/**
 * Detects Weaver projects and returns detailed results
 */
export function detectWeaverProjectsWithDetails(
  workspaceRoot: string,
  workspaceConfig?: WeaverWorkspaceConfig
): ProjectDetectionResult {
  const projects = detectWeaverProjects(workspaceRoot, workspaceConfig);

  const enabledProjects = projects.filter((p) => p.enabled);
  const disabledProjects = projects.filter((p) => !p.enabled);

  return {
    projects,
    totalProjects: projects.length,
    enabledProjects: enabledProjects.length,
    disabledProjects: disabledProjects.length,
    errors: [],
    warnings: [],
  };
}

/**
 * Checks if a project has any Weaver schemas
 */
export function hasWeaverSchemas(projectPath: string): boolean {
  const schemaFiles = getSchemaFiles(projectPath);
  return schemaFiles.length > 0;
}

/**
 * Gets the schema directory path for a project
 */
export function getSchemaDirectory(projectPath: string, config?: WeaverProjectConfig): string {
  const schemaDir = config?.schemaDirectory || DEFAULT_CONFIG.schemaDirectory || 'weaver';
  return join(projectPath, schemaDir);
}
