#!/usr/bin/env node

/**
 * Strapi Import Script
 * 
 * This script imports content data from exported Statamic data into a Strapi instance.
 * It handles globals, collections, and navigation structures, with support for
 * multi-language content and media files.
 * 
 * Usage:
 * 1. Run the export-statamic.js script first
 * 2. Configure the Strapi API URL and token
 * 3. Run with: node import-strapi.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Configuration
const EXPORT_PATH = path.join(__dirname, 'exports');
const STRAPI_API_URL = process.env.STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || '';

// Create a configured axios instance
const strapiApi = axios.create({
  baseURL: STRAPI_API_URL,
  headers: {
    'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Helper function to log with timestamp
function log(message) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${timestamp}] ${message}`);
}

/**
 * Load export data from file
 */
function loadExportData(filename) {
  const filePath = path.join(EXPORT_PATH, filename);
  
  if (!fs.existsSync(filePath)) {
    log(`Export file not found: ${filename}`);
    return null;
  }
  
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading export file: ${filename}`, error);
    return null;
  }
}

/**
 * Upload media file to Strapi
 */
async function uploadMedia(filePath, caption = '', alternativeText = '') {
  try {
    const fullPath = path.join(EXPORT_PATH, 'assets', filePath);
    
    if (!fs.existsSync(fullPath)) {
      log(`Media file not found: ${fullPath}`);
      return null;
    }
    
    const formData = new FormData();
    formData.append('files', fs.createReadStream(fullPath));
    
    if (caption) {
      formData.append('fileInfo', JSON.stringify({
        caption: caption,
        alternativeText: alternativeText || caption
      }));
    }
    
    const response = await axios.post(`${STRAPI_API_URL}/api/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`
      }
    });
    
    if (response.data && response.data.length) {
      return response.data[0];
    }
    
    return null;
  } catch (error) {
    console.error(`Error uploading media: ${filePath}`, error.response?.data || error.message);
    return null;
  }
}

/**
 * Check if Strapi is accessible and collection types exist
 */
async function verifyStrapiSetup() {
  log('Verifying Strapi setup...');
  
  try {
    // Check if we can access the API
    const response = await strapiApi.get('/api/content-type-builder/content-types');
    
    // Check for expected content types
    const contentTypes = response.data.data;
    const requiredTypes = ['api::page.page', 'api::global.global', 'api::navigation.navigation'];
    
    const missingTypes = requiredTypes.filter(type => 
      !contentTypes.some(ct => ct.uid === type)
    );
    
    if (missingTypes.length) {
      log(`Missing required content types: ${missingTypes.join(', ')}`);
      log('Please create these content types in Strapi before running the import');
      return false;
    }
    
    log('Strapi setup verified successfully');
    return true;
  } catch (error) {
    console.error('Error verifying Strapi setup:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Import assets and create a mapping
 */
async function importAssets() {
  log('Importing assets...');
  
  const assets = loadExportData('assets.json');
  if (!assets || !assets.length) {
    log('No assets to import');
    return {};
  }
  
  const assetMapping = {};
  
  for (const asset of assets) {
    try {
      const uploadedMedia = await uploadMedia(
        asset.path,
        asset.metadata?.caption || '',
        asset.metadata?.alt || ''
      );
      
      if (uploadedMedia) {
        log(`Uploaded asset: ${asset.path}`);
        assetMapping[asset.id] = uploadedMedia.id;
      }
    } catch (error) {
      console.error(`Error importing asset: ${asset.path}`, error);
    }
  }
  
  // Save asset mapping for reference
  fs.writeFileSync(
    path.join(EXPORT_PATH, 'asset_mapping.json'),
    JSON.stringify(assetMapping, null, 2)
  );
  
  return assetMapping;
}

/**
 * Import global settings
 */
async function importGlobals(assetMapping) {
  log('Importing global settings...');
  
  const globals = loadExportData('globals.json');
  if (!globals) {
    log('No globals to import');
    return [];
  }
  
  const importedGlobals = [];
  
  // Fetch existing globals to avoid duplicates
  try {
    const response = await strapiApi.get('/api/globals');
    const existingGlobals = response.data.data;
    
    // Process each global set
    for (const [setName, setData] of Object.entries(globals)) {
      // Convert name to a handle
      const handle = setName.toLowerCase().replace(/\s+/g, '_');
      
      // Check if global already exists
      const existingGlobal = existingGlobals.find(g => 
        g.attributes.handle === handle
      );
      
      if (existingGlobal) {
        log(`Global already exists: ${setName}`);
        importedGlobals.push(existingGlobal);
        continue;
      }
      
      // Process translations
      const localizations = {};
      
      // For each locale in the global set
      for (const [locale, localeData] of Object.entries(setData)) {
        // Process content for this locale
        const processedContent = {};
        
        // Extract fields 
        for (const [key, value] of Object.entries(localeData)) {
          // Skip meta fields
          if (key.startsWith('_')) continue;
          
          // Handle image/asset references
          if (value && typeof value === 'string' && assetMapping[value]) {
            processedContent[key] = assetMapping[value];
          } 
          // Handle regular fields
          else {
            processedContent[key] = value;
          }
        }
        
        localizations[locale] = processedContent;
      }
      
      // Create global for default locale first
      try {
        const defaultLocaleData = localizations['en'] || Object.values(localizations)[0];
        
        const globalData = {
          name: setName,
          handle: handle,
          ...defaultLocaleData
        };
        
        const newGlobal = await strapiApi.post('/api/globals', {
          data: globalData
        });
        
        log(`Created global: ${setName}`);
        
        // Add localizations
        for (const [locale, localeData] of Object.entries(localizations)) {
          // Skip default locale
          if (locale === 'en') continue;
          
          try {
            await strapiApi.post(`/api/globals/${newGlobal.data.data.id}/localizations`, {
              data: {
                locale: locale,
                ...localeData
              }
            });
            
            log(`Added ${locale} localization for global: ${setName}`);
          } catch (error) {
            console.error(`Error adding localization for global: ${setName}`, error.response?.data || error.message);
          }
        }
        
        importedGlobals.push(newGlobal.data.data);
      } catch (error) {
        console.error(`Error creating global: ${setName}`, error.response?.data || error.message);
      }
    }
    
    return importedGlobals;
  } catch (error) {
    console.error('Error fetching existing globals:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Import collections as pages
 */
async function importCollections(assetMapping) {
  log('Importing collections as pages...');
  
  const collections = loadExportData('collections.json');
  if (!collections) {
    log('No collections to import');
    return {};
  }
  
  const collectionMapping = {};
  
  // Process pages collection
  if (collections.pages) {
    log('Importing pages collection...');
    
    try {
      // Fetch existing pages to avoid duplicates
      const response = await strapiApi.get('/api/pages');
      const existingPages = response.data.data;
      
      // Process each page in the collection
      for (const page of collections.pages) {
        // Skip if no slug
        if (!page._slug) {
          log(`Skipping page with no slug: ${page.title}`);
          continue;
        }
        
        // Check if page already exists
        const existingPage = existingPages.find(p => 
          p.attributes.slug === page._slug
        );
        
        if (existingPage) {
          log(`Page already exists: ${page.title}`);
          collectionMapping[page._id] = existingPage.id;
          continue;
        }
        
        // Process content
        const processedContent = {};
        
        // Extract fields
        for (const [key, value] of Object.entries(page)) {
          // Skip meta fields
          if (key.startsWith('_')) continue;
          
          // Handle image/asset references
          if (value && typeof value === 'string' && assetMapping[value]) {
            processedContent[key] = {
              id: assetMapping[value]
            };
          } 
          // Handle content block fields
          else if (key === 'content' && Array.isArray(value)) {
            processedContent[key] = value.map(block => {
              // Process blocks based on type
              if (block.type === 'image' && block.image && assetMapping[block.image]) {
                return {
                  ...block,
                  image: {
                    id: assetMapping[block.image]
                  }
                };
              }
              return block;
            });
          }
          // Handle regular fields
          else {
            processedContent[key] = value;
          }
        }
        
        // Create page
        try {
          const pageData = {
            title: page.title,
            slug: page._slug,
            content: processedContent.content || [],
            seo: {
              title: page.seo_title || page.title,
              description: page.seo_description || '',
              keywords: page.seo_keywords || ''
            },
            publishedAt: new Date()
          };
          
          const newPage = await strapiApi.post('/api/pages', {
            data: pageData
          });
          
          log(`Created page: ${page.title}`);
          collectionMapping[page._id] = newPage.data.data.id;
          
          // TODO: Add localizations if available
        } catch (error) {
          console.error(`Error creating page: ${page.title}`, error.response?.data || error.message);
        }
      }
    } catch (error) {
      console.error('Error importing pages collection:', error.response?.data || error.message);
    }
  }
  
  // Process other collections
  // For each collection type, we would need to create corresponding content types in Strapi first
  
  // Save collection mapping for reference
  fs.writeFileSync(
    path.join(EXPORT_PATH, 'collection_mapping.json'),
    JSON.stringify(collectionMapping, null, 2)
  );
  
  return collectionMapping;
}

/**
 * Import navigation
 */
async function importNavigation() {
  log('Importing navigation...');
  
  const navigation = loadExportData('navigation.json');
  if (!navigation) {
    log('No navigation to import');
    return [];
  }
  
  const importedNavs = [];
  
  // Fetch existing navigation to avoid duplicates
  try {
    const response = await strapiApi.get('/api/navigations');
    const existingNavs = response.data.data;
    
    // Process each navigation structure
    for (const [navName, navData] of Object.entries(navigation)) {
      // Convert name to a handle
      const handle = navName.toLowerCase().replace(/\s+/g, '_');
      
      // Check if navigation already exists
      const existingNav = existingNavs.find(n => 
        n.attributes.handle === handle
      );
      
      if (existingNav) {
        log(`Navigation already exists: ${navName}`);
        importedNavs.push(existingNav);
        continue;
      }
      
      // Process menu items
      const processedItems = [];
      if (navData.tree && Array.isArray(navData.tree)) {
        // Recursively process menu items
        function processMenuItem(item) {
          const processedItem = {
            title: item.title,
            url: item.url || '',
            target: item.target || '_self',
            order: item.order || 0
          };
          
          // Process children if any
          if (item.children && Array.isArray(item.children)) {
            processedItem.children = item.children.map(processMenuItem);
          }
          
          return processedItem;
        }
        
        processedItems.push(...navData.tree.map(processMenuItem));
      }
      
      // Create navigation
      try {
        const navData = {
          name: navName,
          handle: handle,
          items: processedItems
        };
        
        const newNav = await strapiApi.post('/api/navigations', {
          data: navData
        });
        
        log(`Created navigation: ${navName}`);
        importedNavs.push(newNav.data.data);
      } catch (error) {
        console.error(`Error creating navigation: ${navName}`, error.response?.data || error.message);
      }
    }
    
    return importedNavs;
  } catch (error) {
    console.error('Error fetching existing navigations:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Create import report
 */
function createImportReport(data) {
  log('Creating import report...');
  
  const report = {
    importDate: new Date().toISOString(),
    statistics: {
      assets: Object.keys(data.assetMapping).length,
      globals: data.globals.length,
      pages: Object.keys(data.collectionMapping).length,
      navigations: data.navigations.length
    }
  };
  
  fs.writeFileSync(
    path.join(EXPORT_PATH, 'strapi-import-report.json'), 
    JSON.stringify(report, null, 2)
  );
  
  // Create a human-readable report as well
  const reportMd = `# Strapi Import Report

**Import Date:** ${new Date().toLocaleString()}

## Statistics

### Imported Data
- **Assets:** ${report.statistics.assets}
- **Global Settings:** ${report.statistics.globals}
- **Pages:** ${report.statistics.pages}
- **Navigations:** ${report.statistics.navigations}

## Next Steps

1. Log in to the Strapi admin panel to verify the imported data
2. Run the Medusa import script if not already done
3. Configure your storefront to connect to Strapi and Medusa

`;
  
  fs.writeFileSync(
    path.join(EXPORT_PATH, 'strapi-import-report.md'), 
    reportMd
  );
  
  log('Import report created');
  return report;
}

/**
 * Main import function
 */
async function runImport() {
  log('Starting Strapi import...');
  
  if (!fs.existsSync(EXPORT_PATH)) {
    console.error(`Export path not found: ${EXPORT_PATH}`);
    console.error('Please run the export-statamic.js script first');
    process.exit(1);
  }
  
  if (!STRAPI_API_TOKEN) {
    console.error('STRAPI_API_TOKEN environment variable not set');
    console.error('Please set it before running this script');
    process.exit(1);
  }
  
  try {
    // Verify Strapi setup
    const strapiReady = await verifyStrapiSetup();
    if (!strapiReady) {
      console.error('Strapi setup not ready. Aborting import.');
      process.exit(1);
    }
    
    // Run imports in sequence
    const assetMapping = await importAssets();
    const globals = await importGlobals(assetMapping);
    const collectionMapping = await importCollections(assetMapping);
    const navigations = await importNavigation();
    
    // Create report
    createImportReport({
      assetMapping,
      globals,
      collectionMapping,
      navigations
    });
    
    log('Import complete!');
  } catch (error) {
    console.error('Error during import:', error);
  }
}

// Run the import
runImport(); 