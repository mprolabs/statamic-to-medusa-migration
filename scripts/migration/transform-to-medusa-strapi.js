#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');

program
  .description('Transform extracted Statamic/Simple Commerce data for Medusa.js and Strapi')
  .option('--input <path>', 'Input directory containing extracted Statamic data', './extracted-data')
  .option('--output <path>', 'Output directory for transformed data', './transformed-data')
  .option('--site <site>', 'Site identifier (e.g., nl, be, de)', 'nl')
  .option('--medusa-region <region>', 'Medusa region identifier', 'nl')
  .option('--default-currency <currency>', 'Default currency for prices', 'EUR')
  .parse(process.argv);

const options = program.opts();
const inputDir = path.join(process.cwd(), options.input, options.site);
const outputDir = path.join(process.cwd(), options.output);
const medusaDir = path.join(outputDir, 'medusa');
const strapiDir = path.join(outputDir, 'strapi');

// Create necessary directories
console.log(chalk.blue('Creating output directories...'));
[
  outputDir,
  medusaDir,
  strapiDir,
  path.join(medusaDir, 'products'),
  path.join(medusaDir, 'regions'),
  path.join(medusaDir, 'customers'),
  path.join(medusaDir, 'orders'),
  path.join(strapiDir, 'collections'),
  path.join(strapiDir, 'assets'),
  path.join(strapiDir, 'navigation')
].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(chalk.green(`Created directory: ${dir}`));
  }
});

