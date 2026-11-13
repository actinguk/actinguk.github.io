#!/usr/bin/env python3
"""Notify IndexNow only of changed public HTML URLs after successful live checks."""
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.error import HTTPError
import json, subprocess, sys, xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
KEY="e69c198de4e1a2f1291e5e767f8cdd985"
HOST="actinguk.com"
BASE="https://"+HOST
key_url=BASE+"/"+KEY+".txt"
with urlopen(key_url,timeout=20) as r:
    if r.read().decode().strip()!=KEY: sys.exit("IndexNow key not live")
diff=subprocess.check_output(["git","diff","--name-only","HEAD^","HEAD"],cwd=ROOT,text=True).splitlines()
paths=[p for p in diff if p.endswith(".html") and p!="404.html" and p.split("/")[0] not in ("templates","content","scripts",".github")]
urls=sorted(set(BASE+"/"+(p[:-10] if p.endswith("index.html") else p) for p in paths))
if KEY+".txt" in diff or "Initial IndexNow" in subprocess.check_output(["git","log","-2","--format=%s"],cwd=ROOT,text=True):
    ns={"s":"http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls=sorted(e.text for e in ET.parse(ROOT/"sitemap.xml").findall(".//s:loc",ns))
if not urls: print("No changed public HTML URLs.");sys.exit(0)
payload=json.dumps({"host":HOST,"key":KEY,"keyLocation":key_url,"urlList":urls}).encode()
req=Request("https://api.indexnow.org/indexnow",data=payload,headers={"Content-Type":"application/json; charset=utf-8"},method="POST")
try:
    with urlopen(req,timeout=30) as r:
        print("IndexNow response",r.status,"for",len(urls),"URLs")
        if r.status not in (200,202): sys.exit(1)
except HTTPError as e:
    print("IndexNow HTTP",e.code,e.read().decode("utf-8","replace")[:500]);sys.exit(1)
