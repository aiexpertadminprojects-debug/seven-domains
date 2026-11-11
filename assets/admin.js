const DEFAULTS={monthlyIntro:99,monthlyRegular:149,monthlyCycles:3,monthlyVisibility:"public",annualVisibility:"public",founderVisibility:"private",annualIntro:999,annualRegular:1499,founderSites:3,founderFree:6,founderMonthly:100,founderAnnual:1000,individualIntro:50,individualDuration:6,individualSites:1,individualDomains:1,individualStorage:20,individualRenewal:0,individualVisibility:"public",businessIntro:500,businessDuration:6,businessRegular:1500,businessEmails:10,businessVisibility:"public",proPrice:2500,proSites:10,proStorage:100,proEmails:25,proVisibility:"public",agencyPrice:4999,agencySites:25,agencyStorage:200,agencyEmails:50,agencyVisibility:"public",promoStart:new Date().toISOString().slice(0,10),promoEnd:new Date(Date.now()+90*86400000).toISOString().slice(0,10)};
const DEFAULT_TLDS=[{tld:".com",reg:0,renew:0,transfer:0},{tld:".in",reg:0,renew:0,transfer:0},{tld:".net",reg:0,renew:0,transfer:0},{tld:".org",reg:0,renew:0,transfer:0},{tld:".co.in",reg:0,renew:0,transfer:0}];
const $=id=>document.getElementById(id);
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}};
let settings={...DEFAULTS,...read("sevenDomainsPhase2Pricing",{})};
let tlds=read("sevenDomainsPhase2Tlds",DEFAULT_TLDS);
function dateActive(){const now=new Date();now.setHours(0,0,0,0);const s=new Date(settings.promoStart+"T00:00:00"),e=new Date(settings.promoEnd+"T23:59:59");return !Number.isNaN(+s)&&!Number.isNaN(+e)&&now>=s&&now<=e}
function money(n){return "₹"+Number(n).toLocaleString("en-IN")}
function fillForm(){Object.keys(DEFAULTS).forEach(k=>{if($(k))$(k).value=settings[k]})}
function renderPromo(){const active=dateActive();$("promoStatus").textContent=active?"CAMPAIGN ACTIVE":"CAMPAIGN INACTIVE";$("promoStatus").className="tag "+(active?"":"amber");$("overviewMonthly").textContent=money(settings.monthlyIntro);$("overviewAnnual").textContent=money(settings.annualIntro);$("promoHint").textContent=active?`Campaign runs until ${settings.promoEnd}. New qualifying orders may be eligible for introductory pricing.`:`Campaign is outside its configured date range. Regular list prices: ${money(settings.monthlyRegular)}/month and ${money(settings.annualRegular)}/year.`;$("pricePreview").textContent=`Current campaign preview: ${active?"ACTIVE":"INACTIVE"}. Monthly: ${money(settings.monthlyIntro)} for ${settings.monthlyCycles} billing cycles, then ${money(settings.monthlyRegular)}/month. Annual: ${money(settings.annualIntro)} for the first eligible year, then ${money(settings.annualRegular)}/year. Individual: ${money(settings.individualIntro)} for ${settings.individualDuration} months; renewal ${settings.individualRenewal?money(settings.individualRenewal):"not set"} per 6 months. Business: ${money(settings.businessIntro)}/month for ${settings.businessDuration} months, then ${money(settings.businessRegular)}/month. Pro Cloud: ${money(settings.proPrice)}/month, ${settings.proSites} sites, ${settings.proStorage} GB, ${settings.proEmails} emails. Agency: ${money(settings.agencyPrice)}/month, ${settings.agencySites} sites, ${settings.agencyStorage} GB, ${settings.agencyEmails} emails. Founder offer: ${settings.founderFree} free months, then ${money(settings.founderMonthly)}/month or ${money(settings.founderAnnual)}/year. This is only a local preview.`}
function renderTlds(){$("tldRows").innerHTML=tlds.map((x,i)=>`<tr><td class="tld">${x.tld}</td><td><input type="number" min="0" data-i="${i}" data-k="reg" value="${x.reg}"></td><td><input type="number" min="0" data-i="${i}" data-k="renew" value="${x.renew}"></td><td><input type="number" min="0" data-i="${i}" data-k="transfer" value="${x.transfer}"></td><td><span class="status pending">Draft only</span></td></tr>`).join("")}
function show(view){document.querySelectorAll(".view").forEach(x=>x.classList.toggle("active",x.id==="view-"+view));document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.view===view));const names={overview:"Overview",hosting:"Hosting plans",domains:"Domain pricing",registrar:"Registrar operations",security:"Security centre"};$("pageTitle").textContent=names[view]||"Overview";$("sidebar").classList.remove("open");if(view==="registrar")loadRegistrarHistory()}
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>show(b.dataset.view)));
$("mobileMenu").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
$("today").textContent=new Intl.DateTimeFormat("en-IN",{dateStyle:"medium"}).format(new Date());
fillForm();renderPromo();renderTlds();
$("hostingForm").addEventListener("submit",e=>{e.preventDefault();Object.keys(DEFAULTS).forEach(k=>{const el=$(k);settings[k]=["promoStart","promoEnd","monthlyVisibility","annualVisibility","founderVisibility","individualVisibility","businessVisibility","proVisibility","agencyVisibility"].includes(k)?el.value:Number(el.value)});if(settings.promoEnd<settings.promoStart){alert("Campaign end date must be on or after the start date.");return}localStorage.setItem("sevenDomainsPhase2Pricing",JSON.stringify(settings));renderPromo();alert("Draft saved in this browser only. No live customer price was changed.")});
$("resetHosting").addEventListener("click",()=>{settings={...DEFAULTS};localStorage.removeItem("sevenDomainsPhase2Pricing");fillForm();renderPromo()});
$("domainForm").addEventListener("submit",e=>{e.preventDefault();document.querySelectorAll("#tldRows input").forEach(el=>{tlds[Number(el.dataset.i)][el.dataset.k]=Math.max(0,Number(el.value)||0)});localStorage.setItem("sevenDomainsPhase2Tlds",JSON.stringify(tlds));renderTlds();alert("Domain price draft saved in this browser only.")});
$("resetDomains").addEventListener("click",()=>{tlds=DEFAULT_TLDS.map(x=>({...x}));localStorage.removeItem("sevenDomainsPhase2Tlds");renderTlds()});

