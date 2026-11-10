import {json} from "../../../lib/security.js";
import {requireUser} from "../../../lib/auth.js";
export async function onRequestGet({request,env,params}) {
 const a=await requireUser(request,env);if(a.response)return a.response;
 const row=await env.DB.prepare("SELECT id,domain_name,status,registered_at,expires_at,created_at FROM domains WHERE id=? AND user_id=?").bind(params.id,a.user.id).first();
 return row?json({ok:true,domain:row}):json({ok:false,error:"Not found"},404);
}
