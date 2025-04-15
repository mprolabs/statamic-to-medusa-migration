#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const https = require('https');
const crypto = require('crypto');

// Assets directory relative to this script
const ASSETS_DIR = path.join(__dirname, '../../../assets/images');

// PlantUML server URL for SVG
const PLANTUML_SERVER = 'https://www.plantuml.com/plantuml/svg/';

// Ensure assets directory exists
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
  console.log(`Created assets directory at ${ASSETS_DIR}`);
}

/**
 * Properly encode PlantUML content for the online server
 * Uses zlib deflate and base64 encoding as required by PlantUML
 */
function encodePlantUML(content) {
  const deflated = zlib.deflateSync(content);
  
  // Base64 encode with PlantUML-specific encoding
  let base64 = '';
  for (let i = 0; i < deflated.length; i += 3) {
    const a = (i < deflated.length) ? deflated[i] : 0;
    const b = (i + 1 < deflated.length) ? deflated[i + 1] : 0;
    const c = (i + 2 < deflated.length) ? deflated[i + 2] : 0;
    
    const chunk = (a << 16) | (b << 8) | c;
    base64 += encode6bit((chunk >> 18) & 0x3F);
    base64 += encode6bit((chunk >> 12) & 0x3F);
    base64 += encode6bit((chunk >> 6) & 0x3F);
    base64 += encode6bit(chunk & 0x3F);
  }
  
  return base64;
}

/**
 * Convert 6 bits to a PlantUML-friendly Base64 character
 */
function encode6bit(b) {
  // PlantUML specific encoding table
  const ALPHANUMERIC = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
  if (b < 0 || b > 63) {
    return '?';
  }
  return ALPHANUMERIC.charAt(b);
}

/**
 * Download SVG from PlantUML server
 */
function downloadSVG(encodedContent, outputPath) {
  return new Promise((resolve, reject) => {
    const url = `${PLANTUML_SERVER}${encodedContent}`;
    
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download SVG: HTTP ${res.statusCode}`));
        return;
      }
      
      const data = [];
      res.on('data', (chunk) => {
        data.push(chunk);
      });
      
      res.on('end', () => {
        const svg = Buffer.concat(data);
        fs.writeFileSync(outputPath, svg);
        resolve();
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Process a single PlantUML file
 */
async function processFile(filePath) {
  const fileName = path.basename(filePath, '.puml');
  const outputPath = path.join(ASSETS_DIR, `${fileName}.svg`);
  
  console.log(`Processing ${fileName}...`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const encoded = encodePlantUML(content);
    
    await downloadSVG(encoded, outputPath);
    
    // Verify file was created successfully
    const stats = fs.statSync(outputPath);
    if (stats.size > 100) { // Ensure SVG is not just an error message
      console.log(`  Successfully generated ${outputPath}`);
      
      // Calculate a hash of the file for verification
      const fileHash = crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
      console.log(`  File hash: ${fileHash}`);
      
      return true;
    } else {
      console.error(`  Error: Generated SVG is too small (${stats.size} bytes), likely an error.`);
      return false;
    }
  } catch (err) {
    console.error(`  Error processing ${fileName}: ${err.message}`);
    return false;
  }
}

/**
 * Process all PlantUML files in the current directory
 */
async function main() {
  const files = fs.readdirSync(__dirname).filter(file => file.endsWith('.puml'));
  
  console.log(`Found ${files.length} PlantUML files to process`);
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const file of files) {
    const filePath = path.join(__dirname, file);
    const success = await processFile(filePath);
    
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
  }
  
  console.log('\nSummary:');
  console.log(`  Success: ${successCount}`);
  console.log(`  Failure: ${failureCount}`);
  console.log(`  Total: ${files.length}`);
}

// Run the script
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
}); 