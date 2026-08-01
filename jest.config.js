// ============================================================================
// Jest Configuration
// ============================================================================

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const rootDir = dirname(fileURLToPath(import.meta.url));

// The `kist` dependency is consumed in two different layouts: the published
// tarball puts its JavaScript in `js/`, while a `file:` link to the repo puts
// it in `dist/js/`. Derive the directory from the package's own entry point so
// the mapping holds either way.
const kistRoot = join(rootDir, "node_modules", "kist");
const kistPkg = JSON.parse(
    readFileSync(join(kistRoot, "package.json"), "utf-8"),
);
const kistJsDir = join(kistRoot, dirname(kistPkg.main));

export default {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    extensionsToTreatAsEsm: [".ts"],
    // `src` must be listed alongside `tst` so that `collectCoverageFrom` can
    // discover source files no test imports; with only `tst`, Jest's crawler
    // never sees them and coverage is reported as if they did not exist.
    roots: ["<rootDir>/tst", "<rootDir>/src"],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
        "^kist$": kistJsDir,
        "^kist/(.*)$": join(kistJsDir, "$1"),
    },
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                useESM: true,
            },
        ],
    },
    testMatch: ["**/?(*.)+(spec|test|integration|e2e).ts"],
    collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov", "json", "html", "text-summary"],
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
    testTimeout: 30000,
    verbose: true,
    bail: false,
    maxWorkers: "50%",
};
