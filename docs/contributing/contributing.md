# Contributing

Thank you for your interest in contributing to the Nx Weaver Plugin! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js 16.0.0 or later
- npm, yarn, or pnpm
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/nx-weaver.git
   cd nx-weaver
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the plugin**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## Development Workflow

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding standards
   - Add tests for new functionality
   - Update documentation

3. **Run tests and linting**
   ```bash
   npm run check
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a pull request**
   - Use the PR template
   - Describe your changes
   - Link any related issues

### Code Standards

- **TypeScript**: Use strict mode and proper typing
- **Formatting**: Use Biome for formatting and linting
- **Testing**: Write unit tests for new functionality
- **Documentation**: Update docs for new features

### Commit Message Format

Use conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

Examples:
```
feat(executor): add new weaver executor
fix(config): resolve configuration inheritance issue
docs(api): update API documentation
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- executor.spec.ts
```

### Writing Tests

- Use Vitest for testing
- Write unit tests for all new functionality
- Use descriptive test names
- Mock external dependencies

Example test:
```typescript
import { describe, it, expect } from 'vitest';
import { validateConfig } from '../src/utils/config';

describe('validateConfig', () => {
  it('should validate a valid configuration', () => {
    const config = {
      version: '1.0.0',
      enabled: true
    };

    const result = validateConfig(config);
    expect(result.isValid).toBe(true);
  });

  it('should reject invalid configuration', () => {
    const config = {
      version: 'invalid'
    };

    const result = validateConfig(config);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid version format');
  });
});
```

## Documentation

### Updating Documentation

- Update relevant documentation for new features
- Add examples for new functionality
- Keep API documentation current
- Use clear, concise language

### Documentation Structure

```
docs/
├── getting-started/     # Installation and setup
├── user-guide/         # Usage instructions
├── api/               # API reference
├── examples/          # Code examples
├── migration/         # Migration guides
└── contributing/      # Contributing guides
```

## Pull Request Process

### Before Submitting

1. **Ensure tests pass**
   ```bash
   npm run check
   ```

2. **Update documentation**
   - Add docs for new features
   - Update API documentation
   - Add examples if needed

3. **Check for breaking changes**
   - Update version numbers
   - Add migration guide if needed
   - Update changelog

### PR Guidelines

- **Title**: Clear, descriptive title
- **Description**: Explain what and why, not how
- **Tests**: Include tests for new functionality
- **Documentation**: Update relevant docs
- **Breaking changes**: Clearly mark and explain

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Documentation review** if needed
4. **Final approval** before merge

## Issue Reporting

### Bug Reports

When reporting bugs, include:

1. **Environment information**
   - OS and version
   - Node.js version
   - Nx version
   - Plugin version

2. **Steps to reproduce**
   - Clear, step-by-step instructions
   - Minimal example if possible

3. **Expected vs actual behavior**
   - What you expected to happen
   - What actually happened

4. **Additional context**
   - Error messages
   - Logs
   - Screenshots if relevant

### Feature Requests

When requesting features:

1. **Describe the problem**
   - What are you trying to accomplish?
   - What's the current limitation?

2. **Propose a solution**
   - How should it work?
   - Any specific requirements?

3. **Consider alternatives**
   - Are there workarounds?
   - Other approaches?

## Release Process

### Versioning

We use semantic versioning:

- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes (backward compatible)

### Release Steps

1. **Update version**
   ```bash
   npm version patch|minor|major
   ```

2. **Update changelog**
   - Document all changes
   - Include breaking changes
   - Add migration notes if needed

3. **Create release**
   - Tag the release
   - Write release notes
   - Publish to npm

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Help others learn
- Provide constructive feedback
- Follow project conventions

### Communication

- **Issues**: Use GitHub issues for bugs and features
- **Discussions**: Use GitHub discussions for questions
- **Chat**: Join our community chat (if available)

### Recognition

Contributors are recognized in:
- README contributors section
- Release notes
- Project documentation

## Getting Help

### Questions and Support

- **Documentation**: Check the docs first
- **Issues**: Search existing issues
- **Discussions**: Ask in GitHub discussions
- **Chat**: Join community chat

### Mentorship

New contributors can:
- Ask for help in issues/PRs
- Request code reviews
- Ask for guidance on complex changes

## Next Steps

- [Development Setup](development.md) - Setting up development environment
- [Testing Guide](testing.md) - How to run and write tests
- [API Documentation](../api/) - Understanding the codebase 