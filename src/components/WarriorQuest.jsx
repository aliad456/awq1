/* ============================================================================
   WarriorQuest.jsx — המסכים והחיבור ביניהם.

   כל השאר בתיקיית game/:
     config.js   — מספרים, מחלקות, ערים, ציוד
     text.js     — טקסטים
     rules.js    — חישובים ולוגיקה
     state.js    — מצב המשחק באובייקט אחד
     combat.jsx  — מסך הקרב
     ui.jsx      — רכיבי תצוגה
     styles.jsx  — עיצוב

   לשמירה למסד נתונים צריך רק את G:
     await supabase.from("saves").upsert({ user_id, state: G });
   ========================================================================== */

import React, { useState, useEffect, useMemo } from "react";

import {
  LOGO_FULL, LOGO_MARK, BG_MAIN,
  STAT_MAX, OVR_MAX, STATS, START_AGE, RETIRE_AGE,
  TIER_GATE, TIER_LEVELS, MAX_ATTEMPTS,
  ULT_COST, HEAL_COST, CREDIT_PACKS, NOADS_ILS,
  CLASSES, CITIES, cityById, ENCOUNTERS,
} from "./game/config";
import { T } from "./game/text";
import {
  clamp, pick, ageMult, agePhase, effStats, ovrOf, seesWeakness,
  gainFor, goldFor, refStat, foeHpOf, rollGear, prestigeOf, titleFor,
} from "./game/rules";
import { INITIAL_STATE, resetCareer } from "./game/state";
import { Fight } from "./game/combat";
import { GearRow, StatPanel, Allocator, Summary, AgeTrack, Modal, Seg, Gear } from "./game/ui";
import { Style } from "./game/styles";

/* ================================ קומפוננטה =============================== */

export default function WarriorQuest() {
  const t = T.he;

  /* ---- מצב המשחק: אובייקט אחד, שמור-לשרת-מוכן ---- */
  const [G, setG] = useState(INITIAL_STATE);

  /* גשר תאימות: כל שדה נראה כמו useState רגיל, אבל יושב בתוך G.
     כך כל הקוד למטה נשאר קריא, והשמירה עדיין נוגעת באובייקט אחד. */
  const field = (key) => [
    G[key],
    (v) => setG((p) => ({ ...p, [key]: typeof v === "function" ? v(p[key]) : v })),
  ];

  const [themeMode, setThemeMode] = field("themeMode");
  const [legacy, setLegacy] = field("legacy");
  const [hall, setHall] = field("hall");
  const [credits, setCredits] = field("credits");
  const [noAds, setNoAds] = field("noAds");
  const [selected, setSelected] = field("selected");
  const [cityId, setCityId] = field("cityId");
  const [base, setBase] = field("base");
  const [age, setAge] = field("age");
  const [level, setLevel] = field("level");
  const [attempts, setAttempts] = field("attempts");
  const [cleared, setCleared] = field("cleared");
  const [wins, setWins] = field("wins");
  const [gold, setGold] = field("gold");
  const [equipped, setEquipped] = field("equipped");
  const [bag, setBag] = field("bag");
  const [stock, setStock] = field("stock");
  const [injuries, setInjuries] = field("injuries");
  const [fight, setFight] = field("fight");
  const [pending, setPending] = field("pending");
  const [alloc, setAlloc] = field("alloc");
  const [reward, setReward] = field("reward");
  const [enc, setEnc] = field("enc");
  const [encRes, setEncRes] = field("encRes");

  /* מצב תצוגה בלבד — לא נשמר */
  const [sysDark, setSysDark] = useState(false);
  const [view, setView] = useState("home");
  const [modal, setModal] = useState(null);
  const [preview, setPreview] = useState(null);
  const [suppress, setSuppress] = useState(null);

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
    setG((p) => resetCareer(p));
    setView("home"); setModal(null); setPreview(null); setSuppress(null);
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
