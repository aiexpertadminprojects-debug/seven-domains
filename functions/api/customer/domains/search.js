import { checkDomainAvailability } from "../../../lib/registrar.js";

const headers = {
  "content-type":"application/json; charset=utf-8",
  "cache-control":"no-store"
};
function reply(data, status=200) {
  return new Response(JSON.stringify(data), {status, headers});
}
function normalizeDomain(input) {
  const value = String(input || "").trim().toLowerCase().replace(/\.$/, "");
  if (!value || value.length > 253 || /[/:@]/.test(value)) return null;
  const labels = value.split(".");
  if (labels.length < 2 || labels.some(label =>
    !label || label.length > 63 ||
    !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label)
  )) return null;
  return value;
}

export async function onRequestGet({request, env}) {
  const domain = normalizeDomain(new URL(request.url).searchParams.get("domain"));
  if (!domain) return reply({ok:false,error:"Enter a valid domain name, such as example.com."},400);
  if (!env.DB) return reply({
    ok:false,domain,status:"DATABASE_UNAVAILABLE",available:null,live:false,
    message:"Domain catalogue is temporarily unavailable."
  },503);

  const tld = "." + domain.split(".").pop();
  let row;
  try {
    row = await env.DB.prepare(
      "SELECT tld, enabled, registrar_provider FROM domain_tlds WHERE tld=? LIMIT 1"
    ).bind(tld).first();
  } catch {
    return reply({ok:false,domain,status:"DATABASE_ERROR",available:null,live:false,
      message:"Domain catalogue could not be checked."},503);
  }
  if (!row) return reply({ok:false,domain,status:"TLD_NOT_LISTED",available:null,live:false,
    message:"This extension is not in the Seven Domains catalogue."});
  if (Number(row.enabled) !== 1 || !row.registrar_provider) {
    return reply({ok:false,domain,status:"NOT_CONFIGURED",available:null,live:false,
      message:"Live domain availability is not connected yet."});
  }

  const result = await checkDomainAvailability(domain, env);
  if (!result.ok) return reply({ok:false,domain,status:result.status,available:null,live:false,
    message:result.message});
  return reply({
    ok:true,domain,status:result.status,available:result.available,live:true,
    currency:result.currency,
    registrationPricePaise:result.registrationPricePaise,
    renewalPricePaise:result.renewalPricePaise
  });
}
