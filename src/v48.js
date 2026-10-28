/* ============================================================
   v48: Jam wechselt Vermittler selbst · Bilderkennung mit 6 weiteren Szenen · „Neues Stück“ mit Vorauswahl ·
        Set-Reihenfolge = Anordnung in „Alle“ (Doppeltipp auf den Namen und schieben) · ▶/⏸ direkt im Namen ·
        Raum mit Punkten statt Namensschildern (tippen = ▶/⏸, ziehen = verschieben) · Mikrofon beim Start · Hilfe geordnet
   ============================================================ */

// ---------- 1) Jam: auf allen erreichbaren Vermittlern zugleich – wer sich trifft, spielt zusammen ----------
NetJam.join = async function (name) {
  const code = String(name).replace(/^jam-/, ""), letter = code[0], me = "k" + Math.random().toString(36).slice(2, 10), base = `klangraum/jam1/${code}`;
  const ov = store.get("jamBroker"), order = ov ? [["x", ov]] : [...this.BROKERS].sort((a, b) => (a[0] === letter ? -1 : 0) - (b[0] === letter ? -1 : 0));
  // sobald einer verbunden ist, höchstens 1,5 s auf die übrigen warten; spätere kommen still dazu
  const conns = [], late = [], ps = order.map(([, u], i) => this.connect(u, "klangraum-" + me + "-" + i, 6000).then(c => { c.url = u; if (ready) late.push(c); else conns.push(c); return c; }));
  let ready = false; try { await Promise.any(ps); } catch (_) { throw Object.assign(new Error("Kein Vermittler erreichbar"), { code: "offline" }); }
  await Promise.race([Promise.allSettled(ps), new Promise(r => setTimeout(r, 1500))]); ready = true;
  const peers = new Map(), pfn = new Set(), efn = new Map(), seen = new Map(); let mine = null, gone = false, seq = 0;
  const list = () => [{ peer: me, isMe: true, presence: mine }, ...[...peers.entries()].map(([peer, p]) => ({ peer, isMe: false, presence: p.st, guest: true }))];
  const fire = joined => { const ch = { peers: list(), joined: joined || [] }; for (const f of pfn) try { f(ch); } catch (e) { console.warn(e); } };
  const pubAll = (t, obj) => { const s = JSON.stringify({ ...obj, from: me, q: ++seq }); for (const c of conns) this.pub(c, t, s); };
  const onMsg = (topic, txt) => {
    let m; try { m = JSON.parse(txt); } catch (_) { return; } if (!m || m.from === me) return;
    const id = m.from + ":" + m.q; if (m.q != null) { if (seen.has(id)) return; seen.set(id, Date.now()); if (seen.size > 600) { const cut = Date.now() - 20000; for (const [k, t] of seen) if (t < cut) seen.delete(k); } }
    if (topic === base + "/p") { const isNew = !peers.has(m.from); if (m.left) { if (peers.delete(m.from)) fire(); return; } peers.set(m.from, { st: m.st, t: Date.now() }); fire(isNew ? [{ peer: m.from, isMe: false }] : []); if (isNew && mine) pubAll(base + "/p", { st: mine }); return; }
    if (topic.startsWith(base + "/e/")) { const k = topic.slice(base.length + 3), fs = efn.get(k); if (fs) for (const f of fs) try { f({ peer: m.from, isMe: false, data: m.d }); } catch (e) { console.warn(e); } }
  };
  // jede Verbindung einzeln: fällt eine weg, läuft es über die anderen weiter, und sie wird still neu aufgebaut
  const hook = c => { c.onMsg = onMsg; NetJam.sub(c, base + "/#"); c.onClose = () => { const i = conns.indexOf(c); if (i >= 0) conns.splice(i, 1); if (gone) return; if (!conns.length) { gone = true; clearInterval(sweep); if (Jam.room && Jam.room.__id === rid) NetJam.lost(); return; } retry(c.url, 4000); }; };
  const rid = Math.random();
  const retry = (u, ms) => setTimeout(async () => { if (gone || conns.some(c => c.url === u)) return; try { const c = await NetJam.connect(u, "klangraum-" + me + "-r" + Math.random().toString(36).slice(2, 5), 6000); if (gone) { try { c.ws.close(); } catch (_) {} return; } c.url = u; conns.push(c); hook(c); if (mine) NetJam.pub(c, base + "/p", JSON.stringify({ st: mine, from: me, q: ++seq })); } catch (_) { retry(u, Math.min(60000, ms * 2)); } }, ms);
  for (const c of conns) hook(c);
  // späte Verbindungen übernehmen; was gar nicht kam, später erneut versuchen
  ps.forEach((p, i) => p.then(c => { if (!conns.includes(c)) { if (gone) { try { c.ws.close(); } catch (_) {} return; } conns.push(c); hook(c); if (mine) NetJam.pub(c, base + "/p", JSON.stringify({ st: mine, from: me, q: ++seq })); } }, () => { if (!gone) retry(order[i][1], 15000); }));
  void late;
  const sweep = setInterval(() => { const now = Date.now(); let ch = false; for (const [k, p] of peers) if (now - p.t > 14000) { peers.delete(k); ch = true; } if (ch) fire(); }, 3000);
  return {
    net: true, __id: rid, get brokers() { return conns.map(c => c.url); },
    async presence(st) { mine = st; pubAll(base + "/p", { st }); },
    onPeers(fn) { pfn.add(fn); setTimeout(() => fn({ peers: list(), joined: [] }), 0); return () => pfn.delete(fn); },
    on(k, fn) { if (!efn.has(k)) efn.set(k, new Set()); efn.get(k).add(fn); return () => efn.get(k).delete(fn); },
    async emit(k, d) { pubAll(`${base}/e/${k}`, { d }); },
    async leave() { gone = true; clearInterval(sweep); try { pubAll(base + "/p", { left: 1 }); } catch (_) {} setTimeout(() => { for (const c of conns) try { c.ws.send(new Uint8Array([0xE0, 0])); c.ws.close(); } catch (_) {} }, 150); }
  };
};
NetJam.pick = async function () { return "e"; };   // Buchstabe bleibt nur als Kennung; verbunden wird mit allen erreichbaren
{ const rd = Jam.render.bind(Jam); Jam.render = function () { rd(); const el = $("kjam"); if (!el || !this.room || !this.room.brokers) return; const ok = el.querySelector(".jok"); if (ok) ok.textContent = ` · verbunden über ${this.room.brokers.length} Vermittler`; }; }

