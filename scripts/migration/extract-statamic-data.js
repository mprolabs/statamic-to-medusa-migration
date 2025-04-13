#!/usr/bin/env node

/**
 * Statamic/Simple Commerce Data Extraction Script
 * 
 * This script extracts data from a Statamic site with Simple Commerce
 * to prepare for migration to Medusa.js and Strapi.
 * 
 * Usage:
 *   node extract-statamic-data.js --site=nl --output=./data
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yaml = require('js-yaml');
const { program } = require('commander');

// Configure CLI options
program
  .option('--site <site>', 'Site to extract (e.g., nl, de)', 'nl')
  .option('--output <output>', 'Output directory', './extracted-data')
  .option('--statamic-url <url>', 'Statamic API URL', 'http://localhost:3000')
  .option('--token <token>', 'Statamic API token')
  .parse(process.argv);

const options = program.opts();

// Ensure output directory exists
if (!fs.existsSync(options.output)) {
  fs.mkdirSync(options.output, { recursive: true });
}

// Create site-specific output directory
const siteOutputDir = path.join(options.output, options.site);
if (!fs.existsSync(siteOutputDir)) {
  fs.mkdirSync(siteOutputDir, { recursive: true });
}

// Configure API client
const api = axios.create({
  baseURL: options.statamicUrl,
  headers: options.token ? {
    'Authorization': `Bearer ${options.token}`
  } : {}
});

/**
 * Extract all collections from Statamic
 */
async function extractCollections() {
  try {
    console.log(`Extracting collections for site ${options.site}...`);
    
    // Get list of collections
    const collectionsResponse = await api.get('/api/collections');
    const collections = collectionsResponse.data.data;
    
    // Create collections directory
    const collectionsDir = path.join(siteOutputDir, 'collections');
    if (!fs.existsSync(collectionsDir)) {
      fs.mkdirSync(collectionsDir, { recursive: true });
    }
    
    // Save collections metadata
    fs.writeFileSync(
      path.join(collectionsDir, 'collections.json'),
      JSON.stringify(collections, null, 2)
    );
    
    // Extract entries for each collection
    for (const collection of collections) {
      const handle = collection.handle;
      console.log(`Extracting entries for collection: ${handle}`);
      
      // Create collection directory
      const collectionDir = path.join(collectionsDir, handle);
      if (!fs.existsSync(collectionDir)) {
        fs.mkdirSync(collectionDir, { recursive: true });
      }
      
      try {
        // Get collection entries
        const entriesResponse = await api.get(`/api/collections/${handle}/entries`, {
          params: {
            site: options.site
          }
        });
        
        const entries = entriesResponse.data.data;
        
        // Save entries data
        fs.writeFileSync(
          path.join(collectionDir, 'entries.json'),
          JSON.stringify(entries, null, 2)
        );
        
        // Extract each entry with full data
        for (const entry of entries) {
          try {
            const entryResponse = await api.get(`/api/collections/${handle}/entries/${entry.id}`, {
              params: {
                site: options.site
              }
            });
            
            const entryData = entryResponse.data.data;
            
            // Save individual entry
            fs.writeFileSync(
              path.join(collectionDir, `${entry.id}.json`),
              JSON.stringify(entryData, null, 2)
            );
          } catch (error) {
            console.error(`Error extracting entry ${entry.id} from collection ${handle}:`, error.message);
          }
        }
      } catch (error) {
        console.error(`Error extracting entries for collection ${handle}:`, error.message);
      }
    }
    
    console.log('Collections extraction complete');
  } catch (error) {
    console.error('Error extracting collections:', error.message);
  }
}

/**
 * Extract all products from Simple Commerce
 */
