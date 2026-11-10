import {json,fail,bodyJson,originOk,audit} from "../../lib/security.js";
import {requireAdmin} from "../../lib/auth.js";
export async function onRequestPatch({request,env,params}) {
 if(!originOk(request,env))return fail("Invalid origin",403);
 const a=await requireAdmin(request,env);if(a.response)return a.response;
 let b;try{b=await bodyJson(request);}catch{return fail("Invalid request");}
 const status=String(b.status||"");
 if(!["pending","processing","active","completed","cancelled","failed"].includes(status))return fail("Invalid order status");
 await env.DB.prepare("UPDATE orders SET status=? WHERE id=?").bind(status,params.id).run();
 await audit(env.DB,a.user.id,"admin.order.update","order",params.id,request.headers.get("CF-Connecting-IP"),env.TOKEN_PEPPER);
 return json({ok:true});
}
