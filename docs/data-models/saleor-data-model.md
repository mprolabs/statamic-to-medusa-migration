# Saleor Data Models

This document outlines the data models to be used in Saleor for the migration from Statamic/Simple Commerce.

## 1. Core Product Structure

Saleor uses a hierarchical product structure with the following components:

### 1.1 Product Type

Product types define the structure of attributes for products and their variants. For example, "T-shirt" product type might include:

- **Product attributes**: Material, Description, Brand
- **Variant attributes**: Size, Color, Length

### 1.2 Product

The main product entity, which contains:

```yaml
# Core Product Fields
name: string                 # Product name
description: rich_text       # Product description (rich text format)
slug: string                 # URL slug/identifier
category: reference          # Category reference
collections: [reference]     # Collection references (can belong to multiple collections)
product_type: reference      # Product type reference which defines attributes
attributes: object           # Product-level attributes as defined by product type
seo_title: string            # SEO title
seo_description: string      # SEO description
media: [media_reference]     # Product images and media
metadata: JSON               # Custom metadata for extensions
private_metadata: JSON       # Private metadata (not exposed to storefront)
```

### 1.3 Product Variant

Individual sellable items with their own SKU, price, and stock information:

```yaml
# Core Variant Fields
name: string                # Variant name
sku: string                 # Stock keeping unit
attributes: object          # Variant-level attributes as defined by product type
media: [media_reference]    # Variant-specific media
weight: decimal             # Weight for shipping calculations
dimensions: object          # Dimensions (height, width, length)
metadata: JSON              # Custom metadata
private_metadata: JSON      # Private metadata

# Channel-specific data (repeated for each channel)
channel_listings: [
  {
    channel: reference      # Channel reference
    price: money            # Price in channel's currency
    cost_price: money       # Optional cost price for internal calculations
    available_for_purchase: boolean  # Whether variant can be purchased
    visible_in_listings: boolean     # Whether visible in listings
  }
]

# Stock information (per warehouse)
stocks: [
  {
    warehouse: reference    # Warehouse reference
    quantity: integer       # Available stock quantity
    allocated: integer      # Quantity allocated but not yet fulfilled
  }
]
```

## 2. Multi-Region Implementation (Channels)

Saleor uses channels to manage multi-region capabilities:

```yaml
# Channel Model
name: string                # Channel name
slug: string                # Channel identifier (e.g., "nl", "be", "de")
currency_code: string       # Currency for this channel (e.g., "EUR")
default_country: string     # Default country for this channel (ISO code)
is_active: boolean          # Whether the channel is active
```

Each channel can have its own:
- Product availability
- Product prices
- Shipping methods
- Payment methods
- Warehouses
- Tax settings

## 3. Multi-Language Implementation

Saleor handles translations through separate translation objects:

```yaml
# Translation Model (for various entities)
language_code: string        # Language code (e.g., "en", "nl", "de")
entity_id: ID                # ID of the entity being translated

# Translatable fields depend on the entity type
# For products:
name: string                 # Translated name
description: rich_text       # Translated description
seo_title: string            # Translated SEO title
seo_description: string      # Translated SEO description

# For categories/collections:
name: string                 # Translated name
description: string          # Translated description
```

Translation objects exist for:
- Products
- Product Variants
- Categories
- Collections
- Attributes
- Attribute Values
- Shipping Methods
- Pages
- Menu Items

## 4. Attribute System

Saleor uses a flexible attribute system to define product properties:

```yaml
# Attribute Model
name: string                 # Attribute name
slug: string                 # Attribute identifier
input_type: enum             # Type of input (dropdown, multiselect, file, rich text, etc.)
entity_type: enum            # What entity this attribute can be assigned to (product, variant, page)
unit: string                 # Optional unit for numeric attributes
is_required: boolean         # Whether this attribute is required
is_variant_only: boolean     # Whether this attribute is used for variants only
visible_in_storefront: boolean # Whether attribute is visible to customers
filterable_in_storefront: boolean # Whether attribute can be used for filtering
filterable_in_dashboard: boolean  # Whether attribute can be filtered in dashboard
value_required: boolean      # Whether value is required for this attribute
```

```yaml
# Attribute Value Model (for dropdown/multiselect)
attribute: reference         # Reference to parent attribute
name: string                 # Value name
slug: string                 # Value identifier
value: string                # Value content (depends on attribute type)
file_url: string             # URL to file (for file attributes)
rich_text: string            # Rich text content (for rich text attributes)
boolean: boolean             # Boolean value (for boolean attributes)
date_time: datetime          # Date/time value (for date attributes)
reference: ID                # Reference ID (for reference attributes)
```

## 5. Category and Collection System

### 5.1 Category

Hierarchical organization of products:

```yaml
# Category Model
name: string                 # Category name
slug: string                 # URL slug
description: rich_text       # Category description
background_image: image      # Category header image
parent: reference            # Parent category (for hierarchy)
seo_title: string            # SEO title
seo_description: string      # SEO description
metadata: JSON               # Custom metadata
```

