# Testing Strategy Implementation

## Task Description
Implement a comprehensive testing strategy for the Weaver plugin, including unit tests, integration tests, performance tests, and end-to-end tests.

## Requirements

### Testing Infrastructure
Set up testing infrastructure with the following tools:

#### 1. Test Framework Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/types/**/*.ts',
        'src/test/**/*.ts',
        '**/*.spec.ts',
        '**/*.test.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
```

#### 2. Test Utilities
Implement `src/test/utils.ts` with common test utilities:

```typescript
// src/test/setup.ts
import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  // Global test setup
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  // Global test cleanup
});
```

```typescript
// src/test/utils.ts

```typescript
// src/test/utils.ts
export function createMockWorkspaceConfig(overrides?: Partial<WeaverWorkspaceConfig>): WeaverWorkspaceConfig {
  return {
    defaultVersion: '1.0.0',
    schemaDirectory: 'weaver/',
    outputDirectory: 'dist/weaver/',
    enabledByDefault: true,
    cacheDirectory: '.nx-weaver-cache/',
    downloadTimeout: 30000,
    maxRetries: 3,
    verifyHashes: true,
    ...overrides
  };
}

export function createMockProjectConfig(overrides?: Partial<WeaverProjectConfig>): WeaverProjectConfig {
  return {
    enabled: true,
    version: '1.0.0',
    schemaDirectory: 'weaver/',
    outputDirectory: 'dist/weaver/',
    skipValidation: false,
    skipGeneration: false,
    skipDocs: false,
    ...overrides
  };
}

export function createMockExecutorContext(overrides?: Partial<ExecutorContext>): ExecutorContext {
  return {
    projectName: 'test-project',
    projectGraph: {
      nodes: {},
      dependencies: {}
    },
    workspace: {
      version: 2,
      projects: {}
    },
    root: '/tmp/test-workspace',
    cwd: '/tmp/test-workspace',
    isVerbose: false,
    ...overrides
  };
}

export function createTempWorkspace(): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nx-weaver-test-'));
  return tempDir;
}

export function cleanupTempWorkspace(workspacePath: string): void {
  fs.rmSync(workspacePath, { recursive: true, force: true });
}
```

### Unit Tests

#### 1. Weaver Manager Tests
Implement `src/utils/weaver-manager.spec.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WeaverManager } from '../weaver-manager';
import { createMockWorkspaceConfig } from '../../test/utils';

describe('WeaverManager', () => {
  let weaverManager: WeaverManager;
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempWorkspace();
    weaverManager = new WeaverManager(createMockWorkspaceConfig({
      cacheDirectory: path.join(tempDir, '.nx-weaver-cache')
    }));
  });

  afterEach(() => {
    cleanupTempWorkspace(tempDir);
  });

  describe('downloadWeaver', () => {
    it('should download Weaver executable for valid version', async () => {
      const version = '1.0.0';
      const result = await weaverManager.downloadWeaver(version);
      
      expect(result).toBeDefined();
      expect(fs.existsSync(result)).toBe(true);
      expect(fs.statSync(result).isFile()).toBe(true);
    });

    it('should handle download failures gracefully', async () => {
      const version = 'invalid-version';
      
      await expect(weaverManager.downloadWeaver(version))
        .rejects
        .toThrow(WeaverDownloadError);
    });

    it('should use cached version when available', async () => {
      const version = '1.0.0';
      
      // First download
      const firstResult = await weaverManager.downloadWeaver(version);
      
      // Second download should use cache
      const secondResult = await weaverManager.downloadWeaver(version);
      
      expect(firstResult).toBe(secondResult);
    });
  });

  describe('validateWeaver', () => {
    it('should validate existing Weaver executable', async () => {
      const version = '1.0.0';
      await weaverManager.downloadWeaver(version);
      
      const isValid = await weaverManager.validateWeaver(version);
      expect(isValid).toBe(true);
    });

    it('should return false for non-existent executable', async () => {
      const isValid = await weaverManager.validateWeaver('non-existent');
      expect(isValid).toBe(false);
    });
  });
});
```

