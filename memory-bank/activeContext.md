# Active Context: Nimara Integration for Storefront

## Current Focus
We are transitioning from our custom-built Next.js storefront to using the Nimara e-commerce framework as our foundation. Nimara is a production-ready, headless e-commerce storefront built with Next.js, TypeScript, and shadcn/ui that integrates well with Saleor.

## Key Decision: Nimara Framework Adoption
After evaluating our current implementation against the Nimara e-commerce framework (https://github.com/mirumee/nimara-ecommerce), we've decided to use Nimara as the foundation for our storefront due to:

1. **Mature Architecture**: Nimara provides a well-structured monorepo using Turborepo with proper separation of concerns
2. **Complete Feature Set**: Includes user authentication, payment processing, and other advanced features
3. **Modern UI Components**: Uses shadcn/ui for accessible, customizable components
4. **Saleor Integration**: Built specifically for Saleor, with appropriate GraphQL implementation
5. **Testing Framework**: Includes automated testing with Playwright

## Migration Strategy
We will implement "Option 1: Complete Migration to Nimara" with the following approach:

1. Rename our current `storefront` directory to `storefront-old`
2. Clone the Nimara repository into a new `storefront` directory
3. Port our custom multi-region and multi-language implementation to Nimara
4. Migrate our custom components and business logic
5. Ensure all current functionality continues to work

## Recent Changes
- Updated TaskMaster with new migration tasks
- Documented the decision to adopt Nimara as our foundation
- Created an implementation plan for the migration

## Next Steps
1. Set up the Nimara repository as our new storefront
2. Configure the environment variables and verify the build
3. Begin implementing our multi-region and multi-language support within the Nimara framework
4. Port our custom components to the new structure
5. Update documentation to reflect the new architecture

## Critical Considerations
- Preserving our multi-region implementation is a top priority
- Maintaining multi-language support is essential
- The migration should not disrupt the existing data modeling work
- GraphQL queries may need to be adapted to Nimara's structure
- The UI should maintain consistent branding while benefiting from shadcn/ui components

## Active Decisions
- **Technology Stack**: Using Saleor as the unified commerce and content platform (replacing earlier Medusa.js + Strapi approach)
- **Frontend Framework**: Next.js for storefront with App Router 
- **Multi-Region Approach**: Using Saleor's Channel system to handle multi-region requirements
- **Language Management**: Using Saleor's translation API for multi-language content
- **Authentication**: Implementing Saleor's JWT-based authentication in Next.js

## Technical Challenges
- Configuring multiple storefronts to work with a single Saleor instance
- Building Next.js routes that handle both language and region-specific content
- Translating Statamic's data model to Saleor's data structure
- Preserving SEO content during migration
- Maintaining consistent pricing across regions with different VAT rates

## Current Environment
- Project structure established in `saleor-project` with `core` and `storefront` directories
- Architecture diagrams updated for Saleor implementation
- Development environment under preparation
- Documentation site implemented with Jekyll/Just the Docs for project documentation

## Timeline Status
- **March 15, 2023**: Project initiated
- **April 1, 2023**: Initial technical assessment completed
- **April 15, 2023**: Technology stack finalized with shift to Saleor
- **April 25, 2023**: Updated architecture documentation and task definitions
- **Current**: Proof of concept implementation

## Key Stakeholders
- Product Owner: Sarah Johnson
- Technical Lead: Michael Rodriguez
- Frontend Developer: Alex Wang
- Backend Developer: Jamie Lee
- QA Lead: Taylor Simmons 