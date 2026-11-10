import {json,fail,bodyJson,originOk,id} from "../../lib/security.js";
import {requireUser} from "../../lib/auth.js";
export async function onRequestGet({request,env}) {
 const a=await requireUser(request,env);if(a.response)return a.response;
 const r=await env.DB.prepare("SELECT id,subject,category,message,status,priority,admin_reply,created_at,updated_at FROM tickets WHERE user_id=? ORDER BY created_at DESC LIMIT 100").bind(a.user.id).all();
 return json({ok:true,items:r.results||[]});
}
export async function onRequestPost({request,env}) {
 if(!originOk(request,env))return fail("Invalid origin",403);
 const a=await requireUser(request,env);if(a.response)return a.response;
 let b;try{b=await bodyJson(request);}catch{return fail("Invalid request");}
 const subject=String(b.subject||"").trim(),category=String(b.category||"other"),message=String(b.message||"").trim();
 if(subject.length<4||subject.length>120||message.length<10||message.length>5000)return fail("Subject or message length is invalid");
 if(!["domain","hosting","billing","account","technical","other"].includes(category))return fail("Invalid category");
 const tid=id();
 await env.DB.prepare("INSERT INTO tickets(id,user_id,subject,category,message) VALUES(?,?,?,?,?)").bind(tid,a.user.id,subject,category,message).run();
 return json({ok:true,id:tid},201);
}
