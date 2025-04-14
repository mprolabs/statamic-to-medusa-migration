---
layout: default
title: Setup Instructions
description: Step-by-step guide to set up the Saleor development environment for the migration project
parent: Development Guide
---

# Development Environment Setup

This guide provides step-by-step instructions for setting up the development environment for the Statamic to Saleor migration project, with a focus on multi-region and multi-language support.

## Prerequisites

Before starting, ensure you have the following installed:

- **Git**: Version control system
- **Node.js**: v16.x or later
- **npm**: v7.x or later
- **Python**: v3.9 or later (required for Saleor)
- **Docker**: For containerized development
- **Docker Compose**: For managing multi-container applications
- **PostgreSQL**: v12 or later (can be run via Docker)

## Step 1: Clone the Repositories

First, clone the project repositories:

```bash
# Main project repository
git clone https://github.com/your-organization/statamic-to-saleor-migration.git

# Change to project directory
cd statamic-to-saleor-migration

# Create directories for Saleor and storefront
mkdir -p saleor-platform saleor-storefront
```

## Step 2: Set Up Saleor Core

Saleor can be set up using Docker Compose for a quick start:

```bash
# Clone the Saleor platform repository
git clone https://github.com/saleor/saleor-platform.git saleor-platform

# Change to Saleor platform directory
cd saleor-platform

# Run Saleor using Docker Compose
docker-compose up
```

This will start Saleor and all its dependencies (PostgreSQL, Redis, etc.). The initial setup may take some time as it builds the containers and initializes the database.

Once running, Saleor will be available at:
- GraphQL API: http://localhost:8000/graphql/
- Dashboard: http://localhost:9000/

## Step 3: Set Up Next.js Storefront

Next, set up the Next.js storefront:

```bash
# Clone the Saleor storefront repository
git clone https://github.com/saleor/react-storefront.git saleor-storefront

# Change to storefront directory
cd saleor-storefront

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env.local
```

Edit the `.env.local` file to point to your local Saleor instance:

```
NEXT_PUBLIC_API_URI=http://localhost:8000/graphql/
```

Start the storefront development server:

```bash
npm run dev
```

The storefront will be available at http://localhost:3000/.

## Step 4: Configure Multi-Region Support

### Setting Up Channels in Saleor

1. Log in to the Saleor Dashboard (http://localhost:9000/).
2. Navigate to "Channels" in the sidebar.
3. Create three channels for the required regions:

#### Netherlands Channel
- Name: Netherlands
- Slug: netherlands
- Currency: EUR
- Default country: Netherlands

#### Belgium Channel
- Name: Belgium
- Slug: belgium
- Currency: EUR
- Default country: Belgium

#### Germany Channel
- Name: Germany
- Slug: germany
- Currency: EUR
- Default country: Germany

### Configure Products for Multiple Channels

1. Navigate to "Products" in the Saleor Dashboard.
2. Select a product to edit.
3. Go to "Channels" tab.
4. Enable the product in all channels, setting appropriate prices for each.

## Step 5: Configure Multi-Language Support

### Setting Up Languages in the Storefront

Edit the Next.js configuration to support multiple languages:

Create or edit the `next.config.js` file in the storefront directory:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    // List the languages you want to support
    locales: ['en', 'nl', 'de', 'fr'],
    // Default language
    defaultLocale: 'en',
    // Optional: domains configuration
    domains: [
      {
        domain: 'domain-nl.local',
        defaultLocale: 'nl',
      },
      {
        domain: 'domain-be.local',
        defaultLocale: 'nl',
        // Languages specific to this domain
        locales: ['nl', 'fr'],
      },
      {
        domain: 'domain-de.local',
        defaultLocale: 'de',
      },
    ],
  },
};

