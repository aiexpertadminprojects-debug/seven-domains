# Seven Domains — Expanded TLD Catalogue Phase 3

## Included
- 117 TLD entries seeded by migration `0004_expand_tld_catalog.sql`.
- Public domain page `domains.html` now loads catalogue dynamically from `/api/domains/catalog`.
- Domain search form calls `/api/domains/search?domain=...`.
- Admin TLD endpoint no longer has a hard-coded six-extension allowlist; it checks the TLD exists in D1.
- All new TLDs remain `enabled=0`, with no fabricated prices. This is a catalogue listing, not proof that each extension is supported by a live registrar.

## Upload
Merge the ZIP into repository root, preserving folder structure:
1. Add `migrations/0004_expand_tld_catalog.sql`.
2. Replace `domains.html`.
3. Replace `functions/api/admin/domains/catalog.js`.

Do not replace other files or rerun migrations 0001, 0002, or 0003.

## D1
Cloudflare D1 → `seven-domains-db` → Console → run the entire `0004_expand_tld_catalog.sql` once.

## Deploy and test
- `https://seven-domains.pages.dev/domains.html`
- `https://seven-domains.pages.dev/api/domains/catalog`
- `https://seven-domains.pages.dev/api/domains/search?domain=example.com`

Expected while registrar is not connected:
- Catalogue JSON works and lists TLDs, enabled=false, prices null.
- Search returns `NOT_CONFIGURED`, `available:null`, `live:false`.
- No payment or registration is initiated.

## Important
Some TLDs are restricted, eligibility-controlled, or may not be offered by a future registrar. A catalogue entry is not an offer or guarantee of registration. Enable a TLD only after checking current registrar support, country eligibility, registry policies, and verified registration/renewal pricing. Do not show unverified prices or claim live availability.
