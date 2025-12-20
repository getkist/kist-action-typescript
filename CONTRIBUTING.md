# Contributing to @kist/action-typescript

Thank you for your interest in contributing!

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Make your changes
4. Run tests: `npm test`
5. Build: `npm run build`
6. Lint: `npm run lint`

## Pull Request Process

1. Update tests for any new functionality
2. Ensure all tests pass: `npm test`
3. Maintain or improve code coverage
4. Update documentation as needed
5. Follow the existing code style
6. Write clear commit messages

## Code Style

- Use TypeScript
- Follow ESLint rules: `npm run lint`
- Format with Prettier: `npm run format`
- Write tests for new features
- Aim for >70% code coverage

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Commit Messages

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test changes
- `chore:` Build/config changes
- `refactor:` Code refactoring

## Adding New Actions

When adding new TypeScript-related actions:

1. Create action in `src/actions/`
2. Add comprehensive tests
3. Export from `src/index.ts`
4. Update README with usage examples
5. Add to plugin registration

## Questions?

Open an issue or discussion on GitHub.
