# Data Mapping Specification

## Overview

This document defines the precise data mapping between Statamic/Simple Commerce entities and their corresponding entities in Medusa.js/Strapi. These mappings are essential for the ETL process and ensure data integrity during migration.

## Core Entity Mappings

### Products

| Statamic/Simple Commerce Field | Medusa.js/Strapi Field | Notes |
|-------------------------------|------------------------|-------|
| `title` | `title` (Medusa) | Direct mapping |
| `slug` | `handle` (Medusa) | Direct mapping |
| `description` | `description` (Medusa) | Direct mapping |
| `price` | `variants[0].prices[].amount` (Medusa) | Convert to cents, create variant if none exists |
| `status` | `status` (Medusa) | Map values: published → published, draft → draft |
| `images` | `images` (Medusa) | Convert to Medusa URL format |
| `thumbnail` | `thumbnail` (Medusa) | Primary product image |
| `categories` | `categories` (Medusa) | Map to Medusa category IDs |
| `stock` | `variants[0].inventory_quantity` (Medusa) | Apply to default variant if no variants |
| `weight` | `variants[0].weight` (Medusa) | Apply to default variant if no variants |
| `dimensions` | `variants[0].height/width/length` (Medusa) | Split into separate fields |
| `seo_title` | `metadata.seo.title` (Medusa) | Store in metadata |
| `seo_description` | `metadata.seo.description` (Medusa) | Store in metadata |
| `variants` | `variants` (Medusa) | Complex mapping detailed below |
| `site` | Related to region/store (Medusa) | Map to appropriate sales channel |
| `localized_content` | `metadata.translations` (Medusa) and localized Strapi content | Split between systems |
| `created_at` | `created_at` (Medusa) | Direct mapping |
| `updated_at` | `updated_at` (Medusa) | Direct mapping |
| `published_at` | N/A | Store in metadata if needed |
| `id` | `metadata.original_id` (Medusa) | Store original ID for reference |
| `url` | `metadata.original_url` (Medusa) | For generating redirects |

#### Rich Content Mapping

Product rich content (detailed descriptions, specs, features) will be stored in Strapi with a reference to the Medusa product:

| Statamic Field | Strapi Field | Notes |
|---------------|-------------|-------|
| `product_id` | `medusa_id` (ProductEnrichment) | Link to Medusa product |
| `content_blocks` | `content` (ProductEnrichment) | Convert to Strapi compatible format |
| `specifications` | `specifications` (ProductEnrichment) | Array of spec items |
| `features` | `features` (ProductEnrichment) | Array of feature items |
| `videos` | `media` (ProductEnrichment) | Media gallery items |
| `downloads` | `downloads` (ProductEnrichment) | Downloadable resources |

### Product Variants

| Statamic/Simple Commerce Field | Medusa.js Field | Notes |
|-------------------------------|---------------|-------|
| `title` | `title` | Direct mapping |
| `sku` | `sku` | Direct mapping |
| `barcode` | `barcode` | Direct mapping |
| `price` | `prices` | Convert to cents, create for each region |
| `sale_price` | Special price in `prices` | Create with sale condition |
| `stock` | `inventory_quantity` | Direct mapping |
| `track_inventory` | `manage_inventory` | Direct mapping |
| `weight` | `weight` | Direct mapping |
| `dimensions` | `height`, `width`, `length` | Split into separate fields |
| `option_values` | `options` | Map to option values |
| `images` | `variant_images` | Associate with variant |
| `id` | `metadata.original_id` | Store original ID for reference |

### Categories/Collections

| Statamic Field | Medusa.js/Strapi Field | Notes |
|---------------|------------------------|-------|
| `title` | `name` (Medusa) and `title` (Strapi Collection) | Map to both systems |
| `slug` | `handle` (Medusa) and `slug` (Strapi Collection) | Map to both systems |
| `description` | `metadata.description` (Medusa) and `description` (Strapi Collection) | Short description in Medusa, full in Strapi |
| `parent` | `parent_category_id` (Medusa) and `parent` (Strapi Collection) | Maintain hierarchy |
| `images` | `metadata.thumbnail` (Medusa) and `images` (Strapi Collection) | Primary in Medusa, full gallery in Strapi |
| `seo` | `metadata.seo` (Medusa) and `seo` (Strapi Collection) | Map to both for consistency |
| `content_blocks` | `content` (Strapi Collection) | Rich content goes to Strapi |
| `featured_products` | `featured_products` (Strapi Collection) | Relationship to products |
| `localized_content` | `metadata.translations` (Medusa) and localized Strapi entries | Handle in both systems |

### Customers

