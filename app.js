// Equimatch — Landing + Fake Login + Dashboard gate (localStorage)

const STORAGE_USER = "equimatchUser";
const STORAGE_MARES = "equimatchMares";

// Elements
const navToggle = document.querySelector(".nav-toggle");
const navMobile = document.getElementById("navMobile");

const loginBtn = document.getElementById("loginBtn");
const loginBtnMobile = document.getElementById("loginBtnMobile");

const userMenu = document.getElementById("userMenu");
const userMenuMobile = document.getElementById("userMenuMobile");

const userPill = document.getElementById("userPill");
const userPillMobile = document.getElementById("userPillMobile");

const logoutBtn = document.getElementById("logoutBtn");
const logoutBtnMobile = document.getElementById("logoutBtnMobile");

const toDashboardBtn = document.getElementById("toDashboardBtn");

const ctaStart = document.getElementById("ctaStart");
const ctaLoginBottom = document.getElementById("ctaLoginBottom");
const ctaFree = document.getElementById("ctaFree");
const ctaBreeder = document.getElementById("ctaBreeder");
const ctaPro = document.getElementById("ctaPro");

const dashboardSection = document.getElementById("dashboard");

const loginModal = document.getElementById("loginModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const loginName = document.getElementById("loginName");
const loginEmail = document.getElementById("loginEmail");

const mareForm = document.getElementById("mareForm");
const maresList = document.getElementById("maresList");
const mareSelect = document.getElementById("mareSelect");

const matchForm = document.getElementById("matchForm");
const clearMatchBtn = document.getElementById("clearMatchBtn");
const resultsEl = document.getElementById("results");

const publicStallionsEl = document.getElementById("publicStallions");
const resetDemoBtn = document.getElementById("resetDemoBtn");

// Hero image fallback
const hero = document.querySelector(".hero-media");
if (hero) {
  const primary = hero.getAttribute("data-hero-image");
  const fallback = hero.getAttribute("data-hero-fallback");

  const img = new Image();
  img.onload = () => { hero.style.backgroundImage = `url('${primary}')`; };
  img.onerror = () => { hero.style.backgroundImage = `url('${fallback}')`; };
  img.src = primary;
}

// Mobile nav toggle
if (navToggle && navMobile) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    navMobile.hidden = expanded;
  });
}

// Mock stallions
const stallions = [
  { id:"aurelius", name:"Aurelius", studbook:"KWPN", discipline:"Jumping", height:"165-170", semen:"Chilled", region:"EU", color:"Brun", index:142, img:"images/stallion-1.jpg" },
  { id:"valentino", name:"Valentino", studbook:"SWB", discipline:"Dressage", height:"170+", semen:"Frozen", region:"Sweden", color:"Fux", index:138, img:"images/stallion-2.jpg" },
  { id:"northwind", name:"Northwind", studbook:"Holsteiner", discipline:"Jumping", height:"165-170", semen:"Fresh", region:"International", color:"Mörkbrun", index:145, img:"images/stallion-3.jpg" },
];

