---
title: User Migration
parent: Migration
nav_order: 3
has_toc: true
has_children: true
multilang_export: true
permalink: /migration/user-migration/
---

# User Migration

This section outlines the approach for migrating user accounts from the Statamic/Simple Commerce system to Saleor.

## Key Considerations

*   **Password Security:** Passwords cannot be migrated directly due to hashing. Users will likely need to reset their passwords upon first login to the new system.
*   **Data Mapping:** Mapping user fields (name, email, address, custom fields) to Saleor Customer accounts and associated addresses.
*   **Communication:** Planning user communication regarding the migration and the need for password resets.
*   **GDPR/Privacy:** Ensuring compliance with data privacy regulations during the transfer.

## Process

1.  **Analyze User Data:** Identify all user fields stored in Statamic.
2.  **Map User Fields:** Define the mapping to Saleor Customer fields and address book entries.
3.  **Develop Extraction Script:** Export user data (excluding passwords).
4.  **Develop Transformation Script:** Clean and format user data for Saleor.
5.  **Develop Loading Script:** Use Saleor's GraphQL API to create Customer accounts and addresses.
6.  **Password Reset Strategy:**
    *   Implement a "password reset required" flag or mechanism in Saleor upon import.
    *   Trigger password reset emails upon first login attempt or via a bulk campaign post-migration.
7.  **Testing:** Migrate test user accounts and verify data and the password reset flow.
8.  **User Communication Plan:** Draft emails/notifications informing users about the platform change and login procedure.
9.  **Execute Migration:** Run scripts during the migration window.
10. **Monitor Post-Migration:** Track user login success rates and support requests.

*(Add specific password reset flow details and communication templates)* 