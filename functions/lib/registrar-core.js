/**
 * Seven Domains — Independent Registrar Core (safe foundation).
 * Owns domain normalization, TLD resolution and operation planning.
 * Does not claim registry access or perform live registration.
 */

const DOMAIN_LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const ALLOWED_OPERATIONS = new Set([
  "check", "register", "renew", "transfer", "update_nameservers"
]);

export function normalizeDomain(input) {
  const value = String(input || "").trim().toLowerCase().replace(/\.$/, "");
  if (!value || value.length > 253 || value.includes("..")) return null;
  const labels = value.split(".");
  if (labels.length < 2 || labels.some(label =>
    !label || label.length > 63 || !DOMAIN_LABEL.test(label)
  )) return null;
  return value;
}

export function resolveTld(domain, tldRows) {
  const normalized = normalizeDomain(domain);
  if (!normalized || !Array.isArray(tldRows)) return null;
  const candidates = tldRows
    .map(row => String(row.tld || "").toLowerCase())
    .filter(tld => tld.startsWith(".") && normalized.endsWith(tld))
    .sort((a, b) => b.length - a.length);
  return candidates[0] || null;
}

export function planRegistrarOperation({ domain, operation, termYears = 1, tldRows = [] }) {
  const normalized = normalizeDomain(domain);
  if (!normalized) {
    return { ok: false, status: "INVALID_DOMAIN", message: "Enter a valid domain name." };
  }
  if (!ALLOWED_OPERATIONS.has(operation)) {
    return { ok: false, status: "INVALID_OPERATION", message: "Unsupported domain operation." };
  }
  const term = Number(termYears);
  if (!Number.isInteger(term) || term < 1 || term > 10) {
    return { ok: false, status: "INVALID_TERM", message: "Term must be between 1 and 10 years." };
  }
  const tld = resolveTld(normalized, tldRows);
  if (!tld) {
    return { ok: false, status: "TLD_NOT_LISTED", message: "This extension is not in the Seven Domains catalogue." };
  }
  const row = tldRows.find(item => String(item.tld).toLowerCase() === tld);
  if (Number(row?.enabled) !== 1) {
    return { ok: false, status: "TLD_DISABLED", message: "This extension is not enabled for operations." };
  }

  return {
    ok: true,
    domain: normalized,
    tld,
    operation,
    termYears: term,
    executionMode: "dry_run",
    status: "blocked_no_registry_access",
    registryCommand: {
      protocol: "adapter-contract-v1",
      operation,
      domain: normalized,
      termYears: term,
      requiresAuthorizedRegistryConnection: true
    }
  };
}

export function safeOperationResult(operationId, plan) {
  return {
    ok: true,
    operationId,
    domain: plan.domain,
    tld: plan.tld,
    operation: plan.operation,
    status: plan.status,
    executionMode: plan.executionMode,
    live: false,
    message: "Operation plan saved. No registry command was sent and no domain was registered."
  };
}
