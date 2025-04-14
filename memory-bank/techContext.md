# Technical Context

This document outlines the technical context for the Statamic to Saleor migration project, including the technology stack, development environment, and technical constraints.

## Current Technology Stack

### Production System (Statamic)
- **CMS**: Statamic 3 (PHP-based, flat-file CMS)
- **Ecommerce**: Simple Commerce (Statamic addon)
- **Frontend**: Laravel Blade templates with Vue.js components
- **Database**: File-based with optional MySQL for specific features
- **Hosting**: Traditional PHP hosting environment

### Target System (Saleor)
- **Ecommerce Platform**: Saleor (Python-based headless commerce)
- **API**: GraphQL API for data access and management
- **Frontend**: Next.js React application
- **Database**: PostgreSQL for structured data
- **Deployment**: Docker containerization

## Technical Constraints

### Current System Limitations
- Limited scalability of the file-based CMS
- Performance bottlenecks with complex commerce operations
- Challenges with multi-region and multi-language implementation
- Limited API capabilities for headless operations
- Maintenance becoming increasingly complex

### Target System Requirements
- Must support multiple domains/storefronts (3 separate regions)
- Must handle multiple languages across all stores
- Must provide high-performance API access
- Must enable flexible content management
- Must support all existing ecommerce functionality
- Must be containerized for easier deployment and scaling

## Development Environment

### Local Development Setup
- **Node.js**: v18.x or higher
- **Docker**: Latest version with Docker Compose
- **Git**: For version control
- **Code Editor**: VS Code with recommended extensions
- **API Testing**: GraphQL Playground or Insomnia

### Required Tools
- Docker Desktop for containerization
- Git for version control
- Node.js and NPM for frontend development
- Python for backend development (if needed)
- Database management tools (e.g., pgAdmin for PostgreSQL)

## Architecture Overview

### Saleor Architecture
- Saleor Core: Python-based headless commerce platform
- Saleor Dashboard: Admin interface for managing the store
- PostgreSQL: Primary database for structured data
- GraphQL API: Main interface for data exchange

### Storefront Architecture
- Next.js: React framework for building the storefront
- React: Frontend library for UI components
- Apollo Client: For GraphQL communication with Saleor
- Tailwind CSS: For styling components
- TypeScript: For type-safe development

## Multi-Region Implementation

### Saleor Channel System
- Each region implemented as a separate Saleor Channel
- Channel-specific product availability and pricing
- Channel-specific payment methods
- Channel-specific shipping options
- Channel-specific tax configurations

### Domain Setup
- Separate domains for each region:
  - Netherlands: nl.domain.com
  - Belgium: be.domain.com
  - Germany: de.domain.com
- Domain-specific configuration in Next.js
- Proper routing and redirection rules

## Multi-Language Implementation

### Translation Strategy
- Saleor's translation capabilities for product data
- Translation objects for all content models
- Language detection based on domain/user preference
- Fallback mechanisms for missing translations

### SEO Considerations
- Language-specific metadata
- Proper hreflang tags
- Canonical URLs for language variants
- Structured data in multiple languages

## Integration Points

### Payment Gateways
- Integration with region-specific payment providers
- Unified payment processing flow
- Handling multi-currency payments

### Shipping Providers
- Integration with region-specific shipping services
- Shipping rate calculations by region
- Address validation by country

### External Systems
- ERP integration if applicable
- Marketing automation tools
- Analytics and tracking

## Data Migration Approach

### Data Export from Statamic
- Custom scripts to extract data from Statamic files
- Transformation of data to match Saleor models
- Preservation of relationships and metadata

### Data Import to Saleor
- GraphQL mutations for importing data
- Batch processing for large datasets
- Validation and error handling
- Media file migration

## Testing Strategy

### Test Environments
- Local development environment
- Staging environment that mirrors production
- Automated testing in CI/CD pipeline

### Testing Types
- Unit testing for core functions
- Integration testing for API endpoints
- End-to-end testing for critical user flows
- Performance testing for API and frontend
- Multi-region testing across all domains
- Multi-language testing across all content

## Deployment Strategy

