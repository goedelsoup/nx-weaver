# Troubleshooting

Common issues and solutions for the Nx Weaver Plugin.

## Installation Issues

### Plugin Not Found

**Error**: `Cannot find generator '@nx-weaver/plugin:init'`

**Solution**:
```bash
# Check if plugin is installed
npm list @nx-weaver/plugin

# Reinstall plugin
npm install @nx-weaver/plugin

# Clear Nx cache
nx reset
```

### Generator Not Available

**Error**: `Generator '@nx-weaver/plugin:init' is not available`

**Solution**:
```bash
# Check available generators
nx list @nx-weaver/plugin

# Check Nx version compatibility
nx --version

# Update Nx if needed
npm install -g nx@latest
```

### Permission Errors

**Error**: `EACCES: permission denied`

**Solution**:
```bash
# Fix cache directory permissions
chmod -R 755 .nx-weaver-cache/

# Fix global npm permissions
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config

# Use npx for global commands
npx nx g @nx-weaver/plugin:init
```

## Configuration Issues

### Invalid Configuration

**Error**: `Invalid configuration: Unknown option 'invalidOption'`

**Solution**:
```bash
# Validate configuration
nx weaver-validate --config=weaver-workspace.json

# Check configuration schema
cat weaver-workspace.json | jq '.'

# Remove invalid options
vim weaver-workspace.json
```

### Missing Required Fields

**Error**: `Missing required field 'version' in weaver.json`

**Solution**:
```json
{
  "version": "1.0.0",
  "enabled": true,
  "schemaDirectory": "weaver/",
  "outputDirectory": "dist/weaver/"
}
```

### Configuration Inheritance Issues

**Error**: `Cannot resolve configuration inheritance`

**Solution**:
```bash
# Check workspace configuration
cat weaver-workspace.json

# Check project configuration
cat my-project/weaver.json

# Ensure proper inheritance
{
  "extends": "../weaver-workspace.json",
  "version": "1.0.0"
}
```

## Weaver Download Issues

### Network Timeout

**Error**: `Network timeout after 30 seconds`

**Solution**:
```bash
# Increase timeout
export WEAVER_DOWNLOAD_TIMEOUT=60000
nx weaver-validate my-project

# Use proxy if needed
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080

# Check network connectivity
curl -I https://github.com/open-telemetry/weaver/releases
```

### Invalid Hash

**Error**: `Invalid hash for downloaded file`

**Solution**:
```bash
# Clear cache and retry
nx weaver-clean my-project --includeCache
nx weaver-validate my-project

# Disable hash verification temporarily
export WEAVER_VERIFY_HASHES=false
nx weaver-validate my-project

# Check Weaver version
nx weaver-validate my-project --verbose
```

### Platform Not Supported

**Error**: `Platform 'freebsd' not supported`

**Solution**:
```json
{
  "platforms": {
    "freebsd": "freebsd"
  },
  "architectures": {
    "x64": "amd64"
  }
}
```

## Schema Validation Issues

### Invalid Schema Syntax

**Error**: `Invalid YAML syntax in schema.yaml:10`

**Solution**:
```bash
# Validate YAML syntax
yamllint weaver/schema.yaml

# Check specific line
sed -n '10p' weaver/schema.yaml

# Use YAML validator
python -c "import yaml; yaml.safe_load(open('weaver/schema.yaml'))"
```

### Missing Required Fields

**Error**: `Missing required field 'description' in schema.yaml:15`

**Solution**:
```yaml
metrics:
  - name: "requests_total"
    type: "counter"
    description: "Total number of requests"  # Add this
    unit: "1"
```

### Invalid Metric Types

**Error**: `Invalid metric type 'invalid_type' in schema.yaml:10`

**Solution**:
```yaml
metrics:
  - name: "requests_total"
    type: "counter"  # Valid types: counter, gauge, histogram, summary
    description: "Total number of requests"
```

### Cross-Reference Errors

**Error**: `Cannot resolve reference to metric 'unknown_metric'`

**Solution**:
```yaml
# Ensure referenced metric exists
metrics:
  - name: "requests_total"
    type: "counter"
    description: "Total number of requests"

traces:
  - name: "request"
    description: "Request span"
    attributes:
      - name: "requests_total"  # Reference to existing metric
        type: "string"
```

## Code Generation Issues

### Template Not Found

**Error**: `Template 'custom-template' not found`

**Solution**:
```bash
# Check available templates
ls templates/

# Use default template
nx weaver-generate my-project --template=default

# Create custom template
mkdir -p templates/
cp templates/default.tmpl templates/custom-template.tmpl
```

### Output Directory Issues

**Error**: `Cannot write to output directory 'dist/weaver/'`

**Solution**:
```bash
# Create output directory
mkdir -p dist/weaver/

# Fix permissions
chmod -R 755 dist/

# Use different output directory
nx weaver-generate my-project --outputFormat=typescript --outputPath=src/generated/
```

### TypeScript Compilation Errors

**Error**: `TypeScript compilation failed`

**Solution**:
```bash
# Check TypeScript configuration
cat tsconfig.json

# Add generated files to TypeScript config
{
  "include": [
    "src/**/*",
    "dist/weaver/**/*"
  ]
}

# Regenerate with different options
nx weaver-generate my-project --outputFormat=javascript
```

## Build Integration Issues

### Build Dependencies

**Error**: `Target 'weaver-generate' not found`

