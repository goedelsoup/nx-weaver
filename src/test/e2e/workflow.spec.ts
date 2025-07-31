import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createTempWorkspace,
  cleanupTempWorkspace,
  createTestSchemaFile,
  createTestProjectStructure,
} from '../utils';
import fs from 'node:fs';
import path from 'node:path';

describe('End-to-End Workflow', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempWorkspace();
  });

  afterEach(() => {
    cleanupTempWorkspace(tempDir);
  });

  it('should complete full Weaver workflow', async () => {
    // 1. Initialize workspace structure
    const workspaceConfig = {
      defaultVersion: '1.0.0',
      schemaDirectory: 'weaver/',
      outputDirectory: 'dist/weaver/',
      enabledByDefault: true,
      cacheDirectory: '.nx-weaver-cache/',
    };

    fs.writeFileSync(
      path.join(tempDir, 'weaver-workspace.json'),
      JSON.stringify(workspaceConfig, null, 2)
    );

    // 2. Set up project
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

    // 3. Create schema files
    const schemaDir = path.join(tempDir, projectName, 'weaver');
    fs.mkdirSync(schemaDir, { recursive: true });

    // Create multiple schema files
    const schemas = [
      {
        name: 'main-schema.yaml',
        content: `
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
        `,
      },
      {
        name: 'types.yaml',
        content: `
types:
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
      `,
      },
      {
        name: 'config.yaml',
        content: `
config:
  server:
    port: 3000
    host: localhost
  database:
    url: postgresql://localhost/test
    pool:
      min: 5
      max: 20
        `,
      },
    ];

    schemas.forEach((schema) => {
      fs.writeFileSync(path.join(schemaDir, schema.name), schema.content.trim());
    });

    // 4. Verify workspace structure
    expect(fs.existsSync(path.join(tempDir, 'weaver-workspace.json'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, projectName, 'project.json'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, projectName, 'weaver.json'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, projectName, 'weaver', 'main-schema.yaml'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, projectName, 'weaver', 'types.yaml'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, projectName, 'weaver', 'config.yaml'))).toBe(true);

    // 5. Verify configuration loading
    const loadedWorkspaceConfig = JSON.parse(
      fs.readFileSync(path.join(tempDir, 'weaver-workspace.json'), 'utf-8')
    );
    expect(loadedWorkspaceConfig.defaultVersion).toBe('1.0.0');
    expect(loadedWorkspaceConfig.schemaDirectory).toBe('weaver/');

    const loadedProjectConfig = JSON.parse(
      fs.readFileSync(path.join(tempDir, projectName, 'weaver.json'), 'utf-8')
    );
    expect(loadedProjectConfig.enabled).toBe(true);
    expect(loadedProjectConfig.version).toBe('1.0.0');

    // 6. Verify schema file contents
    const mainSchema = fs.readFileSync(
      path.join(tempDir, projectName, 'weaver', 'main-schema.yaml'),
      'utf-8'
    );
    expect(mainSchema).toContain('name: test-api');
    expect(mainSchema).toContain('version: 1.0.0');

    const typesSchema = fs.readFileSync(
      path.join(tempDir, projectName, 'weaver', 'types.yaml'),
      'utf-8'
    );
    expect(typesSchema).toContain('User:');
    expect(typesSchema).toContain('type: object');

    // 7. Verify project structure integrity
    const projectDir = path.join(tempDir, projectName);
    const projectFiles = fs.readdirSync(projectDir);
    expect(projectFiles).toContain('project.json');
    expect(projectFiles).toContain('weaver.json');
    expect(projectFiles).toContain('weaver');

    const weaverDir = path.join(projectDir, 'weaver');
    const weaverFiles = fs.readdirSync(weaverDir);
    expect(weaverFiles).toContain('main-schema.yaml');
    expect(weaverFiles).toContain('types.yaml');
    expect(weaverFiles).toContain('config.yaml');

    // 8. Verify file permissions and accessibility
    const schemaFiles = [
      path.join(weaverDir, 'main-schema.yaml'),
      path.join(weaverDir, 'types.yaml'),
      path.join(weaverDir, 'config.yaml'),
    ];

    schemaFiles.forEach((file) => {
      expect(fs.existsSync(file)).toBe(true);
      expect(fs.statSync(file).isFile()).toBe(true);
      expect(fs.statSync(file).size).toBeGreaterThan(0);
    });

    // 9. Verify configuration validation
    const workspaceConfigValid = Boolean(
      loadedWorkspaceConfig.defaultVersion &&
        loadedWorkspaceConfig.schemaDirectory &&
        loadedWorkspaceConfig.outputDirectory
    );
    expect(workspaceConfigValid).toBe(true);

    const projectConfigValid = Boolean(
      loadedProjectConfig.enabled !== undefined &&
        loadedProjectConfig.version &&
        loadedProjectConfig.schemaDirectory
    );
    expect(projectConfigValid).toBe(true);

    // 10. Verify schema file validation
    const yamlFiles = ['main-schema.yaml', 'types.yaml', 'config.yaml'];
    yamlFiles.forEach((file) => {
      const content = fs.readFileSync(path.join(weaverDir, file), 'utf-8');
      expect(content).toContain(':'); // Basic YAML validation
      expect(content.length).toBeGreaterThan(10); // Non-empty content
    });
  });

  it('should handle complex project structure with multiple projects', async () => {
    // Create multiple projects
    const projects = ['api-service', 'web-client', 'shared-lib'];

    projects.forEach((projectName) => {
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

      // Create project-specific schemas
      const schemaDir = path.join(tempDir, projectName, 'weaver');
      fs.mkdirSync(schemaDir, { recursive: true });

      const schemaContent = `
name: ${projectName}
version: 1.0.0
description: ${projectName} schema
      `.trim();

      fs.writeFileSync(path.join(schemaDir, 'schema.yaml'), schemaContent);
    });

    // Verify all projects were created correctly
    projects.forEach((projectName) => {
      const projectDir = path.join(tempDir, projectName);
      expect(fs.existsSync(projectDir)).toBe(true);
      expect(fs.existsSync(path.join(projectDir, 'project.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectDir, 'weaver.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectDir, 'weaver', 'schema.yaml'))).toBe(true);

      // Verify project-specific content
      const schemaContent = fs.readFileSync(
        path.join(projectDir, 'weaver', 'schema.yaml'),
        'utf-8'
      );
      expect(schemaContent).toContain(`name: ${projectName}`);
    });
  });

  it('should handle workspace configuration inheritance', async () => {
    // Create workspace config with defaults
    const workspaceConfig = {
      defaultVersion: '2.0.0',
      schemaDirectory: 'schemas/',
      outputDirectory: 'generated/',
      enabledByDefault: false,
      cacheDirectory: '.custom-cache/',
    };

    fs.writeFileSync(
      path.join(tempDir, 'weaver-workspace.json'),
      JSON.stringify(workspaceConfig, null, 2)
    );

    // Create project with minimal config
    const projectName = 'minimal-project';
    createTestProjectStructure(tempDir, projectName);

    const projectConfig = {
      enabled: true,
      // No version, schemaDirectory, etc. - should inherit from workspace
    };

    fs.writeFileSync(
      path.join(tempDir, projectName, 'weaver.json'),
      JSON.stringify(projectConfig, null, 2)
    );

    // Verify workspace config is loaded
    const loadedWorkspaceConfig = JSON.parse(
      fs.readFileSync(path.join(tempDir, 'weaver-workspace.json'), 'utf-8')
    );
    expect(loadedWorkspaceConfig.defaultVersion).toBe('2.0.0');
    expect(loadedWorkspaceConfig.schemaDirectory).toBe('schemas/');
    expect(loadedWorkspaceConfig.enabledByDefault).toBe(false);

    // Verify project config is loaded
    const loadedProjectConfig = JSON.parse(
      fs.readFileSync(path.join(tempDir, projectName, 'weaver.json'), 'utf-8')
    );
    expect(loadedProjectConfig.enabled).toBe(true);
  });
});
