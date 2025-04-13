#!/bin/bash

# Setup script for Medusa.js and Strapi with NeonDB
# This script automates the installation process for the multi-region migration project

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Helper functions
print_heading() {
  echo -e "\n${GREEN}=== $1 ===${NC}\n"
}

print_subheading() {
  echo -e "\n${BLUE}--- $1 ---${NC}\n"
}

print_step() {
  echo -e "${YELLOW}>>> $1${NC}"
}

print_error() {
  echo -e "${RED}ERROR: $1${NC}"
}

# Check requirements
print_heading "Checking Requirements"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  print_error "Node.js could not be found. Please install Node.js 18+ before continuing."
  exit 1
fi

# Check Node.js version (should be 18+ for best compatibility)
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
  print_error "Node.js version $NODE_VERSION detected. Medusa.js and Strapi work best with Node.js 18+. Please upgrade."
  exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  print_error "npm could not be found. Please install npm before continuing."
  exit 1
fi

print_step "Node.js v$(node -v) and npm v$(npm -v) detected."

# Configure project structure
print_heading "Configuring Project Structure"

# Create main directories if they don't exist
mkdir -p medusa-backend strapi-backend storefront

# Request NeonDB credentials
print_heading "NeonDB Configuration"
print_step "Please provide your NeonDB credentials for Medusa.js:"

read -p "PostgreSQL Host: " DB_HOST
read -p "PostgreSQL Port (default: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}
read -p "PostgreSQL Database for Medusa: " MEDUSA_DB_NAME
read -p "PostgreSQL Database for Strapi: " STRAPI_DB_NAME
read -p "PostgreSQL Username: " DB_USER
read -sp "PostgreSQL Password: " DB_PASS
echo

# Generate database connection strings
MEDUSA_DB_URL="postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${MEDUSA_DB_NAME}"
STRAPI_DB_HOST="${DB_HOST}"

# Set up Medusa.js
print_heading "Setting up Medusa.js Backend"

cd medusa-backend

# Copy .env template to .env and populate with credentials
if [ -f .env.template ]; then
  print_step "Creating .env file from template..."
  cp .env.template .env
  
  # Replace placeholders in .env
  sed -i '' "s|DATABASE_URL=postgres://\[user\]:\[password\]@\[hostname\]/\[database\]?.*|DATABASE_URL=${MEDUSA_DB_URL}|g" .env
else
  print_step "Creating .env file..."
  cat > .env << EOF
# Medusa Backend Environment Variables

# Database credentials (NeonDB)
DATABASE_TYPE=postgres
DATABASE_URL=${MEDUSA_DB_URL}
POSTGRES_SCHEMA=public

# JWT Secret (for authentication)
JWT_SECRET=$(openssl rand -hex 32)

# Cookie secret (for sessions)
COOKIE_SECRET=$(openssl rand -hex 32)

# Admin CORS
ADMIN_CORS=http://localhost:7000,http://localhost:7001

# Store CORS (multi-region domains)
STORE_CORS=http://localhost:8000,http://nl.localhost:8000,http://be.localhost:8000,http://de.localhost:8000

# Multi-region configuration
DEFAULT_REGION=nl
REGION_DOMAINS={"nl":"nl.example.com","be":"be.example.com","de":"de.example.com"}
EOF
fi

print_step "Installing Medusa.js CLI..."
npm install @medusajs/medusa-cli -g

print_step "Creating a new Medusa.js project..."
# Check if package.json exists, indicating project already initialized
if [ ! -f package.json ]; then
  # Initialize a new Medusa project without SQL prompts (we'll use our own .env)
  npx create-medusa-app@latest . --no-sql-config
else
  print_step "Medusa.js project already initialized. Skipping creation."
fi

print_step "Installing additional Medusa.js dependencies..."
npm install medusa-plugin-multi-regions medusa-plugin-strapi

cd ..

# Set up Strapi
print_heading "Setting up Strapi Backend"

cd strapi-backend

