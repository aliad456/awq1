import React, { useState, useEffect, useRef, useMemo } from "react";

/* ============================================================================
   A WARRIOR QUEST
   ----------------------------------------------------------------------------
   בית → דמות → עיר → קריירה → קרב → שלל וחלוקה → מפגש דרך → התבגרות → פרישה

   שבע מערכות מעבר לקרב הבסיסי:
   1. ציוד וחנות        2. שלל מקרבות       3. מהלך אולטימטיבי
   4. פציעות            5. חולשות יריב      6. מורשת ותארים
   7. מפגשי דרך

   הקרב אינו סימולציה — הוא רולטה מוטה לרעת השחקן (45/40/35 לפי עיר).
   כל סטט וכל פריט רק מזיזים את המספר הזה.

   העברה ל-Lovable + Supabase:
   - chanceOf, rollGear, gainFor והגרלות התוצאה חייבות לרוץ בצד שרת.
     בדפדפן, שחקן פשוט יחזיר "ניצחתי" ו"קיבלתי פריט אגדי".
   - טבלאות: profiles, careers, characters, gear, legacy.
   - כל הטקסטים ב-T. ערבית ואנגלית = עוד שתי מפתחות.
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

/* ------------------------------- טקסטים ----------------------------------- */

const T = {
  he: {
    dir: "rtl", title: "A Warrior Quest",
    tagline: "קריירה אחת. עשרים ושתיים שנה. כל בחירה נחרטת.",
    play: "שחק", google: "התחבר עם Google", signup: "הרשמה",
    guestNote: "מצב אורח — ההתחברות תתחבר בשלב הבא",
    settings: "הגדרות", close: "סגור", back: "חזור", cancel: "בטל",
    theme: "תצוגה", dark: "כהה", light: "בהיר", auto: "אוטומטי", language: "שפה",

    chooseChar: "בחר דמות", chooseSub: "לכל מחלקה חוזקות משלה.",
    hint: "העבר עכבר לתצוגה מהירה · לחץ כדי לנעול", picked: "נבחר",
    level: "רמה", ovr: "רמת לחימה", ovrShort: "OVR", age: "גיל",
    power: "כוח", agility: "זריזות", life: "חיים", energy: "אנרגיה", composure: "קור רוח",
    warrior: "לוחם", mage: "קוסם", archer: "קשת",
    warriorD: "לוחם קרוב. מכות כבדות ותגובה מהירה.",
    mageD: "שולט באנרגיה. חזק כשהוא רגוע ומרוכז.",
    archerD: "טווח ועמידות. שורד לאורך קרבות ארוכים.",
    focus: "התמחות", confirm: "אשר דמות", statsTitle: "סטטיסטיקות", ofMax: "מתוך",

    chooseCity: "לאן יוצאים", chooseCitySub: "העיר קובעת את רמת הקושי לכל הקריירה.",
    easy: "קלה", medium: "בינונית", hard: "קשה",
    atlantis: "אטלנטיס", lemuria: "למוריה", pompeii: "פומפיי",
    atlantisS: "עיר הנמל ששקעה בלילה אחד, כשהים החליט לקחת בחזרה את מה שהושאל לו. מתחת לגלים עוד דולקות מנורות בחלונות, ומשהו נע ביניהן. מי שיורד לשם לומד מהר שהמים לא שוכחים.",
    lemuriaS: "יבשת שהיערות בלעו לפני שהיה מי שירשום את שמה. העצים שם למדו ללכת, והשורשים למדו לזכור פנים. הם אינם עוינים לזרים — הם פשוט לא מבדילים בין אורח לבין דשן.",
    pompeiiS: "עיר שהאפר עצר באמצע נשימה ומעולם לא שחרר. ההר עדיין נושם מתחתיה, והאש שקברה אותה למדה מאז ללבוש צורה. כל צעד שם מרים אבק שהיה פעם מישהו.",
    difficulty: "רמת קושי", systemEdge: "יתרון המערכת", enter: "צא לדרך",

    fightsAt: "קרבות בגיל", peak: "שיא", decline: "דעיכה", growth: "צמיחה",
    fight1: "קרב חימום", fight2: "קרב אמיתי", fight3: "בוס",
    fight1D: "יריב קל. הדרך לעלות רמות.", fight2D: "יריב מנוסה. סיכוי לציוד.",
    fight3D: "שומר העיר. ציוד מובטח.", done: "הושלם", locked: "נעול",
    nextAge: "התבגר",
    nextAgeSub: "בחר בכמה שנים לקפוץ. שנים רבות יותר מביאות יריבים חזקים יותר ופרסים גדולים יותר — אבל אתה מגיע אליהם חלש יותר.",
    years: "שנים", ageMult: "מכפיל גיל",

    you: "אתה", spin: "מגלגלים…", chance: "סיכוי",
    surge: "נחשול", surgeD: "מתקפה חזיתית. נזק גבוה, סיכוי נמוך.",
    dive: "צלילה", diveD: "מתחת לגל. בטוח יותר, איטי יותר.",
    cleave: "כריתה", cleaveD: "חותך דרך העץ. נזק גבוה, סיכוי נמוך.",
    veil: "הסוואה", veilD: "נעלם בעלווה. בטוח יותר, איטי יותר.",
    blaze: "להט", blazeD: "פנים אל האש. נזק גבוה, סיכוי נמוך.",
    shelter: "מחסה", shelterD: "מאחורי האבן. בטוח יותר, איטי יותר.",
    maelstrom: "מערבולת", wildgrowth: "פרא", eruption: "התפרצות",
    ultD: "פגיעה ודאית, בלי רולטה.", ultBar: "מד מיקוד",
    hitOk: "פגעת", tookHit: "ספגת", ultHit: "מהלך אולטימטיבי",
    weakTo: "חולשה", weakAggr: "לתוקפנות", weakSafe: "לזהירות", weakUnknown: "לא ידועה",
    weakHint: "קור רוח 400+ חושף חולשות", weakBonus: "ניצול חולשה",

    a1: "קרקן צעיר", a2: "טורף מעמקים", a3: "לויתן הקדם",
    l1: "נבט זועם", l2: "שומר הקליפה", l3: "אב היער",
    p1: "גחלת נודדת", p2: "יציר לבה", p3: "אדון האפר",

    won: "הידד, ניצחת!", wonSub: "נוספו לך", pointsW: "נקודות סטטים",
    lost: "נפלת", lostSub: "הקריירה הסתיימה כאן.",
    remaining: "נותרו", autoAlloc: "חלק אוטומטית", apply: "אשר", maxed: "מלא",
    gold: "זהב", dropped: "נפל ממנו",

    shop: "חנות", shopSub: "המלאי מתחדש בכל גיל.", buy: "קנה", equipped: "מצויד",
    equip: "צייד", sell: "מכור", noGold: "אין מספיק זהב", empty: "ריק",
    gearTitle: "ציוד", bag: "תרמיל", slotWeapon: "נשק", slotArmor: "שריון", slotCharm: "קמע",
    blade: "להב", gaxe: "גרזן קרב", rod: "שרביט", gbow: "קשת",
    mail: "שריון קשקשים", grobe: "גלימה", hide: "מגן עור",
    ring: "טבעת", beads: "מחרוזת", urn: "כד אפר",
    plain: "פשוט", fine: "מוקפד", great: "נדיר", myth: "אגדי",
    reroll: "רענן מלאי", rerollCost: "80 זהב",

    injury: "פציעה", injuries: "פציעות", healthy: "בריא",
    injuredBy: "עד גיל", injuryHit: "נפצעת!",
    injuryD: "המהלך הפזיז גבה מחיר. הסטט נפגע עד שתחלים.",

    encounter: "מפגש בדרך", skip: "המשך בדרך",
    merchant: "סוחר נודד", merchantD: "הוא פורש בד על האדמה ומחכה. המחיר שלו לא הוגן, אבל הסחורה אמיתית.",
    buyE: "שלם 120 זהב", buyR: "קיבלת פריט", pass: "עבור הלאה", passR: "המשכת בדרך",
    spring: "מעיין שקט", springD: "המים צלולים מדי בשביל המקום הזה. משהו שם אותם כאן.",
    drink: "שתה", drinkR: "הפציעות נרפאו", rest: "נוח", restR: "האנרגיה התחדשה",
    wreck: "מבנה חרב", wreckD: "משהו מבהיק בין האבנים. גם משהו זז שם.",
    loot: "חטט", lootR: "מצאת זהב", leave: "התרחק", leaveR: "יצאת בשלום",
    duelist: "דו־קרבן", duelistD: "הוא חוסם את הדרך ומחייך. זה לא חיוך של מישהו שמפסיד.",
    accept: "קבל אתגר", acceptR: "ניצחת בדו־קרב", acceptF: "ספגת פציעה",
    decline: "סרב", declineR: "עקפת אותו", gained: "הרווחת",

    retired: "פרשת", retiredSub: "הגעת לגיל 40. זה הסיכום.",
    finalOvr: "רמת לחימה סופית", fightsWon: "קרבות שניצחת", newRun: "קריירה חדשה",
    legacy: "מורשת", prestige: "דרגת יוקרה",
    rank: "רמה", needRank: "נדרשת רמה", attemptsLeft: "ניסיונות",
    failed: "הקרב אבד", failedD: "שרפת ניסיון אחד. נותרו לך עוד — אבל כשייגמרו, הקריירה נגמרת איתם.",
    credits: "קרדיטים", noCredits: "אין קרדיטים", creditStore: "חנות קרדיטים",
    creditStoreD: "קרדיטים קונים מהלכים מיוחדים וניסיונות נוספים.",
    youHave: "יש לך", spendHere: "מה אפשר לקנות", packs: "חבילות קרדיטים",
    buyLife: "ניסיון נוסף", buyLifeD: "מחזיר לב אחד לקריירה הנוכחית.",
    ultMove: "מהלך אולטימטיבי", ultMoveD: "פגיעה ודאית בקרב. נגבה בכל שימוש.",
    noAds: "הסרת פרסומות", noAdsD: "תשלום חד־פעמי, לכל החשבון.", owned: "נרכש",
    bestValue: "הכי משתלם", bonus: "בונוס",
    payNote: "התשלומים עדיין לא מחוברים — הכפתורים מדמים רכישה לצורך בדיקה.", legacySub: "כל קריירה מותירה משהו לבאה אחריה.",
    legacyPts: "נקודות מורשת", legacyBonus: "בונוס פתיחה לקריירה הבאה",
    title: "תואר", hall: "אולם התהילה",
    t_drifter: "נווד", t_sell: "שכיר חרב", t_champ: "אלוף הזירה",
    t_legend: "אגדה", t_immortal: "בן אלמוות",
  },
};

/* -------------------------------- חישובים --------------------------------- */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (a) => a[Math.floor(Math.random() * a.length)];

const ageMult = (age) => (age <= 25 ? 1.6 : age <= 32 ? 1.0 : 0.5);
const agePhase = (age) => (age <= 25 ? "growth" : age <= 32 ? "peak" : "decline");

