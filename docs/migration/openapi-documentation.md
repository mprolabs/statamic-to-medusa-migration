---
title: OpenAPI Documentation
parent: Migration
nav_order: 6
---

# OpenAPI Documentation

While Saleor primarily uses GraphQL for its API, this document provides OpenAPI/Swagger documentation for REST endpoints and integration points that supplement the GraphQL API.

## API Information

```yaml
openapi: 3.0.3
info:
  title: Saleor Migration API
  description: API documentation for the Statamic to Saleor migration project with multi-region and multi-language support
  version: 1.0.0
  contact:
    name: Development Team
    email: dev@example.com
  license:
    name: MIT
servers:
  - url: https://api.{region}.example.com/v1
    description: Production API server for region-specific endpoints
    variables:
      region:
        enum:
          - nl
          - be
          - de
        default: nl
  - url: https://staging-api.example.com/v1
    description: Staging API server
```

## Authentication

```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token obtained from Saleor GraphQL API
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
      description: API key for service-to-service authentication

security:
  - BearerAuth: []
  - ApiKeyAuth: []
```

## Common Components

```yaml
components:
  schemas:
    Error:
      type: object
      properties:
        code:
          type: string
          description: Error code
        message:
          type: string
          description: Error message
        field:
          type: string
          description: Field associated with the error
      required:
        - code
        - message
    
    Pagination:
      type: object
      properties:
        total:
          type: integer
          description: Total number of items
        page:
          type: integer
          description: Current page number
        pageSize:
          type: integer
          description: Number of items per page
        pages:
          type: integer
          description: Total number of pages
      required:
        - total
        - page
        - pageSize
        - pages
    
    RegionInfo:
      type: object
      properties:
        code:
          type: string
          description: Region code (e.g., nl, be, de)
        name:
          type: string
          description: Region name
        channel:
          type: string
          description: Corresponding Saleor channel ID
        defaultLanguage:
          type: string
          description: Default language code for the region
      required:
        - code
        - name
        - channel
        - defaultLanguage
    
    LanguageInfo:
      type: object
      properties:
        code:
          type: string
          description: Language code (e.g., nl, de, en)
        name:
          type: string
          description: Language name
        isDefault:
          type: boolean
          description: Whether this is the default language
      required:
        - code
        - name
        - isDefault
```

## Endpoints

### Migration Status Endpoints

```yaml
paths:
  /migration/status:
    get:
      summary: Get migration status
      description: Returns the current status of the migration process
      operationId: getMigrationStatus
      tags:
        - Migration
      security:
        - BearerAuth: []
        - ApiKeyAuth: []
      parameters:
        - name: entity
          in: query
          description: Filter by entity type
          schema:
            type: string
            enum: [products, categories, customers, orders]
      responses:
        '200':
          description: Migration status retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [not_started, in_progress, completed, failed]
                  progress:
                    type: number
                    format: float
                    description: Progress percentage (0-100)
                  entities:
                    type: object
                    properties:
                      products:
                        type: object
                        properties:
                          total:
                            type: integer
                          migrated:
                            type: integer
                          failed:
                            type: integer
                      categories:
                        type: object
                        properties:
                          total:
                            type: integer
                          migrated:
                            type: integer
                          failed:
                            type: integer
                      customers:
                        type: object
                        properties:
                          total:
                            type: integer
                          migrated:
                            type: integer
                          failed:
                            type: integer
                      orders:
                        type: object
                        properties:
                          total:
                            type: integer
                          migrated:
                            type: integer
                          failed:
                            type: integer
                  lastUpdated:
                    type: string
                    format: date-time
                required:
                  - status
                  - progress
                  - entities
                  - lastUpdated
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '403':
          description: Forbidden
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
  
  /migration/logs:
    get:
      summary: Get migration logs
      description: Returns logs from the migration process
      operationId: getMigrationLogs
      tags:
        - Migration
      security:
        - BearerAuth: []
        - ApiKeyAuth: []
      parameters:
        - name: entity
          in: query
          description: Filter by entity type
          schema:
            type: string
            enum: [products, categories, customers, orders]
        - name: level
          in: query
          description: Filter by log level
          schema:
            type: string
            enum: [info, warning, error]
        - name: page
          in: query
          description: Page number
          schema:
            type: integer
            default: 1
        - name: pageSize
          in: query
          description: Number of items per page
          schema:
            type: integer
            default: 50
      responses:
        '200':
          description: Migration logs retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  logs:
                    type: array
                    items:
                      type: object
                      properties:
                        timestamp:
                          type: string
                          format: date-time
                        level:
                          type: string
                          enum: [info, warning, error]
                        entity:
                          type: string
                        message:
                          type: string
                        details:
                          type: object
                      required:
                        - timestamp
                        - level
                        - message
                  pagination:
                    $ref: '#/components/schemas/Pagination'
                required:
                  - logs
                  - pagination
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '403':
          description: Forbidden
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
```

