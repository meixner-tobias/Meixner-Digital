# Repository-Audit und Clean Visual Reset

Dieser Bericht dokumentiert den lokal geprüften Stand vor der anschließend beauftragten Veröffentlichung. Die Veröffentlichung erfolgt über das bestehende GitHub-Repository und dessen GitHub-Pages-Workflow; die Angaben zu unveröffentlichten Änderungen beschreiben den Abschluss des Audits.

## Ausgangspunkt und Umfang

- Repository: statische Website in diesem Checkout; keine Veröffentlichung oder Änderung am Remote.
- Unveränderter Ausgangscommit: `9db6a35041051093ef4fea598e3c29fc1f6fc49a`.
- Sicherungsbranch vor dem Rückbau: `backup/pre-visual-reset-2026-09-07`.
- Der Arbeitsbaum war vor Beginn sauber. Es wurden keine bestehenden Benutzeränderungen verworfen und kein Commit angelegt.
- Alle 35 produktiven HTML-Seiten, die vollständigen drei CSS-Dateien, das vollständige eigene JavaScript, sieben Python-Dateien, drei Notebook-Zellen, Git-Hook, Konfigurationen, Sitemap, beide Feeds, SVGs, Manifest und sämtliche Asset-Referenzen wurden untersucht. `.git` und die lokale `.venv` sind Versionsdaten bzw. installierte Entwicklungsabhängigkeiten, kein eigener Anwendungscode.
- Der visuelle Rückbau begann erst nach Abschluss des CSS-/DOM-/JavaScript-Abhängigkeitsaudits. Hilfsskripte wurden zuvor separat geprüft.

Die detaillierten Ausgangsbefunde stehen in [CSS_AUDIT.md](CSS_AUDIT.md), das vollständige maschinenlesbare Regel-/Deklarationsinventar in [css-audit-inventory.json](css-audit-inventory.json). Alte Zeilennummern in diesem Bericht beziehen sich auf den gesicherten Ausgangscommit und sind mit `git show backup/pre-visual-reset-2026-09-07:DATEIPFAD` nachvollziehbar.

## 1. Architektur

| Bereich | Befund |
| --- | --- |
| Stack und Routing | Statische HTML-Dateien mit Verzeichnispfaden; Deutsch und Englisch, einschließlich 16 Blogartikeln und 404-Seite. Kein Framework, SSR, Backend, Datenmodell oder Auth-Code im Repository. |
| Entry Points | 35 HTML-Dokumente, jeweils `/css/style.css` und `/js/main.js` mit Content-Hash als Query-Parameter. |
| Build | Kein Bundler, `package.json`, TypeScript, PostCSS, Tailwind, Sass, CSS Modules, Storybook oder Build-Schritt vorhanden. Dateien sind unmittelbar auslieferbar. |
| Alter visueller Layer | Ein globales Stylesheet mit 4.478 Zeilen, 690 Inline-Styles, Dark-/Light-Tokens, zahlreiche Komponenten-Overrides; zwei ungebundene CSS-Migrationskopien. |
| Alte visuelle Abhängigkeiten | Google Fonts Plus Jakarta Sans, GSAP, ScrollTrigger, Lenis und bedarfsweise Three.js. Inline-SVGs sowie eigene Inhaltsbilder, Produktbilder und Logos. |
| Funktionales UI | Mobile Navigation, Sprachmenü, native Blog-/Projekt-Details, FAQ, Auswahl abhängiger Formularfelder, Validierung und asynchrones Kontaktformular. |
| Externe Integrationen | GTM über eigene Tracking-Subdomain, CookieScript, externer Kontaktformular-Worker, `dataLayer`/`generate_lead`. Diese Dienste sind nicht im Repository implementiert. |
| Wartung | `bump_assets.py`, `update_sitemap.py`, `add_breadcrumbs.py` und `.githooks/pre-commit`. |

## 2. Gefundene Fehler

### P0 – Kritisch

Kein bestätigter P0-Fehler im geprüften eigenen Anwendungscode. Das ist keine Zertifizierung des externen Workers oder der extern verwalteten Tracking-/Consent-Konfiguration.

### P1 – Hoch