// ---------- 2) Bilderkennung: Meer · Berge · Garten/Blumen · Innenraum · Nebel · Feuer/Kerzen ----------
Object.assign(BildK.SCN, { meer: "Meer · Wasser", berge: "Berge", garten: "Garten · Blumen", innen: "Innenraum", nebel: "Nebel · Dunst", feuer: "Feuer · Kerzenlicht" });
{ const S = BildK.STYLES;
  S.ozean = { ...S.weite, n: "Ozean · Wellen", bpm: [60, 80], lead: ["harfe", "glocke", "vibraphon", "kalimba", "epiano"], pad: ["streicher", "chor"], rh: ["x.....x.....x...", "x.......x.......", "x...x.......x..."], leap: 0.3, swing: 0 };
  S.berg = { ...S.episch, n: "Gipfel · Weite", bpm: [70, 92], lead: ["horn", "floete", "trompete", "streicher"], groove: "epic" };
  S.garten = { ...S.pop, n: "Garten · Verspielt", moods: ["verspielt", "froh", "sommer"], bpm: [104, 126], lead: ["marimba", "glockenspiel", "ukulele", "kalimba", "floete", "xylophon"], groove: "pop" };
  S.kamin = { ...S.lofi, n: "Kaminabend · Jazz", moods: ["jazzig", "nacht", "entsp"], bpm: [70, 90], lead: ["klavier", "epiano", "saxofon", "kontrabass", "vibraphon"], bass: ["kontrabass", "jazzbass"] };
  S.nebel = { ...S.minimal, n: "Nebel · Schwebend", moods: ["meditativ", "traum", "geheim"], bpm: [56, 74], lead: ["glocke", "kristall", "harmonium", "chor", "spieluhr"], groove: "ambient", rh: ["x...............", "x.......x.......", "........x......."], leap: 0.2, len: 1.0 };
  S.feuer = { ...S.film, n: "Feuer · Glut", moods: ["drama", "orient", "unheimlich"], bpm: [76, 100], lead: ["cello", "horn", "handpan", "fagott"], groove: "taiko" }; }
