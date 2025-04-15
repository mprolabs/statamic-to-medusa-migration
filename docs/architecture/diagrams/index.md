---
layout: default
title: Architecture Diagrams
description: Visual representations of the Saleor-based architecture with multi-region and multi-language support
parent: Architecture
---

# Architecture Diagrams

This page provides visual representations of the architecture for the Statamic to Saleor migration project, with a focus on multi-region and multi-language capabilities.

## PlantUML Diagrams

We have created detailed technical diagrams using PlantUML to visualize key aspects of our architecture:

### Main Architecture Diagram

![Saleor Architecture Diagram]({{ site.baseurl }}/assets/images/architecture-diagram.svg)
*Full architecture diagram showing the layered approach of our Saleor implementation*

### Multi-Region Architecture

![Saleor Multi-Region Architecture]({{ site.baseurl }}/assets/images/multi-region-diagram.svg)
*Detailed view of the multi-region implementation using Saleor Channels*

### Multi-Language Architecture

![Saleor Multi-Language Architecture]({{ site.baseurl }}/assets/images/multi-language-diagram.svg)
*Detailed view of the multi-language implementation with Next.js i18n integration*

### Data Flow Diagram

![Saleor Data Flow]({{ site.baseurl }}/assets/images/data-flow-diagram.svg)
*Visualization of data flow between system components*

### Data Migration Diagram

![Data Migration Approach]({{ site.baseurl }}/assets/images/data-migration-diagram.svg)
*Diagram showing the migration path from Statamic to Saleor*

## System Overview Diagram

The following diagram shows the high-level system architecture:

```mermaid
flowchart TD
    Customer([Customer])
    Admin([Admin User])
    
    subgraph "Saleor Core"
        Dashboard[Saleor Dashboard]
        API[GraphQL API]
        Channels[Channel Management]
        Products[Product Management]
        Orders[Order Management]
        Checkout[Checkout System]
        Payments[Payment Integrations]
        Translations[Translation System]
        
        Dashboard --- API
        API --- Channels
        API --- Products
        API --- Orders
        API --- Checkout
        API --- Payments
        Products --- Translations
    end
    
    subgraph "Next.js Storefront"
        Pages[Next.js Pages]
        Components[React Components]
        Hooks[Custom Hooks]
        API_Routes[API Routes]
        i18n[Internationalization]
        
        Pages --- Components
        Components --- Hooks
        Pages --- API_Routes
        Components --- i18n
    end
    
    Customer --> Pages
    Admin --> Dashboard
    API_Routes --> API
    Hooks --> API
```

## Multi-Region Architecture (Mermaid)

The following diagram illustrates the multi-region architecture using Saleor Channels:

```mermaid
flowchart TD
    Customer([Customer])
    
    subgraph "Domain Routing"
        NL[domain-nl.com]
        BE[domain-be.com]
        DE[domain-de.com]
    end
    
    subgraph "Next.js Storefront"
        Router[Domain/Region Router]
        NL_Store[NL Specific UI]
        BE_Store[BE Specific UI]
        DE_Store[DE Specific UI]
        
        Router --- NL_Store
        Router --- BE_Store
        Router --- DE_Store
    end
    
    subgraph "Saleor Core"
        API[GraphQL API]
        Channels[Channels]
        NL_Channel[Netherlands Channel]
        BE_Channel[Belgium Channel]
        DE_Channel[Germany Channel]
        
        API --- Channels
        Channels --- NL_Channel
        Channels --- BE_Channel
        Channels --- DE_Channel
    end
    
    Customer --> NL
    Customer --> BE
    Customer --> DE
    
    NL --> Router
    BE --> Router
    DE --> Router
    
    NL_Store --> API
    BE_Store --> API
    DE_Store --> API
```

## Technology Stack Diagram

This diagram shows the technology stack and relationships between components:

```mermaid
flowchart TD
    subgraph "Backend"
        Saleor[Saleor Core]
        GraphQL[GraphQL API]
        Channels[Multi-Channel Support]
        DB[PostgreSQL]
        
        Saleor --- GraphQL
        Saleor --- Channels
        Saleor --- DB
    end
    
    subgraph "Frontend"
        Next[Next.js]
        React[React]
        Apollo[Apollo Client]
        
        Next --- React
        Next --- Apollo
    end
    
    subgraph "Infrastructure"
        Docker[Docker]
        AWS[AWS]
        CDN[Content Delivery Network]
        
        Docker --- AWS
        AWS --- CDN
    end
    
    Apollo --> GraphQL
    CDN --> Next
```

## Data Migration Flow

This diagram illustrates the data migration process from Statamic to Saleor:

```mermaid
flowchart LR
    subgraph "Source"
        Statamic[Statamic CMS]
        SC[Simple Commerce]
        
        Statamic --- SC
    end
    
    subgraph "Migration Tools"
        Scripts[Migration Scripts]
        Transform[Data Transformation]
        
        Scripts --- Transform
    end
    
    subgraph "Target"
        Saleor[Saleor Core]
        API[GraphQL API]
        
        Saleor --- API
    end
    
    SC --> Scripts
    Statamic --> Scripts
    Transform --> API
```

## Multi-Language Support (Mermaid)

This diagram shows how multi-language support is implemented:

```mermaid
flowchart TD
    subgraph "Saleor"
        Products[Products]
        Translations[Translations]
        
        Products --- Translations
    end
    
    subgraph "Next.js"
        i18n[Next.js i18n]
        UI[UI Components]
        
        i18n --- UI
    end
    
    Translations --> i18n
```

## Data Flow Diagram (Mermaid)

This diagram illustrates the flow of data during customer interactions:

```mermaid
sequenceDiagram
    Customer->>Next.js: Visit website
    Next.js->>Saleor: GraphQL Query (with channel context)
    Saleor->>Next.js: Return data (with translations)
    Next.js->>Customer: Render page
    
    Customer->>Next.js: Add to cart
    Next.js->>Saleor: Create/Update Cart (channel-specific)
    Saleor->>Next.js: Updated Cart data
    Next.js->>Customer: Updated Cart UI
    
    Customer->>Next.js: Checkout
    Next.js->>Saleor: Process Checkout (channel-specific)
    Saleor->>Payment Provider: Process Payment
    Payment Provider->>Saleor: Payment Confirmation
    Saleor->>Next.js: Order Confirmation
    Next.js->>Customer: Order Confirmation Page
```

## Deployment Architecture

This diagram shows the deployment architecture for the system:

```mermaid
flowchart TD
    subgraph "Production Environment"
        LB[Load Balancer]
        
        subgraph "Frontend"
            NL_Frontend[NL Frontend]
            BE_Frontend[BE Frontend]
            DE_Frontend[DE Frontend]
        end
        
        subgraph "Backend"
            Saleor_API[Saleor API]
            Saleor_Dashboard[Saleor Dashboard]
            DB[PostgreSQL]
            Cache[Redis]
        end
        
        LB --> NL_Frontend
        LB --> BE_Frontend
        LB --> DE_Frontend
        
        NL_Frontend --> Saleor_API
        BE_Frontend --> Saleor_API
        DE_Frontend --> Saleor_API
        
        Saleor_API --- DB
        Saleor_API --- Cache
        Saleor_Dashboard --- DB
    end
    
    subgraph "DNS"
        NL_Domain[domain-nl.com]
        BE_Domain[domain-be.com]
        DE_Domain[domain-de.com]
        
        NL_Domain --> LB
        BE_Domain --> LB
        DE_Domain --> LB
    end
```

This architecture is designed to leverage Saleor's Channel feature for comprehensive multi-region support, while providing a flexible and performant framework for multi-language capabilities across all storefronts. 