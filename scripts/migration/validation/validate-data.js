#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const validator = require('./validator');

/**
 * Command-line tool to validate data for migration
 * Usage: node validate-data.js [options]
 * Options:
 *   --data <path>       Path to data file or directory (required)
 *   --entity <type>     Entity type to validate (required)
 *   --region <code>     Region code (nl, be, de)
 *   --language <code>   Language code (nl, en, de, fr)
 *   --strict            Use strict validation mode
 *   --rules <path>      Custom validation rules path
 *   --output <path>     Path to save validation report
 */

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  data: null,
  entity: null,
  region: null,
  language: null,
  strict: false,
  rules: null,
  output: null,
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith('--')) {
    const option = arg.substring(2);
    if (option === 'strict') {
      options.strict = true;
    } else if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
      options[option] = args[i + 1];
      i++;
    }
  }
}

// Validate required options
if (!options.data) {
  console.error(chalk.red('Error: --data option is required'));
  showUsage();
  process.exit(1);
}

if (!options.entity) {
  console.error(chalk.red('Error: --entity option is required'));
  showUsage();
  process.exit(1);
}

// Set default output path if not specified
if (!options.output) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  options.output = path.resolve(process.cwd(), `validation-report-${options.entity}-${timestamp}.json`);
}

// Main validation function
async function validateData() {
  console.log(chalk.blue('=== Data Validation Tool ==='));
  console.log(chalk.cyan(`Validating ${options.entity} data from: ${options.data}`));
  
  try {
    // Initialize validator with custom rules if specified
    if (options.rules) {
      validator.loadValidationRules(options.rules);
    }
    
    // Read data file(s)
    let data;
    const dataPath = path.resolve(options.data);
    
    if (!fs.existsSync(dataPath)) {
      throw new Error(`Data path does not exist: ${dataPath}`);
    }
    
    const stats = fs.statSync(dataPath);
    
    if (stats.isDirectory()) {
      // Process directory
      data = await processDirectory(dataPath, options.entity);
    } else {
      // Process single file
      const fileContent = fs.readFileSync(dataPath, 'utf8');
      data = JSON.parse(fileContent);
    }
    
    // Validate data
    console.log(chalk.cyan(`Starting validation with options:`));
    console.log(`  Entity type: ${options.entity}`);
    console.log(`  Region: ${options.region || 'all'}`);
    console.log(`  Language: ${options.language || 'all'}`);
    console.log(`  Strict mode: ${options.strict ? 'yes' : 'no'}`);
    
    const validationOptions = {
      region: options.region,
      language: options.language,
      strictMode: options.strict
    };
    
    // Handle array or single object
    if (Array.isArray(data)) {
      console.log(chalk.cyan(`Found ${data.length} items to validate`));
      
      data.forEach((item, index) => {
        if (index > 0 && index % 10 === 0) {
          process.stdout.write(`Processed ${index} items...\r`);
        }
        validator.validateData(item, options.entity, validationOptions);
      });
      
      console.log(chalk.green(`Validated ${data.length} items`));
    } else {
      console.log(chalk.cyan(`Validating single ${options.entity} object`));
      validator.validateData(data, options.entity, validationOptions);
    }
    
    // Get results
    const results = validator.getResults();
    console.log(chalk.green(`Validation complete! Results:`));
    console.log(`  Entities validated: ${results.validatedEntities}`);
    console.log(`  Total errors: ${results.totalErrors}`);
    console.log(`  Total warnings: ${results.totalWarnings}`);
    
    // Generate report
    const reportPath = validator.generateReport(options.output);
    if (reportPath) {
      console.log(chalk.green(`Report saved to: ${reportPath}`));
    }
    
    // Exit with error code if validation failed
    if (results.totalErrors > 0) {
      console.log(chalk.yellow(`Validation found ${results.totalErrors} errors - see report for details`));
      process.exit(1);
    } else {
      console.log(chalk.green('Validation succeeded!'));
    }
  } catch (error) {
    console.error(chalk.red(`Error during validation: ${error.message}`));
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Process a directory of data files
 * @param {string} dirPath - Path to directory
 * @param {string} entityType - Entity type to filter
 * @returns {Array} - Concatenated data from all files
 */
async function processDirectory(dirPath, entityType) {
  console.log(chalk.cyan(`Processing directory: ${dirPath}`));
  
  const files = fs.readdirSync(dirPath).filter(file => {
    // Only process JSON files that match the entity type
    return file.endsWith('.json') && (
      file.startsWith(entityType) || 
      file.includes(entityType)
    );
  });
  
  if (files.length === 0) {
    console.warn(chalk.yellow(`No matching ${entityType} files found in ${dirPath}`));
    return [];
  }
  
  console.log(chalk.cyan(`Found ${files.length} files to process`));
  
  let allData = [];
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    console.log(`Processing ${file}...`);
    
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      
      if (Array.isArray(data)) {
        allData = allData.concat(data);
      } else {
        allData.push(data);
      }
    } catch (error) {
      console.error(chalk.red(`Error processing ${file}: ${error.message}`));
    }
  }
  
  console.log(chalk.green(`Processed ${files.length} files, found ${allData.length} total items`));
  return allData;
}

/**
 * Show usage information
 */
function showUsage() {
  console.log(`
${chalk.cyan('Data Validation Tool')}

Validates data against defined rules for migration

${chalk.yellow('Usage:')}
  node validate-data.js [options]

${chalk.yellow('Options:')}
  --data <path>       Path to data file or directory (required)
  --entity <type>     Entity type to validate (required)
  --region <code>     Region code (nl, be, de)
  --language <code>   Language code (nl, en, de, fr)
  --strict            Use strict validation mode
  --rules <path>      Custom validation rules path
  --output <path>     Path to save validation report

${chalk.yellow('Examples:')}
  node validate-data.js --data ./data/products.json --entity product
  node validate-data.js --data ./data --entity product --region nl --strict
  `);
}

// Run validation
validateData().catch(error => {
  console.error(chalk.red(`Unhandled error: ${error.message}`));
  console.error(error.stack);
  process.exit(1);
}); 