BildK.feat2 = function (img, a, f) {
  const { w, h, data } = img, n = w * h; let waterB = 0, nb = 0, color = 0, warmSpot = 0, glow = 0, wallish = 0, diag = 0, tot = 0;
  const Y = new Float32Array(n);
  for (let i = 0; i < n; i++) { const r = data[i * 4] / 255, g = data[i * 4 + 1] / 255, b = data[i * 4 + 2] / 255, [hh, ss, ll] = K.rgbHsl(r, g, b), y = Math.floor(i / w) / h; Y[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (y > 0.55) { nb++; if (hh >= 170 && hh <= 235 && ss > 0.22 && ll > 0.18 && ll < 0.8) waterB++; }
    if (ss > 0.45 && ll > 0.3 && ll < 0.85 && !(hh >= 70 && hh <= 165) && !(hh >= 180 && hh <= 250)) color++;
    if (hh >= 8 && hh <= 52 && ss > 0.55 && ll > 0.5) warmSpot++;
    if ((hh <= 45 || hh >= 350) && ss > 0.5 && ll > 0.06 && ll < 0.4) glow++;   // warmer Schein um Flammen
    if (ss < 0.35 && ll > 0.25 && ll < 0.75 && hh >= 15 && hh <= 60) wallish++; }
  for (let yy = Math.floor(h * 0.2); yy < Math.floor(h * 0.75); yy++) for (let x = 1; x < w - 1; x++) { if (yy < 1 || yy >= h - 1) continue; const i = yy * w + x;
    const gx = -Y[i - w - 1] - 2 * Y[i - 1] - Y[i + w - 1] + Y[i - w + 1] + 2 * Y[i + 1] + Y[i + w + 1], gy = -Y[i - w - 1] - 2 * Y[i - w] - Y[i - w + 1] + Y[i + w - 1] + 2 * Y[i + w] + Y[i + w + 1], m = Math.hypot(gx, gy);
    if (m < 0.2) continue; let ang = Math.atan2(gy, gx) * 180 / Math.PI; ang = ((ang % 180) + 180) % 180; const near = Math.min(Math.abs(ang - 45), Math.abs(ang - 135)); if (near < 22) diag += m; tot += m; }
  const X = a.x || {}, L = a.L, x = { water: nb ? waterB / nb : 0, colorful: color / n, warmSpot: warmSpot / n, glow: glow / n, wall: wallish / n, Df: tot ? diag / tot : 0, contrast: a.contrast };
  const sc = f.scenes;
  sc.meer = clamp((x.water - 0.3) * 2.6, 0, 1) * clamp(0.35 + f.sky * 2, 0, 1) * clamp((0.35 - f.Vf) * 5, 0, 1);
  sc.berge = clamp((x.Df - 0.4) * 5, 0, 1) * clamp((f.sky - 0.12) * 3, 0, 1) * clamp((0.3 - f.Vf) * 5 + 0.3, 0, 1) * clamp((x.contrast - 0.08) * 10, 0, 1);
  sc.garten = clamp((x.colorful - 0.06) * 6, 0, 1) * clamp((f.green - 0.18) * 4, 0, 1);
  sc.innen = (f.sky < 0.06 ? 1 : 0) * clamp((x.wall - 0.15) * 4, 0, 1) * clamp((0.65 - L) * 4, 0, 1) * clamp(1 - f.green * 3, 0, 1) * clamp(1 - f.skin * 3, 0, 1);
  sc.nebel = clamp((0.1 - x.contrast) * 16, 0, 1) * clamp((L - 0.4) * 4, 0, 1) * clamp((0.35 - a.Sat) * 4, 0, 1);
  sc.feuer = (L < 0.35 ? 1 : 0) * clamp((x.warmSpot - 0.002) * 100, 0, 1) * clamp((x.glow - 0.015) * 14, 0, 1) * clamp(1 - f.green * 3, 0, 1) * clamp(1 - f.skin * 2, 0, 1);
  // ähnliche Szenen nicht doppelt: Meer schlägt Strand nur ohne Sand, Garten schlägt bunt, Feuer schlägt Nachtstadt ohne gerade Linien
  if (sc.meer > 0.5 && f.sand > 0.3) sc.strand = Math.max(sc.strand, sc.meer);
  if (sc.garten > 0.4) sc.bunt *= 0.6;
  if (sc.feuer > 0.5) sc.nachtstadt *= 1 - sc.feuer * 0.6;
  if (x.glow > 0.05 && L < 0.3 && sc.feuer > 0.3) sc.portrait *= 0.5;   // Kerzenschein färbt warm, ist aber keine Haut
  if (sc.innen > 0.5) sc.nachtstadt *= 1 - sc.innen * 0.6;
  if (sc.berge > 0.6) sc.weite *= 0.7;
  if (f.bright > 0.4) sc.nebel *= 0.5; else if (sc.nebel > 0.5) sc.schnee *= 0.5;   // Schnee ist gleißend hell, Nebel milchig
  let best = "stimmung", bv = 0.42; for (const k in sc) if (sc[k] > bv) { bv = sc[k]; best = k; } f.scene = best; f.sceneV = bv; f.x2 = x;
  return f;
};
{ const ft = BildK.feat.bind(BildK); BildK.feat = function (img, a) { const f = ft(img, a); try { this.feat2(img, a, f); } catch (e) { console.warn("feat2", e); } return f; }; }
{ const sf = BildK.styleFor.bind(BildK); BildK.styleFor = function (f) { const m = { meer: "ozean", berge: "berg", garten: "garten", innen: "kamin", nebel: "nebel", feuer: "feuer" }; return m[f.scene] || sf(f); }; }

// ---------- 3) Neues Stück mit Vorauswahl: Stimmung · Tempo · Formen ----------
const NewPiece = {
  SETS: [
    ["band", "Band", ["klavier", "grund", "trommel"]],
    ["akustik", "Akustik", ["westerngitarre", "kontrabass", "trommel", "floete"]],
    ["jazz", "Jazz-Trio+", ["klavier", "kontrabass", "trommel", "saxofon"]],
    ["chill", "Chill", ["epiano", "fingerbass", "kalimba", "vibraphon"]],
    ["orchester", "Orchester", ["streicher", "cello", "horn", "harfe"]],
    ["welt", "Welt", ["handpan", "steeldrum", "marimba", "kalimba"]],
    ["elektro", "Elektro", ["supersaw", "synthbass", "kit_909", "acid303"]],
    ["techno", "Techno", ["bass808", "kit_minimal", "acid303", "hoover"]],
    ["stimmen", "Stimmen", ["stimme_aah", "stimmenchor", "klavier"]],
    ["leer", "Leer", []]
  ],
  TEMPI: [["", "wie die Stimmung"], [70, "langsam 70"], [90, "ruhig 90"], [108, "mittel 108"], [124, "flott 124"], [140, "schnell 140"]],
  st: null,
  open() {
    const last = store.get("npLast") || {};
    this.st = { mood: last.mood || Music.mood.id, bpm: last.bpm ?? "", set: last.set || "band", forms: last.set === "eigene" && Array.isArray(last.forms) ? last.forms.filter(id => this.ok(id)) : (this.SETS.find(s => s[0] === (last.set || "band")) || this.SETS[0])[2].slice(), name: "" };
    const s = Sheets.open("Neues Stück", Sheets.head("Neues Stück") + `<div id="npS"></div>`); s.addEventListener("click", e => this.click(e)); s.addEventListener("input", e => this.input(e)); s.addEventListener("change", e => { if (e.target.id === "npAdd") this.input(e); }); this.render();
  },
  ok(id) { return K.SEEDS.some(x => x.id === id); },
  render() {
    const el = $("npS"); if (!el) return; const S = this.st, mood = K.MOODS.find(m => m.id === S.mood) || K.MOODS[0], bpm = S.bpm || mood.bpm;
    const seedOpts = K.SEEDS.filter(x => !x.hidden && x.kind !== "fx" && x.cat !== "farbe" && x.id !== "t_test" && x.name && x.fam).map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join("");
    el.innerHTML = `<div class="field"><label for="npName">Name</label><input id="npName" class="txt" maxlength="40" placeholder="${esc(this.autoName())}" value="${esc(S.name)}"></div>
      <h3 class="ph3">Stimmung <small>${esc(mood.name)} · ${esc(mood.desc || "")}</small></h3>
      <div class="npm">${K.MOODS.map(m => `<button class="npc" data-np="mood" data-v="${m.id}" aria-pressed="${m.id === S.mood}" style="--c:${m.color}"><i></i>${esc(m.name)}</button>`).join("")}</div>
      <h3 class="ph3">Tempo <small>${Math.round(bpm)} Schläge/min</small></h3>
      <div class="npm">${this.TEMPI.map(([v, n]) => `<button class="npc" data-np="bpm" data-v="${v}" aria-pressed="${String(S.bpm) === String(v)}">${n}</button>`).join("")}</div>
      <input type="range" id="npBpm" min="50" max="180" step="1" value="${Math.round(bpm)}" aria-label="Tempo">
      <h3 class="ph3">Formen <small>${S.forms.length} von höchstens 8</small></h3>
      <div class="npm">${this.SETS.map(([k, n, L]) => `<button class="npc" data-np="set" data-v="${k}" aria-pressed="${S.set === k}">${n}<small>${L.length}</small></button>`).join("")}</div>
      <div class="npf">${S.forms.map((id, i) => `<span class="npt">${esc(K.seedById(id).name)}<button data-np="rm" data-v="${i}" aria-label="${esc(K.seedById(id).name)} entfernen">✕</button></span>`).join("") || `<small class="kch">Leer – „+ Neu“ legt später Formen an.</small>`}
        ${S.forms.length < 8 ? `<select id="npAdd" class="txt npadd" aria-label="Form hinzufügen"><option value="">＋ Form hinzufügen …</option>${seedOpts}</select>` : ""}</div>
      <div class="row np-go"><button class="btn primary" data-np="go">Stück anlegen</button><button class="btn" data-np="foto">Aus einem Foto …</button></div>`;
  },
  autoName() { return "Stück " + new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }) + " " + new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }); },
  input(e) {
    const t = e.target; if (t.id === "npName") { this.st.name = t.value; return; }
    if (t.id === "npBpm") { this.st.bpm = +t.value; const h = t.previousElementSibling && t.closest("#npS").querySelectorAll("h3")[1]; if (h) h.querySelector("small").textContent = `${t.value} Schläge/min`; t.closest("#npS").querySelectorAll('[data-np="bpm"]').forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.v === +t.value))); return; }
    if (t.id === "npAdd" && t.value) { const v = t.value; t.value = ""; if (this.st.forms.length < 8) this.st.forms.push(v); this.st.set = "eigene"; this.render(); }
  },
  async click(e) {
    const b = e.target.closest("[data-np]"); if (!b) return; Hap(6); const k = b.dataset.np, v = b.dataset.v, S = this.st;
    if (k === "mood") S.mood = v;
    else if (k === "bpm") S.bpm = v ? +v : "";
    else if (k === "set") { S.set = v; S.forms = (this.SETS.find(s => s[0] === v) || [, , []])[2].filter(id => this.ok(id)); }
    else if (k === "rm") { S.forms.splice(+v, 1); S.set = "eigene"; }
    else if (k === "foto") { UI.hideSheets(); UI.setTab("bild"); return; }
    else if (k === "go") return this.go();
    this.render();
  },
  async go() {
    const S = this.st, mood = K.MOODS.find(m => m.id === S.mood) || K.MOODS[0], name = (S.name || "").trim() || this.autoName();
    store.set("npLast", { mood: S.mood, bpm: S.bpm, set: S.set, forms: S.forms.slice() });
    await Projects.create(name, "leer");
    Music.set(mood); if (S.bpm) Music.setTempo(+S.bpm); else Music.setTempo(null);
    const ids = S.forms.filter(id => this.ok(id)).slice(0, 8), n = ids.length, made = [];
    ids.forEach((id, i) => { const ang = n > 1 ? (i / n) * Math.PI * 2 : 0, r = n > 1 ? 2.6 : 0; const f = Forms.make({ seedId: id, pos: { x: Math.sin(ang) * r, y: 0, z: -Math.cos(ang) * r * 0.8 + (n > 1 ? -0.6 : 0) } }); if (f) { Forms.rebuild(f, true); made.push(f); } });
    if (made[0]) Forms.setActive(made[0]); UI.hideSheets(); UI.setTab("klang"); UI.setView(n > 1 ? "alle" : "nah"); UI.refresh(); await Save.now();
    UI.toast(`„${name}“ angelegt · ${mood.name} · ${Math.round(Music.tempo())} Schläge/min · ${n} Form${n === 1 ? "" : "en"}`, 2600);
  }
};
// „＋ Neues Stück“ in Meine Stücke öffnet die Vorauswahl
{ const po = Projects.open; Projects.open = async function () { await po.call(this); const b = $("fmNew"); if (b) { b.onclick = () => { Hap(); NewPiece.open(); }; } const o = $("fmNewOpts"); if (o) o.hidden = true; }; }

