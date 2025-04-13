# Data Mapping Plan for Statamic to Medusa.js Migration

## Overview

This document outlines the data mapping strategy for migrating from Statamic CMS with Simple Commerce to Medusa.js and Strapi CMS. The mapping covers all entities, fields, relationships, and special considerations for multi-region and multi-language support.

## Core Entity Mappings

### Products

| Statamic/Simple Commerce | Medusa.js/Strapi | Notes |
|--------------------------|------------------|-------|
| `title` | Medusa: `title` | Direct mapping |
| `slug` | Medusa: `handle` | Direct mapping |
| `content` | Strapi: `ProductEnrichment.content` | Convert Statamic Bard/Replicator fields to Strapi components |
| `price` | Medusa: `variants[0].prices[*].amount` | Convert to cents, create multiple prices for regions |
| `images` | Medusa: `images` | Convert URLs, download and upload to Medusa |
| `categories` | Medusa: `categories` | Maintain relationships |
| `variants.*` | Medusa: `variants` | Map each variant |
| `options.*` | Medusa: `options` | Create product options |
| `meta_title` | Strapi: `ProductEnrichment.seo.title` | SEO field mapping |
| `meta_description` | Strapi: `ProductEnrichment.seo.description` | SEO field mapping |
| `specifications` | Strapi: `ProductEnrichment.specifications` | Product specifications |
| `features` | Strapi: `ProductEnrichment.features` | Product features |
| `is_featured` | Medusa: `metadata.is_featured` | Store as metadata |
| `brand` | Medusa: `metadata.brand` | Store as metadata |
| `related_products` | Medusa: `metadata.related_products` | Store IDs as metadata |

### Product Variants

| Statamic/Simple Commerce | Medusa.js | Notes |
|--------------------------|-----------|-------|
| `title` | `title` | Direct mapping |
| `sku` | `sku` | Direct mapping |
| `price` | `prices[*].amount` | Convert to cents, create regional prices |
| `stock` | `inventory_quantity` | Direct mapping |
| `weight` | `weight` | Convert to grams if needed |
| `dimensions.*` | `height`, `width`, `length` | Split into separate fields |
| `options.*` | `options` | Create option values |

### Categories/Collections

| Statamic/Simple Commerce | Medusa.js/Strapi | Notes |
|--------------------------|------------------|-------|
| `title` | Medusa: `name` | Direct mapping |
| `slug` | Medusa: `handle` | Direct mapping |
| `description` | Medusa: `metadata.description` and Strapi: `CategoryEnrichment.description` | Store in both systems |
| `parent` | Medusa: `parent_category_id` | Maintain hierarchy |
| `content` | Strapi: `CategoryEnrichment.content` | Rich content goes to Strapi |
| `meta_title` | Strapi: `CategoryEnrichment.seo.title` | SEO field mapping |
| `meta_description` | Strapi: `CategoryEnrichment.seo.description` | SEO field mapping |
| `image` | Strapi: `CategoryEnrichment.images` | Category images |

### Customers

| Statamic/Simple Commerce | Medusa.js | Notes |
|--------------------------|-----------|-------|
| `email` | `email` | Direct mapping |
| `first_name` | `first_name` | Direct mapping |
| `last_name` | `last_name` | Direct mapping |
| `password` | `password_hash` | Rehash passwords if possible |
| `addresses.*` | `addresses` | Map address structure |
| `phone` | `phone` | Direct mapping |
| `shipping_address` | `shipping_addresses[0]` | Primary shipping address |
| `billing_address` | `billing_address` | Primary billing address |
| `customer_groups` | `groups` | Map to Medusa customer groups |
| `notes` | `metadata.notes` | Store as metadata |
| `preferences.*` | `metadata.preferences` | Store as metadata |

### Orders

