# Prüfbericht zum visuellen Neuaufbau

Stand: 8. September 2026. Alle Zahlen sind gemessen, nicht geschätzt.
Nicht geprüfte Punkte sind unten ausdrücklich benannt.

## 1. Messbedingungen

- Chromium 151.0.7922.34, headless, über Playwright.
- Seiten wurden **nicht** über einen HTTP-Server geladen, sondern per
  Request-Interception direkt von der Platte beantwortet. Grund: ein lokaler
  `http.server` brach unter parallelen Anfragen Verbindungen ab
  (`ERR_CONNECTION_RESET`) und erzeugte dadurch Falschbefunde — unter anderem
  Messungen ohne geladenes Stylesheet, die als Layout-Fehler erschienen wären.
  Jedes Messskript prüft zusätzlich, ob das Stylesheet wirklich angewandt wurde,
  und **verwirft** die Messung sonst, statt einen Fehler zu melden.
- Externe Anfragen (GTM über `data.meixner-tobias.com`, CookieScript-CDN) werden
  in allen Messläufen abgebrochen. Die dadurch protokollierten `ERR_FAILED`-Einträge
  sind gewollt und keine Seitenfehler.
- Keine Formulare abgeschickt, keine Anfragen an den produktiven Worker.

## 2. Testsuite

`python -m unittest discover -s tests -p "test_*.py"` — 27 Tests.

Die Python-Umgebung des Projekts enthielt kein `playwright`; es wurde als reine
Testabhängigkeit in `.venv` installiert. Der Chromium-Pfad wird über
`PLAYWRIGHT_CHROMIUM_EXECUTABLE` gesetzt.

### Fachgerecht ersetzte Annahmen des visuellen Resets

| Vorher | Jetzt |
| --- | --- |
| `test_no_runtime_animation_dependencies` verbot Animation, Transition, RAF, IntersectionObserver, `setTimeout` | `test_motion_stays_dependency_free_and_css_is_safe`: verbietet weiterhin Animationsbibliotheken (gsap/ScrollTrigger/Lenis/THREE), vendorisierte Runtimes, deklarative SVG-Animation, globales `transition: all` und `overflow-x: hidden` auf `html`/`body` |
| — | **neu** `test_motion_preferences_are_honoured_in_css`: jede `@keyframes` muss verwendet werden **und** über den Pausenzustand erreichbar sein |
| `test_all_pages_responsive_and_no_animations` erwartete überall null Animationen | `test_all_pages_responsive_and_content_reachable`: nach vollständigem Durchscrollen muss jeder Reveal angekommen sein, das Stylesheet angewandt, kein waagerechter Überlauf |
| `test_without_javascript_and_reduced_motion` erwartete auch bei `no-preference` null Bewegung | prüft jetzt vier Zustände: ohne JS sichtbar, reduzierte Bewegung ohne laufende Animation, ausdrückliche Pause wirksam, Pausenentscheidung überlebt die Navigation |

`test_faq_and_case_details` prüft zusätzlich, dass der semantische Zustand
(`aria-expanded`, `hidden`) **sofort** gilt und nicht an der 350-ms-Animation hängt.

`tests/test_preservation.py` erhielt eine einzige, kommentierte Ausnahme: das neue
`figure.flow-figure` wird vor dem Vergleich entfernt. Alle übrigen Felder —
Metadaten, Canonicals, Hreflang, JSON-LD, Links, Bilder, Formularfelder,
`data-*`-Attribute und der SHA-256 des sichtbaren `main`-Textes — werden weiter
unverändert gegen `docs/preservation-baseline.json` geprüft. Die Baseline wurde
**nicht** überschrieben.

## 3. Im Test gefundene und behobene Fehler

Diese Befunde kamen aus der Messung, nicht aus einer Vermutung:

1. **Navigation lief bei 812 px um 111 px über.** `ul.nav-links` ist allein 748 px
   breit; die mobile Grenze lag bei 768 px. Grenze auf 1000 px angehoben — in CSS
   und JS gemeinsam, wie im Auftrag gefordert. Die Testmatrix deckt 812 px ab.
2. **`.svc-main-grid` blieb bei drei Spalten.** Bei 320 px wurden die Preiskarten
   auf 83 px gequetscht, der Inhalt lief um 71 px über. In beiden Media Queries ergänzt.
