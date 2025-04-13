#!/usr/bin/env node

/**
 * Data Validator for Statamic to Medusa.js Migration
 * 
 * This script validates data during the migration process,
 * ensuring it adheres to the defined validation rules and
 * maintains integrity across regions and languages.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configure paths
const MAPPING_DIR = path.join(__dirname, '..', 'mapping');
const VALIDATION_RULES_FILE = path.join(MAPPING_DIR, 'validation-rules.json');

// Helper function to log with timestamp
function log(message) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${timestamp}] ${message}`);
}

/**
 * Load validation rules
 */
function loadValidationRules() {
  try {
    const rules = JSON.parse(fs.readFileSync(VALIDATION_RULES_FILE, 'utf8'));
    return rules;
  } catch (error) {
    throw new Error(`Failed to load validation rules: ${error.message}`);
  }
}

/**
 * Validate an entity against format rules
 * @param {Object} entity - The entity to validate
 * @param {string} entityType - Type of entity (products, categories, etc.)
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation results
 */
function validateEntityFormat(entity, entityType, rules) {
  const result = {
    valid: true,
    issues: []
  };
  
  if (!rules.entities[entityType] || !rules.entities[entityType].format_validations) {
    return result;
  }
  
  const formatRules = rules.entities[entityType].format_validations;
  
  // Check each field with format validation
  Object.keys(formatRules).forEach(field => {
    const rule = formatRules[field];
    
    // Skip if field doesn't exist in entity
    if (!entity[field]) {
      return;
    }
    
    const value = entity[field];
    
    // Validate based on format type
    switch (rule.type) {
      case 'email':
        if (!validateEmail(value)) {
          result.valid = false;
          result.issues.push(`Invalid email format for field '${field}': ${value}`);
        }
        break;
        
      case 'url':
        if (!validateUrl(value)) {
          result.valid = false;
          result.issues.push(`Invalid URL format for field '${field}': ${value}`);
        }
        break;
        
      case 'currency':
        if (!validateCurrency(value)) {
          result.valid = false;
          result.issues.push(`Invalid currency format for field '${field}': ${value}`);
        }
        break;
        
      case 'date':
        if (!validateDate(value)) {
          result.valid = false;
          result.issues.push(`Invalid date format for field '${field}': ${value}`);
        }
        break;
        
      case 'numeric':
        if (!validateNumeric(value)) {
          result.valid = false;
          result.issues.push(`Invalid numeric format for field '${field}': ${value}`);
        }
        break;
        
      case 'boolean':
        if (!validateBoolean(value)) {
          result.valid = false;
          result.issues.push(`Invalid boolean format for field '${field}': ${value}`);
        }
        break;
    }
  });
  
  return result;
}

/**
 * Validate region-specific data
 * @param {Object} entity - The entity to validate
 * @param {string} entityType - Type of entity
 * @param {string} region - Region code (nl, be, de)
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation results
 */
function validateRegionData(entity, entityType, region, rules) {
  const result = {
    valid: true,
    issues: []
  };
  
  if (!rules.region_validations || !rules.region_validations[region]) {
    return result;
  }
  
  const regionRules = rules.region_validations[region];
  
  // Check required fields for this region
  if (regionRules.required_fields) {
    regionRules.required_fields.forEach(field => {
      if (!entity[field] && entity[field] !== 0 && entity[field] !== false) {
        result.valid = false;
        result.issues.push(`Missing required field '${field}' for region ${region}`);
      }
    });
  }
  
  // Check region-specific format validations
  if (regionRules.format_validations) {
    Object.keys(regionRules.format_validations).forEach(field => {
      const rule = regionRules.format_validations[field];
      
      // Skip if field doesn't exist in entity
      if (!entity[field]) {
        return;
      }
      
      const value = entity[field];
      
      // Validate based on format type (similar to validateEntityFormat)
      // Implement region-specific validation logic here
    });
  }
  
  return result;
}

/**
 * Validate language-specific data
 * @param {Object} entity - The entity to validate
 * @param {string} entityType - Type of entity
 * @param {string} language - Language code (nl, de, fr, en)
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation results
 */
function validateLanguageData(entity, entityType, language, rules) {
  const result = {
    valid: true,
    issues: []
  };
  
  if (!rules.entities[entityType] || !rules.entities[entityType].localization_validations) {
    return result;
  }
  
  const localizationRules = rules.entities[entityType].localization_validations;
  
  // Check required fields for this language
  if (localizationRules.required_fields) {
    localizationRules.required_fields.forEach(field => {
      const localizedField = `${field}_${language}`;
      
      if (!entity[localizedField] && entity[localizedField] !== 0 && entity[localizedField] !== false) {
        result.valid = false;
        result.issues.push(`Missing required localized field '${localizedField}' for language ${language}`);
      }
    });
  }
  
  return result;
}

