---
title: Product Migration Scripts
parent: Product Migration
nav_order: 2
has_toc: true
multilang_export: true
permalink: /migration/product-migration/migration-scripts/
---

# Product Migration Scripts

This document outlines the scripts required for migrating products from Statamic Simple Commerce to Saleor, with specific focus on handling multiple regions and languages.

## Script Architecture

The migration process will use a modular script architecture with the following components:

1. **Configuration Module**: For setting environment-specific parameters
2. **Extraction Module**: For retrieving data from Statamic
3. **Transformation Module**: For converting data to Saleor format
4. **Loading Module**: For inserting data into Saleor via GraphQL
5. **Validation Module**: For verifying successful migration
6. **Logging Module**: For tracking the migration process

## Configuration Script

```javascript
// config.js
module.exports = {
  // Statamic connection settings
  statamic: {
    apiUrl: process.env.STATAMIC_API_URL,
    apiKey: process.env.STATAMIC_API_KEY,
    collections: {
      products: 'products',
      categories: 'categories'
    }
  },
  
  // Saleor connection settings
  saleor: {
    apiUrl: process.env.SALEOR_API_URL,
    authToken: process.env.SALEOR_AUTH_TOKEN,
    channels: {
      nl: {
        slug: 'netherlands',
        currency: 'EUR',
        warehouseId: 'NL-WAREHOUSE'
      },
      be: {
        slug: 'belgium',
        currency: 'EUR',
        warehouseId: 'BE-WAREHOUSE'
      },
      de: {
        slug: 'germany',
        currency: 'EUR',
        warehouseId: 'DE-WAREHOUSE'
      }
    }
  },
  
  // Language mappings
  languages: {
    default: 'en',
    supported: ['nl', 'de', 'fr', 'en'],
    fallbacks: {
      'be': ['fr', 'nl', 'en'],
      'de': ['de', 'en'],
      'nl': ['nl', 'en']
    }
  },
  
  // Batch size for processing
  batchSize: 50,
  
  // Logging settings
  logging: {
    level: 'info',
    file: './logs/product-migration.log'
  }
};
```

## Extraction Script

```javascript
// extract.js
const axios = require('axios');
const config = require('./config');
const fs = require('fs');
const logger = require('./logger');

async function extractProducts() {
  logger.info('Starting product extraction from Statamic');
  
  try {
    const response = await axios.get(
      `${config.statamic.apiUrl}/collections/${config.statamic.collections.products}/entries`,
      {
        headers: {
          'Authorization': `Bearer ${config.statamic.apiKey}`
        }
      }
    );
    
    const products = response.data.data;
    logger.info(`Extracted ${products.length} products from Statamic`);
    
    // Save extracted data to temporary file
    fs.writeFileSync('./temp/extracted-products.json', JSON.stringify(products, null, 2));
    
    return products;
  } catch (error) {
    logger.error('Error extracting products from Statamic', { error: error.message });
    throw error;
  }
}

async function extractCategories() {
  // Similar implementation for categories
}

async function extractProductTranslations() {
  logger.info('Extracting product translations');
  
  const translations = {};
  
  // For each supported language
  for (const lang of config.languages.supported) {
    if (lang === config.languages.default) continue;
    
    try {
      const response = await axios.get(
        `${config.statamic.apiUrl}/collections/${config.statamic.collections.products}/entries`,
        {
          headers: {
            'Authorization': `Bearer ${config.statamic.apiKey}`,
            'X-Language': lang
          }
        }
      );
      
      translations[lang] = response.data.data;
      logger.info(`Extracted ${translations[lang].length} product translations for ${lang}`);
    } catch (error) {
      logger.error(`Error extracting ${lang} translations`, { error: error.message });
    }
  }
  
  // Save translations to temporary file
  fs.writeFileSync('./temp/product-translations.json', JSON.stringify(translations, null, 2));
  
  return translations;
}

module.exports = {
  extractProducts,
  extractCategories,
  extractProductTranslations
};
```

