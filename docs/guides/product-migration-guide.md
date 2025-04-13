# Product Data Migration Guide: Statamic to Medusa.js

This guide outlines the process for migrating product data from Statamic with Simple Commerce to Medusa.js, with special considerations for multi-region and multi-language requirements.

## Prerequisites

Before beginning the migration process, ensure you have:

1. Access to your Statamic site's content files and database
2. A running Medusa.js instance with multi-region support set up
3. Node.js installed for running migration scripts

## Data Structure Comparison

### Statamic Simple Commerce Structure

```yaml
# Simple Commerce Product (typical structure)
title: Product Name
price: 1999
description: Product description
images:
  - products/product1.jpg
slug: product-name
available: true
stock: 100
weight: 500
custom_fields:
  color: Red
  size: Large
translations:
  de:
    title: Produktname
    description: Produktbeschreibung
```

### Medusa.js Structure

```javascript
// Medusa.js Product Structure
{
  title: "Product Name",
  handle: "product-name",
  description: "Product description",
  status: "published",
  images: [...],
  thumbnail: "...",
  variants: [...],
  options: [...],
  sales_channels: [...],
  metadata: {
    translations: {
      nl: { title: "Product Name", description: "Product description" },
      de: { title: "Produktname", description: "Produktbeschreibung" }
    },
    statamic_id: "original_id",
    additional_fields: {
      color: "Red",
      size: "Large"
    }
  }
}
```

## Migration Script

Create a Node.js script for the migration:

```javascript
// scripts/migrate-products.js
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Medusa API client
const medusaClient = axios.create({
  baseURL: process.env.MEDUSA_URL || 'http://localhost:9000',
  headers: {
    'Authorization': `Bearer ${process.env.MEDUSA_ADMIN_API_KEY}`
  }
});

// Sales channel IDs from .env
const SALES_CHANNELS = {
  nl: process.env.NL_CHANNEL_ID,
  be: process.env.BE_CHANNEL_ID,
  de: process.env.DE_CHANNEL_ID
};

// 1. Read Statamic products
async function getStatamicProducts() {
  const productDir = path.join(__dirname, '../statamic-backup/content/collections/products');
  const files = fs.readdirSync(productDir).filter(file => file.endsWith('.yaml'));
  
  return Promise.all(files.map(async file => {
    const content = fs.readFileSync(path.join(productDir, file), 'utf8');
    const data = yaml.parse(content);
    return {
      ...data,
      statamic_id: path.basename(file, '.yaml'),
      file_path: path.join(productDir, file)
    };
  }));
}

// 2. Transform to Medusa.js format
function transformProduct(statamicProduct) {
  // Basic product data
  const product = {
    title: statamicProduct.title,
    handle: statamicProduct.slug,
    description: statamicProduct.description || '',
    status: statamicProduct.available ? 'published' : 'draft',
    metadata: {
      statamic_id: statamicProduct.statamic_id,
      translations: {},
      additional_fields: {}
    }
  };
  
  // Add translations
  if (statamicProduct.translations) {
    // Add default Dutch as base
    product.metadata.translations.nl = {
      title: statamicProduct.title,
      description: statamicProduct.description || ''
    };
    
    // Add other languages
    Object.entries(statamicProduct.translations).forEach(([lang, data]) => {
      product.metadata.translations[lang] = {
        title: data.title || statamicProduct.title,
        description: data.description || statamicProduct.description || ''
      };
    });
  }
  
  // Add custom fields to metadata
  if (statamicProduct.custom_fields) {
    product.metadata.additional_fields = statamicProduct.custom_fields;
  }
  
  // Determine region availability
  const regionAvailability = [];
  if (statamicProduct.available_in_nl !== false) regionAvailability.push('nl');
  if (statamicProduct.available_in_be !== false) regionAvailability.push('be');
  if (statamicProduct.available_in_de !== false) regionAvailability.push('de');
  
  // Default to all regions if not specified
  product.sales_channels = (regionAvailability.length > 0 ? regionAvailability : ['nl', 'be', 'de'])
    .map(region => ({ id: SALES_CHANNELS[region] }))
    .filter(Boolean);
  
  // Create a simple variant if none exists
  if (!statamicProduct.variants || statamicProduct.variants.length === 0) {
    product.variants = [{
      title: 'Default',
      prices: [{
        amount: parseInt(statamicProduct.price) || 0,
        currency_code: 'eur'
      }],
      inventory_quantity: statamicProduct.stock || 0,
      manage_inventory: !!statamicProduct.stock
    }];
  } else {
    // Transform existing variants
    product.variants = statamicProduct.variants.map(variant => ({
      title: variant.title || 'Variant',
      prices: [{
        amount: parseInt(variant.price) || parseInt(statamicProduct.price) || 0,
        currency_code: 'eur'
      }],
      inventory_quantity: variant.stock || statamicProduct.stock || 0,
      manage_inventory: !!(variant.stock || statamicProduct.stock),
      options: variant.options || []
    }));
    
    // Extract unique option types for the product
    const optionTypes = new Set();
    statamicProduct.variants.forEach(variant => {
      if (variant.options) {
        Object.keys(variant.options).forEach(option => optionTypes.add(option));
      }
    });
    
    product.options = Array.from(optionTypes).map(option => ({
      title: option
    }));
  }
  
  return product;
}

// 3. Create products in Medusa.js
async function createMedusaProduct(product) {
  try {
    const response = await medusaClient.post('/admin/products', product);
    console.log(`Created product: ${product.title} (${response.data.product.id})`);
    return response.data.product;
  } catch (error) {
    console.error(`Failed to create product ${product.title}:`, error.response?.data || error.message);
    return null;
  }
}

// 4. Main migration function
async function migrateProducts() {
  try {
    console.log('Starting product migration...');
    
    // Get all Statamic products
    const statamicProducts = await getStatamicProducts();
    console.log(`Found ${statamicProducts.length} products in Statamic`);
    
    // Transform and create each product
    let successCount = 0;
    for (const statamicProduct of statamicProducts) {
      const medusaProduct = transformProduct(statamicProduct);
      const created = await createMedusaProduct(medusaProduct);
      if (created) successCount++;
    }
    
    console.log(`Migration complete. ${successCount}/${statamicProducts.length} products migrated successfully.`);
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateProducts();
```

