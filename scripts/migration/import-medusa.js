#!/usr/bin/env node

/**
 * Statamic to Medusa.js Import Script
 * 
 * This script imports data from Statamic CMS and Simple Commerce to Medusa.js.
 * It handles multi-region and multi-language support by mapping fields appropriately.
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const { 
  transformToMedusa, 
  transformToStrapi,
  processLocalizedField,
  processRegionalField,
  loadFieldMappings
} = require('./transformers/field-transformer');
// Import the data validator
const {
  validateData,
  generateReport
} = require('./validation/data-validator');

// Command line options
program
  .version('1.0.0')
  .description('Import data from Statamic to Medusa.js and Strapi')
  .option('-s, --source <path>', 'Path to Statamic exported data')
  .option('-e, --entity <type>', 'Entity type to import (products, categories, customers, all)')
  .option('-r, --regions <regions>', 'Comma-separated list of regions to import (nl,be,de or all)')
  .option('-l, --languages <languages>', 'Comma-separated list of languages to import (nl,de,fr,en or all)')
  .option('-d, --dry-run', 'Run without making actual API calls')
  .option('-v, --verbose', 'Show detailed logging')
  .option('--validate-only', 'Only validate data without importing')
  .option('--skip-validation', 'Skip data validation before import')
  .option('--validation-report <path>', 'Path to save validation report', './validation-report.md')
  .option('--medusa-url <url>', 'Medusa API URL', 'http://localhost:9000')
  .option('--strapi-url <url>', 'Strapi API URL', 'http://localhost:1337')
  .parse(process.argv);

const options = program.opts();

// Default options
const sourceDir = options.source || './data/export';
const entityType = options.entity || 'all';
const regions = options.regions ? options.regions.split(',') : ['nl', 'be', 'de'];
const languages = options.languages ? options.languages.split(',') : ['nl', 'de', 'fr', 'en'];
const dryRun = options.dryRun || false;
const verbose = options.verbose || false;
const validateOnly = options.validateOnly || false;
const skipValidation = options.skipValidation || false;
const validationReportPath = options.validationReport;
const medusaUrl = options.medusaUrl;
const strapiUrl = options.strapiUrl;

// Ensure source directory exists
if (!fs.existsSync(sourceDir)) {
  console.error(chalk.red(`Error: Source directory ${sourceDir} does not exist`));
  process.exit(1);
}

// Load field mappings
const mappings = loadFieldMappings();
if (!mappings) {
  console.error(chalk.red('Error: Failed to load field mappings'));
  process.exit(1);
}

// Medusa.js API client
const medusaClient = axios.create({
  baseURL: medusaUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Strapi API client
const strapiClient = axios.create({
  baseURL: strapiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Get all Statamic entities of a specific type
 * @param {string} type - Entity type (products, categories, etc.)
 * @returns {Array} Array of entities
 */
function getStatamicEntities(type) {
  const entityDir = path.join(sourceDir, type);
  
  if (!fs.existsSync(entityDir)) {
    console.warn(chalk.yellow(`Warning: Entity directory ${entityDir} does not exist`));
    return [];
  }
  
  const files = fs.readdirSync(entityDir)
    .filter(file => file.endsWith('.json'));
  
  const entities = [];
  
  for (const file of files) {
    const filePath = path.join(entityDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const entity = JSON.parse(content);
      entities.push(entity);
    } catch (error) {
      console.error(chalk.red(`Error reading ${filePath}: ${error.message}`));
    }
  }
  
  return entities;
}

/**
 * Process and transform entities for Medusa.js and Strapi
 * @param {Array} entities - Source entities
 * @param {string} entityType - Entity type (products, categories, etc.)
 * @returns {Object} Object with medusa and strapi arrays
 */
function processEntities(entities, entityType) {
  const medusaEntities = [];
  const strapiEntities = [];
  
  for (const entity of entities) {
    try {
      // Transform for Medusa.js
      const medusaEntity = transformToMedusa(entity, entityType);
      medusaEntities.push(medusaEntity);
      
      // Transform for Strapi
      const strapiEntity = transformToStrapi(entity, entityType);
      strapiEntities.push(strapiEntity);
      
      if (verbose) {
        console.log(chalk.green(`Transformed ${entityType} entity: ${entity.id || entity.slug || 'unknown'}`));
      }
    } catch (error) {
      console.error(chalk.red(`Error transforming entity: ${error.message}`));
    }
  }
  
  return { medusaEntities, strapiEntities };
}

