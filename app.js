/**
 * MVP – Katalog + Match + Fake Login (localStorage)
 * - Catalog: browse + filter stallions
 * - Match: kräver inlogg som "Stoägare" + val av sto
 * - Hingstägare: profil/CTA + “Billing/Plan” look
 *
 * NYTT:
 * - Inga resultat vid load. Visas först efter att användaren klickat "Uppdatera resultat".
 * - Därefter kan vi auto-uppdatera vid filterändring (men bara om user redan kört en sökning).
 */

const STORAGE_KEY_USER  = "equimatch_user_v1";
const STORAGE_KEY_MARES = "equimatch_mares_v1";

let mode = "catalog";            // "catalog" | "match"
let hasSearched = false;         // styr om vi får rendera resultat automatiskt

// -------------------------
// Demo hingstar (20 st)
// -------------------------
const stallions = [
  { id:"s1",  name:"Nordic Donner",            breed:"SWB",  discipline:"dressage", heightCm:170, age:9,  colorBase:"black",    grey:false, breedingIndex:142, threeYearTest:true,  availableThisSeason:true,  region:"SE",  semen:"both",  pedigree:"Donnerhall – Rubinstein", performance:{ proven:true,  level:"MSV A" } },
  { id:"s2",  name:"Cornet Skyline",           breed:"HOLST",discipline:"jumping",  heightCm:168, age:11, colorBase:"bay",      grey:false, breedingIndex:136, threeYearTest:true,  availableThisSeason:false, region:"EU",  semen:"frozen",pedigree:"Cornet Obolensky – Caretino", performance:{ proven:true,  level:"1.50m" } },
  { id:"s3",  name:"Velvet Chestnut",          breed:"KWPN", discipline:"allround", heightCm:166, age:7,  colorBase:"chestnut", grey:false, breedingIndex:125, threeYearTest:false, availableThisSeason:true,  region:"EU",  semen:"fresh", pedigree:"Jazz – Flemmingh", performance:{ proven:false, level:"Unproven" } },
  { id:"s4",  name:"Speedy Gonzalez DEMO",     breed:"SWB",  discipline:"jumping",  heightCm:168, age:9,  colorBase:"black",    grey:false, breedingIndex:122, threeYearTest:true,  availableThisSeason:true,  region:"EU",  semen:"fresh", pedigree:"Blackie – Skuttiskutt", performance:{ proven:false, level:"Unproven" } },
  { id:"s5",  name:"Silver Bay Prince DEMO",   breed:"SWB",  discipline:"jumping",  heightCm:172, age:10, colorBase:"bay",      grey:true,  breedingIndex:145, threeYearTest:true,  availableThisSeason:true,  region:"INT", semen:"both",  pedigree:"Cardento – Irco Marco", performance:{ proven:true,  level:"1.45m" } },
  { id:"s6",  name:"Silver Grey Dancing Star", breed:"SWB",  discipline:"dressage", heightCm:173, age:14, colorBase:"grey",     grey:true,  breedingIndex:142, threeYearTest:true,  availableThisSeason:true,  region:"INT", semen:"both",  pedigree:"Cardento – Irco Marco", performance:{ proven:true,  level:"MSV A" } },
  { id:"s7",  name:"Cool Blue Sky DEMO",       breed:"KWPN", discipline:"eventing", heightCm:169, age:16, colorBase:"bay",      grey:false, breedingIndex:130, threeYearTest:false, availableThisSeason:false, region:"SE",  semen:"fresh", pedigree:"Tango – Over The Sea", performance:{ proven:false, level:"Unproven" } },
  { id:"s8",  name:"Mello Yello DEMO",         breed:"KWPN", discipline:"jumping",  heightCm:164, age:11, colorBase:"isabell",  grey:false, breedingIndex:130, threeYearTest:false, availableThisSeason:true,  region:"EU",  semen:"frozen",pedigree:"Yellow Fellow – Over The Sea", performance:{ proven:true,  level:"1.60m" } },
  { id:"s9",  name:"Lord of Flies DEMO",       breed:"HANN", discipline:"dressage", heightCm:168, age:9,  colorBase:"chestnut", grey:false, breedingIndex:117, threeYearTest:true,  availableThisSeason:true,  region:"SE",  semen:"frozen",pedigree:"Hashbrown – Jovial", performance:{ proven:true,  level:"SV A" } },
  { id:"s10", name:"Jumpvalleys Tikotok DEMO", breed:"SWB",  discipline:"jumping",  heightCm:175, age:13, colorBase:"isabell",  grey:false, breedingIndex:142, threeYearTest:true,  availableThisSeason:false, region:"INT", semen:"frozen",pedigree:"Hedge – To the Moon", performance:{ proven:true,  level:"1.55m" } },
  { id:"s11", name:"Velvet Tights DEMO",       breed:"HANN", discipline:"dressage", heightCm:176, age:10, colorBase:"black",    grey:false, breedingIndex:146, threeYearTest:false, availableThisSeason:true,  region:"EU",  semen:"fresh", pedigree:"Jazz Pantzz – Flamenco Hero", performance:{ proven:false, level:"Unproven" } },
  { id:"s12", name:"Dancing Stud DEMO",        breed:"HOLST",discipline:"dressage", heightCm:179, age:7,  colorBase:"isabell",  grey:false, breedingIndex:125, threeYearTest:true,  availableThisSeason:false, region:"SE",  semen:"both",  pedigree:"Charaktervoll – Flamenco Hero", performance:{ proven:false, level:"Unproven" } },
  { id:"s13", name:"Stenmark DEMO",            breed:"KWPN", discipline:"dressage", heightCm:175, age:15, colorBase:"bay",      grey:false, breedingIndex:129, threeYearTest:true,  availableThisSeason:true,  region:"SE",  semen:"both",  pedigree:"Glamourdale – Flamenco Hero", performance:{ proven:false, level:"Unproven" } },
  { id:"s14", name:"Emerald River",            breed:"SWB",  discipline:"eventing", heightCm:170, age:9,  colorBase:"black",    grey:false, breedingIndex:131, threeYearTest:true,  availableThisSeason:true,  region:"SE",  semen:"fresh", pedigree:"Contendro – Master", performance:{ proven:true,  level:"CCI2*" } },
  { id:"s15", name:"Black Granite",            breed:"HOLST",discipline:"jumping",  heightCm:173, age:12, colorBase:"black",    grey:false, breedingIndex:140, threeYearTest:true,  availableThisSeason:true,  region:"INT", semen:"frozen",pedigree:"Cornet – Diamant", performance:{ proven:true,  level:"1.50m" } },
  { id:"s16", name:"Bay Monarch",              breed:"HANN", discipline:"jumping",  heightCm:169, age:10, colorBase:"bay",      grey:false, breedingIndex:128, threeYearTest:true,  availableThisSeason:true,  region:"EU",  semen:"fresh", pedigree:"Baloubet – Stakkato", performance:{ proven:true,  level:"1.40m" } },
  { id:"s17", name:"Nordic Legend",            breed:"SWB",  discipline:"jumping",  heightCm:170, age:9,  colorBase:"bay",      grey:false, breedingIndex:147, threeYearTest:true,  availableThisSeason:true,  region:"SE",  semen:"both",  pedigree:"Cardento – For Pleasure", performance:{ proven:true,  level:"1.55m" } },
  { id:"s18", name:"Quiet Rebel",              breed:"KWPN", discipline:"dressage", heightCm:172, age:9,  colorBase:"chestnut", grey:false, breedingIndex:134, threeYearTest:true,  availableThisSeason:true,  region:"INT", semen:"frozen",pedigree:"Ampere – Gribaldi", performance:{ proven:true,  level:"MSV A" } },
  { id:"s19", name:"Golden Compass",           breed:"OTHER",discipline:"allround", heightCm:167, age:7,  colorBase:"chestnut", grey:false, breedingIndex:124, threeYearTest:false, availableThisSeason:true,  region:"EU",  semen:"fresh", pedigree:"Unknown – Unknown", performance:{ proven:false, level:"Unproven" } },
  { id:"s20", name:"Silver Echo",              breed:"SWB",  discipline:"dressage", heightCm:171, age:8,  colorBase:"black",    grey:true,  breedingIndex:138, threeYearTest:true,  availableThisSeason:false, region:"EU",  semen:"both",  pedigree:"Donnerhall – Jazz", performance:{ proven:true,  level:"MSV B" } },
];

