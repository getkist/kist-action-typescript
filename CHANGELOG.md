# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.33] - 2026-08-02

### Changed

- Updated dependencies and Node engine requirement (>=22.0.0)
- Documentation and metadata sync (README, CHANGELOG, CITATION.cff, codemeta.json)

### Fixed

- `devDependencies.kist` was `"file:../kist"`, a path that only resolves on a machine with a sibling `kist` checkout; it doesn't exist in CI, so the type declaration build failed with "Cannot find module 'kist'". Pointed it at the published registry range instead, matching every sibling `kist-action-*` package.
- A test hardcoded `plugin.version` as `"1.0.0"`, which broke as soon as the version was bumped; now reads it from `package.json`.
