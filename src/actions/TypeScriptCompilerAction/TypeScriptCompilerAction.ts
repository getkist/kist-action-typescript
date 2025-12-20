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
 * Configuration options for the TypeScript compiler action.
 *
 * @interface TypeScriptCompilerActionOptions
 * @extends {ActionOptionsType}
 *
 * @property {string} [tsconfigPath="tsconfig.json"] - Path to the tsconfig.json file.
 *           If not provided, defaults to "tsconfig.json" in the current directory.
 * @property {string[]} [filePaths] - Optional array of file paths to compile.
 *           If provided, overrides the files specified in tsconfig.json.
 * @property {string} [outputDir] - Optional output directory for compiled JavaScript files.
 *           Overrides the outDir specified in tsconfig.json if provided.
 * @property {Record<string, any>} [compilerOptions] - Optional additional compiler options
 *           to merge with those from tsconfig.json. Takes precedence over tsconfig options.
 */
export interface TypeScriptCompilerActionOptions extends ActionOptionsType {
    tsconfigPath?: string;
    filePaths?: string[];
    outputDir?: string;
    compilerOptions?: Record<string, any>;
}

// ============================================================================
// Classes
// ============================================================================

/**
 * TypeScript Compiler Action for the Kist build system.
 *
 * This action compiles TypeScript source files to JavaScript using the TypeScript compiler.
 * It handles:
 * - Loading and parsing tsconfig.json configurations
 * - Merging custom compiler options
 * - Handling compilation diagnostics and errors
 * - Logging compilation progress and results
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
     * Executes the TypeScript compilation process.
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
     * @throws {Error} Throws an error if compilation fails with details about the failure.
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
        } catch (error: any) {
            this.logError("Error during TypeScript compilation:", error);
            throw new Error(`TypeScript compilation failed: ${error.message}`);
        }
    }

    /**
     * Loads and parses a tsconfig.json file with proper error handling.
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
     * @throws {Error} Throws an error if the file cannot be read or the JSON is invalid.
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
     * what this action does in logs and documentation.
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
