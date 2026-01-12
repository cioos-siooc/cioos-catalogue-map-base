#!/bin/bash

# Branch naming convention validation script
# Enforces: type/description format
# Valid types: feat, fix, docs, style, refactor, perf, test, build, ci, chore

local_branch="$(git rev-parse --abbrev-ref HEAD)"

# Define valid branch name pattern
# Format: type/description or type/scope/description
# Examples: feat/add-login, fix/auth/token-refresh, chore/update-deps
valid_branch_regex="^(feat|fix|docs|style|refactor|perf|test|build|ci|chore)\/[a-z0-9._-]+$"

# Branches that should be excluded from validation
protected_branches="^(main|master|develop|development|staging|production)$"

# Check if current branch is protected
if [[ "$local_branch" =~ $protected_branches ]]; then
    exit 0
fi

# Validate branch name
if [[ ! $local_branch =~ $valid_branch_regex ]]; then
    echo ""
    echo "────────────────────────────────────────────────────────────────────────────"
    echo "❌ PUSH REJECTED - Invalid branch name: '$local_branch'"
    echo "────────────────────────────────────────────────────────────────────────────"
    echo ""
    echo "Branch names must follow the pattern: <type>/<description>"
    echo ""
    echo "Valid types:"
    echo "  feat      - New feature"
    echo "  fix       - Bug fix"
    echo "  docs      - Documentation changes"
    echo "  style     - Code style changes"
    echo "  refactor  - Code refactoring"
    echo "  perf      - Performance improvements"
    echo "  test      - Testing changes"
    echo "  build     - Build system changes"
    echo "  ci        - CI/CD changes"
    echo "  chore     - Maintenance tasks"
    echo ""
    echo "Naming rules:"
    echo "  • Use lowercase letters only"
    echo "  • Separate words with hyphens (-)"
    echo "  • Use descriptive names"
    echo "  • Avoid special characters (except - / .)"
    echo ""
    echo "Valid examples:"
    echo "  ✅ feat/add-user-authentication"
    echo "  ✅ fix/login-button-crash"
    echo "  ✅ chore/update-dependencies"
    echo "  ✅ refactor/simplify-api"
    echo ""
    echo "Invalid examples:"
    echo "  ❌ Add-user-authentication (missing type prefix)"
    echo "  ❌ feature/add-user (wrong type - use 'feat' not 'feature')"
    echo "  ❌ feat/Add-User (contains uppercase letters)"
    echo "  ❌ feat (missing description)"
    echo ""
    echo "To fix this, rename your branch:"
    echo "  git branch -m $local_branch <type>/<description>"
    echo ""
    echo "📖 See CONTRIBUTING.md for detailed guidelines"
    echo "────────────────────────────────────────────────────────────────────────────"
    echo ""
    exit 1
fi

exit 0
