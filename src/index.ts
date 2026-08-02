/**
 * @module @getkist/action-typescript
 * @description TypeScript compilation plugin for the Kist build tool
 *
 * This module provides TypeScript compilation capabilities as a Kist action plugin.
 * It handles tsconfig.json parsing and TypeScript compilation with support for
 * custom compiler options and output directory configuration.
 */

// ============================================================================
// Export
// ============================================================================

/**
 * Package entry point re-exports for `@getkist/action-typescript`. Exposes
 * the {@link TypeScriptCompilerAction} action and its
 * {@link TypeScriptCompilerActionOptions} options type so consumers can
 * `import { TypeScriptCompilerAction } from "@getkist/action-typescript"`
 * directly, in addition to the default-exported {@link ActionPlugin}
 * manifest below that kist uses to discover this package's actions.
 */
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
 * This is the kist plugin manifest for this package: kist loads this object
 * as the package's default export and calls {@link ActionPlugin.registerActions}
 * to obtain the `"TypeScriptCompilerAction"` constructor, which it then
 * instantiates per pipeline step that references it in kist.yaml. Keep
 * `version` here in lockstep with the `version` field in `package.json`.
 *
 * @type {ActionPlugin}
 */
const plugin: ActionPlugin = {
    /** Plugin version, surfaced to kist/consumers; keep in sync with `package.json`'s `version` field. */
    version: "0.0.33",
    /** Short, human-readable summary of what this plugin provides, shown in kist's plugin listings. */
    description: "TypeScript compilation actions for kist",
    /** Package author/maintainer, shown alongside the plugin in kist's plugin listings. */
    author: "kist",
    /** Canonical source repository URL for this plugin, used for documentation/attribution. */
    repository: "https://github.com/getkist/kist-action-typescript",
    /** Discovery/search keywords used by kist's plugin registry and package listings. */
    keywords: ["kist", "kist-action", "typescript", "compiler", "tsc"],
    /** Returns the map of action name -> action constructor that kist registers; the key is the string used to reference this action from a kist.yaml pipeline step's `action` field. */
    registerActions: () => ({
        TypeScriptCompilerAction,
    }),
};

export default plugin;
