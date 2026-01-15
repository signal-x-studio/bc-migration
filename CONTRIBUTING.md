# Contributing to BC-Migration

Thank you for your interest in contributing to BC-Migration!

## Code of Conduct

- Be respectful and constructive
- Focus on the code, not the person
- Assume good intent
- Help others learn

---

## Getting Started

1. **Read the docs:**
   - [CLAUDE.md](CLAUDE.md) - Quick reference
   - [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) - Setup and workflow
   - [docs/PATTERNS.md](docs/PATTERNS.md) - Code patterns

2. **Set up your environment:**
   ```bash
   git clone <repo-url>
   cd bc-migration
   npm install
   npm test  # Verify setup
   ```

3. **Find something to work on:**
   - Check [docs/PROGRESS.md](docs/PROGRESS.md) for open tasks
   - Look for issues labeled `good first issue`
   - Ask in discussions if unsure

---

## Pull Request Process

### Before Starting

- Check if the feature/fix is already in progress
- For large changes, open an issue to discuss first
- Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) to understand the system

### Development

1. **Branch from main:**
   ```bash
   git checkout main && git pull
   git checkout -b type/description
   ```

   Branch types: `feat/`, `fix/`, `docs/`, `refactor/`, `test/`

2. **Follow patterns:**
   - See [docs/PATTERNS.md](docs/PATTERNS.md) for code patterns
   - Use TypeScript strictly (no `any`)
   - Add tests for new code

3. **Verify before pushing:**
   ```bash
   npm test           # All tests pass
   npx tsc --noEmit   # No type errors
   ```

### Submitting

1. **Push your branch:**
   ```bash
   git push -u origin type/description
   ```

2. **Create PR via GitHub:**
   - Use the PR template
   - Fill out all sections
   - Run anti-pattern checks

3. **Address feedback:**
   - Respond to all comments
   - Make requested changes
   - Re-request review when ready

---

## Commit Messages

Format:
```
type: short description

- Detail 1
- Detail 2

Fixes #123
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `refactor` - Code restructure (no behavior change)
- `test` - Add/update tests
- `chore` - Tooling, config, dependencies

Examples:
```
feat: add customer migration with email deduplication

- Implements CustomerMigrator class
- Checks for existing customers by email
- Handles batch operations with partial failure

Fixes #45
```

```
fix: handle 429 rate limit responses correctly

- Extract Retry-After header
- Use dynamic backoff delay
- Add test coverage
```

---

## Code Standards

### Must Follow

- **TypeScript strict mode** - No `any` types without justification
- **ESM imports** - Use `.js` extension for local files
- **Structured logging** - Use Pino, not console.log
- **Error handling** - Use custom error classes with context
- **Rate limiting** - Use BCClient, not direct axios

### Testing Requirements

- Unit tests for new functions/classes
- Use mocks for external dependencies
- Test both success and error paths
- Add fixtures for complex test data

### Documentation

- Update relevant docs if behavior changes
- Add JSDoc for public functions
- Keep PROGRESS.md current

---

## Review Process

See [docs/CODE_REVIEW.md](docs/CODE_REVIEW.md) for full guidelines.

### Quick Checklist

- [ ] Tests pass
- [ ] Types compile
- [ ] Follows patterns
- [ ] No anti-patterns
- [ ] Documentation updated
- [ ] PR template filled out

### Approval Criteria

| Change Type | Approvals Required |
|-------------|-------------------|
| Documentation | 1 |
| Bug fix | 1 |
| New feature | 1 |
| Architecture change | 2 |

---

## Questions?

- Check existing documentation first
- Open a discussion for general questions
- Open an issue for bugs/features
- Tag maintainers in PR if blocked

Thank you for contributing!
