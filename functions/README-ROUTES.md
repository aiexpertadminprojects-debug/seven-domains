# Cloudflare Pages Functions route map

Pages Functions file routing maps:
- `functions/api/auth/login.js` → `/api/auth/login`
- `functions/api/customer/tickets/[id].js` → `/api/customer/tickets/:id`
- `functions/api/admin/tickets/[id].js` → `/api/admin/tickets/:id`

The existing `functions/_middleware.js` currently protects `/admin/*` using the legacy admin password cookie only. It does not implement customer auth. The API endpoints in this package independently authenticate via D1-backed customer sessions.

Before exposing an admin console backed by these APIs, use a DB user whose role is `admin` and sign in through customer login. Do not assume the legacy admin cookie grants API access.

## Middleware caution
Do not replace the existing middleware blindly: it contains the current admin protection. The API endpoints enforce their own auth. Add customer page gating only after you have uploaded the login UI and dashboard API script, and tested the auth flow. The dashboard currently uses a preview HTML file; include `/customer/dashboard-api.js` in `customer/index.html` to activate the session check/data fetch.