// -------------------------
// Helpers
// -------------------------
const $ = (id) => document.getElementById(id);

function normalize(str) {
  return (str ?? "").toString().toLowerCase().trim();
}
function containsAny(haystack, needles) {
  const h = normalize(haystack);
  return needles.some(n => h.includes(normalize(n)));
}
function escapeHtml(str) {
  return (str ?? "").toString()
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
function disciplineLabel(d) {
  return d === "dressage" ? "Dressyr" :
         d === "jumping" ? "Hopp" :
         d === "eventing" ? "Fälttävlan" : "Allround";
}
function baseColorLabel(c) {
  if (c === "chestnut") return "Fux";
  if (c === "bay") return "Brun";
  if (c === "black") return "Svart";
  if (c === "grey") return "Skimmel";
  if (c === "isabell") return "Isabell";
  if (c === "paint") return "Skäck";
  return c || "—";
}
function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("sv-SE", { year:"numeric", month:"short", day:"numeric" });
  } catch { return ""; }
}

// -------------------------
// Storage: User
// -------------------------
function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveUser(user) {
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
}
function clearUser() {
  localStorage.removeItem(STORAGE_KEY_USER);
}
function roleLabel(role) {
  if (role === "mare_owner") return "Stoägare";
  if (role === "stallion_owner") return "Hingstägare";
  return "Gäst";
}

