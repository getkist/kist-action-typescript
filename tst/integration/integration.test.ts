import fs from "fs/promises";
import os from "os";
import path from "path";

import { TypeScriptCompilerAction } from "../../src/actions/TypeScriptCompilerAction/TypeScriptCompilerAction.js";

/**
 * Drives a real `tsc` invocation over real files, so the assertions are about
 * emitted JavaScript rather than about the arguments handed to a mock.
 */
describe("TypeScriptCompilerAction integration", () => {
    const tmpDir = path.join(os.tmpdir(), `tsc-integration-${Date.now()}`);
    const srcDir = path.join(tmpDir, "src");
    const outDir = path.join(tmpDir, "out");

    beforeEach(async () => {
        await fs.rm(tmpDir, { recursive: true, force: true });
        await fs.mkdir(srcDir, { recursive: true });
    });

    afterAll(async () => {
        await fs.rm(tmpDir, { recursive: true, force: true });
    });

    async function writeTsconfig(compilerOptions: Record<string, unknown> = {}) {
        const tsconfigPath = path.join(tmpDir, "tsconfig.json");
        await fs.writeFile(
            tsconfigPath,
            JSON.stringify({
                compilerOptions: {
                    target: "ES2022",
                    module: "ESNext",
                    moduleResolution: "bundler",
                    outDir,
                    strict: true,
                    ...compilerOptions,
                },
                include: [path.join(srcDir, "**/*.ts")],
            }),
            "utf8",
        );
        return tsconfigPath;
    }

    it("emits JavaScript for a valid source file", async () => {
        await fs.writeFile(
            path.join(srcDir, "greet.ts"),
            "export function greet(name: string): string {\n    return `hi ${name}`;\n}\n",
            "utf8",
        );
        const tsconfigPath = await writeTsconfig();

        await new TypeScriptCompilerAction().execute({ tsconfigPath });

        const emitted = await fs.readFile(path.join(outDir, "greet.js"), "utf8");
        expect(emitted).toContain("function greet");
        // Types are erased on the way out.
        expect(emitted).not.toContain(": string");
    });

    it("emits declarations when the tsconfig asks for them", async () => {
        await fs.writeFile(
            path.join(srcDir, "value.ts"),
            "export const answer: number = 42;\n",
            "utf8",
        );
        const tsconfigPath = await writeTsconfig({ declaration: true });

        await new TypeScriptCompilerAction().execute({ tsconfigPath });

        const dts = await fs.readFile(path.join(outDir, "value.d.ts"), "utf8");
        expect(dts).toContain("answer");
    });

    it("rejects on a type error rather than emitting silently", async () => {
        await fs.writeFile(
            path.join(srcDir, "broken.ts"),
            "export const answer: number = 'not a number';\n",
            "utf8",
        );
        const tsconfigPath = await writeTsconfig();

        await expect(
            new TypeScriptCompilerAction().execute({ tsconfigPath }),
        ).rejects.toThrow();
    });

    it("rejects when the tsconfig does not exist", async () => {
        await expect(
            new TypeScriptCompilerAction().execute({
                tsconfigPath: path.join(tmpDir, "no-such-tsconfig.json"),
            }),
        ).rejects.toThrow();
    });
});
