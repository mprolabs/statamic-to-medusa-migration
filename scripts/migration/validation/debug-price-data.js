#!/usr/bin/env node

/**
 * Debug Price Data
 * 
 * This script helps identify and fix pricing format issues in migration data
 * before importing to Medusa.js. It's particularly useful for finding
 * incorrect price formats that might cause validation or import errors.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 [options]')
  .option('input', {
    alias: 'i',
    describe: 'Path to migration data file or directory',
    type: 'string',
    demandOption: true
  })
  .option('output', {
    alias: 'o',
    describe: 'Path to write fixed data (if not specified, will only analyze)',
    type: 'string'
  })
  .option('fix', {
    alias: 'f',
    describe: 'Automatically fix pricing issues',
    type: 'boolean',
    default: false
  })
  .help()
  .argv;

/**
 * Inspect product prices and variants for issues
 */
function inspectPriceData(data) {
  console.log(chalk.blue('\n🔍 Inspecting price data...'));
  
  const issues = {
    stringPrices: [],
    nonIntegerPrices: [],
    missingPrices: [],
    incorrectCurrency: [],
    missingVariants: []
  };
  
  let productsCount = 0;
  let variantsCount = 0;
  let pricesCount = 0;
  
  // Process each product
  data.forEach((product, index) => {
    productsCount++;
    const productId = product.id || product.handle || `product-${index}`;
    
    // Check if variants exist
    if (!product.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
      issues.missingVariants.push({
        productId,
        title: product.title || 'Unknown Product'
      });
      return;
    }
    
    // Check each variant
    product.variants.forEach((variant, vIndex) => {
      variantsCount++;
      const variantId = variant.id || `${productId}-variant-${vIndex}`;
      
      // Check if prices exist
      if (!variant.prices || !Array.isArray(variant.prices) || variant.prices.length === 0) {
        issues.missingPrices.push({
          productId,
          variantId,
          title: product.title,
          variantTitle: variant.title || 'Unknown Variant'
        });
        return;
      }
      
      // Check each price
      variant.prices.forEach((price, pIndex) => {
        pricesCount++;
        
        // Check price amount
        if (price.amount === undefined || price.amount === null) {
          issues.missingPrices.push({
            productId,
            variantId,
            priceIndex: pIndex,
            title: product.title,
            variantTitle: variant.title || 'Unknown Variant'
          });
        } else if (typeof price.amount === 'string') {
          issues.stringPrices.push({
            productId,
            variantId,
            priceIndex: pIndex,
            value: price.amount,
            title: product.title,
            variantTitle: variant.title || 'Unknown Variant'
          });
        } else if (typeof price.amount === 'number' && !Number.isInteger(price.amount)) {
          issues.nonIntegerPrices.push({
            productId,
            variantId,
            priceIndex: pIndex,
            value: price.amount,
            title: product.title,
            variantTitle: variant.title || 'Unknown Variant'
          });
        }
        
        // Check currency code
        if (!price.currency_code) {
          issues.incorrectCurrency.push({
            productId,
            variantId,
            priceIndex: pIndex,
            value: 'missing',
            title: product.title,
            variantTitle: variant.title || 'Unknown Variant'
          });
        } else if (typeof price.currency_code !== 'string') {
          issues.incorrectCurrency.push({
            productId,
            variantId,
            priceIndex: pIndex,
            value: price.currency_code,
            title: product.title,
            variantTitle: variant.title || 'Unknown Variant'
          });
        } else if (!['eur', 'usd'].includes(price.currency_code.toLowerCase())) {
          issues.incorrectCurrency.push({
            productId,
            variantId,
            priceIndex: pIndex,
            value: price.currency_code,
            title: product.title,
            variantTitle: variant.title || 'Unknown Variant'
          });
        }
      });
    });
  });
  
  return {
    issues,
    counts: {
      products: productsCount,
      variants: variantsCount,
      prices: pricesCount
    }
  };
}

/**
 * Fix pricing issues in data
 */
