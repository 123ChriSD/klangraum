/* =====================================================================================
   v67: STUDIO – ein geführter Weg für Laien
   Start (Was möchtest du machen?) · Song in 1 Minute (Stil → Band → Ablauf) · Song-Ansicht
   (Teile als Blöcke, wer spielt wann) · Mischen (Regler, Auto-Mix, Bühne) · Erklär-Modus
   ===================================================================================== */
const I67 = (() => { const s = p => `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`; return {
  home: s('<path d="M4 11.5 12 4l8 7.5"/><path d="M6.5 10v9h11v-9"/><path d="M10 19v-5h4v5"/>'),
  song: s('<rect x="3" y="5" width="5" height="14" rx="1.6"/><rect x="9.5" y="5" width="5" height="14" rx="1.6"/><rect x="16" y="5" width="5" height="14" rx="1.6"/>'),
  mix: s('<path d="M6 4v16M12 4v16M18 4v16"/><rect x="4" y="13" width="4" height="3.4" rx="1"/><rect x="10" y="6.5" width="4" height="3.4" rx="1"/><rect x="16" y="11" width="4" height="3.4" rx="1"/>'),
  more: s('<circle cx="5.5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18.5" cy="12" r="1.6"/>'),
  magic: s('<path d="M5 19 15.5 8.5"/><path d="m14 7 3 3"/><path d="M18.5 3.5v3M17 5h3M8 3.5v2M7 4.5h2M19 13v2M18 14h2"/>'),
  keys: s('<rect x="3" y="5" width="18" height="14" rx="2.2"/><path d="M8 5v8M12 5v8M16 5v8"/>'),
  blob: s('<path d="M12 3.5c4.5 0 8.2 3 8.2 7.6 0 5-3.4 9.4-8.2 9.4S3.8 16.4 3.8 11.5C3.8 6.8 7.5 3.5 12 3.5Z"/><path d="M8.5 13.5c1.2 1.6 5.8 1.6 7 0"/>'),
  mic: s('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>'),
  photo: s('<rect x="3" y="5" width="18" height="14" rx="2.4"/><circle cx="8.5" cy="10" r="1.6"/><path d="m4 17 5-4.5 3.5 3 3-2.5 4.5 4"/>'),
  deck: s('<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>'),
  people: s('<circle cx="8" cy="9" r="3"/><circle cx="16.5" cy="9.5" r="2.5"/><path d="M2.8 19c.8-3 2.8-4.5 5.2-4.5s4.400 1.500 5.200 4.500M14.500 15c2.800-.6 5.200.800 6.200 4"/>'),
  play: s('<path d="M8 5.5v13l11-6.500Z" fill="currentColor" stroke="none"/>'),
  stop: s('<rect x="6.500" y="6.500" width="11" height="11" rx="2" fill="currentColor" stroke="none"/>'),
  rec: s('<circle cx="12" cy="12" r="6" fill="currentColor" stroke="none"/>'),
  dice: s('<rect x="4" y="4" width="16" height="16" rx="3.500"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="15" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/><circle cx="9" cy="15" r="1" fill="currentColor"/>'),
  plus: s('<path d="M12 5v14M5 12h14"/>'),
  loop: s('<path d="M17 3.500 20 6.500l-3 3"/><path d="M4 11.500V10a3.500 3.500 0 0 1 3.500-3.500H20"/><path d="M7 20.500 4 17.500l3-3"/><path d="M20 12.500V14a3.500 3.500 0 0 1-3.500 3.500H4"/>'),
  help: s('<circle cx="12" cy="12" r="8.500"/><path d="M9.500 9.500a2.600 2.600 0 1 1 3.700 2.400c-.800.400-1.200 1-1.200 1.900"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>'),
  folder: s('<path d="M3.500 7.500a2 2 0 0 1 2-2h4l2 2.200h7a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z"/>'),
  drum: s('<ellipse cx="12" cy="9" rx="8" ry="3.200"/><path d="M4 9v6c0 1.800 3.600 3.200 8 3.200s8-1.400 8-3.200V9"/><path d="m5 3.500 5 4M19 3.500l-5 4"/>'),
  bass: s('<path d="M3 12c2-5 4-5 6 0s4 5 6 0 4-5 6 0"/>'),
  chord: s('<path d="M5 7h14M5 12h14M5 17h14"/><circle cx="9" cy="7" r="1.700" fill="currentColor"/><circle cx="14" cy="12" r="1.700" fill="currentColor"/><circle cx="9" cy="17" r="1.700" fill="currentColor"/>'),
  spark: s('<path d="M12 3.500 13.800 9l5.700 1.800-5.700 1.900L12 18.500l-1.800-5.800-5.700-1.900L10.200 9Z"/>'),
  note: s('<path d="M9.500 17.500V6l9-2v11.500"/><ellipse cx="7" cy="17.500" rx="2.600" ry="2"/><ellipse cx="16" cy="15.500" rx="2.600" ry="2"/>'),
  star: s('<path d="m12 3.800 2.500 5.200 5.700.700-4.200 3.900 1.100 5.600L12 16.400l-5.100 2.800L8 13.600 3.800 9.700l5.700-.700Z"/>'),
  share: s('<path d="M12 15V4M8 7.500 12 3.500l4 4"/><path d="M5 12.500V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5.500"/>'),
  left: s('<path d="m14.500 6-6 6 6 6"/>'), right: s('<path d="m9.500 6 6 6-6 6"/>'),
  copy: s('<rect x="8" y="8" width="11.500" height="11.500" rx="2.200"/><path d="M5 15.500V6.700A2.200 2.200 0 0 1 7.200 4.500H15"/>'),
  trash: s('<path d="M5 7h14M9.500 7V4.800h5V7M7 7l.800 12h8.400L17 7"/>'),
  mute: s('<path d="M4 9.500h3.500L12 6v12l-4.500-3.500H4Z"/><path d="m16 9.500 4.500 5M20.500 9.500 16 14.500"/>'),
  vol: s('<path d="M4 9.500h3.500L12 6v12l-4.500-3.500H4Z"/><path d="M15.500 9a4.200 4.200 0 0 1 0 6M18 6.500a8 8 0 0 1 0 11"/>'),
  solo: s('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.600" fill="currentColor"/>'),
  x: s('<path d="m6 6 12 12M18 6 6 18"/>')
}; })();

