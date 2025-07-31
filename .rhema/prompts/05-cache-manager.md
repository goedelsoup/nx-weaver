# Cache Manager Implementation

## Task Description
Implement the cache management system that handles Nx computation caching for Weaver operations, including cache key generation, validation, and distributed caching support.

## Requirements

### Core Functionality
Implement `src/utils/cache-manager.ts` with the following key functions:

#### 1. Cache Key Generation
```typescript
getCacheKey(project: string, operation: string, files: string[], config: WeaverProjectConfig): string
```
- Generate unique cache keys for Weaver operations
- Include project name, operation type, and file hashes
- Consider configuration changes in cache key
- Support custom cache key components

#### 2. Cache Validation
```typescript
isCacheValid(key: string, options?: CacheValidationOptions): Promise<boolean>
```
- Check if cache entry exists and is valid
- Validate cache entry age and TTL
- Verify cache entry integrity
- Handle cache corruption gracefully

#### 3. Cache Storage
```typescript
storeCacheResult(key: string, result: WeaverResult, options?: CacheStorageOptions): Promise<void>
```
- Store Weaver operation results in cache
- Include metadata for cache validation
- Handle cache storage errors
- Support cache compression for large results

#### 4. Cache Retrieval
```typescript
getCacheResult(key: string): Promise<WeaverResult | null>
```
- Retrieve cached Weaver operation results
- Handle cache misses gracefully
- Validate retrieved cache entries
- Return null for invalid or missing cache entries

#### 5. Cache Invalidation
```typescript
invalidateCache(project: string, operation?: string): Promise<void>
```
- Clear cache entries for specific project
- Support operation-specific cache invalidation
- Handle cache cleanup errors
- Maintain cache size limits

### Cache Key Strategy
Generate cache keys based on:
- **Project identifier**: Project name and path
- **Operation type**: validate, generate, docs, clean
- **Input files**: Hash of schema files and configuration
- **Weaver version**: Version-specific cache entries
- **Configuration**: Hash of relevant configuration options
- **Environment**: Environment-specific cache entries

### Cache Storage Format
Store cache entries with metadata:
```typescript
interface CacheEntry {
  key: string;
  result: WeaverResult;
  metadata: {
    created: Date;
    expires: Date;
    project: string;
    operation: string;
    fileHashes: Record<string, string>;
    configHash: string;
    weaverVersion: string;
  };
  integrity: string; // Hash for validation
}
```

### Cache TTL Strategy
Implement different TTL for different operations:
- **Validation**: 24 hours (schema validation rarely changes)
- **Generation**: 1 hour (code generation may change more frequently)
- **Documentation**: 12 hours (docs change moderately)
- **Clean**: No caching (always execute)

### Distributed Caching Support
- Integrate with Nx Cloud remote caching
- Support custom cache providers
- Handle cache synchronization across team members
- Implement cache warming strategies

### Performance Optimizations
- Use efficient hashing algorithms for cache keys
- Implement cache entry compression for large results
- Support cache entry streaming for very large results
- Implement cache size limits and cleanup

### Error Handling
- Handle cache storage failures gracefully
- Implement cache corruption detection and recovery
- Provide fallback behavior when cache is unavailable
- Log cache operations for debugging

## Implementation Details

### Cache Key Generation Algorithm
1. Collect all relevant input files and their hashes
2. Generate hash of configuration options
3. Combine project, operation, file hashes, and config hash
4. Add Weaver version and environment information
5. Create final cache key using consistent hashing

### Cache Storage Strategy
1. Create cache directory structure
2. Store cache entries as JSON files
3. Include metadata for validation
4. Implement cache entry compression
5. Handle cache cleanup and size limits

### Cache Validation Process
1. Check if cache entry exists
2. Validate cache entry age against TTL
3. Verify cache entry integrity hash
4. Check if input files have changed
5. Validate configuration hasn't changed

### Integration with Nx Caching
- Use Nx computation caching APIs
- Support Nx Cloud remote caching
- Implement proper cache key generation
- Handle cache invalidation through Nx

## Success Criteria
- Generates unique and consistent cache keys
- Provides reliable cache validation and storage
- Integrates seamlessly with Nx caching system
- Supports distributed caching for team environments
- Handles cache errors and corruption gracefully
- Performance impact is minimal (<100ms for cache operations)
- Includes comprehensive unit tests
- Supports cache debugging and monitoring 