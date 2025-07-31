# Weaver Executable Manager Implementation

## Task Description
Implement the Weaver executable manager that handles downloading, installing, caching, and managing Weaver executables for different versions across projects.

## Requirements

### Core Functionality
Implement `src/utils/weaver-manager.ts` with the following key functions:

#### 1. Download Management
```typescript
downloadWeaver(version: string, options?: DownloadOptions): Promise<string>
```
- Download Weaver executable for specified version
- Support multiple platforms (Windows, macOS, Linux)
- Handle download timeouts and retries
- Verify downloaded file integrity
- Return path to downloaded executable

#### 2. Path Management
```typescript
getWeaverPath(version: string): string
```
- Return cached executable path for version
- Handle platform-specific executable names
- Ensure executable permissions are set correctly

#### 3. Validation
```typescript
validateWeaver(version: string): Promise<boolean>
```
- Verify executable exists and is accessible
- Check executable integrity (hash verification)
- Test basic Weaver functionality
- Return true if valid, false otherwise

#### 4. Cleanup
```typescript
cleanupOldVersions(keepVersions?: string[]): Promise<void>
```
- Remove unused Weaver versions
- Keep specified versions (default: keep all)
- Clean up temporary download files
- Handle cleanup errors gracefully

### Configuration
Support the following configuration options:
```typescript
interface WeaverManagerConfig {
  cacheDirectory?: string; // default: ".nx-weaver-cache/"
  downloadTimeout?: number; // default: 30000ms
  maxRetries?: number; // default: 3
  downloadUrl?: string; // Weaver download URL template
  verifyHashes?: boolean; // default: true
}
```

### Error Handling
- Handle network failures with retry logic
- Handle disk space issues
- Handle permission errors
- Provide clear error messages with recovery suggestions
- Implement graceful degradation when Weaver is unavailable

### Security Considerations
- Verify downloaded executable hashes
- Set appropriate file permissions
- Sanitize version strings to prevent path traversal
- Validate download URLs

### Platform Support
- Windows: `.exe` executables
- macOS: Binary executables
- Linux: Binary executables
- Handle architecture differences (x64, arm64)

## Implementation Details

### Download Strategy
1. Check if version already exists in cache
2. If not, download from official Weaver releases
3. Verify download integrity
4. Set executable permissions
5. Cache the executable path

### Caching Strategy
- Store executables in `.nx-weaver-cache/` directory
- Organize by version and platform
- Include metadata files for version info
- Implement cache cleanup for old versions

### Error Recovery
- Retry failed downloads with exponential backoff
- Fall back to cached versions when possible
- Provide clear error messages for troubleshooting
- Log all operations for debugging

## Success Criteria
- Can download and cache Weaver executables for different versions
- Handles platform differences correctly
- Provides proper error handling and recovery
- Integrates with the rest of the plugin architecture
- Includes comprehensive unit tests
- Performance is acceptable (<30s for initial download) 