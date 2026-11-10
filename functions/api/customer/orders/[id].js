import {json} from "../../../lib/security.js";
import {requireUser} from "../../../lib/auth.js";
export async function onRequestGet({request,env,params}) {
 const a=await requireUser(request,env);if(a.response)return a.response;
 const row=await env.DB.prepare("SELECT id,order_number,status,currency,total_paise,created_at FROM orders WHERE id=? AND user_id=?").bind(params.id,a.user.id).first();
 return row?json({ok:true,order:row}):json({ok:false,error:"Not found"},404);
}
