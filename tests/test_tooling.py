"""Maintenance regressions, isolated from the real working tree.

Run: python -B -m unittest discover -s tests -v
Requires Python 3.10+ and Git; no third-party Python packages.
"""

import hashlib
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
import xml.etree.ElementTree as ET
from datetime import date


SOURCE = Path(__file__).resolve().parents[1]
DOMAIN = "https://meixner-tobias.com"


class MaintenanceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="visual-reset-tooling-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        for name in ["bump_assets.py", "update_sitemap.py", ".githooks/pre-commit"]:
            target = self.root / name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(SOURCE / name, target)
        self.write("css/style.css", "body {}\n")
        self.write("js/main.js", "'use strict';\n")
        for name in ["index.html", "page/index.html"]:
            self.write(name, '<link rel="stylesheet" href="/css/style.css?v=old">'
                       '<script src="/js/main.js?v=old" defer></script><p>Original</p>\n')
        self.write("sitemap.xml", f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>{DOMAIN}/</loc><lastmod>2001-01-01</lastmod></url>
  <url><loc>{DOMAIN}/page/</loc><lastmod>2001-01-01</lastmod></url>
</urlset>''')
        self.git("init", "--quiet")
        self.git("config", "user.name", "Tooling Test")
        self.git("config", "user.email", "tooling-test@example.invalid")
        self.git("config", "core.autocrlf", "false")
        self.git("add", ".")
        env = dict(os.environ, GIT_AUTHOR_DATE="2020-01-02T12:00:00+00:00",
                   GIT_COMMITTER_DATE="2020-01-02T12:00:00+00:00")
        self.git("-c", "core.hooksPath=no-hooks", "commit", "--quiet", "-m", "Fixture", env=env)
        self.git("config", "core.hooksPath", ".githooks")

    def write(self, name, content):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")

    def read(self, name):
        return (self.root / name).read_text(encoding="utf-8")

    def git(self, *args, check=True, env=None):
        return subprocess.run(["git", *args], cwd=self.root, capture_output=True,
                              text=True, encoding="utf-8", check=check, env=env)

    def script(self, name, *args):
        return subprocess.run([sys.executable, "-B", name, *args], cwd=self.root,
                              capture_output=True, text=True, encoding="utf-8", check=True)

    def hook(self):
        # Use the same Python interpreter on PATH inside Git's shell hook.
        env = dict(os.environ)
        env["PATH"] = str(Path(sys.executable).parent) + os.pathsep + env["PATH"]
        return self.git("hook", "run", "pre-commit", check=False, env=env)

    def lastmods(self):
        tree = ET.fromstring(self.read("sitemap.xml"))
        ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        return {entry.find("s:loc", ns).text: entry.find("s:lastmod", ns).text
                for entry in tree}

    def test_asset_urls_are_targeted_and_idempotent(self):
        html = '''<link href="/css/style.css?v=OLD-version&amp;mode=print#section">
<script src='../js/main.js?v=release-1'></script>
<link href="https://example.invalid/css/style.css?v=keep">
<link href="/css/other-style.css?v=keep">
<p>style.css and main.js are documentation text.</p>'''
        self.write("page/index.html", html)
        self.script("bump_assets.py")
        patched = self.read("page/index.html")
        css_hash = hashlib.md5((self.root / "css/style.css").read_bytes()).hexdigest()[:8]
        js_hash = hashlib.md5((self.root / "js/main.js").read_bytes()).hexdigest()[:8]
        self.assertIn(f'/css/style.css?mode=print&amp;v={css_hash}#section', patched)
        self.assertIn(f"../js/main.js?v={js_hash}", patched)
        self.assertIn('https://example.invalid/css/style.css?v=keep', patched)
        self.assertIn('/css/other-style.css?v=keep', patched)
        self.assertIn('style.css and main.js are documentation text.', patched)
        self.script("bump_assets.py")
        self.assertEqual(patched, self.read("page/index.html"))

    def test_asset_refresh_never_changes_untracked_drafts(self):
        draft = '<link href="/css/style.css?v=draft">'
        self.write("draft.html", draft)
        self.script("bump_assets.py")
        self.assertEqual(draft, self.read("draft.html"))

    def test_staged_page_gets_today_untouched_page_keeps_commit_date(self):
        self.write("index.html", self.read("index.html") + "New content")
        self.git("add", "index.html")
        self.script("update_sitemap.py", "--staged-only")
        self.assertEqual(self.lastmods()[DOMAIN + "/"], date.today().isoformat())
        self.assertEqual(self.lastmods()[DOMAIN + "/page/"], "2020-01-02")

    def test_manual_sitemap_command_includes_unstaged_content(self):
        self.write("index.html", self.read("index.html") + "Unstaged content")
        self.script("update_sitemap.py")
        self.assertEqual(self.lastmods()[DOMAIN + "/"], date.today().isoformat())

    def test_staged_only_sitemap_ignores_unstaged_content(self):
        self.write("index.html", self.read("index.html") + "Unstaged content")
        self.script("update_sitemap.py", "--staged-only")
        self.assertEqual(self.lastmods()[DOMAIN + "/"], "2020-01-02")

    def test_missing_foreign_and_escaping_urls_keep_existing_dates(self):
        entries = [DOMAIN + "/missing/", "https://example.invalid/", DOMAIN + "/../outside.html"]
        extra = "".join(f"<url><loc>{url}</loc><lastmod>2003-04-05</lastmod></url>" for url in entries)
        self.write("sitemap.xml", self.read("sitemap.xml").replace("</urlset>", extra + "</urlset>"))
        self.script("update_sitemap.py")
        for url in entries:
            self.assertEqual(self.lastmods()[url], "2003-04-05")

    def test_sitemap_inserts_missing_lastmod(self):
        self.write("sitemap.xml", self.read("sitemap.xml").replace("<lastmod>2001-01-01</lastmod>", "", 1))
        self.script("update_sitemap.py")
        self.assertEqual(self.lastmods()[DOMAIN + "/"], "2020-01-02")

    def test_hook_refuses_unstaged_html_without_mutating_or_staging_it(self):
        self.write("css/style.css", "body { margin: 0; }\n")
        self.git("add", "css/style.css")
        self.write("page/index.html", self.read("page/index.html") + "Unrelated user edit")
        before = {name: self.read(name) for name in ["index.html", "page/index.html", "sitemap.xml"]}
        index_before = self.git("diff", "--cached").stdout
        result = self.hook()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("unstaged changes", result.stdout + result.stderr)
        self.assertEqual(index_before, self.git("diff", "--cached").stdout)
        for name, content in before.items():
            self.assertEqual(content, self.read(name))

    def test_hook_refuses_partially_staged_asset(self):
        self.write("css/style.css", "body { margin: 0; }\n")
        self.git("add", "css/style.css")
        self.write("css/style.css", "body { margin: 1px; }\n")
        before = self.read("index.html")
        self.assertNotEqual(self.hook().returncode, 0)
        self.assertEqual(before, self.read("index.html"))
        self.assertIn("margin: 0", self.git("show", ":css/style.css").stdout)

    def test_hook_refuses_unstaged_sitemap(self):
        self.write("index.html", self.read("index.html") + "Staged content")
        self.git("add", "index.html")
        self.write("sitemap.xml", self.read("sitemap.xml") + "\n<!-- User edit -->")
        before = self.read("sitemap.xml")
        self.assertNotEqual(self.hook().returncode, 0)
        self.assertEqual(before, self.read("sitemap.xml"))

    def test_hook_refreshes_safe_changes_and_leaves_drafts_untracked(self):
        self.write("css/style.css", "body { margin: 0; }\n")
        self.git("add", "css/style.css")
        self.write("draft.html", '<link href="/css/style.css?v=draft">')
        result = self.hook()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        staged = self.git("diff", "--cached", "--name-only").stdout.splitlines()
        self.assertEqual(set(staged), {"css/style.css", "index.html", "page/index.html", "sitemap.xml"})
        self.assertIn("?v=draft", self.read("draft.html"))
        self.assertEqual(self.lastmods()[DOMAIN + "/"], date.today().isoformat())
        self.assertEqual(self.git("diff", "--name-only").stdout, "")

    def test_html_only_hook_does_not_stage_other_html_edits(self):
        self.write("index.html", self.read("index.html") + "Staged content")
        self.git("add", "index.html")
        self.write("page/index.html", self.read("page/index.html") + "Unrelated draft")
        result = self.hook()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(set(self.git("diff", "--cached", "--name-only").stdout.splitlines()),
                         {"index.html", "sitemap.xml"})
        self.assertNotIn("Unrelated draft", self.git("show", ":page/index.html").stdout)
        self.assertIn("Unrelated draft", self.read("page/index.html"))
        self.assertEqual(self.lastmods()[DOMAIN + "/page/"], "2020-01-02")


if __name__ == "__main__":
    unittest.main()
