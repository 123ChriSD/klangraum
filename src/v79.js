/* ================= Version 79: Aufnahme-Punkt · Klang-Bibliothek · mehrere Start-Klänge · Text wird Musik ================= */
IC78.rec = sv78('<circle cx="12" cy="12" r="6.500" fill="currentColor" stroke="none"/>');
IC78.book = sv78('<path d="M5 5.500c2.500-1 5-1 7 .500 2-1.500 4.500-1.500 7-.500v13c-2.500-1-5-1-7 .500-2-1.500-4.500-1.500-7-.500z"/><path d="M12 6v13"/>');
IC78.text = sv78('<path d="M5 6h14M5 10h9M5 14h14M5 18h7"/><path d="M17 16v4M17 16l3-1v4"/>');
IC78.cam = sv78('<path d="M4 8h3l2-2h6l2 2h3v11H4z"/><circle cx="12" cy="13" r="3.500"/>');
I67.buch = IC78.book; I67.text = IC78.text;

/* ---------- 1) Mikrofon: eine Aufnahme, für Bibliothek und Dialoge ---------- */
const Mik79 = {
  on: false, node: null, stream: null, chunks: [], t0: 0, tick: 0, cb: null, MAX: 12,
  async start(cb, onLv, onTime) {
    if (this.on) return false; if (!Engine.ctx) { UI.toast("Erst „Eintauchen“ – dann ist der Ton an"); return false; }
    let stream; try { if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error("none"); stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }); } catch (e) { return false; }
    try { const c = Engine.ctx; if (c.state !== "running") c.resume(); const src = c.createMediaStreamSource(stream), node = Engine.makeRec(1), z = c.createGain(); z.gain.value = 0; src.connect(node.input || node); node.connect(z).connect(c.destination);
      this.chunks = []; this.on = true; this.stream = stream; this.node = node; this.cb = cb; this.t0 = performance.now();
      node.port.onmessage = e => { if (e.data.t === "chunk") this.chunks.push(e.data.d[0]); else if (e.data.t === "lvl") { if (onLv) onLv(e.data.v); } else if (e.data.t === "end") this.finish(); };
      node.port.postMessage({ on: true, ch: 1 });
      clearInterval(this.tick); this.tick = setInterval(() => { const s = (performance.now() - this.t0) / 1000; if (onTime) onTime(s); if (s >= this.MAX) this.stop(); }, 100); return true;
    } catch (e) { console.warn(e); try { stream.getTracks().forEach(t => t.stop()); } catch (_) {} this.on = false; return false; }
  },
  stop() { if (!this.on) return; this.on = false; clearInterval(this.tick); try { this.node.port.postMessage({ on: false }); } catch (_) {} try { this.stream.getTracks().forEach(t => t.stop()); } catch (_) {} clearTimeout(this.ft); this.ft = setTimeout(() => this.finish(), 600); },
  finish() { clearTimeout(this.ft); if (!this.node) return; const n = this.chunks.reduce((s, c) => s + c.length, 0), x = new Float32Array(n); let o = 0; for (const c of this.chunks) { x.set(c, o); o += c.length; } try { this.node.disconnect(); } catch (_) {} this.node = null; this.chunks = []; const cb = this.cb; this.cb = null; if (cb) cb(x, Engine.ctx.sampleRate); },
  loud(x, sr) { let pk = 0; for (let i = 0; i < x.length; i += 4) { const a = Math.abs(x[i]); if (a > pk) pk = a; } return x.length >= sr * 0.15 && pk >= 0.01; }
};

