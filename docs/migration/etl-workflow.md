# Migration ETL Workflow

## Overview

This document outlines the Extract-Transform-Load (ETL) process for migrating data from Statamic/Simple Commerce to our new Medusa.js/Strapi platform. The workflow focuses on preserving data integrity while adapting to the new multi-region, multi-language structure.

## Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Statamic CMS   │     │  Transformation │     │   Medusa.js     │
│  Simple Commerce│ ──> │     Scripts     │ ──> │     Strapi      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
       Extract                Transform               Load
```

## 1. Extract Phase

The extraction process involves pulling data from various sources in the Statamic/Simple Commerce system.

### Data Sources

- **Statamic Collections**: Product data, categories, blog posts, pages
- **Simple Commerce**: Products, variants, prices, customers, orders
- **Assets**: Images, documents, media files
- **Global Settings**: Site configuration, navigation, settings
- **User Data**: Customer accounts, preferences

### Extraction Methods

#### CLI Export Tool

We will develop a custom CLI tool that interacts with Statamic's API to extract data in JSON format:

```javascript
// extract.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const STATAMIC_API_URL = process.env.STATAMIC_API_URL;
const API_KEY = process.env.STATAMIC_API_KEY;

async function extractCollection(collection) {
  try {
    const response = await axios.get(
      `${STATAMIC_API_URL}/collections/${collection}/entries`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    
    const outputDir = path.join(__dirname, 'extracted-data', 'collections');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(outputDir, `${collection}.json`),
      JSON.stringify(response.data, null, 2)
    );
    
    console.log(`Extracted ${collection} collection`);
  } catch (error) {
    console.error(`Error extracting ${collection}:`, error.message);
  }
}

async function extractGlobals() {
  try {
    const response = await axios.get(
      `${STATAMIC_API_URL}/globals`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    
    const outputDir = path.join(__dirname, 'extracted-data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(outputDir, 'globals.json'),
      JSON.stringify(response.data, null, 2)
    );
    
    console.log('Extracted global settings');
  } catch (error) {
    console.error('Error extracting globals:', error.message);
  }
}

// Define collections to extract
const collections = [
  'products',
  'categories',
  'pages',
  'blog',
  // Add more collections as needed
];

// Run extraction
async function runExtraction() {
  for (const collection of collections) {
    await extractCollection(collection);
  }
  await extractGlobals();
  
  // Extract Simple Commerce data
  await extractSimpleCommerceData();
  
  console.log('Extraction complete!');
}

async function extractSimpleCommerceData() {
  // Simple Commerce specific extraction logic
  // ... implementation details
}

runExtraction();
```

#### Database Dumps

For direct database access, create SQL dumps of the Statamic database:

```bash
# Example command for MySQL
mysqldump -u username -p statamic_db > statamic_dump.sql

# Example command for PostgreSQL
pg_dump -U username -W -F p statamic_db > statamic_dump.sql
```

#### File System Export

For assets and files, use filesystem operations to copy files maintaining directory structure:

```javascript
// extract-assets.js
const fs = require('fs-extra');
const path = require('path');

const SOURCE_ASSETS_DIR = path.join(__dirname, '../statamic-project/public/assets');
const TARGET_ASSETS_DIR = path.join(__dirname, 'extracted-data/assets');

async function extractAssets() {
  try {
    // Copy the entire assets directory
    await fs.copy(SOURCE_ASSETS_DIR, TARGET_ASSETS_DIR);
    console.log('Assets extracted successfully');
  } catch (error) {
    console.error('Error extracting assets:', error.message);
  }
}

extractAssets();
```

### Extraction Validation

To ensure data extraction completeness, we will implement validation checks:

1. Count records in source and extracted data
2. Verify critical fields exist
3. Check file integrity for assets
4. Log any extraction errors or warnings

## 2. Transform Phase

The transformation phase converts the extracted data into the format required by Medusa.js and Strapi.

### Data Mapping

Apply the mappings defined in the Data Mapping Specification document to convert between schemas:

```javascript
// transform.js
const fs = require('fs');
const path = require('path');

// Load extracted data
const productsData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, 'extracted-data/collections/products.json')
  )
);

