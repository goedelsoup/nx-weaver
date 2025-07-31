# Testing Guide

This guide covers testing practices and how to write effective tests for the Nx Weaver Plugin.

## Testing Framework

We use **Vitest** for testing, which provides:
- Fast execution
- Excellent TypeScript support
- Jest-compatible API
- Built-in coverage reporting

## Test Structure

### Test Organization

```
tests/
├── unit/                    # Unit tests
│   ├── executors/          # Executor tests
│   ├── generators/         # Generator tests
│   ├── utils/              # Utility function tests
│   └── types/              # Type validation tests
├── integration/            # Integration tests
│   ├── workflows/          # End-to-end workflows
│   └── scenarios/          # Real-world scenarios
├── fixtures/               # Test fixtures and data
└── helpers/                # Test helpers and utilities
```

### Test File Naming

- Unit tests: `*.spec.ts`
- Integration tests: `*.integration.spec.ts`
- E2E tests: `*.e2e.spec.ts`

## Writing Tests

### Unit Tests

Test individual functions and components in isolation.

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { validateConfig, ValidationResult } from '../src/utils/config';

describe('validateConfig', () => {
  let result: ValidationResult;

  beforeEach(() => {
    result = { isValid: true, errors: [], warnings: [], suggestions: [] };
  });

  describe('valid configurations', () => {
    it('should accept valid configuration', () => {
      const config = {
        version: '1.0.0',
        enabled: true,
        schemaDirectory: 'weaver/'
      };

      const result = validateConfig(config);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept minimal configuration', () => {
      const config = { version: '1.0.0' };

      const result = validateConfig(config);

      expect(result.isValid).toBe(true);
    });
  });

  describe('invalid configurations', () => {
    it('should reject missing version', () => {
      const config = { enabled: true };

      const result = validateConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required field: version');
    });

    it('should reject invalid version format', () => {
      const config = { version: 'invalid' };

      const result = validateConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid version format');
    });
  });

  describe('warnings', () => {
    it('should warn about deprecated options', () => {
      const config = {
        version: '1.0.0',
        deprecatedOption: 'value'
      };

      const result = validateConfig(config);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('deprecatedOption is deprecated');
    });
  });
});
```

### Integration Tests

Test how components work together.

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestWorkspace, cleanupTestWorkspace } from './helpers';
import { WeaverPlugin } from '../src';

describe('Weaver Plugin Integration', () => {
  let workspacePath: string;

  beforeAll(async () => {
    workspacePath = await createTestWorkspace();
  });

  afterAll(async () => {
    await cleanupTestWorkspace(workspacePath);
  });

  describe('complete workflow', () => {
    it('should initialize workspace and generate code', async () => {
      const plugin = new WeaverPlugin(workspacePath);

      // Initialize workspace
      await plugin.init({
        defaultVersion: '1.0.0',
        schemaDirectory: 'weaver/'
      });

      // Set up project
      await plugin.setupProject('my-project', {
        version: '1.0.0',
        enabled: true
      });

      // Create schema
      await plugin.createSchema('my-project', {
        name: 'test-service',
        version: '1.0.0',
        metrics: [
          {
            name: 'requests_total',
            type: 'counter',
            description: 'Total requests'
          }
        ]
      });

      // Validate schema
      const validationResult = await plugin.validate('my-project');
      expect(validationResult.success).toBe(true);

      // Generate code
      const generationResult = await plugin.generate('my-project');
      expect(generationResult.success).toBe(true);
      expect(generationResult.filesGenerated).toContain('dist/weaver/index.ts');
    });
  });
});
```

### E2E Tests

Test complete user workflows.

```typescript
import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { join } from 'path';

describe('E2E: Weaver Plugin', () => {
  const testWorkspace = join(__dirname, '../fixtures/test-workspace');

  describe('nx weaver-validate', () => {
    it('should validate schemas successfully', () => {
      const result = execSync('nx weaver-validate my-project', {
        cwd: testWorkspace,
        encoding: 'utf8'
      });

      expect(result).toContain('✓ All schemas are valid');
    });

    it('should fail with invalid schema', () => {
      expect(() => {
        execSync('nx weaver-validate invalid-project', {
          cwd: testWorkspace,
          encoding: 'utf8'
        });
      }).toThrow();
    });
  });

  describe('nx weaver-generate', () => {
    it('should generate code successfully', () => {
      const result = execSync('nx weaver-generate my-project', {
        cwd: testWorkspace,
        encoding: 'utf8'
      });

      expect(result).toContain('✓ Code generation successful');
    });
  });
});
```

## Test Helpers

### Mocking

```typescript
import { vi, beforeEach } from 'vitest';
import { downloadWeaver } from '../src/utils/weaver';

// Mock file system
vi.mock('fs/promises', () => ({
  writeFile: vi.fn(),
  readFile: vi.fn(),
  mkdir: vi.fn()
}));

// Mock HTTP requests
vi.mock('node-fetch', () => ({
  default: vi.fn()
}));

describe('downloadWeaver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should download weaver executable', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(100))
    } as any);

    const result = await downloadWeaver('1.0.0', 'darwin', 'x64');

    expect(result).toContain('weaver-darwin-x64');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('weaver-1.0.0-darwin-x64')
    );
  });
});
```

### Test Fixtures

```typescript
// fixtures/valid-schema.yaml
export const validSchema = `
name: "test-service"
version: "1.0.0"
description: "Test service schema"

metrics:
  - name: "requests_total"
    type: "counter"
    description: "Total number of requests"
    unit: "1"
    attributes:
      - name: "method"
        type: "string"
        description: "HTTP method"