/**
 * Validate cross-entity relationships
 * @param {Object} entity - The entity to validate
 * @param {string} entityType - Type of entity
 * @param {Object} allEntities - All entities by type and ID
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation results
 */
function validateRelationships(entity, entityType, allEntities, rules) {
  const result = {
    valid: true,
    issues: []
  };
  
  if (!rules.entities[entityType] || !rules.entities[entityType].relationship_validations) {
    return result;
  }
  
  const relationshipRules = rules.entities[entityType].relationship_validations;
  
  // Check each relationship field
  Object.keys(relationshipRules).forEach(field => {
    const rule = relationshipRules[field];
    
    // Skip if field doesn't exist in entity
    if (!entity[field]) {
      return;
    }
    
    const value = entity[field];
    
    // Check relationship based on type
    if (rule.type === 'reference') {
      // Single reference
      if (!allEntities[rule.entity] || !allEntities[rule.entity][value]) {
        result.valid = false;
        result.issues.push(`Invalid reference in field '${field}': Referenced ${rule.entity} with ID ${value} does not exist`);
      }
    } else if (rule.type === 'references') {
      // Array of references
      if (Array.isArray(value)) {
        value.forEach(id => {
          if (!allEntities[rule.entity] || !allEntities[rule.entity][id]) {
            result.valid = false;
            result.issues.push(`Invalid reference in field '${field}': Referenced ${rule.entity} with ID ${id} does not exist`);
          }
        });
      } else {
        result.valid = false;
        result.issues.push(`Field '${field}' should be an array of references`);
      }
    }
  });
  
  return result;
}

// Format validation helper functions
function validateEmail(value) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof value === 'string' && emailRegex.test(value);
}

function validateUrl(value) {
  try {
    new URL(value);
    return true;
  } catch (error) {
    return false;
  }
}

function validateCurrency(value) {
  return typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)));
}

function validateDate(value) {
  const date = new Date(value);
  return !isNaN(date.getTime());
}

function validateNumeric(value) {
  return typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)));
}

function validateBoolean(value) {
  return typeof value === 'boolean' || value === 'true' || value === 'false';
}

/**
 * Validate data for product variants including region-specific pricing
 * @param {Object} entity - The entity to validate
 * @param {string} entityType - Type of entity (should be "product")
 * @param {Object} allEntities - All entities by type and ID
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation results with variant-specific checks
 */
