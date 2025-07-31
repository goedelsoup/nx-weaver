# Pull Request Pipeline

The nx-weaver project includes a comprehensive CI/CD pipeline that runs on pull requests and can be triggered manually.

## Overview

The pull request pipeline ensures code quality, runs tests, and validates the build process before code is merged. It consists of multiple jobs that run in parallel and provide fast feedback to developers.

## Workflows

### 1. Pull Request Pipeline (`pr-pipeline.yml`)

**Location**: `.github/workflows/pr-pipeline.yml`

A comprehensive pipeline that runs on pull requests and supports manual triggering with customizable options.

#### Triggers

- **Automatic**: Runs on pull requests to `main` and `develop` branches
- **Manual**: Can be triggered manually via GitHub Actions UI

#### Manual Trigger Options

When triggering manually, you can configure:

| Option | Description | Default |
|--------|-------------|---------|
| `environment` | Environment to run against | `development` |
| `run_tests` | Enable/disable unit tests | `true` |
| `run_lint` | Enable/disable linting | `true` |
| `run_build` | Enable/disable build process | `true` |
| `run_integration_tests` | Enable/disable integration tests | `true` |
| `run_weaver_tests` | Enable/disable Weaver integration tests | `false` |

### 2. Quick Check (`quick-check.yml`)

**Location**: `.github/workflows/quick-check.yml`

A lightweight workflow for fast development feedback.

#### Triggers

- **Automatic**: Runs on pushes and pull requests to `main` and `develop`
- **Manual**: Can be triggered manually

## Jobs

### Setup Environment

- Sets up Node.js and pnpm
- Installs dependencies
- Caches dependencies for faster subsequent runs

### Lint and Format Check

- Runs Biome linting
- Checks code formatting
- Performs TypeScript type checking

### Unit Tests

- Runs unit tests across Node.js versions 16, 18, and 20
- Uploads test coverage to Codecov
- Matrix strategy for comprehensive testing

### Integration Tests

- Runs end-to-end integration tests
- Uploads test results as artifacts

### Weaver Integration Tests (Optional)

- Runs Weaver-specific integration tests
- Only runs when manually triggered with `run_weaver_tests: true`
- Downloads and tests real Weaver executables

### Build

- Builds the project using Nx
- Uploads build artifacts
- Depends on lint and test jobs

### Security Scan

- Runs npm audit with high severity threshold
- Checks for known vulnerabilities

### Pipeline Summary

- Generates a summary of all job results
- Comments on pull requests with status
- Always runs to provide feedback

## Features

### Dependency Caching

Uses GitHub Actions cache to speed up builds by caching:
- `node_modules`
- `.pnpm-store`

### Matrix Testing

Tests across multiple Node.js versions (16, 18, 20) to ensure compatibility.

### Artifact Upload

Preserves important outputs:
- `build-artifacts`: Contains the built project
- `integration-test-results`: Contains integration test results
- `weaver-test-results`: Contains Weaver test results and cache

### Conditional Jobs

Jobs can be enabled/disabled based on:
- Trigger type (automatic vs manual)
- User-selected options
- Job dependencies

### PR Comments

Automatically comments on pull requests with:
- Pipeline status (success/failure)
- Job results summary
- Trigger information

### Parallel Execution

Jobs run in parallel where possible for faster feedback:
- Lint, test, integration-test, security run in parallel
- Build waits for lint and test
- Summary waits for all jobs

## Usage

### Automatic Trigger

The pipeline runs automatically when:
- A pull request is opened against `main` or `develop`
- A pull request is updated (synchronized)
- A pull request is reopened
- A pull request is marked as ready for review

### Manual Trigger

1. Go to the **Actions** tab in GitHub
2. Select **Pull Request Pipeline**
3. Click **Run workflow**
4. Configure the options as needed
5. Click **Run workflow**

### Quick Check

For faster feedback during development:
1. Go to the **Actions** tab in GitHub
2. Select **Quick Check**
3. Click **Run workflow**

## Environment Variables

The workflows use these environment variables:
- `NODE_VERSION`: Set to '18' (default Node.js version)
- `PNPM_VERSION`: Set to '8' (pnpm version)
- `WEAVER_TEST_TIMEOUT`: Set to 120000ms for Weaver tests

## Dependencies

The workflows require these secrets (optional):
- `SNYK_TOKEN`: For Snyk security scanning (if enabled)

## Job Dependencies

```
setup
├── lint
├── test
├── integration-test
├── weaver-test (optional)
└── security

lint, test ──> build
all jobs ──> summary
```

## Best Practices

1. **Fast Feedback**: Critical jobs (lint, test) run first
2. **Parallel Execution**: Independent jobs run in parallel
3. **Conditional Execution**: Optional jobs only run when needed
4. **Caching**: Dependencies are cached to speed up builds
5. **Artifacts**: Test results and builds are preserved
6. **Notifications**: Status is reported back to pull requests

## Troubleshooting

### Common Issues

1. **Cache Miss**: If dependencies aren't cached, the setup job will take longer
2. **Node Version Issues**: Matrix testing ensures compatibility across Node.js versions
3. **Weaver Download Failures**: Weaver tests may fail if GitHub releases are unavailable
4. **Security Audit Failures**: Update dependencies if security vulnerabilities are found

### Debugging

- Check the **Actions** tab for detailed logs
- Download artifacts to inspect test results
- Review PR comments for pipeline status
- Check job dependencies if jobs are skipped

### Performance Optimization

- The pipeline uses caching to speed up builds
- Jobs run in parallel where possible
- Optional jobs can be disabled to reduce execution time
- Matrix testing is limited to essential Node.js versions

## Configuration

### Customizing the Pipeline

To customize the pipeline:

1. **Add new jobs**: Edit `.github/workflows/pr-pipeline.yml`
2. **Modify triggers**: Update the `on` section
3. **Add new scripts**: Update `package.json` scripts
4. **Change environments**: Modify the environment variables

### Local Testing

Before pushing changes, test locally:

```bash
# Run all checks locally
pnpm lint
pnpm type-check
pnpm test
pnpm build
pnpm audit

# Run specific test suites
pnpm test:unit
pnpm test:integration
pnpm test:weaver
```

## Security Considerations

- The pipeline runs in isolated environments
- Secrets are only available to authorized workflows
- Security scanning is performed on all builds
- Dependencies are audited for vulnerabilities

## Monitoring

- Pipeline status is visible in the GitHub Actions tab
- Failed jobs provide detailed error information
- Artifacts can be downloaded for further analysis
- PR comments provide quick status overview 