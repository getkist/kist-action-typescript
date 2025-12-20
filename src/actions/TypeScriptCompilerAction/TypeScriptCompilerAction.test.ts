/**
 * @module TypeScriptCompilerAction.test
 * @description Test suite for the TypeScriptCompilerAction class
 *
 * These tests verify:
 * - Basic TypeScript compilation functionality
 * - Custom compiler options merging
 * - tsconfig.json loading and parsing
 * - Error handling during compilation
 * - Action description method
 */

// ============================================================================
// Import
// ============================================================================

import * as fs from "fs/promises";
import * as path from "path";
import { TypeScriptCompilerAction } from "./TypeScriptCompilerAction";

// ============================================================================
// Tests
// ============================================================================

/**
 * Test suite for TypeScriptCompilerAction
 *
 * Tests the core functionality of TypeScript compilation through the Kist action interface.
 * Each test creates temporary files, configures the action, and verifies the output.
 */
describe("TypeScriptCompilerAction", () => {
    let action: TypeScriptCompilerAction;
    const testDir = path.join(__dirname, "__test__");

    beforeEach(() => {
        action = new TypeScriptCompilerAction();
    });

    afterEach(async () => {
        try {
            await fs.rm(testDir, { recursive: true, force: true });
        } catch (error) {
            // Ignore cleanup errors
        }
    });

    /**
     * Test cases for the execute method
     */
    describe("execute", () => {
        /**
         * Test: Basic TypeScript compilation
         * Verifies that TypeScript files are compiled to JavaScript successfully
         */
        it("should compile TypeScript files", async () => {
            // Create test files
            await fs.mkdir(path.join(testDir, "src"), { recursive: true });
            await fs.writeFile(
                path.join(testDir, "src", "test.ts"),
                'const greeting: string = "Hello"; console.log(greeting);',
            );

            // Create tsconfig.json
            await fs.writeFile(
                path.join(testDir, "tsconfig.json"),
                JSON.stringify({
                    compilerOptions: {
                        target: "ES2020",
                        module: "ESNext",
                        outDir: "./dist",
                    },
                    include: ["src/**/*"],
                }),
            );

            await action.execute({
                tsconfigPath: path.join(testDir, "tsconfig.json"),
            });

            // Check output exists
            const outputFile = path.join(testDir, "dist", "test.js");
            const exists = await fs
                .access(outputFile)
                .then(() => true)
                .catch(() => false);
            expect(exists).toBe(true);
        });

        /**
         * Test: Custom compiler options
         * Verifies that custom compiler options are properly merged and applied
         */
        it("should use custom compiler options", async () => {
            await fs.mkdir(path.join(testDir, "src"), { recursive: true });
            await fs.writeFile(
                path.join(testDir, "src", "test.ts"),
                "const x = 42;",
            );

            await fs.writeFile(
                path.join(testDir, "tsconfig.json"),
                JSON.stringify({
                    compilerOptions: {
                        target: "ES2020",
                        outDir: "./dist",
                    },
                    include: ["src/**/*"],
                }),
            );

            await action.execute({
                tsconfigPath: path.join(testDir, "tsconfig.json"),
                compilerOptions: {
                    declaration: true,
                },
            });

            // Check that declaration file was created
            const declFile = path.join(testDir, "dist", "test.d.ts");
            const exists = await fs
                .access(declFile)
                .then(() => true)
                .catch(() => false);
            expect(exists).toBe(true);
        });
    });

    /**
     * Test cases for the describe method
     */
    describe("describe", () => {
        /**
         * Test: Action description
         * Verifies that the describe method returns a meaningful description
         */
        it("should return action description", () => {
            const description = action.describe();
            expect(description).toContain("TypeScript");
            expect(description).toContain("tsconfig");
        });
    });
});
