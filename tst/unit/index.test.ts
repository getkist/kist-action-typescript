/**
 * @module index.test
 * @description Tests for the package's public surface and plugin definition.
 */

// ============================================================================
// Import
// ============================================================================

import { jest } from "@jest/globals";
import pkg from "../../package.json" with { type: "json" };

// The plugin module pulls `Action` in through the action it registers, so the
// same `kist` stub used by the action suite is required here too.
jest.unstable_mockModule("kist", () => {
    class MockAction {
        protected logInfo(): void {}
        protected logError(): void {}
    }
    return { Action: MockAction };
});

const plugin = (await import("../../src/index.js")).default;
const { TypeScriptCompilerAction } = await import("../../src/index.js");
const actionBarrel = await import(
    "../../src/actions/TypeScriptCompilerAction/index.js"
);

// ============================================================================
// Tests
// ============================================================================

describe("package entry point", () => {
    it("should re-export the action class", () => {
        expect(TypeScriptCompilerAction).toBeDefined();
        expect(typeof TypeScriptCompilerAction).toBe("function");
    });

    it("should re-export the action from its own barrel", () => {
        expect(actionBarrel.TypeScriptCompilerAction).toBe(
            TypeScriptCompilerAction,
        );
    });
});

describe("plugin definition", () => {
    it("should declare its metadata", () => {
        expect(plugin.version).toBe(pkg.version);
        expect(plugin.description).toBe(
            "TypeScript compilation actions for kist",
        );
        expect(plugin.author).toBe("kist");
        expect(plugin.repository).toBe(
            "https://github.com/getkist/kist-action-typescript",
        );
        expect(plugin.keywords).toEqual([
            "kist",
            "kist-action",
            "typescript",
            "compiler",
            "tsc",
        ]);
    });

    it("should register the TypeScript compiler action", () => {
        const actions = plugin.registerActions();
        expect(Object.keys(actions)).toEqual(["TypeScriptCompilerAction"]);
        expect(actions.TypeScriptCompilerAction).toBe(TypeScriptCompilerAction);
    });

    it("should construct the action it registers", () => {
        const Registered = plugin.registerActions().TypeScriptCompilerAction;
        expect(new Registered().describe()).toBe(
            "Compiles TypeScript files using a given tsconfig.json configuration.",
        );
    });
});
