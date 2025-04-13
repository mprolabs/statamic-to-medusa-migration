# Data Models for Migration Target Systems

## Overview

This document defines the data models for Medusa.js and Strapi that will be used in the migration from Statamic/Simple Commerce. These models are designed to support multi-region and multi-language requirements while ensuring data integrity and optimal performance.

## Medusa.js Data Models

Medusa.js provides a set of built-in entities that we will use with some customizations to support our specific requirements.

### Product

The product entity in Medusa.js will be structured as follows:

```typescript
interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  subtitle: string | null;
  status: "draft" | "published" | "rejected";
  images: Image[];
  thumbnail: string | null;
  options: ProductOption[];
  variants: ProductVariant[];
  categories: ProductCategory[];
  tags: ProductTag[];
  discountable: boolean;
  collection_id: string | null;
  collection: ProductCollection | null;
  weight: number | null;
  length: number | null;
  height: number | null;
  width: number | null;
  hs_code: string | null;
  origin_country: string | null;
  mid_code: string | null;
  material: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  metadata: {
    original_id?: string;
    original_url?: string;
    seo?: {
      title?: string;
      description?: string;
      canonical?: string;
      og_title?: string;
      og_description?: string;
      og_image?: string;
      twitter_title?: string;
      twitter_description?: string;
      twitter_image?: string;
      robots?: string;
    };
    translations?: {
      [locale: string]: {
        title?: string;
        subtitle?: string;
        description?: string;
      }
    };
    specifications?: {
      name: string;
      value: string;
    }[];
    features?: string[];
    warranty_info?: string;
  };
}
```

### ProductVariant

Product variants will be structured as follows:

```typescript
interface ProductVariant {
  id: string;
  title: string;
  product_id: string;
  product: Product;
  sku: string | null;
  barcode: string | null;
  ean: string | null;
  upc: string | null;
  inventory_quantity: number;
  allow_backorder: boolean;
  manage_inventory: boolean;
  hs_code: string | null;
  origin_country: string | null;
  mid_code: string | null;
  material: string | null;
  weight: number | null;
  length: number | null;
  height: number | null;
  width: number | null;
  options: ProductOptionValue[];
  prices: MoneyAmount[];
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  metadata: {
    original_id?: string;
    original_variant_id?: string;
    translated_options?: {
      [locale: string]: {
        [option_id: string]: string;
      }
    };
  };
}
```

### MoneyAmount (Prices)

Prices will be structured with multi-region support:

```typescript
interface MoneyAmount {
  id: string;
  currency_code: string;
  amount: number;
  min_quantity: number | null;
  max_quantity: number | null;
  price_list_id: string | null;
  price_list: PriceList | null;
  variant_id: string;
  variant: ProductVariant;
  region_id: string | null;
  region: Region | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
```

### Region

Regions will be configured for multi-region support:

```typescript
interface Region {
  id: string;
  name: string;
  currency_code: string;
  tax_rate: number;
  tax_code: string | null;
  gift_cards_taxable: boolean;
  automatic_taxes: boolean;
  tax_provider_id: string | null;
  tax_provider: TaxProvider | null;
  countries: Country[];
  payment_providers: PaymentProvider[];
  fulfillment_providers: FulfillmentProvider[];
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  metadata: Record<string, unknown>;
}
```

### SalesChannel

Sales channels will be used for multi-domain support:

```typescript
interface SalesChannel {
  id: string;
  name: string;
  description: string | null;
  is_disabled: boolean;
  products: Product[];
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  metadata: {
    domain?: string;
    language?: string;
    allowed_regions?: string[];
  };
}
```

### Category

Categories will be structured as follows:

