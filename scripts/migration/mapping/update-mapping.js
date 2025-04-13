#!/usr/bin/env node

/**
 * Update Mapping Utility
 * 
 * This script helps to update the field mapping document and JSON with new fields
 * or changes to existing mappings. It preserves existing mapping rules while
 * allowing for additions and modifications.
 * 
 * Usage:
 * 1. Run with: node update-mapping.js --entity=<entity> --from=<source> --to=<destination> --field=<name> --type=<type>
 * 2. Example: node update-mapping.js --entity=product --from=statamic_to_medusa --field=custom_attribute --destination=metadata.custom_attribute --transformation=direct
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');

// Configuration
const MAPPING_DIR = path.join(__dirname, '.');
const MAPPING_JSON = path.join(MAPPING_DIR, 'field-mapping.json');
const MAPPING_MD = path.join(MAPPING_DIR, 'mapping-document.md');
const BACKUP_DIR = path.join(MAPPING_DIR, 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Helper function to log with timestamp
function log(message) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${timestamp}] ${message}`);
}

/**
 * Load mapping data from file
 */
function loadMappingData() {
  if (!fs.existsSync(MAPPING_JSON)) {
    log('Mapping file not found. Run field-mapping.js first.');
    return null;
  }
  
  try {
    const data = fs.readFileSync(MAPPING_JSON, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading mapping file:', error);
    return null;
  }
}

/**
 * Load mapping document
 */
function loadMappingDocument() {
  if (!fs.existsSync(MAPPING_MD)) {
    log('Mapping document not found. Run field-mapping.js first.');
    return null;
  }
  
  try {
    return fs.readFileSync(MAPPING_MD, 'utf8');
  } catch (error) {
    console.error('Error loading mapping document:', error);
    return null;
  }
}

/**
 * Create backup of mapping files
 */
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  try {
    if (fs.existsSync(MAPPING_JSON)) {
      const backupJson = path.join(BACKUP_DIR, `field-mapping-${timestamp}.json`);
      fs.copyFileSync(MAPPING_JSON, backupJson);
    }
    
    if (fs.existsSync(MAPPING_MD)) {
      const backupMd = path.join(BACKUP_DIR, `mapping-document-${timestamp}.md`);
      fs.copyFileSync(MAPPING_MD, backupMd);
    }
    
    log('Created backups of mapping files');
    return true;
  } catch (error) {
    console.error('Error creating backups:', error);
    return false;
  }
}

/**
 * Update the JSON mapping
 */
function updateJsonMapping(entity, type, field, destination, transformation, notes) {
  log(`Updating JSON mapping for ${entity}.${type}.${field}...`);
  
  // Load current mapping
  const mapping = loadMappingData();
  if (!mapping) {
    return false;
  }
  
  // Check if entity exists
  if (!mapping[entity]) {
    mapping[entity] = {};
  }
  
  // Check if type exists for entity
  if (!mapping[entity][type]) {
    mapping[entity][type] = {};
  }
  
  // Update or add field mapping
  mapping[entity][type][field] = {
    destination: destination,
    transformation: transformation
  };
  
  // Write updated mapping back to file
  try {
    fs.writeFileSync(MAPPING_JSON, JSON.stringify(mapping, null, 2));
    log(`Updated JSON mapping for ${entity}.${type}.${field}`);
    return true;
  } catch (error) {
    console.error('Error writing JSON mapping:', error);
    return false;
  }
}

/**
 * Update the markdown mapping document
 */