async function extractProducts() {
  try {
    console.log(`Extracting products for site ${options.site}...`);
    
    // Create products directory
    const productsDir = path.join(siteOutputDir, 'products');
    if (!fs.existsSync(productsDir)) {
      fs.mkdirSync(productsDir, { recursive: true });
    }
    
    // Get products (assuming Simple Commerce uses a collection called 'products')
    const productsResponse = await api.get('/api/collections/products/entries', {
      params: {
        site: options.site
      }
    });
    
    const products = productsResponse.data.data;
    
    // Save products list
    fs.writeFileSync(
      path.join(productsDir, 'products.json'),
      JSON.stringify(products, null, 2)
    );
    
    // Extract each product with full data
    for (const product of products) {
      try {
        const productResponse = await api.get(`/api/collections/products/entries/${product.id}`, {
          params: {
            site: options.site
          }
        });
        
        const productData = productResponse.data.data;
        
        // Save individual product
        fs.writeFileSync(
          path.join(productsDir, `${product.id}.json`),
          JSON.stringify(productData, null, 2)
        );
      } catch (error) {
        console.error(`Error extracting product ${product.id}:`, error.message);
      }
    }
    
    console.log('Products extraction complete');
  } catch (error) {
    console.error('Error extracting products:', error.message);
  }
}

/**
 * Extract all customers from Simple Commerce
 */
async function extractCustomers() {
  try {
    console.log('Extracting customers...');
    
    // Create customers directory
    const customersDir = path.join(siteOutputDir, 'customers');
    if (!fs.existsSync(customersDir)) {
      fs.mkdirSync(customersDir, { recursive: true });
    }
    
    // Get customers using Simple Commerce API endpoint
    const customersResponse = await api.get('/api/simple-commerce/customers');
    const customers = customersResponse.data.data;
    
    // Save customers data
    fs.writeFileSync(
      path.join(customersDir, 'customers.json'),
      JSON.stringify(customers, null, 2)
    );
    
    console.log('Customers extraction complete');
  } catch (error) {
    console.error('Error extracting customers:', error.message);
  }
}

/**
 * Extract all orders from Simple Commerce
 */
async function extractOrders() {
  try {
    console.log('Extracting orders...');
    
    // Create orders directory
    const ordersDir = path.join(siteOutputDir, 'orders');
    if (!fs.existsSync(ordersDir)) {
      fs.mkdirSync(ordersDir, { recursive: true });
    }
    
    // Get orders using Simple Commerce API endpoint
    const ordersResponse = await api.get('/api/simple-commerce/orders');
    const orders = ordersResponse.data.data;
    
    // Save orders list
    fs.writeFileSync(
      path.join(ordersDir, 'orders.json'),
      JSON.stringify(orders, null, 2)
    );
    
    // Extract each order with full data
    for (const order of orders) {
      try {
        const orderResponse = await api.get(`/api/simple-commerce/orders/${order.id}`);
        const orderData = orderResponse.data.data;
        
        // Save individual order
        fs.writeFileSync(
          path.join(ordersDir, `${order.id}.json`),
          JSON.stringify(orderData, null, 2)
        );
      } catch (error) {
        console.error(`Error extracting order ${order.id}:`, error.message);
      }
    }
    
    console.log('Orders extraction complete');
  } catch (error) {
    console.error('Error extracting orders:', error.message);
  }
}

/**
 * Extract all taxonomies and terms
 */
