# Contributing to CIOOS Catalogue Map Base

Thank you for contributing to the CIOOS Catalogue Map Base project! This document provides guidelines for commit messages, branch naming, and the release process.

## Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. This enables automated semantic versioning and changelog generation.

### Commit Message Format

Each commit message consists of a **header**, a **body** (optional), and a **footer** (optional):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

Must be one of the following:

- **feat**: A new feature (triggers MINOR version bump)
- **fix**: A bug fix (triggers PATCH version bump)
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (formatting, etc.)
- **refactor**: A code change that neither fixes a bug nor adds a feature (triggers PATCH version bump)
- **perf**: A code change that improves performance (triggers PATCH version bump)
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit (triggers PATCH version bump)

### Scope

The scope is optional and can be used to specify the area of the codebase affected:

```
feat(auth): add login functionality
fix(map): resolve marker clustering issue
```

### Breaking Changes

To trigger a MAJOR version bump, add `BREAKING CHANGE:` in the footer or append `!` after the type:

```
feat!: redesign authentication flow

BREAKING CHANGE: authentication API has changed
```

### Examples

```
feat: add user authentication
fix: resolve login button crash
docs: update API documentation
refactor: simplify data processing logic
feat!: migrate to new database schema
feat(map): add custom marker icons
fix(filter): correct date range calculation
```

## Branch Naming Convention

Branch names must follow the pattern: `type/description`

### Valid Branch Types

- `feat/` - New feature branches
- `fix/` - Bug fix branches
- `docs/` - Documentation branches
- `style/` - Code style changes
- `refactor/` - Code refactoring
- `perf/` - Performance improvements
- `test/` - Testing branches
- `build/` - Build system changes
- `ci/` - CI/CD changes
- `chore/` - Maintenance branches

### Branch Naming Rules

- Use lowercase letters
- Separate words with hyphens (`-`)
- Keep names concise but descriptive
- Avoid special characters except hyphens and slashes

### Examples

```
feat/add-user-dashboard
fix/login-button-crash
chore/update-dependencies
refactor/simplify-api
feat/map-layer-controls
fix/mobile-responsive-layout
```

### Protected Branches

The following branches are protected and exempt from naming validation:

- `main`
- `master`
- `develop`
- `development`
- `staging`
- `production`

## Semantic Versioning

This project uses [semantic-release](https://semantic-release.gitbook.io/) for automated version management and package publishing.

### Version Determination

Versions are automatically determined based on commit messages:

- **MAJOR** (X.0.0): Breaking changes (commits with `BREAKING CHANGE:` or `!`)
- **MINOR** (0.X.0): New features (`feat:` commits)
- **PATCH** (0.0.X): Bug fixes and improvements (`fix:`, `perf:`, `refactor:` commits)

### Release Process

Releases are automatically created when:

1. Commits are pushed to `main` branch (production releases)
2. Commits are pushed to `development` branch (beta pre-releases)

The CI/CD pipeline will:

1. Analyze commits since the last release
2. Determine the next version number
3. Generate a changelog
4. Create a GitHub release
5. Update `package.json` version

## Git Hooks

The following checks are enforced via git hooks:

- **pre-commit**: Runs `lint-staged` (Prettier formatting and ESLint)
- **commit-msg**: Validates commit message format using commitlint
- **pre-push**: Validates branch naming convention

### What Happens When Validation Fails?

#### Invalid Commit Message

If your commit message doesn't follow the convention, you'll see a clear error message:

```
────────────────────────────────────────────────────────────────────────────
❌ COMMIT REJECTED - Message does not follow Conventional Commits format
────────────────────────────────────────────────────────────────────────────

Your commit message must follow this format:
  <type>(<scope>): <subject>

Valid types:
  feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

Examples:
  ✅ feat: add user authentication
  ✅ fix: resolve login button crash
  ✅ feat(map): add custom marker icons
  ✅ chore: update dependencies

For breaking changes, use ! or add BREAKING CHANGE in footer:
  ✅ feat!: redesign authentication flow

📖 See CONTRIBUTING.md for detailed guidelines
────────────────────────────────────────────────────────────────────────────
```

#### Invalid Branch Name

If your branch name doesn't follow the convention, you'll see this error when pushing:

```
────────────────────────────────────────────────────────────────────────────
❌ PUSH REJECTED - Invalid branch name: 'your-branch-name'
────────────────────────────────────────────────────────────────────────────

Branch names must follow the pattern: <type>/<description>

Valid types:
  feat, fix, docs, style, refactor, perf, test, build, ci, chore

To fix this, rename your branch:
  git branch -m your-branch-name <type>/<description>
────────────────────────────────────────────────────────────────────────────
```

### Testing Hooks Locally

To test if your commit message is valid:

```bash
echo "feat: add new feature" | npx commitlint
```

To test if your branch name is valid:

```bash
./scripts/validate-branch-name.sh
```

## Pull Request Guidelines

1. Create a branch following the naming convention
2. Make commits following the commit convention
3. Ensure all tests pass and code is properly formatted
4. Create a pull request with a clear description
5. Link any related issues
6. Request review from maintainers

## Questions?

If you have questions about these conventions, please open an issue or reach out to the maintainers.
