/* =========================================================
   VICTORIAS LUXURY SPA & WELLNESS — Site Behaviour
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initMobileNav();
  initHeroSlideshow();
  initRevealOnScroll();
  initMenu();
  initPackages();
  initGallery();
  initBookingWidget();
  initNewsletter();
  initFooter();
  initPetals();
});

/* ---------- Toast ---------- */
function showToast(message, duration = 3200) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("is-visible");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("is-visible"), duration);
}

/* ---------- Header scroll state + WhatsApp/contact wiring ---------- */
function initHeader() {
  const header = document.getElementById("site-header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const wa = document.getElementById("whatsapp-cta");
  if (wa) wa.href = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Victorias Luxury SPA, I'd like to book a treatment.")}`;

  const phoneEl = document.getElementById("footer-phone");
  if (phoneEl) phoneEl.textContent = CONFIG.PHONE_DISPLAY;
}

function initMobileNav() {
  const header = document.getElementById("site-header");
  const toggle = document.getElementById("nav-toggle");
  toggle.addEventListener("click", () => {
    const open = header.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", open);
  });
  document.querySelectorAll(".main-nav a").forEach(a => {
    a.addEventListener("click", () => header.classList.remove("nav-open"));
  });
}

/* ---------- Hero crossfade slideshow ---------- */
function initHeroSlideshow() {
  const slides = document.querySelectorAll(".hero-slide");
  if (slides.length < 2) return;
  let i = 0;
  setInterval(() => {
    slides[i].classList.remove("is-active");
    i = (i + 1) % slides.length;
    slides[i].classList.add("is-active");
  }, 6000);
}

/* ---------- Reveal on scroll ---------- */
function initRevealOnScroll() {
  const items = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: "0px 0px -8% 0px" });
  items.forEach(el => io.observe(el));
}

/* ---------- Menu (tabs + items) ---------- */
function initMenu() {
  const tabsEl = document.getElementById("menu-tabs");
  const panelsEl = document.getElementById("menu-panels");
  const nonPackageCats = SERVICE_CATEGORIES.filter(c => !c.isPackage);

  nonPackageCats.forEach((cat, idx) => {
    const tab = document.createElement("button");
    tab.className = "menu-tab" + (idx === 0 ? " is-active" : "");
    tab.textContent = cat.name;
    tab.dataset.cat = cat.id;
    tab.addEventListener("click", () => {
      document.querySelectorAll(".menu-tab").forEach(t => t.classList.remove("is-active"));
      document.querySelectorAll(".menu-panel").forEach(p => p.classList.remove("is-active"));
      tab.classList.add("is-active");
      document.getElementById(`panel-${cat.id}`).classList.add("is-active");
    });
    tabsEl.appendChild(tab);

    const panel = document.createElement("div");
    panel.className = "menu-panel" + (idx === 0 ? " is-active" : "");
    panel.id = `panel-${cat.id}`;
    cat.items.forEach(item => {
      panel.appendChild(buildMenuItemCard(item));
    });
    panelsEl.appendChild(panel);
  });
}

function buildMenuItemCard(item) {
  const card = document.createElement("div");
  card.className = "menu-item";
  card.innerHTML = `
    <div class="menu-item-top">
      <h3>${item.name}</h3>
      <span class="menu-item-price">${item.note === "From R250" ? item.note : formatZAR(item.price)}</span>
    </div>
    ${item.duration || item.note ? `<div class="menu-item-meta">${[item.duration, item.note].filter(Boolean).join(" &middot; ")}</div>` : ""}
    ${item.desc ? `<p class="menu-item-desc">${item.desc}</p>` : ""}
    <button class="menu-item-book" data-service="${item.id}">Book This &rarr;</button>
  `;
  card.querySelector(".menu-item-book").addEventListener("click", () => {
    selectServiceAndScrollToBooking(item.id);
  });
  return card;
}

/* ---------- Packages ---------- */
function initPackages() {
  const grid = document.getElementById("packages-grid");
  const pkgCat = SERVICE_CATEGORIES.find(c => c.isPackage);
  pkgCat.items.forEach(pkg => {
    const card = document.createElement("div");
    card.className = "package-card";
    card.innerHTML = `
      <h3>${pkg.name}</h3>
      <div class="package-price">${formatZAR(pkg.price)}</div>
      <div class="package-duration">${[pkg.duration, pkg.note].filter(Boolean).join(" &middot; ")}</div>
      <ul class="package-includes">${pkg.includes.map(i => `<li>${i}</li>`).join("")}</ul>
      <button class="btn btn-outline" data-service="${pkg.id}">Book This Package</button>
    `;
    card.querySelector("button").addEventListener("click", () => selectServiceAndScrollToBooking(pkg.id));
    grid.appendChild(card);
  });
}

