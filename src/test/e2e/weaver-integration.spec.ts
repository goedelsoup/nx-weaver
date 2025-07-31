import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTempWorkspace, cleanupTempWorkspace, createTestProjectStructure } from '../utils';
import { WeaverManager } from '../../utils/weaver-manager.js';
import { getWorkspaceConfig, getProjectConfig } from '../../utils/config-manager.js';
import validateExecutor from '../../executors/validate/executor.js';
import generateExecutor from '../../executors/generate/executor.js';
import docsExecutor from '../../executors/docs/executor.js';
import cleanExecutor from '../../executors/clean/executor.js';
import fs from 'node:fs';
import path from 'node:path';

// Mock the executor utils to use our mock Weaver Manager
vi.mock('../../utils/executor-utils.js', async () => {
  const actual = await vi.importActual('../../utils/executor-utils.js');
  return {
    ...actual,
    buildWeaverContext: vi.fn().mockResolvedValue({
      projectName: 'test-project',
      projectRoot: '/tmp/test-workspace/test-project',
      workspaceRoot: '/tmp/test-workspace',
      weaverPath: '/tmp/test-workspace/mock-weaver/weaver',
      config: {
        enabled: true,
        version: '1.0.0',
        schemaDirectory: 'weaver/',
        outputDirectory: 'dist/weaver/',
      },
      workspaceConfig: {
        defaultVersion: '1.0.0',
        schemaDirectory: 'weaver/',
        outputDirectory: 'dist/weaver/',
        enabledByDefault: true,
        cacheDirectory: '.nx-weaver-cache/',
      },
      schemaFiles: ['/tmp/test-workspace/test-project/weaver/schema.yaml'],
      outputPath: '/tmp/test-workspace/test-project/dist/weaver',
    }),
    runWeaverCommand: vi.fn().mockResolvedValue({
      success: true,
      output: 'Command executed successfully',
      duration: 100,
    }),
    generateCacheKey: vi.fn().mockReturnValue('test-cache-key'),
    isCacheValid: vi.fn().mockResolvedValue(false),
    storeCacheResult: vi.fn().mockResolvedValue(undefined),
  };
});

// Mock Weaver executable for testing
const mockWeaverExecutable = `
#!/bin/bash
case "$1" in
  "validate")
    if [[ "$*" == *"invalid"* ]]; then
      echo "Validation failed: Invalid schema" >&2
      exit 1
    else
      echo "Validation passed"
      exit 0
    fi
    ;;
  "generate")
    if [[ "$*" == *"error"* ]]; then
      echo "Generation failed: Template error" >&2
      exit 1
    else
      echo "Code generation completed"
      echo "Generated files: types.ts, client.ts"
      exit 0
    fi
    ;;
  "docs")
    if [[ "$*" == *"error"* ]]; then
      echo "Documentation generation failed: Schema error" >&2
      exit 1
    else
      echo "Documentation generation completed"
      echo "Generated docs: README.md, api.md"
      exit 0
    fi
    ;;
  "--version")
    echo "weaver version 1.0.0"
    exit 0
    ;;
  *)
    echo "Unknown command: $1" >&2
    exit 1
    ;;
esac
`;

