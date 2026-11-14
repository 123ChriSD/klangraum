/* =====================================================================================
   v72 (Teil 1): DIE MUSIK LÄUFT WEITER – Wechsel zwischen den Bereichen mitten im Stück
   Live-Fläche öffnen und schließen hält die Musik nicht mehr an. Lief vorher ein Song, läuft er danach an derselben Stelle weiter.
   ===================================================================================== */
Live70.open = function () {
  if (!Engine.ctx) { UI.toast("Erst „Eintauchen“ – dann ist der Ton an"); return; }
  if (Song.rec) { UI.toast("Dein Song wird gerade aufgenommen – danach geht es auf die Live-Fläche", 2600); return; }
  if (!this.forms().length) { UI.toastAct("Die Live-Fläche spielt mit den Loops deines Stücks. Lass dir zuerst einen Song bauen – dann formst du ihn mit einem Finger.", "Song bauen", () => SongGen.open(), 5200); return; }
  if (Engine.ctx.state !== "running") Engine.ctx.resume();
  const run = Transport.running, song = !!Song.playing; this.back = { run: run && (song || Forms.list.some(f => Loops.count(f) > 0 && !f.lpOff)), song, sec: song ? Math.max(0, Song.cur | 0) : -1 };
  try { if (Einsp.on) Einsp.close(); if (Schrift.on) Schrift.close(); UI.hideSheets(); if (Erkl.on) Erkl.stop(); } catch (_) {}
  try { if (Song.playing) Song.stop(true); SongUI.prep(); } catch (e) { console.warn(e); }          // der Takt läuft weiter, nur der Ablauf pausiert
  Wucht.wire(); this.L = this.layers(); this.on = true; this.touched = false; this.rings = []; this.hold = {}; this.x = 1; this.y = 0.62; document.body.classList.add("klv70");
  const e = this.el(); e.hidden = false; this.render(); this.size(); this.apply(true);
  try { if (!Transport.running) Transport.start(); LoopCtl.release(); } catch (err) { console.warn(err); }
  cancelAnimationFrame(this.raf); const loop = () => { if (!this.on) return; this.draw(); this.raf = requestAnimationFrame(loop); }; this.raf = requestAnimationFrame(loop);
};
// keep === true: Wechsel in einen anderen Bereich – die Musik läuft in jedem Fall weiter
Live70.close = function (keep) {
  if (!this.on) return; this.on = false; cancelAnimationFrame(this.raf); this.pid = null;
  try { Wucht.filter(null); Wucht.echo(false); Wucht.cut(false); } catch (_) {}
  const rec = this.recBy && Rec.on, b = this.back || {}, cont = !rec && (keep === true || !!b.run); this.recBy = false; this.back = null;
  try { SongUI.clearG(); if (!cont) { if (Transport.running) Transport.stop(); } else if (b.song || (keep === true && Nav67.songPiece())) SongUI.play(b.sec >= 0 ? b.sec : Einsp.fullest()); } catch (e) { console.warn(e); }
  document.body.classList.remove("klv70"); const e = $("lv70"); if (e) e.hidden = true;
  if (rec) { try { Rec.stop(); } catch (err) { console.warn(err); } }
  try { UI.refresh(); if (UI.tab === "song") SongUI.render(true); else if (UI.tab === "mix") MixUI.render(true); else if (UI.tab === "start") Home67.render(true); } catch (_) {}
};

/* =====================================================================================
   v72: BEWEGUNG – Lage- und Beschleunigungssensoren des Geräts formen den Klang (zuschaltbar)
   – links/rechts kippen: dumpf ↔ hell (Tiefpass / Hochpass über der ganzen Musik)
   – nach vorn kippen:    Echo im Takt
   – schütteln:           Stotter (die Musik setzt für einen Wimpernschlag aus)
   – in der Live-Fläche rollt der Punkt wie eine Kugel: kippen = Klang und Band
   Aus, bis man es einschaltet. Die Mitte ist die Haltung beim Einschalten.
   ===================================================================================== */
