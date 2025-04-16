---
title: Deployment Strategy
parent: Development
nav_order: 3
---

# Deployment Strategy

This document describes the strategy for deploying the Saleor backend, Headless CMS (if applicable), and the Next.js frontend to staging and production environments.

## Infrastructure Overview

*   **Saleor Core:** Deployed using Docker containers, likely orchestrated via Kubernetes (e.g., AWS EKS, Google GKE) or a PaaS like Heroku or Render. Requires PostgreSQL database and Redis instance.
*   **Headless CMS:** Deployed according to its specific requirements (e.g., Docker container, Node.js PaaS). May require its own database.
*   **Next.js Frontend:** Deployed to a platform optimized for Next.js (e.g., Vercel, Netlify) or as a Docker container / Node.js application on the same infrastructure as the backend.
*   **CDN:** Use a CDN (like Cloudflare, AWS CloudFront) for static assets (handled automatically by platforms like Vercel/Netlify) and potentially for API caching.
*   **Object Storage:** Use S3 or equivalent for storing media assets managed by Saleor and the CMS.

## Environments

1.  **Development:** Local setup using Docker Compose and local Node.js servers (as described in Local Development).
2.  **Staging:** A near-production environment used for final testing and QA before deploying to production. Mirrors production infrastructure closely. Deployed automatically from a specific branch (e.g., `staging` or `develop`).
3.  **Production:** The live environment accessible to end-users. Deployed automatically or manually from the main branch (e.g., `main`).

## CI/CD Pipeline (GitHub Actions)

A workflow in `.github/workflows/` will handle automated testing and deployment:

1.  **Trigger:** On push/merge to `main` (for Production) and `staging`/`develop` (for Staging).
2.  **Jobs:**
    *   **Lint & Test:** Run linters (ESLint, Prettier) and execute unit, integration tests for frontend and backend.
    *   **Build:**
        *   Build Docker images for Saleor Core and CMS.
        *   Build the Next.js application (`next build`).
    *   **Push (Optional):** Push Docker images to a container registry (e.g., Docker Hub, AWS ECR, Google GCR).
    *   **Deploy:**
        *   **Backend/CMS:** Trigger deployment to Kubernetes/PaaS using Helm, kubectl, or platform-specific CLI tools. Run database migrations.
        *   **Frontend:** Deploy to Vercel/Netlify via their integrations or deploy container/Node.js app.

## Deployment Process

1.  **Develop Feature:** Create feature branch, implement changes, write tests.
2.  **Pull Request:** Open PR against `staging` or `develop` branch.
3.  **CI Checks:** GitHub Actions runs tests. Code review happens.
4.  **Merge to Staging:** Merge PR. GitHub Actions automatically deploys to the Staging environment.
5.  **QA on Staging:** Perform manual testing and E2E checks on the Staging environment.
6.  **Release PR:** Create PR from `staging`/`develop` to `main`.
7.  **Merge to Production:** Merge PR. GitHub Actions automatically (or manually triggered) deploys to Production.
8.  **Monitor Production:** Observe logs and performance metrics after deployment.

## Static Site Deployment Options

The storefront can be deployed as a static site to various hosting platforms. Below are the key options for deploying the built assets (from `dist` directory):

### Preparation

Before deploying, ensure you have the following npm scripts in your `package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

> Note: `vite preview` is for local preview only and not meant for production use.

### Deployment Platforms

#### Vercel

Vercel is optimized for Next.js and provides the simplest deployment experience:

1. **Using Vercel CLI:**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Using Vercel for Git:**
   - Connect your GitHub/GitLab repository to Vercel
   - Configure build settings: Build command: `npm run build`, Output directory: `dist`
   - Each push to the connected branch triggers a deployment

#### Netlify

1. **Using Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify deploy
   ```

2. **Using Netlify with Git:**
   - Connect your GitHub/GitLab repository to Netlify
   - Configure build settings: Build command: `npm run build`, Publish directory: `dist`

#### Cloudflare Pages

1. **Using Wrangler:**
   ```bash
   npm install -g wrangler
   wrangler pages publish dist
   ```

2. **Using Cloudflare Pages with Git:**
   - Connect your GitHub/GitLab repository to Cloudflare Pages
   - Configure build settings: Build command: `npm run build`, Build output directory: `dist`

#### Render

1. Create a Render account
2. In the Dashboard, create a new "Static Site"
3. Connect your repository and set:
   - Build Command: `npm run build`
   - Publish Directory: `dist`

#### Other Options

- **GitHub Pages:** Deploy using GitHub Actions workflow
- **GitLab Pages:** Use GitLab CI to build and deploy
- **AWS Amplify:** Host directly from your Git repository
- **Google Firebase:** Use Firebase CLI for deployment
- **Azure Static Web Apps:** Deploy via GitHub Actions

## Multi-Region Deployment Considerations

For our multi-region implementation, consider:

1. **Domain Strategy:**
   - Separate domains per region (e.g., `nl.example.com`, `de.example.com`)
   - Path-based regions (e.g., `example.com/nl/`, `example.com/de/`)

2. **CDN Configuration:**
   - Configure geo-routing at the CDN level
   - Set up proper cache headers for region-specific content

3. **Build Process:**
   - Consider whether to build separate applications per region or a single application that handles all regions
   - Optimize for shared code across regions

## Key Configuration

*   **Environment Variables:** Manage secrets (API keys, database URLs) securely using GitHub Secrets and inject them into deployment environments.
*   **Database Migrations:** Ensure Saleor database migrations are run automatically as part of the backend deployment process.
*   **Rollbacks:** Have a strategy for rolling back deployments in case of critical issues (e.g., redeploying a previous Docker image/commit).

## Deployment Checklist

- [ ] Configure environment variables for each deployment environment
- [ ] Set up CI/CD pipelines for automated testing and deployment
- [ ] Configure domains and SSL certificates
- [ ] Set up monitoring and error tracking
- [ ] Test deployment process on staging environment
- [ ] Create deployment documentation for team members
- [ ] Implement rollback strategy
- [ ] Configure logging and alerting
- [ ] Test multi-region functionality across all deployment environments 