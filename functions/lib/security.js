const enc = new TextEncoder();
export const json = (data, status=200, extra={}) => new Response(JSON.stringify(data), {
  status, headers: { "Content-Type":"application/json; charset=utf-8", "Cache-Control":"no-store",
    "X-Content-Type-Options":"nosniff", "Referrer-Policy":"same-origin", ...extra }
});
export const fail = (message, status=400) => json({ok:false,error:message},status);
export const id = () => crypto.randomUUID();
export const randomToken = (n=32) => {
  const b=crypto.getRandomValues(new Uint8Array(n));
  return [...b].map(x=>x.toString(16).padStart(2,"0")).join("");
};
export async function digest(value, pepper) {
  const data=enc.encode(`${value}:${pepper||""}`);
  const out=await crypto.subtle.digest("SHA-256",data);
  return [...new Uint8Array(out)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
export async function passwordHash(password) {
  const salt=crypto.getRandomValues(new Uint8Array(16));
  const key=await crypto.subtle.importKey("raw",enc.encode(password),"PBKDF2",false,["deriveBits"]);
  const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt,iterations:310000,hash:"SHA-256"},key,256);
  const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
  return `pbkdf2$310000$${hex(salt)}$${hex(bits)}`;
}
export async function passwordVerify(password, stored) {
  const [scheme,iter,saltHex,hashHex]=String(stored||"").split("$");
  if(scheme!=="pbkdf2"||Number(iter)!==310000||!saltHex||!hashHex) return false;
  const salt=Uint8Array.from(saltHex.match(/.{2}/g)||[],x=>parseInt(x,16));
  const key=await crypto.subtle.importKey("raw",enc.encode(password),"PBKDF2",false,["deriveBits"]);
  const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt,iterations:310000,hash:"SHA-256"},key,256);
  const got=[...new Uint8Array(bits)].map(x=>x.toString(16).padStart(2,"0")).join("");
  return constantTime(got,hashHex);
}
function constantTime(a,b) {
  let d=a.length^b.length; for(let i=0;i<Math.max(a.length,b.length);i++) d|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0); return d===0;
}
export function cookieValue(request,name) {
  for(const p of (request.headers.get("Cookie")||"").split(";")) {
    const i=p.indexOf("="); if(i>0&&p.slice(0,i).trim()===name) return p.slice(i+1).trim();
  } return "";
}
export function cookieHeader(name,value,maxAge) {
  return `${name}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}
export function clearCookie(name) { return `${name}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`; }
export function originOk(request,env) {
  const origin=request.headers.get("Origin");
  return !!origin && origin===env.APP_ORIGIN;
}
export async function rateLimit(db,key,max=8,windowSec=900) {
  const now=Math.floor(Date.now()/1000);
  const row=await db.prepare("SELECT hits,window_started FROM rate_limits WHERE bucket=?").bind(key).first();
  if(!row || now-row.window_started>=windowSec) {
    await db.prepare("INSERT INTO rate_limits(bucket,hits,window_started) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET hits=1,window_started=excluded.window_started").bind(key,now).run();
    return true;
  }
  if(row.hits>=max) return false;
  await db.prepare("UPDATE rate_limits SET hits=hits+1 WHERE bucket=?").bind(key).run();
  return true;
}
export async function bodyJson(request,max=12000) {
  const len=Number(request.headers.get("Content-Length")||0); if(len>max) throw new Error("Request too large");
  const raw=await request.text(); if(raw.length>max) throw new Error("Request too large");
  return JSON.parse(raw||"{}");
}
export async function audit(db,actor,action,type=null,target=null,ip=null,pepper="") {
  await db.prepare("INSERT INTO audit_logs(id,actor_user_id,action,target_type,target_id,ip_hash) VALUES(?,?,?,?,?,?)")
    .bind(id(),actor||null,action,type,target,ip?await digest(ip,pepper):null).run();
}