// ---------- 4) Set-Reihenfolge = Anordnung in „Alle“ (Lesereihenfolge: oben → unten, links → rechts) ----------
Cue.sortList = function () {
  const ix = id => { const i = Forms.list.findIndex(f => f.id === id); return i < 0 ? 1e9 : i; };
  const tk = e => { if (!e.t) return -1; const f = Forms.byId(e.f); return f ? (f.takes || []).findIndex(t => t.id === e.t) : 99; };
  this.list.sort((a, b) => ix(a.f) - ix(b.f) || tk(a) - tk(b));
};
{ const cl = Cue.clean.bind(Cue); Cue.clean = function () { cl(); this.sortList(); }; }
{ const tg = Cue.toggle.bind(Cue); Cue.toggle = function (fid, tid) { tg(fid, tid); this.sortList(); this.sync(); }; }
Cue.move = function () { UI.toast("Die Reihenfolge ergibt sich aus der Anordnung in „Alle“: Doppeltipp auf den Namen und an die neue Stelle schieben", 3200); };
const Arrange = {
  // eine Form an eine neue Stelle der Liste (= Platz in „Alle“, Reihenfolge im Set, in der Leiste oben)
  moveTo(f, to, noUndo) { const L = Forms.list, i = L.indexOf(f); if (i < 0) return; to = clamp(to, 0, L.length - 1); if (to === i) return; if (!noUndo) Undo.push(); L.splice(i, 1); L.splice(to, 0, f); Scene.gridC = null;
    if (Cue.q.length) { const ats = Cue.q.map(x => x.at).sort((a, b) => a - b); Cue.sortList(); Cue.q.sort((a, b) => Cue.list.indexOf(a.e) - Cue.list.indexOf(b.e)).forEach((x, k) => x.at = ats[k]); } try { Scene.fitGoal(); } catch (_) {} Scene.labelIds = null; Cue.sortList(); Cue.sync(); UI.refresh(); Save.soon(); Hap(12); },
  nearest(x, y, self) { let best = null, bd = 1e9; for (const g of Forms.list) { if (g === self) continue; const c = Scene.formScreen(g); if (!c) continue; const d = Math.hypot(c.x - x, c.y - y); if (d < bd) { bd = d; best = g; } } return best; },
  start(f, e, from) {
    if (Scene.view !== "alle" || !f) return; e.preventDefault(); e.stopPropagation(); const pid = e.pointerId;
    const ghost = document.createElement("div"); ghost.className = "argh"; ghost.style.setProperty("--c", colOf(f)); ghost.innerHTML = `<i></i>${esc(f.name)}<small>an neue Stelle ziehen</small>`; document.body.appendChild(ghost);
    const x0 = e.clientX, y0 = e.clientY; let moved = false;
    const place = (x, y) => { ghost.style.left = x + "px"; ghost.style.top = y + "px"; if (!moved && Math.hypot(x - x0, y - y0) > 12) moved = true; let t = moved ? this.nearest(x, y, f) : null;
      if (t) { const c = Scene.formScreen(t), b = document.querySelector(`.lbtn[data-id="${t.id}"]`), br = b && b.getBoundingClientRect(); const dC = c ? Math.hypot(c.x - x, c.y - y) : 1e9, dL = br ? Math.hypot(br.left + br.width / 2 - x, br.top + br.height / 2 - y) : 1e9; if (Math.min(dC, dL) > Math.max(70, (c && c.r) || 0)) t = null; } document.querySelectorAll(".lbtn.artgt").forEach(b => b.classList.remove("artgt")); if (t) { const b = document.querySelector(`.lbtn[data-id="${t.id}"]`); if (b) b.classList.add("artgt"); } this.tgt = t; };
    place(e.clientX, e.clientY); document.body.classList.add("karr"); Hap(14);
    const mv = ev => { if (ev.pointerId === pid) place(ev.clientX, ev.clientY); };
    const up = ev => { if (ev.pointerId !== pid) return; removeEventListener("pointermove", mv, true); removeEventListener("pointerup", up, true); removeEventListener("pointercancel", up, true);
      ghost.remove(); document.body.classList.remove("karr"); document.querySelectorAll(".lbtn.artgt").forEach(b => b.classList.remove("artgt"));
      const t = this.tgt; this.tgt = null; if (t && moved && ev.type === "pointerup") { this.moveTo(f, Forms.list.indexOf(t)); UI.toast(`${f.name} steht jetzt an Platz ${Forms.list.indexOf(f) + 1}`, 1400); } };
    addEventListener("pointermove", mv, true); addEventListener("pointerup", up, true); addEventListener("pointercancel", up, true);
  }
};
// Doppeltipp auf ein Namensschild in „Alle“ = verschieben; einfacher Tipp öffnet weiterhin den Kreis (kurz verzögert)
{ let last = { id: null, t: 0 }; const lb = () => $("labels");
  document.addEventListener("pointerdown", e => {
    const b = e.target.closest && e.target.closest(".labels .lbtn"); if (!b || Scene.view !== "alle") return; if (e.target.closest(".lplay")) return;
    const now = performance.now(); if (last.id === b.dataset.id && now - last.t < 380) { last = { id: null, t: 0 }; clearTimeout(Arrange.tapT); Radial.close(); Arrange.start(Forms.byId(b.dataset.id), e, "name"); return; }
    last = { id: b.dataset.id, t: now };
  }, true);
  const of = Radial.openFor; Radial.openFor = function (f, sel, pid) { if (pid == null && Scene.view === "alle" && typeof sel === "string" && sel.includes(".labels .lbtn")) { clearTimeout(Arrange.tapT); Arrange.tapT = setTimeout(() => { if (Scene.view === "alle" && !Sheets.cur && !document.body.classList.contains("karr") && UI.tab === "klang") of.call(Radial, f, sel, pid); }, 330); return; } return of.call(this, f, sel, pid); };
  void lb; }
