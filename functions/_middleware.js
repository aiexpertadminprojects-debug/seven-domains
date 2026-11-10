const COOKIE = "seven_admin_session";
const TTL = 8 * 60 * 60;

function b64url(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
async function sign(value, secret) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret),
    {name:"HMAC",hash:"SHA-256"}, false, ["sign"]);
  return b64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))));
}
function equal(a,b) {
  const x=new TextEncoder().encode(String(a)), y=new TextEncoder().encode(String(b));
  let d=x.length^y.length;
  for(let i=0;i<Math.max(x.length,y.length);i++) d|=(x[i]||0)^(y[i]||0);
  return d===0;
}
function cookie(request) {
  for(const part of (request.headers.get("Cookie")||"").split(";")) {
    const i=part.indexOf("=");
    if(i>0 && part.slice(0,i).trim()===COOKIE) return part.slice(i+1).trim();
  }
  return "";
}
function page(message="") {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#101b2d"><title>Admin sign in — Seven Domains</title><style>
  *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:22px;background:#101b2d;color:#172235;font-family:Arial,sans-serif}.card{width:min(100%,410px);background:#fff;border-radius:18px;padding:30px;box-shadow:0 20px 60px #0004}.brand{font-weight:800;color:#101b2d}.mark{display:inline-grid;place-items:center;width:38px;height:38px;margin-right:9px;border-radius:12px;background:#10b981;color:#fff}h1{font-size:24px;margin:25px 0 8px}.muted{color:#718092;line-height:1.5;font-size:14px}label{display:block;margin:22px 0 7px;font-size:13px;font-weight:700}input{width:100%;padding:14px;border:1px solid #d9e0e7;border-radius:10px;font-size:16px}button{width:100%;margin-top:16px;padding:14px;border:0;border-radius:10px;background:#10b981;color:#fff;font-size:15px;font-weight:700}.error{padding:10px;border-radius:8px;background:#fff0f0;color:#b42318;font-size:13px}</style></head><body><main class="card"><div class="brand"><span class="mark">7</span> SEVEN DOMAINS</div><h1>Admin sign in</h1><p class="muted">This area is restricted. Enter your administrator password to continue.</p>${message?`<p class="error">${message}</p>`:""}<form method="POST" action="/admin/login"><label for="password">Administrator password</label><input id="password" name="password" type="password" autocomplete="current-password" required autofocus><button type="submit">Sign in securely</button></form></main></body></html>`;
}
function html(body,status=200) {
  return new Response(body,{status,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"}});
}
async function valid(request,secret) {
  const token=cookie(request), dot=token.indexOf(".");
  if(dot<1) return false;
  const tsText=token.slice(0,dot), ts=Number(tsText), now=Math.floor(Date.now()/1000);
  if(!Number.isSafeInteger(ts)||ts>now+60||now-ts>TTL) return false;
  return equal(token.slice(dot+1),await sign(`${ts}:seven-domains-admin`,secret));
}
export async function onRequest({request,env,next}) {
  const url=new URL(request.url), path=url.pathname;
  if(path!=="/admin"&&!path.startsWith("/admin/")) return next();
  if(!env.ADMIN_PASSWORD||!env.ADMIN_SESSION_SECRET)
    return html("<h1>Admin protection is not configured</h1><p>Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET as Cloudflare Pages secrets, then redeploy.</p>",503);

  if(path==="/admin/login"&&request.method==="GET") return html(page());
  if(path==="/admin/login"&&request.method==="POST") {
    const form=await request.formData(), password=form.get("password");
    if(typeof password!=="string"||!equal(password,env.ADMIN_PASSWORD))
      return html(page("Incorrect password. Please try again."),401);
    const ts=Math.floor(Date.now()/1000), sig=await sign(`${ts}:seven-domains-admin`,env.ADMIN_SESSION_SECRET);
    return new Response(null,{status:303,headers:{
      "Location":"/admin/","Cache-Control":"no-store",
      "Set-Cookie":`${COOKIE}=${ts}.${sig}; HttpOnly; Secure; SameSite=Strict; Path=/admin; Max-Age=${TTL}`
    }});
  }
  if(path==="/admin/logout") return new Response(null,{status:303,headers:{
    "Location":"/admin/login","Cache-Control":"no-store",
    "Set-Cookie":`${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/admin; Max-Age=0`
  }});
  if(!(await valid(request,env.ADMIN_SESSION_SECRET)))
    return new Response(null,{status:302,headers:{"Location":"/admin/login","Cache-Control":"no-store"}});
  const response=await next(), headers=new Headers(response.headers);
  headers.set("Cache-Control","no-store"); headers.set("X-Content-Type-Options","nosniff");
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
