# Advanced Configuration

Learn about advanced configuration options for the Nx Weaver Plugin.

## Configuration Hierarchy

The plugin uses a hierarchical configuration system:

1. **Built-in defaults** (lowest priority)
2. **Workspace configuration** (`weaver-workspace.json`)
3. **Project configuration** (`weaver.json`)
4. **Command-line options** (highest priority)

## Workspace Configuration

### Advanced Workspace Options

```json
{
  "defaultVersion": "1.0.0",
  "schemaDirectory": "weaver/",
  "outputDirectory": "dist/weaver/",
  "enabledByDefault": true,
  "defaultArgs": {
    "validate": ["--strict", "--verbose"],
    "generate": ["--typescript", "--output-dir=dist/weaver"],
    "docs": ["--markdown", "--include-examples"],
    "clean": ["--include-cache"]
  },
  "defaultEnvironment": {
    "WEAVER_LOG_LEVEL": "info",
    "WEAVER_CACHE_DIR": ".nx-weaver-cache/",
    "WEAVER_DOWNLOAD_TIMEOUT": "30000",
    "WEAVER_MAX_RETRIES": "3",
    "WEAVER_VERIFY_HASHES": "true"
  },
  "cacheDirectory": ".nx-weaver-cache/",
  "downloadTimeout": 30000,
  "maxRetries": 3,
  "verifyHashes": true,
  "downloadUrl": "https://github.com/open-telemetry/weaver/releases/download/v{version}/weaver-{platform}-{arch}",
  "hashUrl": "https://github.com/open-telemetry/weaver/releases/download/v{version}/weaver-{platform}-{arch}.sha256",
  "platforms": {
    "darwin": "darwin",
    "linux": "linux",
    "win32": "windows"
  },
  "architectures": {
    "x64": "amd64",
    "arm64": "arm64"
  }
}
```

### Custom Download URLs

Configure custom download URLs for enterprise environments:

```json
{
  "downloadUrl": "https://artifacts.company.com/weaver/v{version}/weaver-{platform}-{arch}",
  "hashUrl": "https://artifacts.company.com/weaver/v{version}/weaver-{platform}-{arch}.sha256"
}
```

### Platform and Architecture Mapping

Customize platform and architecture mappings:

```json
{
  "platforms": {
    "darwin": "macos",
    "linux": "linux",
    "win32": "windows",
    "freebsd": "freebsd"
  },
  "architectures": {
    "x64": "x86_64",
    "arm64": "aarch64",
    "arm": "armv7"
  }
}
```

## Project Configuration

### Advanced Project Options

```json
{
  "enabled": true,
  "version": "1.0.0",
  "schemaDirectory": "weaver/",
  "outputDirectory": "dist/weaver/",
  "args": {
    "validate": ["--strict", "--verbose", "--ignore-warnings"],
    "generate": ["--typescript", "--output-dir=dist/weaver", "--template=custom"],
    "docs": ["--markdown", "--output-dir=docs/api", "--include-examples"],
    "clean": ["--include-cache", "--include-temp"]
  },
  "environment": {
    "WEAVER_LOG_LEVEL": "debug",
    "WEAVER_CACHE_DIR": "my-project/.weaver-cache/",
    "WEAVER_API_KEY": "${WEAVER_API_KEY}"
  },
  "skipValidation": false,
  "skipGeneration": false,
  "skipDocs": false,
  "cacheDirectory": "my-project/.weaver-cache/",
  "downloadTimeout": 60000,
  "maxRetries": 5,
  "templates": {
    "typescript": "templates/typescript.tmpl",
    "javascript": "templates/javascript.tmpl",
    "markdown": "templates/docs.tmpl"
  },
  "postProcess": {
    "typescript": ["prettier", "eslint"],
    "javascript": ["prettier"],
    "markdown": ["markdownlint"]
  }
}
```

### Custom Templates

Configure custom templates for code generation:

```json
{
  "templates": {
    "typescript": "templates/custom-typescript.tmpl",
    "javascript": "templates/custom-javascript.tmpl",
    "markdown": "templates/custom-docs.tmpl"
  }
}
```

### Post-Processing

Configure post-processing steps for generated files:

