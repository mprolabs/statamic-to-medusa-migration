# Technical Context: Statamic to Medusa.js Migration

## Current Technology Stack

### CMS Platform
- **Statamic CMS**: PHP-based flat-file CMS
- **Version**: 3.x
- **Hosting**: Traditional shared hosting environment
- **Server Configuration**: Apache with PHP 7.4
- **Content Structure**: Flat-file based collections and blueprints
- **Templating**: Antlers templating engine
- **Multi-language Support**: Limited support through separate content files

### E-commerce Functionality
- **Simple Commerce**: Statamic add-on for basic e-commerce
- **Payment Processors**: Mollie integration
- **Order Management**: Basic order tracking and history
- **Product Management**: Statamic collections and blueprints
- **Cart Implementation**: Session-based shopping cart
- **Checkout Process**: Basic single-page checkout
- **Product Variants**: Limited support through blueprint fields

### Frontend
- **Rendering Engine**: Antlers (Statamic templating)
- **CSS Framework**: Tailwind CSS
- **JavaScript**: Alpine.js for interactivity
- **Build Tools**: Laravel Mix
- **Responsive Design**: Mobile-first approach with Tailwind

### Deployment
- **Environment**: Shared hosting
- **Deployment Method**: Manual FTP uploads
- **Environments**: Production only (no staging)
- **Domain Structure**: Multiple domains pointing to same codebase with different configuration

### Monitoring & Analytics
- **Analytics**: Google Analytics
- **Error Tracking**: None
- **Performance Monitoring**: None

## Target Technology Stack

### Commerce Platform
- **Medusa.js**: Headless commerce platform
- **Version**: Latest stable (currently 1.x)
- **Configuration**: Single instance with Region Module for multi-store support
- **Core Extensions**:
  - Region Module for multi-domain support
  - Sales Channels for product availability per store
  - Admin dashboard for product management
- **Architecture**: API-first, microservices-based commerce engine

### Content Management
- **Strapi**: Headless CMS
- **Version**: Latest stable (currently 4.x)
- **Core Extensions**:
  - i18n plugin for multi-language support
  - Multi-site configuration for domain-specific content
  - Roles & permissions for content management workflows
- **Content Structure**: Relational database with flexible content types

### Frontend
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **State Management**: React Context or Redux
- **Build & Bundling**: Webpack through Next.js
- **Edge Caching**: CDN configuration for region-specific performance

### Data Storage
- **Database**: PostgreSQL 14+
- **File Storage**: AWS S3 or similar
- **Search**: MeiliSearch or Algolia

### API Architecture
- **Commerce API**: Medusa.js RESTful API
- **Content API**: Strapi GraphQL and REST
- **Authentication**: JWT-based auth
- **API Gateway**: For unified access and routing

### Infrastructure
- **Hosting**: Docker containers on cloud platform
- **Environments**: Development, Staging, Production
- **Scaling**: Horizontal scaling for application tiers
- **CDN**: For static assets and edge caching
- **Region-Based Routing**: Domain-specific configurations

### DevOps
- **CI/CD**: GitHub Actions or similar
- **Monitoring**: Prometheus and Grafana
- **Logging**: ELK Stack
- **Error Tracking**: Sentry
- **Performance**: New Relic or Datadog
- **Testing**: 
  - Cypress for E2E testing with region/language parameterization
  - Jest for unit testing
  - BDD approach for business-readable test scenarios
  - Visual regression testing for UI validation

## Migration-Specific Considerations

### Statamic to Medusa.js Migration Challenges
- **Flat File to Database**: Moving from Statamic's flat file structure to Medusa's PostgreSQL database
- **Content Model Translation**: Mapping Statamic blueprints to Medusa entities and Strapi content types
- **E-commerce Functionality Expansion**: Extending Simple Commerce's basic functionality to Medusa's more robust offerings
- **Template Conversion**: Converting Antlers templates to React/Next.js components
- **Alpine.js to React**: Transitioning from Alpine.js to React for frontend interactivity
- **URL Structure Preservation**: Maintaining existing URL patterns for SEO purposes
- **Performance Expectations**: Meeting or exceeding current site performance metrics
- **Multi-domain Handling**: Migrating from single codebase with configuration to region-based architecture