| Datei / alter Bereich | Problem und Ursache | Auswirkung und Lösung |
| --- | --- | --- |
| `js/main.js:207–244` | Escape schließt das Sprachmenü, setzt aber `inert` nicht zurück. | Visueller und interaktiver Zustand können auseinanderlaufen. Ein gemeinsamer sofortiger Zustandswechsel setzt jetzt `hidden`, `inert`, Klassen und ARIA in allen Schließpfaden. |
| `css/style.css:1462–1507`, `js/main.js:847–898` | Reveal-Inhalte starten unsichtbar und sind von erfolgreicher JS-Initialisierung abhängig. | Ohne JavaScript bleiben Inhalte verborgen. Reveal-CSS, Observer, Wartezeit und Animationsinitialisierung sind entfernt; Inhalte stehen im HTML sichtbar bereit. |
| `css/style.css:2705–2707`, `js/main.js:907–938` | FAQ versteckt Inhalt über Höhe/Overflow; geöffnet maximal 600px. | Lange Antworten können abgeschnitten werden, Links im geschlossenen Inhalt bleiben fokussierbar. Jetzt sofortige `hidden`-Zustände ohne Höhenlimit; ARIA-Zuordnung und Fokusverhalten bleiben erhalten. |
| `css/style.css:706–710` | Weiße CTA-Hoverfarbe mit `!important` überschreibt die vorgesehene Farbe auf transparentem Hintergrund. | Auf hellem Hintergrund kaum lesbar. Alte Farb-/Hover-Regeln vollständig entfernt. |
| `css/style.css:2998–2999` | Textarea-Fokus entfernt die Outline. | Tastaturfokus schlecht erkennbar. Keine Outline-Unterdrückung im Basis-Layer; native Browserfokusdarstellung. |
| `.githooks/pre-commit:23–28` | Nach Asset-Änderung wurden sämtliche HTML-Dateien aus dem Arbeitsbaum gestaged. | Unabhängige, bisher ungestagte Änderungen konnten in den Commit gelangen. Der Hook prüft vor jeder Mutation auf unsichere Teilstände und bearbeitet ausschließlich getrackte Seiten. Isolierte Git-Tests prüfen den Schutz. |

### P2 – Mittel

| Datei / alter Bereich | Problem und Ursache | Lösung |
| --- | --- | --- |
| `blog/answer-engine-optimization/index.html:840–895` | Acht fehlende öffnende `li`-Tags, stattdessen alleinstehendes `>`. | Korrekte Listenelemente eingesetzt, Artikelinhalt erhalten. |
| 16 Blogartikel, z. B. `blog/stape-io-einrichten/index.html:693–695` | Verschachtelte `picture`-Elemente im Autorbild. | Auf ein `picture` mit WebP-Quelle und `img`-Fallback reduziert. |
| `kontakt/index.html`, `en/contact/index.html`, `#tracking_extensions` | Textareas ohne programmatisch zugeordnete Beschriftung. | Vorhandenen Beschriftungstext als echtes Label zugeordnet. |
| `js/main.js:40–105` | Nicht abgefangener LocalStorage-Zugriff im Theme-Setup konnte die weitere gemeinsame UI-Initialisierung unterbrechen. | Theme-System einschließlich Zugriffen, Buttons und Anti-Flash-Skripten entfernt. |
| `js/main.js:1294–1532`, Formular-HTML | Sichtbarkeit von Fehlern, Erfolg und Zusatzfeldern hing teils an CSS, teils an Inline-Displaywerten. | Einheitliche `hidden`-Zustände. Formular bleibt während des Sendens gesperrt; Erstfehler wird fokussiert, Erfolg erhält Fokus, Fehlerzustände sind über ARIA zugeordnet. Endpunkt, JSON-Felder und Analytics-Felder bleiben erhalten. |
| Kontaktseiten, `form` ohne serverseitige Action | Ohne JavaScript konnte der Browser Formularwerte über eine lokale GET-Navigation in die URL schreiben. | Absenden ist im Ausgangsmarkup deaktiviert; funktionierendes JS aktiviert es. Ein lokalisierter Noscript-Hinweis erklärt die notwendige Aktivierung und verweist auf E-Mail. |
| Alle Seiten, `.footer-cookie-btn` | Direkter Zugriff auf nicht geladenes CookieScript löste im lokalen Betrieb bzw. bei blockiertem Anbieter einen JS-Fehler aus. | Verfügbarkeit vor dem bestehenden `CookieScript.instance.show()`-Aufruf prüfen. Verhalten bei geladenem Anbieter gleich. |
| `update_sitemap.py:42–44` | Für geänderte Seiten wurde das Datum des bisherigen Commits verwendet. | Änderungen erhalten das aktuelle Datum; Hook nutzt nur gestagte HTML-Änderungen. Fehlende/fremde Pfade überschreiben keine bestehenden Metadaten. |
| Beide `blog/feed.xml`, jeweils fünf Datumsangaben | Wochentag passt nicht zum Kalenderdatum. | Ausschließlich Wochentagsnamen berichtigt; tatsächliche Veröffentlichungsdaten und Artikel bleiben erhalten. |
| Alte Migrationsdateien in `scripts/` | Harte, nicht vorhandene Laufwerkspfade, teilweise Ausführung beim Import, breit ersetzende Tracking-/Script-Regexe, bereits ausgeführte Wrappermigrationen. | Nach Referenzprüfung entfernt. Alte Fassungen bleiben im Sicherungsbranch. |