## Transformation Script

```javascript
// transform.js
const config = require('./config');
const logger = require('./logger');
const attributeMapping = require('./attribute-mapping');

function transformProduct(statamicProduct, translations = {}) {
  logger.info(`Transforming product: ${statamicProduct.title}`);
  
  // Basic product data
  const product = {
    name: statamicProduct.title,
    slug: statamicProduct.slug,
    description: transformRichText(statamicProduct.description),
    productType: mapProductType(statamicProduct.product_type),
    isPublished: statamicProduct.published || false,
    seoTitle: statamicProduct.seo_title || statamicProduct.title,
    seoDescription: statamicProduct.seo_description || '',
    // Map other base fields
  };
  
  // Add translations
  product.translations = {};
  for (const lang of config.languages.supported) {
    if (lang === config.languages.default) continue;
    
    const langData = translations[lang]?.find(p => p.id === statamicProduct.id);
    if (langData) {
      product.translations[lang] = {
        name: langData.title,
        description: transformRichText(langData.description),
        seoTitle: langData.seo_title || langData.title,
        seoDescription: langData.seo_description || ''
      };
    }
  }
  
  // Transform variants
  product.variants = transformVariants(statamicProduct.variants || [], translations);
  
  // Transform channels
  product.channels = transformChannels(statamicProduct, translations);
  
  // Transform attributes
  product.attributes = transformAttributes(statamicProduct, translations);
  
  return product;
}

function transformVariants(variants, translations) {
  // Implementation of variant transformation
  return variants.map(variant => ({
    name: variant.title,
    sku: variant.sku,
    // Other variant fields
  }));
}

function transformChannels(product, translations) {
  // For each channel, create a listing with channel-specific data
  const channels = {};
  
  for (const [region, channelConfig] of Object.entries(config.saleor.channels)) {
    channels[region] = {
      channelSlug: channelConfig.slug,
      isPublished: product.published || false,
      isAvailableForPurchase: true,
      visibleInListings: true,
      pricing: transformRegionalPricing(product, region)
    };
  }
  
  return channels;
}

function transformRegionalPricing(product, region) {
  // Logic to extract region-specific pricing
  // This could be from a specific field or calculated
  
  const basePrice = product.price || 0;
  
  // Example logic for regional price adjustments
  const adjustments = {
    nl: 1.0,  // No adjustment
    be: 1.05, // 5% higher in Belgium
    de: 1.1   // 10% higher in Germany
  };
  
  return basePrice * (adjustments[region] || 1.0);
}

function transformAttributes(product, translations) {
  // Implementation of attribute transformation based on mapping
  const attributes = [];
  
  // Map each custom attribute based on the mapping document
  for (const [key, value] of Object.entries(product)) {
    const mapping = attributeMapping.find(m => m.source === key);
    if (mapping) {
      attributes.push({
        name: mapping.target,
        values: Array.isArray(value) ? value : [value],
        translations: transformAttributeTranslations(key, value, translations)
      });
    }
  }
  
  return attributes;
}

function transformRichText(bard) {
  // Logic to transform Statamic Bard fields to Saleor's JSON rich text format
  // This would involve parsing the Bard structure and creating equivalent JSON
  if (!bard) return null;
  
  // This is a simplified example - actual implementation would be more complex
  return JSON.stringify({
    blocks: Array.isArray(bard) ? bard.map(block => ({
      type: block.type,
      data: block.content
    })) : []
  });
}

module.exports = {
  transformProduct
};
```

## Loading Script

