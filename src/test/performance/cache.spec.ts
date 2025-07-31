import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CacheManager } from '../../utils/cache-manager';
import { createMockValidationResult, createTempWorkspace, cleanupTempWorkspace } from '../utils';
import { join } from 'node:path';

describe('Cache Performance', () => {
  let cacheManager: CacheManager;
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempWorkspace();
    cacheManager = new CacheManager({
      cacheDirectory: join(tempDir, '.nx-weaver-cache'),
    });
  });

  afterEach(() => {
    cleanupTempWorkspace(tempDir);
  });

  it('should handle large cache entries efficiently', async () => {
    const project = 'test-project';
    const operation = 'validate';
    const files = ['large-schema.yaml'];
    const config = { version: '1.0.0', schemaDirectory: 'weaver/' };
    const key = cacheManager.getCacheKey(project, operation, files, config);

    const largeResult = createMockValidationResult({
      valid: true,
      errors: [],
      warnings: Array(1000)
        .fill('Large warning message')
        .map((msg, i) => `${msg} ${i}`),
    });

    const startTime = Date.now();
    await cacheManager.storeCacheResult(key, largeResult, project, operation, files, config);
    const storeTime = Date.now() - startTime;

    expect(storeTime).toBeLessThan(5000); // Should complete in <5s

    const retrieveStart = Date.now();
    const retrieved = await cacheManager.getCacheResult(key);
    const retrieveTime = Date.now() - retrieveStart;

    expect(retrieveTime).toBeLessThan(2000); // Should complete in <2s
    expect(retrieved).toEqual(largeResult);
  });

  it('should handle concurrent cache operations', async () => {
    const operations = Array.from({ length: 50 }, (_, i) => ({
      project: `project-${i}`,
      operation: 'validate',
      files: [`schema-${i}.yaml`],
      config: { version: '1.0.0', schemaDirectory: 'weaver/' },
      result: createMockValidationResult({
        valid: true,
        errors: [],
        warnings: [`Warning ${i}`],
      }),
    }));

    const startTime = Date.now();

    await Promise.all(
      operations.map((op) => {
        const key = cacheManager.getCacheKey(op.project, op.operation, op.files, op.config);
        return cacheManager.storeCacheResult(
          key,
          op.result,
          op.project,
          op.operation,
          op.files,
          op.config
        );
      })
    );

    const storeTime = Date.now() - startTime;
    expect(storeTime).toBeLessThan(10000); // Should complete in <10s

    // Verify all entries were stored
    for (const op of operations) {
      const key = cacheManager.getCacheKey(op.project, op.operation, op.files, op.config);
      const retrieved = await cacheManager.getCacheResult(key);
      expect(retrieved).toEqual(op.result);
    }
  });

  it('should handle cache key generation efficiently', () => {
    const project = 'test-project';
    const operation = 'validate';
    const files = Array(100)
      .fill(0)
      .map((_, i) => `file-${i}.yaml`);
    const config = {
      version: '1.0.0',
      schemaDirectory: 'weaver/',
      outputDirectory: 'dist/weaver/',
      args: { validate: files },
    };

    const startTime = Date.now();

    for (let i = 0; i < 1000; i++) {
      cacheManager.getCacheKey(project, operation, files, config);
    }

    const keyGenTime = Date.now() - startTime;
    expect(keyGenTime).toBeLessThan(2000); // Should complete in <2s
  });

  it('should handle cache statistics efficiently', async () => {
    // Store some cache entries
    const operations = Array.from({ length: 100 }, (_, i) => ({
      project: `project-${i}`,
      operation: 'validate',
      files: [`schema-${i}.yaml`],
      config: { version: '1.0.0', schemaDirectory: 'weaver/' },
      result: createMockValidationResult(),
    }));

    await Promise.all(
      operations.map((op) => {
        const key = cacheManager.getCacheKey(op.project, op.operation, op.files, op.config);
        return cacheManager.storeCacheResult(
          key,
          op.result,
          op.project,
          op.operation,
          op.files,
          op.config
        );
      })
    );

    const startTime = Date.now();
    const stats = await cacheManager.getCacheStats();
    const statsTime = Date.now() - startTime;

    expect(statsTime).toBeLessThan(1000); // Should complete in <1s
    expect(stats.totalEntries).toBeGreaterThanOrEqual(100);
    expect(stats.totalSize).toBeGreaterThan(0);
  });

  it('should handle cache cleanup efficiently', async () => {
    // Store many cache entries
    const operations = Array.from({ length: 200 }, (_, i) => ({
      project: `project-${i}`,
      operation: 'validate',
      files: [`schema-${i}.yaml`],
      config: { version: '1.0.0', schemaDirectory: 'weaver/' },
      result: createMockValidationResult(),
    }));

    await Promise.all(
      operations.map((op) => {
        const key = cacheManager.getCacheKey(op.project, op.operation, op.files, op.config);
        return cacheManager.storeCacheResult(
          key,
          op.result,
          op.project,
          op.operation,
          op.files,
          op.config
        );
      })
    );

    const startTime = Date.now();
    await cacheManager.clearCache();
    const cleanupTime = Date.now() - startTime;

    expect(cleanupTime).toBeLessThan(5000); // Should complete in <5s

    // Verify cache is empty
    const stats = await cacheManager.getCacheStats();
    expect(stats.totalEntries).toBe(0);
  });
});
