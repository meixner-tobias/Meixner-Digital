# Designsystem — Meixner Digital

Stand: 12. September 2026. Umgesetzt in `css/style.css` (eine Datei, keine Build-Kette).
Bewegung getrennt in [MOTION_SYSTEM.md](MOTION_SYSTEM.md), Prüfergebnisse in
[REDESIGN_VALIDATION.md](REDESIGN_VALIDATION.md).

## 1. Richtung: Messprotokoll

Tobias misst Dinge. Tracking heißt: sichtbar machen, was unsichtbar passiert —
Ereignisse, Signale, Consent-Gates, Datenwege. Die Bildwelt kommt deshalb aus
der **Messtechnik**: Teilstriche, Kennwerte, Protokollzeilen, Toleranzen.

Die Seite liest sich als präzise gesetztes technisches Dokument mit Randspalte,
unterbrochen von randlosen Fotoplatten als menschlichem Gegengewicht.

### Was bewusst nicht gemacht wird

Der vorherige Entwurf traf mehrere Muster, an denen generisch erzeugte Seiten
erkennbar sind. Sie sind hier alle abgeräumt:

| Muster | Jetzt |
| --- | --- |
| Getracktes Versal-Etikett über jeder Überschrift | Ordnungsangabe in der Randspalte, gemischt gesetzt, mit Teilstrich |
| Ein eingefärbtes Wort in der Schlagzeile | Keine Einfärbung — die Größe trägt die Aussage |
| `→` an Button- und Linktexten | Entfernt; die Beschriftung sagt bereits, was passiert |
| Gleicher Radius auf allem | Nahezu rechteckig (2 px an Bedienelementen, 0 sonst) |
| Identische Karten im Dreierraster | Eintragszeilen mit Haarlinien und Kennwertspalte |
| Nummern 01/02/03 auf Nicht-Sequenzen | Ausgeblendet — vier parallele Argumente sind keine Reihenfolge |
| Schwebekarten auf dem Hero-Foto | Gesetzte Bildlegende neben der Platte |
| Fast-Schwarz plus ein Neon-Akzent | Ink **und Papier** als zwei echte Flächen |

## 2. Farbe

Die Seite hat zwei gleichwertige Flächen. Der Wechsel zwischen ihnen ist der
Übergang zwischen den Abschnitten.

| Token | Wert | Rolle |
| --- | --- | --- |
| `--ink` | `#0c1315` | Gerätegehäuse-Dunkel, grün-blauer Stich |
| `--ink-raised` | `#121a1c` | Menüs, erhöhte Flächen |
| `--ink-line` | `#1e292c` | Haarlinien im Dunkeln |
| `--paper` | `#e4ded3` | zweite echte Fläche, warm |
| `--paper-line` | `#c6bdad` | Haarlinien auf Papier |
| `--signal` | `#e2a33c` | Bernstein — Füllungen, Linien, Marken |

Komponenten lesen **nie** die Grundfarben, sondern nur die neutralen Tokens
`--surface`, `--line`, `--text`, `--text-soft`, `--text-faint`. Die
Flächenblöcke schalten diese um; dadurch kippt jede Komponente mit, ohne eigene
Sonderregeln.

### Flächenabhängige Textfarben

Drei Farben brauchen je Fläche einen eigenen Wert, weil ein einzelner Wert auf
Ink **und** Papier nicht gleichzeitig 4,5:1 erreicht. Alle Werte gemessen:

| Rolle | auf Ink | auf Papier |
| --- | --- | --- |
| Signal als **Schrift** (`--signal-text`) | `#e2a33c` — 8,52:1 | `#7d5310` — 5,52:1 |
| Warnrot (`--danger`) | `#e8735c` — 6,29:1 | `#a8341f` — 5,42:1 |
| Kleinsttext (`--text-faint`) | `#8b8f8d` — 5,73:1 | `#555b5d` — 5,16:1 |

`--signal` (Füllung, Linie) und `--signal-text` (Schrift) sind bewusst getrennt:
für Flächen gilt ein anderer Kontrastmaßstab als für Schrift.

**Gemessenes Ergebnis:** 17 Seiten, DE und EN, beide Flächen, nach vollständigem
Durchscrollen — keine Kontrastunterschreitung.

## 3. Typografie

Zwei klar verschiedene Familien, bewusst invertiert zum üblichen
Serif-Display/Sans-Body:

- **Archivo** (variabel 100–900) — Überschriften, UI, Labels und **Zahlen**.
  Preise, Jahre und Kennzahlen sind hier echter Inhalt und bekommen
  `font-variant-numeric: tabular-nums lining-nums`.
- **Newsreader** (variabel 200–800) — Fließtext. Gibt den Dokumentcharakter und
  die Wärme, die das technische Thema braucht.

