/**
 * Audit responsive et règles de design, sur le serveur de développement.
 *
 * Pourquoi ce script existe : le navigateur intégré à l'atelier de Claude ne
 * descend pas sous 474 px de large, il renvoie 474 quelle que soit la valeur
 * demandée en dessous. Autrement dit, aucune vérification mobile faite là ne
 * prouve quoi que ce soit. Le 2026-09-09, le nom « Casaminga » est resté masqué
 * sous 1280 px pendant des semaines sans que rien ne le signale.
 *
 * Ce script ne juge pas le beau. Il vérifie des faits mesurables, et il échoue
 * bruyamment : c'est la seule façon qu'une règle survive à l'oubli.
 *
 *   node scripts/audit-responsive.mjs
 *   node scripts/audit-responsive.mjs --url http://localhost:4174
 *
 * Sortie : une ligne par manquement, code de sortie 1 s'il y en a.
 */
import { chromium } from "playwright";

const BASE = process.argv.includes("--url")
  ? process.argv[process.argv.indexOf("--url") + 1]
  : "http://localhost:5174";

/**
 * Largeurs testées. 320 est le pire cas encore répandu (iPhone SE de première
 * génération, et surtout le mode « police agrandie » qui réduit la surface
 * utile) ; 1280 est le palier où la navigation complète apparaît.
 */
const WIDTHS = [320, 375, 768, 1280];

/** Routes fixes. Les fiches d'événement sont découvertes à l'exécution. */
const ROUTES = [
  "/",
  "/association",
  "/nos-actions",
  "/agenda",
  "/lieux",
  "/contact",
  "/introuvable-volontairement",
];

/**
 * États obtenus par un clic, que le simple chargement d'une page ne montre
 * jamais. On les désigne par leur `aria-controls`, qui décrit une intention et
 * survit mieux qu'une classe de style à une refonte.
 *
 * Un déclencheur absent n'est pas une erreur : le script le signale comme non
 * testé. Un audit qui crie au loup finit ignoré.
 */
const OPENED = [
  { name: "menu déplié", trigger: '[aria-controls="menu-principal"]', maxWidth: 1279 },
  { name: "recherche ouverte", trigger: '[aria-controls="recherche-mobile"]', maxWidth: 639 },
];

/**
 * Taille de texte en deçà de laquelle la lecture est compromise.
 *
 * Ce design emploie délibérément du 10 px (pastilles de catégorie, mois d'une
 * date) et du 11 px (surtitres). Le seuil est donc placé sous ces valeurs :
 * l'audit signale un accident, pas un choix.
 */
const MIN_FONT_PX = 10;
/** Côté minimal d'une cible tactile, pour les commandes (pas les liens en prose). */
const MIN_TAP_PX = 40;

/**
 * Contrôles exécutés dans la page. Tout est mesuré sur le rendu réel : c'est le
 * seul endroit où un point d'arrêt mal choisi devient visible.
 */