### Simple Commerce to Medusa.js Specific Considerations
- **Product Structure**: Mapping Simple Commerce product structure to Medusa's product model
- **Inventory Management**: Enhancing inventory tracking capabilities
- **Order History**: Preserving customer order history across systems
- **Payment Gateway Migration**: Moving from Simple Commerce's payment integrations to Medusa's providers
- **Shopping Cart Data**: Transitioning cart implementation from session-based to API-based
- **Customer Accounts**: Migrating customer data with security considerations
- **Tax and Shipping Logic**: Transferring and enhancing region-specific tax and shipping rules

## Development Environment

### Local Development
- **Node.js**: v16+ for Medusa.js and Strapi
- **Package Manager**: yarn
- **Docker**: For containerized development
- **Database**: Local PostgreSQL instance

### Code Management
- **Version Control**: Git (GitHub)
- **Branching Strategy**: Gitflow or similar
- **Code Review**: Pull request workflow
- **Documentation**: Markdown in repository

### Quality Assurance
- **Linting**: ESLint
- **Formatting**: Prettier
- **Testing**: Jest for unit tests, Cypress for E2E
- **Region/Language Testing**: Parameterized test matrix covering all combinations

## Technical Constraints

### Performance Requirements
- **Page Load Time**: < 2 seconds (matching or improving current Statamic performance)
- **Time to Interactive**: < 3 seconds
- **API Response Time**: < 200ms
- **Performance across Regions**: Consistent experience in all domains

### SEO Requirements
- **URL Structure**: Maintain current patterns with language prefixes
- **Metadata**: Support for per-language metadata
- **Redirects**: Implement 301 redirects for all legacy URLs
- **Sitemap**: Generate region and language specific sitemaps
- **Preserve Rankings**: Maintain current search engine positioning during migration

### Compatibility
- **Browser Support**: Latest 2 versions of major browsers + IE11
- **Mobile Support**: Responsive design for all device sizes
- **Accessibility**: WCAG 2.1 AA compliance

### Security
- **Authentication**: Secure login and session management
- **Data Protection**: GDPR compliance
- **PCI Compliance**: For payment processing
- **Region-Specific Regulations**: Support for local requirements

## Dependencies

### External Services
- **Payment Gateways**: Mollie, iDEAL, Bancontact, etc.
- **Shipping Providers**: Region-specific carriers
- **Email Service**: Transactional email provider
- **Analytics**: Google Analytics or similar
- **Maps**: Google Maps or similar

### Third-Party Libraries
- **UI Components**: Potentially Chakra UI, Material UI, or similar
- **Form Handling**: React Hook Form
- **Data Fetching**: SWR or React Query
- **Internationalization**: i18next or similar
- **Testing Framework**: Cypress with Cucumber for BDD testing

## Migration Approach

### Phase 1: Assessment and Planning
- Inventory current site structure and functionality in Statamic
- Document existing Simple Commerce implementation and customizations
- Create inventory of all content collections, blueprints, and templates
- Document region and language requirements
- Map data models between systems (Statamic → Medusa/Strapi)
- Create migration scripts for products and content
- Plan URL structure and redirects
- Document all customizations that need special handling

### Phase 2: Setup and Configuration
- Set up Medusa.js with Region Module configuration
- Configure Strapi with multi-site and i18n capabilities
- Establish API communication between systems
- Set up database schemas with region and language fields
- Configure authentication and user migration approach
- Create test instances that mirror production environment
- Develop and test data migration scripts with sample data

### Phase 3: Data Migration
- Extract products from Simple Commerce
- Extract content from Statamic collections
- Transform data to match Medusa.js and Strapi schemas
- Migrate product catalog with region availability
- Transfer content with language variants
- Migrate user accounts and order history
- Import media assets
- Validate data integrity across regions
- Perform quality assurance on migrated data

### Phase 4: Frontend Development
- Develop Next.js application with region/language routing
- Convert Antlers templates to React components
- Migrate Alpine.js functionality to React hooks
- Implement shared components and layouts
- Create region and language selection interface
- Build product browsing and detail pages
- Implement cart and checkout flow with region-specific logic
- Add content pages with language-specific rendering
- Preserve SEO elements and URL structure

