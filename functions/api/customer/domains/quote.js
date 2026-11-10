import { json, fail, id, bodyJson } from "../../../lib/security.js";
import { requireUser } from "../../../lib/auth.js";
import { normalizeDomain, findTld } from "../../../lib/domain-platform.js";

export async function onRequestPost({ request, env }) {
  const auth=await requireUser(request,env);
  if (auth.response) return auth.response;
  if (!env.DB) return fail("Domain service unavailable.",503);
  let body;
  try { body=await bodyJson(request,3000); } catch { return fail("Invalid JSON body."); }
  const domain=normalizeDomain(body.domain);
  if (!domain) return fail("Enter a valid domain name, such as example.com.");
  try {
    const {results=[]}=await env.DB.prepare("SELECT tld,enabled,retail_registration_paise,retail_renewal_paise,currency FROM domain_tlds").all();
    const tld=findTld(domain,results);
    if (!tld) return fail("This domain extension is not in the Seven Domains catalogue.",400);
    const row=results.find(x=>x.tld===tld);
    if (!row.enabled || !Number.isSafeInteger(row.retail_registration_paise) || !Number.isSafeInteger(row.retail_renewal_paise)) {
      return json({ok:false,status:"PRICING_NOT_CONFIGURED",live:false,domain,tld,
        message:"Verified registrar pricing is not configured. No order or payment has been created."},409);
    }
    // A price quote must never imply availability. A live registrar check is required first.
    return json({ok:false,status:"AVAILABILITY_NOT_VERIFIED",live:false,domain,tld,
      message:"A live registrar availability check is required before a quote can be issued. No order or payment has been created."},409);
  } catch {
    return fail("Domain platform migration is missing. Run migration 0003_domain_platform.sql.",503);
  }
}
