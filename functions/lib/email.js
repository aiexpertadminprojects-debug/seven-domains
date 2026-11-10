export async function sendMail(env,to,subject,html) {
  if(!env.RESEND_API_KEY || !env.EMAIL_FROM) throw new Error("Email service is not configured");
  const res=await fetch("https://api.resend.com/emails",{
    method:"POST",headers:{"Authorization":`Bearer ${env.RESEND_API_KEY}`,"Content-Type":"application/json"},
    body:JSON.stringify({from:env.EMAIL_FROM,to:[to],subject,html})
  });
  if(!res.ok) throw new Error("Email delivery failed");
  return true;
}
export const safeText=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
