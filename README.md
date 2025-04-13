# Bolen Ana Pro - Multi-Region E-commerce Migration

This project implements a migration framework for transitioning from a Statamic-based e-commerce site to a modern stack with Medusa.js, Strapi, and Next.js, supporting multiple regions and languages.

## Project Components

- **Migration Framework**: Tools for extracting, transforming, validating, and importing data
- **Medusa.js Backend**: Multi-region e-commerce platform handling products, orders, customers, and payments
- **Strapi Backend**: Headless CMS for managing content, translations, and region-specific information 
- **Next.js Storefront**: Multi-domain frontend with region detection and language switching

## Prerequisites

- Node.js v18 or higher
- npm version 7 or higher
- NeonDB account (or other PostgreSQL provider)
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/bolen-ana-pro.git
cd bolen-ana-pro
```

### 2. Run the Setup Script

The setup script will guide you through configuring your development environment:

```bash
chmod +x setup.sh
./setup.sh
```

This script will:
- Check prerequisites
- Create directory structure
- Set up environment files
- Install dependencies (optional)
- Configure database connections

### 3. Configure Database Connections

Create `.env` files in the following directories with your database credentials:

- `medusa-backend/.env`
- `strapi-backend/.env`

The setup script will create template files that you need to update with your actual database connection strings.

### 4. Start Services

#### Start Medusa.js Backend

```bash
cd medusa-backend
npm run dev
```

#### Start Strapi Backend

```bash
cd strapi-backend
npm run develop
```

#### Start Next.js Storefront

```bash
cd storefront
npm run dev
```

## Running Data Migration

Migration scripts are located in the `scripts/migration` directory.

### Prerequisites for Migration

1. Ensure Statamic data is accessible
2. Configure path to Statamic data in `scripts/migration/config.js`
3. Configure extraction and transformation settings

### Running Migration Scripts

```bash
cd scripts/migration
node run-migration.js --source=path/to/statamic --output=path/to/output --validate=true
```

## Multi-Region Support

This project supports multiple regions with the following specific settings:

### Netherlands (Primary Region)
- Currency: EUR
- Default language: Dutch (nl-NL)
- Tax rates: 21% standard, 9% reduced
- Payment providers: iDEAL, Credit Card, PayPal

### Belgium
- Currency: EUR
- Languages: Dutch (nl-BE), French (fr-BE)
- Tax rates: 21% standard, 6% reduced
- Payment providers: Bancontact, Credit Card, PayPal

### Germany
- Currency: EUR
- Language: German (de-DE)
- Tax rates: 19% standard, 7% reduced
- Payment providers: SOFORT, Credit Card, PayPal

## Migration Scripts Structure

```
scripts/migration/
├── extractors/            # Scripts to extract data from Statamic
├── transformers/          # Transform data for Medusa.js and Strapi
├── validation/            # Validate transformed data
├── importers/             # Import data into Medusa.js and Strapi
└── utils/                 # Helper utilities
```

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Verify that your database connection strings are correct
2. Ensure the database exists and is accessible
3. Check SSL requirements for your database provider
4. Verify database user permissions

### Common Migration Validation Errors

- **Price format errors**: Medusa.js requires prices in cents as integers
- **Missing variants**: Each product must have at least one variant
- **Invalid currency codes**: Medusa.js expects lowercase currency codes (e.g., "eur" not "EUR")
- **Multi-region validation**: Ensure all region-specific data is complete 

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 