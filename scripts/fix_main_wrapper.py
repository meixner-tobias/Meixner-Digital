"""
fix_main_wrapper.py
-------------------
Wraps all inner-page content (hero through last section before footer) in
  <main id="main-content"> … </main>
so the page structure matches blog/index.html (the reference page that
renders the hero title correctly below the fixed navbar).

What the script changes per file:
  1. Finds the drawer's closing </nav> tag (last </nav> before the hero section).
  2. Inserts  \n\n<main id="main-content">\n  after that </nav>.
  3. Removes  id="main-content"  from the <section class="page-hero/about-hero"> opening tag.
  4. Inserts  \n</main>\n  before the <!-- FOOTER --> comment (or before <footer> if no comment).

Run:  python scripts/fix_main_wrapper.py
"""

import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Pages whose hero uses class="page-hero"
PAGE_HERO_FILES = [
    'leistungen/index.html',
    'projekte/index.html',
    'kontakt/index.html',
    'produkte/index.html',
    'en/services/index.html',
    'en/projects/index.html',
    'en/contact/index.html',
    'en/products/index.html',
]

# Pages whose hero uses class="about-hero"
ABOUT_HERO_FILES = [
    'ueber-mich/index.html',
    'en/about/index.html',
]


def fix_file(rel_path, hero_class):
    filepath = os.path.join(ROOT, rel_path.replace('/', os.sep))

    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()

    content = original

    # ── Guard: skip if already wrapped ────────────────────────────────────
    if '<main id="main-content">' in content:
        print(f'  SKIP (already wrapped): {rel_path}')
        return

    # ── Locate the hero section ────────────────────────────────────────────
    hero_tag = f'<section class="{hero_class}" id="main-content"'
    if hero_tag not in content:
        # Try without a space before id (shouldn't happen, but be safe)
        hero_tag = f'<section class="{hero_class}"  id="main-content"'
        if hero_tag not in content:
            print(f'  SKIP (hero pattern not found): {rel_path}')
            return

    hero_pos = content.find(hero_tag)

    # ── Step 1: Remove id="main-content" from the section tag ─────────────
    content = content.replace(hero_tag, f'<section class="{hero_class}"', 1)
    # Recalculate hero_pos after replacement (length may have changed)
    hero_pos_new = content.find(f'<section class="{hero_class}"')

    # ── Step 2: Find the last </nav> before the hero and insert <main> ─────
    last_nav_end = content.rfind('</nav>', 0, hero_pos_new)
    if last_nav_end == -1:
        print(f'  ERROR (no </nav> before hero): {rel_path}')
        return

    insert_pos = last_nav_end + len('</nav>')
    content = (
        content[:insert_pos]
        + '\n\n<main id="main-content">\n'
        + content[insert_pos:]
    )

    # ── Step 3: Insert </main> before the footer (or footer comment) ───────
    # Prefer inserting before "<!-- FOOTER -->" if present
    footer_comment = '<!-- FOOTER -->'
    fc_pos = content.find(footer_comment)
    if fc_pos != -1:
        # Insert </main> + blank line before the comment
        content = content[:fc_pos] + '</main>\n\n' + content[fc_pos:]
    else:
        # Fall back: insert before <footer
        ft_pos = content.find('\n<footer')
        if ft_pos != -1:
            content = content[:ft_pos] + '\n\n</main>' + content[ft_pos:]
        else:
            print(f'  ERROR (footer not found): {rel_path}')
            return

    if content == original:
        print(f'  NO CHANGE: {rel_path}')
        return

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  FIXED: {rel_path}')


if __name__ == '__main__':
    print('=== Wrapping inner pages in <main id="main-content"> ===\n')
    for p in PAGE_HERO_FILES:
        fix_file(p, 'page-hero')
    for p in ABOUT_HERO_FILES:
        fix_file(p, 'about-hero')
    print('\nDone.')
