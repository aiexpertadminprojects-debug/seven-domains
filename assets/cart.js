const CART_KEY="sevenDomainsCart";
const readCart=()=>{try{return JSON.parse(localStorage.getItem(CART_KEY))||[]}catch{return[]}};
const saveCart=items=>localStorage.setItem(CART_KEY,JSON.stringify(items));
const rupees=n=>"₹"+Number(n).toLocaleString("en-IN");
function renderCart(){
 const items=readCart(),wrap=document.getElementById("cartItems"),empty=document.getElementById("emptyCart");
 const count=items.reduce((s,x)=>s+x.qty,0),subtotal=items.reduce((s,x)=>s+x.price*x.qty,0);
 document.getElementById("itemCount").textContent=count+" item"+(count===1?"":"s");
 document.getElementById("subtotal").textContent=rupees(subtotal);
 document.getElementById("total").textContent=rupees(subtotal);
 document.getElementById("checkoutBtn").disabled=!items.length;
 empty.hidden=items.length>0;
 wrap.innerHTML=items.map(x=>`<article class="cart-item"><div><h3>${escapeText(x.name)}</h3><p>${escapeText(x.note||"Hosting plan")}<br>Billing: ${escapeText(x.period||"")}</p><div class="cart-controls"><button data-action="minus" data-id="${x.id}" aria-label="Decrease quantity">−</button><b>${x.qty}</b><button data-action="plus" data-id="${x.id}" aria-label="Increase quantity">+</button><button class="remove" data-action="remove" data-id="${x.id}">Remove</button></div></div><div class="cart-item-price">${rupees(x.price*x.qty)}</div></article>`).join("");
}
function escapeText(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
document.getElementById("cartItems").addEventListener("click",e=>{
 const b=e.target.closest("button[data-action]");if(!b)return;
 const items=readCart(),i=items.findIndex(x=>x.id===b.dataset.id);if(i<0)return;
 if(b.dataset.action==="plus")items[i].qty++;
 if(b.dataset.action==="minus")items[i].qty--;
 if(b.dataset.action==="remove")items.splice(i,1);
 if(items[i]?.qty<=0)items.splice(i,1);
 saveCart(items);renderCart();
});
document.getElementById("checkoutBtn").addEventListener("click",()=>{
 const items=readCart();if(!items.length)return;
 const lines=items.map(x=>`${x.name} x ${x.qty} — ${rupees(x.price*x.qty)} (${x.note})`).join("\n");
 const total=items.reduce((s,x)=>s+x.price*x.qty,0);
 const subject=encodeURIComponent("Seven Domains — Hosting Enquiry");
 const message=`Hello Seven Domains,\n\nI would like to enquire about these selected plans:\n${lines}\n\nEstimated introductory subtotal: ${rupees(total)}\nPlease confirm availability, final taxes, renewal price and terms before payment.\n\nName:\nPhone:\n`;
 const body=encodeURIComponent(message);
 location.href=`mailto:seveninkdigitaldevelopers@gmail.com?subject=${subject}&body=${body}`;
});
document.getElementById("year").textContent=new Date().getFullYear();
renderCart();
