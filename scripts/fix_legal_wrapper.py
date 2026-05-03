"""
fix_legal_wrapper.py
--------------------
Applies the same <main id="main-content"> wrapper pattern to all six legal pages
(impressum, datenschutz, agb, en/legal, en/policy-privacy, en/terms-and-conditions).

Before (current inconsistent state):
  </nav>  (drawer)
  <main class="legal-page" id="main-content">   ← some also have nested <main class="legal-content">
    ...
  </main>   or  </div>  (inconsistent)
  <footer>

After:
  </nav>  (drawer)
  <main id="main-content">

  <div class="legal-page">
    ...
    <div class="legal-content">   ← always div, no nested main
      ...
    </div>
    ...
  </div>

  </main>
  <footer>
"""

import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

LEGAL_FILES = [
    'impressum/index.html',
    'datenschutz/index.html',
    'agb/index.html',
    'en/legal/index.html',
    'en/policy-privacy/index.html',
    'en/terms-and-conditions/index.html',
]


def fix_file(rel_path):
    filepath = os.path.join(ROOT, rel_path.replace('/', os.sep))

    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()

    content = original

    # ── Guard: skip if already wrapped ────────────────────────────────────
    if re.search(r'<main id="main-content">', content):
        print(f'  SKIP (already wrapped): {rel_path}')
        return

    # ── Locate the outer legal-page main ──────────────────────────────────
    outer_tag = '<main class="legal-page" id="main-content"'
    if outer_tag not in content:
        print(f'  SKIP (outer main not found): {rel_path}')
        return

    outer_pos = content.find(outer_tag)

    # ── Step 1: Change inner <main class="legal-content"> → <div> ─────────
    content = content.replace(
        '<main class="legal-content">',
        '<div class="legal-content">',
    )

    # ── Step 2: Change outer <main class="legal-page" id=...> → <div> ─────
    # Keep any aria-labelledby attribute present on the outer main
    content = content.replace(outer_tag, '<div class="legal-page"', 1)

    # ── Step 3: Fix the closing tags ──────────────────────────────────────
    # After steps 1+2, remaining </main> tags in the file are the ones that
    # used to close the outer <main class="legal-page"> and/or the inner
    # <main class="legal-content">. Replace ALL of them with </div>.
    # (A new </main> will be added before <footer> in step 5.)
    content = content.replace('</main>', '</div>')

    # ── Step 4: Insert <main id="main-content"> after the drawer's </nav> ─
    # The drawer's </nav> is the last </nav> before the <div class="legal-page">
    legal_div_pos = content.find('<div class="legal-page"')
    last_nav_end = content.rfind('</nav>', 0, legal_div_pos)
    if last_nav_end == -1:
        print(f'  ERROR (no </nav> before legal-page): {rel_path}')
        return

    insert_pos = last_nav_end + len('</nav>')
    content = (
        content[:insert_pos]
        + '\n\n<main id="main-content">\n'
        + content[insert_pos:]
    )

    # ── Step 5: Insert </main> before the footer ──────────────────────────
    fc = content.find('<!-- FOOTER -->')
    if fc != -1:
        content = content[:fc] + '</main>\n\n' + content[fc:]
    else:
        ft = content.find('\n<footer')
        if ft != -1:
            content = content[:ft] + '\n\n</main>' + content[ft:]
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
    print('=== Wrapping legal pages in <main id="main-content"> ===\n')
    for p in LEGAL_FILES:
        fix_file(p)
    print('\nDone.')
