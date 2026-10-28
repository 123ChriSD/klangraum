#!/usr/bin/env python3
"""Baut index.html der Website aus dem App-Rumpf (ohne Kopf, so wie ins Artifact veröffentlicht).
Aufruf: python3 tools/mksite.py <app_rumpf.html> <ziel/index.html>"""
import sys
s = open(sys.argv[1]).read()
a = 'URL: "https://claude.ai/artifact/AcerFy2AcGdzZhqXA8sjUf",'
if a in s:
    s = s.replace(a, 'URL: (location.protocol === "https:" && !/claude\\.ai|claudeusercontent|claude\\.site/.test(location.host) ? location.origin + location.pathname : "https://claude.ai/artifact/AcerFy2AcGdzZhqXA8sjUf"),')
H = '''<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0A1315"><meta name="description" content="KLANGRAUM – Formen, die klingen. Loopstation, Beatbox, Instrumente.">
<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon-192.png"><link rel="apple-touch-icon" href="icon-192.png">
<meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<style>:root{box-sizing:border-box}body{margin:0;padding:0}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>
'''
open(sys.argv[2], 'w').write(H + s + '\n</body></html>\n')
print("index.html", len(H + s))
