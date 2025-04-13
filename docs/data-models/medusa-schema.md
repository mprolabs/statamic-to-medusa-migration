# Medusa.js Data Models for Multi-Region Implementation

This document defines the data models and configurations for implementing a multi-region ecommerce system using Medusa.js, designed specifically for the migration from Statamic with Simple Commerce.

## Region Configuration

The implementation will leverage Medusa.js's native region support to create separate business regions for each country. This model supports the three distinct domains/stores (Netherlands, Belgium, Germany).

```typescript
interface Region {
  id: string;
  name: string;         // "Netherlands", "Belgium", "Germany"
  currency_code: string; // "eur" for all regions
  tax_rate: number;     // Region-specific tax rates
  tax_code: string;     // Tax codes vary by country
  payment_providers: string[]; // Array of enabled payment provider IDs
  fulfillment_providers: string[]; // Array of enabled fulfillment provider IDs
  countries: Country[]; // Associated countries (NL, BE, DE)
  metadata: {
    domain: string;     // "example.nl", "example.be", "example.de"
    locale: string;     // "nl_NL", "nl_BE", "de_DE"
  };
}
```

### Region Implementations

```typescript
// Defined regions
const regions = [
  {
    name: "Netherlands",
    currency_code: "eur",
    tax_rate: 21, // Dutch VAT rate
    tax_code: "nl_standard",
    countries: ["nl"],
    metadata: {
      domain: "example.nl",
      locale: "nl_NL"
    }
  },
  {
    name: "Belgium",
    currency_code: "eur",
    tax_rate: 21, // Belgian VAT rate
    tax_code: "be_standard",
    countries: ["be"],
    metadata: {
      domain: "example.be",
      locale: "nl_BE" // Default locale for Belgium
    }
  },
  {
    name: "Germany",
    currency_code: "eur",
    tax_rate: 19, // German VAT rate
    tax_code: "de_standard",
    countries: ["de"],
    metadata: {
      domain: "example.de",
      locale: "de_DE"
    }
  }
];
```

## Sales Channels Configuration

Each region will be associated with a dedicated sales channel to control product availability in different regions.

```typescript
interface SalesChannel {
  id: string;
  name: string;       // "NL Store", "BE Store", "DE Store"
  description: string;
  is_disabled: boolean;
  metadata: {
    region_id: string; // Associated region ID
    domain: string;    // Domain specific to this channel
  };
}
```

### Sales Channel Implementations

```typescript
// Defined sales channels
const salesChannels = [
  {
    name: "NL Store",
    description: "Dutch storefront",
    metadata: {
      domain: "example.nl"
    }
  },
  {
    name: "BE Store",
    description: "Belgian storefront",
    metadata: {
      domain: "example.be"
    }
  },
  {
    name: "DE Store",
    description: "German storefront",
    metadata: {
      domain: "example.de" 
    }
  }
];
```

## Products and Variants

Products and variants will be structured to support multi-region pricing and availability.

```typescript
interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  thumbnail: string;
  status: "draft" | "proposed" | "published" | "rejected";
  sales_channels: SalesChannel[]; // Which regions this product is available in
  variants: ProductVariant[];
  categories: ProductCategory[];
  tags: ProductTag[];
  type: ProductType;
  metadata: {
    translations: {
      nl: {
        title: string;
        description: string;
        // Other translatable fields
      },
      de?: {
        title: string;
        description: string;
        // Other translatable fields
      }
    },
    // Original Statamic ID for reference
    statamic_id: string;
    // Additional fields migrated from Statamic
    additional_fields: Record<string, any>;
  };
}

interface ProductVariant {
  id: string;
  title: string;
  product_id: string;
  sku: string;
  barcode: string;
  ean: string;
  upc: string;
  inventory_quantity: number;
  allow_backorder: boolean;
  manage_inventory: boolean;
  hs_code: string;
  origin_country: string;
  prices: MoneyAmount[]; // Region-specific prices
  options: ProductOptionValue[];
  metadata: {
    translations: {
      nl: {
        title: string;
        // Other translatable fields
      },
      de?: {
        title: string;
        // Other translatable fields
      }
    },
    statamic_variant_id: string;
  };
}

interface MoneyAmount {
  id: string;
  currency_code: string; // "eur"
  amount: number;       // Amount in smallest currency unit (cents)
  region_id?: string;   // Optional specific region
  price_list_id?: string; // For special pricing
}
```