## Region and Language Considerations

### Region-Specific Product Availability

Products are assigned to sales channels based on their availability in each region. The script checks for `available_in_nl`, `available_in_be`, and `available_in_de` flags in the Statamic data.

### Handling Multi-Currency Pricing

For region-specific pricing, create a post-migration script that sets up price lists:

```javascript
// scripts/create-price-lists.js
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const medusaClient = axios.create({
  baseURL: process.env.MEDUSA_URL || 'http://localhost:9000',
  headers: {
    'Authorization': `Bearer ${process.env.MEDUSA_ADMIN_API_KEY}`
  }
});

async function createRegionPriceLists() {
  // Get all products
  const { data: { products } } = await medusaClient.get('/admin/products');
  
  // Create a price list for each region
  const regions = [
    { id: process.env.NL_REGION_ID, name: 'Netherlands', code: 'nl', adjustment: 0 },
    { id: process.env.BE_REGION_ID, name: 'Belgium', code: 'be', adjustment: 0 },
    { id: process.env.DE_REGION_ID, name: 'Germany', code: 'de', adjustment: 5 } // 5% higher prices in Germany
  ];
  
  for (const region of regions) {
    // Create price list
    const { data: { price_list } } = await medusaClient.post('/admin/price-lists', {
      name: `${region.name} Prices`,
      description: `Price list for ${region.name}`,
      type: 'override',
      status: 'active',
      prices: []
    });
    
    // Add products to price list with region-specific pricing
    const prices = products.flatMap(product => 
      product.variants.map(variant => ({
        variant_id: variant.id,
        region_id: region.id,
        amount: Math.round(variant.prices[0].amount * (1 + region.adjustment / 100))
      }))
    );
    
    // Add prices in batches to avoid request size limits
    const batchSize = 100;
    for (let i = 0; i < prices.length; i += batchSize) {
      const batch = prices.slice(i, i + batchSize);
      await medusaClient.post(`/admin/price-lists/${price_list.id}/prices/batch`, {
        prices: batch
      });
      console.log(`Added batch ${i/batchSize + 1} of prices to ${region.name} price list`);
    }
    
    console.log(`Created price list for ${region.name} with ${prices.length} prices`);
  }
}

createRegionPriceLists();
```

### Handling Translations

Translations are stored in the product metadata, but should also be transferred to Strapi for enhanced content management:

```javascript
// scripts/migrate-translations-to-strapi.js
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Medusa API client
const medusaClient = axios.create({
  baseURL: process.env.MEDUSA_URL || 'http://localhost:9000',
  headers: {
    'Authorization': `Bearer ${process.env.MEDUSA_ADMIN_API_KEY}`
  }
});

// Strapi API client
const strapiClient = axios.create({
  baseURL: process.env.STRAPI_URL || 'http://localhost:1337',
  headers: {
    'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`
  }
});

