/**
 * Generic validation rule interface.
 *
 * @example
 * ```typescript
 * const requiredRule: ValidationRule<string> = {
 *   name: "required",
 *   validate: (value) => ({
 *     isValid: value.length > 0,
 *     errors: value.length === 0 ? ["Field is required"] : [],
 *     warnings: [],
 *     suggestions: []
 *   }),
 *   message: "Field is required"
 * };
 * ```
 */
export interface ValidationRule<T> {
  /** Name of the validation rule */
  name: string;

  /** Validation function */
  validate: (value: T, context?: any) => ValidationResult;

  /** Default error message for this rule */
  message: string;
}

/**
 * Result of a validation operation.
 *
 * @example
 * ```typescript
 * {
 *   isValid: true,
 *   errors: [],
 *   warnings: ["Deprecated field used"],
 *   suggestions: ["Consider using newer syntax"]
 * }
 * ```
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;

  /** List of validation errors */
  errors: string[];

  /** List of validation warnings */
  warnings: string[];

  /** List of improvement suggestions */
  suggestions: string[];
}

/**
 * Result of schema validation operations.
 *
 * @example
 * ```typescript
 * {
 *   isValid: true,
 *   errors: [],
 *   warnings: ["Deprecated field used"],
 *   suggestions: ["Consider using newer syntax"],
 *   schema: "schema.graphql",
 *   errors: [],
 *   warnings: [{ path: "User.email", message: "Deprecated field", code: "DEPRECATED" }]
 * }
 * ```
 */
export interface SchemaValidationResult extends ValidationResult {
  /** Name of the schema file being validated */
  schema: string;

  /** Detailed schema errors */
  schemaErrors: SchemaError[];

  /** Detailed schema warnings */
  schemaWarnings: SchemaWarning[];
}

/**
 * Detailed schema error information.
 *
 * @example
 * ```typescript
 * {
 *   path: "User.email",
 *   message: "Field 'email' is required",
 *   code: "REQUIRED_FIELD",
 *   severity: "error"
 * }
 * ```
 */
export interface SchemaError {
  /** Path to the error location in the schema */
  path: string;

  /** Error message */
  message: string;

  /** Error code for programmatic handling */
  code: string;

  /** Error severity level */
  severity: 'error' | 'warning';
}

/**
 * Detailed schema warning information.
 *
 * @example
 * ```typescript
 * {
 *   path: "User.email",
 *   message: "Field 'email' is deprecated",
 *   code: "DEPRECATED_FIELD",
 *   suggestion: "Use 'emailAddress' instead"
 * }
 * ```
 */
export interface SchemaWarning {
  /** Path to the warning location in the schema */
  path: string;

  /** Warning message */
  message: string;

  /** Warning code for programmatic handling */
  code: string;

  /** Suggested fix for the warning */
  suggestion?: string;
}

/**
 * Configuration validation result.
 *
 * @example
 * ```typescript
 * {
 *   isValid: true,
 *   errors: [],
 *   warnings: ["Deprecated option used"],
 *   suggestions: ["Consider using newer syntax"],
 *   configPath: "weaver.config.json",
 *   fieldErrors: {
 *     "schemaDirectory": ["Directory does not exist"]
 *   }
 * }
 * ```
 */
export interface ConfigValidationResult extends ValidationResult {
  /** Path to the configuration file */
  configPath: string;

  /** Errors grouped by configuration field */
  fieldErrors: Record<string, string[]>;

  /** Warnings grouped by configuration field */
  fieldWarnings: Record<string, string[]>;
}

/**
 * File validation result.
 *
 * @example
 * ```typescript
 * {
 *   isValid: true,
 *   errors: [],
 *   warnings: ["File is large"],
 *   suggestions: ["Consider splitting into smaller files"],
 *   filePath: "schema.graphql",
 *   fileSize: 1024000,
 *   fileType: "graphql",
 *   syntaxValid: true
 * }
 * ```
 */
export interface FileValidationResult extends ValidationResult {
  /** Path to the file being validated */
  filePath: string;

  /** Size of the file in bytes */
  fileSize: number;

  /** Type of the file */
  fileType: string;

  /** Whether the file syntax is valid */
  syntaxValid: boolean;
}

/**
 * Options for validation operations.
 *
 * @example
 * ```typescript
 * {
 *   strict: true,
 *   ignoreWarnings: false,
 *   maxFileSize: 1048576,
 *   allowedFileTypes: ["graphql", "gql"],
 *   validateSyntax: true
 * }
 * ```
 */
export interface ValidationOptions {
  /** Whether to use strict validation rules */
  strict?: boolean;

  /** Whether to ignore warnings */
  ignoreWarnings?: boolean;

  /** Maximum file size in bytes */
  maxFileSize?: number;

  /** Allowed file types */
  allowedFileTypes?: string[];

  /** Whether to validate file syntax */
  validateSyntax?: boolean;

  /** Custom validation rules */
  customRules?: ValidationRule<any>[];
}
