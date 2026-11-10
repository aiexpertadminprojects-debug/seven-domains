import {json,fail,bodyJson,originOk,audit} from "../../../lib/security.js";
import {requireAdmin} from "../../../lib/auth.js";
export async function onRequestPatch({request,env,params}) {
 if(!originOk(request,env))return fail("Invalid origin",403);
 const a=await requireAdmin(request,env);if(a.response)return a.response;
 let b;try{b=await bodyJson(request);}catch{return fail("Invalid request");}
 const status=String(b.status||"");
 if(!["open","in_progress","waiting_customer","resolved","closed"].includes(status))return fail("Invalid ticket status");
 const r=await env.DB.prepare("UPDATE tickets SET status=?,admin_reply=?,updated_at=? WHERE id=?")
 .bind(status,String(b.reply||"").slice(0,5000)||null,new Date().toISOString(),params.id).run();
 await audit(env.DB,a.user.id,"admin.ticket.update","ticket",params.id,request.headers.get("CF-Connecting-IP"),env.TOKEN_PEPPER);
 return json({ok:true,changes:r.meta?.changes||0});
}
