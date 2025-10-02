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
  