Lokal unter `assets/fonts/`, Lizenzen daneben. Je Familie nur die
Gewichtsachse: Archivos Breitenachse hätte 55 KB gekostet, Newsreaders
optische Achse 74 KB. **Latin zusammen 93 KB.**

`font-size-adjust: from-font` auf `body` und Überschriften hält das Layout
stabil, während die Webfonts tauschen. Messbares Ergebnis: **CLS 0,00** (vorher
0,045–0,064).

| Rolle | Token | Wert |
| --- | --- | --- |
| Hero | `--t-display` | `clamp(2rem, 1.55rem + 1.5vw, 2.875rem)` — 46 px bei 1440 |
| Abschnittstitel | `--t-h2` | `clamp(1.55rem, 1.3rem + 0.85vw, 2rem)` — 32 px |
| Fließtext | `--t-body` | `clamp(1rem, 0.96rem + 0.1vw, 1.0625rem)` — 17 px |

Zeilenlänge über `--measure: 68ch`. Überschriften Gewicht 580.

## 4. Raster: das Dokument

```
│← Randspalte →│←────────── Inhalt ──────────→│← Kennwert →│
│  Situation 1  │  „Ich habe eine Website —    │   ab 390 € │
│               │   aber keine Ahnung …"       │            │
│               │  Fließtext …                 │            │
├───────────────────────── Haarlinie ───────────────────────┤
```

- `--page: 1320px`, `--gutter: clamp(20px, 4.6vw, 72px)`
- `--margin-col: clamp(120px, 13vw, 196px)` — die Randspalte
- `--band: clamp(34px, 3.8vw, 58px)` — Abschnittshöhe
- `--btn-lead: clamp(22px, 2.2vw, 30px)` — Vorlauf über jedem Knopf
- `--nav-h: 76px` — Höhe der stehenden Navigationsleiste

Ab 900 px bekommen Abschnittsköpfe und Einträge die Randspalte; darunter
stapelt alles einspaltig.

**Navigationsgrenze 1000 px** — `ul.nav-links` ist allein 748 px breit. CSS und
JS (`mobileViewport` in `js/main.js`) teilen diese Grenze.

## 5. Komponenten

- **Buttons** — nahezu rechteckig, Füllung liegt **am Element** (nicht nur im
  `::before`), damit Prüfwerkzeuge, Forced-Colors und Druck sie sehen. Das
  `::before` übernimmt nur den Hover-Wisch von unten.
- **Einträge** statt Karten — `.pain-card`, `.svc-card` sind Rasterzeilen mit
  Haarlinie: Ordnungsangabe links, Aussage in der Mitte, Kennwert rechts.
- **Zitate** — die drei Situationen sind wörtliche Zitate und werden in
  kursiver Serife gesetzt, nicht als Kartenüberschrift.
- **Fotoplatten** — randlos, ohne Rundung, `object-fit: cover`, leicht
  entsättigt (`saturate(.92) contrast(1.04)`).
- **Projekte** — das Eigenprodukt bekommt auf Desktop die volle Breite; die
  Kundenprojekte teilen sich zwei Spalten. Hierarchie statt Gleichverteilung.
- **Blogkarten** — sind selbst ein `<a>`; ohne `text-decoration: none`
  unterstreicht der Browser die gesamte Karte. Das Sinnbild ist ein Zeichen in
  Zeilenhöhe, keine Bildfläche.

## 6. Stehende Navigation

Die Leiste ist `position: sticky; top: 0`. Damit Sprungziele nicht darunter
verschwinden, trägt `html` ein `scroll-padding-top: calc(var(--nav-h) + 12px)`.

Der Sprachumschalter liegt im Markup andersherum vor als im Endzustand: der
Knopf trägt `hidden`, die Liste ist offen — das ist der Fallback ohne
JavaScript. Bis `data-ui-ready` gesetzt ist, dreht CSS das um (Knopf sichtbar,
Liste zu), und das `<noscript>` im Kopf dreht es für Browser ohne JavaScript
zurück. Ohne diese Umkehr verschwand die Sprachauswahl bei jedem Seitenwechsel
sichtbar und tauchte danach wieder auf.

## 7. Erhaltene Verträge

`[hidden] { display: none !important; }`, `.sr-only`, `pre`/`.table-wrap` mit
`overflow-x: auto`, der Viewport-Schutz des Cookie-Banners und die sichtbare
Navigation ohne JavaScript (`html[data-ui-ready]`).

Kein globales `transition: all`, kein `overflow-x: hidden` auf `html`/`body` —
beides erzwingt `tests/test_static.py`.

Das Markup wurde für dieses Redesign **nicht** verändert: Der Erhaltungstest
vergleicht Inhalte, Metadaten, Links, Bilder, `data-*`-Attribute und den
SHA-256 des sichtbaren Textes weiterhin unverändert gegen die Baseline.
