import {json,fail,bodyJson,originOk,digest,passwordHash} from "../../lib/security.js";
export async function onRequestPost({request,env}) {
  if(!originOk(request,env)) return fail("Invalid origin",403);
  let b;try{b=await bodyJson(request);}catch{return fail("Invalid request");}
  const token=String(b.token||""), password=String(b.password||"");
  if(token.length!==64||password.length<12||password.length>128) return fail("Invalid token or password. Password must be at least 12 characters.");
  const row=await env.DB.prepare("SELECT id,user_id FROM email_tokens WHERE token_hash=? AND purpose='reset' AND used_at IS NULL AND expires_at>?").bind(await digest(token,env.TOKEN_PEPPER),new Date().toISOString()).first();
  if(!row) return fail("Invalid or expired reset link",400);
  const hash=await passwordHash(password), now=new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare("UPDATE users SET password_hash=?,updated_at=? WHERE id=?").bind(hash,now,row.user_id),
    env.DB.prepare("UPDATE email_tokens SET used_at=? WHERE id=?").bind(now,row.id),
    env.DB.prepare("DELETE FROM sessions WHERE user_id=?").bind(row.user_id)
  ]);
  return json({ok:true,message:"Password changed. Sign in again."});
}
