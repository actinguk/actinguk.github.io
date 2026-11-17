#!/usr/bin/env python3
"""Install the single privacy-conscious analytics tracker on every published HTML page."""
import argparse
import re
from pathlib import Path

TAG = '<script src="/assets/analytics.js" defer></script>'
BODY_CLOSE = re.compile(r'(?m)^[ ]*</body[ ]*>|</body[ ]*>', re.IGNORECASE)
EXCLUDE = {".git", ".github", "scripts", "templates", "content", "_site", "analytics"}

def tracked(source):
    if TAG in source or not BODY_CLOSE.search(source):
        return source
    return BODY_CLOSE.sub(lambda m: re.match(r"^[ ]*", m.group(0)).group(0) + TAG + "\n" + m.group(0), source, count=1)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--site", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    pages = [p for p in args.site.rglob("*.html")
             if not set(p.relative_to(args.site).parts) & EXCLUDE]
    missing = []
    for page in pages:
        current = page.read_text(encoding="utf-8")
        updated = tracked(current)
        if updated != current:
            missing.append(str(page.relative_to(args.site)))
            if not args.check:
                page.write_text(updated, encoding="utf-8")
    if args.check and missing:
        raise SystemExit("Analytics script missing from " + ", ".join(missing[:20]) +
                         (" ..." if len(missing) > 20 else ""))
    print("Acting UK analytics: checked", len(pages), "pages;",
          len(missing), "missing" if args.check else "updated")
if __name__ == "__main__":
    main()
