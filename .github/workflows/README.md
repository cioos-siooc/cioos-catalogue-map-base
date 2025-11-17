# GitHub Actions Workflows

This directory contains GitHub Actions workflows for building and deploying the CIOOS Catalogue Map to GitHub Pages.

## Files

### `index-template.html`

HTML template for the GitHub Pages index/landing page that lists all deployments. The workflows use this template and dynamically inject the list of available deployments.

**Customization:** You can modify this template to change the appearance of the landing page. The placeholder `<!-- DEPLOYMENTS_PLACEHOLDER -->` will be replaced with the list of deployments.

## Workflows

### 1. Deploy Maps (`deploy-maps.yaml`)

**Triggers:**

- Push to `main` or `development` branches
- Pull requests to `main` or `development` branches (opened, synchronized, reopened)

**What it does:**

- Builds the Next.js application with appropriate base path
- Deploys to GitHub Pages in subdirectories:
  - `main/` - for the main branch
  - `development/` - for the development branch
  - `pr-{number}/` - for pull requests (e.g., `pr-123/`)
- Creates/updates an index page listing all deployments
- Comments on PRs with the preview deployment URL

**Deployment URLs:**

- Main: `https://{owner}.github.io/{repo}/main/`
- Development: `https://{owner}.github.io/{repo}/development/`
- PR #123: `https://{owner}.github.io/{repo}/pr-123/`
- Index: `https://{owner}.github.io/{repo}/`

### 2. Cleanup PR Deployments (`cleanup-pr-deployments.yaml`)

**Triggers:**

- When a pull request is closed (merged or not)

**What it does:**

- Removes the PR's deployment directory from GitHub Pages
- Updates the index page to remove the closed PR
- Comments on the PR to confirm cleanup

### 3. Test and Build Static Page (`test-and-build-static-page.yaml.disabled`)

**Status:** This is the legacy workflow that has been disabled and replaced by the new `deploy-maps.yaml` workflow. The file has been renamed to `.disabled` to prevent it from running. You can delete this file if you no longer need it for reference.

## How It Works

### Deployment Structure

The `gh-pages` branch contains subdirectories for each deployment:

```
gh-pages/
├── index.html          # Landing page listing all deployments
├── main/              # Main branch deployment
│   └── ...            # Built Next.js app
├── development/       # Development branch deployment
│   └── ...            # Built Next.js app
├── pr-123/           # PR #123 deployment
│   └── ...            # Built Next.js app
└── pr-456/           # PR #456 deployment
    └── ...            # Built Next.js app
```

### Base Path Configuration

The workflows set the `BASE_PATH` environment variable, which is used by [next.config.js](../../next.config.js) to configure the correct base path for each deployment. This ensures that all assets and links work correctly in their subdirectories.

### Concurrency Control

Each branch/PR has its own concurrency group to prevent race conditions:

- Main deployments: `pages-main`
- Development deployments: `pages-development`
- PR deployments: `pages-pr-{number}`

This allows multiple PRs to be built in parallel without interfering with each other.

## Setup Requirements

### GitHub Pages Configuration

1. Go to repository Settings → Pages
2. Set Source to "Deploy from a branch"
3. Select branch: `gh-pages`
4. Select folder: `/ (root)`
5. Save

### Repository Permissions

The workflows require the following permissions (already configured in the workflow files):

- `contents: write` - to push to gh-pages branch
- `pages: write` - to deploy to GitHub Pages
- `id-token: write` - for GitHub Pages deployment
- `pull-requests: write` - to comment on PRs

## Maintenance

### Cleaning Up Stale PR Deployments

PR deployments are automatically cleaned up when the PR is closed. However, if you need to manually clean up:

1. Checkout the `gh-pages` branch
2. Remove the PR directory: `rm -rf pr-{number}`
3. Commit and push: `git commit -am "Clean up PR #{number}" && git push`

### Updating the Index Page

The index page is automatically regenerated on each deployment using the [index-template.html](index-template.html) file. To customize the appearance:

1. Edit [index-template.html](index-template.html)
2. Keep the `<!-- DEPLOYMENTS_PLACEHOLDER -->` comment where you want the deployment list
3. The workflows will automatically use the updated template on the next deployment

## Troubleshooting

### Deployment Not Showing Up

1. Check the Actions tab for workflow runs and errors
2. Verify the `gh-pages` branch exists and has content
3. Check GitHub Pages settings are configured correctly

### 404 Errors on Assets

This usually means the base path is incorrect:

1. Check the `BASE_PATH` environment variable in the workflow logs
2. Verify [next.config.js](../../next.config.js) is using the correct base path
3. Ensure the `output: 'export'` setting is present in next.config.js

### PR Comment Not Posted

1. Verify the workflow has `pull-requests: write` permission
2. Check the Actions tab for errors in the "Comment PR" step
3. Ensure the GitHub token has the necessary permissions

## Migration from Legacy Workflow

The old `test-and-build-static-page.yaml` workflow has been disabled and its functionality integrated into `deploy-maps.yaml`:

1. ✅ All linting and build steps are preserved
2. ✅ Main branch deploys to GitHub Pages (in `/main/` subdirectory)
3. ✅ Development branch now also gets deployed (to `/development/` subdirectory)
4. ✅ PRs get preview deployments with automatic cleanup
5. ⚠️ **Breaking change:** URLs now include subdirectories (e.g., `/main/` instead of root)

If you need the main branch to deploy to the root (backward compatibility), you can modify the workflow to deploy to both root and `/main/` subdirectory.
