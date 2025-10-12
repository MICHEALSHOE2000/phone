/* ==================================================
   GadgetHub - script.js (UPDATED)
   - Smart product filters: brand, price, ram, storage, search
   - Price formatting improvements
   - Product cards hydrated with data-product JSON (modal friendly)
   - Testimonial carousel (autoplay + controls)
   Author: ChatGPT (updated)
   ================================================== */

   document.addEventListener("DOMContentLoaded", () => {
    // --- small helpers ---
    const $$ = (selector, ctx = document) => Array.from((ctx || document).querySelectorAll(selector));
    const $ = (selector, ctx = document) => (ctx || document).querySelector(selector);
    const toNumber = s => Number(String(s).replace(/\D/g, '')) || 0;
    const slug = (text) => String(text).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  
    // Set footer year
    $("#year").textContent = new Date().getFullYear();
  
    // -------------------------
    // SLIDER Controls (generic)
    // -------------------------
    $$(".brand-slider").forEach(block => {
      const track = $(".slider-track", block);
      const slides = $$(".slide", track);
      let index = 0;
  
      const show = i => {
        if (!slides.length) return;
        index = ((i % slides.length) + slides.length) % slides.length;
        const slide = slides[index];
        track.scrollTo({ left: slide.offsetLeft - 6, behavior: "smooth" });
      };
  
      $$(".slider-btn", block).forEach(btn => {
        btn.addEventListener("click", () => {
          const action = btn.dataset.action;
          if (action === "prev") show(index - 1);
          if (action === "next") show(index + 1);
        });
      });
    });
  
    // -------------------------------------------------
    // PRODUCT DETAIL MODAL (re-usable for all products)
    // -------------------------------------------------
    const modal = $("#product-modal");
    const modalImage = $("#modal-image");
    const modalTitle = $("#modal-title");
    const modalSpecs = $("#modal-specs");
    const modalPrice = $("#modal-price");
    const modalWa = $("#modal-wa");
    const closeModal = () => { modal.style.display = "none"; modal.setAttribute("aria-hidden", "true"); };
    const openModal = (data) => {
      modalImage.src = data.img || data.image || "";
      modalImage.alt = data.name || "Product image";
      modalTitle.textContent = data.name || "Product";
      modalSpecs.textContent = `${data.ram || ''} • ${data.storage || ''} • ${data.battery || ''}`.replace(/(^\s*•|•\s*$)/g, '').trim();
      modalPrice.textContent = data.price || "₦0";
      modalWa.href = `https://wa.me/2347034774672?text=${encodeURIComponent("Hello, I want the best price for " + (data.name || ""))}`;
      modal.style.display = "flex";
      modal.setAttribute("aria-hidden", "false");
    };
  
    // wire the close button
    $(".modal-close").addEventListener("click", closeModal);
    window.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  
    // -----------------------
    // PRODUCTS: central data
    // -----------------------
    // Extend/add product objects here — ensure ram and storage are present for filtering
    // This canonical list is used for the catalog rendering.
    const PRODUCTS = [
      { brand: "Google Pixel", name: "Pixel 7 Pro", price: "₦600,000", priceValue: 600000, ram: "12GB", storage: "128GB", battery: "5000mAh", img:"https://via.placeholder.com/600x400?text=Pixel+7+Pro" },
      { brand: "iPhone", name: "iPhone 16 Pro Max", price: "₦1,500,000", priceValue: 1500000, ram: "8GB", storage: "256GB", battery: "5000mAh", img:"https://images.unsplash.com/photo-1512499617640-c2f99912a1b8?auto=format&fit=crop&w=900&q=60" },
      { brand: "iPhone", name: "iPhone 15", price: "₦950,000", priceValue: 950000, ram: "6GB", storage: "128GB", battery: "4200mAh", img:"https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=900&q=60" },
      { brand: "iPhone", name: "iPhone X", price: "₦350,000", priceValue: 350000, ram: "4GB", storage: "64GB", battery: "3100mAh", img:"https://images.unsplash.com/photo-1603898037225-2c7123968e5a?auto=format&fit=crop&w=900&q=60" },
      { brand: "Samsung", name: "Galaxy S24 Ultra", price: "₦1,100,000", priceValue: 1100000, ram: "12GB", storage: "512GB", battery: "5000mAh", img:"https://images.unsplash.com/photo-1512496015851-a741b8d1f5b0?auto=format&fit=crop&w=900&q=60" },
      { brand: "Samsung", name: "Galaxy Fold 5", price: "₦1,400,000", priceValue: 1400000, ram: "12GB", storage: "512GB", battery: "4400mAh", img:"https://images.unsplash.com/photo-1570623222316-83e6d4a4f466?auto=format&fit=crop&w=900&q=60" },
      { brand: "Huawei", name: "Huawei P60", price: "₦500,000", priceValue: 500000, ram: "8GB", storage: "256GB", battery: "4700mAh", img:"https://images.unsplash.com/photo-1616446101542-5c2201f5a6d4?auto=format&fit=crop&w=900&q=60" },
      { brand: "Infinix", name: "Infinix Note 30", price: "₦300,000", priceValue: 300000, ram: "8GB", storage: "256GB", battery: "6000mAh", img:"https://via.placeholder.com/600x400?text=Infinix+Note+30" },
      { brand: "Xiaomi", name: "Xiaomi 13 Pro", price: "₦700,000", priceValue: 700000, ram: "12GB", storage: "256GB", battery: "4820mAh", img:"https://images.unsplash.com/photo-1606813902846-6a7b70f5d9eb?auto=format&fit=crop&w=900&q=60" },
      { brand: "OnePlus", name: "OnePlus 11", price: "₦650,000", priceValue: 650000, ram: "12GB", storage: "256GB", battery: "5000mAh", img:"https://images.unsplash.com/photo-1621597280313-9c76a8b3d3f9?auto=format&fit=crop&w=900&q=60" },
      { brand: "Tecno", name: "Tecno Phantom X2", price: "₦420,000", priceValue: 420000, ram: "12GB", storage: "256GB", battery: "5160mAh", img:"https://via.placeholder.com/600x400?text=Tecno+Phantom+X2" },
      { brand: "Oppo", name: "Oppo Reno 10", price: "₦480,000", priceValue: 480000, ram: "8GB", storage: "256GB", battery: "4500mAh", img:"https://images.unsplash.com/photo-1523475496153-3d6cc5db4f5f?auto=format&fit=crop&w=900&q=60" }
    ,
      {brand:"Lenovo",name:"LEGION GO (Ryzen Z1, 16GB, 512GB)",price:"\u20a61,185,000",priceValue:1185000,ram:"16GB",storage:"512GB",condition:"new",category:"handheld",img:"https://via.placeholder.com/800x500?text=Lenovo+LEGION+GO"},
      {brand:"Apple",name:"MacBook Pro 13\" 2022 (M2, 8GB, 256GB)",price:"\u20a61,200,000",priceValue:1200000,ram:"8GB",storage:"256GB",condition:"new",category:"laptop",img:"https://via.placeholder.com/800x500?text=MacBook+Pro+13+M2"},
      {brand:"Apple",name:"AirPods Pro 3 (3rd Gen) - Brand New",price:"\u20a6470,000",priceValue:470000,ram:"",storage:"",condition:"new",category:"accessory",img:"https://via.placeholder.com/800x500?text=AirPods+Pro+3"},
      {brand:"Vivo",name:"Vivo V30 (12+12GB, 512GB) - Fresh as new",price:"\u20a6445,000",priceValue:445000,ram:"12GB",storage:"512GB",condition:"used",category:"phone",img:"https://via.placeholder.com/800x500?text=Vivo+V30"},
      {brand:"Vivo",name:"Vivo V40 Lite (8+8GB, 256GB) - Fresh as new",price:"\u20a6325,000",priceValue:325000,ram:"8GB",storage:"256GB",condition:"used",category:"phone",img:"https://via.placeholder.com/800x500?text=Vivo+V40+Lite"},
      {brand:"Samsung",name:"Galaxy Tab S7 FE (UK used) 6GB/128GB",price:"\u20a6630,000",priceValue:630000,ram:"6GB",storage:"128GB",condition:"used",category:"tablet",img:"https://via.placeholder.com/800x500?text=Galaxy+Tab+S7+FE"},
      {brand:"Honor",name:"Honor 40 Lite (8GB, 256GB) - Brand New",price:"\u20a6380,000",priceValue:380000,ram:"8GB",storage:"256GB",condition:"new",category:"phone",img:"https://via.placeholder.com/800x500?text=Honor+40+Lite"},
      {brand:"Samsung",name:"Galaxy S10 (UK used) 8GB/128GB",price:"\u20a6230,000",priceValue:230000,ram:"8GB",storage:"128GB",condition:"used",category:"phone",img:"https://via.placeholder.com/800x500?text=Galaxy+S10"},
      {brand:"Honor",name:"Honor Pad X8a (Brand New sealed) 4GB/128GB",price:"\u20a6320,000",priceValue:320000,ram:"4GB",storage:"128GB",condition:"new",category:"tablet",img:"https://via.placeholder.com/800x500?text=Honor+Pad+X8a"},
      {brand:"Google",name:"Pixel 9 Pro (16GB/256GB) - Brand New (Physical SIM + eSIM)",price:"\u20a62,000,000",priceValue:2000000,ram:"16GB",storage:"256GB",condition:"new",category:"phone",img:"https://via.placeholder.com/800x500?text=Pixel+9+Pro+256GB"},
      {brand:"Google",name:"Pixel 9 Pro (16GB/512GB) - Brand New",price:"\u20a62,550,000",priceValue:2550000,ram:"16GB",storage:"512GB",condition:"new",category:"phone",img:"https://via.placeholder.com/800x500?text=Pixel+9+Pro+512GB"},
      {brand:"Google",name:"Pixel 10 Pro XL (16GB/256GB) - Brand New",price:"\u20a61,700,000",priceValue:1700000,ram:"16GB",storage:"256GB",condition:"new",category:"phone",img:"https://via.placeholder.com/800x500?text=Pixel+10+Pro+XL+256GB"},
      {brand:"Google",name:"Pixel 10 Pro XL (16GB/512GB) - Brand New",price:"\u20a62,050,000",priceValue:2050000,ram:"16GB",storage:"512GB",condition:"new",category:"phone",img:"https://via.placeholder.com/800x500?text=Pixel+10+Pro+XL+512GB"},
      {brand:"Apple",name:"iPhone 17 Pro (512GB, eSIM) - Brand New",price:"\u20a62,520,000",priceValue:2520000,ram:"16GB",storage:"512GB",condition:"new",category:"phone",img:"https://via.placeholder.com/800x500?text=iPhone+17+Pro+512GB"},
      {brand:"Apple",name:"iPhone 17 Pro (256GB) - Brand New",price:"\u20a62,400,000",priceValue:2400000,ram:"12GB",storage:"256GB",condition:"new",category:"phone",img:"https://via.placeholder.com/800x500?text=iPhone+17+Pro+256GB"},
      {brand:"Apple",name:"iPhone 17 Pro Max (512GB, eSIM) - Brand New",price:"\u20a63,050,000",priceValue:3050000,ram:"16GB",storage:"512GB",condition:"new",category:"phone",img:"https://via.placeholder.com/800x500?text=iPhone+17+Pro+Max+512GB"},
      {brand:"Apple",name:"iPhone 17 Pro Max (256GB) - Brand New",price:"\u20a62,850,000",priceValue:2850000,ram:"12GB",storage:"256GB",condition:"new",category:"phone",img:"https://via.placeholder.com/800x500?text=iPhone+17+Pro+Max+256GB"},
      {brand:"Sony",name:"PlayStation 5 Slim (with 10 games + 2 pads) - Fresh as new",price:"\u20a6900,000",priceValue:900000,ram:"",storage:"",condition:"used",category:"console",img:"https://via.placeholder.com/800x500?text=PS5+Slim+Bundle"},
      {brand:"Valve",name:"Steam Deck (LCD) 1TB - Just like new",price:"\u20a6760,000",priceValue:760000,ram:"",storage:"1TB",condition:"used",category:"handheld",img:"https://via.placeholder.com/800x500?text=Steam+Deck+1TB"},
      {brand:"Apple",name:"iPhone 13 Pro Max (UK used) 256GB",price:"\u20a6730,000",priceValue:730000,ram:"6GB",storage:"256GB",condition:"used",category:"phone",img:"https://via.placeholder.com/800x500?text=iPhone+13+Pro+Max+256GB"},
      {brand:"Apple",name:"iPhone 13 Pro Max (UK used) 128GB",price:"\u20a6685,000",priceValue:685000,ram:"6GB",storage:"128GB",condition:"used",category:"phone",img:"https://via.placeholder.com/800x500?text=iPhone+13+Pro+Max+128GB"},
      {brand:"Sony",name:"PS4 Slim (2 pads + 10 games) - Used",price:"\u20a6300,000",priceValue:300000,ram:"",storage:"",condition:"used",category:"console",img:"https://via.placeholder.com/800x500?text=PS4+Slim+Bundle"},
      {brand:"Sony",name:"PS5 Fat (UK used) (2 pad + 10 downloaded games) - FIFA25 package",price:"\u20a6810000",priceValue:810000,ram:"",storage:"",condition:"used",category:"console",img:"https://via.placeholder.com/800x500?text=PS5+Fat+FIFA25"},
      {brand:"Sony",name:"PS4 (UK used) 2 pads + 10 games - Fresh as new",price:"\u20a6270000",priceValue:270000,ram:"",storage:"",condition:"used",category:"console",img:"https://via.placeholder.com/800x500?text=PS4+Bundle"},
      {brand:"Dell",name:"XPS 13 Plus (12th Gen, 32GB, 1TB SSD, i7, Touch)",price:"\u20a61,730,000",priceValue:1730000,ram:"32GB",storage:"1TB",condition:"new",category:"laptop",img:"https://via.placeholder.com/800x500?text=Dell+XPS+13+Plus"},
      {brand:"Microsoft",name:"Xbox One (UK used) + 2 controllers + 7 games - Fresh as new",price:"\u20a6260,000",priceValue:260000,ram:"",storage:"",condition:"used",category:"console",img:"https://via.placeholder.com/800x500?text=Xbox+One+Bundle"},
      {brand:"Samsung",name:"Galaxy Z Fold 6 (UK used) 12GB/512GB - Fresh as new",price:"\u20a61,450,000",priceValue:1450000,ram:"12GB",storage:"512GB",condition:"used",category:"phone",img:"https://via.placeholder.com/800x500?text=Galaxy+Z+Fold+6"},
      {brand:"Sony",name:"PS3 (UK used) 2 pads + 10 games - Fresh as new",price:"\u20a6180,000",priceValue:180000,ram:"",storage:"",condition:"used",category:"console",img:"https://via.placeholder.com/800x500?text=PS3+Bundle"},
      {brand:"Samsung",name:"Tab A7 2020 (10.4\", 32GB, 3GB) - UK used",price:"\u20a6180,000",priceValue:180000,ram:"3GB",storage:"32GB",condition:"used",category:"tablet",img:"https://via.placeholder.com/800x500?text=Tab+A7+2020"},
      {brand:"Vivo",name:"Vivo V50 (12GB, 512GB) - Coming soon (in transit)",price:"\u20a6700,000",priceValue:700000,ram:"12GB",storage:"512GB",condition:"used",category:"phone",img:"https://via.placeholder.com/800x500?text=Vivo+V50"},
      {brand:"Apple",name:"Apple Watch Series 10 (42mm) - Brand New",price:"\u20a6430,000",priceValue:430000,ram:"",storage:"",condition:"new",category:"watch",img:"https://via.placeholder.com/800x500?text=Apple+Watch+S10"},
      {brand:"Samsung",name:"Galaxy Z Fold 7 (512GB) - Brand New (Physical SIM + eSIM)",price:"\u20a62,320,000",priceValue:2320000,ram:"",storage:"512GB",condition:"new",category:"phone",img:"https://via.placeholder.com/800x500?text=Galaxy+Z+Fold+7+512GB"},
      {brand:"Samsung",name:"65W Trio Power Adapter (2x Type-C + 1x USB) - Brand New",price:"\u20a615,000",priceValue:15000,ram:"",storage:"",condition:"new",category:"accessory",img:"https://via.placeholder.com/800x500?text=65W+Trio+Charger"},
      {brand:"Samsung",name:"Galaxy Z Flip 6 (UK used) 256GB - Fresh as new",price:"\u20a6790,000",priceValue:790000,ram:"",storage:"256GB",condition:"used",category:"phone",img:"https://via.placeholder.com/800x500?text=Galaxy+Z+Flip+6"},
      {brand:"Xiaomi",name:"Mi 11 Ultra (Foreign used) 12GB/256GB - Fresh as new",price:"\u20a6485,000",priceValue:485000,ram:"12GB",storage:"256GB",condition:"used",category:"phone",img:"https://via.placeholder.com/800x500?text=Mi+11+Ultra"},
      {brand:"Samsung",name:"Galaxy S23 Plus (UK used) 8GB/256GB - Fresh as new",price:"\u20a6700,000",priceValue:700000,ram:"8GB",storage:"256GB",condition:"used",category:"phone",img:"https://via.placeholder.com/800x500?text=Galaxy+S23+Plus"},
      {brand:"Sony",name:"PSVita (UK used) + 32GB + 10 games - Fresh as brand new",price:"\u20a6235,000",priceValue:235000,ram:"",storage:"32GB",condition:"used",category:"handheld",img:"https://via.placeholder.com/800x500?text=PSVita+Bundle"},
      {brand:"Dell",name:"XPS 13 9365 (UK used) x360 Core i5 8GB/256GB - Fresh as new",price:"\u20a6540,000",priceValue:540000,ram:"8GB",storage:"256GB",condition:"used",category:"laptop",img:"https://via.placeholder.com/800x500?text=Dell+XPS+13+9365"},
      {brand:"Google",name:"Pixel Watch 2 - Fresh as brand new",price:"\u20a6275,000",priceValue:275000,ram:"",storage:"",condition:"new",category:"watch",img:"https://via.placeholder.com/800x500?text=Pixel+Watch+2"},
      {brand:"Xiaomi",name:"Mi 11T Pro Dual (8+4GB, 256GB) - Fresh as new",price:"\u20a6255,000",priceValue:255000,ram:"8GB",storage:"256GB",condition:"used",category:"phone",img:"https://via.placeholder.com/800x500?text=Mi+11T+Pro"},
      {brand:"Infinix",name:"Infinix Smart 7 (4GB/64GB) - Fresh as new",price:"\u20a6100,000",priceValue:100000,ram:"4GB",storage:"64GB",condition:"used",category:"phone",img:"https://via.placeholder.com/800x500?text=Infinix+Smart+7"},
      {brand:"Google",name:"Pixel 6 Pro (UK used) 12GB/128GB",price:"\u20a6355,000",priceValue:355000,ram:"12GB",storage:"128GB",condition:"used",category:"phone",img:"https://via.placeholder.com/800x500?text=Pixel+6+Pro+128GB"},
      {brand:"Apple",name:"iPad Mini 6 (WiFi only) 64GB - Fresh as new",price:"\u20a6450,000",priceValue:450000,ram:"",storage:"64GB",condition:"used",category:"tablet",img:"https://via.placeholder.com/800x500?text=iPad+Mini+6+64GB"},
      {brand:"Google",name:"Pixel 6 (128GB) - \u20a6300,000",price:"\u20a6300,000",priceValue:300000,ram:"",storage:"128GB",condition:"used",category:"phone",img:"https://via.placeholder.com/800x500?text=Pixel+6+128GB"},
      {brand:"Google",name:"Pixel 6a (128GB) - \u20a6255,000",price:"\u20a6255,000",priceValue:255000,ram:"",storage:"128GB",condition:"used",category:"phone",img:"https://via.placeholder.com/800x500?text=Pixel+6a+128GB"},
      {brand:"Google",name:"Pixel 7 (128GB) - \u20a6360,000",price:"\u20a6360,000",priceValue:360000,ram:"",storage:"128GB",condition:"used",category:"phone",img:"https://via.placeholder.com/800x500?text=Pixel+7+128GB"},
      {brand:"Google",name:"Pixel 8 (128GB) - \u20a6490,000",price:"\u20a6490,000",priceValue:490000,ram:"",storage:"128GB",condition:"new",category:"phone",img:"https://via.placeholder.com/800x500?text=Pixel+8+128GB"},
      {brand:"Apple",name:"iWatch Series 6 44mm - \u20a6240,000",price:"\u20a6240,000",priceValue:240000,ram:"",storage:"",condition:"used",category:"watch",img:"https://via.placeholder.com/800x500?text=Apple+Watch+Series+6"},
      {brand:"Apple",name:"iWatch Series 7 45mm - \u20a6285,000",price:"\u20a6285,000",priceValue:285000,ram:"",storage:"",condition:"used",category:"watch",img:"https://via.placeholder.com/800x500?text=Apple+Watch+Series+7"},
      {brand:"Apple",name:"iWatch Series 8 45mm - \u20a6330,000",price:"\u20a6330,000",priceValue:330000,ram:"",storage:"",condition:"used",category:"watch",img:"https://via.placeholder.com/800x500?text=Apple+Watch+Series+8"},
      {brand:"Zealot",name:"Zealot S67 Bluetooth Speaker (14,400mAh) - \u20a668,000",price:"\u20a668,000",priceValue:68000,ram:"",storage:"",condition:"new",category:"accessory",img:"https://via.placeholder.com/800x500?text=Zealot+S67+Speaker"},
      {brand:"Motorola",name:"Motorola Razr Plus 2023 (UK used) 8GB/256GB",price:"\u20a6480,000",priceValue:480000,ram:"8GB",storage:"256GB",condition:"used",category:"phone",img:"https://via.placeholder.com/800x500?text=Motorola+Razr+Plus+2023"},
      {brand:"Apple",name:"iPod Touch 7th Gen (UK used) 32GB",price:"\u20a6230,000",priceValue:230000,ram:"",storage:"32GB",condition:"used",category:"audio",img:"https://via.placeholder.com/800x500?text=iPod+Touch+7G"},
      {brand:"Dell",name:"Latitude 3190 2-in-1 (UK used) Celeron, 4GB, 128GB",price:"\u20a6175,000",priceValue:175000,ram:"4GB",storage:"128GB",condition:"used",category:"laptop",img:"https://via.placeholder.com/800x500?text=Dell+Latitude+3190"},
      {brand:"Samsung",name:"Galaxy Watch 4 (Open box, GPS-only) - \u20a6120,000",price:"\u20a6120,000",priceValue:120000,ram:"",storage:"",condition:"used",category:"watch",img:"https://via.placeholder.com/800x500?text=Galaxy+Watch+4"},
      {brand:"Apple",name:"iPad Mini 4 (UK used) 128GB (SIM + eSIM support)",price:"\u20a6190,000",priceValue:190000,ram:"",storage:"128GB",condition:"used",category:"tablet",img:"https://via.placeholder.com/800x500?text=iPad+Mini+4+128GB"},
      {brand:"Samsung",name:"Galaxy S10e (UK used) 8GB/256GB",price:"\u20a6210,000",priceValue:210000,ram:"8GB",storage:"256GB",condition:"used",category:"phone",img:"https://via.placeholder.com/800x500?text=Galaxy+S10e+256GB"},
      {brand:"Google",name:"Pixel Fold (UK used) 12GB/512GB - Fresh as new",price:"\u20a6800,000",priceValue:800000,ram:"12GB",storage:"512GB",condition:"used",category:"phone",img:"https://via.placeholder.com/800x500?text=Pixel+Fold+512GB"},
      {brand:"Samsung",name:"Galaxy Tab S10 Ultra (Open box, missing stylus) - \u20a61,400,000",price:"\u20a61,400,000",priceValue:1400000,ram:"",storage:"",condition:"new",category:"tablet",img:"https://via.placeholder.com/800x500?text=Tab+S10+Ultra"},
      {brand:"LG",name:"LG G8X ThinQ (UK used) 6GB/128GB (Dual screen pouch)",price:"\u20a6320,000",priceValue:320000,ram:"6GB",storage:"128GB",condition:"used",category:"phone",img:"https://via.placeholder.com/800x500?text=LG+G8X"},
      {brand:"Samsung",name:"S23 Ultra (US) 512GB - Unlocked - \u20a6890,000",price:"\u20a6890,000",priceValue:890000,ram:"12GB",storage:"512GB",condition:"new",category:"phone",img:"https://via.placeholder.com/800x500?text=S23+Ultra+512GB"},
      {brand:"Samsung",name:"S24 Ultra (US) 512GB - \u20a61,100,000",price:"\u20a61,100,000",priceValue:1100000,ram:"12GB",storage:"512GB",condition:"new",category:"phone",img:"https://via.placeholder.com/800x500?text=S24+Ultra+512GB"},
      {brand:"Sony",name:"PS5 Digital Slim 30th Anniversary Edition 1TB - Brand New",price:"\u20a6790,000",priceValue:790000,ram:"",storage:"1TB",condition:"new",category:"console",img:"https://via.placeholder.com/800x500?text=PS5+30th+Anniversary+1TB"}
    ];
  
    // Fill brand-filter options dynamically (so filter options always match PRODUCTS)
    const brandFilter = $("#brand-filter");
    if (brandFilter) {
      const brands = Array.from(new Set(PRODUCTS.map(p => p.brand))).sort();
      // remove existing non-"all" options before adding
      const preserve = ["all"];
      brandFilter.innerHTML = `<option value="all">All Brands</option>` + brands.map(b => `<option value="${b}">${b}</option>`).join("");
    }
  
    // Fill RAM and Storage selects
    const ramSelect = document.createElement("select");
    ramSelect.id = "ram-filter";
    ramSelect.setAttribute("aria-label", "Filter by RAM");
    const storageSelect = document.createElement("select");
    storageSelect.id = "storage-filter";
    storageSelect.setAttribute("aria-label", "Filter by Storage");
  
    // Create sets of unique RAM & storage sizes
    const rams = Array.from(new Set(PRODUCTS.map(p => p.ram))).sort((a,b) => toNumber(a) - toNumber(b));
    const storages = Array.from(new Set(PRODUCTS.map(p => p.storage))).sort((a,b) => toNumber(a) - toNumber(b));
  
    ramSelect.innerHTML = `<option value="all">All RAM</option>` + rams.map(r => `<option value="${r}">${r}</option>`).join("");
    storageSelect.innerHTML = `<option value="all">All Storage</option>` + storages.map(s => `<option value="${s}">${s}</option>`).join("");
  
    // Insert RAM and Storage selects into the filter bar (if present)
    const filterBar = $(".filter-bar");
    if (filterBar) {
      // create a search input as well
      const searchInput = document.createElement("input");
      searchInput.type = "search";
      searchInput.id = "search-input";
      searchInput.placeholder = "Search model or keyword...";
      searchInput.setAttribute("aria-label", "Search products");
  
      // append selects and search input
      filterBar.appendChild(ramSelect);
      filterBar.appendChild(storageSelect);
      filterBar.appendChild(searchInput);
  
      // hook the references for later use
      window.__GADGET_FILTER_ELEMENTS = { brandFilter, priceFilter: $("#price-filter"), priceValue: $("#price-value"), ramSelect, storageSelect, searchInput };
    }
  
    // -----------------------
    // Render Product Catalog
    // -----------------------
    const productsGrid = $("#products-grid");
    let productsShown = 0;
    const PAGE_SIZE = 6;
  
    function formatPrice(n){
      if (!n && n !== 0) return "₦0";
      return "₦" + Number(n).toLocaleString();
    }
  
    function renderProducts(opts = {}) {
      // opts: { brand, maxPrice, ram, storage, query }
      const brand = opts.brand || "all";
      const maxPrice = (typeof opts.maxPrice !== "undefined") ? Number(opts.maxPrice) : Number($("#price-filter")?.value || 999999999);
      const ram = opts.ram || "all";
      const storage = opts.storage || "all";
      const query = (opts.query || "").trim().toLowerCase();
  
      // filter canonical PRODUCTS list
      const filtered = PRODUCTS.filter(p => {
        if (brand !== "all" && p.brand !== brand) return false;
        if (toNumber(p.price) > maxPrice) return false;
        if (ram !== "all" && p.ram !== ram) return false;
        if (storage !== "all" && p.storage !== storage) return false;
        if (query) {
          const hay = `${p.name} ${p.brand} ${p.ram} ${p.storage}`.toLowerCase();
          if (!hay.includes(query)) return false;
        }
        return true;
      });
  
      // determine how many to show (pagination)
      const start = 0;
      const end = productsShown || PAGE_SIZE;
      const toShow = filtered.slice(start, end);
  
      productsGrid.innerHTML = "";
      toShow.forEach(p => {
        // generate data-product JSON
        const dataProduct = {
          id: slug(p.name),
          name: p.name,
          price: p.price,
          ram: p.ram,
          storage: p.storage,
          battery: p.battery,
          img: p.img
        };
        const card = document.createElement("article");
        card.className = "product-card";
        // include data attributes for progressive enhancement & for modal fallback lookups
        card.setAttribute("data-product", JSON.stringify(dataProduct));
        card.setAttribute("data-ram", p.ram);
        card.setAttribute("data-storage", p.storage);
        card.innerHTML = `
          <img src="${p.img}" alt="${p.name}" loading="lazy">
          <div class="product-meta">
            <h4>${p.name}</h4>
            <p class="specs">${p.brand} • ${p.ram} • ${p.storage}</p>
            <p class="price">${p.price}</p>
            <div class="product-actions">
              <button class="btn small" data-open="${dataProduct.id}">Details</button>
              <a class="btn small wa" href="https://wa.me/2347034774672?text=${encodeURIComponent("Hello, I want the best price for " + p.name)}" target="_blank" rel="noopener">💬 WhatsApp</a>
            </div>
          </div>
        `;
        productsGrid.appendChild(card);
      });
  
      // show/hide load more
      if (filtered.length > (productsShown || PAGE_SIZE)) {
        $("#load-more").style.display = "inline-block";
      } else {
        $("#load-more").style.display = "none";
      }
    }
  
    // initialize
    productsShown = PAGE_SIZE;
    renderProducts();
  
    // load more
    $("#load-more").addEventListener("click", () => {
      productsShown += PAGE_SIZE;
      const elems = window.__GADGET_FILTER_ELEMENTS;
      const brand = elems.brandFilter.value;
      const maxPrice = Number(elems.priceFilter.value || 999999999);
      const ram = elems.ramSelect.value;
      const storage = elems.storageSelect.value;
      const query = elems.searchInput.value;
      renderProducts({ brand, maxPrice, ram, storage, query });
    });
  
    // Price UI sync
    $("#price-filter")?.addEventListener("input", (e) => {
      const v = Number(e.target.value || 999999999);
      $("#price-value").textContent = `Up to ${formatPrice(v)}`;
      productsShown = PAGE_SIZE;
      const elems = window.__GADGET_FILTER_ELEMENTS;
      renderProducts({
        brand: elems.brandFilter?.value || "all",
        maxPrice: v,
        ram: elems.ramSelect.value,
        storage: elems.storageSelect.value,
        query: elems.searchInput.value
      });
    });
  
    // Brand / Ram / Storage / Search listeners
    const elems = window.__GADGET_FILTER_ELEMENTS;
    if (elems) {
      elems.brandFilter.addEventListener("change", () => {
        productsShown = PAGE_SIZE;
        renderProducts({
          brand: elems.brandFilter.value,
          maxPrice: Number(elems.priceFilter.value),
          ram: elems.ramSelect.value,
          storage: elems.storageSelect.value,
          query: elems.searchInput.value
        });
      });
      elems.ramSelect.addEventListener("change", () => {
        productsShown = PAGE_SIZE;
        renderProducts({
          brand: elems.brandFilter.value,
          maxPrice: Number(elems.priceFilter.value),
          ram: elems.ramSelect.value,
          storage: elems.storageSelect.value,
          query: elems.searchInput.value
        });
      });
      elems.storageSelect.addEventListener("change", () => {
        productsShown = PAGE_SIZE;
        renderProducts({
          brand: elems.brandFilter.value,
          maxPrice: Number(elems.priceFilter.value),
          ram: elems.ramSelect.value,
          storage: elems.storageSelect.value,
          query: elems.searchInput.value
        });
      });
      elems.searchInput.addEventListener("input", () => {
        productsShown = PAGE_SIZE;
        renderProducts({
          brand: elems.brandFilter.value,
          maxPrice: Number(elems.priceFilter.value),
          ram: elems.ramSelect.value,
          storage: elems.storageSelect.value,
          query: elems.searchInput.value
        });
      });
    }
  
    // -------------------------
    // PRODUCT DETAIL OPENING
    // -------------------------
    // Support click on elements that have data-open or images/slides with data-product
    document.body.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-open]");
      if (btn) {
        const id = btn.dataset.open;
        // try to find data-product JSON on DOM first
        let found = null;
        $$("[data-product]").forEach(el => {
          try {
            const pd = JSON.parse(el.getAttribute("data-product"));
            if (pd.id === id) found = pd;
          } catch (err) { /* ignore */ }
        });
  
        // fallback: use canonical PRODUCTS map
        if (!found) {
          const fallback = PRODUCTS.find(p => slug(p.name) === id);
          if (fallback) {
            found = {
              id: slug(fallback.name),
              name: fallback.name,
              price: fallback.price,
              ram: fallback.ram,
              storage: fallback.storage,
              battery: fallback.battery,
              img: fallback.img
            };
          }
        }
  
        if (found) openModal(found);
        else alert("Product details not available.");
      }
    });
  
    // clicking a slide image that has data-product attribute opens modal using that JSON
    document.body.addEventListener("click", (e) => {
      const img = e.target.closest(".slide img, .product-card img");
      if (img && img.dataset && img.dataset.product) {
        try {
          const pd = JSON.parse(img.dataset.product);
          pd.img = img.src;
          openModal(pd);
        } catch (err) {
          // graceful fallback
          console.warn("Invalid product JSON on element", err);
        }
      } else if (img && img.closest(".product-card") && img.closest(".product-card").dataset.product) {
        try {
          const pd = JSON.parse(img.closest(".product-card").dataset.product);
          pd.img = img.src;
          openModal(pd);
        } catch (err) {}
      }
    });
  
    // -------------------------
    // TESTIMONIAL CAROUSEL
    // -------------------------
    (function testimonialCarousel(){
      const list = $(".testimonial-list");
      if (!list) return;
      const items = Array.from(list.children);
      if (!items.length) return;
  
      // wrap items into container for sliding if not already
      // We'll create controls (prev/next) and autoplay
      let active = 0;
      items.forEach((it, idx) => {
        it.classList.add("testimonial-item");
        it.style.transition = "transform 420ms cubic-bezier(.2,.9,.25,1), opacity 320ms";
        it.style.opacity = idx === active ? "1" : "0.28";
        it.style.transform = idx === active ? "translateY(0px)" : "translateY(6px)";
      });
  
      // create controls
      const controls = document.createElement("div");
      controls.className = "testimonial-controls";
      controls.innerHTML = `<button class="t-prev" aria-label="Previous testimonial">‹</button><button class="t-next" aria-label="Next testimonial">›</button>`;
      list.parentNode.insertBefore(controls, list.nextSibling);
  
      const show = (i) => {
        active = ((i % items.length) + items.length) % items.length;
        items.forEach((it, idx) => {
          it.style.opacity = idx === active ? "1" : "0.28";
          it.style.transform = idx === active ? "translateY(0px)" : "translateY(6px)";
        });
      };
  
      controls.querySelector(".t-prev").addEventListener("click", () => show(active - 1));
      controls.querySelector(".t-next").addEventListener("click", () => show(active + 1));
  
      // autoplay
      let autoplay = setInterval(() => show(active + 1), 5000);
      // pause on hover
      list.addEventListener("mouseenter", () => clearInterval(autoplay));
      list.addEventListener("mouseleave", () => { autoplay = setInterval(() => show(active + 1), 5000); });
  
    })();
  
    // --------- small UX touches ----------
    document.body.style.opacity = 0;
    document.body.style.transition = "opacity 400ms";
    setTimeout(()=> document.body.style.opacity = 1, 80);
  
    // Mobile menu toggle
    const mobileToggle = document.querySelector(".mobile-toggle");
    mobileToggle?.addEventListener("click", () => {
      const nav = document.querySelector(".main-nav");
      const expanded = mobileToggle.getAttribute("aria-expanded") === "true";
      mobileToggle.setAttribute("aria-expanded", String(!expanded));
      if (nav) nav.style.display = expanded ? "none" : "block";
    });
  
  });
  /* ===================== LIVE INTERACTIONS HELPERS ===================== */
