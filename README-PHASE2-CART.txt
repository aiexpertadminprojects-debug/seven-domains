# Seven Domains — Phase 2.1: Private Founder Plan + Cart

## What this package adds
- Founder Plan removed from public homepage using the storefront integration script.
- Monthly and annual Starter Hosting cards get working Add to Cart buttons.
- Cart badge is added to the site's navigation.
- `cart.html` provides quantity controls, remove item, subtotal and enquiry handoff.
- Admin dashboard gains visibility controls: monthly public, annual public, Founder private by default.
- Admin draft settings and cart contents use browser localStorage only.

## Upload these files
1. Upload `admin/index.html` to repository path `admin/index.html` (overwrite the previous Phase 2 preview if already uploaded).
2. Upload `assets/admin.css` and `assets/admin.js` into the existing `assets/` folder (replace the Phase 2 preview versions only; do not replace the site's `styles.css` or `app.js`).
3. Upload `assets/storefront-cart.js`, `assets/cart.css`, `assets/cart.js` into existing `assets/`.
4. Upload `cart.html` to repository root.

## One required edit to existing index.html
Add this line immediately before the existing `</body>` tag:
```html
<script src="/assets/storefront-cart.js"></script>
```
Keep the existing `/assets/app.js` script. Do not replace the homepage or existing CSS.

After deployment:
- Public homepage no longer shows the Founder Plan.
- Monthly and annual hosting buttons add to cart.
- Cart URL: `/cart.html`
- Admin preview URL: `/admin/`

## Important limitations
- Founder Plan is hidden from public homepage by the storefront script and is still visible in the admin pricing/visibility editor. This is a front-end concealment only, NOT access control or a real private offer catalogue. For genuine privacy, Founder Plan must be excluded by the server-side product API and visible only to authenticated, authorised users.
- Cart is a front-end enquiry cart. It does not create orders, reserve stock, activate hosting, calculate tax, or collect payment.
- Checkout opens an email enquiry to seveninkdigitaldevelopers@gmail.com. No order is confirmed until the business replies.
- Browser localStorage is not shared between devices and must never be used as the source of truth for prices, customer entitlements or billing.
- Do not enable payment or claim automatic billing until secure backend, database, hosting provider, verified payment webhooks, terms and customer consent are implemented.
