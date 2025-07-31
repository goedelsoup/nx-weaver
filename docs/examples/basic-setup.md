# Basic Setup Example

This example demonstrates how to set up Weaver in a typical Nx workspace with multiple projects.

## Workspace Structure

```
my-workspace/
├── apps/
│   ├── api/
│   │   ├── weaver/
│   │   │   └── schema.yaml
│   │   └── project.json
│   └── web/
│       ├── weaver/
│       │   └── schema.yaml
│       └── project.json
├── libs/
│   └── shared/
│       ├── weaver/
│       │   └── schema.yaml
│       └── project.json
├── weaver-workspace.json
└── nx.json
```

## Step 1: Install the Plugin

```bash
npm install @nx-weaver/plugin
```

## Step 2: Initialize Weaver

```bash
nx g @nx-weaver/plugin:init --defaultVersion=1.0.0
```

This creates `weaver-workspace.json`:

```json
{
  "defaultVersion": "1.0.0",
  "schemaDirectory": "weaver/",
  "outputDirectory": "dist/weaver/",
  "enabledByDefault": true,
  "defaultArgs": {
    "validate": ["--strict"],
    "generate": ["--typescript"],
    "docs": ["--markdown"]
  },
  "defaultEnvironment": {
    "WEAVER_LOG_LEVEL": "info"
  }
}
```

## Step 3: Set up Projects

Set up Weaver for each project:

```bash
# Set up API project
nx g @nx-weaver/plugin:setup-project api --version=1.0.0

# Set up Web project
nx g @nx-weaver/plugin:setup-project web --version=1.0.0

# Set up Shared library
nx g @nx-weaver/plugin:setup-project shared --version=1.0.0
```

## Step 4: Create Schema Files

### API Schema (`apps/api/weaver/schema.yaml`)

```yaml
name: "api"
version: "1.0.0"
description: "API service telemetry schema"

metrics:
  - name: "http_requests_total"
    type: "counter"
    description: "Total number of HTTP requests"
    unit: "1"
    attributes:
      - name: "method"
        type: "string"
        description: "HTTP method"
      - name: "endpoint"
        type: "string"
        description: "API endpoint"
      - name: "status_code"
        type: "int"
        description: "HTTP status code"

  - name: "http_request_duration_seconds"
    type: "histogram"
    description: "HTTP request duration in seconds"
    unit: "s"
    attributes:
      - name: "method"
        type: "string"
        description: "HTTP method"
      - name: "endpoint"
        type: "string"
        description: "API endpoint"

traces:
  - name: "http_request"
    description: "HTTP request span"
    attributes:
      - name: "method"
        type: "string"
        description: "HTTP method"
      - name: "endpoint"
        type: "string"
        description: "API endpoint"
      - name: "status_code"
        type: "int"
        description: "HTTP status code"
      - name: "duration"
        type: "double"
        description: "Request duration in seconds"

logs:
  - name: "http_request_log"
    description: "HTTP request log entry"
    attributes:
      - name: "level"
        type: "string"
        description: "Log level"
      - name: "message"
        type: "string"
        description: "Log message"
      - name: "method"
        type: "string"
        description: "HTTP method"
      - name: "endpoint"
        type: "string"
        description: "API endpoint"
```

### Web Schema (`apps/web/weaver/schema.yaml`)

```yaml
name: "web"
version: "1.0.0"
description: "Web application telemetry schema"

metrics:
  - name: "page_views_total"
    type: "counter"
    description: "Total number of page views"
    unit: "1"
    attributes:
      - name: "page"
        type: "string"
        description: "Page name"
      - name: "user_type"
        type: "string"
        description: "Type of user"

  - name: "page_load_duration_seconds"
    type: "histogram"
    description: "Page load duration in seconds"
    unit: "s"
    attributes:
      - name: "page"
        type: "string"
        description: "Page name"

traces:
  - name: "page_load"
    description: "Page load span"
    attributes:
      - name: "page"
        type: "string"
        description: "Page name"
      - name: "load_time"
        type: "double"
        description: "Page load time in seconds"
      - name: "user_agent"
        type: "string"
        description: "User agent string"

logs:
  - name: "user_action_log"
    description: "User action log entry"
    attributes:
      - name: "level"
        type: "string"
        description: "Log level"
      - name: "message"
        type: "string"
        description: "Log message"
      - name: "action"
        type: "string"
        description: "User action"
      - name: "page"
        type: "string"
        description: "Page name"
```

### Shared Schema (`libs/shared/weaver/schema.yaml`)

