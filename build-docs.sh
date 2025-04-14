#!/bin/bash

# Script to generate diagrams and build Jekyll documentation
# This must be run from the project root directory

echo "Starting documentation build process..."

# Create assets directory if it doesn't exist
mkdir -p docs/assets/images

# Generate SVG diagrams from PlantUML
echo "Generating diagrams..."
cd docs/architecture/diagrams
bash generate-diagrams.sh
cd ../../..

# Install Jekyll dependencies and build
echo "Building Jekyll documentation..."
cd docs

# Check if Gemfile exists
if [ ! -f "Gemfile" ]; then
  echo "Error: Gemfile not found in docs directory!"
  exit 1
fi

# Extract repository name without owner
REPO_NAME=$(echo "mprolabs/statamic-to-saleor-migration" | awk -F/ '{print $2}')
echo "Repository name: $REPO_NAME"

# Install dependencies
bundle install

# Build Jekyll site with proper baseurl
JEKYLL_ENV=production bundle exec jekyll build --baseurl "/$REPO_NAME"

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "Documentation built successfully! Output in docs/_site directory."
else
  echo "Error: Documentation build failed!"
  exit 1
fi

cd ..
echo "Build process complete!" 