I67.kipp = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7.5" y="3" width="9" height="18" rx="2.2" transform="rotate(-18 12 12)"/><path d="M3 8.5c.6-2 1.9-3.6 3.6-4.6M21 15.500c-.6 2-1.900 3.600-3.600 4.600"/></svg>';
// Wucht-Kette: Hochpass für „hell/dünn“ und stufenloses Echo
Wucht.hpNode = function () { const N = this.n; if (!N) return null; if (!N.hp) { const b = Engine.ctx.createBiquadFilter(); b.type = "highpass"; b.frequency.value = 20; b.Q.value = 0; try { N.lp.disconnect(N.lo); N.lp.connect(b).connect(N.lo); N.hp = b; } catch (e) { console.warn(e); try { N.lp.connect(N.lo); } catch (_) {} return null; } } return N.hp; };
// v: −1 (ganz links, dumpf) … 0 (unverändert) … +1 (ganz rechts, hell und dünn)
Wucht.tilt = function (v) { const N = this.n; if (!N) return; const t = Engine.ctx.currentTime; this.filter(v < -0.02 ? 0.97 - 0.72 * Math.min(1, -v) : null); const hp = this.hpNode(); if (hp) { const u = clamp(v, 0, 1); hp.frequency.setTargetAtTime(20 * Math.pow(70, u), t, 0.04); hp.Q.setTargetAtTime(6 * u, t, 0.04); } };
Wucht.echoAmt = function (a) { const N = this.n; if (!N) return; const t = Engine.ctx.currentTime; a = clamp(a, 0, 1); if (a > 0) N.dl.delayTime.setTargetAtTime(clamp(Transport.spb * 3, 0.06, 1.9), t, 0.01); N.es.gain.setTargetAtTime(0.7 * a, t, 0.05); };

