import {json} from "../../lib/security.js";
import {requireAdmin} from "../../lib/auth.js";
export async function onRequestGet({request,env}) {
 const a=await requireAdmin(request,env);if(a.response)return a.response;
 const r=await env.DB.prepare("SELECT id,email,full_name,role,status,email_verified_at,created_at FROM users ORDER BY created_at DESC LIMIT 500").all();
 return json({ok:true,items:r.results||[]});
}