### P3 – Niedrig / dokumentierte Restbefunde

- 106 `!important`-Deklarationen, redundante Selektoren und wiederholt überschriebene Transition-Shorthands wurden mit dem alten Design-Layer entfernt.
- Das alte mobile Layout verwendete elf numerische Breakpointwerte. Die funktionale Navigation verwendet jetzt eine einzige gemeinsame `max-width:768px`-Grenze in JS und CSS.
- Hauptnavigationen haben jetzt sprachgerechte Landmark-Namen; ungültige `div`-Flaggenwrapper innerhalb von Sprachbuttons wurden zu `span` bei gleichen Klassen.
- Bestehende einfache Tabellen haben teilweise weder Caption noch explizites `scope`; umgebende Überschriften und Tabellenköpfe liefern Kontext. Nicht als pauschalen funktionalen Defekt klassifiziert und inhaltlich unverändert belassen.
- Einige vorhandene `aria-current="page"`-Markierungen bezeichnen Blog-Vorfahren bzw. Sprach-Home-Links. URLs und Navigationstexte wurden nicht fachlich umgeschrieben; eine spätere redaktionelle Bereinigung bleibt möglich.
- Die visuelle Endprüfung fand 39 SVG-Icons ohne eigene Größenattribute. Die bisherigen Iconmaße stehen jetzt direkt im Markup (35 Menü-Chevrons: 12×12, vier Store-Icons: 24×24), damit sie ohne Component-CSS nicht seitenbreit werden. Zwei rein dekorative SVG-Wellen wurden entfernt.
- 192 explizite Zahlen-Spans in bereits nummerierten Inhaltsverzeichnis-Listen wurden nach Prüfung ihres genauen DOM-Pfads entfernt. Native `ol`-Nummerierung bleibt erhalten. Fehlende Wortabstände zwischen vormals blockweise dargestellten Hero-Spans und kleinen Kontakt-FAQ-Fragen wurden ausschließlich als Leerzeichen ergänzt. Diese engen Normalisierungen sind im Erhaltungstest dokumentiert.

## 3. CSS-Audit

Das aktive Stylesheet enthielt 1.300 qualifizierte Regeln einschließlich Keyframe-Schritten, 4.655 Deklarationen, 74 Custom-Property-Namen, 40 Media-Blöcke und fünf Keyframes. Alle drei CSS-Dateien wurden vollständig geparst; keine CSS-Parserfehler. Nicht unterstützte WebKit-Pseudoelemente im verwendeten Selektorparser wurden nicht als Produktfehler ausgegeben.

Die wesentlichen Konflikte lagen zwischen globalen Link-/Drawer-Regeln, späteren Dark-Overrides, seitenbezogenen Komponentenregeln und Inline-Styles. Die höchste eigene Komponentenspezifität betrug `(0,5,2)`. Identische Font- und Farbaliases existierten neben hart codierten Werten. Fünf Tokens waren ohne Verwendung; `--float-y` dagegen wurde dynamisch durch JavaScript gesetzt und war vor der Entkopplung ausdrücklich kein toter Token.

