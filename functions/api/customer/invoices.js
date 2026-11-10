import {json} from "../../lib/security.js";
import {requireUser} from "../../lib/auth.js";
export async function onRequestGet({request,env}) {
 const a=await requireUser(request,env);if(a.response)return a.response;
 const r=await env.DB.prepare("SELECT id,order_id,invoice_number,status,amount_paise,due_at,paid_at,created_at FROM invoices WHERE user_id=? ORDER BY created_at DESC LIMIT 100").bind(a.user.id).all();
 return json({ok:true,items:r.results||[]});
}
