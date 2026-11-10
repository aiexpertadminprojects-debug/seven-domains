import {json} from "../../lib/security.js";
import {requireAdmin} from "../../lib/auth.js";
export async function onRequestGet({request,env}) {
 const a=await requireAdmin(request,env);if(a.response)return a.response;
 const r=await env.DB.prepare(`SELECT t.id,t.subject,t.category,t.status,t.priority,t.created_at,u.email,u.full_name
 FROM tickets t JOIN users u ON u.id=t.user_id ORDER BY t.created_at DESC LIMIT 300`).all();
 return json({ok:true,items:r.results||[]});
}