3. **Reveals blieben bei schnellem Scrollen unsichtbar.** Reproduzierbar bei
   812 × 375. Ursache: ein IntersectionObserver tastet ab und überspringt bei
   programmatischem Scrollen Elemente. Behoben durch einen per
   `requestAnimationFrame` gedrosselten Nachlauf, der sich selbst beendet. Das
   vorherige pauschale Zeit-Sicherheitsnetz wurde entfernt, weil es den Fehler
   verdeckt statt behoben hätte.
4. **Waagerechter Überlauf während der Reveal-Bewegung** (bis 68 px bei 812 px).
   Ursache: seitlich einlaufende Karten ragen während der Bewegung über ihren
   Container. Behoben durch `overflow-x: clip` mit `overflow-clip-margin` **auf den
   betroffenen Rastern** — nicht auf dem Body, und ohne Fokusringe zu beschneiden.
   Zusätzlich greifen die kurzen Bewegungswege jetzt ab 1100 px statt erst ab 768 px.
5. **Kontrast 4,31:1** bei 13-px-Text (`--color-text-dim: #8b8987`) auf den
   helleren Kartenflächen. Token auf `#a3a1a0` angehoben.
6. **Projekttitel doppelt** auf Desktop: `<summary>` und `.case-inner` tragen beide
   Logo, Typ und Titel. Der erste Ansatz blendete die `<summary>` auf Desktop aus;
   `test_faq_and_case_details` deckte auf, dass sie dort als Kartenkopf und
   Bedienelement erwartet wird. Umgesetzt ist deshalb die umgekehrte, kleinere
   Lösung: Die `<summary>` bleibt immer sichtbar — auch ohne JavaScript — und die
   Wiederholung im aufgeklappten Inhalt entfällt.
7. **Absenden-Button wirkte deaktiviert.** `#submitBtn` trägt keine `.btn`-Klasse
   und war ungestaltet. Über `.form-submit` gestaltet, mit eigenem Deaktiviert-Zustand.
8. **Hero-Projektkärtchen wurden abgeschnitten.** `.hero-img-frame` hatte
   `overflow: hidden`, die Kärtchen stehen aber bewusst über die Kante. Beschnitten
   wird jetzt das `<picture>`, nicht der Rahmen.
9. **Hobby-Pillen stapelten sich** als volle Zeilen, weil `.hobby-list` in der
   Grid-Gruppe lag. Auf umbrechende Reihe umgestellt.

## 4. Abdeckung

**Seiten:** alle 35 HTML-Dateien, DE und EN, einschließlich Blogübersichten, aller
Artikel, Impressum, Datenschutz, AGB und 404.

**Viewport-Matrix** (Testsuite, alle 35 Seiten): 320 × 740, 768 × 1024, 1024 × 768,
1440 × 900, 2560 × 1440, 812 × 375.
**Zusätzlich für den Referenzvergleich:** 390 × 844 und 1440 × 1000.

**Kontrast:** 17 Seiten, 7854 Elemente, nach vollständigem Durchscrollen.
Verfahren: sRGB-Luminanz nach WCAG, Alpha-Komposition über die Elternkette,
Mittelung von Farbverläufen, korrekte Behandlung von `color(srgb …)` im
Wertebereich 0–1. **Ergebnis: keine Unterschreitung** (4,5:1 für Fließtext,
3:1 für große Schrift).

**200 % Zoom** (CSS-Viewport 640 × 512), 11 Seiten: kein Überlauf, kein Text unter 11 px.

**Tastatur:** 28 Tabstopps auf der Startseite — jedes fokussierte Element hat einen
sichtbaren Fokusring, keiner liegt hinter einem Sticky-Element. Der Skip-Link fährt
messbar von −95 px auf 12 px ein.

**Schmales Querformat** 568 × 320: Startseite 1 px, Leistungen und Kontakt 0 px Überlauf.

**Screenshots:** im Sitzungs-Scratchpad unter `…/scratchpad/shots/` und
`…/scratchpad/shots/matrix/`. Sie liegen bewusst außerhalb des Repositories.

## 4b. Abnahme nach dem Deployment

Gemessen gegen `https://meixner-tobias.com/` nach dem Livegang, mit
Cache-Buster, Chromium, 1440 × 1000 und 390 × 844.

- **17 Seiten × 2 Viewports, DE und EN: alle sauber.** Schrift angewandt, kein
  waagerechter Überlauf, kein hängengebliebener Reveal, keine kaputten Bilder,
  keine JavaScript-Fehler, keine 404 auf eigene Ressourcen.
