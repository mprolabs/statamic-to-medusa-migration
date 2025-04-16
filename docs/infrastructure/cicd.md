---
title: CI/CD Pipeline
parent: Infrastructure
nav_order: 5
has_toc: true
multilang_export: true
permalink: /infrastructure/cicd/
---

# CI/CD Pipeline Requirements

This document outlines the continuous integration and continuous deployment (CI/CD) pipeline requirements for the Saleor e-commerce platform with multi-region and multi-language capabilities.

## CI/CD Tool Selection: GitHub Actions

GitHub Actions has been selected as the primary CI/CD platform for the following reasons:

- **Integration**: Native integration with GitHub repositories
- **Workflow as Code**: YAML-based workflow definition stored with code
- **Matrix Builds**: Support for testing across multiple environments
- **Container Support**: First-class support for Docker-based workflows
- **Self-hosted Runners**: Ability to use custom runners for specialized workloads
- **Extensive Marketplace**: Large ecosystem of pre-built actions

## Pipeline Environments

The pipeline will support the following environments:

| Environment | Purpose | Deployment Trigger | Approval |
|-------------|---------|-------------------|----------|
| Development | Feature testing | Push to feature branch | None |
| Integration | Testing feature integrations | Push to develop branch | None |
| Staging | Pre-production validation | Push to release branch | Manual |
| Production | Live environment | Push to main branch | Manual |

## Workflow Structure

### Core Workflows

| Workflow | Purpose | Events | Key Steps |
|----------|---------|--------|-----------|
| CI | Code quality and testing | Push, Pull Request | Lint, Test, Build |
| CD-Dev | Development deployment | Push to develop | Build, Test, Deploy |
| CD-Staging | Staging deployment | Push to release | Build, Test, Deploy |
| CD-Production | Production deployment | Push to main | Build, Test, Deploy |
| Dependency-Check | Security scanning | Schedule, On Demand | Scan Dependencies |
| Infrastructure | Infrastructure updates | Push to infra-* branches | Terraform Plan/Apply |

### Components per Environment

| Component | Dev | Staging | Production |
|-----------|-----|---------|------------|
| Saleor Core | ✅ | ✅ | ✅ |
| Saleor Dashboard | ✅ | ✅ | ✅ |
| Next.js Storefront | ✅ | ✅ | ✅ |
| Infrastructure | ❌ | ✅ | ✅ |
| Database Migrations | ✅ | ✅ | ✅ |
| Multi-Region | ❌ | ✅ | ✅ |

## CI Workflow Details

```yaml
name: CI

on:
  push:
    branches: [ develop, release/*, main ]
  pull_request:
    branches: [ develop ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'yarn'
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      - name: Run linting
        run: yarn lint

  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'yarn'
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      - name: Run tests
        run: yarn test

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'yarn'
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      - name: Build
        run: yarn build
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: ./dist
```

## CD Workflow Details

```yaml
name: CD-Production

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and tag Docker images
        run: |
          docker build -t saleor-storefront:${{ github.sha }} ./storefront
          docker build -t saleor-dashboard:${{ github.sha }} ./dashboard
          docker build -t saleor-api:${{ github.sha }} ./api

  test:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v3
      - name: Run integration tests
        run: docker-compose -f docker-compose.test.yml up --abort-on-container-exit

  security-scan:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Scan container images
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'saleor-api:${{ github.sha }}'
          format: 'table'
          exit-code: '1'
          severity: 'CRITICAL,HIGH'

  deploy-approval:
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    environment: production-approval
    steps:
      - name: Manual deployment approval
        run: echo "Deployment approved"

  deploy:
    runs-on: ubuntu-latest
    needs: deploy-approval
    steps:
      - uses: actions/checkout@v3
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-central-1

      - name: Login to Amazon ECR
        uses: aws-actions/amazon-ecr-login@v1

      - name: Push images to ECR
        run: |
          docker tag saleor-api:${{ github.sha }} ${{ secrets.ECR_REPOSITORY }}/saleor-api:${{ github.sha }}
          docker tag saleor-api:${{ github.sha }} ${{ secrets.ECR_REPOSITORY }}/saleor-api:latest
          docker push ${{ secrets.ECR_REPOSITORY }}/saleor-api:${{ github.sha }}
          docker push ${{ secrets.ECR_REPOSITORY }}/saleor-api:latest

      - name: Update Kubernetes deployments
        run: |
          aws eks update-kubeconfig --name saleor-cluster --region eu-central-1
          kubectl set image deployment/saleor-api saleor-api=${{ secrets.ECR_REPOSITORY }}/saleor-api:${{ github.sha }} --record

  deploy-nl-be:
    runs-on: ubuntu-latest
    needs: deploy
    steps:
      - uses: actions/checkout@v3
      - name: Configure AWS credentials for EU-West-1
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-west-1

      - name: Update Kubernetes deployments in NL/BE region
        run: |
          aws eks update-kubeconfig --name saleor-cluster-nl-be --region eu-west-1
          kubectl set image deployment/saleor-api saleor-api=${{ secrets.ECR_REPOSITORY }}/saleor-api:${{ github.sha }} --record

  post-deploy-tests:
    runs-on: ubuntu-latest
    needs: [deploy, deploy-nl-be]
    steps:
      - uses: actions/checkout@v3
      - name: Run post-deployment health checks
        run: |
          ./scripts/health-check.sh https://api.example.com/health
          ./scripts/health-check.sh https://nl.example.com/health
          ./scripts/health-check.sh https://be.example.com/health
          ./scripts/health-check.sh https://de.example.com/health
```

