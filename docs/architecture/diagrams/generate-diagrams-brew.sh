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
    /opt/homebrew/opt/openjdk/bin/java -jar "$SCRIPT_DIR/plantuml.jar" -tsvg "$puml_file"
    
    # Check for both standard name and any SVG with the title as filename (PlantUML can use @startuml title as filename)
    generated_svg="$SCRIPT_DIR/$filename_no_ext.svg"
    title_svg=""
    
    # Get title from first line of PUML file
    title=$(head -n 1 "$puml_file" | grep -o '@startuml.*' | sed 's/@startuml //')
    if [ -n "$title" ]; then
      title_svg="$SCRIPT_DIR/$title.svg"
    fi
    
    # Move the SVG to assets directory
    if [ -f "$generated_svg" ]; then
      mv "$generated_svg" "../../assets/images/$filename_no_ext.svg"
      echo "  Created ../../assets/images/$filename_no_ext.svg"
    elif [ -n "$title" ] && [ -f "$title_svg" ]; then
      mv "$title_svg" "../../assets/images/$filename_no_ext.svg"
      echo "  Created ../../assets/images/$filename_no_ext.svg"
    else
      echo "  Error: SVG not generated for $filename_no_ext"
    fi
  fi
done

echo "SVG generation complete!" 