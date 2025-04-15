#!/bin/bash

# This script generates SVG files from PlantUML files using the online PlantUML server
# This version does not require local Java installation

ASSETS_DIR="../../../assets/images"
ONLINE_URL="http://www.plantuml.com/plantuml/svg/"

# Create assets directory if it doesn't exist
mkdir -p $ASSETS_DIR

echo "Using PlantUML online server for SVG generation..."

# Function to encode PlantUML content for online server
# This is a simplified version - for complex diagrams, a more robust encoding might be needed
encode_for_plantuml() {
  cat "$1" | curl -s --data-urlencode "plantuml@-" "$ONLINE_URL" > "$2"
}

# Process each PlantUML file
for puml_file in *.puml; do
  if [ -f "$puml_file" ]; then
    base_name="${puml_file%.puml}"
    svg_file="${base_name}.svg"
    
    echo "Generating SVG for ${base_name}..."
    
    # Generate SVG using PlantUML online server
    encode_for_plantuml "$puml_file" "$svg_file"
    
    # Check if SVG was generated successfully
    if [ -f "$svg_file" ] && [ -s "$svg_file" ]; then
      # Move SVG to assets directory
      mv "$svg_file" "${ASSETS_DIR}/"
      echo "  SVG generated and moved to assets directory"
    else
      echo "  Error: SVG not generated for ${base_name}"
    fi
  fi
done

echo "SVG generation complete!" 