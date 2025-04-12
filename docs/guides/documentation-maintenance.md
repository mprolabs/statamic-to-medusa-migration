---
layout: default
title: Documentation Maintenance
parent: Guides
nav_order: 1
---

# Documentation Maintenance Guide

This guide explains how to maintain the project documentation hosted on GitHub Pages.

## Overview

Our documentation is built with Jekyll using the Just the Docs theme and automatically deployed to GitHub Pages through GitHub Actions. Architecture diagrams are generated from PlantUML source files.

## Directory Structure

```
docs/                             # Documentation site root
├── _config.yml                   # Jekyll configuration
├── Gemfile                       # Ruby dependencies
├── index.md                      # Home page
├── architecture/                 # Architecture documentation
│   ├── index.md                  # Architecture overview
│   └── diagrams/                 # Architecture diagrams
│       ├── index.md              # Diagrams overview
│       ├── architecture-diagram.png  # Rendered diagram (PNG)
│       ├── architecture-diagram.svg  # Rendered diagram (SVG)
│       └── architecture-diagram.puml # PlantUML source
└── ...                           # Other documentation sections

src/architecture/diagrams/        # PlantUML source files
├── architecture-diagram.puml     # Source PlantUML file
└── render.sh                     # Script to render diagrams
```

## Updating Diagrams

Architecture diagrams are maintained in PlantUML format and rendered to both PNG and SVG formats.

### Process for Updating Diagrams

1. **Edit Source Files**: Update the PlantUML files in `src/architecture/diagrams/`.

2. **Render Diagrams**: Run the render script to generate PNG and SVG files:
   ```bash
   cd src/architecture/diagrams
   chmod +x render.sh
   ./render.sh
   ```

3. **Copy to Documentation**: Copy the rendered files to the documentation directory:
   ```bash
   cp *.png *.svg ../../docs/architecture/diagrams/
   ```

4. **Copy Source Files**: Also copy the PlantUML source files:
   ```bash
   cp *.puml ../../docs/architecture/diagrams/
   ```

5. **Commit & Push**: Commit and push your changes. The GitHub Actions workflow will automatically deploy the updated documentation to GitHub Pages.

## Adding New Diagrams

To add a new diagram:

1. Create a new `.puml` file in `src/architecture/diagrams/`.
2. Follow PlantUML syntax to define your diagram.
3. Run the render script to generate PNG and SVG files.
4. Copy the rendered files to the documentation directory.
5. Update the documentation to reference your new diagram:
   ```markdown
   ## New Diagram Name

   ![New Diagram](new-diagram.png)

   [View SVG version](new-diagram.svg) | [View Source](new-diagram.puml)
   ```

## Local Development

To preview documentation changes locally:

1. Install Ruby and Bundler if you haven't already.
2. Navigate to the docs directory:
   ```bash
   cd docs
   ```
3. Install dependencies:
   ```bash
   bundle install
   ```
4. Start the Jekyll server:
   ```bash
   bundle exec jekyll serve
   ```
5. Open your browser to `http://localhost:4000`

## GitHub Pages Deployment

Documentation is automatically deployed to GitHub Pages when changes are pushed to the main branch. The workflow is defined in `.github/workflows/github-pages.yml` and performs the following steps:

1. Checkout the repository
2. Install PlantUML and render the latest diagrams
3. Copy diagrams to the docs directory
4. Build the Jekyll site
5. Deploy to GitHub Pages

You can view the status of deployments in the "Actions" tab of the GitHub repository.

## Customizing the Documentation Site

To customize the documentation site:

1. **Theme Configuration**: Edit `docs/_config.yml` to change theme settings, navigation, and site metadata.

2. **Navigation**: Add or update pages in the appropriate directories. Use front matter to control page organization:
   ```yaml
   ---
   layout: default
   title: Page Title
   parent: Parent Page
   nav_order: 1
   ---
   ```

3. **Styling**: Customize styles by adding CSS files to `docs/assets/css/`.

## Troubleshooting

If you encounter issues with documentation or diagrams:

1. **Broken Links**: Check that file paths in markdown files match the actual file structure.

2. **PlantUML Rendering Issues**: Ensure PlantUML is installed correctly and syntax is valid.

3. **Jekyll Build Errors**: Check the GitHub Actions logs for detailed error messages.

4. **Missing Content**: Verify that all necessary files are committed and pushed to the repository.

For more help, refer to [Jekyll documentation](https://jekyllrb.com/docs/) and [Just the Docs theme documentation](https://just-the-docs.github.io/just-the-docs/). 