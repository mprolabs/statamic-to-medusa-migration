---
layout: default
title: Home
description: Documentation for the Statamic to Saleor migration project with multi-site, multi-region, and multi-language capabilities
---

# Statamic to Saleor Migration

## Overview
This documentation covers the migration process from Statamic CMS with Simple Commerce to Saleor, focusing on implementing multi-site, multi-region, and multi-language capabilities. The project aims to create a more scalable and maintainable e-commerce solution while preserving all existing functionality.

## Key Features

### Multi-Region Support
- Support for 3 distinct domains/regions (Netherlands, Belgium, Germany)
- Region-specific pricing, tax rules, and shipping options
- Currency handling (EUR with regional variations)
- Region-specific payment providers

### Multi-Language Support
- Support for multiple languages across all storefronts
- Language-specific content management
- SEO optimization for all language variants
- Language detection and switching capabilities

### E-commerce Functionality
- Complete product catalog migration
- Order management and fulfillment
- Customer accounts and profiles
- Cart and checkout processes
- Payment provider integration

## Documentation Contents

- [Architecture](architecture/index.md)
  - [System Architecture](architecture/index.md)
  - [Architecture Diagrams](architecture/diagrams/index.md)
  - [API Documentation](architecture/api.md)
  - [Data Flow](architecture/data-flow.md)
- [Migration Process](migration/index.md)
  - [Migration Strategy](migration/strategy.md)
  - [Data Mapping](migration/data-mapping.md)
  - [Content Migration](migration/content-migration.md)
  - [Testing and Validation](migration/testing.md)
- [Multi-Region & Multi-Language](multi-region-language/index.md)
  - [Region Configuration](multi-region-language/region-configuration.md)
  - [Language Implementation](multi-region-language/language-implementation.md)
  - [Domain-Specific Setup](multi-region-language/domain-setup.md)
  - [SEO Considerations](multi-region-language/seo.md)
- [Development Guide](development/index.md)
  - [Setup Instructions](development/setup.md)
  - [Local Development](development/local-development.md)
  - [Extending Functionality](development/extending.md)
  - [Deployment Process](development/deployment.md)

## Project Status
The project is currently in the planning and initial implementation phase, with a focus on validating the technical approach for multi-region and multi-language support using Saleor's Channels feature.

## Getting Started
For new team members, start by reviewing the [Architecture](architecture/index.md) section to understand the system structure, then proceed to the relevant documentation based on your assigned tasks.

## Workflow Test
This line was added to test the GitHub workflow triggering.

---

*Last updated: June 25, 2024* 