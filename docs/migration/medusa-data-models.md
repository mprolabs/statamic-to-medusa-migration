---
layout: default
title: Medusa.js Data Models
description: Design of Medusa.js data models for the migration with multi-region support
---

# Medusa.js Data Models

This document defines the data models for Medusa.js to support the migration from Statamic with multi-region and multi-language capabilities.

## Region Configuration

Medusa.js has built-in support for regions through its Region Module. We'll configure regions to represent our three separate domains:

```typescript
// Configuration for Region Module in medusa-config.js
const regions = [
  {
    id: "nl",
    name: "Netherlands",
    currency_code: "EUR",
    tax_rate: 21, // Dutch VAT rate
    payment_providers: ["mollie"],
    fulfillment_providers: ["manual"],
    countries: ["NL"],
    // Custom metadata for domain configuration
    metadata: {
      domain: "nl.example.com",
      default_language: "nl",
      available_languages: ["nl", "de"],
      locale_format: "nl-NL"
    }
  },
  {
    id: "be",
    name: "Belgium",
    currency_code: "EUR",
    tax_rate: 21, // Belgian VAT rate
    payment_providers: ["mollie"],
    fulfillment_providers: ["manual"],
    countries: ["BE"],
    metadata: {
      domain: "be.example.com",
      default_language: "nl",
      available_languages: ["nl", "de"],
      locale_format: "nl-BE"
    }
  },
  {
    id: "de",
    name: "Germany",
    currency_code: "EUR",
    tax_rate: 19, // German VAT rate
    payment_providers: ["mollie"],
    fulfillment_providers: ["manual"],
    countries: ["DE"],
    metadata: {
      domain: "de.example.com",
      default_language: "de",
      available_languages: ["de", "nl"],
      locale_format: "de-DE"
    }
  }
]
```

## Product Model

Products in Medusa.js will be configured to support multi-region pricing and availability:

```typescript
// Product model structure
interface Product {
  // Core Medusa Fields
  id: string;
  title: string;
  handle: string;
  description: string;
  thumbnail: string;
  status: "draft" | "published";
  
  // Variants & Options
  variants: ProductVariant[];
  options: ProductOption[];
  
  // Categorization
  categories: ProductCategory[];
  tags: string[];
  collection_id: string;
  collection: ProductCollection;
  
  // Multi-region support
  prices: MoneyAmount[]; // Region-specific pricing
  sales_channels: SalesChannel[]; // Control availability by region
  
  // Metadata for language variants and extra attributes
  metadata: {
    translations: {
      de?: {
        title: string;
        description: string;
        // Other translatable fields
      }
    },
    specifications: Record<string, unknown>;
    custom_fields: Record<string, unknown>;
  }
}

// Product Variant with region-specific pricing
interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  ean: string;
  prices: MoneyAmount[]; // Region-specific pricing
  inventory_quantity: number;
  options: ProductOptionValue[];
  // Additional fields as needed
}

// Money Amount model for region-specific pricing
interface MoneyAmount {
  currency_code: string; // EUR
  amount: number; // In smallest currency unit (cents)
  region_id?: string; // For region-specific pricing
  variant_id?: string;
  price_list_id?: string; // For special pricing (sales, etc.)
}
```

## Sales Channels for Region Availability

Sales Channels will be used to control product availability across regions:

```typescript
// Sales channels for the three regions
const salesChannels = [
  {
    id: "nl_store",
    name: "Netherlands Store",
    description: "Sales channel for the Dutch store",
    is_disabled: false
  },
  {
    id: "be_store",
    name: "Belgium Store",
    description: "Sales channel for the Belgian store",
    is_disabled: false
  },
  {
    id: "de_store",
    name: "Germany Store", 
    description: "Sales channel for the German store",
    is_disabled: false
  }
]
```

## Category Structure

Product categories will be implemented using Medusa's ProductCategory entity:

```typescript
interface ProductCategory {
  id: string;
  name: string;
  handle: string;
  description: string;
  parent_category_id: string | null;
  parent_category: ProductCategory | null;
  category_children: ProductCategory[];
  products: Product[];
  metadata: {
    translations: {
      de?: {
        name: string;
        description: string;
      }
    }
  }
}
```

## Customer Model

```typescript
interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  billing_address_id: string;
  billing_address: Address;
  shipping_addresses: Address[];
  password_hash: string;
  phone: string;
  has_account: boolean;
  metadata: {
    preferred_language: string; // 'nl' or 'de'
    preferred_region: string; // 'nl', 'be', or 'de'
    marketing_preferences: Record<string, boolean>;
    // Any other customer-specific data
  }
}
```

## Order Model

```typescript
interface Order {
  id: string;
  status: "pending" | "processing" | "shipped" | "canceled" | "completed" | "requires_action";
  customer_id: string;
  customer: Customer;
  email: string;
  billing_address: Address;
  shipping_address: Address;
  region_id: string;
  region: Region;
  currency_code: string;
  tax_rate: number;
  items: LineItem[];
  payments: Payment[];
  shipping_methods: ShippingMethod[];
  discounts: Discount[];
  gift_cards: GiftCard[];
  subtotal: number;
  tax_total: number;
  shipping_total: number;
  discount_total: number;
  gift_card_total: number;
  total: number;
  // Additional fields as needed
}
```

## Workflows for Syncing with Strapi

We'll implement workflows to maintain consistency between Medusa.js commerce data and Strapi content:

```typescript
// Example workflow for syncing product data with Strapi
export const syncProductToStrapiWorkflow = createWorkflow(
  "sync-product-to-strapi",
  () => {
    // Get product data from Medusa
    const productData = getProductDataStep();
    
    // Transform data to Strapi format
    const { strapiData } = transform(
      { productData },
      (data) => {
        return {
          strapiData: {
            medusa_id: data.productData.id,
            title: data.productData.title,
            description: data.productData.description,
            // Transform other fields as needed
            locale: "nl", // Default language
            // Handle other language variants
            localizations: data.productData.metadata?.translations
              ? [{
                  medusa_id: data.productData.id,
                  title: data.productData.metadata.translations.de?.title,
                  description: data.productData.metadata.translations.de?.description,
                  locale: "de"
                }]
              : []
          }
        };
      }
    );
    
    // Update or create in Strapi
    const result = syncToStrapiStep({ data: strapiData });
    
    return new WorkflowResponse(result);
  }
);
```

## API Routes for Multi-Region Support

We'll extend Medusa's API routes to support domain-specific behavior:

```typescript
// Example middleware for region detection based on domain
export const regionMiddleware = (req, res, next) => {
  const hostname = req.hostname;
  
  // Determine region from hostname
  let regionId = "nl"; // Default region
  if (hostname.startsWith("be.")) {
    regionId = "be";
  } else if (hostname.startsWith("de.")) {
    regionId = "de";
  }
  
  // Attach region to request for later use
  req.regionId = regionId;
  
  next();
};
```

## Next Steps

These data models will be integrated with Strapi CMS, with appropriate relationships defined to maintain data consistency across both systems. The next step is to design the Strapi content models that will complement these Medusa.js models. 