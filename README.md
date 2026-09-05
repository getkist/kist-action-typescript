# @getkist/action-typescript

<div align="center">

[![npm version](https://img.shields.io/npm/v/@getkist/action-typescript?style=flat-square&logo=npm&logoColor=FFFFFF&labelColor=5e4d34&color=5e4d34)](https://www.npmjs.com/package/@getkist/action-typescript)
[![CI](https://img.shields.io/github/actions/workflow/status/getkist/kist-action-typescript/ci.yml?style=flat-square&logo=githubactions&logoColor=FFFFFF&label=CI&labelColor=5e4d34&color=5e4d34)](https://github.com/getkist/kist-action-typescript/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/codecov/c/github/getkist/kist-action-typescript?style=flat-square&logo=codecov&logoColor=FFFFFF&label=Coverage&labelColor=5e4d34&color=5e4d34)](https://codecov.io/gh/getkist/kist-action-typescript)
[![License: MIT](https://img.shields.io/badge/License-MIT-5e4d34?style=flat-square)](https://opensource.org/licenses/MIT)
[![kist plugin](https://img.shields.io/badge/kist-plugin-5e4d34?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDIgN3Y2YzAgNS41NSAzLjg0IDEwLjc0IDEwIDEyIDYuMTYtMS4yNiAxMC02LjQ1IDEwLTEyVjdMMTIgMnoiLz48L3N2Zz4=)](https://github.com/getkist/kist)

</div>

TypeScript compilation actions for [kist](https://github.com/getkist/kist) build tool.

## Features

- **TypeScript Compilation** - Full TypeScript compiler integration
- **Custom tsconfig** - Use any tsconfig.json configuration
- **Flexible File Selection** - Compile specific files or entire projects
- **Compiler Options Override** - Runtime compiler option customization
- **Error Reporting** - Detailed compilation diagnostics

## Installation

```bash
npm install --save-dev @getkist/action-typescript
```

## Usage

### Basic Compilation

Add to your `kist.yml`:

```yaml
pipeline:
    stages:
        - name: compile
          steps:
              - name: compile-typescript
                action: TypeScriptCompilerAction
                options:
                    tsconfigPath: ./tsconfig.json
```

### Compile Specific Files

```yaml
pipeline:
    stages:
        - name: compile
          steps:
              - name: compile-sources
                action: TypeScriptCompilerAction
                options:
                    tsconfigPath: ./tsconfig.json
                    filePaths:
                        - src/index.ts
                        - src/utils.ts
                    outputDir: ./dist
```

### Custom Compiler Options

```yaml
pipeline:
    stages:
        - name: compile
          steps:
              - name: compile-custom
                action: TypeScriptCompilerAction
                options:
                    tsconfigPath: ./tsconfig.json
                    outputDir: ./build
                    compilerOptions:
                        target: ES2020
                        module: CommonJS
                        sourceMap: true
```

## Action: TypeScriptCompilerAction

Compiles TypeScript files using the TypeScript compiler.

### Options

| Option            | Type     | Required | Description                                          |
| ----------------- | -------- | -------- | ---------------------------------------------------- |
| `tsconfigPath`    | string   | No       | Path to tsconfig.json (default: "tsconfig.json")     |
| `filePaths`       | string[] | No       | Specific files to compile (overrides tsconfig files) |
| `outputDir`       | string   | No       | Output directory (overrides tsconfig outDir)         |
| `compilerOptions` | object   | No       | Custom compiler options to merge with tsconfig       |

### Compiler Options

Any valid TypeScript compiler option can be passed:

```yaml
compilerOptions:
    target: ES2020
    module: ESNext
    declaration: true
    sourceMap: true
    strict: true
    esModuleInterop: true
```

## Examples

### Multi-Target Compilation

```yaml
pipeline:
    stages:
        - name: compile-all
          steps:
              - name: compile-esm
                action: TypeScriptCompilerAction
                options:
                    tsconfigPath: ./tsconfig.json
                    outputDir: ./dist/esm
                    compilerOptions:
                        module: ESNext

              - name: compile-cjs
                action: TypeScriptCompilerAction
                options:
                    tsconfigPath: ./tsconfig.json
                    outputDir: ./dist/cjs
                    compilerOptions:
                        module: CommonJS
```

### Development vs Production

```yaml
pipeline:
    stages:
        - name: dev-build
          steps:
              - name: compile-dev
                action: TypeScriptCompilerAction
                options:
                    tsconfigPath: ./tsconfig.json
                    compilerOptions:
                        sourceMap: true
                        declaration: false

        - name: prod-build
          steps:
              - name: compile-prod
                action: TypeScriptCompilerAction
                options:
                    tsconfigPath: ./tsconfig.json
                    compilerOptions:
                        sourceMap: false
                        declaration: true
                        removeComments: true
```

## TypeScript Types

```typescript
import { TypeScriptCompilerAction } from "@getkist/action-typescript";

const action = new TypeScriptCompilerAction();
```

### TypeScriptCompilerActionOptions

```typescript
interface TypeScriptCompilerActionOptions {
    tsconfigPath?: string;
    filePaths?: string[];
    outputDir?: string;
    compilerOptions?: ts.CompilerOptions;
}
```

## Error Handling

The action provides detailed error messages for:

- Invalid tsconfig.json files
- Compilation errors with file locations
- Pre-emit diagnostics
- Configuration parsing errors

## Requirements

- Node.js >= 22.0.0
- kist >= 0.1.58
- TypeScript >= 6.0.0

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

MIT © kist

## Links

- [GitHub Repository](https://github.com/getkist/kist-action-typescript)
- [npm Package](https://www.npmjs.com/package/@getkist/action-typescript)
- [kist Build Tool](https://github.com/getkist/kist)
- [Issue Tracker](https://github.com/getkist/kist-action-typescript/issues)
