# Examples

## Compile via tsconfig

```
pipeline:
  stages:
    - name: build
      steps:
        - name: compile-ts
          action: TypeScriptCompilerAction
          options:
            tsconfigPath: ./tsconfig.json
```

## Compile specific files

````
pipeline:
  stages:
    - name: build
      steps:
        - name: compile-selected
          action: TypeScriptCompilerAction
          options:
            tsconfigPath: ./tsconfig.json
            filePaths:
              - src/a.ts
              - src/b.ts
```}
````