### CI/CD Pipeline
- Automated testing on code commits
- Docker image building and versioning
- Deployment to staging environments
- Production deployment process

### Infrastructure
- Containerized services with Docker
- Load balancing for high availability
- CDN for static assets and media
- Database backup and recovery procedures

## Performance Optimization

### API Performance
- GraphQL query optimization
- Caching strategies for common queries
- Rate limiting and security measures

### Frontend Performance
- Server-side rendering (SSR) for critical pages
- Static generation for content-heavy pages
- Code splitting and lazy loading
- Image optimization and CDN usage

## Security Considerations

### Data Protection
- PII handling in compliance with GDPR
- Secure storage of customer data
- Payment information security (PCI compliance)

### Authentication & Authorization
- Secure user authentication
- Role-based access control
- API security and rate limiting

## Documentation Requirements

### System Documentation
- Architecture diagrams and descriptions
- API documentation using GraphQL introspection
- Deployment and infrastructure documentation
- Database schema documentation

### User Documentation
- Admin user guides for Saleor Dashboard
- Content management guidelines
- Technical reference for developers

## Current Status & Next Steps

The technical implementation is in the **Proof of Concept** phase, focusing on:
1. Setting up Saleor with Channel system for multi-region support
2. Configuring Next.js for multi-domain and multi-language frontend
3. Testing data migration approaches for Statamic to Saleor
4. Validating the architecture against performance requirements

## Technology Stack

### Current System

- **Statamic CMS**: PHP-based flat-file CMS
  - Version: 3.x
  - Serves as current content management system and website platform
  
- **Simple Commerce**: Statamic e-commerce addon
  - Provides basic e-commerce functionality
  - Handles products, cart, and checkout
  
- **Laravel**: PHP framework underlying Statamic
  - Version: 8.x
  - Handles routing, database operations, and business logic
  
- **Vue.js**: Frontend framework for Statamic admin and components
  - Version: 2.x
  - Used for interactive elements in the current storefront
  
- **MySQL**: Database for current implementation
  - Stores product data, user information, and order details

### Target System

- **Saleor**: Headless e-commerce platform
  - Version: Latest (3.x)
  - Core commerce functionality (products, cart, orders, checkout)
  - Multi-region support through Channels
  - Built-in content management capabilities
  - GraphQL API
  
- **Next.js**: React framework for frontend
  - Version: 13.x
  - Server-side rendering for SEO
  - API routes for backend functionality
  - Support for TypeScript
  - Internationalization capabilities
  
- **PostgreSQL**: Database for Saleor
  - Version: 14.x
  - Stores product data, content, and order information
  
- **TypeScript**: Programming language for frontend and scripts
  - Version: 5.x
  - Type safety for development
  
- **Docker**: Container platform for development and deployment
  - Used for local development environments
  - Ensures consistency across environments

## Development Environment

### Local Development Setup

- **Docker Compose**: For managing development environment containers
  - Saleor services
  - PostgreSQL database
  - Next.js development server
  
- **Node.js**: Runtime for JavaScript/TypeScript
  - Version: 18.x LTS
  - Required for Next.js development

- **Git**: Version control
  - GitHub for repository hosting
  - Branch strategy: feature branches with PR workflow

- **VSCode**: Recommended IDE with extensions:
  - ESLint
  - Prettier
  - TypeScript
  - GraphQL

### Testing Frameworks

- **Jest**: JavaScript testing framework
  - Unit tests for utility functions and components
  
- **Cypress**: End-to-end testing
  - Testing critical user flows
  - Cross-browser verification
  
- **React Testing Library**: Component testing
  - Testing UI components in isolation

- **GraphQL Code Generator**: For TypeScript types from GraphQL schema
  - Ensures type safety when working with Saleor API

## Integration Points

- **GraphQL API**: Primary communication method with Saleor
  - All commerce operations (products, cart, checkout)
  - Content management operations

- **Payment Gateways**:
  - Mollie for Netherlands and Belgium
  - Stripe for all regions
  - Region-specific payment methods (iDEAL, Bancontact, etc.)

