#!/usr/bin/env node

/**
 * Statamic to Medusa.js/Strapi Field Mapping
 * 
 * This script defines the field-level mapping between Statamic (with Simple Commerce)
 * and the destination systems (Medusa.js and Strapi) for the migration project.
 * 
 * The mapping includes:
 * - Direct field mappings
 * - Transformation rules
 * - Multi-language content handling
 * - Region-specific data transformations
 * - Validation rules
 * 
 * Usage:
 * 1. Run with: node field-mapping.js
 * 2. Output will be saved as mapping-document.md in the mapping directory
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const OUTPUT_DIR = path.join(__dirname, '../mapping');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'mapping-document.md');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper function to log with timestamp
function log(message) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${timestamp}] ${message}`);
}

/**
 * Generate the field mapping document
 */
function generateFieldMapping() {
  log('Generating field mapping document...');
  
  // Define the mapping document content
  const mappingDoc = `# Field-Level Mapping: Statamic/Simple Commerce to Medusa.js/Strapi

## Overview

This document defines the comprehensive field-level mapping strategy for migrating data from Statamic CMS with Simple Commerce to Medusa.js and Strapi CMS. The mapping is designed to support multi-region and multi-language requirements across three domains (Netherlands, Belgium, Germany) with Dutch and German language support.

## Product Mapping

### Statamic Product → Medusa.js Product + Strapi Product Content

| Statamic Field | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------------|-------------------|----------------|-------|
| title | Medusa.js | title | Direct mapping | |
| _slug | Medusa.js | handle | Direct mapping | Used for URL generation |
| description | Medusa.js | description | Direct mapping | |
| price | Medusa.js | variants[0].prices[0].amount | Multiply by 100 | Convert to cents for Medusa |
| images | Medusa.js | images | URL transformation | Upload to Medusa media library |
| stock | Medusa.js | variants[0].inventory_quantity | Direct mapping | |
| is_shippable | Medusa.js | metadata.is_shippable | Direct mapping | Stored in metadata |
| product_type | Medusa.js | type.value | Direct mapping | |
| _id | Medusa.js | metadata.original_id | Direct mapping | For reference |
| product_categories | Medusa.js | categories | ID mapping | Map to Medusa category IDs |
| variants | Medusa.js | variants | Object transformation | Transform to Medusa variant structure |
| variants[].price | Medusa.js | variants[].prices[0].amount | Multiply by 100 | Convert to cents |
| variants[].sku | Medusa.js | variants[].sku | Direct mapping | |
| variants[].stock | Medusa.js | variants[].inventory_quantity | Direct mapping | |
| extended_description | Strapi | productContent.extended_description | Direct mapping | Rich text content |
| specifications | Strapi | productContent.specifications | Direct mapping | Product specifications |
| meta_title | Strapi | productContent.seo.title | Direct mapping | SEO metadata |
| meta_description | Strapi | productContent.seo.description | Direct mapping | SEO metadata |
| related_products | Strapi | productContent.related_content | ID mapping | Related product references |

### Multi-Language Product Fields

| Statamic Field | Language Identifier | Destination System | Destination Field | Transformation |
|----------------|---------------------|-------------------|-------------------|----------------|
| title | .nl.md/.de.md | Medusa.js | metadata.translations.{locale}.title | Direct mapping |
| description | .nl.md/.de.md | Medusa.js | metadata.translations.{locale}.description | Direct mapping |
| extended_description | .nl.md/.de.md | Strapi | productContent.localizations.{locale}.extended_description | i18n plugin format |
| meta_title | .nl.md/.de.md | Strapi | productContent.localizations.{locale}.seo.title | i18n plugin format |
| meta_description | .nl.md/.de.md | Strapi | productContent.localizations.{locale}.seo.description | i18n plugin format |

### Region-Specific Product Data

| Statamic Field | Region Identifier | Destination System | Destination Field | Transformation |
|----------------|-------------------|-------------------|-------------------|----------------|
| price | region_nl | Medusa.js | prices (Money Amount) | Create region-specific price |
| price | region_be | Medusa.js | prices (Money Amount) | Create region-specific price |
| price | region_de | Medusa.js | prices (Money Amount) | Create region-specific price |
| is_available | region_nl | Medusa.js | sales_channels | Channel assignment |
| is_available | region_be | Medusa.js | sales_channels | Channel assignment |
| is_available | region_de | Medusa.js | sales_channels | Channel assignment |
| region_specific_content | region_nl | Strapi | regionContent.content_mappings | Region-specific data |
| region_specific_content | region_be | Strapi | regionContent.content_mappings | Region-specific data |
| region_specific_content | region_de | Strapi | regionContent.content_mappings | Region-specific data |

## Collection Mapping

### Statamic Category → Medusa.js Category

| Statamic Field | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------------|-------------------|----------------|-------|
| title | Medusa.js | name | Direct mapping | |
| _slug | Medusa.js | handle | Direct mapping | Used for URL generation |
| description | Medusa.js | description | Direct mapping | |
| _id | Medusa.js | metadata.original_id | Direct mapping | For reference |
| parent | Medusa.js | parent_category_id | ID mapping | Map to parent category ID |

### Multi-Language Category Fields

| Statamic Field | Language Identifier | Destination System | Destination Field | Transformation |
|----------------|---------------------|-------------------|-------------------|----------------|
| title | .nl.yaml/.de.yaml | Medusa.js | metadata.translations.{locale}.name | Direct mapping |
| description | .nl.yaml/.de.yaml | Medusa.js | metadata.translations.{locale}.description | Direct mapping |

## Customer Mapping

### Statamic Customer → Medusa.js Customer

| Statamic Field | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------------|-------------------|----------------|-------|
| email | Medusa.js | email | Direct mapping | Primary identifier |
| first_name | Medusa.js | first_name | Direct mapping | |
| last_name | Medusa.js | last_name | Direct mapping | |
| password | Medusa.js | password_hash | Rehash | Security transformation |
| phone | Medusa.js | phone | Direct mapping | |
| addresses | Medusa.js | addresses | Object transformation | Transform to Medusa address format |
| _id | Medusa.js | metadata.original_id | Direct mapping | For reference |
| region_preferences | Medusa.js | metadata.region_preferences | Direct mapping | Customer region preferences |

## Order Mapping

### Statamic Order → Medusa.js Order

| Statamic Field | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------------|-------------------|----------------|-------|
| order_id | Medusa.js | display_id | Direct mapping | |
| status | Medusa.js | status | Status mapping | Map to Medusa status values |
| customer | Medusa.js | customer_id | ID mapping | Map to Medusa customer ID |
| billing_address | Medusa.js | billing_address | Object transformation | Transform to Medusa address format |
| shipping_address | Medusa.js | shipping_address | Object transformation | Transform to Medusa address format |
| region | Medusa.js | region_id | ID mapping | Map to Medusa region ID |
| currency | Medusa.js | currency_code | Lowercase | Ensure format compliance |
| tax_rate | Medusa.js | tax_rate | Division by 100 | Convert from percentage to decimal |
| items | Medusa.js | items | Object transformation | Transform to Medusa line item format |
| payment | Medusa.js | payments | Object transformation | Transform to Medusa payment format |
| shipping_method | Medusa.js | shipping_methods | Object transformation | Transform to Medusa shipping method |
| _id | Medusa.js | metadata.original_id | Direct mapping | For reference |

## Content Mapping

### Statamic Page → Strapi Page

| Statamic Field | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------------|-------------------|----------------|-------|
| title | Strapi | title | Direct mapping | |
| _slug | Strapi | slug | Direct mapping | Used for URL generation |
| _content | Strapi | content | Markdown to rich text | Convert format if needed |
| template | Strapi | layout | Direct mapping | |
| meta_title | Strapi | seo.title | Direct mapping | SEO metadata |
| meta_description | Strapi | seo.description | Direct mapping | SEO metadata |
| meta_image | Strapi | seo.image | URL transformation | Upload to Strapi media library |
| _id | Strapi | metadata.original_id | Direct mapping | For reference |
| published | Strapi | published_at | Date transformation | Set publication date |

### Multi-Language Content Fields

| Statamic Field | Language Identifier | Destination System | Destination Field | Transformation |
|----------------|---------------------|-------------------|-------------------|----------------|
| title | .nl.md/.de.md | Strapi | localizations.{locale}.title | i18n plugin format |
| _content | .nl.md/.de.md | Strapi | localizations.{locale}.content | i18n plugin format |
| meta_title | .nl.md/.de.md | Strapi | localizations.{locale}.seo.title | i18n plugin format |
| meta_description | .nl.md/.de.md | Strapi | localizations.{locale}.seo.description | i18n plugin format |

### Region-Specific Content

| Statamic Field | Region Identifier | Destination System | Destination Field | Transformation |
|----------------|-------------------|-------------------|-------------------|----------------|
| region_visibility | region_nl | Strapi | regionContent.active | Boolean transformation |
| region_visibility | region_be | Strapi | regionContent.active | Boolean transformation |
| region_visibility | region_de | Strapi | regionContent.active | Boolean transformation |
| region_specific_content | region_nl | Strapi | regionContent.content_mappings | Region-specific data |
| region_specific_content | region_be | Strapi | regionContent.content_mappings | Region-specific data |
| region_specific_content | region_de | Strapi | regionContent.content_mappings | Region-specific data |

## Asset Mapping

### Statamic Asset → Strapi Media Library & Medusa.js

| Statamic Field | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------------|-------------------|----------------|-------|
| path | Strapi | url | File upload & URL | Upload file and store URL |
| alt | Strapi | alternativeText | Direct mapping | |
| caption | Strapi | caption | Direct mapping | |
| filename | Strapi | name | Direct mapping | |
| extension | Strapi | ext | Direct mapping | With dot prefix |
| size | Strapi | size | Direct mapping | In bytes |
| width | Strapi | width | Direct mapping | For images |
| height | Strapi | height | Direct mapping | For images |
| mime_type | Strapi | mime | Direct mapping | |
| metadata | Strapi | metadata | Direct mapping | |
| _id | Strapi | metadata.original_id | Direct mapping | For reference |

### Product Images to Medusa.js

| Statamic Field | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------------|-------------------|----------------|-------|
| path | Medusa.js | images[].url | File upload & URL | Store in Medusa product images |

## Navigation Mapping

### Statamic Navigation → Strapi Navigation

| Statamic Field | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------------|-------------------|----------------|-------|
| title | Strapi | title | Direct mapping | |
| items | Strapi | items | Object transformation | Transform to Strapi navigation items |
| items[].title | Strapi | items[].title | Direct mapping | |
| items[].url | Strapi | items[].url | Direct mapping | |
| items[].target | Strapi | items[].target | Direct mapping | |
| location | Strapi | location | Direct mapping | Navigation position |
| _id | Strapi | metadata.original_id | Direct mapping | For reference |

## Region Settings Mapping

### Statamic Region Settings → Medusa.js Regions & Sales Channels

| Statamic Field | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------------|-------------------|----------------|-------|
| name | Medusa.js | name | Direct mapping | Region name |
| code | Medusa.js | countries | Array transformation | Convert to country codes array |
| currency | Medusa.js | currency_code | Lowercase | Ensure format compliance |
| taxRate | Medusa.js | tax_rate | Division by 100 | Convert from percentage to decimal |
| domain | Medusa.js | metadata.domain | Direct mapping | Store domain in metadata |
| payment_providers | Medusa.js | payment_providers | Array transformation | Map to Medusa provider IDs |
| fulfillment_providers | Medusa.js | fulfillment_providers | Array transformation | Map to Medusa provider IDs |
| name | Medusa.js | sales_channels[].name | Append "Store" | Create "{name} Store" |

## Multi-Region and Multi-Language Validation Rules

1. **Product Availability**
   - Validate that products with region_nl=true are assigned to NL sales channel
   - Validate that products with region_be=true are assigned to BE sales channel
   - Validate that products with region_de=true are assigned to DE sales channel

2. **Price Consistency**
   - Ensure all products have prices for all active regions
   - Validate currency consistency (EUR for all regions)

3. **Translation Completeness**
   - Verify all products have translations for all supported languages
   - Verify all pages have translations for all supported languages
   - Check for missing translations and apply fallback rules

4. **Region-Specific Configuration**
   - Validate payment providers per region
   - Validate shipping options per region
   - Validate tax rules per region

## Data Enrichment Requirements

1. **Product Enrichment**
   - Generate SKUs for products without them using "{slug}-{variant-title}" pattern
   - Create default variant when variants are not specified
   - Set default inventory values when stock is not specified

2. **SEO Enrichment**
   - Generate meta titles from product/page titles if not specified
   - Generate meta descriptions from content excerpts if not specified

3. **Region Enrichment**
   - Assign all products to appropriate sales channels based on region settings
   - Create region-specific prices for all products

4. **Language Enrichment**
   - Apply language fallbacks when translations are missing
   - Store original language as default when translations are partial

## Migration Execution Plan

1. **Extraction Phase**
   - Extract all Statamic content using exporters
   - Preserve relationships between entities
   - Maintain multi-language variants
   - Extract region-specific configurations

2. **Transformation Phase**
   - Apply field mappings defined in this document
   - Perform data enrichment
   - Validate data integrity
   - Generate region and language variants

3. **Loading Phase**
   - Load core commerce data into Medusa.js
   - Load content data into Strapi CMS
   - Establish relationships between systems
   - Validate cross-system integrity

## Post-Migration Verification

1. **Data Integrity**
   - Verify all records were migrated
   - Check relationship integrity
   - Validate multi-language content
   - Test region-specific configurations

2. **Functional Testing**
   - Test product visibility per region
   - Test pricing per region
   - Test language switching
   - Test checkout flows per region

This document serves as the definitive reference for field-level mapping during the migration process. It ensures consistency, completeness, and accuracy in transferring data from Statamic with Simple Commerce to Medusa.js and Strapi CMS.`;

  // Write the mapping document to file
  fs.writeFileSync(OUTPUT_FILE, mappingDoc);
  
  log(`Field mapping document generated: ${OUTPUT_FILE}`);
  return mappingDoc;
}