/* ---------- Gallery ---------- */
const GALLERY_ITEMS = [
  { src: "images/gallery-spa-1.jpg", cat: "spa",       label: "Our Spa" },
  { src: "images/gallery-spa-2.jpg", cat: "spa",       label: "Our Spa" },
  { src: "images/gallery-spa-3.jpg", cat: "spa",       label: "Our Spa" },
  { src: "images/gallery-spa-4.jpg", cat: "spa",       label: "Our Spa" },
  { src: "images/gallery-treatment-1.jpg", cat: "treatments", label: "Treatments" },
  { src: "images/gallery-treatment-2.jpg", cat: "treatments", label: "Treatments" },
  { src: "images/gallery-wellness-1.jpg",  cat: "wellness",   label: "Wellness Experience" },
  { src: "images/hero-2.jpg",              cat: "wellness",   label: "Wellness Experience" },
  { src: "images/gallery-beauty-1.jpg",    cat: "beauty",      label: "Beauty & Self-Care" },
  { src: "images/hero-1.jpg",              cat: "spa",         label: "Our Spa" },
  { src: "images/hero-3.jpg",              cat: "treatments",  label: "Treatments" }
];
const GALLERY_CATS = [
  { id: "all", name: "All" },
  { id: "spa", name: "Our Spa" },
  { id: "treatments", name: "Treatments" },
  { id: "wellness", name: "Wellness Experience" },
  { id: "beauty", name: "Beauty & Self-Care" }
];

function initGallery() {
  const tabsEl = document.getElementById("gallery-tabs");
  const gridEl = document.getElementById("gallery-grid");

  GALLERY_CATS.forEach((cat, idx) => {
    const tab = document.createElement("button");
    tab.className = "gallery-tab" + (idx === 0 ? " is-active" : "");
    tab.textContent = cat.name;
    tab.addEventListener("click", () => {
      document.querySelectorAll(".gallery-tab").forEach(t => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      renderGallery(cat.id);
    });
    tabsEl.appendChild(tab);
  });

  renderGallery("all");

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  document.getElementById("lightbox-close").addEventListener("click", () => lightbox.classList.remove("is-open"));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.classList.remove("is-open"); });

  gridEl.addEventListener("click", (e) => {
    const item = e.target.closest(".gallery-item");
    if (!item) return;
    lightboxImg.src = item.dataset.full;
    lightbox.classList.add("is-open");
  });
}

function renderGallery(catId) {
  const gridEl = document.getElementById("gallery-grid");
  gridEl.innerHTML = "";
  const items = catId === "all" ? GALLERY_ITEMS : GALLERY_ITEMS.filter(i => i.cat === catId);
  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "gallery-item";
    div.dataset.full = item.src;
    div.innerHTML = `<img src="${item.src}" alt="${item.label}" loading="lazy"><span class="gallery-item-cap">${item.label}</span>`;
    gridEl.appendChild(div);
  });
}

/* ---------- Booking widget ---------- */
let bookingState = { serviceId: null, date: "", time: "", name: "", email: "", phone: "", notes: "", newsletter: false };

function selectServiceAndScrollToBooking(serviceId) {
  bookingState.serviceId = serviceId;
  const select = document.getElementById("booking-service-select");
  select.value = serviceId;
  goToStep(1);
  document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
}

function allServiceItems() {
  return SERVICE_CATEGORIES.flatMap(c => c.items.map(i => ({ ...i, category: c.name })));
}

function initBookingWidget() {
  const select = document.getElementById("booking-service-select");
  allServiceItems().forEach(item => {
    const opt = document.createElement("option");
    opt.value = item.id;
    opt.textContent = `${item.name} — ${formatZAR(item.price)} (${item.category})`;
    select.appendChild(opt);
  });
  select.addEventListener("change", () => bookingState.serviceId = select.value);
  if (!bookingState.serviceId && select.options.length) {
    bookingState.serviceId = select.options[0].value;
  }

  // populate time slots based on business hours
  const timeSelect = document.getElementById("booking-time");
  ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"].forEach(t => {
    const opt = document.createElement("option");
    opt.value = t; opt.textContent = t;
    timeSelect.appendChild(opt);
  });
  const dateInput = document.getElementById("booking-date");
  dateInput.min = new Date().toISOString().split("T")[0];

  document.getElementById("step1-next").addEventListener("click", () => goToStep(2));
  document.getElementById("step2-next").addEventListener("click", () => {
    bookingState.date = dateInput.value;
    bookingState.time = timeSelect.value;
    if (!bookingState.date || !bookingState.time) { showToast("Please choose a date and time."); return; }
    goToStep(3);
  });
  document.getElementById("step3-next").addEventListener("click", () => {
    bookingState.name = document.getElementById("booking-name").value.trim();
    bookingState.email = document.getElementById("booking-email").value.trim();
    bookingState.phone = document.getElementById("booking-phone").value.trim();
    bookingState.notes = document.getElementById("booking-notes").value.trim();
    bookingState.newsletter = document.getElementById("booking-newsletter").checked;
    if (!bookingState.name || !bookingState.email || !bookingState.phone) {
      showToast("Please fill in your name, email and phone."); return;
    }
    renderBookingSummary();
    goToStep(4);
  });
  document.querySelectorAll("[data-back]").forEach(btn => {
    btn.addEventListener("click", () => goToStep(parseInt(btn.dataset.back, 10)));
  });
  document.getElementById("pay-deposit-btn").addEventListener("click", handlePayDeposit);
}