function updateMarkdownMapping(entity, type, field, destination, transformation, notes) {
  log(`Updating markdown mapping for ${entity}.${type}.${field}...`);
  
  // Load current document
  const document = loadMappingDocument();
  if (!document) {
    return false;
  }
  
  // Find the right section to update
  const entityCapitalized = entity.charAt(0).toUpperCase() + entity.slice(1);
  const sectionHeader = `## ${entityCapitalized} Mapping`;
  
  // Different type headers
  const typeHeaders = {
    'statamic_to_medusa': `### Statamic ${entityCapitalized} → Medusa.js ${entityCapitalized}`,
    'statamic_to_strapi': `### Statamic ${entityCapitalized} → Strapi ${entityCapitalized}`,
    'multi_language': `### Multi-Language ${entityCapitalized} Fields`,
    'multi_region': `### Region-Specific ${entityCapitalized} Data`
  };
  
  const typeHeader = typeHeaders[type] || `### ${type}`;
  
  // Find entity section
  const entitySectionMatch = document.match(new RegExp(`${sectionHeader}[\\s\\S]*?(?=^## |$)`, 'm'));
  if (!entitySectionMatch) {
    log(`Entity section not found: ${sectionHeader}`);
    return false;
  }
  
  const entitySection = entitySectionMatch[0];
  
  // Find type section within entity section
  const typeSectionMatch = entitySection.match(new RegExp(`${typeHeader}[\\s\\S]*?(?=^### |$)`, 'm'));
  if (!typeSectionMatch) {
    log(`Type section not found: ${typeHeader}`);
    return false;
  }
  
  const typeSection = typeSectionMatch[0];
  
  // Check if table exists in type section
  if (!typeSection.includes('| Statamic Field |')) {
    log('Table not found in type section');
    return false;
  }
  
  // Build new table row
  let newRow;
  if (type === 'multi_language') {
    newRow = `| ${field} | .nl.md/.de.md | ${destination.split('.')[0]} | ${destination} | ${transformation} | ${notes || ''} |`;
  } else if (type === 'multi_region') {
    newRow = `| ${field} | region_nl/region_be/region_de | ${destination.split('.')[0]} | ${destination} | ${transformation} | ${notes || ''} |`;
  } else {
    newRow = `| ${field} | ${destination.split('.')[0]} | ${destination} | ${transformation} | ${notes || ''} |`;
  }
  
  // Check if field already exists in the table
  const fieldRegex = new RegExp(`^\\|\\s*${field}\\s*\\|`, 'm');
  if (typeSection.match(fieldRegex)) {
    // Replace existing row
    const updatedTypeSection = typeSection.replace(
      new RegExp(`^\\|\\s*${field}\\s*\\|.*$`, 'm'),
      newRow
    );
    
    // Replace type section in entity section
    const updatedEntitySection = entitySection.replace(typeSection, updatedTypeSection);
    
    // Replace entity section in document
    const updatedDocument = document.replace(entitySection, updatedEntitySection);
    
    // Write updated document
    fs.writeFileSync(MAPPING_MD, updatedDocument);
    log(`Updated existing field mapping for ${field}`);
  } else {
    // Find the table end
    const tableEndMatch = typeSection.match(/\|[^\n]*\|\s*\n\s*\n/);
    if (!tableEndMatch) {
      log('Table end not found');
      return false;
    }
    
    const tableEnd = tableEndMatch[0];
    
    // Insert new row before table end
    const updatedTypeSection = typeSection.replace(
      tableEnd,
      `| ${field} | ${destination.split('.')[0]} | ${destination} | ${transformation} | ${notes || ''} |\n\n`
    );
    
    // Replace type section in entity section
    const updatedEntitySection = entitySection.replace(typeSection, updatedTypeSection);
    
    // Replace entity section in document
    const updatedDocument = document.replace(entitySection, updatedEntitySection);
    
    // Write updated document
    fs.writeFileSync(MAPPING_MD, updatedDocument);
    log(`Added new field mapping for ${field}`);
  }
  
  return true;
}

/**
 * Command line interface setup
 */
program
  .version('1.0.0')
  .description('Update field mapping document and JSON')
  .requiredOption('--entity <entity>', 'Entity type (e.g., product, category)')
  .requiredOption('--type <type>', 'Mapping type (e.g., statamic_to_medusa, multi_language)')
  .requiredOption('--field <field>', 'Field name to map')
  .requiredOption('--destination <destination>', 'Destination field')
  .requiredOption('--transformation <transformation>', 'Transformation type (e.g., direct, multiply_by_100)')
  .option('--notes <notes>', 'Additional notes about the mapping')
  .parse(process.argv);

const options = program.opts();

/**
 * Main execution function
 */
async function main() {
  log('Starting mapping update...');
  
  // Create backups before making changes
  createBackup();
  
  // Update JSON mapping
  const jsonUpdated = updateJsonMapping(
    options.entity,
    options.type,
    options.field,
    options.destination,
    options.transformation,
    options.notes
  );
  
  // Update markdown mapping document
  const markdownUpdated = updateMarkdownMapping(
    options.entity,
    options.type,
    options.field,
    options.destination,
    options.transformation,
    options.notes
  );
  
  if (jsonUpdated && markdownUpdated) {
    log(`Successfully updated mapping for ${options.entity}.${options.type}.${options.field}`);
  } else {
    log('Update completed with some issues');
  }
}

// Run the main function
main(); 