const Beweg = {
  on: false, lr: 0, fb: 0, zero: null, got: 0, nShake: 0, lastShake: 0, g: [0, 0, 0], dirty: false,
  RANGE: 35, DEAD: 4, SHAKE: 13,
  // Bildschirm gedreht? Dann tauschen die Achsen.
  axes(beta, gamma, ang) { const a = ang != null ? ang : ((screen.orientation && screen.orientation.angle) ?? window.orientation ?? 0), k = ((Math.round(a / 90) % 4) + 4) % 4; return k === 1 ? [beta, gamma] : k === 2 ? [-gamma, beta] : k === 3 ? [-beta, -gamma] : [gamma, -beta]; },   // [links/rechts, vor/zurück] – vor = obere Kante weg vom Körper
  norm(d) { const a = Math.abs(d); return a <= this.DEAD ? 0 : Math.sign(d) * Math.min(1, (a - this.DEAD) / (this.RANGE - this.DEAD)); },
  feed(beta, gamma, ang) {
    if (beta == null || gamma == null || !isFinite(beta) || !isFinite(gamma)) return; const [l, f] = this.axes(beta, gamma, ang); this.got++; if (!this.zero) this.zero = [l, f];
    const w = d => ((d + 540) % 360) - 180, tl = this.norm(w(l - this.zero[0])), tf = this.norm(w(f - this.zero[1])), k = this.got < 3 ? 1 : 0.25; this.lr += (tl - this.lr) * k; this.fb += (tf - this.fb) * k; this.dirty = true;
  },
  center() { this.zero = null; this.lr = 0; this.fb = 0; this.got = Math.min(this.got, 1); this.dirty = true; Hap(8); UI.toast("Mitte neu gesetzt – so, wie du das Gerät jetzt hältst", 2000); },
  shake(m, now) { if (!(m >= this.SHAKE) || now - this.lastShake < 170) return false; this.lastShake = now; this.nShake++;
    try { Wucht.cut(true); setTimeout(() => { if (!(Live70.on && Live70.hold.cut)) Wucht.cut(false); }, 110); if (Live70.on) Live70.rings.push({ t: performance.now(), s: 1.3 }); Hap(10); } catch (_) {} return true; },
  motion(e) { let m; const a = e.acceleration; if (a && a.x != null) m = Math.hypot(a.x, a.y || 0, a.z || 0); else { const q = e.accelerationIncludingGravity; if (!q || q.x == null) return; const v = [q.x, q.y || 0, q.z || 0]; if (!this.gi) { this.g = v.slice(); this.gi = true; } for (let i = 0; i < 3; i++) this.g[i] += (v[i] - this.g[i]) * 0.1; m = Math.hypot(v[0] - this.g[0], v[1] - this.g[1], v[2] - this.g[2]); } this.shake(m, performance.now()); },
  apply() {
    if (!this.dirty) return; this.dirty = false;
    try { if (Live70.on) { if (Live70.pid == null) { Live70.set(0.5 + this.lr * 0.5, 0.5 + this.fb * 0.5); const h = $("lvHint"); if (h) h.classList.add("q7gone"); } }
      else { Wucht.tilt(this.lr); Wucht.echoAmt(Math.max(0, this.fb)); } } catch (e) { console.warn(e); }
    this.paint();
  },
  say() { const l = this.lr, f = this.fb; return (l < -0.05 ? "dumpfer" : l > 0.05 ? "heller" : "Klang unverändert") + (f > 0.05 ? " · Echo" : ""); },
  paint() { document.querySelectorAll(".b72lev").forEach(e => { e.classList.toggle("q7on", this.on); const i = e.firstElementChild; if (i) i.style.transform = `translate(${(this.on ? this.lr : 0) * 13}px,${(this.on ? -this.fb : 0) * 13}px)`; });
    document.querySelectorAll("[data-bw='tog']").forEach(b => { if (b.getAttribute("aria-pressed") !== String(this.on)) { b.setAttribute("aria-pressed", this.on); b.setAttribute("aria-checked", this.on); } });
    const s = $("bwSay"); if (s) s.textContent = this.on ? (Live70.on ? "steuert die Live-Fläche" : this.say()) : "aus"; },
  async start() {
    if (this.on) return true;
    if (!Engine.ctx) { UI.toast("Erst „Eintauchen“ – dann ist der Ton an"); return false; }
    if (typeof DeviceOrientationEvent === "undefined") { UI.toast("Dieses Gerät hat keine Bewegungssensoren, die der Browser nutzen darf.", 3200); return false; }
    try { for (const C of [typeof DeviceOrientationEvent !== "undefined" ? DeviceOrientationEvent : null, typeof DeviceMotionEvent !== "undefined" ? DeviceMotionEvent : null]) if (C && typeof C.requestPermission === "function") { const r = await C.requestPermission(); if (r !== "granted") { UI.toast("Ohne deine Erlaubnis bleiben die Bewegungssensoren aus. Du kannst sie in den Einstellungen des Browsers für diese Seite erlauben.", 4600); return false; } } }
    catch (e) { console.warn(e); UI.toast("Die Bewegungssensoren ließen sich nicht einschalten.", 3000); return false; }
    Wucht.wire(); this.on = true; this.zero = null; this.got = 0; this.lr = 0; this.fb = 0; this.gi = false; this.nShake = 0;
    this._o = e => this.feed(e.beta, e.gamma); this._m = e => this.motion(e); addEventListener("deviceorientation", this._o); addEventListener("devicemotion", this._m);
    const loop = () => { if (!this.on) return; this.apply(); this.raf = requestAnimationFrame(loop); }; this.raf = requestAnimationFrame(loop);
    clearTimeout(this.chk); this.chk = setTimeout(() => { if (this.on && !this.got) { this.stop(); UI.toast("Hier kommen keine Bewegungsdaten an. Auf dem Handy oder Tablet klappt es über die Website oder die heruntergeladene Datei; in eingebetteten Ansichten sind die Sensoren oft gesperrt.", 6000); } }, 1800);
    Hap(10); UI.toast(Live70.on ? "Bewegung an: Kipp das Gerät – der Punkt rollt mit. Schütteln = Stotter." : "Bewegung an: links/rechts kippen = dumpf ↔ hell · nach vorn kippen = Echo · schütteln = Stotter", 4200); this.paint(); return true;
  },
  stop() { if (!this.on) return; this.on = false; cancelAnimationFrame(this.raf); clearTimeout(this.chk); removeEventListener("deviceorientation", this._o); removeEventListener("devicemotion", this._m); this.lr = 0; this.fb = 0;
    try { if (!Live70.on) { Wucht.tilt(0); Wucht.echoAmt(0); } else { const hp = Wucht.n && Wucht.n.hp; if (hp) hp.frequency.setTargetAtTime(20, Engine.ctx.currentTime, 0.04); } if (!(Live70.on && Live70.hold.cut)) Wucht.cut(false); } catch (_) {} this.paint(); },
  toggle() { if (this.on) { this.stop(); UI.toast("Bewegung aus", 1400); } else this.start(); },
  row() { return `<div class="mxr bw72" style="--c:#35C0E0"><span class="mxn"><i>${I67.kipp}</i><b>Bewegung</b></span><div class="b72b"><button class="b72sw" data-bw="tog" role="switch" aria-checked="${this.on}" aria-pressed="${this.on}" aria-label="Bewegung des Geräts steuert den Klang"><i></i></button><button class="b72lev" data-bw="mid" aria-label="Mitte neu setzen: die jetzige Haltung gilt als unverändert"><i></i></button><span class="b72t"><b id="bwSay">${this.on ? this.say() : "aus"}</b><small>Kippen: dumpf ↔ hell · nach vorn: Echo · schütteln: Stotter</small></span></div></div>`; }
};
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-bw]"); if (!b) return; if (b.dataset.bw === "tog") Beweg.toggle(); else if (b.dataset.bw === "mid") { if (Beweg.on) Beweg.center(); else Beweg.start(); } });
// Mischen: Zeile unter der Wucht
{ const rn = MixUI.render.bind(MixUI); MixUI.render = function (force) { const r = rn(force); try { const el = this.el(), w = el && !el.hidden && el.querySelector(".wu70"); if (w && !el.querySelector(".bw72")) { w.insertAdjacentHTML("afterend", Beweg.row()); Beweg.paint(); } } catch (e) { console.warn(e); } return r; }; }
// Live-Fläche: Knopf „Kippen“ – der Punkt rollt mit der Neigung
{ const rn = Live70.render.bind(Live70); Live70.render = function () { const r = rn(); try { const bt = this.el().querySelector(".lvbot"); if (bt && !bt.querySelector("[data-bw]")) { bt.classList.add("q7three"); bt.insertAdjacentHTML("beforeend", `<button class="lvh q7tg" data-bw="tog" aria-pressed="${Beweg.on}" aria-label="Kippen: die Neigung des Geräts bewegt den Punkt"><b>Kippen</b><small>Gerät neigen</small></button>`); } } catch (_) {} return r; };
  const cl = Live70.close.bind(Live70); Live70.close = function (...a) { const r = cl(...a); try { if (Beweg.on) { Beweg.zero = null; Beweg.dirty = true; } } catch (_) {} return r; }; }
{ const pl = Project.load.bind(Project); Project.load = function (...a) { try { if (Beweg.on) Beweg.stop(); } catch (_) {} return pl(...a); }; }
document.addEventListener("visibilitychange", () => { try { if (document.hidden && Beweg.on) Beweg.stop(); } catch (_) {} });
try { Erkl.T.push([".bw72", "Bewegung", "Einschalten, dann das Gerät bewegen: links oder rechts kippen macht die Musik dumpfer oder heller, nach vorn kippen gibt Echo, schütteln lässt sie stottern. Der kleine Kreis zeigt die Neigung; antippen setzt die Mitte neu."]); } catch (_) {}
Help.T.push({ id: "v72", ic: "📱", t: "Bewegung: das Gerät kippen und schütteln", k: "bewegung sensor lage beschleunigung kippen neigen schütteln gyroskop handy tablet filter echo stotter kugel",
  h: `<p>Unter <b>Mischen → Bewegung</b> (oder in der <b>Live-Fläche</b> mit „Kippen“) schaltest du die Sensoren deines Handys oder Tablets ein. Sie sind aus, bis du sie einschaltest. Beim ersten Mal fragt das Gerät vielleicht um Erlaubnis.</p>
  <ul><li><b>Links oder rechts kippen:</b> Die Musik wird dumpfer oder heller.</li><li><b>Nach vorn kippen</b> (obere Kante weg von dir): Echo im Takt.</li><li><b>Schütteln:</b> Die Musik stottert – jeder Ruck ein kurzer Aussetzer.</li><li><b>In der Live-Fläche</b> rollt der Punkt wie eine Kugel: kippen bestimmt Klang und wie viele Klänge spielen. Legst du den Finger auf, führt der Finger.</li></ul>
  <p>Die <b>Mitte</b> ist die Haltung beim Einschalten. Der kleine Kreis zeigt die Neigung; ihn antippen setzt die Mitte neu. Kommen keine Bewegungsdaten an (zum Beispiel am Rechner oder in einer eingebetteten Ansicht), schaltet sich die Bewegung von selbst wieder aus.</p>` });

