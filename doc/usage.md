# Usage

## Kist YAML

```
pipeline:
  stages:
    - name: build
      steps:
        - name: ts-compile
          action: TypeScriptCompilerAction
          options:
            tsconfigPath: ./tsconfig.json
            outputDir: ./dist
```

## Programmatic

```
import { TypeScriptCompilerAction } from "@kist/action-typescript";

await new TypeScriptCompilerAction().execute({
  tsconfigPath: "./tsconfig.json",
  outputDir: "./dist",
});
```
