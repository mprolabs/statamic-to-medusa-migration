---
title: Networking Requirements
parent: Infrastructure
nav_order: 4
has_toc: true
multilang_export: true
permalink: /infrastructure/networking/
---

# Networking Requirements

This document outlines the networking requirements for the Saleor e-commerce platform with emphasis on multi-region and multi-language support.

## Domain Architecture

The multi-region approach requires a domain strategy that supports region-specific access:

| Region | Primary Domain | Purpose |
|--------|----------------|---------|
| Netherlands | nl.example.com | Dutch language storefront |
| Belgium | be.example.com | Dutch/French language storefront |
| Germany | de.example.com | German language storefront |
| Global | www.example.com | Main site with geo-routing |

Additionally, the following subdomains will be used for system components:

- **dashboard.example.com**: Admin interface for Saleor Dashboard
- **api.example.com**: GraphQL API endpoint
- **cdn.example.com**: CDN for static assets
- **media.example.com**: Media assets and uploaded files

## DNS Configuration

Route 53 will be used for domain management with the following routing policies:

- **Latency-based Routing**: For www.example.com to direct users to the closest region
- **Geolocation Routing**: For country-specific domains to ensure regulatory compliance
- **Failover Routing**: For critical components to ensure high availability
- **Simple Routing**: For internal services not requiring complex routing

## VPC Design

### Development Environment

A single VPC with simplified networking:

- **VPC CIDR**: 10.0.0.0/16
- **Public Subnets**: 10.0.1.0/24, 10.0.2.0/24 (2 AZs)
- **Private Subnets**: 10.0.3.0/24, 10.0.4.0/24 (2 AZs)
- **Database Subnets**: 10.0.5.0/24, 10.0.6.0/24 (2 AZs)

### Staging Environment

Similar to production but with smaller address ranges:

- **VPC CIDR**: 10.1.0.0/16
- **Public Subnets**: 10.1.1.0/24, 10.1.2.0/24, 10.1.3.0/24 (3 AZs)
- **Private App Subnets**: 10.1.10.0/24, 10.1.11.0/24, 10.1.12.0/24 (3 AZs)
- **Private Data Subnets**: 10.1.20.0/24, 10.1.21.0/24, 10.1.22.0/24 (3 AZs)

### Production Environment

Multiple VPCs across regions:

#### EU-Central-1 (Frankfurt)

- **VPC CIDR**: 10.100.0.0/16
- **Public Subnets**: 10.100.1.0/24, 10.100.2.0/24, 10.100.3.0/24 (3 AZs)
- **Private App Subnets**: 10.100.10.0/24, 10.100.11.0/24, 10.100.12.0/24 (3 AZs)
- **Private Data Subnets**: 10.100.20.0/24, 10.100.21.0/24, 10.100.22.0/24 (3 AZs)

#### EU-West-1 (Ireland)

- **VPC CIDR**: 10.101.0.0/16
- **Public Subnets**: 10.101.1.0/24, 10.101.2.0/24, 10.101.3.0/24 (3 AZs)
- **Private App Subnets**: 10.101.10.0/24, 10.101.11.0/24, 10.101.12.0/24 (3 AZs)
- **Private Data Subnets**: 10.101.20.0/24, 10.101.21.0/24, 10.101.22.0/24 (3 AZs)

#### EU-West-3 (Paris)

- **VPC CIDR**: 10.102.0.0/16
- **Public Subnets**: 10.102.1.0/24, 10.102.2.0/24, 10.102.3.0/24 (3 AZs)
- **Private App Subnets**: 10.102.10.0/24, 10.102.11.0/24, 10.102.12.0/24 (3 AZs)
- **Private Data Subnets**: 10.102.20.0/24, 10.102.21.0/24, 10.102.22.0/24 (3 AZs)

## Network Services

### Load Balancers

| Component | Type | SSL Termination | Cross-Zone | Stickiness |
|-----------|------|-----------------|------------|------------|
| Storefront | ALB | Yes | Yes | No |
| GraphQL API | ALB | Yes | Yes | No |
| Admin Dashboard | ALB | Yes | Yes | Session-based |
| Internal Services | NLB | No | Yes | No |

### Transit Gateway

To connect multiple VPCs across regions:

- **Transit Gateway**: Deployed in eu-west-1 (Ireland)
- **TGW Route Tables**: Separate tables for public, private, and data subnets
- **VPC Attachments**: All production VPCs attached with proper route propagation
- **TGW Peering**: Cross-region peering connections between all regions

### CDN Configuration

CloudFront will be configured with the following settings:

- **Origins**: S3 buckets and ALB endpoints
- **Distribution Per Region**: Yes, for region-specific assets
- **Custom SSL Certificates**: Required for all domains
- **Price Class**: Use All Edge Locations for global presence
- **TTL Settings**: Vary by content type (see Storage Requirements)
- **Lambda@Edge**: For country-specific logic and language detection

## Security Groups & NACLs

### Pattern for Security Groups