| Statamic/Simple Commerce | Medusa.js | Notes |
|--------------------------|-----------|-------|
| `order_number` | `display_id` | Direct mapping |
| `status` | `status` | Map status values |
| `items.*` | `items` | Map line items structure |
| `shipping_address` | `shipping_address` | Map address structure |
| `billing_address` | `billing_address` | Map address structure |
| `shipping_method` | `shipping_methods` | Map to Medusa shipping methods |
| `payment_method` | `payments[0].provider_id` | Map to Medusa payment providers |
| `coupon_code` | `discounts` | Create discount records |
| `total` | `total` | Convert to cents |
| `subtotal` | `subtotal` | Convert to cents |
| `tax_total` | `tax_total` | Convert to cents |
| `shipping_total` | `shipping_total` | Convert to cents |
| `discount_total` | `discount_total` | Convert to cents |
| `notes` | `metadata.notes` | Store as metadata |
| `gift_message` | `metadata.gift_message` | Store as metadata |

### Pages and Blog Posts

| Statamic/Simple Commerce | Strapi | Notes |
|--------------------------|--------|-------|
| `title` | `title` | Direct mapping |
| `slug` | `slug` | Direct mapping |
| `content` | `content` | Convert Statamic Bard/Replicator fields to Strapi components |
| `featured_image` | `featuredImage` | Map image field |
| `meta_title` | `seo.title` | SEO field mapping |
| `meta_description` | `seo.description` | SEO field mapping |
| `template` | `template` | Store template name if needed |
| `parent` | `parent` | Maintain page hierarchy |
| `excerpt` (blog) | `excerpt` | Blog post excerpt |
| `author` (blog) | `author` | Map to Strapi author |
| `categories` (blog) | `categories` | Map to Strapi categories |
| `tags` (blog) | `tags` | Map to Strapi tags |
| `published` | `publishedAt` | Convert to date |
| `date` | `createdAt` | Convert to date |

### Navigation

| Statamic/Simple Commerce | Strapi | Notes |
|--------------------------|--------|-------|
| `title` | `title` | Direct mapping |
| `handle` | `handle` | Direct mapping |
| `items.*` | `items` | Convert navigation tree structure |
| `item.title` | `items[*].title` | Direct mapping |
| `item.url` | `items[*].path` | Direct mapping |
| `item.children` | `items[*].items` | Recursive mapping for nested items |

### Global Settings

| Statamic/Simple Commerce | Strapi | Notes |
|--------------------------|--------|-------|
| `site_name` | `siteName` | Direct mapping |
| `contact_email` | `contactInfo.email` | Direct mapping |
| `contact_phone` | `contactInfo.phone` | Direct mapping |
| `contact_address` | `contactInfo.address` | Direct mapping |
| `social_links.*` | `socialLinks` | Map social media links |
| `footer_links.*` | `footerLinks` | Map footer links structure |
| `scripts.*` | `scripts` | Map custom scripts |
| `legal_pages.*` | `legalPages` | Map legal pages references |

## Multi-Region Mapping

### Regions

Create the following regions in Medusa.js:

| Region Name | Currency | Countries | Tax Rate | Payment Methods | Shipping Methods |
|-------------|----------|-----------|----------|-----------------|------------------|
| Netherlands | EUR | NL | 21% | iDeal, Credit Card, PayPal | Standard, Express |
| Belgium | EUR | BE | 21% | Bancontact, Credit Card, PayPal | Standard, Express |
| Germany | EUR | DE | 19% | SOFORT, Credit Card, PayPal | Standard, Express |

### Sales Channels

Create the following sales channels in Medusa.js:

| Sales Channel | Domain | Language | Allowed Regions |
|---------------|--------|----------|-----------------|
| NL Online Store | nl.example.com | nl | Netherlands |
| BE Online Store | be.example.com | fr | Belgium |
| DE Online Store | de.example.com | de | Germany |

### Product Availability

Map product availability across regions using sales channels:

```javascript
// Example migration logic for product availability
for (const product of statamicProducts) {
  const medusaProduct = mapProductToMedusa(product);
  
  // Determine regional availability
  const availableIn = product.available_in || ['nl', 'be', 'de']; // Default to all if not specified
  
  // Add product to appropriate sales channels
  for (const region of availableIn) {
    const salesChannel = getSalesChannelForRegion(region);
    await addProductToSalesChannel(medusaProduct.id, salesChannel.id);
  }
}
```

