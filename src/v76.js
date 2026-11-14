/* =====================================================================================
   v76: START-MELODIE FÜR ALLE – EIGENE MELODIEN EINZELN
   – Neues Stück: die Start-Melodie gilt zuerst für alle Formen; darunter bekommt jede Form auf Wunsch eine eigene
     (Vorlage, Zufall oder frei). Schlagzeug dreht mit. Die Start-Melodie bleibt bei jeder Form in der Sammlung.
   – Im Stück: Knopf „♪ Melodie“ im Bereich Spielen – je Form die Start-Melodie, eine eigene oder eine Vorlage wählen,
     eine eigene tippen, die Start-Melodie für alle ändern oder alle wieder auf die Start-Melodie stellen.
   ===================================================================================== */
Object.assign(StartMel, {
  NAME: "Start-Melodie",
  CH() { return [["start", "Start-Melodie"], ...Mel.PRESETS.filter(P => P.d && P.d.length > 1).map(P => [P.id, P.n]), ["zufall", "🎲 Zufall"], ["auto", "keine – spielt frei"]]; },
  // Wahl einer Form → Tonfolge und Name (null = keine eigene)
  pick(c) { if (!c || c === "start" || c === "auto") return null; if (c === "zufall") return { d: this.zufall(), name: "Zufall" }; const P = Mel.PRESETS.find(x => x.id === c); return P && P.d ? { d: P.d.slice(), name: P.n } : null; },
  // alle Formen bekommen die Start-Melodie in ihre Sammlung; wer eine eigene gewählt hat, spielt diese
  apply(d, off) {
    const out = [], L = Forms.list, O = this.opt || {}, own = O.own || null, n = O.n == null ? L.length : O.n, legacy = !own && off && O.n === L.length;
    L.forEach((f, i) => { if (!f || f.empty || f.remote || f.kind === "drum") return; if (own && i >= n) return; if (legacy && off[i]) return;
      const c = own ? own[i] || "start" : "start", P = this.pick(c);
      if (d && d.length) Mel.add(f, d, this.NAME);
      if (P) Mel.add(f, P.d, P.name); else if (c === "auto") { f.mel = null; f.perfLast = null; } else if (!(d && d.length)) return;
      out.push(f); });
    return out; },
  after(d) { try { const O = this.opt || { r: 1, kanon: false, go: true, own: null, n: -1 }, F = this.apply(d, O.off), n = O.n >= 0 ? O.n : Forms.list.length, D = Forms.list.slice(0, n).filter(f => f && !f.empty && !f.remote && f.kind === "drum"); this.did = true;
      if (O.go) { let j = 0; for (const f of F) { try { const st = !O.own || (O.own[Forms.list.indexOf(f)] || "start") === "start"; if (O.kanon && st && d && d.length) { if (j) { const p = Motion.ph(f); p.ry += K.TAU * (2 * j / Math.max(2, d.length)); if (p.lk) p.lk.y = null; } j++; } Move.setR(f, O.r || 1, { soft: false }); } catch (_) {} }
        if (F.length) { for (const f of D) { try { Move.setR(f, O.r || 1, { soft: false }); } catch (_) {} } try { if (!Transport.running) Transport.start(); } catch (_) {} } }
      Save.soon(); try { UI.refresh(); } catch (_) {}
      const ownN = O.own ? F.filter(f => { const c = O.own[Forms.list.indexOf(f)]; return c && c !== "start"; }).length : 0, stN = F.length - ownN;
      UI.toast(!F.length ? "Dieses Stück hat keine Form mit Tonhöhen – die Melodie wurde nicht übernommen." : `${d && d.length ? `${stN} ${stN === 1 ? "Form spielt" : "Formen spielen"} die Start-Melodie${O.kanon && stN > 1 ? " als Kanon" : ""}` : ""}${ownN ? `${d && d.length ? ", " : ""}${ownN} ${ownN === 1 ? "hat" : "haben"} eine eigene` : ""}.${O.go ? "" : " Tippe unten links auf „Drehen“ – mit „alle“ starten alle zugleich."} Oben links: „♪ Melodie“ wählt je Form neu.`, 6000); this.opt = null; return F; } catch (e) { console.warn(e); return []; } }
});
// Blatt „Neues Stück“: statt „Wer spielt mit“ wählt jede Form ihre Melodie
{ const sc = StartMel.sec.bind(StartMel); StartMel.sec = function (S) { const O = this.o(S); if (!O.own) O.own = {}; const CH = this.CH();
    const rows = S.forms.map((id, i) => { const sd = K.seedById(id), nm = esc(sd ? sd.name : id); if (this.drumSeed(id)) return `<span class="sm76r"><b>${nm}</b><small>Schlagzeug – dreht mit, hat keine Melodie</small></span>`;
      const cur = O.own[i] || "start"; return `<label class="sm76r"><b>${nm}</b><select class="txt" data-sm76="${i}" aria-label="Melodie für ${nm}">${CH.map(([v, n]) => `<option value="${v}"${v === cur ? " selected" : ""}>${n}</option>`).join("")}</select></label>`; }).join("") || `<small class="kch">Noch keine Formen gewählt.</small>`;
    return sc(S).replace(/<div class="sm74l"><span>Wer spielt mit<\/span><div class="sm74who">[\s\S]*?<\/div><\/div>/, `<div class="sm74l"><span>Die Start-Melodie gilt zuerst für alle. Hier bekommt eine Form auf Wunsch ihre eigene:</span><div class="sm76f">${rows}</div></div>`)
      .replace("Die Formen des neuen Stücks spielen sie zuerst <b>gemeinsam</b>.", "Sie gilt zuerst für <b>alle Formen</b> des neuen Stücks; eigene Melodien wählst du darunter je Form."); };
  document.addEventListener("change", e => { const s = e.target && e.target.matches && e.target.matches("[data-sm76]") ? e.target : null; if (!s || !NewPiece.st) return; const O = StartMel.o(NewPiece.st); if (!O.own) O.own = {}; if (s.value === "start") delete O.own[+s.dataset.sm76]; else O.own[+s.dataset.sm76] = s.value; Hap(6); const P = StartMel.pick(s.value === "zufall" ? null : s.value); if (P && Engine.ctx) { const mood = StartMel.mood(), t0 = Engine.ctx.currentTime + 0.05; P.d.forEach((n, i) => StartMel.beep(StartMel.midiFor(mood, n), t0 + i * 0.2, 0.16)); } StartMel.paint(); });
  const pt = StartMel.paint.bind(StartMel); StartMel.paint = function () { const r = pt(); try { const S = NewPiece.st, O = S && S.mo, any = !!(O && O.own && Object.values(O.own).some(v => v && v !== "start")), d = S && S.mel || []; const o = $("sm74Opt"); if (o) o.classList.toggle("q7off", !d.length && !any); const go = document.querySelector('#npS [data-np="go"]'); if (go && !d.length && any) go.textContent = "Stück mit diesen Melodien anlegen"; } catch (_) {} return r; };
  const go = NewPiece.go.bind(NewPiece); NewPiece.go = async function () { let any = false; StartMel.did = false; const r0 = () => { try { const S = this.st, O = S && S.mo; if (!O) return null; any = !!(O.own && Object.values(O.own).some(v => v && v !== "start")); return { r: O.r, kanon: !!O.kanon, go: O.go !== false, own: { ...(O.own || {}) }, off: {}, n: S.forms.filter(id => this.ok(id)).slice(0, 8).length }; } catch (_) { return null; } }, keep = r0();
    const r = await go(); try { if (!StartMel.did && any && keep) { StartMel.opt = keep; StartMel.after([]); } } catch (e) { console.warn(e); } return r; };
  // die innere Hülle (v74) setzt StartMel.opt ohne „own“ – hier ergänzen, bevor „after“ läuft
  const af = StartMel.after.bind(StartMel); StartMel.after = function (d) { try { const S = NewPiece.st, O = S && S.mo; if (this.opt && !this.opt.own && O && O.own) this.opt.own = { ...O.own }; } catch (_) {} return af(d); }; }

