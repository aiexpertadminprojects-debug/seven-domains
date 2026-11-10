# Seven Domains — Phase 2 Admin Dashboard Preview

## Files
- `admin/index.html` — admin console preview (URL after upload: `/admin/`)
- `assets/admin.css` — responsive styling matching the Seven Domains navy/green brand
- `assets/admin.js` — local-only draft settings and preview logic

## Install
1. Extract this ZIP.
2. Upload the `admin` folder to the repository root.
3. Upload `assets/admin.css` and `assets/admin.js` into the existing root `assets/` folder. Do not replace the existing `assets/styles.css` or `assets/app.js`.
4. Commit the files and wait for Cloudflare Pages deployment.
5. Open `https://YOUR-DOMAIN/admin/`.

## CRITICAL SECURITY WARNING
This is a frontend prototype only. It has NO authentication and must NOT be treated as a secure production admin panel. Before exposing `/admin/`, protect the route with Cloudflare Access or another server-side authentication layer. Never put passwords, API keys, registrar credentials, payment secrets or database credentials in HTML/JavaScript.

## What works in this preview
- Responsive admin UI and navigation
- Editable proposed monthly / annual / founder pricing
- Campaign start/end dates and local active/inactive preview
- Editable TLD registration / renewal / transfer draft values
- Security integration checklist
- Saves draft configuration to this browser's localStorage only

## What does NOT work
- No secure login, roles or MFA
- No server-side database or audit log
- No global pricing update for customers
- No customer subscription/billing-cycle tracking
- No automatic charge or payment gateway integration
- No registrar availability, domain registration or renewal
- No hosting provisioning, malware scan, DNSSEC changes or backup integration

## Production implementation required
Use server-side APIs (e.g. Cloudflare Workers) and a database. Enforce authentication and role-based access on every admin endpoint. Keep a per-customer promotion eligibility record, subscription start date, billing-cycle count, price accepted at checkout, next renewal price/date, and immutable billing history. Verify payment webhooks server-side. Log all admin changes. Never rely on browser localStorage or client-side dates for billing or entitlement decisions.

## Pricing defaults
- Monthly: ₹99 for first 3 billing cycles, then ₹149/month
- Annual: ₹999 for first eligible year, then ₹1,499/year
- Founder: 3 personal websites, proposed 6-month free period, then ₹100/month or ₹1,000/year (existing proposal; verify eligibility and terms before publication)
- Domain TLD rates: left at ₹0 placeholders until wholesale rates are verified

All prices are draft proposals and must be confirmed against provider costs, taxes, payment fees, service limits and applicable consumer disclosures before sale.
