cd /tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad && python3 v80a.py && python3 - <<'PY'
import re
s=open('/home/claude/klangraum.html').read()
sc=max(re.findall(r'<script>(.*?)</script>', s, flags=re.S), key=len); open('app80b.js','w').write(sc)
PY
node --check app80b.js && echo SYNTAX-OK && sh mkwww.sh
