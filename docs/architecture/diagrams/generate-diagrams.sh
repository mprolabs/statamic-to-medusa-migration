#!/bin/bash

# This script generates SVG files from PlantUML files
# It requires plantuml.jar to be available

# Create assets directory if it doesn't exist
mkdir -p ../../assets/images

# Get the directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Download PlantUML if not available
if [ ! -f "$SCRIPT_DIR/plantuml.jar" ]; then
  echo "Downloading PlantUML..."
  curl -L https://sourceforge.net/projects/plantuml/files/plantuml.jar/download -o "$SCRIPT_DIR/plantuml.jar"
fi

# Generate SVGs from all PUML files
for puml_file in "$SCRIPT_DIR"/*.puml; do
  if [ -f "$puml_file" ]; then
    filename=$(basename -- "$puml_file")
    filename_no_ext="${filename%.*}"
    echo "Generating SVG for $filename_no_ext..."
    
    # Generate SVG using PlantUML
    java -jar "$SCRIPT_DIR/plantuml.jar" -tsvg "$puml_file"
    
    # Move the SVG to assets directory
    if [ -f "$SCRIPT_DIR/$filename_no_ext.svg" ]; then
      mv "$SCRIPT_DIR/$filename_no_ext.svg" "../../assets/images/$filename_no_ext.svg"
      echo "  Created ../../assets/images/$filename_no_ext.svg"
    else
      echo "  Error: SVG not generated for $filename_no_ext"
    fi
  fi
done

echo "SVG generation complete!" 