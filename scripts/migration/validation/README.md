# Data Validation for Statamic to Medusa.js Migration

This directory contains scripts for validating and fixing data during the migration from Statamic CMS with Simple Commerce to Medusa.js.

## Key Components

### 1. Data Validator (`validator.js`)

A comprehensive validation system that checks migrated data against predefined rules. The validator ensures:

- Required fields are present
- Fields have correct formats (email, URL, numeric, etc.)
- Relationships between entities are valid
- Multi-language translations are properly structured
- Region-specific data meets requirements

### 2. Validation Rules (`../mapping/validation-rules.json`)

JSON schema that defines validation rules for different entity types:

- Required fields for each entity type
- Format specifications for fields
- Relationship mappings
- Multi-language requirements
- Region-specific validations

### 3. Validation Runner (`validate-migration-data.js`)

CLI tool that runs validation on transformed data files:

```bash
node validate-migration-data.js --input /path/to/data.json --entity-type product
```

Options:
- `--input`: Path to data file or directory
- `--entity-type`: Type of entity to validate (product, category, etc.)
- `--rules`: Optional custom validation rules file
- `--output`: Where to store validation report
- `--strict`: Enable stricter validation
- `--language`: Validate for specific language
- `--region`: Validate for specific region

### 4. Price Data Debugger (`debug-price-data.js`)

A specialized tool for finding and fixing price-related issues in product data:

```bash
# Analyze price data without making changes
node debug-price-data.js --input /path/to/products.json

# Fix price issues and save to new file
node debug-price-data.js --input /path/to/products.json --output /path/to/fixed-products.json --fix
```

This tool addresses the common price format issues that can cause validation or import failures:
- String prices that need conversion to numbers
- Decimal prices that need conversion to integer cents
- Missing price data
- Incorrect currency codes
- Products without variants

## Recent Improvements

Several enhancements have been made to improve the validation process:

1. **Product Variant Validation**
   - Added specific validation for product variants, including SKU format, prices, and inventory
   - Automatically generates default variants when missing
   - Validates price structure within variants

2. **Price Format Handling**
   - Added robust price transformation to ensure Medusa's requirement for prices in cents
   - Detects and fixes string prices, converting them to proper numeric format
   - Handles different regional currency codes

3. **Region Support**
   - Enhanced validation for region-specific data
   - Added proper handling of region-specific pricing
   - Validates currency codes match region expectations

4. **Error Reporting**
   - Improved error messages with detailed context
   - Added warnings for non-critical issues
   - Generated comprehensive validation reports

## Workflow Integration

The validation system is integrated into the import process in `import-medusa.js`:

1. Data is extracted from Statamic
2. Transformed for Medusa.js and Strapi
3. Validated using the validator
4. Validation reports are generated
5. If validation passes (or is forced), data is imported

You can bypass validation with the `--skip-validation` flag, but this is not recommended.

## Best Practices

1. Always run validation before importing data
2. Fix validation issues before attempting import
3. Use `debug-price-data.js` to fix price formatting issues
4. Start with specific entity types before bulk imports
5. Validate in non-strict mode first, then address warnings

## Troubleshooting Common Issues

### Missing or Invalid Variants

Products must have at least one variant with price information. Run the price debugger to automatically add default variants:

```bash
node debug-price-data.js --input products.json --output fixed-products.json --fix
```

### Price Format Issues

Medusa.js requires prices as integers in cents (1 EUR = 100 cents). The price debugging tool converts prices automatically:

```bash
node debug-price-data.js --input products.json --output fixed-products.json --fix
```

### Region-Specific Validation Failures

When validating for specific regions, ensure the validation rules file includes the expected region-specific requirements:

```bash
node validate-migration-data.js --input products.json --entity-type product --region nl
``` 