/**
 * Process region-specific data for an entity
 * @param {Object} entity - Source entity
 * @param {string} entityType - Entity type
 * @returns {Object} Object with region-specific data
 */
function processRegionData(entity, entityType) {
  const result = { default: { ...entity } };
  
  // Get regional fields for this entity type
  if (!mappings.entities[entityType].multi_region) {
    return result;
  }
  
  // Process each region-specific field
  mappings.entities[entityType].multi_region.forEach(mapping => {
    const regionalData = processRegionalField(entity, entityType, mapping.source);
    
    if (regionalData) {
      // Add regional data to result for each region
      for (const region in regionalData) {
        if (region === 'default') continue;
        
        if (!result[region]) {
          result[region] = { ...entity };
        }
        
        result[region][mapping.source] = regionalData[region];
      }
    }
  });
  
  return result;
}

/**
 * Process language-specific data for an entity
 * @param {Object} entity - Source entity
 * @param {string} entityType - Entity type
 * @returns {Object} Object with language-specific data
 */
function processLanguageData(entity, entityType) {
  const result = { default: { ...entity } };
  
  // Get localized fields for this entity type
  if (!mappings.entities[entityType].multi_language) {
    return result;
  }
  
  // Process each localized field
  mappings.entities[entityType].multi_language.forEach(mapping => {
    const localizedData = processLocalizedField(entity, entityType, mapping.source);
    
    if (localizedData) {
      // Add localized data to result for each language
      for (const lang in localizedData) {
        if (lang === 'default') continue;
        
        if (!result[lang]) {
          result[lang] = { ...entity };
        }
        
        result[lang][mapping.source] = localizedData[lang];
      }
    }
  });
  
  return result;
}

/**
 * Import entities to Medusa.js
 * @param {Array} entities - Entities to import
 * @param {string} entityType - Entity type (products, categories, etc.)
 * @param {boolean} dryRun - If true, don't make actual API calls
 * @returns {Promise<Array>} Import results
 */