function fixPricingIssues(data) {
  console.log(chalk.blue('\n🔧 Fixing pricing issues...'));
  
  let fixedCount = {
    stringPrices: 0,
    nonIntegerPrices: 0,
    missingPrices: 0,
    incorrectCurrency: 0,
    addedVariants: 0
  };
  
  // Process each product
  data.forEach((product, index) => {
    const productId = product.id || product.handle || `product-${index}`;
    
    // Fix missing variants
    if (!product.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
      // Create a default variant
      product.variants = [{
        title: product.title || 'Default Variant',
        sku: `${product.handle || 'default'}-${Date.now()}`,
        inventory_quantity: 0,
        allow_backorder: false,
        manage_inventory: true,
        prices: [{
          amount: product.price ? (typeof product.price === 'object' ? product.price.amount : product.price) : 0,
          currency_code: 'eur'
        }],
        metadata: {
          generated: true,
          original_product_id: productId
        }
      }];
      
      fixedCount.addedVariants++;
      console.log(chalk.green(`✓ Added default variant for product: ${product.title || productId}`));
    }
    
    // Fix variants
    product.variants.forEach((variant, vIndex) => {
      // Fix missing prices
      if (!variant.prices || !Array.isArray(variant.prices) || variant.prices.length === 0) {
        variant.prices = [{
          amount: 0,
          currency_code: 'eur'
        }];
        
        fixedCount.missingPrices++;
        console.log(chalk.green(`✓ Added default price for variant: ${variant.title || `variant-${vIndex}`} in product: ${product.title || productId}`));
      }
      
      // Fix price issues
      variant.prices.forEach((price, pIndex) => {
        // Fix missing amount
        if (price.amount === undefined || price.amount === null) {
          price.amount = 0;
          fixedCount.missingPrices++;
          console.log(chalk.green(`✓ Set default price (0) for variant: ${variant.title || `variant-${vIndex}`} in product: ${product.title || productId}`));
        }
        
        // Fix string prices
        if (typeof price.amount === 'string') {
          try {
            // Try to parse string to number
            const parsed = parseFloat(price.amount.replace(/[^\d.,]/g, '').replace(',', '.'));
            
            if (!isNaN(parsed)) {
              price.amount = Math.round(parsed * 100); // Convert to cents
              fixedCount.stringPrices++;
              console.log(chalk.green(`✓ Converted string price "${price.amount}" to ${price.amount} cents for ${product.title || productId}`));
            } else {
              price.amount = 0;
              fixedCount.stringPrices++;
              console.log(chalk.yellow(`⚠ Could not parse price "${price.amount}", setting to 0 for ${product.title || productId}`));
            }
          } catch (e) {
            price.amount = 0;
            fixedCount.stringPrices++;
            console.log(chalk.yellow(`⚠ Error parsing price "${price.amount}", setting to 0 for ${product.title || productId}`));
          }
        }
        
        // Fix non-integer prices
        if (typeof price.amount === 'number' && !Number.isInteger(price.amount)) {
          const original = price.amount;
          price.amount = Math.round(price.amount * 100); // Convert to cents
          fixedCount.nonIntegerPrices++;
          console.log(chalk.green(`✓ Converted decimal price ${original} to ${price.amount} cents for ${product.title || productId}`));
        }
        
        // Fix currency issues
        if (!price.currency_code) {
          price.currency_code = 'eur';
          fixedCount.incorrectCurrency++;
          console.log(chalk.green(`✓ Set default currency (EUR) for ${product.title || productId}`));
        } else if (typeof price.currency_code === 'string') {
          const original = price.currency_code;
          price.currency_code = price.currency_code.toLowerCase();
          
          if (!['eur', 'usd'].includes(price.currency_code)) {
            price.currency_code = 'eur';
            fixedCount.incorrectCurrency++;
            console.log(chalk.green(`✓ Fixed invalid currency "${original}" to EUR for ${product.title || productId}`));
          }
        } else {
          price.currency_code = 'eur';
          fixedCount.incorrectCurrency++;
          console.log(chalk.green(`✓ Fixed non-string currency to EUR for ${product.title || productId}`));
        }
      });
    });
  });
  
  return {
    fixedData: data,
    fixedCount
  };
}

/**
 * Print issue summary
 */