/* ---------- 2) Klang-Bibliothek: Klänge merken und in jedem Stück wieder holen ---------- */
const Bib79 = {
  PID: "__bib", list: [], src: null, ren: null,
  async load() { try { this.list = (await DB.all("recs")).filter(r => r.pid === this.PID).sort((a, b) => b.created - a.created); } catch (_) { this.list = []; } return this.list; },
  free(name) { let n = String(name || "Klang").trim().slice(0, 22) || "Klang", k = 2; const have = new Set(this.list.map(r => r.name)); if (!have.has(n)) return n; while (have.has(`${n} ${k}`)) k++; return `${n} ${k}`; },
  async add(x, sr, name) { if (!x || !Mik79.loud(x, sr)) return null; const r = { id: uid("b"), pid: this.PID, name: this.free(name), kind: "klang", sr, created: Date.now(), dur: x.length / sr, ch: [K.toI16(x)], cut: null, peaks: Recs.peaks(x, 60) }; await DB.put("recs", r); this.list.unshift(r); return r; },
  async remove(id) { await DB.del("recs", id); this.list = this.list.filter(r => r.id !== id); },
  async rename(id, name) { const r = this.list.find(x => x.id === id), v = String(name || "").trim().slice(0, 22); if (!r || !v) return; r.name = v; await DB.put("recs", r); },
  audio(r) { return K.fromI16(r.ch[0]); },
  play(r) { if (!Engine.ctx || !r) return; try { if (this.src) this.src.stop(); } catch (_) {} try { const c = Engine.ctx, x = this.audio(r), b = c.createBuffer(1, x.length, r.sr); b.getChannelData(0).set(x); const s = c.createBufferSource(); s.buffer = b; s.connect(Engine.sum || Engine.out); s.start(); this.src = s; } catch (e) { console.warn(e); } },
  /* Klang aus der Bibliothek als Form ins geöffnete Stück */
  toForm(r) { const f = AudioIn.process(this.audio(r), r.sr, r.name); if (f) { try { if (Forms.list.filter(g => !g.empty).length > 1) UI.setView("alle"); } catch (_) {} Hud77.show(IC78.book, f.name, "ist jetzt eine Form im Stück", null, 1600); } return f; },
  samples() { return Forms.list.filter(f => f && !f.empty && f.kind === "sample" && f.sample && f.sample.d); },
  async fromForm(f) { if (!f || !f.sample || !f.sample.d) return null; const r = await this.add(f.sample.d, f.sample.sr, f.name); if (r) Hud77.show(IC78.book, r.name, "in der Bibliothek gemerkt", null, 1600); return r; },
  row(r) { return `<div class="s78c b79c" data-id="${r.id}"><button class="s78o b79o" data-b9="play:${r.id}" aria-label="${esc(r.name)} anhören"><span class="b79p">${IC78.play}</span><span class="s78n">${this.ren === r.id ? "" : `<b>${esc(r.name)}</b>`}<small>${fmt(r.dur, 1)} s · ${Stuecke78.when(r.created)}</small></span></button>
      ${this.ren === r.id ? `<input class="txt s78in" id="b79Ren" value="${esc(r.name)}" maxlength="22" aria-label="Neuer Name">` : ""}
      <div class="s78a"><button data-b9="use:${r.id}">${IC78.plus}<span>Ins Stück</span></button><button data-b9="ren:${r.id}">${IC78.pen}<span>Name</span></button><button data-b9="del:${r.id}" class="del">${IC78.bin}<span>Löschen</span></button></div></div>`; },
  body() { const S = this.samples(), have = new Set(this.list.map(r => r.name)); let why = ""; try { why = AudioIn.why(); } catch (_) {}
    return `<div class="s78top"><button class="btn primary b79rec" data-b9="rec" aria-pressed="${Mik79.on}"><i class="lvdot"></i><span>${Mik79.on ? "Stopp" : "Klang aufnehmen"}</span></button><span class="btn filebtn">${IC78.inn}<span>Audiodatei</span><input type="file" id="b79File" accept="audio/*,.mp3,.m4a,.wav,.ogg,.oga,.opus,.aac,.flac,.webm" aria-label="Audiodatei in die Bibliothek laden"></span></div>
      <div class="meter rn75m"><i id="b79Lv"></i></div><p class="rn75msg" id="b79Msg" aria-live="polite">${why ? esc(why) + " „Audiodatei“ geht trotzdem." : "Bis zu zwölf Sekunden: Stimme, Instrument, Geräusch. Der Klang bleibt hier – für jedes Stück."}</p>
      ${S.length ? `<h3 class="ph3">Aus diesem Stück</h3><div class="b79s">${S.map(f => `<button class="eb" data-b9="keep:${f.id}"${have.has(f.name) ? " disabled" : ""}>${IC78.book}<span>${esc(f.name)} ${have.has(f.name) ? "ist gemerkt" : "merken"}</span></button>`).join("")}</div>` : ""}
      <h3 class="ph3">Meine Klänge <small>${this.list.length}</small></h3><div class="s78l" id="b79L">${this.list.map(r => this.row(r)).join("") || `<p class="s78no">Noch kein Klang. Nimm einen auf – oder merke dir den Klang einer eigenen Form.</p>`}</div>`; },
  async open() { await this.load(); this.ren = null; const s = Sheets.open("Klänge", Sheets.head("Klang-Bibliothek") + `<div id="b79S">${this.body()}</div>`); s.classList.add("s78");
    s.addEventListener("click", e => { const b = e.target.closest("[data-b9]"); if (b) this.act(b.dataset.b9, b); });
    s.addEventListener("change", async e => { if (e.target.id === "b79File") { const f = e.target.files[0]; e.target.value = ""; if (f) await this.file(f); } if (e.target.id === "b79Ren") { const id = this.ren; this.ren = null; await this.rename(id, e.target.value); this.sync(); } });
    return s; },
  sync() { const b = $("b79S"); if (b) { b.innerHTML = this.body(); const r = $("b79Ren"); if (r) { r.focus(); r.select(); } } },
  msg(t) { const m = $("b79Msg"); if (m) m.textContent = t; },
  async got(x, sr, name) { const r = await this.add(x, sr, name); if (!r) { this.sync(); return this.msg("Zu leise oder zu kurz – bitte näher ans Mikrofon und etwas länger."); } Hap(12); this.sync(); this.msg(`„${r.name}“ ist gemerkt.`); },
  async file(f) { if (!Engine.ctx || !f) return; try { const ab = await AudioIn.decodeFile(f), n = Math.min(ab.length, ab.sampleRate * Mik79.MAX), x = new Float32Array(n); for (let c = 0; c < ab.numberOfChannels; c++) { const d = ab.getChannelData(c); for (let i = 0; i < n; i++) x[i] += d[i] / ab.numberOfChannels; } await this.got(x, ab.sampleRate, f.name.replace(/\.[^.]+$/, "")); } catch (e) { this.msg("Diese Datei kann der Browser nicht lesen. WAV, MP3 oder M4A gehen meistens."); } },
  async act(k, b) {
    const i = k.indexOf(":"), a = i < 0 ? k : k.slice(0, i), id = i < 0 ? "" : k.slice(i + 1), r = this.list.find(x => x.id === id); Hap(8);
    try {
      if (a === "rec") { if (Mik79.on) return Mik79.stop(); const ok = await Mik79.start((x, sr) => this.got(x, sr, "Klang"), v => { const l = $("b79Lv"); if (l) l.style.width = Math.min(100, v * 140) + "%"; }, s => this.msg(`● Nimmt auf … ${fmt(s, 1)} s – „Stopp“ beendet`));
        if (!ok) { let w = ""; try { w = AudioIn.why(); } catch (_) {} return this.msg((w || "Das Mikrofon wurde nicht freigegeben.") + " Wähle stattdessen eine Audiodatei."); } return this.sync(); }
      if (a === "play") return this.play(r);
      if (a === "use" && r) { UI.hideSheets(); return this.toForm(r); }
      if (a === "ren") { this.ren = this.ren === id ? null : id; return this.sync(); }
      if (a === "keep") { await this.fromForm(Forms.byId(id)); return this.sync(); }
      if (a === "del") { if (b.dataset.sure !== "1") { b.dataset.sure = "1"; b.querySelector("span").textContent = "Wirklich?"; return setTimeout(() => { if (b.isConnected) { b.dataset.sure = ""; b.querySelector("span").textContent = "Löschen"; } }, 2600); } await this.remove(id); return this.sync(); }
    } catch (e) { console.warn(e); UI.toast("Das hat nicht geklappt", 1800); }
  }
};

