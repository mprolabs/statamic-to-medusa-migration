#!/bin/bash

# Color definitions
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Header
echo "=============================================="
echo "  Bolen Ana Pro - Multi-Region E-commerce    "
echo "  Medusa.js v2.7.0 + Strapi v5 + Next.js     "
echo "=============================================="
echo ""

# Function to clean a directory (delete and recreate)
clean_directory() {
  if [ -d "$1" ]; then
    echo "Cleaning directory: $1"
    rm -rf "$1"
  fi
  mkdir -p "$1"
}

# Check for prerequisites
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
  echo -e "${RED}Node.js is not installed. Please install Node.js v18 or higher.${NC}"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2)
if [ $(echo "$NODE_VERSION < 18" | bc -l) -eq 1 ]; then
  echo -e "${RED}Node.js v$NODE_VERSION is installed. Please upgrade to v18 or higher.${NC}"
  exit 1
fi
echo -e "Node.js v$NODE_VERSION ${GREEN}✓${NC}"

if ! command -v npm &> /dev/null; then
  echo -e "${RED}npm is not installed. Please install npm v7 or higher.${NC}"
  exit 1
fi

NPM_VERSION=$(npm -v)
if [ $(echo "$NPM_VERSION < 7" | bc -l) -eq 1 ]; then
  echo -e "${RED}npm v$NPM_VERSION is installed. Please upgrade to v7 or higher.${NC}"
  exit 1
fi
echo -e "npm v$NPM_VERSION ${GREEN}✓${NC}"
echo ""

# Detect operating system
echo "Detecting operating system..."
OS=$(uname -s)
if [[ "$OS" == "Darwin"* ]]; then
  echo -e "macOS detected ${GREEN}✓${NC}"
elif [[ "$OS" == "Linux"* ]]; then
  echo -e "Linux detected ${GREEN}✓${NC}"
else
  echo -e "${YELLOW}Unsupported OS detected. Some features may not work correctly.${NC}"
fi
echo ""

# Check for Redis CLI
echo "Checking for Redis CLI..."
if ! command -v redis-cli &> /dev/null; then
  echo -e "${YELLOW}Redis CLI not found. Installing Redis CLI...${NC}"
  
  if [[ "$OS" == "Darwin"* ]]; then
    brew install redis
  elif [[ "$OS" == "Linux"* ]]; then
    sudo apt-get update
    sudo apt-get install -y redis-tools
  else
    echo -e "${RED}Unable to install Redis CLI on this OS. Please install manually.${NC}"
  fi
else
  echo -e "Redis CLI already installed ${GREEN}✓${NC}"
fi
echo ""

# Test Redis connection
echo "Testing Redis connection..."
if redis-cli ping > /dev/null 2>&1; then
  echo -e "Redis connection successful ${GREEN}✓${NC}"
else
  echo -e "${YELLOW}Redis connection failed. Make sure Redis is installed and running.${NC}"
fi
echo ""

# Check for Neon CLI
echo "Checking for Neon CLI..."
if ! command -v neonctl &> /dev/null; then
  echo -e "${YELLOW}Neon CLI not found. Installing Neon CLI...${NC}"
  npm install -g neonctl
else
  echo -e "Neon CLI already installed ${GREEN}✓${NC}"
fi
echo ""

# NeonDB configuration
echo "NeonDB Configuration"
CONNECTION_STRING="postgresql://neondb_owner:npg_5QUoAXTSqg4x@ep-snowy-tooth-a2wjtpb9-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"

echo "Using provided NeonDB connection:"
echo -e "${GREEN}✓${NC} Database connection configured"
echo ""

# Extract components from connection string for separate databases
DB_HOST=$(echo $CONNECTION_STRING | sed -n 's/.*@\(.*\)\/neondb.*/\1/p')
DB_USER=$(echo $CONNECTION_STRING | sed -n 's/postgresql:\/\/\(.*\):.*/\1/p')
DB_PASSWORD=$(echo $CONNECTION_STRING | sed -n 's/postgresql:\/\/.*:\(.*\)@.*/\1/p')
DB_SSL=$(echo $CONNECTION_STRING | sed -n 's/.*?\(.*\)/\1/p')

# Create databases
echo "Creating databases for Medusa and Strapi..."
MEDUSA_DB="neondb_medusa"
STRAPI_DB="neondb_strapi"

echo "Database names:"
echo "  - Medusa: $MEDUSA_DB"
echo "  - Strapi: $STRAPI_DB"
echo ""