module.exports = nextConfig;
```

### Adding Translations in Saleor

1. Navigate to a product in the Saleor Dashboard.
2. Scroll to the "Translations" section.
3. Click "Add translation" and select a language.
4. Fill in the translated fields (name, description, etc.).
5. Save the translation.

Repeat for all products and categories that need translation.

## Step 6: Configure Local Domain Routing

To test multiple domains locally, update your hosts file:

### On Windows
Edit `C:\Windows\System32\drivers\etc\hosts`:

```
127.0.0.1 domain-nl.local
127.0.0.1 domain-be.local
127.0.0.1 domain-de.local
```

### On macOS/Linux
Edit `/etc/hosts`:

```
127.0.0.1 domain-nl.local
127.0.0.1 domain-be.local
127.0.0.1 domain-de.local
```

## Step 7: Run Multiple Storefront Instances (Optional)

For more realistic testing, you can run multiple instances of the storefront for each domain:

```bash
# Netherlands storefront
PORT=3001 NEXT_PUBLIC_API_URI=http://localhost:8000/graphql/ NEXT_PUBLIC_CHANNEL=netherlands npm run dev

# Belgium storefront
PORT=3002 NEXT_PUBLIC_API_URI=http://localhost:8000/graphql/ NEXT_PUBLIC_CHANNEL=belgium npm run dev

# Germany storefront
PORT=3003 NEXT_PUBLIC_API_URI=http://localhost:8000/graphql/ NEXT_PUBLIC_CHANNEL=germany npm run dev
```

Then access each storefront at:
- Netherlands: http://domain-nl.local:3001
- Belgium: http://domain-be.local:3002
- Germany: http://domain-de.local:3003

## Step 8: Set Up Data Migration Tools

Clone the data migration tools repository:

```bash
git clone https://github.com/your-organization/saleor-migration-tools.git
cd saleor-migration-tools
npm install
```

Configure the migration tools by editing the `.env` file:

```
# Source Statamic configuration
STATAMIC_DATABASE_URL=mysql://user:password@localhost:3306/statamic_db
STATAMIC_FILES_PATH=/path/to/statamic/public_html

# Target Saleor configuration
SALEOR_API_URL=http://localhost:8000/graphql/
SALEOR_ACCESS_TOKEN=your-saleor-access-token

# Channel mappings
CHANNEL_MAPPINGS='{"nl":"netherlands","be":"belgium","de":"germany"}'

# Language mappings
LANGUAGE_MAPPINGS='{"nl":"NL","fr":"FR","de":"DE","en":"EN"}'
```

## Step 9: Initialize the Migration Project

Initialize the migration project structure:

```bash
# Create directory structure
mkdir -p migration/{extraction,transformation,loading,validation}

# Create configuration files
touch migration/config.js
touch migration/channel-mappings.js
touch migration/language-mappings.js
```

## Step 10: Configure Development Tools

Set up development tools like ESLint and Prettier:

```bash
# Install development dependencies
npm install --save-dev eslint prettier eslint-config-prettier

# Initialize ESLint configuration
npx eslint --init
```

Create a `.prettierrc` file:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

## Troubleshooting

### CORS Issues
If you encounter CORS issues, ensure the Saleor API is configured to accept requests from your storefront domains. Add the following to your Saleor configuration:

```python
ALLOWED_HOSTS = ["localhost", "domain-nl.local", "domain-be.local", "domain-de.local"]
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://domain-nl.local:3001",
    "http://domain-be.local:3002",
    "http://domain-de.local:3003",
]
```

### Database Connection Issues
If you have issues connecting to PostgreSQL, check the database configuration in Saleor's settings:

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "saleor",
        "USER": "saleor",
        "PASSWORD": "saleor",
        "HOST": "localhost",
        "PORT": "5432",
    }
}
```

## Next Steps

After setting up the development environment:

1. Start by exploring the Saleor API and Dashboard
2. Familiarize yourself with the channel-based multi-region capabilities
3. Test the language switching functionality
4. Begin implementing the data migration process
5. Proceed to developing the region-specific frontend components

See [Local Development](local-development.md) for more details on working with the development environment. 