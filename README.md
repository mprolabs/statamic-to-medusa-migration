# Statamic to Saleor Migration

A comprehensive migration project for converting a Statamic CMS with Simple Commerce to Saleor with multi-region and multi-language support.

## Project Overview

This project focuses on migrating an existing e-commerce site from Statamic CMS to Saleor while preserving essential functionality and adding new capabilities:

- **Multi-region support**: Localized pricing, shipping, and tax calculations via Saleor Channels
- **Multi-language support**: Content translation across all supported regions
- **Headless architecture**: Separation of frontend and backend concerns

## Tech Stack

### Current (Source)
- **Statamic CMS**: Content management
- **Simple Commerce**: E-commerce functionality
- **Frontend**: Vue.js-based frontend integrated with Statamic

### Target (Destination)
- **Saleor**: Headless GraphQL commerce platform with built-in CMS capabilities
- **Frontend**: Next.js-based storefront

## Documentation

Comprehensive documentation is available in the `/docs` directory, which includes:

- Architecture diagrams and technical details
- Migration process guides
- Implementation guides for key features
- Testing strategies
- Deployment procedures

### Local Documentation Preview

To run the documentation site locally:

```bash
cd docs
bundle install
bundle exec jekyll serve
```

This will start a local server at http://localhost:4000 where you can preview changes.

## Project Structure

- `/docs`: Project documentation (GitHub Pages)
- `/src`: Source code for migration scripts and utilities
- `/memory-bank`: Project context and progress information
- `/tasks`: Structured task definitions and implementation plans
- `/core`: Saleor core instance
- `/storefront`: Next.js Saleor storefront

## Project Status

The project is currently in the proof of concept phase, with a focus on validating the technical feasibility of the migration approach. For detailed status information, see the [progress document](memory-bank/progress.md).

## Development

### Prerequisites

- Python 3.9+
- PostgreSQL
- Docker & Docker Compose
- Node.js v16+ (for storefront)

### Getting Started

1. Clone this repository
2. Set up Saleor core using Docker:
   ```bash
   cd core
   docker-compose up
   ```
3. Set up the storefront:
   ```bash
   cd storefront
   npm install
   npm run dev
   ```
4. Configure environment variables (see `.env.example`)
5. Review the [technical context](memory-bank/techContext.md) for implementation details

## Diagrams

Architecture diagrams are available in both source and rendered formats:

- Source: `/src/architecture/diagrams/*.puml`
- Rendered: `/docs/architecture/diagrams/` (PNG/SVG)

## Contributing

1. Review the current tasks in the `tasks` directory
2. Select an unassigned task or create a new one using the task management scripts
3. Create a feature branch with a descriptive name
4. Submit a pull request with your changes

## License

This project is proprietary and not open for public use or distribution. 