import {json} from "../../lib/security.js";
import {requireAdmin} from "../../lib/auth.js";
export async function onRequestGet({request,env}) {
 const a=await requireAdmin(request,env);if(a.response)return a.response;
 const r=await env.DB.prepare(`SELECT o.*,u.email FROM orders o JOIN users u ON u.id=o.user_id ORDER BY o.created_at DESC LIMIT 300`).all();
 return json({ok:true,items:r.results||[]});
}
