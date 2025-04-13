# Data Validation Guide for Migration

## Overview

This guide explains the data validation system used in the Statamic to Medusa.js migration process. The validation system ensures data integrity during migration by validating transformed data before importing it into Medusa.js and Strapi.

## Purpose

The validation system serves several key purposes:
- Ensure data conforms to the expected schemas for Medusa.js and Strapi
- Validate region-specific data for each target region (Netherlands, Belgium, Germany)
- Verify multi-language content in all required languages
- Ensure price data is correctly formatted for Medusa.js (as integers in cents)
- Validate relationships between entities
- Generate comprehensive reports of validation issues

## Validation System Architecture

The validation system consists of:
1. A command-line validation script (`validate-migration-data.js`)
2. A core validator class (`MigrationValidator`)
3. Entity-specific validation rules
4. Format validation utilities
5. Reporting mechanisms

## Using the Validation Script

### Command Syntax

```bash
node scripts/migration/validation/validate-migration-data.js [options]
```

### Required Options

- `--input, -i`: Path to the transformed data file or directory
- `--entity-type, -e`: Entity type to validate (product, category, etc.)

### Optional Options

- `--rules, -r`: Path to custom validation rules file
- `--output, -o`: Directory to store validation reports (default: `./output/validation-reports`)
- `--strict, -s`: Enable strict validation mode (default: false)
- `--language, -l`: Language to validate (e.g., nl, en, de)
- `--region`: Region to validate (e.g., netherlands, belgium, germany)

### Examples

Validate a single product file:
```bash
node scripts/migration/validation/validate-migration-data.js --input=output/transformed/products.json --entity-type=product
```

Validate all category files in a directory:
```bash
node scripts/migration/validation/validate-migration-data.js --input=output/transformed/categories/ --entity-type=category
```

Validate with strict mode and specific language/region:
```bash
node scripts/migration/validation/validate-migration-data.js --input=output/transformed/products.json --entity-type=product --strict --language=nl --region=netherlands
```

## Validation Rules

The validation system includes rules for various entity types:

### Product Validation Rules

- Required fields: id, title, description, slug, variants
- At least one variant must be defined
- Prices must be integers (in cents)
- Valid currency codes required
- Region-specific fields must be present when applicable
- Multi-language content must be available for all required languages

### Category Validation Rules

- Required fields: id, name, handle
- Valid parent category references
- Correct multi-language content structure

### Customer Validation Rules

- Valid email format
- Required fields: email, first_name, last_name
- Valid address formats when provided

### Order Validation Rules

- Valid line items with product references
- Correct totals and tax calculations
- Valid payment information

## Validation Process

1. The script processes the input file or directory
2. For each entity, it validates against the rules for its type
3. Errors and warnings are collected during validation
4. A validation report is generated in both JSON and text formats
5. If in strict mode, the script exits with an error code for any validation failures

## Validation Reports

The system generates two types of reports:

### JSON Report

Detailed machine-readable report with:
- Overall validation status
- Statistics (total, valid, invalid counts)
- Detailed errors with entity IDs, field names, and error messages
- Warnings for non-critical issues

### Text Report

Human-readable summary report with:
- Validation summary statistics
- List of errors grouped by entity
- Suggestions for fixing common issues

## Integration with Migration Workflow

The validation system is designed to fit into the broader migration workflow:

1. Extract data from Statamic/Simple Commerce
2. Transform data using field mapping rules
3. **Validate transformed data using this validation system**
4. Import validated data into Medusa.js and Strapi
5. Verify imported data

## Troubleshooting Common Validation Issues

### Price Format Issues

The most common issue is incorrectly formatted prices. Medusa.js requires prices to be in cents (integers), not decimal values. The validation system checks for this and reports any prices that are incorrectly formatted.

### Missing Variants

Medusa.js requires products to have at least one variant. The validation system checks that each product has at least one variant defined, and that each variant has the required fields.

### Currency Code Issues

Valid currency codes (e.g., EUR, USD) are required for all price fields. The validation system validates that currency codes are correctly formatted and are in the list of supported currencies.

### Region-Specific Data

For multi-region setups, certain fields may be required or have different validation rules depending on the region. The validation system checks region-specific requirements when the --region flag is specified.

## Performance Considerations

For large datasets, consider:
- Validating files by entity type rather than all at once
- Using a directory of smaller files instead of one large file
- Running validation in parallel for different entity types

## Conclusion

The validation system is a critical component of the migration process, ensuring data integrity and consistency before importing data into Medusa.js and Strapi. By following this guide, you can effectively validate your migration data and identify issues before they cause problems during import. 