| Statamic/Simple Commerce Field | Medusa.js Field | Notes |
|-------------------------------|---------------|-------|
| `email` | `email` | Direct mapping |
| `password` | `password_hash` | Securely rehash passwords |
| `first_name` | `first_name` | Direct mapping |
| `last_name` | `last_name` | Direct mapping |
| `phone` | `phone` | Direct mapping |
| `addresses` | `addresses` | Complex mapping, see below |
| `notes` | `metadata.notes` | Store in metadata |
| `created_at` | `created_at` | Direct mapping |
| `updated_at` | `updated_at` | Direct mapping |
| `orders` | Relationship to orders | Maintain relationship |
| `customer_group` | `customer_groups` | Map to Medusa customer groups |
| `id` | `metadata.original_id` | Store original ID for reference |

#### Customer Addresses

| Statamic Field | Medusa.js Field | Notes |
|---------------|---------------|-------|
| `address1` | `address_1` | Direct mapping |
| `address2` | `address_2` | Direct mapping |
| `city` | `city` | Direct mapping |
| `state` | `province` | Direct mapping |
| `country` | `country_code` | Convert to ISO code if needed |
| `zip` | `postal_code` | Direct mapping |
| `phone` | `phone` | Direct mapping |
| `company` | `company` | Direct mapping |
| `is_default` | `is_default` | Boolean flag |
| `type` | `metadata.address_type` | Store in metadata |

### Orders

| Statamic/Simple Commerce Field | Medusa.js Field | Notes |
|-------------------------------|---------------|-------|
| `order_number` | `display_id` | Generate if needed |
| `status` | `status` | Map status values |
| `customer` | `customer_id` | Relationship to customer |
| `billing_address` | `billing_address` | Complex mapping |
| `shipping_address` | `shipping_address` | Complex mapping |
| `items` | `items` | Map to line items |
| `shipping_method` | `shipping_methods` | Map to shipping method |
| `payment_method` | `payments` | Map to payment method |
| `subtotal` | Calculate from items | Convert to cents |
| `shipping_total` | `shipping_total` | Convert to cents |
| `tax_total` | `tax_total` | Convert to cents |
| `coupon_total` | `discount_total` | Convert to cents |
| `grand_total` | `total` | Convert to cents |
| `notes` | `metadata.notes` | Store in metadata |
| `created_at` | `created_at` | Direct mapping |
| `updated_at` | `updated_at` | Direct mapping |
| `id` | `metadata.original_id` | Store original ID for reference |
| `site` | Related to region | Map to appropriate region |

#### Order Items

| Statamic Field | Medusa.js Field | Notes |
|---------------|---------------|-------|
| `product` | `variant_id` | Map to correct variant |
| `quantity` | `quantity` | Direct mapping |
| `price` | `unit_price` | Convert to cents |
| `total` | Calculate from price and quantity | Convert to cents |
| `metadata` | `metadata` | Preserve any custom data |

### Pages and Blog Posts

These will be mapped to Strapi content types:

| Statamic Field | Strapi Field | Notes |
|---------------|------------|-------|
| `title` | `title` | Direct mapping |
| `slug` | `slug` | Direct mapping |
| `content` | `content` | Convert to Strapi components |
| `featured_image` | `featuredImage` | Upload and reference |
| `seo` | `seo` | Map SEO fields |
| `author` | `author` | Relation to author |
| `published` | `publishedAt` | Date or null |
| `created_at` | `createdAt` | Direct mapping |
| `updated_at` | `updatedAt` | Direct mapping |
| `categories` | `categories` | Relations to categories |
| `tags` | `tags` | Relations to tags |
| `template` | `template` | Store template type |
| `site` | `locale` | Map to appropriate locale |
| `localized_versions` | Create localized entries | Create localized entries with relations |

### Navigation

Navigation menus will be mapped to Strapi navigation plugin:

| Statamic Field | Strapi Field | Notes |
|---------------|------------|-------|
| `title` | `title` | Direct mapping |
| `handle` | `handle` | Direct mapping |
| `items` | `items` | Complex mapping of nested structure |
| `site` | `locale` | Map to appropriate locale |
| `localized_versions` | Create localized entries | Create localized entries with relations |

### Global Settings

Global settings will be mapped to Strapi global type:

| Statamic Field | Strapi Field | Notes |
|---------------|------------|-------|
| `site_name` | `siteName` | Direct mapping |
| `contact_info` | `contactInfo` | Map nested object |
| `social_links` | `socialLinks` | Map to array of links |
| `footer_links` | `footerLinks` | Map to component structure |
| `legal_pages` | `legalPages` | Map to component structure |
| `scripts` | `scripts` | Store scripts |
| `site` | `locale` | Map to appropriate locale |
| `localized_versions` | Create localized entries | Create localized entries with relations |

## Multi-Region Mapping

### Regions

Create the following regions in Medusa.js:

| Name | Countries | Currency | Tax Rate |
|------|-----------|----------|---------|
| Netherlands | NL | EUR | 21% |
| Belgium | BE | EUR | 21% |
| Germany | DE | EUR | 19% |

### Sales Channels

Create the following sales channels in Medusa.js:

| Name | Domain | Regions |
|------|--------|---------|
| NL Online Store | nl.example.com | Netherlands |
| BE Online Store | be.example.com | Belgium |
| DE Online Store | de.example.com | Germany |

### Product Availability

Map product availability to sales channels:

| Statamic Field | Medusa.js Mapping | Notes |
|---------------|------------------|-------|
| `available_in_nl` | Add to 'NL Online Store' sales channel | Boolean flag in Statamic |
| `available_in_be` | Add to 'BE Online Store' sales channel | Boolean flag in Statamic |
| `available_in_de` | Add to 'DE Online Store' sales channel | Boolean flag in Statamic |
| `site` content | Add to corresponding sales channel | Based on site handle |

### Regional Pricing

Map regional pricing to the appropriate money amounts in Medusa.js:

| Statamic Field | Medusa.js Mapping | Notes |
|---------------|------------------|-------|
| `price_nl` | Create price for NL region | Convert to cents |
| `price_be` | Create price for BE region | Convert to cents |
| `price_de` | Create price for DE region | Convert to cents |
| Default `price` | Use for missing regional prices | Fallback pricing |

## Multi-Language Mapping

### Languages

Map languages to locales:

| Statamic Site | Locale Code |
|--------------|------------|
| Dutch | `nl` |
| English | `en` |
| French (Belgium) | `fr` |
| German | `de` |

### Content Localization

#### Medusa.js Localization

Store localized product data in Medusa.js metadata:

```json
{
  "title": "Product Title (Default)",
  "metadata": {
    "translations": {
      "nl": {
        "title": "Product Titel",
        "description": "Product beschrijving"
      },
      "en": {
        "title": "Product Title",
        "description": "Product description"
      },
      "fr": {
        "title": "Titre du Produit",
        "description": "Description du produit"
      },
      "de": {
        "title": "Produkttitel",
        "description": "Produktbeschreibung"
      }
    }
  }
}
```

#### Strapi Localization

Use Strapi's built-in localization system:

1. Set up the following locales in Strapi:
   - `nl` (Dutch)
   - `en` (English)
   - `fr` (French)
   - `de` (German)

2. Create localized entries for each content type with relations to the main entry

3. For product enrichment content, ensure localization is linked to the same Medusa product ID

## Content Structure Mapping

### Rich Text and Content Blocks

Convert Statamic content blocks to Strapi components:

| Statamic Block Type | Strapi Component | Notes |
|--------------------|-----------------|-------|
| `text` | `text` | Convert Markdown to structured format |
| `image` | `media` | Upload and reference image |
| `gallery` | `media.gallery` | Upload and reference multiple images |
| `video` | `media.video` | Map to video component |
| `quote` | `quote` | Map text and attribution |
| `code` | `code` | Preserve language and formatting |
| `table` | `table` | Convert to structured format |
| `button` | `cta` | Map text and link |
| `divider` | `divider` | Simple divider component |
| `html` | `html` | Preserve custom HTML |
| `accordion` | `accordion` | Map items to accordion items |
| `callout` | `callout` | Map content and style |
| Custom blocks | Create equivalent components | Match functionality |

### SEO Data

Map SEO data consistently across platforms:

| Statamic SEO Field | Medusa.js/Strapi Field | Notes |
|-------------------|------------------------|-------|
| `meta_title` | `metadata.seo.title` (Medusa) and `seo.title` (Strapi) | Map to both systems |
| `meta_description` | `metadata.seo.description` (Medusa) and `seo.description` (Strapi) | Map to both systems |
| `canonical_url` | `metadata.seo.canonical` (Medusa) and `seo.canonical` (Strapi) | Map to both systems |
| `og_title` | `metadata.seo.og_title` (Medusa) and `seo.ogTitle` (Strapi) | Map to both systems |
| `og_description` | `metadata.seo.og_description` (Medusa) and `seo.ogDescription` (Strapi) | Map to both systems |
| `og_image` | `metadata.seo.og_image` (Medusa) and `seo.ogImage` (Strapi) | Upload and reference image |
| `twitter_title` | `metadata.seo.twitter_title` (Medusa) and `seo.twitterTitle` (Strapi) | Map to both systems |
| `twitter_description` | `metadata.seo.twitter_description` (Medusa) and `seo.twitterDescription` (Strapi) | Map to both systems |
| `twitter_image` | `metadata.seo.twitter_image` (Medusa) and `seo.twitterImage` (Strapi) | Upload and reference image |
| `robots` | `metadata.seo.robots` (Medusa) and `seo.robots` (Strapi) | Map to both systems |

## Asset Mapping

