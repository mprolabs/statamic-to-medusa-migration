# Entity-Relationship Diagram: Medusa.js and Strapi Integration

## Overview

This document presents the Entity-Relationship Diagrams (ERDs) for our multi-region, multi-language e-commerce implementation using Medusa.js and Strapi CMS. These diagrams illustrate the core data models, relationships, and integration points between both systems.

## Medusa.js Core Entities

```mermaid
erDiagram
    PRODUCT {
        string id PK
        string title
        string handle
        string description
        string status
        string thumbnail
        bool is_giftcard
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    PRODUCT_VARIANT {
        string id PK
        string title
        string product_id FK
        string sku
        string barcode
        string ean
        string upc
        int inventory_quantity
        bool allow_backorder
        bool manage_inventory
        int weight
        int length
        int height
        int width
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    PRODUCT_OPTION {
        string id PK
        string title
        string product_id FK
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    PRODUCT_OPTION_VALUE {
        string id PK
        string value
        string option_id FK
        string variant_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    REGION {
        string id PK
        string name
        string currency_code
        float tax_rate
        string tax_code
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    COUNTRY {
        string id PK
        string iso_2
        string iso_3
        string num_code
        string name
        string display_name
        string region_id FK
    }
    
    PRICE {
        string id PK
        string region_id FK
        string currency_code
        int amount
        int min_quantity
        int max_quantity
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    MONEY_AMOUNT {
        string id PK
        string currency_code
        int amount
        string variant_id FK
        string region_id FK
        string price_list_id FK
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    CUSTOMER {
        string id PK
        string email
        string first_name
        string last_name
        string billing_address_id FK
        string password_hash
        string phone
        bool has_account
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    ORDER {
        string id PK
        string status
        string customer_id FK
        string billing_address_id FK
        string shipping_address_id FK
        string region_id FK
        string currency_code
        int tax_rate
        timestamp created_at
        timestamp updated_at
    }
    
    CART {
        string id PK
        string email
        string billing_address_id FK
        string shipping_address_id FK
        string region_id FK
        string customer_id FK
        string payment_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    PAYMENT {
        string id PK
        string cart_id FK
        string order_id FK
        string amount
        string currency_code
        string provider_id
        string data
        timestamp created_at
        timestamp updated_at
    }
    
    SALES_CHANNEL {
        string id PK
        string name
        string description
        bool is_disabled
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    PRODUCT ||--o{ PRODUCT_VARIANT : has
    PRODUCT ||--o{ PRODUCT_OPTION : has
    PRODUCT_OPTION ||--o{ PRODUCT_OPTION_VALUE : has
    PRODUCT_VARIANT ||--o{ PRODUCT_OPTION_VALUE : has
    PRODUCT_VARIANT ||--o{ MONEY_AMOUNT : has
    REGION ||--o{ COUNTRY : contains
    REGION ||--o{ MONEY_AMOUNT : has
    CUSTOMER ||--o{ ORDER : places
    CUSTOMER ||--o{ CART : has
    CART ||--|| PAYMENT : has
    ORDER ||--|| PAYMENT : has
    PRODUCT ||--o{ SALES_CHANNEL : "available in"
```

## Strapi CMS Entities

```mermaid
erDiagram
    CONTENT_TYPE {
        int id PK
        string name
        string apiID
        json schema
        datetime created_at
        datetime updated_at
    }
    
    PRODUCT_CONTENT {
        int id PK
        string product_id FK
        text extended_description
        json specifications
        json meta_data
        json assets
        json seo
        boolean is_featured
        json related_content
        datetime created_at
        datetime updated_at
    }
    
    PAGE {
        int id PK
        string title
        string slug
        text content
        json meta
        json seo
        string layout
        datetime published_at
        datetime created_at
        datetime updated_at
    }
    
    BLOG_POST {
        int id PK
        string title
        string slug
        text content
        string excerpt
        json featured_image
        string author
        json categories
        json tags
        datetime published_at
        datetime created_at
        datetime updated_at
    }
    
    NAVIGATION {
        int id PK
        string title
        json items
        string location
        datetime created_at
        datetime updated_at
    }
    
    REGION_CONTENT {
        int id PK
        string region_code
        json content_mappings
        json region_specific_assets
        boolean active
        datetime created_at
        datetime updated_at
    }
    
    LOCALE {
        int id PK
        string name
        string code
        boolean is_default
        datetime created_at
        datetime updated_at
    }
    
    LOCALIZATION {
        int id PK
        string related_id
        string related_type
        string locale FK
        json localized_fields
        datetime created_at
        datetime updated_at
    }
    
    MEDIA_LIBRARY {
        int id PK
        string name
        string alternativeText
        string caption
        string mime
        json formats
        string url
        datetime created_at
        datetime updated_at
    }
    
    PRODUCT_CONTENT ||--o{ MEDIA_LIBRARY : uses
    PAGE ||--o{ MEDIA_LIBRARY : uses
    BLOG_POST ||--o{ MEDIA_LIBRARY : uses
    PAGE ||--o{ LOCALIZATION : "translated in"
    BLOG_POST ||--o{ LOCALIZATION : "translated in"
    PRODUCT_CONTENT ||--o{ LOCALIZATION : "translated in"
    LOCALE ||--o{ LOCALIZATION : "used for"
    REGION_CONTENT ||--o{ PRODUCT_CONTENT : "customizes for"
    REGION_CONTENT ||--o{ PAGE : "customizes for"
    CONTENT_TYPE ||--o{ PRODUCT_CONTENT : "defines"
    CONTENT_TYPE ||--o{ PAGE : "defines"
    CONTENT_TYPE ||--o{ BLOG_POST : "defines"
    CONTENT_TYPE ||--o{ NAVIGATION : "defines"
    CONTENT_TYPE ||--o{ REGION_CONTENT : "defines"
```