```typescript
interface ProductCategory {
  id: string;
  name: string;
  handle: string;
  parent_category_id: string | null;
  parent_category: ProductCategory | null;
  category_children: ProductCategory[];
  products: Product[];
  rank: number;
  created_at: Date;
  updated_at: Date;
  metadata: {
    description?: string;
    thumbnail?: string;
    original_id?: string;
    seo?: {
      title?: string;
      description?: string;
      canonical?: string;
      og_title?: string;
      og_description?: string;
      og_image?: string;
    };
    translations?: {
      [locale: string]: {
        name?: string;
        description?: string;
      }
    };
  };
}
```

### Customer

Customers will be structured with multi-region support:

```typescript
interface Customer {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  billing_address_id: string | null;
  billing_address: Address | null;
  shipping_addresses: Address[];
  phone: string | null;
  has_account: boolean;
  password_hash: string | null;
  groups: CustomerGroup[];
  orders: Order[];
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  metadata: {
    original_id?: string;
    preferred_language?: string;
    preferred_region?: string;
    notes?: string;
    marketing_consent?: boolean;
    consent_timestamp?: string;
  };
}
```

### Order

Orders will be structured with multi-region support:

```typescript
interface Order {
  id: string;
  status: OrderStatus;
  fulfillment_status: FulfillmentStatus;
  payment_status: PaymentStatus;
  display_id: string;
  cart_id: string | null;
  cart: Cart | null;
  customer_id: string | null;
  customer: Customer | null;
  email: string;
  billing_address_id: string | null;
  billing_address: Address | null;
  shipping_address_id: string | null;
  shipping_address: Address | null;
  region_id: string;
  region: Region;
  currency_code: string;
  tax_rate: number | null;
  items: LineItem[];
  payments: Payment[];
  shipping_methods: ShippingMethod[];
  fulfillments: Fulfillment[];
  discounts: Discount[];
  gift_cards: GiftCard[];
  gift_card_transactions: GiftCardTransaction[];
  canceled_at: Date | null;
  subtotal: number;
  shipping_total: number;
  discount_total: number;
  tax_total: number;
  refunded_total: number;
  total: number;
  created_at: Date;
  updated_at: Date;
  metadata: {
    original_id?: string;
    original_order_number?: string;
    notes?: string;
    gift_message?: string;
    delivery_instructions?: string;
    source?: string;
  };
}
```

## Strapi Data Models

Strapi will be used to manage content-rich data and localized content. The following content types will be created:

### ProductEnrichment

```typescript
interface ProductEnrichment {
  id: number;
  medusa_id: string; // Reference to Medusa product ID
  title: string;
  content: any[]; // Rich text components
  specifications: {
    name: string;
    value: string;
  }[];
  features: string[];
  media: {
    id: number;
    name: string;
    alternativeText: string;
    caption: string;
    width: number;
    height: number;
    formats: Record<string, any>;
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: string | null;
    provider: string;
    provider_metadata: Record<string, any> | null;
    related: {
      id: number;
      __component: string;
    }[];
    createdAt: string;
    updatedAt: string;
  }[];
  downloads: {
    id: number;
    name: string;
    alternativeText: string;
    caption: string;
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: string | null;
    provider: string;
    provider_metadata: Record<string, any> | null;
    createdAt: string;
    updatedAt: string;
  }[];
  seo: {
    title: string;
    description: string;
    canonical: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImage: {
      id: number;
      url: string;
    } | null;
    twitterTitle: string | null;
    twitterDescription: string | null;
    twitterImage: {
      id: number;
      url: string;
    } | null;
    robots: string | null;
  };
  locale: string;
  localizations: {
    id: number;
    locale: string;
  }[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
```

### CategoryEnrichment

```typescript
interface CategoryEnrichment {
  id: number;
  medusa_id: string; // Reference to Medusa category ID
  title: string;
  description: string;
  content: any[]; // Rich text components
  images: {
    id: number;
    url: string;
  }[];
  featured_products: {
    id: number;
    medusa_id: string;
  }[];
  seo: {
    title: string;
    description: string;
    canonical: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImage: {
      id: number;
      url: string;
    } | null;
    twitterTitle: string | null;
    twitterDescription: string | null;
    twitterImage: {
      id: number;
      url: string;
    } | null;
    robots: string | null;
  };
  locale: string;
  localizations: {
    id: number;
    locale: string;
  }[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
```

