import { join } from 'node:path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * Resolves a path relative to the workspace root
 */
export function resolveWorkspacePath(relativePath: string): string {
  return join(process.cwd(), relativePath);
}

/**
 * Checks if a file exists
 */
export function fileExists(filePath: string): boolean {
  try {
    return existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Reads a file and returns its contents
 */
export function readFile(filePath: string): string {
  return readFileSync(filePath, 'utf-8');
}

/**
 * Writes content to a file
 */
export function writeFile(filePath: string, content: string): void {
  // Ensure directory exists
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(filePath, content, 'utf-8');
}

/**
 * Validates a YAML configuration file
 */
export function validateYamlConfig(configPath: string): boolean {
  try {
    const yaml = require('js-yaml');
    const content = readFile(configPath);
    yaml.load(content);
    return true;
  } catch (error) {
    console.error('YAML validation error:', error);
    return false;
  }
}

/**
 * Logs a message with timestamp
 */
export function logWithTimestamp(message: string): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Export Weaver manager
export * from './weaver-manager.js';

// Export config manager
export * from './config-manager.js';

// Export cache manager
export * from './cache-manager.js';

// Export target generator
export * from './target-generator.js';
