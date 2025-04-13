#!/usr/bin/env node

/**
 * Statamic Content Export Script
 * 
 * This script exports content from a Statamic site with Simple Commerce,
 * including collections, taxonomies, globals, navigation, and assets.
 * The exported data is structured for migration to Medusa.js and Strapi.
 * 
 * Usage:
 * 1. Set the STATAMIC_PATH environment variable to your Statamic site root
 * 2. Run with: node export-statamic.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const YAML = require('yaml');
const { execSync } = require('child_process');

// Configuration
const STATAMIC_PATH = process.env.STATAMIC_PATH || '../statamic-site';
const OUTPUT_DIR = path.join(__dirname, 'exports');
const ASSETS_OUTPUT_DIR = path.join(OUTPUT_DIR, 'assets');

// Ensure output directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

if (!fs.existsSync(ASSETS_OUTPUT_DIR)) {
  fs.mkdirSync(ASSETS_OUTPUT_DIR, { recursive: true });
}

// Helper function to log with timestamp
function log(message) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${timestamp}] ${message}`);
}

/**
 * Read a YAML file and parse its contents
 */
function readYamlFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return YAML.parse(fileContent);
  } catch (error) {
    console.error(`Error reading YAML file: ${filePath}`, error);
    return null;
  }
}

/**
 * Read a JSON file and parse its contents
 */
function readJsonFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading JSON file: ${filePath}`, error);
    return null;
  }
}

/**
 * Export collections data (including Products from Simple Commerce)
 */
function exportCollections() {
  log('Exporting collections...');
  
  const collectionsPath = path.join(STATAMIC_PATH, 'content/collections');
  const collectionsOutput = {};
  
  // Check if collections directory exists
  if (!fs.existsSync(collectionsPath)) {
    log('Collections directory not found');
    return collectionsOutput;
  }
  
  // Get all collection directories
  const collections = fs.readdirSync(collectionsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  // Process each collection
  for (const collection of collections) {
    log(`Processing collection: ${collection}`);
    
    const collectionEntries = [];
    const entriesPath = path.join(collectionsPath, collection);
    
    // Get blueprint for this collection to understand the fields
    const blueprintPath = path.join(STATAMIC_PATH, `resources/blueprints/collections/${collection}.yaml`);
    let blueprint = null;
    
    if (fs.existsSync(blueprintPath)) {
      blueprint = readYamlFile(blueprintPath);
    }
    
    // Process all entries in the collection (including subdirectories for localization)
    const entryPaths = glob.sync(`${entriesPath}/**/*.{md,yaml}`);
    
    for (const entryPath of entryPaths) {
      try {
        // Extract locale from path if multi-language
        let locale = 'en'; // Default locale
        const localeMatch = entryPath.match(/\.([a-z]{2})\.(?:md|yaml)$/);
        if (localeMatch) {
          locale = localeMatch[1];
        }
        
        // Extract entry data
        const entryContent = fs.readFileSync(entryPath, 'utf8');
        const frontMatterMatch = entryContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        
        let entryData = {};
        
        if (frontMatterMatch) {
          // Parse front matter
          const frontMatter = frontMatterMatch[1];
          const content = frontMatterMatch[2].trim();
          
          entryData = YAML.parse(frontMatter);
          entryData._content = content;
        } else {
          // Try parsing as full YAML
          entryData = YAML.parse(entryContent);
        }
        
        // Add entry path metadata
        const relativePath = path.relative(entriesPath, entryPath);
        const segments = relativePath.split(path.sep);
        
        // Generate a slug from the filename
        const fileNameWithoutExt = path.basename(entryPath).replace(/\.[a-z]{2}\.(?:md|yaml)$|\.(?:md|yaml)$/, '');
        
        entryData._id = fileNameWithoutExt;
        entryData._slug = fileNameWithoutExt;
        entryData._locale = locale;
        
        // If entry is in a tree structure, build the full path
        if (segments.length > 1) {
          entryData._path = segments.slice(0, -1).join('/');
        }
        
        // Special handling for product entries in Simple Commerce
        if (collection === 'products' && entryData.product_type === 'product') {
          // Extract product variant data
          if (entryData.variants && Array.isArray(entryData.variants)) {
            entryData.variants = entryData.variants.map(variant => {
              // Resolve variant pricing
              const variantData = variant.variant || {};
              return {
                ...variantData,
                price: variant.price || variantData.price,
                sku: variant.sku || variantData.sku,
                stock: variant.stock || variantData.stock || 0
              };
            });
          }
        }
        
        // Add entry to collection
        collectionEntries.push(entryData);
      } catch (error) {
        console.error(`Error processing entry: ${entryPath}`, error);
      }
    }
    
    collectionsOutput[collection] = collectionEntries;
  }
  
  // Write collections to output file
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'collections.json'),
    JSON.stringify(collectionsOutput, null, 2)
  );
  
  log(`Exported ${Object.keys(collectionsOutput).length} collections`);
  return collectionsOutput;
}

/**
 * Export taxonomies data
 */
function exportTaxonomies() {
  log('Exporting taxonomies...');
  
  const taxonomiesPath = path.join(STATAMIC_PATH, 'content/taxonomies');
  const taxonomiesOutput = {};
  
  // Check if taxonomies directory exists
  if (!fs.existsSync(taxonomiesPath)) {
    log('Taxonomies directory not found');
    return taxonomiesOutput;
  }
  
  // Get all taxonomy directories
  const taxonomies = fs.readdirSync(taxonomiesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  // Process each taxonomy
  for (const taxonomy of taxonomies) {
    log(`Processing taxonomy: ${taxonomy}`);
    
    const taxonomyEntries = [];
    const entriesPath = path.join(taxonomiesPath, taxonomy);
    
    // Process all entries in the taxonomy
    const entryPaths = glob.sync(`${entriesPath}/**/*.{yaml}`);
    
    for (const entryPath of entryPaths) {
      try {
        // Extract locale from path if multi-language
        let locale = 'en'; // Default locale
        const localeMatch = entryPath.match(/\.([a-z]{2})\.yaml$/);
        if (localeMatch) {
          locale = localeMatch[1];
        }
        
        // Read entry
        const entryData = readYamlFile(entryPath);
        
        if (entryData) {
          // Add metadata
          const fileNameWithoutExt = path.basename(entryPath).replace(/\.[a-z]{2}\.yaml$|\.yaml$/, '');
          
          entryData._id = fileNameWithoutExt;
          entryData._slug = entryData.slug || fileNameWithoutExt;
          entryData._locale = locale;
          
          // Add entry to taxonomy
          taxonomyEntries.push(entryData);
        }
      } catch (error) {
        console.error(`Error processing taxonomy entry: ${entryPath}`, error);
      }
    }
    
    taxonomiesOutput[taxonomy] = taxonomyEntries;
  }
  
  // Write taxonomies to output file
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'taxonomies.json'),
    JSON.stringify(taxonomiesOutput, null, 2)
  );
  
  log(`Exported ${Object.keys(taxonomiesOutput).length} taxonomies`);
  return taxonomiesOutput;
}

/**
 * Export global settings
 */
function exportGlobals() {
  log('Exporting globals...');
  
  const globalsPath = path.join(STATAMIC_PATH, 'content/globals');
  const globalsOutput = {};
  
  // Check if globals directory exists
  if (!fs.existsSync(globalsPath)) {
    log('Globals directory not found');
    return globalsOutput;
  }
  
  // Get all global set directories
  const globalSets = fs.readdirSync(globalsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  // Process each global set
  for (const globalSet of globalSets) {
    log(`Processing global set: ${globalSet}`);
    
    const setPath = path.join(globalsPath, globalSet);
    const setEntries = {};
    
    // Process all entries in the set
    const entryPaths = glob.sync(`${setPath}/**/*.{yaml}`);
    
    for (const entryPath of entryPaths) {
      try {
        // Extract locale from path
        let locale = 'en'; // Default locale
        const localeMatch = entryPath.match(/\.([a-z]{2})\.yaml$/);
        if (localeMatch) {
          locale = localeMatch[1];
        }
        
        // Read entry
        const entryData = readYamlFile(entryPath);
        
        if (entryData) {
          // Add locale data
          setEntries[locale] = entryData;
        }
      } catch (error) {
        console.error(`Error processing global set entry: ${entryPath}`, error);
      }
    }
    
    globalsOutput[globalSet] = setEntries;
  }
  
  // Write globals to output file
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'globals.json'),
    JSON.stringify(globalsOutput, null, 2)
  );
  
  log(`Exported ${Object.keys(globalsOutput).length} global sets`);
  return globalsOutput;
}

/**
 * Export navigation structures
 */
function exportNavigation() {
  log('Exporting navigation...');
  
  const navPath = path.join(STATAMIC_PATH, 'content/navigation');
  const navOutput = {};
  
  // Check if navigation directory exists
  if (!fs.existsSync(navPath)) {
    log('Navigation directory not found');
    return navOutput;
  }
  
  // Process all navigation structures
  const navFiles = glob.sync(`${navPath}/*.yaml`);
  
  for (const navFile of navFiles) {
    try {
      const navName = path.basename(navFile, '.yaml');
      log(`Processing navigation: ${navName}`);
      
      // Read navigation file
      const navData = readYamlFile(navFile);
      
      if (navData) {
        navOutput[navName] = navData;
      }
    } catch (error) {
      console.error(`Error processing navigation: ${navFile}`, error);
    }
  }
  
  // Write navigation to output file
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'navigation.json'),
    JSON.stringify(navOutput, null, 2)
  );
  
  log(`Exported ${Object.keys(navOutput).length} navigation structures`);
  return navOutput;
}

/**
 * Export assets and gather metadata
 */
