# Statamic to Medusa.js/Strapi Field Mapping Strategy

This document provides a comprehensive field-level mapping between Statamic/Simple Commerce and the new Medusa.js/Strapi systems. It serves as the definitive reference for data migration and transformation.

## Table of Contents
- [Overview](#overview)
- [Mapping Principles](#mapping-principles)
- [Multi-Region Considerations](#multi-region-considerations)
- [Multi-Language Considerations](#multi-language-considerations)
- [Product Mapping](#product-mapping)
- [Category Mapping](#category-mapping)
- [Customer Mapping](#customer-mapping)
- [Order Mapping](#order-mapping)
- [Page Mapping](#page-mapping)
- [Navigation Mapping](#navigation-mapping)
- [Asset Mapping](#asset-mapping)
- [Region Settings Mapping](#region-settings-mapping)
- [Validation Strategy](#validation-strategy)

## Overview

This field mapping strategy documents how content from Statamic and Simple Commerce will be migrated to the new Medusa.js and Strapi CMS platforms. The migration preserves all essential data while adapting it to the new systems' data structures.

### Migration Goals

1. Preserve all business-critical data without loss
2. Maintain multi-language content across all regions
3. Ensure region-specific settings and data are properly configured
4. Transform data formats where necessary for the new systems
5. Validate data integrity throughout the migration process

### System Overview

| System | Purpose | Data Content |
|--------|---------|--------------|
| Statamic + Simple Commerce | Current CMS and e-commerce platform | Products, categories, pages, navigation, assets, customers, orders |
| Medusa.js | New e-commerce engine | Products, variants, categories, prices, regions, customers, orders |
| Strapi | New CMS platform | Extended product content, pages, media assets, navigation, region-specific content |

## Mapping Principles

The mapping follows these core principles:

1. **Direct mapping** where field structures are compatible
2. **Transformation** where data structures differ but data can be adapted
3. **Distribution** where a single source field maps to multiple destination fields
4. **Aggregation** where multiple source fields combine into a single destination field
5. **Custom handling** for complex cases requiring specific business logic

### Transformation Types

| Type | Description | Example |
|------|-------------|---------|
| direct | Direct copy with no changes | `title` → `title` |
| transform_slug | Transform URL slugs to meet new system requirements | `_slug` → `handle` with formatting |
| json_extract | Extract values from JSON fields | `metadata` → specific fields |
| currency_format | Adjust currency format (e.g., cents vs. whole units) | `price` * 100 → `price` (Medusa.js) |
| localize | Handle localization and multi-language content | `.nl.md` fields → localized fields |
| regionalize | Handle region-specific data transformations | `region_nl/price` → region-specific prices |
| media_transform | Transform media references and paths | `image.yaml` → Strapi media entities |
| relationship_transform | Transform relationships between entities | product → category mappings |

## Multi-Region Considerations

The migration must account for the multi-region structure, with these key aspects:

### Region Definitions

| Statamic Region Code | Medusa.js Region ID | Primary Domain | Currency | Locales |
|---------------------|---------------------|----------------|----------|---------|
| nl | netherlands | bolenaccessoires.nl | EUR | nl-NL, en-NL |
| be | belgium | bolenaccessoires.be | EUR | nl-BE, fr-BE, en-BE |
| de | germany | bolenaccessoires.de | EUR | de-DE, en-DE |

### Region-Specific Data Handling

1. **Pricing**: Region-specific prices are mapped to Medusa.js price lists with correct currency
2. **Availability**: Product availability per region is reflected in sales channel associations
3. **Shipping**: Region-specific shipping options are created in respective Medusa.js regions
4. **Taxes**: Tax rates are configured according to region requirements

## Multi-Language Considerations

The migration preserves all multi-language content with these considerations:

### Language Support

| Language | Region Support | Statamic Pattern | Destination System |
|----------|---------------|------------------|-------------------|
| Dutch (nl) | NL, BE | .nl.md | Strapi (nl) + Medusa.js (nl-NL, nl-BE) |
| German (de) | DE | .de.md | Strapi (de) + Medusa.js (de-DE) |
| French (fr) | BE | .fr.md | Strapi (fr) + Medusa.js (fr-BE) |
| English (en) | All | .en.md | Strapi (en) + Medusa.js (en-*) |

### Translation Handling

1. Primary content fields in Statamic are mapped to default language in Medusa.js/Strapi
2. Language variants are mapped to corresponding localizations
3. Missing translations will use fallback mechanisms in the new systems
4. Region-specific language content is preserved where available

## Product Mapping

### Statamic Product → Medusa.js Product

| Statamic Field | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------------|-------------------|----------------|-------|
| title | Medusa.js | title | direct | Main product title |
| _slug | Medusa.js | handle | transform_slug | Transformed to valid handle format |
| price | Medusa.js | variants[0].prices[0].amount | currency_format | Multiplied by 100 for cents conversion |
| description | Medusa.js | description | direct | Product description |
| images | Medusa.js | thumbnail, images | media_transform | First image as thumbnail, all as images |
| categories | Medusa.js | categories | relationship_transform | Mapped to Medusa.js category IDs |
| metadata | Medusa.js | metadata | json_extract | All metadata fields preserved |
| sku | Medusa.js | variants[0].sku | direct | Simple Commerce SKU to variant SKU |
| barcode | Medusa.js | variants[0].barcode | direct | Product barcode |
| dimensions | Medusa.js | variants[0].length/width/height | direct | Dimension values |
| weight | Medusa.js | variants[0].weight | direct | Weight values |
| stock | Medusa.js | variants[0].inventory_quantity | direct | Current stock level |
| variants | Medusa.js | variants | transform_variants | Converts variant structure |
| options | Medusa.js | options | transform_options | Maps product options |
| status | Medusa.js | status | transform_status | Maps publication status |

### Statamic Product → Strapi Product Content

| Statamic Field | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------------|-------------------|----------------|-------|
| extended_description | Strapi | extendedDescription | direct | Long-form product description |
| specifications | Strapi | specifications | json_transform | Technical specifications |
| features | Strapi | features | array_transform | Product feature highlights |
| videos | Strapi | videos | media_transform | Product videos |
| related_products | Strapi | relatedProducts | relationship_transform | Related product references |
| meta_title | Strapi | seo.metaTitle | direct | SEO title override |
| meta_description | Strapi | seo.metaDescription | direct | SEO description |
| meta_keywords | Strapi | seo.keywords | array_transform | SEO keywords |
| faq | Strapi | faq | json_transform | Product FAQ items |

### Multi-Language Product Fields

| Statamic Field | Language Files | Destination System | Destination Field | Transformation | Notes |
|----------------|---------------|-------------------|-------------------|----------------|-------|
| title | .nl.md/.de.md/.fr.md | Medusa.js/Strapi | title | localize | Localized titles |
| description | .nl.md/.de.md/.fr.md | Medusa.js/Strapi | description | localize | Localized descriptions |
| extended_description | .nl.md/.de.md/.fr.md | Strapi | extendedDescription | localize | Localized extended descriptions |
| meta_title | .nl.md/.de.md/.fr.md | Strapi | seo.metaTitle | localize | Localized SEO titles |
| meta_description | .nl.md/.de.md/.fr.md | Strapi | seo.metaDescription | localize | Localized SEO descriptions |
| features | .nl.md/.de.md/.fr.md | Strapi | features | localize | Localized feature lists |

### Region-Specific Product Data

| Statamic Field | Region Files | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------|-------------------|-------------------|----------------|-------|
| price | region_nl/region_be/region_de | Medusa.js | price_lists | regionalize | Region-specific price lists |
| stock | region_nl/region_be/region_de | Medusa.js | inventory_items | regionalize | Region-specific inventory |
| availability | region_nl/region_be/region_de | Medusa.js | sales_channels | regionalize | Region availability mapping |
| shipping | region_nl/region_be/region_de | Medusa.js | shipping_options | regionalize | Region-specific shipping options |

## Category Mapping

### Statamic Category → Medusa.js Category

| Statamic Field | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------------|-------------------|----------------|-------|
| title | Medusa.js | name | direct | Category name |
| _slug | Medusa.js | handle | transform_slug | Transformed to valid handle format |
| description | Medusa.js | metadata.description | direct | Stored in metadata as Medusa lacks description field |
| parent | Medusa.js | parent_category_id | relationship_transform | Maps to parent category |
| image | Medusa.js | metadata.image | media_reference | Store image reference in metadata |

### Statamic Category → Strapi Category Extension

| Statamic Field | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------------|-------------------|----------------|-------|
| description | Strapi | description | direct | Category description |
| image | Strapi | image | media_transform | Category image |
| extended_content | Strapi | extendedContent | direct | Rich content for category pages |
| meta_title | Strapi | seo.metaTitle | direct | SEO title override |
| meta_description | Strapi | seo.metaDescription | direct | SEO description |
| meta_keywords | Strapi | seo.keywords | array_transform | SEO keywords |
| featured | Strapi | featured | direct | Whether category is featured |

### Multi-Language Category Fields

| Statamic Field | Language Files | Destination System | Destination Field | Transformation | Notes |
|----------------|---------------|-------------------|-------------------|----------------|-------|
| title | .nl.md/.de.md/.fr.md | Medusa.js/Strapi | name/title | localize | Localized titles |
| description | .nl.md/.de.md/.fr.md | Strapi | description | localize | Localized descriptions |
| extended_content | .nl.md/.de.md/.fr.md | Strapi | extendedContent | localize | Localized content |
| meta_title | .nl.md/.de.md/.fr.md | Strapi | seo.metaTitle | localize | Localized SEO titles |
| meta_description | .nl.md/.de.md/.fr.md | Strapi | seo.metaDescription | localize | Localized SEO descriptions |

## Customer Mapping

### Statamic Customer → Medusa.js Customer

| Statamic Field | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------------|-------------------|----------------|-------|
| id | Medusa.js | metadata.statamic_id | direct | Original ID as reference |
| email | Medusa.js | email | direct | Primary identifier |
| first_name | Medusa.js | first_name | direct | First name |
| last_name | Medusa.js | last_name | direct | Last name |
| password | Medusa.js | password_hash | password_transform | Secure password migration |
| addresses | Medusa.js | shipping_addresses | address_transform | Customer shipping addresses |
| phone | Medusa.js | phone | direct | Contact phone |
| orders | Medusa.js | orders | relationship_transform | Order relationship |
| customer_groups | Medusa.js | customer_groups | relationship_transform | Group memberships |
| metadata | Medusa.js | metadata | json_extract | Custom customer data |

### Region-Specific Customer Data

| Statamic Field | Region Files | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------|-------------------|-------------------|----------------|-------|
| preferred_currency | region_nl/region_be/region_de | Medusa.js | metadata.preferred_currency | regionalize | Region currency preference |
| preferred_language | region_nl/region_be/region_de | Medusa.js | metadata.preferred_language | regionalize | Region language preference |
| marketing_preferences | region_nl/region_be/region_de | Medusa.js | metadata.marketing_preferences | regionalize | Region marketing opt-ins |

## Order Mapping

### Statamic Order → Medusa.js Order

| Statamic Field | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------------|-------------------|----------------|-------|
| id | Medusa.js | metadata.statamic_id | direct | Original ID as reference |
| status | Medusa.js | status | status_transform | Order status mapping |
| email | Medusa.js | email | direct | Customer email |
| total | Medusa.js | total | currency_format | Adjusted for currency format |
| items | Medusa.js | items | item_transform | Order line items |
| billing_address | Medusa.js | billing_address | address_transform | Billing address |
| shipping_address | Medusa.js | shipping_address | address_transform | Shipping address |
| shipping_method | Medusa.js | shipping_methods | shipping_transform | Shipping method details |
| payment_method | Medusa.js | payments | payment_transform | Payment details |
| customer_id | Medusa.js | customer_id | customer_lookup | Customer reference |
| discount_codes | Medusa.js | discounts | discount_transform | Applied discounts |
| gift_cards | Medusa.js | gift_cards | gift_card_transform | Applied gift cards |
| notes | Medusa.js | metadata.notes | direct | Order notes |
| created_at | Medusa.js | created_at | date_transform | Order creation date |
| updated_at | Medusa.js | updated_at | date_transform | Order update date |

### Region-Specific Order Data

| Statamic Field | Region Files | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------|-------------------|-------------------|----------------|-------|
| currency | region_nl/region_be/region_de | Medusa.js | currency_code | regionalize | Order currency |
| tax_rate | region_nl/region_be/region_de | Medusa.js | tax_rate | regionalize | Region tax rate |
| region_restrictions | region_nl/region_be/region_de | Medusa.js | region_id | regionalize | Order region assignment |

## Page Mapping

### Statamic Page → Strapi Page

| Statamic Field | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------------|-------------------|----------------|-------|
| title | Strapi | title | direct | Page title |
| _slug | Strapi | slug | transform_slug | URL slug |
| content | Strapi | content | markdown_to_blocks | Convert to content blocks |
| template | Strapi | template | direct | Page template |
| parent | Strapi | parent | relationship_transform | Parent page reference |
| published | Strapi | publishedAt | boolean_to_date | Publication status |
| meta_title | Strapi | seo.metaTitle | direct | SEO title |
| meta_description | Strapi | seo.metaDescription | direct | SEO description |
| meta_keywords | Strapi | seo.keywords | array_transform | SEO keywords |
| og_image | Strapi | seo.metaImage | media_transform | Social sharing image |
| components | Strapi | components | component_transform | Layout components |

### Multi-Language Page Fields

| Statamic Field | Language Files | Destination System | Destination Field | Transformation | Notes |
|----------------|---------------|-------------------|-------------------|----------------|-------|
| title | .nl.md/.de.md/.fr.md | Strapi | title | localize | Localized titles |
| content | .nl.md/.de.md/.fr.md | Strapi | content | localize | Localized content |
| meta_title | .nl.md/.de.md/.fr.md | Strapi | seo.metaTitle | localize | Localized SEO titles |
| meta_description | .nl.md/.de.md/.fr.md | Strapi | seo.metaDescription | localize | Localized SEO descriptions |
| components | .nl.md/.de.md/.fr.md | Strapi | components | localize | Localized components |

### Region-Specific Page Data

| Statamic Field | Region Files | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------|-------------------|-------------------|----------------|-------|
| visibility | region_nl/region_be/region_de | Strapi | regions | regionalize | Region visibility settings |
| region_components | region_nl/region_be/region_de | Strapi | regionComponents | regionalize | Region-specific components |

## Navigation Mapping

### Statamic Navigation → Strapi Navigation

| Statamic Field | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------------|-------------------|----------------|-------|
| name | Strapi | name | direct | Navigation name |
| tree | Strapi | items | nav_transform | Navigation tree structure |
| _handle | Strapi | handle | direct | Navigation identifier |

### Multi-Language Navigation Fields

| Statamic Field | Language Files | Destination System | Destination Field | Transformation | Notes |
|----------------|---------------|-------------------|-------------------|----------------|-------|
| tree.*.title | .nl.md/.de.md/.fr.md | Strapi | items.*.title | localize | Localized navigation items |

### Region-Specific Navigation Data

| Statamic Field | Region Files | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------|-------------------|-------------------|----------------|-------|
| region_items | region_nl/region_be/region_de | Strapi | regionItems | regionalize | Region-specific menu items |

## Asset Mapping

### Statamic Asset → Strapi Media

| Statamic Field | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------------|-------------------|----------------|-------|
| path | Strapi | url | path_transform | File path transformation |
| filename | Strapi | name | direct | Asset filename |
| extension | Strapi | ext | direct | File extension |
| size | Strapi | size | direct | File size |
| last_modified | Strapi | updatedAt | date_transform | Last modified date |
| width | Strapi | width | direct | Image width |
| height | Strapi | height | direct | Image height |
| alt | Strapi | alternativeText | direct | Image alt text |
| caption | Strapi | caption | direct | Image caption |
| focal | Strapi | formats.*.meta.focal | focal_transform | Focal point transformation |

### Multi-Language Asset Fields

| Statamic Field | Language Files | Destination System | Destination Field | Transformation | Notes |
|----------------|---------------|-------------------|-------------------|----------------|-------|
| alt | .nl.md/.de.md/.fr.md | Strapi | alternativeText | localize | Localized alt text |
| caption | .nl.md/.de.md/.fr.md | Strapi | caption | localize | Localized captions |

## Region Settings Mapping

### Statamic Region Settings → Medusa.js Region

| Statamic Field | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------------|-------------------|----------------|-------|
| name | Medusa.js | name | direct | Region name |
| code | Medusa.js | metadata.code | direct | Region code |
| currency | Medusa.js | currency_code | direct | Currency code |
| tax_rate | Medusa.js | tax_rate | direct | Default tax rate |
| domain | Medusa.js | metadata.domain | direct | Primary domain |
| countries | Medusa.js | countries | array_transform | Country codes |
| payment_providers | Medusa.js | payment_providers | array_transform | Enabled payment providers |
| fulfillment_providers | Medusa.js | fulfillment_providers | array_transform | Enabled fulfillment providers |

### Region Settings → Strapi Region

| Statamic Field | Destination System | Destination Field | Transformation | Notes |
|----------------|-------------------|-------------------|----------------|-------|
| name | Strapi | name | direct | Region name |
| code | Strapi | code | direct | Region code |
| domain | Strapi | domain | direct | Primary domain |
| default_locale | Strapi | defaultLocale | direct | Default language |
| supported_locales | Strapi | supportedLocales | array_transform | Supported languages |
| currency | Strapi | currency | direct | Currency code |
| tax_rate | Strapi | taxRate | direct | Default tax rate |
| country | Strapi | country | direct | Primary country |

## Validation Strategy

The data migration will be validated using the following checks:

### Required Field Validation

Each entity type has required fields that must be present:

1. **Products**: title, handle, variants, prices
2. **Categories**: name, handle
3. **Customers**: email
4. **Orders**: email, items, total
5. **Pages**: title, slug, content
6. **Media**: file, name

### Data Format Validation

Specific fields require format validation:

1. **URLs/Slugs**: Must be URL-safe, lowercase, no spaces
2. **Emails**: Valid email format
3. **Prices**: Numeric values, properly formatted
4. **Dates**: Valid ISO 8601 format
5. **References**: Valid entity references

### Multi-Language Validation

Language content is validated for:

1. **Completeness**: Required fields have translations
2. **Consistency**: Field types match across languages
3. **Default Fallback**: Default language has complete content

### Multi-Region Validation

Region-specific data is validated for:

1. **Region Assignment**: Entities assigned to correct regions
2. **Currency Format**: Prices formatted correctly for region
3. **Domain Mapping**: URLs constructed properly for regional domains

Using scripts in the `scripts/migration/validation/` directory, data will be validated before, during, and after migration to ensure integrity. 