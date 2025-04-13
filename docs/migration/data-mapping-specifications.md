---
layout: default
title: Data Mapping Specifications
description: Mapping between Statamic/Simple Commerce and Medusa.js/Strapi for the migration
---

# Data Mapping Specifications

This document defines the mapping between the existing Statamic/Simple Commerce data structures and the new Medusa.js/Strapi architecture, with a focus on preserving multi-region and multi-language capabilities.

## 1. Overview

### Source Systems
- **Statamic CMS**: Content management with Blueprint-based structures
- **Simple Commerce**: E-commerce functionality integrated with Statamic

### Target Systems
- **Medusa.js**: Core commerce functionality and business logic
- **Strapi CMS**: Content management with localization support

## 2. Region Mapping

### Source: Statamic Site Structure
```
sites:
  - handle: nl
    name: Netherlands
    locale: nl_NL
    url: https://example.nl
    direction: ltr
  - handle: de
    name: German
    locale: de_DE
    url: https://example.de
    direction: ltr
```

### Target: Medusa.js Regions + Strapi Regions

#### Medusa.js Regions
```javascript
// Each Statamic site becomes a Medusa.js region with appropriate configuration
[
  {
    id: "reg_nl",
    name: "Netherlands",
    currency_code: "EUR",
    tax_rate: 21,
    metadata: {
      domain: "example.nl",
      locale: "nl",
      countryCode: "NL"
    }
  },
  {
    id: "reg_de",
    name: "Germany",
    currency_code: "EUR",
    tax_rate: 19,
    metadata: {
      domain: "example.de",
      locale: "de",
      countryCode: "DE"
    }
  }
]
```

#### Strapi Regions
```javascript
[
  {
    name: "Netherlands",
    code: "nl",
    domain: "example.nl",
    defaultLocale: "nl",
    medusa_region_id: "reg_nl"
  },
  {
    name: "Germany",
    code: "de",
    domain: "example.de",
    defaultLocale: "de",
    medusa_region_id: "reg_de"
  }
]
```

## 3. Product Mapping

### Source: Statamic Products (Simple Commerce)
```yaml
# Statamic product entry
id: 12345-abcde
title: Example Product
blueprint: products
price: 2999
stock: 100
description: This is an example product.
images:
  - products/example-product.jpg
categories:
  - electronics
variants:
  - title: Small
    price: 2999
    sku: PROD-S
    stock: 50
  - title: Large
    price: 3999
    sku: PROD-L
    stock: 50
```

### Target: Medusa.js Products + Strapi Product Content

#### Medusa.js Product
```javascript
{
  id: "prod_12345abcde", // Generated Medusa ID
  title: "Example Product", // Default title (NL language)
  status: "published",
  description: "This is an example product.", // Default description
  categories: [
    { id: "cat_electronics" } // Reference to category
  ],
  variants: [
    {
      id: "variant_small",
      title: "Small",
      sku: "PROD-S",
      inventory_quantity: 50,
      prices: [
        {
          currency_code: "EUR",
          amount: 2999, // In smallest currency unit (cents)
          region_id: "reg_nl" // Netherlands region
        },
        {
          currency_code: "EUR",
          amount: 2999,
          region_id: "reg_de" // German region
        }
      ]
    },
    {
      id: "variant_large",
      title: "Large",
      sku: "PROD-L",
      inventory_quantity: 50,
      prices: [
        {
          currency_code: "EUR",
          amount: 3999,
          region_id: "reg_nl"
        },
        {
          currency_code: "EUR",
          amount: 3999,
          region_id: "reg_de"
        }
      ]
    }
  ],
  metadata: {
    translations: {
      nl: {
        title: "Example Product", // Original NL title
        description: "This is an example product." // Original NL description
      },
      de: {
        title: "Beispielprodukt", // Translated DE title
        description: "Dies ist ein Beispielprodukt." // Translated DE description
      }
    },
    original_statamic_id: "12345-abcde"
  }
}
```