### Regional Pricing

Map regional pricing variants:

```javascript
// Example migration logic for regional pricing
for (const variant of statamicVariants) {
  const medusaVariant = mapVariantToMedusa(variant);
  
  // Create base price
  const basePrice = variant.price * 100; // Convert to cents
  
  // Create prices for each region
  await createMoneyAmount({
    variant_id: medusaVariant.id,
    amount: basePrice,
    currency_code: "EUR",
    region_id: getRegionId("Netherlands")
  });
  
  // If Belgium has a different price
  if (variant.be_price) {
    await createMoneyAmount({
      variant_id: medusaVariant.id,
      amount: variant.be_price * 100,
      currency_code: "EUR",
      region_id: getRegionId("Belgium")
    });
  } else {
    // Use the same price as Netherlands
    await createMoneyAmount({
      variant_id: medusaVariant.id,
      amount: basePrice,
      currency_code: "EUR",
      region_id: getRegionId("Belgium")
    });
  }
  
  // If Germany has a different price
  if (variant.de_price) {
    await createMoneyAmount({
      variant_id: medusaVariant.id,
      amount: variant.de_price * 100,
      currency_code: "EUR",
      region_id: getRegionId("Germany")
    });
  } else {
    // Use the same price as Netherlands
    await createMoneyAmount({
      variant_id: medusaVariant.id,
      amount: basePrice,
      currency_code: "EUR",
      region_id: getRegionId("Germany")
    });
  }
}
```

## Multi-Language Mapping

### Statamic to Medusa.js/Strapi Locale Mapping

| Statamic Site | Medusa.js | Strapi Locale |
|---------------|-----------|---------------|
| Default site (NL) | Store as metadata | nl (Default) |
| English site | Store as metadata | en |
| Belgium site (FR) | Store as metadata | fr |
| German site | Store as metadata | de |

### Product Data with Multiple Languages

For products with multilingual content:

1. Store the base product data in Medusa.js
2. Store translations in Medusa.js metadata where appropriate:

```json
"metadata": {
  "translations": {
    "en": {
      "title": "English Title",
      "subtitle": "English Subtitle",
      "description": "English Description"
    },
    "fr": {
      "title": "French Title",
      "subtitle": "French Subtitle", 
      "description": "French Description"
    },
    "de": {
      "title": "German Title",
      "subtitle": "German Subtitle",
      "description": "German Description"
    }
  }
}
```

3. For rich content, create separate Strapi ProductEnrichment entries for each language:

```javascript
// Example migration logic for multilingual product content
for (const product of statamicProducts) {
  const medusaProduct = mapProductToMedusa(product);
  
  // Create default language (Dutch) product enrichment in Strapi
  const defaultEnrichment = await createProductEnrichment({
    medusa_id: medusaProduct.id,
    title: product.title,
    content: convertContentToStrapiFormat(product.content),
    // Other fields...
    locale: "nl"
  });
  
  // Create English variant if available
  if (product.translations?.en) {
    await createProductEnrichment({
      medusa_id: medusaProduct.id,
      title: product.translations.en.title,
      content: convertContentToStrapiFormat(product.translations.en.content),
      // Other fields...
      locale: "en"
    });
  }
  
  // Create French variant if available
  if (product.translations?.fr) {
    await createProductEnrichment({
      medusa_id: medusaProduct.id,
      title: product.translations.fr.title,
      content: convertContentToStrapiFormat(product.translations.fr.content),
      // Other fields...
      locale: "fr"
    });
  }
  
  // Create German variant if available
  if (product.translations?.de) {
    await createProductEnrichment({
      medusa_id: medusaProduct.id,
      title: product.translations.de.title,
      content: convertContentToStrapiFormat(product.translations.de.content),
      // Other fields...
      locale: "de"
    });
  }
}
```

### Category Data with Multiple Languages

For category translations:

1. Store the base category data in Medusa.js
2. Store translations in Medusa.js metadata where appropriate
3. Create separate Strapi CategoryEnrichment entries for each language

### Page and Blog Content with Multiple Languages

For page and blog post translations:

1. Create separate Strapi entries for each language
2. Link them using Strapi's localization system

## Content Structure Mapping

### Statamic Bard/Replicator to Strapi Components

| Statamic Field Type | Strapi Component | Notes |
|---------------------|------------------|-------|
| Bard Text | Text Component | Convert markdown to richtext |
| Image | Media Component | Upload and link media |
| Gallery | Media Component with gallery layout | Upload and link multiple media |
| Button | CTA Component | Map button properties |
| Quote | Quote Component | Direct mapping |
| Product | Product Showcase Component | Create reference to product |
| Accordion | Accordion Component | Map accordion items |
| List | Text Component | Convert to richtext list |
| Table | Text Component | Convert to richtext table |
| Video | Media Component | Upload or link video |
| Divider | Special handling | Add as separator in richtext |

### SEO Data Mapping

| Statamic SEO | Strapi SEO | Notes |
|--------------|------------|-------|
| `meta_title` | `seo.title` | Direct mapping |
| `meta_description` | `seo.description` | Direct mapping |
| `canonical_url` | `seo.canonical` | Direct mapping |
| `og_title` | `seo.ogTitle` | Direct mapping |
| `og_description` | `seo.ogDescription` | Direct mapping |
| `og_image` | `seo.ogImage` | Upload and link media |
| `twitter_title` | `seo.twitterTitle` | Direct mapping |
| `twitter_description` | `seo.twitterDescription` | Direct mapping |
| `twitter_image` | `seo.twitterImage` | Upload and link media |

## Asset Mapping

### Image Migration

1. Download all assets from Statamic
2. Process images (optimize, resize if needed)
3. Upload to Medusa.js/Strapi storage
4. Update references in content

### Asset Naming Convention

| Asset Type | Naming Pattern | Example |
|------------|----------------|---------|
| Product Image | `product_{id}_{variant}_{position}.jpg` | `product_123_main_1.jpg` |
| Category Image | `category_{id}_{position}.jpg` | `category_45_1.jpg` |
| Page Image | `page_{slug}_{position}.jpg` | `page_about-us_1.jpg` |
| Blog Image | `blog_{slug}_{position}.jpg` | `blog_summer-sale_1.jpg` |

## Relationship Mapping

### Product to Category Relationships

```javascript
// Example migration logic for product-category relationships
for (const product of statamicProducts) {
  const medusaProduct = mapProductToMedusa(product);
  
  // Get category IDs
  const categoryIds = [];
  for (const categorySlug of product.categories || []) {
    const category = await getCategoryBySlug(categorySlug);
    if (category) {
      categoryIds.push(category.id);
    }
  }
  
  // Add product to categories
  await addProductToCategories(medusaProduct.id, categoryIds);
}
```

### Product to Product Relationships

```javascript
// Example migration logic for related products
for (const product of statamicProducts) {
  if (!product.related_products || product.related_products.length === 0) {
    continue;
  }
  
  const medusaProduct = await getProductByOriginalId(product.id);
  const relatedIds = [];
  
  for (const relatedSlug of product.related_products) {
    const related = await getProductBySlug(relatedSlug);
    if (related) {
      relatedIds.push(related.id);
    }
  }
  
  // Store related product IDs in metadata
  await updateProductMetadata(medusaProduct.id, {
    related_products: relatedIds
  });
}
```

### Page Hierarchy Relationships

```javascript
// Example migration logic for page hierarchy
for (const page of statamicPages) {
  const strapiPage = await getPageByOriginalId(page.id);
  
  if (page.parent) {
    const parentPage = await getPageBySlug(page.parent);
    if (parentPage) {
      await updatePage(strapiPage.id, {
        parent: parentPage.id
      });
    }
  }
}
```

## Special Cases

### Custom Fields

Map any custom fields to metadata in Medusa.js or to custom fields in Strapi.