/**
 * Create a field-level mapping JSON for programmatic use
 */
function generateFieldMappingJson() {
  log('Generating field mapping JSON...');
  
  // Define the mapping object
  const mapping = {
    product: {
      statamic_to_medusa: {
        "title": { destination: "title", transformation: "direct" },
        "_slug": { destination: "handle", transformation: "direct" },
        "description": { destination: "description", transformation: "direct" },
        "price": { destination: "variants[0].prices[0].amount", transformation: "multiply_by_100" },
        "images": { destination: "images", transformation: "url_transformation" },
        "stock": { destination: "variants[0].inventory_quantity", transformation: "direct" },
        "is_shippable": { destination: "metadata.is_shippable", transformation: "direct" },
        "product_type": { destination: "type.value", transformation: "direct" },
        "_id": { destination: "metadata.original_id", transformation: "direct" },
        "product_categories": { destination: "categories", transformation: "id_mapping" },
        "variants": { destination: "variants", transformation: "object_transformation" }
      },
      statamic_to_strapi: {
        "extended_description": { destination: "productContent.extended_description", transformation: "direct" },
        "specifications": { destination: "productContent.specifications", transformation: "direct" },
        "meta_title": { destination: "productContent.seo.title", transformation: "direct" },
        "meta_description": { destination: "productContent.seo.description", transformation: "direct" },
        "related_products": { destination: "productContent.related_content", transformation: "id_mapping" }
      },
      multi_language: {
        "title": { destination: "metadata.translations.{locale}.title", transformation: "direct" },
        "description": { destination: "metadata.translations.{locale}.description", transformation: "direct" },
        "extended_description": { destination: "productContent.localizations.{locale}.extended_description", transformation: "i18n_format" }
      },
      multi_region: [
        {
          "source": "price",
          "medusa_field": "variants.prices",
          "strapi_field": null,
          "transformation": "currency_format",
          "regions": [
            {"id": "netherlands", "currency": "EUR", "salesChannel": "nl-channel"},
            {"id": "belgium", "currency": "EUR", "salesChannel": "be-channel"},
            {"id": "germany", "currency": "EUR", "salesChannel": "de-channel"}
          ]
        },
        {
          "source": "stock",
          "medusa_field": "variants.inventory_quantity",
          "strapi_field": null,
          "transformation": "direct",
          "regions": [
            {"id": "netherlands", "stockLocationId": "nl-warehouse"},
            {"id": "belgium", "stockLocationId": "be-warehouse"},
            {"id": "germany", "stockLocationId": "de-warehouse"}
          ]
        },
        {
          "source": "availability",
          "medusa_field": "variants.allow_backorder",
          "strapi_field": "availability",
          "transformation": "boolean",
          "regions": [
            {"id": "netherlands", "salesChannel": "nl-channel"},
            {"id": "belgium", "salesChannel": "be-channel"},
            {"id": "germany", "salesChannel": "de-channel"}
          ]
        },
        {
          "source": "shipping_options",
          "medusa_field": "variants.metadata.shipping_options",
          "strapi_field": null,
          "transformation": "json_transform",
          "regions": [
            {"id": "netherlands", "shippingProfileId": "nl-shipping-profile"},
            {"id": "belgium", "shippingProfileId": "be-shipping-profile"},
            {"id": "germany", "shippingProfileId": "de-shipping-profile"}
          ]
        },
        {
          "source": "discounts",
          "medusa_field": "variants.metadata.discount_eligibility",
          "strapi_field": null,
          "transformation": "json_transform",
          "regions": [
            {"id": "netherlands", "discountRuleId": "nl-discount-rule"},
            {"id": "belgium", "discountRuleId": "be-discount-rule"},
            {"id": "germany", "discountRuleId": "de-discount-rule"}
          ]
        },
        {
          "source": "region_specific_content",
          "medusa_field": null,
          "strapi_field": "regionContent",
          "transformation": "json_transform",
          "regions": [
            {"id": "netherlands", "locales": ["nl-NL", "en-NL"]},
            {"id": "belgium", "locales": ["nl-BE", "fr-BE", "en-BE"]},
            {"id": "germany", "locales": ["de-DE", "en-DE"]}
          ]
        }
      ]
    },
    
    category: {
      statamic_to_medusa: {
        "title": { destination: "name", transformation: "direct" },
        "_slug": { destination: "handle", transformation: "direct" },
        "description": { destination: "description", transformation: "direct" },
        "_id": { destination: "metadata.original_id", transformation: "direct" },
        "parent": { destination: "parent_category_id", transformation: "id_mapping" }
      },
      multi_language: {
        "title": { destination: "metadata.translations.{locale}.name", transformation: "direct" },
        "description": { destination: "metadata.translations.{locale}.description", transformation: "direct" }
      }
    },
    
    customer: {
      statamic_to_medusa: {
        "email": { destination: "email", transformation: "direct" },
        "first_name": { destination: "first_name", transformation: "direct" },
        "last_name": { destination: "last_name", transformation: "direct" },
        "password": { destination: "password_hash", transformation: "rehash" },
        "phone": { destination: "phone", transformation: "direct" },
        "addresses": { destination: "addresses", transformation: "object_transformation" },
        "_id": { destination: "metadata.original_id", transformation: "direct" }
      }
    },
    
    order: {
      statamic_to_medusa: {
        "order_id": { destination: "display_id", transformation: "direct" },
        "status": { destination: "status", transformation: "status_mapping" },
        "customer": { destination: "customer_id", transformation: "id_mapping" },
        "billing_address": { destination: "billing_address", transformation: "object_transformation" },
        "shipping_address": { destination: "shipping_address", transformation: "object_transformation" },
        "region": { destination: "region_id", transformation: "id_mapping" },
        "currency": { destination: "currency_code", transformation: "lowercase" },
        "tax_rate": { destination: "tax_rate", transformation: "division_by_100" },
        "items": { destination: "items", transformation: "object_transformation" },
        "_id": { destination: "metadata.original_id", transformation: "direct" }
      }
    },
    
    page: {
      statamic_to_strapi: {
        "title": { destination: "title", transformation: "direct" },
        "_slug": { destination: "slug", transformation: "direct" },
        "_content": { destination: "content", transformation: "markdown_to_richtext" },
        "template": { destination: "layout", transformation: "direct" },
        "meta_title": { destination: "seo.title", transformation: "direct" },
        "meta_description": { destination: "seo.description", transformation: "direct" },
        "meta_image": { destination: "seo.image", transformation: "url_transformation" },
        "_id": { destination: "metadata.original_id", transformation: "direct" },
        "published": { destination: "published_at", transformation: "date_transformation" }
      },
      multi_language: {
        "title": { destination: "localizations.{locale}.title", transformation: "i18n_format" },
        "_content": { destination: "localizations.{locale}.content", transformation: "i18n_format" },
        "meta_title": { destination: "localizations.{locale}.seo.title", transformation: "i18n_format" },
        "meta_description": { destination: "localizations.{locale}.seo.description", transformation: "i18n_format" }
      }
    },
    
    region: {
      statamic_to_medusa: {
        "name": { destination: "name", transformation: "direct" },
        "code": { destination: "countries", transformation: "array_transformation" },
        "currency": { destination: "currency_code", transformation: "lowercase" },
        "taxRate": { destination: "tax_rate", transformation: "division_by_100" },
        "domain": { destination: "metadata.domain", transformation: "direct" },
        "payment_providers": { destination: "payment_providers", transformation: "array_transformation" }
      },
      regions_config: {
        "netherlands": {
          "code": "nl",
          "name": "Netherlands",
          "currency": "EUR",
          "domain": "bolenaccessoires.nl",
          "countries": ["NL"],
          "languages": [
            { "code": "nl-NL", "name": "Dutch (Netherlands)", "isDefault": true },
            { "code": "en-NL", "name": "English (Netherlands)", "isDefault": false }
          ],
          "tax_rate": 21,
          "payment_providers": ["mollie", "paypal"],
          "fulfillment_providers": ["manual"]
        },
        "belgium": {
          "code": "be",
          "name": "Belgium",
          "currency": "EUR",
          "domain": "bolenaccessoires.be",
          "countries": ["BE"],
          "languages": [
            { "code": "nl-BE", "name": "Dutch (Belgium)", "isDefault": true },
            { "code": "fr-BE", "name": "French (Belgium)", "isDefault": false },
            { "code": "en-BE", "name": "English (Belgium)", "isDefault": false }
          ],
          "tax_rate": 21,
          "payment_providers": ["mollie", "paypal"],
          "fulfillment_providers": ["manual"]
        },
        "germany": {
          "code": "de",
          "name": "Germany",
          "currency": "EUR",
          "domain": "bolenaccessoires.de",
          "countries": ["DE"],
          "languages": [
            { "code": "de-DE", "name": "German", "isDefault": true },
            { "code": "en-DE", "name": "English (Germany)", "isDefault": false }
          ],
          "tax_rate": 19,
          "payment_providers": ["mollie", "paypal"],
          "fulfillment_providers": ["manual"]
        }
      }
    }
  };
  
  // Write the mapping to JSON file
  const jsonOutputFile = path.join(OUTPUT_DIR, 'field-mapping.json');
  fs.writeFileSync(jsonOutputFile, JSON.stringify(mapping, null, 2));
  
  log(`Field mapping JSON generated: ${jsonOutputFile}`);
  return mapping;
}