```javascript
// load.js
const { gql, GraphQLClient } = require('graphql-request');
const config = require('./config');
const logger = require('./logger');

const client = new GraphQLClient(config.saleor.apiUrl, {
  headers: {
    authorization: `Bearer ${config.saleor.authToken}`
  }
});

async function createProductType(productType) {
  logger.info(`Creating product type: ${productType.name}`);
  
  const mutation = gql`
    mutation CreateProductType($input: ProductTypeInput!) {
      productTypeCreate(input: $input) {
        productType {
          id
          name
        }
        errors {
          field
          message
        }
      }
    }
  `;
  
  try {
    const result = await client.request(mutation, { input: productType });
    return result.productTypeCreate.productType;
  } catch (error) {
    logger.error(`Error creating product type: ${productType.name}`, { error: error.message });
    throw error;
  }
}

async function createProduct(product) {
  logger.info(`Creating product: ${product.name}`);
  
  const mutation = gql`
    mutation CreateProduct($input: ProductCreateInput!) {
      productCreate(input: $input) {
        product {
          id
          name
        }
        errors {
          field
          message
        }
      }
    }
  `;
  
  try {
    const result = await client.request(mutation, { input: product });
    
    if (result.productCreate.errors.length > 0) {
      logger.warn(`Warnings during product creation: ${product.name}`, { errors: result.productCreate.errors });
    }
    
    // Store the mapping between Statamic ID and Saleor ID for reference
    storeIdMapping(product.statamicId, result.productCreate.product.id);
    
    return result.productCreate.product;
  } catch (error) {
    logger.error(`Error creating product: ${product.name}`, { error: error.message });
    throw error;
  }
}

async function createProductVariant(productId, variant) {
  logger.info(`Creating variant for product ${productId}: ${variant.name}`);
  
  const mutation = gql`
    mutation CreateProductVariant($productId: ID!, $input: ProductVariantCreateInput!) {
      productVariantCreate(product: $productId, input: $input) {
        productVariant {
          id
          name
        }
        errors {
          field
          message
        }
      }
    }
  `;
  
  try {
    const result = await client.request(mutation, { 
      productId, 
      input: variant 
    });
    
    return result.productVariantCreate.productVariant;
  } catch (error) {
    logger.error(`Error creating product variant: ${variant.name}`, { error: error.message });
    throw error;
  }
}

async function createProductTranslation(productId, lang, translationData) {
  logger.info(`Creating translation for product ${productId} in language: ${lang}`);
  
  const mutation = gql`
    mutation ProductTranslate($productId: ID!, $languageCode: LanguageCodeEnum!, $input: TranslationInput!) {
      productTranslate(id: $productId, languageCode: $languageCode, input: $input) {
        product {
          translation(languageCode: $languageCode) {
            name
            description
          }
        }
        errors {
          field
          message
        }
      }
    }
  `;
  
  try {
    const result = await client.request(mutation, {
      productId,
      languageCode: lang.toUpperCase(),
      input: translationData
    });
    
    return result.productTranslate.product;
  } catch (error) {
    logger.error(`Error creating product translation for ${lang}`, { error: error.message });
    throw error;
  }
}

async function updateProductChannelListing(productId, channelData) {
  logger.info(`Updating channel listing for product ${productId}`);
  
  const mutation = gql`
    mutation ProductChannelListingUpdate($productId: ID!, $input: ProductChannelListingUpdateInput!) {
      productChannelListingUpdate(id: $productId, input: $input) {
        product {
          id
          channelListings {
            channel {
              slug
            }
            isPublished
            isAvailableForPurchase
          }
        }
        errors {
          field
          message
          channels
        }
      }
    }
  `;
  
  try {
    const result = await client.request(mutation, {
      productId,
      input: {
        updateChannels: Object.values(channelData)
      }
    });
    
    return result.productChannelListingUpdate.product;
  } catch (error) {
    logger.error(`Error updating product channel listing`, { error: error.message });
    throw error;
  }
}

function storeIdMapping(statamicId, saleorId) {
  // Implementation to store mapping between IDs for reference and validation
}

module.exports = {
  createProductType,
  createProduct,
  createProductVariant,
  createProductTranslation,
  updateProductChannelListing
};
```