function goToStep(n) {
  document.querySelectorAll(".step-dot").forEach(d => {
    const s = parseInt(d.dataset.step, 10);
    d.classList.toggle("is-active", s === n);
    d.classList.toggle("is-done", s < n);
  });
  document.querySelectorAll(".booking-step").forEach(p => {
    p.classList.toggle("is-active", parseInt(p.dataset.stepPanel, 10) === n);
  });
}

function renderBookingSummary() {
  const item = allServiceItems().find(i => i.id === bookingState.serviceId);
  if (!item) return;
  const deposit = calcDeposit(item.price);
  const dateStr = bookingState.date ? new Date(bookingState.date + "T00:00:00").toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";
  document.getElementById("booking-summary").innerHTML = `
    <div class="booking-summary-row"><span>Treatment</span><strong>${item.name}</strong></div>
    <div class="booking-summary-row"><span>Date &amp; Time</span><strong>${dateStr} &middot; ${bookingState.time}</strong></div>
    <div class="booking-summary-row"><span>Treatment Price</span><strong>${formatZAR(item.price)}</strong></div>
    <div class="booking-summary-row total"><span>Deposit Due Now</span><strong>${formatZAR(deposit)}</strong></div>
  `;
  bookingState.deposit = deposit;
  bookingState.servicePrice = item.price;
  bookingState.serviceName = item.name;
}

async function handlePayDeposit() {
  if (!document.getElementById("booking-policy-agree").checked) {
    showToast("Please agree to the cancellation & deposit policy first.");
    return;
  }
  const btn = document.getElementById("pay-deposit-btn");
  btn.disabled = true;
  btn.textContent = "Processing...";

  try {
    if (CONFIG.BACKEND_CONNECTED) {
      // --- LIVE MODE: create a Yoco checkout session via the Supabase Edge Function ---
      const res = await fetch(CONFIG.YOCO_CHECKOUT_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents: bookingState.deposit * 100,
          currency: "ZAR",
          booking: bookingState
        })
      });
      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl; // send guest to Yoco's hosted checkout
        return;
      }
      throw new Error(data.error || "Could not start payment.");
    } else {
      // --- DEMO MODE: no backend connected yet — simulate the flow so the UI is testable ---
      await new Promise(r => setTimeout(r, 900));
      showToast(`Demo mode: deposit of ${formatZAR(bookingState.deposit)} would be charged via Yoco now.`, 4500);
      console.log("Booking captured (demo mode — connect Supabase to persist):", bookingState);
    }
  } catch (err) {
    console.error(err);
    showToast("Something went wrong starting the payment. Please try again or WhatsApp us.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Pay Deposit & Confirm";
  }
}

/* ---------- Newsletter / slot-alert signup ---------- */
function initNewsletter() {
  const form = document.getElementById("newsletter-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("newsletter-email").value.trim();
    if (!email) return;
    if (CONFIG.BACKEND_CONNECTED) {
      // Insert into Supabase `subscribers` table (see supabase/schema.sql).
      // Example once supabase-js is loaded:
      // await supabaseClient.from('subscribers').insert({ email });
      console.log("TODO: insert subscriber into Supabase:", email);
    } else {
      console.log("Demo mode — subscriber captured locally:", email);
    }
    showToast("You're on the list! We'll email you about free slots.");
    form.reset();
  });
}

function initFooter() {
  document.getElementById("footer-year").textContent = new Date().getFullYear();
}

/* ---------- Falling petals background ---------- */
function initPetals() {
  const canvas = document.getElementById("petals-canvas");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  let w, h, petals;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function makePetal() {
    return {
      x: Math.random() * w,
      y: Math.random() * -h,
      size: 6 + Math.random() * 9,
      speedY: 0.4 + Math.random() * 0.7,
      speedX: Math.random() * 0.6 - 0.3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.005 + Math.random() * 0.01,
      opacity: 0.25 + Math.random() * 0.35
    };
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = "#d8b877";
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    petals.forEach(p => {
      p.y += p.speedY;
      p.sway += p.swaySpeed;
      p.x += p.speedX + Math.sin(p.sway) * 0.4;
      p.rotation += p.rotationSpeed;
      if (p.y > h + 20) {
        Object.assign(p, makePetal(), { y: -20 });
      }
      drawPetal(p);
    });
    requestAnimationFrame(tick);
  }

  resize();
  const count = window.innerWidth < 720 ? 14 : 26;
  petals = Array.from({ length: count }, makePetal);
  window.addEventListener("resize", resize);
  tick();
}
