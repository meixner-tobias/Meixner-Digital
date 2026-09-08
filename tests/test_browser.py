"""Local browser regressions. External requests are mocked; no leads are sent.

Run: python -m unittest discover -s tests -p test_browser.py -v
Requires the development-only Python playwright package and Chromium.
Set PLAYWRIGHT_CHROMIUM_EXECUTABLE if the browser is installed elsewhere.
"""

import functools
import http.server
import http.client
import json
import mimetypes
import os
from pathlib import Path
import threading
import unittest
from urllib.parse import unquote, urlsplit
from urllib.request import urlopen

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


class TestServer(http.server.ThreadingHTTPServer):
    # Allow bursts of independent static-resource requests in the HTTP smoke test.
    request_queue_size = 128
    daemon_threads = True


class BrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        handler = functools.partial(QuietHandler, directory=str(ROOT))
        cls.server = TestServer(("127.0.0.1", 0), handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = f"http://127.0.0.1:{cls.server.server_port}"
        cls.pw = sync_playwright().start()
        executable = os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE")
        if not executable and not Path(cls.pw.chromium.executable_path).exists():
            cache = Path(os.environ.get("LOCALAPPDATA", "")) / "ms-playwright"
            candidates = sorted(cache.glob("chromium-*/chrome-win64/chrome.exe"))
            if candidates:
                executable = str(candidates[-1])
        cls.browser = cls.pw.chromium.launch(
            headless=True, **({"executable_path": executable} if executable else {})
        )
        print(f"\nBrowser: Chromium {cls.browser.version}")

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def setUp(self):
        self.context = self.browser.new_context(viewport={"width": 1280, "height": 900})
        self.requests = []
        self.context.route("**/*", self.route)
        self.page = self.context.new_page()
        self.errors = []
        self.page.on("pageerror", lambda error: self.errors.append(str(error)))
        self.page.on("console", lambda msg: self.errors.append(msg.text + " " + msg.location.get("url", "")) if msg.type == "error" else None)
        self.local_failures = []
        self.page.on("response", lambda response: self.local_failures.append(response.url)
                     if response.url.startswith(self.base) and response.status >= 400 else None)
        self.form_status = 200
        self.form_abort = False

    def tearDown(self):
        self.context.close()
        self.assertEqual([], self.errors, "Browser errors")
        self.assertEqual([], self.local_failures, "Missing local resources")

    def route(self, route):
        request = route.request
        url = urlsplit(request.url)
        if request.url.startswith(self.base + "/"):
            # Serve exact checkout bytes to the browser. The separate HTTP smoke
            # test covers hosting; UI tests do not depend on loopback/proxy timing.
            local = (ROOT / unquote(url.path).lstrip("/")).resolve()
            if local.is_dir():
                local /= "index.html"
            if local.is_relative_to(ROOT) and local.is_file():
                route.fulfill(status=200, content_type=mimetypes.guess_type(local.name)[0] or "application/octet-stream",
                              body=local.read_bytes())
            else:
                self.local_failures.append(request.url)
                route.fulfill(status=404, body="Missing local file")
        elif url.hostname in {"meixner-tobias.com", "www.meixner-tobias.com"} and url.path.startswith("/assets/"):
            asset = (ROOT / unquote(url.path).lstrip("/")).resolve()
            if asset.is_relative_to(ROOT) and asset.is_file():
                route.fulfill(status=200, content_type=mimetypes.guess_type(asset.name)[0] or "application/octet-stream",
                              body=asset.read_bytes())
            else:
                self.local_failures.append(request.url)
                route.fulfill(status=404, body="Missing local asset")
        elif url.hostname == "kontakt-form.small-grass-e8fa.workers.dev":
            self.requests.append(json.loads(request.post_data))
            if self.form_abort:
                route.abort("timedout")
            else:
                route.fulfill(status=self.form_status, content_type="application/json", body="{}")
        else:
            # GTM/CMP requests never leave the test process.
            route.fulfill(status=200, content_type="application/javascript", body="")

    def goto(self, path):
        self.page.goto(self.base + path)
        self.page.wait_for_function("document.documentElement.hasAttribute('data-ui-ready')")

    def test_static_http_delivery(self):
        files = sorted(p for p in ROOT.rglob("*.html")
                       if not any(part.startswith(".") or part in {"node_modules", "tests"}
                                  for part in p.relative_to(ROOT).parts))
        files += [ROOT / "css/style.css", ROOT / "js/main.js"]
        transport_retries = 0
        for path in files:
            with self.subTest(path=path.relative_to(ROOT).as_posix()):
                for attempt in range(3):
                    try:
                        with urlopen(self.base + "/" + path.relative_to(ROOT).as_posix(), timeout=5) as response:
                            self.assertEqual(200, response.status)
                            self.assertEqual(path.read_bytes(), response.read())
                        break
                    except (TimeoutError, ConnectionError, http.client.IncompleteRead):
                        if attempt == 2:
                            raise
                        transport_retries += 1
        print(f"HTTP: {len(files)} exact file responses; {transport_retries} transient transport retries")

    def test_all_pages_responsive_and_no_animations(self):
        files = sorted(p for p in ROOT.rglob("*.html")
                       if not any(part.startswith(".") or part in {"node_modules", "tests"}
                                  for part in p.relative_to(ROOT).parts))
        sizes = [(320, 740), (768, 1024), (1024, 768), (1440, 900), (2560, 1440), (812, 375)]
        for width, height in sizes:
            self.page.set_viewport_size({"width": width, "height": height})
            for path in files:
                url = "/" + path.relative_to(ROOT).as_posix()
                with self.subTest(path=url, viewport=(width, height)):
                    self.goto(url)
                    # Finish lazy image requests before the next navigation;
                    # otherwise rapid test navigation can cancel them mid-read.
                    self.page.evaluate("document.querySelectorAll('img').forEach(img => img.loading = 'eager')")
                    self.page.wait_for_function("[...document.images].every(img => img.complete)")
                    broken = self.page.evaluate("[...document.images].filter(img => !img.naturalWidth).map(img => img.src)")
                    self.assertEqual([], broken)
                    self.assertEqual(1, self.page.locator("main").count())
                    self.assertEqual(1, self.page.locator("h1").count())
                    state = self.page.evaluate("""() => ({
                      overflow: document.documentElement.scrollWidth - innerWidth,
                      animations: document.getAnimations().length,
                      animated: [...document.querySelectorAll('body *')].filter(el => {
                        const s = getComputedStyle(el);
                        return s.animationName !== 'none' || s.transitionDuration.split(',').some(v => parseFloat(v) > 0);
                      }).map(el => el.tagName + '.' + el.className),
                      invisibleReveals: [...document.querySelectorAll('.reveal, [data-intro]')].filter(el => {
                        const s = getComputedStyle(el);
                        return s.opacity === '0' || s.visibility === 'hidden';
                      }).length
                    })""")
                    self.assertLessEqual(state["overflow"], 1)
                    self.assertEqual(0, state["animations"])
                    self.assertEqual([], state["animated"])
                    self.assertEqual(0, state["invisibleReveals"])
        print(f"Validated {len(files)} pages at {len(sizes)} viewport sizes")

    def test_navigation_keyboard_and_resize(self):
        for path in ["/", "/en/"]:
            with self.subTest(path=path):
                self.goto(path)
                lang = self.page.locator("#langBtn")
                menu = self.page.locator("#langDropdown")
                self.assertFalse(menu.is_visible())
                lang.focus()
                self.page.keyboard.press("Enter")
                self.assertTrue(menu.is_visible())
                self.page.keyboard.press("Tab")
                self.assertTrue(self.page.evaluate("document.querySelector('#langDropdown').contains(document.activeElement)"))
                self.page.keyboard.press("Escape")
                self.assertFalse(menu.is_visible())
                self.assertTrue(menu.evaluate("el => el.inert"))
                self.assertTrue(lang.evaluate("el => el === document.activeElement"))
                lang.click()
                self.page.locator("h1").click()
                self.assertFalse(menu.is_visible())

                blog = self.page.locator(".nav-dropdown > details > summary")
                blog.focus()
                self.page.keyboard.press("Enter")
                self.assertTrue(self.page.locator(".nav-drop-menu").is_visible())

                self.page.set_viewport_size({"width": 390, "height": 844})
                burger = self.page.locator("#burger")
                drawer = self.page.locator("#drawer")
                self.assertTrue(burger.is_visible())
                self.assertFalse(self.page.locator(".nav-links").is_visible())
                burger.click()
                self.assertTrue(drawer.is_visible())
                self.assertEqual("true", burger.get_attribute("aria-expanded"))
                self.assertTrue(drawer.evaluate("el => el.contains(document.activeElement)"))
                self.page.keyboard.press("Escape")
                self.assertFalse(drawer.is_visible())
                self.assertTrue(burger.evaluate("el => el === document.activeElement"))
                burger.click()
                self.page.set_viewport_size({"width": 1280, "height": 900})
                self.assertFalse(drawer.is_visible())
                self.assertFalse(burger.is_visible())
                self.assertNotEqual("hidden", self.page.evaluate("getComputedStyle(document.body).overflow"))
                self.page.locator(".skip-link").focus()
                self.page.keyboard.press("Enter")
                self.assertEqual("#main-content", urlsplit(self.page.url).fragment and "#" + urlsplit(self.page.url).fragment)
                self.assertEqual("main-content", self.page.evaluate("document.activeElement.id"))
                self.page.locator(".footer-cookie-btn").click()

    def test_faq_and_case_details(self):
        for path in ["/leistungen/", "/en/services/"]:
            self.goto(path)
            questions = self.page.locator(".faq-q")
            answers = self.page.locator(".faq-a")
            self.assertFalse(answers.first.is_visible())
            questions.first.focus()
            self.page.keyboard.press("Enter")
            self.assertTrue(answers.first.is_visible())
            self.assertEqual("true", questions.first.get_attribute("aria-expanded"))
            questions.nth(1).click()
            self.assertFalse(answers.first.is_visible())
            self.assertTrue(answers.nth(1).is_visible())
            questions.nth(1).click()
            self.assertFalse(answers.nth(1).is_visible())
        for path in ["/projekte/", "/en/projects/"]:
            self.goto(path)
            cards = self.page.locator("details.case-card-collapsible")
            self.assertGreater(cards.count(), 0)
            self.assertTrue(cards.first.evaluate("el => el.open"))
            self.assertTrue(cards.first.locator("summary").is_visible())
            self.page.set_viewport_size({"width": 390, "height": 844})
            self.assertFalse(cards.first.evaluate("el => el.open"))
            cards.first.locator("summary").click()
            self.assertTrue(cards.first.evaluate("el => el.open"))
            self.page.set_viewport_size({"width": 1280, "height": 900})

    def fill_valid_form(self):
        self.page.locator("#name").fill("Local regression test")
        self.page.locator("#email").fill("test@example.invalid")
        self.page.locator("input[name=topic][value=website]").check()
        self.page.locator("#message").fill("Mocked local request; never sent externally.")
        self.page.locator("#privacy").check()

    def test_form_validation_addons_success_and_restore(self):
        for path in ["/kontakt/", "/en/contact/"]:
            with self.subTest(path=path):
                self.goto(path)
                self.assertFalse(self.page.locator("#formSuccess").is_visible())
                self.assertFalse(self.page.locator("#formErrorMsg").is_visible())
                self.page.locator("#submitBtn").click()
                for field in ["nameErr", "emailErr", "topicErr", "messageErr"]:
                    self.assertTrue(self.page.locator("#" + field).is_visible())
                self.assertEqual("name", self.page.evaluate("document.activeElement.id"))
                self.page.locator("input[name=topic][value=website]").check()
                self.assertTrue(self.page.locator("#addonBox").is_visible())
                self.page.locator("#addon_tracking").check()
                self.assertNotIn(self.page.locator("#addon_tracking_val").input_value(), ["Nein", "No"])
                for topic, panel in [("tracking", "addonBoxTracking"), ("betreuung", "addonBoxBetreuung")]:
                    self.page.locator(f"input[name=topic][value={topic}]").check()
                    self.assertTrue(self.page.locator("#" + panel).is_visible())
                self.page.locator("input[name=topic][value=other]").check()
                self.assertEqual(1, self.page.locator("input[name=topic]:checked").count())
                for panel in ["addonBox", "addonBoxTracking", "addonBoxBetreuung"]:
                    self.assertFalse(self.page.locator("#" + panel).is_visible())
                self.assertIn(self.page.locator("#addon_tracking_val").input_value(), ["Nein", "No"])
                self.fill_valid_form()
                self.page.locator("#submitBtn").click()
                self.page.locator("#formSuccess").wait_for(state="visible")
                self.assertFalse(self.page.locator("#formContent").is_visible())
                self.assertEqual("website", self.requests[-1]["topic"])
                self.assertEqual({"name", "email", "phone", "company", "topic", "message", "addon_tracking",
                                  "tracking_tier", "tracking_extensions", "addon_tier"}, set(self.requests[-1]))
                events = self.page.evaluate("window.dataLayer.filter(e => e.event === 'generate_lead')")
                self.assertEqual(1, len(events))
                self.assertEqual("Website build" if path.startswith("/en/") else "Website erstellen", events[0]["lead_topic"])
                self.page.evaluate("window.dispatchEvent(new PageTransitionEvent('pageshow', {persisted: true}))")
                self.assertTrue(self.page.locator("#formContent").is_visible())
                self.assertFalse(self.page.locator("#formSuccess").is_visible())
                self.assertTrue(self.page.locator("#submitBtn").is_enabled())

    def test_form_failure_retry_and_timeout(self):
        self.goto("/kontakt/")
        self.fill_valid_form()
        self.form_status = 503
        self.page.locator("#submitBtn").click()
        self.page.locator("#formErrorMsg").wait_for(state="visible")
        self.assertTrue(self.page.locator("#submitBtn").is_enabled())
        self.assertTrue(self.page.locator("#formContent").is_visible())
        self.assertEqual([], self.page.evaluate("window.dataLayer.filter(e => e.event === 'generate_lead')"))
        # Chromium logs the expected mocked HTTP error separately from JS errors.
        self.errors = [e for e in self.errors if "503" not in e]
        self.form_status = 200
        self.page.locator("#submitBtn").click()
        self.page.locator("#formSuccess").wait_for(state="visible")
        self.goto("/en/contact/")
        self.fill_valid_form()
        self.page.evaluate("""() => {
          window.fetch = (_, options) => new Promise((resolve, reject) => {
            options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
          });
        }""")
        self.page.clock.install()
        self.page.locator("#submitBtn").click()
        self.assertTrue(self.page.locator("#submitBtn").is_disabled())
        self.page.clock.fast_forward(20001)
        self.page.locator("#formErrorMsg").wait_for(state="visible")
        self.assertIn("too long", self.page.locator("#formErrorMsg").inner_text())
        self.assertTrue(self.page.locator("#submitBtn").is_enabled())

    def test_without_javascript_and_reduced_motion(self):
        no_js = self.browser.new_context(java_script_enabled=False, viewport={"width": 320, "height": 740})
        no_js.route("**/*", self.route)
        page = no_js.new_page()
        for path in ["/", "/en/", "/leistungen/", "/en/services/", "/kontakt/", "/en/contact/"]:
            page.goto(self.base + path)
            self.assertTrue(page.locator(".nav-links").is_visible())
            self.assertTrue(page.locator("#langDropdown").is_visible())
            self.assertFalse(page.locator("#burger").is_visible())
            for answer in page.locator(".faq-a").all():
                self.assertTrue(answer.is_visible())
            if page.locator("#submitBtn").count():
                self.assertTrue(page.locator("#submitBtn").is_disabled())
        no_js.close()
        self.page.emulate_media(reduced_motion="reduce")
        self.goto("/")
        self.assertEqual(0, self.page.evaluate("document.getAnimations().length"))
        self.page.emulate_media(reduced_motion="no-preference")
        self.assertEqual(0, self.page.evaluate("document.getAnimations().length"))


if __name__ == "__main__":
    unittest.main()
