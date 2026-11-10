import {json,clearCookie,originOk} from "../../lib/security.js";
import {cookieValue,digest} from "../../lib/security.js";
export async function onRequestPost({request,env}) {
  if(!originOk(request,env)) return new Response("Forbidden",{status:403});
  const token=cookieValue(request,"sd_customer_session");
  if(token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await digest(token,env.TOKEN_PEPPER)).run();
  return json({ok:true},200,{"Set-Cookie":clearCookie("sd_customer_session")});
}
