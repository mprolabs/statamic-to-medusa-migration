#!/usr/bin/env node

/**
 * Script to verify that the Nimara installation is working correctly.
 * Tests the configuration, dependencies, and basic functionality.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk') || { green: text => text, red: text => text, yellow: text => text, blue: text => text };

// Define paths
const ROOT_DIR = process.cwd();
const ENV_FILE = path.join(ROOT_DIR, '.env');
const TYPES_PATH = path.join(ROOT_DIR, 'apps/storefront/src/regions/types.ts');
const CONFIG_PATH = path.join(ROOT_DIR, 'apps/storefront/src/regions/config.ts');
const MESSAGES_DIR = path.join(ROOT_DIR, 'apps/storefront/messages');

// Helper functions
const checkFile = (filePath) => {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
};

const runCommand = (command) => {
  try {
    const output = execSync(command, { encoding: 'utf8' });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Test categories
const testEnvironment = () => {
  console.log(chalk.blue('📋 Testing Environment Configuration...'));

  // Check if .env file exists
  const envExists = checkFile(ENV_FILE);
  console.log(`${envExists ? chalk.green('✓') : chalk.red('✗')} .env file exists: ${envExists}`);

  if (envExists) {
    const envContent = fs.readFileSync(ENV_FILE, 'utf8');

    // Check key configuration values
    const hasDefaultChannel = envContent.includes('NEXT_PUBLIC_DEFAULT_CHANNEL=');
    console.log(`${hasDefaultChannel ? chalk.green('✓') : chalk.red('✗')} NEXT_PUBLIC_DEFAULT_CHANNEL is configured`);

    const hasSaleorAPI = envContent.includes('NEXT_PUBLIC_SALEOR_API_URL=');
    console.log(`${hasSaleorAPI ? chalk.green('✓') : chalk.red('✗')} NEXT_PUBLIC_SALEOR_API_URL is configured`);

    const hasDefaultLocale = envContent.includes('NEXT_PUBLIC_DEFAULT_LOCALE=');
    console.log(`${hasDefaultLocale ? chalk.green('✓') : chalk.red('✗')} NEXT_PUBLIC_DEFAULT_LOCALE is configured`);
  }
};

const testDependencies = () => {
  console.log(chalk.blue('\n📦 Testing Dependencies...'));

  // Check for node_modules
  const nodeModulesExists = fs.existsSync(path.join(ROOT_DIR, 'node_modules'));
  console.log(`${nodeModulesExists ? chalk.green('✓') : chalk.red('✗')} node_modules directory exists`);

  // Check for pnpm
  const pnpmResult = runCommand('pnpm --version');
  console.log(`${pnpmResult.success ? chalk.green('✓') : chalk.red('✗')} pnpm is installed: ${pnpmResult.success ? pnpmResult.output.trim() : 'Not found'}`);

  // Check for package.json
  const packageJsonExists = checkFile(path.join(ROOT_DIR, 'package.json'));
  console.log(`${packageJsonExists ? chalk.green('✓') : chalk.red('✗')} package.json exists`);

  if (packageJsonExists) {
    const packageJson = require(path.join(ROOT_DIR, 'package.json'));
    console.log(`${chalk.green('✓')} Package name: ${packageJson.name}`);
    console.log(`${chalk.green('✓')} Package version: ${packageJson.version}`);

    // Check for essential dependencies
    const hasTurbo = packageJson.devDependencies && packageJson.devDependencies.turbo;
    console.log(`${hasTurbo ? chalk.green('✓') : chalk.red('✗')} Turborepo is configured`);
  }
};

const testRegionConfiguration = () => {
  console.log(chalk.blue('\n🌍 Testing Region Configuration...'));

  // Check if region types file exists
  const typesExists = checkFile(TYPES_PATH);
  console.log(`${typesExists ? chalk.green('✓') : chalk.red('✗')} Region types file exists`);

  if (typesExists) {
    const typesContent = fs.readFileSync(TYPES_PATH, 'utf8');

    // Check for our custom region configuration
    const hasNLLanguage = typesContent.includes('"nl"');
    const hasDELanguage = typesContent.includes('"de"');
    const hasFRLanguage = typesContent.includes('"fr"');

    console.log(`${hasNLLanguage ? chalk.green('✓') : chalk.red('✗')} Dutch language is configured`);
    console.log(`${hasDELanguage ? chalk.green('✓') : chalk.red('✗')} German language is configured`);
    console.log(`${hasFRLanguage ? chalk.green('✓') : chalk.red('✗')} French language is configured`);

    const hasNLMarket = typesContent.includes('"nl-NL"');
    const hasBEMarket = typesContent.includes('"nl-BE"') && typesContent.includes('"fr-BE"');
    const hasDEMarket = typesContent.includes('"de-DE"');

    console.log(`${hasNLMarket ? chalk.green('✓') : chalk.red('✗')} Netherlands market is configured`);
    console.log(`${hasBEMarket ? chalk.green('✓') : chalk.red('✗')} Belgium market is configured`);
    console.log(`${hasDEMarket ? chalk.green('✓') : chalk.red('✗')} Germany market is configured`);
  }

  // Check if region config file exists
  const configExists = checkFile(CONFIG_PATH);
  console.log(`${configExists ? chalk.green('✓') : chalk.red('✗')} Region config file exists`);

  if (configExists) {
    const configContent = fs.readFileSync(CONFIG_PATH, 'utf8');

    // Check for our custom channels
    const hasNLChannel = configContent.includes('channel: "netherlands"');
    const hasBEChannel = configContent.includes('channel: "belgium"');
    const hasDEChannel = configContent.includes('channel: "germany"');

    console.log(`${hasNLChannel ? chalk.green('✓') : chalk.red('✗')} Netherlands channel is configured`);
    console.log(`${hasBEChannel ? chalk.green('✓') : chalk.red('✗')} Belgium channel is configured`);
    console.log(`${hasDEChannel ? chalk.green('✓') : chalk.red('✗')} Germany channel is configured`);
  }

  // Check for translation files
  const messagesExists = fs.existsSync(MESSAGES_DIR);
  console.log(`${messagesExists ? chalk.green('✓') : chalk.red('✗')} Messages directory exists`);

  if (messagesExists) {
    const hasNLTranslations = checkFile(path.join(MESSAGES_DIR, 'nl.json'));
    const hasFRTranslations = checkFile(path.join(MESSAGES_DIR, 'fr.json'));
    const hasDETranslations = checkFile(path.join(MESSAGES_DIR, 'de.json'));

    console.log(`${hasNLTranslations ? chalk.green('✓') : chalk.red('✗')} Dutch translations exist`);
    console.log(`${hasFRTranslations ? chalk.green('✓') : chalk.red('✗')} French translations exist`);
    console.log(`${hasDETranslations ? chalk.green('✓') : chalk.red('✗')} German translations exist`);
  }
};

const testNextConfig = () => {
  console.log(chalk.blue('\n⚙️ Testing Next.js Configuration...'));

  // Check if next.config.js exists
  const nextConfigPath = path.join(ROOT_DIR, 'apps/storefront/next.config.js');
  const nextConfigExists = checkFile(nextConfigPath);
  console.log(`${nextConfigExists ? chalk.green('✓') : chalk.red('✗')} next.config.js exists`);

  if (nextConfigExists) {
    const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');

    // Check for i18n configuration
    const hasI18n = nextConfigContent.includes('i18n: {');
    console.log(`${hasI18n ? chalk.green('✓') : chalk.red('✗')} i18n configuration exists`);

    if (hasI18n) {
      const hasNLLocale = nextConfigContent.includes('"nl-NL"');
      const hasNLBELocale = nextConfigContent.includes('"nl-BE"');
      const hasFRBELocale = nextConfigContent.includes('"fr-BE"');
      const hasDELocale = nextConfigContent.includes('"de-DE"');

      console.log(`${hasNLLocale ? chalk.green('✓') : chalk.red('✗')} Dutch (NL) locale is configured`);
      console.log(`${hasNLBELocale ? chalk.green('✓') : chalk.red('✗')} Dutch (BE) locale is configured`);
      console.log(`${hasFRBELocale ? chalk.green('✓') : chalk.red('✗')} French (BE) locale is configured`);
      console.log(`${hasDELocale ? chalk.green('✓') : chalk.red('✗')} German locale is configured`);

      const hasDomains = nextConfigContent.includes('domains: [');
      console.log(`${hasDomains ? chalk.green('✓') : chalk.red('✗')} Domain configuration exists`);
    }
  }
};

const testBuildConfiguration = () => {
  console.log(chalk.blue('\n🔨 Testing Build Configuration...'));

  // Check for turbo.json
  const turboConfigPath = path.join(ROOT_DIR, 'turbo.json');
  const turboConfigExists = checkFile(turboConfigPath);
  console.log(`${turboConfigExists ? chalk.green('✓') : chalk.red('✗')} turbo.json exists`);

  // Check for workspace
  const workspaceConfigPath = path.join(ROOT_DIR, 'pnpm-workspace.yaml');
  const workspaceConfigExists = checkFile(workspaceConfigPath);
  console.log(`${workspaceConfigExists ? chalk.green('✓') : chalk.red('✗')} pnpm-workspace.yaml exists`);
};

// Run tests
console.log(chalk.blue('🧪 Starting Nimara Installation Test...\n'));

testEnvironment();
testDependencies();
testRegionConfiguration();
testNextConfig();
testBuildConfiguration();

console.log(chalk.blue('\n✅ Test Completed\n'));
