const menuToggle=document.getElementById("menuToggle");
const mainNav=document.getElementById("mainNav");
menuToggle?.addEventListener("click",()=>{const open=mainNav.classList.toggle("open");menuToggle.setAttribute("aria-expanded",String(open));menuToggle.textContent=open?"×":"☰";});
mainNav?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{mainNav.classList.remove("open");menuToggle?.setAttribute("aria-expanded","false");menuToggle.textContent="☰";}));
document.getElementById("year").textContent=new Date().getFullYear();
const form=document.getElementById("domainForm");
const input=document.getElementById("domainInput");
const result=document.getElementById("searchResult");
form?.addEventListener("submit",e=>{
  e.preventDefault();
  let value=input.value.trim().toLowerCase().replace(/^https?:\/\//,"").replace(/^www\./,"").replace(/\/.*$/,"");
  if(!value){result.textContent="Enter a domain name to see the search preview.";result.classList.add("show");input.focus();return;}
  if(!value.includes(".")) value += ".com";
  if(!/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(value)){result.textContent="Please enter a valid-looking domain name, such as example.com.";result.classList.add("show");return;}
  result.textContent=`Search preview for ${value}: live availability is not connected yet. Seven Domains will show verified availability after an authorised registrar API is integrated.`;
  result.classList.add("show");
});
