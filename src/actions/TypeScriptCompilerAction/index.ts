/**
 * @module TypeScriptCompilerAction
 * @description Exports the TypeScript compiler action and its configuration types
 */

// ============================================================================
// Export
// ============================================================================

/**
 * Barrel export for the TypeScriptCompilerAction module. Re-exports
 * {@link TypeScriptCompilerAction} and its {@link TypeScriptCompilerActionOptions}
 * options type so consumers (including the package's top-level `src/index.ts`)
 * can import from `actions/TypeScriptCompilerAction` without reaching into
 * `TypeScriptCompilerAction.ts` directly.
 */
export { TypeScriptCompilerAction } from "./TypeScriptCompilerAction.js";
export type { TypeScriptCompilerActionOptions } from "./TypeScriptCompilerAction.js";