/* ---------- Im Stück: je Form die Melodie wählen ---------- */
const MelWahl76 = {
  d: [],
  melodic(f) { return !!f && !f.empty && !f.remote && f.kind !== "drum"; },
  forms() { return Forms.list.filter(f => this.melodic(f)); },
  // die Start-Melodie des Stücks (steht bei den Formen in der Sammlung)
  start() { for (const f of Forms.list) { const m = (f.mels || []).find(x => x.name === StartMel.NAME); if (m && m.d && m.d.length) return m.d.slice(); } return null; },
  cur(f) { const M = f.mel; if (!M || !M.d || !M.d.length) return "auto"; const own = (f.mels || []).find(x => x === M || (x.id && x.id === M.id)); return own ? "m:" + own.id : "p:" + M.id; },
  label(f) { const M = f && f.mel; if (!M || !M.d || !M.d.length) return "frei"; if (M.name) return M.name; const P = Mel.PRESETS.find(x => x.id === M.id); return P ? P.n : "Melodie"; },
  base(f) { try { return Forms.baseMidi(Forms.sources(f)[0].src); } catch (_) { return 60; } },
  tone(f, k) { try { const m = this.base(f) + Music.mu.so(k), h = Forms.play(f, clamp((m - 28) / 60, 0, 1), 0.8, { midi: m }); if (h) setTimeout(() => { try { Forms.release(h); } catch (_) {} }, 320); } catch (_) {} },
  hear(f) { try { if (!Transport.running || !Dreh73.rpb(f)) Mel.preview(f); } catch (_) {} },
  // Start-Melodie einer Form geben (anlegen oder ersetzen) und sie spielen lassen
  giveStart(f, d) { if (!f.mels) f.mels = []; let m = f.mels.find(x => x.name === StartMel.NAME); if (m) m.d = d.slice(0, 16); else { m = { id: uid("m"), name: StartMel.NAME, d: d.slice(0, 16), snap: true }; f.mels.unshift(m); } f.mel = m; f.perfLast = null; return m; },
  setStartAll(d) { const F = this.forms(); if (!F.length || !d || !d.length) return 0; Undo.push(); for (const f of F) this.giveStart(f, d); Save.soon(); try { UI.refresh(); } catch (_) {} return F.length; },
  choose(f, c) {
    if (!this.melodic(f)) return; Undo.push();
    if (c === "auto") Mel.set(f, "auto"); else if (c === "start") { const d = this.start(); if (d) this.giveStart(f, d); } else if (c.startsWith("m:")) Mel.pick(f, c.slice(2)); else if (c.startsWith("p:")) Mel.set(f, c.slice(2));
    f.perfLast = null; Save.soon(); Hap(8); this.hear(f);
  },
  open(f = Forms.active) {
    if (!this.melodic(f)) { UI.toast(f && f.kind === "drum" ? "Schlagzeug hat keine Melodie – wähl eine andere Form." : "Erst eine Form wählen", 2200); return; }
    this.f = f; this.d = []; const s = Sheets.open("Melodie", Sheets.head(`Melodie von ${esc(f.name)}`) + `<div id="mw76B"></div>`); s.classList.add("mw76");
    s.addEventListener("click", e => { const b = e.target.closest("[data-mw]"); if (b) this.act(b.dataset.mw); }); this.render();
  },
  render() {
    const el = $("mw76B"), f = this.f; if (!el || !f || !Forms.list.includes(f)) return; const cur = this.cur(f), st = this.start(), own = (f.mels || []).filter(m => m.name !== StartMel.NAME), hasSt = (f.mels || []).some(m => m.name === StartMel.NAME);
    const chips = d => d.map(k => `<i style="--c:${KeysUI.COL[mod(k, 7)]}">${StartMel.lab(k)}</i>`).join(""), stM = (f.mels || []).find(m => m.name === StartMel.NAME);
    const opt = (c, name, d, sub) => `<button class="mw76o" data-mw="c:${c}" aria-pressed="${c === cur || (c === "start" && stM && cur === "m:" + stM.id)}"><b>${esc(name)}</b>${sub ? `<small>${sub}</small>` : ""}${d && d.length ? `<span class="sm73row q7s">${chips(d)}</span>` : ""}</button>`;
    const others = this.forms().filter(g => g !== f);
    el.innerHTML = `<div class="mw76forms" aria-label="Form wählen">${this.forms().map(g => `<button class="npc" data-mw="f:${g.id}" aria-pressed="${g === f}">${esc(g.name)}<small>${esc(this.label(g))}</small></button>`).join("")}</div>
      <h3 class="ph3">Das spielt ${esc(f.name)}, wenn sie sich dreht</h3>
      <div class="mw76l">${st ? opt("start", StartMel.NAME, st, hasSt ? "die gemeinsame Melodie des Stücks" : "die gemeinsame Melodie des Stücks – diese Form hat sie noch nicht") : ""}
        ${own.map(m => opt("m:" + m.id, m.name, m.d, "eigene Melodie dieser Form")).join("")}
        ${Mel.PRESETS.filter(P => P.d).map(P => opt("p:" + P.id, P.n, P.d, "Vorlage")).join("")}
        ${opt("auto", "Frei", null, "keine feste Melodie – die Form bestimmt die Töne")}</div>
      <h3 class="ph3">Eigene Melodie tippen</h3>
      <div class="sm73row" id="mw76Row">${this.d.length ? chips(this.d) : "<span>Tippe auf die bunten Tasten – du hörst die Form selbst.</span>"}</div>
      <div class="sm73keys">${[0, 1, 2, 3, 4, 5, 6, 7].map(k => `<button class="sm73k" data-mw="k:${k}" style="--c:${KeysUI.COL[k % 7]}" aria-label="Ton ${k + 1}"${this.d.length >= 16 ? " disabled" : ""}><b>${k + 1}</b></button>`).join("")}</div>
      <div class="sm73bar"><button class="eb" data-mw="undo"${this.d.length ? "" : " disabled"} aria-label="Letzten Ton entfernen">${I67.left}<span>Zurück</span></button><button class="eb" data-mw="clear"${this.d.length ? "" : " disabled"} aria-label="Leeren">${I67.trash}<span>Leeren</span></button></div>
      <div class="mw76go"><button class="edone" data-mw="own"${this.d.length ? "" : " disabled"}>Nur für ${esc(f.name)}</button><button class="eb" data-mw="all"${this.d.length ? "" : " disabled"}>Als Start-Melodie für alle Formen</button></div>
      ${st && others.length ? `<button class="mw76back" data-mw="back">Alle Formen spielen wieder die Start-Melodie</button>` : ""}`;
  },
  act(k) {
    const f = this.f; if (!f || !Forms.list.includes(f)) return UI.hideSheets(); const [a, v] = [k.slice(0, k.indexOf(":") < 0 ? k.length : k.indexOf(":")), k.indexOf(":") < 0 ? "" : k.slice(k.indexOf(":") + 1)];
    if (a === "f") { const g = Forms.byId(v); if (this.melodic(g)) { this.f = g; this.d = []; try { Forms.setActive(g); } catch (_) {} Hap(); } return this.render(); }
    if (a === "c") { this.choose(f, v); return this.render(); }
    if (a === "k") { if (this.d.length < 16) { this.d.push(+v); this.tone(f, +v); Hap(5); } return this.render(); }
    if (a === "undo") { this.d.pop(); Hap(); return this.render(); }
    if (a === "clear") { this.d = []; Hap(10); return this.render(); }
    if (a === "own" && this.d.length) { Undo.push(); const m = Mel.add(f, this.d); Save.soon(); this.d = []; Hap(12); this.hear(f); UI.toast(`${f.name} spielt jetzt „${m.name}“ – die anderen Formen bleiben, wie sie sind`, 3000); return this.render(); }
    if (a === "all" && this.d.length) { const n = this.setStartAll(this.d); this.d = []; Hap(12); this.hear(f); UI.toast(`Neue Start-Melodie: ${n} ${n === 1 ? "Form spielt" : "Formen spielen"} sie jetzt`, 3000); return this.render(); }
    if (a === "back") { const d = this.start(); if (d) { const n = this.setStartAll(d); Hap(12); UI.toast(`${n} ${n === 1 ? "Form spielt" : "Formen spielen"} wieder die Start-Melodie – eigene Melodien bleiben in der Sammlung`, 3200); } return this.render(); }
  },
  // Knopf „♪ Melodie“ neben „Ausklang“
  el() { let e = $("mw76"); if (!e) { e = document.createElement("button"); e.id = "mw76"; e.className = "ou75 mw76p"; e.hidden = true; e.addEventListener("click", () => { Hap(8); this.open(); }); document.body.appendChild(e); } return e; },
  paint() { const el = this.el(), a = $("ou75"), f = Forms.active, on = !!a && !a.hidden && !Outro75.on && this.melodic(f) && Scene.view !== "raum"; if (el.hidden === on) el.hidden = !on; if (!on) return;
    try { const r = a.getBoundingClientRect(), L = Math.round(r.right + 6) + "px", T = Math.round(r.top) + "px"; if (el.style.left !== L) el.style.left = L; if (el.style.top !== T) el.style.top = T; el.style.maxWidth = Math.max(90, innerWidth - r.right - 18) + "px"; } catch (_) {}
    const lb = this.label(f), sg = f.id + "|" + lb; if (el.dataset.sg === sg) return; el.dataset.sg = sg; el.setAttribute("aria-label", `Melodie von ${f.name}: ${lb} – tippen zum Wählen`); el.innerHTML = `<i>${I67.note || "♪"}</i><span>${esc(lb)}</span>`; }
};
setInterval(() => { try { MelWahl76.paint(); } catch (_) {} }, 300);
try { Alles73.MAKE.push(["melw", "note", "Melodie je Form", "Start-Melodie, eigene oder Vorlage wählen"]); const ac = Alles73.act.bind(Alles73); Alles73.act = function (k) { if (k === "mk:melw") { UI.hideSheets(); UI.setTab("klang"); return setTimeout(() => { const f = MelWahl76.melodic(Forms.active) ? Forms.active : MelWahl76.forms()[0]; if (f) { try { Forms.setActive(f); } catch (_) {} MelWahl76.open(f); } else UI.toast("Dieses Stück hat keine Form mit Tonhöhen", 2200); }, 80); } return ac(k); }; } catch (_) {}
try { Erkl.T.push(["#mw76", "Melodie", "Zeigt, welche Melodie die gewählte Form beim Drehen spielt. Antippen: Start-Melodie, eine eigene oder eine Vorlage wählen, eine neue tippen – für diese Form allein oder als Start-Melodie für alle."]); } catch (_) {}
Help.T.push({ id: "v76", ic: "♪", t: "Start-Melodie für alle, eigene Melodien einzeln", k: "start melodie alle formen eigene melodie einzeln separat wählen form vorlage zufall frei ändern zurück sammlung",
  h: `<p><b>Im Blatt „Neues Stück“:</b> Die <b>Start-Melodie</b> gilt zuerst für <b>alle Formen</b> (Schlagzeug dreht mit, hat aber keine Töne). Unter „So startet das Stück“ kannst du jeder Form einzeln eine <b>eigene</b> geben: eine Vorlage, Zufall oder „keine – spielt frei“. Die Start-Melodie bleibt trotzdem bei jeder Form in der Sammlung – du kannst später zurückwechseln.</p>
  <p><b>Im Stück:</b> Im Bereich Spielen steht oben links neben „Ausklang“ der Knopf <b>♪</b> mit dem Namen der Melodie der gewählten Form. Antippen öffnet die Auswahl: <b>Start-Melodie</b>, eigene Melodien dieser Form, <b>Vorlagen</b> oder <b>Frei</b>. Oben wechselst du die Form.</p>
  <p><b>Eigene Melodie tippen:</b> Auf den bunten Tasten spielst du mit dem Klang der Form selbst. „Nur für …“ gibt sie dieser einen Form; „Als Start-Melodie für alle Formen“ macht sie zur neuen gemeinsamen Melodie. „Alle Formen spielen wieder die Start-Melodie“ stellt alle zurück – eigene Melodien bleiben in der Sammlung.</p>` });