## Infrastructure as Code Pipeline

The infrastructure changes will follow a separate workflow:

```yaml
name: Infrastructure

on:
  push:
    branches:
      - 'infra-*'
      - 'terraform-*'
    paths:
      - 'terraform/**'
      - '.github/workflows/infrastructure.yml'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: 1.3.6
      - name: Terraform Format
        run: terraform fmt -check -recursive
      - name: Terraform Init
        run: terraform init
        working-directory: ./terraform
      - name: Terraform Validate
        run: terraform validate
        working-directory: ./terraform

  plan:
    runs-on: ubuntu-latest
    needs: validate
    steps:
      - uses: actions/checkout@v3
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: 1.3.6
      - name: Terraform Init
        run: terraform init
        working-directory: ./terraform
      - name: Terraform Plan
        run: terraform plan -out=tfplan
        working-directory: ./terraform
      - name: Upload Terraform Plan
        uses: actions/upload-artifact@v3
        with:
          name: terraform-plan
          path: ./terraform/tfplan

  apply:
    runs-on: ubuntu-latest
    needs: plan
    environment: production-infrastructure
    steps:
      - uses: actions/checkout@v3
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: 1.3.6
      - name: Terraform Init
        run: terraform init
        working-directory: ./terraform
      - name: Download Terraform Plan
        uses: actions/download-artifact@v3
        with:
          name: terraform-plan
          path: ./terraform
      - name: Terraform Apply
        run: terraform apply -auto-approve tfplan
        working-directory: ./terraform
```

## Multi-Region Deployment Strategy

The multi-region deployment will follow a controlled rollout strategy:

1. **Initial Deployment**: Primary region (eu-central-1 for DE)
2. **Verification**: Automated smoke tests against primary region
3. **Secondary Deployment**: Secondary regions (eu-west-1 for NL/BE)
4. **Cross-Region Verification**: Test region-specific endpoints and functionality

## Database Migrations

Database migrations will be handled with a separate job to ensure proper coordination:

```yaml
jobs:
  database-migration:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v3
      - name: Set up migration environment
        run: |
          pip install -r requirements-migration.txt
      - name: Create migration plan
        run: python manage.py makemigrations --dry-run
      - name: Apply migrations
        run: python manage.py migrate
      - name: Verify migration success
        run: python manage.py showmigrations
```

## Secrets Management

The following secrets will be managed in GitHub Actions:

| Secret | Purpose | Environments |
|--------|---------|--------------|
| AWS_ACCESS_KEY_ID | AWS authentication | All |
| AWS_SECRET_ACCESS_KEY | AWS authentication | All |
| ECR_REPOSITORY | Container registry | All |
| KUBECONFIG_STAGING | Kubernetes staging config | Staging |
| KUBECONFIG_PRODUCTION | Kubernetes production config | Production |
| DATABASE_URL | Database connection strings | All |
| SALEOR_SECRET_KEY | Application secret | All |
| REDIS_URL | Cache connection string | All |

## Artifact Management

Build artifacts will be handled as follows:

- **Container Images**: Stored in Amazon ECR with versioned tags
- **Static Assets**: Uploaded to S3 buckets per region
- **Build Logs**: Retained in GitHub Actions for 90 days
- **Test Reports**: Uploaded as artifacts and sent to monitoring system

## Monitoring Integration

The pipeline will integrate with monitoring systems:

- **Deployment Notifications**: Sent to Slack channel
- **Error Alerts**: Integrated with PagerDuty for production issues
- **Performance Metrics**: Post-deployment metrics gathered and analyzed
- **Status Dashboard**: Updated with deployment status and version information

## Rollback Strategy

In case of deployment issues, the following rollback strategy will be implemented:

1. **Automated Detection**: Health checks and monitoring trigger alerts
2. **Manual Intervention**: On-call engineer confirms rollback decision
3. **Rollback Execution**: Previous known-good version redeployed
4. **Verification**: Post-rollback health checks confirm system stability
5. **Root Cause Analysis**: Investigation performed on failed deployment

## CI/CD Resource Requirements

| Component | Resource Type | Specification |
|-----------|--------------|---------------|
| GitHub Action Runners | Self-hosted | 4 vCPU, 16GB RAM |
| Build Cache | S3 | 50GB storage |
| Artifact Storage | S3 | 100GB storage |
| Container Registry | ECR | 300GB storage |

## Pipeline Performance Metrics

| Metric | Target |
|--------|--------|
| CI Pipeline Duration | < 15 minutes |
| Single-Region Deployment | < 10 minutes |
| Full Multi-Region Deployment | < 30 minutes |
| Time to First Test | < 5 minutes |
| Code to Production | < 60 minutes |

## Security and Compliance

The pipeline includes the following security measures:

- **Dependency Scanning**: Regular checks for vulnerable dependencies
- **Container Scanning**: Static analysis of container images
- **Secret Detection**: Prevention of secrets checked into code
- **SAST**: Static Application Security Testing integrated into CI
- **Compliance Checks**: Automated verification of compliance requirements

## Future Enhancements

The following enhancements are planned for future iterations:

- **Canary Deployments**: Gradual traffic shifting for production deployments
- **Feature Flags**: Integration with feature flag service for controlled rollouts
- **A/B Testing**: Infrastructure for running A/B tests in production
- **Automated Rollbacks**: AI-assisted detection and automatic rollback of problematic deployments
- **Performance Testing**: Automated load testing integrated into the pipeline 