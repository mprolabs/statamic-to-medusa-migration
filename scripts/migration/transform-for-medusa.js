#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');
const slugify = require('slugify');

// Command line interface
program
  .description('Transform extracted Statamic/Simple Commerce data for Medusa.js and Strapi')
  .option('--input <path>', 'Input directory with extracted data', './extracted-data')
  .option('--output <path>', 'Output directory for transformed data', './transformed-data')
  .option('--site <site>', 'Site identifier to process (e.g. nl, be, de)', 'nl')
  .option('--medusa-region <region>', 'Medusa region code (e.g. eu, eu-be, eu-de)', 'eu-nl')
  .option('--currency <currency>', 'Default currency for this region', 'eur')
  .parse(process.argv);

const options = program.opts();
const inputDir = path.join(process.cwd(), options.input, options.site);
const outputDir = path.join(process.cwd(), options.output);

// Create output directories
console.log(chalk.blue('Creating output directories...'));
[
  outputDir,
  path.join(outputDir, 'medusa'),
  path.join(outputDir, 'medusa', 'products'),
  path.join(outputDir, 'medusa', 'regions'),
  path.join(outputDir, 'medusa', 'customers'),
  path.join(outputDir, 'strapi'),
  path.join(outputDir, 'strapi', 'collections'),
  path.join(outputDir, 'strapi', 'content')
].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(chalk.green(`Created directory: ${dir}`));
  }
});