/* ---------- Live-Fläche mit mehreren Fingern ----------
   1. Finger: der Punkt (Klang und Band) · 2. Finger: Echo – je weiter weg vom ersten, desto stärker · 3. Finger: Stille (loslassen = Einsatz).
   Hebt der erste Finger ab, übernimmt der nächste den Punkt. */
Live70.X = [];                                   // weitere Finger: { id, x, y } in Bildschirm-Punkten
Live70.echoFor = function (dist, size) { return clamp(dist / Math.max(1, size * 0.6), 0.25, 1); };
Live70.mainXY = function () { const p = $("lvPad"); if (!p) return [0, 0]; const r = p.getBoundingClientRect(); return [r.left + this.x * r.width, r.top + (1 - this.y) * r.height, Math.min(r.width, r.height)]; };
Live70.mtUpdate = function () {
  const n = this.X.length;
  if (n >= 1) { const [mx, my, sz] = this.mainXY(), a = this.echoFor(Math.hypot(this.X[0].x - mx, this.X[0].y - my), sz); if (!this.hold.echo) this.holdSet("echo", true); this.mtEcho = true; this.mtAmt = a; Wucht.echoAmt(a); }
  else if (this.mtEcho) { this.mtEcho = false; this.mtAmt = 0; this.holdSet("echo", false); }
  if (n >= 2) { if (!this.mtCut) { this.mtCut = true; this.holdSet("cut", true); } } else if (this.mtCut) { this.mtCut = false; this.holdSet("cut", false); }
};
{ const bd = Live70.bind.bind(Live70); Live70.bind = function (el) { bd(el);
    el.addEventListener("pointerdown", e => { if (!e.target.closest("#lvPad") || this.pid == null || this.pid === e.pointerId || this.X.length >= 2 || this.X.some(q => q.id === e.pointerId)) return; this.X.push({ id: e.pointerId, x: e.clientX, y: e.clientY }); try { $("lvPad").setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault(); this.mtUpdate(); });
    el.addEventListener("pointermove", e => { const q = this.X.find(q => q.id === e.pointerId); if (q) { q.x = e.clientX; q.y = e.clientY; } if (this.X.length && (q || this.pid === e.pointerId)) this.mtUpdate(); });
    const up = e => { const i = this.X.findIndex(q => q.id === e.pointerId); if (i >= 0) this.X.splice(i, 1); else if (this.pid == null && this.X.length) { const q = this.X.shift(); this.pid = q.id; } else return; this.mtUpdate(); };   // der erste Finger ist weg: der nächste führt den Punkt
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up); };
  const rn = Live70.render.bind(Live70); Live70.render = function () { const r = rn(); try { this.pid2 = -1; this.X = []; this.mtEcho = false; this.mtCut = false; const h = $("lvHint"); if (h) h.innerHTML = "Leg den Finger auf die Fläche und zieh:<br><b>hoch</b> = mehr Band · <b>rechts</b> = heller<br><b>zweiter Finger</b> = Echo (weiter weg = mehr)<br><b>dritter Finger</b> = Stille"; } catch (_) {} return r; };
  const cl = Live70.close.bind(Live70); Live70.close = function (...a) { this.X = []; this.mtEcho = false; this.mtCut = false; const r = cl(...a); this.pid2 = -1; return r; };
  const dr = Live70.draw.bind(Live70); Live70.draw = function () { const r = dr(); try { if (this.X.length) { const cv = $("lvCv"), g = cv.getContext("2d"), d = this.dpr || 1, R = cv.getBoundingClientRect(), [mx, my] = this.mainXY(), P = (x, y) => [(x - R.left) * d, (y - R.top) * d], [ax, ay] = P(mx, my); g.save(); g.globalCompositeOperation = "lighter"; g.lineCap = "round";
        this.X.forEach((q, i) => { const [bx, by] = P(q.x, q.y), col = i === 0 ? "53,192,224" : "255,90,110"; if (i === 0) { g.strokeStyle = `rgba(${col},${0.25 + 0.6 * (this.mtAmt || 0)})`; g.lineWidth = (2 + 6 * (this.mtAmt || 0)) * d; g.setLineDash([10 * d, 12 * d]); g.lineDashOffset = -performance.now() / 30; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); g.setLineDash([]); }
          g.strokeStyle = `rgba(${col},.95)`; g.lineWidth = 3 * d; g.beginPath(); g.arc(bx, by, 30 * d, 0, 6.2832); g.stroke(); g.fillStyle = `rgba(${col},.22)`; g.beginPath(); g.arc(bx, by, 30 * d, 0, 6.2832); g.fill(); }); g.restore(); } } catch (_) {} return r; }; }