### Region-Specific Pricing

To handle region-specific pricing, we'll use Medusa.js's price lists feature:

```typescript
interface PriceList {
  id: string;
  name: string;       // "NL Prices", "BE Prices", "DE Prices"
  description: string;
  type: "sale" | "override";
  status: "active" | "draft";
  starts_at: Date | null;
  ends_at: Date | null;
  customer_groups: CustomerGroup[];
  prices: MoneyAmount[];
}
```

## Customers and Users

Customer accounts will be structured to support multi-region capabilities:

```typescript
interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  has_account: boolean;
  password_hash?: string;
  metadata: {
    preferred_region?: string; // Region ID
    preferred_language?: "nl" | "de";
    statamic_user_id?: string;
  };
  billing_address: Address;
  shipping_addresses: Address[];
  orders: Order[];
}

interface Address {
  id: string;
  customer_id: string;
  company: string;
  first_name: string;
  last_name: string;
  address_1: string;
  address_2: string;
  city: string;
  country_code: string; // "nl", "be", "de"
  province: string;
  postal_code: string;
  phone: string;
  metadata: Record<string, any>;
}
```

## Orders

Orders will be structured to track region-specific information:

```typescript
interface Order {
  id: string;
  status: OrderStatus;
  fulfillment_status: FulfillmentStatus;
  payment_status: PaymentStatus;
  display_id: string;
  cart_id: string;
  customer_id: string;
  email: string;
  billing_address_id: string;
  shipping_address_id: string;
  region_id: string; // Links to specific region
  currency_code: string;
  tax_rate: number;
  draft: boolean;
  items: LineItem[];
  payments: Payment[];
  fulfillments: Fulfillment[];
  shipping_methods: ShippingMethod[];
  discounts: Discount[];
  gift_cards: GiftCard[];
  metadata: {
    statamic_order_id?: string;
    sales_channel_id: string; // Track which channel the order came from
    original_domain: string;  // Store original domain
  };
}
```

## Payment Providers

Different regions may require different payment methods:

```typescript
interface PaymentProvider {
  id: string;
  is_installed: boolean;
  regions: Region[]; // Available in which regions
  metadata: {
    display_name: {
      nl?: string;
      de?: string;
    }
  };
}

// Example payment provider configurations
const paymentProviders = [
  {
    id: "ideal",
    is_installed: true,
    regions: ["nl_region", "be_region"], // Available in Netherlands and Belgium
    metadata: {
      display_name: {
        nl: "iDEAL",
        de: "iDEAL"
      }
    }
  },
  {
    id: "giropay",
    is_installed: true,
    regions: ["de_region"], // Available only in Germany
    metadata: {
      display_name: {
        nl: "Giropay",
        de: "Giropay"
      }
    }
  },
  {
    id: "stripe",
    is_installed: true,
    regions: ["nl_region", "be_region", "de_region"], // Available in all regions
    metadata: {
      display_name: {
        nl: "Credit Card",
        de: "Kreditkarte"
      }
    }
  }
];
```

## Shipping Options

Shipping options will vary by region:

```typescript
interface ShippingOption {
  id: string;
  name: string;
  region_id: string; // Region specific
  profile_id: string;
  provider_id: string;
  price_type: "flat_rate" | "calculated";
  amount: number; // Price in smallest currency unit
  data: Record<string, any>;
  metadata: {
    display_name: {
      nl?: string;
      de?: string;
    },
    estimated_delivery: {
      nl?: string;
      de?: string;
    }
  };
}

// Example shipping options
const shippingOptions = [
  {
    name: "Standard Shipping NL",
    region_id: "nl_region",
    provider_id: "postnl",
    price_type: "flat_rate",
    amount: 495, // €4.95
    metadata: {
      display_name: {
        nl: "Standaard verzending",
        de: "Standard-Versand"
      },
      estimated_delivery: {
        nl: "1-2 werkdagen",
        de: "1-2 Werktage"
      }
    }
  },
  {
    name: "Standard Shipping BE",
    region_id: "be_region",
    provider_id: "bpost",
    price_type: "flat_rate",
    amount: 595, // €5.95
    metadata: {
      display_name: {
        nl: "Standaard verzending",
        de: "Standard-Versand"
      },
      estimated_delivery: {
        nl: "2-3 werkdagen",
        de: "2-3 Werktage"
      }
    }
  },
  {
    name: "Standard Shipping DE",
    region_id: "de_region",
    provider_id: "dhl",
    price_type: "flat_rate",
    amount: 595, // €5.95
    metadata: {
      display_name: {
        nl: "Standaard verzending",
        de: "Standard-Versand"
      },
      estimated_delivery: {
        nl: "2-4 werkdagen",
        de: "2-4 Werktage"
      }
    }
  }
];
```

## Implementation Details

### Multi-Region Configuration in Medusa Server

The Medusa server will be configured with the following customizations for multi-region support:

```javascript
// In medusa-config.js
module.exports = {
  projectConfig: {
    // ...standard config
    region_strategy: "per_domain", // Custom setting for our implementation
    default_region_map: {
      "example.nl": "nl_region_id",
      "example.be": "be_region_id",
      "example.de": "de_region_id"
    },
  },
  plugins: [
    // Multi-region support plugins
    {
      resolve: `medusa-plugin-multi-regional`,
      options: {
        enableAutomaticRegionDetection: true,
        regionDetectionStrategy: "domain",
        domainToRegionMap: {
          "example.nl": "nl_region_id",
          "example.be": "be_region_id",
          "example.de": "de_region_id"
        }
      }
    },
    // Other plugins...
  ]
};
```

### Database Schema Extensions

To support our multi-region implementation, the following database customizations will be implemented:

1. Additional indices for efficient region-based querying
2. Custom tables for region-specific content if needed
3. Extended metadata fields for translatable content

```sql
-- Example of custom indices (will be implemented via migrations)
CREATE INDEX idx_product_sales_channel ON product_sales_channel (sales_channel_id);
CREATE INDEX idx_money_amount_region ON money_amount (region_id);
CREATE INDEX idx_metadata_domain ON product_metadata (metadata->>'domain');
```

## Integration with Strapi

The Medusa.js data models will integrate with Strapi in the following ways:

1. **Product Content Extension**
   - Additional rich content stored in Strapi
   - Connected via productId reference
   - Localized across languages

2. **Region-Specific Content**
   - Marketing content varies by region
   - Home page configurations differ by region
   - Special offers tailored to regions

3. **Media Management**
   - Strapi handles additional product images and media
   - Maintains language-specific media assets
   - Manages region-specific promotional images

## API Customizations

The following API endpoints will be extended or customized for multi-region support:

1. **Region detection and switching**
   ```
   GET /store/regions/detect
   POST /store/regions/switch
   ```

2. **Region-filtered product listing**
   ```
   GET /store/products?region_id=xxx
   ```

3. **Language preference management**
   ```
   POST /store/customers/me/preferences
   ```

## Migration Considerations

When migrating from Statamic to this Medusa.js multi-region data model:

1. **Data Transformation**
   - Map Statamic product data to Medusa.js format
   - Create appropriate region entities
   - Establish sales channel relationships

2. **Pricing Conversion**
   - Extract regional price variations
   - Create appropriate price lists
   - Validate currency conversions

3. **Customer Migration**
   - Preserve customer history and preferences
   - Map addresses to Medusa.js format
   - Migrate order history with correct region assignment

## Validation and Testing

To validate the multi-region data model implementation:

1. **Region Switching Tests**
   - Verify products appear in correct regions
   - Test region-specific pricing
   - Validate tax calculations per region

2. **Multi-Language Tests**
   - Test content display in different languages
   - Verify product information translation
   - Check region-specific content

3. **Order Processing Tests**
   - Place test orders in each region
   - Verify shipping options and costs
   - Validate payment provider availability 