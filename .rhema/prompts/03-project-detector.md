# Project Detection System Implementation

## Task Description
Implement the project detection system that automatically identifies projects with Weaver schemas and determines their configuration status.

## Requirements

### Core Functionality
Implement `src/utils/project-detector.ts` with the following key functions:

#### 1. Project Detection
```typescript
detectWeaverProjects(workspaceRoot: string): WeaverProject[]
```
- Scan all projects in the workspace
- Identify projects containing Weaver schema files
- Return array of detected projects with metadata
- Handle nested project structures

#### 2. Schema File Detection
```typescript
getSchemaFiles(projectPath: string, config?: WeaverProjectConfig): string[]
```
- Find YAML files in the configured schema directory
- Support configurable schema directory (default: "weaver/")
- Filter for valid Weaver schema files
- Return absolute paths to schema files

#### 3. Project Status Check
```typescript
isWeaverEnabled(project: string, config?: WeaverProjectConfig): boolean
```
- Check if Weaver is enabled for the project
- Consider workspace defaults and project overrides
- Handle opt-out scenarios
- Return true if Weaver should be active

#### 4. Configuration Detection
```typescript
detectProjectConfig(projectPath: string): WeaverProjectConfig | null
```
- Look for Weaver configuration in project
- Parse configuration from various sources (project.json, weaver.json, etc.)
- Merge with workspace defaults
- Return merged configuration or null if not configured

### Configuration Sources
Support multiple configuration sources in order of precedence:
1. Project-specific `weaver.json` or `weaver.yaml`
2. `project.json` Weaver section
3. Workspace-level defaults
4. Plugin defaults

### File Pattern Recognition
Recognize Weaver schema files by:
- File extension: `.yaml`, `.yml`
- Directory location: `weaver/` (configurable)
- Content validation: Basic YAML structure check
- File naming conventions: Common Weaver schema patterns

### Performance Considerations
- Implement efficient file system scanning
- Cache detection results when possible
- Use incremental detection for watch mode
- Minimize file system operations

### Error Handling
- Handle inaccessible directories gracefully
- Provide clear error messages for configuration issues
- Log detection results for debugging
- Handle malformed configuration files

## Implementation Details

### Detection Algorithm
1. Get all projects from Nx workspace
2. For each project, check for schema directory
3. Scan for YAML files in schema directory
4. Validate files as potential Weaver schemas
5. Check project configuration for Weaver settings
6. Return structured project information

### Project Information Structure
```typescript
interface WeaverProject {
  name: string;
  path: string;
  schemaFiles: string[];
  config: WeaverProjectConfig;
  enabled: boolean;
  version?: string;
  lastModified: Date;
}
```

### Configuration Merging
- Workspace defaults provide base configuration
- Project-specific config overrides workspace defaults
- Final config includes all necessary Weaver settings
- Validate merged configuration for consistency

## Success Criteria
- Correctly identifies projects with Weaver schemas
- Handles various project structures and configurations
- Provides accurate project status information
- Integrates with configuration management system
- Performance is acceptable for large workspaces
- Includes comprehensive unit tests
- Handles edge cases and error scenarios gracefully 