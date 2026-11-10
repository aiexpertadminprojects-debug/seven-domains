import {json,fail,bodyJson,digest,id,originOk} from "../../lib/security.js";
export async function onRequestPost({request,env}) {
  if(!originOk(request,env)) return fail("Invalid origin",403);
  let b;try{b=await bodyJson(request);}catch{return fail("Invalid request");}
  const token=String(b.token||""); if(token.length!==64) return fail("Invalid or expired verification link",400);
  const row=await env.DB.prepare("SELECT id,user_id FROM email_tokens WHERE token_hash=? AND purpose='verify' AND used_at IS NULL AND expires_at>?").bind(await digest(token,env.TOKEN_PEPPER),new Date().toISOString()).first();
  if(!row) return fail("Invalid or expired verification link",400);
  await env.DB.batch([
    env.DB.prepare("UPDATE users SET status='active',email_verified_at=?,updated_at=? WHERE id=?").bind(new Date().toISOString(),new Date().toISOString(),row.user_id),
    env.DB.prepare("UPDATE email_tokens SET used_at=? WHERE id=?").bind(new Date().toISOString(),row.id)
  ]);
  return json({ok:true,message:"Email verified. You can now sign in."});
}
