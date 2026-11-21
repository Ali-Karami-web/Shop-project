const productsEl=document.querySelector('#products');
const cartEl=document.querySelector('#cart');
const headerEl=document.querySelector('#headershop');
let productlist=[];
let listcart=JSON.parse(localStorage.getItem('listcart')||'[]');
let orderlist=JSON.parse(localStorage.getItem('orderlist')||'[]');
let currentView='shop';
let activeProducts=[];

const money=n=>'$'+Number(n||0).toLocaleString('en-US',{maximumFractionDigits:2});
const saveCart=()=>localStorage.setItem('listcart',JSON.stringify(listcart));
const saveOrders=()=>localStorage.setItem('orderlist',JSON.stringify(orderlist));
const countCart=()=>listcart.reduce((sum,p)=>sum+(p.quantity||1),0);

function renderHeader(){
 headerEl.innerHTML=`
  <a class="brand" href="#" aria-label="شاپینو">shop<span>ino.</span></a>
  <nav class="header-links"><button data-view="shop">خانه</button><button id="allProductsBtn">فروشگاه</button><button id="ordersBtn">سفارش‌های من</button></nav>
  <div class="search-wrap"><input id="searchinput" type="search" placeholder="دنبال چی می‌گردی؟" autocomplete="off"></div>
  <div class="header-actions"><button class="icon-btn" id="carbtn">سبد خرید <span id="cartcount">${countCart()}</span></button></div>`;
 headerEl.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();showShop()});
 document.querySelector('#carbtn').addEventListener('click',showCart);
 document.querySelector('#ordersBtn').addEventListener('click',showOrders);
 document.querySelector('#allProductsBtn').addEventListener('click',showShop);
 document.querySelector('#searchinput').addEventListener('input',e=>{
  const q=e.target.value.trim().toLocaleLowerCase();
  const filtered=productlist.filter(p=>(p.title+' '+p.description).toLocaleLowerCase().includes(q));
  renderProducts(filtered);
 });
}
function updateCount(){const el=document.querySelector('#cartcount');if(el)el.textContent=countCart();saveCart()}

