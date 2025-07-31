# Quick Start

Get up and running with the Nx Weaver Plugin in under 5 minutes.

## Prerequisites

- Node.js 16.0.0 or later
- Nx workspace (existing or new)

## Step 1: Install the Plugin

```bash
npm install @nx-weaver/plugin
```

## Step 2: Initialize Weaver

```bash
nx g @nx-weaver/plugin:init
```

This creates the workspace configuration and sets up defaults.

## Step 3: Set up a Project

```bash
nx g @nx-weaver/plugin:setup-project my-project
```

This sets up Weaver for your project and creates initial schema files.

## Step 4: Create Your First Schema

Edit the generated schema file at `my-project/weaver/schema.yaml`:

```yaml
name: "my-service"
version: "1.0.0"
description: "My service telemetry schema"

metrics:
  - name: "requests_total"
    type: "counter"
    description: "Total number of requests"
    unit: "1"
    attributes:
      - name: "endpoint"
        type: "string"
        description: "API endpoint"

traces:
  - name: "request"
    description: "Request span"
    attributes:
      - name: "endpoint"
        type: "string"
        description: "API endpoint"
      - name: "duration"
        type: "double"
        description: "Request duration in seconds"
```

## Step 5: Validate and Generate

```bash
# Validate your schema
nx weaver-validate my-project

# Generate code from your schema
nx weaver-generate my-project
```

## Step 6: Use Generated Code

The generated code is available in `my-project/dist/weaver/`. Import and use it in your application:

```typescript
import { createMetrics, createTraces } from '../dist/weaver';

const metrics = createMetrics();
const traces = createTraces();

// Use the generated telemetry
metrics.requests_total.add(1, { endpoint: '/api/users' });

const span = traces.request.start({ endpoint: '/api/users' });
// ... your code here ...
span.end({ duration: 0.5 });
```

## Step 7: Build Integration

The plugin automatically integrates with your build process. When you run:

```bash
nx build my-project
```

It will automatically:
1. Validate schemas
2. Generate code
3. Build your project

## What's Next?

- [User Guide](../user-guide/) - Learn about all available features
- [Examples](../examples/) - See real-world usage patterns
- [Configuration](../user-guide/configuration.md) - Customize your setup

## Common Commands

```bash
# Validate schemas
nx weaver-validate my-project

# Generate code
nx weaver-generate my-project

# Generate documentation
nx weaver-docs my-project

# Clean generated files
nx weaver-clean my-project

# Build with Weaver integration
nx build my-project
```

## Troubleshooting

If you encounter issues:

1. Check that the plugin is installed: `npm list @nx-weaver/plugin`
2. Verify Weaver is initialized: `ls weaver-workspace.json`
3. Check project setup: `ls my-project/weaver.json`
4. Run with verbose output: `nx weaver-validate my-project --verbose`

For more help, see the [Troubleshooting Guide](../user-guide/troubleshooting.md). 