---
layout: default
title: Development
description: Development documentation for the Statamic to Medusa.js migration
include_in_nav: true
---

# Development

This section provides technical documentation for developers working on the Statamic to Medusa.js migration project.

## Project Structure

The codebase is organized into several key components:

- **Medusa Backend**: Core commerce functionality
- **Strapi CMS**: Content management system
- **Next.js Frontend**: Customer-facing storefront
- **Admin Dashboard**: Customized admin interface
- **Migration Tools**: Data migration utilities

## Development Environment

### Prerequisites

- Node.js v16+
- PostgreSQL v13+
- Redis v6+
- Docker and Docker Compose (optional, for containerized development)

### Setup Instructions

Follow these steps to set up your development environment:

1. Clone the repository
2. Install dependencies
3. Configure environment variables
4. Start the development servers

Detailed instructions are available in the [Environment Setup Guide](./environment-setup.md).

## API Documentation

- [Medusa.js API Reference](./api-reference/medusa.md)
- [Strapi API Reference](./api-reference/strapi.md)
- [Custom Endpoints](./api-reference/custom-endpoints.md)

## Development Workflow

Our development process follows these steps:

1. Feature planning and specification
2. Development in feature branches
3. Testing (unit, integration, and E2E)
4. Code review
5. Merge to main branch
6. Deployment

See the [Development Workflow Guide](./workflow.md) for more details.

## Testing

We use several testing methodologies:

- **Unit Tests**: For individual functions and components
- **Integration Tests**: For API endpoints and service interactions
- **E2E Tests**: For complete user flows

Learn more in the [Testing Guide](./testing.md).

## Contribution Guidelines

Before contributing, please read our [Contribution Guidelines](./contributing.md) to understand our coding standards, commit message format, and pull request process.

## Performance Optimization

The project includes several performance optimization techniques:

- API response caching
- Database query optimization
- Frontend bundle optimization
- Image optimization

See the [Performance Guide](./performance.md) for implementation details. 