/* ---------- Bereichswechsel: Tasten · Noten · Kneten · Live – eine Leiste, überall dieselbe, die Musik läuft weiter ---------- */
const Ber72 = {
  B: [["tasten", "keys", "Tasten"], ["noten", "noten", "Noten"], ["knet", "blob", "Kneten"], ["live", "live", "Live"]],
  strip(cur) { return `<div class="ber72" role="group" aria-label="Bereich wechseln – die Musik läuft weiter">${this.B.map(([k, ic, n]) => `<button data-ber="${k}" aria-pressed="${k === cur}" aria-label="${n}${k === cur ? " (hier bist du)" : ""}"><i>${I67[ic] || ""}</i><span>${n}</span></button>`).join("")}</div>`; },
  form() { const f = (Schrift.on && Schrift.f) || (Einsp.on && Einsp.f) || Forms.active; return f && Forms.list.includes(f) && !f.empty ? f : (Forms.list.find(x => !x.empty && !x.remote) || null); },
  cur() { return Live70.on ? "live" : Schrift.on ? "noten" : Einsp.on ? "tasten" : Tools.knead && UI.tab === "klang" ? "knet" : null; },
  go(k) {
    if (k === this.cur()) return; const f = this.form(); Hap(8);
    if (k === "live" && !Live70.forms().length) return Live70.open();                 // sagt selbst, was fehlt – der jetzige Bereich bleibt
    try { if (Live70.on) Live70.close(true); if (Schrift.on) Schrift.close(); if (Einsp.on) { if (Einsp.made === Einsp.f && k !== "live") Einsp.made = null; Einsp.close(); } if (Tools.knead && k !== "knet") Tools.toggleKnead(false); } catch (e) { console.warn(e); }
    if (k === "tasten") return Einsp.open(f);
    if (k === "noten") return Schrift.open(f);
    if (k === "live") return Live70.open();
    if (k === "knet") { UI.setTab("klang"); try { if (f) Forms.setActive(f); if (Scene.view !== "nah") UI.setView("nah"); Tools.toggleKnead(true); } catch (e) { console.warn(e); } }
  }
};
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-ber]"); if (b) Ber72.go(b.dataset.ber); });
{ const put = (root, cur) => { try { const t = root && root.querySelector(".etop"); if (t && !root.querySelector(".ber72")) t.insertAdjacentHTML("afterend", Ber72.strip(cur)); } catch (_) {} };
  const sr = Schrift.render.bind(Schrift); Schrift.render = function () { const r = sr(); put($("kn70"), "noten"); return r; };
  const er = Einsp.render.bind(Einsp); Einsp.render = function () { const r = er(); put($("einsp"), "tasten"); return r; };
  const lr = Live70.render.bind(Live70); Live70.render = function () { const r = lr(); try { const t = this.el().querySelector(".lvtop"); if (t && !this.el().querySelector(".ber72")) t.insertAdjacentHTML("afterend", `<div class="lvber">${Ber72.strip("live")}</div>`); } catch (_) {} return r; };
  const ht = KSheet.html; KSheet.html = function () { let h = ht.call(this); try { if (Tools.knead && !h.includes('class="ber72"')) { const i = h.indexOf('<div class="fbcap">'), j = i < 0 ? -1 : h.indexOf("</div>", i); if (j > 0) h = h.slice(0, j + 6) + Ber72.strip("knet") + h.slice(j + 6); } } catch (_) {} return h; }; }

