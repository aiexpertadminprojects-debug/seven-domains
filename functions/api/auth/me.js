import {json} from "../../lib/security.js";
import {currentUser} from "../../lib/auth.js";
export async function onRequestGet({request,env}) {
  const u=await currentUser(request,env);
  return u?json({ok:true,user:{id:u.id,email:u.email,name:u.full_name,role:u.role}}):json({ok:false,user:null},401);
}
