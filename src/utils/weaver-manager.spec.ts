import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WeaverManager } from './weaver-manager';
import {
  createMockWorkspaceConfig,
  createTempWorkspace,
  cleanupTempWorkspace,
} from '../test/utils';
import fs from 'node:fs';
import path from 'node:path';

// Mock axios
vi.mock('axios', () => ({
  default: vi.fn(),
}));

// Mock fs-extra
vi.mock('fs-extra', () => ({
  default: {
    ensureDir: vi.fn(),
    writeFile: vi.fn(),
    readFile: vi.fn(),
    existsSync: vi.fn(),
    statSync: vi.fn(),
    readdirSync: vi.fn(),
    removeSync: vi.fn(),
    copyFileSync: vi.fn(),
    chmodSync: vi.fn(),
    createWriteStream: vi.fn(),
    createReadStream: vi.fn(),
    remove: vi.fn(),
    access: vi.fn(),
    stat: vi.fn(),
    constants: {
      X_OK: 1,
    },
  },
}));

// Mock fs
vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    chmodSync: vi.fn(),
    mkdirSync: vi.fn(),
    readdirSync: vi.fn(),
    unlinkSync: vi.fn(),
    rmdirSync: vi.fn(),
    mkdtempSync: vi.fn(),
    rmSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
  existsSync: vi.fn(),
  chmodSync: vi.fn(),
  mkdirSync: vi.fn(),
  readdirSync: vi.fn(),
  unlinkSync: vi.fn(),
  rmdirSync: vi.fn(),
  mkdtempSync: vi.fn(),
  rmSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

// Mock child_process
vi.mock('node:child_process', () => ({
  exec: vi.fn(),
}));

// Mock util
vi.mock('node:util', () => ({
  promisify: vi.fn(),
}));

// Mock utils index
vi.mock('./index.js', () => ({
  writeFile: vi.fn(),
  readFile: vi.fn(),
  fileExists: vi.fn(),
}));

