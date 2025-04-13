# Database Schema Design

## Overview

This document outlines the database schema design for both Medusa.js and Strapi components of our multi-region, multi-language ecommerce solution. It includes entity relationships, key fields, and special considerations for the migration from Statamic/Simple Commerce.

## Medusa.js Database Schema

Medusa.js uses PostgreSQL as its primary database. The schema includes the following key entities:

### Core Entities

#### Region

```
Region {
  id: string
  name: string
  currency_code: string
  tax_rate: number
  payment_providers: PaymentProvider[]
  fulfillment_providers: FulfillmentProvider[]
  countries: Country[]
  tax_provider_id: string
  created_at: Date
  updated_at: Date
  deleted_at: Date
  metadata: Record<string, unknown>
}
```

**Migration Notes:**
- Create separate regions for Netherlands (NL), Belgium (BE), and Germany (DE)
- Configure region-specific payment providers and tax rates
- Store language preferences in metadata

#### Store

```
Store {
  id: string
  name: string
  default_currency_code: string
  currencies: Currency[]
  swap_link_template: string
  payment_link_template: string
  invite_link_template: string
  default_sales_channel_id: string
  sales_channels: SalesChannel[]
  created_at: Date
  updated_at: Date
  metadata: Record<string, unknown>
}
```

**Migration Notes:**
- Store will be used as the global container for all regions
- Region-specific details handled by Region entities
- Metadata will store additional migration-related information

#### Product

```
Product {
  id: string
  title: string
  subtitle: string
  description: string
  handle: string
  is_giftcard: boolean
  status: ProductStatus
  images: Image[]
  thumbnail: string
  options: ProductOption[]
  variants: ProductVariant[]
  categories: ProductCategory[]
  profile_id: string
  profile: ShippingProfile
  weight: number
  length: number
  height: number
  width: number
  hs_code: string
  origin_country: string
  mid_code: string
  material: string
  collection_id: string
  collection: ProductCollection
  type_id: string
  type: ProductType
  tags: ProductTag[]
  discountable: boolean
  external_id: string
  sales_channels: SalesChannel[]
  created_at: Date
  updated_at: Date
  deleted_at: Date
  metadata: Record<string, unknown>
}
```

**Migration Notes:**
- `handle` will preserve the Statamic slug where possible
- `external_id` will store the original Statamic ID for reference
- `metadata` will store:
  - Translations for title, subtitle, description
  - SEO data (meta title, description)
  - Original Statamic path
  - Region-specific display settings

#### ProductVariant

```
ProductVariant {
  id: string
  title: string
  product_id: string
  product: Product
  prices: MoneyAmount[]
  sku: string
  barcode: string
  ean: string
  upc: string
  variant_rank: number
  inventory_quantity: number
  allow_backorder: boolean
  manage_inventory: boolean
  hs_code: string
  origin_country: string
  mid_code: string
  material: string
  weight: number
  length: number
  height: number
  width: number
  options: ProductOptionValue[]
  created_at: Date
  updated_at: Date
  deleted_at: Date
  metadata: Record<string, unknown>
}
```

**Migration Notes:**
- Variant prices will be created for each region
- Inventory will be synchronized across regions unless specified otherwise in metadata
- Region-specific pricing stored in the MoneyAmount entity

#### MoneyAmount

```
MoneyAmount {
  id: string
  currency_code: string
  amount: number
  min_quantity: number
  max_quantity: number
  price_list_id: string
  price_list: PriceList
  variant_id: string
  variant: ProductVariant
  region_id: string
  created_at: Date
  updated_at: Date
  deleted_at: Date
}
```

**Migration Notes:**
- Create variant prices for each region's currency
- Convert Statamic prices to cents (×100) for Medusa storage

#### Customer

```
Customer {
  id: string
  email: string
  first_name: string
  last_name: string
  billing_address_id: string
  billing_address: Address
  shipping_addresses: Address[]
  password_hash: string
  phone: string
  has_account: boolean
  orders: Order[]
  created_at: Date
  updated_at: Date
  deleted_at: Date
  metadata: Record<string, unknown>
}
```

**Migration Notes:**
- Password hashes cannot be migrated; set `has_account` but trigger password reset flow
- Store original customer ID in `metadata` for reference
- Define region preferences in `metadata`

#### SalesChannel

```
SalesChannel {
  id: string
  name: string
  description: string
  is_disabled: boolean
  products: Product[]
  created_at: Date
  updated_at: Date
  deleted_at: Date
}
```

**Migration Notes:**
- Create separate sales channels for each domain/region:
  - nl.newstore.com
  - be.newstore.com
  - de.newstore.com
- Assign products to appropriate sales channels based on original availability

### Custom Extensions

In addition to the core Medusa.js schema, we will implement the following custom extensions:

#### ProductTranslation (Custom Entity)

```
ProductTranslation {
  id: string
  product_id: string
  language_code: string
  title: string
  subtitle: string
  description: string
  created_at: Date
  updated_at: Date
}
```

**Migration Notes:**
- Create entries for all supported languages per region
- Implement custom API endpoints to serve translated content

#### RegionConfiguration (Custom Entity)

```
RegionConfiguration {
  id: string
  region_id: string
  key: string
  value: string
  created_at: Date
  updated_at: Date
}
```

**Migration Notes:**
- Store region-specific configuration settings
- Include language preferences, shipping rules, etc.

## Strapi Database Schema

Strapi uses either SQLite (development) or PostgreSQL (production) and provides a content management interface for defining content types. The following content types will be configured:

### Core Content Types

#### Collection

```
Collection {
  id: number
  name: string
  slug: string
  description: text
  parent: relation (self-referencing)
  children: relation[] (self-referencing)
  featured_image: media
  banner_image: media
  products: relation[] (to Medusa products via API)
  seo: component {
    meta_title: string
    meta_description: text
    canonical_url: string
    og_image: media
  }
  created_at: datetime
  updated_at: datetime
  published_at: datetime
  created_by: relation
  updated_by: relation
}
```

**Localization:**
- Enable internationalization for all fields
- Configure for nl, en, fr, de locales

#### Page

```
Page {
  id: number
  title: string
  slug: string
  content: richtext
  template: enumeration
  parent: relation (self-referencing)
  children: relation[] (self-referencing)
  featured_image: media
  sections: component[] (flexible content blocks)
  seo: component {
    meta_title: string
    meta_description: text
    canonical_url: string
    og_image: media
  }
  created_at: datetime
  updated_at: datetime
  published_at: datetime
  created_by: relation
  updated_by: relation
}
```

**Localization:**
- Enable internationalization for all fields
- Configure for nl, en, fr, de locales

#### Navigation

```
Navigation {
  id: number
  name: string
  slug: string
  items: component[] {
    title: string
    url: string
    page: relation
    collection: relation
    external: boolean
    target: enumeration
    children: component[] (self-referencing)
  }
  created_at: datetime
  updated_at: datetime
  published_at: datetime
  created_by: relation
  updated_by: relation
}
```

**Localization:**
- Enable internationalization for navigation items
- Configure for nl, en, fr, de locales

#### GlobalSettings

```
GlobalSettings {
  id: number
  site_name: string
  contact_email: string
  contact_phone: string
  social_links: component[] {
    platform: enumeration
    url: string
  }
  footer_text: text
  cookie_notice: text
  scripts: text
  region_specific: component[] {
    region: enumeration (NL, BE, DE)
    settings: json
  }
  created_at: datetime
  updated_at: datetime
  published_at: datetime
  created_by: relation
  updated_by: relation
}
```

**Localization:**
- Enable internationalization for text fields
- Configure for nl, en, fr, de locales

#### ProductEnrichment

```
ProductEnrichment {
  id: number
  medusa_id: string (reference to Medusa product ID)
  extended_description: richtext
  specifications: component[] {
    name: string
    value: string
  }
  FAQ: component[] {
    question: string
    answer: text
  }
  related_content: relation[] (Pages, Blog posts)
  videos: component[] {
    title: string
    url: string
    thumbnail: media
  }
  downloads: media[]
  created_at: datetime
  updated_at: datetime
  published_at: datetime
  created_by: relation
  updated_by: relation
}
```

**Localization:**
- Enable internationalization for all content fields
- Configure for nl, en, fr, de locales

#### BlogPost

```
BlogPost {
  id: number
  title: string
  slug: string
  excerpt: text
  content: richtext
  featured_image: media
  categories: relation[]
  tags: relation[]
  author: relation
  related_products: relation[] (to Medusa products via API)
  seo: component {
    meta_title: string
    meta_description: text
    canonical_url: string
    og_image: media
  }
  created_at: datetime
  updated_at: datetime
  published_at: datetime
  created_by: relation
  updated_by: relation
}
```

**Localization:**
- Enable internationalization for all content fields
- Configure for nl, en, fr, de locales

### Custom Components

#### SEO Component

```
SEO {
  meta_title: string
  meta_description: text
  canonical_url: string
  og_image: media
  structured_data: json
}
```

#### Flexible Content Section Component

```
ContentSection {
  section_type: enumeration (hero, featured_products, text_block, image_gallery, etc.)
  title: string
  subtitle: string
  content: richtext
  background_color: string
  text_color: string
  media: media
  products: relation[] (to Medusa products via API)
  button: component {
    text: string
    url: string
    style: enumeration
  }
  settings: json
}
```

## Database Integration Strategy

### Medusa.js ↔ Strapi Connection

The integration between Medusa.js and Strapi will be implemented using:

1. **API Integration**: Custom endpoints in both systems to exchange data
2. **Webhook Synchronization**: Events in one system trigger updates in the other
3. **Shared Product IDs**: Strapi content references Medusa.js product IDs

### Multi-Region Data Handling

Each region will be configured with:

1. **Region-specific sales channels** in Medusa.js
2. **Region-specific content** in Strapi (via localization)
3. **Custom metadata** for region-specific product attributes

## Migration Strategy

The database migration will follow these steps:

1. **Schema Preparation**: Set up Medusa.js and Strapi schemas
2. **Data Extraction**: Export from Statamic/Simple Commerce
3. **Data Transformation**: Convert to new schema format
4. **Data Loading**: Import transformed data
5. **Verification**: Validate data integrity

## Schema Evolution Plan

The database schema may evolve over time to accommodate:

1. **New Features**: Additional entities for enhanced functionality
2. **Performance Optimization**: Indexes and query optimizations
3. **Integration Improvements**: Enhanced cross-system references

## Security Considerations

1. **Data Encryption**: Sensitive data will be encrypted at rest
2. **Access Control**: Role-based access controls for both systems
3. **API Authentication**: Secure token-based authentication between systems

## Backup Strategy

1. **Regular Backups**: Daily automated backups of both databases
2. **Point-in-Time Recovery**: Ability to restore to specific points in time
3. **Cross-Region Redundancy**: Data backed up across multiple geographic regions 