### Region and Language Configuration Endpoints

```yaml
paths:
  /config/regions:
    get:
      summary: Get region configuration
      description: Returns configuration for all supported regions
      operationId: getRegions
      tags:
        - Configuration
      responses:
        '200':
          description: Region configuration retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  regions:
                    type: array
                    items:
                      $ref: '#/components/schemas/RegionInfo'
                  defaultRegion:
                    type: string
                    description: Default region code
                required:
                  - regions
                  - defaultRegion
    
  /config/languages:
    get:
      summary: Get language configuration
      description: Returns configuration for all supported languages
      operationId: getLanguages
      tags:
        - Configuration
      responses:
        '200':
          description: Language configuration retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  languages:
                    type: array
                    items:
                      $ref: '#/components/schemas/LanguageInfo'
                  defaultLanguage:
                    type: string
                    description: Default language code
                required:
                  - languages
                  - defaultLanguage
```

### Webhook Endpoints

```yaml
paths:
  /webhooks/saleor:
    post:
      summary: Saleor webhook endpoint
      description: Endpoint for receiving webhook notifications from Saleor
      operationId: handleSaleorWebhook
      tags:
        - Webhooks
      security:
        - ApiKeyAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                event:
                  type: string
                  description: Event type
                payload:
                  type: object
                  description: Event payload
              required:
                - event
                - payload
      responses:
        '200':
          description: Webhook processed successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                required:
                  - success
        '400':
          description: Bad request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
```

### Health Check Endpoints

```yaml
paths:
  /health:
    get:
      summary: Health check
      description: Endpoint for checking the health of the API
      operationId: healthCheck
      tags:
        - System
      responses:
        '200':
          description: Service is healthy
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [ok, degraded]
                  version:
                    type: string
                  timestamp:
                    type: string
                    format: date-time
                required:
                  - status
                  - version
                  - timestamp
        '503':
          description: Service is unhealthy
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [error]
                  message:
                    type: string
                  timestamp:
                    type: string
                    format: date-time
                required:
                  - status
                  - message
                  - timestamp
```

## Integration with GraphQL API

The REST endpoints documented above complement the GraphQL API by providing:

1. **Migration-specific functionality** that isn't part of the core Saleor API
2. **Configuration endpoints** for region and language settings
3. **Webhook receivers** for event-driven integrations
4. **System health monitoring** endpoints

For all core e-commerce operations, the Saleor GraphQL API should be used as documented in the [API Specifications](api-specifications.md) document.

## Swagger UI Integration

A live Swagger UI will be available at:

```
https://api.example.com/docs
```

This interactive documentation allows developers to:

1. Browse available endpoints
2. Test API calls directly from the browser
3. View request/response schemas
4. Authenticate with the API

## How to Use This Documentation

### For Frontend Developers

1. Use the GraphQL API for most e-commerce operations
2. Use REST endpoints for configuration and system status
3. Implement proper error handling as described in the responses

### For Integration Developers

1. Set up webhook endpoints to receive event notifications
2. Use the migration status endpoints to monitor progress
3. Implement proper authentication using JWT tokens or API keys

### For DevOps

1. Use health check endpoints for monitoring system status
2. Set up alerts based on health check responses
3. Monitor webhook delivery and processing metrics

## Documentation Updates

This OpenAPI specification will be maintained as the project evolves. Changes to the API will be documented in the changelog and reflected in this document. 