// -------------------------
// Storage: Mares
// -------------------------
function loadMares() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MARES);
    const mares = raw ? JSON.parse(raw) : [];
    return Array.isArray(mares) ? mares : [];
  } catch {
    return [];
  }
}
function saveMares(mares) {
  localStorage.setItem(STORAGE_KEY_MARES, JSON.stringify(mares));
}
function ensureSeedMare() {
  const mares = loadMares();
  if (mares.length) return;
  mares.push({
    id: "m1",
    name: "Demo Sto (Magnolia)",
    breed: "SWB",
    discipline: "jumping",
    heightCm: 166,
    age: 9,
    baseColor: "bay",
    grey: null,
    breedingIndex: 128,
    threeYearTest: "passed",
    mareScores: { legs: 7, headNeck: 7, type: 7, walk: 6, trot: 7, canter: 7, overall: 7 }
  });
  saveMares(mares);
}

// -------------------------
// UI: top auth mini
// -------------------------
function renderAuthMini() {
  const u = loadUser();
  const wrap = $("authMini");

  if (!u) {
    wrap.innerHTML = `
      <span class="email">Inte inloggad</span>
      <button id="btnShowLogin" class="secondary" type="button">Logga in</button>
    `;
    $("btnShowLogin").addEventListener("click", () => {
      document.getElementById("leftCard").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return;
  }

  wrap.innerHTML = `
    <span class="email">${escapeHtml(u.email)}</span>
    <span class="role">${escapeHtml(roleLabel(u.role))}</span>
    <button id="btnLogout" class="secondary" type="button">Logga ut</button>
  `;
  $("btnLogout").addEventListener("click", () => {
    clearUser();
    renderLeftCard();
    renderAuthMini();
    enforceModeConstraints();
    renderInitialEmptyState(); // inga resultat
  });
}

// -------------------------
// UI: left card (login/profile + mares)
// -------------------------
function renderLeftCard() {
  const u = loadUser();
  const left = $("leftCard");

  if (!u) {
    left.innerHTML = `
      <div class="card-head">
        <h2>Konto</h2>
        <span class="pill">Gäst</span>
      </div>

      <p class="muted small">
        Detta är “fake login” för prototypen. Vi sparar bara i localStorage.
      </p>

      <div class="form-grid" style="margin-top:10px">
        <label class="wide">
          Email
          <input id="loginEmail" type="email" placeholder="alex@example.com" />
        </label>

        <label>
          Lösenord (valfritt)
          <input id="loginPassword" type="password" placeholder="••••••••" />
        </label>

        <label>
          Roll
          <select id="loginRole">
            <option value="mare_owner">Stoägare (gratis)</option>
            <option value="stallion_owner">Hingstägare (framtida betalt)</option>
          </select>
        </label>
      </div>

      <div class="actions">
        <button id="btnLogin" type="button">Logga in / Skapa konto</button>
        <button id="btnDemoMareOwner" class="secondary" type="button">Demo: Stoägare</button>
        <button id="btnDemoStallionOwner" class="secondary" type="button">Demo: Hingstägare</button>
      </div>

      <div class="note">
        <b>Tips:</b> Katalog-läget funkar utan konto. Match-läget kräver stoägare.
      </div>
    `;

    $("btnLogin").addEventListener("click", () => {
      const email = $("loginEmail").value.trim();
      const role = $("loginRole").value;
      if (!email) return alert("Skriv en email för att logga in (fake).");

      saveUser({
        email,
        role,
        plan: "Free",
        memberSince: new Date().toISOString(),
        billing: { status: "Not set", nextInvoice: null }
      });

      renderLeftCard();
      renderAuthMini();
      enforceModeConstraints();
      renderInitialEmptyState();
    });

    $("btnDemoMareOwner").addEventListener("click", () => {
      saveUser({
        email: "mare.owner@demo.com",
        role: "mare_owner",
        plan: "Free",
        memberSince: new Date().toISOString(),
        billing: { status: "Not set", nextInvoice: null }
      });
      renderLeftCard();
      renderAuthMini();
      enforceModeConstraints();
      renderInitialEmptyState();
    });

    $("btnDemoStallionOwner").addEventListener("click", () => {
      saveUser({
        email: "stallion.owner@demo.com",
        role: "stallion_owner",
        plan: "Starter",
        memberSince: new Date().toISOString(),
        billing: { status: "Trial", nextInvoice: new Date(Date.now() + 1000*60*60*24*14).toISOString() }
      });
      renderLeftCard();
      renderAuthMini();
      enforceModeConstraints();
      renderInitialEmptyState();
    });

    return;
  }

  const isMareOwner = u.role === "mare_owner";
  const isStallionOwner = u.role === "stallion_owner";

  left.innerHTML = `
    <div class="card-head">
      <h2>Account</h2>
      <span class="pill">${escapeHtml(roleLabel(u.role))}</span>
    </div>

    ${renderAccountSettingsHtml(u)}

    ${isStallionOwner ? renderStallionOwnerPanelHtml(u) : renderMareOwnerInfoHtml()}

    ${isMareOwner ? renderMaresPanelHtml() : `
      <div class="note">
        <b>Match-läge kräver Stoägare.</b><br/>
        Byt roll genom att logga ut och logga in igen som stoägare.
      </div>
    `}
  `;

  wireAccountSettingsEvents();

  if (isStallionOwner) wireStallionOwnerEvents();
  if (isMareOwner) wireMaresPanelEvents();
}

function renderAccountSettingsHtml(u) {
  const initials = (u.email || "?").slice(0,1).toUpperCase();
  return `
    <div class="note" style="border-color: rgba(63,131,100,0.28); background: rgba(63,131,100,0.10)">
      <div style="display:flex; gap:12px; align-items:center;">
        <div style="
          width:44px; height:44px; border-radius:14px;
          display:grid; place-items:center;
          border:1px solid rgba(255,255,255,0.14);
          background: rgba(0,0,0,0.22);
          font-weight:900;">
          ${escapeHtml(initials)}
        </div>

        <div style="flex:1;">
          <div style="font-weight:900;">${escapeHtml(u.email)}</div>
          <div class="muted small">Member since: ${escapeHtml(fmtDate(u.memberSince))}</div>
        </div>

        <div>
          <span class="pill">Plan: ${escapeHtml(u.plan || "Free")}</span>
        </div>
      </div>

      <div style="margin-top:12px" class="form-grid">
        <label class="wide">
          Display name
          <input id="acctDisplayName" type="text" placeholder="ex. Alexandra" value="${escapeHtml(u.displayName || "")}" />
        </label>

        <label>
          Country
          <select id="acctCountry">
            <option value="">Select</option>
            <option value="SE" ${u.country==="SE" ? "selected":""}>Sweden</option>
            <option value="NO" ${u.country==="NO" ? "selected":""}>Norway</option>
            <option value="DK" ${u.country==="DK" ? "selected":""}>Denmark</option>
            <option value="FI" ${u.country==="FI" ? "selected":""}>Finland</option>
            <option value="OTHER" ${u.country==="OTHER" ? "selected":""}>Other</option>
          </select>
        </label>

        <label>
          Notifications
          <select id="acctNotif">
            <option value="on" ${u.notifications!=="off" ? "selected":""}>On</option>
            <option value="off" ${u.notifications==="off" ? "selected":""}>Off</option>
          </select>
        </label>
      </div>

      <div class="actions" style="margin-top:12px">
        <button id="btnSaveAccount" type="button">Save settings</button>
        <button id="btnBilling" class="secondary" type="button">Billing (coming soon)</button>
      </div>

      <div class="muted small" style="margin-top:8px">
        Billing status: <b>${escapeHtml(u.billing?.status || "Not set")}</b>
        ${u.billing?.nextInvoice ? ` · Next invoice: <b>${escapeHtml(fmtDate(u.billing.nextInvoice))}</b>` : ""}
      </div>
    </div>
  `;
}

function wireAccountSettingsEvents() {
  const btn = document.getElementById("btnSaveAccount");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const u = loadUser();
    if (!u) return;

    u.displayName = $("acctDisplayName").value.trim();
    u.country = $("acctCountry").value || "";
    u.notifications = $("acctNotif").value || "on";

    saveUser(u);
    renderAuthMini();
    renderLeftCard();
    alert("Saved (demo).");
  });

  const bill = document.getElementById("btnBilling");
  if (bill) bill.addEventListener("click", () => alert("Billing is coming soon (demo)."));
}