// ◌-Knopf in „Alle“ ziehen = verschieben (tippen öffnet weiterhin „Set und Einsatz“)
document.addEventListener("pointerdown", e => {
  const b = e.target.closest && e.target.closest("#cueL .cueb"); if (!b || Scene.view !== "alle") return; const f = Forms.byId(b.dataset.cue), x0 = e.clientX, y0 = e.clientY, pid = e.pointerId; let on = false;
  const mv = ev => { if (ev.pointerId !== pid || on) return; if (Math.hypot(ev.clientX - x0, ev.clientY - y0) > 10) { on = true; removeEventListener("pointermove", mv, true); Cue.swallow = performance.now(); Arrange.start(f, ev, "dot"); } };
  const up = ev => { if (ev.pointerId !== pid) return; removeEventListener("pointermove", mv, true); removeEventListener("pointerup", up, true); removeEventListener("pointercancel", up, true); };
  addEventListener("pointermove", mv, true); addEventListener("pointerup", up, true); addEventListener("pointercancel", up, true);
}, true);
{ const ck = Cue.click.bind(Cue); Cue.click = function (e) { if (performance.now() - (this.swallow || 0) < 500) { e.stopPropagation(); e.preventDefault(); return; } return ck(e); }; }
// Set-Feld und Reihenfolge-Blatt ohne ▲▼, mit Hinweis auf die Anordnung
{ const pr = Cue.popRender.bind(Cue); Cue.popRender = function () { pr(); const el = $("cuepop"); if (!el) return; el.querySelectorAll(".cuem").forEach(b => b.remove()); const o = el.querySelector('[data-cp="order"]'); if (o) o.textContent = "☰ Set-Liste"; if (!el.querySelector(".cuehint")) { const c = el.querySelector(".cuectl"); if (c) c.insertAdjacentHTML("afterbegin", `<p class="cuehint">Reihenfolge = Anordnung in „Alle“ (oben → unten, links → rechts). Doppeltipp auf den Namen und schieben – oder den ◌-Knopf ziehen.</p>`); } }; }
{ const sr = Cue.sheetRender.bind(Cue); Cue.sheetRender = function () { this.sortList(); sr(); const el = $("cueS"); if (!el) return; el.querySelectorAll(".cuem:not(.del)").forEach(b => b.remove()); const p = el.querySelector(".wtip"); if (p) p.innerHTML = `Die Reihenfolge ist die <b>Anordnung in „Alle“</b>: oben → unten, links → rechts. Ändern: in „Alle“ <b>Doppeltipp auf den Namen</b> einer Form und an die neue Stelle schieben (oder ihren ◌-Knopf ziehen). ▶ Einsetzen startet Nr. 1 zur nächsten Eins, dann alle ${this.gap} Takt${this.gap > 1 ? "e" : ""} die nächste.`; }; }

// ---------- 5) ▶/⏸ direkt im Namen: sofort anhalten oder weiterlaufen lassen ----------
const QuickPP = {
  on(f) { return Fade.on(f) && !f.mute; },
  toggle(f) {
    if (!f) return; const on = !this.on(f);
    Fade.set(f, on, true); if (on) { f.lpOff = false; LoopCtl.release && LoopCtl.release(); if (!Transport.running && Engine.ctx) Transport.start(); }
    Hap(10); UI.toast(`${f.name} ${on ? "läuft" : "pausiert"}`, 800); setTimeout(() => { UI.soon(); try { KSheet.sync(true); } catch (_) {} Cue.sync(); }, 30); Save.soon();
  },
  icon(f) { return this.on(f) ? "⏸" : "▶"; },
  // klar lesbare Zeichen (das Schriftzeichen ⏸ ist auf manchen Handys winzig)
  svg(on) { return on ? `<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" rx="1"/><rect x="7" y="1.5" width="3" height="9" rx="1"/></svg>` : `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.6v8.8a.6.6 0 0 0 .9.5l7-4.4a.6.6 0 0 0 0-1L3.9 1.1a.6.6 0 0 0-.9.5z"/></svg>`; }
};
// in die Namensschilder (Alle) einsetzen
{ const lb = Scene.labels.bind(Scene); Scene.labels = function () {
  const r = lb(); const el = $("labels"); if (!el) return r;
  for (const b of el.children) { const f = Forms.byId(b.dataset.id); if (!f || f.empty || f.remote) continue; let p = b.querySelector(".lplay"); const ic = QuickPP.icon(f);
    if (!p) { p = document.createElement("span"); p.className = "lplay"; p.setAttribute("role", "button"); b.insertBefore(p, b.firstChild); }
    if (p.dataset.ic !== ic) { p.dataset.ic = ic; p.innerHTML = QuickPP.svg(ic === "⏸"); p.dataset.on = ic === "⏸" ? "1" : "0"; p.setAttribute("aria-label", `${f.name} ${ic === "⏸" ? "pausieren" : "weiterlaufen lassen"}`); } }
  return r;
}; }
document.addEventListener("pointerdown", e => { const p = e.target.closest && e.target.closest(".labels .lplay"); if (!p) return; e.preventDefault(); e.stopPropagation(); const b = p.closest(".lbtn"); QuickPP.toggle(Forms.byId(b.dataset.id)); }, true);
document.addEventListener("click", e => { if (e.target.closest && e.target.closest(".labels .lplay")) { e.preventDefault(); e.stopPropagation(); } }, true);
// in der Form-Ansicht neben dem Namen
setInterval(() => { try { const fn = $("formname"), f = Forms.active; if (!fn || !f) return; let p = fn.querySelector(".fnpp"); if (!p) { p = document.createElement("button"); p.className = "fnpp"; const h = $("fName"); if (h) h.insertAdjacentElement("beforebegin", p); else fn.appendChild(p); p.addEventListener("pointerdown", ev => ev.stopPropagation()); p.addEventListener("click", ev => { ev.stopPropagation(); QuickPP.toggle(Forms.active); }); }
  const ic = f.empty || f.remote ? "" : QuickPP.icon(f); if (p.dataset.ic !== ic) { p.dataset.ic = ic; p.innerHTML = ic ? QuickPP.svg(ic === "⏸") : ""; p.hidden = !ic; p.setAttribute("aria-label", ic === "⏸" ? "pausieren" : "weiterlaufen lassen"); p.dataset.on = ic === "⏸" ? "1" : "0"; } } catch (_) {} }, 300);

