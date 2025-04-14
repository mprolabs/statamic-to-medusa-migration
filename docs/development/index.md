---
layout: default
title: Development Guide
description: Development guidelines and resources for the Statamic to Saleor migration project
---

# Development Guide

This section provides comprehensive development guidelines and resources for the Statamic to Saleor migration project, with specific focus on implementing multi-region and multi-language capabilities.

## Development Overview

The development process for this migration project involves multiple components:

1. **Saleor Core**: Setting up and configuring Saleor with Channels for multi-region support
2. **Next.js Storefront**: Developing a storefront with multi-domain and multi-language capabilities
3. **Migration Tools**: Creating tools to migrate data from Statamic to Saleor
4. **Infrastructure**: Setting up the deployment architecture for multiple domains

## Development Workflow

Our development workflow follows these principles:

- **Feature Branches**: All development happens in feature branches
- **Pull Requests**: Code is reviewed through pull requests
- **CI/CD**: Automated testing and deployment pipelines
- **Environment Progression**: Changes move through development → staging → production

## Multi-Region Development Considerations

When developing for multi-region support:

1. **Always consider channel context**: All queries to Saleor must include channel context
2. **Region-specific business rules**: Implement region-specific pricing, shipping, and tax rules
3. **Domain-based routing**: Implement proper routing based on domains
4. **Cross-region cart and checkout**: Ensure cart and checkout processes respect region context
5. **Region-specific payment methods**: Implement payment methods appropriate for each region

## Multi-Language Development Considerations

When developing multi-language capabilities:

1. **Translation management**: Implement efficient workflows for content translations
2. **Language switching**: Create seamless language switching mechanisms
3. **SEO optimization**: Ensure proper language metadata for SEO
4. **Fallback strategies**: Implement fallbacks when translations are missing
5. **URL structures**: Maintain SEO-friendly URL structures for all languages

## Development Resources

### Documentation

- [Saleor API Documentation](https://docs.saleor.io/docs/3.x/api-reference/)
- [Next.js Documentation](https://nextjs.org/docs)
- [GraphQL Documentation](https://graphql.org/learn/)
- [Docker Documentation](https://docs.docker.com/)

### Code Standards

- [JavaScript Style Guide](https://github.com/airbnb/javascript)
- [React Best Practices](https://reactjs.org/docs/thinking-in-react.html)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)

### Development Environment

For detailed setup instructions, see the following guides:

- [Setup Instructions](setup.md): Setting up the development environment
- [Local Development](local-development.md): Working with the local development environment
- [Extending Functionality](extending.md): Guidelines for extending the core functionality
- [Deployment Process](deployment.md): Deploying the application

## Key Development Patterns

### Channel-Based API Queries

Always include channel context in API queries:

```javascript
const GET_PRODUCTS = gql`
  query GetProducts($channel: String!) {
    products(channel: $channel, first: 10) {
      edges {
        node {
          id
          name
          # Other fields...
        }
      }
    }
  }
`;
```

### Multi-Language Components

Create components that handle multiple languages:

```javascript
function ProductName({ product, languageCode }) {
  // Use translation if available, otherwise fallback to default
  return (
    <h1>
      {product.translation && product.translation.name
        ? product.translation.name
        : product.name}
    </h1>
  );
}
```

### Domain-Specific Routing

Implement domain-based routing for region-specific storefronts:

```javascript
// In Next.js middleware.js
export function middleware(request) {
  const { hostname } = request.nextUrl;
  
  // Route based on hostname
  if (hostname === 'domain-nl.local') {
    // Netherlands-specific logic
    request.headers.set('x-channel', 'netherlands');
    request.headers.set('x-language', 'nl');
  } else if (hostname === 'domain-be.local') {
    // Belgium-specific logic
    request.headers.set('x-channel', 'belgium');
    request.headers.set('x-language', determineLanguage(request)); // nl or fr
  } else if (hostname === 'domain-de.local') {
    // Germany-specific logic
    request.headers.set('x-channel', 'germany');
    request.headers.set('x-language', 'de');
  }
  
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
}
```

## Issue Tracking

Development issues are tracked in our project management system. Each issue should include:

1. Clear description of the feature or bug
2. Region and language context, if applicable
3. Acceptance criteria
4. Technical approach
5. Testing requirements

## Testing Requirements

All development work must include:

1. **Unit Tests**: Testing individual components and functions
2. **Integration Tests**: Testing interaction between components
3. **E2E Tests**: End-to-end testing of key user flows
4. **Multi-Region Tests**: Testing across all regions
5. **Multi-Language Tests**: Testing with all supported languages

See the individual guide pages for more detailed information on each aspect of development. 