// Transform products to Medusa.js format
function transformProducts(products) {
  return products.map(product => {
    // Basic product data
    const medusaProduct = {
      title: product.title,
      handle: product.slug,
      description: product.description || '',
      status: mapProductStatus(product.status),
      thumbnail: product.thumbnail ? `/images/${path.basename(product.thumbnail)}` : null,
      // Use original Statamic ID for reference
      external_id: product.id,
      // Multi-region and multi-language
      metadata: {
        original_created_at: product.created_at,
        original_updated_at: product.updated_at,
        translations: {
          en: {
            title: product.title,
            description: product.description || '',
          },
          // Add other languages if available
        },
        seo: {
          title: product.meta_title || product.title,
          description: product.meta_description || '',
        },
        original_statamic_path: product.uri,
      }
    };
    
    // Handle variants
    if (product.variants && product.variants.length > 0) {
      medusaProduct.variants = transformVariants(product.variants, product);
    } else {
      // Create a default variant if none exist
      medusaProduct.variants = [{
        title: 'Default Variant',
        prices: transformPrices(product.price, product),
        sku: product.sku || `${product.slug}-001`,
        inventory_quantity: product.stock || 0,
        manage_inventory: product.track_inventory || false,
      }];
    }
    
    return medusaProduct;
  });
}

// Helper functions for transformation
function mapProductStatus(statamicStatus) {
  const statusMap = {
    'published': 'published',
    'draft': 'draft',
    // Add other status mappings
  };
  return statusMap[statamicStatus] || 'draft';
}

function transformVariants(variants, product) {
  return variants.map((variant, index) => {
    return {
      title: variant.name || `Variant ${index + 1}`,
      prices: transformPrices(variant.price, product),
      sku: variant.sku || `${product.slug}-${index + 1}`,
      inventory_quantity: variant.stock || 0,
      manage_inventory: variant.track_inventory || false,
      options: transformOptions(variant, product),
      metadata: {
        original_variant_id: variant.id,
      }
    };
  });
}

function transformPrices(price, product) {
  // Create prices for each region with appropriate currency
  const regions = [
    { code: 'nl', currency: 'eur' },
    { code: 'be', currency: 'eur' },
    { code: 'de', currency: 'eur' },
  ];
  
  return regions.map(region => {
    // Convert price to cents for Medusa.js
    const amount = Math.round(parseFloat(price) * 100);
    
    // Apply region-specific price adjustments if needed
    let regionalAmount = amount;
    if (product.regional_prices && product.regional_prices[region.code]) {
      regionalAmount = Math.round(parseFloat(product.regional_prices[region.code]) * 100);
    }
    
    return {
      currency_code: region.currency,
      amount: regionalAmount,
    };
  });
}

function transformOptions(variant, product) {
  // Transform variant options (size, color, etc.)
  const options = [];
  
  if (product.options && variant.option_values) {
    for (const optionValue of variant.option_values) {
      const option = product.options.find(o => o.id === optionValue.option_id);
      if (option) {
        options.push({
          option_id: option.id, // Will be replaced with Medusa option ID during import
          value: optionValue.value,
        });
      }
    }
  }
  
  return options;
}

// Transform and save the products
const transformedProducts = transformProducts(productsData.data);

// Ensure output directory exists
const outputDir = path.join(__dirname, 'transformed-data/medusa');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write transformed data
fs.writeFileSync(
  path.join(outputDir, 'products.json'),
  JSON.stringify(transformedProducts, null, 2)
);

console.log(`Transformed ${transformedProducts.length} products`);

// Similar functions would be created for other entity types
```

### Multi-Region Transformation

For multi-region support, the transformation script will:

1. Create separate regions for NL, BE, and DE
2. Configure region-specific settings:
   - Currencies (EUR for all in this case)
   - Payment providers
   - Tax rates
   - Shipping options
3. Duplicate products across regions where appropriate
4. Create sales channels for each domain

### Multi-Language Transformation

For multi-language support:

1. Create language variants in metadata for Medusa.js entities
2. Prepare localized content for Strapi import
3. Map language codes: 
   - 'nl' for Dutch
   - 'en' for English
   - 'fr' for French (Belgium)
   - 'de' for German

### Asset Transformation

Asset transformation involves:

1. Optimizing images for web delivery
2. Renaming files to follow consistent patterns
3. Organizing into appropriate directory structures
4. Generating appropriate metadata

```javascript
// transform-assets.js
const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

