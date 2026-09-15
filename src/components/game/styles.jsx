/* ============================================================================
   styles.jsx — כל העיצוב.
   שינוי צבעים? המשתנים בראש .ws.light ו-.ws.dark שולטים בכל המשחק.
   ========================================================================== */

import React from "react";

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

export { Style };
