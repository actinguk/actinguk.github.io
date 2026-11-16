#!/usr/bin/env python3
"""Remove decorative northeast arrows from published link text, not URLs."""
import argparse
from pathlib import Path
import re

parser = argparse.ArgumentParser()
parser.add_argument("--site", type=Path, required=True)
args = parser.parse_args()
arrow = re.compile(r"[ \t]*\u2197\ufe0f?")
# Match text nodes only, leaving tags, attributes, scripts and styles intact.
token = re.compile(r"(<script\b[^>]*>.*?</script\s*>|<style\b[^>]*>.*?</style\s*>|<!--[\s\S]*?-->|<[^>]+>)", re.I | re.S)
count = 0
for path in args.site.rglob("*.html"):
    original = path.read_text(encoding="utf-8")
    pieces = token.split(original)
    for i in range(0, len(pieces), 2):
        pieces[i] = arrow.sub("", pieces[i])
    cleaned = "".join(pieces)
    if cleaned != original:
        path.write_text(cleaned, encoding="utf-8")
        count += 1
print(f"Removed decorative arrows from {count} HTML pages.")