/* ---------- Song-Erzeuger: Stil → Besetzung mit Loops → Ablauf ---------- */
const SongGen = {
  meta: null,     // { style, seed, roles: { formId: rolle } } – im Stück gespeichert (d.sg67)
  ROLE: { beat: ["Beat", "drum"], bass: ["Bass", "bass"], akk: ["Akkorde", "chord"], arp: ["Begleitung", "spark"], mel: ["Melodie", "note"], hook: ["Refrain-Melodie", "star"] },
  VOL: { beat: 0.9, bass: 0.8, akk: 0.68, arp: 0.5, mel: 0.82, hook: 0.9 },
  // Schlagzeug-Muster (je 16 Sechzehntel): x = Schlag, X = betont, o = leise
  DR: {
    pop: [{ K: "x.....x.x.......", K2: "x.....x.x.x.....", S: "....x.......x...", H: "x.x.x.x.x.x.x.x." }, { K: "x.......x.x.....", K2: "x..x....x.x.....", S: "....x.......x...", H: "x.x.x.x.x.x.x.xo" }, { K: "x.x.....x.......", K2: "x.x.....x..x....", S: "....x.......x..o", H: "X.x.X.x.X.x.X.x." }],
    laid: [{ K: "x.....x...x.....", S: "....x.......x...", H: "x.o.x.o.x.o.x.o." }, { K: "x.........x.....", K2: "x......x..x.....", S: "....x.......x...", H: "x.x.x.x.x.x.x.x." }],
    four: [{ K: "x...x...x...x...", S: "....x.......x...", H: "..x...x...x...x." }, { K: "x...x...x...x...", K2: "x...x...x...x.x.", S: "....x.......x...", H: "o.x.o.x.o.x.o.xo" }],
    hard: [{ K: "X...X...X...X...", S: "....x.......x...", H: "..x...x...x...x." }, { K: "X...X...X...X...", K2: "X...X...X..xX...", S: "....x.......x..o", H: "o.xoo.xoo.xoo.xo" }],
    trap: [{ K: "x.......x.x.....", K2: "x......x..x.....", S: "........x.......", H: "x.x.x.x.x.xxx.x." }, { K: "x..x......x.....", K2: "x.....x...x..x..", S: "........x.......", H: "x.x.xxx.x.x.x.xx" }],
    rock: [{ K: "x.....x.x.......", K2: "x.....x.x..x....", S: "....x.......x...", H: "x.x.x.x.x.x.x.x.", T: 1, F: "....x.....x.xxxx" }, { K: "x.x.....x.x.....", K2: "x.x.....x..x....", S: "....x.......x...", H: "X.x.X.x.X.x.X.x.", T: 1, F: "....x...x.x.x.xx" }],
    funk: [{ K: "x..x..x...x.x...", S: "....x..o.o..x..o", H: "xoxoxoxoxoxoxoxo" }, { K: "x.....x..x..x...", S: "....x.o.....x.o.", H: "xoxxxoxxxoxxxoxx" }],
    drop: [{ K: "........x.......", K2: "x.......x.......", S: "....o...x...o...", H: "..x...x...x...x." }, { K: "x.......x.......", S: "....x.......x...", H: "..x...x...x...x." }],
    epic: [{ K: "x.....x.x.....x.", K2: "x.....x.x...x.x.", S: "............x...", H: "x...x...x...x..." }, { K: "x..x..x.x..x..x.", S: "............x.x.", H: "x.......x......." }],
    swing: [{ K: "x.........x.....", S: "....o.......o...", H: "x...x.x.x...x.x." }, { K: "x.......x.......", K2: "x.......x.....x.", S: "....o.....o.o...", H: "x...x.x.x...x.x." }]
  },
  // Bass: [Schritt, Akkordton (0 Grundton · 1 Terz · 2 Quinte · 3 Oktave · 4 Quinte darunter), Länge, Stärke]
  BS: {
    pop: [[[0, 0, 3, 0.9], [6, 0, 2, 0.7], [8, 0, 3, 0.85], [12, 2, 2, 0.75], [14, 0, 2, 0.7]], [[0, 0, 5.5, 0.9], [6, 0, 2, 0.7], [8, 2, 4, 0.8], [12, 0, 3.6, 0.8]], [[0, 0, 2, 0.9], [2, 0, 2, 0.6], [4, 0, 2, 0.7], [6, 0, 2, 0.6], [8, 0, 2, 0.85], [10, 0, 2, 0.6], [12, 2, 2, 0.75], [14, 1, 2, 0.7]]],
    laid: [[[0, 0, 5, 0.85], [10, 2, 2, 0.65], [12, 0, 3.6, 0.75]], [[0, 0, 7, 0.85], [8, 2, 3, 0.7], [11, 1, 4.5, 0.65]]],
    off: [[[2, 0, 2, 0.85], [6, 0, 2, 0.8], [10, 0, 2, 0.85], [14, 3, 2, 0.8]], [[2, 0, 1.6, 0.85], [6, 0, 1.6, 0.8], [8, 3, 1, 0.6], [10, 0, 1.6, 0.85], [14, 2, 1.6, 0.8]]],
    roll: [[[1, 0, 1, 0.7], [2, 0, 1, 0.8], [3, 0, 1, 0.7], [5, 0, 1, 0.7], [6, 0, 1, 0.8], [7, 0, 1, 0.7], [9, 0, 1, 0.7], [10, 0, 1, 0.8], [11, 0, 1, 0.7], [13, 0, 1, 0.7], [14, 0, 1, 0.8], [15, 3, 1, 0.7]], [[2, 0, 1.5, 0.85], [3, 0, 1, 0.6], [6, 0, 1.5, 0.85], [7, 0, 1, 0.6], [10, 0, 1.5, 0.85], [11, 0, 1, 0.6], [14, 0, 1.5, 0.85], [15, 0, 1, 0.6]]],
    trap: [[[0, 0, 6.5, 1], [8, 0, 2, 0.8], [10, 0, 5, 0.9]], [[0, 0, 9, 1], [10, 2, 2.5, 0.8], [13, 0, 3, 0.85]]],
    eight: [[[0, 0, 1.8, 0.9], [2, 0, 1.8, 0.7], [4, 0, 1.8, 0.75], [6, 0, 1.8, 0.7], [8, 0, 1.8, 0.85], [10, 0, 1.8, 0.7], [12, 2, 1.8, 0.75], [14, 0, 1.8, 0.72]], [[0, 0, 3.5, 0.9], [4, 0, 1.8, 0.7], [6, 0, 1.8, 0.75], [8, 0, 3.5, 0.85], [12, 0, 1.8, 0.7], [14, 2, 1.8, 0.75]]],
    funk: [[[0, 0, 2, 1], [3, 3, 1, 0.8], [6, 0, 1, 0.7], [8, 0, 2, 0.9], [11, 2, 1, 0.75], [14, 3, 1, 0.8]], [[0, 0, 1.5, 1], [2, 0, 1, 0.6], [4, 3, 1, 0.8], [7, 0, 1, 0.7], [10, 2, 1.5, 0.8], [12, 0, 1, 0.7], [14, 1, 1.5, 0.8]]],
    drop: [[[0, 0, 3, 0.9], [4, 2, 2, 0.7], [8, 0, 2, 0.85], [11, 1, 2, 0.7], [14, 2, 2, 0.75]], [[0, 0, 2, 0.9], [3, 0, 1, 0.6], [6, 2, 2, 0.75], [8, 0, 3, 0.85], [14, 1, 2, 0.7]]],
    long: [[[0, 0, 15.5, 0.8]], [[0, 0, 7.6, 0.8], [8, 2, 7.6, 0.7]], [[0, 0, 11.5, 0.8], [12, 2, 3.6, 0.7]]],
    walk: [[[0, 0, 3.6, 0.9], [4, 1, 3.6, 0.75], [8, 2, 3.6, 0.8], [12, 1, 3.6, 0.75]], [[0, 0, 3.6, 0.9], [4, 2, 3.6, 0.75], [8, 3, 3.6, 0.8], [12, 2, 3.6, 0.75]]]
  },
  // Akkord-Rhythmen: [Schritt, Länge, Stärke]
  RH: {
    pop: [[[0, 3.6, 1], [6, 1.8, 0.75], [8, 3.6, 0.9], [12, 3.6, 0.8]], [[0, 5.6, 1], [6, 1.8, 0.7], [8, 5.6, 0.9], [14, 1.8, 0.7]], [[0, 7.6, 1], [8, 3.6, 0.85], [12, 3.6, 0.8]]],
    laid: [[[0, 6, 0.85], [10, 5.5, 0.7]], [[0, 9.5, 0.85], [10, 2, 0.6], [12, 3.6, 0.7]]],
    stab: [[[3, 2, 0.9], [6, 2, 0.8], [11, 2, 0.85], [14, 2, 0.7]], [[2, 1.5, 0.85], [6, 1.5, 0.8], [10, 1.5, 0.85], [14, 1.5, 0.8]], [[4, 2.5, 0.9], [10, 2.5, 0.85]]],
    long: [[[0, 15.6, 0.8]], [[0, 7.7, 0.8], [8, 7.7, 0.72]]],
    chop: [[[2, 1, 0.8], [4, 1, 0.6], [7, 1, 0.8], [10, 1, 0.7], [12, 1, 0.6], [15, 1, 0.8]], [[0, 1, 0.8], [3, 1, 0.7], [6, 1, 0.8], [8, 1, 0.6], [11, 1, 0.8], [14, 1, 0.7]]],
    off: [[[2, 1.6, 0.85], [6, 1.6, 0.8], [10, 1.6, 0.85], [14, 1.6, 0.8]], [[2, 1.6, 0.85], [3, 0.9, 0.6], [6, 1.6, 0.8], [10, 1.6, 0.85], [11, 0.9, 0.6], [14, 1.6, 0.8]]],
    power: [[[0, 5.5, 1], [6, 1.5, 0.8], [8, 3.5, 0.95], [12, 1.5, 0.8], [14, 1.8, 0.85]], [[0, 1.8, 1], [2, 1.8, 0.75], [4, 1.8, 0.85], [6, 1.8, 0.75], [8, 1.8, 1], [10, 1.8, 0.75], [12, 3.6, 0.9]]],
    comp: [[[0, 2.5, 0.8], [6, 3, 0.7], [14, 2, 0.75]], [[3, 2.5, 0.8], [8, 2, 0.7], [11, 3, 0.75]]],
    dark: [[[0, 7.5, 0.8], [8, 7.5, 0.6]], [[0, 11.5, 0.8], [12, 3.6, 0.6]]]
  },
  AP: [[0, 1, 2, 3, 2, 1, 2, 1], [0, 2, 1, 3, 2, 1, 2, 3], [0, 1, 2, 1, 3, 1, 2, 1], [3, 2, 1, 0, 1, 2, 3, 2], [0, 2, 3, 2, 0, 2, 3, 1]],
  // Stile: mood = Stimmung (Tonart, Akkordfolge) · parts = Besetzung
  STYLES: [
    { id: "pop", n: "Pop", d: "hell, eingängig, zum Mitsingen", mood: "froh", bpm: 108, c: ["#FFB25C", "#FF5C8A"], ic: "star",
      parts: [{ r: "beat", seed: "trommel", dr: "pop", vol: 1 }, { r: "bass", seed: "fingerbass", bs: "pop" }, { r: "akk", seed: "klavier", rh: "pop", lo: 55 }, { r: "arp", seed: "westerngitarre", ap: 2, lo: 55 }, { r: "mel", seed: "saite", base: 60, dens: 1 }, { r: "hook", seed: "floete", base: 72, dens: 1 }] },
    { id: "lofi", n: "Lo-Fi", d: "entspannt, warm, zum Runterkommen", mood: "nacht", bpm: 80, sw: 0.55, c: ["#7A8CFF", "#C17BFF"], ic: "blob",
      parts: [{ r: "beat", seed: "kit_minimal", dr: "laid", vol: 0.9 }, { r: "bass", seed: "fretless", bs: "laid", vol: 0.64 }, { r: "akk", seed: "epiano", rh: "laid", lo: 53, sev: 1 }, { r: "arp", seed: "vibraphon", ap: 4, lo: 60, d: 5 }, { r: "mel", seed: "kalimba", base: 60, dens: 0 }, { r: "hook", seed: "harfe", base: 67, dens: 1 }] },
    { id: "house", n: "House", d: "tanzbar, treibend, Club", mood: "treib", bpm: 124, c: ["#4F7BFF", "#35E0D0"], ic: "deck",
      parts: [{ r: "beat", seed: "kit_909", dr: "four", vol: 0.95 }, { r: "bass", seed: "synthbass", bs: "off", vol: 0.66 }, { r: "akk", seed: "dubstab", rh: "stab", lo: 55 }, { r: "arp", seed: "kristall", ap: 1, lo: 62, d: 1.2, vol: 0.4 }, { r: "mel", seed: "glocke", base: 64, dens: 0 }, { r: "hook", seed: "stimme_ooh", base: 64, dens: 0, vol: 0.8 }] },
    { id: "hiphop", n: "Hip-Hop", d: "schwerer Beat, tiefer Bass, dunkel", mood: "melan", bpm: 88, c: ["#FF6B5C", "#9B5CFF"], ic: "drum",
      parts: [{ r: "beat", seed: "kit_trap808", dr: "trap", vol: 0.95 }, { r: "bass", seed: "bass808", bs: "trap", vol: 0.68 }, { r: "akk", seed: "klavier", rh: "dark", lo: 48 }, { r: "arp", seed: "harfe", ap: 4, lo: 62, d: 4 }, { r: "mel", seed: "marimba", base: 57, dens: 0 }, { r: "hook", seed: "glocke", base: 69, dens: 1, vol: 0.75 }] },
    { id: "rock", n: "Rock", d: "Gitarren, Druck, laut", mood: "grunge", bpm: 116, c: ["#FF8A3C", "#E0453C"], ic: "spark",
      parts: [{ r: "beat", seed: "kit_rock", dr: "rock", vol: 0.9 }, { r: "bass", seed: "rk_bass", bs: "eight", vol: 0.78 }, { r: "akk", seed: "rk_crunch", rh: "power", lo: 40, pw: 1, vol: 1.1 }, { r: "arp", seed: "rk_clean", ap: 2, lo: 52, vol: 0.7 }, { r: "mel", seed: "egitarre", base: 59, dens: 0 }, { r: "hook", seed: "rk_lead", base: 64, dens: 1, vol: 1 }] },
    { id: "ballade", n: "Ballade", d: "Klavier und Streicher, gefühlvoll", mood: "sehnsucht", bpm: 72, c: ["#6FA8FF", "#B7A0FF"], ic: "keys",
      parts: [{ r: "bass", seed: "cello", bs: "long", vol: 0.7 }, { r: "akk", seed: "klavier", ap: 2, lo: 52, vol: 0.8, arpAs: 1 }, { r: "arp", seed: "streicher", rh: "long", lo: 55, vol: 0.5, padAs: 1 }, { r: "mel", seed: "floete", base: 67, dens: 0 }, { r: "hook", seed: "bogen", base: 67, dens: 1 }] },
    { id: "funk", n: "Funk", d: "knackig, groovt, macht Laune", mood: "funky", bpm: 104, c: ["#FFD15C", "#FF7A3C"], ic: "bass",
      parts: [{ r: "beat", seed: "trommel", dr: "funk", vol: 0.95 }, { r: "bass", seed: "slapbass", bs: "funk" }, { r: "akk", seed: "egitarre", rh: "chop", lo: 60, vol: 0.6 }, { r: "arp", seed: "epiano", rh: "comp", lo: 55, vol: 0.55, padAs: 1 }, { r: "mel", seed: "saxofon", base: 57, dens: 1 }, { r: "hook", seed: "trompete", base: 64, dens: 1 }] },
    { id: "sommer", n: "Sommer", d: "Strand, Sonne, leichte Brise", mood: "sommer", bpm: 96, c: ["#35E0A8", "#FFD15C"], ic: "photo",
      parts: [{ r: "beat", seed: "trommel", dr: "drop", vol: 0.85 }, { r: "bass", seed: "fingerbass", bs: "drop" }, { r: "akk", seed: "ukulele", rh: "off", lo: 60 }, { r: "arp", seed: "steeldrum", ap: 2, lo: 62, vol: 0.45 }, { r: "mel", seed: "marimba", base: 67, dens: 1 }, { r: "hook", seed: "floete", base: 72, dens: 1 }] },
    { id: "film", n: "Filmmusik", d: "groß, episch, Gänsehaut", mood: "episch", bpm: 92, c: ["#E0453C", "#7A3CFF"], ic: "people",
      parts: [{ r: "beat", seed: "trommel", dr: "epic", vol: 0.9 }, { r: "bass", seed: "cello", bs: "long", vol: 0.75 }, { r: "akk", seed: "streicher", rh: "long", lo: 55, vol: 0.6 }, { r: "arp", seed: "harfe", ap: 2, lo: 62 }, { r: "mel", seed: "horn", base: 57, dens: 0 }, { r: "hook", seed: "trompete", base: 62, dens: 0 }] },
    { id: "ambient", n: "Ambient", d: "schwebend, ruhig, weit", mood: "traum", bpm: 72, c: ["#35C0E0", "#6F7BFF"], ic: "mic",
      parts: [{ r: "bass", seed: "grund", bs: "long", vol: 0.6 }, { r: "akk", seed: "streicher", rh: "long", lo: 55, vol: 0.5 }, { r: "arp", seed: "handpan", ap: 2, lo: 57, d: 4, vol: 0.6 }, { r: "mel", seed: "kalimba", base: 62, dens: 0 }, { r: "hook", seed: "glocke", base: 69, dens: 0, vol: 0.6 }] },
    { id: "techno", n: "Techno", d: "hart, hypnotisch, nach vorn", mood: "treib", bpm: 132, c: ["#B03CFF", "#3C5CFF"], ic: "mix",
      parts: [{ r: "beat", seed: "kit_hard", dr: "hard", vol: 0.95 }, { r: "bass", seed: "rollbass", bs: "roll", vol: 0.6 }, { r: "akk", seed: "dubstab", rh: "stab", lo: 52, vol: 0.6 }, { r: "arp", seed: "acid303", ap: 1, lo: 40, d: 0.9, vol: 0.5 }, { r: "mel", seed: "glocke", base: 64, dens: 0, vol: 0.6 }, { r: "hook", seed: "supersaw", base: 64, dens: 0, vol: 0.55 }] },
    { id: "jazz", n: "Jazz", d: "swingt, verraucht, lässig", mood: "jazzig", bpm: 96, sw: 0.7, c: ["#C9A227", "#7A4B2A"], ic: "note",
      parts: [{ r: "beat", seed: "trommel", dr: "swing", vol: 0.75 }, { r: "bass", seed: "kontrabass", bs: "walk", vol: 0.85 }, { r: "akk", seed: "epiano", rh: "comp", lo: 53, sev: 1, vol: 0.6 }, { r: "arp", seed: "vibraphon", ap: 4, lo: 60, d: 4, vol: 0.45 }, { r: "mel", seed: "saxofon", base: 58, dens: 1 }, { r: "hook", seed: "klarinette", base: 65, dens: 1 }] }
  ],
  FORM: [["Intro", 4, ["akk", "arp"]], ["Strophe", 8, ["beat", "bass", "akk", "mel"]], ["Refrain", 8, ["beat", "bass", "akk", "arp", "hook"]], ["Strophe", 8, ["beat", "bass", "akk", "arp", "mel"]], ["Refrain", 8, ["beat", "bass", "akk", "arp", "hook"]], ["Break", 4, ["akk", "mel"]], ["Refrain", 8, ["beat", "bass", "akk", "arp", "hook"]], ["Outro", 4, ["akk", "arp"]]],
  byId(id) { return this.STYLES.find(s => s.id === id) || null; },
  // Melodie: Motiv (Takt 1) · Wiederholung auf dem neuen Akkord (Takt 2) · Gegenmotiv (Takt 3) · Schluss (Takt 4)
  melody(mood, mu, seed, o) {
    const r = K.rng(seed), P = mood.prog, deg = b => P[b % P.length], penta = new Set(mood.penta || [0, 1, 2, 3, 4, 5, 6]);
    const tonic = o.base + mod(mood.root - o.base, 12), lo = o.lo ?? -3, hi = o.hi ?? 8;
    const RH = [[[0, 8], [0, 6, 12], [0, 4, 8], [0, 8, 12], [0, 6, 8]], [[0, 4, 8, 12], [0, 3, 6, 8, 12], [0, 2, 4, 8, 12], [0, 6, 8, 10, 12], [2, 4, 8, 12], [0, 4, 6, 8, 12]], [[0, 2, 4, 6, 8, 12], [0, 3, 6, 8, 11, 14], [0, 2, 4, 8, 10, 12, 14], [0, 4, 6, 8, 10, 12]]];
    const pick = a => a[Math.floor(r() * a.length)], d0 = clamp(o.dens | 0, 0, 2);
    const rA = pick(RH[d0]), rB = pick(RH[d0]), rC = pick(RH[Math.max(0, d0 - 1)]), bars = [rA, rA, rB, rC];
    const isCh = (x, b) => { const k = mod(x - deg(b), 7); return k === 0 || k === 2 || k === 4; };
    const near = (x, b) => { let best = x, bd = 99; for (let y = lo; y <= hi; y++) if (isCh(y, b)) { const d = Math.abs(y - x) + r() * 0.4; if (d < bd) { bd = d; best = y; } } return best; };
    const step = () => { const q = r(); return q < 0.42 ? 1 : q < 0.8 ? -1 : q < 0.9 ? 2 : -2; };
    const fit = x => { while (x > hi) x -= 2; while (x < lo) x += 2; return x; };
    let cur = near(o.start ?? 2, 0); const ev = [], con = [];
    for (let b = 0; b < 4; b++) { const rh = bars[b];
      rh.forEach((s, j) => {
        const strong = j === 0 || s % 8 === 0, last = b === 3 && j === rh.length - 1; let c;
        if (last) c = near(cur, b);
        else if (b === 1 && j > 0 && !strong && con[j] != null) c = cur + con[j];
        else if (strong) c = near(cur + (j === 0 ? 0 : step()), b);
        else c = cur + step();
        if (!strong && !last) { let g = 0; while (!penta.has(mod(c, 7)) && !isCh(c, b) && g++ < 3) c += c >= cur ? 1 : -1; }
        c = fit(c); if (b === 0) con[j] = c - cur; cur = c;
        const nx = j + 1 < rh.length ? rh[j + 1] : 16, len = last ? 16 - s - 0.5 : Math.min((nx - s) * 0.92, o.maxD || 7);
        ev.push([b * 16 + s, len, tonic + mu.so(c), (strong ? 0.86 : 0.7) + (r() - 0.5) * 0.06]);
      }); }
    return ev;
  },
  // alle Spuren eines Stils berechnen (ohne etwas am Stück zu ändern – auch für den Prüfstand)
  build(S, seed, only, moodId) {
    const mood = K.MOODS.find(x => x.id === (moodId || S.mood)) || K.MOODS.find(x => x.id === S.mood), mu = K.music(mood), P = mood.prog, deg = b => P[b % P.length], R = K.rng((seed >>> 0) || 1);
    const tri = (b, base) => mu.chordMidi(deg(b), base);
    const voic = (b, lo, sev, pw) => { if (pw) { const r0 = tri(b, lo)[0]; return [r0, r0 + 7, r0 + 12]; } const v = tri(b, lo); if (sev) v.push(v[0] + mu.so(deg(b) + 6) - mu.so(deg(b))); return v.map(x => lo + mod(x - lo, 12)).sort((a, c) => a - c); };
    const hum = () => (R() - 0.5) * 0.05, pickR = a => a[Math.floor(R() * a.length)];
    const parts = [];
    for (const p of S.parts) {
      const sub = Math.floor(R() * 4e9) + 1, vr = R(); let ev = [], drum = false;   // jede Rolle zieht immer gleich viele Zufallszahlen: gleiche Zahl = gleiches Stück
      const rA = K.rng(sub), pk = a => a[Math.floor(rA() * a.length)];
      if (p.dr) { drum = true; const D = pk(this.DR[p.dr]); const V = { kick: { x: 0.95, X: 1, o: 0.6 }, snare: { x: 0.9, X: 1, o: 0.4 }, hat: { x: 0.5, X: 0.66, o: 0.3 } };
        for (let b = 0; b < 4; b++) { const B = b * 16, fill = b === 3 && D.F, kk = (b % 2 && D.K2) || D.K, sn = fill ? D.F : D.S;
          for (let s = 0; s < 16; s++) { if (kk[s] !== ".") ev.push([B + s, "kick", V.kick[kk[s]]]); if (sn[s] !== ".") ev.push([B + s, "snare", (V.snare[sn[s]] || 0.8) * (fill && s > 9 ? 0.8 : 1)]); if (D.H[s] !== "." && !(fill && s >= 10)) ev.push([B + s, "hat", V.hat[D.H[s]] + (rA() - 0.5) * 0.06]); }
          if (D.T && b === 0) ev.push([B, "top", 0.7]); } }
      else if (p.bs) { const pat = pk(this.BS[p.bs]), base = p.lo || 31; for (let b = 0; b < 4; b++) { const t = tri(b, base), T = [t[0], t[1], t[2], t[0] + 12, t[2] - 12]; for (const [s, i, d, v] of pat) ev.push([b * 16 + s, d, T[i], v + (rA() - 0.5) * 0.05]); } }
      else if (p.ap) { const pat = pk(this.AP), every = p.ap, d = p.d || every * 1.25, n = Math.floor(16 / every); for (let b = 0; b < 4; b++) { const v = voic(b, p.lo || 57, p.sev), T = [...v, v[0] + 12]; for (let j = 0; j < n; j++) ev.push([b * 16 + j * every, d, T[pat[j % pat.length] % T.length], (j % 2 ? 0.56 : 0.66) + (j === 0 ? 0.1 : 0) + (rA() - 0.5) * 0.05]); } }
      else if (p.rh) { const pat = pk(this.RH[p.rh]); for (let b = 0; b < 4; b++) { const v = voic(b, p.lo || 55, p.sev, p.pw); for (const [s, d, a] of pat) v.forEach((m, k) => ev.push([b * 16 + s + (p.pw ? 0 : k * 0.04), d, m, 0.78 * (a || 1) - k * 0.03])); } }
      else { ev = this.melody(mood, mu, sub, { base: p.base || 60, dens: p.dens || 0, start: p.r === "hook" ? 4 : 2, lo: p.r === "hook" ? -1 : -3, hi: p.r === "hook" ? 9 : 7 }); }
      if (S.sw && !drum) ev = ev.map(e => (Math.abs(mod(e[0], 4) - 2) < 0.01 ? [e[0] + S.sw, ...e.slice(1)] : e)); else if (S.sw) ev = ev.map(e => (Math.abs(mod(e[0], 4) - 2) < 0.01 ? [e[0] + S.sw, e[1], e[2]] : e));
      const sd = K.seedById(p.seed);
      parts.push({ role: p.r, seed: p.seed, name: this.ROLE[p.r][0], inst: sd ? sd.name : p.seed, vol: p.vol ?? this.VOL[p.r], drum, ev });
    }
    const have = new Set(parts.map(p => p.role));
    const sections = this.FORM.map(([n, bars, rs]) => { let on = rs.filter(r => have.has(r)); if (on.length < 2) on = [...new Set([...on, ...["akk", "arp", "mel"].filter(r => have.has(r))])].slice(0, 3); return [n, bars, on]; });
    return { mood, parts: only ? parts.filter(p => p.role === only) : parts, sections };
  },
  zoneU: { kick: 0.15, snare: 0.47, hat: 0.72, top: 0.92 },
  evOf(p) { return p.ev.map(e => p.drum ? { s: e[0], d: 1, z: e[1], v: clamp(e[2], 0.05, 1), u: this.zoneU[e[1]] || 0.5 } : { s: e[0], d: e[1], m: e[2], v: clamp(e[3], 0.05, 1), u: clamp((e[2] - 28) / 60, 0, 1) }); },
  // Formen, Loops, Ablauf und Pult-Szenen anlegen (ohne Warten – auch für den Prüfstand)
  fill(S, seed) {
    const B = this.build(S, seed); this.meta = null; Music.set(B.mood); Music.setTempo(S.bpm);
    if (Forms.MAX - Forms.list.length < B.parts.length) { UI.toast("Dafür ist im Stück kein Platz mehr – erst Formen löschen", 2600); return null; }
    const made = {}, n = B.parts.length;
    B.parts.forEach((p, i) => { const ang = ((i + 0.5) / n - 0.5) * Math.PI * 1.25, rr = p.role === "beat" || p.role === "bass" ? 2.2 : 3.1;
      const f = Forms.make({ seedId: p.seed, name: p.name, pos: { x: Math.sin(ang) * rr, y: 0, z: -Math.cos(ang) * rr * 0.8 - 0.4 } }); if (!f) return;
      Forms.rebuild(f, true); f.still = false; f.takes = []; f.fine.vol = p.vol; Forms.applyMix(f);
      const t = Loops.newTake(f, 4, this.evOf(p), p.name); t.base = 0; made[p.role] = f; });
    Song.sections = B.sections.map(([name, bars, rs]) => ({ id: uid("s"), name, bars, on: rs.map(r => made[r] && made[r].id).filter(Boolean), off: [], mel: {}, lv: {}, tr: null, bpm: null, beat: null }));
    Song.intro = 0; Song.outro = 2;
    this.meta = { style: S.id, seed: seed >>> 0, rs: {}, mood: S.mood, fresh: true, roles: Object.fromEntries(Object.entries(made).map(([r, f]) => [f.id, r])) };
    try { MixUI.auto("aus", true); } catch (e) { console.warn(e); }   // Lautstärken, Plätze auf der Bühne und Hall nach Rolle
    try { Pult.sLoad(null); const seen = new Set(); let k = 0; for (const s of Song.sections) { if (seen.has(s.name) || k >= Pult.N) continue; seen.add(s.name); Pult.scn[k++] = { ids: s.on.slice(), name: s.name }; } Pult.cur = -1; } catch (e) { console.warn(e); }
    return made;
  },
  // neu würfeln: eine Spur (f) oder alle erzeugten Spuren – Instrumente, Lautstärken und Ablauf bleiben
  reroll(f) {
    const M = this.meta, S = M && this.byId(M.style); if (!S) return false; Undo.push();
    const seed = (Math.floor(Math.random() * 4e9) + 1) >>> 0, B = this.build(S, seed, null, M.mood); let n = 0; if (!M.rs) M.rs = {};
    for (const g of Forms.list) { const role = M.roles[g.id]; if (!role || (f && g !== f)) continue; const p = B.parts.find(x => x.role === role); if (!p) continue;
      const t = (g.takes || [])[0]; if (t) { t.ev = this.evOf(p); t.bars = 4; } else Loops.newTake(g, 4, this.evOf(p), p.name).base = 0; if (f) M.rs[role] = seed; n++; }
    if (!f) { M.seed = seed; M.rs = {}; } Save.soon(); Hap(12); return n > 0;
  },
  RCOL: { beat: "#FF8A6B", bass: "#B08CFF", akk: "#6FB1FF", arp: "#5FE0C4", mel: "#FFD76B", hook: "#FF8AD8" },
  // Stimmung gewechselt: dieselben Muster in der neuen Tonart und Akkordfolge (nur erzeugte Loops)
  remood(moodId) {
    const M = this.meta, S = M && this.byId(M.style); if (!S || !K.MOODS.some(x => x.id === moodId) || (M.mood || S.mood) === moodId) return 0; let n = 0; const cache = {};
    for (const g of Forms.list) { const role = M.roles[g.id]; if (!role) continue; const sd = (M.rs && M.rs[role]) || M.seed, B = cache[sd] || (cache[sd] = this.build(S, sd, null, moodId)), p = B.parts.find(x => x.role === role), t = (g.takes || [])[0]; if (!p || !t || p.drum) continue; t.ev = this.evOf(p); n++; }
    M.mood = moodId; return n;
  },
  roleOf(f) { return (this.meta && this.meta.roles[f.id]) || null; },
  col(f) { const r = this.roleOf(f); return r ? this.RCOL[r] : colOf(f); },
  icOf(f) { const r = this.roleOf(f); if (r) return I67[this.ROLE[r][1]]; if (f.kind === "drum") return I67.drum; const k = K.roleOf(f); return k === "bass" ? I67.bass : k === "flaeche" ? I67.chord : f.kind === "sample" ? I67.mic : I67.note; },
  stamp() { const d = new Date(), z = x => String(x).padStart(2, "0"); return `${z(d.getDate())}.${z(d.getMonth() + 1)}. ${z(d.getHours())}:${z(d.getMinutes())}`; },
  async make(id) {
    const S = this.byId(id); if (!S || this.busy) return; this.busy = true; Hap(14);
    try {
      if (Transport.running) Transport.stop();
      const nm = `${S.n} ${this.stamp()}`;
      if (this.meta && this.meta.fresh && Projects.cur) { Project.load({ forms: [], mood: Music.mood.id, help: Music.help }, true); try { Pads.load([]); } catch (_) {} Undo.clear(); Projects.cur.name = nm; Projects.name(); }   // noch unberührt: ersetzen statt sammeln
      else await Projects.create(nm, "leer");
      const made = this.fill(S, (Math.floor(Math.random() * 4e9) + 1) >>> 0); if (!made) return;
      const first = Object.values(made)[0]; if (first) Forms.setActive(first);
      UI.hideSheets(); UI.setTab("song"); UI.refresh(); Save.soon(); try { await Save.now(); } catch (_) {}
      UI.toast(`Dein ${S.n}-Song ist da – er spielt gleich los. Tippe auf die Punkte, um Instrumente in einem Teil an- oder auszuschalten.`, 5200);
      setTimeout(() => { try { if (UI.tab === "song" && !Song.playing) SongUI.play(0); } catch (e) { console.warn(e); } }, 450);
    } finally { this.busy = false; }
  },
  open() {
    const s = Sheets.open("Song in 1 Minute", Sheets.head("Song in 1 Minute") + `<p class="sxp">Wähle einen <b>Stil</b>. KLANGRAUM stellt eine Band zusammen, schreibt Beat, Bass, Akkorde und Melodie und legt einen Ablauf mit Strophe und Refrain an. Danach änderst du alles nach Geschmack.</p>
      <div class="sxst">${this.STYLES.map(S => `<button class="sxs" data-style="${S.id}" style="--c1:${S.c[0]};--c2:${S.c[1]}"><i>${I67[S.ic]}</i><b>${esc(S.n)}</b><span>${esc(S.d)}</span><em>${S.bpm} BPM</em></button>`).join("")}</div>
      <p class="sxp sxs2">${this.meta && this.meta.fresh ? "Dein eben erzeugter Song ist noch unverändert – er wird durch den neuen <b>ersetzt</b>." : "Es entsteht ein <b>neues Stück</b>. Dein jetziges bleibt unter „Meine Stücke“ gespeichert."}</p>`);
    s.addEventListener("click", e => { const b = e.target.closest("[data-style]"); if (!b) return; b.classList.add("q7busy"); this.make(b.dataset.style); });
    return s;
  }
};
// Stimmung wechseln (Knopf oben): der erzeugte Song zieht in die neue Tonart um
{ const ms = Music.set.bind(Music); Music.set = function (m) { let user = false, bpm = 0; try { const M = SongGen.meta; user = !!(M && App.started && m && m.id && (M.mood || "") !== m.id); if (user) { bpm = Math.round(Music.tempo()); Undo.push(); } } catch (_) { user = false; }
    const r = ms.apply(null, arguments); try { if (user && SongGen.meta) { const n = SongGen.remood(m.id); Music.setTempo(bpm); if (n) { Save.soon(); UI.toast(`Dein Song spielt jetzt in der Stimmung „${m.name}“ – Bass, Akkorde und Melodien sind umgezogen`, 3200); } } } catch (e) { console.warn(e); } return r; }; }
{ const up = Undo.push.bind(Undo); Undo.push = function () { try { if (SongGen.meta) SongGen.meta.fresh = false; } catch (_) {} return up(); }; }
// im Stück speichern, welche Form welche Rolle spielt (für „Neu würfeln“ und die Symbole)
{ const pd = Project.data.bind(Project); Project.data = function (mem) { const d = pd(mem); try { if (SongGen.meta) { const ids = new Set(Forms.list.map(f => f.id)), roles = {}; for (const k in SongGen.meta.roles) if (ids.has(k)) roles[k] = SongGen.meta.roles[k]; if (Object.keys(roles).length) d.sg67 = { style: SongGen.meta.style, seed: SongGen.meta.seed, roles, rs: { ...(SongGen.meta.rs || {}) }, mood: SongGen.meta.mood || null }; } if (SongUI.loop === false) d.sgNoLoop = true; } catch (_) {} return d; };
  const pl = Project.load.bind(Project); Project.load = function (d, mem) { let was = false; try { was = Song.playing && Transport.running && !SongUI.undoing; } catch (_) {} SongGen.meta = null; const r = pl(d, mem); if (was) setTimeout(() => { try { if (Transport.running && !Song.playing) Transport.stop(); } catch (_) {} }, 0); try { const m = d && d.sg67; SongGen.meta = m && m.roles ? { style: String(m.style), seed: m.seed >>> 0, roles: { ...m.roles }, rs: { ...(m.rs || {}) }, mood: m.mood || null } : null; SongUI.loop = !(d && d.sgNoLoop); if (!SongUI.undoing) SongUI.sel = -1; MixUI.pre = null; } catch (_) {} return r; }; }