## Main Migration Script

```javascript
// migrate-products.js
const config = require('./config');
const extract = require('./extract');
const transform = require('./transform');
const load = require('./load');
const validate = require('./validate');
const logger = require('./logger');

async function migrateProducts() {
  try {
    logger.info('Starting product migration process');
    
    // Step 1: Extract data from Statamic
    const products = await extract.extractProducts();
    const categories = await extract.extractCategories();
    const translations = await extract.extractProductTranslations();
    
    logger.info(`Extracted ${products.length} products and ${Object.keys(translations).length} language variants`);
    
    // Step 2: Transform and load in batches
    for (let i = 0; i < products.length; i += config.batchSize) {
      const batch = products.slice(i, i + config.batchSize);
      logger.info(`Processing batch ${Math.floor(i/config.batchSize) + 1} of ${Math.ceil(products.length/config.batchSize)}`);
      
      for (const statamicProduct of batch) {
        try {
          // Transform product data
          const saleorProduct = transform.transformProduct(
            statamicProduct, 
            translations
          );
          
          // Create product in Saleor
          const createdProduct = await load.createProduct({
            ...saleorProduct,
            statamicId: statamicProduct.id // Used for reference
          });
          
          // Create variants
          for (const variant of saleorProduct.variants) {
            await load.createProductVariant(createdProduct.id, variant);
          }
          
          // Create translations
          for (const [lang, data] of Object.entries(saleorProduct.translations)) {
            await load.createProductTranslation(createdProduct.id, lang, data);
          }
          
          // Update channel listings
          await load.updateProductChannelListing(createdProduct.id, saleorProduct.channels);
          
          logger.info(`Successfully migrated product: ${statamicProduct.title}`);
        } catch (error) {
          logger.error(`Failed to migrate product: ${statamicProduct.title}`, { error: error.message });
          // Continue with next product
        }
      }
    }
    
    // Step 3: Validate migration
    const validationResults = await validate.validateMigration();
    logger.info('Validation results', validationResults);
    
    logger.info('Product migration completed');
    return {
      success: true,
      productsProcessed: products.length,
      validationResults
    };
  } catch (error) {
    logger.error('Product migration failed', { error: error.message });
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the migration
migrateProducts().then(result => {
  console.log('Migration result:', result);
}).catch(error => {
  console.error('Migration error:', error);
  process.exit(1);
});
```

## Script Usage Instructions

To use these migration scripts:

1. **Install Dependencies**:
   ```bash
   npm install axios graphql-request winston
   ```

2. **Configure Environment Variables**:
   Create a `.env` file with the following variables:
   ```
   STATAMIC_API_URL=https://your-statamic-site.com/api
   STATAMIC_API_KEY=your-statamic-api-key
   SALEOR_API_URL=https://your-saleor-instance.com/graphql/
   SALEOR_AUTH_TOKEN=your-saleor-auth-token
   ```

3. **Create Attribute Mapping File**:
   Create a file called `attribute-mapping.js` that exports an array of mappings between Statamic attributes and Saleor attributes, based on the Product Attribute Mapping document.

4. **Create Required Directories**:
   ```bash
   mkdir -p ./logs ./temp
   ```

5. **Run Migration**:
   ```bash
   node migrate-products.js
   ```

6. **Monitor Logs**:
   Check the `./logs/product-migration.log` file for detailed progress information.

## Error Handling and Retries

The migration script includes error handling at multiple levels:

1. **Individual Product Errors**: If a single product fails to migrate, the script logs the error and continues with the next product.

2. **Batch Processing**: Products are processed in batches to manage memory usage and enable partial progress if errors occur.

3. **Validation**: After migration, products are validated to ensure they were correctly created in Saleor.

4. **Logging**: Comprehensive logging captures the migration process, making it easier to identify and resolve issues.

For manual retry of failed products, extract the list of failed product IDs from the logs and run a targeted migration script that processes only those products. 