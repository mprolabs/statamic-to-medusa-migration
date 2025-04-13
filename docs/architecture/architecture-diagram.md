---
layout: default
title: Architecture Diagram
description: Visual representation of the Medusa migration project architecture
---

# Multi-Region E-commerce Architecture: Medusa.js + Strapi

## System Architecture Diagram

```mermaid
graph TD
    %% Client Applications
    subgraph "Client Applications"
        NL["Dutch Storefront\n(example.nl)"]
        BE["Belgian Storefront\n(example.be)"]
        DE["German Storefront\n(example.de)"]
        MobileApp["Mobile Application"]
        AdminPanel["Admin Dashboard"]
    end

    %% Frontend Layer
    subgraph "Frontend Layer"
        NextJS["Next.js Application"]
        style NextJS fill:#61DAFB,color:#000000
        
        subgraph "Storefront Features"
            Catalog["Product Catalog"]
            Cart["Shopping Cart"]
            Checkout["Checkout Flow"]
            Account["Customer Account"]
            CMS["CMS Content"]
        end
    end

    %% API Gateway Layer
    subgraph "API Gateway"
        APIGateway["API Gateway / BFF"]
        style APIGateway fill:#FF6B6B,color:#000000
    end

    %% Backend Services
    subgraph "Backend Services"
        %% Medusa.js
        subgraph "Medusa.js (Commerce Engine)"
            style Medusa fill:#9FFFCB,color:#000000
            Medusa["Medusa.js Core"]
            
            subgraph "Medusa Modules"
                Products["Products Service"]
                Orders["Orders Service"]
                Cart["Cart Service"]
                Customers["Customers Service"]
                Pricing["Pricing Service"]
                Regions["Regions Service"]
                Payments["Payments Service"]
                Shipping["Shipping Service"]
            end
        end
        
        %% Strapi CMS
        subgraph "Strapi CMS"
            style Strapi fill:#8E44AD,color:#FFFFFF
            StrapiCore["Strapi Core"]
            
            subgraph "Content Types"
                Pages["Pages"]
                BlogPosts["Blog Posts"]
                Navigation["Navigation"]
                Media["Media Library"]
                ProductContent["Product Extended Content"]
                RegionalContent["Region-Specific Content"]
            end
        end
    end

    %% Data Layer
    subgraph "Data Layer"
        MedusaDB[(Medusa PostgreSQL DB)]
        StrapiDB[(Strapi PostgreSQL DB)]
        Redis[(Redis Cache)]
        MinIO[(MinIO Object Storage)]
    end

    %% External Services
    subgraph "External Services"
        PaymentProviders["Payment Gateways\n(Stripe, iDEAL, etc.)"]
        Shipping["Shipping Providers\n(PostNL, DHL, etc.)"]
        Analytics["Analytics\n(Google, Plausible)"]
        Search["Algolia Search"]
    end

    %% Connections - User Applications to Frontend
    NL --> NextJS
    BE --> NextJS
    DE --> NextJS
    MobileApp --> APIGateway
    AdminPanel --> APIGateway

    %% Connections - Frontend to API Gateway
    NextJS --> APIGateway

    %% Connections - API Gateway to Backend Services
    APIGateway --> Medusa
    APIGateway --> StrapiCore

    %% Connections - Medusa.js Internal
    Medusa --> Products
    Medusa --> Orders
    Medusa --> Cart
    Medusa --> Customers
    Medusa --> Pricing
    Medusa --> Regions
    Medusa --> Payments
    Medusa --> Shipping

    %% Connections - Strapi Internal
    StrapiCore --> Pages
    StrapiCore --> BlogPosts
    StrapiCore --> Navigation
    StrapiCore --> Media
    StrapiCore --> ProductContent
    StrapiCore --> RegionalContent

    %% Connections - Backend to Data Layer
    Medusa -.-> MedusaDB
    Medusa -.-> Redis
    StrapiCore -.-> StrapiDB
    StrapiCore -.-> MinIO

    %% Connections - Backend to External Services
    Medusa --> PaymentProviders
    Medusa --> Shipping
    Medusa --> Analytics
    Medusa --> Search
    StrapiCore --> Analytics

    %% Integration between Medusa and Strapi
    Products <--> ProductContent
    Regions <--> RegionalContent
    
    %% Legends
    classDef service fill:#f9f,stroke:#333,stroke-width:2px;
    classDef database fill:#ccf,stroke:#333,stroke-width:2px;
    classDef client fill:#cfc,stroke:#333,stroke-width:2px;
```

## Multi-Region Implementation

The architecture implements a multi-region approach with the following key components:

### Domain Structure
- **example.nl** - Dutch storefront (Netherlands)
- **example.be** - Belgian storefront (Belgium)
- **example.de** - German storefront (Germany)

Each domain is mapped to a specific Medusa.js region and sales channel.

### Regional Configuration

