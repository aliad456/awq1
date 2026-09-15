/* ============================================================================
   ui.jsx — רכיבי תצוגה. אין כאן לוגיקת משחק, רק הצגה.
   ========================================================================== */

import React from "react";
import { STAT_MAX, OVR_MAX, STATS, RETIRE_AGE, START_AGE, GEAR_SLOTS, rarOf } from "./config";
import { agePhase, ageMult, gearBonus } from "./rules";

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

export { GearRow, StatPanel, Allocator, Summary, AgeTrack, OvrRing, Modal, Seg, Gear };