`;

// fixtures/invalid-schema.yaml
export const invalidSchema = `
name: "test-service"
version: "1.0.0"
metrics:
  - name: "requests_total"
    type: "invalid_type"  # Invalid type
    description: "Total requests"
`;

// tests/helpers/schema.ts
import { readFileSync } from 'fs';
import { join } from 'path';

export function loadFixture(name: string): string {
  const fixturePath = join(__dirname, '../../fixtures', name);
  return readFileSync(fixturePath, 'utf8');
}

export function createTempSchema(content: string): string {
  const tempPath = join(__dirname, '../temp', `schema-${Date.now()}.yaml`);
  // Implementation to create temporary file
  return tempPath;
}
```

### Async Testing

```typescript
import { describe, it, expect } from 'vitest';
import { executeWeaver } from '../src/utils/weaver';

describe('executeWeaver', () => {
  it('should execute weaver command successfully', async () => {
    const result = await executeWeaver(
      '/path/to/weaver',
      'validate',
      ['--strict', 'schema.yaml']
    );

    expect(result.success).toBe(true);
    expect(result.output).toContain('Validation successful');
  });

  it('should handle weaver errors', async () => {
    const result = await executeWeaver(
      '/path/to/weaver',
      'validate',
      ['invalid-schema.yaml']
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Validation failed');
  });

  it('should timeout for long-running operations', async () => {
    await expect(
      executeWeaver('/path/to/weaver', 'generate', ['--slow'], { timeout: 1000 })
    ).rejects.toThrow('Operation timed out');
  });
});
```

## Test Coverage

### Coverage Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'fixtures/',
        '**/*.d.ts',
        '**/*.config.*'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/index.html

# Check coverage thresholds
npm run test:coverage -- --reporter=text
```

## Performance Testing

### Benchmark Tests

```typescript
import { describe, it, expect } from 'vitest';
import { WeaverPlugin } from '../src';

describe('Performance', () => {
  it('should generate code within time limit', async () => {
    const startTime = Date.now();
    
    const plugin = new WeaverPlugin('/test/workspace');
    await plugin.generate('large-project');
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // 5 seconds
  });

  it('should handle large schemas efficiently', async () => {
    const largeSchema = generateLargeSchema(1000); // 1000 metrics
    
    const startTime = Date.now();
    const result = await validateSchema(largeSchema);
    const duration = Date.now() - startTime;
    
    expect(result.isValid).toBe(true);
    expect(duration).toBeLessThan(1000); // 1 second
  });
});

function generateLargeSchema(metricCount: number) {
  const metrics = [];
  for (let i = 0; i < metricCount; i++) {
    metrics.push({
      name: `metric_${i}`,
      type: 'counter',
      description: `Metric ${i}`
    });
  }
  
  return {
    name: 'large-service',
    version: '1.0.0',
    metrics
  };
}
```

## Testing Best Practices

### 1. Test Structure

- **Arrange**: Set up test data and conditions
- **Act**: Execute the code being tested
- **Assert**: Verify the expected outcomes

```typescript
it('should validate configuration', () => {
  // Arrange
  const config = { version: '1.0.0', enabled: true };
  
  // Act
  const result = validateConfig(config);
  
  // Assert
  expect(result.isValid).toBe(true);
});
```

### 2. Descriptive Test Names

```typescript
// Good
it('should reject configuration with missing version field');

// Better
it('should return validation error when version field is missing from configuration');

// Best
it('should return validation error with specific message when version field is missing from configuration');
```

### 3. Test Isolation

```typescript
describe('WeaverPlugin', () => {
  let plugin: WeaverPlugin;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDirectory();
    plugin = new WeaverPlugin(tempDir);
  });

  afterEach(async () => {
    await cleanupTempDirectory(tempDir);
  });

  it('should initialize workspace', async () => {
    // Test implementation
  });
});
```

### 4. Error Testing

```typescript
describe('error handling', () => {
  it('should throw WeaverError for invalid configuration', () => {
    expect(() => {
      validateConfig({ invalid: 'config' });
    }).toThrow(WeaverError);
  });

  it('should include error code and suggestions', () => {
    try {
      validateConfig({ invalid: 'config' });
    } catch (error) {
      expect(error).toBeInstanceOf(WeaverError);
      expect(error.code).toBe('CONFIG_INVALID');
      expect(error.suggestions).toContain('Check configuration format');
    }
  });
});
```

### 5. Edge Cases

```typescript
describe('edge cases', () => {
  it('should handle empty configuration', () => {
    const result = validateConfig({});
    expect(result.isValid).toBe(false);
  });

  it('should handle null values', () => {
    const result = validateConfig({ version: null });
    expect(result.isValid).toBe(false);
  });

  it('should handle very long strings', () => {
    const longString = 'a'.repeat(10000);
    const result = validateConfig({ version: longString });
    expect(result.isValid).toBe(false);
  });
});
```

## Running Tests

### Command Line

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- executor.spec.ts

# Run tests matching pattern
npm test -- --grep "validation"

# Run tests with verbose output
npm test -- --reporter=verbose

# Run tests in parallel
npm test -- --threads=4
```

### VS Code Integration

```json
// .vscode/settings.json
{
  "vitest.enable": true,
  "vitest.commandLine": "npm test",
  "vitest.include": ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  "vitest.exclude": ["**/node_modules/**", "**/dist/**", "**/cypress/**"]
}
```

## Continuous Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16, 18, 20]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/coverage-final.json
```

## Next Steps

- [Development Setup](development.md) - Setting up development environment
- [Contributing Guide](contributing.md) - General contributing guidelines
- [API Documentation](../api/) - Understanding the codebase 