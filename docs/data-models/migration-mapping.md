# Data Migration Mapping Strategy

This document outlines the data migration strategy from Statamic CMS with Simple Commerce to Medusa.js and Strapi CMS, with special considerations for multi-region and multi-language support.

## Source System Analysis

### Statamic Data Structure

| Statamic Entity | Description | Migration Target |
|-----------------|-------------|------------------|
| Collections | Content organized in collections | Strapi content types |
| Entries | Individual content items | Strapi entries |
| Blueprints | Content structure definitions | Strapi content type schemas |
| Assets | Media files | Strapi media library |
| Taxonomies | Classification systems | Strapi taxonomies/categories |
| Globals | Site-wide variables | Strapi single types |
| Nav | Navigation structures | Strapi navigation plugin |
| Users | User accounts | Medusa.js customers & Strapi users |

### Simple Commerce Data Structure

| Simple Commerce Entity | Description | Migration Target |
|------------------------|-------------|------------------|
| Products | Product definitions | Medusa.js products |
| Variants | Product variants | Medusa.js product variants |
| Customers | Customer accounts | Medusa.js customers |
| Orders | Customer orders | Medusa.js orders |
| Coupons | Discount coupons | Medusa.js discounts |
| Shipping | Shipping methods | Medusa.js shipping options |
| Taxes | Tax rates and rules | Medusa.js tax rates |
| Gateways | Payment gateways | Medusa.js payment providers |

## Target System Mapping

### Medusa.js Core Entities

| Medusa.js Entity | Source in Statamic/Simple Commerce | Data Transformation Requirements |
|------------------|--------------------------------------|----------------------------------|
| Products | Simple Commerce products | Map product data, transform custom fields to metadata |
| Product Variants | Simple Commerce variants | Map variant data, pricing, and inventory |
| Regions | Region-specific settings | Create regions for NL, BE, DE with appropriate currencies and tax rates |
| Sales Channels | Domain-specific settings | Create sales channels for each domain (example.nl, example.be, example.de) |
| Customers | Simple Commerce customers & Statamic users | Merge customer data from both sources |
| Orders | Simple Commerce orders | Transform order data to Medusa.js structure |
| Discounts | Simple Commerce coupons | Convert coupon rules to Medusa.js discount conditions |
| Shipping Options | Simple Commerce shipping methods | Map shipping zones and rates |
| Tax Rates | Simple Commerce tax settings | Create region-specific tax rates |
| Payment Providers | Simple Commerce payment gateways | Configure equivalent Medusa.js payment providers |

### Strapi Core Entities

| Strapi Entity | Source in Statamic | Data Transformation Requirements |
|---------------|--------------------|---------------------------------|
| Pages | Statamic page collections | Transform Antlers templates to Strapi content structure |
| Blog Posts | Statamic blog collections | Map blog post fields and media references |
| Navigation | Statamic nav | Convert nav structure to Strapi navigation plugin format |
| Media Library | Statamic assets | Transfer files with metadata and organize in Strapi |
| Product Content | Statamic product-related content | Extract extended content not suitable for Medusa.js |
| Regional Content | Statamic globals and region-specific content | Map region-specific content with appropriate locale markers |

## Multi-Region Migration Strategy

### Domain Mapping

| Source Domain Pattern | Target Structure | Considerations |
|------------------------|------------------|----------------|
| `example.nl` | Medusa.js Region: `nl`, Sales Channel: `nl-channel` | Default currency: EUR, Default language: Dutch |
| `example.be` | Medusa.js Region: `be`, Sales Channel: `be-channel` | Default currency: EUR, Default language: Dutch |
| `example.de` | Medusa.js Region: `de`, Sales Channel: `de-channel` | Default currency: EUR, Default language: German |

### Region-Specific Data

| Data Type | Migration Approach |
|-----------|-------------------|
| Pricing | Map to region-specific price lists in Medusa.js |
| Shipping Options | Create region-specific shipping options for each target region |
| Payment Methods | Configure region-appropriate payment providers |
| Tax Rates | Set up region-specific tax rates and rules |
| Available Products | Use product availability in sales channels to control regional visibility |
| Content | Apply region availability flags in Strapi content |

## Multi-Language Migration Strategy

### Language Mapping

| Source Language | Target Configuration | Notes |
|-----------------|----------------------|-------|
| Dutch (`nl`) | Default language for `nl` and `be` regions | Primary content language |
| German (`de`) | Default language for `de` region | Secondary content language |

### Translation Process

1. **Extract translations** from Statamic's translation files and entry fields
2. **Map language codes** to Strapi locale codes
3. **Create base entries** in the default locale
4. **Create localized versions** with appropriate relationships
5. **Verify translation completeness** and set fallbacks where needed

## Data Transformation Examples

### Product Migration Example

