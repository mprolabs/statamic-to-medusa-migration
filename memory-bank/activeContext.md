# Active Context: Statamic to Saleor Migration

## Current Focus
We are in the **Proof of Concept phase** of our migration project from Statamic CMS with Simple Commerce to Saleor. Key goals of this phase:

1. Validate Saleor's multi-region capabilities for supporting 3 separate domains/stores (Netherlands, Belgium, Germany)
2. Test multi-language support within Saleor (Dutch, German)
3. Verify Next.js integration with Saleor and establish authentication patterns
4. Explore data migration approaches from Statamic/Simple Commerce to Saleor

## Recent Changes
- Shifted technology focus from Medusa.js/Strapi combination to Saleor
- Created project structure with `api`, `cms`, and `storefront` directories
- Updated architecture diagrams to reflect Saleor-based approach
- Initiated proof of concept implementation of Saleor's Channel system for multi-region support
- Started exploring Saleor's translation features for multi-language support

## Next Steps
- Complete Saleor instance setup with multi-region configuration
- Test Saleor's Channel system with 3 distinct sales channels
- Configure Next.js storefront with language switching and region detection
- Develop initial data migration script to move product data from Statamic to Saleor
- Validate checkout flow with region-specific payment providers

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
- Empty project structure established but not yet populated
- Architecture diagrams updated for Saleor implementation
- Development environment under preparation

## Timeline Status
- **March 15, 2023**: Project initiated
- **April 1, 2023**: Initial technical assessment completed
- **April 15, 2023**: Technology stack finalized with shift to Saleor
- **Current**: Proof of concept implementation

## Key Stakeholders
- Product Owner: Sarah Johnson
- Technical Lead: Michael Rodriguez
- Frontend Developer: Alex Wang
- Backend Developer: Jamie Lee
- QA Lead: Taylor Simmons 