async function migrateTranslationsToStrapi() {
  // Get all products from Medusa
  const { data: { products } } = await medusaClient.get('/admin/products');
  
  for (const product of products) {
    // Skip products without translations
    if (!product.metadata?.translations) continue;
    
    try {
      // Create base entry in default locale (nl)
      const baseResponse = await strapiClient.post('/api/product-contents', {
        data: {
          productId: product.id,
          extendedDescription: product.description || '',
          locale: 'nl'
        }
      });
      
      const baseId = baseResponse.data.data.id;
      
      // Create translations for other locales
      const translations = product.metadata.translations;
      for (const [locale, content] of Object.entries(translations)) {
        if (locale === 'nl') continue; // Skip default locale
        
        await strapiClient.post('/api/product-contents', {
          data: {
            productId: product.id,
            extendedDescription: content.description || product.description || '',
            locale,
            // Link to base entry for localization
            localizations: [baseId]
          }
        });
      }
      
      console.log(`Migrated translations for product: ${product.title}`);
    } catch (error) {
      console.error(`Failed to migrate translations for ${product.title}:`, error.response?.data || error.message);
    }
  }
}

migrateTranslationsToStrapi();
```

## Product Images Migration

Medusa.js handles product images differently than Statamic. Create a migration script for images:

```javascript
// scripts/migrate-product-images.js
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Medusa API client
const medusaClient = axios.create({
  baseURL: process.env.MEDUSA_URL || 'http://localhost:9000',
  headers: {
    'Authorization': `Bearer ${process.env.MEDUSA_ADMIN_API_KEY}`
  }
});

// Image source directory
const IMAGE_DIR = path.join(__dirname, '../statamic-backup/public/assets');

async function migrateProductImages() {
  // Get all products from Medusa
  const { data: { products } } = await medusaClient.get('/admin/products');
  
  for (const product of products) {
    // Get original Statamic product for image paths
    const statamicId = product.metadata?.statamic_id;
    if (!statamicId) continue;
    
    try {
      // Read Statamic product file to get image paths
      const statamicFilePath = path.join(__dirname, `../statamic-backup/content/collections/products/${statamicId}.yaml`);
      const statamicContent = fs.readFileSync(statamicFilePath, 'utf8');
      const imagePaths = extractImagePaths(statamicContent);
      
      if (imagePaths.length === 0) continue;
      
      // Upload each image
      const uploadedImages = [];
      for (const imagePath of imagePaths) {
        const fullImagePath = path.join(IMAGE_DIR, imagePath);
        if (!fs.existsSync(fullImagePath)) {
          console.warn(`Image not found: ${fullImagePath}`);
          continue;
        }
        
        // Upload to Medusa
        const formData = new FormData();
        formData.append('files', fs.createReadStream(fullImagePath));
        
        const uploadResponse = await medusaClient.post('/admin/uploads', formData, {
          headers: {
            ...formData.getHeaders()
          }
        });
        
        uploadedImages.push(...uploadResponse.data.uploads.map(u => u.url));
      }
      
      // Update product with images
      if (uploadedImages.length > 0) {
        await medusaClient.post(`/admin/products/${product.id}`, {
          images: uploadedImages,
          thumbnail: uploadedImages[0]
        });
        
        console.log(`Added ${uploadedImages.length} images to product: ${product.title}`);
      }
    } catch (error) {
      console.error(`Failed to migrate images for ${product.title}:`, error.response?.data || error.message);
    }
  }
}

// Helper function to extract image paths from Statamic YAML
function extractImagePaths(content) {
  const matches = content.match(/images:[\s\S]*?(?=\n\w|$)/);
  if (!matches) return [];
  
  const imageBlock = matches[0];
  const paths = imageBlock.match(/- ([^\n]+)/g);
  
  return paths ? paths.map(p => p.replace('- ', '').trim()) : [];
}

migrateProductImages();
```

## Running the Migration

Execute the migration scripts in sequence:

```bash
# 1. Run the main product migration
node scripts/migrate-products.js

# 2. Set up region-specific pricing
node scripts/create-price-lists.js

# 3. Migrate product images
node scripts/migrate-product-images.js

# 4. Migrate translations to Strapi
node scripts/migrate-translations-to-strapi.js
```

## Validation and Verification

After migration, verify the data integrity:

1. Check that all products are available in Medusa.js
2. Verify region-specific pricing and availability
3. Confirm that translations are correctly stored in both Medusa.js metadata and Strapi
4. Test product display in all regional storefronts
5. Validate image migration and display

## Post-Migration Cleanup

1. Convert any remaining custom fields to product attributes or options
2. Update any hard-coded references to product IDs
3. Document any manual adjustments that were needed
4. Update inventory levels if needed

## Troubleshooting Tips

- **Missing products**: Check the logs for specific errors during migration
- **Image issues**: Verify file paths and permissions in the source directory
- **Pricing problems**: Ensure region IDs are correctly set in the environment variables
- **Translation errors**: Check that Strapi is properly configured for all required locales 