Feste Header-/Dropdown-Z-Indizes, transformbedingte Stacking Contexts, dekorativ absolute Produktbilder und `body { overflow-x:hidden }` machten die alte Darstellung reihenfolge- und geometrieabhängig. Der neue Dokumentfluss benötigt diese Ebenen nicht. Die ausführliche Liste der Duplikate, Breakpoints, Tokens, Layoutbefunde und Referenzkandidaten ist im CSS-Bericht und JSON-Inventar erhalten.

## 4. Vollständiges Animations-Audit und Entkopplung

Alle folgenden Zeilen beziehen sich auf das alte `js/main.js`. Keine eigene Logik verwendete `animationend` oder `transitionend`; funktionale Kopplungen bestanden stattdessen über Sichtbarkeitsklassen, Scrollpositionen, DOM-Messungen und verzögerte ScrollTrigger-Refreshes.

| System / Definition | Start und veränderter Zustand | Bewertung / Ergebnis |
| --- | --- | --- |
| Lenis, 391–432 | Initialisierung; GSAP-Ticker; Anchor-Click-Handler; geglätteter Scroll und Header-Messung. Drawer stoppt/startet Lenis. | Visuelles Scrollsystem entfernt, Drawer entkoppelt. Native Anker/URL-Fragmente und Skip-Link-Fokus. Kein JS-Scroll-Smoothing. |
| Hero-Intro und `splitChars`, 328–357, 434–469 | `[data-intro]`; Ersetzen von Textknoten durch `.char`; GSAP-Transform-Stagger. | Entfernt. Ursprünglicher HTML-Text wird unmittelbar gelesen, kein Split-DOM und keine Transformabhängigkeit. |
| Section-Reveals, 471–483 | Titel/Beschreibungen über ScrollTrigger; Y und Opacity. | Entfernt, sofort sichtbarer Inhalt. |
| Magnetische Buttons, 485–509 | `mousemove`/`mouseleave`, DOM-Messung, GSAP-XY. | Entfernt, ebenso die GSAP-Resets im Formular-Sende-/Fehlerzustand. |
| Zähler, 511–538 | `[data-count]`, ScrollTrigger und GSAP-Updates am Text. | Entfernt; finale Werte waren im HTML vorhanden und bleiben erhalten. |
| Hero-Parallax, 540–559 | ScrollTrigger ändert Heading-Opacity/-Transform und Blobs. | Entfernt. |
| Word-Reveal / `splitWords`, 359–389, 561–573 | `[data-pin-reveal]`; DOM-Splitting und scrollgebundene Opacity. | Entfernt; ursprünglicher Text bleibt. |
| Case-Reveal, 575–588 | `[data-case-reveal]`; animierter Clip-Path. | Entfernt. Kein Inhalt mehr hinter animiertem Clip. |
| Floating, 601–621 | `[data-float]`; Endlosschleife schreibt `--float-y`. | Entfernt, einschließlich komplementärer Transform-Regeln. |
| Element-Parallax, 623–640 | `[data-parallax-y]`; scrollabhängiges Y. | Entfernt. |
| Prozessschritt-Zähler, 642–683 | Vorab Text `00`, danach ScrollTrigger/GSAP bis Zielzahl. | Entfernt; statische finale Nummern bleiben. |
| Case-Gegenzähler, 685–710 | Dynamische `.case-card-num-bg`-Spans mit gegenläufigem Scroll. | Entfernt; rein dekorativer DOM wird nicht mehr erzeugt. |
| Hobby-Reveal, 712–728 | ScrollTrigger/GSAP skaliert und blendet Pills ein. | Entfernt. |
| Kontakt-Canvas, 730–825 | Lazy Three.js, ResizeObserver, IntersectionObserver, RAF, Ladepolling. | Gesamte rein dekorative WebGL-Logik und Canvas entfernt. |
| Kartenhighlight, 827–845 | IntersectionObserver setzt einmal `.in-view`. | Entfernt, ebenso mobile Highlight-Styles. |
| Allgemeine Reveals, 847–898 | Observer setzt `.in`, 1,2s-Fallback misst BoundingRect. | Entfernt; sichtbarer Ausgangszustand ohne JS. |
| Hero-Canvas, 941–1110 | Lazy Three.js, RAF, Mousemove, ScrollTrigger, Resize-/Visibility-Observer. | Entfernt einschließlich Teardown und dekorativem Canvas. |
| Signal-Line, 1116–1219 | Bereits deaktivierter Feature-Schalter; generiertes SVG, Pfadmessen, ScrollTrigger. | Gesamten ungenutzten Builder entfernt. |
| Auto-Fit, 1221–1242 | ComputedStyle/Client-/ScrollWidth, Resize-Timer und Inline-Fontsize. | Entfällt mit großer, nicht umbrechender Design-Typografie. Nativer Umbruch und Overflow-Schutz. |
| Motion-Preference-Teardown, 300–323 | Entfernt nur Teile aktiver Effekte bei Präferenzwechsel. | Kein eigener Animationszustand mehr vorhanden, daher vollständig entfernt. |
| Scroll-Header, 108–127 | Passiver Scrolllistener setzt `.scrolled`. | Rein visuell, entfernt. |
| FAQ/Projekt-Kopplung, 251–273, 932–936 | Verzögerter ScrollTrigger-Refresh nach Toggle: 300ms bzw. 500ms. | Entfernt. Zustandsänderungen sind unmittelbar; native Details bleiben bedienbar. |
| CSS `blink`, `floaty`, `pulse-green` | Verfügbarkeitsindikatoren und dekorative Karten; Opacity/Transform/Shadow. | Entfernt. |
| CSS `morph`, `ownProductPulse` | Keine aktive eigene Markup-/Animationsverwendung. | Tote Keyframes entfernt. |
| CSS-Transitions | Menüs, FAQ-Höhe, Theme, Skip-Link, Hover, Karten, Opacity/Transform. | Vollständig entfernt; funktionale Menüs verwenden Zustände oder native Details. |