const gearBonus = (equipped) => {
  const b = Object.fromEntries(STATS.map((k) => [k, 0]));
  GEAR_SLOTS.forEach((s) => {
    const it = equipped[s];
    if (!it) return;
    Object.entries(it.stats).forEach(([k, v]) => { b[k] += v; });
  });
  return b;
};

const effStats = (base, equipped, injuries, age) => {
  const g = gearBonus(equipped);
  const out = {};
  STATS.forEach((k) => {
    let v = base[k] + g[k];
    injuries.filter((i) => i.stat === k && i.until > age).forEach((i) => { v = Math.round(v * (1 - i.pct)); });
    out[k] = clamp(v, 1, STAT_MAX);
  });
  return out;
};

const ovrOf = (cls, stats) => {
  const w = STATS.reduce((s, k) => s + (cls.focus.includes(k) ? 2 : 1), 0);
  const sum = STATS.reduce((s, k) => s + stats[k] * (cls.focus.includes(k) ? 2 : 1), 0);
  return Math.max(1, Math.round((sum / w / STAT_MAX) * OVR_MAX));
};

const seesWeakness = (stats) => stats.composure >= 400;

const chanceOf = (city, stats, mode, age, foe) => {
  const skill = (stats.agility + stats.composure) / 2;
  const bonus = clamp((skill / STAT_MAX) * 22, 0, 22);
  const agePen = age > 32 ? (age - 32) * 0.8 : 0;
  const weak = foe && foe.weak === mode ? 12 : 0;
  return clamp(city.bias + bonus + weak - (mode === "aggr" ? 8 : -6) - agePen, 8, 90);
};

const gainFor = (city, tier, age) =>
  Math.round([30, 55, 120][tier] * city.reward * ageMult(age) * (1 + (age - START_AGE) * 0.02));

const goldFor = (city, tier, age) =>
  Math.round([45, 100, 240][tier] * city.reward * (1 + (age - START_AGE) * 0.05));

/* כמה סטט "אמור" להיות לשחקן בגיל הזה בעיר הזו — עוגן האיזון */
const refStat = (city, age) => 30 + (age - START_AGE) * 18 * city.reward;

/* הנזק הוא אחוז ממאגר היריב, מותאם ליחס בין הכוח שלך לעוגן.
   ככה קרב לוקח תמיד 5–7 פגיעות, גם ב-OVR 20 וגם ב-OVR 240. */
const hitFrac = (city, stats, age, aggressive) => {
  const ratio = clamp(stats.power / refStat(city, age), 0.55, 1.5);
  return (aggressive ? 0.26 : 0.15) * ratio;
};
const foeFrac = (city, stats, age, aggressive) => {
  const guard = (stats.life * 0.6 + stats.composure * 0.4);
  const ratio = clamp(refStat(city, age) / Math.max(1, guard), 0.55, 1.7);
  return (aggressive ? 0.22 : 0.11) * ratio * city.danger;
};

const foeHpOf = (city, tier) => Math.round((100 + tier * 45) * city.danger);

/* מחולל ציוד — הלב הכלכלי. חייב לעבור לשרת. */
let GID = 1;
const rollGear = (age, city, forceRar) => {
  const slot = pick(GEAR_SLOTS);
  const base = pick(GEAR[slot]);
  const r = Math.random() * 100;
  const rar = forceRar || (r < 5 + age * 0.4 ? "myth" : r < 20 + age ? "great" : r < 50 ? "fine" : "plain");
  const R = rarOf(rar);
  const scale = (14 + (age - START_AGE) * 9) * R.mult * city.reward;

  const stats = { [base.main]: Math.round(scale * (0.9 + Math.random() * 0.35)) };
  const pool = STATS.filter((k) => k !== base.main).sort(() => Math.random() - 0.5);
  for (let i = 0; i < R.extra; i++)
    stats[pool[i]] = Math.round(scale * 0.45 * (0.8 + Math.random() * 0.5));

  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  return { gid: GID++, slot, base: base.id, icon: base.icon, rar, stats, price: Math.round(total * 1.7) };
};

const prestigeOf = (legacy) => Math.floor(legacy / 25);

const titleFor = (ovr) =>
  ovr < 60 ? "t_drifter" : ovr < 100 ? "t_sell" : ovr < 150 ? "t_champ" : ovr < 200 ? "t_legend" : "t_immortal";

/* ================================ קומפוננטה =============================== */