// Rückgängig / Wiederholen: ein laufender Song läuft an derselben Stelle weiter, der gewählte Teil bleibt offen
for (const k of ["undo", "redo"]) { const o = Undo[k].bind(Undo); Undo[k] = function () { let st = null; const sel = SongUI.sel; try { if (Song.playing && !Song.rec && Transport.running) st = Song.startStep; } catch (_) {} SongUI.undoing = true;
    try { return o(); } finally { SongUI.undoing = false; try { if (st != null && Song.sections.length && Transport.running) { Song.startStep = st; Song.playing = true; Song.tick(); } SongUI.sel = Math.min(sel, Song.sections.length - 1); if (UI.tab === "song") SongUI.render(true); else if (UI.tab === "mix") MixUI.render(true); else if (UI.tab === "start") Home67.render(true); } catch (e) { console.warn(e); } } }; }

/* ---------- Song-Ansicht: Teile als Blöcke · wer spielt wann · abspielen · aufnehmen ---------- */
const SongUI = {
  sel: -1, loop: true, sig: "",
  COL: { intro: "#5B8CFF", strophe: "#2FD0B5", refrain: "#F25CC1", break: "#FFB84D", solo: "#A66BFF", outro: "#7C8AA8", schluss: "#7C8AA8", bridge: "#FFB84D" },
  NAMES: ["Intro", "Strophe", "Refrain", "Break", "Solo", "Outro"],
  abbr(n) { n = String(n || ""); return ({ Intro: "Int.", Strophe: "Str.", Refrain: "Ref.", Break: "Brk.", Outro: "Out.", Schluss: "Schl." })[n] || (n.length > 5 ? n.slice(0, 4) + "." : n); },
  col(s) { const k = String(s.name || "").toLowerCase(); for (const n in this.COL) if (k.startsWith(n)) return this.COL[n]; return "#8FA0C8"; },
  el() { return $("vSong"); },
  forms() { return Forms.list.filter(f => !f.empty && !f.remote); },
  hasLoop(f) { return Loops.count(f) > 0 || !!LoopSt.trackOf(f); },
  secs() { return Song.total() * 4 * 60 / Music.tempo(); },
  mmss(t) { t = Math.round(t); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`; },
  // vor dem Abspielen: alles hörbar machen, was im Ablauf vorkommt
  prep() { let scene = false; try { scene = Pult.cur >= 0 || Pult.q.size > 0 || !!Pult.dropSt; } catch (_) {} for (const f of Forms.list) { if (f.lpOff) f.lpOff = false; if (scene) { try { Fade.set(f, true, true); } catch (_) {} } Forms.applyMix(f); } try { Pult.q.clear(); Pult.cur = -1; } catch (_) {} },
  play(i) { if (!Engine.ctx) return; if (!Song.sections.length) { if (!this.forms().length) return; Song.suggest(); } this.prep(); Song.play(clamp(i | 0, 0, Song.sections.length - 1)); this.render(); },
  stop() { Song.stop(true); if (Transport.running) Transport.stop(); this.clearG(); this.render(); },
  clearG() { for (const f of Forms.list) if (f.songG != null) { f.songG = null; Forms.applyMix(f); } },
  toggle() { Hap(10); if (Song.playing) this.stop(); else this.play(this.sel >= 0 ? this.sel : 0); },
  record() { if (!Engine.ctx) return; if (Song.rec) { SongUI.recName = null; Song.stop(); if (Transport.running) Transport.stop(); this.clearG(); this.render(); return; } if (!Song.sections.length) return; Hap(14); this.prep(); SongUI.recName = ((Projects.cur && Projects.cur.name) || "Mein Song").slice(0, 32); Song.record(); this.render(); UI.toast(`Dein Song wird aufgenommen (${this.mmss(this.secs())} min) – einfach zuhören. Danach kannst du ihn anhören und teilen.`, 4200); },
  // Stelle im Lied: Teil und Anteil
  pos() { if (!Song.playing || !Transport.running) return null; const rel = (Engine.now() - Transport.t0) / Transport.spb - Song.startStep; if (rel < 0) return { i: -1, u: 0, pre: true }; let acc = 0; for (let i = 0; i < Song.sections.length; i++) { const L = Song.sections[i].bars * 16; if (rel < acc + L) return { i, u: (rel - acc) / L, bar: Math.floor((rel - acc) / 16) + 1 }; acc += L; } return null; },
  sigOf() { return [Song.sections.map(s => s.id + s.name + s.bars + s.on.join(".")).join("|"), this.forms().map(f => f.id + f.name + (this.hasLoop(f) ? 1 : 0) + colOf(f) + (f.mute ? "m" : "") + (f.solo ? "s" : "")).join("|"), this.sel, Song.playing ? 1 : 0, Song.rec ? 1 : 0, this.loop ? 1 : 0, Math.round(Music.tempo()), Music.mood.id, Projects.cur && Projects.cur.name].join("§"); },
  render(force) {
    const el = this.el(); if (!el || el.hidden) return; const sg = this.sigOf(); if (!force && sg === this.sig && el.firstChild) return; this.sig = sg;
    const F = this.forms(), S = Song.sections, name = (Projects.cur && Projects.cur.name) || "Mein Stück";
    if (!F.length || (!S.length && !F.some(f => this.hasLoop(f)))) {
      el.innerHTML = `<div class="sg sxempty"><div class="sxart"><i></i><i></i><i></i><i></i><i></i></div><h2>Dein Song</h2><p>${F.length ? "Deine Klänge haben noch keine Loops. Ein Song entsteht aus Loops, die sich in Teilen wie Strophe und Refrain abwechseln." : "Hier baust du aus Teilen wie Strophe und Refrain ein ganzes Lied."}</p>
        <button class="hmhero" data-sg="gen"><i>${I67.magic}</i><span><b>Song in 1 Minute</b><small>Stil wählen – die Band spielt sofort</small></span></button>
        ${F.length ? `<button class="sxbtn" data-sg="tokeys"><i>${I67.keys}</i>Selbst eine Melodie einspielen</button>` : ""}</div>`; return;
    }
    if (this.sel >= S.length) this.sel = -1;
    const flow = S.map((s, i) => `<button class="sxb${i === this.sel ? " q7sel" : ""}" data-sb="${i}" style="--c:${this.col(s)};--w:${s.bars}" aria-label="${esc(s.name)}, ${s.bars} Takte – tippen zum Bearbeiten"><b>${esc(s.name)}</b><small>${s.bars} Takte</small><i class="sxpr"></i></button>`).join("");
    const e = this.sel >= 0 ? S[this.sel] : null;
    const edit = e ? `<div class="sxed" style="--c:${this.col(e)}"><div class="sxedh"><b>${esc(e.name)}</b><small>Teil ${this.sel + 1} von ${S.length}</small><button class="sxx" data-sg="desel" aria-label="Bearbeiten schließen">${I67.x}</button></div>
        <div class="sxnm">${this.NAMES.map(n => `<button data-sn="${n}" aria-pressed="${e.name === n}" style="--c:${this.col({ name: n })}">${n}</button>`).join("")}</div>
        <div class="sxrow"><span class="sxlab">Länge</span><div class="sxstep"><button data-sg="shorter" aria-label="kürzer"${e.bars <= 1 ? " disabled" : ""}>−</button><b>${e.bars} Takte</b><button data-sg="longer" aria-label="länger"${e.bars >= 32 ? " disabled" : ""}>＋</button></div>
          <button class="sxi" data-sg="left" aria-label="Teil nach vorn schieben"${this.sel <= 0 ? " disabled" : ""}>${I67.left}</button><button class="sxi" data-sg="right" aria-label="Teil nach hinten schieben"${this.sel >= S.length - 1 ? " disabled" : ""}>${I67.right}</button></div>
        <div class="sxrow"><button class="sxbtn" data-sg="from"><i>${I67.play}</i>Ab hier hören</button><button class="sxbtn" data-sg="dup"><i>${I67.copy}</i>Doppeln</button><button class="sxbtn q7warn" data-sg="del"${S.length < 2 ? " disabled" : ""}><i>${I67.trash}</i>Löschen</button></div></div>` : "";
    const anySolo = F.some(f => f.solo);
    const rows = F.map(f => { const lp = this.hasLoop(f), sd = K.seedById(f.inst || f.seedId), quiet = f.mute || (anySolo && !f.solo), sub = f.solo ? "nur dieser ist zu hören" : f.mute ? "stumm geschaltet" : anySolo ? "schweigt (ein anderer spielt allein)" : SongGen.roleOf(f) && sd ? sd.name : lp ? "" : "noch kein Loop";
      return `<div class="sxr${lp ? "" : " q7nol"}${quiet ? " q7mut" : ""}${f.solo ? " q7so" : ""}" style="--c:${SongGen.col(f)}"><button class="sxn" data-sf="${f.id}" aria-label="${esc(f.name)}: Optionen"><i>${SongGen.icOf(f)}</i><span><b>${esc(f.name)}</b>${sub ? `<small>${esc(sub)}</small>` : ""}</span></button><div class="sxcs">${S.map((s, i) => `<button class="sxc" data-sc="${i}" data-f="${f.id}" aria-pressed="${s.on.includes(f.id)}" style="--c:${this.col(s)}" aria-label="${esc(f.name)} im Teil ${esc(s.name)}: ${s.on.includes(f.id) ? "spielt" : "pausiert"}"></button>`).join("")}</div></div>`; }).join("");
    el.innerHTML = `<div class="sg">
      <div class="sxtop"><button class="sxplay${Song.playing ? " q7on" : ""}" data-sg="play" aria-label="${Song.playing ? "Song anhalten" : "Song abspielen"}">${Song.playing ? I67.stop : I67.play}</button>
        <div class="sxti"><b>${esc(name)}</b><small>${esc(Music.mood.name)} · ${Math.round(Music.tempo())} BPM · ${this.mmss(this.secs())} min</small></div>
        <button class="sxlp" data-sg="loop" aria-pressed="${this.loop}" aria-label="Song wiederholen: ${this.loop ? "an" : "aus"}">${I67.loop}</button></div>
      ${S.length ? `<div class="sxh"><h3>Ablauf</h3><small>antippen = bearbeiten</small></div><div class="sxflow" role="list">${flow}<button class="sxadd" data-sg="add" aria-label="Neuen Teil anhängen">${I67.plus}</button></div>${edit}
      <div class="sxh"><h3>Wer spielt wann?</h3><small>Punkt = an / aus</small></div>
      <div class="sxmx"><div class="sxr sxhd"><span class="sxn"></span><div class="sxcs">${S.map((s, i) => `<button class="sxch" data-sb="${i}" style="--c:${this.col(s)}">${esc(this.abbr(s.name))}</button>`).join("")}</div></div>${rows}</div>`
      : `<div class="sxnos"><p>Deine Klänge haben Loops, aber noch keinen Ablauf.</p><button class="sxbtn q7big" data-sg="suggest"><i>${I67.magic}</i>Ablauf vorschlagen</button></div>`}
      <div class="sxact">${SongGen.meta ? `<button class="sxbtn" data-sg="dice"><i>${I67.dice}</i>Neu würfeln</button>` : ""}<button class="sxbtn" data-sg="newf"><i>${I67.plus}</i>Klang dazu</button><button class="sxbtn" data-sg="mix"><i>${I67.mix}</i>Mischen</button></div>
      <button class="sxrec${Song.rec ? " q7on" : ""}" data-sg="rec"><i>${Song.rec ? I67.stop : I67.rec}</i><span><b>${Song.rec ? "Aufnahme beenden" : "Song aufnehmen und teilen"}</b><small>${Song.rec ? "läuft – einfach zuhören · antippen speichert bis hierher" : "einmal von vorn bis hinten, als Audio-Datei"}</small></span></button>
      <button class="sxlink" data-sg="gen">${I67.magic}<span>Neuen Song in einem anderen Stil</span></button></div>`;
    this.paint();
  },
  // Abspielstelle zeigen (ohne neu zu zeichnen)
  paint() {
    const el = this.el(); if (!el || el.hidden) return; const p = this.pos(), bs = el.querySelectorAll(".sxb");
    bs.forEach((b, i) => { const on = !!p && p.i === i; b.classList.toggle("q7cur", on); const pr = b.querySelector(".sxpr"); if (pr) pr.style.width = on ? (p.u * 100).toFixed(1) + "%" : "0"; });
    el.querySelectorAll(".sxch").forEach((b, i) => b.classList.toggle("q7cur", !!p && p.i === i));
    el.querySelectorAll(".sxc").forEach(b => b.classList.toggle("q7cur", !!p && p.i === +b.dataset.sc));
    const cur = p && p.i >= 0 ? bs[p.i] : null; if (cur && this.lastCur !== p.i) { this.lastCur = p.i; try { const fl = cur.parentElement; fl.scrollTo({ left: cur.offsetLeft - (fl.clientWidth - cur.offsetWidth) / 2, behavior: "smooth" }); } catch (_) {} } if (!p) this.lastCur = -1;
  },
  tick() {
    try { if (Song.playing && !Transport.running) { Song.stop(true); this.clearG(); }
      if (UI.tab === "song") { this.render(); this.paint(); } else if (UI.tab === "start") Home67.paint(); else if (UI.tab === "mix") MixUI.paint();
      const b = $("tSong"); if (b) b.classList.toggle("q7live", !!Song.playing); } catch (e) { console.warn(e); }
  },
  act(k, b) {
    const S = Song.sections, i = this.sel, s = i >= 0 ? S[i] : null, ch = () => { Save.soon(); this.render(true); };
    if (k === "play") return this.toggle();
    if (k === "rec") return this.record();
    if (Song.rec && !["desel", "mix", "loop"].includes(k)) return this.busyRec();
    if (k === "loop") { this.loop = !this.loop; Hap(); UI.toast(this.loop ? "Der Song beginnt am Ende wieder von vorn" : "Der Song hält am Ende an", 1800); return ch(); }
    if (k === "gen") return SongGen.open();
    if (k === "tokeys") { UI.setTab("klang"); try { KeysUI.open(); } catch (_) {} return; }
    if (k === "mix") return UI.setTab("mix");
    if (k === "newf") { UI.setTab("klang"); Sheets.seeds(); UI.toast("Wähle einen Klang. Mit „Tasten“ oder „Loop“ spielst du ihm einen Loop ein – dann erscheint er im Song.", 4200); return; }
    if (k === "suggest") { Undo.push(); Song.suggest(); return ch(); }
    if (k === "dice") { if (SongGen.reroll()) UI.toast("Neu gewürfelt: andere Muster und Melodien, gleiche Band", 2200); return ch(); }
    if (k === "desel") { this.sel = -1; return this.render(true); }
    if (k === "add") { Undo.push(); const base = s || S[S.length - 1]; const n = { id: uid("s"), name: base ? base.name : "Strophe", bars: base ? base.bars : 4, on: base ? [...base.on] : this.forms().map(f => f.id), off: base ? [...(base.off || [])] : [], mel: {}, lv: base ? { ...(base.lv || {}) } : {}, tr: null, bpm: null, beat: null }; S.push(n); this.sel = S.length - 1; Hap(); return ch(); }
    if (!s) return;
    if (k === "from") return this.play(i);
    Undo.push();
    if (k === "shorter") s.bars = Math.max(1, s.bars > 4 ? s.bars - 4 : s.bars - 1);
    else if (k === "longer") s.bars = Math.min(32, s.bars >= 4 ? s.bars + 4 : s.bars + 1);
    else if (k === "left" && i > 0) { S.splice(i - 1, 0, S.splice(i, 1)[0]); this.sel = i - 1; }
    else if (k === "right" && i < S.length - 1) { S.splice(i + 1, 0, S.splice(i, 1)[0]); this.sel = i + 1; }
    else if (k === "dup") { S.splice(i + 1, 0, { ...s, id: uid("s"), on: [...s.on], off: [...(s.off || [])], mel: { ...(s.mel || {}) }, lv: { ...(s.lv || {}) }, tr: s.tr ? { ...s.tr } : null }); this.sel = i + 1; }
    else if (k === "del" && S.length > 1) { S.splice(i, 1); this.sel = -1; }
    Hap(); const was = Song.playing; ch(); if (was) this.play(this.sel >= 0 ? this.sel : 0);   // läuft mit der neuen Fassung weiter
  },
  busyRec() { UI.toast("Die Aufnahme läuft – ändern geht danach wieder. Oder unten „Aufnahme beenden“.", 2600); },
  rowMenu(f) {
    const role = SongGen.roleOf(f), sd = K.seedById(f.inst || f.seedId);
    const s = Sheets.open("Klang im Song", Sheets.head(f.name) + `<p class="sxp">${esc(sd ? sd.name : "")}${this.hasLoop(f) ? "" : " · noch kein Loop – spiel ihm mit „Tasten“ oder „Loop“ etwas ein"}</p><div class="sxmenu">
      ${role ? `<button class="sxbtn q7big" data-rm="dice"><i>${I67.dice}</i><span><b>Neu würfeln</b><small>${role === "beat" ? "anderer Rhythmus" : role === "mel" || role === "hook" ? "andere Melodie" : "anderes Muster"} – der Rest bleibt</small></span></button>` : ""}
      ${f.kind === "drum" ? "" : `<button class="sxbtn q7big" data-rm="inst"><i>${I67.blob}</i><span><b>Anderes Instrument</b><small>die Töne bleiben, der Klang wechselt</small></span></button>`}
      <button class="sxbtn q7big" data-rm="solo"><i>${I67.solo}</i><span><b>${f.solo ? "Wieder alle hören" : "Nur diesen hören"}</b><small>zum genauen Hinhören</small></span></button>
      <button class="sxbtn q7big" data-rm="open"><i>${I67.keys}</i><span><b>Selbst spielen und formen</b><small>im Bereich „Spielen“ öffnen</small></span></button>
      <button class="sxbtn q7big q7warn" data-rm="del"><i>${I67.trash}</i><span><b>Aus dem Stück entfernen</b><small>rückgängig mit ↶ oben</small></span></button></div>`);
    s.addEventListener("click", e => { const b = e.target.closest("[data-rm]"); if (!b) return; const k = b.dataset.rm; Hap();
      if (k === "dice") { SongGen.reroll(f); UI.hideSheets(); UI.toast(`${f.name}: neu gewürfelt`, 1600); }
      else if (k === "inst") { SongUI.back = true; Sheets.seeds(f); }
      else if (k === "solo") { UI.toggleSolo(f); UI.hideSheets(); }
      else if (k === "open") { UI.hideSheets(); Forms.setActive(f); UI.setTab("klang"); UI.setView("nah"); }
      else if (k === "del") { UI.hideSheets(); Undo.push(); Forms.del(f); }
      this.render(true); });
  },
  bind(el) {
    el.addEventListener("click", e => {
      if (Song.rec && e.target.closest("[data-sc], [data-sn], [data-sf]")) return this.busyRec();
      const c = e.target.closest("[data-sc]"); if (c) { const s = Song.sections[+c.dataset.sc], id = c.dataset.f; if (!s) return; Undo.push(); const k = s.on.indexOf(id); if (k >= 0) s.on.splice(k, 1); else s.on.push(id); Hap(6); c.setAttribute("aria-pressed", k < 0); { const f = Forms.byId(id); c.setAttribute("aria-label", `${f ? f.name : ""} im Teil ${s.name}: ${k < 0 ? "spielt" : "pausiert"}`); } this.sig = this.sigOf(); Save.soon(); return; }
      const sb = e.target.closest("[data-sb]"); if (sb) { const i = +sb.dataset.sb; this.sel = this.sel === i ? -1 : i; Hap(6); return this.render(true); }
      const sn = e.target.closest("[data-sn]"); if (sn && this.sel >= 0) { Undo.push(); Song.sections[this.sel].name = sn.dataset.sn; Save.soon(); Hap(6); return this.render(true); }
      const sf = e.target.closest("[data-sf]"); if (sf) { const f = Forms.byId(sf.dataset.sf); if (f) this.rowMenu(f); return; }
      const a = e.target.closest("[data-sg]"); if (a && !a.disabled) this.act(a.dataset.sg, a);
    });
  }
};
// Lied zu Ende: wiederholen (nahtlos) oder anhalten – nicht alle Spuren auf einmal weiterspielen
{ const os = Song.onStep.bind(Song); Song.onStep = function (step, time) {
    if (this.playing) { const rel = step - this.startStep, T = this.total() * 16;
      if (T > 0 && rel >= T && rel % 16 === 0) {
        if (SongUI.loop && !this.rec) this.startStep = step;      // von vorn, ohne Lücke
        else { const rec = this.rec, r = os(step, time);
          Visual.at(time, () => { for (const f of Forms.list) { f.songG = 0; Forms.applyMix(f); } });
          Visual.at(time + (rec ? 2.6 : 0.05), () => setTimeout(() => { try { if (!Song.playing) { if (Transport.running) Transport.stop(); SongUI.clearG(); SongUI.render(true); } } catch (e) { console.warn(e); } }, 0));
          return r; } } }
    return os(step, time);
  }; }
// Anzeige-Zeitplan: verträgt es, wenn ein Ereignis den Takt anhält (dabei wird die Liste geleert)
Visual.run = function (now) { for (let i = this.q.length - 1; i >= 0; i--) { if (i >= this.q.length) { i = this.q.length; continue; } const e = this.q[i]; if (e && now >= e.at) { this.q.splice(i, 1); try { e.fn(); } catch (err) { console.warn(err); } } } };
// die Song-Aufnahme heißt wie das Stück (nicht „Live-Session“)
{ const ra = Recs.add.bind(Recs); Recs.add = function (chs, sr, name, kind, ...rest) { if (kind === "mitschnitt" && SongUI.recName) { name = SongUI.recName; SongUI.recName = null; } return ra(chs, sr, name, kind, ...rest); }; }
setInterval(() => SongUI.tick(), 160);

/* ---------- Mischen: Regler mit Pegel · Auto-Mix · Bühne ---------- */
const MixUI = {
  sig: "", pre: null,
  PRE: { aus: ["Ausgewogen", { beat: 1, bass: 1, other: 1, hall: 1, wide: 1 }], druck: ["Druckvoll", { beat: 1.15, bass: 1.15, other: 0.86, hall: 0.6, wide: 0.8 }], sanft: ["Sanft", { beat: 0.62, bass: 0.8, other: 1, hall: 1.5, wide: 1 }], weit: ["Weit", { beat: 0.9, bass: 0.9, other: 1, hall: 1.6, wide: 1.7 }] },
  HALL: { beat: 0.6, bass: 0.4, akk: 1, arp: 1.3, mel: 1.1, hook: 1.1 },
  el() { return $("vMix"); },
  forms() { return SongUI.forms(); },
  role(f) { const r = SongGen.roleOf(f); if (r) return r; if (f.kind === "drum") return "beat"; const k = K.roleOf(f); return k === "bass" ? "bass" : k === "flaeche" ? "arp" : k === "rhythmus" ? "beat" : "mel"; },
  baseVol(f) { const r = this.role(f), S = SongGen.meta && SongGen.byId(SongGen.meta.style), p = S && SongGen.roleOf(f) ? S.parts.find(x => x.r === r) : null; return (p && p.vol) ?? SongGen.VOL[r] ?? 0.8; },
  mxOf(f) { return f.mx || (f.mx = { pan: null, hall: 1 }); },
  panOf(f) { const m = this.mxOf(f); return m.pan != null ? m.pan : (f.mixNow ? f.mixNow.pan : 0) || 0; },
  // Lautstärken, Plätze und Hall nach der Rolle der Klänge einstellen
  auto(id, quiet) {
    const P = (this.PRE[id] || this.PRE.aus)[1], F = this.forms(); if (!F.length) return; if (!quiet) Undo.push(); this.pre = id || "aus";
    const slots = [-0.38, 0.38, -0.64, 0.64, -0.2, 0.2, -0.8, 0.8]; let k = 0;
    for (const f of F) { const r = this.role(f), g = r === "beat" ? P.beat : r === "bass" ? P.bass : P.other, m = this.mxOf(f);
      f.fine.vol = clamp(this.baseVol(f) * g, 0.05, 1.5);
      m.pan = r === "beat" ? 0.12 : r === "bass" ? -0.12 : clamp(slots[k++ % slots.length] * P.wide, -0.92, 0.92);
      m.hall = clamp((this.HALL[r] ?? 1) * P.hall, 0.2, 2);
      Forms.applyMix(f); }
    if (quiet) return; Save.soon(); Hap(12); this.render(true);
  },
  sigOf() { return [this.forms().map(f => f.id + f.name + colOf(f) + (f.mute ? 1 : 0) + (f.solo ? 1 : 0) + (f.fd ? 2 : 0) + ":" + Math.round(f.fine.vol * 100) + ":" + Math.round(((f.mx && f.mx.pan) || 0) * 50) + ":" + Math.round(((f.mx && f.mx.hall) || 1) * 20)).join("|"), Math.round((Global.master ?? 1) * 100), Home67.audible() ? 1 : 0, Song.playing ? 1 : 0, this.pre, this.drag ? 1 : 0].join("§"); },
  fader(id, v, max, lab) { const u = clamp(v / max, 0, 1) * 100; return `<div class="mxf" data-mf="${id}" role="slider" tabindex="0" aria-label="${esc(lab)}" aria-valuemin="0" aria-valuemax="${Math.round(max * 100)}" aria-valuenow="${Math.round(v * 100)}"><i class="mxlv"></i><i class="mxfill" style="width:${u}%"></i><i class="mxk" style="left:${u}%"></i><em style="left:${100 / max}%"></em></div><b class="mxv">${Math.round(v * 100)}</b>`; },
  render(force) {
    const el = this.el(); if (!el || el.hidden) return; if (this.drag) return; const sg = this.sigOf(); if (!force && sg === this.sig && el.firstChild) return; this.sig = sg;
    const F = this.forms(), play = Home67.audible();
    if (!F.length) { el.innerHTML = `<div class="mx sxempty"><div class="sxart"><i></i><i></i><i></i><i></i><i></i></div><h2>Mischen</h2><p>Sobald dein Stück Klänge hat, stellst du hier ein, wie laut jeder ist und wo er auf der Bühne steht.</p><button class="hmhero" data-mx="gen"><i>${I67.magic}</i><span><b>Song in 1 Minute</b><small>Stil wählen – die Band spielt sofort</small></span></button></div>`; return; }
    const rows = F.map(f => `<div class="mxr${f.mute ? " q7off" : ""}" data-id="${f.id}" style="--c:${SongGen.col(f)}"><button class="mxn" data-mn="${f.id}" aria-label="${esc(f.name)} kurz anspielen"><i>${SongGen.icOf(f)}</i><b>${esc(f.name)}</b></button>
        <div class="mxfw">${this.fader(f.id, f.fine.vol, 1.5, f.name + ": Lautstärke")}</div>
        <button class="mxb" data-mm="${f.id}" aria-pressed="${!!f.mute}" aria-label="${esc(f.name)} ${f.mute ? "wieder einschalten" : "stumm schalten"}">${f.mute ? I67.mute : I67.vol}</button><button class="mxb q7solo" data-ms="${f.id}" aria-pressed="${!!f.solo}" aria-label="${esc(f.name)}: ${f.solo ? "wieder alle hören" : "nur diesen hören"}">${I67.solo}</button></div>`).join("");
    const dots = F.map(f => { const m = this.mxOf(f), x = 50 + this.panOf(f) * 44, y = 84 - clamp((m.hall - 0.2) / 1.8, 0, 1) * 68; return `<button class="mxdot${f.mute ? " q7off" : ""}" data-md="${f.id}" style="--c:${SongGen.col(f)};left:${x.toFixed(1)}%;top:${y.toFixed(1)}%" aria-label="${esc(f.name)} auf der Bühne verschieben"><i>${SongGen.icOf(f)}</i><span>${esc(f.name)}</span></button>`; }).join("");
    el.innerHTML = `<div class="mx"><div class="sxtop"><button class="sxplay${play ? " q7on" : ""}" data-mx="play" aria-label="${play ? "Anhalten" : "Anhören"}">${play ? I67.stop : I67.play}</button><div class="sxti"><b>Mischen</b><small>${play ? "läuft – stell alles nach Gehör ein" : "▶ starten, dann nach Gehör einstellen"}</small></div></div>
      <div class="mxauto"><button class="mxmagic" data-mp="aus"><i>${I67.magic}</i><span><b>Auto-Mix</b><small>ein Tipp, und es klingt rund</small></span></button>
        <div class="mxpre">${Object.entries(this.PRE).map(([id, [n]]) => `<button data-mp="${id}" aria-pressed="${this.pre === id}">${n}</button>`).join("")}</div></div>
      <div class="mxcols"><section class="mxsec"><div class="sxh"><h3>Lautstärke</h3><small>Regler ziehen</small></div><div class="mxrows">${rows}</div>
          <div class="mxr q7master" style="--c:#fff"><span class="mxn"><i>${I67.vol}</i><b>Alles</b></span><div class="mxfw">${this.fader("__m", Global.master ?? 1, 1.2, "Gesamtlautstärke")}</div></div></section>
        <section class="mxsec"><div class="sxh"><h3>Bühne</h3><small>Punkte ziehen</small></div>
          <div class="mxstage"><span class="mxl q7t">hinten · mehr Hall</span><span class="mxl q7b">vorn · ganz nah</span><span class="mxl q7l">links</span><span class="mxl q7r">rechts</span><i class="mxarc q7a"></i><i class="mxarc q7b"></i><i class="mxarc q7c"></i>${dots}</div></section></div></div>`;
  },
  paint() {
    const el = this.el(); if (!el || el.hidden) return; this.render(); const lv = (Engine.stat && Engine.stat.lv) || [];
    for (const r of el.querySelectorAll(".mxr[data-id]")) { const f = Forms.byId(r.dataset.id); if (!f) continue; const v = Transport.running ? Math.min(1, (lv[f.bus & 7] || 0) * 1.6) : 0; const m = r.querySelector(".mxlv"); if (m) m.style.width = (v * clamp(f.fine.vol / 1.5, 0, 1) * 100).toFixed(1) + "%"; }
    for (const d of el.querySelectorAll(".mxdot")) { const f = Forms.byId(d.dataset.md); if (f) d.style.setProperty("--lv", Transport.running ? Math.min(1, (lv[f.bus & 7] || 0) * 1.6).toFixed(2) : "0"); }
  },
  setVol(id, v, row) {
    if (id === "__m") { v = clamp(v, 0, 1.2); if (Math.abs(v - 1) < 0.035) v = 1; Global.master = v; Engine.setGlobal(Global.hall, Global.echo); }
    else { const f = Forms.byId(id); if (!f) return; v = clamp(v, 0, 1.5); if (Math.abs(v - 1) < 0.035) v = 1; f.fine.vol = v; Forms.applyMix(f); }
    const max = id === "__m" ? 1.2 : 1.5, u = v / max * 100, w = row.querySelector(".mxf"); w.querySelector(".mxfill").style.width = u + "%"; w.querySelector(".mxk").style.left = u + "%"; w.setAttribute("aria-valuenow", Math.round(v * 100)); row.querySelector(".mxv").textContent = Math.round(v * 100);
  },
  bind(el) {
    el.addEventListener("click", e => {
      const a = e.target.closest("[data-mx]"); if (a) { Hap(10); if (a.dataset.mx === "gen") return SongGen.open(); Home67.pp(); return this.render(true); }
      const p = e.target.closest("[data-mp]"); if (p) { this.auto(p.dataset.mp); UI.toast(`Auto-Mix „${this.PRE[p.dataset.mp][0]}“: Lautstärken, Plätze und Hall sind eingestellt. Mit ↶ oben nimmst du es zurück.`, 3200); return; }
      const m = e.target.closest("[data-mm]"); if (m) { const f = Forms.byId(m.dataset.mm); if (f) { Hap(8); Fade.set(f, !!f.mute, true); Forms.applyMix(f); Save.soon(); } return this.render(true); }
      const s = e.target.closest("[data-ms]"); if (s) { const f = Forms.byId(s.dataset.ms); if (f) { Hap(8); UI.toggleSolo(f); } return this.render(true); }
      const n = e.target.closest("[data-mn]"); if (n) { const f = Forms.byId(n.dataset.mn); if (f) { try { Forms.setActive(f); Forms.play(f, 0.5, 0.8); } catch (_) {} } return; }
    });
    // Regler: waagerecht ziehen (senkrecht bleibt das Blättern)
    el.addEventListener("pointerdown", e => {
      const w = e.target.closest(".mxf"); if (w) { const row = w.closest(".mxr"), r = w.getBoundingClientRect(), id = w.dataset.mf, max = id === "__m" ? 1.2 : 1.5; this.drag = { k: "f", id, row, r, max, pid: e.pointerId, x0: e.clientX, y0: e.clientY, go: e.pointerType === "mouse" };
        if (this.drag.go) { Undo.push(); this.drag.u = true; this.setVol(id, (e.clientX - r.left) / r.width * max, row); } try { w.setPointerCapture(e.pointerId); } catch (_) {} return; }
      const d = e.target.closest(".mxdot"); if (d) { const f = Forms.byId(d.dataset.md), st = d.parentElement.getBoundingClientRect(); if (!f) return; this.drag = { k: "d", f, d, st, pid: e.pointerId }; d.classList.add("q7drag"); try { d.setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault(); }
    });
    el.addEventListener("pointermove", e => { const D = this.drag; if (!D || D.pid !== e.pointerId) return;
      if (D.k === "f") { if (!D.go) { const dx = Math.abs(e.clientX - D.x0), dy = Math.abs(e.clientY - D.y0); if (dy > 10 && dy > dx) { this.drag = null; return; } if (dx < 5) return; D.go = true; } if (!D.u) { Undo.push(); D.u = true; } this.setVol(D.id, (e.clientX - D.r.left) / D.r.width * D.max, D.row); }
      else { if (!D.u) { Undo.push(); D.u = true; } const x = clamp((e.clientX - D.st.left) / D.st.width, 0.06, 0.94), y = clamp((e.clientY - D.st.top) / D.st.height, 0.16, 0.84), m = this.mxOf(D.f); let pan = clamp((x - 0.5) / 0.44, -1, 1); if (Math.abs(pan) < 0.06) pan = 0; m.pan = pan; m.hall = 0.2 + clamp((0.84 - y) / 0.68, 0, 1) * 1.8; Forms.applyMix(D.f); D.d.style.left = (50 + pan * 44).toFixed(1) + "%"; D.d.style.top = (y * 100).toFixed(1) + "%"; } });
    const end = e => { const D = this.drag; if (!D || D.pid !== e.pointerId) return; if (D.k === "f" && !D.go && e.type === "pointerup") { Undo.push(); this.setVol(D.id, (e.clientX - D.r.left) / D.r.width * D.max, D.row); } if (D.d) D.d.classList.remove("q7drag"); this.drag = null; Save.soon(); this.sig = ""; };
    el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
    el.addEventListener("keydown", e => { const w = e.target.closest && e.target.closest(".mxf"); if (!w || !["ArrowLeft", "ArrowRight"].includes(e.key)) return; e.preventDefault(); const id = w.dataset.mf, cur = id === "__m" ? (Global.master ?? 1) : (Forms.byId(id) || { fine: { vol: 1 } }).fine.vol; this.setVol(id, cur + (e.key === "ArrowRight" ? 0.05 : -0.05), w.closest(".mxr")); this.sig = this.sigOf(); Save.soon(); });
  }
};

/* ---------- Start: Was möchtest du machen? ---------- */
const Home67 = {
  sig: "",
  TILES: [["keys", "keys", "Melodie spielen", "Bunte Tasten, bekannte Lieder", "#4F7BFF", "#35C0E0"], ["play", "blob", "Klänge formen", "Antippen, kneten, drehen", "#9B5CFF", "#E05CD8"], ["mic", "mic", "Aufnehmen", "Stimme oder Geräusch wird Instrument", "#FF6B5C", "#FFB25C"], ["photo", "photo", "Foto wird Musik", "Ein Bild komponiert ein Stück", "#2FD0B5", "#4F7BFF"], ["pult", "deck", "Live auflegen", "Klänge starten wie ein DJ", "#F25CC1", "#9B5CFF"], ["jam", "people", "Zusammen spielen", "Mit Freunden per Link", "#FFB25C", "#F25CC1"]],
  el() { return $("vStart"); },
  nForms() { return Forms.list.filter(f => !f.empty && !f.remote).length; },
  // klingt gerade wirklich etwas? (der Takt allein macht noch keinen Ton)
  audible() { try { return !!Song.playing || (Transport.running && (Forms.list.some(f => SoloStart.playing(f)) || (typeof Techno !== "undefined" && !!Techno.on))); } catch (_) { return Transport.running; } },
  sigOf() { return [Projects.cur && Projects.cur.name, this.nForms(), Music.mood.id, Math.round(Music.tempo()), this.audible() ? 1 : 0, Song.sections.length].join("§"); },
  render(force) {
    const el = this.el(); if (!el || el.hidden) return; const sg = this.sigOf(); if (!force && sg === this.sig && el.firstChild) return; this.sig = sg;
    const n = this.nForms(), name = (Projects.cur && Projects.cur.name) || "Mein Stück", run = this.audible();
    el.innerHTML = `<div class="hm"><div class="hmtop"><span class="hmk">KLANGRAUM</span><h1>Was möchtest du <br>heute machen?</h1></div>
      <button class="hmhero" data-hm="song"><i>${I67.magic}</i><span><b>Song in 1 Minute</b><small>Stil wählen – die Band spielt sofort</small></span><em>${I67.right}</em></button>
      <div class="hmgrid">${this.TILES.map(([k, ic, t, d, c1, c2]) => `<button class="hmt" data-hm="${k}" style="--c1:${c1};--c2:${c2}"><i>${I67[ic]}</i><b>${t}</b><span>${d}</span></button>`).join("")}</div>
      <div class="hmcur${run ? " q7run" : ""}"><div class="hmeq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div class="hmci"><small>Dein Stück</small><b>${esc(name)}</b><span>${n} ${n === 1 ? "Klang" : "Klänge"} · ${esc(Music.mood.name)} · ${Math.round(Music.tempo())} BPM</span></div>
        <button class="sxplay${run ? " q7on" : ""}" data-hm="pp" aria-label="${run ? "Anhalten" : "Dein Stück anhören"}">${run ? I67.stop : I67.play}</button>
        <div class="hmrow"><button data-hm="tsong">${I67.song}<span>Song</span></button><button data-hm="tmix">${I67.mix}<span>Mischen</span></button><button data-hm="pieces">${I67.folder}<span>Meine Stücke</span></button></div></div>
      <div class="hmfoot"><button data-hm="erkl">${I67.help}<span><b>Was ist das?</b><small>Tippe etwas an – ich erkläre es</small></span></button><button data-hm="help" class="hmh">Hilfe</button></div></div>`;
  },
  paint() { this.render(); },
  // ▶ / ■ für das ganze Stück: Song abspielen, sonst alles starten, was Loops hat oder sich dreht
  pp() {
    if (!Engine.ctx) return;
    if (this.audible()) { if (Song.playing) SongUI.stop(); else Transport.stop(); return; }
    const loops = Forms.list.some(f => Loops.count(f) > 0 || LoopSt.trackOf(f));
    if (Song.sections.length && loops) return SongUI.play(0);
    if (loops) { for (const f of Forms.list) { if (f.lpOff) f.lpOff = false; } if (!Transport.running) Transport.toggle(); else { try { LoopCtl.release(); } catch (_) {} } return; }
    UI.toastAct("Dein Stück hat noch nichts, das von selbst spielt. Lass dir einen Song bauen – oder spiel die Klänge im Bereich „Spielen“ selbst.", "Song bauen", () => SongGen.open(), 5200);
  },
  recSheet() {
    const s = Sheets.open("Aufnehmen", Sheets.head("Aufnehmen") + `<p class="sxp">Was möchtest du aufnehmen?</p><div class="sxmenu">
      <button class="sxbtn q7big" data-ra="form"><i>${I67.mic}</i><span><b>Einen Klang</b><small>Stimme, Klatschen, Glas … wird sofort ein spielbares Instrument</small></span></button>
      <button class="sxbtn q7big" data-ra="loop"><i>${I67.loop}</i><span><b>Einen Loop</b><small>ein paar Takte aufnehmen, die sich wiederholen (Loopstation)</small></span></button>
      <button class="sxbtn q7big" data-ra="sing"><i>${I67.note}</i><span><b>Gesang zum Stück</b><small>du singst, während dein Stück läuft</small></span></button></div>
      <p class="sxp sxs2">Das Mikrofon geht nur auf der KLANGRAUM-Website oder im eigenen Fenster. Wenn es gesperrt ist, zeigt KLANGRAUM den Weg.</p>`);
    s.addEventListener("click", e => { const b = e.target.closest("[data-ra]"); if (!b) return; const k = b.dataset.ra; Hap(); UI.hideSheets();
      if (k === "form") { UI.setTab("klang"); setTimeout(() => { try { MicForm.toggle(); } catch (_) {} }, 250); }
      else if (k === "loop") { UI.setTab("loop"); setTimeout(() => { const b2 = document.querySelector("#lsbox"); if (b2) b2.scrollIntoView({ behavior: "smooth", block: "start" }); }, 250); }
      else { UI.setTab("klang"); setTimeout(() => { try { Sing.sheet(); } catch (_) {} }, 250); } });
  },
  act(k) {
    Hap(8);
    if (k === "song") return SongGen.open();
    if (k === "keys") { UI.setTab("klang"); setTimeout(() => { try { KeysUI.open(); } catch (e) { console.warn(e); } }, 120); return; }
    if (k === "play") { UI.setTab("klang"); if (!this.nForms()) setTimeout(() => Sheets.seeds(), 150); return; }
    if (k === "mic") return this.recSheet();
    if (k === "photo") return UI.setTab("bild");
    if (k === "pult") return UI.setTab("loop");
    if (k === "jam") { try { Cmd.L.jam.run(Forms.active); } catch (e) { console.warn(e); } return; }
    if (k === "pp") { this.pp(); return this.render(true); }
    if (k === "tsong") return UI.setTab("song");
    if (k === "tmix") return UI.setTab("mix");
    if (k === "pieces") return Projects.open();
    if (k === "erkl") return Erkl.start();
    if (k === "help") return Help.open();
  },
  bind(el) { el.addEventListener("click", e => { const b = e.target.closest("[data-hm]"); if (b) this.act(b.dataset.hm); }); }
};

/* ---------- Erklär-Modus: erst „Was ist das?“, dann irgendetwas antippen ---------- */
const Erkl = {
  on: false,
  T: [
    ["#bProj", "Meine Stücke", "Hier liegen alle deine Stücke. KLANGRAUM speichert von selbst – der Haken zeigt es. Tippen öffnet die Liste: neues Stück, umbenennen, als Datei sichern."],
    ["#bPlay", "Start und Stopp", "Startet oder stoppt die ganze Musik: alle Loops, den Beat und alles, was sich dreht."],
    ["#bUndo", "Rückgängig", "Nimmt den letzten Schritt zurück. Du kannst also nichts kaputt machen – probier ruhig alles aus."],
    ["#bMood", "Stimmung", "Die Stimmung legt Tonart und Akkorde fest – fröhlich, melancholisch, episch … Alle Klänge passen sich an, deshalb klingt nie etwas falsch."],
    ["#bFull", "Vollbild", "Blendet alle Leisten aus, damit du mehr Platz für die Klangformen hast. Nochmal tippen holt sie zurück."],
    ["#bMenu", "Menü", "Einstellungen: Tempo, Mikrofon, Leistung, gemeinsam spielen und die Hilfe."],
    ["#tStart", "Start", "Die Startseite: von hier kommst du zu allem – Song bauen, Melodie spielen, aufnehmen."],
    ["#tKlang", "Spielen", "Hier spielst du die Klangformen mit dem Finger: antippen, wischen, kneten, drehen."],
    ["#tSong", "Song", "Hier setzt du aus Teilen wie Strophe und Refrain ein ganzes Lied zusammen."],
    ["#tMix", "Mischen", "Hier stellst du ein, wie laut jeder Klang ist und wo er auf der Bühne steht."],
    ["#tMehr", "Mehr", "Weitere Bereiche: live auflegen (Pult), Beat-Maschine, Schnittraum, Foto wird Musik."],
    ['[data-vs="nah"]', "Ansicht: Form", "Zeigt eine einzelne Klangform groß – zum Spielen und Formen."],
    ['[data-vs="alle"]', "Ansicht: Alle", "Zeigt alle Klangformen nebeneinander auf ihren Plattentellern."],
    ['[data-vs="raum"]', "Ansicht: Raum", "Zeigt die Formen im Raum. Wo eine Form steht, bestimmt ihren Klang: links/rechts und nah/fern."],
    [".bub.add, .ksnew", "Neuer Klang", "Holt einen neuen Klang ins Stück: Instrumente, Schlagzeug, Bässe, Stimmen."],
    [".bub.raum", "Mischpult", "Öffnet das ausführliche Mischpult. Einfacher geht es unten im Bereich „Mischen“."],
    [".bub[data-id]", "Deine Klänge", "Jede Kugel ist ein Klang in deinem Stück. Tippen holt ihn nach vorn."],
    [".fnpp, .lplay", "Läuft / Pause", "Lässt diesen Klang mitspielen oder pausieren."],
    [".cueb", "Set-Knopf", "Für Fortgeschrittene: legt fest, in welcher Reihenfolge Klänge nacheinander einsetzen."],
    [".navedge", "Nächster Klang", "Wechselt zum nächsten Klang. Wischen neben der Form geht auch."],
    [".ksname", "Gewählter Klang", "Zeigt, welcher Klang gerade gewählt ist. Tippen öffnet alle seine Einstellungen."],
    [".kpm", "Spielen oder Bearbeiten", "„Spielen“: jede Berührung macht Töne. „Bearbeiten“: langes Drücken öffnet Werkzeuge. Zum Musizieren auf „Spielen“ lassen."],
    [".kshide", "Leiste wegklappen", "Klappt die Bedienleiste weg – mehr Platz für die Form. „▴ Leiste“ holt sie zurück."],
    [".ksdet", "Mehr Einstellungen", "Klappt alle Einstellungen des Klangs auf: Lautstärke, Effekte, Drehen, Loops."],
    ['[data-fx="power"]', "An / Aus", "Schaltet diesen Klang stumm oder wieder an."],
    ['[data-fx="spin"]', "Drehen", "Lässt die Form sich drehen. Eine drehende Form spielt von selbst eine Tonfolge im Takt."],
    ['[data-fx="loop"]', "Loop an / aus", "Ein Loop ist eine kurze Aufnahme, die sich wiederholt. Hier schaltest du die Loops dieses Klangs an oder aus."],
    ['[data-fx="solo"]', "Einzeln", "Nur diesen Klang hören, alle anderen schweigen. Gut zum genauen Hinhören."],
    ['[data-fx="mic"]', "Mikrofon", "Nimmt mit dem Mikrofon etwas auf – das wird sofort ein neuer, spielbarer Klang."],
    ['[data-fx="all"]', "Alle Klänge", "Eine Liste aller Klänge mit ihren Schaltern – alles auf einen Blick."],
    ['[data-ks="keys"], [data-pt="keys"]', "Tasten", "Farbige Tasten wie auf einem Klavier, aber ohne falsche Töne. Du kannst bekannte Lieder nachspielen und Melodien aufnehmen."],
    ['[data-ks="knead"]', "Kneten", "Forme den Klang mit dem Finger wie Knete: hineindrücken macht ihn höher, Spitzen machen ihn heller, rund macht ihn weich."],
    ['[data-ks="brush"]', "Malen", "Male Farbe auf die Form. Jede Farbe ist ein Effekt: zum Beispiel Hall oder Echo."],
    ['[data-ks="loop"], [data-pt="loop"]', "Loop aufnehmen", "Nimmt auf, was gerade klingt, und wiederholt es danach endlos. So schichtest du Klang auf Klang."],
    ['[data-ks="rec"]', "Live-Aufnahme", "Nimmt alles auf, was du ab jetzt spielst – als Audio-Datei zum Anhören und Teilen."],
    ['[data-ks="retro"]', "Rückblick", "KLANGRAUM merkt sich immer die letzte Minute. Gerade etwas Schönes gespielt? Hier holst du es zurück."],
    ['[data-ks="scenes"]', "Szenen", "Merkt sich, welche Klänge gerade laufen, und ruft diesen Zustand später mit einem Tipp wieder ab."],
    [".kfab", "Werkzeug-Kreis", "Öffnet einen Kreis mit allen Werkzeugen für den gewählten Klang."],
    [".pp[data-pp]", "Klang-Feld", "Tippen schaltet den Klang ein oder aus – immer passend zum Takt. Halten: nur diesen hören."],
    ["[data-psc]", "Szene", "Eine Szene merkt sich, welche Klänge zusammen laufen – zum Beispiel „Strophe“ oder „Refrain“. Tippen wechselt dorthin."],
    ['[data-hm="keys"]', "Melodie spielen", "Öffnet farbige Tasten, auf denen kein Ton falsch klingt. Du kannst bekannte Lieder nachspielen oder eine eigene Melodie aufnehmen."],
    ['[data-hm="play"]', "Klänge formen", "Führt zu den Klangformen: antippen spielt Töne, kneten verändert den Klang, drehen lässt sie von selbst spielen."],
    ['[data-hm="mic"]', "Aufnehmen", "Nimmt mit dem Mikrofon auf: einen Klang, der zum Instrument wird, einen Loop oder Gesang zu deinem Stück."],
    ['[data-hm="photo"], [data-mo="bild"]', "Foto wird Musik", "Du wählst ein Foto. KLANGRAUM liest Farben, Helligkeit und Linien und komponiert daraus ein passendes Stück."],
    ['[data-hm="pult"], [data-mo="loop"]', "Live auflegen", "Das Pult: jedes Feld ist ein Klang. Antippen startet oder stoppt ihn passend zum Takt – wie ein DJ."],
    ['[data-hm="jam"], [data-mo="jam"]', "Zusammen spielen", "Lade jemanden per Link oder QR-Code ein. Ihr hört und spielt dann gemeinsam im selben Takt."],
    ['[data-hm="tsong"]', "Song", "Öffnet die Song-Ansicht: der Ablauf deines Stücks und wer in welchem Teil spielt."],
    ['[data-hm="tmix"], [data-sg="mix"]', "Mischen", "Öffnet das Mischen: Lautstärke je Klang und die Bühne zum Aufstellen."],
    ['[data-hm="pieces"], [data-mo="pieces"]', "Meine Stücke", "Die Liste all deiner Stücke. Jedes wird von selbst gespeichert."],
    ['[data-hm="help"], [data-mo="help"]', "Hilfe", "Die ausführliche Hilfe mit Suche und „Ich will …“-Antworten."],
    ['[data-hm="pp"]', "Dein Stück anhören", "Spielt dein Stück ab oder hält es an."],
    ['[data-mo="beat"]', "Beat-Maschine", "Ein Raster für Techno-Beats: Felder antippen setzt Schläge, dazu Bass und Effekte."],
    ['[data-mo="schnitt"]', "Schnittraum", "Hier legst du Aufnahmen als Spuren übereinander, verschiebst und schneidest sie."],
    ['[data-mo="stueck"]', "Loops und Aufnahmen", "Für Geübte: einzelne Töne in Loops ändern und alle Aufnahmen verwalten."],
    ['[data-mo="menu"]', "Einstellungen", "Tempo, Mikrofon, Leistung und mehr."],
    ['[data-mo="all"]', "Alle Bereiche zeigen", "Zeigt Pult, Stück, Beat, Schnitt und Bild wieder direkt in der Leiste unten."],
    [".sxs", "Stil", "Antippen baut einen ganzen Song in diesem Stil: Band, Beat, Akkorde, Melodie und Ablauf."],
    ["[data-sn]", "Name des Teils", "Gibt dem Teil einen Namen. Der Name ändert nur Farbe und Beschriftung, nicht die Musik."],
    [".sxch", "Teil", "Die Spalte für diesen Teil des Lieds. Darunter siehst du, wer dort mitspielt."],
    ['[data-sg="from"]', "Ab hier hören", "Spielt den Song ab diesem Teil."],
    ['[data-sg="dup"]', "Doppeln", "Fügt denselben Teil gleich danach noch einmal ein."],
    ['[data-sg="del"]', "Teil löschen", "Entfernt diesen Teil aus dem Ablauf. ↶ oben holt ihn zurück."],
    ['[data-sg="shorter"], [data-sg="longer"]', "Länge", "Macht den Teil kürzer oder länger – in Schritten von vier Takten."],
    ['[data-sg="left"], [data-sg="right"]', "Verschieben", "Schiebt den Teil im Ablauf nach vorn oder nach hinten."],
    ['[data-sg="newf"]', "Klang dazu", "Holt einen weiteren Klang ins Stück. Sobald er einen Loop hat, bekommt er eine Zeile im Song."],
    ["[data-mn]", "Klang anspielen", "Spielt den Klang kurz an, damit du hörst, welcher es ist."],
    [".hmhero, [data-sg=\"gen\"], [data-mx=\"gen\"]", "Song in 1 Minute", "Du wählst nur einen Stil. KLANGRAUM stellt eine Band zusammen und schreibt Beat, Bass, Akkorde, Melodie und einen Ablauf mit Strophe und Refrain."],
    ['[data-hm="erkl"]', "Was ist das?", "Genau das hier: Danach tippst du irgendetwas an und bekommst es erklärt."],
    [".sxplay", "Abspielen", "Spielt dein Stück ab oder hält es an."],
    [".sxlp", "Wiederholen", "An: der Song beginnt am Ende wieder von vorn. Aus: er hält am Ende an."],
    [".sxb", "Song-Teil", "Ein Teil deines Lieds, zum Beispiel Strophe oder Refrain. Antippen: Name, Länge und Reihenfolge ändern oder ab hier hören."],
    [".sxadd", "Teil anhängen", "Hängt einen weiteren Teil an dein Lied an."],
    [".sxc", "Spielt hier mit?", "Leuchtet der Punkt, spielt dieses Instrument in diesem Teil mit. Antippen schaltet um."],
    [".sxn", "Instrument", "Antippen: neu würfeln, anderes Instrument wählen, allein hören oder entfernen."],
    ['[data-sg="dice"]', "Neu würfeln", "Erfindet neue Rhythmen und Melodien im selben Stil. Band und Ablauf bleiben."],
    [".sxrec", "Song aufnehmen", "Spielt den Song einmal von vorn bis hinten und speichert ihn als Audio-Datei zum Teilen."],
    [".mxmagic, .mxpre button", "Auto-Mix", "Stellt Lautstärke, Platz und Hall aller Klänge passend zu ihrer Rolle ein – als guter Ausgangspunkt."],
    [".mxf", "Lautstärke-Regler", "Nach rechts ziehen = lauter, nach links = leiser. Der helle Streifen zeigt, wie laut der Klang gerade wirklich ist."],
    ['[data-mm]', "Stumm", "Schaltet diesen Klang stumm oder wieder an."],
    ['[data-ms]', "Nur diesen hören", "Alle anderen Klänge schweigen so lange."],
    [".mxdot, .mxstage", "Bühne", "Stell deine Band auf: links oder rechts im Kopfhörer, vorn klingt nah und trocken, hinten weit weg mit Hall."],
    ["canvas", "Klangform", "Das ist eine Klangform. Tippe sie an: unten klingt sie tief, oben hoch. Wischen verbindet Töne, mehrere Finger spielen Akkorde."]
  ],
  find(el) {
    for (let n = el; n && n.nodeType === 1 && n !== document.documentElement; n = n.parentElement) {
      for (const [sel, t, x] of this.T) { let ok = false; try { ok = n.matches(sel); } catch (_) {} if (ok) return { el: n, t, x }; }
      if (n.tagName === "BUTTON" || n.getAttribute("role") === "button" || n.tagName === "INPUT") { const a = n.getAttribute("aria-label") || n.title || "", tx = (n.textContent || "").replace(/\s+/g, " ").trim().slice(0, 30);
        { const bb = n.querySelector("b"); if (bb && bb.textContent.trim()) return { el: n, t: bb.textContent.trim().slice(0, 34), x: a && a !== tx ? a : ((n.querySelector("small, span span, span") || {}).textContent || "").trim() || "Probier es einfach aus – mit ↶ oben nimmst du jeden Schritt zurück." }; }
        return { el: n, t: tx || "Knopf", x: a && a !== tx ? a : "Dafür habe ich noch keine eigene Erklärung. Probier es einfach aus – mit ↶ oben nimmst du jeden Schritt zurück." }; }
    }
    return null;
  },
  start() {
    if (this.on) return; this.on = true; document.body.classList.add("kerkl"); Hap(10);
    let bar = $("erklBar"); if (!bar) { bar = document.createElement("div"); bar.id = "erklBar"; bar.innerHTML = `<i>${I67.help}</i><span><b>Was ist das?</b><small>Tippe irgendetwas an – nichts wird ausgelöst.</small></span><button id="erklEnd">Fertig</button>`; document.body.appendChild(bar);
      const ring = document.createElement("div"); ring.id = "erklRing"; ring.hidden = true; document.body.appendChild(ring);
      const b = document.createElement("div"); b.id = "erklB"; b.hidden = true; b.setAttribute("role", "status"); document.body.appendChild(b);
      bar.querySelector("#erklEnd").addEventListener("click", () => this.stop()); }
    bar.hidden = false; bar.classList.add("q7bot");
  },
  stop() { this.on = false; document.body.classList.remove("kerkl"); for (const id of ["erklBar", "erklRing", "erklB"]) { const e = $(id); if (e) e.hidden = true; } },
  show(hit) {
    const ring = $("erklRing"), b = $("erklB"); if (!ring || !b) return; if (!hit) { ring.hidden = true; b.hidden = true; return; }
    const r = hit.el.getBoundingClientRect(), big = hit.el.tagName === "CANVAS", W = innerWidth, H = innerHeight;
    ring.hidden = big; if (!big) Object.assign(ring.style, { left: r.left - 5 + "px", top: r.top - 5 + "px", width: r.width + 10 + "px", height: r.height + 10 + "px" });
    b.innerHTML = `<b>${esc(hit.t)}</b><p>${esc(hit.x)}</p>`; b.hidden = false; b.style.left = "0px"; b.style.top = "0px";
    const bw = Math.min(340, W - 24); b.style.width = bw + "px"; const bh = b.offsetHeight, cx = big ? W / 2 : r.left + r.width / 2;
    let top = big ? H * 0.3 : r.bottom + 12; if (top + bh > H - 12) top = Math.max(64, r.top - bh - 12);
    // die Leiste weicht aus, wenn sie das Erklärte verdeckt
    const bar = $("erklBar"); if (bar && !big) { const br = bar.getBoundingClientRect(); if (r.bottom > br.top - 4 && r.top < br.bottom + 4) { bar.classList.toggle("q7bot"); const b2 = bar.getBoundingClientRect(); if (top + bh > b2.top - 6 && top < b2.bottom + 6) top = b2.top > H / 2 ? Math.max(64, r.top - bh - 12) : Math.max(top, b2.bottom + 10); } else if (top + bh > br.top - 6 && top < br.bottom + 6) top = br.top > H / 2 ? Math.max(64, Math.min(top, br.top - bh - 10)) : br.bottom + 10; }
    b.style.left = clamp(cx - bw / 2, 12, W - bw - 12) + "px"; b.style.top = clamp(top, 8, H - bh - 8) + "px";
  },
  init() {
    let dn = null;
    const free = t => !!(t && t.closest && t.closest("#erklEnd"));
    const blk = e => { if (!this.on || free(e.target)) return; e.stopImmediatePropagation(); if (e.type === "click" || e.type === "contextmenu" || e.type === "dblclick") e.preventDefault();
      if (e.type === "pointerdown") dn = { x: e.clientX, y: e.clientY };
      else if (e.type === "pointerup" && dn) { const moved = Math.hypot(e.clientX - dn.x, e.clientY - dn.y) > 12; dn = null; if (moved) return; const el = document.elementFromPoint(e.clientX, e.clientY); this.show(el && !el.closest("#erklB") ? this.find(el) : null); } };
    for (const ev of ["pointerdown", "pointerup", "click", "dblclick", "contextmenu", "mousedown", "mouseup", "touchstart", "touchend"]) window.addEventListener(ev, blk, { capture: true, passive: false });
    window.addEventListener("keydown", e => { if (!this.on) return; if (e.key === "Escape") { e.stopImmediatePropagation(); this.stop(); } else if ((e.key === "Enter" || e.key === " ") && !(e.target && e.target.id === "erklEnd")) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
    window.addEventListener("scroll", () => { if (this.on) this.show(null); }, { capture: true, passive: true });
  }
};
Erkl.init();

/* ---------- Bereiche: Start · Spielen · Song · Mischen · Mehr ---------- */
const Nav67 = {
  MORE: [["loop", "deck", "Live auflegen", "Pult: Klänge im Takt starten, Filter, Echo, Drop – und die Loopstation", "#F25CC1", "#9B5CFF"], ["beat", "drum", "Beat-Maschine", "Techno-Beats aus dem Raster, mit Szenen und Aufbau", "#FF6B5C", "#FFB25C"], ["schnitt", "song", "Schnittraum", "Aufnahmen als Spuren übereinanderlegen und schneiden", "#2FD0B5", "#4F7BFF"], ["bild", "photo", "Foto wird Musik", "Ein Bild bestimmt Stimmung, Melodie und Instrumente", "#4F7BFF", "#9B5CFF"], ["stueck", "folder", "Loops und Aufnahmen", "Für Kenner: Töne einzelner Loops bearbeiten, alle Aufnahmen", "#7C8AA8", "#5B6B8C"]],
  OLD: ["loop", "stueck", "beat", "schnitt", "bild"],
  init() {
    const tabs = document.querySelector(".tabs"), tk = $("tKlang"), vs = $("vStueck"); if (!tabs || !tk || !vs) return false;
    const mk = (id, ic, lab) => { const b = document.createElement("button"); b.id = id; b.setAttribute("aria-current", "false"); b.innerHTML = ic + lab; return b; };
    tabs.insertBefore(mk("tStart", I67.home, "Start"), tk);
    { const sv = tk.querySelector("svg"); tk.innerHTML = (sv ? sv.outerHTML : I67.blob) + "Spielen"; }
    const tm = mk("tMix", I67.mix, "Mischen"), ts = mk("tSong", I67.song, "Song"), te = mk("tMehr", I67.more, "Mehr");
    tk.after(ts); ts.after(tm); tabs.appendChild(te);
    for (const [id, cls] of [["vStart", "vstart"], ["vSong", "vsong"], ["vMix", "vmix"]]) { const v = document.createElement("section"); v.id = id; v.className = "view v67 " + cls; v.hidden = true; vs.parentNode.insertBefore(v, vs); }
    Home67.bind($("vStart")); SongUI.bind($("vSong")); MixUI.bind($("vMix"));
    $("tStart").onclick = () => UI.setTab("start"); ts.onclick = () => UI.setTab("song"); tm.onclick = () => UI.setTab("mix"); te.onclick = () => this.more();
    document.body.classList.add("k67"); if (store.get("tabsAll")) document.body.classList.add("ktabsall");
    return true;
  },
  sync(t) {
    for (const [id, k, v] of [["tStart", "start", "vStart"], ["tSong", "song", "vSong"], ["tMix", "mix", "vMix"]]) { const b = $(id), e = $(v); if (b) b.setAttribute("aria-current", t === k ? "page" : "false"); if (e) e.hidden = t !== k; }
    const te = $("tMehr"); if (te) te.setAttribute("aria-current", this.OLD.includes(t) ? "page" : "false");
    document.body.classList.toggle("k67v", ["start", "song", "mix"].includes(t));
    if (t === "start") Home67.render(true); else if (t === "song") SongUI.render(true); else if (t === "mix") MixUI.render(true);
    if (t === "klang" && SongUI.back) { SongUI.back = false; if (document.querySelector("#sheets .sheet")) { setTimeout(() => { try { UI.setTab("song"); UI.toast("Instrument gewechselt – die Töne sind geblieben", 1800); } catch (_) {} }, 60); return; } }
    if (t !== "klang" && t !== "song") SongUI.back = false;
    if (t === "klang" && this.coachDue) { this.coachDue = false; setTimeout(() => { try { if (UI.tab === "klang" && UI.tips !== false) Coach.show(0); } catch (_) {} }, 500); }
  },
  // ein Stück mit Ablauf beginnt still (sonst spielen alle Loops auf einmal); ▶ oben spielt den Song
  songPiece() { return !!(SongGen.meta && Song.sections.length && Forms.list.some(f => Loops.count(f) > 0)); },
  afterStart() {
    try { if (this.songPiece() && Transport.running && !Song.playing) Transport.stop(); } catch (e) { console.warn(e); }
    const bp = document.querySelector(".top #bPlay") || $("bPlay"); if (bp && !bp.dataset.q7) { bp.dataset.q7 = "1"; const old = bp.onclick;
      bp.onclick = function (e) { try { if (Engine.ctx) { if (Song.playing) { SongUI.stop(); return; } if (!Home67.audible() && Nav67.songPiece() && UI.tab !== "loop") { SongUI.play(SongUI.sel >= 0 ? SongUI.sel : 0); return; } } } catch (err) { console.warn(err); } return old && old.call(this, e); }; }
  },
  more() {
    Hap(8); const all = !!store.get("tabsAll");
    const s = Sheets.open("Mehr", Sheets.head("Mehr") + `<div class="mrg">${this.MORE.map(([k, ic, t, d, c1, c2]) => `<button class="hmt q7wide" data-mo="${k}" style="--c1:${c1};--c2:${c2}"><i>${I67[ic]}</i><b>${t}</b><span>${d}</span></button>`).join("")}</div>
      <div class="mrl"><button data-mo="pieces">${I67.folder}<span>Meine Stücke</span></button><button data-mo="jam">${I67.people}<span>Zusammen spielen</span></button><button data-mo="erkl">${I67.help}<span>Was ist das?</span></button><button data-mo="help">${I67.help}<span>Hilfe</span></button><button data-mo="menu">${I67.more}<span>Einstellungen</span></button></div>
      <button class="mrt" data-mo="all" aria-pressed="${all}"><i></i><span><b>Alle Bereiche in der Leiste zeigen</b><small>Pult, Stück, Beat, Schnitt und Bild direkt unten – für Geübte</small></span></button>`);
    s.addEventListener("click", e => { const b = e.target.closest("[data-mo]"); if (!b) return; const k = b.dataset.mo; Hap();
      if (k === "all") { const on = !store.get("tabsAll"); store.set("tabsAll", on); document.body.classList.toggle("ktabsall", on); b.setAttribute("aria-pressed", on); return; }
      UI.hideSheets();
      if (this.OLD.includes(k)) UI.setTab(k); else if (k === "pieces") Projects.open(); else if (k === "jam") { try { Cmd.L.jam.run(Forms.active); } catch (_) {} } else if (k === "erkl") Erkl.start(); else if (k === "help") Help.open(); else if (k === "menu") { const m = $("bMenu"); if (m) m.click(); } });
  }
};
if (Nav67.init()) {
  const st = UI.setTab.bind(UI);
  UI.setTab = function (t) { const r = st(t); try { Nav67.sync(t); } catch (e) { console.warn(e); } return r; };
  // erste Schritte: die Karten zum Formen-Spielen erst zeigen, wenn man im Bereich „Spielen“ ankommt
  try { if (!store.get("coach1")) { Nav67.coachDue = true; store.set("coach1", true); } } catch (_) {}
  // nach dem Start: Startseite
  Nav67.boot = setInterval(() => { try { if (App.started) { clearInterval(Nav67.boot); if (UI.tab === "klang" && !Nav67.noHome && !document.querySelector("#sheets .sheet")) UI.setTab("start"); Nav67.afterStart(); } } catch (_) {} }, 200);
  // Prüfstand: läuft im Bereich „Spielen“ und kehrt danach zurück
  setTimeout(() => { try { const tr = Tests.run.bind(Tests); Tests.run = function () { const t0 = UI.tab, back = ["start", "song", "mix"].includes(t0); if (back) UI.setTab("klang"); try { return tr.apply(null, arguments); } finally { if (back) UI.setTab(t0); } }; } catch (e) { console.warn(e); } }, 0);
}

Help.T.push({ id: "studio", ic: "✨", t: "Song in 1 Minute, Song-Ansicht und Mischen", k: "song lied bauen zusammenstellen stil pop rock house hip-hop lofi ballade funk jazz techno ambient filmmusik ablauf strophe refrain intro outro break teile arrangement mischen mixer lautstärke regler auto-mix bühne panorama hall start anfänger laie einfach erklären was ist das würfeln aufnehmen teilen",
  h: `<ul><li><b>Start</b> (unten links) ist die Startseite: ein großer Knopf <b>Song in 1 Minute</b> und sechs Wege – Melodie spielen, Klänge formen, aufnehmen, Foto wird Musik, live auflegen, zusammen spielen.</li>
  <li><b>Song in 1 Minute</b>: Stil antippen (Pop, Lo-Fi, House, Hip-Hop, Rock, Ballade, Funk, Sommer, Filmmusik, Ambient, Techno, Jazz). KLANGRAUM legt ein neues Stück an, stellt die Band zusammen, schreibt Beat, Bass, Akkorde, Begleitung und zwei Melodien und baut einen Ablauf mit Intro, Strophe, Refrain, Break und Outro. Der Song spielt sofort.</li>
  <li><b>Song</b> (unten): oben der <b>Ablauf</b> als farbige Blöcke – antippen öffnet den Teil: umbenennen, länger oder kürzer, nach vorn oder hinten schieben, doppeln, löschen, ab hier hören. Darunter <b>Wer spielt wann?</b>: jede Zeile ist ein Instrument, jeder Punkt ein Teil. Leuchtet der Punkt, spielt das Instrument dort mit.</li>
  <li><b>Neu würfeln</b>: neue Rhythmen und Melodien im selben Stil. Tippst du auf ein Instrument, würfelst du nur dieses neu, wechselst sein Instrument oder hörst es allein.</li>
  <li><b>Song aufnehmen und teilen</b>: spielt einmal von vorn bis hinten und speichert das als Audio-Datei. 🔁 oben rechts legt fest, ob der Song beim Anhören von vorn beginnt.</li>
  <li><b>Mischen</b> (unten): <b>Auto-Mix</b> stellt Lautstärke, Platz und Hall passend zur Rolle ein (Ausgewogen, Druckvoll, Sanft, Weit). Darunter ein Regler je Klang mit Pegelanzeige, Stumm und „nur diesen hören“. Auf der <b>Bühne</b> ziehst du die Punkte: links/rechts im Kopfhörer, vorn nah und trocken, hinten weit weg mit Hall.</li>
  <li><b>Was ist das?</b> (Start oder Mehr): danach tippst du irgendetwas an und bekommst es erklärt, ohne dass etwas ausgelöst wird. „Fertig“ beendet das.</li>
  <li><b>Mehr</b> (unten rechts): Pult, Beat-Maschine, Schnittraum, Foto wird Musik, Loops und Aufnahmen. Wer alle Bereiche wie früher direkt in der Leiste haben will, schaltet dort „Alle Bereiche in der Leiste zeigen“ ein.</li>
  <li>Eigene Klänge kommen in den Song, sobald sie einen Loop haben: im Bereich Spielen mit <b>Tasten</b> eine Melodie aufnehmen oder mit <b>Loop</b> festhalten, was gerade klingt.</li></ul>` });
