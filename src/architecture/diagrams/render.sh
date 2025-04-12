#!/bin/bash

# Ensure script is executable with: chmod +x render.sh

# Check if PlantUML is installed
if ! command -v plantuml &> /dev/null; then
    echo "PlantUML not found. Please install it first."
    echo "You can install it using:"
    echo "  brew install plantuml    # macOS with Homebrew"
    echo "  apt-get install plantuml # Debian/Ubuntu"
    echo "  Or download from https://plantuml.com/download"
    exit 1
fi

# Directory containing this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Loop through all .puml files in the directory
for puml_file in "$SCRIPT_DIR"/*.puml; do
    if [ -f "$puml_file" ]; then
        echo "Rendering: $puml_file"
        
        # Get the base filename without extension
        filename=$(basename -- "$puml_file")
        basename="${filename%.*}"
        
        # Render to PNG with high resolution
        plantuml -tpng -pipe < "$puml_file" > "$SCRIPT_DIR/$basename.png"
        
        # Render to SVG for scalable version
        plantuml -tsvg -pipe < "$puml_file" > "$SCRIPT_DIR/$basename.svg"
        
        echo "Created $SCRIPT_DIR/$basename.png and $SCRIPT_DIR/$basename.svg"
    fi
done

echo "All diagrams rendered successfully!" 