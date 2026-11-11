SEVEN DOMAINS — REGISTRAR OPERATIONS (DRY-RUN)

Upload these two files to the existing GitHub repository, preserving the paths:

1) functions/admin/api/registrar/operations.js
2) admin/registrar.html

Then wait for the Cloudflare Pages deployment to finish.

Open while logged in to the existing Admin Panel:
https://seven-domains.pages.dev/admin/registrar.html

The existing _middleware.js protects /admin/* using the existing seven_admin_session cookie.
The API is intentionally placed under /admin/api/* so it uses that same protection.

Requirements already expected from the Phase 5 foundation:
- D1 binding: DB
- Tables: registrar_operations, registrar_operation_events, audit_logs
- Existing files: functions/lib/security.js and functions/lib/registrar-core.js
- Existing migration 0005 already applied

This is dry-run only. No live registry connection or real registration is performed.
Do not remove or replace existing admin files.
