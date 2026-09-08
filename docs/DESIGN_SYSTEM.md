# Designsystem — Meixner Digital

Stand: 8. September 2026. Umgesetzt in `css/style.css` (eine Datei, keine Build-Kette).
Referenzgrundlage: [GASTVERTRAUEN_REFERENCE_ANALYSIS.md](GASTVERTRAUEN_REFERENCE_ANALYSIS.md).
Bewegung getrennt dokumentiert in [MOTION_SYSTEM.md](MOTION_SYSTEM.md).

Kennzeichnung wie im Referenzbericht:
**Gemessen** = an der Referenz nachgewiesen · **Entwurf** = eigene Entscheidung für diese Seite.

## 1. Grundsatz

Das Markup blieb unangetastet. Die Klassenstruktur des Projekts hatte den visuellen
Reset vollständig überlebt — 164 `reveal`-Hooks, `data-d`, `.hero`, `.pain-card`,
`.svc-main-card`, `.faq-item` und alle übrigen Komponenten standen bereits im HTML.
Das gesamte Designsystem greift deshalb ausschließlich auf **vorhandene** Klassen zu.

Einzige HTML-Ergänzung: die neu entworfene Tracking-Erklärung (`figure.flow-figure`)
auf den beiden Startseiten. Sie ist in `tests/test_preservation.py` als eng gefasste,
kommentierte Ausnahme normalisiert; jeder andere Inhalt wird weiterhin byte-genau
gegen die Baseline geprüft.

## 2. Farbtokens

| Token | Wert | Herkunft | Einsatz |
| --- | --- | --- | --- |
| `--color-bg` | `#000000` | Gemessen | Seitengrund, Navigation, Footer |
| `--color-surface` | `#101213` | Gemessen | Karten, Dropdowns, Formularkarte |
| `--color-surface-2` | `#171a1c` | Entwurf | Hover-Flächen, Codeblöcke |
| `--color-surface-blue` | `#1a2835` | Gemessen | Persönlicher Abschnitt, Prozesspanel, Eigenprodukt |
| `--color-atmosphere` | `#263a46` | Gemessen | Verlaufsflächen, Lichtschein hinter dem Porträt |
| `--color-border` | `#303133` | Gemessen | 1-px-Kartenkontur |
| `--color-border-soft` | `#232426` | Entwurf | Trennlinien Navigation/Footer |
| `--color-border-strong` | `#45474a` | Entwurf | Hervorgehobene Karten, Verbindungslinien |
| `--color-text` | `#ffffff` | Gemessen | Überschriften, Kartentitel |
| `--color-text-muted` | `#b3b0ae` | Entwurf | Fließtext auf dunklen Flächen |
| `--color-text-dim` | `#a3a1a0` | Entwurf | Kleinsttext, Metadaten |
| `--color-accent` | `#cbf2fe` | Gemessen | Hauptaktion, Links, Signale |
| `--color-accent-soft` | `#b7c8d0` | Gemessen | Eyebrows, sekundäre Akzente |
| `--color-warm` | `#ebdcc8` | Gemessen | Ausgewählte Titel, Preislabels, Consent-Station |

**Bewusste Abweichungen von der Messung.** Die Referenz setzt Sekundärtext in
Karten auf `#9C9998`. Das erreicht auf `--color-surface` keine 4,5:1. Für diese
Seite gilt deshalb `#b3b0ae` für Fließtext. `--color-text-dim` stand zunächst auf
`#8b8987` und wurde nach Messung auf `#a3a1a0` angehoben — `#8b8987` erreichte auf
den helleren Kartenflächen nur **4,31:1**.

Semantische Zustände (`--color-danger`, `--color-success`, `--color-focus`,
`--color-disabled`) sind zusätzlich definiert; alle sind Entwurf.

### Gemessenes Ergebnis

17 Seiten, 7854 Elemente, DE und EN, nach dem Durchscrollen: **keine
Kontrastunterschreitung**. Prüfverfahren siehe [REDESIGN_VALIDATION.md](REDESIGN_VALIDATION.md).

## 3. Typografie

**Plus Jakarta Sans**, lokal als variable WOFF2 (400–700) unter `assets/fonts/`,
Subsets `latin` + `latin-ext`, zusammen 49 KB, `font-display: swap`, Lizenz
`assets/fonts/OFL.txt`. Eingebunden per `@font-face` im Stylesheet — dadurch war
keine Änderung an den 35 HTML-Dateien nötig und es entsteht keine Drittanbieter-Anfrage.

Vor diesem Umbau lud die Seite **gar keine Schrift**.

