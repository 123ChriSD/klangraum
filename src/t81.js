
    // v81: Namensschilder an den Formen
    try { ok("SL", Schild81.ok() && typeof QuickPP.toggle === "function" && typeof Feel.volDrag === "function", "Namensschilder an den Formen (Alle-Ansicht) sind auch mit den Punkten unten bedienbar: ▶ am Schild startet und stoppt die Form, am Schild ziehen regelt die Lautstärke"); } catch (e) { ok("SL", false, String(e)); }