function validateProductVariants(entity, entityType, allEntities, rules) {
  const result = {
    valid: true,
    issues: []
  };
  
  if (entityType !== 'product' || !entity.variants) {
    return result;
  }
  
  // Check if variants array exists and has items
  if (!Array.isArray(entity.variants)) {
    result.valid = false;
    result.issues.push(`Product ${entity.id || entity.handle || 'unknown'} has invalid variants format - expected array`);
    return result;
  }
  
  // Warn if no variants exist
  if (entity.variants.length === 0) {
    result.issues.push(`Warning: Product ${entity.id || entity.handle || 'unknown'} has no variants - a default variant will be created`);
    return result;
  }
  
  // Check each variant
  for (let i = 0; i < entity.variants.length; i++) {
    const variant = entity.variants[i];
    
    // Check required fields
    const requiredFields = ['title', 'inventory_quantity'];
    for (const field of requiredFields) {
      if (variant[field] === undefined) {
        result.valid = false;
        result.issues.push(`Variant ${i} in product ${entity.id || entity.handle || 'unknown'} is missing required field: ${field}`);
      }
    }
    
    // Check SKU format
    if (variant.sku && typeof variant.sku === 'string') {
      const skuRegex = /^[a-zA-Z0-9_-]+$/;
      if (!skuRegex.test(variant.sku)) {
        result.valid = false;
        result.issues.push(`Variant ${i} in product ${entity.id || entity.handle || 'unknown'} has invalid SKU format: ${variant.sku}`);
      }
    } else {
      result.issues.push(`Warning: Variant ${i} in product ${entity.id || entity.handle || 'unknown'} has no SKU`);
    }
    
    // Check prices
    if (!variant.prices || !Array.isArray(variant.prices)) {
      result.valid = false;
      result.issues.push(`Variant ${i} in product ${entity.id || entity.handle || 'unknown'} has missing or invalid prices`);
    } else if (variant.prices.length === 0) {
      result.valid = false;
      result.issues.push(`Variant ${i} in product ${entity.id || entity.handle || 'unknown'} has no prices defined`);
    } else {
      // Validate each price
      const currencies = new Set();
      
      for (let j = 0; j < variant.prices.length; j++) {
        const price = variant.prices[j];
        
        // Check price amount
        if (!price.amount && price.amount !== 0) {
          result.valid = false;
          result.issues.push(`Price ${j} in variant ${i} of product ${entity.id || entity.handle || 'unknown'} has no amount`);
        } else if (typeof price.amount !== 'number') {
          result.valid = false;
          result.issues.push(`Price ${j} in variant ${i} of product ${entity.id || entity.handle || 'unknown'} has invalid amount type: ${typeof price.amount}`);
        } else if (price.amount < 0) {
          result.valid = false;
          result.issues.push(`Price ${j} in variant ${i} of product ${entity.id || entity.handle || 'unknown'} has negative amount: ${price.amount}`);
        }
        
        // Check currency code
        if (!price.currency_code) {
          result.valid = false;
          result.issues.push(`Price ${j} in variant ${i} of product ${entity.id || entity.handle || 'unknown'} has no currency code`);
        } else if (typeof price.currency_code !== 'string') {
          result.valid = false;
          result.issues.push(`Price ${j} in variant ${i} of product ${entity.id || entity.handle || 'unknown'} has invalid currency code type: ${typeof price.currency_code}`);
        } else if (!['eur', 'usd'].includes(price.currency_code.toLowerCase())) {
          result.valid = false;
          result.issues.push(`Price ${j} in variant ${i} of product ${entity.id || entity.handle || 'unknown'} has unsupported currency code: ${price.currency_code}`);
        } else {
          // Track currencies to ensure no duplicates
          if (currencies.has(price.currency_code.toLowerCase())) {
            result.issues.push(`Warning: Duplicate currency ${price.currency_code} in variant ${i} of product ${entity.id || entity.handle || 'unknown'}`);
          } else {
            currencies.add(price.currency_code.toLowerCase());
          }
        }
        
        // Check region_id if present
        if (price.region_id) {
          // If we have all regions loaded, we could validate the region_id references
          // For now, just check that it's a string
          if (typeof price.region_id !== 'string') {
            result.valid = false;
            result.issues.push(`Price ${j} in variant ${i} of product ${entity.id || entity.handle || 'unknown'} has invalid region_id type: ${typeof price.region_id}`);
          }
        }
      }
    }
  }
  
  return result;
}

/**
 * Validate data during migration process
 * @param {Object} data - Data to validate, organized by entity type
 * @param {Array} regions - Regions to validate
 * @param {Array} languages - Languages to validate
 * @returns {Object} Validation results
 */
function validateData(data, regions = ['nl', 'be', 'de'], languages = ['nl', 'de', 'fr', 'en']) {
  // Try to load validation rules
  let rules;
  try {
    rules = loadValidationRules();
  } catch (error) {
    return {
      valid: false,
      summary: {
        total_entities: 0,
        valid_entities: 0,
        invalid_entities: 0,
        total_issues: 1
      },
      issues: [`Failed to load validation rules: ${error.message}`],
      entities: {}
    };
  }
  
  const result = {
    valid: true,
    summary: {
      total_entities: 0,
      valid_entities: 0,
      invalid_entities: 0,
      total_issues: 0
    },
    issues: [],
    entities: {}
  };
  
  // Organize entities by type and ID for relationship checks
  const entitiesByType = {};
  
  for (const entityType in data) {
    if (!entitiesByType[entityType]) {
      entitiesByType[entityType] = {};
    }
    
    const entities = Array.isArray(data[entityType]) ? data[entityType] : [data[entityType]];
    
    for (const entity of entities) {
      if (entity.id) {
        entitiesByType[entityType][entity.id] = entity;
      } else if (entity.handle) {
        entitiesByType[entityType][entity.handle] = entity;
      }
    }
  }
  
  // Validate each entity type
  for (const entityType in data) {
    const entities = Array.isArray(data[entityType]) ? data[entityType] : [data[entityType]];
    
    result.summary.total_entities += entities.length;
    result.entities[entityType] = {
      total: entities.length,
      valid: 0,
      invalid: 0,
      issues: []
    };
    
    for (const entity of entities) {
      let entityValid = true;
      const entityIssues = [];
      
      // Basic format validation
      const formatResult = validateEntityFormat(entity, entityType, rules);
      if (!formatResult.valid) {
        entityValid = false;
        entityIssues.push(...formatResult.issues);
      }
      
      // Special product variant validation
      if (entityType === 'product') {
        const variantResult = validateProductVariants(entity, entityType, entitiesByType, rules);
        if (!variantResult.valid) {
          entityValid = false;
          entityIssues.push(...variantResult.issues);
        }
      }
      
      // Relationship validation
      const relationshipResult = validateRelationships(entity, entityType, entitiesByType, rules);
      if (!relationshipResult.valid) {
        entityValid = false;
        entityIssues.push(...relationshipResult.issues);
      }
      
      // Validate for each region
      for (const region of regions) {
        if (region === 'all') continue; // Skip placeholder
        
        const regionResult = validateRegionData(entity, entityType, region, rules);
        if (!regionResult.valid) {
          entityValid = false;
          entityIssues.push(...regionResult.issues);
        }
      }
      
      // Validate for each language
      for (const language of languages) {
        if (language === 'all') continue; // Skip placeholder
        
        const languageResult = validateLanguageData(entity, entityType, language, rules);
        if (!languageResult.valid) {
          entityValid = false;
          entityIssues.push(...languageResult.issues);
        }
      }
      
      // Update entity type results
      if (entityValid) {
        result.entities[entityType].valid++;
      } else {
        result.entities[entityType].invalid++;
        result.valid = false;
        
        // Add entity-specific issues
        const entityId = entity.id || entity.handle || 'unknown';
        entityIssues.forEach(issue => {
          const formattedIssue = `[${entityType}:${entityId}] ${issue}`;
          result.entities[entityType].issues.push(formattedIssue);
          result.issues.push(formattedIssue);
        });
      }
    }
    
    // Update overall summary
    result.summary.valid_entities += result.entities[entityType].valid;
    result.summary.invalid_entities += result.entities[entityType].invalid;
    result.summary.total_issues += result.entities[entityType].issues.length;
  }
  
  return result;
}

