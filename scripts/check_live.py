#!/usr/bin/env python3
"""Read-only post-deployment HTTP/TLS, CSS and sitemap checks."""
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlsplit
from urllib.error import HTTPError
from concurrent.futures import ThreadPoolExecutor
import socket, ssl, time, json, xml.etree.ElementTree as ET, re, sys
ROOT=Path(__file__).resolve().parents[1]
BASE="https://actinguk.com"
UA="ActingUK-Deployment-Check/1.0"
ctx=ssl.create_default_context()
def fetch(url,ua=UA):
    with urlopen(Request(url,headers={"User-Agent":ua}),timeout=20,context=ctx) as r:
        return r.status,r.geturl(),r.headers.get("Content-Type",""),r.read()
def check(url):
    try:
        status,final,ctype,body=fetch(url)
        if status!=200 or not final.startswith(BASE+"/"): return f"Unexpected HTTP response {status} {final}"
        if "text/html" not in ctype: return f"Not HTML: {ctype}"
        s=body.decode("utf-8","replace")
        match=re.search(r'<link\s+rel="canonical"\s+href="([^"]+)"',s,re.I)
        if not match or match.group(1)!=url: return f"Incorrect live canonical: {match.group(1) if match else 'missing'}"
        return None
    except Exception as e: return str(e)
print("DNS:",sorted({x[4][0] for x in socket.getaddrinfo("actinguk.com",443)}))
# Wait only for the expected release to appear, not an arbitrary time.
expected=(ROOT/"sitemap.xml").read_bytes()
for attempt in range(6):
    try:
        _,final,_,body=fetch(BASE+"/sitemap.xml")
        if body==expected: break
        print("Waiting for expected sitemap",attempt+1)
    except Exception as e: print("Live sitemap attempt",attempt+1,str(e))
    time.sleep(8)
else:
    sys.exit("Expected deployment not available over verified HTTPS")
for u in ["http://actinguk.com/","https://www.actinguk.com/","http://www.actinguk.com/","https://actinguk.github.io/"]:
    try:
        status,final,_,_=fetch(u); print("Redirect",u,"=>",status,final)
        if not final.startswith(BASE+"/"): print("WARN unexpected redirect target")
    except Exception as e: print("WARN redirect check",u,str(e))
for p in ["/assets/article.css","/assets/index.css","/assets/index.js","/robots.txt"]:
    status,final,ctype,body=fetch(BASE+p)
    print("Asset",p,status,ctype,len(body))
    if p.endswith(".css") and ("text/css" not in ctype or b"var(--paper)" not in body): sys.exit("Stylesheet not delivered correctly: "+p)
    if p=="/robots.txt" and b"Sitemap: https://actinguk.com/sitemap.xml" not in body: sys.exit("Live robots sitemap incorrect")
ns={"s":"http://www.sitemaps.org/schemas/sitemap/0.9"}
urls=[e.text for e in ET.fromstring(expected).findall(".//s:loc",ns)]
with ThreadPoolExecutor(max_workers=8) as pool:
    results=list(pool.map(check,urls))
errors=[(u,e) for u,e in zip(urls,results) if e]
print("Live HTTPS crawl:",len(urls),"URLs;",len(errors),"errors.")
for u,e in errors: print("ERROR",u,e)
for ua in ["Googlebot","bingbot","OAI-SearchBot","Claude-SearchBot"]:
    try:
        status,final,ctype,body=fetch(BASE+"/",ua); print("Crawler user-agent smoke check",ua,status,final,len(body))
        if status!=200 or b"Acting UK" not in body: errors.append((ua,"unexpected response"))
    except Exception as e: errors.append((ua,str(e))); print("ERROR",ua,str(e))
# A genuine missing URL should return an HTTP 404.
try:
    status,_,_,_=fetch(BASE+"/this-page-does-not-exist-seo-check/")
    print("WARN missing URL returned",status)
except HTTPError as e:
    print("404 check",e.code)
    if e.code!=404: errors.append(("404",str(e.code)))
sys.exit(bool(errors))
