/* =========================================================
   VICTORIAS ADMIN — Dashboard Behaviour
   Demo mode (CONFIG.BACKEND_CONNECTED === false): runs entirely
   on sample data held in memory, so you can preview the whole
   dashboard before Supabase is connected. Nothing here is saved.
   Live mode: swap the DEMO_* fetch functions below for real
   Supabase queries (examples included in comments).
   ========================================================= */

const DEMO_PASSWORD = "victoria2026";

const DEMO_BOOKINGS = [
  { guest: "Amahle Dlamini", email: "amahle@example.com", phone: "072 555 1234", service: "Royal Radiance Facial", date: "2026-09-08", time: "10:00", price: 1150, deposit: 350, status: "confirmed" },
  { guest: "Chloe van der Merwe", email: "chloe@example.com", phone: "082 555 9981", service: "Ultimate Luxury Retreat", date: "2026-09-09", time: "13:00", price: 2850, deposit: 860, status: "pending" },
  { guest: "Naledi Khumalo", email: "naledi@example.com", phone: "071 555 4420", service: "Swedish Full Body Massage (60 min)", date: "2026-09-05", time: "15:00", price: 850, deposit: 260, status: "cancelled" },
  { guest: "Sarah Botha", email: "sarah@example.com", phone: "083 555 7712", service: "Couples Luxury Escape", date: "2026-09-14", time: "11:00", price: 3200, deposit: 960, status: "confirmed" }
];

const DEMO_SUBSCRIBERS = [
  { email: "amahle@example.com", source: "Booking opt-in", date: "2026-08-29" },
  { email: "lerato@example.com", source: "Newsletter form", date: "2026-08-30" },
  { email: "jess@example.com", source: "Newsletter form", date: "2026-09-01" }
];

let blockedSlots = [];

document.addEventListener("DOMContentLoaded", () => {
  initLogin();
});

async function initLogin() {
  const notice = document.getElementById("demo-mode-notice");
  const usingSupabase = CONFIG.SUPABASE_CONNECTED && supabaseClient;
  if (!usingSupabase) notice.hidden = false;

  if (usingSupabase) {
    const { data } = await supabaseClient.auth.getSession();
    if (data.session) { showApp(); return; }
  } else if (sessionStorage.getItem("victorias_admin_session")) {
    showApp();
    return;
  }

  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const errorEl = document.getElementById("login-error");
    errorEl.hidden = true;

    if (usingSupabase) {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) {
        errorEl.textContent = error.message + " — make sure you've added yourself under Supabase Authentication → Users.";
        errorEl.hidden = false;
        return;
      }
      showApp();
      return;
    }

    if (password === DEMO_PASSWORD) {
      sessionStorage.setItem("victorias_admin_session", "demo");
      showApp();
    } else {
      errorEl.textContent = "Incorrect demo password.";
      errorEl.hidden = false;
    }
  });
}

async function showApp() {
  document.getElementById("admin-login").hidden = true;
  const app = document.getElementById("admin-app");
  app.hidden = false;

  const usingSupabase = CONFIG.SUPABASE_CONNECTED && supabaseClient;
  const banner = document.getElementById("admin-banner");
  if (!usingSupabase) {
    banner.hidden = false;
    banner.textContent = "Demo mode — showing sample bookings & subscribers. Connect Supabase in js/config.js to see real data.";
  } else if (!CONFIG.YOCO_CONNECTED) {
    banner.hidden = false;
    banner.textContent = "Supabase connected — bookings & subscribers below are real. Yoco isn't wired up yet, so new bookings arrive as \"pending\" until you confirm the deposit with the guest directly.";
  }

  initNav();
  await initBookings();
  await initAvailability();
  await initSubscribers();
  initContent();
  initSettings();

  document.getElementById("logout-btn").addEventListener("click", async () => {
    if (usingSupabase) await supabaseClient.auth.signOut();
    sessionStorage.removeItem("victorias_admin_session");
    location.reload();
  });
}

function initNav() {
  document.querySelectorAll(".admin-nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".admin-nav-item").forEach(b => b.classList.remove("is-active"));
      document.querySelectorAll(".admin-panel").forEach(p => p.classList.remove("is-active"));
      btn.classList.add("is-active");
      document.querySelector(`.admin-panel[data-panel="${btn.dataset.panel}"]`).classList.add("is-active");
    });
  });
}

/* ---------- Bookings ---------- */
let currentBookings = DEMO_BOOKINGS;