- **LCP 464 ms, CLS 0,002, 0 Long Tasks** bei normaler CPU.
- **537 KB in 12 Requests**, davon **210 KB eigene Seite**. Die übrigen 327 KB
  sind GTM (297 KB) und CookieScript (29 KB) — beides bestehende Integrationen.
- Bei vierfach gedrosselter CPU: LCP 1512 ms, 7 Long Tasks (1434 ms). Diese
  Rechenzeit stammt überwiegend aus GTM, nicht aus dem Seitencode.

### CLS: Messreihe statt Einzelwert

Ein einzelner Lauf war nicht aussagekräftig, weil das Ergebnis davon abhängt,
ob die Schrift vor oder nach dem First Contentful Paint eintrifft. Über sechs
Läufe:

| Stand | Median | min | max | Verursacher |
| --- | --- | --- | --- | --- |
| vor dem Preload | 0,064 | — | — | `div.fc` bei ~760 ms |
| mit Font-Preload | 0,0017 | 0,0000 | 0,0640 | `div.fc`, nur bei später Schrift |
| + feste Kartenbreite | **0,0017** | 0,0000 | 0,0450 | `ul.nav-links`, `a.btn` |

Der Sprung an den Hero-Kärtchen ist damit strukturell beseitigt und taucht in
keinem Lauf mehr auf. Der Rest stammt vom Umbruch normaler Textelemente beim
Schrifttausch und bleibt deutlich unter dem Schwellenwert 0,1. Er wäre nur noch
mit `size-adjust`-Fallbackmetriken zu entfernen — dafür ist der Messwert zu gut,
um die Komplexität zu rechtfertigen.

## 5. Bewusste Abweichungen von der Referenz

- **Die Tracking-Erklärung ist HTML plus CSS, kein SVG.** Der Auftrag bevorzugt SVG,
  verlangt zugleich eine senkrechte mobile Anordnung „ohne abgeschnittene Pfade" und
  „möglichst eine semantische Inhaltsquelle pro Element". Eine feste `viewBox`
  erfüllt beides nicht ohne zweiten DOM-Block oder JS-Messung. Die Stationen sind
  deshalb echter, vorlesbarer Text; nur Linien und Signalpunkte sind CSS.
- **Navigation ist nicht sticky** — die Referenz hält sie ebenfalls nicht dauerhaft
  sichtbar, und so werden keine Ankerziele oder Fokusringe verdeckt.
- **H1 größer als gemessen** (bis 68 px statt 50 px) — im Auftrag als eigene
  Entscheidung vorgesehen.
- **Sekundärtext heller** als die gemessenen `#9C9998` — Kontrastgründe, siehe oben.
- **Kein Preis-Tab-Umschalter.** Die Referenz hat einen; die vorhandenen drei
  Angebote besitzen diese Monats-/Jahres-Logik nicht, also wurde keine erfunden.
- **Der 1400-ms-Fade** wird nur an einer Stelle verwendet, nicht flächendeckend.

## 6. Nicht geprüft / verbleibende Einschränkungen

- **Nur Chromium.** Firefox und Safari wurden nicht getestet. `overflow-clip-margin`
  und `:has()` sind dort unterschiedlich lange verfügbar; `:has()` wird nur für die
  Zustandsdarstellung der Themen-Checkboxen verwendet und ist rein visuell.
- **Kein Lighthouse- und kein Core-Web-Vitals-Wert.** Solche Zahlen wurden bewusst
  nicht erfunden. Gemessen wurde nur, was oben steht.
- **Flaggen-Emoji in Reisekarten** rendern im headless Chromium als
  Regional-Indicator-Buchstaben, weil dort keine Emoji-Schrift installiert ist. Auf
  Windows und macOS ist das nicht der Fall. Das ist eine Eigenschaft der
  Testumgebung, kein Seitenfehler — und wurde deshalb nicht „behoben".
- **Nicht visuell einzeln abgenommen** wurden alle neun Blogartikel; geprüft wurden
  je ein deutscher und ein englischer Artikel vollständig, die übrigen automatisch
  auf Überlauf, sichtbare Inhalte, Bilder und Konsolenfehler.
- **Der Erfolgs- und Fehlerzustand des Formulars** wird von der Testsuite mit
  gemockten Antworten geprüft, nicht mit einer echten Übertragung.
- Das Cookie-Banner selbst wird von einem Drittanbieter injiziert und war in den
  Messläufen blockiert; nur der vorhandene Viewport-Schutz wurde bewahrt.
