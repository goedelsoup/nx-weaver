import type { WeaverWorkspaceConfig, WeaverProjectConfig } from './config';
import type { WeaverResult } from './executor';
import { WeaverError } from './errors';

/**
 * Type guard to check if an object is a Weaver workspace configuration.
 *
 * @example
 * ```typescript
 * const config = { schemaDirectory: "weaver/" };
 * if (isWeaverConfig(config)) {
 *   // config is typed as WeaverWorkspaceConfig
 *   console.log(config.schemaDirectory);
 * }
 * ```
 */
export function isWeaverConfig(obj: any): obj is WeaverWorkspaceConfig {
  return obj && typeof obj === 'object' && 'schemaDirectory' in obj;
}

/**
 * Type guard to check if an object is a Weaver project configuration.
 *
 * @example
 * ```typescript
 * const config = { enabled: true, version: "1.0.0" };
 * if (isWeaverProjectConfig(config)) {
 *   // config is typed as WeaverProjectConfig
 *   console.log(config.enabled);
 * }
 * ```
 */
export function isWeaverProjectConfig(obj: any): obj is WeaverProjectConfig {
  return obj && typeof obj === 'object' && 'enabled' in obj;
}

/**
 * Type guard to check if an object is a Weaver result.
 *
 * @example
 * ```typescript
 * const result = { success: true, output: "Generated files" };
 * if (isWeaverResult(result)) {
 *   // result is typed as WeaverResult
 *   console.log(result.success);
 * }
 * ```
 */
export function isWeaverResult(obj: any): obj is WeaverResult {
  return obj && typeof obj === 'object' && 'success' in obj && 'output' in obj;
}

/**
 * Type guard to check if an error is a Weaver error.
 *
 * @example
 * ```typescript
 * try {
 *   // some operation
 * } catch (error) {
 *   if (isWeaverError(error)) {
 *     // error is typed as WeaverError
 *     console.log(error.code, error.suggestions);
 *   }
 * }
 * ```
 */
export function isWeaverError(error: any): error is WeaverError {
  return error instanceof WeaverError;
}

/**
 * Type guard to check if an object is a Weaver arguments object.
 *
 * @example
 * ```typescript
 * const args = { validate: ["schema.graphql"], generate: ["types"] };
 * if (isWeaverArgs(args)) {
 *   // args is typed as WeaverArgs
 *   console.log(args.validate);
 * }
 * ```
 */
export function isWeaverArgs(obj: any): obj is Record<string, string[]> {
  return obj && typeof obj === 'object' && Object.values(obj).every(Array.isArray);
}

/**
 * Type guard to check if an object is a Weaver project.
 *
 * @example
 * ```typescript
 * const project = { name: "my-api", path: "/workspace/apps/my-api" };
 * if (isWeaverProject(project)) {
 *   // project is typed as WeaverProject
 *   console.log(project.name);
 * }
 * ```
 */
export function isWeaverProject(obj: any): obj is { name: string; path: string; config: any } {
  return obj && typeof obj === 'object' && 'name' in obj && 'path' in obj && 'config' in obj;
}

/**
 * Type guard to check if an object is a validation result.
 *
 * @example
 * ```typescript
 * const result = { isValid: true, errors: [], warnings: [] };
 * if (isValidationResult(result)) {
 *   // result is typed as ValidationResult
 *   console.log(result.isValid);
 * }
 * ```
 */
export function isValidationResult(
  obj: any
): obj is { isValid: boolean; errors: string[]; warnings: string[] } {
  return obj && typeof obj === 'object' && 'isValid' in obj && 'errors' in obj && 'warnings' in obj;
}

/**
 * Type guard to check if an object is a cache entry.
 *
 * @example
 * ```typescript
 * const entry = { key: "abc123", result: { success: true }, metadata: {} };
 * if (isCacheEntry(entry)) {
 *   // entry is typed as CacheEntry
 *   console.log(entry.key);
 * }
 * ```
 */
export function isCacheEntry(obj: any): obj is { key: string; result: any; metadata: any } {
  return obj && typeof obj === 'object' && 'key' in obj && 'result' in obj && 'metadata' in obj;
}

/**
 * Type guard to check if an object is a Weaver event.
 *
 * @example
 * ```typescript
 * const event = { type: "execution", timestamp: new Date() };
 * if (isWeaverEvent(event)) {
 *   // event is typed as WeaverEvent
 *   console.log(event.type);
 * }
 * ```
 */
export function isWeaverEvent(obj: any): obj is { type: string; timestamp: Date } {
  return obj && typeof obj === 'object' && 'type' in obj && 'timestamp' in obj;
}

/**
 * Type guard to check if a value is a valid Weaver version string.
 *
 * @example
 * ```typescript
 * const version = "1.0.0";
 * if (isWeaverVersion(version)) {
 *   // version is a valid Weaver version
 *   console.log("Valid version:", version);
 * }
 * ```
 */
export function isWeaverVersion(value: any): value is string {
  return typeof value === 'string' && /^\d+\.\d+\.\d+/.test(value);
}

/**
 * Type guard to check if a value is a valid file path.
 *
 * @example
 * ```typescript
 * const path = "/workspace/apps/my-api/schema.graphql";
 * if (isFilePath(path)) {
 *   // path is a valid file path
 *   console.log("Valid path:", path);
 * }
 * ```
 */
export function isFilePath(value: any): value is string {
  return typeof value === 'string' && value.length > 0 && !value.includes('\0');
}

/**
 * Type guard to check if a value is a valid directory path.
 *
 * @example
 * ```typescript
 * const path = "/workspace/apps/my-api";
 * if (isDirectoryPath(path)) {
 *   // path is a valid directory path
 *   console.log("Valid directory:", path);
 * }
 * ```
 */
export function isDirectoryPath(value: any): value is string {
  return (
    typeof value === 'string' && value.length > 0 && !value.includes('\0') && !value.endsWith('/')
  );
}
