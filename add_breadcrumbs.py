"""
Breadcrumb Injector
===================

Inserts visible breadcrumb navigation into article and product detail
pages. The breadcrumb HTML is placed as the first child of the
.article-hero / .product-hero container so it inherits the hero's
gradient backdrop and top-padding.

Idempotent — skips files that already contain a <nav class="breadcrumbs">.

Usage:
    python add_breadcrumbs.py
"""

import re
from pathlib import Path

ROOT = Path(__file__).parent

# URL-path stem -> visible breadcrumb title (last segment of the trail).
# Stems are relative to project root, without the trailing /index.html.
TITLES = {
    # DE Blog
    "blog/server-side-tracking": "Server-Side Tracking",
    "blog/stape-io-einrichten": "Stape.io einrichten",
    "blog/meta-capi-server-side-gtm": "Meta CAPI via sGTM",
    "blog/google-ads-enhanced-conversions": "Google Ads Enhanced Conv.",
    "blog/safari-itp-umgehen": "Safari ITP umgehen",
    "blog/performance-max-vs-advantage-plus": "Performance Max vs. Advantage+",
    "blog/prompt-engineering-ecommerce": "KI-Texterstellung E-Commerce",
    "blog/answer-engine-optimization": "Answer Engine Optimization",
    # EN Blog
    "en/blog/server-side-tracking": "Server-Side Tracking",
    "en/blog/stape-io-setup": "Stape.io Setup",
    "en/blog/meta-capi-server-side-gtm": "Meta CAPI via sGTM",
    "en/blog/google-ads-enhanced-conversions": "Google Ads Enhanced Conv.",
    "en/blog/bypassing-safari-itp": "Bypassing Safari ITP",
    "en/blog/performance-max-vs-advantage-plus": "Performance Max vs. Advantage+",
    "en/blog/prompt-engineering-ecommerce": "Prompt Engineering for E-Commerce",
    "en/blog/answer-engine-optimization": "Answer Engine Optimization",
}


def labels_for(stem: str):
    """Return [(label, url), ...] for the parent path (Home, Blog/Products)."""
    is_en = stem.startswith("en/")
    # Check against "blog/" (not "/blog/") — stems don't start with a slash,
    # so DE blog stems like "blog/server-side-tracking" would never match.
    is_blog = "blog/" in stem
    if is_en:
        home = ("Home", "/en/")
        parent = ("Blog", "/en/blog/") if is_blog else ("Products", "/en/products/")
    else:
        home = ("Startseite", "/")
        parent = ("Blog", "/blog/") if is_blog else ("Produkte", "/produkte/")
    return [home, parent], is_en


def breadcrumb_html(stem: str) -> str:
    parents, is_en = labels_for(stem)
    title = TITLES[stem]
    aria = "Breadcrumb" if is_en else "Brotkrumen-Navigation"
    lines = [
        f'      <nav class="breadcrumbs" aria-label="{aria}">',
        '        <ol class="breadcrumb-list">',
    ]
    for label, url in parents:
        lines.append(f'          <li><a href="{url}">{label}</a></li>')
    lines.append(f'          <li aria-current="page">{title}</li>')
    lines += [
        "        </ol>",
        "      </nav>",
    ]
    return "\n".join(lines) + "\n"


# Match the opening of the hero container — first <div class="container">
# directly inside <header class="article-hero..."> or <section class="product-hero...">.
HERO_CONTAINER_PATTERN = re.compile(
    r'(<(?:header|section)\s+class="(?:article-hero|product-hero)[^"]*"[^>]*>\s*\n\s*<div class="container">\s*\n)',
    re.MULTILINE,
)


def patch_file(file_path: Path, stem: str) -> str | None:
    src = file_path.read_text(encoding="utf-8")

    if 'class="breadcrumbs"' in src:
        return "skip-already-has-breadcrumbs"

    bc = breadcrumb_html(stem)
    new_src, n = HERO_CONTAINER_PATTERN.subn(r"\1" + bc, src, count=1)
    if n == 0:
        return "skip-no-hero-anchor"

    file_path.write_text(new_src, encoding="utf-8")
    return "patched"


def main():
    results = {"patched": 0, "skip-already-has-breadcrumbs": 0, "skip-no-hero-anchor": 0}
    for stem in TITLES:
        f = ROOT / stem / "index.html"
        if not f.exists():
            print(f"  missing: {stem}")
            continue
        status = patch_file(f, stem)
        results[status] = results.get(status, 0) + 1
        marker = "+" if status == "patched" else "-"
        print(f"  {marker} {status:38s}  {stem}")
    print(f"\nDone. patched={results['patched']}  already={results['skip-already-has-breadcrumbs']}  no-anchor={results['skip-no-hero-anchor']}")


if __name__ == "__main__":
    main()
