# Active Context: Statamic to Saleor Migration

## Current Focus
We are in the **Proof of Concept phase** of our migration project from Statamic CMS with Simple Commerce to Saleor. Key goals of this phase:

1. Validate Saleor's multi-region capabilities for supporting 3 separate domains/stores (Netherlands, Belgium, Germany)
2. Test multi-language support within Saleor (Dutch, German)
3. Verify Next.js integration with Saleor and establish authentication patterns
4. Explore data migration approaches from Statamic/Simple Commerce to Saleor

## Recent Changes
- Created a comprehensive multi-language architecture diagram (PlantUML) to document the language implementation approach
- Updated the multi-region diagram to better reflect Saleor Channel-based implementation
- Enhanced the main architecture diagram to emphasize multi-region and multi-language components
- Updated architecture documentation to reference all three PlantUML diagrams
- Updated multi-region-language documentation to link to the new architecture diagrams
- Completed Task 1.1: "Create Saleor-based architecture diagram"
- Updated architecture diagram documentation to properly use Jekyll's site.baseurl format
- Updated TaskMaster tasks to align with Saleor-based migration project
- Created project structure with `saleor-project/core` and `saleor-project/storefront` directories
- Updated architecture diagrams to reflect Saleor-based approach
- Initiated proof of concept implementation of Saleor's Channel system for multi-region support
- Started exploring Saleor's translation features for multi-language support

## Next Steps
- Define the multi-region and multi-language implementation approach (Task 1.2)
- Determine the testing strategy for multi-region and multi-language features (Task 1.3)
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