Der einzige verbleibende eigene Timer begrenzt die Formularanfrage auf 20 Sekunden. Er ist Netzwerkfehlerbehandlung und keine Animation. Keine eigenen RAF-Schleifen, Scroll-/Mousemove-Animationen, Observer, GSAP-Callbacks, animierten CSS-Variablen oder WebGL-Abhängigkeiten bleiben aktiv.

## 5. Entfernte Altlasten

- Alter globaler Design-Layer mit Farben, Gradients, Schatten, dekorativen Borders, Typografie, Theme-Tokens, Sonderlayouts, Responsive-Patches und Motion.
- Google-Fonts-Ladepfade, Theme-Buttons, Anti-Flash-Skripte und Theme-Browserfarbe. Der Navbar-Schriftzug ist jetzt ein lesbarer Textlink; der Home-Link behält sein Ziel und seinen zugänglichen Namen.
- Dekorative Canvas-/Blob-Elemente und alle drei Animation-Script-Imports pro Seite.
- Die vier ausschließlich für die entfernten Effekte verwendeten Vendor-Dateien unter `js/vendor/`.
- Zwei ungebundene CSS-Migrationskopien und fünf abgeschlossene/gefährliche Migrationsskripte inklusive Notebook unter `scripts/`.
- Unbenutzter `safeQuery`-Helper und deaktivierte Signal-Line-Implementierung.

`.gitattributes` sichert LF-Zeilenenden für den Shell-Hook auch nach einem Windows-Checkout. `.gitignore` schließt erzeugten Python-Bytecode der neuen Entwicklungstests aus.

Alle Inhaltsbilder, Bildvarianten, Zertifikate, Kunden-/Produktlogos, OpenGraph-Bilder, Favicons, Manifest-Icons und das PDF bleiben erhalten. Vier Assets ohne eigene Referenz wurden als **C / unklar** eingestuft und nicht gelöscht: `assets/bikecare/icon-transparent.png`, `assets/bikecare/logo-dark.png`, `assets/img/logo.svg`, `assets/lebenslauf/Lebenslauf_personalSite.pdf`. Öffentliche Direktlinks außerhalb des Repositories können nicht ausgeschlossen werden.

