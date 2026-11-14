#!/usr/bin/env python3
"""Install the shared Acting UK favicon tags in every published HTML head."""
import argparse
import re
import struct
from pathlib import Path

LINKS = [
    "<link rel=\"icon\" href=\"/favicon.ico\" sizes=\"16x16 32x32 48x48\">",
    "<link rel=\"icon\" type=\"image/png\" sizes=\"48x48\" href=\"/favicon-48.png\">",
    "<link rel=\"icon\" type=\"image/png\" sizes=\"96x96\" href=\"/favicon-96.png\">",
    "<link rel=\"icon\" type=\"image/svg+xml\" sizes=\"any\" href=\"/favicon.svg\">",
    "<link rel=\"apple-touch-icon\" sizes=\"180x180\" href=\"/apple-touch-icon.png\">",
    "<link rel=\"manifest\" href=\"/site.webmanifest\">"
]
HEAD = re.compile(r'(<head\b[^>]*>)(.*?)(</head\s*>)', re.I | re.S)
ICON = re.compile(r'<link\b[^>]*\brel\s*=\s*["\'](?:shortcut icon|icon|apple-touch-icon|manifest)["\'][^>]*>', re.I)

def install(page):
    source = page.read_text(encoding="utf-8")
    def replace(match):
        body = match.group(2)
        if all(link in body for link in LINKS) and len(ICON.findall(body)) == len(LINKS):
            return match.group(0)
        body = ICON.sub("", body)
        indent = re.match(r'\r?\n([ \t]*)<', body)
        pad = indent.group(1) if indent else "  "
        return match.group(1) + "\n" + "\n".join(pad + link for link in LINKS) + ("" if body.startswith("\n") else "\n") + body + match.group(3)
    updated, count = HEAD.subn(replace, source, count=1)
    if count != 1:
        raise ValueError(f"Missing head: {page}")
    if updated != source:
        page.write_text(updated, encoding="utf-8")
    head = HEAD.search(updated).group(2)
    assert all(link in head for link in LINKS), page

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--site", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    root = args.site
    for size in (16, 32, 48, 96, 192, 512):
        data = (root / f"favicon-{size}.png").read_bytes()
        assert data[:8] == b"\x89PNG\r\n\x1a\n" and struct.unpack(">II", data[16:24]) == (size,size)
    assert (root / "favicon.ico").read_bytes()[:6] == b"\x00\x00\x01\x00\x03\x00"
    assert struct.unpack(">II", (root / "apple-touch-icon.png").read_bytes()[16:24]) == (180,180)
    assert (root / "favicon.svg").is_file() and (root / "site.webmanifest").is_file()
    pages = [p for p in root.rglob("*.html") if not set(p.relative_to(root).parts) & {".git", ".github", "scripts", "templates", "content", "_site"}]
    for page in pages:
        install(page)
    print(f"Verified shared favicon assets and {len(pages)} HTML pages.")

if __name__ == "__main__":
    main()