const SOURCE_ASSETS_DIR = path.join(__dirname, 'extracted-data/assets');
const TARGET_ASSETS_DIR = path.join(__dirname, 'transformed-data/assets');

async function transformAssets() {
  try {
    // Create target directory
    await fs.ensureDir(TARGET_ASSETS_DIR);
    
    // Get all image files
    const imageFiles = await getImageFiles(SOURCE_ASSETS_DIR);
    
    // Process each image
    for (const imageFile of imageFiles) {
      await processImage(imageFile);
    }
    
    console.log('Asset transformation complete');
  } catch (error) {
    console.error('Error transforming assets:', error.message);
  }
}

async function getImageFiles(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  const imageFiles = [];
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      const subDirFiles = await getImageFiles(fullPath);
      imageFiles.push(...subDirFiles);
    } else {
      const ext = path.extname(file.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        imageFiles.push(fullPath);
      }
    }
  }
  
  return imageFiles;
}

async function processImage(imagePath) {
  const filename = path.basename(imagePath);
  const relativePath = path.relative(SOURCE_ASSETS_DIR, imagePath);
  const outputPath = path.join(TARGET_ASSETS_DIR, relativePath);
  
  // Ensure directory exists
  await fs.ensureDir(path.dirname(outputPath));
  
  // Process image with sharp
  await sharp(imagePath)
    .resize(1200, null, { withoutEnlargement: true }) // Resize to max width 1200px
    .jpeg({ quality: 85 }) // Convert to JPEG with 85% quality
    .toFile(outputPath.replace(/\.[^.]+$/, '.jpg')); // Change extension to jpg
  
  console.log(`Processed: ${relativePath}`);
}

transformAssets();
```

### Transformation Validation

Validate the transformed data to ensure it meets the requirements of the target systems:

1. Schema validation against Medusa.js and Strapi requirements
2. Data integrity checks
3. Relationship validation
4. Language and region completeness checks

## 3. Load Phase

The load phase imports the transformed data into Medusa.js and Strapi.

### Medusa.js Import

Use the Medusa.js API and Admin JS API to import data:

```javascript
// load-medusa.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MEDUSA_API_URL = process.env.MEDUSA_API_URL;
const MEDUSA_ADMIN_API_URL = process.env.MEDUSA_ADMIN_API_URL;
const ADMIN_EMAIL = process.env.MEDUSA_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD;

let authToken = null;

// Load transformed data
const products = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, 'transformed-data/medusa/products.json')
  )
);

// Authenticate with Medusa Admin API
async function authenticate() {
  try {
    const response = await axios.post(
      `${MEDUSA_ADMIN_API_URL}/auth/token`,
      {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      }
    );
    
    authToken = response.data.access_token;
    console.log('Authenticated with Medusa Admin API');
  } catch (error) {
    console.error('Authentication error:', error.message);
    throw error;
  }
}

// Create a product in Medusa.js
async function createProduct(product) {
  try {
    const response = await axios.post(
      `${MEDUSA_ADMIN_API_URL}/products`,
      product,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    console.log(`Created product: ${product.title}`);
    return response.data.product;
  } catch (error) {
    console.error(`Error creating product ${product.title}:`, error.message);
    throw error;
  }
}

// Configure regions
async function setupRegions() {
  const regions = [
    {
      name: 'Netherlands',
      currency_code: 'eur',
      tax_rate: 21, // 21% VAT
      payment_providers: ['stripe', 'manual'],
      countries: ['nl'],
    },
    {
      name: 'Belgium',
      currency_code: 'eur',
      tax_rate: 21, // 21% VAT
      payment_providers: ['stripe', 'manual'],
      countries: ['be'],
    },
    {
      name: 'Germany',
      currency_code: 'eur',
      tax_rate: 19, // 19% VAT
      payment_providers: ['stripe', 'manual'],
      countries: ['de'],
    }
  ];
  
  for (const region of regions) {
    try {
      const response = await axios.post(
        `${MEDUSA_ADMIN_API_URL}/regions`,
        region,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      
      console.log(`Created region: ${region.name}`);
    } catch (error) {
      console.error(`Error creating region ${region.name}:`, error.message);
      throw error;
    }
  }
}

// Configure sales channels
async function setupSalesChannels() {
  const salesChannels = [
    {
      name: 'NL Online Store',
      description: 'Netherlands online store',
    },
    {
      name: 'BE Online Store',
      description: 'Belgium online store',
    },
    {
      name: 'DE Online Store',
      description: 'Germany online store',
    }
  ];
  
  for (const channel of salesChannels) {
    try {
      const response = await axios.post(
        `${MEDUSA_ADMIN_API_URL}/sales-channels`,
        channel,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      
      console.log(`Created sales channel: ${channel.name}`);
    } catch (error) {
      console.error(`Error creating sales channel ${channel.name}:`, error.message);
      throw error;
    }
  }
}

// Main import function
async function importToMedusa() {
  try {
    await authenticate();
    
    // Setup regions and sales channels
    await setupRegions();
    await setupSalesChannels();
    
    // Import products
    for (const product of products) {
      await createProduct(product);
    }
    
    // Import other entities
    // await importCustomers();
    // await importOrders();
    // etc.
    
    console.log('Medusa.js import complete');
  } catch (error) {
    console.error('Import failed:', error.message);
  }
}

importToMedusa();
```

### Strapi Import

Use the Strapi API to import content:

```javascript
// load-strapi.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
require('dotenv').config();

const STRAPI_API_URL = process.env.STRAPI_API_URL;
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

// Load transformed data
const pages = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, 'transformed-data/strapi/pages.json')
  )
);

