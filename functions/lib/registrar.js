/**
 * Provider-neutral registrar adapter. Fail closed until an authorised vendor
 * and its official API contract have been configured and reviewed.
 */
export async function searchDomain(domain, env) {
  const provider = String(env.REGISTRAR_PROVIDER || "").trim().toLowerCase();
  if (!provider || provider === "none") {
    return { configured:false, provider:null, status:"NOT_CONFIGURED", domain,
      message:"Live domain availability is not connected yet." };
  }
  return { configured:false, provider, status:"UNSUPPORTED_PROVIDER", domain,
    message:"The selected registrar adapter has not been implemented and tested." };
}
