import {json} from "../../lib/security.js";
import {requireUser} from "../../lib/auth.js";
export async function onRequestGet({request,env}) {
 const a=await requireUser(request,env);if(a.response)return a.response;
 const r=await env.DB.prepare("SELECT id,plan_name,status,started_at,renews_at,created_at FROM hosting_services WHERE user_id=? ORDER BY created_at DESC LIMIT 100").bind(a.user.id).all();
 return json({ok:true,items:r.results||[]});
}
