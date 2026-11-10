import {cookieValue,digest,json} from "./security.js";
const COOKIE="sd_customer_session";
export async function currentUser(request,env) {
  const token=cookieValue(request,COOKIE); if(!token) return null;
  const hash=await digest(token,env.TOKEN_PEPPER);
  const row=await env.DB.prepare(`SELECT u.id,u.email,u.full_name,u.role,u.status,u.email_verified_at,s.id AS session_id
    FROM sessions s JOIN users u ON u.id=s.user_id
    WHERE s.token_hash=? AND s.expires_at>?`).bind(hash,new Date().toISOString()).first();
  if(!row || row.status!=="active" || !row.email_verified_at) return null;
  return row;
}
export async function requireUser(request,env) {
  const user=await currentUser(request,env);
  return user ? {user} : {response:json({ok:false,error:"Authentication required"},401)};
}
export async function requireAdmin(request,env) {
  const result=await requireUser(request,env);
  if(result.response) return result;
  if(!["admin","support"].includes(result.user.role)) return {response:json({ok:false,error:"Forbidden"},403)};
  return result;
}
export async function newSession(userId,env) {
  const token=Array.from(crypto.getRandomValues(new Uint8Array(32))).map(x=>x.toString(16).padStart(2,"0")).join("");
  const hash=await (await import("./security.js")).digest(token,env.TOKEN_PEPPER);
  const ttl=Math.max(3600,Math.min(Number(env.SESSION_TTL_SECONDS)||604800,2592000));
  const expires=new Date(Date.now()+ttl*1000).toISOString();
  await env.DB.prepare("INSERT INTO sessions(id,user_id,token_hash,expires_at) VALUES(?,?,?,?)")
    .bind(crypto.randomUUID(),userId,hash,expires).run();
  return {token,ttl};
}