| Rolle | Token | Wert |
| --- | --- | --- |
| Hero | `--fs-hero` | `clamp(2.15rem, 1.15rem + 3.1vw, 4.25rem)` → 34–68 px |
| Abschnittstitel | `--fs-h2` | `clamp(1.75rem, 1.15rem + 1.9vw, 2.75rem)` → 28–44 px |
| Zwischenstufe | `--fs-h3` | `clamp(1.4rem, 1.15rem + 0.8vw, 1.85rem)` |
| Kartentitel | `--fs-card-h` | `clamp(1.125rem, 1.02rem + 0.32vw, 1.25rem)` |
| Fließtext | `--fs-body` | `clamp(1rem, 0.96rem + 0.16vw, 1.125rem)` → 16–18 px |

Überschriften Gewicht 600 (**gemessen**), `line-height` 1.2, `letter-spacing`
−0.018 em, `text-wrap: balance`. Fließtext `line-height` 1.65, Artikeltext 1.75.
Lesebreite: `.legal-p` und `.article-body` auf 72 ch, `.sec-desc` auf 65 ch.

Die Desktop-H1 ist mit bis zu 68 px größer als die gemessenen 50 px der Referenz —
**Entwurf**, wie im Auftrag vorgesehen. Eyebrows sind gesperrt (`0.17em`),
Fließtextabsätze nicht.

## 4. Raster und Abstände

| Token | Wert |
| --- | --- |
| `--container` | `1320px` |
| `--gutter` | `clamp(20px, 4vw, 64px)` |
| `--space-section` | `clamp(64px, 8.5vw, 128px)` |
| `--card-pad` | `clamp(24px, 2.4vw, 36px)` (Referenz: 36 px) |
| `--radius-card` | `12px` (**gemessen**) |
| `--radius-lg` | `20px` (Entwurf, für Bildflächen) |
| `--radius-pill` | `999px` |

Navigation 84 px hoch (**gemessen**), mobil 68 px.

**Navigationsgrenze: 1000 px.** Die Grenze lag bei 768 px. Gemessen: allein
`ul.nav-links` ist 748 px breit, wodurch die Seite bei 812 px um **111 px** überlief.
CSS (`@media (max-width: 1000px)`) und JS (`mobileViewport` in `js/main.js`) teilen
diese Grenze und wurden gemeinsam geändert; die Testmatrix deckt 812 px ab.

## 5. Komponenten

Aufbau des Stylesheets: **Tokens → Basis → Layout → Komponenten → Seitenvarianten
→ Motion → Responsive/Präferenzen**. Seitenvarianten tragen ihre eigenen Media
Queries direkt bei der Komponente, damit zusammengehörige Regeln beieinanderstehen.

- **Buttons** — Pillenform, 15 × 32 px Padding, Mindesthöhe 48 px. Hover invertiert
  Fläche und Kontur in 200 ms mit `--ease-ui`, ohne Transform (**gemessen**, M08).
  Varianten: `btn-primary`, `btn-outline`, `btn-outline-indigo`, `btn-white`,
  `btn-ghost`, `btn-full`, `btn-sm`. `#submitBtn` trägt im Markup keine `.btn`-Klasse
  und wird über `.form-submit` gleich gestaltet, inklusive sichtbarem Deaktiviert-Zustand.
- **Karten** — `--color-surface`, 1 px `--color-border`, 12 px Radius, kein Schatten
  im Ruhezustand. Hervorgehobene Karten wechseln auf `--color-surface-blue`.
- **Hero** — Zweispalter, Text links, Porträt rechts in abgerundeter Fläche.
  Der Rahmen clippt **nicht**; die vier Projektkärtchen stehen bewusst über seine
  Kante hinaus. Gerundet und beschnitten wird das `<picture>`. Unter 768 px werden
  die Kärtchen ausgeblendet, weil sie sonst das Gesicht verdecken.
- **Preiskarten** — `.svc-main-grid` mit drei gleichwertigen Karten, CTA über
  `margin-top: auto` immer bündig unten, `.svc-badge-placeholder` hält Karten ohne
  Badge auf gleicher Höhe. Keine erfundenen Monats-/Jahres-Tabs.
- **FAQ** — waagerechte Trennlinien, Chevron rechts, 350 ms Öffnung (**gemessen**, M09).
- **Flaggen** — reine CSS-Verläufe, keine zusätzlichen Bilddateien.

## 6. Erhaltene Verträge

`[hidden] { display: none !important; }`, `.sr-only`, `pre`/`.table-wrap` mit
`overflow-x: auto`, der Viewport-Schutz des Cookie-Banners und die Regel, dass ohne
JavaScript die gewöhnliche Navigation sichtbar bleibt (`html[data-ui-ready]`).

Kein globales `transition: all`, kein `overflow-x: hidden` auf `html`/`body` —
beides wird von `tests/test_static.py` erzwungen.