- **Shipping Providers**:
  - PostNL for Netherlands
  - bpost for Belgium
  - DHL for Germany

- **Analytics and Tracking**:
  - Google Analytics 4
  - Facebook Pixel
  - Region-specific tracking requirements

## Technical Constraints

- **Multi-Region Requirements**:
  - Three separate regional domains:
    - Netherlands: nl.domain.com
    - Belgium: be.domain.com
    - Germany: de.domain.com
  - Region-specific pricing, taxation, and shipping
  - Single Saleor instance with Channel configuration

- **Multi-Language Requirements**:
  - Two languages across stores:
    - Dutch (nl)
    - English (en)
  - Germany currently only English, may add German later
  - Content needs to be managed in multiple languages
  - URL structures should include language indicators

- **SEO Requirements**:
  - Server-side rendering for all pages
  - Language-specific metadata
  - Region-specific sitemaps
  - Canonical URLs for language variants

- **Performance Requirements**:
  - Page load time under 2 seconds
  - First contentful paint under 1 second
  - Core Web Vitals compliance
  - Mobile-friendly design and performance

## Data Migration Strategy

### Migration Approach

1. **Data Extraction**: Custom scripts to extract data from Statamic
   - Products, categories, and attributes
   - Customer data (with GDPR compliance)
   - Order history
   - Content pages and assets

2. **Data Transformation**: Processing extracted data
   - Mapping to Saleor data models
   - Handling language variations
   - Preparing region-specific configurations

3. **Data Loading**: Scripts to import data into Saleor
   - Creating products with translations
   - Setting up channels for regions
   - Configuring pricing and availability
   - Importing media assets

4. **Verification**: Testing imported data
   - Automated validation scripts
   - Manual spot checks
   - Testing regional configurations

## Security Considerations

- **Authentication**: JWT-based authentication for API
- **Authorization**: Role-based access control
- **Data Protection**: GDPR compliance measures
- **API Security**: Rate limiting and proper authentication
- **PCI Compliance**: For payment processing

## Performance Optimization

- **Image Optimization**: Next.js image optimization
- **Code Splitting**: For efficient loading
- **GraphQL Query Optimization**: Requesting only needed fields
- **Caching Strategy**:
  - Static generation for product pages
  - Incremental Static Regeneration for changing content
  - API response caching
  - Database query optimization

## Deployment Architecture

```
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│                   │     │                   │     │                   │
│  Next.js          │     │  Saleor           │     │  PostgreSQL       │
│  Storefronts      │     │  API Server       │     │  Database         │
│                   │     │                   │     │                   │
└─────────┬─────────┘     └─────────┬─────────┘     └─────────┬─────────┘
          │                         │                         │
          │                         │                         │
┌─────────▼─────────┐     ┌─────────▼─────────┐     ┌─────────▼─────────┐
│                   │     │                   │     │                   │
│  CDN              │     │  Load Balancer    │     │  Backup System    │
│                   │     │                   │     │                   │
└───────────────────┘     └───────────────────┘     └───────────────────┘
```

- **Hosting**: Cloud-based infrastructure
- **Scaling**: Horizontal scaling for API servers
- **Redundancy**: Database replication and failover
- **Monitoring**: Comprehensive logging and alerting
- **Backups**: Regular database backups

## Technical Roadmap

1. **Phase 1: Proof of Concept** (Current)
   - Set up Saleor with basic functionality
   - Test multi-region support using Channels
   - Validate language translation workflows
   - Create Next.js storefront with core features

2. **Phase 2: Development**
   - Complete storefront implementation
   - Develop data migration scripts
   - Set up testing infrastructure
   - Implement CI/CD pipelines

3. **Phase 3: Testing and Refinement**
   - Execute comprehensive testing
   - Performance optimization
   - Security auditing
   - Data migration rehearsals

4. **Phase 4: Deployment**
   - Staged rollout by region
   - Monitoring and issue resolution
   - Support and training

## References

- [Saleor Documentation](https://docs.saleor.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [GraphQL Documentation](https://graphql.org/learn/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Statamic Documentation](https://statamic.dev/)