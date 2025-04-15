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

## Key Configuration

*   **Environment Variables:** Manage secrets (API keys, database URLs) securely using GitHub Secrets and inject them into deployment environments.
*   **Database Migrations:** Ensure Saleor database migrations are run automatically as part of the backend deployment process.
*   **Rollbacks:** Have a strategy for rolling back deployments in case of critical issues (e.g., redeploying a previous Docker image/commit).

*(Add specific infrastructure choices, tool configurations, and detailed pipeline steps)* 