Bestehende Klassen, IDs und passive `data-*`-Hooks an Inhalts-/UI-Elementen bleiben überwiegend bestehen. Fehlende aktuelle CSS-Nutzung beweist keine fehlende externe Tracking-Nutzung. Sie sind keine benötigten Animationszustände mehr; entfernte Dateien werden nicht mehr importiert.

## 6. Bewusst erhaltene funktionale Regeln

Der endgültige Basis-Layer umfasst **75 Zeilen, elf Regelblöcke, 23 Deklarationen, keine Custom Properties und keine Animationen oder Transitions**. Das eigene JavaScript umfasst **425 statt 1.533 Zeilen**.

| Vollständiger CSS-Selektor | Verbliebene Eigenschaften / funktionaler Grund |
| --- | --- |
| `*, *::before, *::after` | `box-sizing:border-box`; Breitenbegrenzung umfasst Padding/Borders. Keine globalen Abstandsresets. |
| `html` | `-webkit-text-size-adjust:100%`, `text-size-adjust:100%`; konsistente mobile Textgrößenanpassung. |
| `body` | `overflow-wrap:anywhere`; lange URLs/Texte dürfen umbrechen, kein versteckter Seitenoverflow. |
| `img, svg, video` | `max-width:100%`, `height:auto`; Inhaltsmedien passen in den verfügbaren Raum und erhalten ihr Seitenverhältnis. |
| `button, input, textarea, select` | `font:inherit`, `max-width:100%`; Controls bleiben lesbar und im Viewport. |
| `fieldset` | `min-inline-size:0`; verhindert eine durch Formularinhalt erzwungene Mindestbreite. |
| `pre, .table-wrap` | `overflow-x:auto`; lange Codezeilen und Vergleichstabellen bleiben horizontal erreichbar. |
| `[hidden]` | `display:none!important`; ein gemeinsamer tatsächlicher Sichtbarkeits-/Fokusvertrag für UI-Zustände. |
| `.sr-only` | `position:absolute`, `width:1px`, `height:1px`, `padding:0`, `margin:-1px`, `overflow:hidden`, `clip:rect(0,0,0,0)`, `white-space:nowrap`, `border:0`; vorhandene Screenreader-Ergänzungen ohne sichtbare Dopplung. |
| `html[data-ui-ready] .nav-links` in `max-width:768px` | `display:none`; nur nach funktionierender JS-Initialisierung übernimmt die mobile Navigation. Ohne JS bleiben die gewöhnlichen Links sichtbar. |
| `#cookiescript_injected` in `max-width:768px` | `max-height:62vh!important`, `overflow-y:auto!important`; vorhandene Provider-Overflow-Sicherung aus Kategorie C. Die zwei wichtigen Anbieter-Overrides bleiben bis zur Liveprüfung erhalten. |

Die einzigen drei `!important`-Deklarationen sind somit der allgemeine Hidden-Vertrag und die zwei genannten Provider-Sicherungen. Native Typografie, Browsermargen, Fokusmarkierungen und native Link-/Button-/Details-Darstellung benötigen keine eigenen CSS-Regeln. Zusätzlich bleiben **35 Inline-Styles an GTM-Noscript-Iframes** und die vorhandene lokale Consent-Teststil-Injektion unverändert; sie gehören zur Integration, nicht zum Design. Die übrigen **655 Inline-Styles** sind entfernt.

Es werden keine neue Palette, Schriftfamilie, Cards, Hover-Effekte, Animationen oder neuen Design-Tokens eingeführt. Die verbleibenden browsernativen Ränder und Abstände sind bewusst Teil des neutralen Ausgangspunkts.

## 7. Ergebnis

Die Website ist auf nativen HTML-Dokumentfluss und einen kleinen funktionalen CSS-Layer reduziert. Navigationen, Sprachwechsel, FAQs, native Projekt-/Blog-Details sowie die Formularzustände sind von animierten Eigenschaften entkoppelt. Das vorhandene Design wurde nicht optimiert oder durch ein neues Design ersetzt.

