import {json,fail,bodyJson,rateLimit,originOk,digest,cookieHeader,audit} from "../../lib/security.js";
import {passwordVerify} from "../../lib/security.js";
import {newSession} from "../../lib/auth.js";
export async function onRequestPost({request,env}) {
  if(!originOk(request,env)) return fail("Invalid request origin",403);
  if(!await rateLimit(env.DB,"login:"+request.headers.get("CF-Connecting-IP"),10,900)) return fail("Too many attempts. Try later.",429);
  let b;try{b=await bodyJson(request);}catch{return fail("Invalid request body");}
  const email=String(b.email||"").trim().toLowerCase(), password=String(b.password||"");
  const u=await env.DB.prepare("SELECT id,email,password_hash,status,email_verified_at FROM users WHERE email=?").bind(email).first();
  if(!u || !(await passwordVerify(password,u.password_hash))) return fail("Invalid email or password",401);
  if(u.status!=="active"||!u.email_verified_at) return fail("Verify your email before signing in.",403);
  const s=await newSession(u.id,env);
  await audit(env.DB,u.id,"customer.login","user",u.id,request.headers.get("CF-Connecting-IP"),env.TOKEN_PEPPER);
  return json({ok:true,user:{id:u.id,email:u.email} },200,{"Set-Cookie":cookieHeader("sd_customer_session",s.token,s.ttl)});
}
