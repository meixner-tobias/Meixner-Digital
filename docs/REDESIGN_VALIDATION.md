# Prüfbericht — Redesign „Messprotokoll"

Stand: 12. September 2026. Alle Zahlen sind gemessen. Nicht Geprüftes steht
unten ausdrücklich.

## 1. Messbedingungen

- Chrome DevTools (MCP) im echten Browser für Gestaltung, Netzwerk und Traces;
  Chromium 151 über Playwright für Testsuite und Serienmessungen.
- Seiten werden per Request-Interception direkt von der Platte geliefert. Ein
  lokaler HTTP-Server brach unter parallelen Anfragen Verbindungen ab und
  erzeugte Falschbefunde.
- **`behavior: 'instant'` ist beim programmatischen Scrollen Pflicht.** Mit
  `scroll-behavior: smooth` animiert `scrollTo`, die Messschleife erreicht die
  unteren Seitenbereiche nie und meldet Bilder als kaputt, die in Ordnung sind.
  Dieser Fehler ist einmal aufgetreten und hat fast zu einem Fehlbefund geführt.

## 2. Testsuite

`python -m unittest discover -s tests -p "test_*.py"` — **28 Tests, alle grün.**
Davon 35 Seiten × 6 Viewports im Browser.

Der **Erhaltungstest ist unverändert grün**: Inhalte, Metadaten, Canonicals,
Hreflang, JSON-LD, Links, Bilder, Formularfelder, `data-*`-Attribute und der
SHA-256 des sichtbaren Textes stimmen weiter mit der Baseline überein. Das
Redesign hat **keine einzige Zeile Markup** verändert.

### Angepasste Tests und warum

| Test | Änderung | Grund |
| --- | --- | --- |
| `test_motion_preferences_are_honoured_in_css` | prüft nur noch `infinite`-Animationen | WCAG 2.2 „Pause, Stop, Hide" greift bei selbsttätiger Bewegung über fünf Sekunden. Einmal-Auftritte und scroll-gebundene Effekte fallen nicht darunter. |
| `test_all_pages_responsive_and_content_reachable` | prüft Sichtbarkeit statt `is-in`-Klasse; Stylesheet-Wächter liest ein Design-Token statt eines Schriftnamens | Die Reveal-Mechanik ist entfallen. Der Wächter überlebt so den nächsten Schriftwechsel. |
| `site_pages()` (neu) | Jekyll-Quellen ausgenommen | `_layouts/` und die Front-Matter-Stubs des Wartungsmodus sind keine auslieferbaren Seiten. |
| `test_scroll_linked_animation_never_sits_on_an_image_parent` (neu) | — | Hält den unten beschriebenen Lazy-Loading-Fallstrick fest. |

## 3. Gefundene und behobene Fehler

Alle aus der Messung, nicht aus Vermutung:

1. **Scroll-gebundene Animation verhinderte das Laden von Bildern.** Mit
   `animation-timeline: view()` auf dem `<picture>` wurde das darin liegende
   `loading="lazy"`-Bild **nie angefordert** — kein Netzwerkeintrag,
   `currentSrc` leer. Animation abgeschaltet → Bild lud sofort. Die Animation
   liegt jetzt auf dem `<img>`; ein Test hält das fest.
2. **Bernstein als Schrift auf Papier: 1,81:1.** `.own-product-ai` war faktisch
   unlesbar. Signalfarbe für Schrift ist jetzt flächenabhängig.
3. **Kleinsttext auf Papier: 3,80:1** an 13-px-Labels. Token angehoben auf 5,16:1.
4. **Button-Füllung lag nur im `::before`.** Prüfwerkzeuge, Forced-Colors und
   Druckansicht sahen keinen Hintergrund. Füllung jetzt am Element.
5. **Blogkarten komplett unterstrichen** — die Karte ist selbst ein `<a>`.
6. **Blog-Sinnbilder als Bildfläche behandelt**: 371 × 232 px Kasten um ein Icon.
7. **Kennzahlen in sechs verschiedenen Breiten** (594/655/437/332/254/350 px),
   dadurch ragged endende Trennlinien. Jetzt ein echtes Raster.
8. **Argumentraster doppelt verschachtelt** — vier Wörter pro Zeile. Entschachtelt.
9. **Titel-Dublette** in `<summary>` und Karteninhalt.
10. **Pfeil am Absenden-Button** blieb stehen, weil die Regel `.form-submit` nicht erfasste.

