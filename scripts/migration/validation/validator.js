/**
 * Data Validator for Migration
 * Validates transformed data against schema rules before import to Medusa/Strapi
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class MigrationValidator {
  constructor(options = {}) {
    this.options = {
      strict: false,
      language: null,
      region: null,
      ...options
    };
    
    this.errors = [];
    this.warnings = [];
    this.validationRules = null;
    this.customRules = options.customRules || null;
  }

  /**
   * Load validation rules from file
   * @param {string} rulesPath - Path to rules file (default to validation-rules.json)
   * @returns {boolean} - Success status
   */
  loadRules(rulesPath = null) {
    try {
      const defaultPath = path.resolve(__dirname, '../mapping/validation-rules.json');
      const filePath = rulesPath || defaultPath;
      
      if (!fs.existsSync(filePath)) {
        this.errors.push(`Validation rules file not found: ${filePath}`);
        return false;
      }

      const rulesContent = fs.readFileSync(filePath, 'utf8');
      this.validationRules = JSON.parse(rulesContent);
      
      // If we have custom rules, merge them with the standard rules
      if (this.customRules) {
        this.validationRules = {
          ...this.validationRules,
          ...this.customRules
        };
      }
      
      return true;
    } catch (error) {
      this.errors.push(`Failed to load validation rules: ${error.message}`);
      return false;
    }
  }

  /**
   * Validate a single entity against the rules
   * @param {Object} entity - Data entity to validate
   * @param {string} entityType - Type of entity (product, category, etc.)
   * @returns {boolean} - Validation success
   */
  validateEntity(entity, entityType) {
    let isValid = true;
    
    // Get entity validation rules
    const entityRules = this.validationRules[entityType];
    if (!entityRules) {
      this.warnings.push(`No validation rules found for entity type: ${entityType}`);
      return true; // No rules, assume valid
    }
    
    // Extract entity ID for error messages
    const entityId = entity.id || entity.handle || 'unknown';
    
    // Check required fields
    if (entityRules.required) {
      for (const field of entityRules.required) {
        if (entity[field] === undefined || entity[field] === null || entity[field] === '') {
          this.errors.push(`Required field ${field} is missing in ${entityType} ${entityId}`);
          isValid = false;
        }
      }
    }
    
    // Check field formats
    if (entityRules.formats) {
      for (const [field, format] of Object.entries(entityRules.formats)) {
        if (entity[field] !== undefined && entity[field] !== null) {
          const formatValid = this.validateFormat(
            entity[field], 
            format, 
            field, 
            entityType, 
            entityId
          );
          
          if (!formatValid) isValid = false;
        }
      }
    }
    
    // Extra validation for products - check variants
    if (entityType === 'product' && entity.variants) {
      if (!Array.isArray(entity.variants)) {
        this.errors.push(`Field variants in product ${entityId} should be an array`);
        isValid = false;
      } else if (entity.variants.length === 0) {
        // Add a warning for products with no variants
        this.warnings.push(`Product ${entityId} has no variants. A default variant should be created.`);
      } else {
        // Validate each variant
        for (const variant of entity.variants) {
          const variantValid = this.validateVariant(variant, entityId);
          if (!variantValid) isValid = false;
        }
      }
    }
    
    // Check relationships
    if (entityRules.relationships) {
      for (const [field, relation] of Object.entries(entityRules.relationships)) {
        if (entity[field] !== undefined && entity[field] !== null) {
          // Skip relationship validation if we don't have strict mode
          // This allows for validation of partial datasets
          if (!this.options.strict) continue;
          
          // TODO: implement actual relationship validation
          // This would require having all entities available
        }
      }
    }
    
    // Validate multilingual fields if language is specified
    if (this.options.language && entityType !== 'multilingual') {
      const langFields = entity.translations && entity.translations[this.options.language];
      if (!langFields && this.options.strict) {
        this.warnings.push(`No translations found for ${this.options.language} in ${entityType} ${entityId}`);
      }
    }
    
    // Validate region-specific fields if region is specified
    if (this.options.region && entityType !== 'multiregion') {
      const regionFields = entity.regions && entity.regions[this.options.region];
      if (!regionFields && this.options.strict) {
        this.warnings.push(`No region-specific data found for ${this.options.region} in ${entityType} ${entityId}`);
      }
    }
    
    return isValid;
  }

  /**
   * Validate a value against a format rule
   * @param {any} value - Value to validate
   * @param {string|Object} format - Format rule
   * @param {string} field - Field name
   * @param {string} entityType - Entity type
   * @param {string} entityId - Entity ID
   * @returns {boolean} - Validation success
   */
  validateFormat(value, format, field, entityType, entityId) {
    if (typeof format === 'string') {
      switch (format) {
        case 'string':
          if (typeof value !== 'string') {
            this.errors.push(`Field ${field} in ${entityType} ${entityId} should be a string`);
            return false;
          }
          break;
        case 'numeric':
          if (typeof value !== 'number') {
            this.errors.push(`Field ${field} in ${entityType} ${entityId} should be a number`);
            return false;
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean') {
            this.errors.push(`Field ${field} in ${entityType} ${entityId} should be a boolean`);
            return false;
          }
          break;
        case 'array':
          if (!Array.isArray(value)) {
            this.errors.push(`Field ${field} in ${entityType} ${entityId} should be an array`);
            return false;
          }
          break;
        case 'object':
          if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            this.errors.push(`Field ${field} in ${entityType} ${entityId} should be an object`);
            return false;
          }
          break;
        case 'email':
          if (typeof value !== 'string' || !this.isValidEmail(value)) {
            this.errors.push(`Field ${field} in ${entityType} ${entityId} should be a valid email`);
            return false;
          }
          break;
        case 'url':
          if (typeof value !== 'string' || !this.isValidUrl(value)) {
            this.errors.push(`Field ${field} in ${entityType} ${entityId} should be a valid URL`);
            return false;
          }
          break;
        case 'slug':
          if (typeof value !== 'string' || !this.isValidSlug(value)) {
            this.errors.push(`Field ${field} in ${entityType} ${entityId} should be a valid slug`);
            return false;
          }
          break;
        case 'phone':
          if (typeof value !== 'string' || !this.isValidPhone(value)) {
            this.errors.push(`Field ${field} in ${entityType} ${entityId} should be a valid phone number`);
            return false;
          }
          break;
      }
    } else if (typeof format === 'object') {
      // Handle complex format rules
      if (format.type === 'enum' && Array.isArray(format.values)) {
        if (!format.values.includes(value)) {
          this.errors.push(`Field ${field} in ${entityType} ${entityId} should be one of: ${format.values.join(', ')}`);
          return false;
        }
      } else if (format.type === 'array' && format.items) {
        if (!Array.isArray(value)) {
          this.errors.push(`Field ${field} in ${entityType} ${entityId} should be an array`);
          return false;
        }
        
        // Validate each item in the array
        let arrayValid = true;
        for (let i = 0; i < value.length; i++) {
          const itemValid = this.validateNestedObject(
            value[i], 
            format.items, 
            `${field}[${i}]`, 
            entityType, 
            entityId
          );
          if (!itemValid) arrayValid = false;
        }
        return arrayValid;
      } else if (format.type === 'object' && format.properties) {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          this.errors.push(`Field ${field} in ${entityType} ${entityId} should be an object`);
          return false;
        }
        
        return this.validateNestedObject(
          value, 
          format.properties, 
          field, 
          entityType, 
          entityId
        );
      }
    }
    
    return true;
  }

  /**
   * Validate a nested object against format rules
   * @param {Object} obj - Object to validate
   * @param {Object} rules - Format rules
   * @param {string} fieldPrefix - Field prefix for error messages
   * @param {string} entityType - Entity type
   * @param {string} entityId - Entity ID
   * @returns {boolean} - Validation success
   */
  validateNestedObject(obj, rules, fieldPrefix, entityType, entityId) {
    let isValid = true;
    
    for (const [field, format] of Object.entries(rules)) {
      const nestedField = `${fieldPrefix}.${field}`;
      
      // Skip if field doesn't exist and it's not required
      if (obj[field] === undefined || obj[field] === null) continue;
      
      const formatValid = this.validateFormat(
        obj[field], 
        format, 
        nestedField, 
        entityType, 
        entityId
      );
      
      if (!formatValid) isValid = false;
    }
    
    return isValid;
  }

  /**
   * Validate all entities in a data set
   * @param {Array|Object} data - Data to validate (array of entities or single entity)
   * @param {string} entityType - Type of entity (product, category, etc.)
   * @returns {Object} - Validation results
   */
  validate(data, entityType) {
    this.errors = [];
    this.warnings = [];

    if (!this.validationRules) {
      const rulesLoaded = this.loadRules();
      if (!rulesLoaded) {
        return {
          success: false,
          errors: this.errors,
          warnings: this.warnings,
          validCount: 0,
          totalCount: Array.isArray(data) ? data.length : 1
        };
      }
    }

    let entities = Array.isArray(data) ? data : [data];
    let validCount = 0;

    for (const entity of entities) {
      const isValid = this.validateEntity(entity, entityType);
      if (isValid) validCount++;
    }

    return {
      success: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      validCount,
      totalCount: entities.length
    };
  }

  /**
   * Generate a validation report
   * @param {Object} results - Validation results
   * @param {string} entityType - Type of entity
   * @returns {string} - Formatted report
   */
  generateReport(results, entityType) {
    const { success, errors, warnings, validCount, totalCount } = results;
    
    let report = '\n';
    report += chalk.bold(`Validation Report for ${entityType}\n`);
    report += chalk.bold('==============================\n\n');
    
    report += `Total entities: ${chalk.bold(totalCount)}\n`;
    report += `Valid entities: ${chalk.bold.green(validCount)}\n`;
    report += `Invalid entities: ${chalk.bold.red(totalCount - validCount)}\n`;
    report += `Errors: ${chalk.bold.red(errors.length)}\n`;
    report += `Warnings: ${chalk.bold.yellow(warnings.length)}\n\n`;
    
    if (errors.length > 0) {
      report += chalk.bold.red('Errors:\n');
      errors.forEach((error, index) => {
        report += chalk.red(`  ${index + 1}. ${error}\n`);
      });
      report += '\n';
    }
    
    if (warnings.length > 0) {
      report += chalk.bold.yellow('Warnings:\n');
      warnings.forEach((warning, index) => {
        report += chalk.yellow(`  ${index + 1}. ${warning}\n`);
      });
      report += '\n';
    }
    
    if (success) {
      report += chalk.bold.green('✓ Validation successful!\n');
    } else {
      report += chalk.bold.red('✗ Validation failed!\n');
    }
    
    return report;
  }

  /**
   * Write validation report to file
   * @param {Object} results - Validation results
   * @param {string} entityType - Type of entity
   * @param {string} outputPath - Path to write report
   * @returns {boolean} - Success status
   */
  writeReport(results, entityType, outputPath) {
    try {
      const report = this.generateReport(results, entityType);
      const jsonResults = {
        timestamp: new Date().toISOString(),
        entityType,
        success: results.success,
        summary: {
          totalCount: results.totalCount,
          validCount: results.validCount,
          invalidCount: results.totalCount - results.validCount,
          errorCount: results.errors.length,
          warningCount: results.warnings.length
        },
        errors: results.errors,
        warnings: results.warnings
      };
      
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write JSON report
      fs.writeFileSync(
        outputPath, 
        JSON.stringify(jsonResults, null, 2), 
        'utf8'
      );
      
      // Also write plain text report
      fs.writeFileSync(
        `${outputPath.replace(/\.json$/, '')}.txt`, 
        report.replace(/\u001b\[\d+m/g, ''), // Strip colors
        'utf8'
      );
      
      return true;
    } catch (error) {
      this.errors.push(`Failed to write validation report: ${error.message}`);
      return false;
    }
  }

  // Validation helper methods
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  isValidSlug(slug) {
    const regex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return regex.test(slug);
  }

  isValidPhone(phone) {
    // Basic phone validation - can be enhanced for specific formats
    const regex = /^[+]?[\d\s()-]{8,20}$/;
    return regex.test(phone);
  }

  /**
   * Validate a product variant
   * @param {Object} variant - The variant object to validate
   * @param {string} productId - Product ID for error messages
   * @returns {boolean} - Validation success
   */
  validateVariant(variant, productId) {
    let isValid = true;
    
    // Required fields for variants
    const requiredFields = ['title', 'sku', 'inventory_quantity'];
    
    // Check required fields
    for (const field of requiredFields) {
      if (variant[field] === undefined) {
        this.warnings.push(`Variant for product ${productId} is missing required field: ${field}`);
        // Don't fail completely on missing variant fields, just warn
      }
    }
    
    // Validate SKU format if present
    if (variant.sku && typeof variant.sku === 'string') {
      // SKU should be alphanumeric with optional dashes/underscores
      const skuRegex = /^[a-zA-Z0-9_-]+$/;
      if (!skuRegex.test(variant.sku)) {
        this.errors.push(`Invalid SKU format for variant in product ${productId}: ${variant.sku}`);
        isValid = false;
      }
    }
    
    // Validate inventory_quantity is a non-negative number
    if (variant.inventory_quantity !== undefined) {
      if (typeof variant.inventory_quantity !== 'number' || 
          variant.inventory_quantity < 0 || 
          !Number.isInteger(variant.inventory_quantity)) {
        this.errors.push(`Invalid inventory quantity for variant in product ${productId}: ${variant.inventory_quantity}`);
        isValid = false;
      }
    }
    
    // Validate prices if present
    if (variant.prices && Array.isArray(variant.prices)) {
      for (const price of variant.prices) {
        if (!price.amount || typeof price.amount !== 'number' || price.amount < 0) {
          this.errors.push(`Invalid price amount for variant in product ${productId}: ${price.amount}`);
          isValid = false;
        }
        
        if (!price.currency_code || 
            typeof price.currency_code !== 'string' || 
            !['eur', 'usd'].includes(price.currency_code.toLowerCase())) {
          this.errors.push(`Invalid currency code for variant in product ${productId}: ${price.currency_code}`);
          isValid = false;
        }
      }
    }
    
    return isValid;
  }
}

module.exports = MigrationValidator; 