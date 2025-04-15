#!/bin/bash

# This script generates SVG files from PlantUML files using the PlantUML online server
# No Java installation required!

# Create assets directory if it doesn't exist
mkdir -p ../../assets/images

# Get the directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Generate SVGs from all PUML files
for puml_file in "$SCRIPT_DIR"/*.puml; do
  if [ -f "$puml_file" ]; then
    filename=$(basename -- "$puml_file")
    filename_no_ext="${filename%.*}"
    echo "Generating SVG for $filename_no_ext..."
    
    # Read the PUML file content
    puml_content=$(cat "$puml_file")
    
    # URL encode the content (basic encoding for common special characters)
    encoded_content=$(echo "$puml_content" | perl -pe 's/([^a-zA-Z0-9_.-])/sprintf("%%%02X", ord($1))/ge')
    
    # Define PlantUML server URL
    plantuml_server="https://www.plantuml.com/plantuml/svg/"
    
    # Use curl to fetch the SVG from the PlantUML server
    echo "  Fetching from PlantUML server..."
    curl -s -o "../../assets/images/$filename_no_ext.svg" --data-urlencode "plantuml=$puml_content" "$plantuml_server"
    
    # Check if the SVG was created successfully
    if [ -f "../../assets/images/$filename_no_ext.svg" ]; then
      filesize=$(stat -f%z "../../assets/images/$filename_no_ext.svg" 2>/dev/null || stat -c%s "../../assets/images/$filename_no_ext.svg")
      if [ "$filesize" -gt 100 ]; then
        echo "  Created ../../assets/images/$filename_no_ext.svg"
      else
        echo "  Error: SVG generation failed for $filename_no_ext - File too small"
        rm "../../assets/images/$filename_no_ext.svg"
      fi
    else
      echo "  Error: SVG not generated for $filename_no_ext"
    fi
  fi
done

echo "SVG generation complete!" 