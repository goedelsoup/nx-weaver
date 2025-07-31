# Target Generator Utility

The Target Generator utility provides comprehensive functionality for generating and managing Nx targets for Weaver operations. It automatically creates Weaver targets, integrates them with existing build targets, and manages cross-project dependencies.

## Overview

The Target Generator is responsible for:

- **Target Generation**: Creating Weaver targets (validate, generate, docs, clean) for projects
- **Build Integration**: Seamlessly integrating Weaver generation with existing build targets
- **Dependency Management**: Managing cross-project dependencies and build dependencies
- **Configuration Management**: Updating project and workspace configurations
- **Target Lifecycle**: Adding, updating, and removing Weaver targets

## Core Functions

### Target Generation

#### `generateWeaverTargets(project, config)`

Generates Weaver targets for a project based on configuration.

```typescript
import { generateWeaverTargets } from './target-generator.js';

const config: WeaverProjectConfig = {
  enabled: true,
  version: '1.0.0',
  skipValidation: false,
  skipGeneration: false,
  skipDocs: false
};

const targets = generateWeaverTargets('my-api', config);
```

**Generated Targets:**

- **`weaver-validate`**: Validates Weaver schemas and configurations
- **`weaver-generate`**: Generates code from Weaver schemas
- **`weaver-docs`**: Generates documentation from Weaver schemas
- **`weaver-clean`**: Cleans generated files and cache

### Build Integration

#### `integrateWithBuildTarget(project, buildTarget, config)`

Integrates Weaver generation with existing build targets.

```typescript
import { integrateWithBuildTarget } from './target-generator.js';

const buildTarget: TargetConfiguration = {
  executor: '@nx/js:tsc',
  options: { tsConfig: 'tsconfig.json' }
};

const integrated = integrateWithBuildTarget('my-api', buildTarget, config);
// Result: buildTarget with weaver-generate dependency added
```

**Supported Build Executors:**

- `@nx/js:tsc` - TypeScript compilation
- `@nx/webpack:webpack` - Webpack bundling
- `@nx/vite:build` - Vite build
- `@nx/esbuild:esbuild` - ESBuild bundling
- `@nx/rollup:rollup` - Rollup bundling
- `@nx/bundler:*` - Nx bundler variants

### Target Management

#### `updateProjectTargets(project, config)`

Updates project targets with Weaver configuration.

```typescript
import { updateProjectTargets } from './target-generator.js';

await updateProjectTargets('my-api', config);
```

This function:
1. Generates Weaver targets for the project
2. Integrates with existing build targets
3. Updates the project.json file

#### `removeWeaverTargets(project)`

Removes Weaver targets from a project.

```typescript
import { removeWeaverTargets } from './target-generator.js';

await removeWeaverTargets('my-api');
```

This function:
1. Removes all Weaver targets from the project
2. Cleans up Weaver dependencies from build targets
3. Preserves other project configuration

### Dependency Management

#### `generateTargetDependencies(project, projects, config)`

Generates cross-project dependencies for Weaver targets.

```typescript
import { generateTargetDependencies } from './target-generator.js';

const allProjects = ['shared-lib', 'auth-service', 'my-api'];
const dependencies = generateTargetDependencies('my-api', allProjects, config);
```

**Dependency Rules:**

- **Validation**: Depends on validation of all other projects (`^weaver-validate`)
- **Generation**: Depends on generation of all other projects (`^weaver-generate`) and local validation
- **Docs**: Depends on local validation
- **Clean**: No dependencies

### Configuration Management

#### `updateProjectConfiguration(project, config)`

Updates project configuration with Weaver settings.

```typescript
import { updateProjectConfiguration } from './target-generator.js';

await updateProjectConfiguration('my-api', config);
```

#### `updateWorkspaceConfiguration(workspaceConfig)`

Updates workspace configuration with Weaver defaults.

```typescript
import { updateWorkspaceConfiguration } from './target-generator.js';

const workspaceConfig: WeaverWorkspaceConfig = {
  defaultVersion: '1.0.0',
  enabledByDefault: true,
  cacheDirectory: '.weaver-cache'
};

await updateWorkspaceConfiguration(workspaceConfig);
```

