# GitHub Pages Deployment Setup

This repository includes a GitHub Actions workflow that automatically builds and deploys your Hugo site to GitHub Pages whenever you push to the `main` branch.

## Setup Instructions

### 1. Repository Settings

1. Go to your GitHub repository settings
2. Navigate to **Pages** section in the left sidebar
3. Under **Source**, select **GitHub Actions**
4. The workflow will automatically trigger on the next push to `main` branch

### 2. Branch Configuration

The workflow is configured to deploy from the `main` branch.

### 3. Hugo Version

The workflow is configured to use Hugo v0.140.0 (extended) to match your local development environment. This ensures consistency between local builds and production deployments.

### 4. Base URL Configuration

The workflow automatically configures the base URL for GitHub Pages. If you want to use a custom domain, update the `baseURL` in `hugo.toml` to your custom domain.

### 4. First Deployment

After pushing to the main branch:
1. Go to the **Actions** tab in your repository
2. You should see the "Build and deploy Hugo site" workflow running
3. Once completed, your site will be available at `https://<username>.github.io/<repository-name>/`

## Local Development

Continue developing locally with:
```bash
hugo server -D
```

## Production Build

To test a production build locally:
```bash
hugo --gc --minify
```

## Troubleshooting

- Ensure GitHub Pages is enabled in repository settings
- Check that the workflow has necessary permissions
- Verify that the theme submodule is properly initialized
- Check the Actions tab for any build errors

The workflow includes all necessary steps including theme submodule initialization, so your site should deploy successfully on the first run.