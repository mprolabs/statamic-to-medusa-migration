# Migration Documentation

This directory contains documentation related to the migration from Statamic and Simple Commerce to Medusa.js and Strapi CMS.

## Contents

- [Data Mapping Plan](./data-mapping-plan.md): Outlines the approach for mapping data from Statamic to Medusa.js/Strapi
- [Data Models](./data-models.md): Documents the data models used in the migration
- [Data Mapping Specification](./data-mapping-specification.md): Detailed field-level mapping between systems
- [ETL Workflow](./etl-workflow.md): Extract, Transform, Load process documentation
- [Database Schema Design](./database-schema-design.md): Target database schema documentation
- [Strapi Content Models](./strapi-content-models.md): Strapi CMS content type definitions
- [Medusa Data Models](./medusa-data-models.md): Medusa.js entity definitions
- [Statamic Data Inventory](./statamic-data-inventory.md): Inventory of existing Statamic data
- [Data Validation Guide](./data-validation-guide.md): Guide for validating migration data

## Migration Process

The migration from Statamic to Medusa.js and Strapi follows these key steps:

1. **Extract** data from Statamic and Simple Commerce
2. **Transform** data according to the mapping specifications
3. **Validate** data using the validation system
4. **Load** validated data into Medusa.js and Strapi
5. **Verify** the migrated data

## Validation System

The migration includes a comprehensive validation system to ensure data integrity. The validation system:

- Validates data against Medusa.js and Strapi schemas
- Verifies region-specific data for each target region
- Checks multi-language content in all required languages
- Ensures proper format for prices, slugs, emails, and other critical fields
- Generates detailed reports to identify issues

For details on the validation system, see the [Data Validation Guide](./data-validation-guide.md).

## Multi-Region Support

The migration supports three separate domains/regions:
- Netherlands
- Belgium
- Germany

Each region has specific requirements for:
- Currency
- Languages
- Tax rates
- Payment methods
- Shipping options

## Multi-Language Support

The migration preserves multi-language content for:
- Dutch (nl)
- German (de)
- French (fr)
- English (en)

Language requirements vary by region:
- Netherlands: Dutch, English
- Belgium: Dutch, French, English
- Germany: German, English

## Migration Tools

The migration utilizes several custom tools:
- Data extraction scripts
- Field mapping generators
- Data transformation utilities
- Validation scripts
- Import utilities

These tools are located in the `scripts/migration` directory of the project.

## Validation Tools

The data validation system consists of:
- `scripts/migration/validation/validate-migration-data.js`: Main validation script
- `scripts/migration/validation/validator.js`: Core validation class 
- `scripts/migration/validation/rules/`: Validation rules by entity type
- `scripts/migration/validation/formats/`: Format validators for data types

See the [Data Validation Guide](./data-validation-guide.md) for detailed usage instructions.

## Related Documentation

- [Architecture Documentation](../architecture/): Overall system architecture
- [Development Guide](../development/): Development setup and processes
- [Testing Strategy](../testing/): Testing approach for the migration 