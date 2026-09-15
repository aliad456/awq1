/* ============================================================================
   rules.js — כל הלוגיקה והחישובים.

   כשתחבר מסד נתונים: הפונקציות chanceOf, gainFor, rollGear ותוצאות הקרב
   חייבות לעבור לצד שרת. הן קובעות הכל, ובדפדפן אפשר לרמות בהן.
   ========================================================================== */

import {
  STAT_MAX, OVR_MAX, STATS, START_AGE,
  GEAR, GEAR_SLOTS, RARITY, rarOf,
} from "./config";

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

export {
  clamp, pick, ageMult, agePhase, gearBonus, effStats, ovrOf,
  seesWeakness, chanceOf, gainFor, goldFor, refStat, hitFrac, foeFrac,
  foeHpOf, rollGear, prestigeOf, titleFor,
};