// ---------- 6) Raum: Punkte statt Namensschilder – verdecken nichts, tippen = ▶/⏸, ziehen = verschieben ----------
const RDots = {
  layer() { let L = $("rdots"); if (!L) { L = document.createElement("div"); L.id = "rdots"; L.className = "rdots"; document.body.appendChild(L); this.bind(L); } return L; },
  bind(L) {
    L.addEventListener("pointerdown", e => {
      const d = e.target.closest(".rdot"); if (!d) return; e.preventDefault(); e.stopPropagation(); const f = Forms.byId(d.dataset.id); if (!f) return;
      const pid = e.pointerId, x0 = e.clientX, y0 = e.clientY; let moved = false, off = null; try { d.setPointerCapture(pid); } catch (_) {}
      const mv = ev => { if (ev.pointerId !== pid) return; if (!moved && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 9) return; if (!moved) { moved = true; Undo.push(); Forms.setActive(f); d.classList.add("drag"); }
        const pt = Scene.planePoint(ev.clientX, ev.clientY, f.pos.y); if (!pt) return; if (!off) off = { x: f.pos.x - pt.x, z: f.pos.z - pt.z };
        let nx = pt.x + off.x, nz = pt.z + off.z; const r = Math.hypot(nx, nz + 1); if (r > 7) { nx *= 7 / r; nz = (nz + 1) * 7 / r - 1; } f.pos.x = nx; f.pos.z = clamp(nz, -8, 4.2); Forms.applyMix(f); };
      const up = ev => { if (ev.pointerId !== pid) return; d.removeEventListener("pointermove", mv); d.removeEventListener("pointerup", up); d.removeEventListener("pointercancel", up); d.classList.remove("drag");
        if (moved) { Save.soon(); return; } if (ev.type === "pointerup") { if (Forms.active !== f) Forms.setActive(f); QuickPP.toggle(f); } };
      d.addEventListener("pointermove", mv); d.addEventListener("pointerup", up); d.addEventListener("pointercancel", up);
    });
  },
  // Oberkante der Bedienelemente unten (Steuerfeld, Leiste)
  limit() { let top = Scene.h || innerHeight; for (const id of ["ksheet", "fbar", "modebar"]) { const e = $(id); if (!e || e.hidden) continue; const r = e.getBoundingClientRect(); if (r.height && r.top > innerHeight * 0.35 && r.top < top) top = r.top; } return top; },
  tick() {
    const L = this.layer(), show = App.started && UI.tab === "klang" && Scene.view === "raum" && !Sheets.cur && Scene.camera; document.body.classList.toggle("krdots", !!show);
    if (!show) { if (L.childElementCount) L.innerHTML = ""; return; }
    const seen = new Set(), v = new THREE.Vector3(), fe = [...document.querySelectorAll(".kfab")].find(e => e.offsetWidth); this.fab = fe ? fe.getBoundingClientRect() : null;
    for (const f of Forms.list) { if (f.empty) continue; const m = Scene.meshes && Scene.meshes.get(f.id); if (!m) continue; seen.add(f.id);
      // Punkt am Fuß der Form (Mitte unten) – klein, damit er nichts verdeckt; nie unter dem Steuerfeld
      const T = f.table, y = T ? T.g.position.y : m.position.y - 0.9 * Math.max(0.7, f.size * (f.stretch || 1)); v.set(m.position.x, y, m.position.z).project(Scene.camera);
      let d = L.querySelector(`.rdot[data-id="${f.id}"]`); if (!d) { d = document.createElement("button"); d.className = "rdot"; d.dataset.id = f.id; L.appendChild(d); }
      const sx = Math.round((v.x + 1) / 2 * Scene.w), sy = Math.round((1 - v.y) / 2 * Scene.h), lim = this.limit();
      let px = clamp(sx, 20, Scene.w - 20), py = clamp(sy, 70, lim - 20); const fb = this.fab;
      if (fb && px > fb.left - 18 && px < fb.right + 18 && py > fb.top - 18 && py < fb.bottom + 18) px = fb.left - 20;   // nie unter dem runden Form-Knopf
      d.style.left = px + "px"; d.style.top = py + "px"; d.style.setProperty("--c", colOf(f));
      const on = QuickPP.on(f), act = f === Forms.active, h = `<i>${QuickPP.svg(on)}</i>${act ? `<b>${esc(f.name)}</b>` : ""}`;
      if (d._h !== h) { d._h = h; d.innerHTML = h; d.dataset.on = on ? 1 : 0; d.classList.toggle("act", act); d.classList.toggle("rleft", sx > Scene.w * 0.62); d.setAttribute("aria-label", `${f.name}: tippen = ${on ? "pausieren" : "weiterlaufen"}, ziehen = verschieben`); } }
    for (const d of [...L.children]) if (!seen.has(d.dataset.id)) d.remove();
  }
};
{ const lb = Scene.labels.bind(Scene); Scene.labels = function () { const r = lb(); try { RDots.tick(); } catch (_) {} return r; }; }
setInterval(() => { try { RDots.tick(); } catch (_) {} }, 250);   // auch wenn die Szene gerade still steht
// Set-Knöpfe im Raum ausblenden (dort stören sie); Set geht in Form und Alle
{ const bg = Cue.badges.bind(Cue); Cue.badges = function () { bg(); if (Scene.view === "raum") { const L = $("cueL"); if (L) L.innerHTML = ""; } }; }

// ---------- 7) Mikrofon beim Start erfragen und bereithalten ----------
const MicStart = {
  stream: null,
  async ask() {
    if (store.get("micStart") === false || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    try { this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }); store.set("micOk", true); document.body.classList.add("kmic"); UI.toast("🎤 Mikrofon ist bereit – 🎤 Mikro im Steuerfeld nimmt sofort eine Form auf", 2600); }
    catch (e) { const first = store.get("micOk") !== false; store.set("micOk", false); if (first) setTimeout(() => UI.toast("Mikrofon nicht freigegeben – alles andere geht trotzdem; 🎤 Mikro fragt beim Aufnehmen erneut", 3200), 1500); }
  }
};
{ const b = $("enter"); if (b) b.addEventListener("click", () => { MicStart.ask(); }, true); }
// Mikro → Form nutzt das schon freigegebene Mikrofon (keine zweite Frage)
{ const gum = navigator.mediaDevices && navigator.mediaDevices.getUserMedia && navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  if (gum) MicForm.start = (orig => async function () { if (MicStart.stream && MicStart.stream.active) { const md = navigator.mediaDevices; const keep = md.getUserMedia; md.getUserMedia = async () => MicStart.stream.clone(); try { return await orig.call(this); } finally { md.getUserMedia = keep; } } return orig.call(this); })(MicForm.start); }

