#!/usr/bin/env node

/**
 * Migration Data Validator Script
 * Validates transformed data before importing to Medusa.js and Strapi
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const MigrationValidator = require('./validator');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 [options]')
  .option('input', {
    alias: 'i',
    describe: 'Path to transformed data file or directory',
    type: 'string',
    demandOption: true
  })
  .option('entity-type', {
    alias: 'e',
    describe: 'Entity type to validate (product, category, etc.)',
    type: 'string',
    demandOption: true
  })
  .option('rules', {
    alias: 'r',
    describe: 'Path to validation rules file',
    type: 'string'
  })
  .option('output', {
    alias: 'o',
    describe: 'Directory to store validation report',
    type: 'string',
    default: './output/validation-reports'
  })
  .option('strict', {
    alias: 's',
    describe: 'Enable strict validation mode',
    type: 'boolean',
    default: false
  })
  .option('language', {
    alias: 'l',
    describe: 'Language to validate (e.g., nl, en, de)',
    type: 'string'
  })
  .option('region', {
    describe: 'Region to validate (e.g., netherlands, belgium, germany)',
    type: 'string'
  })
  .help()
  .argv;

/**
 * Main function to run validation
 */
async function runValidation() {
  console.log(chalk.blue.bold('\n📊 Migration Data Validator'));
  console.log(chalk.blue('==============================\n'));

  // Initialize validator
  const validator = new MigrationValidator({
    strict: argv.strict,
    language: argv.language,
    region: argv.region
  });

  // Load validation rules
  const rulesLoaded = validator.loadRules(argv.rules);
  if (!rulesLoaded) {
    console.error(chalk.red('🛑 Failed to load validation rules. Exiting.'));
    process.exit(1);
  }

  // Process input path
  let inputPath = path.resolve(argv.input);
  let data;

  try {
    // Check if input is a file or directory
    const stats = fs.statSync(inputPath);
    
    if (stats.isDirectory()) {
      // Find all JSON files in directory
      console.log(chalk.yellow(`📁 Processing directory: ${inputPath}`));
      const files = fs.readdirSync(inputPath)
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(inputPath, file));
      
      if (files.length === 0) {
        console.error(chalk.red('❌ No JSON files found in directory.'));
        process.exit(1);
      }
      
      console.log(chalk.green(`📄 Found ${files.length} JSON files to validate.`));
      
      // Process each file
      for (const file of files) {
        console.log(chalk.yellow(`\n🔍 Validating file: ${path.basename(file)}`));
        const fileData = JSON.parse(fs.readFileSync(file, 'utf8'));
        await validateAndReport(validator, fileData, argv.entityType, file);
      }
      
      return;
    } else {
      // Input is a single file
      console.log(chalk.yellow(`📄 Processing file: ${inputPath}`));
      data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    }
  } catch (error) {
    console.error(chalk.red(`❌ Error reading input: ${error.message}`));
    process.exit(1);
  }

  // Validate the data
  await validateAndReport(validator, data, argv.entityType, inputPath);
}

/**
 * Validate data and generate report
 * @param {MigrationValidator} validator - Validator instance
 * @param {Array|Object} data - Data to validate
 * @param {string} entityType - Entity type
 * @param {string} sourcePath - Source file path
 */
async function validateAndReport(validator, data, entityType, sourcePath) {
  console.log(chalk.blue(`\n🔍 Validating ${entityType} data...`));
  
  // Check if data is an array or object
  let dataArray = Array.isArray(data) ? data : [data];
  console.log(chalk.blue(`📋 Found ${dataArray.length} ${entityType} entities to validate.`));
  
  // Run validation
  const results = validator.validate(data, entityType);
  
  // Print summary
  console.log(chalk.blue('\n📊 Validation Summary:'));
  console.log(`Total entities: ${chalk.bold(results.totalCount)}`);
  console.log(`Valid entities: ${chalk.bold.green(results.validCount)}`);
  console.log(`Invalid entities: ${chalk.bold.red(results.totalCount - results.validCount)}`);
  console.log(`Errors: ${chalk.bold.red(results.errors.length)}`);
  console.log(`Warnings: ${chalk.bold.yellow(results.warnings.length)}`);
  
  // Generate report filename
  const sourceFilename = path.basename(sourcePath, '.json');
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const outputDir = path.resolve(argv.output);
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const reportFilename = `${sourceFilename}_${entityType}_validation_${timestamp}.json`;
  const reportPath = path.join(outputDir, reportFilename);
  
  // Write report
  const reportWritten = validator.writeReport(results, entityType, reportPath);
  
  if (reportWritten) {
    console.log(chalk.green(`\n✅ Validation report written to: ${reportPath}`));
    console.log(chalk.green(`✅ Text report written to: ${reportPath.replace(/\.json$/, '.txt')}`));
  } else {
    console.error(chalk.red(`\n❌ Failed to write validation report.`));
  }
  
  // Exit with error code if validation failed and in strict mode
  if (!results.success && argv.strict) {
    console.error(chalk.red('\n❌ Validation failed in strict mode. Exiting with error.'));
    process.exit(1);
  }
  
  return results.success;
}

// Run the validation
runValidation().catch(error => {
  console.error(chalk.red(`\n❌ Unhandled error: ${error.message}`));
  console.error(error.stack);
  process.exit(1); 
}); 