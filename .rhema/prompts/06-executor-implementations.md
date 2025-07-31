# Executor Implementations

## Task Description
Implement the core executor functionality for Weaver operations: validate, generate, docs, and clean. Each executor should integrate with the Weaver executable manager, configuration system, and caching.

## Requirements

### Common Executor Infrastructure
Implement shared executor utilities in `src/utils/executor-utils.ts`:

#### 1. Context Building
```typescript
buildWeaverContext(context: ExecutorContext): Promise<WeaverExecutorContext>
```
- Build complete Weaver execution context
- Load project configuration
- Resolve Weaver executable path
- Collect schema files
- Set up output directories

#### 2. Weaver Command Execution
```typescript
runWeaverCommand(
  operation: string,
  weaverContext: WeaverExecutorContext,
  options: WeaverExecutorOptions
): Promise<WeaverResult>
```
- Execute Weaver commands with proper arguments
- Handle process execution and output capture
- Manage environment variables
- Implement timeout and retry logic
- Return structured results

#### 3. Error Handling
```typescript
handleWeaverError(error: Error, context: WeaverExecutorContext): WeaverResult
```
- Convert Weaver errors to structured results
- Provide actionable error messages
- Handle different error types appropriately
- Implement graceful degradation

### Validate Executor
Implement `src/executors/validate/executor.ts`:

#### Functionality
- Validate Weaver schema files
- Check schema syntax and structure
- Verify schema references and dependencies
- Return validation results with detailed feedback

#### Options
```typescript
interface ValidateExecutorOptions {
  dryRun?: boolean;
  verbose?: boolean;
  strict?: boolean;
  ignoreWarnings?: boolean;
}
```

#### Implementation
```typescript
export default async function validateExecutor(
  options: ValidateExecutorOptions,
  context: ExecutorContext
): Promise<ExecutorResult> {
  const weaverContext = await buildWeaverContext(context);
  const cacheKey = generateCacheKey('validate', weaverContext);
  
  // Check cache first
  if (await isCacheValid(cacheKey)) {
    return { success: true, output: 'Validation passed (cached)' };
  }
  
  // Run validation
  const result = await runWeaverCommand('validate', weaverContext, options);
  
  // Store result in cache
  await storeCacheResult(cacheKey, result);
  
  return {
    success: result.success,
    output: result.output,
    error: result.error
  };
}
```

### Generate Executor
Implement `src/executors/generate/executor.ts`:

#### Functionality
- Generate code from Weaver schemas
- Create TypeScript interfaces and types
- Generate client libraries and utilities
- Track generated files for cleanup

#### Options
```typescript
interface GenerateExecutorOptions {
  dryRun?: boolean;
  verbose?: boolean;
  force?: boolean;
  watch?: boolean;
  outputFormat?: 'typescript' | 'javascript' | 'json';
}
```

#### Implementation
```typescript
export default async function generateExecutor(
  options: GenerateExecutorOptions,
  context: ExecutorContext
): Promise<ExecutorResult> {
  const weaverContext = await buildWeaverContext(context);
  const cacheKey = generateCacheKey('generate', weaverContext);
  
  // Check cache first
  if (await isCacheValid(cacheKey)) {
    return { success: true, output: 'Code generation completed (cached)' };
  }
  
  // Ensure output directory exists
  await ensureDirectory(weaverContext.outputPath);
  
  // Run generation
  const result = await runWeaverCommand('generate', weaverContext, options);
  
  // Track generated files
  if (result.success && result.filesGenerated) {
    await trackGeneratedFiles(weaverContext.projectName, result.filesGenerated);
  }
  
  // Store result in cache
  await storeCacheResult(cacheKey, result);
  
  return {
    success: result.success,
    output: result.output,
    error: result.error
  };
}
```

### Docs Executor
Implement `src/executors/docs/executor.ts`:

#### Functionality
- Generate documentation from Weaver schemas
- Create API documentation and examples
- Generate schema reference documentation
- Support multiple output formats

#### Options
```typescript
interface DocsExecutorOptions {
  dryRun?: boolean;
  verbose?: boolean;
  format?: 'markdown' | 'html' | 'json';
  outputPath?: string;
  includeExamples?: boolean;
}
```

#### Implementation
```typescript
export default async function docsExecutor(
  options: DocsExecutorOptions,
  context: ExecutorContext
): Promise<ExecutorResult> {
  const weaverContext = await buildWeaverContext(context);
  const cacheKey = generateCacheKey('docs', weaverContext);
  
  // Check cache first
  if (await isCacheValid(cacheKey)) {
    return { success: true, output: 'Documentation generated (cached)' };
  }
  
  // Run documentation generation
  const result = await runWeaverCommand('docs', weaverContext, options);
  
  // Store result in cache
  await storeCacheResult(cacheKey, result);
  
  return {
    success: result.success,
    output: result.output,
    error: result.error
  };
}
```

### Clean Executor
Implement `src/executors/clean/executor.ts`:

#### Functionality
- Remove generated files and directories
- Clean up temporary files
- Invalidate related cache entries
- Provide dry-run option for safety

#### Options
```typescript
interface CleanExecutorOptions {
  dryRun?: boolean;
  verbose?: boolean;
  includeCache?: boolean;
  includeTemp?: boolean;
}
```

#### Implementation
```typescript
export default async function cleanExecutor(
  options: CleanExecutorOptions,
  context: ExecutorContext
): Promise<ExecutorResult> {
  const weaverContext = await buildWeaverContext(context);
  
  // Get list of files to clean
  const filesToClean = await getGeneratedFiles(weaverContext.projectName);
  
  if (options.dryRun) {
    return {
      success: true,
      output: `Would clean ${filesToClean.length} files:\n${filesToClean.join('\n')}`
    };
  }
  
  // Clean generated files
  const cleanedFiles = await cleanGeneratedFiles(filesToClean);
  
  // Invalidate cache if requested
  if (options.includeCache) {
    await invalidateCache(weaverContext.projectName);
  }
  
  return {
    success: true,
    output: `Cleaned ${cleanedFiles.length} files`
  };
}
```

### Executor Schemas
Create JSON schemas for each executor:

#### Validate Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "dryRun": {
      "type": "boolean",
      "default": false
    },
    "verbose": {
      "type": "boolean",
      "default": false
    },
    "strict": {
      "type": "boolean",
      "default": false
    },
    "ignoreWarnings": {
      "type": "boolean",
      "default": false
    }
  }
}
```

## Implementation Details

### Weaver Command Integration
- Use Weaver executable manager to get correct version
- Pass configuration arguments to Weaver commands
- Handle Weaver command output and exit codes
- Implement proper error handling for Weaver failures

### File Tracking
- Track all generated files for cleanup operations
- Store file metadata for cache invalidation
- Handle file permission and access issues
- Implement safe file deletion

### Performance Optimization
- Use caching to avoid redundant operations
- Implement parallel execution where possible
- Optimize file system operations
- Minimize memory usage during execution

### Error Recovery
- Implement retry logic for transient failures
- Provide fallback behavior when possible
- Give clear error messages with suggestions
- Log detailed error information for debugging

## Success Criteria
- All executors work correctly with Weaver commands
- Proper integration with caching and configuration systems
- Comprehensive error handling and recovery
- Performance meets requirements (<5s impact on builds)
- Includes comprehensive unit and integration tests
- Provides clear output and error messages
- Supports dry-run and verbose modes
- Handles edge cases and error scenarios gracefully 