### Page

```typescript
interface Page {
  id: number;
  title: string;
  slug: string;
  content: any[]; // Rich text components
  featuredImage: {
    id: number;
    url: string;
  } | null;
  seo: {
    title: string;
    description: string;
    canonical: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImage: {
      id: number;
      url: string;
    } | null;
    twitterTitle: string | null;
    twitterDescription: string | null;
    twitterImage: {
      id: number;
      url: string;
    } | null;
    robots: string | null;
  };
  template: string | null;
  parent: {
    id: number;
    title: string;
  } | null;
  children: {
    id: number;
    title: string;
  }[];
  original_id: string | null;
  locale: string;
  localizations: {
    id: number;
    locale: string;
  }[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
```

### BlogPost

```typescript
interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: any[]; // Rich text components
  excerpt: string;
  featuredImage: {
    id: number;
    url: string;
  } | null;
  author: {
    id: number;
    name: string;
  } | null;
  categories: {
    id: number;
    title: string;
  }[];
  tags: {
    id: number;
    name: string;
  }[];
  seo: {
    title: string;
    description: string;
    canonical: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImage: {
      id: number;
      url: string;
    } | null;
    twitterTitle: string | null;
    twitterDescription: string | null;
    twitterImage: {
      id: number;
      url: string;
    } | null;
    robots: string | null;
  };
  original_id: string | null;
  locale: string;
  localizations: {
    id: number;
    locale: string;
  }[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
```

### Navigation

```typescript
interface Navigation {
  id: number;
  title: string;
  handle: string;
  items: {
    id: number;
    title: string;
    path: string;
    target: string | null;
    items: any[]; // Recursive navigation items
  }[];
  locale: string;
  localizations: {
    id: number;
    locale: string;
  }[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
```

### GlobalSetting

```typescript
interface GlobalSetting {
  id: number;
  siteName: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  socialLinks: {
    platform: string;
    url: string;
    icon: string;
  }[];
  footerLinks: {
    id: number;
    title: string;
    links: {
      id: number;
      label: string;
      url: string;
    }[];
  }[];
  legalPages: {
    id: number;
    title: string;
    slug: string;
  }[];
  scripts: {
    location: "head" | "body";
    content: string;
  }[];
  locale: string;
  localizations: {
    id: number;
    locale: string;
  }[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
```

## Multi-Region Configuration

### Medusa.js Configuration

#### Regions

The following regions will be configured in Medusa.js:

1. **Netherlands Region**
   - Currency: EUR
   - Countries: NL
   - Tax Rate: 21%
   - Payment Providers: iDeal, Credit Card, PayPal
   - Fulfillment Providers: Standard Shipping, Express Shipping

2. **Belgium Region**
   - Currency: EUR
   - Countries: BE
   - Tax Rate: 21%
   - Payment Providers: Bancontact, Credit Card, PayPal
   - Fulfillment Providers: Standard Shipping, Express Shipping

3. **Germany Region**
   - Currency: EUR
   - Countries: DE
   - Tax Rate: 19%
   - Payment Providers: SOFORT, Credit Card, PayPal
   - Fulfillment Providers: Standard Shipping, Express Shipping

#### Sales Channels

The following sales channels will be configured in Medusa.js:

1. **NL Online Store**
   - Metadata:
     - domain: nl.example.com
     - language: nl
     - allowed_regions: ["Netherlands"]

2. **BE Online Store**
   - Metadata:
     - domain: be.example.com
     - language: fr
     - allowed_regions: ["Belgium"]

3. **DE Online Store**
   - Metadata:
     - domain: de.example.com
     - language: de
     - allowed_regions: ["Germany"]

### Strapi Configuration