#### 2. Configuration Manager Tests
Implement `src/utils/config-manager.spec.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConfigManager } from '../config-manager';
import { createMockWorkspaceConfig, createMockProjectConfig } from '../../test/utils';

describe('ConfigManager', () => {
  let configManager: ConfigManager;
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempWorkspace();
    configManager = new ConfigManager(tempDir);
  });

  afterEach(() => {
    cleanupTempWorkspace(tempDir);
  });

  describe('getWorkspaceConfig', () => {
    it('should load workspace configuration from file', async () => {
      const config = createMockWorkspaceConfig();
      fs.writeFileSync(
        path.join(tempDir, 'weaver-workspace.json'),
        JSON.stringify(config)
      );

      const result = await configManager.getWorkspaceConfig();
      expect(result).toEqual(config);
    });

    it('should return defaults when no config file exists', async () => {
      const result = await configManager.getWorkspaceConfig();
      expect(result.schemaDirectory).toBe('weaver/');
      expect(result.enabledByDefault).toBe(true);
    });
  });

  describe('getProjectConfig', () => {
    it('should merge workspace and project configs', async () => {
      const workspaceConfig = createMockWorkspaceConfig({
        defaultVersion: '1.0.0',
        schemaDirectory: 'weaver/'
      });
      
      const projectConfig = createMockProjectConfig({
        version: '2.0.0',
        schemaDirectory: 'custom-weaver/'
      });

      const result = configManager.mergeConfigs(workspaceConfig, projectConfig);
      
      expect(result.version).toBe('2.0.0');
      expect(result.schemaDirectory).toBe('custom-weaver/');
      expect(result.enabled).toBe(true);
    });
  });

  describe('validateConfig', () => {
    it('should validate correct configuration', () => {
      const config = createMockProjectConfig();
      const result = configManager.validateConfig(config);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid configuration', () => {
      const config = createMockProjectConfig({
        schemaDirectory: '/invalid/path'
      });
      
      const result = configManager.validateConfig(config);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
```

#### 3. Cache Manager Tests
Implement `src/utils/cache-manager.spec.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CacheManager } from '../cache-manager';
import { createMockProjectConfig } from '../../test/utils';

describe('CacheManager', () => {
  let cacheManager: CacheManager;
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempWorkspace();
    cacheManager = new CacheManager({
      cacheDirectory: path.join(tempDir, '.nx-weaver-cache')
    });
  });

  afterEach(() => {
    cleanupTempWorkspace(tempDir);
  });

  describe('getCacheKey', () => {
    it('should generate consistent cache keys', () => {
      const project = 'test-project';
      const operation = 'validate';
      const files = ['schema.yaml'];
      const config = createMockProjectConfig();

      const key1 = cacheManager.getCacheKey(project, operation, files, config);
      const key2 = cacheManager.getCacheKey(project, operation, files, config);

      expect(key1).toBe(key2);
    });

    it('should generate different keys for different inputs', () => {
      const project = 'test-project';
      const operation = 'validate';
      const files1 = ['schema1.yaml'];
      const files2 = ['schema2.yaml'];
      const config = createMockProjectConfig();

      const key1 = cacheManager.getCacheKey(project, operation, files1, config);
      const key2 = cacheManager.getCacheKey(project, operation, files2, config);

      expect(key1).not.toBe(key2);
    });
  });

  describe('cache operations', () => {
    it('should store and retrieve cache entries', async () => {
      const key = 'test-key';
      const result: WeaverResult = {
        success: true,
        output: 'test output',
        duration: 100
      };

      await cacheManager.storeCacheResult(key, result);
      const retrieved = await cacheManager.getCacheResult(key);

      expect(retrieved).toEqual(result);
    });

    it('should validate cache entries', async () => {
      const key = 'test-key';
      const result: WeaverResult = {
        success: true,
        output: 'test output',
        duration: 100
      };

      await cacheManager.storeCacheResult(key, result);
      const isValid = await cacheManager.isCacheValid(key);

      expect(isValid).toBe(true);
    });
  });
});
```

### Integration Tests

#### 1. Executor Integration Tests
Implement `src/executors/integration.spec.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateExecutor } from '../validate/executor';
import { generateExecutor } from '../generate/executor';
import { createMockExecutorContext } from '../../test/utils';

describe('Executor Integration', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempWorkspace();
  });

  afterEach(() => {
    cleanupTempWorkspace(tempDir);
  });

  describe('validate executor', () => {
    it('should validate schema files', async () => {
      const context = createMockExecutorContext({
        root: tempDir
      });

      // Create test schema file
      const schemaDir = path.join(tempDir, 'weaver');
      fs.mkdirSync(schemaDir, { recursive: true });
      fs.writeFileSync(
        path.join(schemaDir, 'schema.yaml'),
        'name: test\nversion: 1.0.0'
      );

      const result = await validateExecutor({}, context);

      expect(result.success).toBe(true);
    });
  });

  describe('generate executor', () => {
    it('should generate code from schemas', async () => {
      const context = createMockExecutorContext({
        root: tempDir
      });

      // Create test schema file
      const schemaDir = path.join(tempDir, 'weaver');
      fs.mkdirSync(schemaDir, { recursive: true });
      fs.writeFileSync(
        path.join(schemaDir, 'schema.yaml'),
        'name: test\nversion: 1.0.0'
      );

      const result = await generateExecutor({}, context);

      expect(result.success).toBe(true);
      
      // Check generated files
      const outputDir = path.join(tempDir, 'dist', 'weaver');
      expect(fs.existsSync(outputDir)).toBe(true);
    });
  });
});
```

