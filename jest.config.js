export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  testMatch: [
    "**/__tests__/**/*.ts",
    "**/?(*.)+(spec|test|integration|e2e).ts",
  ],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/**/*.integration.ts",
    "!src/**/*.e2e.ts",
    "!src/**/*.benchmark.ts",
    "!src/**/*.d.ts",
    "!src/tests/**/*",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "json", "html", "text-summary"],
  // Enforce coverage thresholds - CI/CD will fail if not met
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    "./src/actions/": {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 30000,
  verbose: true,
  bail: false,
  maxWorkers: "50%",
};
