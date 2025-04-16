---
title: Storage Requirements
parent: Infrastructure
nav_order: 3
has_toc: true
multilang_export: true
permalink: /infrastructure/storage/
---

# Storage Requirements

This document outlines the storage requirements for the Saleor e-commerce platform with multi-region and multi-language capabilities.

## Database Storage

### PostgreSQL for Saleor

Saleor's primary database will be PostgreSQL, hosted on AWS RDS or Aurora PostgreSQL:

| Environment | Instance Type | Storage Type | Initial Size | Max Size | Scaling |
|-------------|--------------|--------------|--------------|----------|---------|
| Development | db.t3.medium | gp3 | 20GB | 100GB | Manual |
| Staging | db.t3.large | gp3 | 50GB | 200GB | Manual |
| Production | db.r5.xlarge | io1 | 100GB | 1TB | Auto-scaling |

#### Production Database Configuration

- **Multi-AZ Deployment**: Yes, for high availability
- **Read Replicas**: 1 per region for read scaling
- **Backup Strategy**: Daily automated snapshots, retained for 30 days
- **Performance Insights**: Enabled
- **Enhanced Monitoring**: Enabled with 15-second intervals
- **Storage Provisioned IOPS**: 3000 IOPS baseline
- **Storage Throughput**: 500 MB/s
- **Auto Minor Version Upgrade**: Enabled
- **Monitoring**: CloudWatch alarms for storage/CPU/memory thresholds

### Redis for Caching

ElastiCache for Redis will be used for caching and session storage:

| Environment | Node Type | Nodes | Shards | Memory Allocation | Scaling |
|-------------|-----------|-------|--------|-------------------|---------|
| Development | cache.t3.small | 1 | 1 | 1.37GB | Manual |
| Staging | cache.t3.medium | 2 | 1 | 3.09GB | Manual |
| Production | cache.m5.large | 3 per region | 3 | 6.38GB per node | Auto-scaling |

#### Production Redis Configuration

- **Redis Version**: 6.2 or later
- **Cluster Mode**: Enabled
- **Multi-AZ**: Enabled
- **Automatic Failover**: Enabled
- **Backup Strategy**: Daily snapshots, retained for 7 days
- **Parameter Group**: Custom with optimized memory policies
- **Data Tiering**: Disabled (all data in memory)
- **Encryption**: At-rest and in-transit
- **Maintenance Window**: Configured outside business hours

## Object Storage

Amazon S3 will be used for object storage:

### Bucket Configuration

| Bucket Purpose | Replication | Versioning | Lifecycle Policy | Access Pattern |
|----------------|-------------|------------|------------------|----------------|
| Product Media | Cross-region | Enabled | 30-day previous versions | Read-heavy |
| Customer Uploads | Cross-region | Enabled | 90-day previous versions | Read/write balanced |
| Static Assets | Cross-region | Enabled | Keep only latest version | Read-heavy |
| Reports/Exports | No replication | Disabled | Delete after 30 days | Infrequent access |
| Logs/Backups | Cross-region | Enabled | Archive to Glacier after 30 days | Write-heavy, infrequent reads |

### Storage Classes

- **Standard**: For product media and active content
- **Intelligent-Tiering**: For customer uploads with variable access patterns
- **One Zone-IA**: For easily reproducible assets like reports
- **Glacier Deep Archive**: For long-term log retention

### Total Storage Estimation

| Environment | Standard S3 | Infrequent Access | Glacier | Total (Year 1) | Annual Growth |
|-------------|------------|-------------------|---------|----------------|---------------|
| Development | 10GB | 5GB | N/A | 15GB | 50% |
| Staging | 20GB | 10GB | 5GB | 35GB | 50% |
| Production | 500GB | 200GB | 300GB | 1TB | 75% |

## Ephemeral Storage

For container-based workloads on EKS:

| Component | Per-Pod Storage | Storage Type | Total Requirements |
|-----------|-----------------|--------------|---------------------|
| Saleor API | 1GB | ephemeral | 12GB (production) |
| Storefront | 500MB | ephemeral | 8GB (production) |
| Dashboard | 500MB | ephemeral | 4GB (production) |
| Workers | 2GB | ephemeral | 16GB (production) |
| ETL Jobs | 5GB | ephemeral | 20GB (production) |

## Persistent Volumes

For stateful workloads requiring persistent storage:

| Component | Size | Storage Class | Access Mode | Backup |
|-----------|------|--------------|-------------|--------|
| Media Processing | 20GB | gp3 | ReadWriteOnce | Daily snapshot |
| Search Index | 50GB | gp3 | ReadWriteOnce | Rebuild from DB |
| Log Aggregation | 100GB | sc1 | ReadWriteOnce | Archive to S3 daily |

## File Transfer and CDN

For distributing static assets and media:

### CloudFront Configuration

| Origin | Cache Behavior | TTL | Origin Protocol Policy |
|--------|----------------|-----|------------------------|
| Product Images | Cache | 1 day | HTTPS Only |
| Static Assets | Cache | 1 week | HTTPS Only |
| API Endpoints | No Cache | 0 | HTTPS Only |

### Edge Caching Estimation

| Content Type | Size per Object | Object Count | Total Size | Cache Hit Ratio |
|--------------|-----------------|--------------|------------|-----------------|
| Product Images | 200KB avg | 10K items | 2GB | 95% |
| Thumbnails | 20KB avg | 30K items | 600MB | 98% |
| Static Assets | 100KB avg | 1K items | 100MB | 99% |

## Multi-Region Storage Considerations

### Data Consistency Strategy

- **Database**: Use AWS DMS to replicate data between regions
- **Redis**: Global Datastore feature for cross-region replication
- **S3**: Cross-region replication with S3 CRR
- **Persistent Volumes**: Region-specific, not replicated

### Regional Storage Distribution

| Region | Database | Redis | S3 Primary Objects | Backup Storage |
|--------|----------|-------|---------------------|----------------|
| eu-central-1 (DE) | Primary | Primary | DE-specific products | Full backup |
| eu-west-1 (NL/BE) | Primary | Primary | NL/BE-specific products | Full backup |
| eu-west-3 (Backup) | Replica | Replica | Replicated objects | Full backup |

## Data Migration Considerations

For the initial migration from Statamic to Saleor:

- **One-time S3 Transfer**: 300GB estimated for media assets
- **Database Import**: 50GB estimated for product, customer, and order data
- **ETL Storage**: 100GB temporary storage during migration process
- **Rollback Storage**: Full copy of initial data preserved for potential rollback (350GB)

## Storage Cost Estimation

| Storage Type | Monthly Storage Size | Monthly Cost |
|--------------|----------------------|--------------|
| RDS/Aurora | 100GB + 100GB replicas | $300-400 |
| ElastiCache | 60GB total across regions | $250-350 |
| S3 Standard | 500GB | $11.50 |
| S3 IA | 200GB | $2.50 |
| S3 Glacier | 300GB | $1.20 |
| EBS Volumes | 200GB | $20 |
| Data Transfer | 1TB out | $90 |
| CloudFront | 5TB out | $425 |
| **Total** | | **$1,100-1,300** |

These estimates are based on current AWS pricing and will be refined during implementation. 