// ---------- Helpers ----------
function getUser() {
  try {
    const raw = localStorage.getItem(STORAGE_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setUser(user) {
  localStorage.setItem(STORAGE_USER, JSON.stringify(user));
}

function clearUser() {
  localStorage.removeItem(STORAGE_USER);
}

function getMares() {
  try {
    const raw = localStorage.getItem(STORAGE_MARES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setMares(mares) {
  localStorage.setItem(STORAGE_MARES, JSON.stringify(mares));
}

function norm(str) {
  return (str || "").toLowerCase().trim();
}

function openModal() {
  if (!loginModal) return;
  loginModal.classList.remove("hidden");
  loginModal.setAttribute("aria-hidden", "false");
  setTimeout(() => loginName?.focus(), 0);
}

function closeModal() {
  if (!loginModal) return;
  loginModal.classList.add("hidden");
  loginModal.setAttribute("aria-hidden", "true");
}

// ---------- UI rendering ----------
function renderPublicStallions() {
  if (!publicStallionsEl) return;
  const items = stallions.map(s => stallionCardHtml(s, false)).join("");
  publicStallionsEl.innerHTML = items;
}

function stallionCardHtml(s, showProfileLink = true) {
  return `
    <article class="stallion">
      <div class="stallion-img" style="background-image:url('${s.img}');"></div>
      <div class="stallion-body">
        <h3 class="stallion-name">${s.name}</h3>
        <p class="stallion-meta">${s.studbook} • ${s.discipline} • ${s.height} • Index ${s.index}</p>
        <div class="stallion-tags">
          <span class="tag">${s.semen}</span>
          <span class="tag">${s.region === "Sweden" ? "Sverige" : (s.region === "International" ? "Internationellt" : "EU")}</span>
          <span class="tag">${s.color}</span>
        </div>
        ${showProfileLink ? `<a class="link" href="#">Visa profil →</a>` : ``}
      </div>
    </article>
  `;
}

function renderResults(items) {
  if (!resultsEl) return;
  resultsEl.innerHTML = items.map(s => stallionCardHtml(s, true)).join("");
}

function renderMares() {
  const mares = getMares();

  if (maresList) {
    maresList.innerHTML = mares.length === 0
      ? `<div class="mare-item"><div><div class="mare-name">Inga ston ännu</div><div class="mare-meta">Lägg till ett sto för att matcha.</div></div></div>`
      : mares.map(m => `
        <div class="mare-item">
          <div>
            <div class="mare-name">${m.name}</div>
            <div class="mare-meta">${m.studbook} • ${m.discipline} • ${m.height}${m.color ? ` • ${m.color}` : ""}${m.notes ? ` • ${m.notes}` : ""}</div>
          </div>
          <div class="mare-actions">
            <button class="small-btn" data-action="select" data-id="${m.id}">Välj</button>
            <button class="small-btn" data-action="delete" data-id="${m.id}">Ta bort</button>
          </div>
        </div>
      `).join("");
  }

  if (mareSelect) {
    mareSelect.innerHTML = mares.length === 0
      ? `<option value="">— Lägg till sto först —</option>`
      : mares.map(m => `<option value="${m.id}">${m.name} (${m.studbook})</option>`).join("");
  }
}

function setAuthUI(isLoggedIn) {
  // desktop
  if (loginBtn) loginBtn.classList.toggle("hidden", isLoggedIn);
  if (userMenu) userMenu.classList.toggle("hidden", !isLoggedIn);

  // mobile
  if (loginBtnMobile) loginBtnMobile.classList.toggle("hidden", isLoggedIn);
  if (userMenuMobile) userMenuMobile.classList.toggle("hidden", !isLoggedIn);

  // dashboard visibility
  if (dashboardSection) dashboardSection.classList.toggle("hidden", !isLoggedIn);

  const user = getUser();
  const name = user?.name ? user.name : "Inloggad";
  if (userPill) userPill.textContent = name;
  if (userPillMobile) userPillMobile.textContent = name;
}

function gotoDashboard() {
  document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------- Auth flow ----------
function handleLogin() {
  const name = norm(loginName?.value) ? loginName.value.trim() : "Inloggad";
  const email = norm(loginEmail?.value) ? loginEmail.value.trim() : "demo@equimatch.local";
  setUser({ name, email, createdAt: new Date().toISOString() });

  // If no mares, seed 1 demo mare (nice UX)
  const mares = getMares();
  if (mares.length === 0) {
    setMares([{
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name: "Demo-sto",
      studbook: "SWB",
      discipline: "Jumping",
      height: "165-170",
      color: "Brun",
      notes: "Vill ha mer galopp"
    }]);
  }

  closeModal();
  setAuthUI(true);
  renderMares();
  renderResults(stallions);
  gotoDashboard();
}

function handleLogout() {
  clearUser();
  // (Mares sparas kvar - mer realistiskt. Vill du rensa även mares? Säg till.)
  setAuthUI(false);
}

// ---------- Events ----------
function attachLoginTriggers() {
  [ctaStart, ctaLoginBottom, ctaFree, ctaBreeder, ctaPro, loginBtn, loginBtnMobile].forEach(el => {
    if (!el) return;
    el.addEventListener("click", () => {
      const user = getUser();
      if (user) {
        gotoDashboard();
      } else {
        openModal();
      }
    });
  });

  if (toDashboardBtn) {
    toDashboardBtn.addEventListener("click", (e) => {
      e.preventDefault();
      gotoDashboard();
    });
  }

  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  if (loginModal) {
    loginModal.addEventListener("click", (e) => {
      if (e.target === loginModal) closeModal();
    });
  }

  if (loginSubmitBtn) loginSubmitBtn.addEventListener("click", handleLogin);

  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
  if (logoutBtnMobile) logoutBtnMobile.addEventListener("click", handleLogout);

  // Enter-to-submit in modal
  [loginName, loginEmail].forEach(inp => {
    if (!inp) return;
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleLogin();
      if (e.key === "Escape") closeModal();
    });
  });
}

if (mareForm) {
  mareForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const user = getUser();
    if (!user) { openModal(); return; }

    const form = new FormData(mareForm);
    const mares = getMares();

    const mare = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name: (form.get("mareName") || "").toString().trim(),
      studbook: (form.get("mareStudbook") || "SWB").toString(),
      discipline: (form.get("mareDiscipline") || "Jumping").toString(),
      height: (form.get("mareHeight") || "165-170").toString(),
      color: (form.get("mareColor") || "").toString().trim(),
      notes: (form.get("mareNotes") || "").toString().trim(),
    };

    if (!mare.name) return;

    mares.unshift(mare);
    setMares(mares);
    mareForm.reset();

    renderMares();
  });
}

if (maresList) {
  maresList.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const id = btn.getAttribute("data-id");
    const mares = getMares();

    if (action === "delete") {
      const next = mares.filter(m => m.id !== id);
      setMares(next);
      renderMares();
      return;
    }

    if (action === "select") {
      if (mareSelect) mareSelect.value = id;
      document.getElementById("matchForm")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
  });
}

if (matchForm) {
  matchForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const user = getUser();
    if (!user) { openModal(); return; }

    const mares = getMares();
    if (mares.length === 0) return;

    const data = new FormData(matchForm);
    const mareId = (data.get("mareSelect") || "").toString();
    const semen = (data.get("semen") || "").toString();
    const region = (data.get("region") || "").toString();
    const colorPref = norm((data.get("colorPref") || "").toString());

    const mare = mares.find(m => m.id === mareId) || mares[0];

    // Simple demo filtering that *feels* logical:
    let filtered = stallions.filter(s =>
      s.semen === semen &&
      s.region === region
    );

    // Add: prefer same discipline/height (soft)
    filtered.sort((a, b) => {
      const score = (s) => {
        let sc = 0;
        if (s.discipline === mare.discipline) sc += 2;
        if (s.height === mare.height) sc += 1;
        if (mare.studbook && s.studbook === mare.studbook) sc += 1;
        if (colorPref && norm(s.color).includes(colorPref)) sc += 1;
        return sc;
      };
      return score(b) - score(a);
    });

    if (colorPref) {
      const byColor = filtered.filter(s => norm(s.color).includes(colorPref));
      if (byColor.length > 0) filtered = byColor;
    }

    if (filtered.length === 0) filtered = stallions;

    renderResults(filtered);
  });
}

if (clearMatchBtn) {
  clearMatchBtn.addEventListener("click", () => {
    matchForm?.reset();
    renderResults(stallions);
  });
}

if (resetDemoBtn) {
  resetDemoBtn.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_MARES);
    renderMares();
    renderResults(stallions);
  });
}

// ---------- Init ----------
renderPublicStallions();
renderResults(stallions);

attachLoginTriggers();

const initialUser = getUser();
setAuthUI(!!initialUser);
if (initialUser) {
  renderMares();
}
