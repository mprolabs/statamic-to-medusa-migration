#!/usr/bin/env node

/**
 * Validation script for field mapping consistency
 * 
 * This script validates the field mapping for the migration project.
 * It checks:
 * - Required fields are present in mappings
 * - Transformations are valid and consistent
 * - Multi-language mappings cover all required languages
 * - Region-specific mappings cover all regions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure paths
const MAPPING_DIR = path.join(__dirname);
const FIELD_MAPPING_FILE = path.join(MAPPING_DIR, 'field-mapping.json');
const VALIDATION_RULES_FILE = path.join(MAPPING_DIR, 'validation-rules.json');
const OUTPUT_FILE = path.join(MAPPING_DIR, 'validation-report.md');

// Helper function to log with timestamp
function log(message) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${timestamp}] ${message}`);
}

/**
 * Load the field mapping and validation rules
 */
function loadFiles() {
  log('Loading mapping and validation files...');
  
  // Load field mapping
  const fieldMapping = JSON.parse(fs.readFileSync(FIELD_MAPPING_FILE, 'utf8'));
  
  // Load validation rules
  const validationRules = JSON.parse(fs.readFileSync(VALIDATION_RULES_FILE, 'utf8'));
  
  return { fieldMapping, validationRules };
}

/**
 * Validate field mapping against validation rules
 */
function validateMapping(fieldMapping, validationRules) {
  log('Validating field mapping against rules...');
  
  const report = {
    title: 'Field Mapping Validation Report',
    timestamp: new Date().toISOString(),
    summary: {
      total_entities: 0,
      valid_entities: 0,
      entities_with_issues: 0,
      total_issues: 0
    },
    entity_reports: {}
  };
  
  // For each entity type in validation rules
  Object.keys(validationRules.entities).forEach(entityType => {
    const entityRules = validationRules.entities[entityType];
    const entityMapping = fieldMapping.entities[entityType];
    
    report.summary.total_entities++;
    
    if (!entityMapping) {
      report.entity_reports[entityType] = {
        status: 'missing',
        issues: [`Entity type '${entityType}' is missing from the field mapping`]
      };
      report.summary.entities_with_issues++;
      report.summary.total_issues++;
      return;
    }
    
    const entityReport = {
      status: 'valid',
      issues: []
    };
    
    // Check required fields
    if (entityRules.required_fields) {
      entityRules.required_fields.forEach(field => {
        let fieldFound = false;
        
        // Check if field exists in Medusa mapping
        if (entityMapping.medusa && entityMapping.medusa[field]) {
          fieldFound = true;
        }
        
        // Check if field exists in Strapi mapping
        if (!fieldFound && entityMapping.strapi && entityMapping.strapi[field]) {
          fieldFound = true;
        }
        
        // If field not found in either system, report issue
        if (!fieldFound) {
          entityReport.issues.push(`Required field '${field}' is missing from mapping`);
          entityReport.status = 'issues';
        }
      });
    }
    
    // Check format validations
    if (entityRules.format_validations) {
      Object.keys(entityRules.format_validations).forEach(field => {
        let fieldMapping = null;
        
        // Check if field exists in Medusa mapping
        if (entityMapping.medusa && entityMapping.medusa[field]) {
          fieldMapping = entityMapping.medusa[field];
        }
        
        // Check if field exists in Strapi mapping
        if (!fieldMapping && entityMapping.strapi && entityMapping.strapi[field]) {
          fieldMapping = entityMapping.strapi[field];
        }
        
        // If field mapping found, check if transformation is appropriate
        if (fieldMapping) {
          // For this validation, we just check if there's any transformation
          if (!fieldMapping.type) {
            entityReport.issues.push(`Field '${field}' requires format validation but has no transformation type`);
            entityReport.status = 'issues';
          }
        }
      });
    }
    
    // Check localization validations
    if (entityRules.localization_validations && entityRules.localization_validations.required_locales) {
      const requiredLocales = entityRules.localization_validations.required_locales;
      
      // Check if there are multi-language mappings
      if (!entityMapping.multi_language || entityMapping.multi_language.length === 0) {
        entityReport.issues.push(`Entity '${entityType}' requires multi-language support but none is defined`);
        entityReport.status = 'issues';
      } else {
        // Check if all required locales are covered
        const coveredLocales = [];
        
        entityMapping.multi_language.forEach(langMapping => {
          if (langMapping.languages) {
            langMapping.languages.forEach(locale => {
              if (!coveredLocales.includes(locale)) {
                coveredLocales.push(locale);
              }
            });
          }
        });
        
        requiredLocales.forEach(locale => {
          if (!coveredLocales.includes(locale)) {
            entityReport.issues.push(`Required locale '${locale}' is not covered in multi-language mappings`);
            entityReport.status = 'issues';
          }
        });
      }
    }
    
    // Check region validations
    if (entityMapping.multi_region) {
      const regionValidations = validationRules.region_validations;
      const definedRegions = Object.keys(regionValidations);
      
      entityMapping.multi_region.forEach(regionMapping => {
        if (!regionMapping.regions || regionMapping.regions.length === 0) {
          entityReport.issues.push(`Multi-region mapping for '${regionMapping.source}' does not define specific regions`);
          entityReport.status = 'issues';
        } else {
          // Check if all required regions are covered
          const coveredRegions = regionMapping.regions.map(r => r.id);
          
          definedRegions.forEach(region => {
            if (!coveredRegions.includes(region)) {
              entityReport.issues.push(`Required region '${region}' is not covered in field '${regionMapping.source}' region mapping`);
              entityReport.status = 'issues';
            }
          });
        }
      });
    }
    
    // Add entity report to overall report
    report.entity_reports[entityType] = entityReport;
    
    // Update summary
    if (entityReport.status === 'valid') {
      report.summary.valid_entities++;
    } else {
      report.summary.entities_with_issues++;
      report.summary.total_issues += entityReport.issues.length;
    }
  });
  
  return report;
}