#### Strapi Product Content
```javascript
{
  medusa_id: "prod_12345abcde", // Reference to Medusa product
  // NL locale version (default)
  extended_description: "<p>Detailed product description with rich text formatting...</p>",
  specifications: [
    {
      name: "Weight",
      value: "1.5 kg"
    },
    {
      name: "Dimensions",
      value: "10 x 20 x 5 cm"
    }
  ],
  features: [
    {
      title: "Duurzaam",
      description: "Gemaakt van recyclebare materialen"
    }
  ],
  // Content localized using Strapi i18n
  // DE locale version handled by Strapi's localization system
}
```

## 4. Category Mapping

### Source: Statamic Taxonomies
```yaml
# Statamic taxonomy: categories
title: Categories
handle: categories
terms:
  - title: Electronics
    slug: electronics
    content: Electronics category description
    children:
      - title: Smartphones
        slug: smartphones
```

### Target: Medusa.js Product Categories

```javascript
[
  {
    id: "cat_electronics",
    name: "Electronics", // Default name (NL)
    handle: "electronics",
    metadata: {
      translations: {
        nl: { name: "Elektronica" },
        de: { name: "Elektronik" }
      },
      original_statamic_slug: "electronics"
    },
    category_children: [
      {
        id: "cat_smartphones",
        name: "Smartphones",
        handle: "smartphones",
        parent_category_id: "cat_electronics",
        metadata: {
          translations: {
            nl: { name: "Smartphones" },
            de: { name: "Smartphones" }
          },
          original_statamic_slug: "smartphones"
        }
      }
    ]
  }
]
```

## 5. Customer Mapping

### Source: Statamic Customer (Simple Commerce)
```yaml
id: cust_12345
name: John Doe
email: john@example.com
password: hashed_password
address:
  line1: 123 Main St
  city: Amsterdam
  zip: 1000AB
  country: Netherlands
orders:
  - order_123
  - order_456
```

### Target: Medusa.js Customer
```javascript
{
  id: "cust_12345", // Generated or preserved
  email: "john@example.com",
  first_name: "John",
  last_name: "Doe",
  password_hash: "hashed_password", // Properly migrated with security
  shipping_addresses: [
    {
      address_1: "123 Main St",
      city: "Amsterdam",
      postal_code: "1000AB",
      country_code: "NL",
      metadata: {
        original_address_id: "addr_12345"
      }
    }
  ],
  metadata: {
    original_statamic_id: "cust_12345",
    preferred_region_id: "reg_nl" // Based on address
  }
}
```

## 6. Order Mapping

### Source: Statamic Order (Simple Commerce)
```yaml
id: order_123
customer: cust_12345
status: completed
total: 3999
items:
  - product: 12345-abcde
    variant: PROD-L
    quantity: 1
    total: 3999
shipping:
  method: standard
  price: 499
payment:
  method: stripe
  status: paid
  reference: ch_123456
shipping_address:
  line1: 123 Main St
  city: Amsterdam
  zip: 1000AB
  country: Netherlands
```

### Target: Medusa.js Order
```javascript
{
  id: "order_123", // Generated or preserved
  customer_id: "cust_12345",
  status: "completed",
  currency_code: "EUR",
  region_id: "reg_nl", // Based on shipping address
  items: [
    {
      id: "item_1",
      title: "Example Product - Large",
      variant_id: "variant_large",
      quantity: 1,
      unit_price: 3999,
      subtotal: 3999,
      metadata: {
        original_line_item_id: "line_12345"
      }
    }
  ],
  shipping_methods: [
    {
      id: "ship_standard",
      shipping_option_id: "opt_standard",
      price: 499
    }
  ],
  payments: [
    {
      id: "pay_123",
      amount: 4498, // Total + shipping
      currency_code: "EUR",
      provider_id: "stripe",
      data: {
        reference: "ch_123456"
      }
    }
  ],
  shipping_address: {
    address_1: "123 Main St",
    city: "Amsterdam",
    postal_code: "1000AB",
    country_code: "NL"
  },
  metadata: {
    original_statamic_order_id: "order_123"
  }
}
```

## 7. Content Page Mapping

### Source: Statamic Page
```yaml
id: page_about
title: About Us
template: default
content: |
  ## About Our Company
  Founded in 2010, we have been...
seo:
  title: About Us | Company Name
  description: Learn about our company history...
```