/* ---------- Mitschnitt: was du spielst, wird von selbst aufgenommen – beim Wechsel des Stücks fragt KLANGRAUM, ob es bleiben soll ---------- */
const Auto72 = {
  on: store.get("auto72") !== false, node: null, chunks: [], frames: 0, quiet: 0, MAX: 300, MIN: 8,
  sr() { return Engine.ctx ? Engine.ctx.sampleRate : 48000; },
  init() { if (this.node || !this.on || !Engine.ctx || !Engine.out || typeof Engine.makeRec !== "function") return;
    try { const n = Engine.makeRec(2); Engine.out.connect(n.input || n); const z = Engine.ctx.createGain(); z.gain.value = 0; n.connect(z).connect(Engine.ctx.destination); n.port.onmessage = e => { if (e.data && e.data.t === "chunk") this.push(e.data.d); }; n.port.postMessage({ on: true, ch: 2 }); this.node = n; } catch (e) { console.warn("Mitschnitt", e); } },
  max() { try { return Perf36.lvl() === "leicht" ? 120 : this.MAX; } catch (_) { return this.MAX; } },
  // nur was klingt, wird behalten: Stille über gut einer Sekunde fällt weg; eigene Aufnahmen beim Anhören zählen nicht
  push(d) {
    if (!this.on || !d || !d[0]) return; try { if (Recs.player) return; } catch (_) {}
    const L = d[0], R = d[1] || d[0], n = L.length; let pk = 0; for (let i = 0; i < n; i += 8) { const a = Math.abs(L[i]), b = Math.abs(R[i]); if (a > pk) pk = a; if (b > pk) pk = b; }
    if (pk > 0.004) this.quiet = 0; else { this.quiet += n; if (this.quiet > this.sr() * 1.2) return; }
    this.chunks.push([K.toI16(L), K.toI16(R)]); this.frames += n; const max = this.max() * this.sr();
    while (this.chunks.length > 1 && this.frames - this.chunks[0][0].length >= max) this.frames -= this.chunks.shift()[0].length;
  },
  secs() { return this.frames / this.sr(); },
  txt(s = this.secs()) { s = Math.round(s); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); },
  reset() { this.chunks = []; this.frames = 0; this.quiet = 0; this.paint(); },
  async save(name) {
    const n = this.frames, sr = this.sr(), L = new Float32Array(n), R = new Float32Array(n); let o = 0; for (const c of this.chunks) { L.set(K.fromI16(c[0]), o); R.set(K.fromI16(c[1]), o); o += c[0].length; }
    const secs = this.secs(); this.reset(); const hm = new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    return Recs.add([L, R], sr, name || `Mitschnitt ${hm} · ${this.txt(secs)}`, "mitschnitt");
  },
  // vor dem Wechsel des Stücks fragen (höchstens 45 s Bedenkzeit, danach geht es ohne Speichern weiter)
  ask(piece) {
    if (!this.on || this.secs() < this.MIN || !Projects.cur) { this.reset(); return Promise.resolve("nichts"); }
    return new Promise(res => { let done = false, iv = 0, to = 0; const fin = v => { if (done) return; done = true; clearInterval(iv); clearTimeout(to); res(v); };
      try { const len = this.txt(), s = Sheets.open("Mitschnitt", Sheets.head("Dein Spiel behalten?") + `<p>Was du in „${esc(piece || "deinem Stück")}“ gespielt hast, wurde mitgeschnitten: <b>${len} Minuten</b>. Soll der Mitschnitt bei den Aufnahmen dieses Stücks bleiben?</p><div class="am72"><button class="edone" data-am="save">Speichern</button><button class="eb" data-am="drop">Nicht speichern</button></div><button class="am72off" data-am="off">Nicht mehr von selbst mitschneiden</button>`, true);
        s.addEventListener("click", async e => { const b = e.target.closest("[data-am]"); if (!b) return; const k = b.dataset.am; Hap(8);
          if (k === "off") { this.set(false); UI.hideSheets(); return fin("aus"); }
          if (k === "save") { try { await this.save(`${piece || "Stück"} · Mitschnitt ${len}`); UI.hideSheets(); UI.toast("Mitschnitt gespeichert – du findest ihn bei den Aufnahmen des Stücks", 3000); return fin("gespeichert"); } catch (err) { UI.toast("Der Mitschnitt ließ sich nicht speichern: " + (err && err.message || err), 3600); UI.hideSheets(); this.reset(); return fin("fehler"); } }
          this.reset(); UI.hideSheets(); fin("verworfen"); });
        iv = setInterval(() => { if (!document.body.contains(s)) { this.reset(); fin("verworfen"); } }, 300); to = setTimeout(() => { this.reset(); try { if (document.body.contains(s)) UI.hideSheets(); } catch (_) {} fin("zeit"); }, 45000);
      } catch (e) { console.warn(e); this.reset(); fin("fehler"); } });
  },
  set(on) { this.on = !!on; store.set("auto72", this.on); if (!this.on) this.reset(); else this.init(); this.paint(); },
  async now() { if (this.secs() < 2) { UI.toast("Noch nichts mitgeschnitten – spiel etwas, der Mitschnitt läuft von selbst mit.", 2800); return; } try { const r = await this.save(); Hap(14); Sheets.recDone(r); } catch (e) { UI.toast("Der Mitschnitt ließ sich nicht speichern: " + (e && e.message || e)); } },
  paint() { const s = $("amSay"); if (s) s.textContent = this.on ? (this.frames ? `${this.txt()} mitgeschnitten` : "läuft mit, sobald etwas klingt") : "aus"; document.querySelectorAll("[data-am2='tog']").forEach(b => b.setAttribute("aria-checked", this.on)); const b = $("amNow"); if (b) b.disabled = !this.on || this.secs() < 2; },
  row() { return `<div class="mxr bw72 am72r" style="--c:#FF5A6E"><span class="mxn"><i><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none"/></svg></i><b>Mitschnitt</b></span><div class="b72b"><button class="b72sw" data-am2="tog" role="switch" aria-checked="${this.on}" aria-label="Von selbst mitschneiden, was gespielt wird"><i></i></button><span class="b72t"><b id="amSay"></b><small>Nimmt von selbst auf, was klingt. Beim Wechsel des Stücks fragt KLANGRAUM, ob der Mitschnitt bleiben soll.</small></span><button class="eb" id="amNow" data-am2="now">Jetzt sichern</button></div></div>`; }
};
setInterval(() => { try { Auto72.init(); if (UI.tab === "mix") Auto72.paint(); } catch (_) {} }, 1500);
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-am2]"); if (!b) return; Hap(8); if (b.dataset.am2 === "tog") Auto72.set(!Auto72.on); else Auto72.now(); });
{ const rn = MixUI.render.bind(MixUI); MixUI.render = function (force) { const r = rn(force); try { const el = this.el(), w = el && !el.hidden && el.querySelector(".bw72:not(.am72r)"); if (w && !el.querySelector(".am72r")) { w.insertAdjacentHTML("afterend", Auto72.row()); Auto72.paint(); } } catch (e) { console.warn(e); } return r; }; }
// Wechsel des Stücks: erst fragen, dann wechseln
{ const oi = Projects.openId.bind(Projects); Projects.openId = async function (id) { if (this.cur && this.cur.id !== id) { try { await Auto72.ask(this.cur.name); } catch (e) { console.warn(e); } } return oi(id); };
  const cr = Projects.create.bind(Projects); Projects.create = async function (name, kind, quiet) { if (this.cur && App.started) { try { await Auto72.ask(this.cur.name); } catch (e) { console.warn(e); } } return cr(name, kind, quiet); }; }
