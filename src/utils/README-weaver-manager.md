# Weaver Executable Manager

The Weaver Executable Manager is a comprehensive solution for downloading, caching, and managing OpenTelemetry Weaver executables across different platforms and versions.

## Features

- **Multi-platform Support**: Windows, macOS, and Linux
- **Architecture Support**: x64 and ARM64
- **Version Management**: Download and cache multiple Weaver versions
- **Automatic Caching**: Efficient caching with metadata tracking
- **Error Recovery**: Retry logic with exponential backoff
- **Security**: Hash verification and path sanitization
- **Cleanup**: Automatic cleanup of old versions and temporary files

## Quick Start

```typescript
import { weaverManager } from '@nx-weaver/plugin/utils';

// Download Weaver version 0.96.0
const executablePath = await weaverManager.downloadWeaver('0.96.0');
console.log(`Weaver executable: ${executablePath}`);

// Validate the installation
const isValid = await weaverManager.validateWeaver('0.96.0');
console.log(`Valid: ${isValid}`);
```

## API Reference

### WeaverManager Class

#### Constructor

```typescript
new WeaverManager(config?: WeaverManagerConfig)
```

**Configuration Options:**
- `cacheDirectory`: Directory to store cached executables (default: `.nx-weaver-cache`)
- `downloadTimeout`: Download timeout in milliseconds (default: 30000)
- `maxRetries`: Maximum download retry attempts (default: 3)
- `downloadUrl`: URL template for Weaver downloads
- `verifyHashes`: Enable hash verification (default: true)

#### Methods

##### `downloadWeaver(version: string, options?: DownloadOptions): Promise<string>`

Downloads and caches a Weaver executable for the specified version.

```typescript
const executablePath = await weaverManager.downloadWeaver('0.96.0', {
  timeout: 60000,
  maxRetries: 5,
  verifyHashes: true
});
```

##### `getWeaverPath(version: string): string`

Returns the cached executable path for a version.

```typescript
const path = weaverManager.getWeaverPath('0.96.0');
// Returns: .nx-weaver-cache/0.96.0/otelcol-contrib
```

##### `validateWeaver(version: string): Promise<boolean>`

Validates that a Weaver executable exists and is functional.

```typescript
const isValid = await weaverManager.validateWeaver('0.96.0');
if (isValid) {
  console.log('Weaver is ready to use');
}
```

##### `cleanupOldVersions(keepVersions?: string[]): Promise<void>`

Removes old Weaver versions, optionally keeping specified versions.

```typescript
// Remove all versions except 0.96.0
await weaverManager.cleanupOldVersions(['0.96.0']);

// Remove all old versions
await weaverManager.cleanupOldVersions();
```

##### `getInstalledVersions(): string[]`

Returns a list of installed Weaver versions.

```typescript
const versions = weaverManager.getInstalledVersions();
console.log(`Installed versions: ${versions.join(', ')}`);
```

##### `getMetadata(version: string): Promise<WeaverMetadata | null>`

Returns metadata for a specific Weaver version.

```typescript
const metadata = await weaverManager.getMetadata('0.96.0');
if (metadata) {
  console.log(`Downloaded: ${metadata.downloadedAt}`);
  console.log(`Platform: ${metadata.platform}`);
  console.log(`Architecture: ${metadata.architecture}`);
}
```

## Platform Support

| Platform | Architecture | Executable Name |
|----------|--------------|-----------------|
| Windows  | x64          | `otelcol-contrib.exe` |
| Windows  | ARM64        | `otelcol-contrib.exe` |
| macOS    | x64          | `otelcol-contrib` |
| macOS    | ARM64        | `otelcol-contrib` |
| Linux    | x64          | `otelcol-contrib` |
| Linux    | ARM64        | `otelcol-contrib` |

## Error Handling

The Weaver Manager includes comprehensive error handling:

### Network Errors
- Automatic retry with exponential backoff
- Configurable retry count and timeout
- Graceful degradation when network is unavailable

### File System Errors
- Permission error handling
- Disk space validation
- Automatic cleanup of failed downloads

### Security
- Path traversal prevention
- Hash verification of downloaded files
- Secure file permissions

## Examples

