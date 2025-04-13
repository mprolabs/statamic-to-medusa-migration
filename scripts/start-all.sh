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
echo "  Starting all services                      "
echo "=============================================="
echo ""

# Check for prerequisites
if ! command -v npm &> /dev/null; then
  echo -e "${RED}npm is not installed. Please install npm v7 or higher.${NC}"
  exit 1
fi

if ! command -v npx &> /dev/null; then
  echo -e "${RED}npx is not installed. Please install npm v7 or higher.${NC}"
  exit 1
fi

# Ensure concurrently is installed
if ! npx --no-install concurrently --version &> /dev/null; then
  echo -e "${YELLOW}Concurrently not found in local dependencies. Installing...${NC}"
  npm install --save-dev concurrently
fi

# Define paths
MEDUSA_PATH="medusa-backend"
STRAPI_PATH="strapi-backend"
STOREFRONT_PATH="storefront"

# Check if directories exist
if [ ! -d "$MEDUSA_PATH" ]; then
  echo -e "${RED}Error: $MEDUSA_PATH directory not found.${NC}"
  echo -e "${YELLOW}Run the setup script first: ./scripts/setup-neon-db.sh${NC}"
  exit 1
fi

if [ ! -d "$STRAPI_PATH" ]; then
  echo -e "${RED}Error: $STRAPI_PATH directory not found.${NC}"
  echo -e "${YELLOW}Run the setup script first: ./scripts/setup-neon-db.sh${NC}"
  exit 1
fi

if [ ! -d "$STOREFRONT_PATH" ]; then
  echo -e "${RED}Error: $STOREFRONT_PATH directory not found.${NC}"
  echo -e "${YELLOW}Run the setup script first: ./scripts/setup-neon-db.sh${NC}"
  exit 1
fi

# Check if package.json exists in each directory
if [ ! -f "$MEDUSA_PATH/package.json" ]; then
  echo -e "${RED}Error: $MEDUSA_PATH/package.json not found.${NC}"
  echo -e "${YELLOW}Run the setup script first: ./scripts/setup-neon-db.sh${NC}"
  exit 1
fi

if [ ! -f "$STRAPI_PATH/package.json" ]; then
  echo -e "${RED}Error: $STRAPI_PATH/package.json not found.${NC}"
  echo -e "${YELLOW}Run the setup script first: ./scripts/setup-neon-db.sh${NC}"
  exit 1
fi

if [ ! -f "$STOREFRONT_PATH/package.json" ]; then
  echo -e "${RED}Error: $STOREFRONT_PATH/package.json not found.${NC}"
  echo -e "${YELLOW}Run the setup script first: ./scripts/setup-neon-db.sh${NC}"
  exit 1
fi

echo -e "${CYAN}Starting all services using concurrently...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services.${NC}"
echo ""

# Run all services using concurrently
npx --no-install concurrently \
  --names "MEDUSA,STRAPI,NEXT" \
  --prefix-colors "cyan,green,yellow" \
  --kill-others \
  "cd $MEDUSA_PATH && npm run dev" \
  "cd $STRAPI_PATH && npm run develop" \
  "cd $STOREFRONT_PATH && npm run dev"