try { Erkl.T.push([".am72r", "Mitschnitt", "KLANGRAUM nimmt von selbst auf, was du spielst – Stille fällt weg, höchstens die letzten fünf Minuten. Wechselst du das Stück, wirst du gefragt, ob der Mitschnitt bleiben soll. „Jetzt sichern“ legt ihn sofort zu den Aufnahmen."], [".ber72", "Bereich wechseln", "Tasten, Noten, Kneten und Live: vier Arten, deine Musik zu verändern. Du kannst jederzeit wechseln – die Musik läuft dabei weiter."]); } catch (_) {}
Help.T.push({ id: "v72b", ic: "⏺", t: "Mitschnitt und Wechsel mitten im Stück", k: "mitschnitt automatisch aufnehmen aufzeichnen speichern fragen wechsel stück bereich tasten noten kneten live musik läuft weiter mehrere finger fläche",
  h: `<p><b>Mitschnitt:</b> KLANGRAUM nimmt von selbst auf, was du spielst. Stille fällt weg; behalten werden höchstens die letzten fünf Minuten. <b>Wechselst du das Stück</b> (ein anderes öffnen oder ein neues anlegen), fragt KLANGRAUM: „Dein Spiel behalten?“ – <b>Speichern</b> legt den Mitschnitt zu den Aufnahmen des alten Stücks, <b>Nicht speichern</b> verwirft ihn. Unter <b>Mischen → Mitschnitt</b> kannst du ihn ausschalten oder mit „Jetzt sichern“ sofort ablegen.</p>
  <p><b>Wechsel mitten im Stück:</b> In Einspielen, Klangschrift, Kneten und Live-Fläche steht oben dieselbe Leiste: <b>Tasten · Noten · Kneten · Live</b>. Ein Tipp wechselt den Bereich, die Musik läuft weiter. Auch „Fertig“ in der Live-Fläche hält die Musik nicht mehr an, wenn sie vorher schon lief.</p>
  <p><b>Live-Fläche mit mehreren Fingern:</b> Der erste Finger führt den Punkt. Ein <b>zweiter Finger</b> gibt Echo – je weiter weg vom ersten, desto stärker. Ein <b>dritter Finger</b> ist Stille; beim Abheben setzt alles wieder ein.</p>` });