function exportAssets() {
  log('Exporting assets...');
  
  const assetsPath = path.join(STATAMIC_PATH, 'public/assets');
  const assetsMetadataPath = path.join(STATAMIC_PATH, 'content/assets');
  const assetOutput = [];
  
  // Check if assets directory exists
  if (!fs.existsSync(assetsPath)) {
    log('Assets directory not found');
    return assetOutput;
  }
  
  // Process all assets
  const assetFiles = glob.sync(`${assetsPath}/**/*.*`, { nodir: true });
  
  for (const assetFile of assetFiles) {
    try {
      const relativePath = path.relative(assetsPath, assetFile);
      log(`Processing asset: ${relativePath}`);
      
      // Create a destination path in our exports
      const destPath = path.join(ASSETS_OUTPUT_DIR, relativePath);
      const destDir = path.dirname(destPath);
      
      // Ensure destination directory exists
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      // Copy the file
      fs.copyFileSync(assetFile, destPath);
      
      // Look for metadata
      const assetContainer = relativePath.split(path.sep)[0];
      const assetPath = relativePath.substring(assetContainer.length + 1);
      const metadataPath = path.join(assetsMetadataPath, assetContainer, assetPath.replace(/\./g, '.') + '.yaml');
      
      let metadata = null;
      if (fs.existsSync(metadataPath)) {
        metadata = readYamlFile(metadataPath);
      }
      
      // Add to output
      assetOutput.push({
        id: relativePath.replace(/\//g, '-').replace(/\s+/g, '-'),
        path: relativePath,
        container: assetContainer,
        filename: path.basename(assetFile),
        mime_type: getMimeType(assetFile),
        size: fs.statSync(assetFile).size,
        metadata: metadata
      });
    } catch (error) {
      console.error(`Error processing asset: ${assetFile}`, error);
    }
  }
  
  // Write assets to output file
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'assets.json'),
    JSON.stringify(assetOutput, null, 2)
  );
  
  log(`Exported ${assetOutput.length} assets`);
  return assetOutput;
}

/**
 * Export Simple Commerce customers
 */
function exportCustomers() {
  log('Exporting customers...');
  
  const customersPath = path.join(STATAMIC_PATH, 'content/simple-commerce/customers');
  const customersOutput = [];
  
  // Check if customers directory exists
  if (!fs.existsSync(customersPath)) {
    log('Customers directory not found');
    return customersOutput;
  }
  
  // Process all customer files
  const customerFiles = glob.sync(`${customersPath}/**/*.yaml`);
  
  for (const customerFile of customerFiles) {
    try {
      const customerId = path.basename(customerFile, '.yaml');
      log(`Processing customer: ${customerId}`);
      
      // Read customer file
      const customerData = readYamlFile(customerFile);
      
      if (customerData) {
        // Add metadata
        customerData._id = customerId;
        
        // Add to output
        customersOutput.push(customerData);
      }
    } catch (error) {
      console.error(`Error processing customer: ${customerFile}`, error);
    }
  }
  
  // Write customers to output file
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'customers.json'),
    JSON.stringify(customersOutput, null, 2)
  );
  
  log(`Exported ${customersOutput.length} customers`);
  return customersOutput;
}

/**
 * Export Simple Commerce orders
 */
function exportOrders() {
  log('Exporting orders...');
  
  const ordersPath = path.join(STATAMIC_PATH, 'content/simple-commerce/orders');
  const ordersOutput = [];
  
  // Check if orders directory exists
  if (!fs.existsSync(ordersPath)) {
    log('Orders directory not found');
    return ordersOutput;
  }
  
  // Process all order files
  const orderFiles = glob.sync(`${ordersPath}/**/*.yaml`);
  
  for (const orderFile of orderFiles) {
    try {
      const orderId = path.basename(orderFile, '.yaml');
      log(`Processing order: ${orderId}`);
      
      // Read order file
      const orderData = readYamlFile(orderFile);
      
      if (orderData) {
        // Add metadata
        orderData._id = orderId;
        
        // Add to output
        ordersOutput.push(orderData);
      }
    } catch (error) {
      console.error(`Error processing order: ${orderFile}`, error);
    }
  }
  
  // Write orders to output file
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'orders.json'),
    JSON.stringify(ordersOutput, null, 2)
  );
  
  log(`Exported ${ordersOutput.length} orders`);
  return ordersOutput;
}

/**
 * Export region settings (currencies, countries, taxes)
 */