# Copy .env template to .env and populate with credentials
if [ -f .env.template ]; then
  print_step "Creating .env file from template..."
  cp .env.template .env
  
  # Replace placeholders in .env
  sed -i '' "s|DATABASE_HOST=\[hostname\]|DATABASE_HOST=${STRAPI_DB_HOST}|g" .env
  sed -i '' "s|DATABASE_NAME=\[database\]|DATABASE_NAME=${STRAPI_DB_NAME}|g" .env
  sed -i '' "s|DATABASE_USERNAME=\[user\]|DATABASE_USERNAME=${DB_USER}|g" .env
  sed -i '' "s|DATABASE_PASSWORD=\[password\]|DATABASE_PASSWORD=${DB_PASS}|g" .env
else
  print_step "Creating .env file..."
  cat > .env << EOF
# Strapi Backend Environment Variables

# Strapi application configuration
HOST=0.0.0.0
PORT=1337
APP_KEYS=$(openssl rand -hex 16),$(openssl rand -hex 16)
API_TOKEN_SALT=$(openssl rand -hex 16)
ADMIN_JWT_SECRET=$(openssl rand -hex 16)
JWT_SECRET=$(openssl rand -hex 16)

# Database configuration (NeonDB)
DATABASE_CLIENT=postgres
DATABASE_HOST=${STRAPI_DB_HOST}
DATABASE_PORT=${DB_PORT}
DATABASE_NAME=${STRAPI_DB_NAME}
DATABASE_USERNAME=${DB_USER}
DATABASE_PASSWORD=${DB_PASS}
DATABASE_SSL=true

# Multi-language configuration
DEFAULT_LOCALE=nl
ENABLED_LOCALES=nl,de,en
EOF
fi

# Check if package.json exists, indicating project already initialized
if [ ! -f package.json ]; then
  print_step "Creating a new Strapi project..."
  npx create-strapi-app@latest . --no-run --ts
else
  print_step "Strapi project already initialized. Skipping creation."
fi

print_step "Installing additional Strapi dependencies..."
npm install @strapi/plugin-i18n @strapi/plugin-users-permissions

cd ..

# Set up Next.js frontend
print_heading "Setting up Next.js Storefront"

cd storefront

# Check if package.json exists, indicating project already initialized
if [ ! -f package.json ]; then
  print_step "Creating a new Next.js project..."
  npx create-next-app@latest . --ts --tailwind --app --src-dir --no-eslint
else
  print_step "Next.js project already initialized. Skipping creation."
fi

print_step "Installing additional Next.js dependencies..."
npm install @medusajs/medusa-js medusa-react next-international

cd ..

print_heading "Setup Complete!"
echo -e "${GREEN}The development environment has been set up successfully!${NC}"
echo -e "${BLUE}To start the services:${NC}"
echo -e "1. ${YELLOW}Medusa.js:${NC} cd medusa-backend && npm run dev"
echo -e "2. ${YELLOW}Strapi:${NC} cd strapi-backend && npm run develop"
echo -e "3. ${YELLOW}Next.js Storefront:${NC} cd storefront && npm run dev"
echo -e "\n${BLUE}Next steps:${NC}"
echo -e "1. Configure regions in Medusa.js admin (http://localhost:7000)"
echo -e "2. Set up content models in Strapi (http://localhost:1337/admin)"
echo -e "3. Configure the Next.js storefront for multi-region support"
echo -e "\nRefer to setup-guide.md for detailed configuration instructions."

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}   Bolen Ana Pro - Multi-Region Migration Setup   ${NC}"
echo -e "${BLUE}======================================================${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js v18 or higher.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Node.js version is lower than v18. Please upgrade Node.js.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js v$(node -v) is installed${NC}"

# Check npm version
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Please install npm.${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v | cut -d '.' -f 1)
if [ "$NPM_VERSION" -lt 7 ]; then
    echo -e "${RED}npm version is lower than 7. Please upgrade npm.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm v$(npm -v) is installed${NC}"

# Check Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git is not installed. Please install Git.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Git is installed${NC}"

echo ""
echo -e "${YELLOW}All prerequisites are satisfied.${NC}"
echo ""

# Setup environment variables and database connection
echo -e "${YELLOW}Setting up database connection...${NC}"
echo ""
echo -e "${BLUE}This setup will guide you through configuring a cloud PostgreSQL database for both Medusa.js and Strapi.${NC}"
echo -e "${BLUE}We recommend using NeonDB (https://neon.tech/) as it offers a generous free tier and is easy to set up.${NC}"
echo ""