function renderStallionOwnerPanelHtml(u) {
  return `
    <div class="note">
      <b>Hingstägare:</b> i nästa steg kan du betala för att synas i katalog/match + få leads.
      <div class="actions" style="margin-top:10px">
        <button id="btnJoinWaitlist" type="button">Join waitlist</button>
        <button id="btnUpgrade" class="secondary" type="button">Upgrade plan</button>
      </div>
      <div class="muted small" style="margin-top:8px">
        (I prototypen gör knapparna inget — men ger “startup-känsla”.)
      </div>
    </div>
  `;
}

function wireStallionOwnerEvents() {
  const a = document.getElementById("btnJoinWaitlist");
  const b = document.getElementById("btnUpgrade");
  if (a) a.addEventListener("click", () => alert("Waitlist (demo)."));
  if (b) b.addEventListener("click", () => {
    const u = loadUser();
    if (!u) return;
    u.plan = u.plan === "Starter" ? "Pro" : "Starter";
    saveUser(u);
    renderLeftCard();
    renderAuthMini();
    alert(`Plan updated to ${u.plan} (demo).`);
  });
}

function renderMareOwnerInfoHtml() {
  return `
    <div class="note">
      <b>Stoägare:</b> Lägg in dina ston gratis och skapa en shortlist i Match-läget.
      <div class="muted small" style="margin-top:6px">
        (Sto-delpoäng kan sparas i profilen men används inte i filtren än.)
      </div>
    </div>
  `;
}