## Target Configuration Templates

### Weaver Validate Target

```typescript
{
  executor: '@nx-weaver/validate',
  options: {
    project: 'project-name'
  },
  dependsOn: ['^weaver-validate'],
  inputs: [
    'default',
    '{projectRoot}/weaver/**/*',
    '{projectRoot}/weaver.json',
    '{projectRoot}/project.json'
  ],
  outputs: []
}
```

### Weaver Generate Target

```typescript
{
  executor: '@nx-weaver/generate',
  options: {
    project: 'project-name'
  },
  dependsOn: ['^weaver-generate', 'weaver-validate'],
  inputs: [
    'default',
    '{projectRoot}/weaver/**/*',
    '{projectRoot}/weaver.json',
    '{projectRoot}/project.json'
  ],
  outputs: ['{projectRoot}/dist/weaver/**/*']
}
```

### Weaver Docs Target

```typescript
{
  executor: '@nx-weaver/docs',
  options: {
    project: 'project-name'
  },
  dependsOn: ['weaver-validate'],
  inputs: [
    'default',
    '{projectRoot}/weaver/**/*',
    '{projectRoot}/weaver.json',
    '{projectRoot}/project.json'
  ],
  outputs: ['{projectRoot}/dist/weaver-docs/**/*']
}
```

### Weaver Clean Target

```typescript
{
  executor: '@nx-weaver/clean',
  options: {
    project: 'project-name'
  },
  dependsOn: [],
  inputs: ['default'],
  outputs: []
}
```

## Utility Functions

### Target Detection

#### `detectExistingTargets(project)`

Detects existing targets in a project.

```typescript
import { detectExistingTargets } from './target-generator.js';

const targets = detectExistingTargets('my-api');
```

#### `getWeaverTargets(project)`

Gets all Weaver targets for a project.

```typescript
import { getWeaverTargets } from './target-generator.js';

const weaverTargets = getWeaverTargets('my-api');
// Returns: ['weaver-validate', 'weaver-generate', 'weaver-docs', 'weaver-clean']
```

#### `hasWeaverTargets(project)`

Checks if a project has Weaver targets.

```typescript
import { hasWeaverTargets } from './target-generator.js';

const hasTargets = hasWeaverTargets('my-api');
// Returns: true/false
```

#### `getBuildTargets(project)`

Gets build targets that should integrate with Weaver.

```typescript
import { getBuildTargets } from './target-generator.js';

const buildTargets = getBuildTargets('my-api');
// Returns: ['build', 'build:prod']
```

### Target Validation

#### `validateTargetConfiguration(targetName, targetConfig)`

Validates target configuration.

```typescript
import { validateTargetConfiguration } from './target-generator.js';

const result = validateTargetConfiguration('weaver-validate', targetConfig);
// Returns: { valid: boolean, errors: string[] }
```

## Configuration Options

### WeaverProjectConfig

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
  cacheDirectory?: string;
  downloadTimeout?: number;
  maxRetries?: number;
}
```

### WeaverWorkspaceConfig

```typescript
interface WeaverWorkspaceConfig {
  defaultVersion?: string;
  defaultArgs?: WeaverArgs;
  defaultEnvironment?: Record<string, string>;
  schemaDirectory?: string;
  outputDirectory?: string;
  enabledByDefault?: boolean;
  cacheDirectory?: string;
  downloadTimeout?: number;
  maxRetries?: number;
  verifyHashes?: boolean;
  downloadUrl?: string;
}
```

## Usage Examples

### Basic Setup

```typescript
import { updateProjectTargets } from './target-generator.js';

const config: WeaverProjectConfig = {
  enabled: true,
  version: '1.0.0',
  schemaDirectory: 'weaver',
  outputDirectory: 'dist/weaver'
};

await updateProjectTargets('my-api', config);
```

### Conditional Target Generation

```typescript
import { generateWeaverTargets } from './target-generator.js';

const config: WeaverProjectConfig = {
  enabled: true,
  skipValidation: true,  // Skip validation target
  skipGeneration: false, // Keep generation target
  skipDocs: true         // Skip docs target
};

