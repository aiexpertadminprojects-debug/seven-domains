import {json,fail,bodyJson,originOk,rateLimit,digest,randomToken,id} from "../../lib/security.js";
import {sendMail} from "../../lib/email.js";
export async function onRequestPost({request,env}) {
  if(!originOk(request,env)) return fail("Invalid origin",403);
  if(!await rateLimit(env.DB,"forgot:"+request.headers.get("CF-Connecting-IP"),5,3600)) return fail("Too many attempts",429);
  let b;try{b=await bodyJson(request);}catch{return fail("Invalid request");}
  const email=String(b.email||"").trim().toLowerCase();
  const u=await env.DB.prepare("SELECT id FROM users WHERE email=? AND status='active'").bind(email).first();
  if(u) {
    const token=randomToken(), hash=await digest(token,env.TOKEN_PEPPER), exp=new Date(Date.now()+3600000).toISOString();
    await env.DB.prepare("INSERT INTO email_tokens(id,user_id,token_hash,purpose,expires_at) VALUES(?,?,?,?,?)").bind(id(),u.id,hash,"reset",exp).run();
    try { await sendMail(env,email,"Reset your Seven Domains password",`<p><a href="${env.APP_ORIGIN}/customer/reset.html?token=${token}">Reset password</a></p><p>Link expires in one hour.</p>`); } catch {}
  }
  return json({ok:true,message:"If the account exists, password reset instructions have been sent."});
}
