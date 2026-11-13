# startet den Testserver nur für die Dauer eines Befehls: sh srv.sh <befehl …>
cd /tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad
(cd www && exec python3 -m http.server 8765 --bind 127.0.0.1 >/dev/null 2>&1) & SPID=$!
sleep 0.8; "$@"; RC=$?; kill $SPID 2>/dev/null; exit $RC
