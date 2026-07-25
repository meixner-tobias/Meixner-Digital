/* main.js
 * Globale Website-Logik für alle Seiten.
 * Diese Datei ersetzt wiederholte Inline-Skripte in allen HTML-Dateien.
 */

(function () {
  "use strict";

  if (
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    var cookieScript = document.createElement("script");
    cookieScript.type = "text/javascript";
    cookieScript.charset = "UTF-8";
    cookieScript.src =
      "//cdn.cookie-script.com/s/d261fb8134670358b6795a49b5d04574.js";
    document.head.appendChild(cookieScript);
  }

  /* ═══════════════════════════════════════════════════
     Helferfunktionen
  ═══════════════════════════════════════════════════ */
  function safeQuery(selector) {
    return document.querySelector(selector);
  }

  function safeQueryAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function onDocumentReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initThemeToggle() {
    var themeToggle = document.getElementById("themeToggle");
    var themeToggleMobile = document.getElementById("themeToggleMobile");
    var savedTheme = localStorage.getItem("theme");

    function updateThemeLabel() {
      var isDark =
        document.documentElement.getAttribute("data-theme") === "dark";
      safeQueryAll(".theme-label").forEach(function (el) {
        el.textContent = isDark ? "Light Mode" : "Dark Mode";
      });
      var ariaLabel = isDark
        ? "Helles Design aktivieren"
        : "Dunkles Design aktivieren";
      [themeToggle, themeToggleMobile].forEach(function (btn) {
        if (btn) {
          btn.setAttribute("aria-label", ariaLabel);
          btn.setAttribute("aria-pressed", String(isDark));
        }
      });
    }

    function setDarkTheme() {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    }

    function setLightTheme() {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }

    function toggleTheme() {
      var isDark =
        document.documentElement.getAttribute("data-theme") === "dark";
      if (isDark) {
        setLightTheme();
      } else {
        setDarkTheme();
      }
      updateThemeLabel();
    }

    if (savedTheme === "dark") {
      setDarkTheme();
    }

    updateThemeLabel();

    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme);
    }

    if (themeToggleMobile) {
      themeToggleMobile.addEventListener("click", toggleTheme);
    }
  }

  function initNavbarScroll() {
    var nav = document.getElementById("nav");
    if (!nav) {
      return;
    }
    var isScrolled = false;
    function sync() {
      var shouldBe = window.scrollY > 12;
      if (shouldBe !== isScrolled) {
        isScrolled = shouldBe;
        nav.classList.toggle("scrolled", shouldBe);
      }
    }
    sync();
    window.addEventListener("scroll", sync, { passive: true });
  }

  function initDrawer() {
    var burger = document.getElementById("burger");
    var drawer = document.getElementById("drawer");
    if (!burger || !drawer) {
      return;
    }

    // Start in closed/inert state — guarantees no focus leak even
    // if the HTML attribute was forgotten on a given page.
    drawer.setAttribute("inert", "");

    function closeDrawer() {
      var wasOpen = drawer.classList.contains("is-open");
      drawer.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      drawer.setAttribute("inert", "");
      document.body.style.overflow = "";
      if (window.__lenis && wasOpen) window.__lenis.start();
      if (wasOpen) {
        burger.focus();
      }
    }

    burger.addEventListener("click", function () {
      var open = !drawer.classList.contains("is-open");
      drawer.classList.toggle("is-open", open);
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
      if (window.__lenis) {
        open ? window.__lenis.stop() : window.__lenis.start();
      }
      if (open) {
        drawer.removeAttribute("inert");
        var firstLink = drawer.querySelector("a");
        if (firstLink) {
          firstLink.focus();
        }
      } else {
        drawer.setAttribute("inert", "");
        burger.focus();
      }
    });

    safeQueryAll("#drawer a").forEach(function (a) {
      a.addEventListener("click", closeDrawer);
    });

    document.addEventListener("click", function (event) {
      if (!drawer.contains(event.target) && !burger.contains(event.target)) {
        closeDrawer();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && drawer.classList.contains("is-open")) {
        closeDrawer();
      }
    });

    // Defensive: if user resizes from mobile to desktop while drawer
    // is open, force-close it. Prevents stuck-open state when CSS
    // hides the drawer but JS state still says "open".
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (window.innerWidth >= 769 && drawer.classList.contains("is-open")) {
          closeDrawer();
        }
      }, 150);
    });
  }

  function initLanguageSwitcher() {
    var langBtn = document.getElementById("langBtn");
    var langDropdown = document.getElementById("langDropdown");
    if (!langBtn || !langDropdown) {
      return;
    }

    // Start in inert/closed state — matches the initial HTML attribute
    // and guarantees no focus leak even if HTML attr was forgotten.
    langDropdown.setAttribute("inert", "");

    langBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      var willOpen = !langDropdown.classList.contains("is-open");
      langDropdown.classList.toggle("is-open", willOpen);
      langBtn.classList.toggle("is-open", willOpen);
      langBtn.setAttribute("aria-expanded", String(willOpen));
      if (willOpen) {
        langDropdown.removeAttribute("inert");
      } else {
        langDropdown.setAttribute("inert", "");
      }
    });

    document.addEventListener("click", function (event) {
      if (langDropdown.contains(event.target) || langBtn.contains(event.target)) {
        return;
      }
      langDropdown.classList.remove("is-open");
      langBtn.classList.remove("is-open");
      langBtn.setAttribute("aria-expanded", "false");
      langDropdown.setAttribute("inert", "");
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && langDropdown.classList.contains("is-open")) {
        langDropdown.classList.remove("is-open");
        langBtn.classList.remove("is-open");
        langBtn.setAttribute("aria-expanded", "false");
        langBtn.focus();
      }
    });
  }

  /* ═══════════════════════════════════════════════════
     Case-card accordion state — <details> elements on /projekte/
     should be closed on mobile (accordion) and open on desktop
     (full expanded case-study layout).
     CSS-only "force open on desktop" fails in some browsers because
     the details content is hidden via shadow DOM, so we explicitly
     set the [open] attribute per viewport.
  ═══════════════════════════════════════════════════ */
  function initCaseAccordion() {
    var cards = safeQueryAll("details.case-card-collapsible");
    if (!cards.length) return;
    var mql = window.matchMedia("(min-width: 769px)");
    function sync() {
      var desktop = mql.matches;
      cards.forEach(function (d) { d.open = desktop; });
    }
    sync();
    if (mql.addEventListener) mql.addEventListener("change", sync);
    else if (mql.addListener) mql.addListener(sync);           // Safari <14
    // When user toggles a case (mobile), page height changes below —
    // ScrollTriggers cached at init would fire at stale positions.
    cards.forEach(function (d) {
      d.addEventListener("toggle", function () {
        setTimeout(function () {
          if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        }, 300);
      });
    });
  }

  /* ═══════════════════════════════════════════════════
     Scroll-triggered highlight for cards
     Adds .in-view once a card is nicely settled inside the viewport
     so the visitor actually WATCHES the highlight transition instead
     of a snap. Fires ONCE per card (unobserve after first trigger)
     so the highlight persists as "reveal-and-stay" — no flashing
     on/off when scrolling past-and-back.
     Trigger geometry: threshold 0.45 = card must be ~45 percent inside
     the viewport; rootMargin -15 percent bottom = the effective bottom
     of the viewport sits 15 percent up from the actual bottom, so the
     card has to be well past the fold before firing.
     Runs on EVERY viewport; CSS gates the visual effect to mobile via
     @media (max-width: 768px) — desktop keeps its :hover states.
  ═══════════════════════════════════════════════════ */
  /* ═══════════════════════════════════════════════════
     Stage A — Lenis + GSAP + ScrollTrigger Enhancements
     -----
     Vendored under /js/vendor/. Each helper below early-returns
     if its required global is missing, so the site still works
     with just the base IntersectionObserver reveals if any
     script gets blocked by a network hiccup or extension.
  ═══════════════════════════════════════════════════ */

  var gsapReady   = typeof window.gsap !== "undefined";
  var stReady     = gsapReady && typeof window.ScrollTrigger !== "undefined";
  var lenisReady  = typeof window.Lenis !== "undefined";
  var reduceMotionMQL = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduceMotion = reduceMotionMQL.matches;

  // Mid-session flip to reduce-motion: tear down all active animations.
  // Flip back requires a page reload (re-init is complex, edge case).
  function handleReduceMotionChange(e) {
    if (!e.matches) return;
    reduceMotion = true;
    try {
      if (window.__lenis && window.__lenis.destroy) window.__lenis.destroy();
      if (stReady) window.ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
      var sig = document.getElementById("signal-line");
      if (sig) sig.remove();
      if (window.__heroRafId) cancelAnimationFrame(window.__heroRafId);
    } catch (err) { /* best-effort teardown */ }
  }
  if (reduceMotionMQL.addEventListener) {
    reduceMotionMQL.addEventListener("change", handleReduceMotionChange);
  } else if (reduceMotionMQL.addListener) {
    reduceMotionMQL.addListener(handleReduceMotionChange); // Safari <14
  }

  // Walk DOM, replace text nodes with .char spans, preserve inline elements + <br>
  var SVG_NS = "http://www.w3.org/2000/svg";
  var MATHML_NS = "http://www.w3.org/1998/Math/MathML";
  function splitChars(el) {
    if (!el || el.dataset.split === "done") return safeQueryAll(".char", el);
    el.dataset.split = "done";
    var chars = [];
    function walk(node) {
      if (node.nodeType === 3) { // TEXT_NODE
        var frag = document.createDocumentFragment();
        var txt = node.textContent;
        for (var i = 0; i < txt.length; i++) {
          var ch = txt[i];
          var span = document.createElement("span");
          span.className = "char";
          span.setAttribute("aria-hidden", "true");
          span.innerHTML = ch === " " ? "&nbsp;" : ch;
          frag.appendChild(span);
          chars.push(span);
        }
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.tagName !== "BR") {
        // Skip descent into SVG/MathML — HTML spans in those namespaces
        // corrupt render + break <title>/<text> a11y.
        if (node.namespaceURI === SVG_NS || node.namespaceURI === MATHML_NS) return;
        Array.prototype.slice.call(node.childNodes).forEach(walk);
      }
    }
    var accessibleLabel = el.textContent;
    Array.prototype.slice.call(el.childNodes).forEach(walk);
    el.setAttribute("aria-label", accessibleLabel);
    return chars;
  }

  // Word-split preserving inline elements (<strong>, <em>, etc.) — walks DOM
  function splitWords(el) {
    if (!el || el.dataset.split === "done") return safeQueryAll(".word", el);
    el.dataset.split = "done";
    var words = [];
    function walk(node) {
      if (node.nodeType === 3) {
        var parts = node.textContent.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        parts.forEach(function (p) {
          if (/^\s+$/.test(p)) {
            frag.appendChild(document.createTextNode(p));
          } else if (p.length) {
            var span = document.createElement("span");
            span.className = "word";
            span.setAttribute("aria-hidden", "true");
            span.textContent = p;
            frag.appendChild(span);
            words.push(span);
          }
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.tagName !== "BR") {
        Array.prototype.slice.call(node.childNodes).forEach(walk);
      }
    }
    var accessibleLabel = el.textContent.trim();
    Array.prototype.slice.call(el.childNodes).forEach(walk);
    el.setAttribute("aria-label", accessibleLabel);
    return words;
  }

  // 1. Lenis smooth scroll — wheel/keyboard only, keep native on touch
  var lenis = null;
  function initSmoothScroll() {
    if (!lenisReady || reduceMotion) return;
    // Kill CSS scroll-behavior:smooth so it doesn't double up with Lenis's
    // own smoothing (would cause jerky/laggy scrolling on anchor jumps).
    document.documentElement.style.scrollBehavior = "auto";
    lenis = new window.Lenis({
      duration: 1.05,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      smoothTouch: false, // iOS momentum > Lenis touch
    });
    window.__lenis = lenis; // expose so drawer/other UI can stop/start it
    if (stReady) lenis.on("scroll", window.ScrollTrigger.update);
    if (gsapReady) {
      window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    }
    // Route anchor clicks through Lenis (fixed nav offset)
    safeQueryAll('a[href^="#"]').forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href || href === "#" || href.length < 2) return;
      link.addEventListener("click", function (e) {
        // getElementById tolerates any id string (querySelector throws on
        // hashes like #123abc, #a.b that aren't valid CSS selectors).
        var target = document.getElementById(href.slice(1));
        if (!target) return;
        e.preventDefault();
        // Recompute nav-h each click — --nav-h flips at tablet breakpoint
        var navEl = document.getElementById("nav");
        var navH = navEl ? navEl.getBoundingClientRect().height : 68;
        lenis.scrollTo(target, { offset: -navH - 12 });
        // Transfer keyboard/AT focus so skip-link + TOC anchors actually
        // move focus to the target — Lenis-only scroll wouldn't.
        if (!target.hasAttribute("tabindex")) {
          target.setAttribute("tabindex", "-1");
        }
        target.focus({ preventScroll: true });
      });
    });
  }

  // 2. Hero intro — [data-intro] char stagger reveal
  function initHeroIntro() {
    if (!gsapReady) return;
    var introEls = safeQueryAll("[data-intro]");
    if (!introEls.length) return;
    // VoiceOver hardening: set aria-label on the closest heading *before*
    // splitChars mutates the DOM. Ensures the H1's accessible name is
    // computed from a single explicit label rather than aggregated from
    // aria-label attributes on generic spans (WebKit is inconsistent).
    var headingsSet = new Set ? new Set() : { _s: [], has: function (v) { return this._s.indexOf(v) >= 0; }, add: function (v) { this._s.push(v); } };
    introEls.forEach(function (el) {
      var heading = el.closest && el.closest("h1, h2, h3, h4, h5, h6");
      if (heading && !heading.hasAttribute("aria-label") && !headingsSet.has(heading)) {
        headingsSet.add(heading);
        heading.setAttribute("aria-label", heading.textContent.trim().replace(/\s+/g, " "));
      }
    });
    // reduce-motion: still split so screen readers get aria-label, but skip anim
    if (reduceMotion) {
      introEls.forEach(splitChars);
      return;
    }
    var allChars = [];
    introEls.forEach(function (el) {
      allChars.push.apply(allChars, splitChars(el));
    });
    if (!allChars.length) return;
    window.gsap.set(allChars, { yPercent: 110 });
    window.gsap.to(allChars, {
      yPercent: 0,
      duration: 0.95,
      stagger: 0.028,
      ease: "power4.out",
      delay: 0.12,
    });
  }

  // 3. Section titles / labels / descriptions — fade-up on scroll
  function initSectionReveals() {
    if (!stReady || reduceMotion) return;
    safeQueryAll(".sec-title, .sec-label, .sec-desc, .article-title, .page-hero__desc").forEach(function (el) {
      if (el.hasAttribute("data-intro") || el.closest("[data-intro]")) return;
      // Skip elements already handled by .reveal IntersectionObserver system
      if (el.classList.contains("reveal")) return;
      window.gsap.from(el, {
        y: 32, opacity: 0, duration: 0.85, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });
  }

  // 4. Magnetic buttons — cursor pulls element toward it
  function initMagnetic() {
    if (!gsapReady || reduceMotion || !window.matchMedia("(hover: hover)").matches) return;
    // Implicit selectors: primary CTAs get magnetism without needing per-page markup.
    // Explicit opt-in via [data-magnetic] still works and can override strength.
    var selectors = [
      "[data-magnetic]",
      ".nav-cta",
      ".hero-btns .btn-primary",
      "#submitBtn",
      ".cta-box .btn",
    ].join(", ");
    safeQueryAll(selectors).forEach(function (el) {
      var strength = parseFloat(el.dataset.magnetic) || 0.24;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * strength;
        var y = (e.clientY - r.top - r.height / 2) * strength;
        window.gsap.to(el, { x: x, y: y, duration: 0.4, ease: "power3.out" });
      });
      el.addEventListener("mouseleave", function () {
        window.gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  // 5. Counter animations — [data-count="100"] counts up 0 → 100 on enter
  function initCounters() {
    if (!stReady) return;
    safeQueryAll("[data-count]").forEach(function (el) {
      var target = parseFloat(el.dataset.count);
      if (isNaN(target)) return;
      var suffix = el.dataset.countSuffix || "";
      var prefix = el.dataset.countPrefix || "";
      // reduce-motion: normalize to target immediately, no animation
      if (reduceMotion) {
        el.textContent = prefix + target + suffix;
        return;
      }
      var obj = { v: 0 };
      // NOTE: do NOT overwrite HTML value at init — that flashes "0" before the
      // ScrollTrigger fires. Wait for onEnter, then set to 0 + animate up.
      window.ScrollTrigger.create({
        trigger: el, start: "top 92%", once: true,
        onEnter: function () {
          el.textContent = prefix + "0" + suffix;
          window.gsap.to(obj, {
            v: target, duration: 1.6, ease: "power2.out",
            onUpdate: function () { el.textContent = prefix + Math.round(obj.v) + suffix; },
          });
        },
      });
    });
  }

  // 6. Hero parallax — H1 slight yPercent + opacity dip; blobs drift
  function initHeroParallax() {
    if (!stReady || reduceMotion) return;
    var hero = document.querySelector(".hero");
    if (!hero) return;
    var h1 = hero.querySelector(".hero-h1, h1");
    if (h1) {
      window.gsap.to(h1, {
        yPercent: -8, opacity: 0.65, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.5 },
      });
    }
    hero.querySelectorAll(".blob").forEach(function (b, i) {
      window.gsap.to(b, {
        yPercent: 25 + i * 12,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      });
    });
  }

  // 7. Pinned word-reveal — words darken as user scrolls through [data-pin-reveal]
  function initPinnedWordReveal() {
    if (!stReady || reduceMotion) return;
    safeQueryAll("[data-pin-reveal]").forEach(function (el) {
      var words = splitWords(el);
      if (!words.length) return;
      window.gsap.set(words, { opacity: 0.22 });
      window.gsap.to(words, {
        opacity: 1, stagger: 0.05, ease: "none",
        scrollTrigger: { trigger: el, start: "top 75%", end: "bottom 45%", scrub: 0.5 },
      });
    });
  }

  // 8. Case-card clip-path reveals
  function initCaseReveals() {
    if (!stReady || reduceMotion) return;
    safeQueryAll("[data-case-reveal]").forEach(function (el) {
      window.gsap.fromTo(el,
        { clipPath: "inset(0 0 100% 0)" },
        {
          clipPath: "inset(0 0 0% 0)",
          duration: 1.1, ease: "power4.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        }
      );
    });
  }

  /* ═══════════════════════════════════════════════════
     Stage C — Per-Page Signature Effects
     Universal 3D tilt-on-hover on all card types + specific
     signature effects per page (process-steps count-in with
     line-draw on /leistungen/, big counter-motion numbers on
     /projekte/ case-cards, personal-img parallax on /ueber-mich/,
     hobby-pill scale-in reveal, small 3D wireframe canvas on
     /kontakt/, floating idle animation on hero decorative elements).
     Skip on blog articles/listings — user preference.
  ═══════════════════════════════════════════════════ */

  // 9. Floating idle animation — subtle bob for decorative elements
  // Animates a CSS custom property (--float-y) instead of the transform
  // directly, so elements with existing CSS transforms (e.g. the BikeCare
  // mockups: translateX(-45%) rotate(-6deg)) can compose the float into
  // their own transform via translateY(var(--float-y)). Elements without
  // a custom transform get the default rule from CSS.
  function initFloating() {
    if (!gsapReady || reduceMotion) return;
    safeQueryAll("[data-float]").forEach(function (el, i) {
      var amp = parseFloat(el.dataset.float) || 6;      // px amplitude
      var dur = parseFloat(el.dataset.floatDur) || 3.2;  // seconds
      window.gsap.to(el, {
        "--float-y": (-amp) + "px",
        duration: dur,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: i * 0.15,  // desync when multiple floats near each other
      });
    });
  }

  // 10. Parallax elements — [data-parallax-y="-10"] drifts by yPercent
  function initParallaxElements() {
    if (!stReady || reduceMotion) return;
    safeQueryAll("[data-parallax-y]").forEach(function (el) {
      var amt = parseFloat(el.dataset.parallaxY);
      if (isNaN(amt)) return;
      window.gsap.to(el, {
        yPercent: amt,
        ease: "none",
        scrollTrigger: {
          trigger: el.closest("section") || el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });
  }

  // 11. Process steps — count-in for numbered circles + line draw across grid
  // Targets .process-step-num with numeric text (01, 02, 03, ...). Count from 0.
  function initProcessStepsReveal() {
    if (!stReady) return;
    var stepNums = safeQueryAll(".process-step-num");
    if (!stepNums.length) return;
    var processGrid = document.querySelector(".process-grid");
    if (!processGrid) return;

    if (reduceMotion) return; // steps already show final value in HTML

    // Count-up per step, staggered as grid enters viewport
    var stepData = stepNums.map(function (el) {
      var raw = el.textContent.trim();
      var target = parseInt(raw, 10);
      return { el: el, target: isNaN(target) ? null : target, pad: raw.length };
    }).filter(function (s) { return s.target !== null; });

    if (!stepData.length) return;

    // Start state: show "00" (padded)
    stepData.forEach(function (s) {
      s.el.textContent = String(0).padStart(s.pad, "0");
    });

    window.ScrollTrigger.create({
      trigger: processGrid, start: "top 80%", once: true,
      onEnter: function () {
        stepData.forEach(function (s, i) {
          var obj = { v: 0 };
          window.gsap.to(obj, {
            v: s.target, duration: 0.9,
            delay: i * 0.15,
            ease: "power2.out",
            onUpdate: function () {
              s.el.textContent = String(Math.round(obj.v)).padStart(s.pad, "0");
            },
          });
        });
      },
    });
  }

  // 12. Case-card counter-motion — inject big translucent numbers behind
  // each .case-card that scroll OPPOSITE the page (elzn's gegenläufige Nummer).
  function initCaseCounterMotion() {
    if (!stReady || reduceMotion) return;
    var cases = safeQueryAll("details.case-card-collapsible, .case-card");
    if (!cases.length) return;
    cases.forEach(function (card, i) {
      if (card.querySelector(".case-card-num-bg")) return; // idempotent
      var num = document.createElement("span");
      num.className = "case-card-num-bg";
      num.setAttribute("aria-hidden", "true");
      num.textContent = "0" + (i + 1);
      card.appendChild(num);
      window.gsap.fromTo(num,
        { yPercent: 60 },
        {
          yPercent: -60, ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom", end: "bottom top",
            scrub: true,
          },
        }
      );
    });
  }

  // 13. Hobby-pill reveal — scale + fade in with stagger when hobby-list enters
  function initHobbyPillReveal() {
    if (!stReady || reduceMotion) return;
    var lists = safeQueryAll(".hobby-list");
    if (!lists.length) return;
    lists.forEach(function (list) {
      var pills = safeQueryAll(".hobby-pill", list);
      if (!pills.length) return;
      window.gsap.from(pills, {
        opacity: 0, scale: 0.7, y: 12,
        duration: 0.55,
        stagger: 0.05,
        ease: "back.out(1.8)",
        scrollTrigger: { trigger: list, start: "top 88%", once: true },
      });
    });
  }

  // 14. Contact canvas — small 3D wireframe icosahedron behind contact-form.
  // Reuses the /js/vendor/three.min.js already loaded for the home hero (if not
  // yet loaded, lazily loads it). Semi-transparent, non-interactive, pauses off-screen.
  function initContactCanvas() {
    if (reduceMotion) return;
    var canvas = document.getElementById("contact-canvas");
    if (!canvas) return;

    function boot() {
      if (typeof THREE === "undefined") return;
      var host = canvas.parentElement;
      var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      camera.position.z = 6;
      function resize() {
        var w = host.offsetWidth, h = host.offsetHeight;
        if (!w || !h) return;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      resize();
      var resizeObs = new ResizeObserver(resize);
      resizeObs.observe(host);

      // Two subtle wireframes drifting in the background
      var ico = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2.2, 1),
        new THREE.MeshBasicMaterial({ color: 0x0284c7, wireframe: true, transparent: true, opacity: 0.16 })
      );
      ico.position.set(1.3, 0.4, 0);
      scene.add(ico);
      var tor = new THREE.Mesh(
        new THREE.TorusGeometry(1.2, 0.28, 12, 40),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.12 })
      );
      tor.position.set(-1.8, -0.8, -0.3);
      scene.add(tor);

      // Pause when off-screen
      var isVisible = true;
      if (typeof IntersectionObserver !== "undefined") {
        var visObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { isVisible = e.isIntersecting; });
        }, { rootMargin: "100px" });
        visObs.observe(host);
      }

      var time = 0, rafId = 0;
      function animate() {
        rafId = requestAnimationFrame(animate);
        if (!isVisible) return;
        time += 0.003;
        ico.rotation.y = time * 0.35;
        ico.rotation.x = time * 0.18;
        tor.rotation.z = time * 0.45;
        tor.rotation.y = time * 0.22;
        renderer.render(scene, camera);
      }
      animate();
      window.addEventListener("pagehide", function (e) {
        if (e && e.persisted) return;
        if (rafId) cancelAnimationFrame(rafId);
        if (visObs) visObs.disconnect();
        resizeObs.disconnect();
        renderer.dispose();
      });
    }

    if (typeof THREE !== "undefined") {
      boot();
    } else {
      var script = document.querySelector('script[src="/js/vendor/three.min.js"]');
      if (script) {
        // Home hero already loaded it or is loading it
        var poll = setInterval(function () {
          if (typeof THREE !== "undefined") { clearInterval(poll); boot(); }
        }, 100);
        setTimeout(function () { clearInterval(poll); }, 5000);
      } else {
        // Lazy load
        var s = document.createElement("script");
        s.src = "/js/vendor/three.min.js";
        s.onload = boot;
        s.onerror = function () { if (window.console) console.warn("three.js failed to load"); };
        document.head.appendChild(s);
      }
    }
  }

  function initCardScrollHighlight() {
    if (typeof IntersectionObserver === "undefined") return;
    var cards = safeQueryAll(
      ".proj-card, .pain-card, details.case-card-collapsible, .case-card, .why-freelance-card, .travel-card, .svc-card, .own-card, .about-hero-img, .personal-img-wrap, .cta-box"
    );
    if (!cards.length) return;
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            obs.unobserve(e.target);        // one-shot reveal
          }
        });
      },
      { threshold: 0.45, rootMargin: "0px 0px -15% 0px" }
    );
    cards.forEach(function (c) { obs.observe(c); });
  }

  function initRevealAnimations() {
    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0,
        // 200px vor Viewport-Eintritt triggern → Reveal ist fertig
        // bevor User das Element wirklich sieht (kein Scroll-Lag)
        rootMargin: "0px 0px 200px 0px",
      },
    );

    safeQueryAll(".reveal").forEach(function (element) {
      observer.observe(element);
    });
  }

  function initCardTilt() {
    if (window.matchMedia && window.matchMedia("(hover: none)").matches) return;
    if (reduceMotion) return;
    // Universal 3D tilt-on-hover — extended from .svc-card to all card types
    // that benefit from perspective feedback. Explicit [data-tilt] opt-in
    // gets an amplitude override.
    var selectors = [
      ".svc-card", ".proj-card", ".own-card", ".pain-card",
      ".why-freelance-card", ".travel-card", ".svc-detail-card",
      ".detail-card", ".teaser-card", "[data-tilt]",
    ].join(", ");
    safeQueryAll(selectors).forEach(function (card) {
      var amp = parseFloat(card.dataset.tilt) || 6; // rotation degrees max
      var lift = card.classList.contains("svc-card") ? 6 : 4; // px lift
      card.addEventListener("mousemove", function (event) {
        var rect = card.getBoundingClientRect();
        var dx = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        var dy = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        card.style.transform =
          "translateY(-" + lift + "px) perspective(800px) rotateX(" +
          (-dy * amp) + "deg) rotateY(" + (dx * amp) + "deg)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  function initFaqAccordion() {
    var faqButtons = safeQueryAll(".faq-q");
    if (faqButtons.length === 0) {
      return;
    }

    faqButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".faq-item");
        var isOpen = item.classList.contains("open");

        // Close all other open items (one-at-a-time accordion behavior)
        safeQueryAll(".faq-item.open").forEach(function (openItem) {
          openItem.classList.remove("open");
          var openBtn = openItem.querySelector(".faq-q");
          if (openBtn) {
            openBtn.setAttribute("aria-expanded", "false");
          }
        });

        // Toggle the clicked item
        if (!isOpen) {
          item.classList.add("open");
          btn.setAttribute("aria-expanded", "true");
        }
        // FAQ open/close changes page height — refresh ScrollTriggers below
        // after the CSS max-height transition finishes (see .faq-a rule).
        setTimeout(function () {
          if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        }, 500);
      });
    });
  }

  function initHeroCanvas() {
    var canvas = document.getElementById("hero-canvas");
    if (!canvas) {
      return;
    }

    var shouldLoadThree =
      window.innerWidth > 768 &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (navigator.connection) {
      shouldLoadThree =
        shouldLoadThree && navigator.connection.effectiveType === "4g";
    }

    if (!shouldLoadThree) {
      return;
    }

    var script = document.createElement("script");
    // Self-hosted three.js r128 — same-origin, immune to cdnjs outages, no extra DNS/TLS
    script.src = "/js/vendor/three.min.js";
    script.onerror = function () {
      if (window.console) console.warn("three.js failed to load");
    };
    script.onload = function () {
      if (typeof THREE === "undefined") {
        if (window.console) console.warn("three.js loaded but THREE undefined");
        return;
      }
      var hero = canvas.closest(".hero");
      if (!hero) {
        return;
      }

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
      camera.position.z = 5;
      var renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      function resizeCanvas() {
        var width = hero.offsetWidth;
        var height = hero.offsetHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }

      resizeCanvas();
      var resizeObs = new ResizeObserver(resizeCanvas);
      resizeObs.observe(hero);

      var count = 120;
      var positions = new Float32Array(count * 3);
      for (var i = 0; i < count * 3; i += 1) {
        positions[i] = (Math.random() - 0.5) * 14;
      }

      var particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );
      var particles = new THREE.Points(
        particleGeometry,
        new THREE.PointsMaterial({
          color: 0x6366f1,
          size: 0.045,
          transparent: true,
          opacity: 0.4,
          sizeAttenuation: true,
        }),
      );
      scene.add(particles);

      var ico = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2, 1),
        new THREE.MeshBasicMaterial({
          color: 0x6366f1,
          wireframe: true,
          transparent: true,
          opacity: 0.07,
        }),
      );
      ico.position.set(2.8, 0.4, -1.5);
      scene.add(ico);

      var tor = new THREE.Mesh(
        new THREE.TorusGeometry(0.9, 0.22, 12, 36),
        new THREE.MeshBasicMaterial({
          color: 0x6366f1,
          wireframe: true,
          transparent: true,
          opacity: 0.05,
        }),
      );
      tor.position.set(-3.2, -1.2, -0.5);
      scene.add(tor);

      // Stage B: scroll-driven rotation + mouse parallax on the whole scene
      var scrollP = 0;
      var mouseX = 0, mouseY = 0;
      var targetSceneRotY = 0, targetSceneRotX = 0;
      if (stReady) {
        window.ScrollTrigger.create({
          trigger: hero,
          start: "top top", end: "bottom top",
          onUpdate: function (self) { scrollP = self.progress; },
        });
      }
      // Named mousemove handler so pagehide teardown can remove it
      function onMouseMove(e) {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        targetSceneRotY = mouseX * 0.18;
        targetSceneRotX = mouseY * 0.10;
      }
      window.addEventListener("mousemove", onMouseMove);

      // Pause RAF when hero is off-screen — saves CPU/GPU on long articles
      var isVisible = true;
      if (typeof IntersectionObserver !== "undefined") {
        var visObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { isVisible = e.isIntersecting; });
        }, { rootMargin: "100px" });
        visObs.observe(hero);
      }

      var time = 0;
      var rafId = 0;
      function animate() {
        rafId = requestAnimationFrame(animate);
        window.__heroRafId = rafId; // expose for reduce-motion teardown
        if (!isVisible) return; // skip work when hero not visible
        time += 0.004;
        // Idle drift + scroll acceleration (scrollP: 0→1 over hero pass)
        particles.rotation.y = time * 0.1 + scrollP * 1.4;
        particles.rotation.x = time * 0.04;
        if (scene.children[1]) {
          scene.children[1].rotation.y = time * 0.22 + scrollP * 1.8;
          scene.children[1].rotation.x = time * 0.12;
        }
        if (scene.children[2]) {
          scene.children[2].rotation.z = time * 0.28 + scrollP * 2.1;
          scene.children[2].rotation.x = time * 0.09;
        }
        // Mouse parallax on the whole scene — eases toward target
        scene.rotation.y += (targetSceneRotY - scene.rotation.y) * 0.06;
        scene.rotation.x += (targetSceneRotX - scene.rotation.x) * 0.06;
        renderer.render(scene, camera);
      }
      animate();

      window.addEventListener("pagehide", function (e) {
        if (e && e.persisted) return; // Skip teardown on BFCache freeze so loop resumes on restore
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener("mousemove", onMouseMove);
        if (visObs) visObs.disconnect();
        if (resizeObs) resizeObs.disconnect();
        if (renderer && renderer.dispose) renderer.dispose();
      });
    };

    document.head.appendChild(script);
  }

  /* ═══════════════════════════════════════════════════
     Stage B — Signal Line (home only) + Auto-Fit Headlines
  ═══════════════════════════════════════════════════ */

  // Signal-line SVG that threads through home page sections, drawn as scroll
  // progresses, with a glowing dot at the current position. Only on pages
  // with a .hero (home DE + EN).
  var signalST = null;
  function buildSignalLine() {
    if (!stReady || reduceMotion) return;
    if (!document.querySelector(".hero")) return;
    var main = document.querySelector("main");
    if (!main) return;

    // Clean up prior instance (resize rebuild)
    var oldWrap = document.getElementById("signal-line");
    if (oldWrap) oldWrap.remove();
    if (signalST) { signalST.kill(); signalST = null; }

    // Anchor points: hero-right, then alternating left/right per major section
    var sections = Array.prototype.slice.call(main.children)
      .filter(function (el) { return el.offsetHeight > 200; });
    if (sections.length < 2) return;

    var w = window.innerWidth;
    var docH = document.documentElement.scrollHeight;
    var NS = "http://www.w3.org/2000/svg";

    var wrap = document.createElement("div");
    wrap.id = "signal-line";
    wrap.setAttribute("aria-hidden", "true");
    // z-index:1 puts signal-line above section backgrounds so it's visible
    // through the whole scroll — z:-1 hid it behind hero/pain/about
    // sections that have opaque backgrounds. Opacity 0.24 on the stroke
    // + pointer-events:none keeps it non-obtrusive; sits below nav (z:1000).
    wrap.style.cssText = "position:absolute;top:0;left:0;width:100%;height:" + docH + "px;pointer-events:none;z-index:1;";

    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + w + " " + docH);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.cssText = "position:absolute;top:0;left:0;overflow:visible;";

    // Anchor points relative to page (scrollY absolute)
    var pts = [[w * 0.88, window.innerHeight * 0.55]];
    sections.slice(1).forEach(function (sec, i) {
      var r = sec.getBoundingClientRect();
      var y = r.top + window.scrollY + r.height * 0.5;
      pts.push([i % 2 === 0 ? w * 0.08 : w * 0.92, y]);
    });
    pts.push([w * 0.5, docH - 80]);

    // Build cubic-bezier path with 50% vertical control offset for smooth S-curves
    var d = "M " + pts[0][0] + " " + pts[0][1];
    for (var i = 1; i < pts.length; i++) {
      var p0 = pts[i - 1], p1 = pts[i];
      var dy = (p1[1] - p0[1]) * 0.5;
      d += " C " + p0[0] + " " + (p0[1] + dy) + ", " + p1[0] + " " + (p1[1] - dy) + ", " + p1[0] + " " + p1[1];
    }

    var path = document.createElementNS(NS, "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "rgba(3, 105, 161, 0.24)"); // indigo-dark @ subtle
    path.setAttribute("stroke-width", "1");
    svg.appendChild(path);

    // Glowing dot at line tip — soft outer + hard inner
    var glow = document.createElementNS(NS, "circle");
    glow.setAttribute("r", "8");
    glow.setAttribute("fill", "rgba(56, 189, 248, 0.22)"); // sky-400 glow
    var dot = document.createElementNS(NS, "circle");
    dot.setAttribute("r", "3");
    dot.setAttribute("fill", "#38BDF8"); // sky-400 hard core
    svg.appendChild(glow);
    svg.appendChild(dot);

    wrap.appendChild(svg);
    document.body.appendChild(wrap);

    var len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;

    function place(p) {
      path.style.strokeDashoffset = len * (1 - p);
      var pt = path.getPointAtLength(len * p);
      glow.setAttribute("cx", pt.x);
      glow.setAttribute("cy", pt.y);
      dot.setAttribute("cx", pt.x);
      dot.setAttribute("cy", pt.y);
    }
    place(0);

    signalST = window.ScrollTrigger.create({
      start: 0, end: docH - window.innerHeight,
      onUpdate: function (self) { place(self.progress); },
    });
  }

  // Auto-fit — [data-fit] elements shrink font-size to fit their line width
  // Safety net for hero H1 + case titles on narrow viewports.
  function fitLines() {
    safeQueryAll("[data-fit]").forEach(function (line) {
      line.style.fontSize = "";
      var current = parseFloat(getComputedStyle(line).fontSize);
      var avail = line.clientWidth;
      var needed = line.scrollWidth;
      if (needed > avail && avail > 0) {
        line.style.fontSize = Math.floor(current * (avail / needed) * 0.97) + "px";
      }
    });
  }
  var fitTimer;
  window.addEventListener("resize", function () {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(function () {
      fitLines();
      if (stReady) window.ScrollTrigger.refresh();
      buildSignalLine();
    }, 200);
  });

  onDocumentReady(function () {
    // Stage A libs first — sets window.__lenis so drawer/other UI can sync
    if (stReady) window.gsap.registerPlugin(window.ScrollTrigger);
    initSmoothScroll();

    initThemeToggle();
    initNavbarScroll();
    initDrawer();
    initLanguageSwitcher();
    initRevealAnimations();
    initCardTilt();
    initFaqAccordion();
    initHeroCanvas();
    initAddonBox();
    initContactForm();
    initCaseAccordion();
    initCardScrollHighlight();

    // Stage A visual polish (order: intro first, then scroll-triggered)
    initHeroIntro();
    initSectionReveals();
    initMagnetic();
    initCounters();
    initHeroParallax();
    initPinnedWordReveal();
    initCaseReveals();

    // Stage C: per-page signature effects (skipped on blog per user)
    initFloating();
    initParallaxElements();
    initProcessStepsReveal();
    initCaseCounterMotion();
    initHobbyPillReveal();
    initContactCanvas();

    // Stage B: build signal-line after fonts + images settle
    fitLines();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        fitLines();
        if (stReady) window.ScrollTrigger.refresh();
        buildSignalLine();
      });
    }
    window.addEventListener("load", function () {
      if (stReady) window.ScrollTrigger.refresh();
      buildSignalLine();
    });
  });

  // Formular senden & Validierung
  function initAddonBox() {
    var topicBoxes = document.querySelectorAll('input[name="topic"]');
    var addonBox = document.getElementById("addonBox");
    var addonBoxTracking = document.getElementById("addonBoxTracking");
    var addonBoxBetreuung = document.getElementById("addonBoxBetreuung");
    var modulesVal = document.getElementById("addon_modules_val");
    var tierVal = document.getElementById("addon_tier_val");
    if (!topicBoxes.length) return;

    function getCheckedTopics() {
      var arr = [];
      topicBoxes.forEach(function (cb) {
        if (cb.checked) arr.push(cb.value);
      });
      return arr;
    }

    function updateAddonBox() {
      var topics = getCheckedTopics();
      if (addonBox)
        addonBox.style.display =
          topics.indexOf("website") !== -1 ? "block" : "none";
      if (addonBoxTracking)
        addonBoxTracking.style.display =
          topics.indexOf("tracking") !== -1 ? "block" : "none";
      if (addonBoxBetreuung)
        addonBoxBetreuung.style.display =
          topics.indexOf("betreuung") !== -1 ? "block" : "none";

      // Module zurücksetzen, wenn Tracking nicht (mehr) ausgewählt
      if (modulesVal && topics.indexOf("tracking") === -1) {
        modulesVal.value = "";
        document
          .querySelectorAll('input[name="module"]')
          .forEach(function (cb) {
            cb.checked = false;
          });
      }

      // Sorglos-Tier synchronisieren bzw. zurücksetzen
      if (tierVal) {
        if (topics.indexOf("betreuung") !== -1) {
          var checkedTier = document.querySelector(
            'input[name="tier"]:checked',
          );
          tierVal.value = checkedTier ? checkedTier.value : "unsure";
        } else {
          tierVal.value = "";
          var unsureRadio = document.querySelector(
            'input[name="tier"][value="unsure"]',
          );
          if (unsureRadio) unsureRadio.checked = true;
        }
      }

      // Tracking-Add-on (Website-Karte) zurücksetzen, wenn Website nicht (mehr) gewählt
      if (topics.indexOf("website") === -1) {
        var addonTrackingCb = document.getElementById("addon_tracking");
        var addonTrackingVal = document.getElementById("addon_tracking_val");
        if (addonTrackingCb) addonTrackingCb.checked = false;
        if (addonTrackingVal) addonTrackingVal.value = "Nein";
      }
    }

    // Module-Checkboxen synchron in Hidden-Field schreiben
    if (modulesVal) {
      var moduleBoxes = document.querySelectorAll('input[name="module"]');
      function updateModulesVal() {
        var checked = [];
        moduleBoxes.forEach(function (cb) {
          if (cb.checked) checked.push(cb.value);
        });
        modulesVal.value = checked.join(", ");
      }
      moduleBoxes.forEach(function (cb) {
        cb.addEventListener("change", updateModulesVal);
      });
    }

    // Sorglos-Tier-Radios synchron in Hidden-Field schreiben
    if (tierVal) {
      document.querySelectorAll('input[name="tier"]').forEach(function (r) {
        r.addEventListener("change", function () {
          if (this.checked) tierVal.value = this.value;
        });
      });
    }

    // Topic-Checkboxen: Mutual Exclusion für "other" + Update-Trigger
    topicBoxes.forEach(function (cb) {
      cb.addEventListener("change", function () {
        if (this.checked) {
          if (this.value === "other") {
            // "Noch unklar" alleine → andere unchecken
            topicBoxes.forEach(function (other) {
              if (other.value !== "other") other.checked = false;
            });
          } else {
            // Konkrete Leistung gewählt → "Noch unklar" unchecken
            var otherCb = document.querySelector(
              'input[name="topic"][value="other"]',
            );
            if (otherCb) otherCb.checked = false;
          }
        }
        updateAddonBox();
      });
    });

    window.addEventListener("pageshow", updateAddonBox);
    updateAddonBox();
  }

  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;

    var htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
    var isEN = htmlLang === "en" || htmlLang.indexOf("en-") === 0 || location.pathname.indexOf("/en/") === 0;
    var STRINGS = isEN
      ? { sending: "Sending …", submit: "Send message", error: "Something went wrong. Please try again.", timeout: "The request took too long. Please try again." }
      : { sending: "Wird gesendet …", submit: "Nachricht abschicken", error: "Etwas ist schiefgelaufen. Bitte versuche es erneut.", timeout: "Die Anfrage hat zu lange gedauert. Bitte versuche es erneut." };

    var submitBtn = document.getElementById("submitBtn");
    var formErrorMsg = document.getElementById("formErrorMsg");
    var submitBtnHTML = submitBtn ? submitBtn.innerHTML : ""; // Preserve inner SVG arrow across state changes

    function showErr(id) { var el = document.getElementById(id); if (el) el.style.display = "block"; }
    function hideErr(id) { var el = document.getElementById(id); if (el) el.style.display = "none"; }
    function getVal(id) { var el = document.getElementById(id); return el ? (el.value || "").trim() : ""; }
    function getRaw(id) { var el = document.getElementById(id); return el ? el.value : ""; }

    // Reset form display state on page show (handles bfcache restore
    // when user navigates back to /kontakt/ after successful submit).
    window.addEventListener("pageshow", function () {
      var fc = document.getElementById("formContent");
      var fs = document.getElementById("formSuccess");
      if (fc) fc.style.display = "";
      if (fs) fs.style.display = "";
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitBtnHTML;
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = document.getElementById("name");
      var email = document.getElementById("email");
      var message = document.getElementById("message");
      var privacy = document.getElementById("privacy");
      var topicBoxes = document.querySelectorAll('input[name="topic"]');

      ["nameErr", "emailErr", "topicErr", "messageErr"].forEach(hideErr);
      if (formErrorMsg) formErrorMsg.style.display = "none";

      var checkedTopics = [];
      topicBoxes.forEach(function (cb) {
        if (cb.checked) checkedTopics.push(cb.value);
      });

      var valid = true;
      if (!name || !name.value.trim())       { showErr("nameErr");    valid = false; }
      if (!email || !email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { showErr("emailErr"); valid = false; }
      if (checkedTopics.length === 0)        { showErr("topicErr");   valid = false; }
      if (!message || !message.value.trim()) { showErr("messageErr"); valid = false; }
      if (!privacy || !privacy.checked) {
        if (formErrorMsg) formErrorMsg.style.display = "block";
        valid = false;
      }
      if (!valid) return;

      var topicValue = checkedTopics.join(",");
      var companyValue = getVal("company");
      var phoneValue = getVal("phone");
      var addonValue = getRaw("addon_tracking_val");
      var tierValue = getRaw("addon_tier_val");

      var trackingTierEl = document.querySelector('input[name="tracking_tier"]:checked');
      var trackingTierValue = trackingTierEl ? trackingTierEl.value : "";
      var trackingTierShortValue = trackingTierValue ? trackingTierValue.split(" (")[0] : (isEN ? "Not sure yet" : "Noch unsicher");

      var extensionsValue = getVal("tracking_extensions");
      var extensionsTextFilled = extensionsValue.length > 0;

      var topicMap = isEN
        ? { tracking: "GTM & GA4 Setup", website: "Website build", betreuung: "Care package", other: "Not sure yet" }
        : { tracking: "GTM & GA4 Setup", website: "Website erstellen", betreuung: "Sorglos-Betreuung", other: "Noch unklar" };
      var topicLabel = checkedTopics.map(function (t) { return topicMap[t] || t; }).join(", ");

      if (submitBtn) {
        // Reset any magnetic transform before showing sending state so the
        // "wird gesendet …" label sits centered where the user last saw it.
        if (window.gsap) window.gsap.set(submitBtn, { x: 0, y: 0, overwrite: true });
        submitBtn.disabled = true;
        submitBtn.textContent = STRINGS.sending;
      }

      function failWith(msgText) {
        if (submitBtn) {
          if (window.gsap) window.gsap.set(submitBtn, { x: 0, y: 0, overwrite: true });
          submitBtn.disabled = false;
          submitBtn.innerHTML = submitBtnHTML;
        }
        if (formErrorMsg) { formErrorMsg.textContent = msgText; formErrorMsg.style.display = "block"; }
      }

      var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      var timeoutId = controller ? setTimeout(function () { controller.abort(); }, 20000) : null;

      fetch("https://kontakt-form.small-grass-e8fa.workers.dev", {
        method: "POST",
        body: JSON.stringify({
          name: name.value.trim(),
          email: email.value.trim(),
          phone: phoneValue,
          company: companyValue,
          topic: topicValue,
          message: message.value.trim(),
          addon_tracking: addonValue,
          tracking_tier: trackingTierValue,
          tracking_extensions: extensionsValue,
          addon_tier: tierValue,
        }),
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        signal: controller ? controller.signal : undefined,
      })
        .then(function (res) {
          if (timeoutId) clearTimeout(timeoutId);
          if (!res.ok) throw new Error("Server error");
          var fc = document.getElementById("formContent");
          var fs = document.getElementById("formSuccess");
          if (fc) fc.style.display = "none";
          if (fs) fs.style.display = "flex";

          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: "generate_lead",
            lead_topic: topicLabel,
            lead_addon: addonValue,
            lead_tier: tierValue,
            lead_has_company: companyValue !== "" ? "yes" : "no",
            lead_has_phone: phoneValue !== "" ? "yes" : "no",
            lead_tracking_tier: trackingTierShortValue,
            lead_has_extensions: extensionsTextFilled ? "yes" : "no",
          });
        })
        .catch(function (err) {
          if (timeoutId) clearTimeout(timeoutId);
          failWith(err && err.name === "AbortError" ? STRINGS.timeout : STRINGS.error);
        });
    });
  }
})();
