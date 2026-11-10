# Seven Domains — First Website Prototype

A responsive static frontend prototype for the Seven Domains domain and web-hosting brand.

## Included
- Responsive marketing homepage
- Domain search interaction (clearly marked preview only)
- Proposed hosting pricing cards
- Dashboard concept preview
- FAQ and footer sections
- Basic security headers for Cloudflare Pages

## Deploy to Cloudflare Pages
1. Create a GitHub repository named `seven-domains`.
2. Upload the contents of this project to the repository root.
3. In Cloudflare, open Workers & Pages → Create → Pages → Connect to Git.
4. Select the repository.
5. Framework preset: `None`.
6. Build command: leave empty.
7. Build output directory: `/` (repository root).
8. Deploy.

## Important status
This is a frontend prototype, not a live registrar or hosting control panel.
- Domain search is a UI preview; it does not query a registry.
- Domain prices are intentionally shown as `₹—` until provider/registry costs are verified.
- Hosting prices are proposed business prices. Storage and SSL limits must be confirmed with a hosting provider before sale.
- No payment, customer authentication, registration, DNS write, hosting provisioning or renewal API is connected.
- Do not accept customer payments or claim domain availability until the relevant authorised provider and backend integrations are tested.

## Planned production integrations
1. Registrar/registry API (EPP or authorised reseller API during the initial stage).
2. Hosting provider provisioning API.
3. Payment gateway with server-side signature/webhook verification.
4. Customer authentication, database, audit logs and admin RBAC.
5. Renewal notifications, billing and support workflows.

## Brand
Seven Domains — Your Digital World Starts Here.


## Phase 1 information pages and navigation
The homepage navigation and footer now link to the standalone pages: Domains, Hosting, About Us, Contact Us, Privacy Policy, Terms & Conditions, Refund Policy, Cookie Policy and Disclaimer. The matching HTML pages and `assets/phase1-pages.css` are included in this package.

The proposed hosting prices are shown as introductory offers only: ₹99/month for the first 3 months then ₹149/month; ₹999/year for the first year then ₹1,499/year. These are not live checkout prices. Confirm provider costs, taxes, service limits and legal terms before accepting orders.