async function loadProducts(){
 productsEl.innerHTML='<div class="empty-state">در حال دریافت محصولات فروشگاه…</div>';
 try{
  const [pr,cr]=await Promise.all([fetch('https://dummyjson.com/products?limit=100'),fetch('https://dummyjson.com/products/categories')]);
  if(!pr.ok)throw new Error('products');
  const data=await pr.json();productlist=data.products||[];
  const cats=await cr.json();
  const select=document.querySelector('#categoriesselect');
  if(select)cats.forEach(c=>{const opt=document.createElement('option');opt.value=c.slug;opt.textContent=c.name;select.appendChild(opt)});
  activeProducts=productlist;renderProducts(productlist);
 }catch(e){productsEl.innerHTML='<div class="empty-state">دریافت محصولات ممکن نشد. اتصال اینترنت را بررسی و صفحه را دوباره بارگذاری کن.</div>'}
}
function productCard(p){
 const discount=p.discountPercentage?Math.round(p.discountPercentage):0;
 const img=(p.thumbnail||p.images?.[0]||'');
 return `<article class="product-card" data-id="${p.id}">
  <div class="product-image-wrap"><img src="${img}" alt="${p.title}" loading="lazy" onerror="this.style.opacity='.2'">
   ${discount?`<span class="discount-badge">${discount}٪ تخفیف</span>`:''}
   <button class="wish" type="button" aria-label="علاقه‌مندی">♡</button>
  </div>
  <div class="product-info"><span class="product-category">${p.category||'محصول ویژه'}</span>
   <h2>${p.title}</h2><p>${p.description||''}</p>
   <div class="product-rating">★ ${Number(p.rating||0).toFixed(1)} <span>از ۵</span></div>
   <div class="price-row"><h3>${money(p.price)} <span class="currency">دلار</span></h3></div>
   <button class="addtocart" type="button">افزودن به سبد خرید</button>
  </div></article>`;
}
function renderProducts(items){
 currentView='shop';activeProducts=items;
 productsEl.className='products-grid';
 productsEl.innerHTML=items.length?items.map(productCard).join(''):'<div class="empty-state">محصولی با این مشخصات پیدا نشد.</div>';
 cartEl.innerHTML='';
}
function showShop(){
 currentView='shop';document.querySelector('#hero').hidden=false;
 document.querySelector('.benefits').hidden=false;
 document.querySelector('.section-heading').hidden=false;
 document.querySelector('#toolbar').hidden=false;
 document.querySelector('.newsletter').hidden=false;
 productsEl.hidden=false;cartEl.innerHTML='';
 const search=document.querySelector('#searchinput');if(search)search.value='';
 const cat=document.querySelector('#categoriesselect');if(cat)cat.value='all';
 const sort=document.querySelector('#sortSelect');if(sort)sort.value='default';
 renderProducts(productlist);
 window.scrollTo({top:0,behavior:'smooth'});
}
function showSubPage(){
 document.querySelector('#hero').hidden=true;document.querySelector('.benefits').hidden=true;
 document.querySelector('.section-heading').hidden=true;document.querySelector('#toolbar').hidden=true;
 document.querySelector('.newsletter').hidden=true;productsEl.hidden=true;
 cartEl.innerHTML='';cartEl.scrollIntoView({behavior:'smooth',block:'start'});
}
function showCart(){
 currentView='cart';showSubPage();
 let html='<div class="cart-panel"><h2 class="cart-title">سبد خرید شما</h2>';
 if(!listcart.length){cartEl.innerHTML=html+'<div class="empty-state">سبد خریدت هنوز خالیه 🛍️<br><br><button class="back-button" onclick="showShop()">رفتن به فروشگاه</button></div></div>';return}
 let subtotal=0;
 listcart.forEach(p=>{const qty=p.quantity||1;subtotal+=p.price*qty;html+=`
 <div class="cart-item" data-id="${p.id}"><img src="${p.thumbnail||p.images?.[0]||''}" alt="${p.title}">
 <div><h3>${p.title}</h3><p>${money(p.price)} برای هر عدد</p>
 <div class="quantity"><button class="decrease" aria-label="کم کردن">−</button><b>${qty}</b><button class="increase" aria-label="زیاد کردن">+</button></div></div>
 <div class="cart-side"><strong>${money(p.price*qty)}</strong><button class="deletbtn">حذف</button></div></div>`});
 const shipping=subtotal<100?10:0;
 html+=`<div class="cart-summary"><div class="summary-line"><span>جمع محصولات</span><b>${money(subtotal)}</b></div><div class="summary-line"><span>هزینه ارسال</span><b>${shipping?money(shipping):'رایگان'}</b></div><div class="summary-line summary-total"><span>مبلغ قابل پرداخت</span><b>${money(subtotal+shipping)}</b></div><button id="orderbtn">ثبت و نهایی کردن سفارش</button></div></div>`;
 cartEl.innerHTML=html;
}
function showOrders(){
 currentView='orders';showSubPage();
 let html='<div class="cart-panel"><h2 class="cart-title">تاریخچه سفارش‌ها</h2><button class="back-button" onclick="showShop()">← بازگشت به فروشگاه</button>';
 if(!orderlist.length)html+='<div class="empty-state">هنوز سفارشی ثبت نکردی.</div>';
 else orderlist.slice().reverse().forEach((o,i)=>{html+=`<div class="order-class"><h3>سفارش شماره ${orderlist.length-i}</h3><p>تاریخ ثبت: ${o.date}</p><p>مبلغ نهایی: ${money(o.total)}</p>${o.products.map(p=>`<p>${p.title} — تعداد: ${p.quantity||1}</p>`).join('')}</div>`});
 cartEl.innerHTML=html+'</div>';
}
function addToCart(id){
 const p=productlist.find(x=>x.id===id);if(!p)return;
 const existing=listcart.find(x=>x.id===id);
 if(existing)existing.quantity=(existing.quantity||1)+1;
 else listcart.push({...p,quantity:1});
 updateCount();
 const btn=document.querySelector(`[data-id="${id}"] .addtocart`);
 if(btn){btn.textContent='اضافه شد ✓';setTimeout(()=>{if(btn.isConnected)btn.textContent='افزودن به سبد خرید'},900)}
}
productsEl.addEventListener('click',e=>{
 const card=e.target.closest('[data-id]');if(!card)return;
 if(e.target.classList.contains('addtocart'))addToCart(Number(card.dataset.id));
 if(e.target.classList.contains('wish')){e.target.textContent=e.target.textContent==='♡'?'♥':'♡';e.target.style.color=e.target.textContent==='♥'?'#e45d70':''}
});
cartEl.addEventListener('click',e=>{
 const item=e.target.closest('.cart-item');
 if(e.target.classList.contains('orderbtn')||e.target.id==='orderbtn'){
  if(!listcart.length)return;
  const subtotal=listcart.reduce((s,p)=>s+p.price*(p.quantity||1),0);
  const shipping=subtotal<100?10:0;
  orderlist.push({products:listcart.map(p=>({...p})),date:new Date().toLocaleString('fa-IR'),total:subtotal+shipping});
  saveOrders();listcart=[];updateCount();showCart();alert('سفارش شما با موفقیت ثبت شد 🌿');return;
 }
 if(!item)return;
 const id=Number(item.dataset.id),p=listcart.find(x=>x.id===id);if(!p)return;
 if(e.target.classList.contains('deletbtn'))listcart=listcart.filter(x=>x.id!==id);
 if(e.target.classList.contains('increase'))p.quantity=(p.quantity||1)+1;
 if(e.target.classList.contains('decrease')){p.quantity=(p.quantity||1)-1;if(p.quantity<1)listcart=listcart.filter(x=>x.id!==id)}
 updateCount();showCart();
});
document.querySelector('#categoriesselect').addEventListener('change',async e=>{
 if(e.target.value==='all'){renderProducts(productlist);return}
 try{productsEl.innerHTML='<div class="empty-state">در حال بارگذاری…</div>';const r=await fetch(`https://dummyjson.com/products/category/${encodeURIComponent(e.target.value)}`);const d=await r.json();renderProducts(d.products||[])}
 catch{renderProducts(productlist.filter(p=>p.category===e.target.value))}
});
document.querySelector('#sortSelect').addEventListener('change',e=>{
 const items=[...activeProducts];const mode=e.target.value;
 if(mode==='cheap')items.sort((a,b)=>a.price-b.price);
 if(mode==='expensive')items.sort((a,b)=>b.price-a.price);
 if(mode==='rating')items.sort((a,b)=>(b.rating||0)-(a.rating||0));
 renderProducts(items);
});
document.querySelector('#exploreBtn').addEventListener('click',()=>document.querySelector('#toolbar').scrollIntoView({behavior:'smooth'}));
renderHeader();loadProducts();
