---
layout: default
title: Data Flow
description: Data flow diagrams and explanations for the Saleor migration project
parent: Architecture
permalink: /architecture/data-flow/
---

# Data Flow Diagrams

This document outlines the data flow between different components of our Saleor-based ecommerce system.

## Overview

Our architecture uses Saleor as the central ecommerce platform with a Next.js storefront for the customer-facing interface. The system handles multi-region and multi-language requirements through Saleor's Channels feature.

## Customer Purchase Flow

```mermaid
sequenceDiagram
    Customer->>NextJS Storefront: Browse Products
    NextJS Storefront->>Saleor API: Query Products (channel specific)
    Saleor API->>NextJS Storefront: Return Products with translations
    Customer->>NextJS Storefront: Add to Cart
    NextJS Storefront->>Saleor API: Create/Update Checkout
    Customer->>NextJS Storefront: Proceed to Checkout
    NextJS Storefront->>Saleor API: Create Order
    Saleor API->>Payment Provider: Process Payment
    Payment Provider->>Saleor API: Payment Confirmation
    Saleor API->>NextJS Storefront: Order Confirmation
    NextJS Storefront->>Customer: Display Order Confirmation
    Saleor API->>Email Service: Send Order Confirmation
    Email Service->>Customer: Order Confirmation Email
```

## Multi-Region Data Flow

```mermaid
flowchart TD
    Customer([Customer])
    subgraph Domains
        NL[domain-nl.com]
        BE[domain-be.com]
        DE[domain-de.com]
    end
    
    subgraph NextJS
        Router[Domain Router]
        NL_Store[NL Storefront]
        BE_Store[BE Storefront]
        DE_Store[DE Storefront]
    end
    
    subgraph Saleor
        API[GraphQL API]
        Channels[Channels]
        NL_Channel[Netherlands Channel]
        BE_Channel[Belgium Channel]
        DE_Channel[Germany Channel]
        Products[Products]
        Prices[Prices]
        Translations[Translations]
    end
    
    Customer --> Domains
    NL --> Router
    BE --> Router
    DE --> Router
    
    Router --> NL_Store
    Router --> BE_Store
    Router --> DE_Store
    
    NL_Store --> API
    BE_Store --> API
    DE_Store --> API
    
    API --> Channels
    Channels --> NL_Channel
    Channels --> BE_Channel
    Channels --> DE_Channel
    
    NL_Channel --> Products
    BE_Channel --> Products
    DE_Channel --> Products
    
    NL_Channel --> Prices
    BE_Channel --> Prices
    DE_Channel --> Prices
    
    Products --> Translations
```

## Product Creation and Update Flow

```mermaid
sequenceDiagram
    Admin->>Saleor Dashboard: Create/Update Product
    Saleor Dashboard->>Saleor API: Save Product Data
    Saleor API->>Database: Store Base Product Data
    Admin->>Saleor Dashboard: Add Translations
    Saleor Dashboard->>Saleor API: Save Translations
    Saleor API->>Database: Store Translations
    Admin->>Saleor Dashboard: Configure Channel Availability
    Saleor Dashboard->>Saleor API: Set Channel Settings
    Saleor API->>Database: Store Channel Configuration
    Admin->>Saleor Dashboard: Set Channel-specific Prices
    Saleor Dashboard->>Saleor API: Save Channel Prices
    Saleor API->>Database: Store Channel-specific Pricing
    Saleor API->>NextJS Storefront: Product data available via API
```

## Migration Data Flow

The migration from Statamic and Simple Commerce to Saleor will follow this flow:

```mermaid
flowchart TD
    subgraph "Source: Statamic"
        SC[Simple Commerce]
        SC_Products[Products]
        SC_Orders[Orders]
        SC_Customers[Customers]
        SC_Collections[Collections]
        
        SC --> SC_Products
        SC --> SC_Orders
        SC --> SC_Customers
        SC --> SC_Collections
    end
    
    subgraph "Migration Process"
        Extract[Data Extraction Scripts]
        Transform[Data Transformation]
        Load[Data Loading Scripts]
        
        Extract --> Transform
        Transform --> Load
    end
    
    subgraph "Target: Saleor"
        Saleor[Saleor Core]
        S_Products[Products]
        S_Orders[Orders]
        S_Customers[Customers]
        S_Categories[Categories]
        S_Channels[Channels]
        
        Saleor --> S_Products
        Saleor --> S_Orders
        Saleor --> S_Customers
        Saleor --> S_Categories
        Saleor --> S_Channels
    end
    
    SC_Products --> Extract
    SC_Orders --> Extract
    SC_Customers --> Extract
    SC_Collections --> Extract
    
    Load --> S_Products
    Load --> S_Orders
    Load --> S_Customers
    Load --> S_Categories
    Load --> S_Channels
```

## Authentication Flow

```mermaid
sequenceDiagram
    Customer->>NextJS Storefront: Login Request
    NextJS Storefront->>Saleor API: tokenCreate Mutation
    Saleor API->>NextJS Storefront: Return JWT Token
    NextJS Storefront->>Customer: Login Success
    Customer->>NextJS Storefront: Access Protected Page
    NextJS Storefront->>Saleor API: Request with JWT
    Saleor API->>NextJS Storefront: Return Protected Data
    NextJS Storefront->>Customer: Display Protected Content
```

## Search Flow

```mermaid
sequenceDiagram
    Customer->>NextJS Storefront: Search Query
    NextJS Storefront->>Saleor API: products Query with Filter
    Saleor API->>NextJS Storefront: Return Filtered Products
    NextJS Storefront->>Customer: Display Search Results
```

## Checkout Flow

```mermaid
flowchart TD
    Start([Customer Starts Checkout])
    CreateCheckout[Create Checkout in Saleor]
    AddInfo[Add Customer Information]
    SelectShipping[Select Shipping Method]
    SelectPayment[Select Payment Method]
    Process[Process Payment]
    Complete[Complete Order]
    Confirmation[Order Confirmation]
    
    Start --> CreateCheckout
    CreateCheckout --> AddInfo
    AddInfo --> SelectShipping
    SelectShipping --> SelectPayment
    SelectPayment --> Process
    Process -->|Success| Complete
    Process -->|Failure| SelectPayment
    Complete --> Confirmation
    
    subgraph "Saleor GraphQL API"
        CreateCheckout
        AddInfo
        SelectShipping
        SelectPayment
        Process
        Complete
    end
    
    subgraph "NextJS Storefront"
        Start
        Confirmation
    end
``` 