/* Append to the end of script.js */
/* Lightweight, defensive — checks elements exist before touching them */

(function(){
  // small helper
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  // 1) sticky CTA pulse
  const sticky = document.querySelector('.sticky-cta a');
  if(sticky) {
    sticky.classList.add('pulse');
    // remove pulse after a user interacts
    sticky.addEventListener('click', ()=> sticky.classList.remove('pulse'));
  }

  // 2) Floating WhatsApp bubble (inject behavior if HTML present)
  const fab = document.querySelector('.fab-wa');
  if(fab){
    fab.addEventListener('click', ()=> {
      // quick micro-analytics: add ephemeral bump
      fab.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 260, easing: 'cubic-bezier(.2,.9,.25,1)' });
      // open whatsapp link
      window.open('https://wa.me/2347034774672?text='+encodeURIComponent('Hello TobbIe Gadgets — I have a question'), '_blank');
    });
  }

  // 3) Skeleton placeholders for #products-grid until JS renders
  const pg = document.getElementById('products-grid');
  if(pg && !pg.children.length){
    // show 4 skeleton cards for instant perceived performance
    for(let i=0;i<4;i++){
      const s = document.createElement('div');
      s.className = 'product-card skeleton-card';
      s.style.padding = '12px';
      s.innerHTML = `<div style="width:100%;display:flex;gap:12px;flex-direction:column">
        <div class="skeleton" style="height:140px;border-radius:10px"></div>
        <div style="height:14px;width:60%;margin-top:8px" class="skeleton"></div>
        <div style="height:12px;width:40%;margin-top:6px" class="skeleton"></div>
      </div>`;
      pg.appendChild(s);
    }
  }

  // 4) small parallax / tilt on hero image for a 3D feel (mobile disabled)
  const heroImg = document.querySelector('.hero-image img');
  if(heroImg && window.innerWidth > 600){
    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    heroImg.style.transition = 'transform 260ms cubic-bezier(.2,.9,.25,1)';
    document.querySelector('.hero').addEventListener('mousemove', (e) => {
      const rect = heroImg.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      heroImg.style.transform = `rotateX(${(-py*4).toFixed(2)}deg) rotateY(${(px*6).toFixed(2)}deg) translateZ(4px)`;
    });
    document.querySelector('.hero').addEventListener('mouseleave', ()=> heroImg.style.transform = 'none');
  }

  // 5) animate product cards into view when rendered (listening to DOM changes)
  const productsGrid = document.getElementById('products-grid');
  if(productsGrid){
    const animateCards = (nodeList)=>{
      Array.from(nodeList).forEach((card, i)=>{
        card.style.opacity = 0;
        card.style.transform = 'translateY(8px)';
        card.style.transition = 'opacity 420ms cubic-bezier(.2,.9,.25,1) '+(i*45)+'ms, transform 420ms cubic-bezier(.2,.9,.25,1) '+(i*45)+'ms';
        requestAnimationFrame(()=>{ card.style.opacity = 1; card.style.transform = 'translateY(0)'; });
      });
    };
    // initial animate if children exist
    if(productsGrid.children.length) animateCards(productsGrid.children);

    // observe for later renders (your existing JS may render cards)
    const mo = new MutationObserver(muts=>{
      muts.forEach(m=>{
        if(m.addedNodes && m.addedNodes.length) animateCards(m.addedNodes);
      });
    });
    mo.observe(productsGrid, { childList: true, subtree: false });
  }

  // 6) Improve nav toggle accessibility and show ctas also
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mainNav = document.querySelector('.main-nav');
  const headerCtas = document.querySelector('.header-ctas') || document.querySelector('.header-ctas') /* fallback */;
  if(mobileToggle){
    mobileToggle.addEventListener('click', ()=>{
      const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', String(!expanded));
      // toggle classes so CSS can handle layout if present
      mainNav && mainNav.classList.toggle('active');
      headerCtas && headerCtas.classList.toggle('active');
      // link the display fallback for older inline styling in case existing code uses it
      if(mainNav) mainNav.style.display = mainNav.classList.contains('active') ? 'flex' : 'none';
      if(headerCtas) headerCtas.style.display = headerCtas.classList.contains('active') ? 'flex' : 'none';
    });
  }

  // 7) Small UX: clicking product image in hero slides opens product modal (if tagged)
  document.querySelectorAll('.slide img, .product-card img').forEach(img=>{
    img.style.cursor = 'pointer';
    img.addEventListener('click', (e)=>{
      try{
        // try dataset inside data-product attr or closest .product-card dataset
        const prod = img.dataset.product ? JSON.parse(img.dataset.product) : (img.closest('.product-card') && JSON.parse(img.closest('.product-card').dataset.product));
        if(prod && typeof openModal === 'function') openModal(prod);
      }catch(err){}
    });
  });

  // 8) Small accessibility: ensure focus outlines when navigating with keyboard
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Tab') document.documentElement.classList.add('user-is-tabbing');
  });

  // 9) remove skeletons after a short delay (real content should render quick)
  setTimeout(()=>{
    document.querySelectorAll('.skeleton-card').forEach(s => s.remove());
  }, 900);

})();
