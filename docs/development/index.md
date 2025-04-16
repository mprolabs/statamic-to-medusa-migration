---
title: Development
layout: default
has_children: true
nav_order: 3
permalink: /development/
---

# Development Documentation

Welcome to the development documentation for the Saleor multi-region e-commerce project. This section provides comprehensive guides and references for developers working on the project.

## Overview

Our development stack consists of:

- **Backend**: Saleor headless e-commerce platform
- **Frontend**: Next.js with React, tailored for multi-region and multi-language support
- **Styling**: Tailwind CSS for responsive, utility-first styling
- **Data Access**: Apollo Client for GraphQL communication with Saleor
- **State Management**: React Context and custom hooks
- **Build Tool**: Next.js with SWC for fast builds

## Development Guides

### [Local Development](/docs/development/local-development.md)
Guide to setting up a local development environment for the project, including dependencies, configuration, and running the application.

### [Coding Standards](/docs/development/coding-standards.md)
Comprehensive coding standards and best practices for consistent, maintainable code across the project.

### [Deployment Strategy](/docs/development/deployment.md)
Strategy for deploying the application to staging and production environments, including CI/CD pipeline and infrastructure considerations.

### [Frontend Configuration](/docs/development/frontend-configuration.md)
Detailed documentation on Next.js, Tailwind CSS, and PostCSS configuration for the frontend application.

### [React Component Migration](/docs/development/react-component-migration.md)
Guidelines for migrating React class components to functional components with hooks, focusing on e-commerce components.

## Key Development Concepts

### Multi-Region Support

Our application supports multiple regions (NL, BE, DE) through Saleor's Channel feature:

- Each region has its own channel in Saleor
- Region-specific pricing, availability, and shipping options
- Domain or path-based region detection (e.g., `nl.example.com` or `example.com/nl/`)
- Server-side detection and persistence of region preference

### Multi-Language Support

Language support is implemented using Next.js internationalization features:

- Support for English (en), Dutch (nl), German (de), and French (fr)
- Language detection from URL and user preferences
- GraphQL queries with language parameters
- Language-specific content loaded from Saleor

### Frontend Architecture

The frontend follows these architectural principles:

- **Component-Based**: Small, reusable UI components
- **Server Components**: Leveraging Next.js 13+ Server Components where appropriate
- **Client Components**: Interactive components with hooks and state
- **Type Safety**: TypeScript for improved developer experience
- **Responsive Design**: Mobile-first approach using Tailwind CSS

## Project Structure

```
storefront/
├── app/                    # Next.js App Router routes and layouts
├── components/             # Reusable React components
├── lib/                    # Utilities and libraries
│   ├── graphql/            # GraphQL queries and Apollo client
│   └── hooks/              # Custom React hooks
├── public/                 # Static assets
├── styles/                 # Global styles and Tailwind imports
├── next.config.js          # Next.js configuration
├── postcss.config.js       # PostCSS configuration
└── tailwind.config.js      # Tailwind CSS configuration
```

## Development Workflow

1. **Pull the latest changes** from the main repository
2. **Create a feature branch** for your work
3. **Implement changes** following the coding standards
4. **Write tests** for new functionality
5. **Run linting and tests** to ensure quality
6. **Create a pull request** for code review
7. **Address feedback** from reviewers
8. **Merge** once approved

## Common Development Tasks

- **Starting development server**: `npm run dev`
- **Building for production**: `npm run build`
- **Running tests**: `npm test`
- **Linting code**: `npm run lint`
- **Type checking**: `npm run typecheck`

## Additional Resources

- [Saleor Documentation](https://docs.saleor.io/docs/3.x/developer/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/) 