```javascript
// Simplified example of product migration logic
async function migrateProduct(statamicProduct) {
  // Extract base product data
  const baseProductData = {
    title: statamicProduct.title,
    handle: statamicProduct.slug,
    description: statamicProduct.description,
    // Map other basic fields
  };
  
  // Handle multi-language support
  const metadata = {
    translations: {
      nl: { title: statamicProduct.title, description: statamicProduct.description },
    }
  };
  
  // Add German translations if available
  if (statamicProduct.translations && statamicProduct.translations.de) {
    metadata.translations.de = {
      title: statamicProduct.translations.de.title,
      description: statamicProduct.translations.de.description,
    };
  }
  
  // Add region availability based on Statamic data
  metadata.region_availability = [];
  if (statamicProduct.available_in_nl) metadata.region_availability.push('nl');
  if (statamicProduct.available_in_be) metadata.region_availability.push('be');
  if (statamicProduct.available_in_de) metadata.region_availability.push('de');
  
  // Create product in Medusa.js
  const medusaProduct = await medusaClient.admin.products.create({
    ...baseProductData,
    metadata,
    // Map other fields like type, categories, etc.
  });
  
  // Create extended content in Strapi
  const strapiProductContent = await strapiClient.create('product-contents', {
    data: {
      productId: medusaProduct.id,
      extendedDescription: statamicProduct.extended_description,
      // Map other extended content
      // Handle translations for Strapi
      locale: 'nl', // Set default locale
    }
  });
  
  // Create German translation in Strapi if available
  if (statamicProduct.translations && statamicProduct.translations.de) {
    await strapiClient.create('product-contents', {
      data: {
        productId: medusaProduct.id,
        extendedDescription: statamicProduct.translations.de.extended_description,
        // Map other extended content
        locale: 'de',
      }
    });
  }
  
  // Create variants
  for (const variant of statamicProduct.variants) {
    await migrateVariant(variant, medusaProduct.id);
  }
  
  return { medusaProduct, strapiProductContent };
}
```

### Content Page Migration Example

```javascript
// Simplified example of page migration logic
async function migratePage(statamicPage) {
  // Extract base page data
  const basePageData = {
    title: statamicPage.title,
    slug: statamicPage.slug,
    content: transformAntlersToRichText(statamicPage.content),
    // Map other basic fields
  };
  
  // Create page in Strapi
  const strapiPage = await strapiClient.create('pages', {
    data: {
      ...basePageData,
      // Handle SEO data
      seo: {
        metaTitle: statamicPage.meta_title || statamicPage.title,
        metaDescription: statamicPage.meta_description,
        // Transform meta image if available
      },
      // Set region availability
      metadata: {
        statamic_id: statamicPage.id,
        region_availability: determineRegionAvailability(statamicPage),
      },
      // Set locale
      locale: 'nl', // Default locale
    }
  });
  
  // Create German translation if available
  if (statamicPage.translations && statamicPage.translations.de) {
    await strapiClient.create('pages', {
      data: {
        title: statamicPage.translations.de.title,
        slug: statamicPage.translations.de.slug,
        content: transformAntlersToRichText(statamicPage.translations.de.content),
        // Handle SEO data
        seo: {
          metaTitle: statamicPage.translations.de.meta_title || statamicPage.translations.de.title,
          metaDescription: statamicPage.translations.de.meta_description,
          // Transform meta image if available
        },
        // Set region availability (same as original)
        metadata: {
          statamic_id: statamicPage.id,
          region_availability: determineRegionAvailability(statamicPage),
        },
        // Set locale
        locale: 'de',
        // Set localization relation
        localizations: [
          {
            id: strapiPage.id,
          }
        ]
      }
    });
  }
  
  return strapiPage;
}
```

## Migration Process Overview

### Phase 1: Preparation and Analysis

1. **Inventory Source Data**
   - Extract and catalog all Statamic collections, entries, and assets
   - Document Simple Commerce product structures and customizations
   - Map current multi-language implementation details
   - Analyze current regional content differences

2. **Design Target Schema**
   - Finalize Medusa.js data model with region configurations
   - Define Strapi content models with localization support
   - Document entity relationships between Medusa.js and Strapi
   - Create test instances to validate schema designs

### Phase 2: Extract and Transform

1. **Develop Migration Scripts**
   - Create data extraction scripts for Statamic and Simple Commerce
   - Develop transformation logic for each entity type
   - Build validation routines to verify data integrity
   - Implement error handling and logging

2. **Run Test Migrations**
   - Perform sample migrations with representative data
   - Validate multi-region and multi-language functioning
   - Refine transformation logic based on test results
   - Document any unexpected edge cases

### Phase 3: Load and Verification

1. **Execute Full Migration**
   - Migrate core product and customer data to Medusa.js
   - Transfer content and media assets to Strapi
   - Establish reference relationships between systems
   - Apply region and language configurations

2. **Verification and Cleanup**
   - Verify entity counts match between source and target
   - Validate multi-language content is correctly associated
   - Ensure region-specific configurations are working
   - Clean up any temporary data or migration artifacts

## Migration Tools and Scripts

The migration will use a combination of custom Node.js scripts and existing migration tools:

1. **Data Extraction Tools**
   - Statamic API client for content extraction
   - Simple Commerce database queries for commerce data
   - Asset extraction utilities

2. **Transformation Scripts**
   - Entity mapping transformers
   - Language code normalizers
   - Region configuration builders
   - URL structure preservers

3. **Data Loading Utilities**
   - Medusa.js Admin API clients
   - Strapi API clients
   - Batch processing utilities
   - Retry and error handling wrappers

## Risk Management

| Risk Area | Mitigation Strategy |
|-----------|---------------------|
| Data Loss | Create comprehensive backups before migration; validate record counts after each phase |
| Language Mismatches | Develop explicit language mapping; test with sample content in all languages |
| Regional Configuration Errors | Create region validation tests; verify region-specific behavior |
| Relationship Integrity | Build relationship validation checks; ensure all references are maintained |
| Performance Issues | Use batch processing; schedule migration during off-peak hours |
| URL Structure Changes | Implement URL mapping and redirects for changed structures |

## Post-Migration Verification

A comprehensive verification checklist will include:

1. **Data Completeness**
   - All products and variants migrated
   - All content pages present
   - Media assets accessible
   - Customer data preserved

2. **Functional Verification**
   - Region switching works correctly
   - Language selection functions properly
   - Product browsing in all regions
   - Checkout flow in all regions

3. **Performance Verification**
   - Page load times
   - API response times
   - Search functionality performance
   - Media asset loading speed 