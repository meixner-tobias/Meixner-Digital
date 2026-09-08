/* Functional UI only. Visual reset contract: docs/VISUAL_RESET_AUDIT.md. */
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

  // One shared boundary for the CSS fallback, drawer and project details.
  // Must stay in sync with the @media (max-width: 1000px) nav rule in style.css:
  // the desktop nav links alone need roughly 750px.
  var mobileViewport = window.matchMedia("(max-width: 1000px)");

  function initDrawer() {
    var burger = document.getElementById("burger");
    var drawer = document.getElementById("drawer");
    if (!burger || !drawer) return;

    function setOpen(open, restoreFocus) {
      var wasOpen = !drawer.hidden;
      drawer.hidden = !open;
      drawer.toggleAttribute("inert", !open);
      drawer.classList.toggle("is-open", open);
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      if (open) {
        var firstLink = drawer.querySelector("a");
        if (firstLink) firstLink.focus();
      } else if (wasOpen && restoreFocus && !burger.hidden) {
        burger.focus();
      }
    }

    function syncViewport() {
      var focusInDrawer = drawer.contains(document.activeElement);
      var desktopLinks = document.querySelector(".nav-links");
      var focusInDesktopLinks = desktopLinks && desktopLinks.contains(document.activeElement);
      burger.hidden = !mobileViewport.matches;
      if (mobileViewport.matches && focusInDesktopLinks) burger.focus();
      if (!mobileViewport.matches) {
        setOpen(false, false);
        if (focusInDrawer) {
          var firstDesktopLink = document.querySelector(".nav-links a");
          if (firstDesktopLink) firstDesktopLink.focus();
        }
      }
    }

    setOpen(false, false);
    syncViewport();
    mobileViewport.addEventListener("change", syncViewport);
    burger.addEventListener("click", function () {
      setOpen(drawer.hidden, true);
    });
    safeQueryAll("a", drawer).forEach(function (link) {
      link.addEventListener("click", function () { setOpen(false, false); });
    });
    document.addEventListener("click", function (event) {
      if (!drawer.contains(event.target) && !burger.contains(event.target)) {
        setOpen(false, false);
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !drawer.hidden) {
        setOpen(false, true);
      }
    });
  }

  function initLanguageSwitcher() {
    var button = document.getElementById("langBtn");
    var menu = document.getElementById("langDropdown");
    if (!button || !menu) return;

    function setOpen(open, restoreFocus) {
      menu.hidden = !open;
      menu.toggleAttribute("inert", !open);
      menu.classList.toggle("is-open", open);
      button.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", String(open));
      if (restoreFocus) button.focus();
    }

    setOpen(false, false);
    button.hidden = false;
    button.addEventListener("click", function () { setOpen(menu.hidden, false); });
    document.addEventListener("click", function (event) {
      if (!menu.contains(event.target) && !button.contains(event.target)) {
        setOpen(false, false);
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !menu.hidden) setOpen(false, true);
    });
  }

  function initCaseAccordion() {
    var cards = safeQueryAll("details.case-card-collapsible");
    if (!cards.length) return;
    function sync() {
      cards.forEach(function (card) { card.open = !mobileViewport.matches; });
    }
    sync();
    mobileViewport.addEventListener("change", sync);
  }

  function initFaqAccordion() {
    var items = safeQueryAll(".faq-item");

    // Referenz M09: 350 ms auf die natuerliche Hoehe. Der semantische Zustand
    // (hidden, aria-expanded, Klasse) wird immer sofort gesetzt; die Animation
    // ist reine Dekoration und darf abbrechen, ohne etwas zu hinterlassen.
    function animateHeight(answer, open) {
      var canAnimate =
        typeof answer.animate === "function" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
        !document.documentElement.classList.contains("motion-paused");
      if (answer.__faqAnim) answer.__faqAnim.cancel();
      if (!canAnimate) {
        answer.style.height = "";
        return;
      }
      var full = answer.scrollHeight;
      var anim = answer.animate(
        open
          ? [{ height: "0px" }, { height: full + "px" }]
          : [{ height: full + "px" }, { height: "0px" }],
        { duration: 350, easing: "ease" }
      );
      answer.__faqAnim = anim;
      function clear() {
        if (answer.__faqAnim === anim) answer.__faqAnim = null;
        answer.style.height = "";
      }
      anim.addEventListener("finish", clear);
      anim.addEventListener("cancel", clear);
    }

    function setOpen(item, open, animate) {
      var button = item.querySelector(".faq-q");
      var answer = item.querySelector(".faq-a");
      if (!button || !answer) return;
      var changed = answer.hidden === open;
      item.classList.toggle("open", open);
      answer.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
      // Beim Schliessen bleibt nichts unsichtbar Fokussierbares stehen:
      // hidden gilt sofort, die Hoehenanimation laeuft nur beim Oeffnen.
      if (animate && changed && open) animateHeight(answer, true);
    }
    items.forEach(function (item, index) {
      var button = item.querySelector(".faq-q");
      var answer = item.querySelector(".faq-a");
      if (!button || !answer) return;
      if (!answer.id) answer.id = "faq-answer-" + (index + 1);
      button.setAttribute("aria-controls", answer.id);
      setOpen(item, false);
      button.addEventListener("click", function () {
        var open = answer.hidden;
        items.forEach(function (other) { setOpen(other, false); });
        setOpen(item, open, true);
      });
    });
  }

  /* ==========================================================================
     Motion. Vertrag je Effekt: docs/MOTION_SYSTEM.md
     Funktion und Animation sind getrennt: Ohne diese Schicht bleibt jede Seite
     vollstaendig sichtbar und bedienbar. Der vorbereitete Reveal-Zustand wird
     erst hier gesetzt und bei Abbruch zuverlaessig wieder entfernt.
     ========================================================================== */
  var MOTION_KEY = "motion-preference";
  var reduceMotionMQL = window.matchMedia("(prefers-reduced-motion: reduce)");
  var root = document.documentElement;

  function motionPausedByUser() {
    try {
      return window.localStorage.getItem(MOTION_KEY) === "paused";
    } catch (err) {
      return false; // Fehlender Speicherzugriff darf nichts beschaedigen.
    }
  }

  function storeMotionPreference(paused) {
    try {
      window.localStorage.setItem(MOTION_KEY, paused ? "paused" : "playing");
    } catch (err) {
      /* Private-Mode o. ae. — die Entscheidung gilt dann nur fuer diese Seite. */
    }
  }

  function decorativeMotionOff() {
    return reduceMotionMQL.matches || motionPausedByUser();
  }

  function initMotion() {
    var revealed = safeQueryAll(".reveal");

    // Alles sofort sichtbar lassen und keinen vorbereiteten Zustand setzen.
    function showEverything() {
      root.classList.remove("js-motion");
      revealed.forEach(function (el) { el.classList.add("is-in"); });
    }

    if (!("IntersectionObserver" in window)) {
      showEverything();
      return;
    }

    if (decorativeMotionOff()) {
      showEverything();
    } else if (revealed.length) {
      root.classList.add("js-motion");

      var pending = revealed.slice();
      function arrive(el) {
        el.classList.add("is-in"); // einmal pro Seitenaufruf, kein Zurueckfallen
        var i = pending.indexOf(el);
        if (i > -1) pending.splice(i, 1);
      }

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          arrive(entry.target);
        });
      }, { rootMargin: "0px 0px -10% 0px", threshold: 0 });

      revealed.forEach(function (el) {
        // Sehr hohe Elemente warten nie auf eine unerreichbare Sichtbarkeit.
        if (el.getBoundingClientRect().top < window.innerHeight) arrive(el);
        else observer.observe(el);
      });

      // Der Observer tastet ab und kann bei sehr schnellem oder programmatischem
      // Scrollen Elemente ueberspringen. Dieser Nachlauf holt sie zuverlaessig
      // ein und haengt sich selbst wieder aus, sobald alles angekommen ist.
      var ticking = false;
      function sweep() {
        ticking = false;
        pending.slice().forEach(function (el) {
          if (el.getBoundingClientRect().top < window.innerHeight) {
            observer.unobserve(el);
            arrive(el);
          }
        });
        if (!pending.length) {
          window.removeEventListener("scroll", schedule);
          window.removeEventListener("resize", schedule);
          observer.disconnect();
        }
      }
      function schedule() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(sweep);
      }
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
    }

    // Hintergrundwechsel: aktive Sektion ueber eine Zone um die Viewportmitte.
    // Deterministisch, damit schnelles Vor-/Zurueckscrollen nicht flackert.
    var blueZones = safeQueryAll(".about-strip, .why-box");
    if (blueZones.length && !decorativeMotionOff()) {
      var active = 0;
      var zoneObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          active += entry.isIntersecting ? 1 : -1;
        });
        active = Math.max(0, active);
        document.body.classList.toggle("bg-blue", active > 0);
      }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
      blueZones.forEach(function (zone) { zoneObserver.observe(zone); });
    }

    initMotionToggle();
  }

  // Pause-/Fortsetzen-Schalter fuer dekorative Bewegung (WCAG 2.2 Pause, Stop,
  // Hide). Liegt bewusst ausserhalb von <main> und wird hier erzeugt, damit
  // kein Seitenmarkup dafuer geaendert werden muss.
  function initMotionToggle() {
    if (reduceMotionMQL.matches) return; // Systemangabe genuegt bereits.
    if (!document.querySelector(".why-box, .reveal")) return;

    var isEN = (root.getAttribute("lang") || "").toLowerCase().indexOf("en") === 0;
    var LABEL = isEN
      ? { pause: "Pause animations", play: "Play animations" }
      : { pause: "Animationen pausieren", play: "Animationen abspielen" };

    var button = document.createElement("button");
    button.type = "button";
    button.className = "motion-toggle";

    function render() {
      var paused = root.classList.contains("motion-paused");
      button.textContent = paused ? LABEL.play : LABEL.pause;
      button.setAttribute("aria-pressed", String(paused));
    }

    root.classList.toggle("motion-paused", motionPausedByUser());
    render();

    button.addEventListener("click", function () {
      var paused = !root.classList.contains("motion-paused");
      root.classList.toggle("motion-paused", paused);
      storeMotionPreference(paused);
      if (paused) {
        safeQueryAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
        document.body.classList.remove("bg-blue");
      }
      render();
    });

    document.body.appendChild(button);
  }

  // Wechsel der Bewegungspraeferenz mitten in der Sitzung: dekorative Bewegung
  // sofort beenden und jeden Inhalt in seinem sichtbaren Endzustand lassen.
  function handleReduceMotionChange(event) {
    if (!event.matches) return;
    root.classList.remove("js-motion");
    safeQueryAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
    document.body.classList.remove("bg-blue");
    var toggle = document.querySelector(".motion-toggle");
    if (toggle) toggle.remove();
  }

  if (reduceMotionMQL.addEventListener) {
    reduceMotionMQL.addEventListener("change", handleReduceMotionChange);
  } else if (reduceMotionMQL.addListener) {
    reduceMotionMQL.addListener(handleReduceMotionChange); // Safari < 14
  }

  onDocumentReady(function () {
    initDrawer();
    initLanguageSwitcher();
    initFaqAccordion();
    initCaseAccordion();
    initAddonBox();
    initContactForm();
    document.documentElement.setAttribute("data-ui-ready", "");
    initMotion();
  });

  function initAddonBox() {
    var topicBoxes = document.querySelectorAll('input[name="topic"]');
    var addonBox = document.getElementById("addonBox");
    var addonBoxTracking = document.getElementById("addonBoxTracking");
    var addonBoxBetreuung = document.getElementById("addonBoxBetreuung");
    var tierVal = document.getElementById("addon_tier_val");
    if (!topicBoxes.length) return;

    // Preserve the localized default from the markup.
    var addonTrackingValEl = document.getElementById("addon_tracking_val");
    var addonTrackingDefault = addonTrackingValEl ? addonTrackingValEl.value : "";

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
        addonBox.hidden = topics.indexOf("website") === -1;
      if (addonBoxTracking)
        addonBoxTracking.hidden = topics.indexOf("tracking") === -1;
      if (addonBoxBetreuung)
        addonBoxBetreuung.hidden = topics.indexOf("betreuung") === -1;

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
        if (addonTrackingCb) addonTrackingCb.checked = false;
        if (addonTrackingValEl) addonTrackingValEl.value = addonTrackingDefault;
      }
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
    var submitting = false;
    var initialErrorText = formErrorMsg ? formErrorMsg.textContent : "";
    if (submitBtn) submitBtn.disabled = false;
    var submitBtnHTML = submitBtn ? submitBtn.innerHTML : ""; // Preserve inner SVG arrow across state changes

    function showErr(id) {
      var el = document.getElementById(id);
      if (el) el.hidden = false;
      safeQueryAll('[aria-describedby~="' + id + '"]').forEach(function (field) {
        field.setAttribute("aria-invalid", "true");
      });
    }
    function hideErr(id) {
      var el = document.getElementById(id);
      if (el) el.hidden = true;
      safeQueryAll('[aria-describedby~="' + id + '"]').forEach(function (field) {
        field.removeAttribute("aria-invalid");
      });
    }
    function getVal(id) { var el = document.getElementById(id); return el ? (el.value || "").trim() : ""; }
    function getRaw(id) { var el = document.getElementById(id); return el ? el.value : ""; }

    // Reset form display state on page show (handles bfcache restore
    // when user navigates back to /kontakt/ after successful submit).
    window.addEventListener("pageshow", function () {
      submitting = false;
      form.removeAttribute("aria-busy");
      var fc = document.getElementById("formContent");
      var fs = document.getElementById("formSuccess");
      if (fc) fc.hidden = false;
      if (fs) fs.hidden = true;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitBtnHTML;
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (submitting) return;

      var name = document.getElementById("name");
      var email = document.getElementById("email");
      var message = document.getElementById("message");
      var privacy = document.getElementById("privacy");
      var topicBoxes = document.querySelectorAll('input[name="topic"]');

      ["nameErr", "emailErr", "topicErr", "messageErr"].forEach(hideErr);
      if (formErrorMsg) {
        formErrorMsg.hidden = true;
        formErrorMsg.textContent = initialErrorText;
      }
      if (privacy) privacy.removeAttribute("aria-invalid");

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
        if (privacy) privacy.setAttribute("aria-invalid", "true");
        if (formErrorMsg) formErrorMsg.hidden = false;
        valid = false;
      }
      if (!valid) {
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) {
          var focusTarget = firstInvalid.matches("input, textarea, select")
            ? firstInvalid : firstInvalid.querySelector("input, textarea, select");
          if (focusTarget) focusTarget.focus();
        }
        return;
      }

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

      submitting = true;
      form.setAttribute("aria-busy", "true");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = STRINGS.sending;
      }

      function failWith(msgText) {
        submitting = false;
        form.removeAttribute("aria-busy");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = submitBtnHTML;
        }
        if (formErrorMsg) { formErrorMsg.textContent = msgText; formErrorMsg.hidden = false; }
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
          if (fc) fc.hidden = true;
          if (fs) {
            fs.hidden = false;
            fs.setAttribute("tabindex", "-1");
            fs.focus();
          }
          submitting = false;
          form.removeAttribute("aria-busy");

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