#### 2. Target Generation Integration Tests
Implement `src/utils/target-generator.integration.spec.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TargetGenerator } from '../target-generator';
import { createMockProjectConfig } from '../../test/utils';

describe('Target Generator Integration', () => {
  let targetGenerator: TargetGenerator;
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempWorkspace();
    targetGenerator = new TargetGenerator(tempDir);
  });

  afterEach(() => {
    cleanupTempWorkspace(tempDir);
  });

  it('should generate Weaver targets for project', async () => {
    const project = 'test-project';
    const config = createMockProjectConfig();

    const targets = targetGenerator.generateWeaverTargets(project, config);

    expect(targets['weaver-validate']).toBeDefined();
    expect(targets['weaver-generate']).toBeDefined();
    expect(targets['weaver-docs']).toBeDefined();
    expect(targets['weaver-clean']).toBeDefined();
  });

  it('should integrate with build targets', async () => {
    const project = 'test-project';
    const config = createMockProjectConfig();
    const buildTarget: TargetConfiguration = {
      executor: '@nx/js:tsc',
      options: {}
    };

    const integratedTarget = targetGenerator.integrateWithBuildTarget(
      project,
      buildTarget,
      config
    );

    expect(integratedTarget.dependsOn).toContain('weaver-generate');
  });
});
```

### Performance Tests

#### 1. Cache Performance Tests
Implement `src/test/performance/cache.spec.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CacheManager } from '../../utils/cache-manager';
import { createMockProjectConfig } from '../utils';

describe('Cache Performance', () => {
  let cacheManager: CacheManager;
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempWorkspace();
    cacheManager = new CacheManager({
      cacheDirectory: path.join(tempDir, '.nx-weaver-cache')
    });
  });

  afterEach(() => {
    cleanupTempWorkspace(tempDir);
  });

  it('should handle large cache entries efficiently', async () => {
    const largeResult: WeaverResult = {
      success: true,
      output: 'x'.repeat(1024 * 1024), // 1MB output
      duration: 1000
    };

    const startTime = Date.now();
    await cacheManager.storeCacheResult('large-key', largeResult);
    const storeTime = Date.now() - startTime;

    expect(storeTime).toBeLessThan(1000); // Should complete in <1s

    const retrieveStart = Date.now();
    const retrieved = await cacheManager.getCacheResult('large-key');
    const retrieveTime = Date.now() - retrieveStart;

    expect(retrieveTime).toBeLessThan(500); // Should complete in <500ms
    expect(retrieved).toEqual(largeResult);
  });

  it('should handle concurrent cache operations', async () => {
    const operations = Array.from({ length: 100 }, (_, i) => ({
      key: `key-${i}`,
      result: {
        success: true,
        output: `result-${i}`,
        duration: 100
      }
    }));

    const startTime = Date.now();
    
    await Promise.all(
      operations.map(op => 
        cacheManager.storeCacheResult(op.key, op.result)
      )
    );

    const storeTime = Date.now() - startTime;
    expect(storeTime).toBeLessThan(5000); // Should complete in <5s
  });
});
```

#### 2. Build Impact Tests
Implement `src/test/performance/build-impact.spec.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WeaverPlugin } from '../../index';
import { createMockExecutorContext } from '../utils';

describe('Build Impact Performance', () => {
  let plugin: WeaverPlugin;
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempWorkspace();
    plugin = new WeaverPlugin(tempDir);
  });

  afterEach(() => {
    cleanupTempWorkspace(tempDir);
  });

  it('should have minimal impact on build times for unchanged schemas', async () => {
    const context = createMockExecutorContext({ root: tempDir });
    
    // First run
    const firstStart = Date.now();
    await plugin.validateProject('test-project', context);
    const firstDuration = Date.now() - firstStart;

    // Second run (should use cache)
    const secondStart = Date.now();
    await plugin.validateProject('test-project', context);
    const secondDuration = Date.now() - secondStart;

    // Cache hit should be much faster
    expect(secondDuration).toBeLessThan(firstDuration * 0.1);
    expect(secondDuration).toBeLessThan(5000); // <5s impact
  });
});
```