function exportRegionSettings() {
  log('Exporting region settings...');
  
  const regionOutput = {
    currencies: {},
    countries: {},
    taxes: {}
  };
  
  // Get currencies
  const currenciesPath = path.join(STATAMIC_PATH, 'content/simple-commerce/currencies');
  
  if (fs.existsSync(currenciesPath)) {
    const currencyFiles = glob.sync(`${currenciesPath}/**/*.yaml`);
    
    for (const currencyFile of currencyFiles) {
      try {
        const currencyCode = path.basename(currencyFile, '.yaml');
        const currencyData = readYamlFile(currencyFile);
        
        if (currencyData) {
          regionOutput.currencies[currencyCode] = currencyData;
        }
      } catch (error) {
        console.error(`Error processing currency: ${currencyFile}`, error);
      }
    }
  }
  
  // Get countries (from Simple Commerce config)
  const configPath = path.join(STATAMIC_PATH, 'config/simple-commerce.php');
  
  if (fs.existsSync(configPath)) {
    try {
      // Extract countries using PHP (simplified approach)
      const countryConfigCommand = `cd ${STATAMIC_PATH} && php -r "echo json_encode(config('simple-commerce.countries'));"`;
      const countriesJson = execSync(countryConfigCommand).toString();
      
      try {
        regionOutput.countries = JSON.parse(countriesJson);
      } catch (e) {
        console.error('Error parsing countries JSON', e);
      }
    } catch (error) {
      console.error('Error extracting countries from config', error);
    }
  }
  
  // Get tax settings
  const taxesPath = path.join(STATAMIC_PATH, 'content/simple-commerce/tax-rates');
  
  if (fs.existsSync(taxesPath)) {
    const taxFiles = glob.sync(`${taxesPath}/**/*.yaml`);
    
    for (const taxFile of taxFiles) {
      try {
        const taxId = path.basename(taxFile, '.yaml');
        const taxData = readYamlFile(taxFile);
        
        if (taxData) {
          regionOutput.taxes[taxId] = taxData;
        }
      } catch (error) {
        console.error(`Error processing tax rate: ${taxFile}`, error);
      }
    }
  }
  
  // Write region settings to output file
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'region-settings.json'),
    JSON.stringify(regionOutput, null, 2)
  );
  
  log('Exported region settings');
  return regionOutput;
}

/**
 * Create export report
 */
function createExportReport(data) {
  log('Creating export report...');
  
  const report = {
    exportDate: new Date().toISOString(),
    statistics: {
      collections: Object.keys(data.collections).length,
      collectionEntries: Object.values(data.collections).reduce((sum, entries) => sum + entries.length, 0),
      taxonomies: Object.keys(data.taxonomies).length,
      taxonomyTerms: Object.values(data.taxonomies).reduce((sum, entries) => sum + entries.length, 0),
      globals: Object.keys(data.globals).length,
      navigation: Object.keys(data.navigation).length,
      assets: data.assets.length,
      customers: data.customers.length,
      orders: data.orders.length
    }
  };
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'export-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  // Create a human-readable report as well
  const reportMd = `# Statamic Export Report

**Export Date:** ${new Date().toLocaleString()}

## Statistics

### Content
- **Collections:** ${report.statistics.collections}
- **Collection Entries:** ${report.statistics.collectionEntries}
- **Taxonomies:** ${report.statistics.taxonomies}
- **Taxonomy Terms:** ${report.statistics.taxonomyTerms}
- **Global Sets:** ${report.statistics.globals}
- **Navigation Structures:** ${report.statistics.navigation}
- **Assets:** ${report.statistics.assets}

### E-commerce
- **Customers:** ${report.statistics.customers}
- **Orders:** ${report.statistics.orders}

## Next Steps

1. Run the Medusa.js import script
2. Run the Strapi import script
3. Verify data in both systems

`;
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'export-report.md'),
    reportMd
  );
  
  log('Export report created');
  return report;
}

/**
 * Helper function to determine MIME type from file extension
 */
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.zip': 'application/zip'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Main export function
 */
function runExport() {
  log('Starting Statamic export...');
  
  if (!fs.existsSync(STATAMIC_PATH)) {
    console.error(`Statamic path not found: ${STATAMIC_PATH}`);
    console.error('Please set the STATAMIC_PATH environment variable to your Statamic site root');
    process.exit(1);
  }
  
  // Run exports
  const collections = exportCollections();
  const taxonomies = exportTaxonomies();
  const globals = exportGlobals();
  const navigation = exportNavigation();
  const assets = exportAssets();
  const customers = exportCustomers();
  const orders = exportOrders();
  const regionSettings = exportRegionSettings();
  
  // Create report
  createExportReport({
    collections,
    taxonomies,
    globals,
    navigation,
    assets,
    customers,
    orders,
    regionSettings
  });
  
  log('Export complete!');
}

// Run the export
runExport(); 