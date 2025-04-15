# Statamic and Simple Commerce Data Models

This document outlines the data models used in the existing Statamic CMS and Simple Commerce setup, which will inform our migration to Saleor.

## 1. Content Collections Structure

Statamic organizes content into collections, which are stored in the `content/collections/` directory. The current collections include:

- `products/` - Product catalog items
- `customers/` - Customer information
- `orders/` - Order data
- `coupons/` - Discount coupon configurations
- `pages/` - Content pages
- `blog/` - Blog entries
- `resellers/` - Reseller information

## 2. Multi-Language Implementation

The system supports multiple languages with content organized into language-specific subdirectories:

- `nl/` - Dutch content
- `en/` - English content
- `de/` - German content

This structure appears consistently across collections, particularly for products, indicating that content is localized on a per-entry basis.

## 3. Simple Commerce Data Models

### 3.1 Product Model

Based on the Simple Commerce blueprint (`product.yaml`), the product model includes:

```yaml
# Core Fields
title: string           # Product title
description: markdown   # Product description (Markdown format)
price: money            # Base product price

# These fields likely exist but weren't explicitly found in the basic blueprint
slug: string            # URL slug
product_images: assets  # Product images
variants: array         # Product variants (if any)
```

### 3.2 Customer Model

The customer data model (`customer.yaml`) includes:

```yaml
# Core Fields
name: string          # Customer name
email: string         # Customer email (used for authentication)
orders: entries       # Relationship to order entries

# System Fields
slug: string          # URL slug
```

### 3.3 Order Model

The order data model (`order.yaml`) is more complex and includes:

```yaml
# Core Order Information
title: string                # Order title (typically order number)
customer: entry              # Relationship to customer
order_number: string         # Unique order identifier

# Financial Information
items_total: money           # Total of all line items
coupon_total: money          # Total discount from coupon
tax_total: money             # Total tax amount
shipping_total: money        # Total shipping cost
grand_total: money           # Final order total

# Line Items
items: array                 # Collection of order items with the following structure:
  - id: string               # Line item ID
    product: entry           # Relationship to product
    variant: variant         # Product variant (if applicable)
    quantity: number         # Quantity ordered
    total: money             # Line item total
    metadata: array          # Additional data
    tax: tax_data            # Tax information for this line item

# Discount Information
coupon: entry                # Applied coupon

# Shipping Information
shipping_method: shipping    # Selected shipping method
shipping_name: string        # Recipient name
shipping_address: string     # Address line 1
shipping_address_line2: string # Address line 2
shipping_city: string        # City
shipping_postal_code: string # Postal/ZIP code
shipping_region: region      # State/province/region
shipping_country: country    # Country

# Billing Information (similar structure to shipping)
billing_name: string
billing_address: string
billing_address_line2: string
billing_city: string
billing_postal_code: string
billing_region: region
billing_country: country

# Payment Information
payment_method: string       # Method used for payment
payment_status: string       # Current payment status
```

### 3.4 Coupon Model

Coupons are used for discounts. While we haven't seen the full blueprint, they appear to be configured in the `content/collections/coupons/` directory.

## 4. E-commerce Configuration

Simple Commerce is configured with multi-site support for different currencies and shipping methods. The configuration (`simple-commerce.php`) includes:

- **Payment Gateways**: Configuration for payment processing
- **Sites Configuration**: Currency and shipping methods per site
- **Notifications**: Email notification settings for order events
- **Tax Configuration**: Tax calculation methods
- **Content Repositories**: Collection configurations for customers, orders, and products

## 5. Content Relationships

The data models have several important relationships:

- Products → Orders (via line items)
- Customers → Orders (one-to-many)
- Coupons → Orders (many-to-one)

## 6. Custom Fields and Metadata

Both products and orders support custom metadata fields for extending the core data models with additional information.

## 7. Media Assets

Media assets (like product images) appear to be stored in the `content/assets/` directory, separate from but referenced by content entries.

## 8. Multi-Region Considerations

The site configuration supports multiple regions through Statamic's multi-site capabilities, with configuration for:
- Currency per region
- Shipping methods per region
- Tax rates and zones

This provides a foundation for migration to Saleor's channel-based multi-region approach. 