
import { json, fail } from "../../lib/security.js";

export async function onRequestGet({ env }) {
  if (!env.DB) return fail("Database unavailable.", 503);

  const { results = [] } = await env.DB.prepare(
    `SELECT tld, label, enabled, currency,
      retail_registration_paise, retail_renewal_paise
     FROM domain_tlds
     ORDER BY length(tld) DESC, tld ASC`
  ).all();

  return json({
    ok: true,
    audience: "public_and_signed_in_customers",
    liveAvailabilityConnected: false,
    message: "Public domain extension catalogue. Registration availability and prices require verified live registrar data.",
    tlds: results
  });
}
