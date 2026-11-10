import { json, fail } from "../../lib/security.js";
import { searchDomain } from "../../lib/registrar.js";

const DOMAIN_RE = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const domain = String(url.searchParams.get("domain") || "").trim().toLowerCase();
  if (!DOMAIN_RE.test(domain) || domain.includes(".."))
    return fail("Enter a valid domain name, such as example.com.", 400);
  if (!env.DB) return fail("Domain search service is temporarily unavailable.", 503);

  try {
    const result = await searchDomain(domain, env);
    if (!result.configured) return json({
      ok:false, domain, status:result.status, available:null, live:false,
      message:result.message
    }, 503);

    return json({
      ok:true, domain, status:result.status, available:result.available,
      live:true, currency:result.currency || "INR",
      registrationPricePaise:Number.isSafeInteger(result.registrationPricePaise) ? result.registrationPricePaise : null,
      renewalPricePaise:Number.isSafeInteger(result.renewalPricePaise) ? result.renewalPricePaise : null,
      quoteExpiresAt:result.quoteExpiresAt || null
    });
  } catch {
    return fail("Registrar availability could not be checked. Please try again later.", 502);
  }
}