describe('WeaverManager', () => {
  let weaverManager: WeaverManager;
  let tempDir: string;
  let mockAxios: any;
  let mockFsExtra: any;
  let mockFs: any;

  beforeEach(async () => {
    tempDir = '/tmp/nx-weaver-test-12345';
    weaverManager = new WeaverManager({
      cacheDirectory: path.join(tempDir, '.nx-weaver-cache'),
      enableLogging: false, // Disable logging for tests
    });

    // Get mocked modules
    mockAxios = (await import('axios')).default;
    mockFsExtra = (await import('fs-extra')).default;
    mockFs = await import('node:fs');

    // Setup utils mock
    const { writeFile, readFile, fileExists } = await import('./index.js');
    vi.mocked(writeFile).mockImplementation(() => {});
    vi.mocked(readFile).mockImplementation(() => '');
    vi.mocked(fileExists).mockImplementation(() => false);

    // Setup default mocks
    mockFsExtra.ensureDir.mockResolvedValue(undefined);
    mockFsExtra.writeFile.mockResolvedValue(undefined);
    mockFsExtra.existsSync.mockReturnValue(false);
    mockFsExtra.statSync.mockReturnValue({ isFile: () => true, mode: 0o755 });
    mockFsExtra.readdirSync.mockReturnValue(['1.0.0', '1.1.0']);
    mockFsExtra.removeSync.mockImplementation(() => {});
    mockFsExtra.copyFileSync.mockImplementation(() => {});
    mockFsExtra.chmodSync.mockImplementation(() => {});
    mockFsExtra.remove.mockResolvedValue(undefined);
    mockFsExtra.access.mockResolvedValue(undefined);
    mockFsExtra.stat.mockResolvedValue({ size: 1024 });
    mockFsExtra.createReadStream.mockReturnValue({
      on: vi.fn().mockReturnThis(),
    });

    // Mock fs methods
    mockFs.existsSync.mockReturnValue(false);
    mockFs.mkdirSync.mockImplementation(() => {});
    mockFs.readdirSync.mockReturnValue(['1.0.0', '1.1.0']);
    mockFs.unlinkSync.mockImplementation(() => {});
    mockFs.rmdirSync.mockImplementation(() => {});
    mockFs.mkdtempSync.mockReturnValue('/tmp/nx-weaver-test-12345');
    mockFs.rmSync.mockImplementation(() => {});

    // Mock child_process and util for validateWeaver
    const mockChildProcess = await import('node:child_process');
    const mockUtil = await import('node:util');

    vi.mocked(mockChildProcess.exec).mockReturnValue({
      stdout: 'version info',
      stderr: '',
    } as any);

    vi.mocked(mockUtil.promisify).mockReturnValue(
      vi.fn().mockResolvedValue({ stdout: 'version info', stderr: '' })
    );

    // Reset axios mock
    mockAxios.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('downloadWeaver', () => {
    it('should reject invalid version format', async () => {
      const version = 'invalid';
      mockAxios.mockRejectedValue(new Error('Download failed'));

      await expect(weaverManager.downloadWeaver(version)).rejects.toThrow(
        'Invalid version format: invalid. Expected format: x.y.z'
      );
    });

    it('should handle download failures gracefully', async () => {
      const version = '1.0.0'; // Use valid version format
      mockAxios.mockRejectedValue(new Error('Download failed'));

      await expect(weaverManager.downloadWeaver(version)).rejects.toThrow(
        'Failed to download Weaver version 1.0.0'
      );
    });

    it('should use cached version when available', async () => {
      const version = '1.0.0';
      const cachedPath = path.join(tempDir, '.nx-weaver-cache', version, 'weaver');

      // Mock that the executable exists and is valid
      mockFs.existsSync.mockImplementation((path: string) => {
        return path === cachedPath;
      });
      mockFsExtra.access.mockResolvedValue(undefined);
      const { promisify } = await import('node:util');
      vi.mocked(promisify).mockImplementation(() => {
        return vi.fn().mockResolvedValue({ stdout: 'version info', stderr: '' });
      });

      const result = await weaverManager.downloadWeaver(version);

      expect(result).toBe(cachedPath);
      expect(mockAxios).not.toHaveBeenCalled();
    });
  });

  describe('validateWeaver', () => {
    it('should validate existing Weaver executable', async () => {
      const version = '1.0.0';

      mockFs.existsSync.mockReturnValue(true);
      mockFsExtra.access.mockResolvedValue(undefined);
      const { exec } = await import('node:child_process');
      vi.mocked(exec).mockImplementation((_command, _options, callback) => {
        if (callback) {
          callback(null, 'version info', '');
        }
        return {} as any;
      });

      const isValid = await weaverManager.validateWeaver(version);
      expect(isValid).toBe(true);
    });

    it('should return false for non-existent executable', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const isValid = await weaverManager.validateWeaver('non-existent');
      expect(isValid).toBe(false);
    });

    it('should return false when executable is not accessible', async () => {
      const version = '1.0.0';

      mockFs.existsSync.mockReturnValue(true);
      mockFsExtra.access.mockRejectedValue(new Error('Permission denied'));

      const isValid = await weaverManager.validateWeaver(version);
      expect(isValid).toBe(false);
    });

    it('should return false when version command fails', async () => {
      const version = '1.0.0';

      mockFs.existsSync.mockReturnValue(true);
      mockFsExtra.access.mockResolvedValue(undefined);

      // Mock the promisified exec to throw an error
      const { promisify } = await import('node:util');
      vi.mocked(promisify).mockImplementation(() => {
        return vi.fn().mockRejectedValue(new Error('Command failed'));
      });

      const isValid = await weaverManager.validateWeaver(version);
      expect(isValid).toBe(false);
    });
  });

  describe('getWeaverPath', () => {
    it('should return correct path for version', () => {
      const version = '1.0.0';
      const expectedPath = path.join(tempDir, '.nx-weaver-cache', version, 'weaver');

      const result = weaverManager.getWeaverPath(version);
      expect(result).toBe(expectedPath);
    });
  });

  describe('getInstalledVersions', () => {
    it('should return list of installed versions', () => {
      // Mock readdirSync to return directory entries with file types
      const mockEntries = [
        { name: '1.0.0', isDirectory: () => true },
        { name: '1.1.0', isDirectory: () => true },
        { name: 'metadata.json', isDirectory: () => false },
      ];
      mockFs.readdirSync.mockReturnValue(mockEntries);
      mockFs.existsSync.mockReturnValue(true);

      const versions = weaverManager.getInstalledVersions();

      expect(versions).toContain('1.0.0');
      expect(versions).toContain('1.1.0');
      expect(versions).not.toContain('metadata.json');
    });

    it('should return empty array when cache directory does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const versions = weaverManager.getInstalledVersions();
      expect(versions).toEqual([]);
    });
  });

  describe('cleanupOldVersions', () => {
    it('should cleanup old versions while keeping specified ones', async () => {
      const keepVersions = ['1.0.0'];

      // Mock readdirSync to return directory entries with file types
      const mockEntries = [
        { name: '1.0.0', isDirectory: () => true },
        { name: '1.1.0', isDirectory: () => true },
        { name: '1.2.0', isDirectory: () => true },
        { name: 'metadata.json', isDirectory: () => false },
      ];
      mockFs.readdirSync.mockReturnValue(mockEntries);
      mockFs.existsSync.mockReturnValue(true);

      await weaverManager.cleanupOldVersions(keepVersions);

      // Verify that fs-extra.remove was called for versions not in keepVersions
      expect(mockFsExtra.remove).toHaveBeenCalledWith(expect.stringContaining('1.1.0'));
      expect(mockFsExtra.remove).toHaveBeenCalledWith(expect.stringContaining('1.2.0'));
      expect(mockFsExtra.remove).not.toHaveBeenCalledWith(expect.stringContaining('1.0.0'));
    });

    it('should handle cleanup when cache directory does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);

      await expect(weaverManager.cleanupOldVersions(['1.0.0'])).resolves.toBeUndefined();
    });
  });

  describe('getMetadata', () => {
    it('should return metadata for existing version', async () => {
      const version = '1.0.0';
      const mockMetadata = {
        [version]: {
          version: '1.0.0',
          platform: 'darwin',
          architecture: 'x64',
          downloadUrl: 'https://example.com/weaver-1.0.0.tar.gz',
          executablePath: '/path/to/weaver',
          downloadedAt: '2024-01-01T00:00:00Z',
          fileSize: 1024,
        },
      };

      // Mock the metadata file path check
      mockFs.existsSync.mockImplementation((filePath: string) => {
        return filePath.endsWith('metadata.json');
      });

      // Mock the readFile function from utils
      const { readFile } = await import('./index.js');
      vi.mocked(readFile).mockReturnValue(JSON.stringify(mockMetadata));

      const metadata = await weaverManager.getMetadata(version);

      expect(metadata).toEqual(mockMetadata[version]);
    });

    it('should return null for non-existent version', async () => {
      const version = 'non-existent';
      const mockMetadata = {
        '1.0.0': {
          version: '1.0.0',
          platform: 'darwin',
          architecture: 'x64',
          downloadUrl: 'https://example.com/weaver-1.0.0.tar.gz',
          executablePath: '/path/to/weaver',
          downloadedAt: '2024-01-01T00:00:00Z',
        },
      };

      mockFs.existsSync.mockReturnValue(true);

      const { readFile } = await import('./index.js');
      vi.mocked(readFile).mockReturnValue(JSON.stringify(mockMetadata));

      const metadata = await weaverManager.getMetadata(version);
      expect(metadata).toBeNull();
    });

    it('should return null when metadata file does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const metadata = await weaverManager.getMetadata('1.0.0');
      expect(metadata).toBeNull();
    });

    it('should return null when metadata file is invalid JSON', async () => {
      mockFs.existsSync.mockReturnValue(true);

      const { readFile } = await import('./index.js');
      vi.mocked(readFile).mockReturnValue('invalid json');

      const metadata = await weaverManager.getMetadata('1.0.0');
      expect(metadata).toBeNull();
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      const mockEntries = [
        { name: '1.0.0', isDirectory: () => true },
        { name: '1.1.0', isDirectory: () => true },
      ];
      mockFs.readdirSync.mockReturnValue(mockEntries);
      mockFs.existsSync.mockReturnValue(true);

      const { promisify } = await import('node:util');
      vi.mocked(promisify).mockImplementation(() => {
        return vi.fn().mockResolvedValue({ stdout: '1024', stderr: '' });
      });

      const stats = await weaverManager.getCacheStats();

      expect(stats.totalVersions).toBe(2);
      expect(stats.versions).toHaveLength(2);
      expect(stats.versions[0]).toHaveProperty('version');
      expect(stats.versions[0]).toHaveProperty('size');
      expect(stats.versions[0]).toHaveProperty('lastUsed');
    });

    it('should handle errors gracefully', async () => {
      mockFs.readdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const stats = await weaverManager.getCacheStats();

      expect(stats.totalVersions).toBe(0);
      expect(stats.totalSize).toBe(0);
      expect(stats.versions).toEqual([]);
    });
  });

  describe('configuration', () => {
    it('should use custom configuration options', () => {
      const customManager = new WeaverManager({
        cacheDirectory: '/custom/cache',
        downloadTimeout: 60000,
        maxRetries: 5,
        verifyHashes: false,
        enableLogging: true,
        minDiskSpace: 200,
      });

      expect(customManager).toBeInstanceOf(WeaverManager);
    });

    it('should use default configuration when not specified', () => {
      const defaultManager = new WeaverManager();

      expect(defaultManager).toBeInstanceOf(WeaverManager);
    });
  });
});
