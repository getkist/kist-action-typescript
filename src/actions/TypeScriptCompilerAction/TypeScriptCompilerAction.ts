// ============================================================================
// Imports
// ============================================================================

import { Action, ActionOptionsType } from "kist";
import path from "path";
import ts from "typescript";

// ============================================================================
// Types
// ============================================================================

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
 * TypeScriptCompilerAction compiles TypeScript files into JavaScript.
 */
export class TypeScriptCompilerAction extends Action {
    /**
     * Executes the TypeScript compilation process.
     *
     * @param options - The options specifying the tsconfig path and additional compiler options.
     * @returns A Promise that resolves when compilation is completed successfully.
     * @throws {Error} Throws an error if compilation fails.
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
                allDiagnostics.forEach((diagnostic) => {
                    const message = ts.flattenDiagnosticMessageText(
                        diagnostic.messageText,
                        "\n",
                    );
                    this.logError(`TypeScript Error: ${message}`);
                });
                throw new Error(
                    "TypeScript compilation failed due to errors.",
                );
            }

            this.logInfo("TypeScript compilation completed successfully.");
        } catch (error: any) {
            this.logError("Error during TypeScript compilation:", error);
            throw new Error(`TypeScript compilation failed: ${error.message}`);
        }
    }

    /**
     * Loads and parses `tsconfig.json` properly before passing it to the compiler.
     *
     * @param tsconfigPath - The path to the tsconfig.json file.
     * @returns Parsed TypeScript compiler options and source files.
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
     * Provides a description of the action.
     *
     * @returns A string description of the action.
     */
    describe(): string {
        return "Compiles TypeScript files using a given tsconfig.json configuration.";
    }
}