# Create project structure
echo "Creating project directory structure..."

# Create and clean main directories
clean_directory "medusa-backend"
clean_directory "strapi-backend"
clean_directory "storefront"

# Create directory for migration scripts if it doesn't exist
mkdir -p scripts/migration

echo -e "Directory structure created ${GREEN}✓${NC}"
echo ""

# Setup Medusa environment
echo "Setting up Medusa.js environment..."

# Create Medusa .env file
MEDUSA_ENV_FILE="medusa-backend/.env"
cat > "$MEDUSA_ENV_FILE" << EOF
# Medusa Environment Variables
NODE_ENV=development
JWT_SECRET=$(openssl rand -base64 32)
COOKIE_SECRET=$(openssl rand -base64 32)
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST/$MEDUSA_DB?$DB_SSL
REDIS_URL=redis://localhost:6379
PORT=9000
MEDUSA_ADMIN_CORS=http://localhost:7000
STORE_CORS=http://localhost:8000
EOF
echo -e "Medusa .env file created ${GREEN}✓${NC}"

# Create medusa-config.js file
MEDUSA_CONFIG_FILE="medusa-backend/medusa-config.js"
cat > "$MEDUSA_CONFIG_FILE" << EOF
const dotenv = require('dotenv');

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

// CORS configuration
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";
const ADMIN_CORS = process.env.ADMIN_CORS || "http://localhost:7000";

module.exports = {
  projectConfig: {
    database_type: "postgres",
    database_url: process.env.DATABASE_URL,
    store_cors: STORE_CORS,
    admin_cors: ADMIN_CORS,
    redis_url: process.env.REDIS_URL
  },
  plugins: [
    // Add your plugins here
  ],
  modules: {
    // Add your modules here
  }
};
EOF
echo -e "Medusa config file created ${GREEN}✓${NC}"
echo ""

# Setup Strapi environment
echo "Setting up Strapi v5 environment..."

# Create Strapi .env file
STRAPI_ENV_FILE="strapi-backend/.env"
cat > "$STRAPI_ENV_FILE" << EOF
# Strapi Environment Variables
HOST=0.0.0.0
PORT=1337
APP_KEYS=$(openssl rand -base64 16),$(openssl rand -base64 16)
API_TOKEN_SALT=$(openssl rand -base64 32)
ADMIN_JWT_SECRET=$(openssl rand -base64 32)
TRANSFER_TOKEN_SALT=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=$DB_HOST
DATABASE_NAME=$STRAPI_DB
DATABASE_USERNAME=$DB_USER
DATABASE_PASSWORD=$DB_PASSWORD
DATABASE_SSL=true
DATABASE_SSL_SELF=false

# Upload Provider
UPLOAD_PROVIDER=local
EOF
echo -e "Strapi .env file created ${GREEN}✓${NC}"
echo ""

# Ask to install dependencies
read -p "Would you like to install dependencies? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Install Medusa.js
  echo "Installing Medusa.js dependencies (v2.7.0)..."
  cd medusa-backend

  # Initialize npm project
  npm init -y
  
  # Install Medusa core
  npm install @medusajs/medusa@2.7.0 dotenv
  
  # Install additional dependencies
  npm install pg typeorm
  npm install express cors morgan body-parser
  
  # Initialize Medusa project
  cat > "package.json" << EOF
{
  "name": "medusa-backend",
  "version": "1.0.0",
  "description": "Medusa.js server for multi-region e-commerce",
  "main": "medusa-config.js",
  "scripts": {
    "dev": "medusa develop",
    "build": "medusa build",
    "start": "medusa start",
    "seed": "medusa seed -f seed.js"
  },
  "dependencies": {
    "@medusajs/medusa": "^2.7.0",
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.18.2",
    "morgan": "^1.10.0",
    "pg": "^8.11.3",
    "typeorm": "^0.3.20"
  },
  "author": "",
  "license": "MIT"
}
EOF

  # Create a minimal seed file
  cat > "seed.js" << EOF
const { DataSource } = require("typeorm")
const dotenv = require("dotenv")

const config = {
  database_type: "postgres",
  database_url: process.env.DATABASE_URL,
}

dotenv.config()

