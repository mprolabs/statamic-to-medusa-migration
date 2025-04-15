---
title: Home
layout: default
nav_order: 1
last_updated: April 15, 2024
---

# Statamic to Saleor Migration Documentation

This documentation outlines the migration process from Statamic CMS with Simple Commerce to Saleor headless commerce platform.

> **Note**: This repository was recently renamed to better reflect the migration target platform.

## Key Features

- **Multi-region support**: Three separate domains (Netherlands, Belgium, Germany)
- **Multi-language content**: Support for Dutch and German
- **Headless architecture**: Clear separation between front-end and back-end
- **Improved performance**: Leveraging modern technologies for better performance
- **Enhanced SEO**: Better support for region and language-specific SEO
- **Streamlined content management**: Integration with Strapi CMS for enhanced content capabilities

## Documentation Sections

### Architecture Documentation

- [System Architecture Overview]({{ site.baseurl }}/architecture/)
- [Architecture Diagram]({{ site.baseurl }}/architecture/architecture-diagram)
- [API Documentation]({{ site.baseurl }}/architecture/api)
- [Data Flow Documentation]({{ site.baseurl }}/architecture/data-flow)

### Migration Documentation

- [Migration Strategy]({{ site.baseurl }}/migration/)
- [Data Migration Guide]({{ site.baseurl }}/migration/data-migration)
- [Content Migration Guide]({{ site.baseurl }}/migration/content-migration)
- [User Migration Guide]({{ site.baseurl }}/migration/user-migration)

### Multi-Region and Multi-Language Support

- [Multi-Region Setup]({{ site.baseurl }}/multi-region-language/)
- [Multi-Language Implementation]({{ site.baseurl }}/multi-region-language/multi-language)
- [Currency and Tax Configuration]({{ site.baseurl }}/multi-region-language/currency-tax)
- [Domain-Specific Settings]({{ site.baseurl }}/multi-region-language/domain-settings)

### Development Documentation

- [Development Environment Setup]({{ site.baseurl }}/development/)
- [Local Development Guide]({{ site.baseurl }}/development/local-development)
- [Testing Strategy]({{ site.baseurl }}/development/testing)
- [Deployment Guide]({{ site.baseurl }}/development/deployment)

## Project Status

The project is currently in the **Proof of Concept** phase. We are validating Saleor's capabilities for our specific requirements, with a focus on multi-region and multi-language support.

## Contributing to the Documentation

To contribute to this documentation:

1. Clone the repository
2. Create a new branch for your changes
3. Make your changes to the relevant markdown files
4. Submit a pull request

## Contact

For questions or issues with the documentation, please contact the project team.

---

*Last updated: {{ page.last_updated }}* 