export default function WarriorQuest() {
  const t = T.he;

  const [themeMode, setThemeMode] = useState("auto");
  const [sysDark, setSysDark] = useState(false);
  const [view, setView] = useState("home");
  const [modal, setModal] = useState(null);

  const [selected, setSelected] = useState("warrior");
  const [preview, setPreview] = useState(null);
  const [suppress, setSuppress] = useState(null);

  const [cityId, setCityId] = useState(null);
  const [base, setBase] = useState(null);
  const [age, setAge] = useState(START_AGE);
  const [cleared, setCleared] = useState([]);
  const [wins, setWins] = useState(0);

  const [gold, setGold] = useState(0);
  const [level, setLevel] = useState(1);
  const [attempts, setAttempts] = useState(MAX_ATTEMPTS);
  const [credits, setCredits] = useState(120);
  const [noAds, setNoAds] = useState(false);
  const [equipped, setEquipped] = useState({ weapon: null, armor: null, charm: null });
  const [bag, setBag] = useState([]);
  const [stock, setStock] = useState([]);
  const [injuries, setInjuries] = useState([]);

  const [fight, setFight] = useState(null);
  const [pending, setPending] = useState(0);
  const [alloc, setAlloc] = useState(null);
  const [reward, setReward] = useState(null);
  const [enc, setEnc] = useState(null);
  const [encRes, setEncRes] = useState(null);

  /* מורשת — נשמרת בין קריירות */
  const [legacy, setLegacy] = useState(0);
  const [hall, setHall] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSysDark(mq.matches);
    const fn = (e) => setSysDark(e.matches);
    mq.addEventListener ? mq.addEventListener("change", fn) : mq.addListener(fn);
    return () => (mq.removeEventListener ? mq.removeEventListener("change", fn) : mq.removeListener(fn));
  }, []);

  const dark = themeMode === "dark" || (themeMode === "auto" && sysDark);
  const cls = CLASSES.find((c) => c.id === selected) || CLASSES[0];
  const city = cityId ? cityById(cityId) : null;
  const baseStats = base || cls.base;
  const stats = useMemo(() => effStats(baseStats, equipped, injuries, age),
    [baseStats, equipped, injuries, age]);
  const ovr = useMemo(() => ovrOf(cls, stats), [cls, stats]);
  const activeInj = injuries.filter((i) => i.until > age);

  /* ------------------------------ ניהול קריירה ---------------------------- */
  const beginCareer = (id) => {
    const c = cityById(id);
    const start = Object.fromEntries(STATS.map((k) => [k, cls.base[k] + legacy * 6]));
    setCityId(id); setBase(start); setAge(START_AGE);
    setCleared([]); setWins(0); setGold(120); setInjuries([]);
    setLevel(1); setAttempts(MAX_ATTEMPTS);
    setEquipped({ weapon: null, armor: null, charm: null }); setBag([]);
    setStock([rollGear(START_AGE, c), rollGear(START_AGE, c), rollGear(START_AGE, c)]);
    setView("career");
  };

  const resetAll = () => {
    setView("home"); setCityId(null); setBase(null); setAge(START_AGE);
    setCleared([]); setWins(0); setFight(null); setPending(0); setAlloc(null);
    setReward(null); setEnc(null); setEncRes(null); setModal(null);
    setGold(0); setBag([]); setInjuries([]); setLevel(1); setAttempts(MAX_ATTEMPTS);
    setEquipped({ weapon: null, armor: null, charm: null });
  };

  const openFight = (tier) => {
    const fh = foeHpOf(city, tier);
    const mine = 100 + Math.round(clamp(stats.life / refStat(city, age), 0.6, 1.6) * 60);
    setFight({ tier, foeHp: fh, foeMax: fh, hp: mine, max: mine, ult: 0, phase: "choose", spinIdx: 0, log: [] });
    setView("fight");
  };

  const onFightWon = (tier) => {
    const pts = gainFor(city, tier, age);
    const g = goldFor(city, tier, age);
    let drop = null;
    if (tier === 2) drop = rollGear(age, city);
    else if (tier === 1 && Math.random() < 0.55) drop = rollGear(age, city);

    setGold((x) => x + g);
    if (drop) setBag((b) => [drop, ...b].slice(0, 12));
    setReward({ gold: g, drop });
    setPending(pts);
    setAlloc(Object.fromEntries(STATS.map((k) => [k, 0])));
    setWins((w) => w + 1);
    setLevel((L) => L + TIER_LEVELS[tier]);
    if (tier === 2) setCleared((c) => (c.includes(2) ? c : [...c, 2]));
    setModal("won");
  };

  const addInjury = () => {
    const stat = pick(STATS);
    setInjuries((I) => [...I, { id: Math.random(), stat, pct: 0.12, until: age + 4 }]);
  };

  const applyAlloc = () => {
    setBase((S) => {
      const n = { ...S };
      STATS.forEach((k) => { n[k] = clamp(n[k] + alloc[k], 0, STAT_MAX); });
      return n;
    });
    setPending(0); setAlloc(null); setReward(null); setFight(null);
    /* מפגש דרך — לא אחרי כל קרב */
    if (Math.random() < 0.4) {
      setEnc(pick(ENCOUNTERS)); setEncRes(null); setModal("enc"); setView("career");
    } else { setModal(null); setView("career"); }
  };

  const autoAlloc = () => {
    const w = Object.fromEntries(STATS.map((k) => [k, cls.focus.includes(k) ? 2 : 1]));
    const total = Object.values(w).reduce((a, b) => a + b, 0);
    const next = {}; let left = Math.min(pending, roomLeft);
    STATS.forEach((k) => {
      const room = STAT_MAX - baseStats[k];
      const want = Math.max(0, Math.min(room, Math.floor((pending * w[k]) / total), left));
      next[k] = want; left -= want;
    });
    for (const k of STATS) {
      if (left <= 0) break;
      const room = STAT_MAX - baseStats[k] - next[k];
      const add = Math.min(room, left); next[k] += add; left -= add;
    }
    setAlloc(next);
  };

  const advanceAge = (years) => {
    const next = age + years;
    setCleared([]);
    setStock([rollGear(next, city), rollGear(next, city), rollGear(next, city)]);
    if (next >= RETIRE_AGE) { setAge(RETIRE_AGE); finishCareer(RETIRE_AGE); }
    else { setAge(next); setModal(null); }
  };

  const finishCareer = (finalAge) => {
    const st = effStats(baseStats, equipped, injuries, finalAge);
    const o = ovrOf(cls, st);
    const pts = Math.round(o / 4);
    setLegacy((L) => L + pts);
    setHall((H) => [{ id: Math.random(), cls: cls.id, city: cityId, ovr: o, wins, title: titleFor(o) }, ...H].slice(0, 6));
    setModal("retired");
  };

  /* ------------------------------- חנות ותיק ------------------------------ */
  const buy = (it) => {
    if (gold < it.price) return;
    setGold((g) => g - it.price);
    setStock((s) => s.filter((x) => x.gid !== it.gid));
    setBag((b) => [it, ...b].slice(0, 12));
  };
  const equipIt = (it) => {
    setEquipped((E) => {
      const old = E[it.slot];
      if (old) setBag((b) => [old, ...b.filter((x) => x.gid !== it.gid)].slice(0, 12));
      else setBag((b) => b.filter((x) => x.gid !== it.gid));
      return { ...E, [it.slot]: it };
    });
  };
  const sellIt = (it) => {
    setGold((g) => g + Math.round(it.price * 0.55));
    setBag((b) => b.filter((x) => x.gid !== it.gid));
  };
  const rerollStock = () => {
    if (gold < 80) return;
    setGold((g) => g - 80);
    setStock([rollGear(age, city), rollGear(age, city), rollGear(age, city)]);
  };

  /* ------------------------------ מפגשי דרך ------------------------------- */
  const resolveEnc = (which) => {
    const e = enc;
    let res = { text: "", good: true };
    if (e.id === "merchant") {
      if (which === "a") {
        if (gold >= 120) {
          setGold((g) => g - 120);
          const it = rollGear(age, city, Math.random() < 0.5 ? "great" : "myth");
          setBag((b) => [it, ...b].slice(0, 12));
          res = { text: t.buyR, good: true };
        } else res = { text: t.noGold, good: false };
      } else res = { text: t.passR, good: true };
    } else if (e.id === "spring") {
      if (which === "a") { setInjuries([]); res = { text: t.drinkR, good: true }; }
      else { setGold((g) => g + 60); res = { text: `${t.restR} · +60 ${t.gold}`, good: true }; }
    } else if (e.id === "wreck") {
      if (which === "a") {
        if (Math.random() < 0.6) { const g = 90 + age * 6; setGold((x) => x + g); res = { text: `${t.lootR} · +${g}`, good: true }; }
        else { addInjury(); res = { text: t.injuryHit, good: false }; }
      } else res = { text: t.leaveR, good: true };
    } else {
      if (which === "a") {
        if (Math.random() * 100 < 42 + stats.agility / 60) {
          const g = 140 + age * 8; setGold((x) => x + g);
          res = { text: `${t.acceptR} · +${g} ${t.gold}`, good: true };
        } else { addInjury(); res = { text: t.acceptF, good: false }; }
      } else res = { text: t.declineR, good: true };
    }
    setEncRes(res);
  };

  const allocUsed = alloc ? Object.values(alloc).reduce((a, b) => a + b, 0) : 0;
  const roomLeft = STATS.reduce((s, k) => s + (STAT_MAX - baseStats[k]), 0);
  const needed = Math.min(pending, roomLeft);

  /* --------------------------------- מעטפת -------------------------------- */
  const shell = (children) => (
    <div dir={t.dir} className={`ws ${dark ? "dark" : "light"}`}
      style={city ? { "--city": city.theme.accent, "--cityGlow": city.theme.glow } : undefined}>
      <Style />
      <div className={`bgLayer ${view === "home" ? "hero" : "quiet"}`}
        style={{ backgroundImage: `url(${BG_MAIN})` }} aria-hidden />
      <div className="bgScrim" aria-hidden />
      <div className="stage">{children}</div>

      <footer className="brandBar">
        <img className="logoMark" src={LOGO_MARK} alt={t.title} />
        <div className="barRight">
          {view !== "home" && view !== "select" && (
            <>
              <span className="goldPill">🪙 {gold}</span>
              <button className="creditPill" onClick={() => setView("credits")}>💠 {credits}</button>
            </>
          )}
          <button className="barBtn" onClick={() => setModal("settings")}>
            <Gear /><span>{t.settings}</span>
          </button>
        </div>
      </footer>

      {modal === "settings" && (
        <Modal title={t.settings} onClose={() => setModal(null)} close={t.close}>
          <Seg label={t.theme} opts={[["light", t.light], ["dark", t.dark], ["auto", t.auto]]}
            val={themeMode} set={setThemeMode} />
          <div className="setRow"><span>{t.language}</span>
            <div className="seg">
              <button className="on">עברית</button>
              <button disabled>English</button>
              <button disabled>العربية</button>
            </div>
          </div>
          {view !== "home" && (
            <button className="btn full" style={{ marginTop: 16 }} onClick={resetAll}>{t.newRun}</button>
          )}
        </Modal>
      )}

      {modal === "won" && alloc && (
        <Modal title={`🎉 ${t.won}`}>
          <div className="rewardRow">
            <span className="rw">🪙 +{reward?.gold} {t.gold}</span>
            <span className="rw">✨ +{pending} {t.pointsW}</span>
          </div>
          {reward?.drop && (
            <div className="dropBox">
              <div className="dropLabel">{t.dropped}</div>
              <GearRow t={t} it={reward.drop} />
            </div>
          )}
          <Allocator t={t} stats={baseStats} alloc={alloc} setAlloc={setAlloc}
            left={needed - allocUsed} onAuto={autoAlloc} />
          <button className="btn primary full" style={{ marginTop: 14 }}
            disabled={allocUsed !== needed} onClick={applyAlloc}>{t.apply}</button>
        </Modal>
      )}

      {modal === "enc" && enc && (
        <Modal title={`${enc.icon} ${t[enc.id]}`}>
          <p className="muted" style={{ lineHeight: 1.75, marginBottom: 14 }}>{t[`${enc.id}D`]}</p>
          {!encRes ? (
            <>
              <button className="btn full" onClick={() => resolveEnc("a")}>{t[enc.a] || t[`${enc.a}E`]}</button>
              <button className="btn full" onClick={() => resolveEnc("b")}>{t[enc.b]}</button>
            </>
          ) : (
            <>
              <p className={`encRes ${encRes.good ? "good" : "bad"}`}>{encRes.text}</p>
              <button className="btn primary full" onClick={() => { setModal(null); setEnc(null); }}>
                {t.skip}
              </button>
            </>
          )}
        </Modal>
      )}

      {modal === "lost" && (
        <Modal title={`💀 ${t.lost}`}>
          <p className="muted">{t.lostSub}</p>
          <Summary t={t} stats={stats} ovr={ovr} age={age} wins={wins} />
          <button className="btn primary full" style={{ marginTop: 14 }} onClick={resetAll}>{t.newRun}</button>
        </Modal>
      )}

      {modal === "retired" && (
        <Modal title={`🏛️ ${t.retired}`}>
          <p className="muted">{t.retiredSub}</p>
          <div className="titleBox">
            <span className="titleLabel">{t.title}</span>
            <b className="disp titleName">{t[titleFor(ovr)]}</b>
          </div>
          <Summary t={t} stats={stats} ovr={ovr} age={RETIRE_AGE} wins={wins} />
          <div className="legacyBox">
            <div className="sumRow"><span>{t.legacyPts}</span><b>+{Math.round(ovr / 4)}</b></div>
            <div className="sumRow"><span>{t.legacyBonus}</span><b>+{legacy * 6} {t.statsTitle}</b></div>
            <div className="sumRow"><span>{t.prestige}</span><b>{prestigeOf(legacy)}</b></div>
            <p className="muted" style={{ marginTop: 8 }}>{t.legacySub}</p>
          </div>
          <button className="btn primary full" style={{ marginTop: 14 }} onClick={resetAll}>{t.newRun}</button>
        </Modal>
      )}

      {modal === "aging" && (
        <Modal title={t.nextAge} onClose={() => setModal(null)} close={t.close}>
          <p className="muted" style={{ marginBottom: 14 }}>{t.nextAgeSub}</p>
          {[2, 3, 4].map((y) => (
            <button key={y} className="btn full ageBtn" onClick={() => advanceAge(y)}>
              <b>+{y} {t.years}</b>
              <span>{t.age} {Math.min(RETIRE_AGE, age + y)} · {t[agePhase(age + y)]} · {t.ageMult} ×{ageMult(age + y)}</span>
            </button>
          ))}
        </Modal>
      )}

      {modal === "failed" && (
        <Modal title={`⚔️ ${t.failed}`} onClose={() => setModal(null)} close={t.close}>
          <p className="muted" style={{ lineHeight: 1.7 }}>{t.failedD}</p>
          <div className="attemptRow">
            {Array.from({ length: MAX_ATTEMPTS }, (_, i) => (
              <span key={i} className={`heart ${i < attempts ? "on" : ""}`}>{i < attempts ? "❤️" : "🖤"}</span>
            ))}
          </div>
          <button className="btn primary full" disabled={credits < HEAL_COST}
            onClick={() => { setCredits((c) => c - HEAL_COST); setAttempts((a) => a + 1); setModal(null); }}>
            {t.buyLife} · 🪙 {HEAL_COST}
          </button>
          <button className="btn full" onClick={() => { setModal(null); setView("credits"); }}>
            {t.creditStore}
          </button>
        </Modal>
      )}

      {modal === "shop" && (
        <Modal title={`🏪 ${t.shop}`} onClose={() => setModal(null)} close={t.close}>
          <p className="muted" style={{ marginBottom: 12 }}>{t.shopSub}</p>
          {stock.length === 0 && <p className="muted">{t.empty}</p>}
          {stock.map((it) => (
            <div className="shopRow" key={it.gid}>
              <GearRow t={t} it={it} />
              <button className="btn small" disabled={gold < it.price} onClick={() => buy(it)}>
                {t.buy} · 🪙{it.price}
              </button>
            </div>
          ))}
          <button className="btn full" style={{ marginTop: 12 }} disabled={gold < 80} onClick={rerollStock}>
            {t.reroll} · {t.rerollCost}
          </button>
        </Modal>
      )}

      {modal === "bag" && (
        <Modal title={`🎒 ${t.bag}`} onClose={() => setModal(null)} close={t.close}>
          {bag.length === 0 && <p className="muted">{t.empty}</p>}
          {bag.map((it) => (
            <div className="shopRow" key={it.gid}>
              <GearRow t={t} it={it} />
              <span className="rowBtnsTight">
                <button className="btn small" onClick={() => equipIt(it)}>{t.equip}</button>
                <button className="btn small" onClick={() => sellIt(it)}>🪙{Math.round(it.price * 0.55)}</button>
              </span>
            </div>
          ))}
        </Modal>
      )}
    </div>
  );

  /* ----------------------------- חנות קרדיטים ----------------------------- */
  if (view === "credits")
    return shell(
      <div className="wrap">
        <header className="top">
          <h1 className="disp pageTitle">🪙 {t.creditStore}</h1>
          <p className="muted">{t.creditStoreD} · {t.youHave} <b>{credits}</b> {t.credits}</p>
        </header>

        <h3 className="sectionLabel">{t.spendHere}</h3>
        <div className="storeRow">
          <div className="storeItem">
            <span className="storeIcon">❤️</span>
            <div>
              <b className="disp">{t.buyLife}</b>
              <span className="storeDesc">{t.buyLifeD}</span>
            </div>
            <button className="btn small" disabled={credits < HEAL_COST || attempts >= MAX_ATTEMPTS}
              onClick={() => { setCredits((c) => c - HEAL_COST); setAttempts((a) => Math.min(MAX_ATTEMPTS, a + 1)); }}>
              🪙 {HEAL_COST}
            </button>
          </div>
          <div className="storeItem">
            <span className="storeIcon">{city ? city.ult.icon : "⚡"}</span>
            <div>
              <b className="disp">{t.ultMove}</b>
              <span className="storeDesc">{t.ultMoveD}</span>
            </div>
            <span className="storePrice">🪙 {ULT_COST}</span>
          </div>
          <div className="storeItem">
            <span className="storeIcon">🚫</span>
            <div>
              <b className="disp">{t.noAds}</b>
              <span className="storeDesc">{t.noAdsD}</span>
            </div>
            <button className="btn small" disabled={noAds} onClick={() => setNoAds(true)}>
              {noAds ? t.owned : `₪${NOADS_ILS}`}
            </button>
          </div>
        </div>

        <h3 className="sectionLabel">{t.packs}</h3>
        <div className="packs">
          {CREDIT_PACKS.map((k) => (
            <button key={k.id} className={`pack ${k.best ? "best" : ""}`}
              onClick={() => setCredits((c) => c + k.credits)}>
              {k.best && <span className="bestTag">{t.bestValue}</span>}
              <span className="packIcon">🪙</span>
              <b className="disp packN">{k.credits.toLocaleString()}</b>
              <span className="packLabel">{t.credits}</span>
              {k.bonus && <span className="packBonus">+{k.bonus}% {t.bonus}</span>}
              <span className="packPrice">${k.usd}</span>
            </button>
          ))}
        </div>
        <p className="muted" style={{ marginTop: 14 }}>{t.payNote}</p>

        <div className="rowBtns narrow">
          <button className="btn big" onClick={() => setView(cityId ? "career" : "home")}>{t.back}</button>
        </div>
      </div>
    );

  /* --------------------------------- בית ---------------------------------- */
  if (view === "home")
    return shell(
      <div className="home">
        <h1 className="homeArt"><img className="logoFull" src={LOGO_FULL} alt={t.title} /></h1>
        <p className="homeTag">{t.tagline}</p>
        {legacy > 0 && (
          <p className="legacyLine">⚜️ {t.prestige} {prestigeOf(legacy)} · {t.legacy} {legacy} · {t.legacyBonus} +{legacy * 6}</p>
        )}
        <div className="homeBtns">
          <button className="btn primary big" onClick={() => setView("select")}>{t.play}</button>
          <button className="btn big" disabled>{t.google}</button>
          <button className="btn big" disabled>{t.signup}</button>
        </div>
        {hall.length > 0 && (
          <div className="hall">
            <h3 className="disp">{t.hall}</h3>
            {hall.map((h) => (
              <div className="hallRow" key={h.id}>
                <span>{CLASSES.find((c) => c.id === h.cls)?.icon} {cityById(h.city)?.icon}</span>
                <b>{t[h.title]}</b>
                <span className="hallOvr">OVR {h.ovr}</span>
              </div>
            ))}
          </div>
        )}
        <p className="muted homeNote">{t.guestNote}</p>
      </div>
    );

  /* ------------------------------ בחירת דמות ------------------------------ */
  if (view === "select")
    return shell(
      <div className="wrap">
        <header className="top">
          <h1 className="disp pageTitle">{t.chooseChar}</h1>
          <p className="muted">{t.chooseSub}</p>
        </header>
        <div className="cols">
          <StatPanel t={t} cls={cls} stats={cls.base} ovr={ovrOf(cls, cls.base)} />
          <div className="mainCol">
            <div className="chars">
              {CLASSES.map((c) => (
                <div key={c.id} className="charWrap">
                  <button
                    className={`charCard ${selected === c.id ? "on" : ""} ${preview === c.id ? "flipped" : ""}`}
                    onMouseEnter={() => { if (suppress !== c.id) setPreview(c.id); }}
                    onMouseLeave={() => { setPreview(null); setSuppress(null); }}
                    onFocus={() => { if (suppress !== c.id) setPreview(c.id); }}
                    onBlur={() => setPreview(null)}
                    onClick={() => { setSelected(c.id); setPreview(null); setSuppress(c.id); }}>
                    <span className="flipper">
                      <span className="face front">
                        <img className="charImg" src={c.img} alt="" />
                        <b className="disp">{t[c.id]}</b>
                        <span className="cDesc">{t[`${c.id}D`]}</span>
                        <span className="cOvr">{t.ovrShort} {ovrOf(c, c.base)}</span>
                      </span>
                      <span className="face back">
                        <span className="backHead">
                          <span className="popIcon">{c.icon}</span>
                          <b className="disp">{t[c.id]}</b>
                          <span className="popOvr">{t.ovrShort} {ovrOf(c, c.base)}</span>
                        </span>
                        {STATS.map((k) => (
                          <span className={`popRow ${c.focus.includes(k) ? "focus" : ""}`} key={k}>
                            <span>{t[k]}{c.focus.includes(k) && <i className="star">✦</i>}</span>
                            <b>{c.base[k]}</b>
                          </span>
                        ))}
                        <span className="backFoot">{t.focus}: {c.focus.map((f) => t[f]).join(" · ")}</span>
                      </span>
                    </span>
                    {selected === c.id && <span className="lockTag">{t.picked}</span>}
                  </button>
                </div>
              ))}
            </div>
            <p className="muted hint">{t.hint}</p>
            <div className="rowBtns">
              <button className="btn primary big" onClick={() => setView("city")}>{t.confirm}</button>
              <button className="btn big" onClick={() => setView("home")}>{t.back}</button>
            </div>
          </div>
        </div>
      </div>
    );

  /* ------------------------------- בחירת עיר ------------------------------ */
  if (view === "city")
    return shell(
      <div className="wrap">
        <header className="top">
          <h1 className="disp pageTitle">{t.chooseCity}</h1>
          <p className="muted">{t.chooseCitySub}</p>
        </header>
        <div className="cities">
          {CITIES.map((c) => (
            <button key={c.id} className="cityCard"
              style={{ "--city": c.theme.accent, "--cityGlow": c.theme.glow }}
              onClick={() => beginCareer(c.id)}>
              <span className="cityStrip" aria-hidden>
                {c.strip.map((e, i) => <i key={i} style={{ animationDelay: `${i * 0.8}s` }}>{e}</i>)}
              </span>
              <span className="cityArt"><img src={c.art} alt={t[c.id]} loading="lazy" /></span>
              <b className="disp cityName">{c.icon} {t[c.id]}</b>
              <span className="diffTag">{t.difficulty}: {t[c.diff]}</span>
              <span className="cityStory">{t[`${c.id}S`]}</span>
              <span className="cityEdge">{t.systemEdge} {100 - c.bias}–{c.bias}</span>
              <span className="cityGo">{t.enter}</span>
            </button>
          ))}
        </div>
        <div className="rowBtns narrow">
          <button className="btn big" onClick={() => setView("select")}>{t.back}</button>
        </div>
      </div>
    );

  /* ------------------------------ מסלול הקריירה --------------------------- */
  if (view === "career")
    return shell(
      <div className="wrap">
        <header className="top">
          <h1 className="disp pageTitle">{city.icon} {t[city.id]}</h1>
          <p className="muted">
            {t.fightsAt} {age} · {t[agePhase(age)]} · {t.ageMult} ×{ageMult(age)}
            {" · "}{t.rank} {level}
            {" · "}{t.attemptsLeft} {"❤".repeat(attempts)}
          </p>
        </header>

        <div className="cols">
          <StatPanel t={t} cls={cls} stats={stats} base={baseStats} ovr={ovr} age={age}
            equipped={equipped} injuries={activeInj}
            onShop={() => setModal("shop")} onBag={() => setModal("bag")} bagCount={bag.length} />
          <div className="mainCol">
            <AgeTrack age={age} />
            <div className="fights">
              {[0, 1, 2].map((tier) => {
                const gate = TIER_GATE[tier];
                const locked = level < gate;
                const beaten = tier === 2 && cleared.includes(2);
                const foe = city.tiers[tier];
                return (
                  <button key={tier} className={`fightCard ${locked ? "gated" : ""} ${beaten ? "done" : ""}`}
                    disabled={locked || beaten} onClick={() => openFight(tier)}>
                    <span className="fIcon">{foe.icon}</span>
                    <b className="disp">{t[`fight${tier + 1}`]}</b>
                    <span className="fDesc">{t[`fight${tier + 1}D`]}</span>
                    <span className="fGain">+{gainFor(city, tier, age)} ✨ · +{goldFor(city, tier, age)} 🪙</span>
                    <span className="fLevel">+{TIER_LEVELS[tier]} {t.rank}</span>
                    <span className="fWeak">
                      {t.weakTo}: {seesWeakness(stats) ? (foe.weak === "aggr" ? t.weakAggr : t.weakSafe) : "❓"}
                    </span>
                    {locked && (
                      <span className="gateWrap">
                        <span className="gateTag">🔒 {t.needRank} {gate}</span>
                        <span className="gateBar"><i style={{ width: `${clamp((level / gate) * 100, 0, 100)}%` }} /></span>
                      </span>
                    )}
                    {beaten && <span className="fTag">{t.done}</span>}
                  </button>
                );
              })}
            </div>
            {cleared.includes(2) && (
              <button className="btn primary big full" style={{ marginTop: 18 }}
                onClick={() => setModal("aging")}>{t.nextAge} ←</button>
            )}
          </div>
        </div>
      </div>
    );

  /* --------------------------------- קרב ---------------------------------- */
  return shell(
    <Fight t={t} city={city} cls={cls} stats={stats} age={age}
      credits={credits} spend={(n) => setCredits((c) => c - n)}
      state={fight} setState={setFight}
      onWin={() => onFightWon(fight.tier)}
      onLose={() => {
        const left = attempts - 1;
        setAttempts(left);
        setFight(null);
        setModal(left <= 0 ? "lost" : "failed");
        if (left > 0) setView("career");
      }}
      onInjury={addInjury}
      onQuit={() => { setFight(null); setView("career"); }} />
  );
}