// Main transformation function
async function transformData() {
  try {
    console.log(chalk.blue(`Starting data transformation for site ${options.site}...`));
    
    // Record start time
    const startTime = new Date();
    
    // Transform products for Medusa.js
    await transformProducts();
    
    // Transform collections for Strapi
    await transformCollections();
    
    // Create region configuration for Medusa.js
    await createRegionConfig();
    
    // Transform customers for Medusa.js (stub)
    await transformCustomers();
    
    // Transform orders for Medusa.js (stub)
    await transformOrders();
    
    // Transform taxonomies for Strapi (stub)
    await transformTaxonomies();
    
    // Transform navigation for Strapi (stub)
    await transformNavigation();
    
    // Transform assets (stub)
    await transformAssets();
    
    // Record end time and write summary
    const endTime = new Date();
    const summary = {
      transformation: {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: `${(endTime - startTime) / 1000} seconds`,
        site: options.site,
        medusaRegion: options.medusaRegion,
        currency: options.currency
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

// Transform products from Statamic to Medusa.js format
async function transformProducts() {
  try {
    console.log(chalk.blue('Transforming products...'));
    
    // Read extracted products
    const productsPath = path.join(inputDir, 'products', 'products.json');
    
    if (!fs.existsSync(productsPath)) {
      console.log(chalk.yellow(`Products file not found at ${productsPath}`));
      return;
    }
    
    const statamicProducts = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    
    // Transform to Medusa.js format
    const medusaProducts = statamicProducts.map(product => {
      // Extract product options and variants
      const options = extractProductOptions(product);
      const variants = extractProductVariants(product, options);
      
      // Extract categories and tags
      const categories = extractProductCategories(product);
      const tags = extractProductTags(product);
      
      // Extract translations
      const translations = extractProductTranslations(product);
      
      return {
        title: product.title || 'Untitled Product',
        subtitle: product.subtitle || null,
        description: product.description || '',
        handle: generateSlug(product.slug || product.title),
        is_giftcard: false,
        discountable: true,
        thumbnail: product.thumbnail || null,
        weight: product.weight || 0,
        length: product.dimensions?.length || 0,
        width: product.dimensions?.width || 0,
        height: product.dimensions?.height || 0,
        hs_code: product.hs_code || null,
        origin_country: product.origin_country || null,
        mid_code: product.mid_code || null,
        material: product.material || null,
        collection_id: product.collection_id || null,
        type_id: product.type_id || null,
        status: product.published ? 'published' : 'draft',
        external_id: product.id,
        metadata: {
          statamic_id: product.id,
          original_site: options.site,
          translations: translations
        },
        options: options,
        variants: variants,
        categories: categories,
        tags: tags
      };
    });
    
    // Save transformed products to JSON
    fs.writeFileSync(
      path.join(outputDir, 'medusa', 'products', 'products.json'),
      JSON.stringify(medusaProducts, null, 2)
    );
    
    console.log(chalk.green(`Transformed ${medusaProducts.length} products`));
  } catch (error) {
    console.error(chalk.red('Error transforming products:'), error);
  }
}

// Helper function to extract product options
function extractProductOptions(product) {
  const result = [];
  
  // If product has variants with options, extract them
  if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    // Find unique option names across all variants
    const optionNames = new Set();
    
    product.variants.forEach(variant => {
      if (variant.options && typeof variant.options === 'object') {
        Object.keys(variant.options).forEach(key => optionNames.add(key));
      }
    });
    
    // Create option objects
    Array.from(optionNames).forEach(name => {
      result.push({
        title: name,
        values: getUniqueOptionValues(product.variants, name)
      });
    });
  }
  
  // If no options found, create a default 'Size' option
  if (result.length === 0) {
    result.push({
      title: 'Size',
      values: ['Default']
    });
  }
  
  return result;
}

// Helper function to get unique option values across variants
function getUniqueOptionValues(variants, optionName) {
  const values = new Set();
  
  variants.forEach(variant => {
    if (variant.options && variant.options[optionName]) {
      values.add(variant.options[optionName]);
    }
  });
  
  return Array.from(values);
}

// Helper function to extract product variants
function extractProductVariants(product, options) {
  const result = [];
  
  // If product has variants, transform them
  if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    product.variants.forEach((variant, index) => {
      // Build option values array
      const optionValues = options.map(option => {
        return {
          option_id: null, // Will be filled by Medusa during import
          value: variant.options && variant.options[option.title] 
            ? variant.options[option.title] 
            : option.values[0] // Default to first value
        };
      });
      
      result.push({
        title: variant.title || `${product.title} - Variant ${index + 1}`,
        sku: variant.sku || generateSku(product.title, index),
        barcode: variant.barcode || null,
        ean: variant.ean || null,
        upc: variant.upc || null,
        inventory_quantity: variant.inventory || 0,
        allow_backorder: variant.allow_backorder || false,
        manage_inventory: variant.inventory !== undefined,
        weight: variant.weight || product.weight || 0,
        length: variant.dimensions?.length || product.dimensions?.length || 0,
        width: variant.dimensions?.width || product.dimensions?.width || 0,
        height: variant.dimensions?.height || product.dimensions?.height || 0,
        origin_country: variant.origin_country || product.origin_country || null,
        hs_code: variant.hs_code || product.hs_code || null,
        mid_code: variant.mid_code || product.mid_code || null,
        material: variant.material || product.material || null,
        metadata: {
          statamic_variant_id: variant.id,
          original_site: options.site
        },
        prices: [
          {
            region_id: null, // Will be assigned during import
            currency_code: options.currency,
            amount: convertPrice(variant.price || 0),
            min_quantity: null,
            max_quantity: null
          }
        ],
        options: optionValues
      });
    });
  } else {
    // If no variants, create a default one
    // Build option values array for default variant
    const optionValues = options.map(option => {
      return {
        option_id: null, // Will be filled by Medusa during import
        value: option.values[0] // Use first value
      };
    });
    
    result.push({
      title: `${product.title} - Default`,
      sku: product.sku || generateSku(product.title, 0),
      barcode: product.barcode || null,
      ean: product.ean || null,
      upc: product.upc || null,
      inventory_quantity: product.inventory || 0,
      allow_backorder: product.allow_backorder || false,
      manage_inventory: product.inventory !== undefined,
      weight: product.weight || 0,
      length: product.dimensions?.length || 0,
      width: product.dimensions?.width || 0,
      height: product.dimensions?.height || 0,
      origin_country: product.origin_country || null,
      hs_code: product.hs_code || null,
      mid_code: product.mid_code || null,
      material: product.material || null,
      metadata: {
        statamic_id: product.id,
        original_site: options.site
      },
      prices: [
        {
          region_id: null, // Will be assigned during import
          currency_code: options.currency,
          amount: convertPrice(product.price || 0),
          min_quantity: null,
          max_quantity: null
        }
      ],
      options: optionValues
    });
  }
  
  return result;
}

// Helper function to convert price from decimal to cents (Medusa uses cents)
function convertPrice(price) {
  return Math.round(parseFloat(price) * 100);
}

// Helper function to extract product categories
function extractProductCategories(product) {
  // This depends on how categories are stored in your Statamic products
  if (product.categories && Array.isArray(product.categories)) {
    return product.categories;
  }
  
  return [];
}

// Helper function to extract product tags
function extractProductTags(product) {
  // This depends on how tags are stored in your Statamic products
  if (product.tags && Array.isArray(product.tags)) {
    return product.tags;
  }
  
  return [];
}

// Helper function to extract product translations
function extractProductTranslations(product) {
  // This depends on how translations are stored in your Statamic products
  if (product.translations && typeof product.translations === 'object') {
    return product.translations;
  }
  
  return {};
}

// Helper function to generate a slug
function generateSlug(text) {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
}

// Helper function to generate a SKU
function generateSku(title, variantIndex) {
  const base = title.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 3);
  return `${base}-${options.site.toUpperCase()}-${variantIndex.toString().padStart(4, '0')}`;
}

// Transform collections from Statamic to Strapi format
async function transformCollections() {
  try {
    console.log(chalk.blue('Transforming collections...'));
    
    // Read extracted collections
    const collectionsPath = path.join(inputDir, 'collections', 'collections.json');
    
    if (!fs.existsSync(collectionsPath)) {
      console.log(chalk.yellow(`Collections file not found at ${collectionsPath}`));
      return;
    }
    
    const statamicCollections = JSON.parse(fs.readFileSync(collectionsPath, 'utf8'));
    
    // Transform to Strapi format
    // Note: Strapi's content structure will depend on your specific content types
    const strapiCollections = statamicCollections.map(collection => {
      return {
        // Basic mapping of common fields
        identifier: collection.handle,
        title: collection.title,
        description: collection.description || '',
        slug: generateSlug(collection.handle || collection.title),
        published: true,
        site: options.site,
        medusa_collection_id: null, // Will be filled after Medusa import
        metadata: {
          statamic_id: collection.id,
          original_site: options.site
        },
        // Add any other Strapi-specific fields here
        // ...
      };
    });
    
    // Save transformed collections to JSON
    fs.writeFileSync(
      path.join(outputDir, 'strapi', 'collections', 'collections.json'),
      JSON.stringify(strapiCollections, null, 2)
    );
    
    console.log(chalk.green(`Transformed ${strapiCollections.length} collections`));
  } catch (error) {
    console.error(chalk.red('Error transforming collections:'), error);
  }
}

// Create region configuration for Medusa.js
async function createRegionConfig() {
  try {
    console.log(chalk.blue('Creating region configuration...'));
    
    // Map site to appropriate region settings
    const regionConfig = {
      name: getRegionName(options.site),
      currency_code: options.currency,
      countries: getRegionCountries(options.site),
      tax_rate: getRegionTaxRate(options.site),
      tax_code: getRegionTaxCode(options.site),
      payment_providers: getRegionPaymentProviders(options.site),
      fulfillment_providers: getRegionFulfillmentProviders(options.site),
      metadata: {
        original_site: options.site
      }
    };
    
    // Save region configuration to JSON
    fs.writeFileSync(
      path.join(outputDir, 'medusa', 'regions', `${options.medusaRegion}.json`),
      JSON.stringify(regionConfig, null, 2)
    );
    
    console.log(chalk.green(`Created region configuration for ${options.medusaRegion}`));
  } catch (error) {
    console.error(chalk.red('Error creating region configuration:'), error);
  }
}

// Helper functions for region configuration
function getRegionName(site) {
  const names = {
    'nl': 'Netherlands',
    'be': 'Belgium',
    'de': 'Germany'
  };
  
  return names[site] || 'European Union';
}

function getRegionCountries(site) {
  const countries = {
    'nl': ['nl'],
    'be': ['be'],
    'de': ['de']
  };
  
  return countries[site] || ['nl', 'be', 'de'];
}

function getRegionTaxRate(site) {
  const taxRates = {
    'nl': 0.21, // 21% VAT
    'be': 0.21, // 21% VAT
    'de': 0.19  // 19% VAT
  };
  
  return taxRates[site] || 0.21;
}

function getRegionTaxCode(site) {
  const taxCodes = {
    'nl': 'nl_vat',
    'be': 'be_vat',
    'de': 'de_vat'
  };
  
  return taxCodes[site] || 'eu_vat';
}

function getRegionPaymentProviders(site) {
  // Default payment providers for all regions
  const providers = ['stripe', 'manual'];
  
  // Add region-specific providers
  switch (site) {
    case 'nl':
      providers.push('ideal');
      break;
    case 'be':
      providers.push('bancontact');
      break;
    case 'de':
      providers.push('sofort');
      break;
  }
  
  return providers;
}

function getRegionFulfillmentProviders(site) {
  // Default fulfillment providers for all regions
  return ['manual'];
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