### Target: Strapi Page
```javascript
{
  // NL locale version
  title: "About Us",
  slug: "about-us",
  content: "## About Our Company\nFounded in 2010, we have been...",
  seo: {
    metaTitle: "About Us | Company Name",
    metaDescription: "Learn about our company history..."
  },
  regions: [
    { id: 1, code: "nl" }, // Netherlands region
    { id: 2, code: "de" }  // German region
  ],
  
  // DE locale handled by Strapi's localization system
}
```

## 8. Blog Mapping

### Source: Statamic Blog Post
```yaml
id: blog_post_123
title: Latest News
date: 2023-01-15
author: John Doe
content: |
  ## Our Latest Announcement
  We're excited to share...
categories:
  - news
  - updates
```

### Target: Strapi Blog Post
```javascript
{
  // NL locale version
  title: "Latest News",
  slug: "latest-news",
  content: "## Our Latest Announcement\nWe're excited to share...",
  excerpt: "We're excited to share our latest announcement...",
  categories: [
    { id: 1, name: "News" },
    { id: 2, name: "Updates" }
  ],
  regions: [
    { id: 1, code: "nl" } // Only available in NL region
  ],
  
  // DE locale handled by Strapi's localization system if available
}
```

## 9. Navigation Mapping

### Source: Statamic Navigation
```yaml
# navigation/main.yaml
title: Main Navigation
tree:
  -
    title: Home
    url: /
  -
    title: Products
    url: /products
    children:
      -
        title: Electronics
        url: /products/electronics
  -
    title: About
    url: /about
```

### Target: Strapi Navigation
```javascript
{
  // NL locale version
  title: "Main Navigation",
  slug: "main-navigation",
  items: [
    {
      title: "Home",
      url: "/",
      type: "internal"
    },
    {
      title: "Products",
      url: "/products",
      type: "internal",
      children: [
        {
          title: "Electronics",
          url: "/products/electronics",
          type: "product-category",
          contentType: "product_category",
          contentId: "cat_electronics"
        }
      ]
    },
    {
      title: "About",
      url: "/about",
      type: "internal"
    }
  ],
  region: { id: 1, code: "nl" } // Netherlands region
  
  // German navigation would be a separate entry with region: { id: 2, code: "de" }
}
```

## 10. Asset Mapping

### Source: Statamic Assets
```
assets/
  products/
    example-product.jpg
  blog/
    blog-image.jpg
```

### Target: Medusa.js + Strapi Assets

#### Medusa.js Product Images
```javascript
{
  products: [
    {
      id: "prod_12345abcde",
      thumbnail: "https://example-cdn.com/products/example-product-thumb.jpg",
      images: [
        {
          id: "img_1",
          url: "https://example-cdn.com/products/example-product.jpg"
        }
      ]
    }
  ]
}
```

#### Strapi Media Library
- Product images are stored both in Medusa.js and Strapi for different purposes
- Content images (blog, pages) are stored only in Strapi
- All assets are uploaded to a CDN during migration

## 11. Migration Strategy

### Data Migration Flow
1. **Extract**: Export data from Statamic/Simple Commerce using Statamic's API or database exports.
2. **Transform**: Convert data according to the mappings defined in this document.
3. **Load**: Import transformed data into Medusa.js and Strapi through their respective APIs.

### Migration Tools
- Create custom Node.js scripts for the ETL process
- Leverage Medusa.js and Strapi admin APIs
- Use region-specific data transformations to maintain multi-region support

### Validation Process
- Verify counts of migrated entities match source data
- Sample data validation across regions and languages
- Validate relationships between entities
- Test frontend integration with both backends

## 12. Special Considerations

### Multi-Region Support
- Ensure Medusa.js regions are properly configured for each domain
- Set up middleware to detect and route to the correct region based on domain
- Configure sales channels to manage product availability per region

### Multi-Language Support
- Ensure primary product data is stored in Medusa.js with translations in metadata
- Configure Strapi i18n for complete content localization
- Set up language detection and switching in the Next.js frontend

### Data Consistency
- Implement webhook system between Medusa.js and Strapi to maintain consistency
- Set up validation checks before and after migration
- Develop monitoring tools to validate ongoing data consistency

## Next Steps

1. Develop extraction scripts for Statamic/Simple Commerce
2. Create transformation scripts based on this mapping document
3. Implement loading scripts for Medusa.js and Strapi
4. Set up validation processes
5. Create a migration test environment for validation 