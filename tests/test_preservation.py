"""Preserve content, integrations and public DOM hooks through the visual reset.

The baseline comes from backup/pre-visual-reset-2026-09-07. Its narrowly scoped
normalizations are documented below and in the manifest.
Run with: python -m unittest discover -s tests -p test_preservation.py
"""

from hashlib import sha256
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]
BASELINE_PATH = ROOT / "docs" / "preservation-baseline.json"
VOID = set("area base br col embed hr img input link meta param source track wbr".split())


def normalize_visual_text(source):
    # Adjacent formerly block-level hero spans need a word separator in native flow.
    source = source.replace('</span><span data-intro>', '</span> <span data-intro>')
    source = re.sub(r'(<div class="faq-mini-item"><strong>[^<]*</strong>)(?=\S)', r'\1 ', source)
    # These explicit numbers decorated an already numbered ordered-list TOC.
    # Do not normalize any other spans, list text or numeric content.
    return re.sub(r'(<nav\b[^>]*class="toc-box"[^>]*>)(.*?)(</nav>)',
                  lambda nav: nav[1] + re.sub(r'(<li>\s*)<span>\d+</span>', r'\1', nav[2]) + nav[3],
                  source, flags=re.S)


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.nodes = []
        self.stack = []
        self.main_text = []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        node = {"tag": tag, "attrs": dict(attrs), "parents": self.stack.copy(),
                "children": [], "text": []}
        self.nodes.append(node)
        if self.stack:
            self.stack[-1]["children"].append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if self.stack and self.stack[-1]["tag"] == tag:
            self.stack.pop()

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index]["tag"] == tag:
                self.stack = self.stack[:index]
                break

    def handle_data(self, text):
        for node in self.stack:
            node["text"].append(text)
        tags = [node["tag"] for node in self.stack]
        if "main" in tags and not any(tag in tags for tag in ("noscript", "script", "style")):
            # Eight broken <li> openers were bare > text directly inside <ul>.
            # Ignore only this malformed marker, preserving mathematical > text.
            if self.stack[-1]["tag"] in ("ul", "ol") and text.strip() == ">":
                return
            self.main_text.append(text)


def is_removed_decoration(node):
    for item in node["parents"] + [node]:
        attrs = item["attrs"]
        classes = attrs.get("class", "").split()
        if attrs.get("id") in ("themeToggle", "themeToggleMobile", "hero-canvas", "contact-canvas"):
            return True
        if "blob" in classes and attrs.get("aria-hidden") == "true":
            return True
        if "hero-wave" in classes:
            return True
        if item is not node and item["tag"] == "svg" and "nav-logo" in classes:
            return True
    return False


def snapshot(source):
    page = Page(normalize_visual_text(source.replace("\r\n", "\n")))
    result = {"metadata": [], "seo_links": [], "jsonld": [], "integration_scripts": [],
              "tracking_iframes": [], "links": [], "images": [], "sources": [],
              "forms": [], "form_controls": [], "data_attributes": []}
    ids, classes = set(), set()
    for node in page.nodes:
        tag, attrs = node["tag"], node["attrs"]
        parents = [item["tag"] for item in node["parents"]]
        text = "".join(node["text"]).strip()
        if tag == "html":
            result["language"] = attrs.get("lang")
        if tag == "title":
            result["title"] = text
        if tag == "meta" and attrs.get("name") != "theme-color":
            result["metadata"].append(attrs)
        if tag == "link" and set(attrs.get("rel", "").split()) & {"canonical", "alternate", "icon", "apple-touch-icon"}:
            result["seo_links"].append(attrs)
        if tag == "script" and attrs.get("type") == "application/ld+json":
            result["jsonld"].append(json.loads(text))
        elif tag == "script" and not attrs.get("src") and "localStorage.getItem(\"theme\")" not in text:
            result["integration_scripts"].append(text)
        if tag == "iframe" and "noscript" in parents:
            result["tracking_iframes"].append(attrs)
        if tag == "a" and "noscript" not in parents:
            result["links"].append(attrs.get("href"))
        if tag == "img":
            result["images"].append(attrs)
        if tag == "source":
            parent = node["parents"][-1]
            # The outer JPEG source of a nested picture was invalid and redundant;
            # the inner WebP source and unchanged JPEG img fallback are retained.
            if not (parent["tag"] == "picture" and any(child["tag"] == "picture" for child in parent["children"])):
                result["sources"].append(attrs)
        if tag == "form":
            result["forms"].append(attrs)
        if tag in ("input", "textarea", "select"):
            result["form_controls"].append(attrs)
        if not is_removed_decoration(node):
            if attrs.get("id"):
                ids.add(attrs["id"])
            classes.update(attrs.get("class", "").split())
            data = {key: value for key, value in attrs.items() if key.startswith("data-")}
            if data:
                result["data_attributes"].append(data)
    # Responsive sizing is retained; object-fit was decorative and deliberately reset.
    for image in result["images"]:
        image.pop("style", None)
    content = " ".join("".join(page.main_text).split())
    result["main_text_sha256"] = sha256(content.encode("utf-8")).hexdigest()
    result["main_text_characters"] = len(content)
    result["ids"] = sorted(ids)
    result["classes"] = sorted(classes)
    return result


class PreservationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.baseline = json.loads(BASELINE_PATH.read_text(encoding="utf-8"))

    def test_every_original_page_preserves_content_integrations_and_hooks(self):
        for filename, expected in self.baseline["pages"].items():
            with self.subTest(page=filename):
                actual = snapshot((ROOT / filename).read_text(encoding="utf-8-sig"))
                for key, value in expected.items():
                    if key in ("ids", "classes"):
                        self.assertTrue(set(value) <= set(actual[key]), f"{filename}: removed {key}: {set(value) - set(actual[key])}")
                    else:
                        self.assertEqual(value, actual[key], f"{filename}: {key} changed")


if __name__ == "__main__":
    unittest.main()
