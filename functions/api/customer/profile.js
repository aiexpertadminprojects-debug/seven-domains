import {json,fail,bodyJson,originOk} from "../../lib/security.js";
import {requireUser} from "../../lib/auth.js";
export async function onRequestGet({request,env}) {
 const a=await requireUser(request,env); if(a.response)return a.response;
 return json({ok:true,profile:{id:a.user.id,email:a.user.email,name:a.user.full_name}});
}
export async function onRequestPut({request,env}) {
 if(!originOk(request,env))return fail("Invalid origin",403);
 const a=await requireUser(request,env);if(a.response)return a.response;
 let b;try{b=await bodyJson(request);}catch{return fail("Invalid request");}
 const name=String(b.name||"").trim();if(name.length<2||name.length>100)return fail("Invalid name");
 await env.DB.prepare("UPDATE users SET full_name=?,updated_at=? WHERE id=?").bind(name,new Date().toISOString(),a.user.id).run();
 return json({ok:true});
}