## Integration Points

```mermaid
erDiagram
    MEDUSA_PRODUCT {
        string id PK
        string title
        string handle
        string description
    }
    
    STRAPI_PRODUCT_CONTENT {
        int id PK
        string medusa_product_id FK
        text extended_description
        json specifications
        json seo
    }
    
    MEDUSA_REGION {
        string id PK
        string name
        string currency_code
    }
    
    STRAPI_REGION_CONTENT {
        int id PK
        string medusa_region_id FK
        json content_mappings
        json region_specific_assets
    }
    
    MEDUSA_PRODUCT ||--|| STRAPI_PRODUCT_CONTENT : "extended by"
    MEDUSA_REGION ||--|| STRAPI_REGION_CONTENT : "extended by"
```

## Multi-Region Structure

```mermaid
erDiagram
    STORE {
        string id PK
        string name
        string domain
    }
    
    REGION {
        string id PK
        string name
        string currency_code
        float tax_rate
    }
    
    SALES_CHANNEL {
        string id PK
        string name
        bool is_disabled
    }
    
    LOCALE {
        int id PK
        string code
        bool is_default
    }
    
    STORE ||--o{ REGION : supports
    STORE ||--o{ SALES_CHANNEL : has
    STORE ||--o{ LOCALE : supports
```

## Data Migration Mappings

```mermaid
flowchart TD
    subgraph Statamic
        SC_Product[Simple Commerce Product]
        SC_Variant[Simple Commerce Variant]
        SC_Collection[Simple Commerce Collection]
        SC_Customer[Simple Commerce Customer]
        SC_Order[Simple Commerce Order]
        StatamicPage[Statamic Page]
        StatamicEntry[Statamic Entry]
        StatamicAsset[Statamic Asset]
    end
    
    subgraph Medusa
        MedusaProduct[Medusa Product]
        MedusaVariant[Medusa Product Variant]
        MedusaCollection[Medusa Collection]
        MedusaCustomer[Medusa Customer]
        MedusaOrder[Medusa Order]
        MedusaRegion[Medusa Region]
    end
    
    subgraph Strapi
        StrapiProductContent[Strapi Product Content]
        StrapiPage[Strapi Page]
        StrapiPost[Strapi Blog Post]
        StrapiMedia[Strapi Media Library]
        StrapiRegionContent[Strapi Region Content]
    end
    
    SC_Product --> MedusaProduct
    SC_Product --> StrapiProductContent
    SC_Variant --> MedusaVariant
    SC_Collection --> MedusaCollection
    SC_Customer --> MedusaCustomer
    SC_Order --> MedusaOrder
    StatamicPage --> StrapiPage
    StatamicEntry --> StrapiPost
    StatamicAsset --> StrapiMedia
    StatamicPage --> StrapiRegionContent
```

## Indexing and Performance Considerations

- Primary indexes on all ID fields
- Secondary indexes on:
  - Product handles
  - SKUs and barcodes
  - Email addresses
  - Currency codes
  - Region identifiers

- Composite indexes on:
  - (product_id, variant_id) for quick variant lookup
  - (region_id, currency_code) for region-specific pricing
  - (locale, entity_id) for fast translation lookup

## Migration Tracking Fields

All entities in both Medusa.js and Strapi will include these additional fields for migration tracking:

- `migration_source_id`: Reference to original Statamic ID
- `migration_status`: Enum (pending, in_progress, completed, error)
- `migration_notes`: Text field for any migration-specific notes
- `last_synced_at`: Timestamp of last synchronization
- `data_verified`: Boolean indicating if data has been verified

This ERD provides a comprehensive overview of our data structure across both Medusa.js and Strapi CMS, highlighting key entities, relationships, and integration points essential for our multi-region e-commerce implementation. 