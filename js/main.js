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

  function safeQueryAll(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
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
    window.addEventListener(
      "scroll",
      function () {
        nav.classList.toggle("scrolled", window.scrollY > 12);
      },
      { passive: true },
    );
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

    document.addEventListener("click", function () {
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
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.onload = function () {
      if (typeof THREE === "undefined") {
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
      new ResizeObserver(resizeCanvas).observe(hero);

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

      var time = 0;
      (function animate() {
        requestAnimationFrame(animate);
        time += 0.004;
        particles.rotation.y = time * 0.1;
        particles.rotation.x = time * 0.04;
        if (scene.children[1]) {
          scene.children[1].rotation.y = time * 0.22;
          scene.children[1].rotation.x = time * 0.12;
        }
        if (scene.children[2]) {
          scene.children[2].rotation.z = time * 0.28;
          scene.children[2].rotation.x = time * 0.09;
        }
        renderer.render(scene, camera);
      })();
    };

    document.head.appendChild(script);
  }

  onDocumentReady(function () {
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

    var submitBtn = document.getElementById("submitBtn");
    var formErrorMsg = document.getElementById("formErrorMsg");

    // Reset form display state on page show (handles bfcache restore
    // when user navigates back to /kontakt/ after successful submit).
    // Without this, the inline styles set by the submit handler persist
    // and both formContent and formSuccess would be shown together.
    window.addEventListener("pageshow", function () {
      var fc = document.getElementById("formContent");
      var fs = document.getElementById("formSuccess");
      if (fc) fc.style.display = "";
      if (fs) fs.style.display = "";
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = document.getElementById("name");
      var email = document.getElementById("email");
      var message = document.getElementById("message");
      var privacy = document.getElementById("privacy");
      var topicBoxes = document.querySelectorAll('input[name="topic"]');

      // Fehlermeldungen zurücksetzen
      ["nameErr", "emailErr", "topicErr", "messageErr"].forEach(function (id) {
        document.getElementById(id).style.display = "none";
      });
      formErrorMsg.style.display = "none";

      // Topic-Auswahl einsammeln
      var checkedTopics = [];
      topicBoxes.forEach(function (cb) {
        if (cb.checked) checkedTopics.push(cb.value);
      });

      // Validierung
      var valid = true;
      if (!name.value.trim()) {
        document.getElementById("nameErr").style.display = "block";
        valid = false;
      }
      if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        document.getElementById("emailErr").style.display = "block";
        valid = false;
      }
      if (checkedTopics.length === 0) {
        document.getElementById("topicErr").style.display = "block";
        valid = false;
      }
      if (!message.value.trim()) {
        document.getElementById("messageErr").style.display = "block";
        valid = false;
      }
      if (!privacy.checked) {
        formErrorMsg.style.display = "block";
        valid = false;
      }
      if (!valid) return;

      // Werte VOR fetch sichern
      var topicValue = checkedTopics.join(","); // z.B. "tracking,website"
      var companyValue = document.getElementById("company").value.trim();
      var phoneValue = document.getElementById("phone").value.trim();
      var addonValue = document.getElementById("addon_tracking_val").value;
      var tierValEl = document.getElementById("addon_tier_val");
      var tierValue = tierValEl ? tierValEl.value : "";

      // Tracking-Tier aus Radio-Buttons (z.B. "Standard (800-1.200 €)")
      var trackingTierEl = document.querySelector('input[name="tracking_tier"]:checked');
      var trackingTierValue = trackingTierEl ? trackingTierEl.value : "";
      // Kurzform für GA4 + Reports: "Standard (800-1.200 €)" -> "Standard"
      var trackingTierShortValue = trackingTierValue ? trackingTierValue.split(" (")[0] : "Noch unsicher";

      // Tracking-Extensions Freitext
      var extensionsEl = document.getElementById("tracking_extensions");
      var extensionsValue = extensionsEl ? extensionsEl.value.trim() : "";
      var extensionsTextFilled = extensionsValue.length > 0;

      var topicMap = {
        tracking: "GTM & GA4 Setup",
        website: "Website erstellen",
        betreuung: "Sorglos-Betreuung",
        other: "Noch unklar",
      };
      var topicLabel = checkedTopics
        .map(function (t) {
          return topicMap[t] || t;
        })
        .join(", ");

      submitBtn.disabled = true;
      submitBtn.textContent = "Wird gesendet …";

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
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
        .then(function (res) {
          if (res.ok) {
            document.getElementById("formContent").style.display = "none";
            document.getElementById("formSuccess").style.display = "flex";

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
          } else {
            throw new Error("Server error");
          }
        })
        .catch(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Nachricht abschicken";
          formErrorMsg.textContent =
            "Etwas ist schiefgelaufen. Bitte versuche es erneut.";
          formErrorMsg.style.display = "block";
        });
    });
  }
})();
