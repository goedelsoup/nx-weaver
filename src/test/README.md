# Testing Strategy

This directory contains the comprehensive testing infrastructure for the Weaver plugin, implementing unit tests, integration tests, performance tests, and end-to-end tests.

## Test Structure

```
src/test/
├── setup.ts              # Global test setup
├── utils.ts              # Test utilities and mocks
├── performance/          # Performance tests
│   └── cache.spec.ts     # Cache performance tests
└── e2e/                  # End-to-end tests
    └── workflow.spec.ts  # Complete workflow tests
```

## Test Types

### 1. Unit Tests
- **Location**: `src/**/*.spec.ts`
- **Purpose**: Test individual functions and classes in isolation
- **Coverage**: >90% line coverage
- **Examples**: WeaverManager, ConfigManager, CacheManager

### 2. Integration Tests
- **Location**: `src/executors/integration.spec.ts`
- **Purpose**: Test executor interactions and workflows
- **Coverage**: >80% line coverage
- **Examples**: Validate → Generate → Docs → Clean workflow

### 3. Performance Tests
- **Location**: `src/test/performance/`
- **Purpose**: Ensure performance requirements are met
- **Metrics**: Response times, memory usage, concurrent operations
- **Examples**: Cache performance, large data handling

### 4. End-to-End Tests
- **Location**: `src/test/e2e/`
- **Purpose**: Test complete workflows from start to finish
- **Coverage**: Main user scenarios
- **Examples**: Full Weaver workflow, multi-project setup

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### Performance Tests Only
```bash
npm run test:performance
```

### End-to-End Tests Only
```bash
npm run test:e2e
```

### With Coverage
```bash
npm run test:coverage
```

### Watch Mode
```bash
npm run test:watch
```

## Test Configuration

### Vitest Configuration
- **Framework**: Vitest (fast, TypeScript-native)
- **Environment**: Node.js
- **Coverage**: v8 provider with HTML, JSON, and LCOV reports
- **Thresholds**: 80% branches, 90% functions, 90% lines, 90% statements

### Test Utilities

#### `createMockWorkspaceConfig(overrides?)`
Creates a mock workspace configuration for testing.

#### `createMockProjectConfig(overrides?)`
Creates a mock project configuration for testing.

#### `createMockExecutorContext(overrides?)`
Creates a mock executor context for testing.

#### `createTempWorkspace()`
Creates a temporary workspace directory for testing.

#### `cleanupTempWorkspace(path)`
Cleans up temporary workspace directories.

#### `createMockValidationResult(overrides?)`
Creates a mock validation result for testing.

#### `createTestSchemaFile(path, content)`
Creates a test schema file with specified content.

#### `createTestProjectStructure(path, projectName)`
Creates a complete test project structure.

## Test Patterns

### 1. Arrange-Act-Assert
```typescript
describe('Feature', () => {
  it('should do something', async () => {
    // Arrange
    const config = createMockWorkspaceConfig();
    const context = createMockExecutorContext();
    
    // Act
    const result = await someFunction(config, context);
    
    // Assert
    expect(result.success).toBe(true);
  });
});
```

### 2. Test Isolation
```typescript
describe('Feature', () => {
  let tempDir: string;
  
  beforeEach(() => {
    tempDir = createTempWorkspace();
  });
  
  afterEach(() => {
    cleanupTempWorkspace(tempDir);
  });
  
  // Tests here...
});
```

### 3. Mocking Strategy
```typescript
// Mock external dependencies
vi.mock('axios');
vi.mock('fs-extra');

// Use realistic test data
const mockConfig = createMockWorkspaceConfig({
  defaultVersion: '1.0.0'
});
```

## Performance Testing

### Cache Performance
- **Large Data**: Test with 1MB+ cache entries
- **Concurrent Operations**: Test with 50+ simultaneous operations
- **Key Generation**: Test with 1000+ key generations
- **Statistics**: Test cache stats calculation performance

### Build Impact
- **Cache Hit Performance**: Ensure cache hits are <10% of original time
- **Memory Usage**: Monitor memory consumption during operations
- **Concurrent Builds**: Test multiple projects building simultaneously

## Coverage Requirements

### Unit Tests
- **Lines**: >90%
- **Functions**: >90%
- **Branches**: >80%
- **Statements**: >90%

### Integration Tests
- **Lines**: >80%
- **Critical Paths**: 100%
- **Error Scenarios**: >90%

### Performance Tests
- **Critical Operations**: 100%
- **Edge Cases**: >80%

### End-to-End Tests
- **Main Workflows**: 100%
- **User Scenarios**: >90%

## Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Keep tests focused and atomic

### 2. Test Data
- Use realistic test data
- Create reusable test utilities
- Avoid hardcoded values

### 3. Error Testing
- Test error scenarios
- Verify error messages
- Test edge cases

### 4. Performance Testing
- Set realistic performance thresholds
- Test with realistic data sizes
- Monitor resource usage

### 5. Test Maintenance
- Keep tests up to date with code changes
- Refactor tests when needed
- Remove obsolete tests

## Continuous Integration

### GitHub Actions
Tests run automatically on:
- Pull requests
- Push to main branch
- Release tags

### Pre-commit Hooks
- Run unit tests
- Check coverage thresholds
- Lint test files

### Coverage Reports
- HTML reports for local development
- LCOV reports for CI integration
- Coverage badges for README

## Troubleshooting

### Common Issues

#### 1. Test Timeouts
- Increase timeout for slow operations
- Use `vi.setConfig({ testTimeout: 10000 })`

#### 2. Mock Issues
- Ensure mocks are properly configured
- Check import/export compatibility
- Use `vi.clearAllMocks()` in afterEach

#### 3. File System Issues
- Use temporary directories
- Clean up after tests
- Check file permissions

#### 4. Coverage Issues
- Ensure all code paths are tested
- Add tests for error scenarios
- Check for dead code

### Debugging Tests
```bash
# Run specific test with verbose output
npm test -- --reporter=verbose src/path/to/test.spec.ts

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Future Enhancements

### Planned Improvements
1. **Visual Regression Testing**: Add visual tests for generated output
2. **Load Testing**: Add load tests for concurrent operations
3. **Security Testing**: Add security-focused tests
4. **Accessibility Testing**: Add accessibility tests for generated docs
5. **Cross-platform Testing**: Add tests for different platforms

### Test Infrastructure
1. **Test Database**: Add database integration tests
2. **Mock Weaver**: Create a mock Weaver executable for testing
3. **Test Containers**: Use containers for isolated testing
4. **Performance Monitoring**: Add performance monitoring tools 