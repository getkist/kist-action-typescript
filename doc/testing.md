# Testing Guide

This document provides comprehensive guidance on running and maintaining tests for this action package.

## Test Types

### 1. Unit Tests
Unit tests validate individual functions and classes in isolation.

**Pattern:** `*.test.ts`  
**Run:** `npm run test:unit`

Unit tests cover:
- Input validation
- Happy path execution
- Error handling
- Edge cases
- Type safety

Example:
```bash
npm run test:unit
```

### 2. Integration Tests
Integration tests validate multiple components working together, including file I/O and context passing.

**Pattern:** `*.integration.test.ts`  
**Run:** `npm run test:integration`

Integration tests cover:
- Multi-component workflows
- File system interactions
- Context merging
- Error propagation
- Complex scenarios

Example:
```bash
npm run test:integration
```

### 3. End-to-End Tests
E2E tests validate complete workflows with real file operations and realistic scenarios.

**Pattern:** `*.e2e.test.ts`  
**Run:** `npm run test:e2e`

E2E tests cover:
- Full pipeline scenarios
- Real filesystem operations
- Complete action lifecycle
- Batch operations
- Performance under load

Example:
```bash
npm run test:e2e
```

### 4. Performance Benchmarks
Performance benchmarks measure execution time, memory usage, and throughput.

**Pattern:** `benchmark.ts`  
**Run:** `npm run benchmark`

Benchmarks measure:
- Execution time (avg, min, max)
- Operations per second
- Memory usage
- Scalability with increasing load

Example:
```bash
npm run benchmark
```

## Running Tests

### All Tests
```bash
npm test
```

This runs unit tests, integration tests, and E2E tests in sequence.

### Specific Test Categories
```bash
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e          # E2E tests only
npm run test:watch        # Watch mode for any changes
npm run test:coverage     # With coverage reporting
npm run benchmark         # Performance benchmarks
```

### Watch Mode
```bash
npm run test:watch
```

Automatically reruns tests when files change. Useful during development.

## Coverage Requirements

This package enforces strict coverage thresholds:

- **Global:** 70% branches, functions, lines, and statements
- **Action modules (`src/actions/`):** 80% branches, functions, lines, and statements

### Checking Coverage
```bash
npm run test:coverage
```

Generates:
- Console report (text summary)
- HTML report at `coverage/index.html`
- LCOV report for CI/CD integration
- JSON report for programmatic access

### Viewing HTML Coverage Report
```bash
# Generate coverage
npm run test:coverage

# Open in browser (macOS)
open coverage/index.html

# Or on Linux
xdg-open coverage/index.html

# Or on Windows
start coverage/index.html
```

### Coverage Enforcement in CI/CD
The test workflow enforces coverage thresholds. PRs will fail if:
- Global coverage drops below 70%
- Action module coverage drops below 80%

## Performance Benchmarks

### Running Benchmarks
```bash
npm run benchmark
```

### Benchmark Output
```
📈 Benchmark Results Summary

┌─────────────────────────────────────┬──────────┬──────────┬──────────┬──────────┬──────────────┐
│ Benchmark                           │ Avg (ms) │ Min (ms) │ Max (ms) │ Total    │ Items/sec    │
├─────────────────────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ Simple template (no context)        │    10.50 │     9.20 │    15.30 │     525ms │       95.24 │
│ Template with context               │    12.40 │    10.80 │    18.90 │     620ms │       80.65 │
└─────────────────────────────────────┴──────────┴──────────┴──────────┴──────────┴──────────────┘

📊 Overall Statistics:
   • Average render time: 11.45ms
   • Total benchmark time: 1145ms
   • Total iterations: 100
```

### Interpreting Results
- **Avg (ms):** Average time per operation
- **Min/Max:** Performance range
- **Items/sec:** Throughput (operations per second)
- Higher `Items/sec` = better performance

### Performance Tips

1. **Profile bottlenecks:**
   ```bash
   node --prof src/tests/benchmark.ts
   node --prof-process isolate-*.log | head -50
   ```

2. **Monitor memory:**
   ```bash
   npm run benchmark 2>&1 | grep -i memory
   ```

3. **Compare versions:**
   - Run benchmark before changes: `npm run benchmark > before.txt`
   - Run benchmark after changes: `npm run benchmark > after.txt`
   - Compare: `diff before.txt after.txt`

## CI/CD Integration

The GitHub Actions workflow runs:

1. **Unit tests** across all OS/Node versions
2. **Integration tests** across all OS/Node versions
3. **E2E tests** across all OS/Node versions
4. **Coverage enforcement** (70% global, 80% actions)
5. **Performance benchmarks** on Ubuntu with Node 20.x

### Workflow Phases

```
✓ Test Phase (Multi-OS)
  ├─ Unit Tests (all OS × all Node versions)
  ├─ Integration Tests (all OS × all Node versions)
  └─ E2E Tests (all OS × all Node versions)

✓ Coverage Phase (Ubuntu, Node 20.x)
  ├─ Generate coverage report
  ├─ Check thresholds
  └─ Upload to Codecov

✓ Performance Phase (Ubuntu, Node 20.x) [after tests pass]
  ├─ Run benchmarks
  └─ Store results for tracking
```

## Best Practices

### Writing Tests
1. **Use descriptive names:**
   ```typescript
   it("should render template with inheritance and context file", async () => {
     // ...
   });
   ```

2. **Test one thing per test:**
   ```typescript
   // ✅ Good
   it("validates required context field", () => { ... });
   it("renders with default context", () => { ... });

   // ❌ Avoid
   it("does validation and rendering", () => { ... });
   ```

3. **Clean up after tests:**
   ```typescript
   afterEach(async () => {
     await fs.rm(tmpDir, { recursive: true, force: true });
   });
   ```

4. **Use fixtures:**
   ```typescript
   beforeAll(async () => {
     // Create test files
   });

   afterAll(async () => {
     // Cleanup
   });
   ```

### Debugging Tests

1. **Run single test:**
   ```bash
   npm test -- --testNamePattern="should render"
   ```

2. **Run specific file:**
   ```bash
   npm test -- src/tests/TemplateRenderAction.test.ts
   ```

3. **Verbose output:**
   ```bash
   npm test -- --verbose
   ```

4. **Debug mode:**
   ```bash
   node --inspect-brk ./node_modules/.bin/jest --runInBand
   ```

### Improving Coverage
1. Check what's untested:
   ```bash
   npm run test:coverage
   open coverage/index.html
   ```

2. Add tests for uncovered lines/branches

3. Run coverage enforcement:
   ```bash
   npm run test:coverage:enforce
   ```

## Troubleshooting

### Tests Timeout
```bash
# Increase timeout (default 30s)
npm test -- --testTimeout 60000
```

### Coverage Not Generated
```bash
# Ensure coverage directory is writable
rm -rf coverage
npm run test:coverage
```

### Memory Issues
```bash
# Run tests sequentially (slower but uses less memory)
npm test -- --maxWorkers=1
```

### Flaky Tests
1. Avoid fixed timeouts; use `waitFor` or retries
2. Clean test fixtures properly
3. Run tests multiple times:
   ```bash
   for i in {1..5}; do npm test || exit 1; done
   ```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Node.js Performance](https://nodejs.org/en/docs/guides/nodejs-performance-monitoring/)
- [Coverage.py](https://coverage.readthedocs.io/)

## Questions or Issues?

See [SUPPORT.md](../SUPPORT.md) or open an [issue](https://github.com/getkist/action-jinja/issues).