async function fetchBookings() {
  if (!(CONFIG.SUPABASE_CONNECTED && supabaseClient)) return DEMO_BOOKINGS;
  const { data, error } = await supabaseClient
    .from("bookings")
    .select("*")
    .order("booking_date", { ascending: true });
  if (error) { console.error(error); showBanner("Could not load bookings: " + error.message); return []; }
  return data.map(r => ({
    id: r.id,
    guest: r.guest_name,
    email: r.guest_email,
    phone: r.guest_phone,
    service: r.service_name,
    date: r.booking_date,
    time: (r.booking_time || "").slice(0, 5),
    price: Number(r.service_price),
    deposit: Number(r.deposit_amount),
    status: r.status
  }));
}

function showBanner(msg) {
  const banner = document.getElementById("admin-banner");
  banner.hidden = false;
  banner.textContent = msg;
}

async function initBookings() {
  currentBookings = await fetchBookings();
  renderBookingStats(currentBookings);
  renderBookingsTable(currentBookings);

  document.getElementById("booking-filter").addEventListener("change", (e) => {
    const val = e.target.value;
    let filtered = currentBookings;
    const today = new Date().toISOString().split("T")[0];
    if (val === "upcoming") filtered = currentBookings.filter(b => b.date >= today && b.status !== "cancelled");
    else if (val !== "all") filtered = currentBookings.filter(b => b.status === val);
    renderBookingsTable(filtered);
  });
}

function renderBookingStats(rows) {
  const total = rows.length;
  const confirmed = rows.filter(r => r.status === "confirmed").length;
  const pending = rows.filter(r => r.status === "pending").length;
  const revenue = rows.filter(r => r.status !== "cancelled").reduce((s, r) => s + r.deposit, 0);
  document.getElementById("booking-stats").innerHTML = `
    <div class="admin-stat-card"><div class="num">${total}</div><div class="label">Total Bookings</div></div>
    <div class="admin-stat-card"><div class="num">${confirmed}</div><div class="label">Confirmed</div></div>
    <div class="admin-stat-card"><div class="num">${pending}</div><div class="label">Awaiting Deposit</div></div>
    <div class="admin-stat-card"><div class="num">${formatZAR(revenue)}</div><div class="label">Deposits Collected</div></div>
  `;
}

function renderBookingsTable(rows) {
  const tbody = document.getElementById("bookings-tbody");
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--muted);">No bookings match this filter.</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(b => `
    <tr>
      <td>${b.guest}</td>
      <td>${b.service}</td>
      <td>${new Date(b.date + "T00:00:00").toLocaleDateString("en-ZA", { day: "numeric", month: "short" })} &middot; ${b.time}</td>
      <td>${formatZAR(b.deposit)}</td>
      <td><span class="status-pill ${b.status}">${b.status}</span></td>
      <td>${b.email}<br><span style="color:var(--muted)">${b.phone}</span></td>
      <td>${b.id ? `<button class="row-action" onclick="manageBooking('${b.id}')">Manage</button>` : ""}</td>
    </tr>
  `).join("");
}

async function manageBooking(id) {
  const choice = prompt("Set status to: confirmed, cancelled, completed or no_show");
  const valid = ["confirmed", "cancelled", "completed", "no_show", "pending"];
  if (!choice || !valid.includes(choice.trim().toLowerCase())) return;
  const { error } = await supabaseClient.from("bookings").update({ status: choice.trim().toLowerCase() }).eq("id", id);
  if (error) { alert("Could not update: " + error.message); return; }
  currentBookings = await fetchBookings();
  renderBookingStats(currentBookings);
  renderBookingsTable(currentBookings);
}

/* ---------- Availability ---------- */
const usingSupabaseDB = () => CONFIG.SUPABASE_CONNECTED && supabaseClient;

async function fetchBlockedSlots() {
  if (!usingSupabaseDB()) return blockedSlots;
  const { data, error } = await supabaseClient.from("blocked_slots").select("*").order("block_date");
  if (error) { console.error(error); return []; }
  return data.map(r => ({ id: r.id, date: r.block_date, from: (r.from_time || "").slice(0, 5), to: (r.to_time || "").slice(0, 5), reason: r.reason || "Unavailable" }));
}

async function initAvailability() {
  document.getElementById("block-date").min = new Date().toISOString().split("T")[0];
  document.getElementById("block-slot-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const entry = {
      date: document.getElementById("block-date").value,
      from: document.getElementById("block-from").value,
      to: document.getElementById("block-to").value,
      reason: document.getElementById("block-reason").value.trim() || "Unavailable"
    };
    if (usingSupabaseDB()) {
      const { error } = await supabaseClient.from("blocked_slots").insert({
        block_date: entry.date, from_time: entry.from, to_time: entry.to, reason: entry.reason
      });
      if (error) { alert("Could not save: " + error.message); return; }
    } else {
      blockedSlots.push(entry);
    }
    await renderBlockedTable();
    e.target.reset();
  });
  await renderBlockedTable();
}

async function renderBlockedTable() {
  const rows = await fetchBlockedSlots();
  const tbody = document.getElementById("blocked-tbody");
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--muted);">No blocked times yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map((s, idx) => `
    <tr>
      <td>${new Date(s.date + "T00:00:00").toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}</td>
      <td>${s.from} &ndash; ${s.to}</td>
      <td>${s.reason}</td>
      <td><button class="row-action" onclick="removeBlockedSlot('${s.id ?? idx}')">Remove</button></td>
    </tr>
  `).join("");
}
async function removeBlockedSlot(idOrIdx) {
  if (usingSupabaseDB()) {
    const { error } = await supabaseClient.from("blocked_slots").delete().eq("id", idOrIdx);
    if (error) { alert("Could not remove: " + error.message); return; }
  } else {
    blockedSlots.splice(Number(idOrIdx), 1);
  }
  await renderBlockedTable();
}

/* ---------- Subscribers ---------- */
let currentSubscribers = DEMO_SUBSCRIBERS;

async function fetchSubscribers() {
  if (!usingSupabaseDB()) return DEMO_SUBSCRIBERS;
  const { data, error } = await supabaseClient.from("subscribers").select("*").order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return data.map(r => ({ email: r.email, source: r.source, date: r.created_at }));
}

async function initSubscribers() {
  currentSubscribers = await fetchSubscribers();
  renderSubscribers(currentSubscribers);
  document.getElementById("export-subscribers").addEventListener("click", () => {
    const csv = "email,source,date\n" + currentSubscribers.map(s => `${s.email},${s.source},${s.date}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "victorias-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("notify-subscribers").addEventListener("click", async () => {
    if (!CONFIG.N8N_SLOT_ALERT_WEBHOOK_URL) {
      showBanner("Set N8N_SLOT_ALERT_WEBHOOK_URL in js/config.js first — see README Step 5.");
      return;
    }
    if (!currentSubscribers.length) {
      showBanner("No subscribers yet — nothing to send.");
      return;
    }
    if (!confirm(`Email all ${currentSubscribers.length} subscribers about newly opened slots?`)) return;

    const btn = document.getElementById("notify-subscribers");
    btn.disabled = true;
    btn.textContent = "Sending...";
    try {
      await fetch(CONFIG.N8N_SLOT_ALERT_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      showBanner(`Slot alert sent to ${currentSubscribers.length} subscriber(s).`);
    } catch (err) {
      console.error(err);
      showBanner("Couldn't reach the n8n webhook — check the URL in js/config.js and that the workflow is active.");
    } finally {
      btn.disabled = false;
      btn.textContent = "🔔 Notify Subscribers";
    }
  });
}