```json
{
  "postProcess": {
    "typescript": ["prettier", "eslint --fix"],
    "javascript": ["prettier"],
    "markdown": ["markdownlint --fix"]
  }
}
```

## Environment-Specific Configuration

### Development Configuration

```json
{
  "enabled": true,
  "version": "1.0.0",
  "args": {
    "validate": ["--strict"],
    "generate": ["--typescript", "--watch"],
    "docs": ["--markdown"]
  },
  "environment": {
    "WEAVER_LOG_LEVEL": "debug"
  },
  "skipValidation": false,
  "skipGeneration": false,
  "skipDocs": true
}
```

### Production Configuration

```json
{
  "enabled": true,
  "version": "1.0.0",
  "args": {
    "validate": ["--strict", "--verbose"],
    "generate": ["--typescript", "--optimize"],
    "docs": ["--markdown", "--include-examples"]
  },
  "environment": {
    "WEAVER_LOG_LEVEL": "warn"
  },
  "skipValidation": false,
  "skipGeneration": false,
  "skipDocs": false
}
```

### Testing Configuration

```json
{
  "enabled": true,
  "version": "1.0.0",
  "args": {
    "validate": ["--strict"],
    "generate": ["--typescript", "--test-mode"],
    "docs": ["--markdown"]
  },
  "environment": {
    "WEAVER_LOG_LEVEL": "error"
  },
  "skipValidation": false,
  "skipGeneration": false,
  "skipDocs": true
}
```

## Multi-Project Configuration

### Shared Configuration

Create shared configuration for multiple projects:

```json
// shared-weaver-config.json
{
  "version": "1.0.0",
  "schemaDirectory": "weaver/",
  "outputDirectory": "dist/weaver/",
  "args": {
    "validate": ["--strict"],
    "generate": ["--typescript"],
    "docs": ["--markdown"]
  },
  "environment": {
    "WEAVER_LOG_LEVEL": "info"
  }
}
```

### Project-Specific Overrides

```json
// api/weaver.json
{
  "extends": "../shared-weaver-config.json",
  "args": {
    "generate": ["--typescript", "--api-mode"]
  },
  "environment": {
    "WEAVER_LOG_LEVEL": "debug",
    "WEAVER_SERVICE_NAME": "api-service"
  }
}
```

```json
// web/weaver.json
{
  "extends": "../shared-weaver-config.json",
  "args": {
    "generate": ["--typescript", "--web-mode"]
  },
  "environment": {
    "WEAVER_LOG_LEVEL": "warn",
    "WEAVER_SERVICE_NAME": "web-app"
  }
}
```

## Conditional Configuration

### Environment-Based Configuration

```json
{
  "enabled": true,
  "version": "1.0.0",
  "args": {
    "validate": ["--strict"],
    "generate": ["--typescript"],
    "docs": ["--markdown"]
  },
  "environments": {
    "development": {
      "args": {
        "generate": ["--typescript", "--watch"],
        "docs": ["--markdown"]
      },
      "environment": {
        "WEAVER_LOG_LEVEL": "debug"
      },
      "skipDocs": true
    },
    "production": {
      "args": {
        "generate": ["--typescript", "--optimize"],
        "docs": ["--markdown", "--include-examples"]
      },
      "environment": {
        "WEAVER_LOG_LEVEL": "warn"
      },
      "skipDocs": false
    }
  }
}
```

### Feature-Based Configuration

```json
{
  "enabled": true,
  "version": "1.0.0",
  "features": {
    "telemetry": {
      "enabled": true,
      "args": {
        "generate": ["--typescript", "--telemetry"]
      }
    },
    "metrics": {
      "enabled": true,
      "args": {
        "generate": ["--typescript", "--metrics"]
      }
    },
    "traces": {
      "enabled": false,
      "args": {
        "generate": ["--typescript", "--traces"]
      }
    }
  }
}
```

## Advanced Weaver Arguments

### Validation Arguments

```json
{
  "args": {
    "validate": [
      "--strict",
      "--verbose",
      "--ignore-warnings",
      "--schema-dir=weaver/",
      "--config-file=weaver-config.yaml"
    ]
  }
}
```

### Generation Arguments

```json
{
  "args": {
    "generate": [
      "--typescript",
      "--output-dir=dist/weaver/",
      "--template=custom-template",
      "--optimize",
      "--source-maps",
      "--declaration",
      "--strict-null-checks"
    ]
  }
}
```

