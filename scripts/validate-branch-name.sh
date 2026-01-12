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
    echo "❌ Invalid branch name: '$local_branch'"
    echo ""
    echo "Branch names must follow the convention: type/description"
    echo ""
    echo "Valid types:"
    echo "  - feat:     New feature"
    echo "  - fix:      Bug fix"
    echo "  - docs:     Documentation changes"
    echo "  - style:    Code style changes"
    echo "  - refactor: Code refactoring"
    echo "  - perf:     Performance improvements"
    echo "  - test:     Testing changes"
    echo "  - build:    Build system changes"
    echo "  - ci:       CI/CD changes"
    echo "  - chore:    Maintenance tasks"
    echo ""
    echo "Examples:"
    echo "  ✅ feat/add-user-authentication"
    echo "  ✅ fix/login-button-crash"
    echo "  ✅ chore/update-dependencies"
    echo ""
    exit 1
fi

exit 0