### Images

| Statamic Asset | Medusa.js/Strapi Asset | Notes |
|---------------|------------------------|-------|
| Product images | Upload to Medusa and reference | Maintain order and relationships |
| Content images | Upload to Strapi and reference | Keep in content context |
| Thumbnails | Generate at multiple sizes | Create responsive image sets |

### File Naming

Follow this naming convention for migrated assets:

| Asset Type | Naming Pattern | Notes |
|-----------|---------------|-------|
| Product images | `product_{product_id}_{variant_id}_{index}.{ext}` | Include variant if applicable |
| Category images | `category_{category_id}_{index}.{ext}` | Maintain category association |
| Page images | `page_{page_id}_{index}.{ext}` | Associate with page |
| Blog images | `blog_{post_id}_{index}.{ext}` | Associate with blog post |
| General assets | `asset_{original_name}_{timestamp}.{ext}` | Preserve original name with timestamp |

## Relationship Preservation

### Product to Category

Map product-category relationships:

| Statamic Relationship | Medusa.js/Strapi Relationship | Notes |
|----------------------|------------------------------|-------|
| Product belongs to categories | Product added to categories | Many-to-many relationship |
| Category has featured products | Create in Strapi with references | Keep featured status |

### Product to Product

Map product relationships:

| Statamic Relationship | Medusa.js/Strapi Relationship | Notes |
|----------------------|------------------------------|-------|
| Related products | Store in metadata and Strapi | Bi-directional relationships |
| Upsell products | Store in metadata and Strapi | Promotional relationships |
| Alternative products | Store in metadata and Strapi | Product alternatives |

### Content Relationships

Map content relationships in Strapi:

| Statamic Relationship | Strapi Relationship | Notes |
|----------------------|-------------------|-------|
| Page to page | Create references | Parent/child relationships |
| Blog to category | Create references | Many-to-many relationship |
| Author to content | Create references | One-to-many relationship |
| Media to content | Create references | Maintain context |

## Special Cases

### Custom Fields

Map custom fields to appropriate locations:

| Statamic Custom Field | Target System | Mapping |
|----------------------|--------------|---------|
| Product specifications | Strapi ProductEnrichment | Convert to structured format |
| Custom product flags | Medusa.js metadata | Store as metadata flags |
| Warranty information | Strapi ProductEnrichment | Store in dedicated field |
| User preferences | Medusa.js customer metadata | Store in customer metadata |
| Region-specific content | Split between systems | Follow multi-region mapping |

### Discounts and Promotions

Map discounts to Medusa.js:

| Statamic Discount | Medusa.js Discount | Notes |
|------------------|------------------|-------|
| Percentage discount | Percentage discount | Match percentage amount |
| Fixed amount discount | Fixed amount discount | Convert to cents |
| Free shipping | Shipping discount | Configure similar rules |
| Buy X get Y | Requires custom implementation | Map as closely as possible |
| Coupon codes | Create equivalent codes | Maintain code values |
| Discount rules | Configure similar conditions | Match rule logic |

### Custom Checkout Fields

Map custom checkout fields:

| Statamic Checkout Field | Medusa.js Implementation | Notes |
|------------------------|--------------------------|-------|
| Custom order notes | Store in metadata | Map to order metadata |
| Gift message | Store in metadata | Map to order metadata |
| Delivery instructions | Store in shipping method metadata | Map to shipping metadata |
| Marketing consent | Map to customer metadata | Preserve consent status |

## Migration Validation Rules

For each entity type, apply these validation rules to ensure data integrity:

### Products

- All products must have a unique handle
- Required fields must be present (title, price)
- Variants must have unique SKUs
- All prices must be valid numbers
- Images must be successfully uploaded
- Related entities must exist (categories)

### Customers

- Email addresses must be unique
- Passwords must be securely hashed
- Addresses must have required fields

### Orders

- Must link to valid customers
- Must have valid line items
- Must have valid payment and shipping methods
- Totals must be accurate

## Data Transformation Logic

### Text Formatting

Apply these transformations to text fields:

- Convert Markdown to compatible format
- Sanitize HTML for security
- Normalize whitespace
- Handle special characters

### Number/Date Formatting

Apply these transformations to numbers and dates:

- Convert prices to cents (multiply by 100)
- Standardize date formats to ISO 8601
- Handle timezone differences

### URL Handling

Apply these transformations to URLs:

- Update internal links to new URL structure
- Create redirects for changed URLs
- Preserve URL parameters where needed

## Conclusion

This data mapping specification provides comprehensive guidance for migrating data from Statamic/Simple Commerce to Medusa.js/Strapi. It addresses entity mapping, multi-region and multi-language requirements, and special cases to ensure data integrity during the migration process. This document should be used in conjunction with the ETL workflow to implement the migration successfully. 