/* ================================== הקרב ================================== */

function Fight({ t, city, cls, stats, age, credits, spend, state, setState, onWin, onLose, onInjury, onQuit }) {
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  if (!state) return null;

  const foe = city.tiers[state.tier];
  const sees = seesWeakness(stats);
  const ultFull = state.ult >= 100;
  const edge = ultFull ? ULT_FULL_BONUS : 0;
  const chances = [chanceOf(city, stats, "aggr", age, sees ? foe : null) + edge,
                   chanceOf(city, stats, "safe", age, sees ? foe : null) + edge];
  const canUlt = credits >= ULT_COST;

  const finish = (s, foeHp, hp, log, extra) => {
    const over = foeHp <= 0 ? "win" : hp <= 0 ? "lose" : null;
    if (over === "win") timers.current.push(setTimeout(onWin, 560));
    if (over === "lose") timers.current.push(setTimeout(onLose, 560));
    return { ...s, foeHp, hp, log, phase: over || "choose", ...extra };
  };

  const settle = (success, aggressive) => {
    setState((s) => {
      if (!s) return s;
      let { foeHp, hp, log, ult } = s;
      ult = Math.min(100, ult + 16 + stats.energy / 55);
      if (success) {
        const dmg = Math.max(1, Math.round(s.foeMax * hitFrac(city, stats, age, aggressive)));
        foeHp -= dmg;
        log = [{ id: Math.random(), k: "ok", n: dmg }, ...log].slice(0, 4);
      } else {
        const dmg = Math.max(1, Math.round(s.max * foeFrac(city, stats, age, aggressive)));
        hp -= dmg;
        log = [{ id: Math.random(), k: "bad", n: dmg }, ...log].slice(0, 4);
        /* מהלך פזיז שנכשל קשה עלול לפצוע. קור רוח מגן. */
        const injChance = aggressive ? 0.18 - stats.composure / 12000 : 0.04;
        if (dmg / s.max > 0.22 && Math.random() < injChance && hp > 0) {
          onInjury();
          log = [{ id: Math.random(), k: "inj" }, ...log].slice(0, 4);
        }
      }
      return finish(s, foeHp, hp, log, { ult, spinIdx: success ? 0 : 1 });
    });
  };

  const choose = (aggressive) => {
    if (state.phase !== "choose") return;
    const mode = aggressive ? "aggr" : "safe";
    const success = Math.random() * 100 < chanceOf(city, stats, mode, age, foe) + edge;
    setState((s) => ({ ...s, phase: "spin", spinIdx: 0 }));
    const steps = 11 + Math.floor(Math.random() * 4);
    let i = 0;
    const tick = (delay) => {
      timers.current.push(setTimeout(() => {
        i++;
        setState((s) => (s ? { ...s, spinIdx: i % 2 } : s));
        if (i < steps) tick(delay * 1.17);
        else settle(success, aggressive);
      }, delay));
    };
    tick(70);
  };

  const useUlt = () => {
    if (state.phase !== "choose" || credits < ULT_COST) return;
    spend(ULT_COST);
    setState((s) => {
      const dmg = Math.max(1, Math.round(s.foeMax * 0.38));
      const foeHp = s.foeHp - dmg;
      const log = [{ id: Math.random(), k: "ult", n: dmg }, ...s.log].slice(0, 4);
      return finish(s, foeHp, s.hp, log, { ult: 0 });
    });
  };

  return (
    <div className="wrap">
      <header className="top">
        <h1 className="disp pageTitle">{city.icon} {t[foe.id]}</h1>
        <p className="muted">
          {t.age} {age} · {t[`fight${state.tier + 1}`]} · {t.weakTo}{" "}
          {sees ? (foe.weak === "aggr" ? t.weakAggr : t.weakSafe) : t.weakUnknown}
          {!sees && <em className="weakHint"> · {t.weakHint}</em>}
        </p>
      </header>

      <div className="arena">
        <div className="side">
          <span className="foeIcon">{foe.icon}</span>
          <b className="disp">{t[foe.id]}</b>
          <div className="hpbar foe"><i style={{ width: `${clamp((state.foeHp / state.foeMax) * 100, 0, 100)}%` }} /></div>
          <span className="hpn">{Math.max(0, state.foeHp)} / {state.foeMax}</span>
        </div>

        <div className="middle">
          {state.phase === "spin" ? (
            <div className="roulette">
              <span className="spinLabel">{t.spin}</span>
              <div className="spinRow">
                <span className={`spinCell ok ${state.spinIdx === 0 ? "lit" : ""}`}>✔</span>
                <span className={`spinCell no ${state.spinIdx === 1 ? "lit" : ""}`}>✖</span>
              </div>
            </div>
          ) : (
            <div className="logRow">
              {state.log.map((l) => (
                <span key={l.id} className={`chip ${l.k}`}>
                  {l.k === "ok" && `${t.hitOk} ${l.n}`}
                  {l.k === "bad" && `${t.tookHit} ${l.n}`}
                  {l.k === "ult" && `${t.ultHit} ${l.n}`}
                  {l.k === "inj" && `🩸 ${t.injuryHit}`}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="side">
          <span className="foeIcon">{cls.icon}</span>
          <b className="disp">{t.you}</b>
          <div className="hpbar me"><i style={{ width: `${clamp((state.hp / state.max) * 100, 0, 100)}%` }} /></div>
          <span className="hpn">{Math.max(0, state.hp)} / {state.max}</span>
        </div>
      </div>

      <div className={`ultWrap ${ultFull ? "full" : ""}`}>
        <span className="ultLabel">{t.ultBar}</span>
        <div className="ultBar"><i style={{ width: `${state.ult}%` }} /></div>
        <span className="ultEdge">{ultFull ? `+${ULT_FULL_BONUS}% ${t.chance}` : `${Math.round(state.ult)}%`}</span>
      </div>

      <div className="acts">
        {city.acts.map((a, i) => {
          const isWeak = sees && foe.weak === (i === 0 ? "aggr" : "safe");
          return (
            <button key={a.id} className={`actBtn ${isWeak ? "weak" : ""}`}
              disabled={state.phase !== "choose"} onClick={() => choose(i === 0)}>
              <span className="aIcon">{a.icon}</span>
              <b className="disp">{t[a.id]}</b>
              <span className="aDesc">{t[`${a.id}D`]}</span>
              <span className="aChance">{t.chance} {Math.round(chances[i])}%</span>
              {isWeak && <span className="weakTag">★ {t.weakBonus}</span>}
            </button>
          );
        })}
        <button className={`actBtn ult ${canUlt ? "ready" : ""}`}
          disabled={state.phase !== "choose" || !canUlt} onClick={useUlt}>
          <span className="aIcon">{city.ult.icon}</span>
          <b className="disp">{t[city.ult.id]}</b>
          <span className="aDesc">{t.ultD}</span>
          <span className="aChance">🪙 {ULT_COST} {t.credits}</span>
          {!canUlt && <span className="weakTag lockTagSm">🔒 {t.noCredits}</span>}
        </button>
      </div>

      <div className="rowBtns narrow">
        <button className="btn" onClick={onQuit} disabled={state.phase === "spin"}>{t.back}</button>
      </div>
    </div>
  );
}

/* ------------------------------- רכיבי עזר -------------------------------- */

function GearRow({ t, it }) {
  const R = rarOf(it.rar);
  return (
    <div className="gearRow" style={{ "--rc": R.color }}>
      <span className="gIcon">{it.icon}</span>
      <div className="gBody">
        <b style={{ color: R.color }}>{t[it.base]} <em>{t[it.rar]}</em></b>
        <span className="gStats">
          {Object.entries(it.stats).map(([k, v]) => `+${v} ${t[k]}`).join(" · ")}
        </span>
      </div>
    </div>
  );
}

function StatPanel({ t, cls, stats, base, ovr, age, equipped, injuries, onShop, onBag, bagCount }) {
  const g = equipped ? gearBonus(equipped) : null;
  return (
    <aside className="statPanel">
      <div className="ovrBox">
        <OvrRing value={ovr} max={OVR_MAX} />
        <div>
          <div className="ovrLabel">{t.ovr}</div>
          <div className="ovrSub">{t.ovrShort} · 1–{OVR_MAX}</div>
        </div>
        {age != null && <div className="ageBox"><b>{age}</b><span>{t.age}</span></div>}
      </div>

      <div className="charLine">
        <span className="cIcon">{cls.icon}</span>
        <div>
          <div className="disp cName">{t[cls.id]}</div>
          <div className="muted">{age != null ? `${t[agePhase(age)]} · ×${ageMult(age)}` : `${t.level} 1`}</div>
        </div>
      </div>

      <h3 className="sectionLabel">{t.statsTitle}</h3>
      {STATS.map((k) => {
        const isFocus = cls.focus.includes(k);
        const bonus = g ? g[k] : 0;
        return (
          <div className={`statRow ${isFocus ? "focus" : ""}`} key={k}>
            <div className="statTop">
              <span>{t[k]}{isFocus && <i className="star">✦</i>}</span>
              <b>{stats[k]}{bonus > 0 && <i className="gBonus">+{bonus}</i>}
                <em> {t.ofMax} {STAT_MAX}</em></b>
            </div>
            <div className="statBar"><i style={{ width: `${Math.max(1.2, (stats[k] / STAT_MAX) * 100)}%` }} /></div>
          </div>
        );
      })}

      {equipped && (
        <>
          <h3 className="sectionLabel">{t.gearTitle}</h3>
          {GEAR_SLOTS.map((s) => (
            <div className="slotRow" key={s}>
              <span className="slotName">{t[`slot${s[0].toUpperCase()}${s.slice(1)}`]}</span>
              {equipped[s]
                ? <span className="slotItem" style={{ color: rarOf(equipped[s].rar).color }}>
                    {equipped[s].icon} {t[equipped[s].base]}
                  </span>
                : <span className="slotEmpty">—</span>}
            </div>
          ))}
          <div className="panelBtns">
            <button className="btn small" onClick={onShop}>🏪 {t.shop}</button>
            <button className="btn small" onClick={onBag}>🎒 {t.bag}{bagCount > 0 ? ` (${bagCount})` : ""}</button>
          </div>
        </>
      )}

      {injuries && (
        <>
          <h3 className="sectionLabel">{t.injuries}</h3>
          {injuries.length === 0 && <p className="muted">{t.healthy}</p>}
          {injuries.map((i) => (
            <div className="injRow" key={i.id}>
              <span>🩸 {t[i.stat]} −{Math.round(i.pct * 100)}%</span>
              <span className="injTil">{t.injuredBy} {i.until}</span>
            </div>
          ))}
        </>
      )}

      <div className="focusNote">{t.focus}: {cls.focus.map((f) => t[f]).join(" · ")}</div>
    </aside>
  );
}

function Allocator({ t, stats, alloc, setAlloc, left, onAuto }) {
  const bump = (k, dir, step) => {
    setAlloc((A) => {
      const room = STAT_MAX - stats[k] - A[k];
      const d = dir > 0 ? Math.min(step, left, room) : -Math.min(step, A[k]);
      return { ...A, [k]: A[k] + d };
    });
  };
  return (
    <div className="allocBox">
      <div className="allocTop">
        <span>{t.remaining} <b className={left === 0 ? "ok" : ""}>{left}</b></span>
        <button className="btn small" onClick={onAuto}>{t.autoAlloc}</button>
      </div>
      {STATS.map((k) => {
        const full = stats[k] + alloc[k] >= STAT_MAX;
        return (
          <div className="allocRow" key={k}>
            <span className="aName">{t[k]}{full && <i className="fullTag">{t.maxed}</i>}</span>
            <span className="aVal">{stats[k]}{alloc[k] > 0 && <em>+{alloc[k]}</em>}</span>
            <span className="aBtns">
              <button className="ten minus" onClick={() => bump(k, -1, 10)} disabled={alloc[k] <= 0}>−10</button>
              <button onClick={() => bump(k, -1, 1)} disabled={alloc[k] <= 0}>−</button>
              <button onClick={() => bump(k, 1, 1)} disabled={left <= 0 || full}>+</button>
              <button className="ten plus" onClick={() => bump(k, 1, 10)} disabled={left <= 0 || full}>+10</button>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Summary({ t, stats, ovr, age, wins }) {
  return (
    <div className="summary">
      <div className="sumRow"><span>{t.finalOvr}</span><b>{ovr}</b></div>
      <div className="sumRow"><span>{t.age}</span><b>{age}</b></div>
      <div className="sumRow"><span>{t.fightsWon}</span><b>{wins}</b></div>
      {STATS.map((k) => (
        <div className="sumRow small" key={k}><span>{t[k]}</span><b>{stats[k]}</b></div>
      ))}
    </div>
  );
}

function AgeTrack({ age }) {
  const span = RETIRE_AGE - START_AGE;
  return (
    <div className="ageTrack">
      {Array.from({ length: span + 1 }, (_, i) => START_AGE + i).map((a) => (
        <span key={a}
          className={`tick ${a === age ? "now" : ""} ${a < age ? "past" : ""} ${a % 5 === 0 ? "major" : ""}`}>
          {a % 5 === 0 && <em>{a}</em>}
        </span>
      ))}
    </div>
  );
}

function OvrRing({ value, max }) {
  const r = 30, c = 2 * Math.PI * r;
  return (
    <svg width="76" height="76" viewBox="0 0 76 76">
      <circle cx="38" cy="38" r={r} fill="none" stroke="var(--field)" strokeWidth="5" />
      <circle cx="38" cy="38" r={r} fill="none" stroke="var(--accent)" strokeWidth="5"
        strokeLinecap="round" strokeDasharray={`${c * Math.min(1, value / max)} ${c}`}
        transform="rotate(-90 38 38)" />
      <text x="38" y="44" textAnchor="middle" className="ringN">{value}</text>
    </svg>
  );
}

function Modal({ title, children, onClose, close }) {
  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="disp">{title}</h2>
        {children}
        {onClose && <button className="btn full" style={{ marginTop: 14 }} onClick={onClose}>{close}</button>}
      </div>
    </div>
  );
}

function Seg({ label, opts, val, set }) {
  return (
    <div className="setRow"><span>{label}</span>
      <div className="seg">
        {opts.map(([v, l]) => (
          <button key={String(v)} className={val === v ? "on" : ""} onClick={() => set(v)}>{l}</button>
        ))}
      </div>
    </div>
  );
}

function Gear() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
    </svg>
  );
}

/* --------------------------------- עיצוב ---------------------------------- */

function Style() {
  return (
    <style>{`
@import url('https://fonts.googleapis.com/css2?family=Rubik:wght@500;600;700;800&family=Assistant:wght@300;400;600;700&display=swap');

.ws{font-family:'Assistant',system-ui,sans-serif;min-height:100vh;padding:20px 20px 88px;
  box-sizing:border-box;background:var(--bg);color:var(--ink);transition:background .4s,color .4s}
.ws.light{--bg:#F2ECE0;--card:#FCF9F3;--field:#EBE4D6;--ink:#3B342A;--ink2:#7C7466;--ink3:#A49C8D;
  --rule:#E2DACB;--accent:#9C4E34;--gold:#A98442;--good:#5E8353;
  --shadow:rgba(60,52,40,.10);--shadowStrong:rgba(60,52,40,.16);
  --edge:rgba(255,255,255,.8);--sep:rgba(124,116,102,.14);--glass:rgba(252,249,243,.80)}
.ws.dark{--bg:#191B1E;--card:#23262A;--field:#2C3035;--ink:#ECEBE7;--ink2:#A6A7A5;--ink3:#7B7D7C;
  --rule:#343840;--accent:#C4634A;--gold:#C9A063;--good:#7FA277;
  --shadow:rgba(0,0,0,.30);--shadowStrong:rgba(0,0,0,.46);
  --edge:rgba(255,255,255,.06);--sep:rgba(170,172,172,.14);--glass:rgba(35,38,42,.78)}
.ws *{box-sizing:border-box}
@media(prefers-reduced-motion:reduce){.ws *{animation:none!important;transition:none!important}}
.disp{font-family:'Rubik',Arial,system-ui,sans-serif;letter-spacing:-.01em}
.ws button{font-family:inherit;cursor:pointer}
.ws button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.muted{color:var(--ink3);font-size:13px;line-height:1.6;margin:0}
.star{font-style:normal;color:var(--gold);font-size:10px;margin-inline-start:5px}

.home{max-width:560px;margin:0 auto;padding:6vh 10px;text-align:center}
.homeArt{display:flex;justify-content:center;margin:0 0 10px;animation:rise .8s ease both}
.logoFull{width:min(420px,86vw);height:auto;filter:drop-shadow(0 10px 24px rgba(30,16,8,.34))}
.logoMark{height:40px;width:auto;filter:drop-shadow(0 2px 5px rgba(30,16,8,.3))}
.homeTag{color:var(--ink2);font-size:15.5px;line-height:1.65;margin:14px auto 0;max-width:32ch;
  animation:rise .8s .2s ease both}
.legacyLine{margin-top:12px;font-size:13px;color:var(--gold)}
.homeBtns{display:flex;flex-direction:column;gap:10px;max-width:290px;margin:28px auto 0;
  animation:rise .8s .3s ease both}
.homeNote{margin-top:18px;font-size:12px}
.hall{margin-top:26px;text-align:start;background:var(--glass);border:none;
  border-radius:24px;padding:18px;box-shadow:0 1px 2px var(--shadow),0 10px 30px var(--shadow),inset 0 1px 0 var(--edge)}
.hall h3{font-size:14px;margin:0 0 8px}
.hallRow{display:flex;align-items:center;gap:10px;font-size:13px;padding:5px 0;
  border-bottom:1px solid var(--sep)}
.hallRow:last-child{border-bottom:none}
.hallRow b{flex:1;color:var(--ink)}
.hallOvr{color:var(--gold);font-variant-numeric:tabular-nums;font-size:12px}
@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}

.btn{border:none;background:var(--field);color:var(--ink);border-radius:999px;
  box-shadow:0 1px 2px var(--shadow),inset 0 1px 0 var(--edge);
  padding:11px 16px;font-size:13.5px;display:inline-flex;align-items:center;justify-content:center;
  gap:9px;transition:border-color .15s,background .15s}
.btn:hover:not(:disabled){background:var(--card);transform:translateY(-1px);
  box-shadow:0 2px 4px var(--shadow),0 10px 24px var(--shadow),inset 0 1px 0 var(--edge)}
.btn:active:not(:disabled){transform:translateY(0) scale(.985)}
.btn:disabled{opacity:.38;cursor:not-allowed}
.btn.big{padding:13px 26px;font-size:14.5px}
.btn.small{padding:6px 12px;font-size:12px}
.btn.full{display:flex;width:100%;margin-top:8px}
.btn.primary{background:var(--accent);border-color:var(--accent);color:#FCF9F3;font-weight:600}
.btn.primary:hover:not(:disabled){background:var(--accent);filter:brightness(1.08)}
.ageBtn{flex-direction:column;align-items:flex-start;gap:3px;padding:13px 16px}
.ageBtn b{font-size:15px}.ageBtn span{font-size:12px;color:var(--ink3)}

.brandBar{position:fixed;inset-inline:0;inset-block-end:0;z-index:40;display:flex;align-items:center;
  justify-content:space-between;gap:16px;padding:10px 22px;background:var(--glass);border:none;
  backdrop-filter:blur(20px) saturate(160%);-webkit-backdrop-filter:blur(20px) saturate(160%);
  box-shadow:0 -1px 0 var(--sep),0 -8px 24px var(--shadow)}
.barRight{display:flex;align-items:center;gap:12px}
.goldPill{font-size:13px;color:var(--gold);font-variant-numeric:tabular-nums}
.barBtn{display:inline-flex;align-items:center;gap:8px;border:none;background:var(--field);
  box-shadow:inset 0 1px 0 var(--edge);
  color:var(--ink2);border-radius:999px;padding:9px 16px;font-size:12.5px}
.barBtn:hover{border-color:var(--accent);color:var(--ink)}
@media(max-width:520px){.brandBar{padding:7px 14px}.logoMark{height:32px}.barBtn span{display:none}}

.wrap{max-width:1060px;margin:0 auto}
.top{padding-bottom:14px;border-bottom:1px solid var(--sep)}
.pageTitle{font-size:26px;font-weight:700;margin:0 0 4px}
.weakHint{font-style:normal;color:var(--ink3);font-size:12px}
.cols{display:grid;grid-template-columns:1fr 290px;gap:22px;margin-top:22px;align-items:start}
.cols>.statPanel{order:2}.cols>.mainCol{order:1}
@media(max-width:780px){.cols{grid-template-columns:1fr}}
.rowBtns{display:flex;gap:10px;margin-top:22px;flex-wrap:wrap}
.rowBtns .btn{flex:1;min-width:130px}
.rowBtns.narrow{max-width:260px}
.rowBtnsTight{display:flex;gap:6px}

.statPanel{background:var(--glass);border:none;border-radius:26px;padding:22px;
  box-shadow:0 1px 2px var(--shadow),0 10px 30px var(--shadow),inset 0 1px 0 var(--edge)}
.ovrBox{display:flex;align-items:center;gap:14px;padding-bottom:14px;border-bottom:1px solid var(--sep)}
.ringN{font-family:'Rubik',Arial,sans-serif;font-size:22px;font-weight:700;fill:var(--ink)}
.ovrLabel{font-family:'Rubik',Arial,sans-serif;font-size:16px;font-weight:700}
.ovrSub{font-size:11.5px;color:var(--ink3);margin-top:2px}
.ageBox{margin-inline-start:auto;text-align:center}
.ageBox b{display:block;font-family:'Rubik',Arial,sans-serif;font-size:24px;color:var(--gold)}
.ageBox span{font-size:11px;color:var(--ink3)}
.charLine{display:flex;align-items:center;gap:11px;padding:14px 0;border-bottom:1px solid var(--sep)}
.cIcon{font-size:30px;line-height:1}
.cName{font-size:17px;font-weight:700}
.sectionLabel{font-family:'Rubik',Arial,sans-serif;font-size:11.5px;font-weight:600;
  margin:20px 0 10px;color:var(--ink3);letter-spacing:.06em;text-transform:uppercase}
.statRow{margin-bottom:11px}
.statTop{display:flex;justify-content:space-between;align-items:baseline;font-size:13px;color:var(--ink2)}
.statTop b{color:var(--ink);font-variant-numeric:tabular-nums;font-size:14px}
.statTop b em{font-style:normal;color:var(--ink3);font-size:10.5px;font-weight:400}
.gBonus{font-style:normal;color:var(--good);font-size:11px;margin-inline-start:4px}
.statBar{height:5px;background:var(--field);border-radius:999px;overflow:hidden;margin-top:6px}
.statBar i{display:block;height:100%;background:var(--ink3);transition:width .45s ease}
.statRow.focus .statBar i{background:var(--accent)}
.statRow.focus .statTop{color:var(--ink)}
.slotRow{display:flex;justify-content:space-between;font-size:12.5px;padding:5px 0;
  border-bottom:1px solid var(--sep);color:var(--ink2)}
.slotItem{font-weight:600}.slotEmpty{color:var(--ink3)}
.panelBtns{display:flex;gap:8px;margin-top:10px}
.panelBtns .btn{flex:1}
.injRow{display:flex;justify-content:space-between;font-size:12.5px;padding:4px 0;color:var(--accent)}
.injTil{color:var(--ink3)}
.focusNote{margin-top:14px;padding-top:12px;border-top:1px solid var(--sep);font-size:12px;color:var(--ink3)}

.chars{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:18px}
.charWrap{perspective:1100px}
.charCard{position:relative;width:100%;height:318px;padding:0;background:transparent;border:none}
.flipper{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .52s cubic-bezier(.3,.75,.3,1)}
.charCard.flipped .flipper{transform:rotateY(180deg)}
.face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;
  background:var(--glass);border:none;border-radius:26px;display:flex;
  flex-direction:column;align-items:center;gap:8px;padding:24px 16px;color:var(--ink2);
  box-shadow:0 1px 2px var(--shadow),0 10px 30px var(--shadow),inset 0 1px 0 var(--edge);
  transition:border-color .18s,box-shadow .18s}
.face.front{justify-content:center}
.face.back{transform:rotateY(180deg);justify-content:flex-start;padding:18px 16px}
.charCard.on .face{box-shadow:0 0 0 2px var(--accent),0 2px 6px var(--shadow),
    0 14px 36px var(--shadow),inset 0 1px 0 var(--edge)}

.charImg{height:132px;width:auto;object-fit:contain;filter:drop-shadow(0 6px 14px rgba(30,16,8,.3))}
.face b.disp{font-size:19px;font-weight:700;color:var(--ink)}
.cDesc{font-size:12.5px;line-height:1.55;text-align:center}
.cOvr{margin-top:4px;font-size:11.5px;color:var(--ink2);background:var(--field);
  border-radius:999px;padding:4px 13px;font-variant-numeric:tabular-nums}
.charCard.on .cOvr{background:var(--accent);color:#FCF9F3}
.lockTag{position:absolute;inset-block-start:12px;inset-inline-start:12px;background:var(--accent);
  color:#FCF9F3;font-size:11px;padding:3px 10px;border-radius:20px;z-index:3}
.backHead{display:flex;align-items:center;gap:8px;width:100%;padding-bottom:9px;margin-bottom:5px;
  border-bottom:1px solid var(--sep)}
.popIcon{font-size:20px;line-height:1}
.backHead b.disp{font-size:16px;flex:1;text-align:start}
.popOvr{font-size:11.5px;color:var(--accent);font-variant-numeric:tabular-nums}
.popRow{display:flex;justify-content:space-between;align-items:center;width:100%;font-size:13px;
  color:var(--ink2);padding:6px 0;border-bottom:1px solid var(--sep)}
.popRow b{color:var(--ink);font-variant-numeric:tabular-nums;font-size:14px}
.popRow.focus{color:var(--ink)}.popRow.focus b{color:var(--accent)}
.backFoot{margin-top:auto;font-size:11.5px;color:var(--ink3);width:100%;text-align:start}
.hint{margin-top:14px;text-align:center}

.cities{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:20px;margin-top:24px}
.cityCard{position:relative;overflow:hidden;background:var(--glass);border:none;
  border-radius:30px;padding:20px;display:flex;flex-direction:column;align-items:center;
  gap:10px;text-align:center;color:var(--ink2);box-shadow:0 1px 2px var(--shadow),0 10px 30px var(--shadow),inset 0 1px 0 var(--edge);
  transition:transform .2s,border-color .2s,box-shadow .2s}
.cityCard:hover{transform:translateY(-5px);
  box-shadow:0 0 0 2px var(--city),0 18px 44px var(--cityGlow),inset 0 1px 0 var(--edge)}
.cityStrip{position:absolute;inset:0;overflow:hidden;display:flex;justify-content:space-around;pointer-events:none}
.cityStrip i{font-style:normal;font-size:15px;opacity:0;animation:drift 9s linear infinite}
.cityStrip{z-index:0}
@keyframes drift{0%{transform:translateY(-20px);opacity:0}12%{opacity:.5}82%{opacity:.5}
  100%{transform:translateY(420px);opacity:0}}
.cityArt{position:relative;width:100%;display:flex;align-items:center;justify-content:center;
  height:150px;margin-bottom:2px}
.cityArt img{max-width:100%;max-height:150px;width:auto;height:auto;object-fit:contain;
  filter:drop-shadow(0 8px 18px var(--cityGlow));transition:transform .25s ease}
.cityCard:hover .cityArt img{transform:scale(1.05)}
.cityName{font-size:21px;font-weight:700;color:var(--ink);position:relative}
.diffTag{font-size:11.5px;padding:3px 12px;border-radius:20px;border:1px solid var(--city);
  color:var(--city);position:relative;background:var(--card)}
.cityStory{font-size:12.5px;line-height:1.75;position:relative}
.cityEdge{font-size:11.5px;color:var(--ink3);font-variant-numeric:tabular-nums;position:relative}
.cityGo{margin-top:4px;width:100%;background:var(--city);color:#FCF9F3;font-weight:600;
  padding:12px 18px;border-radius:999px;font-size:13.5px;position:relative;
  box-shadow:0 4px 14px var(--cityGlow)}
.cityCard:hover .cityGo{filter:brightness(1.12)}

.ageTrack{display:flex;gap:3px;align-items:flex-end;height:36px;margin-bottom:20px}
.tick{flex:1;height:8px;background:var(--field);border-radius:999px;position:relative}
.tick.major{height:14px}.tick.past{background:var(--ink3)}
.tick.now{background:var(--accent);height:22px;box-shadow:0 0 0 2px var(--bg),0 0 0 3px var(--accent)}
.tick em{position:absolute;inset-block-end:-16px;inset-inline-start:50%;transform:translateX(50%);
  font-style:normal;font-size:10px;color:var(--ink3)}

.fights{display:grid;grid-template-columns:repeat(auto-fit,minmax(178px,1fr));gap:18px}
.fightCard{position:relative;background:var(--glass);border:none;border-radius:26px;
  box-shadow:0 1px 2px var(--shadow),0 10px 30px var(--shadow),inset 0 1px 0 var(--edge);
  padding:20px 14px;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;
  color:var(--ink2);transition:transform .18s,border-color .18s}
.fightCard:hover:not(:disabled){transform:translateY(-4px);
  box-shadow:0 0 0 2px var(--city,var(--accent)),0 16px 38px var(--shadow),inset 0 1px 0 var(--edge)}
.fightCard:disabled{opacity:.5;cursor:not-allowed}
.fIcon{font-size:38px;line-height:1}
.fightCard b{font-size:16px;color:var(--ink)}
.fDesc{font-size:12px;line-height:1.5}
.fGain{font-size:11.5px;color:var(--gold);font-variant-numeric:tabular-nums}
.fWeak{font-size:11px;color:var(--ink3)}
.fTag{position:absolute;inset-block-start:8px;inset-inline-start:8px;font-size:10.5px;
  background:var(--good);color:#FCF9F3;padding:2px 9px;border-radius:20px}
.fTag.lock{background:var(--ink3)}

.arena{display:grid;grid-template-columns:1fr auto 1fr;gap:16px;align-items:center;margin-top:22px;
  background:var(--glass);border:none;border-radius:30px;padding:28px 22px;
  box-shadow:0 1px 2px var(--shadow),0 10px 30px var(--shadow),inset 0 1px 0 var(--edge)}
@media(max-width:640px){.arena{grid-template-columns:1fr}}
.side{display:flex;flex-direction:column;align-items:center;gap:7px}
.foeIcon{font-size:54px;line-height:1;filter:drop-shadow(0 6px 14px var(--cityGlow))}
.hpbar{width:100%;max-width:220px;height:8px;background:var(--field);border-radius:999px;overflow:hidden}
.hpbar i{display:block;height:100%;transition:width .4s ease}
.hpbar.foe i{background:var(--city,var(--accent))}
.hpbar.me i{background:var(--good)}
.hpn{font-size:11.5px;color:var(--ink3);font-variant-numeric:tabular-nums}
.middle{min-width:124px;display:flex;flex-direction:column;align-items:center;gap:8px}
.spinLabel{font-size:12px;color:var(--ink3)}
.spinRow{display:flex;gap:10px;margin-top:8px}
.spinCell{width:50px;height:50px;border-radius:18px;border:none;background:var(--field);
  box-shadow:inset 0 1px 0 var(--edge);
  display:flex;align-items:center;justify-content:center;font-size:20px;color:var(--ink3);
  transition:transform .08s,background .08s}
.spinCell.lit{transform:scale(1.14)}
.spinCell.ok.lit{background:var(--good);color:#FCF9F3;border-color:var(--good)}
.spinCell.no.lit{background:var(--accent);color:#FCF9F3;border-color:var(--accent)}
.logRow{display:flex;flex-direction:column;gap:5px;align-items:center}
.chip{font-size:11.5px;padding:3px 10px;border-radius:20px;background:var(--field);color:var(--ink2)}
.chip.ok{color:var(--good)}.chip.bad{color:var(--accent)}
.chip.ult{color:var(--gold);font-weight:600}.chip.inj{color:var(--accent)}

.ultWrap{display:flex;align-items:center;gap:12px;margin-top:14px}
.ultLabel{font-size:12px;color:var(--ink3);flex:none}
.ultBar{flex:1;height:7px;background:var(--field);border-radius:999px;overflow:hidden}
.ultBar i{display:block;height:100%;background:linear-gradient(90deg,var(--gold),var(--accent));
  transition:width .4s ease}

.acts{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:16px}
@media(max-width:620px){.acts{grid-template-columns:1fr}}
.actBtn{position:relative;background:var(--glass);border:none;border-radius:24px;
  box-shadow:0 1px 2px var(--shadow),0 8px 22px var(--shadow),inset 0 1px 0 var(--edge);
  padding:18px 12px;display:flex;flex-direction:column;align-items:center;gap:5px;color:var(--ink2);
  transition:border-color .16s,transform .16s}
.actBtn:hover:not(:disabled){transform:translateY(-3px);
  box-shadow:0 0 0 2px var(--city,var(--accent)),0 14px 32px var(--shadow),inset 0 1px 0 var(--edge)}
.actBtn:disabled{opacity:.45;cursor:not-allowed}
.actBtn.weak{box-shadow:0 0 0 2px var(--gold),0 8px 22px var(--shadow),inset 0 1px 0 var(--edge)}
.aIcon{font-size:30px;line-height:1}
.actBtn b{font-size:17px;color:var(--ink)}
.aDesc{font-size:12px;line-height:1.5;text-align:center}
.aChance{font-size:12px;color:var(--gold);font-variant-numeric:tabular-nums}
.weakTag{position:absolute;inset-block-start:6px;inset-inline-start:6px;font-size:10px;
  color:var(--gold);background:var(--field);padding:2px 7px;border-radius:20px}
.actBtn.ult.ready{box-shadow:0 0 0 2px var(--gold),0 0 30px var(--cityGlow),inset 0 1px 0 var(--edge)}
.actBtn.ult.ready b{color:var(--gold)}

.rewardRow{display:flex;gap:10px;justify-content:center;margin-bottom:12px;flex-wrap:wrap}
.rw{font-size:13.5px;background:var(--field);border-radius:20px;padding:5px 14px;color:var(--ink)}
.dropBox{border:1px solid var(--gold);border-radius:16px;padding:12px;margin-bottom:12px}
.dropLabel{font-size:11.5px;color:var(--gold);margin-bottom:6px}
.gearRow{display:flex;gap:10px;align-items:center;flex:1}
.gIcon{font-size:26px;line-height:1}
.gBody{display:flex;flex-direction:column;gap:2px;min-width:0}
.gBody b{font-size:13.5px}
.gBody b em{font-style:normal;font-size:11px;opacity:.75}
.gStats{font-size:11.5px;color:var(--ink3)}
.shopRow{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--sep)}
.shopRow:last-of-type{border-bottom:none}

.encRes{font-size:14px;padding:14px;border-radius:16px;background:var(--field);text-align:center;margin:0 0 12px}
.encRes.good{color:var(--good)}.encRes.bad{color:var(--accent)}

.titleBox{text-align:center;padding:14px 0;border-block:1px solid var(--sep);margin:12px 0}
.titleLabel{font-size:11.5px;color:var(--ink3);display:block}
.titleName{font-size:26px;color:var(--gold);font-weight:800}
.legacyBox{margin-top:12px;padding-top:10px;border-top:1px solid var(--sep)}

.pts{color:var(--gold);font-size:20px;font-family:'Rubik',Arial,sans-serif}
.allocBox{margin-top:14px;border-top:1px solid var(--sep);padding-top:12px}
.allocTop{display:flex;justify-content:space-between;align-items:center;font-size:13px;
  color:var(--ink2);margin-bottom:10px}
.allocTop b{color:var(--accent);font-variant-numeric:tabular-nums}
.allocTop b.ok{color:var(--good)}
.allocRow{display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--sep);font-size:13px}
.aName{flex:1;color:var(--ink2)}
.fullTag{font-style:normal;font-size:10.5px;color:var(--gold);margin-inline-start:6px}
.aVal{font-variant-numeric:tabular-nums;color:var(--ink)}
.aVal em{font-style:normal;color:var(--good);margin-inline-start:5px}
.aBtns{display:flex;gap:5px}
.aBtns button{width:30px;height:30px;border:none;background:var(--field);
  color:var(--ink);border-radius:999px;font-size:15px;line-height:1;
  box-shadow:inset 0 1px 0 var(--edge)}
.aBtns button:disabled{opacity:.35;cursor:not-allowed}

.summary{margin-top:14px;border-top:1px solid var(--sep);padding-top:10px}
.sumRow{display:flex;justify-content:space-between;padding:5px 0;font-size:13.5px;color:var(--ink2)}
.sumRow b{color:var(--ink);font-variant-numeric:tabular-nums}
.sumRow.small{font-size:12.5px;color:var(--ink3)}

.scrim{position:fixed;inset:0;background:rgba(20,12,6,.62);display:flex;align-items:center;
  justify-content:center;padding:20px;z-index:60;animation:fade .18s ease both}
@keyframes fade{from{opacity:0}to{opacity:1}}
.modal{background:var(--glass);border:none;border-radius:30px;padding:26px;
  box-shadow:0 2px 6px var(--shadow),0 30px 70px var(--shadowStrong),inset 0 1px 0 var(--edge);
  width:100%;max-width:430px;max-height:88vh;overflow:auto;animation:rise .22s ease both}
.modal h2{font-size:19px;font-weight:700;margin:0 0 12px}
.setRow{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:11px 0;
  border-bottom:1px solid var(--sep);font-size:13px}
.seg{display:flex;background:var(--field);border-radius:999px;overflow:hidden;padding:3px;gap:2px}
.seg button{background:transparent;border:none;color:var(--ink2);padding:7px 13px;
  font-size:12px;border-radius:999px;transition:background .18s,color .18s}
.seg button.on{background:var(--accent);color:#FCF9F3}
.seg button:disabled{opacity:.35;cursor:not-allowed}

/* רקע האתר */
.bgLayer{position:fixed;inset:0;z-index:0;background-size:cover;background-position:center;
  background-repeat:no-repeat;transition:opacity .6s ease,filter .6s ease}
.bgLayer.hero{opacity:1;filter:none}
.bgLayer.quiet{opacity:.42;filter:blur(4px) saturate(.55)}
.ws.light .bgLayer.hero{opacity:.9}
.ws.light .bgLayer.quiet{opacity:.28;filter:blur(4px) saturate(.6)}
.bgScrim{position:fixed;inset:0;z-index:1;pointer-events:none}
.ws.dark .bgScrim{background:
  radial-gradient(ellipse 70% 60% at 50% 42%, rgba(16,18,20,.76), rgba(16,18,20,.4) 60%, transparent),
  linear-gradient(180deg, rgba(16,18,20,.6), rgba(16,18,20,.25) 35%, rgba(16,18,20,.85))}
.ws.light .bgScrim{background:
  radial-gradient(ellipse 70% 60% at 50% 42%, rgba(242,236,224,.88), rgba(242,236,224,.64) 60%, rgba(242,236,224,.44)),
  linear-gradient(180deg, rgba(242,236,224,.74), rgba(242,236,224,.48) 35%, rgba(242,236,224,.92))}
.stage{position:relative;z-index:2}
.statPanel,.arena,.fightCard,.cityCard,.actBtn,.face,.hall,.modal{
  backdrop-filter:blur(18px) saturate(150%);-webkit-backdrop-filter:blur(18px) saturate(150%)}
.brandBar{z-index:41}

/* ± בחלוקת הנקודות */
.aBtns{gap:4px}
.aBtns .ten{width:auto;padding:0 9px;font-size:11.5px;font-weight:600;font-variant-numeric:tabular-nums}
.aBtns .ten.plus{color:var(--good)}
.aBtns .ten.minus{color:var(--accent)}

/* שערי רמה */
.fLevel{font-size:11.5px;color:var(--good);font-variant-numeric:tabular-nums}
.fightCard.gated{opacity:.62}
.gateWrap{width:100%;margin-top:6px;display:flex;flex-direction:column;gap:5px;align-items:center}
.gateTag{font-size:11.5px;color:var(--ink3)}
.gateBar{width:80%;height:4px;background:var(--field);border-radius:999px;overflow:hidden}
.gateBar i{display:block;height:100%;background:var(--gold);transition:width .4s ease}
.attemptRow{display:flex;gap:7px;justify-content:center;margin:14px 0;font-size:20px}

/* מד המיקוד */
.ultWrap.full .ultBar i{box-shadow:0 0 14px var(--gold)}
.ultEdge{font-size:11.5px;color:var(--ink3);flex:none;font-variant-numeric:tabular-nums}
.ultWrap.full .ultEdge{color:var(--gold);font-weight:600}
.lockTagSm{inset-block-start:auto;inset-block-end:6px;inset-inline-start:6px}

/* חנות קרדיטים */
.creditPill{border:none;background:var(--field);color:var(--gold);border-radius:999px;
  padding:6px 13px;font-size:13px;font-variant-numeric:tabular-nums;
  box-shadow:inset 0 1px 0 var(--edge)}
.creditPill:hover{background:var(--card)}
.storeRow{display:flex;flex-direction:column;gap:10px}
.storeItem{display:flex;align-items:center;gap:14px;background:var(--glass);border-radius:20px;
  padding:16px 18px;box-shadow:0 1px 2px var(--shadow),0 8px 22px var(--shadow),inset 0 1px 0 var(--edge);
  backdrop-filter:blur(18px) saturate(150%)}
.storeItem>div{flex:1;display:flex;flex-direction:column;gap:2px}
.storeIcon{font-size:28px;line-height:1}
.storeItem b{font-size:15px;color:var(--ink)}
.storeDesc{font-size:12px;color:var(--ink3);line-height:1.5}
.storePrice{font-size:13px;color:var(--gold);font-variant-numeric:tabular-nums}

.packs{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px}
.pack{position:relative;background:var(--glass);border:none;border-radius:24px;padding:22px 14px 18px;
  display:flex;flex-direction:column;align-items:center;gap:4px;color:var(--ink2);
  box-shadow:0 1px 2px var(--shadow),0 10px 26px var(--shadow),inset 0 1px 0 var(--edge);
  backdrop-filter:blur(18px) saturate(150%);transition:transform .18s,box-shadow .18s}
.pack:hover{transform:translateY(-4px);
  box-shadow:0 0 0 2px var(--gold),0 16px 36px var(--shadow),inset 0 1px 0 var(--edge)}
.pack.best{box-shadow:0 0 0 2px var(--gold),0 12px 30px var(--shadow),inset 0 1px 0 var(--edge)}
.bestTag{position:absolute;inset-block-start:-9px;inset-inline-start:50%;transform:translateX(50%);
  background:var(--gold);color:#1b1b1b;font-size:10.5px;font-weight:700;padding:3px 11px;border-radius:999px}
.packIcon{font-size:24px;line-height:1}
.packN{font-size:22px;color:var(--ink);font-variant-numeric:tabular-nums}
.packLabel{font-size:11.5px;color:var(--ink3)}
.packBonus{font-size:11px;color:var(--good)}
.packPrice{margin-top:8px;background:var(--field);color:var(--ink);border-radius:999px;
  padding:7px 16px;font-size:13.5px;font-weight:600;font-variant-numeric:tabular-nums}
`}</style>
  );
}
