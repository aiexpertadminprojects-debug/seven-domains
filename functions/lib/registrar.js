/**
 * Seven Domains — provider-neutral registrar adapter.
 * This is a fail-closed adapter contract, not a live registrar integration.
 */
const REQUIRED = ["REGISTRAR_API_BASE_URL", "REGISTRAR_API_TOKEN"];

function validBaseUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !u.username && !u.password;
  } catch { return false; }
}

/**
 * Normalized provider contract:
 * POST {REGISTRAR_API_BASE_URL}{REGISTRAR_SEARCH_PATH}
 * Bearer token; JSON body { domain }
 * Expected JSON: { available:boolean, currency:"INR",
 * registrationPricePaise?:integer, renewalPricePaise?:integer }
 *
 * A provider-specific mapping to this contract is required before use.
 */
export async function checkDomainAvailability(domain, env) {
  if (REQUIRED.some(k => !env[k])) {
    return { ok:false, status:"NOT_CONFIGURED",
      message:"Live domain availability is not connected yet." };
  }
  if (!validBaseUrl(env.REGISTRAR_API_BASE_URL)) {
    return { ok:false, status:"PROVIDER_CONFIGURATION_ERROR",
      message:"Registrar endpoint must be a valid HTTPS URL." };
  }
  const path = String(env.REGISTRAR_SEARCH_PATH || "").trim();
  if (!path.startsWith("/") || path.startsWith("//")) {
    return { ok:false, status:"PROVIDER_CONFIGURATION_ERROR",
      message:"Registrar search path is not configured." };
  }

  let response;
  try {
    const base = env.REGISTRAR_API_BASE_URL.replace(/\/+$/, "");
    response = await fetch(base + path, {
      method:"POST",
      headers:{
        "content-type":"application/json",
        "accept":"application/json",
        "authorization":`Bearer ${env.REGISTRAR_API_TOKEN}`
      },
      body:JSON.stringify({domain}),
      signal:AbortSignal.timeout(10000)
    });
  } catch {
    return { ok:false, status:"PROVIDER_UNAVAILABLE",
      message:"Registrar could not be reached. Availability was not verified." };
  }
  if (!response.ok) {
    return { ok:false, status:"PROVIDER_ERROR",
      message:`Registrar returned HTTP ${response.status}. Availability was not verified.` };
  }

  let data;
  try { data = await response.json(); }
  catch {
    return { ok:false, status:"INVALID_PROVIDER_RESPONSE",
      message:"Registrar returned an invalid response." };
  }
  if (typeof data.available !== "boolean") {
    return { ok:false, status:"INVALID_PROVIDER_RESPONSE",
      message:"Registrar response did not contain a boolean availability result." };
  }
  const amounts = [data.registrationPricePaise ?? null, data.renewalPricePaise ?? null];
  if (amounts.some(v => v !== null && (!Number.isSafeInteger(v) || v < 0))) {
    return { ok:false, status:"INVALID_PROVIDER_RESPONSE",
      message:"Registrar returned an invalid price." };
  }
  if (amounts.some(v => v !== null) && data.currency !== "INR") {
    return { ok:false, status:"INVALID_PROVIDER_RESPONSE",
      message:"Only verified INR prices are currently accepted." };
  }
  return {
    ok:true,
    status:data.available ? "AVAILABLE" : "UNAVAILABLE",
    available:data.available,
    live:true,
    currency:data.currency || null,
    registrationPricePaise:amounts[0],
    renewalPricePaise:amounts[1]
  };
}
