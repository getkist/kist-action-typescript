/**
 * @module TypeScriptCompilerAction
 * @description TypeScript compilation action for the Kist build system
 *
 * This module provides a Kist action that compiles TypeScript files to JavaScript
 * using the TypeScript compiler. It supports loading tsconfig.json configurations,
 * custom compiler options, and output directory configuration.
 */

// ============================================================================
// Imports
// ============================================================================

import type { ActionOptionsType } from "kist";
import { Action } from "kist";
import path from "path";
import ts from "typescript";

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration options for {@link TypeScriptCompilerAction}. All fields are
 * optional; when a field is omitted, the action falls back to whatever
 * `tsconfig.json` (or the TypeScript compiler's own defaults) would resolve.
 * `compilerOptions`, when supplied, is merged on top of the compiler options
 * loaded from `tsconfigPath` and takes precedence field-by-field, matching
 * the merge performed inside {@link TypeScriptCompilerAction.execute}.
 *
 * @interface TypeScriptCompilerActionOptions
 * @extends {ActionOptionsType}
 *
 * @example
 * ```yaml
 * # kist.yaml
 * steps:
 *   - action: TypeScriptCompilerAction
 *     options:
 *       tsconfigPath: ./tsconfig.json
 *       outputDir: ./dist
 *       compilerOptions:
 *         target: ES2020
 *         module: ESNext
 *         declaration: true
 * ```
 */
export interface TypeScriptCompilerActionOptions extends ActionOptionsType {
    /** Path to the tsconfig.json file, resolved relative to the process's current working directory (default: `"tsconfig.json"`) */
    tsconfigPath?: string;
    /** Explicit list of file paths to compile; when provided, this replaces the `files`/`include` resolution that would otherwise come from tsconfig.json */
    filePaths?: string[];
    /** Output directory for compiled JavaScript; when provided, overrides the `outDir` from tsconfig.json */
    outputDir?: string;
    /** Additional compiler options merged on top of, and taking precedence over, those loaded from tsconfig.json (default: `{}`, i.e. no overrides) */
    compilerOptions?: ts.CompilerOptions;
}

// ============================================================================
// Classes
// ============================================================================

/**
 * Kist action that compiles TypeScript source files to JavaScript using the
 * TypeScript compiler API (the `typescript` package). Loads and validates
 * `tsconfig.json`, merges in any caller-supplied `compilerOptions` and
 * `outputDir`/`filePaths` overrides, builds a `ts.Program` from the result,
 * and emits JavaScript output. Any diagnostics collected before or during
 * emit (type errors, syntax errors, etc.) are logged and cause the action to
 * fail rather than emit partial/invalid output. Register this action under
 * the name `"TypeScriptCompilerAction"` in a kist.yaml pipeline step; see
 * {@link TypeScriptCompilerActionOptions} for the full set of configurable
 * options.
 *
 * @class TypeScriptCompilerAction
 * @extends {Action}
 *
 * @example
 * const action = new TypeScriptCompilerAction();
 * await action.execute({
 *   tsconfigPath: 'tsconfig.json',
 *   compilerOptions: { declaration: true },
 *   outputDir: 'dist'
 * });
 */
export class TypeScriptCompilerAction extends Action {
    /**
     * Loads `tsconfig.json`, merges it with any caller-supplied
     * `compilerOptions` and `outputDir`, compiles the resolved file set with
     * the TypeScript compiler, and emits the resulting JavaScript.
     * `options.compilerOptions` takes precedence over the equivalent option
     * loaded from `tsconfig.json`; `options.filePaths`, when provided,
     * entirely replaces the file set that `tsconfig.json` would otherwise
     * resolve via `files`/`include`. Every diagnostic collected before or
     * during emit (syntax errors, type errors, etc.) is logged individually
     * via {@link Action.logError} before the method throws, so the full set
     * of problems is visible even though only one `Error` is ultimately
     * raised.
     *
     * This method:
     * 1. Loads and parses the tsconfig.json file
     * 2. Merges custom compiler options (if provided)
     * 3. Creates a TypeScript program with the final options
     * 4. Emits compiled JavaScript files
     * 5. Collects and reports any compilation diagnostics
     *
     * @async
     * @param {TypeScriptCompilerActionOptions} options - Configuration for compilation
     * @returns {Promise<void>} Resolves when compilation is completed successfully.
     * @throws {Error} If `tsconfigPath` (default `"tsconfig.json"`) does not
     * exist, cannot be read, or is not valid JSON — surfaced from
     * {@link loadAndParseTsConfig}.
     * @throws {Error} If the parsed `tsconfig.json` fails TypeScript's own
     * schema validation (e.g. an unrecognized compiler option or an invalid
     * `include`/`exclude` pattern) — also surfaced from
     * {@link loadAndParseTsConfig}.
     * @throws {Error} If the TypeScript compiler reports one or more
     * pre-emit or emit diagnostics (type errors, syntax errors, etc.); the
     * thrown error's message concatenates all diagnostic messages.
     * In every case above, the underlying message is caught, logged via
     * {@link Action.logError}, and rethrown as a single `Error` prefixed
     * with `"TypeScript compilation failed: "`.
     *
     * @example
     * await action.execute({
     *   tsconfigPath: './tsconfig.json',
     *   outputDir: './build',
     *   compilerOptions: { sourceMap: true }
     * });
     */
    async execute(options: TypeScriptCompilerActionOptions): Promise<void> {
        const {
            tsconfigPath = "tsconfig.json",
            filePaths,
            outputDir,
            compilerOptions = {},
        } = options;

        const resolvedTsconfigPath = path.resolve(tsconfigPath);

        this.logInfo(
            `Compiling TypeScript using configuration: ${resolvedTsconfigPath}`,
        );

        try {
            // **Properly Parse tsconfig.json**
            const parsedConfig = this.loadAndParseTsConfig(
                resolvedTsconfigPath,
            );

            // Merge custom compiler options
            const mergedCompilerOptions = ts.convertCompilerOptionsFromJson(
                compilerOptions,
                path.dirname(resolvedTsconfigPath),
            ).options;

            const finalCompilerOptions = {
                ...parsedConfig.options,
                ...mergedCompilerOptions,
            };

            // Set output directory if specified
            if (outputDir) {
                finalCompilerOptions.outDir = outputDir;
            }

            // **Create a TypeScript Program**
            const program = ts.createProgram(
                filePaths ?? parsedConfig.fileNames,
                finalCompilerOptions,
            );

            const emitResult = program.emit();

            // **Collect Diagnostics**
            const allDiagnostics = ts
                .getPreEmitDiagnostics(program)
                .concat(emitResult.diagnostics);
            if (allDiagnostics.length > 0) {
                const diagnosticMessages = allDiagnostics
                    .map((diagnostic) =>
                        ts.flattenDiagnosticMessageText(
                            diagnostic.messageText,
                            "\n",
                        ),
                    )
                    .join("\n");

                allDiagnostics.forEach((diagnostic) => {
                    const message = ts.flattenDiagnosticMessageText(
                        diagnostic.messageText,
                        "\n",
                    );
                    this.logError(`TypeScript Error: ${message}`);
                });

                throw new Error(
                    `TypeScript compilation failed: ${diagnosticMessages}`,
                );
            }

            this.logInfo("TypeScript compilation completed successfully.");
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : String(error);
            this.logError("Error during TypeScript compilation:", error);
            throw new Error(`TypeScript compilation failed: ${message}`);
        }
    }

    /**
     * Loads and parses a tsconfig.json file with proper error handling.
     * Delegates to `ts.readConfigFile` for disk I/O/JSON parsing and to
     * `ts.parseJsonConfigFileContent` for schema validation and resolution
     * of `files`/`include`/`exclude` globs, so the returned file names and
     * compiler options are already normalized/resolved relative to the
     * tsconfig's own directory (not the process's current working
     * directory).
     *
     * This method:
     * 1. Reads the tsconfig.json file from disk
     * 2. Parses the JSON content
     * 3. Validates the configuration against TypeScript's schema
     * 4. Resolves relative paths based on the tsconfig directory
     *
     * @private
     * @param {string} tsconfigPath - The absolute or relative path to the tsconfig.json file.
     * @returns {ts.ParsedCommandLine} The parsed TypeScript configuration including compiler
     *          options and file names to compile.
     * @throws {Error} If the file at `tsconfigPath` does not exist, cannot
     * be read, or its contents are not valid JSON — reported via
     * `ts.readConfigFile`'s diagnostic.
     * @throws {Error} If the parsed configuration object fails TypeScript's
     * schema validation (e.g. an unknown/misspelled compiler option, or an
     * invalid `include`/`exclude` pattern) — reported via the diagnostics
     * array from `ts.parseJsonConfigFileContent`.
     *
     * @example
     * const config = this.loadAndParseTsConfig('./tsconfig.json');
     * console.log(config.options.target); // 'ES2020' or similar
     */
    private loadAndParseTsConfig(tsconfigPath: string): ts.ParsedCommandLine {
        // **Read and Parse tsconfig.json**
        const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);

        if (configFile.error) {
            throw new Error(
                `Error reading tsconfig.json: ${ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n")}`,
            );
        }

        // **Parse the configuration content**
        const parsedConfig = ts.parseJsonConfigFileContent(
            configFile.config,
            ts.sys,
            path.dirname(tsconfigPath),
        );

        if (parsedConfig.errors.length > 0) {
            throw new Error(
                `Error parsing tsconfig.json: ${parsedConfig.errors
                    .map((diag) =>
                        ts.flattenDiagnosticMessageText(
                            diag.messageText,
                            "\n",
                        ),
                    )
                    .join("\n")}`,
            );
        }

        return parsedConfig;
    }

    /**
     * Provides a human-readable description of this action.
     *
     * This method is used by the Kist build system to display information about
     * what this action does in logs and documentation. Overrides the generic
     * {@link Action.describe} default with a description specific to
     * TypeScript compilation.
     *
     * @returns {string} A description of the TypeScript compilation action.
     *
     * @example
     * const action = new TypeScriptCompilerAction();
     * console.log(action.describe());
     * // Output: "Compiles TypeScript files using a given tsconfig.json configuration."
     */
    describe(): string {
        return "Compiles TypeScript files using a given tsconfig.json configuration.";
    }
}
