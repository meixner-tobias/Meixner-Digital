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
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Walk DOM, replace text nodes with .char spans, preserve inline elements + <br>
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
    var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h"), 10) || 68;
    safeQueryAll('a[href^="#"]').forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href || href === "#" || href.length < 2) return;
      link.addEventListener("click", function (e) {
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -navH - 12 });
      });
    });
  }

  // 2. Hero intro — [data-intro] char stagger reveal
  function initHeroIntro() {
    if (!gsapReady) return;
    var introEls = safeQueryAll("[data-intro]");
    if (!introEls.length) return;
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
    if (!stReady) return;
    safeQueryAll(".sec-title, .sec-label, .sec-desc, .article-title, .page-hero__desc").forEach(function (el) {
      if (el.hasAttribute("data-intro") || el.closest("[data-intro]")) return;
      window.gsap.from(el, {
        y: 32, opacity: 0, duration: 0.85, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });
  }

  // 4. Magnetic buttons — cursor pulls element toward it
  function initMagnetic() {
    if (!gsapReady || !window.matchMedia("(hover: hover)").matches) return;
    // Implicit selectors: primary CTAs get magnetism without needing per-page markup.
    // Explicit opt-in via [data-magnetic] still works and can override strength.
    var selectors = [
      "[data-magnetic]",
      ".nav-cta",
      ".hero-btns .btn-primary",
      "#submitBtn",
      ".cta-box .btn",
    ].join(", ");
    var seen = new Set();
    safeQueryAll(selectors).forEach(function (el) {
      if (seen.has(el)) return;
      seen.add(el);
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
      var obj = { v: 0 };
      el.textContent = prefix + "0" + suffix;
      window.ScrollTrigger.create({
        trigger: el, start: "top 92%", once: true,
        onEnter: function () {
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
    if (!stReady) return;
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
    if (window.matchMedia && window.matchMedia("(hover: none)").matches) {
      return;
    }

    safeQueryAll(".svc-card").forEach(function (card) {
      card.addEventListener("mousemove", function (event) {
        var rect = card.getBoundingClientRect();
        var dx =
          (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        var dy =
          (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        card.style.transform =
          "translateY(-6px) perspective(700px) rotateX(" +
          -dy * 6 +
          "deg) rotateY(" +
          dx * 6 +
          "deg)";
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
      window.addEventListener("mousemove", function (e) {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        targetSceneRotY = mouseX * 0.18;
        targetSceneRotX = mouseY * 0.10;
      });

      var time = 0;
      var rafId = 0;
      function animate() {
        rafId = requestAnimationFrame(animate);
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
    wrap.style.cssText = "position:absolute;top:0;left:0;width:100%;height:" + docH + "px;pointer-events:none;z-index:0;";

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
        submitBtn.disabled = true;
        submitBtn.textContent = STRINGS.sending;
      }

      function failWith(msgText) {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = submitBtnHTML; }
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