### Phase 5: Testing and Optimization
- Unit test core functionality
- Run parameterized E2E tests across all region/language combinations
- Perform visual regression testing
- Conduct load testing for each region
- Verify SEO elements and redirects
- Test payment flows for each region
- Compare performance metrics with original Statamic site
- Test all customer journeys that existed in the original site

### Phase 6: Deployment and Launch
- Set up production infrastructure
- Configure CDN and edge caching
- Implement monitoring and alerting
- Create deployment pipelines
- Plan cutover strategy with SEO preservation
- Create data migration rehearsal plan
- Launch with staged rollout by region
- Monitor post-launch metrics and SEO impact

## Multi-Region and Multi-Language Requirements

### Region-Specific Considerations
- **Domains**: 3 separate domains (nl.example.com, be.example.com, de.example.com)
- **Currencies**: EUR for all regions (but potentially different formatting)
- **Tax Rates**: Different VAT rates per country
- **Payment Methods**: Region-specific payment providers
- **Shipping**: Local shipping options and carriers
- **Legal**: Region-specific terms and compliance

### Language Considerations
- **Languages**: 2 languages (nl, en) with nl.example.com and be.example.com supporting both, de.example.com supporting en only
- **URL Structure**: Language prefixes in URLs
- **Content**: Localized content for all pages
- **Products**: Consistent product data with localized descriptions
- **Emails**: Templates in multiple languages
- **Search**: Language-specific search indexes

### Technology Configuration
- **Medusa Region Module**: Configuration for 3 separate regions
- **Strapi i18n Plugin**: Setup for 2 languages
- **Frontend Routing**: Support for region and language paths
- **Testing Framework**: Parameterized tests for all region/language combinations
- **SEO**: Language annotations and hreflang tags

## Known Technical Challenges

1. **Data Model Differences**: Mapping Statamic's flat-file structure to Medusa.js and Strapi database models
2. **Order History Migration**: Preserving customer purchase history across the migration
3. **URL Structure**: Maintaining SEO value through proper redirects
4. **Authentication**: Migrating user accounts and passwords securely
5. **Payment Integration**: Configuring region-specific payment providers
6. **Performance**: Ensuring consistent performance across all regions
7. **Testing Complexity**: Validating functionality across multiple region/language combinations
8. **Custom Functionality**: Recreating any custom Statamic/Simple Commerce functionality in the new stack
9. **Content Relations**: Preserving relationships between content items during migration
10. **Asset Migration**: Transferring and optimizing all media assets from Statamic to Strapi

## Statamic-Specific Migration Tasks

1. **Blueprint Analysis**: Document all Statamic blueprints and their field structures
2. **Collection Migration**: Map Statamic collections to appropriate data structures in target systems
3. **Asset Migration**: Transfer all assets from Statamic's asset container to cloud storage
4. **User Migration**: Securely migrate user accounts while preserving passwords
5. **Template Analysis**: Document all Antlers templates and their corresponding frontend components
6. **URL Mapping**: Create comprehensive mapping between Statamic URLs and new system routes
7. **Custom Tags/Modifiers**: Identify any custom Statamic tags or modifiers and plan replacements
8. **Simple Commerce Data Extraction**: Create specialized scripts for Simple Commerce data

## Simple Commerce Migration Specifics

1. **Product Data**: Extract and transform product data with all variants and options
2. **Customer Orders**: Export and transform order history with all line items and statuses
3. **Payment Methods**: Map and configure equivalent payment methods in Medusa.js
4. **Custom Checkout Fields**: Identify and recreate any custom checkout fields
5. **Tax and Shipping Rules**: Extract and recreate all tax and shipping configurations
6. **Discount Codes**: Migrate any existing discount codes and promotions
7. **Customer Profiles**: Securely transfer customer profile data
8. **Order Notifications**: Recreate order notification templates in the new system

## References and Resources

- [Medusa.js Documentation](https://docs.medusajs.com/)
- [Strapi Documentation](https://docs.strapi.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Solace Medusa Starter](https://github.com/rigby-sh/solace-medusa-starter)
- [Medusa Region Module Guide](https://docs.medusajs.com/modules/region)
- [Statamic Documentation](https://statamic.dev/)
- [Simple Commerce Documentation](https://simple-commerce.duncanmcclean.com/) 