### Discounts and Promotions

Map Statamic Simple Commerce promotions to Medusa.js discount system:

| Simple Commerce | Medusa.js | Notes |
|-----------------|-----------|-------|
| `code` | `code` | Direct mapping |
| `type` | `rule.type` | Map to appropriate Medusa discount type |
| `value` | `rule.value` | Convert values based on type |
| `minimum_cart_value` | `rule.conditions` | Create condition |
| `valid_from` | `starts_at` | Convert date |
| `expires_at` | `ends_at` | Convert date |
| `scope` | `rule.allocation` | Map to Medusa allocation type |

### Custom Checkout Fields

Map custom checkout fields to order metadata:

```javascript
// Example migration logic for custom checkout fields
for (const order of statamicOrders) {
  const medusaOrder = mapOrderToMedusa(order);
  
  // Collect all custom fields
  const customFields = {};
  
  if (order.gift_wrapping) {
    customFields.gift_wrapping = order.gift_wrapping;
  }
  
  if (order.delivery_instructions) {
    customFields.delivery_instructions = order.delivery_instructions;
  }
  
  if (order.custom_fields) {
    for (const [key, value] of Object.entries(order.custom_fields)) {
      customFields[key] = value;
    }
  }
  
  // Add custom fields as metadata
  if (Object.keys(customFields).length > 0) {
    await updateOrderMetadata(medusaOrder.id, customFields);
  }
}
```

## Migration Validation Rules

### Product Validation

- All products must have at least one variant
- All products must have prices in all applicable regions
- All products must have correct category assignments
- All product images must be successfully migrated
- All product metadata must be correctly transferred

### Customer Validation

- Email addresses must be unique
- Shipping and billing addresses must be valid
- Customer passwords must be securely rehashed or reset
- Customer groups must be correctly assigned

### Order Validation

- Order totals must match the sum of line items, shipping, and taxes
- Order statuses must be correctly mapped
- Order dates must be preserved
- Order relationships (customer, shipping, payment) must be maintained

## Data Transformation Logic

### Text Formatting

Convert Statamic Markdown/HTML to Strapi richtext format:

```javascript
function convertToStrapiRichtext(markdown) {
  // Convert markdown to HTML
  const html = markdownToHtml(markdown);
  
  // Convert HTML to Strapi richtext format
  return htmlToStrapiRichtext(html);
}
```

### Number and Date Formatting

```javascript
// Convert prices to cents (Medusa.js uses cents)
function convertPriceToCents(price) {
  return Math.round(parseFloat(price) * 100);
}

// Convert dates to ISO format
function convertDateToISO(dateString) {
  return new Date(dateString).toISOString();
}
```

### URL Handling

```javascript
// Convert Statamic URLs to frontend URLs
function convertUrl(statamicUrl, locale = 'nl') {
  // Get the slug from the URL
  const slug = statamicUrl.split('/').pop();
  
  // Determine content type from URL
  if (statamicUrl.includes('/products/')) {
    return `/${locale}/products/${slug}`;
  } else if (statamicUrl.includes('/categories/')) {
    return `/${locale}/categories/${slug}`;
  } else if (statamicUrl.includes('/blog/')) {
    return `/${locale}/blog/${slug}`;
  } else {
    return `/${locale}/${slug}`;
  }
}
```

## Migration Sequence

The data migration will follow this sequence:

1. **Regions and Sales Channels**: Set up the foundational multi-region structure
2. **Categories**: Migrate category hierarchy first
3. **Products**: Migrate products and their variants
4. **Customers**: Migrate customer accounts and addresses
5. **Orders**: Migrate order history with all relationships
6. **Content**: Migrate pages, blog posts, and other content
7. **Navigation and Settings**: Migrate global elements last

## Conclusion

This data mapping plan provides a comprehensive strategy for migrating all data from Statamic CMS with Simple Commerce to Medusa.js and Strapi CMS. By following this mapping, we can ensure that all data is correctly transferred while maintaining the integrity of relationships, multilingual content, and multi-region capabilities. 