**Solution**:
```json
{
  "targets": {
    "build": {
      "executor": "@nx/js:tsc",
      "options": {
        "main": "apps/my-project/src/main.ts"
      },
      "dependsOn": ["weaver-generate"]
    },
    "weaver-generate": {
      "executor": "@nx-weaver/generate",
      "options": {
        "project": "my-project"
      }
    }
  }
}
```

### Circular Dependencies

**Error**: `Circular dependency detected`

**Solution**:
```json
{
  "targets": {
    "weaver-generate": {
      "executor": "@nx-weaver/generate",
      "options": {
        "project": "my-project"
      },
      "dependsOn": ["weaver-validate"]
    },
    "weaver-validate": {
      "executor": "@nx-weaver/validate",
      "options": {
        "project": "my-project"
      }
    }
  }
}
```

## Caching Issues

### Cache Corruption

**Error**: `Cache integrity check failed`

**Solution**:
```bash
# Clear cache
nx weaver-clean my-project --includeCache

# Clear all Nx cache
nx reset

# Regenerate cache
nx weaver-generate my-project --verbose
```

### Cache Miss

**Error**: `Unexpected cache miss`

**Solution**:
```bash
# Check cache keys
nx weaver-generate my-project --verbose | grep "cache"

# Force regeneration
nx weaver-generate my-project --force

# Check file changes
git status
```

## Performance Issues

### Slow Generation

**Error**: `Code generation taking too long`

**Solution**:
```bash
# Enable verbose output to identify bottleneck
nx weaver-generate my-project --verbose

# Use parallel processing
export WEAVER_PARALLEL=true
export WEAVER_MAX_CONCURRENCY=4

# Optimize schema files
# Remove unused metrics/traces
# Use smaller data types
```

### Memory Issues

**Error**: `JavaScript heap out of memory`

**Solution**:
```bash
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"

# Use streaming for large schemas
nx weaver-generate my-project --streaming=true

# Process schemas in chunks
nx weaver-generate my-project --chunk-size=1000
```

## Environment Issues

### Missing Environment Variables

**Error**: `Environment variable 'WEAVER_API_KEY' not set`

**Solution**:
```bash
# Set environment variable
export WEAVER_API_KEY=your-api-key

# Use .env file
echo "WEAVER_API_KEY=your-api-key" > .env

# Set in configuration
{
  "environment": {
    "WEAVER_API_KEY": "your-api-key"
  }
}
```

### Platform-Specific Issues

**Error**: `Platform-specific issue on Windows`

**Solution**:
```bash
# Use Windows-compatible paths
{
  "schemaDirectory": "weaver\\",
  "outputDirectory": "dist\\weaver\\"
}

# Use forward slashes
{
  "schemaDirectory": "weaver/",
  "outputDirectory": "dist/weaver/"
}
```

## Debugging Commands

### Verbose Output

```bash
# Enable verbose output for all operations
nx weaver-validate my-project --verbose
nx weaver-generate my-project --verbose
nx weaver-docs my-project --verbose
nx weaver-clean my-project --verbose
```

### Dry Run

```bash
# See what would be executed without making changes
nx weaver-validate my-project --dryRun
nx weaver-generate my-project --dryRun
nx weaver-docs my-project --dryRun
nx weaver-clean my-project --dryRun
```

### Debug Mode

```bash
# Enable debug logging
export WEAVER_LOG_LEVEL=debug
export DEBUG=@nx-weaver/*

# Run with debug output
nx weaver-generate my-project --verbose
```

## Common Error Messages

### Error: Weaver executable not found

```bash
# Download Weaver
nx weaver-validate my-project --verbose

# Check cache
ls -la .nx-weaver-cache/

# Manual download
curl -L https://github.com/open-telemetry/weaver/releases/download/v1.0.0/weaver-darwin-amd64 -o weaver
chmod +x weaver
```

### Error: Schema file not found

```bash
# Check schema directory
ls -la weaver/

# Create schema file
mkdir -p weaver/
touch weaver/schema.yaml

# Update configuration
{
  "schemaDirectory": "weaver/"
}
```

### Error: Output directory not writable

```bash
# Create output directory
mkdir -p dist/weaver/

# Fix permissions
chmod -R 755 dist/

# Use different directory
{
  "outputDirectory": "src/generated/"
}
```

## Getting Help

### Check Documentation

1. [Installation Guide](../getting-started/installation.md)
2. [User Guide](executors.md)
3. [Configuration Guide](configuration.md)
4. [Examples](../examples/)

### Enable Debug Logging

```bash
export WEAVER_LOG_LEVEL=debug
export DEBUG=@nx-weaver/*
nx weaver-generate my-project --verbose
```

### Collect Debug Information

```bash
# System information
node --version
npm --version
nx --version

# Plugin information
npm list @nx-weaver/plugin

# Configuration files
cat weaver-workspace.json
cat my-project/weaver.json

# Cache information
ls -la .nx-weaver-cache/
```

### Report Issues

When reporting issues, include:

1. **Error message** (exact text)
2. **Command executed**
3. **System information** (OS, Node.js version, Nx version)
4. **Configuration files** (weaver-workspace.json, weaver.json)
5. **Debug output** (with --verbose flag)
6. **Steps to reproduce**

## Next Steps

- [Executors](executors.md) - Detailed executor documentation
- [Configuration](configuration.md) - Advanced configuration options
- [Examples](../examples/) - Real-world usage examples 