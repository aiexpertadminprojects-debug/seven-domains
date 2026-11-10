import {json} from "../lib/security.js";
export async function onRequestGet({env}) {
 const checks={database:!!env.DB,origin:!!env.APP_ORIGIN,tokenPepper:!!env.TOKEN_PEPPER,email:!!(env.RESEND_API_KEY&&env.EMAIL_FROM)};
 return json({ok:Object.values(checks).every(Boolean),checks},Object.values(checks).every(Boolean)?200:503);
}