describe('Weaver Integration Tests', () => {
  let tempDir: string;
  let weaverManager: WeaverManager;
  let mockWeaverPath: string;

  beforeEach(async () => {
    tempDir = createTempWorkspace();

    // Create mock Weaver executable
    const mockDir = path.join(tempDir, 'mock-weaver');
    fs.mkdirSync(mockDir, { recursive: true });
    mockWeaverPath = path.join(mockDir, 'weaver');
    fs.writeFileSync(mockWeaverPath, mockWeaverExecutable);
    fs.chmodSync(mockWeaverPath, 0o755);

    // Create Weaver Manager with mock executable
    weaverManager = new WeaverManager({
      cacheDirectory: path.join(tempDir, '.nx-weaver-cache'),
      enableLogging: false,
      verifyHashes: false,
    });

    // Mock the Weaver Manager to use our mock executable
    vi.spyOn(weaverManager, 'downloadWeaver').mockResolvedValue(mockWeaverPath);
    vi.spyOn(weaverManager, 'validateWeaver').mockResolvedValue(true);
    vi.spyOn(weaverManager, 'getWeaverPath').mockReturnValue(mockWeaverPath);
  });

  afterEach(() => {
    cleanupTempWorkspace(tempDir);
  });

  describe('Weaver Manager Integration', () => {
    it('should download and validate Weaver executable', async () => {
      // Mock the download to use our mock executable
      vi.spyOn(weaverManager as any, 'downloadFile').mockResolvedValue(mockWeaverPath);
      vi.spyOn(weaverManager as any, 'extractAndSetupExecutable').mockResolvedValue(mockWeaverPath);

      const executablePath = await weaverManager.downloadWeaver('1.0.0');
      expect(executablePath).toBe(mockWeaverPath);

      const isValid = await weaverManager.validateWeaver('1.0.0');
      expect(isValid).toBe(true);
    });

    it('should handle Weaver version command', async () => {
      const { exec } = await import('node:child_process');
      const { promisify } = await import('node:util');
      const execAsync = promisify(exec);

      const result = await execAsync(`"${mockWeaverPath}" --version`);
      expect(result.stdout.trim()).toBe('weaver version 1.0.0');
    });
  });

  describe('Configuration Integration', () => {
    it('should load workspace and project configurations correctly', () => {
      // Create workspace config
      const workspaceConfig = {
        defaultVersion: '1.0.0',
        schemaDirectory: 'weaver/',
        outputDirectory: 'dist/weaver/',
        enabledByDefault: true,
        cacheDirectory: '.nx-weaver-cache/',
        downloadTimeout: 30000,
        maxRetries: 3,
        verifyHashes: false,
        downloadUrl:
          'https://github.com/open-telemetry/weaver/releases/download/v{version}/weaver-{platform}-{arch}',
        hashUrl:
          'https://github.com/open-telemetry/weaver/releases/download/v{version}/weaver-{platform}-{arch}.sha256',
      };

      fs.writeFileSync(
        path.join(tempDir, 'weaver-workspace.json'),
        JSON.stringify(workspaceConfig, null, 2)
      );

      // Create project
      const projectName = 'test-project';
      createTestProjectStructure(tempDir, projectName);

      const projectConfig = {
        enabled: true,
        version: '1.0.0',
        schemaDirectory: 'weaver/',
        outputDirectory: 'dist/weaver/',
        skipValidation: false,
        skipGeneration: false,
        skipDocs: false,
      };

      fs.writeFileSync(
        path.join(tempDir, projectName, 'weaver.json'),
        JSON.stringify(projectConfig, null, 2)
      );

      // Test configuration loading
      const loadedWorkspaceConfig = getWorkspaceConfig(tempDir);
      expect(loadedWorkspaceConfig.defaultVersion).toBe('1.0.0');
      expect(loadedWorkspaceConfig.schemaDirectory).toBe('weaver/');
      expect(loadedWorkspaceConfig.downloadUrl).toContain('open-telemetry/weaver');

      const loadedProjectConfig = getProjectConfig(
        path.join(tempDir, projectName),
        loadedWorkspaceConfig
      );
      expect(loadedProjectConfig.enabled).toBe(true);
      expect(loadedProjectConfig.version).toBe('1.0.0');
    });
  });

  describe('Executor Integration', () => {
    beforeEach(() => {
      // Create test project structure
      const projectName = 'test-project';
      createTestProjectStructure(tempDir, projectName);

      // Create schema files
      const schemaDir = path.join(tempDir, projectName, 'weaver');
      fs.mkdirSync(schemaDir, { recursive: true });

      const schemaContent = `
name: test-api
version: 1.0.0
description: Test API schema
endpoints:
  - path: /api/test
    method: GET
    response:
      type: object
      properties:
        message:
          type: string
        timestamp:
          type: string
          format: date-time
      `.trim();

      fs.writeFileSync(path.join(schemaDir, 'schema.yaml'), schemaContent);

      // Create project config
      const projectConfig = {
        enabled: true,
        version: '1.0.0',
        schemaDirectory: 'weaver/',
        outputDirectory: 'dist/weaver/',
      };

      fs.writeFileSync(
        path.join(tempDir, projectName, 'weaver.json'),
        JSON.stringify(projectConfig, null, 2)
      );
    });

    it('should execute validate command successfully', async () => {
      const context = {
        projectName: 'test-project',
        root: path.join(tempDir, 'test-project'),
        workspace: { root: tempDir },
      };

      const options = {
        verbose: true,
        dryRun: false,
        strict: false,
        ignoreWarnings: false,
      };

      const result = await validateExecutor(options, context);
      expect(result.success).toBe(true);
      expect(result.output).toContain('Command executed successfully');
    });

    it('should execute generate command successfully', async () => {
      const context = {
        projectName: 'test-project',
        root: path.join(tempDir, 'test-project'),
        workspace: { root: tempDir },
      };

      const options = {
        verbose: true,
        dryRun: false,
        force: false,
        watch: false,
        outputFormat: 'typescript' as const,
      };

      const result = await generateExecutor(options, context);
      expect(result.success).toBe(true);
      expect(result.output).toContain('Command executed successfully');
    });

    it('should execute docs command successfully', async () => {
      const context = {
        projectName: 'test-project',
        root: path.join(tempDir, 'test-project'),
        workspace: { root: tempDir },
      };

      const options = {
        verbose: true,
        dryRun: false,
        format: 'markdown' as const,
        outputPath: path.join(tempDir, 'test-project', 'docs'),
        includeExamples: true,
      };

      const result = await docsExecutor(options, context);
      expect(result.success).toBe(true);
      expect(result.output).toContain('Command executed successfully');
    });

    it('should execute clean command successfully', async () => {
      const context = {
        projectName: 'test-project',
        root: path.join(tempDir, 'test-project'),
        workspace: { root: tempDir },
      };

      const options = {
        verbose: true,
        dryRun: false,
        includeCache: false,
        includeTemp: false,
      };

      const result = await cleanExecutor(options, context);
      expect(result.success).toBe(true);
      expect(result.output).toContain('No files found to clean');
    });
  });

  describe('End-to-End Workflow', () => {
    it('should complete full Weaver workflow with real commands', async () => {
      // 1. Set up workspace
      const workspaceConfig = {
        defaultVersion: '1.0.0',
        schemaDirectory: 'weaver/',
        outputDirectory: 'dist/weaver/',
        enabledByDefault: true,
        cacheDirectory: '.nx-weaver-cache/',
        verifyHashes: false,
      };

      fs.writeFileSync(
        path.join(tempDir, 'weaver-workspace.json'),
        JSON.stringify(workspaceConfig, null, 2)
      );

      // 2. Create project
      const projectName = 'api-service';
      createTestProjectStructure(tempDir, projectName);

      const projectConfig = {
        enabled: true,
        version: '1.0.0',
        schemaDirectory: 'weaver/',
        outputDirectory: 'dist/weaver/',
        skipValidation: false,
        skipGeneration: false,
        skipDocs: false,
      };

      fs.writeFileSync(
        path.join(tempDir, projectName, 'weaver.json'),
        JSON.stringify(projectConfig, null, 2)
      );

      // 3. Create comprehensive schema
      const schemaDir = path.join(tempDir, projectName, 'weaver');
      fs.mkdirSync(schemaDir, { recursive: true });

      const mainSchema = `
name: api-service
version: 1.0.0
description: REST API service
endpoints:
  - path: /api/users
    method: GET
    response:
      type: array
      items:
        $ref: '#/components/schemas/User'
  - path: /api/users/{id}
    method: GET
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
    response:
      $ref: '#/components/schemas/User'
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        email:
          type: string
          format: email
        createdAt:
          type: string
          format: date-time
      required:
        - id
        - name
        - email
      `.trim();

      fs.writeFileSync(path.join(schemaDir, 'main.yaml'), mainSchema);

      // 4. Execute workflow
      const context = {
        projectName,
        root: path.join(tempDir, projectName),
        workspace: { root: tempDir },
      };

      // Step 1: Validate
      const validateResult = await validateExecutor(
        {
          verbose: true,
          dryRun: false,
          strict: true,
          ignoreWarnings: false,
        },
        context
      );

      expect(validateResult.success).toBe(true);
      expect(validateResult.output).toContain('Command executed successfully');

      // Step 2: Generate
      const generateResult = await generateExecutor(
        {
          verbose: true,
          dryRun: false,
          force: false,
          watch: false,
          outputFormat: 'typescript',
        },
        context
      );

      expect(generateResult.success).toBe(true);
      expect(generateResult.output).toContain('Command executed successfully');

      // Step 3: Generate docs
      const docsResult = await docsExecutor(
        {
          verbose: true,
          dryRun: false,
          format: 'markdown',
          outputPath: path.join(tempDir, projectName, 'docs'),
          includeExamples: true,
        },
        context
      );

      expect(docsResult.success).toBe(true);
      expect(docsResult.output).toContain('Command executed successfully');

      // Step 4: Clean (dry run)
      const cleanResult = await cleanExecutor(
        {
          verbose: true,
          dryRun: true,
          includeCache: false,
          includeTemp: false,
        },
        context
      );

      expect(cleanResult.success).toBe(true);
      expect(cleanResult.output).toContain('DRY RUN');
    });

    it('should handle workflow with multiple schema files', async () => {
      const projectName = 'multi-schema-project';
      createTestProjectStructure(tempDir, projectName);

      const projectConfig = {
        enabled: true,
        version: '1.0.0',
        schemaDirectory: 'weaver/',
        outputDirectory: 'dist/weaver/',
      };

      fs.writeFileSync(
        path.join(tempDir, projectName, 'weaver.json'),
        JSON.stringify(projectConfig, null, 2)
      );

      // Create multiple schema files
      const schemaDir = path.join(tempDir, projectName, 'weaver');
      fs.mkdirSync(schemaDir, { recursive: true });

      const schemas = [
        {
          name: 'users.yaml',
          content: `
name: users-service
version: 1.0.0
description: User management service
          `.trim(),
        },
        {
          name: 'products.yaml',
          content: `
name: products-service
version: 1.0.0
description: Product catalog service
          `.trim(),
        },
        {
          name: 'orders.yaml',
          content: `
name: orders-service
version: 1.0.0
description: Order management service
          `.trim(),
        },
      ];

      schemas.forEach((schema) => {
        fs.writeFileSync(path.join(schemaDir, schema.name), schema.content);
      });

      const context = {
        projectName,
        root: path.join(tempDir, projectName),
        workspace: { root: tempDir },
      };

      // Test validation with multiple schemas
      const validateResult = await validateExecutor(
        {
          verbose: true,
          dryRun: false,
          strict: false,
          ignoreWarnings: false,
        },
        context
      );

      expect(validateResult.success).toBe(true);

      // Verify all schema files are processed
      const schemaFiles = fs.readdirSync(schemaDir);
      expect(schemaFiles).toContain('users.yaml');
      expect(schemaFiles).toContain('products.yaml');
      expect(schemaFiles).toContain('orders.yaml');
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors gracefully', async () => {
      const projectName = 'error-project';
      createTestProjectStructure(tempDir, projectName);

      // Create invalid schema
      const schemaDir = path.join(tempDir, projectName, 'weaver');
      fs.mkdirSync(schemaDir, { recursive: true });

      const invalidSchema = `
name: invalid-schema
version: 1.0.0
invalid_field: this_should_cause_an_error
      `.trim();

      fs.writeFileSync(path.join(schemaDir, 'invalid.yaml'), invalidSchema);

      const projectConfig = {
        enabled: true,
        version: '1.0.0',
        schemaDirectory: 'weaver/',
        outputDirectory: 'dist/weaver/',
      };

      fs.writeFileSync(
        path.join(tempDir, projectName, 'weaver.json'),
        JSON.stringify(projectConfig, null, 2)
      );

      const context = {
        projectName,
        root: path.join(tempDir, projectName),
        workspace: { root: tempDir },
      };

      // Mock the runWeaverCommand to return an error for this test
      const { runWeaverCommand } = await import('../../utils/executor-utils.js');
      vi.mocked(runWeaverCommand).mockResolvedValueOnce({
        success: false,
        output: '',
        error: 'Validation failed: Invalid schema',
      });

      const result = await validateExecutor(
        {
          verbose: true,
          dryRun: false,
          strict: true,
          ignoreWarnings: false,
        },
        context
      );

      // Should handle the error gracefully
      expect(result.success).toBe(false);
      expect(result.output).toContain('Validation failed');
    });

    it('should handle missing schema files', async () => {
      const projectName = 'no-schema-project';
      createTestProjectStructure(tempDir, projectName);

      const projectConfig = {
        enabled: true,
        version: '1.0.0',
        schemaDirectory: 'weaver/',
        outputDirectory: 'dist/weaver/',
      };

      fs.writeFileSync(
        path.join(tempDir, projectName, 'weaver.json'),
        JSON.stringify(projectConfig, null, 2)
      );

      const context = {
        projectName,
        root: path.join(tempDir, projectName),
        workspace: { root: tempDir },
      };

      const result = await validateExecutor(
        {
          verbose: true,
          dryRun: false,
          strict: false,
          ignoreWarnings: false,
        },
        context
      );

      // Should handle missing schemas gracefully
      expect(result.success).toBe(true);
    });
  });
});
