# Nx Target Generation System

## Task Description
Implement the target generation system that automatically creates and manages Nx targets for Weaver operations, including build integration and dependency management.

## Requirements

### Core Functionality
Implement `src/utils/target-generator.ts` with the following key functions:

#### 1. Target Generation
```typescript
generateWeaverTargets(project: string, config: WeaverProjectConfig): Record<string, TargetConfiguration>
```
- Generate Weaver targets for a project
- Include validate, generate, docs, and clean targets
- Set up proper dependencies between targets
- Configure target options and executors

#### 2. Build Integration
```typescript
integrateWithBuildTarget(
  project: string,
  buildTarget: TargetConfiguration,
  config: WeaverProjectConfig
): TargetConfiguration
```
- Integrate Weaver generation with build targets
- Add Weaver dependencies to build process
- Handle different build target types
- Preserve existing build configuration

#### 3. Target Management
```typescript
updateProjectTargets(project: string, config: WeaverProjectConfig): Promise<void>
```
- Update existing project targets
- Add or remove Weaver targets as needed
- Handle target configuration changes
- Preserve user customizations

#### 4. Dependency Management
```typescript
generateTargetDependencies(
  project: string,
  projects: string[],
  config: WeaverProjectConfig
): Record<string, string[]>
```
- Generate proper target dependencies
- Handle cross-project dependencies
- Consider Weaver operation dependencies
- Optimize dependency graph

### Target Configuration
Generate the following targets for each project:

#### Weaver Validate Target
```typescript
{
  executor: '@nx-weaver/validate',
  options: {
    project: projectName
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

#### Weaver Generate Target
```typescript
{
  executor: '@nx-weaver/generate',
  options: {
    project: projectName
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

#### Weaver Docs Target
```typescript
{
  executor: '@nx-weaver/docs',
  options: {
    project: projectName
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

#### Weaver Clean Target
```typescript
{
  executor: '@nx-weaver/clean',
  options: {
    project: projectName
  },
  dependsOn: [],
  inputs: ['default'],
  outputs: []
}
```

### Build Integration Strategy
Integrate Weaver generation with different build target types:

#### TypeScript Build Targets
```typescript
{
  executor: '@nx/js:tsc',
  options: {
    // ... existing options
  },
  dependsOn: [
    // ... existing dependencies
    'weaver-generate'
  ]
}
```

#### Webpack Build Targets
```typescript
{
  executor: '@nx/webpack:webpack',
  options: {
    // ... existing options
  },
  dependsOn: [
    // ... existing dependencies
    'weaver-generate'
  ]
}
```

#### Vite Build Targets
```typescript
{
  executor: '@nx/vite:build',
  options: {
    // ... existing options
  },
  dependsOn: [
    // ... existing dependencies
    'weaver-generate'
  ]
}
```

### Target Detection and Updates
Implement intelligent target management:

#### 1. Target Detection
```typescript
detectExistingTargets(project: string): Record<string, TargetConfiguration>
```
- Detect existing Weaver targets in project
- Identify build targets that need integration
- Check for target conflicts or duplicates

#### 2. Target Updates
```typescript
updateTargetConfiguration(
  project: string,
  targetName: string,
  updates: Partial<TargetConfiguration>
): Promise<void>
```
- Update existing target configurations
- Preserve user customizations
- Handle configuration conflicts
- Validate target configuration

#### 3. Target Removal
```typescript
removeWeaverTargets(project: string): Promise<void>
```
- Remove Weaver targets from project
- Clean up build target dependencies
- Restore original build configurations
- Handle cleanup errors

### Configuration Integration
Integrate with project and workspace configuration:

#### 1. Project Configuration
```typescript
updateProjectConfiguration(
  project: string,
  config: WeaverProjectConfig
): Promise<void>
```
- Update project.json with Weaver configuration
- Add Weaver targets to project
- Configure build target dependencies
- Preserve existing project configuration

#### 2. Workspace Configuration
```typescript
updateWorkspaceConfiguration(
  workspaceConfig: WeaverWorkspaceConfig
): Promise<void>
```
- Update nx.json with Weaver defaults
- Configure workspace-level Weaver settings
- Set up global Weaver targets
- Handle workspace configuration changes

### Dependency Optimization
Implement smart dependency management:

#### 1. Cross-Project Dependencies
- Detect Weaver schema dependencies between projects
- Generate appropriate target dependencies
- Optimize dependency graph for parallel execution
- Handle circular dependency detection

#### 2. Build Dependencies
- Identify build targets that depend on generated code
- Add Weaver generation as build dependency
- Handle different build system integrations
- Preserve existing build optimizations

#### 3. Cache Dependencies
- Configure proper cache inputs and outputs
- Handle file-based cache invalidation
- Optimize cache key generation
- Support distributed caching

## Implementation Details

### Target Generation Algorithm
1. Detect project configuration and Weaver settings
2. Generate Weaver targets based on configuration
3. Identify build targets for integration
4. Add Weaver dependencies to build targets
5. Update project configuration
6. Validate target configuration

### Build Integration Strategy
1. Detect existing build targets in project
2. Identify targets that should depend on Weaver generation
3. Add Weaver generation as dependency
4. Preserve existing build configuration
5. Handle different build system types

### Configuration Management
1. Load existing project configuration
2. Merge Weaver configuration with existing config
3. Update project.json with new targets
4. Preserve user customizations
5. Validate final configuration

## Success Criteria
- Generates proper Weaver targets for all projects
- Integrates seamlessly with existing build targets
- Handles different project types and build systems
- Preserves user customizations and configurations
- Optimizes dependency graph for performance
- Supports target updates and removal
- Includes comprehensive unit tests
- Provides clear error messages and debugging information 