#### Locales

The following locales will be configured in Strapi:

1. Dutch (`nl`) - Default
2. English (`en`)
3. French (`fr`)
4. German (`de`)

## Component Structure

### Strapi Components

The following components will be created in Strapi for rich content:

#### Text Component

```json
{
  "collectionName": "components_content_texts",
  "info": {
    "name": "Text",
    "icon": "align-left"
  },
  "attributes": {
    "content": {
      "type": "richtext"
    },
    "alignment": {
      "type": "enumeration",
      "enum": ["left", "center", "right"]
    }
  }
}
```

#### Media Component

```json
{
  "collectionName": "components_content_medias",
  "info": {
    "name": "Media",
    "icon": "images"
  },
  "attributes": {
    "media": {
      "type": "media",
      "multiple": true
    },
    "caption": {
      "type": "string"
    },
    "layout": {
      "type": "enumeration",
      "enum": ["standard", "fullwidth", "gallery"]
    }
  }
}
```

#### Quote Component

```json
{
  "collectionName": "components_content_quotes",
  "info": {
    "name": "Quote",
    "icon": "quote-right"
  },
  "attributes": {
    "content": {
      "type": "text"
    },
    "attribution": {
      "type": "string"
    }
  }
}
```

#### CTA Component

```json
{
  "collectionName": "components_content_ctas",
  "info": {
    "name": "CTA",
    "icon": "link"
  },
  "attributes": {
    "text": {
      "type": "string"
    },
    "url": {
      "type": "string"
    },
    "style": {
      "type": "enumeration",
      "enum": ["primary", "secondary", "tertiary"]
    },
    "openInNewTab": {
      "type": "boolean",
      "default": false
    }
  }
}
```

#### Product Showcase Component

```json
{
  "collectionName": "components_content_product_showcases",
  "info": {
    "name": "ProductShowcase",
    "icon": "shopping-cart"
  },
  "attributes": {
    "title": {
      "type": "string"
    },
    "products": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::product-enrichment.product-enrichment"
    },
    "layout": {
      "type": "enumeration",
      "enum": ["grid", "slider", "featured"]
    }
  }
}
```

#### Accordion Component

```json
{
  "collectionName": "components_content_accordions",
  "info": {
    "name": "Accordion",
    "icon": "bars"
  },
  "attributes": {
    "items": {
      "type": "component",
      "repeatable": true,
      "component": "elements.accordion-item"
    }
  }
}
```

#### Accordion Item Component

```json
{
  "collectionName": "components_elements_accordion_items",
  "info": {
    "name": "AccordionItem",
    "icon": "plus-square"
  },
  "attributes": {
    "title": {
      "type": "string"
    },
    "content": {
      "type": "richtext"
    }
  }
}
```

## Database Schema

### Medusa.js Database Schema

Medusa.js uses a PostgreSQL database with a predefined schema. The core tables relevant to our implementation include:

- `product`
- `product_variant`
- `product_option`
- `product_option_value`
- `money_amount`
- `product_category`
- `product_category_product`
- `image`
- `customer`
- `customer_group`
- `customer_group_customers`
- `address`
- `order`
- `line_item`
- `shipping_method`
- `payment`
- `region`
- `country`
- `currency`
- `sales_channel`
- `sales_channel_location`

### Strapi Database Schema

Strapi uses a configurable database schema, which we will implement using PostgreSQL. The core tables will include:

- `product_enrichments`
- `category_enrichments`
- `pages`
- `blog_posts`
- `navigations`
- `global_settings`
- `components_*` (for each component type)
- `files` (for media)
- `i18n_locale` (for localization)

## Conclusion

The data models outlined in this document provide a comprehensive structure for the migration from Statamic/Simple Commerce to Medusa.js and Strapi. These models are designed to support multi-region and multi-language requirements while ensuring data integrity and optimal performance. The schema provided should be used as a reference during the implementation of both the ETL process and the target systems. 