Business-Endpunkt, Request-Felder, `generate_lead`-Felder, Inhalts-URLs, Meta-/SEO-Daten und Tracking-/Consent-Bootstrap werden gegen den Ausgangsstand geprüft. Die notwendigen Ausnahmen sind in diesem Bericht benannt: semantische Fehlerkorrekturen, zugängliche Beschriftungen und ein Noscript-Hinweis für das JavaScript-Formular. Datenschutztexte mit alten Aussagen über Google Fonts bleiben als Inhalte erhalten und benötigen gegebenenfalls eine separate redaktionelle Aktualisierung.

## 8. Validierung

Abschlussprüfung am 8. September 2026 mit Python 3.14.4, Node 22.23.2 und Chromium 151.0.7922.34. Die gemeinsame Testsuite bestand **26 Tests in 54,881 Sekunden**. Reproduzierbare Entwicklungstests stehen unter `tests/`; es wurde kein Laufzeit-Buildsystem eingeführt.

| Prüfung / Aufruf | Ergebnis |
| --- | --- |
| `python -B -m unittest discover -s tests -v` | **26/26 bestanden**: sieben Browser-/HTTP-Tests, ein Erhaltungstest mit 35 Seiten, sechs statische Tests, zwölf isolierte Wartungs-/Git-Tests. |
| Seitenmatrix | **35 Seiten × sechs Viewports = 210 Prüfungen**: 320×740, 768×1024, 1024×768, 1440×900, 2560×1440, 812×375. Kein Seitenoverflow, keine unsichtbaren Reveal-Ausgangszustände, keine laufenden eigenen Animationen/Transitions. Alle Inhaltsbilder wurden einschließlich Lazy-Loading vor der Prüfung geladen und auf erfolgreiches Decodieren geprüft. |
| Navigation / Tastatur | DE/EN: Sprachmenü öffnen, Tab, Escape einschließlich `inert`/Fokusrückgabe, Außenklick; natives Blog-Details; mobile Navigation öffnen/schließen, Resize auf Desktop, keine verbleibende Scrollsperre; Skip-Link-Fokus. |
| FAQs / Projekt-Details | DE/EN: Öffnen und Schließen, jeweils nur eine FAQ offen, korrekte ARIA-Zustände, native Projekt-Summaries sichtbar und bei Mobil-/Desktopwechsel bedienbar. |
| Formularregressionen | DE/EN: Pflichtfelder, Fokus auf Erstfehler, Zusatzfelder, Mehrfachauswahl/„Other“-Ausschluss, lokalisierte Hidden-Werte, Erfolg, `generate_lead`-Felder, Restore via `pageshow`, Serverfehler, Wiederholung und 20-Sekunden-Timeout. **Sämtliche Übermittlungen gemockt.** |
| Ohne JavaScript / reduzierte Bewegung | Navigations- und Sprachlinks sowie FAQs bleiben erreichbar; JS-Formular ist geschützt deaktiviert. Eigene Animationszahl bleibt bei Präferenzwechsel null. |
| HTTP-Auslieferung | **37/37**: 35 HTML-Dateien plus CSS und JS über lokalen HTTP-Server mit Status 200 und bytegenauem Inhalt. Abschließender Lauf ohne Transportwiederholungen. |
| Erhaltungsmanifest | Alle 35 Seiten gegen den Sicherungscommit: Inhaltstext, Meta-/JSON-LD-Daten, SEO-Links, Scriptinhalte, Tracking-Iframes, Formularfelder/Handler, Bilder/Sources, URLs sowie nicht dekorative DOM-Hooks erhalten; eng dokumentierte Semantik-/Leerraumkorrekturen ausgenommen. Nach abschließender Leerraumbereinigung nochmals bestanden. |
| Quellprüfungen | Alle lokalen Ressourcen und Fragmentziele, HTML-Grundstruktur, IDs/ARIA/Labels, JSON/JSON-LD/XML/RSS/Manifest, Python-AST. `node --check` für eigenes JS, sämtliche ausführbaren Inline-Skripte und Event-Attribute. Keine verwaisten Vendor-Imports oder eigenen Animationsreferenzen. |
| JavaScript-Linter | ESLint ohne bestehende Projektkonfiguration gezielt mit `no-undef`, `no-unused-vars`, `no-unreachable`, `no-dupe-keys`, `valid-typeof` auf `js/main.js`: **bestanden**. Browserglobals explizit angegeben. |
| CSS-Parser / Browser | Finales CSS vollständig geparst; elf Regelblöcke und 23 Deklarationen. Alle verbleibenden Property/Wert-Paare bestehen Chromium `CSS.supports`; keine übergroßen Icons/überlaufenden Controls in den drei gesonderten visuellen Prüfungen. |
| Assetprüfung | Alle 75 Rasterdateien mit Pillow überprüft; keine Dateifehler. Bilder, SVGs, Manifest und Inhalts-PDF blieben erhalten. |
| `python -B bump_assets.py` | Alle 35 Seiten auf aktuelle CSS-/JS-Hashes aktualisiert. |
| `python -B update_sitemap.py` | 28 bestehende Sitemap-URLs auf das Datum der aktuellen Änderung gesetzt; URLs unverändert. |
| `git diff --check` | Nach Entfernung von zwölf beim TOC-Rückbau entstandenen Leerraumresten bestanden. |
| Build / Typecheck | **Nicht vorhanden / nicht anwendbar**: direkt auslieferbare statische Dateien, kein Compiler-/Bundler-/TypeScript-Projekt. Nicht als fiktiv erfolgreiche Buildbefehle ausgewiesen. |