/**
 * Main execution function
 */
function main() {
  log('Starting field mapping generation...');
  
  // Generate the field mapping document
  generateFieldMapping();
  
  // Generate the field mapping JSON
  generateFieldMappingJson();
  
  // Define validation rules for migration
  defineValidationRules();
  
  log('Field mapping generation completed.');
}

/**
 * Define validation rules for ensuring data integrity during migration
 */
function defineValidationRules() {
  log('Defining validation rules...');
  
  const validationRules = {
    "version": "1.0.0",
    "description": "Validation rules for Statamic to Medusa.js and Strapi migration",
    "entities": {
      "products": {
        "required_fields": ["title", "handle", "price", "description"],
        "format_validations": {
          "handle": "^[a-z0-9-]+$",
          "price": "^\\d+(\\.\\d{1,2})?$"
        },
        "relationship_validations": {
          "categories": "must_exist_in_destination"
        },
        "localization_validations": {
          "required_locales": ["nl-NL"],
          "fallback_rules": {
            "nl-BE": "nl-NL",
            "de-DE": "en-DE",
            "fr-BE": "en-BE"
          }
        }
      },
      "categories": {
        "required_fields": ["name", "handle"],
        "format_validations": {
          "handle": "^[a-z0-9-]+$"
        },
        "relationship_validations": {
          "parent_category": "must_exist_in_destination"
        }
      },
      "customers": {
        "required_fields": ["email"],
        "format_validations": {
          "email": "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$"
        }
      },
      "orders": {
        "required_fields": ["email", "items", "total"],
        "format_validations": {
          "email": "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$",
          "total": "^\\d+(\\.\\d{1,2})?$"
        },
        "relationship_validations": {
          "customer": "must_exist_in_destination",
          "items.product": "must_exist_in_destination"
        }
      },
      "pages": {
        "required_fields": ["title", "slug", "content"],
        "format_validations": {
          "slug": "^[a-z0-9-]+$"
        },
        "localization_validations": {
          "required_locales": ["nl-NL"],
          "fallback_rules": {
            "nl-BE": "nl-NL",
            "de-DE": "en-DE",
            "fr-BE": "en-BE"
          }
        }
      }
    },
    "region_validations": {
      "netherlands": {
        "required_locales": ["nl-NL"],
        "fallback_locale": "en-NL",
        "currency": "EUR",
        "domain_format": "^https?://.*bolenaccessoires\\.nl($|/.*)"
      },
      "belgium": {
        "required_locales": ["nl-BE"],
        "fallback_locale": "fr-BE",
        "currency": "EUR",
        "domain_format": "^https?://.*bolenaccessoires\\.be($|/.*)"
      },
      "germany": {
        "required_locales": ["de-DE"],
        "fallback_locale": "en-DE",
        "currency": "EUR",
        "domain_format": "^https?://.*bolenaccessoires\\.de($|/.*)"
      }
    }
  };
  
  // Write validation rules to JSON file
  const validationOutputFile = path.join(OUTPUT_DIR, 'validation-rules.json');
  fs.writeFileSync(validationOutputFile, JSON.stringify(validationRules, null, 2));
  
  log(`Validation rules generated: ${validationOutputFile}`);
  return validationRules;
}

// Run the main function
main(); 