/**
 * Generate markdown report
 */
function generateReport(report) {
  log('Generating validation report...');
  
  let markdown = `# ${report.title}\n\n`;
  markdown += `Generated: ${report.timestamp}\n\n`;
  
  // Add summary section
  markdown += `## Summary\n\n`;
  markdown += `- Total entity types: ${report.summary.total_entities}\n`;
  markdown += `- Valid entity types: ${report.summary.valid_entities}\n`;
  markdown += `- Entity types with issues: ${report.summary.entities_with_issues}\n`;
  markdown += `- Total issues found: ${report.summary.total_issues}\n\n`;
  
  // Add entity reports
  markdown += `## Entity Validation Details\n\n`;
  
  Object.keys(report.entity_reports).forEach(entityType => {
    const entityReport = report.entity_reports[entityType];
    
    markdown += `### ${entityType}\n\n`;
    markdown += `Status: ${entityReport.status === 'valid' ? '✅ Valid' : '❌ Issues found'}\n\n`;
    
    if (entityReport.issues.length > 0) {
      markdown += `Issues:\n`;
      entityReport.issues.forEach(issue => {
        markdown += `- ${issue}\n`;
      });
      markdown += '\n';
    } else {
      markdown += `No issues found.\n\n`;
    }
  });
  
  // Write report to file
  fs.writeFileSync(OUTPUT_FILE, markdown);
  log(`Validation report generated: ${OUTPUT_FILE}`);
  
  return markdown;
}

/**
 * Main execution function
 */
function main() {
  log('Starting field mapping validation...');
  
  try {
    // Load field mapping and validation rules
    const { fieldMapping, validationRules } = loadFiles();
    
    // Validate field mapping against rules
    const report = validateMapping(fieldMapping, validationRules);
    
    // Generate report
    generateReport(report);
    
    log('Field mapping validation completed.');
    
    // Log summary to console
    console.log('\nValidation Summary:');
    console.log(`- Total entity types: ${report.summary.total_entities}`);
    console.log(`- Valid entity types: ${report.summary.valid_entities}`);
    console.log(`- Entity types with issues: ${report.summary.entities_with_issues}`);
    console.log(`- Total issues found: ${report.summary.total_issues}`);
    
    // Exit with appropriate code
    if (report.summary.total_issues > 0) {
      console.log('\n❌ Validation found issues. Check the report for details.');
      process.exit(1);
    } else {
      console.log('\n✅ Validation successful. No issues found.');
      process.exit(0);
    }
  } catch (error) {
    console.error(`Error during validation: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main(); 