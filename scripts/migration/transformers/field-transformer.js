/**
 * Field Transformer
 * 
 * Utility for transforming fields from Statamic/Simple Commerce to Medusa.js and Strapi
 * using mapping definitions from field-mapping.json
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class FieldTransformer {
  constructor(mappingPath) {
    this.mappingPath = mappingPath || path.join(__dirname, '../mapping/field-mapping.json');
    this.mapping = null;
    this.loadMapping();
  }

  /**
   * Load mapping configuration from JSON file
   */
  loadMapping() {
    try {
      const mappingData = fs.readFileSync(this.mappingPath, 'utf8');
      this.mapping = JSON.parse(mappingData);
      console.log(chalk.green(`✓ Field mapping loaded from ${this.mappingPath}`));
    } catch (error) {
      console.error(chalk.red(`✗ Error loading field mapping: ${error.message}`));
      throw new Error(`Failed to load field mapping: ${error.message}`);
    }
  }

  /**
   * Transform an entity from Statamic to Medusa.js and/or Strapi
   * 
   * @param {string} entityType - The type of entity (products, categories, etc.)
   * @param {Object} sourceData - Source data from Statamic
   * @param {string} targetSystem - Target system (medusa or strapi)
   * @param {Object} options - Additional options for transformation
   * @returns {Object} Transformed entity
   */
  transformEntity(entityType, sourceData, targetSystem, options = {}) {
    if (!this.mapping || !this.mapping.entities[entityType]) {
      throw new Error(`No mapping found for entity type: ${entityType}`);
    }

    if (!this.mapping.entities[entityType][targetSystem]) {
      return null; // This entity type is not supported in the target system
    }

    const { region, language } = options;
    const entityMapping = this.mapping.entities[entityType][targetSystem];
    const transformedEntity = {};

    // Process standard fields
    for (const [targetField, mapping] of Object.entries(entityMapping)) {
      transformedEntity[targetField] = this.transformField(sourceData, mapping, options);
    }

    // Process multi-language fields if language is specified
    if (language && this.mapping.entities[entityType].multi_language) {
      this.mapping.entities[entityType].multi_language.forEach(langMapping => {
        const sourceField = langMapping.source;
        const targetField = langMapping[`${targetSystem}_field`];
        
        if (targetField && sourceData[`${sourceField}_${language}`]) {
          transformedEntity[targetField] = sourceData[`${sourceField}_${language}`];
        }
      });
    }

    // Process multi-region fields if region is specified
    if (region && this.mapping.entities[entityType].multi_region) {
      this.mapping.entities[entityType].multi_region.forEach(regionMapping => {
        const sourceField = regionMapping.source;
        const targetField = regionMapping[`${targetSystem}_field`];
        
        if (targetField) {
          const regionValue = sourceData[`${sourceField}_${region}`] || sourceData[sourceField];
          
          if (regionMapping.transformation) {
            const transformFunc = this[regionMapping.transformation] || 
                                 this.getTransformFunction(regionMapping.transformation);
            
            if (transformFunc) {
              const nestedFields = targetField.split('.');
              if (nestedFields.length > 1) {
                this.setNestedValue(transformedEntity, nestedFields, 
                  transformFunc.call(this, regionValue, { region, language, ...options }));
              } else {
                transformedEntity[targetField] = 
                  transformFunc.call(this, regionValue, { region, language, ...options });
              }
            }
          } else {
            const nestedFields = targetField.split('.');
            if (nestedFields.length > 1) {
              this.setNestedValue(transformedEntity, nestedFields, regionValue);
            } else {
              transformedEntity[targetField] = regionValue;
            }
          }
        }
      });
    }

    return transformedEntity;
  }

  /**
   * Transform a single field based on mapping definition
   * 
   * @param {Object} sourceData - Source data object
   * @param {Object} mapping - Field mapping definition
   * @param {Object} options - Additional options
   * @returns {*} Transformed field value
   */
  transformField(sourceData, mapping, options = {}) {
    const { type, source, default: defaultValue, part } = mapping;
    
    // Handle null or undefined source values
    if (!sourceData || sourceData[source] === undefined) {
      return defaultValue !== undefined ? defaultValue : null;
    }
    
    const sourceValue = sourceData[source];
    
    // Direct mapping (no transformation)
    if (type === 'direct') {
      return sourceValue !== undefined ? sourceValue : defaultValue;
    }
    
    // Apply transformation if defined
    if (type.startsWith('transform_')) {
      const transformFunc = this[type] || this.getTransformFunction(type);
      
      if (transformFunc) {
        return transformFunc.call(this, sourceValue, { 
          part, 
          sourceData, 
          defaultValue,
          ...options 
        });
      }
    }
    
    // Fallback to direct value
    return sourceValue !== undefined ? sourceValue : defaultValue;
  }

  /**
   * Get transformation function for a specific type
   * 
   * @param {string} transformType - Type of transformation
   * @returns {Function|null} Transformation function
   */
  getTransformFunction(transformType) {
    if (!this.mapping.transformations[transformType]) {
      console.warn(chalk.yellow(`Warning: No transformation defined for ${transformType}`));
      return null;
    }
    
    const functionName = this.mapping.transformations[transformType].function;
    return this[functionName] || null;
  }

  /**
   * Set a nested value in an object
   * 
   * @param {Object} obj - Target object
   * @param {Array} path - Path to the property
   * @param {*} value - Value to set
   */
  setNestedValue(obj, path, value) {
    const lastKey = path.pop();
    let current = obj;
    
    for (const key of path) {
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey] = value;
  }

  /**
   * Get region-specific information
   * 
   * @param {string} regionCode - Region code (nl, be, de)
   * @returns {Object} Region information
   */
  getRegionInfo(regionCode) {
    return this.mapping.region_mappings[regionCode] || null;
  }

  /**
   * Get language information
   * 
   * @param {string} languageCode - Language code (nl, de, fr, en)
   * @returns {string} Full language code
   */
  getLanguageCode(languageCode) {
    return this.mapping.language_mappings[languageCode] || languageCode;
  }

  /**
   * Check if a region supports a language
   * 
   * @param {string} regionCode - Region code
   * @param {string} languageCode - Language code
   * @returns {boolean} Whether the region supports the language
   */
  regionSupportsLanguage(regionCode, languageCode) {
    const regionInfo = this.getRegionInfo(regionCode);
    return regionInfo && regionInfo.languages.includes(languageCode);
  }

  // TRANSFORMATION FUNCTIONS
  
  /**
   * Transform a slug from Statamic format to the target system format
   */
  transformSlug(value) {
    if (!value) return '';
    return value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  /**
   * Transform currency codes to lowercase for Medusa compatibility
   */
  transformCurrency(value) {
    if (!value) return 'eur';
    return value.toLowerCase();
  }

  /**
   * Transform tax rates from percentage to decimal
   */
  transformTaxRate(value) {
    if (value === undefined || value === null) return null;
    return parseFloat(value) / 100;
  }

  /**
   * Transform media references from Statamic to the target system
   */
  transformMedia(value, options = {}) {
    if (!value) return null;
    
    const { targetSystem } = options;
    
    if (Array.isArray(value)) {
      return value.map(item => this.transformSingleMedia(item, targetSystem));
    }
    
    return this.transformSingleMedia(value, targetSystem);
  }

  /**
   * Transform a single media item
   */
  transformSingleMedia(value, targetSystem) {
    // Handle Statamic asset references
    if (typeof value === 'string' && value.startsWith('asset::')) {
      const assetId = value.replace('asset::', '');
      
      if (targetSystem === 'medusa') {
        return { url: `imports/assets/${assetId}` };
      } else {
        // For Strapi
        return {
          name: assetId.split('/').pop(),
          alternativeText: '',
          url: `imports/assets/${assetId}`
        };
      }
    }
    
    // Handle Statamic asset objects
    if (value && value.path) {
      const filename = value.path.split('/').pop();
      
      if (targetSystem === 'medusa') {
        return { url: `imports/assets/${value.path}` };
      } else {
        // For Strapi
        return {
          name: filename,
          alternativeText: value.alt || '',
          url: `imports/assets/${value.path}`
        };
      }
    }
    
    return value;
  }

  /**
   * Transform relationship references from Statamic to the target system
   */
  transformRelationship(value, options = {}) {
    if (!value) return null;
    
    if (Array.isArray(value)) {
      return value.map(id => id.replace(/^entry::/, ''));
    }
    
    if (typeof value === 'string') {
      return value.replace(/^entry::/, '');
    }
    
    return value;
  }

  /**
   * Transform arrays of data from Statamic to the target system
   */
  transformArray(value) {
    if (!value) return [];
    if (!Array.isArray(value)) return [value];
    return value;
  }

  /**
   * Transform JSON data from Statamic to the target system
   */
  transformJson(value) {
    if (!value) return {};
    
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return { value };
      }
    }
    
    if (typeof value === 'object') {
      return value;
    }
    
    return { value };
  }

  /**
   * Transform product variants
   * @param {Array|Object} variants - Product variants data
   * @param {Object} product - Parent product for reference
   * @param {string} region - Region code for region-specific variants
   * @returns {Array} Transformed variants
   */
  transformVariants(variants, product, region = 'nl') {
    // If no variants defined, create a default variant
    if (!variants || (Array.isArray(variants) && variants.length === 0)) {
      console.log(`Creating default variant for product ${product.title || product.id || 'unknown'}`);
      
      // Create default variant with product title as variant title
      return [{
        title: product.title || 'Default Variant',
        sku: `${product.handle || 'default'}-${region}`,
        barcode: null,
        inventory_quantity: 0,
        allow_backorder: false,
        manage_inventory: true,
        prices: [
          {
            amount: (product.price ? this.transformPrice(product.price.amount) : 0),
            currency_code: region === 'nl' || region === 'be' ? 'eur' : (region === 'us' ? 'usd' : 'eur')
          }
        ],
        options: [],
        metadata: {
          is_default_variant: true,
          created_from: 'default_variant_generator',
          region: region
        }
      }];
    }
    
    // Ensure variants is an array
    const variantsArray = Array.isArray(variants) ? variants : [variants];
    
    // Transform each variant
    return variantsArray.map(variant => {
      const transformed = {
        title: variant.title || 'Unnamed Variant',
        sku: variant.sku || `${product.handle || 'variant'}-${Math.floor(Math.random() * 10000)}`,
        barcode: variant.barcode || null,
        inventory_quantity: typeof variant.inventory_quantity === 'number' ? variant.inventory_quantity : 0,
        allow_backorder: Boolean(variant.allow_backorder),
        manage_inventory: variant.manage_inventory !== false,
        prices: []
      };
      
      // Set prices with proper currency format
      if (variant.prices && Array.isArray(variant.prices) && variant.prices.length > 0) {
        transformed.prices = variant.prices.map(price => ({
          amount: this.transformPrice(price.amount),
          currency_code: price.currency_code ? price.currency_code.toLowerCase() : 
                       (region === 'nl' || region === 'be' ? 'eur' : 
                       (region === 'us' ? 'usd' : 'eur')),
          region_id: price.region_id || null
        }));
      } else if (variant.price || product.price) {
        // Use variant price or fall back to product price
        const priceAmount = variant.price ? variant.price.amount : 
                          (product.price ? product.price.amount : 0);
        
        transformed.prices = [{
          amount: this.transformPrice(priceAmount),
          currency_code: region === 'nl' || region === 'be' ? 'eur' : 
                       (region === 'us' ? 'usd' : 'eur')
        }];
      } else {
        // Default price if none provided
        transformed.prices = [{
          amount: 0,
          currency_code: region === 'nl' || region === 'be' ? 'eur' : 
                       (region === 'us' ? 'usd' : 'eur')
        }];
        
        console.log(`Warning: No price found for variant in product ${product.title || product.id || 'unknown'}, using 0 as default`);
      }
      
      // Transform options if present
      if (variant.options && Array.isArray(variant.options)) {
        transformed.options = this.transformOptions(variant.options);
      }
      
      // Add metadata
      transformed.metadata = {
        ...variant.metadata,
        original_id: variant.id || null,
        region: region
      };
      
      return transformed;
    });
  }

  /**
   * Transform price values for Medusa
   * (Medusa requires prices in cents)
   * @param {number|string} price - Original price
   * @returns {number} Transformed price
   */
  transformPrice(price) {
    // If price is already provided in cents, return as is
    if (typeof price === 'number' && price >= 100) {
      return price;
    }
    
    // If price is a string, convert to number first
    if (typeof price === 'string') {
      price = parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.'));
    }
    
    // If we can't parse the price or it's not a number, use 0
    if (isNaN(price) || typeof price !== 'number') {
      console.log(`Warning: Invalid price value "${price}", using 0 as default`);
      return 0;
    }
    
    // Check if price looks like it's already in cents (integer > 100)
    // or in main currency unit (has decimal places or small number)
    if (Number.isInteger(price) && price > 100) {
      // Likely already in cents
      return price;
    } else {
      // Convert to cents by multiplying by 100
      return Math.round(price * 100);
    }
  }

  /**
   * Transform product options from Statamic to Medusa
   */
  transformOptions(value) {
    if (!value || !Array.isArray(value) || value.length === 0) {
      return [];
    }
    
    return value.map(option => {
      return {
        title: option.name || 'Option',
        values: option.values || []
      };
    });
  }

  /**
   * Transform status fields from Statamic to the target system
   */
  transformStatus(value) {
    if (!value) return 'draft';
    
    // Map Statamic published status to Medusa draft/published
    if (value === 'published') return 'published';
    if (value === 'draft') return 'draft';
    
    return value;
  }

  /**
   * Transform name fields from a single field to first/last
   */
  transformName(value, options = {}) {
    if (!value) return '';
    
    const { part } = options;
    
    if (part === 'first') {
      return value.split(' ')[0] || '';
    }
    
    if (part === 'last') {
      const parts = value.split(' ');
      return parts.length > 1 ? parts.slice(1).join(' ') : '';
    }
    
    return value;
  }

  /**
   * Transform country codes to uppercase for Medusa compatibility
   */
  transformCountries(value) {
    if (!value) return [];
    
    // Convert single code to array
    if (!Array.isArray(value)) {
      value = [value];
    }
    
    // Map region codes to country codes
    const regionToCountry = {
      'nl': ['NL'],
      'be': ['BE'],
      'de': ['DE']
    };
    
    if (regionToCountry[value[0]]) {
      return regionToCountry[value[0]];
    }
    
    // Just uppercase the code if it's not a known region
    return value.map(code => code.toUpperCase());
  }

  /**
   * Format currency for Medusa
   */
  currency_format(value, options = {}) {
    const { region } = options;
    const regionInfo = this.getRegionInfo(region || 'nl');
    const currency = regionInfo ? regionInfo.currency.toLowerCase() : 'eur';
    
    // Medusa requires prices in cents (smallest currency unit)
    return [{ 
      amount: parseInt(parseFloat(value) * 100), 
      currency_code: currency 
    }];
  }
}

module.exports = FieldTransformer; 