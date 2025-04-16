---
layout: default
title: Home
nav_order: 1
description: "Documentation for the Bolen Ana Pro - Saleor Migration Project"
permalink: /
---

# Bolen Ana Pro - Documentation

Welcome to the documentation for the Bolen Ana Pro Saleor Migration Project. This site contains comprehensive documentation for the migration from Statamic CMS with Simple Commerce to Saleor, with a focus on multi-region and multi-language support.

## Project Overview

We are migrating from Statamic CMS with Simple Commerce to Saleor, a headless e-commerce platform. The migration includes:

1. **Multi-Region Support**: Implementing separate stores for the Netherlands, Belgium, and Germany using Saleor's Channel system
2. **Multi-Language Support**: Supporting content in Dutch, German, English, and French with Saleor's translation capabilities
3. **Nimara Framework**: Utilizing the Nimara e-commerce framework, a production-ready storefront built specifically for Saleor

## Key Information

- **Saleor Version**: 3.15
- **Frontend Framework**: Next.js 14 with App Router via Nimara
- **Component Library**: shadcn/ui with Tailwind CSS
- **State Management**: Zustand
- **Deployment**: Docker with CI/CD pipeline

## Key Resources

### Architecture
- [Architecture Overview]({{ site.baseurl }}/architecture/) - Comprehensive architecture documentation
- [Multi-Region Implementation]({{ site.baseurl }}/multi-region-language/multi-region-implementation/) - Details on our multi-region approach
- [Multi-Language Implementation]({{ site.baseurl }}/multi-region-language/multi-language-implementation/) - Documentation for multi-language support

### Migration
- [Data Migration Guide]({{ site.baseurl }}/migration/data-migration/) - Data migration process from Statamic to Saleor
- [Nimara Migration Guide]({{ site.baseurl }}/migration/nimara-migration-guide/) - Guide for migrating to the Nimara e-commerce framework

### Development
- [Development Workflow]({{ site.baseurl }}/development/workflow/) - Development process and guidelines
- [GraphQL API Reference]({{ site.baseurl }}/development/graphql-api/) - Documentation for working with Saleor's GraphQL API

## Current Focus: Nimara Framework Migration

We are currently transitioning from our custom Next.js storefront to the Nimara e-commerce framework. This migration will provide several benefits:

1. **Mature Architecture**: A well-structured monorepo using Turborepo
2. **Complete Feature Set**: Built-in user authentication, payment processing, and other advanced features
3. **Modern UI Components**: Access to shadcn/ui components for better accessibility and design
4. **Production-Ready**: Developed specifically for Saleor with appropriate best practices

See the [Nimara Migration Guide]({{ site.baseurl }}/migration/nimara-migration-guide/) for detailed information.

## Recent Updates

- **2023-05-15**: Decision to adopt Nimara e-commerce framework
- **2023-05-01**: Completed initial custom storefront implementation
- **2023-04-15**: Finalized multi-region and multi-language implementation approach
- **2023-04-01**: Completed architecture design for Saleor migration

---

This documentation is maintained by the Bolen Ana Pro development team. 