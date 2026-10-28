/* ============================================================
   v58: Erklärkarten nie mehr „festgeklemmt“: scrollbar, Knöpfe immer sichtbar, über allen Meldungen,
        „Überspringen“, Tipp neben die Karte / Zurück-Taste / Esc schließt. Meldungen warten, solange die Karten offen sind.
   ============================================================ */
{ const r0 = Coach.render.bind(Coach); Coach.render = function () { r0(); try { const el = $("coach"), c = el && el.querySelector(".coach-card"); if (c && !c.querySelector(".cskip")) c.insertAdjacentHTML("beforeend", `<button class="cskip" data-cx="close">Erklärungen überspringen</button>`); } catch (_) {} }; }
{ const b0 = Coach.bind.bind(Coach); Coach.bind = function (el) { b0(el); el.addEventListener("click", e => { if (e.target === el) Coach.close(); }); }; }
document.addEventListener("keydown", e => { if (Coach.open && (e.key === "Escape" || e.key === "Enter")) { e.preventDefault(); e.key === "Escape" ? Coach.close() : (Coach.i < Coach.cards.length - 1 ? (Coach.i++, Coach.render()) : Coach.close()); } }, true);
// Meldungen nicht über die Erklärkarten legen – sie erscheinen danach
{ const t0 = UI.toast.bind(UI); UI.toast = function (...a) { if (Coach.open) { (Coach._q = Coach._q || []).push(["toast", a]); return; } return t0(...a); }; }
{ const t1 = UI.toastAct.bind(UI); UI.toastAct = function (...a) { if (Coach.open) { (Coach._q = Coach._q || []).push(["act", a]); return; } return t1(...a); }; }
{ const c0 = Coach.close.bind(Coach); Coach.close = function () { c0(); const q = (Coach._q || []).slice(-2); Coach._q = []; q.forEach(([k, a], i) => setTimeout(() => { try { k === "act" ? UI.toastAct(...a) : UI.toast(...a); } catch (_) {} }, 600 + i * 2600)); }; }
