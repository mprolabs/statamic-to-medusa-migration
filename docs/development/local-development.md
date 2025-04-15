---
title: Local Development Setup
parent: Development
nav_order: 1
---

# Local Development Setup

This guide describes how to set up the local development environment for working on the Saleor backend, the Headless CMS (if applicable), and the Next.js frontend.

## Prerequisites

*   Docker & Docker Compose
*   Node.js (check required version for Saleor and Next.js)
*   npm or yarn or pnpm
*   Git
*   Python (if needed for specific Saleor setup steps or scripts)

## Setting up Saleor Core

1.  **Clone the Repository:** If using a specific Saleor project repository or fork, clone it. Otherwise, follow Saleor's official `saleor-platform` or `saleor-core` setup guides.
2.  **Docker Environment:** Saleor typically runs via Docker Compose.
    ```bash
    git clone https://github.com/saleor/saleor-platform.git # Or your fork
    cd saleor-platform
    docker-compose build
    docker-compose run --rm api python manage.py migrate
    docker-compose run --rm api python manage.py populatedb --createsuperuser
    docker-compose up -d # Start services in detached mode
    ```
3.  **Access:**
    *   API: `http://localhost:8000/graphql/`
    *   Dashboard: `http://localhost:9000` (if `saleor-dashboard` is included in compose)

## Setting up Headless CMS (Example: Strapi)

*(Adjust if using a different CMS or Saleor's features)*

1.  **Create Strapi Project:**
    ```bash
    npx create-strapi-app@latest my-cms --quickstart
    cd my-cms
    ```
2.  **Develop Content Models:** Use the Strapi admin UI (`http://localhost:1337/admin`) to create content types matching the project requirements. Configure localization plugins if needed.
3.  **Run Strapi:**
    ```bash
    npm run develop # or yarn develop
    ```
4.  **Access:**
    *   API: `http://localhost:1337/api/...`
    *   Admin: `http://localhost:1337/admin`

## Setting up Frontend (Next.js)

1.  **Clone Frontend Repository:**
    ```bash
    git clone <your-frontend-repo-url>
    cd <frontend-repo-name>
    ```
2.  **Install Dependencies:**
    ```bash
    npm install # or yarn install or pnpm install
    ```
3.  **Configure Environment Variables:** Create a `.env.local` file and add necessary variables:
    ```dotenv
    NEXT_PUBLIC_SALEOR_API_URL=http://localhost:8000/graphql/
    # Add CMS API URL if applicable
    # NEXT_PUBLIC_CMS_API_URL=http://localhost:1337/api/
    # Add other variables (e.g., channel mapping logic)
    ```
4.  **Run Development Server:**
    ```bash
    npm run dev # or yarn dev or pnpm dev
    ```
5.  **Access:** `http://localhost:3000` (or the port specified)

## Running Everything Together

*   Start Saleor services using `docker-compose up -d`.
*   Start the Headless CMS development server (e.g., `npm run develop`).
*   Start the Next.js frontend development server (`npm run dev`).

*(Add project-specific setup details, scripts, or configurations)* 