// Main transformation functions
async function transformData() {
  try {
    console.log(chalk.blue('Starting data transformation...'));
    
    // Record start time
    const startTime = new Date();
    
    // Transform products from Simple Commerce to Medusa.js
    await transformProducts();
    
    // Transform collections to Strapi
    await transformCollections();
    
    // Transform customers to Medusa.js
    await transformCustomers();
    
    // Transform orders to Medusa.js
    await transformOrders();
    
    // Transform taxonomies to Strapi
    await transformTaxonomies();
    
    // Transform navigation to Strapi
    await transformNavigation();
    
    // Transform assets to Strapi
    await transformAssets();
    
    // Create region configuration for Medusa.js
    await createRegionConfig();
    
    // Record end time and write summary
    const endTime = new Date();
    const summary = {
      transformation: {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: `${(endTime - startTime) / 1000} seconds`,
        site: options.site,
        medusaRegion: options.medusaRegion,
        defaultCurrency: options.defaultCurrency
      }
    };
    
    fs.writeFileSync(
      path.join(outputDir, 'transformation-summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    console.log(chalk.green('Transformation completed successfully!'));
    console.log(chalk.yellow(`Duration: ${(endTime - startTime) / 1000} seconds`));
  } catch (error) {
    console.error(chalk.red('Error during transformation:'), error);
    process.exit(1);
  }
}

// Transform products from Simple Commerce to Medusa.js
async function transformProducts() {
  try {
    console.log(chalk.blue('Transforming products...'));
    const productsFile = path.join(inputDir, 'products', 'products.json');
    
    if (!fs.existsSync(productsFile)) {
      console.log(chalk.yellow(`No products file found at ${productsFile}`));
      return;
    }
    
    const statamicProducts = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
    const medusaProducts = statamicProducts.map(product => transformProductToMedusa(product));
    
    fs.writeFileSync(
      path.join(medusaDir, 'products', 'products.json'),
      JSON.stringify(medusaProducts, null, 2)
    );
    
    console.log(chalk.green(`Transformed ${medusaProducts.length} products to Medusa.js format`));
  } catch (error) {
    console.error(chalk.red('Error transforming products:'), error);
  }
}

// Transform a single Statamic/Simple Commerce product to Medusa.js format
function transformProductToMedusa(statamicProduct) {
  // Extract base product information
  const medusaProduct = {
    title: statamicProduct.title || 'Untitled Product',
    handle: statamicProduct.slug || generateSlug(statamicProduct.title),
    description: statamicProduct.description || '',
    status: 'draft',
    thumbnail: statamicProduct.thumbnail || null,
    options: extractProductOptions(statamicProduct),
    variants: extractProductVariants(statamicProduct),
    // Medusa.js specific fields
    is_giftcard: false,
    discountable: true,
    categories: extractCategories(statamicProduct),
    tags: extractTags(statamicProduct),
    // Multi-language support
    translations: extractTranslations(statamicProduct),
    // Original ID for reference
    metadata: {
      statamic_id: statamicProduct.id || null,
      statamic_updated_at: statamicProduct.updated_at || null,
      region: options.medusaRegion
    }
  };
  
  return medusaProduct;
}

// Extract product options from Statamic product
function extractProductOptions(product) {
  const defaultOptions = [];
  
  // If the product has variants in Statamic/Simple Commerce, extract their options
  if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    // Get unique option names from all variants
    const optionNames = new Set();
    product.variants.forEach(variant => {
      if (variant.options && typeof variant.options === 'object') {
        Object.keys(variant.options).forEach(key => optionNames.add(key));
      }
    });
    
    // Create option objects for Medusa.js
    return Array.from(optionNames).map(name => ({
      title: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize option name
      values: getUniqueOptionValues(product.variants, name)
    }));
  }
  
  // Default option if no variants exist
  if (defaultOptions.length === 0) {
    defaultOptions.push({
      title: 'Size',
      values: ['Default']
    });
  }
  
  return defaultOptions;
}

// Get unique option values for a specific option across all variants
function getUniqueOptionValues(variants, optionName) {
  const values = new Set();
  
  variants.forEach(variant => {
    if (variant.options && variant.options[optionName]) {
      values.add(variant.options[optionName]);
    }
  });
  
  return Array.from(values);
}

// Extract product variants from Statamic product
function extractProductVariants(product) {
  if (!product.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
    // Create a default variant if none exist
    return [{
      title: product.title || 'Default Variant',
      sku: product.sku || generateSku(product.title),
      barcode: product.barcode || null,
      ean: product.ean || null,
      inventory_quantity: product.inventory_quantity || 0,
      allow_backorder: false,
      manage_inventory: true,
      weight: product.weight || 0,
      length: product.length || 0,
      width: product.width || 0,
      height: product.height || 0,
      origin_country: null,
      options: [{ value: 'Default' }],
      prices: [{
        currency_code: options.defaultCurrency,
        amount: convertPrice(product.price || 0)
      }],
      metadata: {
        statamic_variant_id: null
      }
    }];
  }
  
  // Transform each variant
  return product.variants.map(variant => {
    // Extract variant options in the format Medusa.js expects
    const variantOptions = [];
    if (variant.options && typeof variant.options === 'object') {
      Object.entries(variant.options).forEach(([name, value]) => {
        variantOptions.push({ value: String(value) });
      });
    }
    
    return {
      title: variant.title || `${product.title} Variant`,
      sku: variant.sku || generateSku(variant.title || product.title),
      barcode: variant.barcode || null,
      ean: variant.ean || null,
      inventory_quantity: variant.inventory_quantity || 0,
      allow_backorder: Boolean(variant.allow_backorder),
      manage_inventory: variant.manage_inventory !== false,
      weight: variant.weight || 0,
      length: variant.length || 0,
      width: variant.width || 0,
      height: variant.height || 0,
      origin_country: variant.origin_country || null,
      options: variantOptions,
      prices: [{
        currency_code: options.defaultCurrency,
        amount: convertPrice(variant.price || product.price || 0)
      }],
      metadata: {
        statamic_variant_id: variant.id || null
      }
    };
  });
}

// Helper function to convert price (Statamic might store as decimal, Medusa uses cents)
function convertPrice(price) {
  // Ensure price is a number
  price = parseFloat(price);
  
  // Medusa.js stores prices in the smallest currency unit (cents for EUR/USD)
  return Math.round(price * 100);
}

// Transform collections from Statamic to Strapi
async function transformCollections() {
  try {
    console.log(chalk.blue('Transforming collections...'));
    const collectionsFile = path.join(inputDir, 'collections', 'collections.json');
    
    if (!fs.existsSync(collectionsFile)) {
      console.log(chalk.yellow(`No collections file found at ${collectionsFile}`));
      return;
    }
    
    const statamicCollections = JSON.parse(fs.readFileSync(collectionsFile, 'utf8'));
    const strapiCollections = statamicCollections.map(collection => ({
      title: collection.title || 'Untitled Collection',
      slug: collection.slug || generateSlug(collection.title),
      description: collection.description || '',
      locale: collection.locale || options.site,
      entries: collection.entries || [],
      // Multi-language support
      localizations: collection.localizations || [],
      // Metadata for reference
      metadata: {
        statamic_id: collection.id || null,
        statamic_handle: collection.handle || null
      }
    }));
    
    fs.writeFileSync(
      path.join(strapiDir, 'collections', 'collections.json'),
      JSON.stringify(strapiCollections, null, 2)
    );
    
    console.log(chalk.green(`Transformed ${strapiCollections.length} collections to Strapi format`));
  } catch (error) {
    console.error(chalk.red('Error transforming collections:'), error);
  }
}

// Create Medusa.js region configuration
async function createRegionConfig() {
  try {
    console.log(chalk.blue('Creating Medusa.js region configuration...'));
    
    // Define region configuration based on site
    const regionConfig = {
      name: getRegionName(options.medusaRegion),
      currency_code: options.defaultCurrency,
      tax_rate: getTaxRate(options.medusaRegion),
      payment_providers: getPaymentProviders(options.medusaRegion),
      fulfillment_providers: ['manual'],
      countries: getCountryCodes(options.medusaRegion),
      includes_tax: true,
      metadata: {
        site_code: options.site,
        languages: getLanguages(options.site)
      }
    };
    
    fs.writeFileSync(
      path.join(medusaDir, 'regions', `${options.medusaRegion}.json`),
      JSON.stringify(regionConfig, null, 2)
    );
    
    console.log(chalk.green(`Created region configuration for ${options.medusaRegion}`));
  } catch (error) {
    console.error(chalk.red('Error creating region configuration:'), error);
  }
}

// Get region name based on region code
function getRegionName(regionCode) {
  const regionNames = {
    nl: 'Netherlands',
    be: 'Belgium',
    de: 'Germany',
    // Add more as needed
    default: 'Default Region'
  };
  
  return regionNames[regionCode] || regionNames.default;
}

// Get tax rate based on region code
function getTaxRate(regionCode) {
  const taxRates = {
    nl: 21, // 21% VAT in the Netherlands
    be: 21, // 21% VAT in Belgium
    de: 19, // 19% VAT in Germany
    // Add more as needed
    default: 0
  };
  
  return taxRates[regionCode] || taxRates.default;
}

// Get payment providers based on region
function getPaymentProviders(regionCode) {
  const commonProviders = ['stripe', 'manual'];
  
  const regionSpecificProviders = {
    nl: ['ideal', ...commonProviders],
    be: ['bancontact', ...commonProviders],
    de: ['giropay', ...commonProviders],
    // Add more as needed
    default: commonProviders
  };
  
  return regionSpecificProviders[regionCode] || regionSpecificProviders.default;
}

// Get country codes based on region
function getCountryCodes(regionCode) {
  const countryCodes = {
    nl: ['NL'],
    be: ['BE'],
    de: ['DE'],
    // Add more as needed
    default: ['US']
  };
  
  return countryCodes[regionCode] || countryCodes.default;
}

// Get languages for the site
function getLanguages(siteCode) {
  const siteLanguages = {
    nl: ['nl-NL', 'en-NL'],
    be: ['nl-BE', 'fr-BE', 'en-BE'],
    de: ['de-DE', 'en-DE'],
    // Add more as needed
    default: ['en']
  };
  
  return siteLanguages[siteCode] || siteLanguages.default;
}

// Helper function to extract product categories
function extractCategories(product) {
  if (!product.categories) return [];
  
  if (Array.isArray(product.categories)) {
    return product.categories.map(category => ({
      id: category.id || null,
      name: category.name || 'Uncategorized'
    }));
  }
  
  return [];
}

// Helper function to extract product tags
function extractTags(product) {
  if (!product.tags) return [];
  
  if (typeof product.tags === 'string') {
    return product.tags.split(',').map(tag => tag.trim()).filter(Boolean);
  }
  
  if (Array.isArray(product.tags)) {
    return product.tags.map(tag => typeof tag === 'string' ? tag : tag.name || '').filter(Boolean);
  }
  
  return [];
}

// Helper function to extract translations
function extractTranslations(entity) {
  const translations = {};
  
  // If the entity has localized versions or translations field
  if (entity.translations && typeof entity.translations === 'object') {
    Object.entries(entity.translations).forEach(([locale, data]) => {
      translations[locale] = data;
    });
  }
  
  return translations;
}

// Helper function to generate slug from title
function generateSlug(title) {
  if (!title) return 'untitled';
  
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .trim();
}

// Helper function to generate SKU
function generateSku(title) {
  if (!title) return 'UNKNOWN-SKU';
  
  // Extract first letters of each word and add timestamp
  const prefix = title
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('');
  
  const timestamp = Date.now().toString().slice(-6);
  
  return `${prefix}-${timestamp}`;
}

// Function stubs for other transformations
// These would be implemented similar to products and collections
async function transformCustomers() {
  console.log(chalk.blue('Transforming customers (stub)...'));
  // TODO: Implement customer transformation
}

async function transformOrders() {
  console.log(chalk.blue('Transforming orders (stub)...'));
  // TODO: Implement order transformation
}

async function transformTaxonomies() {
  console.log(chalk.blue('Transforming taxonomies (stub)...'));
  // TODO: Implement taxonomy transformation
}

async function transformNavigation() {
  console.log(chalk.blue('Transforming navigation (stub)...'));
  // TODO: Implement navigation transformation
}

async function transformAssets() {
  console.log(chalk.blue('Transforming assets (stub)...'));
  // TODO: Implement asset transformation
}

// Execute the transformation
transformData().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
}); 