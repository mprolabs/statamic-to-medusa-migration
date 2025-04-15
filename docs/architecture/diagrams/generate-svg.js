import fs from 'fs';
import path from 'path';
import https from 'https';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure asset directory exists
const assetDir = path.join(__dirname, '..', '..', 'assets', 'images');
if (!fs.existsSync(assetDir)) {
  fs.mkdirSync(assetDir, { recursive: true });
  console.log(`Created directory: ${assetDir}`);
}

// Function to encode PlantUML content for the server
function encodePlantUML(content) {
  // PlantUML server uses a custom deflate + base64 encoding
  const deflated = zlib.deflateSync(content, { level: 9 });
  
  // Convert to base64 and make it URL friendly
  const base64 = deflated.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  
  return base64;
}

// Function to fetch SVG from PlantUML server
function generateSVG(pumlPath, outputPath) {
  return new Promise((resolve, reject) => {
    const filename = path.basename(pumlPath, '.puml');
    console.log(`Generating SVG for ${filename}...`);
    
    try {
      // Read the PUML file
      const content = fs.readFileSync(pumlPath, 'utf8');
      
      // Encode the content
      const encoded = encodePlantUML(content);
      
      // Define PlantUML server URL
      const plantumlServer = 'https://www.plantuml.com/plantuml/svg/';
      const url = plantumlServer + encoded;
      
      console.log(`  Fetching from PlantUML server...`);
      
      // Fetch the SVG
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to generate SVG for ${filename}: HTTP ${response.statusCode}`));
          return;
        }
        
        const data = [];
        
        response.on('data', (chunk) => {
          data.push(chunk);
        });
        
        response.on('end', () => {
          const svg = Buffer.concat(data);
          
          // Write the SVG to file
          fs.writeFileSync(outputPath, svg);
          console.log(`  Created ${outputPath}`);
          resolve();
        });
      }).on('error', (error) => {
        reject(new Error(`Failed to generate SVG for ${filename}: ${error.message}`));
      });
    } catch (error) {
      reject(new Error(`Error processing ${filename}: ${error.message}`));
    }
  });
}

// Get all PUML files
const pumlDir = __dirname;
const pumlFiles = fs.readdirSync(pumlDir)
  .filter(file => file.endsWith('.puml'))
  .map(file => path.join(pumlDir, file));

// Process all PUML files
async function processFiles() {
  const promises = pumlFiles.map(pumlFile => {
    const filename = path.basename(pumlFile, '.puml');
    const outputPath = path.join(assetDir, `${filename}.svg`);
    return generateSVG(pumlFile, outputPath);
  });
  
  try {
    await Promise.all(promises);
    console.log('SVG generation complete!');
  } catch (error) {
    console.error('Error generating SVGs:', error.message);
  }
}

// Run the script
processFiles(); 