function collect({ minFont, minTap }) {
  const problems = [];
  const add = (check, detail) => problems.push({ check, detail });

  const vw = document.documentElement.clientWidth;
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    const s = getComputedStyle(el);
    return s.visibility !== "hidden" && s.display !== "none" && s.opacity !== "0";
  };
  const name = (el) => {
    const id = el.id ? `#${el.id}` : "";
    const cls = typeof el.className === "string" && el.className
      ? "." + el.className.trim().split(/\s+/).slice(0, 3).join(".")
      : "";
    return `${el.tagName.toLowerCase()}${id}${cls}`.slice(0, 90);
  };

  // 1. Débordement horizontal : le symptôme qui attrape l'essentiel des casses.
  if (document.documentElement.scrollWidth > vw + 1) {
    add("debordement", `scrollWidth ${document.documentElement.scrollWidth} > ${vw}`);
  }

  const all = [...document.body.querySelectorAll("*")].filter(visible);

  /**
   * Un élément peut dépasser sa boîte sans dépasser la page, si un ancêtre le
   * rogne. C'est le cas normal d'une carte Leaflet, dont les tuiles débordent
   * volontairement d'un conteneur en `overflow: hidden`. Sans cette exception,
   * l'audit signale la carte à chaque passage et devient inutilisable.
   */
  const estRogne = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const o = getComputedStyle(p);
      if (o.overflowX !== "visible" || o.overflow !== "visible") return true;
    }
    return false;
  };

  /**
   * 2. Le coupable du débordement, autrement on cherche à l'aveugle.
   *
   * On retient celui qui déborde le plus, y compris s'il est lui-même plus
   * large que l'écran : c'est même le cas le plus fréquent, un `select` ou une
   * longue chaîne qui refuse de se réduire dans une boîte flexible, dont le
   * `min-width: auto` par défaut interdit la compression.
   */
  let pire = null;
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.right <= vw + 1 || estRogne(el)) continue;
    if (!pire || r.right > pire.r.right) pire = { el, r };
  }
  if (pire) {
    const parent = pire.el.parentElement;
    const dans = parent && parent !== document.body ? `, dans ${name(parent)}` : "";
    add(
      "element_hors_cadre",
      `${name(pire.el)} large de ${Math.round(pire.r.width)}px${dans}`
    );
  }

  // 3. Texte trop petit.
  for (const el of all) {
    if (!el.childNodes.length) continue;
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!own) continue;
    const size = parseFloat(getComputedStyle(el).fontSize);
    if (size < minFont) {
      add("texte_minuscule", `${name(el)} à ${size}px : « ${el.textContent.trim().slice(0, 40)} »`);
    }
  }

  /**
   * 4. Cibles tactiles, sur les commandes et les largeurs tactiles seulement.
   *
   * Un lien de pied de page mesure 22 px de haut, c'est la convention du web et
   * non un défaut : les inclure produisait 176 signalements sans un seul geste
   * à faire. On ne retient donc que ce qui se presse du doigt, boutons et
   * boutons-liens, là où le doigt est le moyen de pointage.
   */
  if (minTap > 0) {
    for (const el of document.querySelectorAll("button, a.btn")) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.height < minTap || r.width < minTap) {
        add("cible_tactile", `${name(el)} ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
    }
  }

  // 5. Règles de design de Léo, encodées plutôt que rappelées.
  const header = document.querySelector("header");
  if (header && !/Casaminga/i.test(header.innerText)) {
    add("marque_absente", "le nom Casaminga n'est pas écrit dans le header");
  }
  const texte = document.body.innerText;
  if (texte.includes("—")) {
    const i = texte.indexOf("—");
    add("tiret_cadratin", `« ${texte.slice(Math.max(0, i - 30), i + 30).replace(/\n/g, " ")} »`);
  }
  /**
   * Émoji. `\p{Extended_Pictographic}` attrape aussi ©, ® et ™, qui sont des
   * signes typographiques ordinaires et non des émoji : le © du pied de page
   * faisait échouer les onze routes. On ne retient donc que les caractères des
   * blocs proprement émoji, ou ceux forcés en présentation émoji par U+FE0F.
   */
  const emoji = texte.match(/\p{Extended_Pictographic}️|[\u{1F000}-\u{1FAFF}]/u);
  if (emoji) add("emoji", `caractère « ${emoji[0]} » dans le texte affiché`);

  // 6. Images sans alternative textuelle. `alt=""` est un choix légitime pour
  //    une image décorative ; c'est l'attribut absent qui est une faute.
  for (const img of document.querySelectorAll("img")) {
    if (!img.hasAttribute("alt")) add("image_sans_alt", img.getAttribute("src") ?? "?");
  }

  return problems;
}

async function auditPage(page, label, width) {
  // La cible tactile ne se juge qu'aux largeurs ou le doigt pointe.
  const minTap = width <= 768 ? MIN_TAP_PX : 0;
  const found = await page.evaluate(collect, { minFont: MIN_FONT_PX, minTap });
  return found.map((p) => ({ ...p, label, width }));
}

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

// Le serveur doit tourner : sans lui l'audit ne mesurerait que des pages d'erreur.
try {
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 8000 });
} catch {
  console.error(`Aucun serveur sur ${BASE}. Lancez « npm run dev », ou passez --url.`);
  await browser.close();
  process.exit(2);
}

/**
 * Fiches d'événement : découvertes depuis l'agenda plutôt qu'écrites en dur.
 * Des identifiants figés dans le script périment au premier réimport, et un
 * audit qui échoue pour une mauvaise raison finit désactivé.
 */
await page.goto(`${BASE}/agenda`, { waitUntil: "networkidle" });
const eventRoutes = (
  await page.$$eval('a[href^="/evenement/"]', (as) => as.map((a) => a.getAttribute("href")))
).filter((h, i, arr) => arr.indexOf(h) === i).slice(0, 3);

if (eventRoutes.length === 0) {
  console.warn("Aucune fiche d'événement trouvée sur /agenda : ces pages ne sont pas auditées.");
}

const problems = [];
const untested = [];

for (const width of WIDTHS) {
  await page.setViewportSize({ width, height: 900 });

  for (const route of [...ROUTES, ...eventRoutes]) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    problems.push(...(await auditPage(page, route, width)));

    // États cliqués, sur l'accueil seulement : le header est le même partout,
    // le tester sept fois n'apprendrait rien de plus.
    if (route !== "/") continue;
    for (const state of OPENED) {
      if (width > state.maxWidth) continue;
      const trigger = await page.$(state.trigger);
      if (!trigger) {
        untested.push(`${state.name} à ${width}px : déclencheur ${state.trigger} introuvable`);
        continue;
      }
      await trigger.click();
      await page.waitForTimeout(150);
      problems.push(...(await auditPage(page, `/ (${state.name})`, width)));
      await page.reload({ waitUntil: "networkidle" });
    }
  }
}

await browser.close();

// ── Rapport ───────────────────────────────────────────────────────────
const byCheck = new Map();
for (const p of problems) {
  if (!byCheck.has(p.check)) byCheck.set(p.check, []);
  byCheck.get(p.check).push(p);
}

console.log(`\nAudit de ${BASE} : ${ROUTES.length + eventRoutes.length} routes x ${WIDTHS.join(", ")} px\n`);

/**
 * On compte les manquements distincts, pas les occurrences : un même défaut vu
 * sur quatre largeurs reste un seul défaut à corriger, et un total gonflé
 * décourage de lire le rapport.
 */
let distincts = 0;
for (const [check, list] of [...byCheck].sort((a, b) => b[1].length - a[1].length)) {
  const seen = new Map();
  for (const p of list) {
    const key = `${p.label}|${p.detail}`;
    if (!seen.has(key)) seen.set(key, { ...p, widths: [] });
    seen.get(key).widths.push(p.width);
  }
  distincts += seen.size;
  console.log(`${check} (${seen.size})`);
  for (const p of seen.values()) {
    const w = [...new Set(p.widths)].join("/") + "px";
    console.log(`   ${w.padStart(16)}  ${p.label.padEnd(26).slice(0, 26)}  ${p.detail}`);
  }
  console.log("");
}

for (const u of untested) console.log(`non testé : ${u}`);

if (distincts === 0) {
  console.log("Aucun manquement.\n");
  process.exit(0);
}
console.log(`${distincts} manquements distincts.\n`);
process.exit(1);