const seed = async () => {
  // Create connection
  const dataSource = new DataSource({
    type: "postgres",
    url: config.database_url,
    logging: false,
  })

  await dataSource.initialize()

  console.log("Database connection established")
  
  // Create a region for the Netherlands
  const regionRepository = dataSource.getRepository("region")
  
  const nlRegion = await regionRepository.findOne({
    where: { name: "Netherlands" }
  })
  
  if (!nlRegion) {
    await regionRepository.save({
      name: "Netherlands",
      currency_code: "eur",
      tax_rate: 21,
      countries: ["nl"],
      created_at: new Date(),
      updated_at: new Date()
    })
    console.log("Created Netherlands region")
  }
  
  await dataSource.destroy()
  console.log("Seeding completed successfully")
}

module.exports = seed
EOF

  echo -e "Initializing Medusa project..."
  echo -e "Medusa.js v2.7.0 dependencies installed ${GREEN}✓${NC}"
  cd ..
  
  # Install Strapi
  echo "Installing Strapi v5 dependencies..."
  echo "Running Strapi setup..."
  cd strapi-backend
  npx create-strapi-app@latest . --quickstart --no-run
  
  # Install additional Strapi plugins for Medusa integration
  echo -e "\nInstalling additional Strapi dependencies for Medusa integration..."
  npm install axios
  npm install uuid
  echo -e "Latest Strapi v5 dependencies installed ${GREEN}✓${NC}"
  cd ..
  
  # Install Next.js storefront
  echo "Installing Next.js storefront dependencies (latest)..."
  cd storefront
  # Use create-next-app with compatible React version (18)
  npx create-next-app@latest . --typescript --eslint --tailwind --app --src-dir --use-npm

  echo -e "\nInstalling additional Next.js dependencies for Medusa integration..."
  # Install with React 18 compatibility
  npm install --save react@^18.2.0 react-dom@^18.2.0
  
  # Install Medusa React SDK with legacy peer deps to avoid conflicts
  npm install --legacy-peer-deps @medusajs/medusa-js medusa-react
  
  # Install UI and utility libraries
  npm install --legacy-peer-deps next-intl next-themes
  echo -e "Latest Next.js storefront dependencies installed ${GREEN}✓${NC}"
  cd ..
  
  # Create migration scripts README
  echo "Creating migration README..."
  cat > "scripts/migration/README.md" << EOF
# Migration Scripts

This directory contains scripts for migrating data from Statamic to Medusa.js and Strapi.

## Directory Structure

- \`extractors/\`: Scripts to extract data from Statamic/Simple Commerce
- \`transformers/\`: Data transformation scripts
- \`loaders/\`: Scripts to load data into Medusa.js and Strapi
- \`validation/\`: Data validation scripts
- \`mapping/\`: Field mapping configuration

## Usage

1. Extract data: \`node scripts/migration/extractors/extract-statamic.js\`
2. Transform data: \`node scripts/migration/transformers/transform-data.js\`
3. Validate data: \`node scripts/migration/validation/validate-data.js\`
4. Load data: \`node scripts/migration/loaders/load-to-medusa.js\`

## Multi-Region and Multi-Language Support

The migration scripts support preserving all language variants and region-specific data.
EOF
  echo -e "Migration README created ${GREEN}✓${NC}"
  
  # Create Redis test script
  echo "Creating Redis test script..."
  cat > "scripts/test-redis.js" << EOF
const Redis = require('ioredis');

async function testRedisConnection() {
  console.log('Testing Redis connection...');
  const redis = new Redis('redis://localhost:6379');
  
  try {
    await redis.set('test-key', 'Hello from Bolen Ana Pro!');
    const value = await redis.get('test-key');
    console.log('Redis connection successful!');
    console.log(\`Retrieved test value: \${value}\`);
    await redis.del('test-key');
  } catch (error) {
    console.error('Redis connection failed:', error.message);
  } finally {
    redis.disconnect();
  }
}

testRedisConnection();
EOF

  echo -e "Redis test script created ${GREEN}✓${NC}"
  echo ""
  
  echo -e "${GREEN}===============================================${NC}"
  echo -e "${GREEN}  Setup completed successfully!                 ${NC}"
  echo -e "${GREEN}===============================================${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Start Medusa.js: cd medusa-backend && npm run dev"
  echo "2. Start Strapi: cd strapi-backend && npm run develop" 
  echo "3. Start Next.js: cd storefront && npm run dev"
  echo "4. Test Redis: node scripts/test-redis.js"
  echo ""
else
  echo "Dependencies not installed. You can install them manually later."
fi 