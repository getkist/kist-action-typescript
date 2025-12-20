// ============================================================================
// Import
// ============================================================================

import * as fs from "fs/promises";
import * as path from "path";
import { TypeScriptCompilerAction } from "./TypeScriptCompilerAction";

// ============================================================================
// Tests
// ============================================================================

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

    describe("execute", () => {
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

    describe("describe", () => {
        it("should return action description", () => {
            const description = action.describe();
            expect(description).toContain("TypeScript");
            expect(description).toContain("tsconfig");
        });
    });
});
