# Development Setup

This guide will help you set up your development environment for contributing to the Nx Weaver Plugin.

## Prerequisites

### Required Software

- **Node.js**: Version 16.0.0 or later
- **npm/yarn/pnpm**: Package manager
- **Git**: Version control
- **Editor**: VS Code recommended (with TypeScript support)

### Optional Software

- **Docker**: For testing in different environments
- **Postman/Insomnia**: For API testing
- **GitHub CLI**: For easier GitHub workflow

## Environment Setup

### 1. Install Node.js

Download and install Node.js from [nodejs.org](https://nodejs.org/).

Verify installation:
```bash
node --version  # Should be 16.0.0 or later
npm --version   # Should be 8.0.0 or later
```

### 2. Install Git

Download and install Git from [git-scm.com](https://git-scm.com/).

Configure Git:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3. Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/nx-weaver.git
   cd nx-weaver
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-owner/nx-weaver.git
   ```

### 4. Install Dependencies

```bash
# Install dependencies
npm install

# Or using yarn
yarn install

# Or using pnpm
pnpm install
```

### 5. Build the Plugin

```bash
# Build the plugin
npm run build

# Watch mode for development
npm run build:watch
```

### 6. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## IDE Setup

### VS Code (Recommended)

Install recommended extensions:
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- GitLens
- Nx Console

### VS Code Settings

Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always"
}
```

### Other Editors

- **WebStorm**: Excellent TypeScript support
- **Vim/Neovim**: Use coc.nvim for TypeScript support
- **Emacs**: Use lsp-mode for TypeScript support

## Project Structure

```
nx-weaver/
├── src/
│   ├── executors/          # Executor implementations
│   │   ├── validate/       # Validation executor
│   │   ├── generate/       # Code generation executor
│   │   ├── docs/          # Documentation executor
│   │   └── clean/         # Cleanup executor
│   ├── generators/         # Generator implementations
│   │   ├── init/          # Workspace initialization
│   │   └── setup-project/ # Project setup
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── index.ts           # Main exports
├── docs/                  # Documentation
├── tests/                 # Test files
├── templates/             # Code generation templates
├── package.json           # Package configuration
├── tsconfig.json          # TypeScript configuration
├── biome.json             # Biome configuration
└── README.md              # Project documentation
```

## Development Workflow

### 1. Create a Feature Branch

```bash
# Update your fork
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Changes

1. **Edit code** in your preferred editor
2. **Run tests** frequently:
   ```bash
   npm test
   ```
3. **Check formatting**:
   ```bash
   npm run format
   npm run lint
   ```

### 3. Test Your Changes

```bash
# Run all checks
npm run check

# Test specific functionality
npm test -- --grep "your test pattern"

# Build and test locally
npm run build
npm run test:integration
```

### 4. Commit Changes

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add new weaver executor"

# Push to your fork
git push origin feature/your-feature-name
```

### 5. Create Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your feature branch
4. Fill out the PR template
5. Submit for review

## Testing

### Unit Tests

Tests are written using Vitest:

```typescript
import { describe, it, expect } from 'vitest';
import { validateConfig } from '../src/utils/config';

describe('validateConfig', () => {
  it('should validate valid configuration', () => {
    const config = { version: '1.0.0' };
    const result = validateConfig(config);
    expect(result.isValid).toBe(true);
  });
});
```

### Integration Tests

Test the plugin in a real Nx workspace:

```bash
# Create test workspace
npx create-nx-workspace@latest test-workspace --preset=empty

# Install plugin locally
cd test-workspace
npm install ../nx-weaver

# Test plugin functionality
nx g @nx-weaver/plugin:init
```

### E2E Tests

Test complete workflows:

```bash
# Run E2E tests
npm run test:e2e

# Test specific scenario
npm run test:e2e -- --grep "weaver init"
```

## Debugging

### Debug Tests

```bash
# Debug tests with Node.js inspector
npm test -- --inspect-brk

# Debug specific test
npm test -- --inspect-brk --grep "test name"
```

### Debug Plugin

```bash
# Build with source maps
npm run build:debug

# Run with debug logging
DEBUG=@nx-weaver/* nx weaver-validate my-project
```

### VS Code Debugging

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "--reporter=verbose"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## Code Quality

### Linting

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

### Formatting

```bash
# Check formatting
npm run format:check

# Fix formatting
npm run format
```

### Type Checking

```bash
# Check TypeScript types
npm run type-check

# Build with type checking
npm run build
```

## Performance

### Benchmarking

```bash
# Run performance tests
npm run test:perf

# Profile specific operations
npm run test:perf -- --grep "weaver generate"
```

### Memory Profiling

```bash
# Profile memory usage
npm run test:perf -- --inspect-brk

# Analyze heap snapshots
node --inspect-brk --expose-gc ./node_modules/vitest/vitest.mjs run
```

## Documentation

### API Documentation

Generate API documentation:

```bash
# Generate docs
npm run docs:generate

# Serve docs locally
npm run docs:serve
```

### Update Documentation

1. **Update relevant docs** for your changes
2. **Add examples** for new features
3. **Update API docs** if interfaces change
4. **Test documentation** locally

## Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

#### Test Failures

```bash
# Clear test cache
npm run test:clear

# Run tests with verbose output
npm test -- --verbose
```

#### Dependency Issues

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

- **Check existing issues** on GitHub
- **Search documentation** for solutions
- **Ask in discussions** or issues
- **Join community chat** if available

## Next Steps

- [Testing Guide](testing.md) - Learn about testing practices
- [Contributing Guide](contributing.md) - General contributing guidelines
- [API Documentation](../api/) - Understand the codebase 