import { requireAdmin } from "../../../lib/auth.js";
import { audit, bodyJson, fail, id, json, originOk } from "../../../lib/security.js";
import { planRegistrarOperation, safeOperationResult } from "../../../lib/registrar-core.js";

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ ok: false, error: "Database unavailable." }, 503);

  const auth = await requireAdmin(request, env);
  if (auth.response) return auth.response;
  if (!originOk(request, env)) return fail("Invalid request origin.", 403);

  let body;
  try {
    body = await bodyJson(request, 4000);
  } catch {
    return fail("Invalid or oversized JSON request.", 400);
  }

  const catalog = await env.DB.prepare(
    "SELECT tld, enabled FROM domain_tlds"
  ).all();
  const plan = planRegistrarOperation({
    domain: body.domain,
    operation: body.operation,
    termYears: body.termYears ?? 1,
    tldRows: catalog.results || []
  });

  if (!plan.ok) {
    return json({ ok: false, status: plan.status, error: plan.message }, 400);
  }

  const operationId = id();
  const requestedBy = auth.user?.id || null;
  const requestJson = JSON.stringify({
    operation: plan.operation,
    domain: plan.domain,
    termYears: plan.termYears,
    executionMode: "dry_run"
  });
  const resultJson = JSON.stringify({
    protocol: plan.registryCommand.protocol,
    requiresAuthorizedRegistryConnection: true
  });

  await env.DB.prepare(
    `INSERT INTO registrar_operations
      (id,domain_name,tld,operation,term_years,status,execution_mode,requested_by,request_json,result_json)
     VALUES(?,?,?,?,?,'blocked_no_registry_access','dry_run',?,?,?)`
  ).bind(
    operationId, plan.domain, plan.tld, plan.operation, plan.termYears,
    requestedBy, requestJson, resultJson
  ).run();

  await env.DB.prepare(
    "INSERT INTO registrar_operation_events(id,operation_id,event_type,safe_message,metadata_json) VALUES(?,?,?,?,?)"
  ).bind(
    id(), operationId, "operation_planned",
    "Dry-run plan saved; no external registry request was made.",
    JSON.stringify({ executionMode: "dry_run", live: false })
  ).run();

  await audit(
    env.DB, requestedBy, "registrar.operation.plan",
    "registrar_operation", operationId,
    request.headers.get("CF-Connecting-IP"), env.TOKEN_PEPPER
  );

  return json(safeOperationResult(operationId, plan), 201);
}
