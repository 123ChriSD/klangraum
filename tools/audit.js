window.__audit = (label) => {
  const CONT = ['.top', '#strip', '#formname', '#tools', '#fctl', '#mbar', '#palette', '#modebar', '#bResetAll', '#bZoomX', '#zoomx2', '#navL', '#navR', '#loopx', '#hint', '#raumhelp', '#fullbar', '#bFullX', '#schRec', '#recBanner', '.tabs', '#fpop', '#fchips', '#labels', '#volPill', '.toast', '#dock', '#palHint', '#ctxHelp', '#padbar', '#fbar', '#vseg', '#hud', '#ksheet', '#dr73', '#ou75', '#mw76', '#kfree', '#cueL', '#g77', '#p78P', '#p78T', '#p78X', '.sheet', '#singPill'];
  const vis = el => { if (!el || el.closest('[hidden]')) return false; let e = el; while (e && e !== document.body) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05 || cs.pointerEvents === 'none' && e === el) return false; e = e.parentElement; } const r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth; };
  const top = el => { const r = el.getBoundingClientRect(), x = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), y = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2)), e = document.elementFromPoint(x, y); return !!e && (e === el || el.contains(e) || e.contains(el)); };
  const items = [];
  for (const s of CONT) for (const c of document.querySelectorAll(s)) {
    if (!vis(c)) continue;
    const leaves = [...c.querySelectorAll('button, input, textarea, .lbtn, .bub, [role=button]')].filter(vis);
    if (c.matches('button, .lbtn')) leaves.push(c);
    for (const l of leaves) { const r = l.getBoundingClientRect(); items.push({ c: s, el: l, n: (l.id ? '#' + l.id : '') + (l.dataset.a ? '[' + l.dataset.a + ']' : '') + ' ' + (l.textContent || l.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 18), r }); }
  }
  const out = [];
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const a = items[i], b = items[j]; if (a.c === b.c && !(a.c === '#labels' || a.c === '#fchips')) continue; if (a.el.contains(b.el) || b.el.contains(a.el)) continue; if (a.c === '#fpop' || b.c === '#fpop' || a.c === '.toast' || b.c === '.toast') continue;
    /* ein Blatt oder eine Tafel darf Darunterliegendes verdecken – gezählt wird nur, was gleichzeitig erreichbar ist */
    if (!top(a.el) || !top(b.el)) continue;
    const r1 = a.r, r2 = b.r, w = Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left), h = Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top);
    if (w > 4 && h > 4) out.push(`${a.c}:${a.n} ⟷ ${b.c}:${b.n} (${Math.round(w)}×${Math.round(h)})`);
  }
  /* zusätzlich: Knöpfe in Blättern und Tafeln, die über den Rand ragen oder sich innerhalb überlappen */
  for (const s of ['.sheet', '#p78T', '#p78P']) for (const c of document.querySelectorAll(s)) { if (!vis(c)) continue; const L = [...c.querySelectorAll('button, input, textarea')].filter(vis).filter(top);
    for (const l of L) { const r = l.getBoundingClientRect(); if (r.left < -1 || r.right > innerWidth + 1) out.push(`${s}: ${(l.textContent || l.getAttribute('aria-label') || '').trim().slice(0, 18)} ragt über den Rand (${Math.round(r.left)}…${Math.round(r.right)})`); }
    for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) { if (L[i].contains(L[j]) || L[j].contains(L[i]) || L[i].closest('header') || L[j].closest('header')) continue;   /* der feste Kopf eines Blatts liegt beim Rollen über dem Inhalt – das ist gewollt */ const r1 = L[i].getBoundingClientRect(), r2 = L[j].getBoundingClientRect(), w = Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left), h = Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top); if (w > 4 && h > 4) out.push(`${s}: ${(L[i].textContent || '').trim().slice(0, 14)} ⟷ ${(L[j].textContent || '').trim().slice(0, 14)} (${Math.round(w)}×${Math.round(h)})`); } }
  return out;
};
