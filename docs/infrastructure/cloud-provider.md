---
title: Cloud Provider Requirements
parent: Infrastructure
nav_order: 1
has_toc: true
multilang_export: true
permalink: /infrastructure/cloud-provider/
---

# Cloud Provider Requirements

This document specifies the cloud provider requirements for the Saleor e-commerce platform, focusing on multi-region and multi-language capabilities.

## Selected Cloud Provider: AWS

After evaluating multiple cloud providers, AWS has been selected as the primary cloud platform for the following reasons:

- **Global Infrastructure**: Extensive presence in EU regions for low-latency access in target markets (NL, BE, DE)
- **Managed Database Services**: Native PostgreSQL support through RDS or Aurora
- **Content Delivery**: CloudFront CDN for edge caching of static assets and content
- **Containerization Support**: ECS/EKS for container orchestration
- **Multi-region Capabilities**: Robust cross-region replication for high availability
- **Compliance**: Strong EU compliance and data sovereignty features

## Region Strategy

The infrastructure will be deployed across multiple AWS regions to support the multi-region requirements:

| Region Code | Primary Region | Purpose |
|-------------|----------------|---------|
| eu-central-1 | Frankfurt | Primary region for DE market |
| eu-west-1 | Ireland | Primary region for NL/BE markets, backup for DE |
| eu-west-3 | Paris | Backup region for NL/BE markets |

All production workloads will be deployed with cross-region redundancy to ensure high availability and disaster recovery capabilities.

## Account Structure

The following AWS account structure will be implemented:

- **Production Account**: For all production workloads
- **Staging Account**: For pre-production testing and validation
- **Development Account**: For development and integration testing
- **Management Account**: For shared services (monitoring, logging, security)

This separation ensures proper isolation between environments and reduces the risk of accidental changes to production resources.

## Required AWS Services

| Service | Usage | Requirements |
|---------|-------|--------------|
| **EC2/ECS/EKS** | Container hosting | Appropriate instance types for Saleor workloads |
| **RDS for PostgreSQL** | Database | Multi-AZ deployment, read replicas for scaling |
| **ElastiCache** | Redis caching | Clustered mode for performance |
| **S3** | Object storage | Cross-region replication for media assets |
| **CloudFront** | CDN | Edge caching with regional routing |
| **Route 53** | DNS | Latency-based routing for multi-region support |
| **API Gateway** | API management | Regional endpoints for API access |
| **Lambda** | Serverless functions | Event-driven processing |
| **SQS/SNS** | Messaging | Asynchronous processing and notifications |
| **CloudWatch** | Monitoring | Comprehensive metric collection |
| **Certificate Manager** | SSL/TLS | Domain certificates for all regional endpoints |
| **IAM** | Identity management | Least-privilege access controls |
| **WAF** | Web application firewall | Security for public-facing resources |

## Cost Optimization

The following cost-optimization strategies will be implemented:

- **Reserved Instances**: For predictable workloads to reduce compute costs
- **Auto-scaling**: Scale resources based on demand
- **Savings Plans**: For workloads with variable resource needs but consistent spending
- **Spot Instances**: For non-critical, fault-tolerant batch workloads
- **Data Transfer Optimization**: Strategic placement of resources to minimize cross-region data transfer costs
- **Resource Tagging**: Implement comprehensive tagging for cost allocation and analysis

## Compliance and Security

The cloud infrastructure will be configured to support:

- **GDPR Compliance**: Data residency and processing requirements for EU customers
- **PCI DSS**: For secure payment processing
- **Data Encryption**: At-rest and in-transit encryption for all sensitive data
- **Network Isolation**: VPC design with private subnets for sensitive workloads
- **Access Controls**: Strict IAM policies and multi-factor authentication
- **Automated Security Scanning**: Regular vulnerability assessments

## Alternatives and Fallbacks

While AWS is the primary cloud provider, the architecture will be designed to minimize vendor lock-in where possible. Critical components may be configured for potential migration to alternative cloud providers if needed:

- **Microsoft Azure**: Secondary option with strong EU presence
- **Google Cloud Platform**: Tertiary option with specialized machine learning capabilities if needed for future enhancements 