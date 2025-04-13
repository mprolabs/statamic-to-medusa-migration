# Statamic to Medusa.js Migration Scripts

## Overview

This directory contains scripts for migrating data from Statamic CMS with Simple Commerce to Medusa.js and Strapi CMS. The scripts handle data extraction, transformation, validation, and import with special handling for multi-region and multi-language support.

## Structure

- `extractors/` - Scripts for extracting data from Statamic CMS
- `transformers/` - Data transformation logic for Medusa.js and Strapi formats
- `mapping/` - Field mapping definitions and configuration
- `validation/` - Data validation tools and rules
- `import-medusa.js` - Main script for importing data to Medusa.js
- `import-strapi.js` - Main script for importing data to Strapi CMS

## Recent Updates

### Validation Improvements (2023-09-15)

We've significantly enhanced the validation process to address common issues when migrating to Medusa.js:

1. **Enhanced Product Variant Validation**
   - Improved validation for product variants, including SKU format, prices, and inventory
   - Auto-generation of default variants when missing
   - Specialized validation for variant price structures

2. **Price Format Handling**
   - Added robust price transformation to ensure Medusa's requirement for prices in cents
   - Detection and fixing of string prices, decimal values, and other price format issues
   - Region-specific currency code validation

3. **Validation Debugging Tools**
   - Added `validation/debug-price-data.js` for finding and fixing pricing issues
   - Improved error reporting with detailed context
   - Generated comprehensive validation reports

See the [Validation README](./validation/README.md) for detailed information about these improvements.

## Usage

### Data Extraction

```bash
# Extract products from Statamic
node extractors/extract-statamic.js --type=products --output=./data/export/products
```

### Data Transformation

```bash
# Transform products for Medusa.js and Strapi
node transformers/transform-data.js --source=./data/export/products --output=./data/transformed
```

### Data Validation

```bash
# Validate transformed data
node validation/validate-migration-data.js --input=./data/transformed/products.json --entity-type=product

# Debug and fix price format issues
node validation/debug-price-data.js --input=./data/transformed/products.json --fix --output=./data/fixed/products.json
```

### Data Import

```bash
# Import to Medusa.js and Strapi
node import-medusa.js --source=./data/fixed --entity=products
```

## Configuration

### Field Mappings

Field mappings define how Statamic fields map to Medusa.js and Strapi fields. Edit the mapping configuration in `mapping/field-mapping.js` and regenerate the mapping file:

```bash
node mapping/field-mapping.js
```

### Validation Rules

Validation rules are used to ensure data integrity before import. They are defined in `mapping/validation-rules.json` and are automatically generated from field mappings.

## Multi-Region Support

The scripts support multi-region data handling for the following regions:

- Netherlands (nl)
- Belgium (be)
- Germany (de)

Region-specific data is processed separately to ensure proper configuration in Medusa.js, such as:

- Region-specific pricing
- Tax rates
- Available shipping methods
- Payment providers

## Multi-Language Support

The scripts handle multi-language content for:

- Dutch (nl)
- German (de)
- French (fr)
- English (en)

Language-specific fields are processed and imported to Strapi CMS with proper localization support.

## Troubleshooting

### Common Issues

1. **Validation Failures**
   - Check validation reports for specific issues
   - Use the debug tools in `validation/` to identify and fix common problems
   - For price-specific issues, use `debug-price-data.js`

2. **Import Errors**
   - Verify Medusa.js and Strapi are running and accessible
   - Check API responses for detailed error messages
   - Ensure data meets Medusa.js and Strapi requirements

3. **Region and Language Issues**
   - Verify region and language configurations in both source and target systems
   - Check that required translations are available for all content

### Forcing Import

To import data despite validation issues (not recommended for production):

```bash
FORCE_IMPORT=true node import-medusa.js --source=./data/transformed --entity=products
```

## Additional Documentation

- [Validation Documentation](./validation/README.md)
- [Field Mapping Guide](./mapping/README.md)
- [Transformation Rules](./transformers/README.md) 