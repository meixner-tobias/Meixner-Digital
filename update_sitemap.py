"""
Sitemap lastmod Updater
=======================

For every local <url> entry, use today's date for changed HTML pages
and the most recent git commit date for unchanged pages. Missing pages
and URLs without usable history retain their existing metadata.

Usage:
    python update_sitemap.py

Run this before committing whenever you edit page content. Pairs with
bump_assets.py (which handles CSS/JS cache-busting).
"""

import argparse
import re
import subprocess
from datetime import date
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent
SITEMAP = ROOT / "sitemap.xml"
DOMAIN = "https://meixner-tobias.com"


def url_to_file(url: str) -> Path | None:
    """Map a sitemap URL to its source HTML file on disk."""
    parsed = urlsplit(url)
    if (parsed.scheme, parsed.netloc) != ("https", "meixner-tobias.com"):
        return None
    path = unquote(parsed.path).lstrip("/")
    if not path:
        return ROOT / "index.html"
    target = ROOT / path / "index.html" if path.endswith("/") else ROOT / path
    target = target.resolve()
    return target if target.is_relative_to(ROOT.resolve()) else None


def changed_pages(staged_only: bool = False) -> set[str]:
    """Include staged changes; the manual command also includes worktree/new pages."""
    commands = [["git", "diff", "--cached", "--name-only", "-z", "--", "*.html"]]
    if not staged_only:
        commands += [
            ["git", "diff", "--name-only", "-z", "--", "*.html"],
            ["git", "ls-files", "--others", "--exclude-standard", "-z", "--", "*.html"],
        ]
    changed = set()
    for command in commands:
        result = subprocess.run(command, cwd=ROOT, capture_output=True, check=True)
        changed.update(name.decode("utf-8") for name in result.stdout.split(b"\0") if name)
    return changed


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


def main(staged_only: bool = False):
    src = SITEMAP.read_text(encoding="utf-8")
    today = date.today().isoformat()
    updates = []
    skipped = []
    changed = changed_pages(staged_only)

    def replace_block(match: re.Match) -> str:
        block = match.group(1)
        loc_match = LOC_RE.search(block)
        if not loc_match:
            return match.group(0)
        url = loc_match.group(1).strip()
        file_path = url_to_file(url)
        if file_path is None or not file_path.is_file():
            skipped.append((url, "missing/local path invalid; existing lastmod preserved"))
            return match.group(0)

        rel = file_path.relative_to(ROOT).as_posix()
        new_date = today if rel in changed else git_last_date(file_path)
        if not new_date:
            skipped.append((url, "no git history; existing lastmod preserved"))
            return match.group(0)

        new_block = LASTMOD_RE.sub(f"<lastmod>{new_date}</lastmod>", block, count=1)
        if not LASTMOD_RE.search(block):
            new_block = LOC_RE.sub(lambda loc: loc[0] + f"\n    <lastmod>{new_date}</lastmod>", block, count=1)
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
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--staged-only", action="store_true",
                        help="Use staged changes only (for the pre-commit hook).")
    main(parser.parse_args().staged_only)