/* ---------- 3) Neues Stück: mehrere eigene Klänge, auch aus der Bibliothek ---------- */
RecNP.MAXK = 6;
RecNP.L = function () { const S = this.S(); if (!S) return []; if (!Array.isArray(S.recs)) S.recs = []; return S.recs; };
{ const got = RecNP.got.bind(RecNP); RecNP.got = function (x, sr, name) { const S = this.S(), L = this.L(); got(x, sr, name); if (S && S.rec && S.rec.x && !L.includes(S.rec)) { if (L.length >= this.MAXK) L.shift(); let n = 1; while (L.some(r => r.name === `${S.rec.name} ${n}`)) n++; if (/^(Stimme|Aufnahme)$/.test(S.rec.name) || L.some(r => r.name === S.rec.name)) S.rec.name = `${S.rec.name} ${n}`; L.push(S.rec); this.rerender(); } };
  RecNP.card = function (R, i) { const d = R.d || [];
    return `<div class="r79c"><div class="r79h"><button class="eb" data-rn="play:${i}" aria-label="${esc(R.name)} anhören">${I67.play}</button><span><b>${esc(R.name)}</b><small>${fmt(R.x.length / R.sr, 1)} s${d.length >= 2 ? ` · Töne: ${d.map(k => StartMel.lab(k)).join(" ")}` : ""}${R.bib ? " · aus der Bibliothek" : ""}</small></span>${R.bib ? "" : `<button class="eb" data-rn="bib:${i}" aria-label="${esc(R.name)} in der Bibliothek merken"${R.kept ? " disabled" : ""}>${IC78.book}<span>${R.kept ? "gemerkt" : "Merken"}</span></button>`}<button class="eb" data-rn="drop:${i}" aria-label="${esc(R.name)} verwerfen">${I67.trash}</button></div>
      <div class="sm74l"><span>spielt</span><span class="eseg sm74seg"><button data-rn="mode:${i}:start" aria-pressed="${R.mode === "start"}">die Start-Melodie</button><button data-rn="mode:${i}:eigen" aria-pressed="${R.mode === "eigen"}"${d.length < 2 ? " disabled" : ""}>ihre eigene</button><button data-rn="mode:${i}:frei" aria-pressed="${R.mode === "frei"}">nichts vor</button></span></div>
      ${d.length >= 2 ? `<button class="eb rn75all" data-rn="all:${i}">Diese Töne als Start-Melodie für alle nehmen</button>` : ""}</div>`; };
  RecNP.sec = function (S) { const L = this.L(), full = L.length >= this.MAXK; let why = ""; try { why = AudioIn.why(); } catch (_) {} const B = Bib79.list;
    return `<div class="rn75" id="rn75S"><h3 class="ph3">Eigene Klänge <small>wahlweise · bis ${this.MAXK}</small></h3><p class="kch">Nimm Töne auf – Stimme, Instrument, Geräusch – einen nach dem anderen. Aus <b>jedem</b> wird eine eigene Form im neuen Stück.</p>
      ${L.map((R, i) => this.card(R, i)).join("")}
      <div class="rn75bar"><button class="eb rn75go${this.rec ? " q7rec" : ""}" data-rn="mic" aria-pressed="${!!this.rec}"${full && !this.rec ? " disabled" : ""}><i class="lvdot"></i><span>${this.rec ? "Stopp" : L.length ? "Noch einen aufnehmen" : "Aufnehmen"}</span></button><span class="btn filebtn rn75f">Audiodatei<input type="file" id="rn75File" accept="audio/*,.mp3,.m4a,.wav,.ogg,.oga,.opus,.aac,.flac,.webm" aria-label="Audiodatei wählen"${full ? " disabled" : ""}></span></div>
      <div class="meter rn75m"><i id="rn75Lv"></i></div>
      <p class="rn75msg" id="rn75Msg" aria-live="polite">${full ? `${this.MAXK} Klänge sind das Höchste für den Anfang – weitere kommen später über „Aufnahme“.` : why ? esc(why) + " „Audiodatei“ geht trotzdem." : L.length ? "Jede Aufnahme bis zwölf Sekunden." : "Bis zu zwölf Sekunden. Singst oder spielst du mehrere Töne nacheinander, erkennt KLANGRAUM die Melodie."}</p>
      ${B.length ? `<div class="r79b"><span>Aus der Bibliothek</span><div class="r79bl">${B.slice(0, 12).map(r => `<button class="eb" data-rn="lib:${r.id}" aria-pressed="${L.some(x => x.bib === r.id)}">${esc(r.name)}</button>`).join("")}</div></div>` : ""}</div>`; };
  const act = RecNP.act.bind(RecNP); RecNP.act = function (k) {
    const S = this.S(); if (!S) return; const L = this.L(), p = k.split(":"), i = +p[1], R = L[i];
    if (p[0] === "play" && R) { Hap(8); S.rec = R; return this.play(); }
    if (p[0] === "drop" && p.length > 1) { Hap(8); L.splice(i, 1); S.rec = L[L.length - 1] || null; return this.rerender(); }
    if (p[0] === "mode" && p.length === 3 && R) { Hap(8); R.mode = p[2]; return this.rerender(); }
    if (p[0] === "all" && p.length > 1 && R && R.d.length >= 2) { Hap(8); S.mel = R.d.slice(0, StartMel.MAXN); R.mode = "start"; this.rerender(); try { StartMel.act("play"); } catch (_) {} return UI.toast("Diese Töne sind jetzt die Start-Melodie für alle Formen", 2600); }
    if (p[0] === "bib" && R) { Hap(8); return Bib79.add(R.x, R.sr, R.name).then(r => { if (r) { R.kept = true; this.rerender(); } }); }
    if (p[0] === "lib") { Hap(8); const id = k.slice(4), j = L.findIndex(x => x.bib === id); if (j >= 0) { L.splice(j, 1); S.rec = L[L.length - 1] || null; return this.rerender(); } if (L.length >= this.MAXK) return; const r = Bib79.list.find(x => x.id === id); if (!r) return; const x = Bib79.audio(r); let notes = [], d = []; try { notes = this.track(x, r.sr); d = this.degs(notes, StartMel.mood()); } catch (_) {} const o = { x, sr: r.sr, name: r.name, notes, d, mode: S.mel && S.mel.length ? "start" : "frei", bib: id }; L.push(o); S.rec = o; return this.rerender(); }
    if (k === "drop") { L.length = 0; S.rec = null; return this.rerender(); }
    return act(k); };
  /* beim Anlegen: aus jedem Klang wird eine Form (die ältere Hülle sieht keinen einzelnen mehr) */
  const go = NewPiece.go.bind(NewPiece); NewPiece.go = async function () { let L = [], d = [], O = { r: 1, kanon: false, go: true }; try { if (RecNP.rec) RecNP.stop(); const S = this.st; if (S) { L = (Array.isArray(S.recs) ? S.recs : S.rec && S.rec.x ? [S.rec] : []).slice(0, RecNP.MAXK); S.rec = null; d = Array.isArray(S.mel) ? S.mel.slice() : []; if (S.mo) O = { r: S.mo.r, kanon: !!S.mo.kanon, go: S.mo.go !== false }; } } catch (_) {}
    const r = await go(); let n = 0; for (const R of L) { try { if (RecNP.after(R, d, O)) n++; } catch (e) { console.warn(e); } } if (n > 1) UI.toast(`${n} eigene Klänge sind als Formen im Stück`, 3200); return r; };
  const op = NewPiece.open.bind(NewPiece); NewPiece.open = function (...a) { const r = op(...a); Bib79.load().then(L => { if (L.length && $("rn75S")) RecNP.rerender(); }).catch(() => {}); return r; }; }

