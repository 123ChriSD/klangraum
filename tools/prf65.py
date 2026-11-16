# Prüfstand im Testbrowser: python3 prf65.py <Breite> <Höhe>  (läuft über xp.py mit der Probe pprf.txt; Testserver über srv.sh)
import os, sys
d = os.path.dirname(os.path.abspath(__file__)); env = dict(os.environ, VW=sys.argv[1], VH=sys.argv[2])
os.execvpe(sys.executable, [sys.executable, os.path.join(d, "xp.py"), os.path.join(d, "pprf.txt")], env)
