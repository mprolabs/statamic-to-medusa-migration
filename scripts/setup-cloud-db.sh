#!/bin/bash

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print the script header
echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE}  Bolen Ana Pro - Multi-Region E-commerce    ${NC}"
echo -e "${BLUE}  Medusa.js + Strapi + Next.js Setup Script  ${NC}"
echo -e "${BLUE}==============================================${NC}"
echo ""

# Check for prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js v18 or higher.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2)
NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d '.' -f 1)
if [ $NODE_MAJOR_VERSION -lt 18 ]; then
    echo -e "${RED}Node.js version is $NODE_VERSION. Please upgrade to v18 or higher.${NC}"
    exit 1
else
    echo -e "${GREEN}Node.js v$NODE_VERSION ✓${NC}"
fi

# Check npm version
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Please install npm v7 or higher.${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v | cut -d '.' -f 1)
if [ $NPM_VERSION -lt 7 ]; then
    echo -e "${RED}npm version is $NPM_VERSION. Please upgrade to v7 or higher.${NC}"
    exit 1
else
    echo -e "${GREEN}npm v$(npm -v) ✓${NC}"
fi

# Get database connection information
echo -e "\n${YELLOW}Database Configuration${NC}"
echo -e "Enter your PostgreSQL database connection details (NeonDB or other provider):"

read -p "Database Host (default: db.neon.tech): " DB_HOST
DB_HOST=${DB_HOST:-db.neon.tech}

read -p "Database Port (default: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -p "Database Name for Medusa (default: medusa): " MEDUSA_DB_NAME
MEDUSA_DB_NAME=${MEDUSA_DB_NAME:-medusa}

read -p "Database Name for Strapi (default: strapi): " STRAPI_DB_NAME
STRAPI_DB_NAME=${STRAPI_DB_NAME:-strapi}

read -p "Database Username: " DB_USER
if [ -z "$DB_USER" ]; then
    echo -e "${RED}Database username is required.${NC}"
    echo -e "${YELLOW}Using 'postgres' as default username.${NC}"
    DB_USER="postgres"
fi

read -sp "Database Password: " DB_PASSWORD
echo ""
if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}Database password is required.${NC}"
    echo -e "${YELLOW}Using 'password' as placeholder. You will need to update this later.${NC}"
    DB_PASSWORD="password"
fi

# Create directory structure
echo -e "\n${YELLOW}Creating project directory structure...${NC}"

mkdir -p medusa-backend
mkdir -p strapi-backend
mkdir -p storefront
mkdir -p scripts/migration/{extractors,transformers,validation,importers,utils}

echo -e "${GREEN}Directory structure created ✓${NC}"

# Create .env files for Medusa
echo -e "\n${YELLOW}Setting up Medusa.js environment...${NC}"

cat > medusa-backend/.env << EOF
JWT_SECRET=your_jwt_secret
COOKIE_SECRET=your_cookie_secret
DATABASE_URL=postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${MEDUSA_DB_NAME}?sslmode=require
DATABASE_TYPE=postgres
DATABASE_SSL=true

# Multi-region settings
STORE_CORS=http://localhost:8000,http://localhost:8001,http://localhost:8002
ADMIN_CORS=http://localhost:7000,http://localhost:7001

# Redis (for cart and session management)
REDIS_URL=

# Stripe test credentials (optional)
STRIPE_API_KEY=
STRIPE_WEBHOOK_SECRET=
EOF

echo -e "${GREEN}Medusa .env file created ✓${NC}"

# Create medusa-config.js file
cat > medusa-backend/medusa-config.js << EOF
const dotenv = require('dotenv')

let ENV_FILE_NAME = '';
switch (process.env.NODE_ENV) {
  case 'production':
    ENV_FILE_NAME = '.env.production';
    break;
  case 'staging':
    ENV_FILE_NAME = '.env.staging';
    break;
  case 'test':
    ENV_FILE_NAME = '.env.test';
    break;
  case 'development':
  default:
    ENV_FILE_NAME = '.env';
    break;
}

try {
  dotenv.config({ path: process.cwd() + '/' + ENV_FILE_NAME });
} catch (e) {
  console.error(e);
}

// CORS for multi-region support
const STORE_CORS = process.env.STORE_CORS?.split(",") || 
  ["http://localhost:8000", "http://localhost:8001", "http://localhost:8002"];

const ADMIN_CORS = process.env.ADMIN_CORS?.split(",") || 
  ["http://localhost:7000", "http://localhost:7001"];

