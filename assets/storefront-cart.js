(() => {
  const KEY = "sevenDomainsCart";
  const readCart = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const saveCart = items => localStorage.setItem(KEY, JSON.stringify(items));
  const money = n => "₹" + Number(n).toLocaleString("en-IN");
  const cartCount = () => readCart().reduce((s, x) => s + x.qty, 0);
  const updateBadge = () => {
    const el = document.querySelector("[data-cart-count]");
    if (el) el.textContent = String(cartCount());
  };
  const add = (item) => {
    const items = readCart();
    const found = items.find(x => x.id === item.id);
    if (found) found.qty += 1; else items.push({...item, qty:1});
    saveCart(items);
    updateBadge();
    alert(item.name + " added to your cart.");
  };

  // Founder plan is private and is not rendered on the public storefront.
  document.querySelectorAll(".founder-card").forEach(el => el.remove());

  const navActions = document.querySelector(".nav-actions");
  if (navActions && !navActions.querySelector(".cart-link")) {
    const a = document.createElement("a");
    a.className = "cart-link";
    a.href = "/cart.html";
    a.innerHTML = 'Cart <span data-cart-count>' + cartCount() + '</span>';
    a.style.cssText = "font-size:12px;font-weight:700;color:#0b9468;border:1px solid #d8eee5;border-radius:8px;padding:9px 12px;white-space:nowrap";
    navActions.prepend(a);
  }

  const cards = [...document.querySelectorAll(".plan-card")].filter(card => !card.classList.contains("founder-card"));
  cards.forEach((card, index) => {
    const button = card.querySelector("a.button");
    if (!button) return;
    const annual = card.classList.contains("plan-featured") || /YEARLY|ANNUAL/i.test(card.textContent);
    const item = annual
      ? {id:"hosting-annual", name:"Starter Hosting — Annual", price:999, period:"year", note:"Introductory first year; proposed renewal ₹1,499/year"}
      : {id:"hosting-monthly", name:"Starter Hosting — Monthly", price:99, period:"month", note:"Introductory first 3 billing cycles; proposed renewal ₹149/month"};
    button.removeAttribute("href");
    button.setAttribute("href", "#add-to-cart");
    button.textContent = "Add to cart";
    button.addEventListener("click", event => {
      event.preventDefault();
      add(item);
    });
  });
  updateBadge();
})();