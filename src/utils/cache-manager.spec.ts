import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CacheManager } from './cache-manager';
import {
  createMockValidationResult,
  createTempWorkspace,
  cleanupTempWorkspace,
} from '../test/utils';
import fs from 'node:fs';
import path from 'node:path';

describe('CacheManager', () => {
  let cacheManager: CacheManager;
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempWorkspace();
    cacheManager = new CacheManager({
      cacheDirectory: path.join(tempDir, '.nx-weaver-cache'),
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
      const config = { version: '1.0.0', schemaDirectory: 'weaver/' };

      const key1 = cacheManager.getCacheKey(project, operation, files, config);
      const key2 = cacheManager.getCacheKey(project, operation, files, config);

      expect(key1).toBe(key2);
    });

    it('should generate different keys for different inputs', () => {
      const project = 'test-project';
      const operation = 'validate';
      const files1 = ['schema1.yaml'];
      const files2 = ['schema2.yaml'];
      const config = { version: '1.0.0', schemaDirectory: 'weaver/' };

      const key1 = cacheManager.getCacheKey(project, operation, files1, config);
      const key2 = cacheManager.getCacheKey(project, operation, files2, config);

      expect(key1).not.toBe(key2);
    });
  });

  describe('cache operations', () => {
    it('should store and retrieve cache entries', async () => {
      const project = 'test-project';
      const operation = 'validate';
      const files = ['schema.yaml'];
      const config = { version: '1.0.0', schemaDirectory: 'weaver/' };
      const key = cacheManager.getCacheKey(project, operation, files, config);
      const result = createMockValidationResult({
        valid: true,
        errors: [],
        warnings: [],
      });

      await cacheManager.storeCacheResult(key, result, project, operation, files, config);
      const retrieved = await cacheManager.getCacheResult(key);

      expect(retrieved).toEqual(result);
    });

    it('should validate cache entries', async () => {
      const project = 'test-project';
      const operation = 'validate';
      const files = ['schema.yaml'];
      const config = { version: '1.0.0', schemaDirectory: 'weaver/' };
      const key = cacheManager.getCacheKey(project, operation, files, config);
      const result = createMockValidationResult({
        valid: true,
        errors: [],
        warnings: [],
      });

      await cacheManager.storeCacheResult(key, result, project, operation, files, config);
      const isValid = await cacheManager.isCacheValid(key);

      expect(isValid).toBe(true);
    });

    it('should return null for non-existent cache entries', async () => {
      const retrieved = await cacheManager.getCacheResult('non-existent-key');
      expect(retrieved).toBeNull();
    });

    it('should return false for invalid cache entries', async () => {
      const isValid = await cacheManager.isCacheValid('non-existent-key');
      expect(isValid).toBe(false);
    });
  });

  describe('cache invalidation', () => {
    it('should clear all cache entries', async () => {
      const project = 'test-project';
      const operation = 'validate';
      const files = ['schema.yaml'];
      const config = { version: '1.0.0', schemaDirectory: 'weaver/' };
      const key1 = cacheManager.getCacheKey(project, 'validate', files, config);
      const key2 = cacheManager.getCacheKey(project, 'generate', files, config);
      const result = createMockValidationResult();

      await cacheManager.storeCacheResult(key1, result, project, 'validate', files, config);
      await cacheManager.storeCacheResult(key2, result, project, 'generate', files, config);
      await cacheManager.clearCache();

      const retrieved1 = await cacheManager.getCacheResult(key1);
      const retrieved2 = await cacheManager.getCacheResult(key2);

      expect(retrieved1).toBeNull();
      expect(retrieved2).toBeNull();
    });

    it('should handle cache invalidation gracefully when entry does not exist', async () => {
      await expect(cacheManager.invalidateCache('non-existent-project')).resolves.not.toThrow();
    });
  });

  describe('cache statistics', () => {
    it('should track cache statistics', async () => {
      const project = 'test-project';
      const operation = 'validate';
      const files = ['schema.yaml'];
      const config = { version: '1.0.0', schemaDirectory: 'weaver/' };
      const key1 = cacheManager.getCacheKey(project, 'validate', files, config);
      const key2 = cacheManager.getCacheKey(project, 'generate', files, config);
      const result = createMockValidationResult();

      await cacheManager.storeCacheResult(key1, result, project, 'validate', files, config);
      await cacheManager.storeCacheResult(key2, result, project, 'generate', files, config);

      const stats = await cacheManager.getCacheStats();

      expect(stats.totalEntries).toBeGreaterThanOrEqual(2);
      expect(stats.totalSize).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should handle file system errors gracefully', async () => {
      // Create a cache manager with invalid directory
      const invalidCacheManager = new CacheManager({
        cacheDirectory: '/invalid/path/that/does/not/exist',
      });

      const result = createMockValidationResult();

      // Should not throw, but may not succeed
      await expect(
        invalidCacheManager.storeCacheResult(
          'test-key',
          result,
          'test-project',
          'validate',
          ['schema.yaml'],
          {}
        )
      ).resolves.not.toThrow();
    });
  });
});