async function importToMedusa(entities, entityType, dryRun = false) {
  if (entities.length === 0) {
    console.log(chalk.yellow(`No ${entityType} to import to Medusa.js`));
    return [];
  }
  
  const spinner = ora(`Importing ${entities.length} ${entityType} to Medusa.js...`).start();
  const results = [];
  
  if (dryRun) {
    spinner.info(`DRY RUN: Would import ${entities.length} ${entityType} to Medusa.js`);
    return entities.map(entity => ({ success: true, dryRun: true, data: entity }));
  }
  
  // Map entity type to Medusa API endpoint
  const endpointMap = {
    products: '/admin/products',
    categories: '/admin/product-categories',
    collections: '/admin/collections',
    customers: '/admin/customers',
    regions: '/admin/regions',
    orders: '/admin/orders'
  };
  
  const endpoint = endpointMap[entityType];
  if (!endpoint) {
    spinner.fail(`Unsupported entity type for Medusa.js import: ${entityType}`);
    return [];
  }
  
  // Helper to verify price format before sending to API
  const verifyPrices = (entity) => {
    if (entityType === 'products' && entity.variants) {
      entity.variants.forEach(variant => {
        if (variant.prices) {
          variant.prices.forEach(price => {
            // Ensure price is an integer and in cents
            if (typeof price.amount !== 'number' || !Number.isInteger(price.amount)) {
              console.warn(chalk.yellow(`Warning: Converting non-integer price ${price.amount} to cents`));
              price.amount = Math.round(parseFloat(price.amount) * 100);
            }
            
            // Ensure currency code is lowercase
            if (price.currency_code) {
              price.currency_code = price.currency_code.toLowerCase();
            }
          });
        }
      });
    }
    return entity;
  };
  
  // Import each entity
  for (const entity of entities) {
    try {
      // Prepare data for API
      const preparedEntity = verifyPrices({...entity});
      
      // Set up API call for this entity type
      let response;
      
      try {
        // Special handling for various entity types
        if (entityType === 'products') {
          // Products require nested creation of variants, prices, options
          response = await medusaClient.post(endpoint, preparedEntity);
        } else if (entityType === 'customers') {
          // Customers may need special handling for addresses
          response = await medusaClient.post(endpoint, preparedEntity);
        } else {
          // Default handling for other entity types
          response = await medusaClient.post(endpoint, preparedEntity);
        }
        
        results.push({ success: true, data: response.data });
        
        if (verbose) {
          console.log(chalk.green(`Successfully imported ${entityType} ${entity.id || entity.title || entity.name || 'unknown'}`));
        }
      } catch (apiError) {
        // Try to get detailed error message
        const errorDetails = apiError.response ? 
          `${apiError.response.status}: ${JSON.stringify(apiError.response.data)}` : 
          apiError.message;
        
        results.push({ success: false, error: errorDetails, entity: preparedEntity });
        
        if (verbose) {
          console.error(chalk.red(`Error importing ${entityType} to Medusa.js: ${errorDetails}`));
        }
      }
    } catch (error) {
      results.push({ success: false, error: error.message, entity });
      
      if (verbose) {
        console.error(chalk.red(`Error preparing ${entityType} for Medusa.js import: ${error.message}`));
      }
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  
  if (successCount === entities.length) {
    spinner.succeed(`Successfully imported ${successCount}/${entities.length} ${entityType} to Medusa.js`);
  } else {
    spinner.warn(`Imported ${successCount}/${entities.length} ${entityType} to Medusa.js`);
  }
  
  return results;
}

/**
 * Import entities to Strapi
 * @param {Array} entities - Transformed entities for Strapi
 * @param {string} entityType - Entity type
 * @param {boolean} dryRun - Whether to make actual API calls
 * @returns {Promise<Array>} Array of results
 */
async function importToStrapi(entities, entityType, dryRun = false) {
  if (entities.length === 0) {
    return [];
  }
  
  const spinner = ora(`Importing ${entities.length} ${entityType} to Strapi`).start();
  const results = [];
  
  // Map entity type to Strapi API endpoint
  const endpoint = {
    products: '/api/products',
    categories: '/api/categories',
    collections: '/api/collections',
    customers: '/api/customers',
    pages: '/api/pages',
    navigation: '/api/navigation-items'
  }[entityType];
  
  if (!endpoint) {
    spinner.fail(`Unknown entity type for Strapi: ${entityType}`);
    return [];
  }
  
  for (const entity of entities) {
    try {
      if (dryRun) {
        if (verbose) {
          console.log(chalk.blue(`[DRY RUN] Would import to Strapi: ${JSON.stringify(entity, null, 2)}`));
        }
        results.push({ success: true, data: entity, dryRun: true });
      } else {
        const response = await strapiClient.post(endpoint, { data: entity });
        results.push({ success: true, data: response.data });
      }
    } catch (error) {
      const errorMessage = error.response ? 
        `${error.response.status}: ${JSON.stringify(error.response.data)}` : 
        error.message;
      
      results.push({ success: false, error: errorMessage, entity });
      
      if (verbose) {
        console.error(chalk.red(`Error importing to Strapi: ${errorMessage}`));
      }
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  
  if (successCount === entities.length) {
    spinner.succeed(`Successfully imported ${successCount}/${entities.length} ${entityType} to Strapi`);
  } else {
    spinner.warn(`Imported ${successCount}/${entities.length} ${entityType} to Strapi`);
  }
  
  return results;
}

/**
 * Process and import a specific entity type
 * @param {string} entityType - Entity type to process
 * @returns {Promise<void>}
 */
async function processEntityType(entityType) {
  console.log(chalk.cyan(`\nProcessing ${entityType}...`));
  
  // Get entities from Statamic export
  const entities = getStatamicEntities(entityType);
  console.log(chalk.green(`Found ${entities.length} ${entityType} in Statamic export`));
  
  if (entities.length === 0) {
    return;
  }
  
  // Process entities for each region and language
  const processedByRegion = {};
  const processedByLanguage = {};
  
  // Process region-specific data
  for (const entity of entities) {
    const regionalEntities = processRegionData(entity, entityType);
    
    // Add to processed by region
    for (const region in regionalEntities) {
      if (!processedByRegion[region]) {
        processedByRegion[region] = [];
      }
      
      processedByRegion[region].push(regionalEntities[region]);
    }
  }
  
  // Process language-specific data for each region
  for (const region in processedByRegion) {
    if (!processedByLanguage[region]) {
      processedByLanguage[region] = {};
    }
    
    for (const entity of processedByRegion[region]) {
      const languageEntities = processLanguageData(entity, entityType);
      
      // Add to processed by language
      for (const lang in languageEntities) {
        if (!processedByLanguage[region][lang]) {
          processedByLanguage[region][lang] = [];
        }
        
        processedByLanguage[region][lang].push(languageEntities[lang]);
      }
    }
  }
  
  // Filter by requested regions and languages
  for (const region in processedByLanguage) {
    if (regions.includes('all') || regions.includes(region) || region === 'default') {
      for (const lang in processedByLanguage[region]) {
        if (languages.includes('all') || languages.includes(lang) || lang === 'default') {
          console.log(chalk.cyan(`\nProcessing ${entityType} for region ${region}, language ${lang}...`));
          
          // Transform entities for Medusa.js and Strapi
          const { medusaEntities, strapiEntities } = processEntities(
            processedByLanguage[region][lang],
            entityType
          );
          
          console.log(chalk.green(`Transformed ${medusaEntities.length} entities for Medusa.js`));
          console.log(chalk.green(`Transformed ${strapiEntities.length} entities for Strapi`));
          
          // Validate data before importing
          if (!skipValidation) {
            const entitiesForValidation = {
              [entityType]: medusaEntities
            };
            
            const validationResults = validateData(entitiesForValidation, [region], [lang]);
            generateReport(validationResults, `${validationReportPath}-${entityType}-${region}-${lang}.md`);
            
            if (!validationResults.valid) {
              console.log(chalk.yellow(`Validation found ${validationResults.summary.total_issues} issues for ${entityType} in region ${region}, language ${lang}.`));
              console.log(chalk.yellow(`See validation report for details: ${validationReportPath}-${entityType}-${region}-${lang}.md`));
              
              if (validateOnly) {
                continue;
              }
              
              const proceed = process.env.FORCE_IMPORT === 'true';
              if (!proceed) {
                console.log(chalk.yellow(`Skipping import for ${entityType} in region ${region}, language ${lang} due to validation issues.`));
                console.log(chalk.yellow(`To force import despite validation issues, set environment variable FORCE_IMPORT=true`));
                continue;
              }
              
              console.log(chalk.yellow(`Proceeding with import despite validation issues (FORCE_IMPORT=true).`));
            } else {
              console.log(chalk.green(`Validation successful for ${entityType} in region ${region}, language ${lang}.`));
            }
          }
          
          // Skip import if validation only
          if (validateOnly) {
            console.log(chalk.blue(`Skipping import (--validate-only flag is set).`));
            continue;
          }
          
          // Import to Medusa.js
          await importToMedusa(medusaEntities, entityType, dryRun);
          
          // Import to Strapi
          await importToStrapi(strapiEntities, entityType, dryRun);
        }
      }
    }
  }
}

/**
 * Main function to run the import process
 */
async function main() {
  console.log(chalk.cyan('Starting Statamic to Medusa.js & Strapi import'));
  console.log(chalk.gray(`Source: ${sourceDir}`));
  console.log(chalk.gray(`Medusa URL: ${medusaUrl}`));
  console.log(chalk.gray(`Strapi URL: ${strapiUrl}`));
  console.log(chalk.gray(`Regions: ${regions.join(', ')}`));
  console.log(chalk.gray(`Languages: ${languages.join(', ')}`));
  
  if (validateOnly) {
    console.log(chalk.blue('VALIDATE ONLY - No data will be imported'));
  } else if (dryRun) {
    console.log(chalk.yellow('DRY RUN - No data will be imported'));
  }
  
  if (skipValidation) {
    console.log(chalk.yellow('WARNING: Data validation is disabled (--skip-validation)'));
  }
  
  try {
    if (entityType === 'all') {
      // Define the order of entity types to ensure proper dependencies
      const entityTypes = [
        'regions',        // Regions first for region-specific data
        'categories',     // Categories next for product references
        'collections',    // Collections for product organization
        'products',       // Products after their dependencies
        'customers',      // Customers after regions for proper assignment
        'pages',          // Content types
        'navigation'      // Navigation depends on pages
      ];
      
      for (const type of entityTypes) {
        await processEntityType(type);
      }
    } else {
      await processEntityType(entityType);
    }
    
    if (validateOnly) {
      console.log(chalk.green('\nValidation completed successfully!'));
    } else {
      console.log(chalk.green('\nImport completed successfully!'));
    }
  } catch (error) {
    console.error(chalk.red(`\nError during ${validateOnly ? 'validation' : 'import'}: ${error.message}`));
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error(chalk.red(`Unhandled error: ${error.message}`));
  process.exit(1);
}); 