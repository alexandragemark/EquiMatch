// Equimatch – minimal JS (mobile nav + hero image fallback + mock results)

const navToggle = document.querySelector(".nav-toggle");
const navMobile = document.querySelector(".nav-mobile");

if (navToggle && navMobile) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    navMobile.hidden = expanded;
  });
}

// Hero image fallback: use hero-stallion if it exists, else fallback.
const hero = document.querySelector(".hero-media");
if (hero) {
  const primary = hero.getAttribute("data-hero-image");
  const fallback = hero.getAttribute("data-hero-fallback");

  const img = new Image();
  img.onload = () => { hero.style.backgroundImage = `url('${primary}')`; };
  img.onerror = () => { hero.style.backgroundImage = `url('${fallback}')`; };
  img.src = primary;
}

// Mock dataset
const stallions = [
  { name: "Aurelius", studbook: "KWPN", discipline: "Jumping", height: "165-170", semen: "Chilled", region: "EU", color: "Brun", index: 142, img: "images/stallion-1.jpg" },
  { name: "Valentino", studbook: "SWB", discipline: "Dressage", height: "170+", semen: "Frozen", region: "Sweden", color: "Fux", index: 138, img: "images/stallion-2.jpg" },
  { name: "Northwind", studbook: "Holsteiner", discipline: "Jumping", height: "165-170", semen: "Fresh", region: "International", color: "Mörkbrun", index: 145, img: "images/stallion-3.jpg" },
];

const matchForm = document.getElementById("matchForm");
const clearBtn = document.getElementById("clearBtn");
const resultsEl = document.getElementById("results");

function renderCards(items) {
  if (!resultsEl) return;
  resultsEl.innerHTML = items.map(s => `
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
        <a class="link" href="#">Visa profil →</a>
      </div>
    </article>
  `).join("");
}

function norm(str) {
  return (str || "").toLowerCase().trim();
}

if (matchForm) {
  matchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(matchForm);

    const studbook = data.get("studbook");
    const discipline = data.get("discipline");
    const height = data.get("height");
    const semen = data.get("semen");
    const region = data.get("region");
    const color = norm(data.get("color"));

    let filtered = stallions.filter(s =>
      s.studbook === studbook &&
      s.discipline === discipline &&
      s.height === height &&
      s.semen === semen &&
      s.region === region
    );

    if (color.length > 0) {
      filtered = filtered.filter(s => norm(s.color).includes(color));
    }

    if (filtered.length === 0) filtered = stallions; // demo fallback
    renderCards(filtered);

    document.getElementById("stallions")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (clearBtn && matchForm) {
  clearBtn.addEventListener("click", () => {
    matchForm.reset();
    renderCards(stallions);
  });
}

// Initial render
renderCards(stallions);