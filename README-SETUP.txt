SEVEN DOMAINS — ADMIN PASSWORD PROTECTION

This package adds a server-side password gate to /admin/ using Cloudflare Pages Functions.
It does not require Cloudflare Zero Trust or a paid plan.

UPLOAD
1. In the GitHub repository root, create a folder named `functions`.
2. Inside it, create `functions/_middleware.js` and paste the supplied file.
3. Commit it to `main` and wait for the Cloudflare Pages deployment to finish.

ADD TWO CLOUDFLARE SECRETS
Cloudflare Dashboard -> Workers & Pages -> seven-domains -> Settings ->
Variables and Secrets (or Environment variables), Production:

A. ADMIN_PASSWORD
   Type: Secret. Set a long, unique password (16+ characters recommended).

B. ADMIN_SESSION_SECRET
   Type: Secret. Set a different random secret, at least 32 random characters.

Save and trigger a new deployment. Do NOT put either secret in HTML, JavaScript,
GitHub source code, or any public file.

TEST
1. Visit https://seven-domains.pages.dev/admin/
2. It should redirect to /admin/login.
3. Enter ADMIN_PASSWORD; the dashboard should open.
4. Visit /admin/logout to sign out.
5. Reopen /admin/; it should ask for the password again.

NOTES
- Login sessions expire after 8 hours.
- This protects /admin and /admin/*, not the rest of the public website.
- The current admin dashboard remains a prototype: settings still use browser
  localStorage. This does not add a database, payment system, customer accounts,
  or server-side pricing persistence.
- If the page says protection is not configured, check both Production secrets
  and redeploy.
- If /admin/ returns 404, check that `functions/_middleware.js` is in the repository
  root's functions folder and the latest deployment succeeded.
