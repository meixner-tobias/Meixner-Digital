/* main.js
 * Globale Website-Logik für alle Seiten.
 * Diese Datei ersetzt wiederholte Inline-Skripte in allen HTML-Dateien.
 */

(function () {
  'use strict';

  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    var cookieScript = document.createElement('script');
    cookieScript.type = 'text/javascript';
    cookieScript.charset = 'UTF-8';
    cookieScript.src = '//cdn.cookie-script.com/s/d261fb8134670358b6795a49b5d04574.js';
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
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initThemeToggle() {
    var themeToggle = document.getElementById('themeToggle');
    var themeToggleMobile = document.getElementById('themeToggleMobile');
    var savedTheme = localStorage.getItem('theme');

    function updateThemeLabel() {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      safeQueryAll('.theme-label').forEach(function (el) {
        el.textContent = isDark ? 'Light Mode' : 'Dark Mode';
      });
    }

    function setDarkTheme() {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }

    function setLightTheme() {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }

    function toggleTheme() {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        setLightTheme();
      } else {
        setDarkTheme();
      }
      updateThemeLabel();
    }

    if (savedTheme === 'dark') {
      setDarkTheme();
    }

    updateThemeLabel();

    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    if (themeToggleMobile) {
      themeToggleMobile.addEventListener('click', toggleTheme);
    }
  }

  function initNavbarScroll() {
    var nav = document.getElementById('nav');
    if (!nav) {
      return;
    }
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 12);
    }, { passive: true });
  }

  function initDrawer() {
    var burger = document.getElementById('burger');
    var drawer = document.getElementById('drawer');
    if (!burger || !drawer) {
      return;
    }

    function closeDrawer() {
      drawer.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    burger.addEventListener('click', function () {
      var open = !drawer.classList.contains('is-open');
      drawer.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        var firstLink = drawer.querySelector('a');
        if (firstLink) {
          firstLink.focus();
        }
      }
    });

    safeQueryAll('#drawer a').forEach(function (a) {
      a.addEventListener('click', closeDrawer);
    });

    document.addEventListener('click', function (event) {
      if (!drawer.contains(event.target) && !burger.contains(event.target)) {
        closeDrawer();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeDrawer();
      }
    });
  }

  function initLanguageSwitcher() {
    var langBtn = document.getElementById('langBtn');
    var langDropdown = document.getElementById('langDropdown');
    if (!langBtn || !langDropdown) {
      return;
    }

    langBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      var isOpen = langDropdown.classList.contains('is-open');
      langDropdown.classList.toggle('is-open');
      langBtn.classList.toggle('is-open');
      langBtn.setAttribute('aria-expanded', String(!isOpen));
    });

    document.addEventListener('click', function () {
      langDropdown.classList.remove('is-open');
      langBtn.classList.remove('is-open');
      langBtn.setAttribute('aria-expanded', 'false');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        langDropdown.classList.remove('is-open');
        langBtn.classList.remove('is-open');
      }
    });
  }

  function initRevealAnimations() {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -36px 0px'
    });

    safeQueryAll('.reveal').forEach(function (element) {
      observer.observe(element);
    });
  }

  function initCardTilt() {
    if (window.matchMedia && window.matchMedia('(hover: none)').matches) {
      return;
    }

    safeQueryAll('.svc-card').forEach(function (card) {
      card.addEventListener('mousemove', function (event) {
        var rect = card.getBoundingClientRect();
        var dx = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        var dy = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        card.style.transform = 'translateY(-6px) perspective(700px) rotateX(' + (-dy * 6) + 'deg) rotateY(' + (dx * 6) + 'deg)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  function initFaqAccordion() {
    var faqButtons = safeQueryAll('.faq-q');
    if (faqButtons.length === 0) {
      return;
    }

    faqButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq-item');
        var isOpen = item.classList.contains('open');

        // Close all other open items (one-at-a-time accordion behavior)
        safeQueryAll('.faq-item.open').forEach(function (openItem) {
          openItem.classList.remove('open');
          var openBtn = openItem.querySelector('.faq-q');
          if (openBtn) {
            openBtn.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle the clicked item
        if (!isOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  function initHeroCanvas() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) {
      return;
    }

    var shouldLoadThree = window.innerWidth > 768 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (navigator.connection) {
      shouldLoadThree = shouldLoadThree && navigator.connection.effectiveType === '4g';
    }

    if (!shouldLoadThree) {
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = function () {
      if (typeof THREE === 'undefined') {
        return;
      }
      var hero = canvas.closest('.hero');
      if (!hero) {
        return;
      }

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
      camera.position.z = 5;
      var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
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
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      var particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({
        color: 0x6366f1,
        size: 0.045,
        transparent: true,
        opacity: 0.4,
        sizeAttenuation: true
      }));
      scene.add(particles);

      var ico = new THREE.Mesh(new THREE.IcosahedronGeometry(2, 1), new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        wireframe: true,
        transparent: true,
        opacity: 0.07
      }));
      ico.position.set(2.8, 0.4, -1.5);
      scene.add(ico);

      var tor = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.22, 12, 36), new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        wireframe: true,
        transparent: true,
        opacity: 0.05
      }));
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

function initAddonBox() {
    var topic = document.getElementById('topic');
    var addonBox = document.getElementById('addonBox');
    if (!topic || !addonBox) return;

    function updateAddonBox() {
      addonBox.style.display = topic.value === 'website' ? 'block' : 'none';
    }

    topic.addEventListener('change', updateAddonBox);
    window.addEventListener('pageshow', updateAddonBox);
    updateAddonBox();
  }

  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var submitBtn = document.getElementById('submitBtn');
    var formErrorMsg = document.getElementById('formErrorMsg');

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      var name    = document.getElementById('name');
      var email   = document.getElementById('email');
      var topic   = document.getElementById('topic');
      var message = document.getElementById('message');
      var privacy = document.getElementById('privacy');

      // Fehlermeldungen zurücksetzen
      ['nameErr','emailErr','topicErr','messageErr'].forEach(function(id) {
        document.getElementById(id).style.display = 'none';
      });
      formErrorMsg.style.display = 'none';

      // Validierung
      var valid = true;
      if (!name.value.trim()) {
        document.getElementById('nameErr').style.display = 'block'; valid = false;
      }
      if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        document.getElementById('emailErr').style.display = 'block'; valid = false;
      }
      if (!topic.value) {
        document.getElementById('topicErr').style.display = 'block'; valid = false;
      }
      if (!message.value.trim()) {
        document.getElementById('messageErr').style.display = 'block'; valid = false;
      }
      if (!privacy.checked) {
        formErrorMsg.style.display = 'block'; valid = false;
      }
      if (!valid) return;

      // Absenden
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gesendet …';

      try {
        var res = await fetch('https://kontakt-form.small-grass-e8fa.workers.dev', {
          method: 'POST',
          body: JSON.stringify({
            name:           document.getElementById('name').value.trim(),
            email:          document.getElementById('email').value.trim(),
            phone:          document.getElementById('phone').value.trim(),
            company:        document.getElementById('company').value.trim(),
            topic:          document.getElementById('topic').value,
            message:        document.getElementById('message').value.trim(),
            addon_tracking: document.getElementById('addon_tracking_val').value
          }),
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (res.ok) {
          document.getElementById('formContent').style.display = 'none';
          document.getElementById('formSuccess').style.display = 'flex';
          
          // Generate Lead Data Layer Event für GTM & GA4
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event:          'generate_lead',
            lead_topic:     document.getElementById('topic').value,        // z.B. "website"
            lead_topic_label: (function() {
              var map = {
                tracking:  'GTM & GA4 Setup',
                website:   'Website erstellen',
                betreuung: 'Sorglos-Betreuung',
                other:     'Noch unklar'
              };
              return map[document.getElementById('topic').value] || '';
            })(),
            lead_addon:     document.getElementById('addon_tracking_val').value,  // "Ja" oder "Nein"
            lead_has_company: document.getElementById('company').value.trim() !== '' ? 'yes' : 'no',
            lead_has_phone:   document.getElementById('phone').value.trim()    !== '' ? 'yes' : 'no',
          });
        } else {
          throw new Error('Server error');
        }
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Nachricht abschicken';
        formErrorMsg.textContent = 'Etwas ist schiefgelaufen. Bitte versuche es erneut.';
        formErrorMsg.style.display = 'block';
      }
    });
  }


})();
