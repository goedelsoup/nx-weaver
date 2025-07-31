# Weaver Plugin Type Definitions

This directory contains comprehensive TypeScript type definitions and interfaces for the Weaver plugin. The type system is designed to provide full type safety, IntelliSense support, and clear documentation for all plugin functionality.

## Type Organization

The types are organized into logical modules:

### Core Types

- **`config.ts`** - Configuration types for workspace and project settings
- **`executor.ts`** - Executor types for Nx executor operations
- **`cache.ts`** - Cache management types
- **`project.ts`** - Project detection and management types
- **`weaver.ts`** - Weaver-specific types for executables and commands

### Utility Types

- **`errors.ts`** - Error classes and error handling types
- **`events.ts`** - Event system types for operation tracking
- **`validation.ts`** - Validation types for configuration and schemas
- **`guards.ts`** - Type guards for runtime type checking
- **`utils.ts`** - Utility functions for common operations

## Key Features

### 1. Comprehensive Type Safety

All types are fully typed with TypeScript, providing:
- Compile-time type checking
- IntelliSense autocompletion
- Type inference support
- Generic type support where appropriate

### 2. JSDoc Documentation

Every type and function includes comprehensive JSDoc documentation:
- Detailed descriptions
- Usage examples
- Parameter documentation
- Return value documentation

### 3. Error Handling

The error system provides:
- Hierarchical error classes
- Error codes for programmatic handling
- Recovery suggestions
- Context information

### 4. Event System

The event system supports:
- Type-safe event emission
- Event listener registration
- Event filtering and handling
- Operation tracking

### 5. Validation Framework

The validation system includes:
- Generic validation rules
- Schema validation
- Configuration validation
- File validation

## Usage Examples

### Configuration

```typescript
import { createWeaverConfig, createProjectConfig, mergeConfigs } from '@nx-weaver/types';

// Create workspace configuration
const workspaceConfig = createWeaverConfig({
  defaultVersion: '1.0.0',
  schemaDirectory: 'weaver/',
  enabledByDefault: true
});

// Create project configuration
const projectConfig = createProjectConfig({
  enabled: true,
  version: '1.1.0',
  skipValidation: false
});

// Merge configurations
const mergedConfig = mergeConfigs(workspaceConfig, projectConfig);
```

### Error Handling

```typescript
import { WeaverError, WeaverValidationError } from '@nx-weaver/types';

try {
  // Some operation
} catch (error) {
  if (error instanceof WeaverError) {
    console.log('Weaver error:', error.code);
    console.log('Suggestions:', error.suggestions);
  }
}
```

### Type Guards

```typescript
import { isWeaverConfig, isWeaverResult } from '@nx-weaver/types';

const config = { schemaDirectory: 'weaver/' };
if (isWeaverConfig(config)) {
  // config is now typed as WeaverWorkspaceConfig
  console.log(config.schemaDirectory);
}

const result = { success: true, output: 'Generated files' };
if (isWeaverResult(result)) {
  // result is now typed as WeaverResult
  console.log(result.success);
}
```

### Event Handling

```typescript
import { WeaverEventEmitter, WeaverExecutionEvent } from '@nx-weaver/types';

const emitter: WeaverEventEmitter = getEventEmitter();

emitter.on('execution', (event: WeaverExecutionEvent) => {
  console.log(`Executed ${event.operation} for ${event.project}`);
  console.log(`Duration: ${event.duration}ms`);
});
```

### Validation

```typescript
import { ValidationRule, ValidationResult } from '@nx-weaver/types';

const requiredRule: ValidationRule<string> = {
  name: 'required',
  validate: (value) => ({
    isValid: value.length > 0,
    errors: value.length === 0 ? ['Field is required'] : [],
    warnings: [],
    suggestions: []
  }),
  message: 'Field is required'
};

const result = requiredRule.validate('');
console.log(result.isValid); // false
console.log(result.errors); // ['Field is required']
```

## Migration Guide

### From Legacy Types

The new type system maintains backward compatibility with existing code. Legacy types are still exported from the main index file:

```typescript
// Legacy types (still supported)
import { WeaverArgs, WeaverProjectConfig } from '@nx-weaver/types';

// New comprehensive types (recommended)
import { WeaverArgs, WeaverProjectConfig, WeaverWorkspaceConfig } from '@nx-weaver/types';
```

### Breaking Changes

There are no breaking changes in this release. All existing code will continue to work with the new type system.

## Best Practices

### 1. Use Type Guards

Always use type guards when working with unknown data:

```typescript
import { isWeaverConfig } from '@nx-weaver/types';

function processConfig(config: unknown) {
  if (isWeaverConfig(config)) {
    // Safe to use config as WeaverWorkspaceConfig
    return config.schemaDirectory;
  }
  throw new Error('Invalid configuration');
}
```

### 2. Leverage Error Classes

Use the specific error classes for better error handling:

```typescript
import { WeaverValidationError, WeaverExecutionError } from '@nx-weaver/types';

try {
  // Validation
} catch (error) {
  if (error instanceof WeaverValidationError) {
    console.log(`Validation error in field: ${error.field}`);
  } else if (error instanceof WeaverExecutionError) {
    console.log(`Execution failed with exit code: ${error.exitCode}`);
  }
}
```

### 3. Use Utility Functions

Take advantage of the utility functions for common operations:

```typescript
import { generateCacheKey, formatDuration, normalizePath } from '@nx-weaver/types';

const cacheKey = generateCacheKey('my-api', 'generate', { version: '1.0.0' });
const duration = formatDuration(1250); // "1.25s"
const path = normalizePath('path\\to\\file'); // "path/to/file"
```

### 4. Event-Driven Development

Use the event system for operation tracking:

```typescript
import { WeaverEventEmitter } from '@nx-weaver/types';

const emitter: WeaverEventEmitter = getEventEmitter();

emitter.on('download', (event) => {
  console.log(`Downloading ${event.version} for ${event.platform}`);
  if (event.progress) {
    console.log(`Progress: ${event.progress}%`);
  }
});
```

## Contributing

When adding new types:

1. **Follow the existing patterns** - Use consistent naming and structure
2. **Add comprehensive JSDoc** - Include examples and detailed descriptions
3. **Include type guards** - Add corresponding type guards for new types
4. **Update exports** - Ensure new types are exported from the main index
5. **Add tests** - Include type tests to ensure type safety

## Type Safety Checklist

- [ ] All public APIs are fully typed
- [ ] Type guards are available for runtime checking
- [ ] Error classes provide specific error information
- [ ] Events are type-safe with proper interfaces
- [ ] Validation rules are generic and reusable
- [ ] Utility functions have proper type signatures
- [ ] JSDoc documentation is complete and accurate
- [ ] Examples are provided for all public types
- [ ] Backward compatibility is maintained
- [ ] Type tests verify type safety

This type system provides a solid foundation for building robust, type-safe Weaver plugin applications with excellent developer experience. 