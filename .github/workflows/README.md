# GitHub Actions Workflows

This directory contains GitHub Actions workflows for the nx-weaver project.

## Workflows

### Pull Request Pipeline (`pr-pipeline.yml`)

A comprehensive CI/CD pipeline that runs on pull requests and can be triggered manually.

#### Triggers

- **Automatic**: Runs on pull requests to `main` and `develop` branches
- **Manual**: Can be triggered manually via GitHub Actions UI with customizable options

#### Manual Trigger Options

When triggering manually, you can configure:

- **Environment**: Choose between development, staging, or production
- **Run Tests**: Enable/disable unit tests
- **Run Lint**: Enable/disable linting and formatting checks
- **Run Build**: Enable/disable build process
- **Run Integration Tests**: Enable/disable integration tests
- **Run Weaver Tests**: Enable/disable Weaver integration tests (optional)

#### Jobs

1. **Setup Environment**
   - Sets up Node.js and pnpm
   - Installs dependencies
   - Caches dependencies for faster subsequent runs

2. **Lint and Format Check**
   - Runs Biome linting
   - Checks code formatting
   - Performs TypeScript type checking

3. **Unit Tests**
   - Runs unit tests across Node.js versions 16, 18, and 20
   - Uploads test coverage to Codecov
   - Matrix strategy for comprehensive testing

4. **Integration Tests**
   - Runs end-to-end integration tests
   - Uploads test results as artifacts

5. **Weaver Integration Tests** (Optional)
   - Runs Weaver-specific integration tests
   - Only runs when manually triggered with `run_weaver_tests: true`
   - Downloads and tests real Weaver executables

6. **Build**
   - Builds the project using Nx
   - Uploads build artifacts
   - Depends on lint and test jobs

7. **Security Scan**
   - Runs npm audit with moderate severity threshold
   - Checks for known vulnerabilities

8. **Pipeline Summary**
   - Generates a summary of all job results
   - Comments on pull requests with status
   - Always runs to provide feedback

#### Features

- **Dependency Caching**: Uses GitHub Actions cache to speed up builds
- **Matrix Testing**: Tests across multiple Node.js versions
- **Artifact Upload**: Preserves test results and build artifacts
- **Conditional Jobs**: Jobs can be enabled/disabled based on trigger type
- **PR Comments**: Automatically comments on pull requests with pipeline status
- **Parallel Execution**: Jobs run in parallel where possible for faster feedback

#### Usage

##### Automatic Trigger
The pipeline runs automatically when:
- A pull request is opened against `main` or `develop`
- A pull request is updated (synchronized)
- A pull request is reopened
- A pull request is marked as ready for review

##### Manual Trigger
1. Go to the **Actions** tab in GitHub
2. Select **Pull Request Pipeline**
3. Click **Run workflow**
4. Configure the options as needed
5. Click **Run workflow**

#### Environment Variables

The workflow uses these environment variables:
- `NODE_VERSION`: Set to '18' (default Node.js version)
- `PNPM_VERSION`: Set to '8' (pnpm version)
- `WEAVER_TEST_TIMEOUT`: Set to 120000ms for Weaver tests

#### Dependencies

The workflow requires these secrets (optional):
- `SNYK_TOKEN`: For Snyk security scanning (if enabled)

#### Artifacts

The workflow generates these artifacts:
- `build-artifacts`: Contains the built project
- `integration-test-results`: Contains integration test results
- `weaver-test-results`: Contains Weaver test results and cache

#### Job Dependencies

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

#### Best Practices

1. **Fast Feedback**: Critical jobs (lint, test) run first
2. **Parallel Execution**: Independent jobs run in parallel
3. **Conditional Execution**: Optional jobs only run when needed
4. **Caching**: Dependencies are cached to speed up builds
5. **Artifacts**: Test results and builds are preserved
6. **Notifications**: Status is reported back to pull requests

#### Troubleshooting

**Common Issues:**

1. **Cache Miss**: If dependencies aren't cached, the setup job will take longer
2. **Node Version Issues**: Matrix testing ensures compatibility across Node.js versions
3. **Weaver Download Failures**: Weaver tests may fail if GitHub releases are unavailable
4. **Security Audit Failures**: Update dependencies if security vulnerabilities are found

**Debugging:**

- Check the **Actions** tab for detailed logs
- Download artifacts to inspect test results
- Review PR comments for pipeline status
- Check job dependencies if jobs are skipped 