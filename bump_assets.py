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
import re
from pathlib import Path

ROOT = Path(__file__).parent
EXCLUDE = {".venv", "node_modules", ".git"}

ASSETS = {
    "css/style.css": "style.css",
    "js/main.js": "main.js",
}


def short_hash(file_path: Path, length: int = 8) -> str:
    """Compute a short MD5 hex digest of the file content."""
    h = hashlib.md5()
    h.update(file_path.read_bytes())
    return h.hexdigest()[:length]


def collect_html_files():
    out = []
    for p in ROOT.rglob("*.html"):
        if any(seg in EXCLUDE for seg in p.parts):
            continue
        out.append(p)
    return out


def patch_file(path: Path, replacements: dict) -> bool:
    """Replace asset references like style.css(?v=...)? -> style.css?v=NEWHASH."""
    src = path.read_text(encoding="utf-8")
    orig = src
    for filename, new_hash in replacements.items():
        # Match: filename optionally followed by ?v=anyhash
        # Captures the entire token so we can replace cleanly.
        pattern = re.compile(re.escape(filename) + r"(\?v=[a-f0-9]+)?")
        src = pattern.sub(f"{filename}?v={new_hash}", src)
    if src != orig:
        path.write_text(src, encoding="utf-8")
        return True
    return False


def main():
    # Compute fresh hashes
    replacements = {}
    for rel, basename in ASSETS.items():
        f = ROOT / rel
        if not f.exists():
            print(f"WARNING: {rel} not found, skipping.")
            continue
        h = short_hash(f)
        replacements[basename] = h
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