function printIssueSummary(analysis) {
  console.log(chalk.blue('\n📊 Price Data Analysis Summary'));
  console.log(chalk.blue('==============================\n'));
  
  const { issues, counts } = analysis;
  
  console.log(`Total products: ${chalk.bold(counts.products)}`);
  console.log(`Total variants: ${chalk.bold(counts.variants)}`);
  console.log(`Total prices: ${chalk.bold(counts.prices)}\n`);
  
  console.log(chalk.yellow(`Issues found:`));
  console.log(`- Products without variants: ${chalk.bold(issues.missingVariants.length)}`);
  console.log(`- Variants without prices: ${chalk.bold(issues.missingPrices.length)}`);
  console.log(`- String price values: ${chalk.bold(issues.stringPrices.length)}`);
  console.log(`- Non-integer price values: ${chalk.bold(issues.nonIntegerPrices.length)}`);
  console.log(`- Incorrect currency codes: ${chalk.bold(issues.incorrectCurrency.length)}\n`);
  
  // Print detailed issues if there are not too many
  if (issues.stringPrices.length > 0 && issues.stringPrices.length <= 10) {
    console.log(chalk.yellow(`\nString price examples:`));
    issues.stringPrices.slice(0, 5).forEach(issue => {
      console.log(`- Product: ${issue.title}, Variant: ${issue.variantTitle}, Value: "${issue.value}"`);
    });
  }
  
  if (issues.nonIntegerPrices.length > 0 && issues.nonIntegerPrices.length <= 10) {
    console.log(chalk.yellow(`\nNon-integer price examples:`));
    issues.nonIntegerPrices.slice(0, 5).forEach(issue => {
      console.log(`- Product: ${issue.title}, Variant: ${issue.variantTitle}, Value: ${issue.value}`);
    });
  }
  
  if (issues.incorrectCurrency.length > 0 && issues.incorrectCurrency.length <= 10) {
    console.log(chalk.yellow(`\nIncorrect currency examples:`));
    issues.incorrectCurrency.slice(0, 5).forEach(issue => {
      console.log(`- Product: ${issue.title}, Variant: ${issue.variantTitle}, Value: ${issue.value}`);
    });
  }
  
  // Suggest fix command if not already fixing
  if (!argv.fix && (
    issues.missingVariants.length > 0 ||
    issues.missingPrices.length > 0 ||
    issues.stringPrices.length > 0 ||
    issues.nonIntegerPrices.length > 0 ||
    issues.incorrectCurrency.length > 0
  )) {
    console.log(chalk.blue('\n💡 To automatically fix these issues, run:'));
    console.log(`  node ${process.argv[1]} --input ${argv.input} --output [output-file] --fix`);
  }
}

/**
 * Print fix summary
 */
function printFixSummary(fixResult) {
  console.log(chalk.blue('\n📊 Fix Summary'));
  console.log(chalk.blue('==============\n'));
  
  const { fixedCount } = fixResult;
  
  console.log(`- Added variants: ${chalk.bold(fixedCount.addedVariants)}`);
  console.log(`- Fixed missing prices: ${chalk.bold(fixedCount.missingPrices)}`);
  console.log(`- Converted string prices: ${chalk.bold(fixedCount.stringPrices)}`);
  console.log(`- Converted non-integer prices: ${chalk.bold(fixedCount.nonIntegerPrices)}`);
  console.log(`- Fixed currency issues: ${chalk.bold(fixedCount.incorrectCurrency)}\n`);
  
  const totalFixes = Object.values(fixedCount).reduce((sum, current) => sum + current, 0);
  console.log(`Total fixes applied: ${chalk.bold(totalFixes)}`);
}

/**
 * Main function
 */
async function main() {
  console.log(chalk.blue.bold('\n🔎 Price Data Analyzer'));
  console.log(chalk.blue('====================\n'));
  
  try {
    // Determine if input is a file or directory
    const inputPath = path.resolve(argv.input);
    let data;
    
    const stats = fs.statSync(inputPath);
    
    if (stats.isDirectory()) {
      console.log(chalk.yellow(`📁 Processing directory: ${inputPath}`));
      const files = fs.readdirSync(inputPath)
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(inputPath, file));
      
      if (files.length === 0) {
        console.error(chalk.red('❌ No JSON files found in directory.'));
        process.exit(1);
      }
      
      console.log(chalk.yellow(`Found ${files.length} JSON files to process.`));
      
      // Process just the first file for now
      // For a complete solution, we would process all files
      const firstFile = files[0];
      console.log(chalk.yellow(`Processing file: ${path.basename(firstFile)}`));
      
      // Read the first file
      const fileData = JSON.parse(fs.readFileSync(firstFile, 'utf8'));
      
      // Ensure we have an array of products
      data = Array.isArray(fileData) ? fileData : [fileData];
    } else {
      // Input is a single file
      console.log(chalk.yellow(`📄 Processing file: ${inputPath}`));
      const fileData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
      
      // Ensure we have an array of products
      data = Array.isArray(fileData) ? fileData : [fileData];
    }
    
    // Analyze data for pricing issues
    const analysis = inspectPriceData(data);
    printIssueSummary(analysis);
    
    // Fix issues if requested
    if (argv.fix) {
      const fixResult = fixPricingIssues(data);
      printFixSummary(fixResult);
      
      // Write fixed data if output path is provided
      if (argv.output) {
        const outputPath = path.resolve(argv.output);
        fs.writeFileSync(outputPath, JSON.stringify(fixResult.fixedData, null, 2));
        console.log(chalk.green(`\n✅ Fixed data written to: ${outputPath}`));
      } else {
        console.log(chalk.yellow('\n⚠ No output path specified. Fixed data was not saved.'));
        console.log(chalk.yellow('To save the fixed data, run with --output [path] option.'));
      }
    }
    
    console.log(chalk.green('\n✅ Analysis completed!'));
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}`));
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error(chalk.red(`\n❌ Unhandled error: ${error.message}`));
  console.error(error.stack);
  process.exit(1);
}); 