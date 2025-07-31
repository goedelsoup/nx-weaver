import { WeaverManager, weaverManager } from './weaver-manager.js';

/**
 * Example usage of the Weaver executable manager
 */
export async function weaverManagerExample() {
  console.log('=== Weaver Executable Manager Example ===\n');

  // Example 1: Basic usage with default configuration
  console.log('1. Basic usage with default configuration:');
  try {
    const executablePath = await weaverManager.downloadWeaver('0.96.0');
    console.log(`   Weaver executable downloaded to: ${executablePath}`);
  } catch (error) {
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Example 2: Custom configuration with logging
  console.log('\n2. Custom configuration with logging:');
  const customManager = new WeaverManager({
    cacheDirectory: './custom-weaver-cache',
    downloadTimeout: 60000,
    maxRetries: 5,
    verifyHashes: true,
    enableLogging: true,
    minDiskSpace: 200, // 200MB minimum
  });

  try {
    const executablePath = await customManager.downloadWeaver('0.95.0');
    console.log(`   Weaver executable downloaded to: ${executablePath}`);
  } catch (error) {
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Example 3: Download with progress callback
  console.log('\n3. Download with progress tracking:');
  try {
    const executablePath = await weaverManager.downloadWeaver('0.94.0', {
      onProgress: (percentage) => {
        console.log(`   Download progress: ${percentage}%`);
      },
    });
    console.log(`   Weaver executable downloaded to: ${executablePath}`);
  } catch (error) {
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Example 4: Check installed versions
  console.log('\n4. Installed versions:');
  const versions = weaverManager.getInstalledVersions();
  console.log(`   Installed versions: ${versions.join(', ') || 'none'}`);

  // Example 5: Validate existing installation
  console.log('\n5. Validation:');
  const isValid = await weaverManager.validateWeaver('0.96.0');
  console.log(`   Weaver 0.96.0 is valid: ${isValid}`);

  // Example 6: Get metadata
  console.log('\n6. Metadata:');
  const metadata = await weaverManager.getMetadata('0.96.0');
  if (metadata) {
    console.log(`   Version: ${metadata.version}`);
    console.log(`   Platform: ${metadata.platform}`);
    console.log(`   Architecture: ${metadata.architecture}`);
    console.log(`   Downloaded: ${metadata.downloadedAt}`);
    console.log(
      `   File size: ${metadata.fileSize ? `${(metadata.fileSize / 1024 / 1024).toFixed(2)}MB` : 'unknown'}`
    );
    if (metadata.hash) {
      console.log(`   Hash: ${metadata.hash.substring(0, 16)}...`);
    }
  } else {
    console.log('   No metadata found');
  }

  // Example 7: Get cache statistics
  console.log('\n7. Cache statistics:');
  const stats = await weaverManager.getCacheStats();
  console.log(`   Total versions: ${stats.totalVersions}`);
  console.log(`   Total cache size: ${(stats.totalSize / 1024 / 1024).toFixed(2)}MB`);
  console.log('   Version details:');
  stats.versions.forEach((version) => {
    console.log(
      `     - ${version.version}: ${(version.size / 1024 / 1024).toFixed(2)}MB (${version.lastUsed})`
    );
  });

  // Example 8: Cleanup old versions
  console.log('\n8. Cleanup:');
  await weaverManager.cleanupOldVersions(['0.96.0']); // Keep only 0.96.0
  console.log('   Cleanup completed');

  // Example 9: Get executable path
  console.log('\n9. Executable path:');
  const path = weaverManager.getWeaverPath('0.96.0');
  console.log(`   Path: ${path}`);

  console.log('\n=== Example completed ===');
}

/**
 * Example of error handling and recovery
 */
export async function weaverManagerErrorHandling() {
  console.log('=== Error Handling Example ===\n');

  const manager = new WeaverManager({
    cacheDirectory: './error-test-cache',
    maxRetries: 2,
    downloadTimeout: 1000, // Very short timeout to trigger errors
    enableLogging: true,
  });

  try {
    // This will likely fail due to short timeout
    await manager.downloadWeaver('0.96.0');
  } catch (error) {
    console.log(
      `Download failed as expected: ${error instanceof Error ? error.message : String(error)}`
    );

    // Check if we have any cached versions to fall back to
    const versions = manager.getInstalledVersions();
    if (versions.length > 0) {
      console.log(`Available cached versions: ${versions.join(', ')}`);

      // Try to use a cached version
      const isValid = await manager.validateWeaver(versions[0]);
      if (isValid) {
        console.log(`Using cached version: ${versions[0]}`);
      }
    }
  }
}

/**
 * Example of managing multiple versions with progress tracking
 */
export async function weaverManagerMultiVersion() {
  console.log('=== Multi-Version Management Example ===\n');

  const manager = new WeaverManager({
    cacheDirectory: './multi-version-cache',
    enableLogging: true,
  });

  const versions = ['0.94.0', '0.95.0', '0.96.0'];

  // Download multiple versions with progress tracking
  for (const version of versions) {
    try {
      console.log(`Downloading Weaver ${version}...`);
      await manager.downloadWeaver(version, {
        onProgress: (percentage) => {
          process.stdout.write(`\r   Progress: ${percentage}%`);
        },
      });
      console.log(`\n✓ Weaver ${version} downloaded successfully`);
    } catch (error) {
      console.log(
        `\n✗ Failed to download Weaver ${version}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // List all installed versions
  const installedVersions = manager.getInstalledVersions();
  console.log(`\nInstalled versions: ${installedVersions.join(', ')}`);

  // Validate all versions
  for (const version of installedVersions) {
    const isValid = await manager.validateWeaver(version);
    console.log(`Weaver ${version} is valid: ${isValid}`);
  }

  // Get detailed cache statistics
  const stats = await manager.getCacheStats();
  console.log('\nCache statistics:');
  console.log(`  Total versions: ${stats.totalVersions}`);
  console.log(`  Total size: ${(stats.totalSize / 1024 / 1024).toFixed(2)}MB`);

  // Cleanup keeping only the latest version
  const latestVersion = installedVersions[installedVersions.length - 1];
  await manager.cleanupOldVersions([latestVersion]);
  console.log(`\nKept only version: ${latestVersion}`);
}

/**
 * Example of version validation and hash verification
 */
export async function weaverManagerValidationExample() {
  console.log('=== Validation and Security Example ===\n');

  const manager = new WeaverManager({
    cacheDirectory: './validation-cache',
    verifyHashes: true,
    enableLogging: true,
  });

  try {
    // Download with hash verification
    console.log('Downloading Weaver with hash verification...');
    const executablePath = await manager.downloadWeaver('0.96.0');
    console.log(`Downloaded to: ${executablePath}`);

    // Get metadata to see the hash
    const metadata = await manager.getMetadata('0.96.0');
    if (metadata?.hash) {
      console.log(`File hash: ${metadata.hash}`);
    }

    // Validate the installation
    const isValid = await manager.validateWeaver('0.96.0');
    console.log(`Validation result: ${isValid ? 'PASS' : 'FAIL'}`);
  } catch (error) {
    console.log(`Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  weaverManagerExample()
    .then(() => weaverManagerErrorHandling())
    .then(() => weaverManagerMultiVersion())
    .then(() => weaverManagerValidationExample())
    .catch(console.error);
}
