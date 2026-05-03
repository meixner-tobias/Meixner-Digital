#!/usr/bin/env python3
"""Add GTM head snippet and normalize noscript blocks across all HTML pages."""

import re
from pathlib import Path

BASE = Path(r"h:\Meine Ablage\Meixner-Digital\Meixner-Website")

HEAD_SNIPPET = (
    "  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}"
    "gtag('consent','default',{'analytics_storage':'denied','ad_storage':'denied',"
    "'ad_user_data':'denied','ad_personalization':'denied','functionality_storage':'denied',"
    "'security_storage':'granted','wait_for_update':500});</script>\n"
    "  <!-- Google Tag Manager -->\n"
    "  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':\n"
    "  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],\n"
    "  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=\n"
    "  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);\n"
    "  })(window,document,'script','dataLayer','GTM-5QLXDT4T');</script>\n"
    "  <!-- End Google Tag Manager -->"
)

NOSCRIPT_STANDARD = (
    "<!-- Google Tag Manager (noscript) -->\n"
    "<noscript><iframe src=\"https://www.googletagmanager.com/ns.html?id=GTM-5QLXDT4T\"\n"
    "height=\"0\" width=\"0\" style=\"display:none;visibility:hidden\"></iframe></noscript>\n"
    "<!-- End Google Tag Manager (noscript) -->"
)

# Matches any existing GTM noscript block in all known variations
NOSCRIPT_RE = re.compile(
    r'(?:<!--[^\n]*(?:GTM|noscript|Google Tag Manager)[^\n]*-->\n)?'
    r'<noscript><iframe\s[^>]*googletagmanager\.com/ns\.html[^>]*>.*?</iframe></noscript>'
    r'(?:\n<!--[^\n]*End[^\n]*-->)?',
    re.DOTALL
)

VIEWPORT_RE = re.compile(r'(<meta\s+name="viewport"[^>]+>)')

# Matches any previously inserted consent+GTM head block (correct or buggy)
OLD_HEAD_RE = re.compile(
    r'\n  <script>window\.dataLayer.*?<!-- End Google Tag Manager -->'
    r'(?=\n)',
    re.DOTALL
)


def update_file(filepath: Path) -> str:
    content = filepath.read_text(encoding='utf-8')
    original = content

    # 1. Replace old/buggy head block if present, otherwise insert after viewport meta
    if OLD_HEAD_RE.search(content):
        content = OLD_HEAD_RE.sub('\n' + HEAD_SNIPPET, content, count=1)
    elif '<!-- Google Tag Manager -->' not in content:
        content = VIEWPORT_RE.sub(r'\1\n' + HEAD_SNIPPET, content, count=1)

    # 2. Normalize every GTM noscript block to the standard commented form
    content = NOSCRIPT_RE.sub(NOSCRIPT_STANDARD, content)

    if content != original:
        filepath.write_text(content, encoding='utf-8')
        return 'updated'
    return 'unchanged'


html_files = sorted(
    f for f in BASE.rglob('*.html')
    if '.venv' not in f.parts
)

counts = {'updated': 0, 'unchanged': 0}
for f in html_files:
    result = update_file(f)
    counts[result] += 1
    label = 'OK' if result == 'updated' else '--'
    print(f"  [{label}] {f.relative_to(BASE)}")

print(f"\nDone: {counts['updated']} updated, {counts['unchanged']} unchanged out of {len(html_files)} files.")
