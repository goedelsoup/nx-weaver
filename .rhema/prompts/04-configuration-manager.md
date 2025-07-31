# Configuration Manager Implementation

## Task Description
Implement the configuration management system that handles workspace and project-level Weaver configurations, including validation, merging, and type safety.

## Requirements

### Core Functionality
Implement `src/utils/config-manager.ts` with the following key functions:

#### 1. Workspace Configuration
```typescript
getWorkspaceConfig(workspaceRoot: string): WeaverWorkspaceConfig
```
- Load workspace-level Weaver configuration
- Support multiple configuration file formats
- Provide sensible defaults
- Handle missing configuration gracefully

#### 2. Project Configuration
```typescript
getProjectConfig(projectPath: string, workspaceConfig?: WeaverWorkspaceConfig): WeaverProjectConfig
```
- Load project-specific Weaver configuration
- Merge with workspace defaults
- Handle configuration inheritance
- Return complete merged configuration

#### 3. Configuration Validation
```typescript
validateConfig(config: WeaverProjectConfig): ValidationResult
```
- Validate configuration structure and values
- Check for required fields
- Validate file paths and directories
- Return detailed validation results

#### 4. Configuration Merging
```typescript
mergeConfigs(workspace: WeaverWorkspaceConfig, project: WeaverProjectConfig): WeaverProjectConfig
```
- Merge workspace defaults with project overrides
- Handle nested configuration objects
- Preserve project-specific settings
- Apply configuration inheritance rules

### Configuration Types
Implement comprehensive TypeScript interfaces:

#### Workspace Configuration
```typescript
interface WeaverWorkspaceConfig {
  defaultVersion?: string;
  defaultArgs?: WeaverArgs;
  defaultEnvironment?: Record<string, string>;
  schemaDirectory?: string; // default: "weaver/"
  outputDirectory?: string; // default: "dist/weaver/"
  enabledByDefault?: boolean; // default: true
  cacheDirectory?: string; // default: ".nx-weaver-cache/"
  downloadTimeout?: number; // default: 30000ms
  maxRetries?: number; // default: 3
}
```

#### Project Configuration
```typescript
interface WeaverProjectConfig {
  enabled?: boolean;
  version?: string;
  args?: WeaverArgs;
  environment?: Record<string, string>;
  schemaDirectory?: string;
  outputDirectory?: string;
  skipValidation?: boolean;
  skipGeneration?: boolean;
  skipDocs?: boolean;
}
```

#### Weaver Arguments
```typescript
interface WeaverArgs {
  validate?: string[];
  generate?: string[];
  docs?: string[];
  [command: string]: string[] | undefined;
}
```

### Configuration Sources
Support loading from multiple sources:
1. `nx.json` Weaver section
2. `weaver-workspace.json` or `weaver-workspace.yaml`
3. Environment variables (with prefix `WEAVER_`)
4. Project-specific `weaver.json` or `weaver.yaml`
5. `project.json` Weaver section

### Validation Rules
Implement comprehensive validation:
- **Version validation**: Check Weaver version format and availability
- **Path validation**: Ensure directories exist and are accessible
- **Argument validation**: Validate Weaver command arguments
- **Environment validation**: Check environment variable syntax
- **Type validation**: Ensure correct data types for all fields

### Error Handling
- Provide clear error messages for configuration issues
- Include suggestions for fixing common problems
- Handle malformed configuration files gracefully
- Log configuration loading and validation results

### Type Safety
- Provide full TypeScript support for all configurations
- Include JSDoc comments for all interfaces
- Generate type definitions for external consumption
- Support IDE autocompletion and IntelliSense

## Implementation Details

### Configuration Loading Strategy
1. Load workspace configuration from multiple sources
2. Apply environment variable overrides
3. Load project-specific configuration
4. Merge configurations with proper precedence
5. Validate final configuration
6. Return typed configuration object

### Default Values
Provide sensible defaults for all configuration options:
- Schema directory: `"weaver/"`
- Output directory: `"dist/weaver/"`
- Cache directory: `".nx-weaver-cache/"`
- Enabled by default: `true`
- Download timeout: `30000ms`
- Max retries: `3`

### Configuration Inheritance
Implement proper inheritance rules:
- Project config overrides workspace config
- Environment variables override file-based config
- Command-line arguments override all other sources
- Maintain type safety throughout inheritance chain

## Success Criteria
- Loads and validates configurations correctly
- Provides full TypeScript type safety
- Handles all configuration sources and formats
- Includes comprehensive validation and error handling
- Integrates with project detection and executor systems
- Performance is acceptable for large configurations
- Includes comprehensive unit tests
- Provides clear error messages and debugging information 