function renderMaresPanelHtml() {
  return `
    <div class="card-head" style="margin-top:14px">
      <h2>Mina ston</h2>
      <span class="pill" id="modePill">${mode === "match" ? "Match-läge" : "Katalog-läge"}</span>
    </div>

    <p class="muted small">
      Skapa flera ston gratis. I Match-läge väljer du ett sto och filtrerar fram en shortlist.
    </p>

    <div class="form-grid">
      <label class="wide">
        Välj sto (Match-läge)
        <select id="mareSelect">
          <option value="">— Välj sto —</option>
        </select>
      </label>
    </div>

    <details class="details" open>
      <summary>+ Lägg till nytt sto</summary>

      <div class="form-grid" style="margin-top:12px">
        <label> Namn
          <input id="mareName" type="text" placeholder="ex. Magnolia" />
        </label>

        <label> Ras
          <select id="mareBreed">
            <option value="">Välj</option>
            <option value="SWB">SWB</option>
            <option value="KWPN">KWPN</option>
            <option value="HOLST">Holsteiner</option>
            <option value="HANN">Hannoveraner</option>
            <option value="OTHER">Övrigt</option>
          </select>
        </label>

        <label> Disciplin
          <select id="mareDiscipline">
            <option value="">Välj</option>
            <option value="dressage">Dressyr</option>
            <option value="jumping">Hoppning</option>
            <option value="eventing">Fälttävlan</option>
            <option value="allround">Allround</option>
          </select>
        </label>

        <label> Mankhöjd (cm)
          <input id="mareHeight" type="number" min="140" max="190" placeholder="ex 165" />
        </label>

        <label> Ålder
          <input id="mareAge" type="number" min="2" max="30" placeholder="ex 9" />
        </label>

        <label> Färg (grund)
          <select id="mareBaseColor">
            <option value="">Välj</option>
            <option value="chestnut">Fux</option>
            <option value="bay">Brun</option>
            <option value="grey">Skimmel</option>
            <option value="isabell">Isabell</option>
            <option value="black">Svart</option>
            <option value="paint">Skäck</option>
          </select>
        </label>

        <label> Grey (skimmel-gen)
          <select id="mareGrey">
            <option value="">Okänt</option>
            <option value="no">Nej</option>
            <option value="yes">Ja</option>
          </select>
        </label>

        <label> Avelsindex
          <input id="mareBreedingIndex" type="number" min="50" max="200" placeholder="ex 132" />
        </label>

        <label> 3-årstest/bedömning
          <select id="mare3yr">
            <option value="">Okänt</option>
            <option value="passed">Genomfört</option>
            <option value="not">Ej</option>
          </select>
        </label>
      </div>

      <details class="details" style="margin-top:10px">
        <summary>Valfritt: Sto – delpoäng (sparas, används ej ännu)</summary>
        <div class="form-grid" style="margin-top:12px">
          <label>Extremiteter (1–10)
            <input id="mareScoreLegs" type="number" min="1" max="10" placeholder="ex 7" />
          </label>
          <label>Hals/Huvud (1–10)
            <input id="mareScoreHeadNeck" type="number" min="1" max="10" placeholder="ex 8" />
          </label>
          <label>Typ (1–10)
            <input id="mareScoreType" type="number" min="1" max="10" placeholder="ex 7" />
          </label>
          <label>Skritt (1–10)
            <input id="mareScoreWalk" type="number" min="1" max="10" placeholder="ex 6" />
          </label>
          <label>Trav (1–10)
            <input id="mareScoreTrot" type="number" min="1" max="10" placeholder="ex 7" />
          </label>
          <label>Galopp (1–10)
            <input id="mareScoreCanter" type="number" min="1" max="10" placeholder="ex 7" />
          </label>
          <label>Helhet (1–10)
            <input id="mareScoreOverall" type="number" min="1" max="10" placeholder="ex 7" />
          </label>
        </div>
      </details>

      <div class="actions" style="margin-top:12px">
        <button id="btnAddMare" type="button">Spara sto</button>
        <button id="btnClearMareForm" class="secondary" type="button">Rensa formulär</button>
      </div>
    </details>

    <div class="actions">
      <button id="btnDeleteSelectedMare" class="danger secondary" type="button">Ta bort valt sto</button>
    </div>
  `;
}