// Create a page in Strapi
async function createPage(page) {
  try {
    const response = await axios.post(
      `${STRAPI_API_URL}/pages`,
      page,
      {
        headers: {
          'Authorization': `Bearer ${STRAPI_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`Created page: ${page.title}`);
    return response.data;
  } catch (error) {
    console.error(`Error creating page ${page.title}:`, error.message);
    throw error;
  }
}

// Upload a media file to Strapi
async function uploadMedia(filePath) {
  try {
    const formData = new FormData();
    formData.append('files', fs.createReadStream(filePath));
    
    const response = await axios.post(
      `${STRAPI_API_URL}/upload`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${STRAPI_TOKEN}`,
          ...formData.getHeaders()
        }
      }
    );
    
    console.log(`Uploaded media: ${path.basename(filePath)}`);
    return response.data[0].id;
  } catch (error) {
    console.error(`Error uploading media ${filePath}:`, error.message);
    throw error;
  }
}

// Create localized content
async function createLocalizedContent(contentType, id, locale, data) {
  try {
    const response = await axios.put(
      `${STRAPI_API_URL}/${contentType}/${id}/localizations/${locale}`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${STRAPI_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`Created ${locale} localization for ${contentType} ${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error creating localization:`, error.message);
    throw error;
  }
}

// Main import function
async function importToStrapi() {
  try {
    // Import pages
    for (const page of pages) {
      // Create the default locale version first
      const createdPage = await createPage(page);
      
      // Create localizations for other languages
      if (page.localizations) {
        for (const [locale, data] of Object.entries(page.localizations)) {
          await createLocalizedContent('pages', createdPage.id, locale, data);
        }
      }
    }
    
    // Import other content types
    // await importCollections();
    // await importGlobalSettings();
    // etc.
    
    console.log('Strapi import complete');
  } catch (error) {
    console.error('Import failed:', error.message);
  }
}

importToStrapi();
```

### Parallel Processing

For large datasets, implement parallel processing with throttling:

```javascript
// parallel-import.js
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Number of parallel workers (adjust based on system resources)
const NUM_WORKERS = Math.max(1, os.cpus().length - 1);

if (isMainThread) {
  const products = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, 'transformed-data/medusa/products.json')
    )
  );
  
  // Split products into chunks for parallel processing
  const chunkSize = Math.ceil(products.length / NUM_WORKERS);
  const chunks = [];
  
  for (let i = 0; i < products.length; i += chunkSize) {
    chunks.push(products.slice(i, i + chunkSize));
  }
  
  let completedWorkers = 0;
  
  // Start workers
  chunks.forEach((chunk, index) => {
    const worker = new Worker(__filename, {
      workerData: {
        products: chunk,
        workerId: index
      }
    });
    
    worker.on('message', (message) => {
      console.log(`Worker ${message.workerId}: ${message.status}`);
      
      if (message.complete) {
        completedWorkers++;
        
        if (completedWorkers === chunks.length) {
          console.log('All workers completed. Import finished.');
        }
      }
    });
    
    worker.on('error', (error) => {
      console.error(`Worker ${index} error:`, error);
    });
    
    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker ${index} exited with code ${code}`);
      }
    });
  });
} else {
  // Worker code - runs in separate threads
  const { products, workerId } = workerData;
  
  async function importProducts() {
    try {
      parentPort.postMessage({
        workerId,
        status: `Starting import of ${products.length} products`
      });
      
      // Authenticate with Medusa (implementation not shown for brevity)
      
      // Process products sequentially within this worker
      for (let i = 0; i < products.length; i++) {
        // Import the product (implementation not shown for brevity)
        
        // Report progress
        if (i % 10 === 0 || i === products.length - 1) {
          parentPort.postMessage({
            workerId,
            status: `Imported ${i + 1}/${products.length} products`
          });
        }
        
        // Add a small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      parentPort.postMessage({
        workerId,
        status: 'Import complete',
        complete: true
      });
    } catch (error) {
      parentPort.postMessage({
        workerId,
        status: `Error: ${error.message}`,
        error: true
      });
    }
  }
  
  importProducts();
}
```

### Load Validation

Implement validation checks to ensure data is correctly loaded:

1. Count records to verify all data was imported
2. Verify data integrity in the target systems
3. Check relationships between entities
4. Validate multi-region and multi-language functionality

## 4. Post-Migration Tasks

After the ETL process, perform the following tasks:

### Data Verification

Create scripts to compare source and target data:

```javascript
// verify-migration.js
const axios = require('axios');
require('dotenv').config();

const STATAMIC_API_URL = process.env.STATAMIC_API_URL;
const MEDUSA_API_URL = process.env.MEDUSA_API_URL;
const API_KEY = process.env.STATAMIC_API_KEY;
const MEDUSA_API_KEY = process.env.MEDUSA_API_KEY;

async function verifyProductCounts() {
  try {
    // Get Statamic product count
    const statamicResponse = await axios.get(
      `${STATAMIC_API_URL}/collections/products/entries`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    
    const statamicCount = statamicResponse.data.data.length;
    
    // Get Medusa product count
    const medusaResponse = await axios.get(
      `${MEDUSA_API_URL}/admin/products`,
      {
        headers: {
          'Authorization': `Bearer ${MEDUSA_API_KEY}`
        },
        params: {
          limit: 1 // We just need the count, not all products
        }
      }
    );
    
    const medusaCount = medusaResponse.data.count;
    
    console.log(`Statamic products: ${statamicCount}`);
    console.log(`Medusa products: ${medusaCount}`);
    
    if (statamicCount !== medusaCount) {
      console.warn(`Product count mismatch! Check for issues.`);
    } else {
      console.log('Product counts match.');
    }
  } catch (error) {
    console.error('Verification error:', error.message);
  }
}

// Run verification checks
async function runVerification() {
  await verifyProductCounts();
  // Add more verification functions as needed
}

runVerification();
```

### URL Redirects

Generate a redirect map for SEO preservation:

```javascript
// generate-redirects.js
const fs = require('fs');
const path = require('path');

// Load transformed products with original URLs
const products = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, 'transformed-data/medusa/products.json')
  )
);

function generateRedirects() {
  const redirects = [];
  
  // Generate product redirects
  for (const product of products) {
    if (product.metadata && product.metadata.original_statamic_path) {
      // Map the old URL to the new URL pattern
      const oldUrl = `/products/${product.metadata.original_statamic_path}`;
      const newUrl = `/products/${product.handle}`;
      
      redirects.push(`${oldUrl} ${newUrl} 301`);
    }
  }
  
  // Write to Nginx redirect file
  fs.writeFileSync(
    path.join(__dirname, 'redirects.map'),
    redirects.join('\n')
  );
  
  console.log(`Generated ${redirects.length} redirects`);
}

generateRedirects();
```

### Clean-up Scripts

Create scripts to clean up any temporary migration data:

```javascript
// cleanup.js
const fs = require('fs-extra');
const path = require('path');

async function cleanup() {
  try {
    // Clean up temporary extraction directories
    await fs.remove(path.join(__dirname, 'extracted-data'));
    await fs.remove(path.join(__dirname, 'transformed-data'));
    
    // Remove any other temporary files
    const tempFiles = [
      'temp-migration-log.txt',
      'migration-stats.json'
    ];
    
    for (const file of tempFiles) {
      if (fs.existsSync(path.join(__dirname, file))) {
        await fs.remove(path.join(__dirname, file));
      }
    }
    
    console.log('Cleanup complete');
  } catch (error) {
    console.error('Cleanup error:', error.message);
  }
}

cleanup();
```

## Error Handling

Implement robust error handling throughout the migration process:

1. Logging all errors with context
2. Retrying failed operations with exponential backoff
3. Creating error reports for manual review
4. Implementing rollback procedures for critical failures

## Monitoring and Reporting

Create monitoring and reporting tools:

```javascript
// migration-report.js
const fs = require('fs');
const path = require('path');

// Load migration logs
const migrationLog = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, 'migration-log.json')
  )
);

function generateReport() {
  const summary = {
    startTime: migrationLog.startTime,
    endTime: migrationLog.endTime,
    duration: (new Date(migrationLog.endTime) - new Date(migrationLog.startTime)) / 1000,
    totalEntities: 0,
    successfulEntities: 0,
    failedEntities: 0,
    entityBreakdown: {},
    errors: []
  };
  
  // Process log entries
  for (const entry of migrationLog.entries) {
    // Count by entity type
    if (!summary.entityBreakdown[entry.entityType]) {
      summary.entityBreakdown[entry.entityType] = {
        total: 0,
        successful: 0,
        failed: 0
      };
    }
    
    summary.entityBreakdown[entry.entityType].total++;
    summary.totalEntities++;
    
    if (entry.success) {
      summary.entityBreakdown[entry.entityType].successful++;
      summary.successfulEntities++;
    } else {
      summary.entityBreakdown[entry.entityType].failed++;
      summary.failedEntities++;
      summary.errors.push({
        entityType: entry.entityType,
        entityId: entry.entityId,
        error: entry.error
      });
    }
  }
  
  // Generate HTML report
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Migration Report</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      .summary { background-color: #f0f0f0; padding: 15px; border-radius: 5px; }
      .success { color: green; }
      .error { color: red; }
      table { border-collapse: collapse; width: 100%; margin-top: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
    </style>
  </head>
  <body>
    <h1>Migration Report</h1>
    
    <div class="summary">
      <h2>Summary</h2>
      <p>Start Time: ${new Date(summary.startTime).toLocaleString()}</p>
      <p>End Time: ${new Date(summary.endTime).toLocaleString()}</p>
      <p>Duration: ${summary.duration.toFixed(2)} seconds</p>
      <p>Total Entities: ${summary.totalEntities}</p>
      <p class="success">Successful: ${summary.successfulEntities}</p>
      <p class="error">Failed: ${summary.failedEntities}</p>
    </div>
    
    <h2>Entity Breakdown</h2>
    <table>
      <tr>
        <th>Entity Type</th>
        <th>Total</th>
        <th>Successful</th>
        <th>Failed</th>
      </tr>
      ${Object.entries(summary.entityBreakdown).map(([type, counts]) => `
        <tr>
          <td>${type}</td>
          <td>${counts.total}</td>
          <td>${counts.successful}</td>
          <td>${counts.failed}</td>
        </tr>
      `).join('')}
    </table>
    
    ${summary.errors.length > 0 ? `
      <h2>Errors</h2>
      <table>
        <tr>
          <th>Entity Type</th>
          <th>Entity ID</th>
          <th>Error</th>
        </tr>
        ${summary.errors.map(err => `
          <tr>
            <td>${err.entityType}</td>
            <td>${err.entityId}</td>
            <td>${err.error}</td>
          </tr>
        `).join('')}
      </table>
    ` : ''}
  </body>
  </html>
  `;
  
  fs.writeFileSync(
    path.join(__dirname, 'migration-report.html'),
    html
  );
  
  console.log('Migration report generated');
}

generateReport();
```

## Rollback Procedures

Implement procedures for rolling back the migration if critical issues are discovered:

1. Database backups before import
2. Versioned imports
3. Step-by-step rollback scripts

## Security Considerations

Implement security best practices:

1. Secure API key handling
2. Data encryption during transfer
3. Audit logging of all migration steps
4. Access controls for migration scripts and data

## Conclusion

This ETL workflow provides a comprehensive approach to migrating data from Statamic/Simple Commerce to Medusa.js/Strapi while maintaining data integrity and addressing the multi-region, multi-language requirements. By following this structured approach, we can ensure a smooth transition with minimal disruption. 