/* ---------- 4) Text wird Musik ---------- */
const Text79 = {
  st: null, busy: false, MAXT: 8,
  ARTEN: [["buch", "Buchstaben", "Jeder Buchstabe ist ein Ton: A ist der Grundton, B die nächste Stufe … nach N geht es wieder bei A los. Selbstlaute klingen lang, Mitlaute kurz, Großbuchstaben betont."], ["wort", "Wortlängen", "Jedes Wort ist ein Ton: Die Zahl der Buchstaben bestimmt die Tonhöhe (ein Buchstabe = Grundton), die Silben bestimmen die Länge."], ["namen", "Notennamen", "Nur C D E F G A H (und B, S) klingen – als die Töne, die sie heißen. Alle anderen Buchstaben halten den Ton."]],
  ZEIT: [["ruhig", "ruhig", 4], ["normal", "normal", 2], ["flink", "lebhaft", 1]],
  VOK: "aeiouäöüy",
  /* Text → Folge von Tönen und Pausen: { k: Stufe oder null, n: Länge in Sechzehnteln, v: Stärke, br: Zeilenende } */
  notes(text, o = {}) {
    const art = o.art || "buch", u = o.unit || 2, out = [], T = String(text || "").replace(/\r/g, "").slice(0, 4000);
    const push = (k, n, v) => { const l = out[out.length - 1]; if (k == null && l && l.k == null) { l.n = Math.max(l.n, n); return; } out.push({ k, n, v: v || 0 }); };
    const rest = ch => { if (ch === "\n") { const l = out[out.length - 1]; if (l) l.br = true; return push(null, 2 * u); } if (/[.!?…]/.test(ch)) return push(null, 4 * u); if (/[,;:–—()\-]/.test(ch)) return push(null, 2 * u); if (/\s/.test(ch)) return push(null, u); };
    const idx = c => { const b = { "ä": "a", "ö": "o", "ü": "u", "ß": "s" }[c] || c, i = b.charCodeAt(0) - 97; return i >= 0 && i < 26 ? i : -1; };
    if (art === "wort") {
      for (const m of T.matchAll(/([A-Za-zÄÖÜäöüß]+)|(\d+)|([^A-Za-zÄÖÜäöüß\d])/g)) {
        if (m[1]) { const w = m[1], L = w.length, syl = Math.max(1, (w.toLowerCase().match(/[aeiouäöüy]+/g) || []).length); push((L - 1) % 14, clamp(syl, 1, 4) * 2 * u, w[0] !== w[0].toLowerCase() ? 0.95 : 0.76); }
        else if (m[2]) push((+m[2]) % 14, 2 * u, 0.8); else if (!/\s/.test(m[3]) || m[3] === "\n") rest(m[3]);   /* Wortabstand: kein Loch, die Töne folgen aufeinander */
      }
    } else {
      let prev = "";
      for (const ch of T) {
        const lc = ch.toLowerCase(), i = idx(lc);
        if (i < 0) { if (/\d/.test(ch)) push(+ch, 2 * u, 0.8); else rest(ch); prev = ""; continue; }
        const up = ch !== lc, l = out[out.length - 1];
        if (art === "namen") { const k = { c: 0, d: 1, e: 2, f: 3, g: 4, a: 5, h: 6, b: 6, s: 2 }[lc === "ß" ? "s" : lc]; if (k == null) { if (l && l.k != null) l.n += u; else push(null, u); } else push(k, 2 * u, up ? 0.95 : 0.78); prev = lc; continue; }
        if (lc === prev && l && l.k != null) { l.n += u; continue; }   /* Doppelbuchstabe: der Ton wird länger */
        const vok = this.VOK.includes(lc); push((i % 14) + ("äöü".includes(lc) ? 1 : 0), (vok ? 2 : 1) * u, up ? 0.95 : vok ? 0.8 : 0.7); prev = lc;
      }
    }
    while (out.length && out[out.length - 1].k == null) out.pop(); while (out.length && out[0].k == null) out.shift();
    return out;
  },
  /* Töne auf Spuren verteilen: höchstens 16 Takte je Spur, Umbruch am liebsten am Zeilen- oder Satzende */
  takes(N, max = 256) {
    const out = []; let cur = [], len = 0, cut = -1, cutLen = 0;
    const flush = (upto) => { const part = upto == null ? cur : cur.slice(0, upto), restN = upto == null ? [] : cur.slice(upto); while (part.length && part[part.length - 1].k == null) part.pop(); if (part.length) out.push(part); cur = restN; while (cur.length && cur[0].k == null) cur.shift(); len = cur.reduce((s, e) => s + e.n, 0); cut = -1; cutLen = 0; };
    for (const e of N) { if (len + e.n > max) { if (cut > 0 && cutLen >= max * 0.5) flush(cut); else flush(); } cur.push(e); len += e.n; if (e.k == null && e.n >= 4 || e.br) { cut = cur.length; cutLen = len; } }
    flush(); return out;
  },
  /* eine Spur → Ereignisse einer Loop-Spur */
  events(part, tonic, mu) { const ev = []; let s = 0; for (const e of part) { if (e.k != null) { const m = tonic + mu.so(e.k); ev.push({ s, d: Math.max(0.5, e.n * 0.92), m, v: clamp(e.v || 0.75, 0.05, 1), u: clamp((m - 28) / 60, 0, 1) }); } s += e.n; } return { ev, bars: clamp(Math.ceil(s / 16), 1, 16) }; },
  info(text, o) { const N = this.notes(text, o), T = this.takes(N), tones = N.filter(e => e.k != null).length, bars = T.reduce((s, p) => s + this.events(p, 60, { so: k => k }).bars, 0); return { N, T, tones, bars, cut: T.length > this.MAXT }; },
  style() { return SongGen.byId(this.st.style) || SongGen.STYLES[0]; },
  /* Vertonen: neues Stück mit Band im gewählten Stil – die Melodie kommt aus dem Text */
  async make(neu) {
    const S = this.st; if (!S || this.busy) return; const I = this.info(S.text, S); if (!I.tones) return this.msg("Im Text stehen noch keine Buchstaben, die klingen können.");
    this.busy = true; Hap(14);
    try {
      const St = this.style(), parts = I.T.slice(0, this.MAXT); let lead = null;
      const old = !neu && Projects.cur && Projects.cur.text79 ? Forms.byId(Projects.cur.text79.lead) : null;
      if (old) { lead = old; Undo.push(); }
      else {
        if (Transport.running) Transport.stop();
        const nm = ("Text: " + S.text.trim().split(/\s+/).slice(0, 3).join(" ")).slice(0, 28);
        await Projects.create(nm, "leer");
        if (S.band) { const one = St.parts.some(p => p.r === "mel") ? { ...St, parts: St.parts.filter(p => p.r !== "hook") } : St;   /* nur eine Melodie-Stimme: die aus dem Text */
          const made = SongGen.fill(one, (Math.floor(Math.random() * 4e9) + 1) >>> 0); if (!made) return; lead = made.mel || made.hook || Object.values(made).find(f => f.kind !== "drum"); }
        else { SongGen.meta = null; const m = K.MOODS.find(x => x.id === St.mood); if (m) Music.set(m); Music.setTempo(St.bpm); lead = Forms.make({ seedId: "klavier", name: "Text" }); if (lead) { Forms.rebuild(lead, true); lead.still = false; lead.takes = []; } Song.sections = []; }
        if (!lead) return;
        try { if (SongGen.meta && SongGen.meta.roles) delete SongGen.meta.roles[lead.id]; if (SongGen.meta) SongGen.meta.fresh = false; } catch (_) {}
        lead.name = "Text";
      }
      const mood = Music.mood, mu = Music.mu, tonic = 60 + mod(mood.root - 60, 12), others = Forms.list.filter(f => f && !f.empty && f !== lead).map(f => f.id);
      lead.takes = []; const tk = parts.map((p, i) => { const E = this.events(p, tonic, mu), t = Loops.newTake(lead, E.bars, E.ev, `Text ${i + 1}`); t.base = 0; return t; });
      Song.sections = tk.map((t, i) => ({ id: uid("s"), name: `Teil ${i + 1}`, bars: t.bars, on: [lead.id, ...(i === 0 && tk.length > 2 ? others.slice(1) : others)], off: tk.filter(x => x !== t).map(x => x.id), mel: {}, lv: {}, tr: null, bpm: null, beat: null }));
      Song.intro = 0; Song.outro = 0;
      Projects.cur.text79 = { text: S.text, art: S.art, unit: S.unit, style: S.style, band: S.band, lead: lead.id };
      Forms.setActive(lead); UI.hideSheets(); UI.setTab("song"); UI.refresh(); Save.soon(); try { await Save.now(); } catch (_) {}
      setTimeout(() => { try { if (UI.tab === "song" && !Song.playing) SongUI.play(0); } catch (e) { console.warn(e); } }, 450);
      UI.toastAct(`Dein Text klingt: ${I.tones} Töne in ${tk.length} ${tk.length === 1 ? "Teil" : "Teilen"}${I.cut ? " (der Rest war zu lang)" : ""}`, "Live-Fläche", () => { try { Live70.open(); } catch (e) { console.warn(e); } }, 9000);
      return lead;
    } catch (e) { console.warn(e); this.msg("Das Vertonen hat nicht geklappt."); } finally { this.busy = false; }
  },
  /* kurz anhören, ohne etwas anzulegen */
  listen() { const S = this.st, I = this.info(S.text, S), c = Engine.ctx; if (!c || !I.tones) return; const St = this.style(), mood = K.MOODS.find(x => x.id === St.mood) || Music.mood, mu = K.music(mood), tonic = 60 + mod(mood.root - 60, 12), spb = 60 / St.bpm / 4; let t = c.currentTime + 0.08, n = 0;
    for (const e of I.N) { if (e.k != null) { StartMel.beep(tonic + mu.so(e.k), t, Math.min(0.6, e.n * spb * 0.9)); n++; } t += e.n * spb; if (n >= 40 || t - c.currentTime > 14) break; } },
  /* Foto → Text: zuerst die Texterkennung des Geräts, sonst ein Lesemodul aus dem Netz */
  LIB: "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js",
  async shrink(file) { const bmp = await createImageBitmap(file), k = Math.min(1, 1800 / Math.max(bmp.width, bmp.height)), cv = document.createElement("canvas"); cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k); cv.getContext("2d").drawImage(bmp, 0, 0, cv.width, cv.height); return cv; },
  lines(blocks) { return blocks.filter(b => b && b.rawValue).sort((a, b) => (a.boundingBox.y - b.boundingBox.y) || (a.boundingBox.x - b.boundingBox.x)).map(b => b.rawValue).join("\n"); },
  loadLib() { if (window.Tesseract) return Promise.resolve(); if (this.libP) return this.libP; return (this.libP = new Promise((ok, no) => { const s = document.createElement("script"); s.src = this.LIB; s.onload = () => (window.Tesseract ? ok() : no(new Error("leer"))); s.onerror = () => { this.libP = null; no(new Error("netz")); }; document.head.appendChild(s); setTimeout(() => { if (!window.Tesseract) { this.libP = null; no(new Error("zeit")); } }, 25000); })); },
  async read(file) {
    const cv = await this.shrink(file);
    if ("TextDetector" in window) { try { const t = this.lines(await new window.TextDetector().detect(cv)); if (t.trim().length > 1) return { text: t, how: "Gerät" }; } catch (_) {} }
    this.msg("Lesemodul wird geladen (einmalig, einige Megabyte) …"); await this.loadLib();
    const w = await window.Tesseract.createWorker("deu", 1, { logger: m => { try { if (m && m.status) this.msg(`${m.status === "recognizing text" ? "Text wird gelesen" : "Lesemodul wird vorbereitet"} … ${Math.round((m.progress || 0) * 100)} %`); } catch (_) {} } });
    try { const r = await w.recognize(cv); return { text: (r && r.data && r.data.text) || "", how: "Lesemodul" }; } finally { try { await w.terminate(); } catch (_) {} }
  },
  clean(t) { return String(t || "").replace(/[ \t]+/g, " ").replace(/ ?\n ?/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/-\n(?=[a-zäöü])/g, "").trim(); },
  async photo(file) {
    if (!file || this.busy) return; this.busy = true; this.msg("Das Foto wird gelesen …"); const b = $("t79S"); if (b) b.classList.add("q7busy");
    try { const r = await Promise.race([this.read(file), new Promise((_, no) => setTimeout(() => no(new Error("zeit")), 90000))]), t = this.clean(r.text);
      if (t.length < 2) this.msg("Auf dem Foto war kein Text zu erkennen. Näher heran, gerade halten, gutes Licht – oder den Text eintippen.");
      else { this.st.text = t; this.sync(); this.msg(`Erkannt (${r.how}): ${t.length} Zeichen. Bitte kurz prüfen – du kannst den Text ändern.`); } }
    catch (e) { console.warn(e); this.msg(String(e && e.message) === "netz" || String(e && e.message) === "zeit" ? "Das Lesemodul ließ sich nicht laden (kein Netz oder hier gesperrt). Tippe den Text ein oder füge ihn ein." : "Das Foto ließ sich nicht lesen. Tippe den Text ein oder füge ihn ein."); }
    finally { this.busy = false; const x = $("t79S"); if (x) x.classList.remove("q7busy"); }
  },
  msg(t) { const m = $("t79Msg"); if (m) m.textContent = t; },
  sum() { const S = this.st, I = this.info(S.text, S), bpm = this.style().bpm, sec = Math.round(Math.min(I.bars, this.MAXT * 16) * 4 * 60 / bpm); return I.tones ? `${I.tones} Töne · ${Math.min(I.T.length, this.MAXT)} ${I.T.length === 1 ? "Teil" : "Teile"} · etwa ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}${I.cut ? " · sehr langer Text: es klingt der Anfang" : ""}` : "Noch kein Text."; },
  body() { const S = this.st, A = this.ARTEN.find(a => a[0] === S.art) || this.ARTEN[0], here = !!(Projects.cur && Projects.cur.text79 && Forms.byId(Projects.cur.text79.lead));
    return `<div class="s78top"><span class="btn primary filebtn">${IC78.cam}<span>Foto aufnehmen</span><input type="file" id="t79Cam" accept="image/*" capture="environment" aria-label="Text fotografieren"></span><span class="btn filebtn">${IC78.inn}<span>Bild wählen</span><input type="file" id="t79Img" accept="image/*" aria-label="Bild mit Text wählen"></span></div>
      <p class="rn75msg" id="t79Msg" aria-live="polite">Fotografiere gedruckten Text – oder tippe ihn ein. Das Foto bleibt auf deinem Gerät.</p>
      <textarea class="t79t" id="t79T" rows="5" maxlength="4000" placeholder="Hier steht der Text. Du kannst ihn ändern." aria-label="Text, der vertont wird">${esc(S.text)}</textarea>
      <div class="sm74l"><span>Lesart</span><span class="eseg sm74seg">${this.ARTEN.map(a => `<button data-t9="art:${a[0]}" aria-pressed="${S.art === a[0]}">${a[1]}</button>`).join("")}</span></div><p class="kch t79e">${A[2]} Leerzeichen und Satzzeichen sind Pausen.</p>
      <div class="sm74l"><span>Gangart</span><span class="eseg sm74seg">${this.ZEIT.map(z => `<button data-t9="unit:${z[2]}" aria-pressed="${S.unit === z[2]}">${z[1]}</button>`).join("")}</span></div>
      <div class="sm74l"><span>Stil</span><span class="t79st">${SongGen.STYLES.map(x => `<button class="eb" data-t9="style:${x.id}" aria-pressed="${S.style === x.id}">${esc(x.n)}</button>`).join("")}</span></div>
      <div class="sm74l"><span>Begleitung</span><span class="eseg sm74seg"><button data-t9="band:1" aria-pressed="${!!S.band}">mit Band</button><button data-t9="band:0" aria-pressed="${!S.band}">nur die Melodie</button></span></div>
      <p class="t79i" id="t79I">${this.sum()}</p>
      <div class="s78top"><button class="btn" data-t9="listen">${IC78.play}<span>Anhören</span></button>${here ? `<button class="btn" data-t9="again">${IC78.text}<span>Hier neu vertonen</span></button>` : ""}<button class="btn primary" data-t9="make">${IC78.text}<span>${here ? "Als neues Stück" : "Vertonen"}</span></button></div>
      <p class="wtip">Es entsteht ein neues Stück. Danach änderst du alles weiter: Töne in den <b>Noten</b>, Instrumente, Tempo, Stimmung – und spielst es auf der <b>Live-Fläche</b>.</p>`; },
  open() { const P = Projects.cur && Projects.cur.text79; if (!this.st) this.st = { text: "", art: "buch", unit: 2, style: SongGen.STYLES[0].id, band: true }; if (P) Object.assign(this.st, { text: P.text, art: P.art, unit: P.unit, style: P.style, band: P.band !== false });
    const s = Sheets.open("Text", Sheets.head("Text wird Musik") + `<div id="t79S">${this.body()}</div>`); s.classList.add("s78");
    s.addEventListener("click", e => { const b = e.target.closest("[data-t9]"); if (b) this.act(b.dataset.t9); });
    s.addEventListener("input", e => { if (e.target.id === "t79T") { this.st.text = e.target.value; const i = $("t79I"); if (i) i.textContent = this.sum(); } });
    s.addEventListener("change", e => { if (e.target.id === "t79Cam" || e.target.id === "t79Img") { const f = e.target.files[0]; e.target.value = ""; if (f) this.photo(f); } });
    return s; },
  sync() { const b = $("t79S"); if (b) b.innerHTML = this.body(); },
  act(k) { const S = this.st, i = k.indexOf(":"), a = i < 0 ? k : k.slice(0, i), v = i < 0 ? "" : k.slice(i + 1); Hap(8);
    if (a === "art") { S.art = v; return this.sync(); } if (a === "unit") { S.unit = +v; return this.sync(); } if (a === "style") { S.style = v; return this.sync(); } if (a === "band") { S.band = v === "1"; return this.sync(); }
    if (a === "listen") return this.listen(); if (a === "make") return this.make(true); if (a === "again") return this.make(false); }
};

