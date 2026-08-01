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

import { jest } from "@jest/globals";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

// `kist` is mocked so the suite exercises this package's own code without
// loading the kist runtime, whose entry point starts the CLI on import. Under
// ESM the mock must be registered with `unstable_mockModule` and the subject
// imported afterwards with a dynamic import.
jest.unstable_mockModule("kist", () => {
    class MockAction {
        public logs: { level: string; message: string }[] = [];
        protected logInfo(message: string): void {
            this.logs.push({ level: "info", message });
        }
        protected logError(message: string): void {
            this.logs.push({ level: "error", message });
        }
        protected logWarn(message: string): void {
            this.logs.push({ level: "warn", message });
        }
        protected logDebug(message: string): void {
            this.logs.push({ level: "debug", message });
        }
    }

    return { Action: MockAction };
});

const { TypeScriptCompilerAction } = await import(
    "../../../src/actions/TypeScriptCompilerAction/TypeScriptCompilerAction.js"
);

type Logged = { level: string; message: string }[];

/** Reads the log buffer captured by the mocked base class. */
const logsOf = (action: unknown): Logged => (action as { logs: Logged }).logs;

/** Reads just the messages logged at a given level. */
const messagesAt = (action: unknown, level: string): string[] =>
    logsOf(action)
        .filter((entry) => entry.level === level)
        .map((entry) => entry.message);

// ============================================================================
// Tests
// ============================================================================

describe("TypeScriptCompilerAction", () => {
    let root: string;
    let action: InstanceType<typeof TypeScriptCompilerAction>;

    beforeEach(() => {
        root = mkdtempSync(join(tmpdir(), "kist-tsc-"));
        action = new TypeScriptCompilerAction();
    });

    afterEach(() => {
        rmSync(root, { recursive: true, force: true });
    });

    /** Writes a file (creating parents) and returns its absolute path. */
    function write(relative: string, contents: string): string {
        const filePath = join(root, relative);
        mkdirSync(join(filePath, ".."), { recursive: true });
        writeFileSync(filePath, contents, "utf-8");
        return filePath;
    }

    /** Writes a valid tsconfig.json and returns its path. */
    function writeTsconfig(overrides: Record<string, unknown> = {}): string {
        return write(
            "tsconfig.json",
            JSON.stringify({
                compilerOptions: {
                    target: "ES2022",
                    module: "ESNext",
                    moduleResolution: "bundler",
                    outDir: "./out",
                    ...(overrides.compilerOptions as object),
                },
                include: ["src/**/*.ts"],
                ...overrides,
            }),
        );
    }

    // ------------------------------------------------------------------------
    // describe()
    // ------------------------------------------------------------------------

    describe("describe", () => {
        it("should summarise the action", () => {
            expect(action.describe()).toBe(
                "Compiles TypeScript files using a given tsconfig.json configuration.",
            );
        });
    });

    // ------------------------------------------------------------------------
    // Successful compilation
    // ------------------------------------------------------------------------

    describe("execute", () => {
        it("should compile a well-formed project", async () => {
            const tsconfigPath = writeTsconfig();
            write("src/index.ts", "export const value: number = 1;\n");

            await action.execute({ tsconfigPath });

            const info = messagesAt(action, "info");
            expect(info[0]).toContain(
                "Compiling TypeScript using configuration:",
            );
            expect(info).toContain(
                "TypeScript compilation completed successfully.",
            );
        });

        it("should default the tsconfig path to tsconfig.json", async () => {
            writeTsconfig();
            write("src/index.ts", "export const value: number = 1;\n");

            const previous = process.cwd();
            process.chdir(root);
            try {
                await action.execute({});
            } finally {
                process.chdir(previous);
            }

            expect(messagesAt(action, "info")).toContain(
                "TypeScript compilation completed successfully.",
            );
        });

        it("should compile an explicit file list instead of the tsconfig files", async () => {
            const tsconfigPath = writeTsconfig();
            // This file would fail compilation if the tsconfig list were used.
            write("src/ignored.ts", "export const bad: number = 'nope';\n");
            const only = write(
                "src/only.ts",
                "export const only: string = 'x';\n",
            );

            await action.execute({ tsconfigPath, filePaths: [only] });

            expect(messagesAt(action, "info")).toContain(
                "TypeScript compilation completed successfully.",
            );
        });

        it("should honour an explicit output directory", async () => {
            const tsconfigPath = writeTsconfig();
            write("src/index.ts", "export const value: number = 1;\n");

            await action.execute({
                tsconfigPath,
                outputDir: join(root, "custom-out"),
            });

            expect(messagesAt(action, "info")).toContain(
                "TypeScript compilation completed successfully.",
            );
        });

        it("should merge custom compiler options over the tsconfig", async () => {
            const tsconfigPath = writeTsconfig();
            write("src/index.ts", "export const value: number = 1;\n");

            await action.execute({
                tsconfigPath,
                compilerOptions: { declaration: true },
            });

            expect(messagesAt(action, "info")).toContain(
                "TypeScript compilation completed successfully.",
            );
        });
    });

    // ------------------------------------------------------------------------
    // Failure paths
    // ------------------------------------------------------------------------

    describe("compilation failures", () => {
        it("should report type errors and log every diagnostic", async () => {
            const tsconfigPath = writeTsconfig();
            write("src/bad.ts", "export const value: number = 'text';\n");

            await expect(action.execute({ tsconfigPath })).rejects.toThrow(
                /TypeScript compilation failed:/,
            );

            const errors = messagesAt(action, "error");
            expect(
                errors.some((m) => m.startsWith("TypeScript Error:")),
            ).toBe(true);
            expect(errors).toContain("Error during TypeScript compilation:");
        });

        it("should report a missing tsconfig", async () => {
            await expect(
                action.execute({ tsconfigPath: join(root, "absent.json") }),
            ).rejects.toThrow(/Error reading tsconfig\.json/);
        });

        it("should report an unparseable tsconfig", async () => {
            const tsconfigPath = write(
                "tsconfig.json",
                JSON.stringify({
                    compilerOptions: { target: "NOT_A_TARGET" },
                }),
            );

            await expect(action.execute({ tsconfigPath })).rejects.toThrow(
                /Error parsing tsconfig\.json/,
            );
        });

        it("should report malformed JSON in the tsconfig", async () => {
            const tsconfigPath = write("tsconfig.json", "{ not json");

            await expect(action.execute({ tsconfigPath })).rejects.toThrow(
                /TypeScript compilation failed:/,
            );
        });

        it("should stringify a non-Error failure", async () => {
            const tsconfigPath = writeTsconfig();
            (
                action as unknown as { loadAndParseTsConfig: () => never }
            ).loadAndParseTsConfig = () => {
                throw "plain string failure";
            };

            await expect(action.execute({ tsconfigPath })).rejects.toThrow(
                "TypeScript compilation failed: plain string failure",
            );
        });
    });
});