function wireMaresPanelEvents() {
  ensureSeedMare();
  refreshMareSelect();

  $("mareSelect").addEventListener("change", () => {
    // Vi renderar inte automatiskt resultat om man inte sökt ännu
    if (hasSearched) run(true);
    enforceModeConstraints();
  });

  $("btnAddMare").addEventListener("click", () => {
    const data = getMareFormInput();
    if (!data.name) return alert("Ange ett namn på stoet (för att spara).");

    const mares = loadMares();
    const id = `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;
    mares.push({ id, ...data });
    saveMares(mares);

    clearMareForm();
    refreshMareSelect();

    // sökresultat visas bara om user redan gjort en sökning
    if (hasSearched) run(true);
  });

  $("btnClearMareForm").addEventListener("click", clearMareForm);

  $("btnDeleteSelectedMare").addEventListener("click", () => {
    const selId = $("mareSelect").value;
    if (!selId) return alert("Välj ett sto att ta bort.");

    const mares = loadMares().filter(m => m.id !== selId);
    saveMares(mares);
    refreshMareSelect();

    if (hasSearched) run(true);
  });
}

function getMareFormInput() {
  const greyVal = $("mareGrey").value;
  const grey = greyVal === "yes" ? true : greyVal === "no" ? false : null;

  const mareScores = {
    legs: parseInt($("mareScoreLegs").value || "", 10) || null,
    headNeck: parseInt($("mareScoreHeadNeck").value || "", 10) || null,
    type: parseInt($("mareScoreType").value || "", 10) || null,
    walk: parseInt($("mareScoreWalk").value || "", 10) || null,
    trot: parseInt($("mareScoreTrot").value || "", 10) || null,
    canter: parseInt($("mareScoreCanter").value || "", 10) || null,
    overall: parseInt($("mareScoreOverall").value || "", 10) || null,
  };

  return {
    name: $("mareName").value?.trim() || "",
    breed: $("mareBreed").value || "",
    discipline: $("mareDiscipline").value || "",
    heightCm: parseInt($("mareHeight").value || "", 10) || null,
    age: parseInt($("mareAge").value || "", 10) || null,
    baseColor: $("mareBaseColor").value || "",
    grey,
    breedingIndex: parseInt($("mareBreedingIndex").value || "", 10) || null,
    threeYearTest: $("mare3yr").value || "",
    mareScores
  };
}

function clearMareForm() {
  [
    "mareName","mareBreed","mareDiscipline","mareHeight","mareAge","mareBaseColor","mareGrey",
    "mareBreedingIndex","mare3yr",
    "mareScoreLegs","mareScoreHeadNeck","mareScoreType","mareScoreWalk","mareScoreTrot","mareScoreCanter","mareScoreOverall"
  ].forEach(id => {
    const el = $(id);
    if (!el) return;
    if (el.tagName === "SELECT") el.value = "";
    else el.value = "";
  });
}

function refreshMareSelect() {
  const mares = loadMares();
  const sel = $("mareSelect");
  if (!sel) return;

  const current = sel.value;
  sel.innerHTML = `<option value="">— Välj sto —</option>`;

  for (const m of mares) {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = `${m.name || "Namnlöst sto"} (${m.breed || "?"}, ${m.discipline || "?"})`;
    sel.appendChild(opt);
  }

  if (mares.some(m => m.id === current)) sel.value = current;
  else if (mode === "match" && mares.length) sel.value = mares[0].id;
}

// -------------------------
// Mode switch + constraints
// -------------------------
function setMode(nextMode) {
  mode = nextMode;

  $("tabCatalog").classList.toggle("active", mode === "catalog");
  $("tabMatch").classList.toggle("active", mode === "match");

  $("resultsTitle").textContent = mode === "catalog" ? "Katalog" : "Match";
  const pill = document.getElementById("modePill");
  if (pill) pill.textContent = mode === "match" ? "Match-läge" : "Katalog-läge";

  enforceModeConstraints();

  // Byter läge ska inte plötsligt visa hingstar om user inte sökt
  if (hasSearched) run(true);
  else renderInitialEmptyState();
}

function enforceModeConstraints() {
  const u = loadUser();
  const hint = $("matchHint");

  if (mode !== "match") {
    hint.classList.add("hidden");
    hint.innerHTML = "";
    return;
  }

  // Match-läge: kräver user + mare_owner
  if (!u) {
    hint.classList.remove("hidden");
    hint.innerHTML = `<b>Match-läge:</b> logga in som <b>Stoägare</b> för att skapa shortlist (vänster panel).`;
    return;
  }
  if (u.role !== "mare_owner") {
    hint.classList.remove("hidden");
    hint.innerHTML = `<b>Match-läge:</b> du är inloggad som <b>${escapeHtml(roleLabel(u.role))}</b>. Match kräver <b>Stoägare</b>.`;
    return;
  }

  const sel = document.getElementById("mareSelect");
  const selVal = sel ? sel.value : "";
  if (!selVal) {
    hint.classList.remove("hidden");
    hint.innerHTML = `<b>Match-läge:</b> välj ett sto i “Mina ston” för att göra en shortlist.`;
    return;
  }

  hint.classList.remove("hidden");
  hint.innerHTML = `<b>Match-läge:</b> använd filtren och klicka <b>Uppdatera resultat</b> för shortlist.`;
}

$("tabCatalog").addEventListener("click", () => setMode("catalog"));
$("tabMatch").addEventListener("click", () => setMode("match"));

// -------------------------
// Filters
// -------------------------
function getFilters() {
  return {
    breed: $("filterBreed").value || "",
    discipline: $("filterDiscipline").value || "",
    available: $("filterAvailable").value || "",
    region: $("filterRegion").value || "",
    semen: $("filterSemen").value || "",
    minIndex: parseInt($("filterMinIndex").value || "", 10) || null,
    minHeight: parseInt($("filterMinHeight").value || "", 10) || null,
    maxHeight: parseInt($("filterMaxHeight").value || "", 10) || null,
    performance: $("filterPerformance").value || "",
    threeYearTest: $("filter3yr").value || "",
    search: $("filterSearch").value || ""
  };
}

function filterStallions(filters) {
  const q = normalize(filters.search);

  return stallions.filter(s => {
    if (filters.breed && s.breed !== filters.breed) return false;
    if (filters.discipline && s.discipline !== filters.discipline) return false;

    if (filters.available !== "") {
      const want = filters.available === "true";
      if (s.availableThisSeason !== want) return false;
    }

    if (filters.threeYearTest !== "") {
      const want = filters.threeYearTest === "true";
      if (s.threeYearTest !== want) return false;
    }

    if (filters.region && s.region !== filters.region) return false;

    if (filters.semen) {
      if (filters.semen === "fresh" && !(s.semen === "fresh" || s.semen === "both")) return false;
      if (filters.semen === "frozen" && !(s.semen === "frozen" || s.semen === "both")) return false;
      if (filters.semen === "both" && s.semen !== "both") return false;
    }

    if (filters.minIndex !== null && s.breedingIndex < filters.minIndex) return false;
    if (filters.minHeight !== null && s.heightCm < filters.minHeight) return false;
    if (filters.maxHeight !== null && s.heightCm > filters.maxHeight) return false;

    if (filters.performance === "proven" && !s.performance?.proven) return false;

    if (q) {
      const ok = containsAny(`${s.name} ${s.pedigree}`, [q]);
      if (!ok) return false;
    }

    return true;
  });
}

// -------------------------
// Render results
// -------------------------
function tag(text, tone="") {
  const cls = tone ? `tag ${tone}` : "tag";
  return `<span class="${cls}">${escapeHtml(text)}</span>`;
}

function buildWhyList(mare, s, filters) {
  const why = [];

  if (mare?.discipline && mare.discipline === s.discipline) why.push("Matchar stoets disciplin.");
  if (s.availableThisSeason) why.push("Tillgänglig denna säsong.");
  if (s.performance?.proven) why.push(`Meriterad (${s.performance.level}).`);
  if (s.threeYearTest) why.push("Har 3-årstest/bedömning registrerat.");
  if (filters.minHeight !== null || filters.maxHeight !== null) why.push(`Mankhöjd ${s.heightCm} cm inom din intervall.`);

  return why.slice(0, 5);
}

function getSelectedMare() {
  const u = loadUser();
  if (!u || u.role !== "mare_owner") return null;
  const sel = document.getElementById("mareSelect");
  if (!sel || !sel.value) return null;
  const mares = loadMares();
  return mares.find(m => m.id === sel.value) || null;
}

function renderResults(list, filters) {
  const wrap = $("results");
  wrap.innerHTML = "";

  const selectedMare = getSelectedMare();

  if (mode === "catalog") {
    $("resultMeta").textContent = `${list.length} hingstar (filtrerade)`;
  } else {
    const label = selectedMare ? selectedMare.name : "—";
    $("resultMeta").textContent = `${list.length} hingstar i shortlist för: ${label}`;
  }

  if (!list.length) {
    wrap.innerHTML = `<div class="muted">Inga träffar. Prova att lätta på filter (region/semin/3-årstest/höjd).</div>`;
    return;
  }

  for (const s of list) {
    const tags = [];
    tags.push(tag(disciplineLabel(s.discipline)));
    tags.push(tag(s.availableThisSeason ? "Tillgänglig" : "Ej i säsong", s.availableThisSeason ? "good" : "bad"));
    tags.push(tag(s.semen === "both" ? "Färsk+Fryst" : s.semen === "fresh" ? "Färsk" : "Fryst"));
    tags.push(tag(s.region === "SE" ? "Sverige" : s.region === "EU" ? "EU" : "Internat."));
    tags.push(tag(`Index ${s.breedingIndex}`, s.breedingIndex >= 140 ? "good" : s.breedingIndex >= 125 ? "warn" : ""));
    tags.push(tag(`3-årstest: ${s.threeYearTest ? "Ja" : "Nej"}`));
    if (s.performance?.proven) tags.push(tag("Meriterad", "good"));

    const canShowWhy = mode === "match" && !!selectedMare;
    const why = canShowWhy ? buildWhyList(selectedMare, s, filters) : [];

    wrap.insertAdjacentHTML("beforeend", `
      <article class="stallion">
        <h3>${escapeHtml(s.name)}</h3>
        <div class="muted small">${escapeHtml(s.pedigree)}</div>
        <div class="tags">${tags.join("")}</div>

        <div class="kv">
          <div>Ras: <b>${escapeHtml(s.breed)}</b></div>
          <div>Mankhöjd: <b>${s.heightCm} cm</b></div>
          <div>Ålder: <b>${s.age}</b></div>
          <div>Färg: <b>${baseColorLabel(s.colorBase)}${s.grey ? " (Skimmel)" : ""}</b></div>
          <div>3-årstest: <b>${s.threeYearTest ? "Ja" : "Nej"}</b></div>
          <div>Tävlingsnivå: <b>${escapeHtml(s.performance?.level ?? "—")}</b></div>
        </div>

        ${canShowWhy ? `
          <div class="why">
            <b>Why this shortlist</b>
            <ul>${why.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
          </div>
        ` : ""}
      </article>
    `);
  }
}

// -------------------------
// Empty state (NEW)
// -------------------------
function renderInitialEmptyState() {
  $("resultMeta").textContent = "";
  $("results").innerHTML = `
    <div class="note">
      <b>Redo när du är det.</b><br/>
      Välj filter och klicka <b>Uppdatera resultat</b> för att visa hingstar.
      <div class="muted small" style="margin-top:8px">
        (Vi visar inte hela listan direkt — bättre UX och känns mer “premium”.)
      </div>
    </div>
  `;
}

// -------------------------
// Run / reset
// -------------------------
function run(forceRender = false) {
  // Om user inte har sökt än och vi inte tvingar → visa tomt läge
  if (!hasSearched && !forceRender) {
    renderInitialEmptyState();
    return;
  }

  const filters = getFilters();
  const list = filterStallions(filters);
  enforceModeConstraints();
  renderResults(list, filters);
}

function doSearch() {
  hasSearched = true;

  // i matchläge: om user inte är stoägare eller inget sto valt -> vi kör ändå render,
  // men constraints + hint visar varför match inte är “riktigt”.
  run(true);
}

function resetFilters() {
  const ids = [
    "filterBreed","filterDiscipline","filterAvailable","filterRegion","filterSemen",
    "filterMinIndex","filterMinHeight","filterMaxHeight","filterPerformance","filter3yr","filterSearch"
  ];
  ids.forEach(id => {
    const el = $(id);
    if (!el) return;
    if (el.tagName === "SELECT") el.value = "";
    else el.value = "";
  });

  // Efter reset: behåll hasSearched, men visa tomt tills man klickar igen? Du sa: visa först efter klick.
  // Så vi sätter hasSearched=false vid reset.
  hasSearched = false;
  renderInitialEmptyState();
}

$("btnRun").addEventListener("click", doSearch);
$("btnReset").addEventListener("click", resetFilters);

// Auto-run när filter ändras (skönare UX) – men först efter att user sökt minst en gång
[
  "filterBreed","filterDiscipline","filterAvailable","filterRegion","filterSemen",
  "filterMinIndex","filterMinHeight","filterMaxHeight","filterPerformance","filter3yr","filterSearch"
].forEach(id => $(id).addEventListener("input", () => {
  if (hasSearched) run(true);
}));

// -------------------------
// Init
// -------------------------
ensureSeedMare();
renderLeftCard();
renderAuthMini();
setMode("catalog");
renderInitialEmptyState();

// --- Landing CTAs: open app + scroll to account ---
function openAppAndScroll() {
  const el = document.getElementById("app");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function scrollToAccountPanel() {
  openAppAndScroll();
  setTimeout(() => {
    const left = document.getElementById("leftCard");
    if (left) left.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 250);
}

["ctaOpenAppTop","ctaOpenApp","ctaOpenApp2","ctaOpenApp3","ctaOpenAppCard"].forEach(id => {
  const btn = document.getElementById(id);
  if (btn) btn.addEventListener("click", openAppAndScroll);
});

["ctaCreateAccount","ctaCreateAccount2","ctaCreateAccount3"].forEach(id => {
  const btn = document.getElementById(id);
  if (btn) btn.addEventListener("click", scrollToAccountPanel);
});