# Migration Scripts

This directory contains scripts for migrating data from Statamic to Medusa.js and Strapi.

## Directory Structure

- `extractors/`: Scripts to extract data from Statamic/Simple Commerce
- `transformers/`: Data transformation scripts
- `loaders/`: Scripts to load data into Medusa.js and Strapi
- `validation/`: Data validation scripts
- `mapping/`: Field mapping configuration

## Usage

1. Extract data: `node scripts/migration/extractors/extract-statamic.js`
2. Transform data: `node scripts/migration/transformers/transform-data.js`
3. Validate data: `node scripts/migration/validation/validate-data.js`
4. Load data: `node scripts/migration/loaders/load-to-medusa.js`

## Multi-Region and Multi-Language Support

The migration scripts support preserving all language variants and region-specific data.
