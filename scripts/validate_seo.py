#!/usr/bin/env python3
"""Validate the static website without paid dependencies or external network requests."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, urljoin, unquote
from collections import defaultdict
import json, xml.etree.ElementTree as ET, sys, subprocess
ROOT=Path(__file__).resolve().parents[1]
BASE="https://actinguk.com"
subprocess.run(["node", str(ROOT / "scripts/format_articles.mjs"), "--check"], check=True)
REDIRECTS={"journal/first-headshots.html":"https://actinguk.com/journal/acting-headshots-london.html"}
EXCLUDE={"templates","content","scripts",".github",".git"}
class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids=set(); self.duplicate_ids=set(); self.links=[]; self.images=[]; self.h1=0; self.external_links=[]
        self.title=""; self.title_open=False; self.desc=[]; self.canon=[]; self.robots=[]; self.jsonld=[]; self.json_open=False; self.json_buf=""
        self.lang=None; self.viewport=False
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if a.get("id"):
            if a["id"] in self.ids: self.duplicate_ids.add(a["id"])
            self.ids.add(a["id"])
        if tag=="html": self.lang=a.get("lang")
        if tag=="title": self.title_open=True
        if tag=="h1": self.h1+=1
        if tag=="meta":
            if a.get("name")=="description": self.desc.append(a.get("content",""))
            if a.get("name")=="robots": self.robots.append(a.get("content",""))
            if a.get("name")=="viewport": self.viewport=True
        if tag=="link" and a.get("rel")=="canonical": self.canon.append(a.get("href",""))
        if tag=="script" and a.get("type")=="application/ld+json": self.json_open=True; self.json_buf=""
        if tag in ("a","link") and a.get("href") and a.get("rel")!="canonical": self.links.append(a["href"])
        if tag=="a" and a.get("href"): self.external_links.append(a)
        if tag in ("script","img") and a.get("src"): self.links.append(a["src"])
        if tag=="img": self.images.append(a)
    def handle_endtag(self,tag):
        if tag=="title": self.title_open=False
        if tag=="script" and self.json_open:
            self.jsonld.append(self.json_buf); self.json_open=False
    def handle_data(self,data):
        if self.title_open: self.title+=data
        if self.json_open: self.json_buf+=data
def url_for(path):
    return BASE+"/"+(path[:-10] if path.endswith("index.html") else path)
pages={}
for f in sorted(ROOT.rglob("*.html")):
    p=f.relative_to(ROOT).as_posix()
    if p.split("/")[0] in EXCLUDE: continue
    page=Page(); page.feed(f.read_text(encoding="utf-8")); pages[p]=page
errors=[]; warnings=[]; titles=defaultdict(list); descriptions=defaultdict(list); expected=set()
def err(p,msg): errors.append(f"{p}: {msg}")
for p,x in pages.items():
    # The historical automation smoke test is deliberately not an indexed article.
    if p == "news/automation-probe.html":
        if not any("noindex" in v.lower().split(",") for v in x.robots):
            err(p, "technical probe must remain noindex")
        continue
    if x.h1!=1: err(p,f"expected one H1; found {x.h1}")
    if not x.title.strip(): err(p,"missing title")
    if len(x.desc)!=1 or not x.desc[0].strip(): err(p,"missing or duplicate description")
    if x.lang!="en-GB": err(p,"missing en-GB language")
    if not x.viewport: err(p,"missing viewport")
    if x.canon!=[REDIRECTS.get(p,url_for(p))]: err(p,f"canonical mismatch: {x.canon}")
    if p in REDIRECTS:
        raw=(ROOT/p).read_text(encoding="utf-8")
        target=REDIRECTS[p].removeprefix(BASE)
        if f'http-equiv="refresh" content="0; url={target}"' not in raw: err(p,"missing immediate redirect")
        if not (ROOT/target.lstrip("/")).is_file(): err(p,"missing redirect destination")
        continue
    if x.duplicate_ids: err(p,f"duplicate IDs: {sorted(x.duplicate_ids)}")
    for j in x.jsonld:
        try: json.loads(j)
        except ValueError as e: err(p,f"invalid JSON-LD: {e}")
    if not x.jsonld: warnings.append(f"{p}: no JSON-LD")
    if p!="404.html":
        expected.add(url_for(p))
        if any("noindex" in v.lower() for v in x.robots): err(p,"unexpected noindex")
        titles[x.title.strip()].append(p)
        if x.desc: descriptions[x.desc[0]].append(p)
    for image in x.images:
        if "alt" not in image: err(p,"image lacks alt attribute")
        if not image.get("width") or not image.get("height"): warnings.append(f"{p}: image lacks explicit dimensions")
    for a in x.external_links:
        dest=urlsplit(urljoin(url_for(p),a["href"]))
        if dest.scheme in ("http","https") and dest.hostname not in ("actinguk.com","www.actinguk.com","actinguk.github.io"):
            if a.get("target")!="_blank" or not {"noopener","noreferrer"}.issubset(set(a.get("rel","").lower().split())):
                err(p,f"external link must open safely in a new tab: {a['href']}")
    for raw in x.links:
        resolved=urlsplit(urljoin(url_for(p),raw))
        if resolved.scheme not in ("http","https") or resolved.hostname!="actinguk.com": continue
        path=unquote(resolved.path).lstrip("/")
        target=path if path and not path.endswith("/") else path+"index.html"
        if not (ROOT/target).is_file() and (ROOT/target/"index.html").is_file(): target+="/index.html"
        if not (ROOT/target).is_file(): err(p,f"missing internal target {raw}"); continue
        if resolved.fragment and target in pages and unquote(resolved.fragment) not in pages[target].ids:
            err(p,f"missing fragment {raw}")
        if path=="index.html": warnings.append(f"{p}: homepage alias {raw}")
for title,ps in titles.items():
    if title and len(ps)>1: err(", ".join(ps),"duplicate title")
for desc,ps in descriptions.items():
    if desc and len(ps)>1: warnings.append(f"Duplicate description: {', '.join(ps)}")
ns={"s":"http://www.sitemaps.org/schemas/sitemap/0.9"}
loc=[e.text for e in ET.parse(ROOT/"sitemap.xml").findall(".//s:loc",ns)]
if len(loc)!=len(set(loc)): err("sitemap.xml","duplicate URLs")
for url in sorted(expected-set(loc)): err("sitemap.xml","missing "+url)
for url in sorted(set(loc)-expected): err("sitemap.xml","unexpected "+url)
robots=(ROOT/"robots.txt").read_text()
if BASE+"/sitemap.xml" not in robots or "Disallow: /\n" in robots: err("robots.txt","incorrect sitemap or global block")
if (ROOT/"CNAME").read_text().strip()!="actinguk.com": err("CNAME","unexpected domain")
print(f"Checked {len(pages)} HTML pages; {len(loc)} sitemap URLs; {len(errors)} errors; {len(warnings)} warnings.")
for e in errors: print("ERROR",e)
for w in warnings[:35]: print("WARN",w)
if len(warnings)>35: print(f"... {len(warnings)-35} more warnings")
sys.exit(bool(errors))