### Basic Usage

```typescript
import { weaverManager } from '@nx-weaver/plugin/utils';

async function setupWeaver() {
  try {
    // Download Weaver if not already cached
    const executablePath = await weaverManager.downloadWeaver('0.96.0');
    
    // Validate the installation
    const isValid = await weaverManager.validateWeaver('0.96.0');
    if (!isValid) {
      throw new Error('Weaver validation failed');
    }
    
    console.log(`Weaver ready: ${executablePath}`);
    return executablePath;
  } catch (error) {
    console.error('Failed to setup Weaver:', error);
    throw error;
  }
}
```

### Custom Configuration

```typescript
import { WeaverManager } from '@nx-weaver/plugin/utils';

const customManager = new WeaverManager({
  cacheDirectory: './custom-cache',
  downloadTimeout: 60000,
  maxRetries: 5,
  verifyHashes: true,
});

await customManager.downloadWeaver('0.96.0');
```

### Multi-Version Management

```typescript
import { weaverManager } from '@nx-weaver/plugin/utils';

async function manageVersions() {
  // Download multiple versions
  const versions = ['0.94.0', '0.95.0', '0.96.0'];
  
  for (const version of versions) {
    try {
      await weaverManager.downloadWeaver(version);
      console.log(`✓ Downloaded ${version}`);
    } catch (error) {
      console.log(`✗ Failed to download ${version}: ${error}`);
    }
  }
  
  // List installed versions
  const installed = weaverManager.getInstalledVersions();
  console.log(`Installed: ${installed.join(', ')}`);
  
  // Keep only the latest version
  const latest = installed[installed.length - 1];
  await weaverManager.cleanupOldVersions([latest]);
}
```

### Error Recovery

```typescript
import { weaverManager } from '@nx-weaver/plugin/utils';

async function robustWeaverSetup() {
  try {
    // Try to download the latest version
    return await weaverManager.downloadWeaver('0.96.0');
  } catch (error) {
    console.log('Download failed, checking cached versions...');
    
    // Fall back to cached versions
    const cachedVersions = weaverManager.getInstalledVersions();
    if (cachedVersions.length > 0) {
      const latestCached = cachedVersions[cachedVersions.length - 1];
      const isValid = await weaverManager.validateWeaver(latestCached);
      
      if (isValid) {
        console.log(`Using cached version: ${latestCached}`);
        return weaverManager.getWeaverPath(latestCached);
      }
    }
    
    throw new Error('No valid Weaver installation available');
  }
}
```

## Cache Structure

The Weaver Manager creates the following cache structure:

```
.nx-weaver-cache/
├── metadata.json          # Version metadata
├── 0.94.0/               # Version directory
│   └── otelcol-contrib   # Executable
├── 0.95.0/
│   └── otelcol-contrib
└── 0.96.0/
    └── otelcol-contrib
```

## Performance Considerations

- **Initial Download**: ~30 seconds for typical network conditions
- **Cache Hit**: <1 second for subsequent requests
- **Validation**: ~1-2 seconds for executable validation
- **Cleanup**: <1 second for typical cache sizes

## Troubleshooting

### Common Issues

1. **Download Timeout**
   - Increase `downloadTimeout` in configuration
   - Check network connectivity
   - Verify firewall settings

2. **Permission Errors**
   - Ensure write permissions to cache directory
   - Run with appropriate user privileges

3. **Validation Failures**
   - Check if executable was corrupted during download
   - Verify platform compatibility
   - Ensure sufficient disk space

4. **Hash Verification Failures**
   - Disable hash verification if needed: `verifyHashes: false`
   - Check for network corruption
   - Verify download URL is correct

### Debug Mode

Enable debug logging by setting the `DEBUG` environment variable:

```bash
DEBUG=weaver-manager node your-script.js
```

## Integration with Nx

The Weaver Manager integrates seamlessly with Nx executors:

```typescript
// In an Nx executor
import { weaverManager } from '@nx-weaver/plugin/utils';

export default async function runExecutor(options: any) {
  const weaverPath = await weaverManager.downloadWeaver(options.weaverVersion);
  
  // Use weaverPath in your executor logic
  // ...
}
``` 