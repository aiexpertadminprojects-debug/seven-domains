// Include this script from customer/index.html after the dashboard markup.
// It loads only the signed-in customer's own records; the server enforces ownership.
(async()=>{
 const msg=(s)=>{let n=document.getElementById('customerApiNotice');if(!n){n=document.createElement('div');n.id='customerApiNotice';n.className='notice';document.querySelector('.main')?.prepend(n)}n.textContent=s};
 try{
  const me=await fetch('/api/auth/me',{credentials:'same-origin'});
  if(!me.ok){location.replace('/customer/login.html');return}
  const data=await me.json();
  const user=document.querySelector('.user');if(user)user.lastElementChild.textContent=data.user.name||data.user.email;
  const endpoints=['domains','hosting','orders','invoices','tickets'];
  const results=await Promise.all(endpoints.map(x=>fetch('/api/customer/'+x,{credentials:'same-origin'}).then(r=>r.ok?r.json():{items:[]})));
  // The current visual dashboard intentionally remains read-only until its UI is connected to these records.
  window.sevenDomainsCustomerData=Object.fromEntries(endpoints.map((x,i)=>[x,results[i].items||[]]));
  document.querySelectorAll('.notice').forEach(n=>{n.textContent='Signed in as '+data.user.email+'. Live account data is available to dashboard components.'});
 }catch(e){msg('Unable to load account data. Please sign in again.')}
})();