const targets = generateWeaverTargets('my-api', config);
// Only generates: weaver-generate, weaver-clean
```

### Build Integration

```typescript
import { integrateWithBuildTarget } from './target-generator.js';

const buildTarget: TargetConfiguration = {
  executor: '@nx/js:tsc',
  options: { tsConfig: 'tsconfig.json' },
  dependsOn: ['existing-dep']
};

const integrated = integrateWithBuildTarget('my-api', buildTarget, config);
// Result: dependsOn: ['existing-dep', 'weaver-generate']
```

### Cross-Project Dependencies

```typescript
import { generateTargetDependencies } from './target-generator.js';

const allProjects = ['shared-lib', 'auth-service', 'my-api'];
const dependencies = generateTargetDependencies('my-api', allProjects, config);

// Result:
// {
//   'weaver-validate': ['shared-lib:weaver-validate', 'auth-service:weaver-validate'],
//   'weaver-generate': ['shared-lib:weaver-generate', 'auth-service:weaver-generate', 'my-api:weaver-validate'],
//   'weaver-docs': ['my-api:weaver-validate']
// }
```

## Error Handling

The Target Generator includes comprehensive error handling:

- **File System Errors**: Gracefully handles missing files and directories
- **JSON Parsing Errors**: Handles invalid JSON in configuration files
- **Configuration Validation**: Validates target configurations before applying
- **Dependency Conflicts**: Detects and resolves circular dependencies
- **Build Target Conflicts**: Preserves existing build configurations

## Best Practices

1. **Always validate configurations** before applying them
2. **Use conditional generation** to skip unnecessary targets
3. **Test build integration** in a development environment first
4. **Monitor dependency graphs** to avoid circular dependencies
5. **Backup project configurations** before making changes
6. **Use dry-run mode** when testing target generation

## Integration with Nx

The Target Generator is designed to work seamlessly with Nx:

- **Project Detection**: Automatically detects Nx project structure
- **Target Integration**: Integrates with existing Nx targets
- **Configuration Management**: Updates Nx configuration files
- **Dependency Management**: Uses Nx dependency syntax
- **Cache Integration**: Works with Nx caching system

## Testing

The Target Generator includes comprehensive unit tests covering:

- Target generation with various configurations
- Build target integration
- Cross-project dependencies
- Configuration management
- Error handling scenarios
- Target validation

Run tests with:

```bash
npm test -- src/utils/target-generator.spec.ts
```

## Constants

### WEAVER_TARGETS

```typescript
export const WEAVER_TARGETS = {
  VALIDATE: 'weaver-validate',
  GENERATE: 'weaver-generate',
  DOCS: 'weaver-docs',
  CLEAN: 'weaver-clean',
} as const;
```

### BUILD_TARGET_TYPES

```typescript
export const BUILD_TARGET_TYPES = [
  '@nx/js:tsc',
  '@nx/webpack:webpack',
  '@nx/vite:build',
  '@nx/esbuild:esbuild',
  '@nx/rollup:rollup',
  '@nx/bundler:esbuild',
  '@nx/bundler:rollup',
  '@nx/bundler:webpack',
  '@nx/bundler:vite'
] as const;
```

## Migration Guide

### From Manual Target Configuration

1. **Backup existing configuration**
2. **Remove manual Weaver targets**
3. **Use Target Generator to create targets**
4. **Verify build integration**
5. **Test all Weaver operations**

### Updating Existing Targets

1. **Detect existing targets**
2. **Generate new configuration**
3. **Merge with existing configuration**
4. **Preserve user customizations**
5. **Validate final configuration**

## Troubleshooting

### Common Issues

1. **Target not found**: Check project structure and file paths
2. **Build integration failed**: Verify executor compatibility
3. **Dependency conflicts**: Check for circular dependencies
4. **Configuration errors**: Validate configuration format
5. **Permission errors**: Check file system permissions

### Debug Mode

Enable verbose logging to debug issues:

```typescript
const config: WeaverProjectConfig = {
  enabled: true,
  verbose: true
};
```

### Validation

Use the validation functions to check configurations:

```typescript
import { validateTargetConfiguration } from './target-generator.js';

const result = validateTargetConfiguration('weaver-validate', targetConfig);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
``` 