import { json, fail, bodyJson, audit } from "../../../lib/security.js";
import { requireAdmin } from "../../../lib/auth.js";

const ALLOWED = new Set([".com",".in",".co.in",".net",".org",".org.in"]);

export async function onRequestGet({ request, env }) {
  const auth = await requireAdmin(request,env);
  if (auth.response) return auth.response;
  if (!env.DB) return fail("Database unavailable.",503);
  const { results=[] } = await env.DB.prepare(
    `SELECT tld,label,enabled,registrar_provider,wholesale_registration_paise,
      retail_registration_paise,wholesale_renewal_paise,retail_renewal_paise,currency,updated_at
     FROM domain_tlds ORDER BY length(tld) DESC`
  ).all();
  return json({ok:true,tlds:results});
}

export async function onRequestPost({ request, env }) {
  const auth = await requireAdmin(request,env);
  if (auth.response) return auth.response;
  if (!env.DB) return fail("Database unavailable.",503);
  let body;
  try { body = await bodyJson(request,5000); } catch { return fail("Invalid JSON body."); }
  const tld=String(body.tld||"").toLowerCase();
  if (!ALLOWED.has(tld)) return fail("Unsupported TLD.");
  const enabled=body.enabled===true ? 1 : 0;
  const provider=String(body.registrarProvider||"").trim().slice(0,40) || null;
  const values=["wholesaleRegistrationPaise","retailRegistrationPaise","wholesaleRenewalPaise","retailRenewalPaise"];
  const parsed={};
  for (const key of values) {
    const v=body[key];
    parsed[key]=(v===null || v===undefined || v==="") ? null : Number(v);
    if (parsed[key]!==null && (!Number.isSafeInteger(parsed[key]) || parsed[key]<0))
      return fail(`Invalid ${key}; amount must be integer paise.`);
  }
  if (enabled && (!provider || parsed.wholesaleRegistrationPaise===null ||
      parsed.retailRegistrationPaise===null || parsed.wholesaleRenewalPaise===null ||
      parsed.retailRenewalPaise===null))
    return fail("Cannot enable a TLD without verified provider and registration/renewal prices.");
  if (enabled && (parsed.retailRegistrationPaise < parsed.wholesaleRegistrationPaise ||
      parsed.retailRenewalPaise < parsed.wholesaleRenewalPaise))
    return fail("Retail prices cannot be lower than wholesale prices.");
  await env.DB.prepare(
    `UPDATE domain_tlds SET enabled=?,registrar_provider=?,wholesale_registration_paise=?,
      retail_registration_paise=?,wholesale_renewal_paise=?,retail_renewal_paise=?,
      updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE tld=?`
  ).bind(enabled,provider,parsed.wholesaleRegistrationPaise,parsed.retailRegistrationPaise,
    parsed.wholesaleRenewalPaise,parsed.retailRenewalPaise,tld).run();
  await audit(env.DB,auth.user.id,"domain.tld_catalog.update","domain_tld",tld,
    request.headers.get("CF-Connecting-IP"),env.TOKEN_PEPPER);
  return json({ok:true,message:"TLD catalogue updated. Live registration remains disabled until a tested registrar adapter and payment flow are configured."});
}