| Group | Purpose | Inbound | Outbound |
|-------|---------|---------|----------|
| ALB | Public-facing load balancers | 80, 443 from 0.0.0.0/0 | All to private app subnets |
| Web | Application tier | 80, 443 from ALB SG | All to data subnets, HTTPS to internet |
| Data | Database and cache tier | DB ports from Web SG | No outbound |
| Mgmt | Management and operations | SSH from VPN, monitoring ports | All to all SGs |

### Network ACLs

| NACL | Purpose | Inbound Rules | Outbound Rules |
|------|---------|---------------|----------------|
| Public | Protect public subnets | Allow 80, 443, ephemeral ports | Allow established, HTTP/S |
| Private | Protect app subnets | App ports from public, VPC CIDR | Allow established, HTTP/S |
| Data | Protect data subnets | DB ports from private subnets | Allow established to private |

## Network Connectivity

### VPN and DirectConnect

- **VPN**: AWS Site-to-Site VPN for secure management access
- **Customer Gateway**: Located at corporate headquarters
- **Virtual Private Gateway**: One per region
- **VPN Type**: IPsec with dynamic routing

### Service Endpoints

The following VPC endpoints will be implemented to reduce data egress costs:

| Service | Endpoint Type | Purpose |
|---------|--------------|---------|
| S3 | Gateway | Access to S3 buckets without internet |
| DynamoDB | Gateway | Access to DynamoDB without internet |
| ECR | Interface | Pull container images privately |
| CloudWatch | Interface | Log delivery from VPC |
| SQS | Interface | Message queue access |
| SNS | Interface | Notification service access |
| Secrets Manager | Interface | Secure access to secrets |

## Multi-Region Networking Considerations

### Traffic Distribution

Global Accelerator will be used to distribute traffic with the following configuration:

- **Endpoints**: ALBs in each region
- **Listener Ports**: 80, 443
- **Endpoint Weights**: Based on region priority and capacity
- **Traffic Dials**: Adjustable for maintenance or issue mitigation
- **Health Checks**: Same as ALB health checks

### Regional Traffic Policies

Different traffic routing approaches for each domain:

- **nl.example.com**: Primary routing to eu-west-1, failover to eu-central-1
- **be.example.com**: Primary routing to eu-west-1, failover to eu-central-1
- **de.example.com**: Primary routing to eu-central-1, failover to eu-west-1
- **www.example.com**: Geolocation-based with latency optimization

### Cross-Region Data Synchronization

Network considerations for data replication:

- **Database**: Direct VPC-to-VPC via Transit Gateway
- **Redis**: ElastiCache Global Datastore via private connection
- **Objects**: S3 Cross-Region Replication via AWS backbone
- **Configuration**: Parameter/secret replication via encrypted connection

## Bandwidth and Throughput Requirements

| Connection | Peak Bandwidth | Average Bandwidth | Burst Capacity |
|------------|----------------|-------------------|----------------|
| Internet Ingress | 5 Gbps | 1 Gbps | 10 Gbps |
| Internet Egress | 10 Gbps | 2 Gbps | 15 Gbps |
| Inter-Region | 2 Gbps | 500 Mbps | 5 Gbps |
| VPC-to-VPC | 1 Gbps | 200 Mbps | 3 Gbps |
| Database Replication | 200 Mbps | 50 Mbps | 500 Mbps |
| S3 Replication | 500 Mbps | 100 Mbps | 1 Gbps |

## Network Access Controls

### Web Application Firewall

AWS WAF will be implemented with the following rule sets:

- **Core Rule Set**: OWASP core rules for common vulnerabilities
- **SQL Injection Protection**: Advanced rules for SQL injection detection
- **Cross-Site Scripting Protection**: Rules to prevent XSS attacks
- **Rate Limiting**: Prevent brute force and DDoS attacks
- **Geo-Restriction**: Block requests from unauthorized countries
- **IP Reputation Lists**: Block known malicious IPs
- **Custom Rules**: Application-specific protection logic

### Shield Protection

AWS Shield will be used for DDoS protection:

- **Shield Standard**: Basic protection included by default
- **Shield Advanced**: For critical endpoints (API, storefront)

## Network Monitoring

The following monitoring will be implemented:

- **VPC Flow Logs**: Enabled for all VPCs
- **CloudWatch Metrics**: For all network interfaces and endpoints
- **Network Manager**: To visualize and monitor Transit Gateway traffic
- **Route 53 Health Checks**: For all critical endpoints
- **GuardDuty**: For network threat detection
- **Custom Dashboard**: With key network metrics and alarms

## Network Cost Estimation

| Component | Monthly Cost |
|-----------|--------------|
| Data Transfer Out | $800-1,000 |
| NAT Gateway | $150-200 |
| Transit Gateway | $200-300 |
| VPN Connection | $75-100 |
| ALB/NLB | $200-300 |
| CloudFront | $400-500 |
| Global Accelerator | $100-150 |
| VPC Endpoints | $50-100 |
| **Total** | **$1,975-2,650** |

These costs are estimates based on projected traffic patterns and will be refined during implementation. 