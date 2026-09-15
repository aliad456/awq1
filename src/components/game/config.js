/* ============================================================================
   config.js — כל המספרים והנתונים של המשחק.
   רוצה לשנות איזון? הכל כאן. אין מספרים קשיחים בשאר הקבצים.
   ========================================================================== */

const LOGO_FULL = "/images/logo.webp";
const LOGO_MARK = "/images/logo-mark.webp";
const BG_MAIN = "/images/bg-main.webp";

const STAT_MAX = 2500;
const OVR_MAX = 250;
const STATS = ["power", "agility", "life", "energy", "composure"];
const START_AGE = 18;
const RETIRE_AGE = 40;
const FIGHTS_PER_AGE = 3;

/* שערי רמה: אי אפשר לגשת ליריב חזק לפני שהרווחת את הזכות */
const TIER_GATE = [1, 10, 30];        // הרמה הנדרשת לכל שלב
const TIER_LEVELS = [3, 5, 10];       // כמה רמות מזכה ניצחון בכל שלב
const MAX_ATTEMPTS = 5;               // הפסדים מותרים בקריירה

/* קרדיטים */
const ULT_COST = 20;                  // מחיר מהלך אולטימטיבי
const HEAL_COST = 25;                 // מחיר החלמה מלאה
const ULT_FULL_BONUS = 10;            // +10% סיכוי כשהמד מלא
const CREDIT_PACKS = [
  { id: "p1", credits: 500,   usd: "5.00" },
  { id: "p2", credits: 1100,  usd: "10.00",  bonus: 10 },
  { id: "p3", credits: 1600,  usd: "12.99",  bonus: 23, best: true },
  { id: "p4", credits: 4200,  usd: "29.99",  bonus: 40 },
];
const NOADS_ILS = "10.99";

const CLASSES = [
  { id: "warrior", icon: "⚔️", img: "/images/warrior.webp", focus: ["power", "agility"],
    base: { power: 32, agility: 32, life: 26, energy: 22, composure: 20 } },
  { id: "mage", icon: "🪄", img: "/images/mage.webp", focus: ["composure", "energy"],
    base: { power: 20, agility: 22, life: 22, energy: 32, composure: 32 } },
  { id: "archer", icon: "🏹", img: "/images/archer.webp", focus: ["life", "agility"],
    base: { power: 24, agility: 32, life: 32, energy: 24, composure: 22 } },
];

const CITIES = [
  { id: "atlantis", art: "/images/city-atlantis.webp", icon: "🌊", diff: "easy", bias: 45, reward: 1.0, danger: 1.0,
    theme: { accent: "#1F6F8B", glow: "rgba(31,111,139,.30)" },
    strip: ["🌊", "🐚", "🔱", "🫧", "🐟", "⚓", "🪸", "🧜"],
    tiers: [{ icon: "🐙", id: "a1", weak: "safe" }, { icon: "🦈", id: "a2", weak: "aggr" },
            { icon: "🐉", id: "a3", weak: "safe" }],
    acts: [{ icon: "🌊", id: "surge" }, { icon: "🫧", id: "dive" }], ult: { icon: "🔱", id: "maelstrom" } },
  { id: "lemuria", art: "/images/city-lemuria.webp", icon: "🌿", diff: "medium", bias: 40, reward: 1.35, danger: 1.3,
    theme: { accent: "#4F7A34", glow: "rgba(79,122,52,.30)" },
    strip: ["🌿", "🍃", "🌳", "🪵", "🦌", "🕸️", "🍄", "🪶"],
    tiers: [{ icon: "🌱", id: "l1", weak: "aggr" }, { icon: "🌳", id: "l2", weak: "safe" },
            { icon: "🗿", id: "l3", weak: "aggr" }],
    acts: [{ icon: "🪓", id: "cleave" }, { icon: "🍃", id: "veil" }], ult: { icon: "🌪️", id: "wildgrowth" } },
  { id: "pompeii", art: "/images/city-pompeii.webp", icon: "🔥", diff: "hard", bias: 35, reward: 1.8, danger: 1.65,
    theme: { accent: "#A53A1E", glow: "rgba(165,58,30,.32)" },
    strip: ["🔥", "🌋", "🪨", "☄️", "🕯️", "⛏️", "💨", "🏺"],
    tiers: [{ icon: "🪨", id: "p1", weak: "safe" }, { icon: "🌋", id: "p2", weak: "aggr" },
            { icon: "☄️", id: "p3", weak: "safe" }],
    acts: [{ icon: "🔥", id: "blaze" }, { icon: "🛡️", id: "shelter" }], ult: { icon: "☄️", id: "eruption" } },
];
const cityById = (id) => CITIES.find((c) => c.id === id);

/* --------------------------------- ציוד ---------------------------------- */

const GEAR = {
  weapon: [{ id: "blade", icon: "🗡️", main: "power" }, { id: "gaxe", icon: "🪓", main: "power" },
           { id: "rod", icon: "🔮", main: "energy" }, { id: "gbow", icon: "🏹", main: "agility" }],
  armor:  [{ id: "mail", icon: "🛡️", main: "life" }, { id: "grobe", icon: "🧥", main: "composure" },
           { id: "hide", icon: "🥋", main: "agility" }],
  charm:  [{ id: "ring", icon: "💍", main: "composure" }, { id: "beads", icon: "📿", main: "energy" },
           { id: "urn", icon: "🏺", main: "life" }],
};
const GEAR_SLOTS = ["weapon", "armor", "charm"];

const RARITY = [
  { id: "plain", mult: 1.0, extra: 0, color: "#9B886F" },
  { id: "fine",  mult: 1.6, extra: 1, color: "#4F7A34" },
  { id: "great", mult: 2.4, extra: 2, color: "#2E6E92" },
  { id: "myth",  mult: 3.6, extra: 3, color: "#A97B2C" },
];
const rarOf = (id) => RARITY.find((r) => r.id === id);

/* ------------------------------- מפגשי דרך -------------------------------- */

const ENCOUNTERS = [
  { id: "merchant", icon: "🧙", a: "buy", b: "pass" },
  { id: "spring",   icon: "⛲", a: "drink", b: "rest" },
  { id: "wreck",    icon: "🗿", a: "loot", b: "leave" },
  { id: "duelist",  icon: "🤺", a: "accept", b: "decline" },
];

export {
  LOGO_FULL, LOGO_MARK, BG_MAIN,
  STAT_MAX, OVR_MAX, STATS, START_AGE, RETIRE_AGE, FIGHTS_PER_AGE,
  TIER_GATE, TIER_LEVELS, MAX_ATTEMPTS,
  ULT_COST, HEAL_COST, ULT_FULL_BONUS, CREDIT_PACKS, NOADS_ILS,
  CLASSES, CITIES, cityById,
  GEAR, GEAR_SLOTS, RARITY, rarOf, ENCOUNTERS,
};
