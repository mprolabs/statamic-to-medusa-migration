#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');
const axios = require('axios');

program
  .description('Extract data from Statamic/Simple Commerce for migration to Medusa.js and Strapi')
  .option('--statamic-url <url>', 'URL of the Statamic site', 'http://localhost')
  .option('--statamic-api-key <key>', 'Statamic API key (if using API)', '')
  .option('--output <path>', 'Output directory for extracted data', './extracted-data')
  .option('--sites <sites>', 'Comma-separated list of site handles to extract', 'nl,be,de')
  .option('--method <method>', 'Extraction method: "api" or "files"', 'files')
  .option('--statamic-path <path>', 'Path to Statamic installation (if using files method)', './statamic')
  .parse(process.argv);

const options = program.opts();
const outputDir = path.join(process.cwd(), options.output);
const sites = options.sites.split(',').map(site => site.trim());

// Create necessary directories
console.log(chalk.blue('Creating output directories...'));
[outputDir, ...sites.map(site => path.join(outputDir, site))].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(chalk.green(`Created directory: ${dir}`));
  }
});

// Additional subdirectories for each site
sites.forEach(site => {
  const siteDir = path.join(outputDir, site);
  [
    'products',
    'collections',
    'customers',
    'orders',
    'taxonomies',
    'assets',
    'navigation',
    'content'
  ].forEach(subdir => {
    const dir = path.join(siteDir, subdir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
});

// Main extraction function
async function extractData() {
  try {
    console.log(chalk.blue('Starting data extraction...'));
    
    // Record start time
    const startTime = new Date();
    
    for (const site of sites) {
      console.log(chalk.blue(`Extracting data for site: ${site}`));
      
      // Extract products from Simple Commerce
      await extractProducts(site);
      
      // Extract collections from Statamic
      await extractCollections(site);
      
      // Extract customers from Simple Commerce
      await extractCustomers(site);
      
      // Extract orders from Simple Commerce
      await extractOrders(site);
      
      // Extract taxonomies from Statamic
      await extractTaxonomies(site);
      
      // Extract navigation from Statamic
      await extractNavigation(site);
      
      // Extract assets from Statamic
      await extractAssets(site);
      
      // Extract global sets from Statamic
      await extractGlobalSets(site);
    }
    
    // Record end time and write summary
    const endTime = new Date();
    const summary = {
      extraction: {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: `${(endTime - startTime) / 1000} seconds`,
        sites: sites,
        method: options.method
      }
    };
    
    fs.writeFileSync(
      path.join(outputDir, 'extraction-summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    console.log(chalk.green('Extraction completed successfully!'));
    console.log(chalk.yellow(`Duration: ${(endTime - startTime) / 1000} seconds`));
  } catch (error) {
    console.error(chalk.red('Error during extraction:'), error);
    process.exit(1);
  }
}

// Extract products from Simple Commerce
async function extractProducts(site) {
  try {
    console.log(chalk.blue(`Extracting products for site ${site}...`));
    
    let products = [];
    
    if (options.method === 'api') {
      // API-based extraction
      const response = await axios.get(
        `${options.statamicUrl}/api/simple-commerce/products`,
        {
          headers: {
            'Authorization': `Bearer ${options.statamicApiKey}`,
            'Accept': 'application/json'
          },
          params: { site }
        }
      );
      
      products = response.data.data || [];
    } else {
      // File-based extraction
      const productsDir = path.join(options.statamicPath, 'content/collections/products');
      
      if (!fs.existsSync(productsDir)) {
        console.log(chalk.yellow(`Products directory not found at ${productsDir}`));
        return;
      }
      
      // Get all product files
      const files = fs.readdirSync(productsDir)
        .filter(file => file.endsWith('.yaml') || file.endsWith('.md'));
      
      // Load and process each product file
      products = await Promise.all(files.map(async file => {
        const filePath = path.join(productsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Here you would parse YAML or Markdown with Frontmatter
        // For simplicity, we're returning a placeholder
        // In a real implementation, use libraries like js-yaml or gray-matter
        
        return {
          id: path.basename(file, path.extname(file)),
          title: `Product from ${file}`,
          slug: path.basename(file, path.extname(file)).toLowerCase(),
          // This is a simplified example. In reality, you'd parse the YAML content
          content: content,
          filePath: filePath
        };
      }));
      
      // Filter products by site if needed
      // This depends on how your Statamic content is structured
      if (site !== 'default') {
        products = products.filter(product => {
          // Example condition - adapt to your structure
          return product.site === site || !product.site;
        });
      }
    }
    
    // Save extracted products to JSON
    fs.writeFileSync(
      path.join(outputDir, site, 'products', 'products.json'),
      JSON.stringify(products, null, 2)
    );
    
    console.log(chalk.green(`Extracted ${products.length} products for site ${site}`));
  } catch (error) {
    console.error(chalk.red(`Error extracting products for site ${site}:`), error);
  }
}

// Extract collections from Statamic
async function extractCollections(site) {
  try {
    console.log(chalk.blue(`Extracting collections for site ${site}...`));
    
    let collections = [];
    
    if (options.method === 'api') {
      // API-based extraction
      const response = await axios.get(
        `${options.statamicUrl}/api/collections`,
        {
          headers: {
            'Authorization': `Bearer ${options.statamicApiKey}`,
            'Accept': 'application/json'
          },
          params: { site }
        }
      );
      
      collections = response.data.data || [];
    } else {
      // File-based extraction
      const collectionsDir = path.join(options.statamicPath, 'content/collections');
      
      if (!fs.existsSync(collectionsDir)) {
        console.log(chalk.yellow(`Collections directory not found at ${collectionsDir}`));
        return;
      }
      
      // Get all collection directories (excluding products which we handled separately)
      const dirs = fs.readdirSync(collectionsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name !== 'products')
        .map(dirent => dirent.name);
      
      // Process each collection
      collections = dirs.map(dir => {
        const collectionConfigPath = path.join(options.statamicPath, 'content/collections', dir, `${dir}.yaml`);
        
        // Create a basic collection object
        // In a real implementation, parse the YAML config
        return {
          id: dir,
          handle: dir,
          title: dir.charAt(0).toUpperCase() + dir.slice(1),
          entries: getCollectionEntries(dir),
          configPath: collectionConfigPath
        };
      });
    }
    
    // Save extracted collections to JSON
    fs.writeFileSync(
      path.join(outputDir, site, 'collections', 'collections.json'),
      JSON.stringify(collections, null, 2)
    );
    
    console.log(chalk.green(`Extracted ${collections.length} collections for site ${site}`));
  } catch (error) {
    console.error(chalk.red(`Error extracting collections for site ${site}:`), error);
  }
}

// Helper function to get collection entries
function getCollectionEntries(collectionHandle) {
  const entriesDir = path.join(options.statamicPath, 'content/collections', collectionHandle);
  
  if (!fs.existsSync(entriesDir)) {
    return [];
  }
  
  // Get all entry files
  const files = fs.readdirSync(entriesDir)
    .filter(file => file.endsWith('.yaml') || file.endsWith('.md'))
    .filter(file => file !== `${collectionHandle}.yaml`); // Exclude collection config
  
  // Return simple entry identifiers
  return files.map(file => path.basename(file, path.extname(file)));
}

// Function stubs for other extractions
// These would be implemented similar to products and collections
async function extractCustomers(site) {
  console.log(chalk.blue(`Extracting customers for site ${site} (stub)...`));
  // TODO: Implement customer extraction
  
  // Save placeholder for now
  fs.writeFileSync(
    path.join(outputDir, site, 'customers', 'customers.json'),
    JSON.stringify([], null, 2)
  );
}

async function extractOrders(site) {
  console.log(chalk.blue(`Extracting orders for site ${site} (stub)...`));
  // TODO: Implement order extraction
  
  // Save placeholder for now
  fs.writeFileSync(
    path.join(outputDir, site, 'orders', 'orders.json'),
    JSON.stringify([], null, 2)
  );
}

async function extractTaxonomies(site) {
  console.log(chalk.blue(`Extracting taxonomies for site ${site} (stub)...`));
  // TODO: Implement taxonomy extraction
  
  // Save placeholder for now
  fs.writeFileSync(
    path.join(outputDir, site, 'taxonomies', 'taxonomies.json'),
    JSON.stringify([], null, 2)
  );
}

async function extractNavigation(site) {
  console.log(chalk.blue(`Extracting navigation for site ${site} (stub)...`));
  // TODO: Implement navigation extraction
  
  // Save placeholder for now
  fs.writeFileSync(
    path.join(outputDir, site, 'navigation', 'navigation.json'),
    JSON.stringify([], null, 2)
  );
}

async function extractAssets(site) {
  console.log(chalk.blue(`Extracting assets for site ${site} (stub)...`));
  // TODO: Implement asset extraction
  
  // Save placeholder for now
  fs.writeFileSync(
    path.join(outputDir, site, 'assets', 'assets.json'),
    JSON.stringify([], null, 2)
  );
}

async function extractGlobalSets(site) {
  console.log(chalk.blue(`Extracting global sets for site ${site} (stub)...`));
  // TODO: Implement global sets extraction
  
  // Save placeholder for now
  fs.writeFileSync(
    path.join(outputDir, site, 'content', 'globals.json'),
    JSON.stringify([], null, 2)
  );
}

// Execute the extraction
extractData().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
}); 