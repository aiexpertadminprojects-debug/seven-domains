import { json } from "./security.js";

const DOMAIN_RE = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

export function normalizeDomain(input) {
  const domain = String(input || "").trim().toLowerCase().replace(/\.$/, "");
  if (!DOMAIN_RE.test(domain) || domain.includes("..")) return null;
  return domain;
}

export function findTld(domain, rows) {
  return rows
    .map(row => row.tld)
    .sort((a,b) => b.length-a.length)
    .find(tld => domain.endsWith(tld) && domain.length > tld.length) || null;
}

export function money(paise) {
  return Number.isSafeInteger(paise) ? (paise / 100).toFixed(2) : null;
}

export function noLiveRegistrar(domain, message="Live registrar is not connected.") {
  return json({
    ok:false,
    domain,
    status:"NOT_CONFIGURED",
    available:null,
    live:false,
    message
  },503);
}