```yaml
name: "shared"
version: "1.0.0"
description: "Shared telemetry schema"

metrics:
  - name: "database_queries_total"
    type: "counter"
    description: "Total number of database queries"
    unit: "1"
    attributes:
      - name: "table"
        type: "string"
        description: "Database table"
      - name: "operation"
        type: "string"
        description: "Database operation"

  - name: "database_query_duration_seconds"
    type: "histogram"
    description: "Database query duration in seconds"
    unit: "s"
    attributes:
      - name: "table"
        type: "string"
        description: "Database table"
      - name: "operation"
        type: "string"
        description: "Database operation"

traces:
  - name: "database_query"
    description: "Database query span"
    attributes:
      - name: "table"
        type: "string"
        description: "Database table"
      - name: "operation"
        type: "string"
        description: "Database operation"
      - name: "query_time"
        type: "double"
        description: "Query execution time in seconds"
      - name: "rows_affected"
        type: "int"
        description: "Number of rows affected"

logs:
  - name: "database_log"
    description: "Database log entry"
    attributes:
      - name: "level"
        type: "string"
        description: "Log level"
      - name: "message"
        type: "string"
        description: "Log message"
      - name: "table"
        type: "string"
        description: "Database table"
      - name: "operation"
        type: "string"
        description: "Database operation"
```

## Step 5: Validate Schemas

Validate all schemas:

```bash
# Validate individual projects
nx weaver-validate api
nx weaver-validate web
nx weaver-validate shared

# Validate all projects
nx run-many --target=weaver-validate --all
```

Expected output:
```bash
✓ Loading configuration for project 'api'
✓ Found 1 schema files in 'weaver/'
✓ Validating schema: weaver/schema.yaml
✓ All schemas are valid
✓ Validation completed in 0.3s

✓ Loading configuration for project 'web'
✓ Found 1 schema files in 'weaver/'
✓ Validating schema: weaver/schema.yaml
✓ All schemas are valid
✓ Validation completed in 0.2s

✓ Loading configuration for project 'shared'
✓ Found 1 schema files in 'weaver/'
✓ Validating schema: weaver/schema.yaml
✓ All schemas are valid
✓ Validation completed in 0.2s
```

## Step 6: Generate Code

Generate code from schemas:

```bash
# Generate code for individual projects
nx weaver-generate api
nx weaver-generate web
nx weaver-generate shared

# Generate code for all projects
nx run-many --target=weaver-generate --all
```

This creates generated files in each project's `dist/weaver/` directory:

```
dist/weaver/
├── index.ts              # Main export file
├── types.ts              # TypeScript type definitions
├── metrics.ts            # Metrics implementation
├── traces.ts             # Traces implementation
├── logs.ts               # Logs implementation
└── utils.ts              # Utility functions
```

## Step 7: Build Projects

Build projects with generated code:

```bash
# Build individual projects
nx build api
nx build web
nx build shared

# Build all projects
nx run-many --target=build --all
```

The build process automatically:
1. Validates Weaver schemas
2. Generates code from schemas
3. Builds the project with the generated code

## Step 8: Generate Documentation

Generate documentation:

```bash
# Generate docs for individual projects
nx weaver-docs api
nx weaver-docs web
nx weaver-docs shared

# Generate docs for all projects
nx run-many --target=weaver-docs --all
```

This creates documentation in each project's `dist/weaver/docs/` directory.

## Step 9: Use Generated Code

The generated code can be imported and used in your applications:

### API Service (`apps/api/src/main.ts`)

```typescript
import { createMetrics, createTraces, createLogs } from '../dist/weaver';

const metrics = createMetrics();
const traces = createTraces();
const logs = createLogs();

// Middleware for HTTP request telemetry
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Create span for request
  const span = traces.http_request.start({
    method: req.method,
    endpoint: req.path
  });

  // Log request
  logs.http_request_log.info({
    level: 'info',
    message: `HTTP ${req.method} ${req.path}`,
    method: req.method,
    endpoint: req.path
  });

  // Override res.end to capture metrics
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = (Date.now() - startTime) / 1000;
    
    // Record metrics
    metrics.http_requests_total.add(1, {
      method: req.method,
      endpoint: req.path,
      status_code: res.statusCode
    });

    metrics.http_request_duration_seconds.record(duration, {
      method: req.method,
      endpoint: req.path
    });

    // End span
    span.end({
      status_code: res.statusCode,
      duration: duration
    });

    // Call original end
    originalEnd.call(this, chunk, encoding);
  };

  next();
});
```

### Web Application (`apps/web/src/app.ts`)