// ---------- 8) Hilfe: nach Themen geordnet, „Ich will …“ ganz oben ----------
Help.CATS = [
  ["Loslegen", ["start", "neu", "touch"]], ["Spielen", ["play", "schalten", "set", "loopctl", "move"]], ["Ansichten", ["alle", "raum"]],
  ["Klang formen", ["forms", "edit", "fbar", "vol"]], ["Aufnehmen", ["loop", "mikro", "schnitt"]], ["Stück & Dateien", ["proj", "song", "share", "bild", "beat"]],
  ["Gemeinsam", ["jamqr"]], ["Am Rechner", ["maus", "keys"]], ["Probleme", ["fix"]]
];
Help.WANT = [
  ["Ein neues Stück anfangen", "neu"], ["Eine Form anhalten oder weiterlaufen lassen", "schalten"], ["Mehrere Formen gemeinsam stoppen und nacheinander einsetzen", "set"],
  ["Die Reihenfolge im Set ändern", "alle"], ["Einen Loop aufnehmen", "loop"], ["Mit dem Mikrofon eine Form aufnehmen", "mikro"], ["Eine Form im Raum verschieben", "raum"],
  ["Den Klang einer Form ändern", "forms"], ["Lauter / leiser, ein- und ausblenden", "vol"], ["Aus einem Foto Musik machen", "bild"],
  ["Mit jemandem zusammen spielen", "jamqr"], ["Ein Stück speichern, öffnen, sichern", "proj"], ["Teilen (WhatsApp, Video, MP3)", "share"], ["Am Rechner mit der Maus spielen", "maus"], ["Etwas klappt nicht", "fix"]
];
Help.T.push(
  { id: "neu", ic: "＋", t: "Neues Stück mit Vorauswahl", k: "neu neues stück anlegen stimmung tempo formen vorauswahl band orchester elektro", h: `<ol>
    <li>Ordner-Knopf oben links → <b>＋ Neues Stück</b>.</li>
    <li><b>Stimmung</b> wählen (20 zur Auswahl), <b>Tempo</b> (wie die Stimmung, langsam … schnell oder genau mit dem Regler) und eine <b>Formen-Kombination</b> (Band, Akustik, Jazz, Chill, Orchester, Welt, Elektro, Techno, Stimmen oder leer). Einzelne Formen mit ✕ entfernen oder „＋ Form hinzufügen“ (höchstens 8).</li>
    <li><b>Stück anlegen</b> – der Name kommt automatisch mit Datum und Uhrzeit, wenn du keinen eingibst. Die letzte Wahl wird beim nächsten Mal vorgeschlagen.</li></ol>` },
  { id: "alle", ic: "▦", t: "Alle: viele Formen, Anordnung = Reihenfolge", k: "alle anordnung reihenfolge verschieben doppeltipp spalten set einsatz", h: `<ul>
    <li><b>Alle</b> zeigt alle Formen in Spalten; der Chip <b>▦ Spalten</b> stellt die Anzahl fest ein.</li>
    <li>Die <b>Anordnung</b> ist die Reihenfolge – im Set (Einsatz), in der Leiste oben und beim Weiterblättern. Gelesen wird wie ein Text: <b>oben → unten, links → rechts</b>.</li>
    <li><b>Verschieben:</b> <b>Doppeltipp auf den Namen</b> einer Form und an die neue Stelle ziehen – die Zielform leuchtet auf. Oder den <b>◌-Knopf</b> neben dem Namen ziehen.</li>
    <li><b>▶ / ⏸ im Namen</b>: ein Tipp lässt die Form sofort weiterlaufen bzw. pausiert sie (mit allen Loops).</li></ul>` },
  { id: "mikro", ic: "🎤", t: "Mikrofon: Form aus einer Aufnahme", k: "mikrofon mikro aufnahme stimme gesang sample form erlauben", h: `<ul>
    <li>Beim Start fragt KLANGRAUM, ob es das Mikrofon benutzen darf. Erlaubt: es ist sofort bereit.</li>
    <li><b>🎤 Mikro</b> in der Schalterzeile: tippen = Aufnahme läuft (rote Anzeige oben), nochmal tippen = sofort eine neue, spielbare Form. Ohne weitere Fragen.</li>
    <li>In der Claude-App ist das Mikrofon oft gesperrt – dann die heruntergeladene Datei im Browser öffnen.</li></ul>` }
);
{ const raum = Help.T.find(x => x.id === "raum"); if (raum) raum.h = `<ul>
    <li>Der <b>Raum</b> zeigt, wo die Formen klingen: links/rechts = Stereo, vorn/hinten = nah/fern und Hall.</li>
    <li>Unter jeder Form sitzt ein <b>Punkt</b> in ihrer Farbe – statt großer Namensschilder, damit nichts verdeckt wird. Der Name steht nur bei der gewählten Form.</li>
    <li><b>Punkt antippen</b> = ▶ weiterlaufen / ⏸ pausieren · <b>Punkt ziehen</b> = Form im Raum verschieben.</li>
    <li>Form antippen = spielen · Mausrad oder zwei Finger = Zoom · im Leeren ziehen = Blick drehen. Physik (Schalter im Steuerfeld): wischen schiebt Formen an.</li></ul>`; }
{ const st = Help.T.find(x => x.id === "set"); if (st) st.h = `<ul>
    <li>Am <b>◌-Knopf</b> neben dem Namen einer Form (Form-Ansicht und Alle): <b>＋ Set</b> für die ganze Form oder einzelne Loops, <b>▶ steht / ■ läuft</b> schaltet sofort.</li>
    <li><b>Reihenfolge</b> = Anordnung in <b>Alle</b> (oben → unten, links → rechts). Ändern: Doppeltipp auf den Namen und schieben.</li>
    <li><b>■ Set stoppen</b> hält alle Teile an, <b>▶ Einsetzen</b> startet sie nacheinander zur Eins im Abstand 1, 2 oder 4 Takte (Chips im Steuerfeld).</li>
    <li><b>⏺ Set aufnehmen</b> nimmt die Set-Formen auf – danach hineinhören und „＋ Als neue Form“.</li></ul>`; }
Help.open = (orig => function (q = "") {
  orig.call(this, q); const s = document.querySelector(".sheet"); if (!s) return; const toc = s.querySelector("#hToc"), list = s.querySelector("#hList"); if (!toc || !list) return;
  const byId = Object.fromEntries(this.T.map(x => [x.id, x])), used = new Set(this.CATS.flatMap(c => c[1]));
  const cats = this.CATS.map(([n, ids]) => [n, ids.filter(id => byId[id])]).concat([["Weiteres", this.T.map(x => x.id).filter(id => !used.has(id))]]).filter(c => c[1].length);
  toc.innerHTML = `<div class="hwant"><h3>Ich will …</h3>${this.WANT.filter(w => byId[w[1]]).map(([t, id]) => `<button data-h="${id}">${esc(t)}<span>›</span></button>`).join("")}</div>`
    + cats.map(([n, ids]) => `<div class="hcat"><h3>${esc(n)}</h3>${ids.map(id => `<button data-h="${id}"><i>${byId[id].ic}</i>${esc(byId[id].t)}</button>`).join("")}</div>`).join("");
  // Abschnitte in Themen-Reihenfolge
  const order = cats.flatMap(c => c[1]); for (const id of order) { const d = list.querySelector(`.hsec[data-h="${id}"]`); if (d) list.appendChild(d); }
  for (const id of ["neu", "alle", "mikro"]) if (!list.querySelector(`.hsec[data-h="${id}"]`)) { const x = byId[id]; list.insertAdjacentHTML("beforeend", `<details class="hsec" data-h="${x.id}"><summary><i>${x.ic}</i>${esc(x.t)}</summary><div class="hbody">${x.h}</div></details>`); }
  if (!q) list.querySelectorAll(".hsec").forEach(d => d.open = d.dataset.h === "start");
})(Help.open);

