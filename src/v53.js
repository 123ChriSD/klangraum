/* ============================================================
   v53: Kneten verändert die Tonhöhe deutlich – immer in der Tonart
   Bisher wirkte Kneten nur auf die Klangfarbe; die Tonhöhe hing allein an der Größe (zwei Schwellen, je eine Oktave).
   Jetzt: Form kleiner drücken / Dellen = höher, herausziehen / Beulen = tiefer, Spitzen = höher, rund machen = tiefer.
   Gemessen an der Startform der Form (unverändert = 0). Ergebnis in Tonleiterstufen (±12), mit Rasterung gegen Flattern.
   Gilt für Antippen, Drehen, Farbflecken, Spielring, Bass; aufgenommene Loops behalten ihre Töne.
   ============================================================ */
const KneadPitch = {
  STR: { stark: 1, normal: 0.55, aus: 0 },
  GM: 115,    // Stufen je Einheit mittlere Auslenkung (einmal kräftig drücken ≈ 0,016 → ≈ 2 Stufen)
  GS: 6.5,    // Stufen je Einheit Spitzheit (spitze Stacheln ≈ +0,5 → ≈ 3 Stufen)
  MAX: 12,
  base: new Map(),
  str() { const v = Cfg.get("knPitch"); return this.STR[v] ?? 1; },
  ref(f) {
    const id = f.seedId || "kugel"; let r = this.base.get(id);
    if (!r) { try { const sd = K.seedById(id), a = K.analyze(K.seedShape(sd)); r = { mean: a.mean, S: a.S }; } catch (_) { r = { mean: 0, S: 0 }; } this.base.set(id, r); }
    return r;
  },
  raw(f) { if (!f || !f.an || f.kind === "drum" || f.empty) return 0; const r = this.ref(f), a = f.an; return (-(a.mean - r.mean) * this.GM + (a.S - r.S) * this.GS) * this.str(); },
  // ganzzahlige Stufen mit Hysterese (kein Hin-und-her-Springen beim Kneten)
  update(f) {
    const x = clamp(this.raw(f), -this.MAX - 0.4, this.MAX + 0.4), prev = f._kd | 0;
    let d = prev; if (Math.abs(x - prev) > 0.62) d = clamp(Math.round(x), -this.MAX, this.MAX);
    f._kx = x; if (d !== prev) { f._kd = d; this.changed(f, d, prev); }
    return d;
  },
  deg(f) { return f ? (f._kd | 0) : 0; },
  // fertigen Ton (z. B. Farbfleck, Ring, Bass) um die Knet-Stufen in der Tonleiter verschieben
  tp(f, base, m, kt) {
    const kd = kt ? this.deg(f) : 0; if (!kd || m == null) return m; const so = k => base + Music.mu.so(k);
    let bk = 0, bd = 1e9; for (let k = -35; k <= 49; k++) { const dd = Math.abs(so(k) - m); if (dd < bd) { bd = dd; bk = k; if (!dd) break; } }
    return bd === 0 ? so(bk + kd) : m + Music.mu.so(kd);
  },
  // Rückmeldung: Anzeige + kurzer Ton beim Kneten
  changed(f, d, prev) {
    if (!App.started || Forms.active !== f) return;
    this.show(f); Hap(4);
    const now = performance.now(); if ((Tools.knead || Input.kneadForm === f) && !(typeof RecGuard !== "undefined" && RecGuard.active()) && now - (this.pt || 0) > 220 && Engine.ctx) { this.pt = now; try { const h = Forms.play(f, 0.3, 0.45, { dur: 0.22 }); if (h) setTimeout(() => Forms.release(h), 200); } catch (_) {} }
  },
  txt(d) { return d === 0 ? "♪ Grundton" : `♪ ${Math.abs(d)} Stufe${Math.abs(d) > 1 ? "n" : ""} ${d > 0 ? "höher ↑" : "tiefer ↓"}`; },
  show(f) {
    let b = $("kpBadge"); if (!b) { b = document.createElement("div"); b.id = "kpBadge"; b.className = "kpbadge"; b.setAttribute("aria-live", "polite"); document.body.appendChild(b); }
    const d = this.deg(f); b.textContent = this.txt(d); b.dataset.d = d > 0 ? "up" : d < 0 ? "down" : "0"; b.hidden = false; b.classList.add("on");
    clearTimeout(this.ht); this.ht = setTimeout(() => { if (!Tools.knead) { b.classList.remove("on"); setTimeout(() => { if (!b.classList.contains("on")) b.hidden = true; }, 400); } }, 2400);
  },
  cycle() { const order = ["stark", "normal", "aus"], cur = Cfg.get("knPitch") || "stark", nx = order[(order.indexOf(cur) + 1) % order.length]; Cfg.set("knPitch", nx); for (const f of Forms.list) { f._kd = 0; this.update(f); } UI.toast(`Kneten → Tonhöhe: ${nx}`, 1600); return nx; }
};
Object.assign(Cfg.DEF, { knPitch: "stark" });
// nach jedem Neuberechnen der Form die Stufen bestimmen
{ const rb = Forms.rebuild.bind(Forms); Forms.rebuild = function (f, force) { const r = rb(f, force); try { if (f && f.an) KneadPitch.update(f); } catch (e) { console.warn(e); } return r; }; }
// Beim Kneten: Stufen im Steuerfeld-Text und Anzeige an
{ const cp = FBar.caption; FBar.caption = function () { const c = cp.call(this); if (this.mode() !== "knead" || !Forms.active || KneadPitch.str() === 0) return c; return `${c} · ${KneadPitch.txt(KneadPitch.deg(Forms.active))}`; }; }
setInterval(() => { try { const b = $("kpBadge"); if (Tools.knead && Forms.active && KneadPitch.str() > 0) { if (!b || b.hidden) KneadPitch.show(Forms.active); } } catch (_) {} }, 500);
// Befehl + Menü: Stärke umschalten
Cmd.L.knpitch = { g: "form", ic: () => '<svg viewBox="0 0 24 24"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>', n: () => `Kneten → Ton: ${Cfg.get("knPitch") || "stark"}`, run: () => KneadPitch.cycle() };
{ const g = Cmd.GROUPS.find(x => x[0] === "form"); if (g && !g[3].includes("knpitch") && g[3].length < 8) g[3].push("knpitch"); else { const g2 = Cmd.GROUPS.find(x => x[3].length < 8 && x[0] !== "set"); if (g2 && !g2[3].includes("knpitch")) g2[3].push("knpitch"); } }
{ const op = Sheets.open.bind(Sheets); Sheets.open = function (name, html, ...r) { const s = op(name, html, ...r);
  try { if (name === "Menü" && s && !s.querySelector("[data-mkp]")) { const a = s.querySelector(".mmic") || s.querySelector(".mjam"); if (a) { a.insertAdjacentHTML("afterend", `<div class="row mkp"><button class="btn" data-mkp="1">🎵 Kneten → Tonhöhe: <b>${Cfg.get("knPitch") || "stark"}</b></button></div>`); s.querySelector("[data-mkp]").onclick = ev => { Hap(); const v = KneadPitch.cycle(); ev.currentTarget.querySelector("b").textContent = v; }; } } } catch (e) { console.warn(e); }
  return s; }; }
// Hilfe
{ const k = Help.T.find(x => x.id === "edit") || Help.T.find(x => x.id === "forms"); if (k) k.h = k.h.replace(/<\/ul>\s*$/, `<li><b>Kneten ändert die Tonhöhe</b> (in der Tonart): Form <b>hineindrücken</b> (kleiner) = <b>höher</b>, <b>herausziehen</b> (Beulen, größer) = <b>tiefer</b>, <b>Spitzen</b> = höher, <b>rund machen</b> = tiefer – bis zu 12 Stufen. Beim Kneten erklingt der neue Ton, unter dem Namen steht „♪ 3 Stufen höher“. „Startform“ setzt zurück. Stärke: Menü → 🎵 Kneten → Tonhöhe (stark · normal · aus). Aufgenommene Loops behalten ihre Töne.</li></ul>`); }