/**
 * Generate validation report
 * @param {Object} results - Validation results
 * @param {string} outputPath - Output file path
 */
function generateReport(results, outputPath) {
  log(`Generating validation report to ${outputPath}...`);
  
  let markdown = `# Data Validation Report\n\n`;
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  
  // Add summary section
  markdown += `## Summary\n\n`;
  markdown += `- Total entities: ${results.summary.total_entities}\n`;
  markdown += `- Valid entities: ${results.summary.valid_entities}\n`;
  markdown += `- Entities with issues: ${results.summary.invalid_entities}\n`;
  markdown += `- Total issues found: ${results.summary.total_issues}\n`;
  markdown += `- Overall status: ${results.valid ? '✅ Valid' : '❌ Invalid'}\n\n`;
  
  // Add entity type sections
  markdown += `## Entity Validation Details\n\n`;
  
  Object.keys(results.entities).forEach(entityType => {
    const entityResults = results.entities[entityType];
    
    markdown += `### ${entityType}\n\n`;
    markdown += `- Total: ${entityResults.total}\n`;
    markdown += `- Valid: ${entityResults.valid}\n`;
    markdown += `- Invalid: ${entityResults.invalid}\n\n`;
    
    if (entityResults.issues.length > 0) {
      markdown += `#### Issues\n\n`;
      
      entityResults.issues.forEach(entityIssue => {
        markdown += `##### Entity ID: ${entityIssue}\n`;
      });
    }
  });
  
  fs.writeFileSync(outputPath, markdown);
  log(`Validation report generated: ${outputPath}`);
}

// Export functions for use in import scripts
module.exports = {
  validateData,
  generateReport,
  validateEntityFormat,
  validateRegionData,
  validateLanguageData,
  validateRelationships
};

// If run directly from command line
if (require.main === module) {
  const { program } = require('commander');
  
  program
    .version('1.0.0')
    .description('Validate data for Statamic to Medusa.js migration')
    .option('-s, --source <path>', 'Path to JSON data file to validate')
    .option('-t, --type <type>', 'Entity type to validate (products, categories, etc.)')
    .option('-r, --regions <regions>', 'Comma-separated list of regions to validate for', 'nl,be,de')
    .option('-l, --languages <languages>', 'Comma-separated list of languages to validate for', 'nl,de,fr,en')
    .option('-o, --output <path>', 'Output path for validation report', './validation-report.md')
    .parse(process.argv);
  
  const options = program.opts();
  
  if (!options.source) {
    console.error(chalk.red('Error: Source file is required'));
    process.exit(1);
  }
  
  if (!options.type) {
    console.error(chalk.red('Error: Entity type is required'));
    process.exit(1);
  }
  
  try {
    const sourceData = JSON.parse(fs.readFileSync(options.source, 'utf8'));
    const regions = options.regions.split(',');
    const languages = options.languages.split(',');
    
    const entities = {
      [options.type]: sourceData
    };
    
    const results = validateData(entities, regions, languages);
    generateReport(results, options.output);
    
    if (results.valid) {
      console.log(chalk.green('\n✅ Validation successful!'));
      process.exit(0);
    } else {
      console.log(chalk.yellow(`\n❌ Validation found ${results.summary.total_issues} issues. See report for details.`));
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
} 