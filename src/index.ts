/**
 * @module @kist/action-typescript
 * @description TypeScript compilation plugin for the Kist build tool
 *
 * This module provides TypeScript compilation capabilities as a Kist action plugin.
 * It handles tsconfig.json parsing and TypeScript compilation with support for
 * custom compiler options and output directory configuration.
 */

// ============================================================================
// Export
// ============================================================================

export { TypeScriptCompilerAction } from "./actions/TypeScriptCompilerAction/index.js";
export type { TypeScriptCompilerActionOptions } from "./actions/TypeScriptCompilerAction/index.js";

// ============================================================================
// Plugin Definition
// ============================================================================

import { ActionPlugin } from "kist";
import { TypeScriptCompilerAction } from "./actions/TypeScriptCompilerAction/index.js";

/**
 * Kist plugin for TypeScript compilation.
 *
 * This plugin provides the TypeScriptCompilerAction which compiles TypeScript files
 * using the TypeScript compiler with support for tsconfig.json configurations.
 *
 * @type {ActionPlugin}
 */
const plugin: ActionPlugin = {
    version: "1.0.0",
    description: "TypeScript compilation actions for kist",
    author: "kist",
    repository: "https://github.com/getkist/action-typescript",
    keywords: ["kist", "kist-action", "typescript", "compiler", "tsc"],
    registerActions: () => ({
        TypeScriptCompilerAction,
    }),
};

export default plugin;