/* ---------- 5) Vierter Punkt: Aufnahme ---------- */
P78.NAME.aufn = "Aufnahme";
P78.X.bibrec = { ic: IC78.book, n: () => "Klang merken", run: () => Bib79.open().then(() => setTimeout(() => Bib79.act("rec"), 250)) };
P78.X.bibform = { ic: IC78.book, n: () => "Klang merken", vis: f => !!(f && f.kind === "sample" && f.sample), run: () => Bib79.fromForm(P78.f()), keep: true };
P78.SH["Text wird Musik"] = "Text vertonen"; P78.SH["Klang-Bibliothek"] = "Klänge"; P78.HY.Klänge = "Klänge";
try { Alles73.MAKE.push(["text", "text", "Text wird Musik", "Foto von Text lesen – Buchstaben und Wörter werden Töne"], ["bib", "buch", "Klang-Bibliothek", "Eigene Klänge merken und in jedes Stück holen"]); const ac = Alles73.act.bind(Alles73); Alles73.act = function (k) { if (k === "mk:text") { UI.hideSheets(); return setTimeout(() => Text79.open(), 80); } if (k === "mk:bib") { UI.hideSheets(); return setTimeout(() => Bib79.open(), 80); } return ac(k); }; } catch (_) {}
P78.T = {
  stueck: [["neu", "pieces", "sichern", "fav", "kopie", "export"], ["import", "a:mk:bib", "c:tBild", "a:mk:text", "c:jam", "a:tab:start"], ["c:undo", "c:help", "a:mk:erkl", "a:mk:gesten", "c:cfg", "einst"], ["c:zonen", "c:scan", "c:ring", "c:phys", "c:formen", "klassisch"], ["alles"]],
  aufn: [["c:rec", "c:loop", "c:mel", "c:micform", "c:gesang", "bibrec"], ["c:retro", "c:setrec", "c:tStueck"]],
  musik: [["startstop", "a:mk:outro", "auflegen", "a:mk:live", "c:pads", "a:mk:gen"], ["a:tab:song", "c:scenes", "a:tab:mix", "c:mixer", "c:tLoop", "c:tBeat"], ["bpm-", "bpm", "bpm+", "mood", "c:tSchnitt", "alltoggle"], ["c:soloall", "c:lpause", "c:lreset", "c:resetAll", "c:setadd", "c:setstart"], ["c:vnah", "c:valle", "c:vraum", "c:zreset", "c:full", "c:setstop"], ["c:setlist"]],
  form: [["c:playmode", "c:keys", "a:mk:tasten", "a:mk:noten", "c:knead", "c:brush"], ["c:inst", "c:snd", "a:mk:melw", "bibform", "c:onoff", "c:solo"], ["vol", "c:vol", "c:fine", "c:shape0"], ["c:spin", "c:slower", "rpb", "c:faster", "c:flip", "c:swing"], ["c:lhold", "c:ledit", "c:station", "c:ldel1", "c:ldelall"], ["c:new", "c:copy", "c:sheet", "c:del"]]
};
P78.PTS = ["stueck", "aufn", "musik", "form"];
P78.step = function (s) {
  if (!s.forms) return ["form", "c:new"]; if (!s.loops && !s.moving) return ["form", "c:spin"]; if (!s.loops) return ["aufn", "c:loop"]; if (s.forms < 2) return ["form", "c:new"];
  if (!s.song) return ["musik", "a:mk:gen"]; if (!s.rec) return ["aufn", "c:rec"]; if (!s.fav) return ["stueck", "fav"]; return ["stueck", "export"];
};
/* läuft gerade eine Aufnahme? Dann beendet der Punkt sie */
P78.recKind = function () { try { if (Rec.on) return "rec"; } catch (_) {} try { if (LoopSt.R) return "loop"; } catch (_) {} try { if (Mik79.on) return "mik"; } catch (_) {} return null; };
P78.recOn = function () { return !!this.recKind(); };
{ const el = P78.el.bind(P78); P78.el = function () { const e = el(); if (!e.querySelector('[data-p="aufn"]')) { const b = document.createElement("button"); b.className = "p78p p78r"; b.dataset.p = "aufn"; b.setAttribute("aria-label", "Aufnahme: Stück mitschneiden, Loop, Melodie, Mikrofon, Klang merken. Läuft eine Aufnahme, beendet ein Tipp sie"); b.innerHTML = `<i>${IC78.rec}</i><b>Aufnahme</b>`; const m = e.querySelector('[data-p="musik"]'); m.parentNode.insertBefore(b, m); } return e; };
  const tap = P78.tap.bind(P78); P78.tap = function (p, top) { if (p === "aufn") { const k = this.recKind(); if (k) { Hap(14); try { if (k === "rec") Rec.stop(); else if (k === "loop") Cmd.run("loop", this.f()); else Mik79.stop(); } catch (e) { console.warn(e); } Hud77.show(IC78.stop, "Aufnahme", "beendet", null, 1200); return setTimeout(() => this.paint(true), 80); } } return tap(p, top); };
  const ti = P78.title.bind(P78); P78.title = function (p) { if (p === "aufn") { const f = this.f(); return `<b>Aufnahme</b><small>${f ? "Loop und Melodie gelten für " + esc(f.name) : ""}</small>`; } return ti(p); };
  const pt = P78.paint.bind(P78); P78.paint = function (force) { const r = pt(force); try { const b = document.querySelector('.p78p[data-p="aufn"]'), on = this.recOn(); if (b && b.classList.contains("on") !== on) { b.classList.toggle("on", on); b.querySelector("b").textContent = on ? "Stopp" : "Aufnahme"; } const m = document.querySelector(".p78m"); if (m) m.classList.remove("rec"); } catch (_) {} return r; };
  const kd = e => { if (!P78.on || !e.target || !e.target.closest || e.target.closest("input, textarea, select") || e.ctrlKey || e.metaKey || e.altKey || Sheets.cur) return; if (e.key === "4") P78.tap("aufn"); }; document.addEventListener("keydown", kd); }
