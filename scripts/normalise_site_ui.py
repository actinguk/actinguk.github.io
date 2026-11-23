#!/usr/bin/env python3
"""Unify published page background and footer without changing article content or audio."""
import argparse
from pathlib import Path
import re

THEME = '#E6EFF0'
CSS_LINK = '<link rel="stylesheet" href="/assets/site-consistency.css">'
FOOTER = '''<footer class="site-footer" aria-label="Site footer">
  <div class="site-footer-inner">
    <div class="site-footer-brand">
      <a class="logo site-footer-logo" href="/">Acting<span> UK</span></a>
      <p>Your independent guide to the craft, the career and everything in between.</p>
    </div>
    <div class="site-footer-right">
      <nav class="site-footer-links" aria-label="Footer navigation">
        <a href="/directory.html">Directory</a>
        <a href="/guides/">Guides</a>
        <a href="/journal.html">Journal</a>
        <a href="/about/">About</a>
        <a href="/editorial-policy/">Editorial policy</a>
        <a href="/contact/">Contact</a>
        <a href="/privacy/">Privacy</a>
      </nav>
      <p>© 2026 Acting UK. Original editorial graphics.</p>
    </div>
  </div>
</footer>'''
FOOTER_RE = re.compile(r'<footer\b[^>]*>[\s\S]*?</footer\s*>', re.I)
HEAD_RE = re.compile(r'</head\s*>', re.I)
BODY_RE = re.compile(r'</body\s*>', re.I)
THEME_RE = re.compile(r'<meta\b(?=[^>]*\bname\s*=\s*["\x27]theme-color["\x27])[^>]*>', re.I)
CONTENT_RE = re.compile(r'(\bcontent\s*=\s*)(["\x27]).*?\2', re.I)


def normalise(html):
    if not re.search(r'<body(?:\s|>)', html, re.I) or not BODY_RE.search(html):
        return html
    if (html.count('<footer class="site-footer"') == 1
            and CSS_LINK in html
            and re.search(r'<meta\s+name="theme-color"\s+content="#E6EFF0"', html)):
        return html
    # Remove the previous footer regardless of whether it sat inside main or a wrapper.
    html = FOOTER_RE.sub('', html)
    # Keep the footer after all sections, including homepage content after its old footer.
    html = BODY_RE.sub(lambda m: '\n' + FOOTER + '\n' + m.group(0), html, count=1)
    if not re.search(r'<link\b[^>]+href=["\x27]/assets/site-consistency\.css["\x27]', html, re.I):
        html = HEAD_RE.sub(lambda m: '  ' + CSS_LINK + '\n' + m.group(0), html, count=1)
    if THEME_RE.search(html):
        html = THEME_RE.sub(
            lambda m: CONTENT_RE.sub(
                lambda n: n.group(1) + n.group(2) + THEME + n.group(2), m.group(0)
            ), html
        )
    else:
        html = HEAD_RE.sub(
            lambda m: '  <meta name="theme-color" content="' + THEME + '">\n' + m.group(0),
            html, count=1
        )
    return html


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--site', type=Path, required=True)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    count = 0
    pages = 0
    issues = []
    for path in sorted(args.site.rglob('*.html')):
        # Private redirect and technical test are not editorial pages.
        if path.relative_to(args.site).as_posix() in {'statistics/index.html', 'news/automation-probe.html'}:
            continue
        old = path.read_text(encoding='utf-8')
        new = normalise(old)
        if new == old and not BODY_RE.search(old):
            continue
        pages += 1
        if new.count('class="site-footer"') != 1 or new.count('/assets/site-consistency.css') != 1:
            issues.append(str(path))
        if new != old:
            count += 1
            if not args.check:
                path.write_text(new, encoding='utf-8')
    if issues:
        raise SystemExit('UI consistency check failed: ' + ', '.join(issues))
    if args.check and count:
        raise SystemExit(f'{count} pages not normalised')
    print(f'Site UI: checked {pages} pages; updated {count} pages')


if __name__ == '__main__':
    main()
