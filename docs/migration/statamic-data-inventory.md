---
layout: default
title: Statamic Data Inventory
description: Comprehensive inventory of Statamic data models for migration to Medusa.js
---

# Statamic Data Inventory

This document catalogs all data structures in the current Statamic implementation to inform our migration to Medusa.js and Strapi.

## Content Collections

| Collection Name | Purpose | Fields | Multi-language | Region-specific |
|----------------|---------|--------|----------------|-----------------|
| `products` | Product catalog | `title`, `slug`, `price`, `description`, `images`, `variants`, `categories` | Yes (2 languages) | Some fields vary by region |
| `categories` | Product categorization | `title`, `slug`, `description`, `parent_category`, `image` | Yes (2 languages) | No |
| `pages` | Static content pages | `title`, `slug`, `content`, `meta_*`, `template` | Yes (2 languages) | Some pages region-specific |
| `blog` | Blog articles | `title`, `slug`, `content`, `excerpt`, `featured_image`, `author`, `date`, `categories` | Yes (2 languages) | No |

*Complete with all collections from the Statamic site*

## Simple Commerce Structures

### Products

```yaml
# Example Statamic Simple Commerce product structure
title: Example Product
slug: example-product
price: 1999
description: This is an example product.
variants:
  - name: Small
    price: 1999
    sku: PROD-SM
  - name: Medium
    price: 2499
    sku: PROD-MD
  - name: Large
    price: 2999
    sku: PROD-LG
categories:
  - category-1
  - category-2
images:
  - products/example-1.jpg
  - products/example-2.jpg
stock: 100
status: published
```

### Orders

```yaml
# Example Statamic Simple Commerce order structure
order_number: 1001
status: completed
total: 2499
items:
  - product: product-slug
    variant: Medium
    quantity: 1
    total: 2499
customer:
  name: John Doe
  email: john@example.com
shipping_address:
  address1: 123 Main St
  city: Amsterdam
  zip: 1000 AB
  country: NL
payment_method: mollie
shipping_method: standard
```

## User Data Structure

```yaml
# Example Statamic user data
name: John Doe
email: john@example.com
password: hashed_password
roles:
  - customer
addresses:
  - address1: 123 Main St
    city: Amsterdam
    zip: 1000 AB
    country: NL
    default: true
preferences:
  language: nl
  currency: EUR
```

## Multi-Language Implementation

Statamic implements multi-language content using:

- Separate content files for each language (e.g., `product.nl.md`, `product.de.md`)
- Default language: Dutch (nl)
- Secondary language: German (de)
- URL pattern: `/de/products/product-slug` for German content

## Multi-Region Implementation

The current site handles multiple regions (NL, BE, DE) through:

- Domain-specific configuration files
- Shared content with some region-specific overrides
- Region-specific pricing and availability
- Separate shipping and payment options per region

## Custom Field Types

*Document any custom field types or blueprints that require special handling*

## URL Structure

*Document current URL patterns for preservation during migration*

## Next Steps

Based on this inventory, we will design equivalent data models in Medusa.js and Strapi. 