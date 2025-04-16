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

# Saleor Next.js Storefront

A modern, responsive e-commerce storefront built with Next.js and integrated with the Saleor GraphQL API.

## Features

- 🛍️ Complete shopping experience (product browsing, cart, checkout)
- 🌐 Multi-region and multi-language support
- 🔄 Server and client components for optimal performance
- 📱 Fully responsive design with Tailwind CSS
- 🛒 Client-side cart state management with Zustand
- 🔍 Product search and filtering
- 👤 User accounts and order history

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Apollo Client](https://www.apollographql.com/docs/react/) - GraphQL client
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [Headless UI](https://headlessui.dev/) - Unstyled, accessible UI components
- [Heroicons](https://heroicons.com/) - Beautiful SVG icons

## Getting Started

### Prerequisites

- Node.js 16.8+ and npm/yarn
- A Saleor API endpoint (you can use the demo endpoint or set up your own)

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/saleor-nextjs-storefront.git
cd saleor-nextjs-storefront
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Configure environment variables
Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_SALEOR_API_URL=https://your-saleor-api-endpoint/graphql/
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
/storefront
  /app                  # Next.js app router structure
    /about              # About page
    /cart               # Cart page
    /checkout           # Checkout flow
    /orders             # Order history
    /products           # Product listing and detail pages
    /layout.tsx         # Root layout with providers
  /components           # Reusable React components
    /CartDrawer.tsx     # Sliding cart panel
    /Header.tsx         # Navigation header
    /ProductCard.tsx    # Product display card
    /ProductDetail.tsx  # Product detail view
    /ProductList.tsx    # Product listing component
  /lib                  # Utility functions and modules
    /graphql            # GraphQL queries and Apollo client setup
  /store                # State management
    /cart.ts            # Cart state with Zustand
  /public               # Static assets
```

## Multi-Region and Multi-Language Support

The storefront supports multiple regions and languages through the Saleor API's channel and language settings. Users can switch between regions and languages using the selectors in the header.

## Features to Add

- [ ] User authentication
- [ ] Wish lists
- [ ] Product reviews
- [ ] Advanced search filtering
- [ ] Payment gateway integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Saleor](https://saleor.io/) for the GraphQL API
- [Next.js](https://nextjs.org/) documentation and examples
- [Tailwind CSS](https://tailwindcss.com/) for the styling system 