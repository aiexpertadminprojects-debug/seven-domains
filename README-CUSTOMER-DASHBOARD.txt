SEVEN DOMAINS — CUSTOMER DASHBOARD PHASE 1

Upload these files to the existing repository, preserving folder paths:
- customer/index.html
- assets/customer.css
- assets/customer.js

After deployment, preview at:
https://seven-domains.pages.dev/customer/

IMPORTANT: This is a front-end prototype with empty/sample data only. It does not implement customer registration, authentication, database storage, payments, registrar integration, hosting provisioning or support ticket submission. Do not collect customer personal/payment information through this preview.

Before public customer launch, implement server-side authentication and authorization, a database (e.g. Cloudflare D1), email verification/password reset, secure session cookies, CSRF protections, rate limiting, audit logging and role-based access. Protect /customer/* at the server/middleware layer after choosing and implementing authentication. Never store passwords or session secrets in frontend JavaScript/localStorage.
