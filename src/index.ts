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

const plugin: ActionPlugin = {
    version: "1.0.0",
    description: "TypeScript compilation actions for kist",
    author: "kist",
    repository: "https://github.com/getkist/action-typescript",
    keywords: ["kist", "kist-action", "typescript", "compiler", "tsc"],
    actions: {
        TypeScriptCompilerAction,
    },
};

export default plugin;
