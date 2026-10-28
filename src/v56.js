/* ============================================================
   v56: Start abgesichert – „Eintauchen“ hängt nie mehr bei „Einen Moment …“
   Jeder Startschritt läuft für sich; ein Fehler wird gemeldet, der Start geht weiter.
   Hängt der Klang (Audio-Thread, Freigabe), bietet ein Wächter nach 7 s „Erneut versuchen“ und den Notbetrieb an.
   ============================================================ */
const StartGuard = {
  stage: "", errs: [],
  at(n) { this.stage = n; try { MicLog.add("Start: " + n); } catch (_) {} },
  err(n, e) { const m = `${n}: ${e && e.message || e}`; this.errs.push(m); console.warn("Start", m, e); try { MicLog.add("Start-Fehler " + m); } catch (_) {} },
  arm() { clearTimeout(this.t); this.t = setTimeout(() => this.stuck(), 11000); },
  off() { clearTimeout(this.t); if (this.errs.length) setTimeout(() => { try { UI.toastAct(`Beim Start ging etwas schief (${this.errs.length}) – KLANGRAUM läuft trotzdem.`, "Details", () => MicFix.sheet(), 6000); } catch (_) {} }, 1800); },
  stuck() {
    if (App.started) return; const b = $("enter"), er = $("startErr"); App.entering = false;
    if (er) { er.textContent = `Der Start hängt bei „${this.stage}“. Tippe „Erneut versuchen“ – klappt es nicht, „Ohne Audio-Thread starten“.`; er.hidden = false; }
    if (b) { b.disabled = false; b.textContent = "Erneut versuchen"; }
    if (!$("enterShim")) { const x = document.createElement("button"); x.id = "enterShim"; x.className = "btn"; x.textContent = "Ohne Audio-Thread starten"; x.style.marginTop = "10px";
      x.onclick = () => { store.set("forceShim", true); Engine.forceShim = true; try { if (Engine.ctx) Engine.ctx.close(); } catch (_) {} Engine.ctx = null; Engine.node = null; x.remove(); App.enter(); };
      (er || b).insertAdjacentElement("afterend", x); }
  }
};
// Fehler während des Starts sichtbar machen statt still hängen zu bleiben
addEventListener("error", e => { if (!App.started && App.entering) StartGuard.err("Fehler", e.error || e.message); });
addEventListener("unhandledrejection", e => { if (!App.started && App.entering) StartGuard.err("Fehler", e.reason); });
// Notbetrieb wieder abschalten, sobald der Audio-Thread geht (Menü → Bedienung bleibt unverändert)
setTimeout(() => { try { if (store.get("forceShim") && App.started && Engine.shimmed) UI.toastAct("KLANGRAUM läuft ohne Audio-Thread (etwas mehr Verzögerung).", "Normal starten", () => { store.set("forceShim", false); UI.toast("Beim nächsten Öffnen wieder normal", 2000); }, 7000); } catch (_) {} }, 6000);
// Loopstation: Puffer erst laden, wenn der Ton bereit ist (vorher galten Spuren fälschlich als „fehlt“)
{ const bf = LoopSt.buf.bind(LoopSt); LoopSt.buf = function (t) { if (!Engine.ctx) return Promise.resolve(null); return bf(t); }; }
{ const iv = setInterval(() => { if (!App.started || !Engine.ctx) return; clearInterval(iv); try { for (const t of LoopSt.slots) if (t) { t.missing = false; t.pend = true; } LoopSt.preload(); } catch (_) {} }, 300); }
// Ton bei der nächsten Berührung anwerfen, falls der Browser ihn beim Start noch nicht freigegeben hat
document.addEventListener("pointerdown", () => { try { if (Engine.ctx && Engine.ctx.state === "suspended") Engine.ctx.resume(); } catch (_) {} }, true);
