/* ============================================================================
   combat.jsx — מסך הקרב והרולטה.
   ========================================================================== */

import React, { useEffect, useRef } from "react";
import { ULT_COST, ULT_FULL_BONUS, STATS } from "./config";
import { clamp, chanceOf, seesWeakness, hitFrac, foeFrac } from "./rules";

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

export { Fight };
