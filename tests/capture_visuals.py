"""Capture the neutral baseline locally, with all external integrations mocked.

Run: python -B tests/capture_visuals.py
Uses the same development-only Playwright/Chromium setup as test_browser.py.
"""

import json

from test_browser import BrowserTests, ROOT


def main():
    output = ROOT / "docs" / "validation"
    output.mkdir(parents=True, exist_ok=True)
    report = []
    BrowserTests.setUpClass()
    try:
        for name, path, width, height in [
            ("home-desktop", "/", 1440, 1000),
            ("contact-mobile", "/kontakt/", 390, 844),
            ("article-tablet", "/blog/server-side-tracking/", 768, 1024),
        ]:
            case = BrowserTests()
            case.setUp()
            try:
                page = case.page
                page.set_viewport_size({"width": width, "height": height})
                case.goto(path)
                page.evaluate("document.querySelectorAll('img').forEach(img => img.loading = 'eager')")
                page.wait_for_function("[...document.images].every(img => img.complete)")
                broken = page.evaluate("[...document.images].filter(img => !img.naturalWidth).map(img => img.src)")
                assert not broken, broken
                page.screenshot(path=str(output / (name + ".png")))
                page.screenshot(path=str(output / (name + "-full.png")), full_page=True)
                support = page.evaluate("""() => {
                  const results = [];
                  function walk(rules) {
                    for (const rule of rules) {
                      if (rule.cssRules) walk(rule.cssRules);
                      if (rule.style) for (const property of rule.style) {
                        const value = rule.style.getPropertyValue(property);
                        results.push({property, value, supported: CSS.supports(property, value)});
                      }
                    }
                  }
                  for (const sheet of document.styleSheets) if (sheet.href) walk(sheet.cssRules);
                  return results;
                }""")
                metrics = page.evaluate("""() => ({
                  viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth,
                  animations: document.getAnimations().length,
                  oversizedIcons: [...document.querySelectorAll('svg')].filter(el => {
                    const r = el.getBoundingClientRect(); return r.width > 100 || r.height > 100;
                  }).map(el => el.getAttribute('class')),
                  overflowingControls: [...document.querySelectorAll('input:not([type=hidden]), textarea, select, button')].filter(el => {
                    const r = el.getBoundingClientRect(); return r.width && (r.right > innerWidth || r.left < 0);
                  }).map(el => el.id),
                  decodedImages: [...document.images].filter(img => img.naturalWidth > 0).length
                })""")
                report.append({"page": path, "name": name, "size": [width, height],
                               "browser": case.browser.version, "metrics": metrics,
                               "css_supports": support, "unsupported_css": [v for v in support if not v["supported"]],
                               "pageerrors": case.errors, "external_requests": "mocked; own production assets served locally"})
            finally:
                case.tearDown()
    finally:
        BrowserTests.tearDownClass()
    (output / "visual-qa.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps([{key: row[key] for key in ["name", "metrics", "unsupported_css", "pageerrors"]} for row in report], indent=2))


if __name__ == "__main__":
    main()