async function extractTaxonomies() {
  try {
    console.log(`Extracting taxonomies for site ${options.site}...`);
    
    // Get list of taxonomies
    const taxonomiesResponse = await api.get('/api/taxonomies');
    const taxonomies = taxonomiesResponse.data.data;
    
    // Create taxonomies directory
    const taxonomiesDir = path.join(siteOutputDir, 'taxonomies');
    if (!fs.existsSync(taxonomiesDir)) {
      fs.mkdirSync(taxonomiesDir, { recursive: true });
    }
    
    // Save taxonomies metadata
    fs.writeFileSync(
      path.join(taxonomiesDir, 'taxonomies.json'),
      JSON.stringify(taxonomies, null, 2)
    );
    
    // Extract terms for each taxonomy
    for (const taxonomy of taxonomies) {
      const handle = taxonomy.handle;
      console.log(`Extracting terms for taxonomy: ${handle}`);
      
      // Create taxonomy directory
      const taxonomyDir = path.join(taxonomiesDir, handle);
      if (!fs.existsSync(taxonomyDir)) {
        fs.mkdirSync(taxonomyDir, { recursive: true });
      }
      
      try {
        // Get taxonomy terms
        const termsResponse = await api.get(`/api/taxonomies/${handle}/terms`, {
          params: {
            site: options.site
          }
        });
        
        const terms = termsResponse.data.data;
        
        // Save terms data
        fs.writeFileSync(
          path.join(taxonomyDir, 'terms.json'),
          JSON.stringify(terms, null, 2)
        );
        
        // Extract each term with full data
        for (const term of terms) {
          try {
            const termResponse = await api.get(`/api/taxonomies/${handle}/terms/${term.id}`, {
              params: {
                site: options.site
              }
            });
            
            const termData = termResponse.data.data;
            
            // Save individual term
            fs.writeFileSync(
              path.join(taxonomyDir, `${term.id}.json`),
              JSON.stringify(termData, null, 2)
            );
          } catch (error) {
            console.error(`Error extracting term ${term.id} from taxonomy ${handle}:`, error.message);
          }
        }
      } catch (error) {
        console.error(`Error extracting terms for taxonomy ${handle}:`, error.message);
      }
    }
    
    console.log('Taxonomies extraction complete');
  } catch (error) {
    console.error('Error extracting taxonomies:', error.message);
  }
}

/**
 * Extract all navigation menus
 */
async function extractNavigation() {
  try {
    console.log(`Extracting navigation for site ${options.site}...`);
    
    // Create navigation directory
    const navigationDir = path.join(siteOutputDir, 'navigation');
    if (!fs.existsSync(navigationDir)) {
      fs.mkdirSync(navigationDir, { recursive: true });
    }
    
    // Get navigation structures - typically stored in YAML files
    // Read navigation directly from filesystem if available
    const statamicPath = process.env.STATAMIC_PATH || '/path/to/statamic';
    const navPath = path.join(statamicPath, 'content', 'navigation');
    
    if (fs.existsSync(navPath)) {
      const navFiles = fs.readdirSync(navPath).filter(file => file.endsWith('.yaml'));
      
      for (const file of navFiles) {
        try {
          const navData = yaml.load(fs.readFileSync(path.join(navPath, file), 'utf8'));
          
          // Save navigation data
          fs.writeFileSync(
            path.join(navigationDir, file.replace('.yaml', '.json')),
            JSON.stringify(navData, null, 2)
          );
        } catch (error) {
          console.error(`Error processing navigation file ${file}:`, error.message);
        }
      }
    } else {
      console.warn(`Navigation directory not found at ${navPath}`);
      
      // Alternative: try to get navigation via API if available
      try {
        const navResponse = await api.get('/api/navigation', {
          params: {
            site: options.site
          }
        });
        
        const navigation = navResponse.data.data;
        
        // Save navigation data
        fs.writeFileSync(
          path.join(navigationDir, 'navigation.json'),
          JSON.stringify(navigation, null, 2)
        );
      } catch (error) {
        console.error('Error fetching navigation via API:', error.message);
      }
    }
    
    console.log('Navigation extraction complete');
  } catch (error) {
    console.error('Error extracting navigation:', error.message);
  }
}

/**
 * Extract site configuration
 */
