import { json, fail } from "../../../lib/security.js";

export async function onRequestGet({ env }) {
  if (!env.DB) return fail("Domain catalogue is temporarily unavailable.",503);
  try {
    const { results=[] } = await env.DB.prepare(
      `SELECT tld,label,enabled,retail_registration_paise,retail_renewal_paise,currency
       FROM domain_tlds ORDER BY length(tld) DESC`
    ).all();

    return json({
      ok:true,
      audience:"public_and_signed_in_customers",
      liveAvailabilityConnected:false,
      message:"Public domain extension catalogue. Registration availability and prices require verified live registrar data.",
      tlds:results.map(x=>({
        tld:x.tld,
        label:x.label,
        enabled:Boolean(x.enabled),
        registrationPricePaise:x.enabled ? x.retail_registration_paise : null,
        renewalPricePaise:x.enabled ? x.retail_renewal_paise : null,
        currency:x.currency
      }))
    });
  } catch {
    return fail("Domain catalogue is not installed. Run migration 0003_domain_platform.sql.",503);
  }
}
