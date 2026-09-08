"""Source checks for the static site; Python standard library and Node only.

Run: python -B -m unittest discover -s tests -p test_static.py -v
Browser layout/property validation and content preservation have separate suites.
"""

import ast
from collections import Counter
import email.utils
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import shutil
import subprocess
import unittest
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
EXCLUDE = {".git", ".venv", "node_modules", "__pycache__"}
SITE_HOSTS = {"meixner-tobias.com", "www.meixner-tobias.com"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link",
        "meta", "param", "source", "track", "wbr"}
OPTIONAL_END = {"html", "head", "body", "li", "dt", "dd", "p", "rt", "rp",
                "optgroup", "option", "colgroup", "thead", "tbody", "tfoot", "tr", "td", "th"}


def files(suffix):
    return sorted(p for p in ROOT.rglob("*" + suffix)
                  if not any(part in EXCLUDE for part in p.relative_to(ROOT).parts))


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.nodes = []
        self.stack = []
        self.nesting_errors = []
        self.scripts = []
        self.styles = []
        self.active_raw = None
        self.feed(path.read_text(encoding="utf-8"))
        self.close()
        self.ids = Counter(attrs["id"] for _, attrs, _, _ in self.nodes if attrs.get("id"))

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        line = self.getpos()[0]
        self.nodes.append((tag, attrs, line, tuple(self.stack)))
        if tag not in VOID:
            self.stack.append(tag)
        if tag in {"script", "style"}:
            self.active_raw = (tag, attrs, line, [])

    def handle_startendtag(self, tag, attributes):
        self.handle_starttag(tag, attributes)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if self.active_raw and self.active_raw[0] == tag:
            _, attrs, line, chunks = self.active_raw
            (self.scripts if tag == "script" else self.styles).append((attrs, "".join(chunks), line))
            self.active_raw = None
        if tag in self.stack:
            reverse_index = self.stack[::-1].index(tag)
            index = len(self.stack) - reverse_index - 1
            unclosed = [name for name in self.stack[index + 1:] if name not in OPTIONAL_END]
            if unclosed:
                self.nesting_errors.append((self.getpos()[0], tag, unclosed))
            del self.stack[index:]
        elif tag not in OPTIONAL_END:
            self.nesting_errors.append((self.getpos()[0], "unexpected closing tag", tag))

    def handle_data(self, data):
        if self.active_raw:
            self.active_raw[3].append(data)

    def references(self):
        for tag, attrs, line, _ in self.nodes:
            for name in ["href", "src", "poster", "action", "formaction"]:
                if attrs.get(name):
                    yield attrs[name], line, name
            if attrs.get("srcset"):
                for candidate in attrs["srcset"].split(","):
                    candidate = candidate.strip()
                    if candidate:
                        yield candidate.split()[0], line, "srcset"
            if tag == "object" and attrs.get("data"):
                yield attrs["data"], line, "data"


class StaticTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pages = {path.resolve(): Page(path) for path in files(".html")}

    def local_target(self, value, source):
        parsed = urlsplit(value)
        if parsed.scheme and parsed.scheme not in {"http", "https"}:
            return None
        if parsed.netloc and parsed.hostname not in SITE_HOSTS:
            return None
        url_path = unquote(parsed.path)
        if not url_path:
            path = source
        elif url_path.startswith("/"):
            path = ROOT / url_path.lstrip("/")
        else:
            path = source.parent / url_path
        path = path.resolve()
        self.assertTrue(path.is_relative_to(ROOT), f"Path escapes repository: {source}: {value}")
        if path.is_dir():
            path = path / "index.html"
        return path, unquote(parsed.fragment)

    def assert_local_reference(self, value, source, context, fragments=True):
        target = self.local_target(value, source)
        if target is None:
            return
        path, fragment = target
        self.assertTrue(path.is_file(), f"Missing local {context}: {source.relative_to(ROOT)}: {value}")
        if fragments and fragment and path.suffix.lower() == ".html":
            page = self.pages.get(path)
            self.assertIsNotNone(page, f"Referenced HTML not scanned: {path}")
            self.assertIn(fragment, page.ids, f"Missing #{fragment}: {source.relative_to(ROOT)} -> {path.relative_to(ROOT)}")

    def test_html_structure_and_dom_references(self):
        self.assertGreater(len(self.pages), 0)
        for path, page in self.pages.items():
            with self.subTest(path=path.relative_to(ROOT)):
                self.assertEqual([], page.nesting_errors, "Crossed or unmatched HTML tags")
                self.assertEqual([], [tag for tag in page.stack if tag not in OPTIONAL_END], "Unclosed HTML tags")
                self.assertEqual([], [name for name, count in page.ids.items() if count > 1], "Duplicate IDs")
                self.assertEqual(1, sum(tag == "main" for tag, _, _, _ in page.nodes))
                self.assertEqual(1, sum(tag == "h1" for tag, _, _, _ in page.nodes))
                for tag, attrs, line, ancestors in page.nodes:
                    self.assertFalse(tag == "main" and "main" in ancestors, f"Nested main at line {line}")
                    for name in ["aria-controls", "aria-describedby", "aria-labelledby", "aria-owns"]:
                        for ident in (attrs.get(name) or "").split():
                            self.assertIn(ident, page.ids, f"Broken {name}={ident} at line {line}")
                    if tag == "label" and attrs.get("for"):
                        self.assertIn(attrs["for"], page.ids, f"Broken label at line {line}")
                    if tag == "img":
                        self.assertIn("alt", attrs, f"Image without alt at line {line}")

    def test_all_local_resources_and_fragments_exist(self):
        for path, page in self.pages.items():
            for value, line, attribute in page.references():
                with self.subTest(path=path.relative_to(ROOT), line=line, value=value):
                    self.assert_local_reference(value, path, attribute)
        for path in files(".css"):
            text = re.sub(r"/\*[\s\S]*?\*/", "", path.read_text(encoding="utf-8"))
            for value in re.findall(r"url\(\s*['\"]?([^)'\"]+)", text):
                self.assert_local_reference(value.strip(), path, "CSS URL", fragments=False)

    def test_json_jsonld_xml_and_feed_dates(self):
        for path in files(".json") + files(".webmanifest") + files(".ipynb"):
            with self.subTest(path=path.relative_to(ROOT)):
                json.loads(path.read_text(encoding="utf-8"))
        for path, page in self.pages.items():
            for attrs, source, line in page.scripts:
                if (attrs.get("type") or "").lower() == "application/ld+json":
                    with self.subTest(path=path.relative_to(ROOT), line=line):
                        data = json.loads(source)

                        def visit(item):
                            if isinstance(item, dict):
                                for value in item.values():
                                    visit(value)
                            elif isinstance(item, list):
                                for value in item:
                                    visit(value)
                            elif isinstance(item, str) and urlsplit(item).hostname in SITE_HOSTS:
                                # JSON-LD fragments identify entities, not DOM elements.
                                self.assert_local_reference(item, path, "JSON-LD URL", fragments=False)

                        visit(data)
        for path in files(".xml") + files(".svg"):
            with self.subTest(path=path.relative_to(ROOT)):
                tree = ET.parse(path)
                for element in tree.iter():
                    if element.tag in {"pubDate", "lastBuildDate"}:
                        value = element.text.strip()
                        parsed = email.utils.parsedate_to_datetime(value)
                        self.assertEqual(value.split(",")[0], parsed.strftime("%a"))
                    for value in [element.text or "", *element.attrib.values()]:
                        if value.strip().startswith(("https://meixner-tobias.com/", "http://meixner-tobias.com/")):
                            self.assert_local_reference(value.strip(), path, "XML URL", fragments=False)
        manifest = json.loads((ROOT / "assets/favicon/site.webmanifest").read_text(encoding="utf-8"))
        for icon in manifest.get("icons", []):
            self.assert_local_reference(icon["src"], ROOT / "assets/favicon/site.webmanifest", "manifest icon")

    def test_python_and_notebook_syntax(self):
        for path in files(".py"):
            with self.subTest(path=path.relative_to(ROOT)):
                ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
        for path in files(".ipynb"):
            notebook = json.loads(path.read_text(encoding="utf-8"))
            for index, cell in enumerate(notebook["cells"]):
                if cell["cell_type"] == "code":
                    with self.subTest(path=path.relative_to(ROOT), cell=index):
                        ast.parse("".join(cell["source"]))

    def test_javascript_and_inline_event_syntax(self):
        node = shutil.which("node")
        self.assertIsNotNone(node, "Node is required for JavaScript syntax checks")

        def check(source, label, module=False):
            command = [node, "--check"] + (["--input-type=module"] if module else [])
            result = subprocess.run(command, input=source, text=True, encoding="utf-8", capture_output=True)
            self.assertEqual(result.returncode, 0, f"{label}\n{result.stderr}")

        for path in files(".js"):
            check(path.read_text(encoding="utf-8"), str(path.relative_to(ROOT)))
        for path, page in self.pages.items():
            for attrs, source, line in page.scripts:
                script_type = (attrs.get("type") or "").lower()
                if not attrs.get("src") and script_type in {"", "text/javascript", "application/javascript", "module"}:
                    check(source, f"{path.relative_to(ROOT)}:{line}", script_type == "module")
            for _, attrs, line, _ in page.nodes:
                for name, source in attrs.items():
                    if name.startswith("on") and source:
                        check("function inlineHandler(event) {\n" + source + "\n}",
                              f"{path.relative_to(ROOT)}:{line} {name}")

    def test_motion_stays_dependency_free_and_css_is_safe(self):
        """The visual redesign allows CSS animation; it does not allow a new
        animation runtime, and it must not hide broken geometry.

        Replaces the former zero-animation assertions of the visual reset.
        Deliberately still forbidden:
          - animation libraries (gsap / ScrollTrigger / Lenis / three.js)
          - a global `transition: all`, which animates unnamed properties
          - `overflow-x: hidden` on html/body to mask layout overflow
          - declarative SVG animation elements
        """
        libraries = re.compile(r"\b(?:gsap|ScrollTrigger|Lenis|THREE)\b")
        transition_all = re.compile(r"transition\s*:\s*all\b", re.IGNORECASE)
        body_clip = re.compile(
            r"(?:^|[},])\s*(?:html|body)[^{}]*\{[^{}]*overflow-x\s*:\s*hidden", re.IGNORECASE
        )
        sources = [(path, path.read_text(encoding="utf-8")) for path in files(".js")]
        styles = [(path, path.read_text(encoding="utf-8")) for path in files(".css")]
        for path, page in self.pages.items():
            for attrs, source, _ in page.scripts:
                if (attrs.get("type") or "").lower() != "application/ld+json":
                    self.assertNotIn("/js/vendor/", attrs.get("src", ""),
                                     f"{path}: vendored animation runtime reintroduced")
                    sources.append((path, source))
            styles += [(path, source) for _, source, _ in page.styles]
            for tag, attrs, line, _ in page.nodes:
                self.assertNotIn(tag, {"animate", "animatetransform", "animatemotion", "set"},
                                 f"Declarative SVG animation {path}:{line}")
                if attrs.get("style"):
                    styles.append((path, attrs["style"]))
                for name, source in attrs.items():
                    if name.startswith("on") and source:
                        sources.append((path, source))
        for path, source in sources:
            with self.subTest(path=path.relative_to(ROOT)):
                self.assertIsNone(libraries.search(source),
                                  "Animation library reintroduced; motion is CSS + IntersectionObserver")
        for path, source in styles:
            with self.subTest(path=path.relative_to(ROOT)):
                source = re.sub(r"/\*[\s\S]*?\*/", "", source)
                self.assertIsNone(transition_all.search(source),
                                  "Name the animated properties instead of `transition: all`")
                self.assertIsNone(body_clip.search(source),
                                  "Do not hide overflow on html/body; contain decorative motion instead")

    def test_motion_preferences_are_honoured_in_css(self):
        """Reduced motion and the explicit pause must both neutralise decoration."""
        css = (ROOT / "css" / "style.css").read_text(encoding="utf-8")
        self.assertIn("prefers-reduced-motion", css, "Reduced-motion handling is missing")
        self.assertIn(".motion-paused", css, "Explicit pause state is missing")
        # Every keyframe loop has to be reachable by the pause state.
        for name in re.findall(r"@keyframes\s+([\w-]+)", css):
            with self.subTest(keyframes=name):
                users = re.findall(r"animation:[^;]*\b" + re.escape(name) + r"\b[^;]*;", css)
                self.assertTrue(users, f"@keyframes {name} is declared but never used")
                for rule in re.findall(r"([^{}]+)\{[^{}]*animation:[^;]*\b"
                                       + re.escape(name) + r"\b", css):
                    self.assertIn("motion-paused", rule,
                                  f"Loop {name} keeps running when the user pauses motion")


if __name__ == "__main__":
    unittest.main()