### Documentation Arguments

```json
{
  "args": {
    "docs": [
      "--markdown",
      "--output-dir=docs/api/",
      "--include-examples",
      "--include-types",
      "--template=custom-docs",
      "--format=github"
    ]
  }
}
```

### Clean Arguments

```json
{
  "args": {
    "clean": [
      "--include-cache",
      "--include-temp",
      "--patterns=dist/weaver/**/*",
      "--patterns=*.tmp",
      "--dry-run"
    ]
  }
}
```

## Performance Configuration

### Caching Configuration

```json
{
  "cacheDirectory": ".nx-weaver-cache/",
  "cacheOptions": {
    "maxSize": "1GB",
    "maxAge": "7d",
    "compression": true,
    "integrity": true
  }
}
```

### Parallel Processing

```json
{
  "parallel": {
    "enabled": true,
    "maxConcurrency": 4,
    "timeout": 30000
  }
}
```

### Memory Management

```json
{
  "memory": {
    "maxHeapSize": "512MB",
    "gcInterval": 1000,
    "cacheSize": "256MB"
  }
}
```

## Security Configuration

### Hash Verification

```json
{
  "verifyHashes": true,
  "hashAlgorithm": "sha256",
  "allowedHashes": [
    "sha256:abc123...",
    "sha256:def456..."
  ]
}
```

### Network Security

```json
{
  "network": {
    "timeout": 30000,
    "retries": 3,
    "proxy": "http://proxy.company.com:8080",
    "certificates": "/path/to/certificates/",
    "insecure": false
  }
}
```

### Access Control

```json
{
  "access": {
    "requireAuth": true,
    "apiKey": "${WEAVER_API_KEY}",
    "allowedProjects": ["api", "web", "shared"],
    "allowedVersions": ["1.0.0", "1.1.0"]
  }
}
```

## Monitoring and Logging

### Logging Configuration

```json
{
  "logging": {
    "level": "info",
    "format": "json",
    "output": "file",
    "file": "weaver.log",
    "maxSize": "10MB",
    "maxFiles": 5
  }
}
```

### Metrics Configuration

```json
{
  "metrics": {
    "enabled": true,
    "endpoint": "http://localhost:9090",
    "interval": 60000,
    "labels": {
      "service": "weaver-plugin",
      "version": "1.0.0"
    }
  }
}
```

### Health Checks

```json
{
  "health": {
    "enabled": true,
    "endpoint": "/health",
    "timeout": 5000,
    "interval": 30000
  }
}
```

## Configuration Validation

### Schema Validation

```json
{
  "validation": {
    "schema": "weaver-config-schema.json",
    "strict": true,
    "additionalProperties": false
  }
}
```

### Custom Validators

```json
{
  "validators": {
    "version": "custom-version-validator.js",
    "paths": "custom-path-validator.js",
    "environment": "custom-env-validator.js"
  }
}
```

## Configuration Best Practices

### 1. Use Environment Variables

```json
{
  "environment": {
    "WEAVER_API_KEY": "${WEAVER_API_KEY}",
    "WEAVER_ENDPOINT": "${WEAVER_ENDPOINT}",
    "WEAVER_LOG_LEVEL": "${WEAVER_LOG_LEVEL:-info}"
  }
}
```

### 2. Version Management

```json
{
  "version": "1.0.0",
  "versionConstraints": {
    "min": "1.0.0",
    "max": "1.2.0",
    "recommended": "1.1.0"
  }
}
```

### 3. Path Management

```json
{
  "paths": {
    "schemas": "${PROJECT_ROOT}/weaver/",
    "output": "${PROJECT_ROOT}/dist/weaver/",
    "cache": "${WORKSPACE_ROOT}/.nx-weaver-cache/"
  }
}
```

### 4. Error Handling

```json
{
  "errorHandling": {
    "continueOnError": true,
    "maxErrors": 10,
    "errorReporting": "detailed",
    "fallback": "cached"
  }
}
```

## Next Steps

- [Troubleshooting](troubleshooting.md) - Common configuration issues
- [Examples](../examples/) - Real-world configuration examples
- [API Reference](../api/) - Configuration API documentation 