### Zwei Fehler in meinem eigenen Prüfwerkzeug

Beide hätten zu Falschbefunden geführt und sind korrigiert:

- Die Kontrastprüfung mittelte den Haarlinien-Verlauf der Eintragszeilen als
  Hintergrund und meldete dadurch 4,48:1, wo der Text auf Papier steht.
  Verläufe, die auf Haarlinienhöhe gesetzt sind, werden jetzt ignoriert.
- Die Scroll-Schleife nutzte kein `behavior: 'instant'` (siehe Abschnitt 1).

## 4. Ergebnisse

**Kontrast** — 17 Seiten, DE und EN, beide Flächen, nach vollständigem
Durchscrollen: **keine Unterschreitung** (4,5:1 Fließtext, 3:1 große Schrift).
Verfahren: sRGB-Luminanz nach WCAG, Alpha-Komposition über die Elternkette,
Mittelung echter Farbverläufe, `color(srgb …)` im Wertebereich 0–1.

**Core Web Vitals** (Chrome DevTools Trace, lokal, ohne GTM/CMP):

| | ungedrosselt | 4× CPU + Fast 4G |
| --- | --- | --- |
| LCP | **225 ms** | **1268 ms** |
| CLS | **0,00** | **0,00** |

CLS 0,00 ist das Ergebnis von `font-size-adjust: from-font`; die vorherige
Fassung lag bei 0,045–0,064.

**Gewicht:**

| | roh | gzip | Budget |
| --- | --- | --- | --- |
| `css/style.css` | 71,0 KB | **15,9 KB** | < 40 KB ✓ |
| `js/main.js` | 21,7 KB | **6,0 KB** | < 20 KB ✓ |
| Schriften (latin) | 93,0 KB | — | separat gemessen |

CSS von 3795 auf 1930 Zeilen, JS von 24,2 auf 21,7 KB. 28 `!important`
(vorher 101), kein `transition: all`, 6 Keyframes.

**Abdeckung:** alle 35 Seiten, DE und EN, bei 320 × 740, 768 × 1024,
1024 × 768, 1440 × 900, 2560 × 1440 und 812 × 375.

## 5. Bewusste Entscheidungen

- **Zwei Flächen statt einer.** Der Wechsel Ink ↔ Papier ist der
  Abschnittsübergang. Auf der Startseite: ink, ink, Papier, ink, ink, Papier, ink.
- **Kein Einblenden pro Abschnitt.** Begründung in
  [MOTION_SYSTEM.md](MOTION_SYSTEM.md) Abschnitt 1.
- **Keine Achsen in den variablen Schriften.** Archivos Breitenachse kostet
  55 KB, Newsreaders optische Achse 74 KB. Den Charakter trägt die Paarung.
- **Rot bleibt** für Verlustzahlen im Tracking-Artikel — es ist semantisch, nicht
  dekorativ. Es ist nur flächenabhängig auf lesbare Werte gebracht.

## 6. Nicht geprüft / Einschränkungen

- **Nur Chromium.** Firefox und Safari nicht getestet. Firefox kennt keine
  scroll-gebundenen Animationen und keine Cross-Document View Transitions —
  dort erscheint der Endzustand ohne Bewegung. Da die Bewegung nichts versteckt,
  ist das unkritisch, aber ungeprüft.
- **Keine Lighthouse-Gesamtnote.** Gemessen wurde, was oben steht.
- **Die Messung lief ohne GTM und CookieScript** (der lokale Server lädt sie
  nicht). In Produktion kommen rund 300 KB Drittanbieter-JavaScript hinzu, die
  nicht Teil des Seitencodes sind.
- **Visuell einzeln abgenommen** wurden Startseite, Leistungen, Projekte, Über
  mich, Kontakt, Blogübersicht, ein Artikel, Impressum und 404 — jeweils
  Desktop, die Startseite zusätzlich mobil. Die übrigen Seiten wurden
  automatisch auf Überlauf, Sichtbarkeit, Bilder und Konsolenfehler geprüft.
- **Die Seite ist weiterhin im Wartungsmodus** und öffentlich nicht erreichbar.
  Das Redesign ist noch nicht veröffentlicht.