// Pausieren über die Schalterzeile: sofort, ohne lange Blende (Ein-/Ausblenden mit Dauer gibt es weiter im Form-Regler)
FSw.power = function (f, quiet) { const on = Fade.toggle(f, true); if (!quiet) UI.toast(on ? `${f.name} läuft` : `${f.name} pausiert`, 900); return on; };
// Menü: Mikrofon beim Start an/aus
{ const op = Sheets.open.bind(Sheets); Sheets.open = function (name, html, ...r) { const s = op(name, html, ...r);
  try { if (name === "Menü" && s && !s.querySelector("[data-mmic]")) { const a = s.querySelector(".mjam") || s.querySelector("header"); if (a) { const on = store.get("micStart") !== false;
    a.insertAdjacentHTML("afterend", `<div class="row mmic"><button class="btn" data-mmic="1" aria-pressed="${on}">🎤 Mikrofon beim Start: <b>${on ? "an" : "aus"}</b></button></div>`);
    s.querySelector("[data-mmic]").onclick = ev => { const b = ev.currentTarget, v = !(store.get("micStart") !== false); store.set("micStart", v); b.setAttribute("aria-pressed", v); b.querySelector("b").textContent = v ? "an" : "aus"; Hap(); if (v && !(MicStart.stream && MicStart.stream.active)) MicStart.ask(); if (!v && MicStart.stream) { MicStart.stream.getTracks().forEach(t => t.stop()); MicStart.stream = null; document.body.classList.remove("kmic"); } }; } } } catch (e) { console.warn(e); }
  return s; }; }

// ◌-Knopf nicht unter dem runden Form-Knopf: dann links neben den Namen
{ const bg = Cue.badges.bind(Cue); Cue.badges = function () { bg(); const fab = document.querySelector(".kfab"), L = $("cueL"); if (!fab || !L || !L.children.length) return; const fr = fab.getBoundingClientRect(); if (!fr.width) return;
  for (const sp of L.children) { const r = sp.getBoundingClientRect(); if (!r.width) continue; if (r.right > fr.left - 2 && r.left < fr.right + 2 && r.bottom > fr.top - 2 && r.top < fr.bottom + 2) { const b = document.querySelector(`.labels .lbtn[data-id="${sp.dataset.for}"]`); if (b) { const br = b.getBoundingClientRect(); sp.style.left = Math.round(br.right - r.width - 4) + "px"; sp.style.top = Math.round(br.top - r.height - 2) + "px"; } } } }; }
// Namensschilder in „Alle“ weichen einander aus (das untere rutscht nach unten), statt sich zu überdecken
{ const lb = Scene.labels.bind(Scene); Scene.labels = function () {
  const r = lb(); if (Scene.view !== "alle") return r; const el = $("labels"); if (!el) return r;
  const now = performance.now(), fresh = now - (el._mt || 0) > 400; if (fresh) el._mt = now; const it = [];
  for (const sp of el.children) { if (!sp.style.left || sp.hidden) continue; if (fresh || !sp._w || sp._sig !== sp.dataset.sig) { sp._w = sp.offsetWidth; sp._h = sp.offsetHeight; sp._sig = sp.dataset.sig; } if (!sp._w) continue;
    const x = parseFloat(sp.style.left), y = parseFloat(sp.style.top); const cw = sp.dataset.id && Cue.visible && Cue.visible() ? (document.body.classList.contains("kdense") ? 27 : 33) : 0; it.push({ sp, l: x - sp._w / 2, r: x + sp._w / 2 + cw, t: y, b: y + sp._h, cw }); }
  if (fresh) { try { el._lim = RDots.limit(); } catch (_) { el._lim = 1e9; } } if (fresh) { let mr = 4; for (const t of document.querySelectorAll(".tabs button")) { const q = t.getBoundingClientRect(); if (q.width && q.left < 10 && q.right < innerWidth * 0.3 && q.height) mr = Math.max(mr, q.right + 4); } el._minL = mr; }
  for (const a of it) { const minL = el._minL || 4, maxR = (Scene.w || innerWidth) - 4; let dx = 0; if (a.l < minL) dx = minL - a.l; else if (a.r > maxR) dx = maxR - a.r; if (dx) { a.l += dx; a.r += dx; const left = Math.round((a.l + a.r - a.cw) / 2) + "px"; if (a.sp.style.left !== left) a.sp.style.left = left; } }
  it.sort((a, b) => a.t - b.t || a.l - b.l); const done = [];
  for (const a of it) { for (let k = 0; k < 4; k++) { let hit = null; for (const d of done) if (a.l < d.r + 3 && a.r > d.l - 3 && a.t < d.b + 2 && a.b > d.t - 2) { hit = d; break; } if (!hit) break; const dy = hit.b + 3 - a.t; a.t += dy; a.b += dy; }
    done.push(a); const lim = el._lim || 1e9, top = Math.round(Math.min(a.t, lim - (a.b - a.t) - 2)) + "px"; if (a.sp.style.top !== top) a.sp.style.top = top; }
  return r;
}; }

// Jam neu verbinden: alten Raum vorher sauber schließen (sonst liefen Zeitgeber und Verbindungen weiter)
{ const lo = NetJam.lost.bind(NetJam); NetJam.lost = function () { const r = Jam.room; if (r && r.net) { try { r.leave(); } catch (_) {} } return lo(); }; }

// Mikrofon im Hintergrund freigeben (Akku, Mikrofon-Anzeige); zurück in der App wieder bereithalten
document.addEventListener("visibilitychange", () => { try {
  if (document.hidden) { if (MicStart.stream && !MicForm.on) { MicStart.stream.getTracks().forEach(t => t.stop()); MicStart.stream = null; document.body.classList.remove("kmic"); MicStart.wasOn = true; } }
  else if (MicStart.wasOn && store.get("micStart") !== false) { MicStart.wasOn = false; navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }).then(st => { MicStart.stream = st; document.body.classList.add("kmic"); }).catch(() => {}); }
} catch (_) {} });