function renderSubscribers(rows) {
  document.getElementById("subscribers-tbody").innerHTML = rows.map(s => `
    <tr><td>${s.email}</td><td>${s.source}</td><td>${new Date(s.date).toLocaleDateString("en-ZA")}</td></tr>
  `).join("");
}

/* ---------- Content ---------- */
function initContent() {
  const images = [
    "hero-1.jpg","hero-2.jpg","hero-3.jpg",
    "gallery-spa-1.jpg","gallery-spa-2.jpg","gallery-spa-3.jpg","gallery-spa-4.jpg",
    "gallery-treatment-1.jpg","gallery-treatment-2.jpg","gallery-wellness-1.jpg","gallery-beauty-1.jpg"
  ];
  document.getElementById("content-preview-grid").innerHTML = images.map(i => `<img src="images/${i}" alt="${i}" loading="lazy">`).join("");
}

/* ---------- Settings ---------- */
function initSettings() {
  document.getElementById("settings-business").innerHTML = `
    <dt>Business Name</dt><dd>${CONFIG.BUSINESS_NAME}</dd>
    <dt>Location</dt><dd>${CONFIG.SUBURB}</dd>
    <dt>Email</dt><dd>${CONFIG.EMAIL}</dd>
    <dt>Phone</dt><dd>${CONFIG.PHONE_DISPLAY}</dd>
  `;
  document.getElementById("settings-backend").innerHTML = `
    <dt>Supabase Connected</dt><dd>${CONFIG.SUPABASE_CONNECTED ? "Yes — bookings & subscribers are real" : "No — running in demo mode"}</dd>
    <dt>Yoco Connected</dt><dd>${CONFIG.YOCO_CONNECTED ? "Yes — deposits charge live" : "Not yet — bookings save as \"pending\" until you deploy the Yoco Edge Function"}</dd>
    <dt>Deposit Rate</dt><dd>${(DEPOSIT_RATE * 100).toFixed(0)}% (min ${formatZAR(DEPOSIT_MIN)})</dd>
  `;
}