// Multi-region database configuration
const DB_CONFIG = {
  type: process.env.DATABASE_TYPE || "postgres",
  url: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "true",
};

// Redis configuration (optional)
const REDIS_URL = process.env.REDIS_URL;

module.exports = {
  projectConfig: {
    redis_url: REDIS_URL,
    store_cors: STORE_CORS,
    admin_cors: ADMIN_CORS,
    database_url: process.env.DATABASE_URL,
    database_type: process.env.DATABASE_TYPE,
    database_ssl: process.env.DATABASE_SSL === "true",
  },
  plugins: [],
};
EOF

echo -e "${GREEN}Medusa config file created ✓${NC}"

# Create .env file for Strapi
echo -e "\n${YELLOW}Setting up Strapi environment...${NC}"

cat > strapi-backend/.env << EOF
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-key-1,your-app-key-2
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
TRANSFER_TOKEN_SALT=your-transfer-token-salt

# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=${DB_HOST}
DATABASE_PORT=${DB_PORT}
DATABASE_NAME=${STRAPI_DB_NAME}
DATABASE_USERNAME=${DB_USER}
DATABASE_PASSWORD=${DB_PASSWORD}
DATABASE_SSL=true

# Multi-region settings (used by custom plugin)
DEFAULT_LOCALE=nl-NL
SUPPORTED_LOCALES=nl-NL,nl-BE,fr-BE,de-DE
DEFAULT_REGION=nl
SUPPORTED_REGIONS=nl,be,de
EOF

echo -e "${GREEN}Strapi .env file created ✓${NC}"

# Ask about installing dependencies
echo -e "\n${YELLOW}Would you like to install dependencies? (y/n)${NC}"
read INSTALL_DEPS

if [[ $INSTALL_DEPS == "y" || $INSTALL_DEPS == "Y" ]]; then
    # Install Medusa dependencies
    echo -e "\n${YELLOW}Installing Medusa.js dependencies...${NC}"
    cd medusa-backend
    npm init -y
    npm install @medusajs/medusa-cli -g
    npx medusa new . --seed
    cd ..
    echo -e "${GREEN}Medusa.js dependencies installed ✓${NC}"

    # Install Strapi dependencies
    echo -e "\n${YELLOW}Installing Strapi dependencies...${NC}"
    cd strapi-backend
    npx create-strapi-app . --quickstart --no-run
    cd ..
    echo -e "${GREEN}Strapi dependencies installed ✓${NC}"

    # Install Storefront (Next.js) dependencies
    echo -e "\n${YELLOW}Installing Next.js storefront dependencies...${NC}"
    cd storefront
    npx create-next-app . --typescript --eslint --tailwind --app --src-dir --use-npm
    cd ..
    echo -e "${GREEN}Next.js storefront dependencies installed ✓${NC}"
else
    echo -e "${YELLOW}Skipping dependency installation. You'll need to install them manually.${NC}"
fi

# Create a README file for the migration scripts
echo -e "\n${YELLOW}Creating migration README...${NC}"

cat > scripts/migration/README.md << EOF
# Migration Scripts

This directory contains scripts for migrating from Statamic to Medusa.js and Strapi.

## Directory Structure

- \`extractors/\`: Scripts to extract data from Statamic
- \`transformers/\`: Transform data for Medusa.js and Strapi
- \`validation/\`: Validate transformed data
- \`importers/\`: Import data into Medusa.js and Strapi
- \`utils/\`: Helper utilities

## Usage

1. Configure the source and destination in \`config.js\`
2. Run the extraction script
3. Run the transformation script
4. Validate the transformed data
5. Import the data into Medusa.js and Strapi

Example:

\`\`\`bash
node run-migration.js --source=path/to/statamic --output=path/to/output --validate=true
\`\`\`
EOF

echo -e "${GREEN}Migration README created ✓${NC}"

# Setup complete
echo -e "\n${GREEN}===============================================${NC}"
echo -e "${GREEN}  Setup completed successfully!                 ${NC}"
echo -e "${GREEN}===============================================${NC}"
echo -e "${YELLOW}"
echo -e "Next steps:"
echo -e "1. Update .env files with your actual secrets"
echo -e "2. Start Medusa.js: cd medusa-backend && npm run dev"
echo -e "3. Start Strapi: cd strapi-backend && npm run develop"
echo -e "4. Start Next.js: cd storefront && npm run dev"
echo -e "${NC}" 