```typescript
import { createMetrics, createTraces, createLogs } from '../dist/weaver';

const metrics = createMetrics();
const traces = createTraces();
const logs = createLogs();

// Track page views
function trackPageView(page: string, userType: string) {
  metrics.page_views_total.add(1, {
    page: page,
    user_type: userType
  });

  logs.user_action_log.info({
    level: 'info',
    message: `Page view: ${page}`,
    action: 'page_view',
    page: page
  });
}

// Track page load performance
function trackPageLoad(page: string, loadTime: number) {
  metrics.page_load_duration_seconds.record(loadTime, {
    page: page
  });

  const span = traces.page_load.start({
    page: page
  });

  span.end({
    load_time: loadTime,
    user_agent: navigator.userAgent
  });
}

// Usage in your application
document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname;
  const userType = getUserType(); // Your user type detection logic
  const loadTime = performance.now() / 1000;

  trackPageView(page, userType);
  trackPageLoad(page, loadTime);
});
```

### Shared Library (`libs/shared/src/database.ts`)

```typescript
import { createMetrics, createTraces, createLogs } from '../dist/weaver';

const metrics = createMetrics();
const traces = createTraces();
const logs = createLogs();

export class DatabaseService {
  async query(table: string, operation: string, query: string) {
    const startTime = Date.now();
    
    // Create span for database query
    const span = traces.database_query.start({
      table: table,
      operation: operation
    });

    try {
      // Execute query
      const result = await this.executeQuery(query);
      const duration = (Date.now() - startTime) / 1000;

      // Record metrics
      metrics.database_queries_total.add(1, {
        table: table,
        operation: operation
      });

      metrics.database_query_duration_seconds.record(duration, {
        table: table,
        operation: operation
      });

      // Log success
      logs.database_log.info({
        level: 'info',
        message: `Database query executed successfully`,
        table: table,
        operation: operation
      });

      // End span
      span.end({
        query_time: duration,
        rows_affected: result.rowCount
      });

      return result;
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;

      // Log error
      logs.database_log.error({
        level: 'error',
        message: `Database query failed: ${error.message}`,
        table: table,
        operation: operation
      });

      // End span with error
      span.end({
        query_time: duration,
        error: error.message
      });

      throw error;
    }
  }

  private async executeQuery(query: string) {
    // Your database query execution logic
    return { rowCount: 1 };
  }
}
```

## Step 10: Clean Up

Clean generated files when needed:

```bash
# Clean individual projects
nx weaver-clean api
nx weaver-clean web
nx weaver-clean shared

# Clean all projects
nx run-many --target=weaver-clean --all
```

## Configuration Files

### Project Configuration (`apps/api/weaver.json`)

```json
{
  "enabled": true,
  "version": "1.0.0",
  "schemaDirectory": "weaver/",
  "outputDirectory": "dist/weaver/",
  "args": {
    "validate": ["--strict"],
    "generate": ["--typescript"],
    "docs": ["--markdown"]
  },
  "environment": {
    "WEAVER_LOG_LEVEL": "info"
  }
}
```

### Nx Project Configuration (`apps/api/project.json`)

```json
{
  "name": "api",
  "targets": {
    "weaver-validate": {
      "executor": "@nx-weaver/validate",
      "options": {
        "project": "api"
      }
    },
    "weaver-generate": {
      "executor": "@nx-weaver/generate",
      "options": {
        "project": "api"
      },
      "dependsOn": ["weaver-validate"]
    },
    "weaver-docs": {
      "executor": "@nx-weaver/docs",
      "options": {
        "project": "api"
      },
      "dependsOn": ["weaver-validate"]
    },
    "weaver-clean": {
      "executor": "@nx-weaver/clean",
      "options": {
        "project": "api"
      }
    },
    "build": {
      "executor": "@nx/js:tsc",
      "options": {
        "main": "apps/api/src/main.ts",
        "outputPath": "dist/apps/api"
      },
      "dependsOn": ["weaver-generate"]
    }
  }
}
```

## Testing the Setup

### Test Validation

```bash
# Test schema validation
nx weaver-validate api --verbose
```

### Test Code Generation

```bash
# Test code generation
nx weaver-generate api --verbose
```

### Test Build Integration

```bash
# Test build with Weaver integration
nx build api --verbose
```

### Test Generated Code

```typescript
// Test the generated code
import { createMetrics } from '../dist/weaver';

const metrics = createMetrics();
metrics.http_requests_total.add(1, {
  method: 'GET',
  endpoint: '/api/test',
  status_code: 200
});

console.log('Generated code works!');
```

## Next Steps

- [Advanced Configuration](../user-guide/configuration.md) - Learn about advanced configuration options
- [Integration Examples](integration-examples.md) - See real-world integration examples
- [Troubleshooting](../user-guide/troubleshooting.md) - Common issues and solutions 