Die ersten direkten Browserläufe gegen den lokalen Python-HTTP-Server zeigten sporadische Connection-Resets/Timeouts. Für reproduzierbare UI-Tests liefert Playwright daher die **unveränderten lokalen Dateibytes** als First-Party-Responses aus; externe Dienste bleiben gemockt. Ein separater HTTP-Smoke-Test prüft die tatsächliche lokale Auslieferung und begrenzt mögliche Transportwiederholungen auf drei Versuche. Der finale Lauf benötigte keine Wiederholung. Damit werden UI-Logik und lokaler Transport getrennt und die anfänglichen Testinfrastrukturfehler nicht als Anwendungsfehler verschwiegen.

Visuell geprüft wurden die Screenshots [Home/Desktop](validation/home-desktop.png), [Kontakt/Mobil vollständig](validation/contact-mobile-full.png) und [Artikel/Tablet](validation/article-tablet.png). Weitere vollständige Seitenbilder und Messwerte liegen unter `docs/validation/`. Reproduzierbar mit `python -B tests/capture_visuals.py`.

Für eine frische Entwicklungsumgebung benötigt die Browserprüfung das Python-Paket `playwright` und Chromium (`python -m playwright install chromium`). Ein bereits vorhandenes Chromium kann über `PLAYWRIGHT_CHROMIUM_EXECUTABLE` gewählt werden. Die statischen Erhaltungs-/Tooling-Tests verwenden Python-Standardbibliothek, Node und für die Git-Hook-Tests Git einschließlich `sh`.

## 9. Verbleibende Risiken und klare Grenzen

- GTM-Konfiguration, CookieScript-Anbieteroberfläche, externe Selektoren und Worker-Implementierung sind nicht im Repository enthalten. Browserregressionen isolieren externe Requests. Sie prüfen keine reale Lead-Zustellung und keine live ausgeführten Analytics-Tags.
- Kein Test versendet eine echte Kontaktanfrage. Erfolgs-, Serverfehler- und Timeout-Szenarien verwenden lokale Mocks.
- Es gab keine eigene Lightbox-/Modal-Implementierung im Ausgangscode. Acht Bilder besitzen lediglich `.lightbox-trigger`. Dieser unklare Hook ist erhalten; eine neue Lightbox wurde nicht erfunden.
- Browserprüfungen ersetzen keine tatsächlichen Safari-/Firefox-/iOS-Geräteprüfungen oder manuelle Screenreader-Sitzung.
- Es existiert kein TypeScript-/Backend-Projekt und deshalb kein entsprechender Typecheck/Backend-Build. Syntax-, Lint-, Struktur- und Browserprüfungen werden ausdrücklich separat ausgewiesen.
- Der alte Zustand kann im Sicherungsbranch geprüft werden. Die fertigen Änderungen bleiben reviewbar im Arbeitsbaum; kein Deployment und kein automatischer Commit.
