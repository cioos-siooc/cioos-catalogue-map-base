#!/bin/bash

# Test script to demonstrate convention validation
# This script shows what happens when conventions are violated

echo "════════════════════════════════════════════════════════════════════════════"
echo "Testing Commit Message Validation"
echo "════════════════════════════════════════════════════════════════════════════"
echo ""

echo "Testing INVALID commit messages..."
echo ""

echo "Test 1: Bad commit (no type)"
echo "bad commit" | npx commitlint
echo ""

echo "Test 2: Invalid type"
echo "feature: add login" | npx commitlint
echo ""

echo "Test 3: Uppercase type"
echo "Feat: add login" | npx commitlint
echo ""

echo "────────────────────────────────────────────────────────────────────────────"
echo ""

echo "Testing VALID commit messages..."
echo ""

echo "Test 1: Valid feat"
echo "feat: add login" | npx commitlint && echo "✅ PASSED"
echo ""

echo "Test 2: Valid fix with scope"
echo "fix(auth): resolve token refresh" | npx commitlint && echo "✅ PASSED"
echo ""

echo "Test 3: Valid breaking change"
echo "feat!: redesign API" | npx commitlint && echo "✅ PASSED"
echo ""

echo "════════════════════════════════════════════════════════════════════════════"
echo "Testing Branch Name Validation"
echo "════════════════════════════════════════════════════════════════════════════"
echo ""

# Store current branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $current_branch"
echo ""

# The script will validate the current branch
echo "Running branch validation..."
./scripts/validate-branch-name.sh
if [ $? -eq 0 ]; then
    echo "✅ Current branch name is VALID"
else
    echo "❌ Current branch name is INVALID"
fi
echo ""

echo "════════════════════════════════════════════════════════════════════════════"
echo "Test Complete"
echo "════════════════════════════════════════════════════════════════════════════"