const registrarForm=$("registrarForm");
function safeText(value){return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]))}
function registrarMessage(message,kind="info"){const box=$("registrarMessage");box.className="registrar-message "+kind;box.textContent=message}
async function loadRegistrarHistory(){
  const target=$("registrarHistory");if(!target)return;target.innerHTML='<p class="hint">Loading operations…</p>';
  try{
    const response=await fetch("/admin/api/registrar/operations",{credentials:"same-origin",headers:{"Accept":"application/json"}});
    const data=await response.json();
    if(!response.ok||!data.ok)throw new Error(data.error||"Could not load operation history.");
    if(!data.operations?.length){target.innerHTML='<p class="hint">No registrar operations saved yet.</p>';return}
    target.innerHTML=data.operations.map(item=>'<div class="registrar-row"><div><b>'+safeText(item.domain_name)+'</b><small>'+safeText(item.operation)+' · '+safeText(item.tld)+' · '+safeText(item.term_years)+' year(s)</small></div><span class="registrar-status">'+safeText(item.status)+'</span><time>'+safeText(item.created_at)+'</time></div>').join("");
  }catch(error){target.innerHTML='<p class="registrar-error">'+safeText(error.message)+'</p>'}
}
if(registrarForm){
  registrarForm.addEventListener("submit",async event=>{
    event.preventDefault();const button=$("registrarSubmit");button.disabled=true;button.textContent="Saving plan…";
    registrarMessage("Submitting dry-run operation plan…");
    try{
      const response=await fetch("/admin/api/registrar/operations",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({domain:$("registrarDomain").value,operation:$("registrarOperation").value,termYears:Number($("registrarTerm").value)})});
      const data=await response.json();if(!response.ok||!data.ok)throw new Error(data.error||data.message||data.status||"Operation plan could not be saved.");
      registrarMessage("Plan saved. ID: "+data.operationId+". No registry command was sent; no domain was registered.","success");await loadRegistrarHistory();
    }catch(error){registrarMessage(error.message,"error")}
    finally{button.disabled=false;button.textContent="Create dry-run plan"}
  });
  $("refreshRegistrar").addEventListener("click",loadRegistrarHistory);
}
