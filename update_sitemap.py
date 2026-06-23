"""
Sitemap lastmod Updater
=======================

For every <url> entry in sitemap.xml, rewrites <lastmod> to the date
of that page's most recent git commit. Pages you didn't touch keep
their real lastmod; pages you edited get auto-bumped.

Usage:
    python update_sitemap.py

Run this before committing whenever you edit page content. Pairs with
bump_assets.py (which handles CSS/JS cache-busting).
"""

import re
import subprocess
from datetime import date
from pathlib import Path

ROOT = Path(__file__).parent
SITEMAP = ROOT / "sitemap.xml"
DOMAIN = "https://meixner-tobias.com"


def url_to_file(url: str) -> Path:
    """Map a sitemap URL to its source HTML file on disk."""
    path = url.replace(DOMAIN, "").lstrip("/")
    if not path:
        return ROOT / "index.html"
    if path.endswith("/"):
        return ROOT / path / "index.html"
    return ROOT / path


def git_last_date(file_path: Path) -> str | None:
    """Return YYYY-MM-DD of the file's most recent git commit, or None."""
    if not file_path.exists():
        return None
    try:
        rel = file_path.relative_to(ROOT)
        result = subprocess.run(
            ["git", "log", "-1", "--format=%cs", "--", str(rel).replace("\\", "/")],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=True,
        )
        out = result.stdout.strip()
        return out if out else None
    except (subprocess.CalledProcessError, ValueError):
        return None


# Match a single <url>...</url> block (non-greedy)
URL_BLOCK = re.compile(r"<url>(.*?)</url>", re.DOTALL)
LOC_RE = re.compile(r"<loc>([^<]+)</loc>")
LASTMOD_RE = re.compile(r"<lastmod>[^<]+</lastmod>")


def main():
    src = SITEMAP.read_text(encoding="utf-8")
    today = date.today().isoformat()
    updates = []
    skipped = []

    def replace_block(match: re.Match) -> str:
        block = match.group(1)
        loc_match = LOC_RE.search(block)
        if not loc_match:
            return match.group(0)
        url = loc_match.group(1).strip()
        file_path = url_to_file(url)

        new_date = git_last_date(file_path)
        if not new_date:
            new_date = today
            skipped.append((url, "no git history, set to today"))

        new_block = LASTMOD_RE.sub(f"<lastmod>{new_date}</lastmod>", block)
        if new_block != block:
            updates.append((url, new_date))
        return f"<url>{new_block}</url>"

    new_src = URL_BLOCK.sub(replace_block, src)

    if new_src == src:
        print("No changes — sitemap already current.")
        return

    SITEMAP.write_text(new_src, encoding="utf-8")
    print(f"Updated {len(updates)} entries in sitemap.xml:\n")
    for url, d in updates:
        short = url.replace(DOMAIN, "")
        print(f"  {d}  {short}")
    if skipped:
        print("\nFallbacks (no git history):")
        for url, note in skipped:
            print(f"  {url}  -> {note}")


if __name__ == "__main__":
    main()
