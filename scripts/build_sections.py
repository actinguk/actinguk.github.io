#!/usr/bin/env python3
"""Regenerate the eleven category and editorial pages from shared template/data."""
from pathlib import Path
import json
from html import unescape
ROOT = Path(__file__).resolve().parents[1]
BASE = "https://actinguk.com"
template = (ROOT / "templates/section.tpl").read_text(encoding="utf-8")
records = json.loads((ROOT / "content/sections.json").read_text(encoding="utf-8"))
for slug, record in records.items():
    url = BASE + "/" + slug + "/"
    title = record["title"]
    desc = record["description"]
    schema = {"@context":"https://schema.org","@graph":[
        {"@type":record["schema_type"],"name":unescape(title),"description":unescape(desc),"url":url,
         "inLanguage":"en-GB","publisher":{"@type":"Organization","name":"Acting UK","url":BASE+"/"}},
        {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":BASE+"/"},
        {"@type":"ListItem","position":2,"name":unescape(title),"item":url}]}]}
    page = template
    for key, value in {"TITLE":title,"DESCRIPTION":desc,"URL":url,"SCHEMA":json.dumps(schema,ensure_ascii=False,indent=2),"BODY":record["body"]}.items():
        page = page.replace("{{"+key+"}}",value)
    target = ROOT / slug / "index.html"
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(page,encoding="utf-8")
print(f"Generated {len(records)} section pages.")
