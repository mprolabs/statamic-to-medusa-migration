---
title: Compute Requirements
parent: Infrastructure
nav_order: 2
has_toc: true
multilang_export: true
permalink: /infrastructure/compute/
---

# Compute Requirements

This document outlines the compute requirements for the Saleor e-commerce platform, designed to support multi-region and multi-language capabilities.

## Containerization Strategy

All application components will be containerized using Docker with the following benefits:

- **Consistency**: Identical environments across development, staging, and production
- **Isolation**: Clear separation between application components
- **Portability**: Ability to run workloads on different infrastructure if needed
- **Scalability**: Easier horizontal scaling of application components
- **Version Control**: Precise control of application dependencies

## Orchestration Platform: Amazon EKS

Amazon Elastic Kubernetes Service (EKS) has been selected as the primary orchestration platform for the following reasons:

- **Multi-region Support**: Ability to deploy across multiple regions
- **Scaling Capabilities**: Advanced auto-scaling at pod and node levels
- **High Availability**: Built-in redundancy and failover capabilities
- **Service Discovery**: Native service discovery for microservices architecture
- **Integration**: Strong integration with AWS services
- **Community Support**: Robust ecosystem of tools and extensions

## Environment Specifications

### Development Environment

| Component | Specification | Notes |
|-----------|---------------|-------|
| **EKS Cluster** | 1 cluster, 2 nodes | Single-region deployment |
| **Node Type** | t3.medium | 2 vCPU, 4GB RAM |
| **Worker Nodes** | 2 per availability zone | Minimum for basic redundancy |
| **Auto-scaling** | Disabled | Fixed resources for predictability |
| **Region** | eu-west-1 (Ireland) | Primary development region |

### Staging Environment

| Component | Specification | Notes |
|-----------|---------------|-------|
| **EKS Cluster** | 1 cluster, 3 nodes | Multi-AZ deployment |
| **Node Type** | t3.large | 2 vCPU, 8GB RAM |
| **Worker Nodes** | 3 per availability zone | For load testing and validation |
| **Auto-scaling** | Enabled (2-6 nodes) | Test scaling behavior |
| **Region** | eu-west-1 (Ireland) | Match production primary region |

### Production Environment

| Component | Specification | Notes |
|-----------|---------------|-------|
| **EKS Clusters** | 3 clusters (1 per region) | Multi-region deployment |
| **Node Types** | Primary: m5.xlarge<br>Worker: c5.xlarge | 4 vCPU, 16GB RAM<br>4 vCPU, 8GB RAM |
| **Worker Nodes** | Min: 4 per region<br>Max: 12 per region | Balance of redundancy and cost |
| **Auto-scaling** | Enabled with predictive scaling | Based on traffic patterns |
| **Regions** | eu-central-1, eu-west-1, eu-west-3 | Cover all target markets |

## Application Component Requirements

### Saleor Core API

| Environment | CPU Request | Memory Request | CPU Limit | Memory Limit | Replicas |
|-------------|-------------|----------------|-----------|--------------|----------|
| Development | 0.5 CPU | 1GB | 1 CPU | 2GB | 1 |
| Staging | 1 CPU | 2GB | 2 CPU | 4GB | 2 |
| Production | 2 CPU | 4GB | 4 CPU | 8GB | 3-6 per region |

### Saleor Dashboard

| Environment | CPU Request | Memory Request | CPU Limit | Memory Limit | Replicas |
|-------------|-------------|----------------|-----------|--------------|----------|
| Development | 0.25 CPU | 512MB | 0.5 CPU | 1GB | 1 |
| Staging | 0.5 CPU | 1GB | 1 CPU | 2GB | 2 |
| Production | 1 CPU | 2GB | 2 CPU | 4GB | 2-4 per region |

### Next.js Storefront

| Environment | CPU Request | Memory Request | CPU Limit | Memory Limit | Replicas |
|-------------|-------------|----------------|-----------|--------------|----------|
| Development | 0.25 CPU | 512MB | 0.5 CPU | 1GB | 1 |
| Staging | 0.5 CPU | 1GB | 1 CPU | 2GB | 2 |
| Production | 1 CPU | 2GB | 2 CPU | 4GB | 4-8 per region |

### Background Workers

| Environment | CPU Request | Memory Request | CPU Limit | Memory Limit | Replicas |
|-------------|-------------|----------------|-----------|--------------|----------|
| Development | 0.25 CPU | 512MB | 0.5 CPU | 1GB | 1 |
| Staging | 0.5 CPU | 1GB | 1 CPU | 2GB | 1 |
| Production | 1 CPU | 2GB | 2 CPU | 4GB | 2-4 per region |

## Scaling Parameters

### Horizontal Pod Autoscaler (HPA) Settings

| Component | Scale Metric | Target Value | Min Pods | Max Pods | Cooldown Period |
|-----------|--------------|--------------|----------|----------|----------------|
| Saleor API | CPU Utilization | 70% | 3 | 12 | 3 minutes |
| Next.js Storefront | CPU Utilization | 75% | 4 | 16 | 2 minutes |
| Saleor Dashboard | CPU Utilization | 75% | 2 | 6 | 5 minutes |
| Background Workers | Queue Length | 100 messages | 2 | 8 | 3 minutes |

### Cluster Autoscaler Settings

| Environment | Min Nodes | Max Nodes | Scale-up Threshold | Scale-down Threshold |
|-------------|-----------|-----------|---------------------|----------------------|
| Development | 2 | 2 | N/A | N/A |
| Staging | 2 | 6 | 80% utilized | 40% utilized for 10min |
| Production | 4 | 12 | 70% utilized | 50% utilized for 15min |

## Special Compute Requirements

### Multi-Region Considerations

- **Compute Distribution**: Primary workloads in all regions with capacity to handle failover
- **Region Weighting**: Capacity allocated based on market size (DE: 40%, NL: 35%, BE: 25%)
- **Data Synchronization**: Asynchronous message-based approach to maintain consistency
- **Failover Strategy**: Active-active configuration with load balancing between regions

### Batch Processing

- **ETL Workloads**: Dedicated node group for extract, transform, load processes
- **Node Type**: c5.2xlarge (8 vCPU, 16GB RAM)
- **Scheduling**: Off-peak hours with Kubernetes CronJobs
- **Resource Isolation**: Kubernetes taints and tolerations to separate from regular workloads

### High-Traffic Events

For sale events or marketing campaigns, the following adjustments will be made:

- **Pre-warming**: Increase minimum node count 24 hours before event
- **Scaling Threshold Adjustment**: Lower CPU threshold to 60% for quicker scaling
- **Database Read Replicas**: Add additional read replicas for query-intensive workloads
- **CDN Cache**: Increase cache TTL for static assets

## Compute Resource Estimation

| Environment | Total vCPU (Base) | Total RAM (Base) | Total vCPU (Peak) | Total RAM (Peak) | Monthly Cost (Est.) |
|-------------|-------------------|------------------|-------------------|------------------|---------------------|
| Development | 4 vCPU | 8GB | 4 vCPU | 8GB | $300-400 |
| Staging | 8 vCPU | 24GB | 16 vCPU | 48GB | $800-1,000 |
| Production | 48 vCPU | 144GB | 120 vCPU | 360GB | $5,000-7,000 |

These estimates include EKS control plane costs and are based on current AWS pricing. Reserved instances will be used to reduce these costs in production. 