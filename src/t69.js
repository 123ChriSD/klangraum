

    // v69: Start-Knopf überall, Zurück-Schritte, Dein Weg
    try { if (!App.started) ok("HM", true, "nicht gestartet"); else { const t0 = UI.tab, st = Einsp.start, tp = UI.toast; Einsp.start = () => {}; UI.toast = () => {};
        try { const hb = !!$("bHome") && !!$("q7home"), sh = Sheets.head("x").includes("data-home"); UI.setTab("loop"); Sheets.open("Test", Sheets.head("Test") + "<p>x</p>"); const f = Forms.list.find(x => Einsp.playable(x)); if (f) Einsp.open(f); const ex = f ? $("einsp").querySelector('.ex[data-ei="home"]') : true;
          const over = Heim.over(); Heim.go(); const home = Heim.atHome() && UI.tab === "start" && !Einsp.on && !document.querySelector("#sheets .sheet");
          UI.setTab("mix"); Sheets.open("Test", Sheets.head("Test")); const esc0 = Nav.closeTop() && UI.tab === "mix" && !document.querySelector("#sheets .sheet"), esc1 = Nav.closeTop() === false && UI.tab === "mix"; Sheets.open("Test", Sheets.head("Test")); const s1 = esc0 && esc1 && Nav.closeTop(true) && !document.querySelector("#sheets .sheet") && UI.tab === "mix", s2 = Nav.closeTop(true) && UI.tab === "start", s3 = Nav.closeTop(true) === false;
          UI.setTab("start"); Home67.render(true); const way = $("vStart").querySelectorAll(".hmsteps [data-hm]").length;
          ok("HM", hb && sh && !!ex && over && home && s1 && s2 && s3 && way === 4, `Start-Knopf oben links, in jedem Blatt, im Einspielen und im Vollbild: aus Pult + offenem Blatt + Einspielen führt ein Tipp zur Startseite · Zurück-Taste: erst Blatt zu, dann Startseite, dann nichts mehr · „Dein Weg“ mit ${way} Schritten`); }
        finally { try { if (Einsp.on) Einsp.close(); UI.hideSheets(); } catch (_) {} Einsp.start = st; UI.toast = tp; UI.setTab(t0); } } } catch (e) { ok("HM", false, String(e)); }