### End-to-End Tests

#### 1. Complete Workflow Tests
Implement `src/test/e2e/workflow.spec.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WeaverPlugin } from '../../index';
import { createMockExecutorContext } from '../utils';

describe('End-to-End Workflow', () => {
  let plugin: WeaverPlugin;
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempWorkspace();
    plugin = new WeaverPlugin(tempDir);
  });

  afterEach(() => {
    cleanupTempWorkspace(tempDir);
  });

  it('should complete full Weaver workflow', async () => {
    const context = createMockExecutorContext({ root: tempDir });

    // 1. Initialize workspace
    await plugin.initWorkspace({
      defaultVersion: '1.0.0',
      schemaDirectory: 'weaver/'
    });

    // 2. Set up project
    await plugin.setupProject('test-project', {
      version: '1.0.0',
      enabled: true
    });

    // 3. Create schema file
    const schemaDir = path.join(tempDir, 'test-project', 'weaver');
    fs.mkdirSync(schemaDir, { recursive: true });
    fs.writeFileSync(
      path.join(schemaDir, 'schema.yaml'),
      'name: test\nversion: 1.0.0'
    );

    // 4. Validate schema
    const validateResult = await plugin.validateProject('test-project', context);
    expect(validateResult.success).toBe(true);

    // 5. Generate code
    const generateResult = await plugin.generateProject('test-project', context);
    expect(generateResult.success).toBe(true);

    // 6. Generate docs
    const docsResult = await plugin.generateDocs('test-project', context);
    expect(docsResult.success).toBe(true);

    // 7. Verify generated files
    const outputDir = path.join(tempDir, 'test-project', 'dist', 'weaver');
    expect(fs.existsSync(outputDir)).toBe(true);
    
    const docsDir = path.join(tempDir, 'test-project', 'dist', 'weaver-docs');
    expect(fs.existsSync(docsDir)).toBe(true);
  });
});
```

### Test Coverage Requirements

#### 1. Coverage Targets
- **Unit Tests**: >90% line coverage
- **Integration Tests**: >80% line coverage
- **Performance Tests**: Critical path coverage
- **E2E Tests**: Main workflow coverage

#### 2. Coverage Reporting
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    // ... other config
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/types/**/*.ts',
        'src/test/**/*.ts',
        '**/*.spec.ts',
        '**/*.test.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    }
  }
});
```

## Implementation Details

### Vitest Benefits
- **Fast execution**: Native ESM support and optimized test runner
- **TypeScript support**: First-class TypeScript support without additional configuration
- **Watch mode**: Intelligent file watching with fast re-runs
- **Parallel execution**: Tests run in parallel by default for better performance
- **Built-in coverage**: Integrated coverage reporting with v8 provider
- **Mocking**: Built-in mocking capabilities with `vi` global
- **Snapshot testing**: Native snapshot testing support
- **UI mode**: Interactive test UI for debugging

### Test Organization
- Group tests by functionality
- Use descriptive test names
- Implement proper test isolation
- Use shared test utilities

### Mock Strategy
- Use Vitest's built-in `vi` global for mocking
- Mock external dependencies (file system, network)
- Use realistic test data
- Implement proper cleanup
- Test error scenarios

### Vitest-Specific Features
```typescript
// Example of using vi for mocking
import { vi, describe, it, expect } from 'vitest';

describe('Mocking with Vitest', () => {
  it('should mock file system operations', async () => {
    const fsMock = vi.mock('fs', () => ({
      readFileSync: vi.fn().mockReturnValue('mocked content'),
      writeFileSync: vi.fn(),
      existsSync: vi.fn().mockReturnValue(true)
    }));

    // Test implementation
  });

  it('should use vi.spyOn for method mocking', () => {
    const obj = { method: () => 'original' };
    const spy = vi.spyOn(obj, 'method').mockReturnValue('mocked');
    
    expect(obj.method()).toBe('mocked');
    expect(spy).toHaveBeenCalled();
  });
});
```

### Performance Testing
- Measure actual performance impact
- Test with realistic data sizes
- Monitor memory usage
- Validate performance requirements

## Success Criteria
- Comprehensive test coverage (>90% for unit tests)
- All critical paths tested
- Performance requirements validated
- Error scenarios covered
- Integration tests pass
- E2E tests demonstrate full workflow
- Tests run efficiently (<30s for unit tests with Vitest)
- Clear test documentation
- CI/CD integration ready
- Vitest configuration optimized for performance 