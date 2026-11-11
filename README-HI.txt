SEVEN DOMAINS — ADMIN REGISTRAR OPERATIONS FIX

Upload these four files to the repository, replacing files at the same paths:
- admin/index.html
- assets/admin.js
- assets/admin.css
- functions/admin/api/registrar/operations.js

This patch integrates Registrar Operations INTO the existing Admin Panel sidebar.
It preserves Overview, Hosting plans, Domain pricing and Security centre.

The API is under /admin/api/* so the existing functions/_middleware.js protects it
with the same seven_admin_session cookie as the Admin Panel.

Requirements:
- Existing Phase 5 migration 0005 applied to D1
- D1 binding named DB
- Existing functions/lib/security.js and functions/lib/registrar-core.js
- Cloudflare Pages deployment completed after upload

After deployment:
1. Open /admin/ and log in.
2. Tap Registrar operations in the sidebar.
3. Test only with a domain whose TLD is enabled in domain_tlds.

Dry-run only: no registry command is sent and no domain is registered.