### 5.2 Collection

Curated groups of products:

```yaml
# Collection Model
name: string                 # Collection name
slug: string                 # URL slug
description: rich_text       # Collection description
background_image: image      # Collection header image
seo_title: string            # SEO title
seo_description: string      # SEO description
metadata: JSON               # Custom metadata

# Channel-specific data
channel_listings: [
  {
    channel: reference        # Channel reference
    is_published: boolean     # Whether collection is published in this channel
    published_at: datetime    # When collection was/will be published
    visible_in_listings: boolean # Whether visible in listings
  }
]
```

## 6. Customer Model

```yaml
# Customer Model
email: string                # Customer email (unique)
first_name: string           # First name
last_name: string            # Last name
is_active: boolean           # Whether customer is active
date_joined: datetime        # When customer joined
default_shipping_address: reference  # Default shipping address
default_billing_address: reference   # Default billing address
note: string                 # Staff notes about customer
metadata: JSON               # Custom metadata
language_code: string        # Preferred language
```

## 7. Order Model

```yaml
# Order Model
id: ID                       # Order ID
token: string                # Order token (for public access)
created: datetime            # When order was created
status: enum                 # Order status
user: reference              # Customer reference (optional)
billing_address: address     # Billing address
shipping_address: address    # Shipping address
shipping_method: reference   # Shipping method used
shipping_price: money        # Shipping price
total_net: money             # Total net amount
total_gross: money           # Total gross amount
voucher: reference           # Applied voucher (if any)
discount_amount: money       # Discount amount
metadata: JSON               # Custom metadata
channel: reference           # Channel the order belongs to
language_code: string        # Language used during checkout

# Line items
lines: [
  {
    product_name: string     # Product name at time of purchase
    variant_name: string     # Variant name at time of purchase
    product_sku: string      # Product SKU
    quantity: integer        # Quantity ordered
    unit_price_net: money    # Unit net price
    unit_price_gross: money  # Unit gross price
    total_price_net: money   # Total net price
    total_price_gross: money # Total gross price
    tax_rate: decimal        # Tax rate
    product: reference       # Product reference
    variant: reference       # Variant reference
    translated_product_name: string  # Translated product name
    translated_variant_name: string  # Translated variant name
    metadata: JSON           # Custom metadata
  }
]

# Payments
payments: [
  {
    gateway: string          # Payment gateway
    amount: money            # Payment amount
    is_active: boolean       # Whether payment is active
    created: datetime        # When payment was created
    modified: datetime       # When payment was last modified
    charge_status: enum      # Payment charge status
    transactions: [          # Payment transactions
      {
        amount: money        # Transaction amount
        kind: enum           # Transaction type
        gateway_response: JSON # Gateway response
        created: datetime    # When transaction was created
        token: string        # Transaction token
      }
    ]
  }
]

# Fulfillments
fulfillments: [
  {
    tracking_number: string  # Shipping tracking number
    created: datetime        # When fulfillment was created
    status: enum             # Fulfillment status
    lines: [                 # Fulfilled lines
      {
        order_line: reference # Order line reference
        quantity: integer     # Quantity fulfilled
      }
    ]
  }
]
```

## 8. Tax Configuration

```yaml
# Tax Configuration (per channel)
charge_taxes: boolean        # Whether to charge taxes
tax_calculation_strategy: enum # Strategy for tax calculation
prices_entered_with_tax: boolean # Whether prices include tax
display_gross_prices: boolean # Whether to display gross prices
```

## 9. Warehouse Model

```yaml
# Warehouse Model
name: string                 # Warehouse name
slug: string                 # Warehouse slug
email: string                # Contact email
address: address             # Warehouse address
metadata: JSON               # Custom metadata
```

## 10. Integration with Multi-Region, Multi-Language Requirements

### 10.1 Channel-Based Multi-Region Support

For our specific migration with regions NL, BE, and DE:

```yaml
# Channel Configuration for Multi-Region
channels: [
  {
    name: "Netherlands",
    slug: "nl",
    currency_code: "EUR",
    default_country: "NL"
  },
  {
    name: "Belgium",
    slug: "be",
    currency_code: "EUR",
    default_country: "BE"
  },
  {
    name: "Germany",
    slug: "de",
    currency_code: "EUR",
    default_country: "DE"
  }
]
```

### 10.2 Multi-Language Support

For our language requirements (NL, DE, FR, EN):

```yaml
# Language Configuration
languages: [
  {
    code: "nl",
    name: "Dutch"
  },
  {
    code: "de",
    name: "German"
  },
  {
    code: "fr",
    name: "French"
  },
  {
    code: "en",
    name: "English"
  }
]

# Language Mapping to Channels
language_channel_mapping: {
  "nl": ["nl", "be"],       # Dutch used in Netherlands and Belgium
  "de": ["de"],             # German used in Germany
  "fr": ["be"],             # French used in Belgium
  "en": ["nl", "be", "de"]  # English used everywhere as fallback
}
``` 