Help.T.push({ id: "v79", ic: "●", t: "Aufnahme-Punkt, Klang-Bibliothek und Text wird Musik", k: "aufnahme aufnehmen punkt roter knopf mitschneiden bibliothek klang klänge speichern merken sound mehrere starttöne start klänge text foto buchstaben alphabet wort wortlänge noten vertonen lesen erkennen ocr",
  h: `<p><b>Aufnahme-Punkt</b> (unten, rot): ein Ort für alles, was aufnimmt – Stück mitschneiden, Loop, Melodie, Mikrofon → Form, Gesang, Klang merken, Rückblick. Läuft eine Aufnahme, zeigt der Punkt „Stopp“ – ein Tipp beendet sie.</p>
  <p><b>Klang-Bibliothek</b> (Stück → Klänge): Nimm Klänge auf oder merke dir den Klang einer eigenen Form. Sie bleiben auf dem Gerät und lassen sich in jedes Stück holen – mit „Ins Stück“ oder beim Zusammenstellen eines neuen Stücks.</p>
  <p><b>Mehrere Start-Klänge</b> (Neues Stück → Eigene Klänge): Nimm bis zu sechs Töne nacheinander auf oder wähle welche aus der Bibliothek. Aus jedem wird eine eigene Form; für jede legst du fest, ob sie die Start-Melodie, ihre eigene oder nichts vorspielt.</p>
  <p><b>Text wird Musik</b> (Stück → Text → Musik): Fotografiere gedruckten Text oder tippe ihn ein. Drei Lesarten:<br><b>Buchstaben</b> – A ist der Grundton, jeder weitere Buchstabe eine Stufe höher, nach N wieder von vorn; Selbstlaute lang, Mitlaute kurz, Großbuchstaben betont, Doppelbuchstaben länger.<br><b>Wortlängen</b> – jedes Wort ein Ton: Buchstabenzahl = Tonhöhe, Silben = Länge.<br><b>Notennamen</b> – nur C D E F G A H klingen, als die Töne, die sie heißen.<br>Leerzeichen und Satzzeichen sind Pausen. Du wählst Gangart, Stil und ob eine Band begleitet. „Vertonen“ legt ein neues Stück an; danach änderst du alles in den Noten, im Song und auf der Live-Fläche.</p>
  <p>Zum Lesen nutzt KLANGRAUM die Texterkennung des Geräts; gibt es keine, wird einmalig ein Lesemodul aus dem Netz geladen. Das Foto verlässt dein Gerät nicht.</p>` });