# Prompt for database connection details
read -p "Do you have a NeonDB account or other PostgreSQL provider ready? (y/n): " DB_READY
if [[ "$DB_READY" != "y" && "$DB_READY" != "Y" ]]; then
    echo ""
    echo -e "${YELLOW}Please follow these steps to set up a NeonDB account:${NC}"
    echo "1. Go to https://neon.tech/ and create a free account"
    echo "2. Create a new project"
    echo "3. Create a database called 'medusa' for Medusa.js"
    echo "4. Create a database called 'strapi' for Strapi"
    echo "5. Copy the connection strings for both databases"
    echo ""
    read -p "Press Enter when you're ready to continue..."
fi

# Database setup for Medusa.js
echo ""
echo -e "${YELLOW}Configuring Medusa.js database connection:${NC}"
read -p "Enter PostgreSQL connection string for Medusa.js (example: postgres://user:password@host:port/medusa): " MEDUSA_DB_URL

if [ -z "$MEDUSA_DB_URL" ]; then
    echo -e "${RED}No connection string provided for Medusa.js. Using placeholder values in .env file.${NC}"
    MEDUSA_DB_URL="postgres://user:password@host:port/medusa"
fi

# Database setup for Strapi
echo ""
echo -e "${YELLOW}Configuring Strapi database connection:${NC}"
read -p "Enter PostgreSQL connection string for Strapi (example: postgres://user:password@host:port/strapi): " STRAPI_DB_URL

if [ -z "$STRAPI_DB_URL" ]; then
    echo -e "${RED}No connection string provided for Strapi. Using placeholder values in .env file.${NC}"
    STRAPI_DB_URL="postgres://user:password@host:port/strapi"
fi

# Create directory structure if it doesn't exist
echo ""
echo -e "${YELLOW}Creating directory structure...${NC}"
mkdir -p medusa-backend
mkdir -p strapi-backend
mkdir -p storefront
mkdir -p scripts/migration/{extractors,transformers,validation,importers,utils}

# Create .env files
echo ""
echo -e "${YELLOW}Creating environment files...${NC}"

# Medusa .env
cat > medusa-backend/.env.template <<EOL
PORT=9000
DATABASE_URL=${MEDUSA_DB_URL}
DATABASE_TYPE=postgres
REDIS_URL=
JWT_SECRET=something-very-secret
COOKIE_SECRET=something-very-secret
STORE_CORS=http://localhost:8000,http://localhost:3000
ADMIN_CORS=http://localhost:7000,http://localhost:7001
EOL

cp medusa-backend/.env.template medusa-backend/.env
echo -e "${GREEN}✓ Created medusa-backend/.env${NC}"

# Strapi .env
cat > strapi-backend/.env.template <<EOL
HOST=0.0.0.0
PORT=1337
APP_KEYS=someKey1,someKey2
API_TOKEN_SALT=aLongSecretSalt
ADMIN_JWT_SECRET=anotherSecretForAdminJWT
JWT_SECRET=yetAnotherSecret
DATABASE_CLIENT=postgres
DATABASE_URL=${STRAPI_DB_URL}
DATABASE_HOST=host
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=user
DATABASE_PASSWORD=password
DATABASE_SSL=true
EOL

cp strapi-backend/.env.template strapi-backend/.env
echo -e "${GREEN}✓ Created strapi-backend/.env${NC}"

# Create basic structure for medusa-config.js
cat > medusa-backend/medusa-config.js <<EOL
const dotenv = require('dotenv')

let ENV_FILE_NAME = '.env'

try {
  dotenv.config({ path: process.cwd() + '/' + ENV_FILE_NAME })
} catch (e) {
  console.error(e)
}

// CORS configurations
const BACKEND_CORS = process.env.BACKEND_CORS || "http://localhost:9000,http://localhost:9001"
const ADMIN_CORS = process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001"
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000,http://localhost:3000"

// Database URL format: postgres://user:password@host:port/database
const DB_URL = process.env.DATABASE_URL

