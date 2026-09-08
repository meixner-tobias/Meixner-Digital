"""
Cache-Busting Helper
====================

Computes content-hashes of css/style.css and js/main.js, then rewrites
the asset references in every HTML file so Cloudflare/browsers fetch
fresh copies whenever the file content actually changes.

Usage:
    python bump_assets.py

Run this whenever you edit css/style.css or js/main.js before committing.
Idempotent — running it without changes is a no-op (hashes match).
"""

import hashlib
import html
import re
import subprocess
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parent
EXCLUDE = {".venv", "node_modules", ".git"}

ASSETS = ("css/style.css", "js/main.js")

ASSET_TAG = re.compile(r"<(?:link|script)\b[^>]*>", re.IGNORECASE)
URL_ATTRIBUTE = re.compile(
    r"(?P<prefix>\b(?:href|src)\s*=\s*)(?P<quote>['\"])(?P<url>[^'\"]+)(?P=quote)",
    re.IGNORECASE,
)


def short_hash(file_path: Path, length: int = 8) -> str:
    """Compute a short MD5 hex digest of the file content."""
    h = hashlib.md5()
    h.update(file_path.read_bytes())
    return h.hexdigest()[:length]


def collect_html_files():
    """Use tracked pages in a Git checkout; never rewrite unrelated untracked HTML."""
    try:
        result = subprocess.run(
            ["git", "ls-files", "-z", "--", "*.html"],
            cwd=ROOT, capture_output=True, check=False,
        )
    except FileNotFoundError:
        result = None
    if result is not None and result.returncode == 0:
        return [ROOT / name.decode("utf-8") for name in result.stdout.split(b"\0")
                if name and (ROOT / name.decode("utf-8")).is_file()]
    return sorted(p for p in ROOT.rglob("*.html")
                  if not any(seg in EXCLUDE for seg in p.relative_to(ROOT).parts))


def patch_file(path: Path, replacements: dict) -> bool:
    """Version only this site's actual CSS/JS URL attributes, retaining other query data."""
    src = path.read_text(encoding="utf-8")

    def patch_attribute(match: re.Match) -> str:
        url = urlsplit(html.unescape(match["url"]))
        if url.scheme or url.netloc:
            return match[0]
        target = (ROOT / url.path.lstrip("/") if url.path.startswith("/")
                  else path.parent / url.path).resolve()
        try:
            rel = target.relative_to(ROOT.resolve()).as_posix()
        except ValueError:
            return match[0]
        if rel not in replacements:
            return match[0]
        query = [(key, value) for key, value in parse_qsl(url.query, keep_blank_values=True)
                 if key != "v"]
        query.append(("v", replacements[rel]))
        updated = urlunsplit(url._replace(query=urlencode(query)))
        return f'{match["prefix"]}{match["quote"]}{html.escape(updated, quote=True)}{match["quote"]}'

    orig = src
    src = ASSET_TAG.sub(lambda tag: URL_ATTRIBUTE.sub(patch_attribute, tag[0]), src)
    if src != orig:
        path.write_text(src, encoding="utf-8")
        return True
    return False


def main():
    # Compute fresh hashes
    replacements = {}
    for rel in ASSETS:
        f = ROOT / rel
        if not f.exists():
            print(f"WARNING: {rel} not found, skipping.")
            continue
        h = short_hash(f)
        replacements[rel] = h
        print(f"  {rel}  ->  ?v={h}")

    # Apply to every HTML file
    files = collect_html_files()
    changed = 0
    for f in files:
        if patch_file(f, replacements):
            changed += 1

    print(f"\nDone. {changed} HTML files updated out of {len(files)} scanned.")


if __name__ == "__main__":
    main()
