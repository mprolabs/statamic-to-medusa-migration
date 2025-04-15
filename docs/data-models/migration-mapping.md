# Migration Mapping: Statamic/Simple Commerce to Saleor

This document outlines the mapping between Statamic/Simple Commerce data models and Saleor data models for the migration process.

## 1. Products Migration

| Statamic/Simple Commerce | Saleor | Notes |
|--------------------------|--------|-------|
| `title` | `Product.name` | Product name will be migrated directly |
| `description` | `Product.description` | Rich text format will be preserved |
| `price` | `ProductVariant.channel_listings[].price` | Prices will be mapped to appropriate channels |
| `slug` | `Product.slug` | URLs will be preserved |
| `product_images` | `Product.media` and `ProductVariant.media` | Images will be migrated to Saleor's media system |
| `variants` | Multiple `ProductVariant` objects | Each Simple Commerce variant becomes a Saleor variant |
| Custom metadata | `Product.metadata` | Any additional fields will be stored as metadata |
| Language-specific content | Translation objects | Content in different language directories will be converted to translation objects |

### Product Type and Attribute Mapping

1. Create product types in Saleor based on the Simple Commerce product structure
2. Map custom fields to Saleor attributes:

| Statamic Custom Field | Saleor Implementation |
|------------------------|------------------------|
| Text fields | Text attributes |
| Rich text fields | Rich text attributes |
| Boolean fields | Boolean attributes |
| Image fields | File attributes |
| Reference fields | Reference attributes |
| Date fields | Date attributes |

## 2. Customer Migration

| Statamic/Simple Commerce | Saleor | Notes |
|--------------------------|--------|-------|
| `name` | `Customer.first_name` and `Customer.last_name` | Name will be split into first and last |
| `email` | `Customer.email` | Direct mapping |
| `orders` | Relationship to `Order` objects | Orders will be migrated separately and linked |
| `shipping_address` | `Customer.default_shipping_address` | Address structure will be normalized to Saleor format |
| `billing_address` | `Customer.default_billing_address` | Address structure will be normalized to Saleor format |
| Custom metadata | `Customer.metadata` | Any additional fields will be stored as metadata |

## 3. Order Migration

| Statamic/Simple Commerce | Saleor | Notes |
|--------------------------|--------|-------|
| `order_number` | `Order.id` and stored in `Order.metadata` | Original order number preserved in metadata |
| `status` | `Order.status` | Status values will be mapped to Saleor equivalents |
| `customer` | `Order.user` | Reference to migrated customer |
| `items` | `Order.lines` | Product line items |
| `shipping_address` | `Order.shipping_address` | Address structure will be normalized |
| `billing_address` | `Order.billing_address` | Address structure will be normalized |
| `shipping_method` | `Order.shipping_method` | Mapped to equivalent Saleor shipping method |
| `payment_method` | `Order.payments[].gateway` | Payment method information |
| `total` | `Order.total_gross` | Total amount including tax |
| `items_total` | Calculated from line items | Sum of line item totals |
| `shipping_total` | `Order.shipping_price` | Shipping cost |
| `tax_total` | Calculated from line items | Sum of tax amounts |
| `coupon_total` | `Order.discount_amount` | Discount amount from coupons |
| Custom metadata | `Order.metadata` | Any additional fields will be stored as metadata |

## 4. Coupon Migration

| Statamic/Simple Commerce | Saleor | Notes |
|--------------------------|--------|-------|
| `title` | `Voucher.name` | Coupon name |
| `code` | `Voucher.code` | Discount code |
| `description` | Stored in `Voucher.metadata` | Additional information |
| `value` | `Voucher.discount_value` | Amount or percentage value |
| `type` | `Voucher.discount_type` | Percentage or fixed amount |
| `minimum_cart_value` | `Voucher.min_checkout_items_quantity` and `Voucher.min_spent_amount` | Minimum requirements |
| `valid_from` | `Voucher.start_date` | Start date |
| `valid_until` | `Voucher.end_date` | Expiry date |
| Custom metadata | `Voucher.metadata` | Any additional fields |

## 5. Multi-Region Implementation

### Channel Creation

For each region in Statamic sites configuration:

| Region | Saleor Channel |
|--------|---------------|
| Netherlands (nl) | `Channel` with slug `nl` |
| Belgium (be) | `Channel` with slug `be` |
| Germany (de) | `Channel` with slug `de` |

Each channel will have:
- Appropriate currency (EUR)
- Default country code
- Region-specific shipping methods
- Region-specific payment methods
- Tax configuration

### Product Availability by Region

Products will be made available in channels based on their presence in region-specific content folders:

| Content in Statamic | Saleor Channel Availability |
|--------------------|----------------------------|
| Product in `/content/collections/products/nl/` | Available in `nl` channel |
| Product in `/content/collections/products/be/` | Available in `be` channel |
| Product in `/content/collections/products/de/` | Available in `de` channel |

## 6. Multi-Language Implementation

For each language version of a product:

| Language Content | Saleor Translation |
|-----------------|-------------------|
| Product in `/content/collections/products/nl/` | `Translation` with `language_code: "nl"` |
| Product in `/content/collections/products/en/` | `Translation` with `language_code: "en"` |
| Product in `/content/collections/products/de/` | `Translation` with `language_code: "de"` |
| Product in `/content/collections/products/fr/` | `Translation` with `language_code: "fr"` |

Language-specific fields to be migrated:
- Product name/title
- Description
- SEO fields
- Any translatable custom fields

## 7. Tax Configuration Migration

| Statamic/Simple Commerce | Saleor | Notes |
|--------------------------|--------|-------|
| Tax zones | Channel-specific tax configurations | Configured per channel |
| Tax rates | `TaxClass` objects | Products assigned to appropriate tax classes |
| Tax configuration | Channel tax settings | Settings like `charge_taxes` and `tax_calculation_strategy` |

## 8. Migration Process Overview

1. **Analysis Phase**
   - Extract all Statamic/Simple Commerce data models
   - Identify custom fields and special cases
   - Map field types to Saleor attribute types

2. **Preparation Phase**
   - Create Saleor channels for each region
   - Set up product types with appropriate attributes
   - Configure shipping methods, payment methods, and tax classes

3. **Migration Execution**
   - Migrate products with variants
   - Create translation objects for all languages
   - Migrate customers and addresses
   - Migrate orders and payment history
   - Migrate coupons/vouchers

4. **Validation Phase**
   - Verify data integrity
   - Check multi-region functionality
   - Validate translations
   - Test checkout flow with migrated products

## 9. Custom Data Handling

Any Statamic/Simple Commerce fields without direct Saleor equivalents will be handled through:

1. Custom attributes for product-related fields
2. Metadata fields for additional information
3. Extension of Saleor's data model where necessary

## 10. Media Migration Strategy

1. Copy all media files from Statamic assets to Saleor media storage
2. Maintain original file names where possible
3. Update media references in product data
4. Ensure media is properly associated with products and variants 