module.exports = {
  projectConfig: {
    redis_url: process.env.REDIS_URL,
    database_url: DB_URL,
    database_type: process.env.DATABASE_TYPE || "postgres",
    store_cors: STORE_CORS,
    admin_cors: ADMIN_CORS,
    database_extra: 
      process.env.DATABASE_SSL === "true"
        ? { ssl: { rejectUnauthorized: false } }
        : {},
  },
  plugins: [
    'medusa-fulfillment-manual',
    'medusa-payment-manual',
    {
      resolve: 'medusa-file-s3',
      options: {
        s3_url: process.env.S3_URL,
        bucket: process.env.S3_BUCKET,
        region: process.env.S3_REGION,
        access_key_id: process.env.S3_ACCESS_KEY_ID,
        secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
      },
    },
  ],
}
EOL

echo -e "${GREEN}✓ Created medusa-backend/medusa-config.js${NC}"

# Install dependencies
echo ""
echo -e "${YELLOW}Would you like to install the necessary dependencies now? (y/n): ${NC}"
read INSTALL_DEPS

if [[ "$INSTALL_DEPS" == "y" || "$INSTALL_DEPS" == "Y" ]]; then
    echo ""
    echo -e "${YELLOW}Installing Medusa.js dependencies...${NC}"
    pushd medusa-backend > /dev/null
    npm init -y
    npm install @medusajs/medusa-cli -g
    npx medusa new . --seed
    popd > /dev/null
    
    echo ""
    echo -e "${YELLOW}Installing Strapi dependencies...${NC}"
    pushd strapi-backend > /dev/null
    yarn create strapi-app . --quickstart --no-run
    popd > /dev/null
    
    echo ""
    echo -e "${YELLOW}Installing Next.js storefront dependencies...${NC}"
    pushd storefront > /dev/null
    npx create-next-app . --typescript --eslint --use-npm --src-dir --app
    popd > /dev/null
    
    echo ""
    echo -e "${YELLOW}Installing migration script dependencies...${NC}"
    pushd scripts/migration > /dev/null
    npm init -y
    npm install fs-extra lodash yargs axios chalk commander
    popd > /dev/null
    
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${YELLOW}Dependencies installation skipped. You will need to install them manually.${NC}"
fi

# Create README for scripts directory
cat > scripts/migration/README.md <<EOL
# Migration Scripts

This directory contains scripts for migrating data from Statamic to Medusa.js and Strapi.

## Directory Structure

- \`extractors/\`: Scripts for extracting data from Statamic
- \`transformers/\`: Scripts for transforming data to Medusa.js and Strapi format
- \`validation/\`: Rules and validators for ensuring data integrity
- \`importers/\`: Scripts for importing data into Medusa.js and Strapi
- \`utils/\`: Helper functions for the migration process

## Running a Migration

To run a complete migration:

\`\`\`bash
node run-migration.js --source=path/to/statamic --validate=true --import=true
\`\`\`

To run only the validation:

\`\`\`bash
node run-migration.js --source=path/to/statamic --validate=true
\`\`\`

To run only the import:

\`\`\`bash
node run-migration.js --source=path/to/statamic --import=true
\`\`\`

## Troubleshooting

Common validation errors and fixes:

- **Price format errors**: Ensure prices are in cents (integers) for Medusa.js.
- **Missing variants**: Each product must have at least one variant.
- **Invalid currency codes**: Currency codes must be in lowercase (e.g., "eur" not "EUR").
- **Multi-region validation**: Check region-specific data for completeness.
EOL

echo -e "${GREEN}✓ Created scripts/migration/README.md${NC}"

# Finalize setup
echo ""
echo -e "${GREEN}=====================================================${NC}"
echo -e "${GREEN}   Setup completed successfully!   ${NC}"
echo -e "${GREEN}=====================================================${NC}"
echo ""
echo -e "Next steps:"
echo -e "1. Review and update the ${BLUE}.env${NC} files with your actual credentials"
echo -e "2. Start the Medusa.js backend with: ${YELLOW}cd medusa-backend && npm run dev${NC}"
echo -e "3. Start the Strapi backend with: ${YELLOW}cd strapi-backend && npm run develop${NC}"
echo -e "4. Start the Next.js storefront with: ${YELLOW}cd storefront && npm run dev${NC}"
echo ""
echo -e "For more information, see the ${BLUE}README.md${NC} file."
echo "" 