async function extractSiteConfig() {
  try {
    console.log('Extracting site configuration...');
    
    // Create config directory
    const configDir = path.join(options.output, 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // Option 1: Extract via API if available
    try {
      const configResponse = await api.get('/api/config');
      const config = configResponse.data;
      
      // Save config data
      fs.writeFileSync(
        path.join(configDir, 'config.json'),
        JSON.stringify(config, null, 2)
      );
    } catch (error) {
      console.error('Error fetching config via API:', error.message);
      
      // Option 2: Read directly from filesystem if available
      const statamicPath = process.env.STATAMIC_PATH || '/path/to/statamic';
      const sitesConfigPath = path.join(statamicPath, 'config', 'statamic', 'sites.php');
      
      if (fs.existsSync(sitesConfigPath)) {
        const sitesConfig = fs.readFileSync(sitesConfigPath, 'utf8');
        
        // Save sites config for reference (even though it's PHP)
        fs.writeFileSync(
          path.join(configDir, 'sites.php.txt'),
          sitesConfig
        );
        
        console.log('Saved sites configuration from filesystem');
      } else {
        console.warn(`Sites configuration not found at ${sitesConfigPath}`);
      }
    }
    
    console.log('Site configuration extraction complete');
  } catch (error) {
    console.error('Error extracting site configuration:', error.message);
  }
}

/**
 * Extract assets and media
 */
async function extractAssets() {
  try {
    console.log('Extracting assets metadata...');
    
    // Create assets directory
    const assetsDir = path.join(siteOutputDir, 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    
    // Get assets containers
    const containersResponse = await api.get('/api/assets');
    const containers = containersResponse.data.data;
    
    // Save containers metadata
    fs.writeFileSync(
      path.join(assetsDir, 'containers.json'),
      JSON.stringify(containers, null, 2)
    );
    
    // Extract assets from each container
    for (const container of containers) {
      const handle = container.handle;
      console.log(`Extracting assets from container: ${handle}`);
      
      // Create container directory
      const containerDir = path.join(assetsDir, handle);
      if (!fs.existsSync(containerDir)) {
        fs.mkdirSync(containerDir, { recursive: true });
      }
      
      try {
        // Get container assets
        const assetsResponse = await api.get(`/api/assets/${handle}`);
        const assets = assetsResponse.data.data;
        
        // Save assets metadata
        fs.writeFileSync(
          path.join(containerDir, 'assets.json'),
          JSON.stringify(assets, null, 2)
        );
        
        // We don't download the actual asset files here, just their metadata
        // Actual file download would need to be handled separately
        
      } catch (error) {
        console.error(`Error extracting assets from container ${handle}:`, error.message);
      }
    }
    
    console.log('Assets extraction complete');
  } catch (error) {
    console.error('Error extracting assets:', error.message);
  }
}

/**
 * Run the extraction process
 */
async function main() {
  console.log(`
====================================================
  Statamic/Simple Commerce Data Extraction Tool
====================================================
Target site: ${options.site}
Output directory: ${options.output}
Statamic URL: ${options.statamicUrl}
  `);
  
  try {
    // Create extraction summary file
    const summary = {
      extractionDate: new Date().toISOString(),
      site: options.site,
      statamicUrl: options.statamicUrl
    };
    
    // Run extraction functions
    await extractSiteConfig();
    await extractCollections();
    await extractProducts();
    await extractCustomers();
    await extractOrders();
    await extractTaxonomies();
    await extractNavigation();
    await extractAssets();
    
    // Update and save summary
    summary.completedAt = new Date().toISOString();
    summary.status = 'complete';
    
    fs.writeFileSync(
      path.join(options.output, 'extraction-summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    console.log(`
====================================================
  Extraction Complete!
====================================================
Data extracted to: ${options.output}
Site: ${options.site}
Completed at: ${summary.completedAt}
    `);
  } catch (error) {
    console.error('Error during extraction process:', error);
    
    // Save error summary
    const errorSummary = {
      extractionDate: new Date().toISOString(),
      site: options.site,
      statamicUrl: options.statamicUrl,
      status: 'error',
      error: error.message
    };
    
    fs.writeFileSync(
      path.join(options.output, 'extraction-error.json'),
      JSON.stringify(errorSummary, null, 2)
    );
    
    process.exit(1);
  }
}

// Start the extraction process
main(); 