# Component Migration Mapping

This document maps our existing custom components to their Nimara/shadcn/ui equivalents and tracks the migration status.

## Component Mapping

| Current Component | Nimara/shadcn/ui Equivalent | Migration Status | Notes |
|-------------------|----------------------------|------------------|-------|
| `Header.tsx` | Nimara Header + shadcn/ui navigation-menu | In Progress | Implemented shadcn/ui navigation menu, dropdown, and sheets |
| `ProductList.tsx` | Nimara Products Grid + shadcn/ui card | Completed | Implemented with filtering and pagination support |
| `ProductCard.tsx` | Nimara ProductCard + shadcn/ui card | Completed | Migrated to use shadcn/ui card component |
| `ProductDetail.tsx` | Nimara ProductDetails | Completed | Implemented with skeleton loading, variant selection, and quantity controls |
| `CartDrawer.tsx` | Nimara Cart + shadcn/ui sheet | Completed | Migrated to use shadcn/ui sheet component |
| `RegionSelector.tsx` | Nimara RegionSelector + shadcn/ui select | In Progress | Structure migrated but has dependency issues |
| `LanguageSelector.tsx` | Nimara LanguageSelector + shadcn/ui select | Completed | Migrated to use shadcn/ui select component |

## Page Mapping

| Current Page | Nimara Equivalent | Migration Status | Notes |
|--------------|-------------------|------------------|-------|
| Home Page | Nimara Home | Not Started | Hero, featured products, categories |
| Product Listing | Nimara ProductList | Not Started | Pagination, filtering, sorting |
| Product Detail | Nimara ProductDetail | Not Started | Product info, variants, add to cart |
| Cart | Nimara Cart | Not Started | Cart review, quantity adjustment |
| Checkout | Nimara Checkout | Not Started | Multi-step checkout process |
| Account Pages | Nimara Account | Not Started | Login, registration, profile |

## Migration Progress

- [x] Set up Nimara framework
- [x] Configure multi-region support in Nimara
- [x] Configure multi-language support in Nimara
- [x] Migrate CartDrawer component
- [x] Migrate ProductCard component
- [x] Migrate ProductList component
- [x] Migrate ProductDetail component
- [x] Migrate Header component
- [x] Migrate RegionSelector component (structure)
- [x] Add missing shadcn/ui components
- [x] Migrate LanguageSelector component
- [x] Fix dependency issues (added missing packages)
- [ ] Implement Home page
- [ ] Implement Product Listing page
- [ ] Implement Product Detail page
- [ ] Implement Cart page
- [ ] Implement Checkout flow
- [ ] Implement Account pages
- [ ] Final testing and validation 