import {json,fail,id,passwordHash,randomToken,digest,bodyJson,rateLimit,originOk,audit} from "../../lib/security.js";
import {sendMail,safeText} from "../../lib/email.js";
export async function onRequestPost({request,env}) {
  if(!originOk(request,env)) return fail("Invalid request origin",403);
  if(!await rateLimit(env.DB,"register:"+request.headers.get("CF-Connecting-IP"),5,3600)) return fail("Too many attempts. Try later.",429);
  let b; try{b=await bodyJson(request);}catch{return fail("Invalid request body");}
  const name=String(b.name||"").trim(),email=String(b.email||"").trim().toLowerCase(),password=String(b.password||"");
  if(name.length<2||name.length>100||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||password.length<12||password.length>128)
    return fail("Enter a valid name/email and a password of 12–128 characters.");
  const exists=await env.DB.prepare("SELECT id FROM users WHERE email=?").bind(email).first();
  if(exists) return fail("Unable to create account with these details. If you already registered, sign in or reset your password.",400);
  const uid=id(), hash=await passwordHash(password);
  await env.DB.prepare("INSERT INTO users(id,email,full_name,password_hash) VALUES(?,?,?,?)").bind(uid,email,name,hash).run();
  const token=randomToken(), th=await digest(token,env.TOKEN_PEPPER), exp=new Date(Date.now()+86400000).toISOString();
  await env.DB.prepare("INSERT INTO email_tokens(id,user_id,token_hash,purpose,expires_at) VALUES(?,?,?,?,?)").bind(id(),uid,th,"verify",exp).run();
  try {
    const link=`${env.APP_ORIGIN}/customer/verify.html?token=${token}`;
    await sendMail(env,email,"Verify your Seven Domains account",`<p>Hello ${safeText(name)},</p><p>Verify your email:</p><p><a href="${link}">Verify email address</a></p><p>This link expires in 24 hours.</p>`);
  } catch(e) {
    await env.DB.prepare("DELETE FROM users WHERE id=?").bind(uid).run();
    return fail("Email service is not configured or delivery failed. Please contact the site administrator.",503);
  }
  await audit(env.DB,uid,"customer.register","user",uid,request.headers.get("CF-Connecting-IP"),env.TOKEN_PEPPER);
  return json({ok:true,message:"Account created. Check your email to verify it."},201);
}