```mermaid
graph TD
    subgraph "Regional Structure"
        NLRegion["Region: Netherlands"]
        BERegion["Region: Belgium"]
        DERegion["Region: Germany"]
        
        NLChannel["Sales Channel: NL Store"]
        BEChannel["Sales Channel: BE Store"]
        DEChannel["Sales Channel: DE Store"]
        
        NLLocale["Default Locale: nl_NL"]
        BELocale["Default Locale: nl_BE"]
        DELocale["Default Locale: de_DE"]
        
        NLRegion --> NLChannel
        NLRegion --> NLLocale
        
        BERegion --> BEChannel
        BERegion --> BELocale
        
        DERegion --> DEChannel
        DERegion --> DELocale
    end
```

### Multi-Language Support

```mermaid
graph TD
    subgraph "Language Implementation"
        NL["Dutch (nl)"]
        DE["German (de)"]
        
        subgraph "Content Translation"
            Products["Product Information"]
            Pages["CMS Pages"]
            BlogPosts["Blog Posts"]
            Marketing["Marketing Content"]
        end
        
        NL --> Products
        NL --> Pages
        NL --> BlogPosts
        NL --> Marketing
        
        DE --> Products
        DE --> Pages
        DE --> BlogPosts
        DE --> Marketing
    end
```

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend as Next.js Frontend
    participant APIGateway as API Gateway
    participant Medusa as Medusa.js
    participant Strapi as Strapi CMS
    participant DB as Databases
    
    User->>Frontend: Visit domain (example.nl)
    Frontend->>APIGateway: Request region information
    APIGateway->>Medusa: Get region by domain
    Medusa->>DB: Query region data
    DB-->>Medusa: Return region data
    Medusa-->>APIGateway: Return region (Netherlands)
    APIGateway-->>Frontend: Return region configuration
    
    Frontend->>APIGateway: Request products for region
    APIGateway->>Medusa: Get products for sales channel
    Medusa->>DB: Query products with pricing
    DB-->>Medusa: Return product data
    Medusa-->>APIGateway: Return products
    
    APIGateway->>Strapi: Get content for region
    Strapi->>DB: Query content with locale
    DB-->>Strapi: Return content data
    Strapi-->>APIGateway: Return localized content
    
    APIGateway-->>Frontend: Combined product & content data
    Frontend-->>User: Display region-specific storefront
```

## Deployment Architecture

```mermaid
graph TD
    subgraph "Infrastructure"
        %% Deployment Services
        subgraph "Services"
            MedusaService["Medusa.js Service"]
            StrapiService["Strapi CMS Service"]
            NextService["Next.js Frontend Service"]
            GatewayService["API Gateway Service"]
        end
        
        %% Databases
        subgraph "Data Storage"
            MedusaDB[(Medusa PostgreSQL)]
            StrapiDB[(Strapi PostgreSQL)]
            Redis[(Redis Cache)]
            MinIO[(MinIO Storage)]
        end
        
        %% Networking
        subgraph "Networking"
            CDN["CDN"]
            LoadBalancer["Load Balancer"]
            DomainRouter["Domain Router"]
        end
    end
    
    %% Connections
    CDN --> DomainRouter
    DomainRouter --> LoadBalancer
    LoadBalancer --> NextService
    LoadBalancer --> GatewayService
    GatewayService --> MedusaService
    GatewayService --> StrapiService
    MedusaService --> MedusaDB
    MedusaService --> Redis
    StrapiService --> StrapiDB
    StrapiService --> MinIO
    
    %% Domain Routing
    subgraph "Domain Routing"
        NL["example.nl"]
        BE["example.be"]
        DE["example.de"]
    end
    
    NL & BE & DE --> CDN
```

## Integration Points

### Medusa.js and Strapi Integration

```mermaid
graph TD
    subgraph "Integration Layer"
        %% Core Entities
        Product["Medusa: Product"]
        ProductVariant["Medusa: Product Variant"]
        Region["Medusa: Region"]
        
        %% Strapi Entities
        ProductContent["Strapi: Product Content"]
        RegionContent["Strapi: Regional Content"]
        MediaAssets["Strapi: Media Library"]
        
        %% Integration Points
        Product -- "productId reference" --> ProductContent
        Region -- "regionId reference" --> RegionContent
        Product -- "media references" --> MediaAssets
    end
```

### Data Synchronization

```mermaid
sequenceDiagram
    participant Admin
    participant Medusa as Medusa Admin API
    participant Strapi as Strapi Admin API
    participant Integration as Integration Service
    
    Admin->>Medusa: Create/Update Product
    Medusa-->>Admin: Product Created/Updated
    
    Medusa->>Integration: Product Changed Event
    Integration->>Strapi: Create/Update Product Content
    
    Admin->>Strapi: Add Extended Content
    Strapi-->>Admin: Content Added
    
    note over Integration: Bi-directional sync ensures<br>data consistency between systems
```

## Scalability Considerations

The architecture is designed to scale horizontally with the following considerations:

1. **Microservices** - Each component can scale independently
2. **Caching** - Redis caching for performance optimization
3. **CDN** - Content delivery network for static assets and pages
4. **Load Balancing** - Distribution of traffic across multiple instances
5. **Database Scaling** - Read replicas for high-traffic scenarios 