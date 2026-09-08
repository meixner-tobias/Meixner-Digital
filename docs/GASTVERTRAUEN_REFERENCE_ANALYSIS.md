# Gastvertrauen: Design- und Bewegungsanalyse für Meixner Digital

Stand: 8. September 2026. Ziel: belastbare Gestaltungsgrundlage für den nächsten visuellen Aufbau von `meixner-tobias.com`.

Der zugehörige, direkt ausführbare Arbeitsauftrag steht in [CLAUDE_CODE_REDESIGN_PROMPT.md](CLAUDE_CODE_REDESIGN_PROMPT.md).

## 1. Untersuchungsumfang und Aussagegrenzen

Die Referenz wurde tatsächlich im Browser untersucht: Chromium/Playwright, Desktop 1440 × 1000, Tablet 768 × 1024 und Mobilgerät 390 × 844. Die Startseite wurde abschnittsweise gescrollt und fotografiert. Zusätzlich wurden berechnete CSS-Eigenschaften, DOM-Zustände, CSS-Animationsereignisse, Übergänge und öffentlich ausgelieferte Stylesheets/Skripte ausgewertet. Geprüfte Interaktionen: Hauptbutton-Hover, Karteneinblendungen, Scrollen in beide Richtungen, Preisumschalter, FAQ und mobiles Menü. Ein ergänzender Durchlauf verwendete `prefers-reduced-motion: reduce`.

Neben der [Startseite](https://gastvertrauen.com/) wurden diese öffentlich verlinkten Seiten geöffnet und oben sowie weiter unten aufgenommen:

| Seite | Untersuchte Gestaltung |
| --- | --- |
| [Urlaubsangebot](https://gastvertrauen.com/urlaubs-special/) | Fotografischer Einstieg, dunkler Farbverlauf, Preiskarten, Prozess und Kontaktabschluss |
| [Jetzt starten](https://gastvertrauen.com/jetzt-starten/) | Erster Bildschirm des mehrstufigen Fragebogens, Auswahlkacheln, Fortschrittsleiste |
| [Kontakt](https://gastvertrauen.com/kontakt/) | Zweispaltiges Formular-/Kontaktlayout, Felder, Buttons, große dunkle Informationskarte |
| [Partnerprogramm](https://gastvertrauen.com/partnerprogramm/) | Zentrierter Einstieg, kleine Merkmalslabels, blauer Verlauf, Prozesspanel |
| [Datenschutz](https://gastvertrauen.com/datenschutz/) | Lange Textseite innerhalb der gemeinsamen dunklen Gestaltung |
| [Impressum](https://gastvertrauen.com/impressum/) | Reduzierte Informationsseite mit gemeinsamer Navigation |

Die zusätzlichen Routen wurden auf Desktop untersucht; die ausführliche mobile und Tablet-Prüfung betrifft die Startseite. Es wurden keine Formulare abgeschickt, Registrierungen angelegt oder nachgelagerte Fragebogen-/Erfolgszustände vollständig durchlaufen. Das ist eine umfassende Analyse der zugänglichen Gestaltung und wesentlichen Interaktionen, keine Behauptung, jeden möglichen Zustand, jeden Browser oder jede Einzelbildposition eines Videos geprüft zu haben.

Die Untersuchung erzeugte 39 Screenshots und mehrere Messprotokolle. Rohdaten und fremde Theme-Dateien liegen nur temporär außerhalb des Repositories unter `%TEMP%/gastvertrauen-research/`. Die entscheidenden Ergebnisse sind hier dauerhaft dokumentiert. Die Rohdateien sind keine Voraussetzung für den Claude-Prompt.

Kennzeichnung in diesem Bericht:

- **Gemessen:** im DOM, berechneten Stil, Ereignisprotokoll oder öffentlichen Quellcode konkret nachgewiesen.
- **Beobachtet:** visuell oder durch Interaktion festgestellt; ohne behauptete mathematische Exaktheit.
- **Entwurf:** bewusste neue Vorgabe für Meixner Digital, kein angeblicher Originaleffekt.

## 2. Was die Referenz hochwertig wirken lässt

Die Wirkung entsteht aus wenigen konsequent wiederholten Entscheidungen: nahezu schwarze Seitenflächen, klarer weißer Text, ungewöhnlich helle blaue Aktionsbuttons, warme beige Akzente und große ruhige Zwischenräume. Dunkles Blaugrau verbindet einzelne Abschnitte. Fotografien liefern den menschlichen Bezug; kleine Outline-Icons und feine Konturen halten die Oberfläche präzise.

Der Wechsel zwischen flächiger Fotografie, freiem Text und begrenzten Karten verhindert einen gleichförmigen Kachelteppich. Die Animationen sind überwiegend einfache Einblendungen mit klarer Richtung. Die langsamen Hintergrundwechsel lassen die Abschnitte zusammengehörig wirken. Das ist wichtiger als die bloße Anzahl bewegter Elemente.

### Gemessene Farben

Werte stammen aus den tatsächlich dargestellten Komponenten, nicht nur aus dem Theme-Farbregister. Der berechnete `body`-Hintergrund allein wäre irreführend: Sichtbare Abschnittsflächen und der separate Hintergrundwechsler überdecken ihn.

| Rolle | Wert | Nachweis / Einsatz |
| --- | --- | --- |
| Schwarze Hauptfläche | `#000000` | Navigation, mehrere Sektionen, Hintergrundwechsler |
| Kartenfläche | `#101213` | Drei Vorteilskarten und Preiskarten |
| Feine Kartenkontur | `#303133` | 1-px-Rahmen der Vorteilskarten |
| Blaugraue Abschnittsfläche | `#1A2835` | Hintergrundwechsler, hervorgehobene Flächen |
| Blau für bewegten Verlauf | `#263A46` | `data-bg-noise-2`; Verlauf gegen `#000000` |
| Eisblauer Hauptakzent | `#CBF2FE` | Haupt-CTA, schwarze Schrift im Ruhezustand |
| Gedämpftes Hellblau | `#B7C8D0` | Weitere Buttons und Akzente |
| Warmes Beige | `#EBDCC8` | Ausgewählte Abschnittstitel und hervorgehobenes Preislabel |
| Haupttext | `#FFFFFF` | Überschriften und zahlreiche Links |
| Sekundärtext in Karten | `#9C9998` | Berechnete Textfarbe der dunklen Karten |

Nicht jeden vorgefundenen Grauton übernehmen. Für Meixner Digital werden wenige semantische Tokens mit geprüften Kontrasten daraus abgeleitet.

### Gemessene Typografie und Geometrie

Die verwendete Schrift ist **Plus Jakarta Sans**. Die Referenz lädt sie über Google Fonts. Für die eigene Seite bietet sich eine lokale WOFF2-Einbindung mit beigefügter Lizenz an. [Schriftfamilie bei Google Fonts](https://fonts.google.com/specimen/Plus+Jakarta+Sans).

| Element | Desktopmessung | Einordnung |
| --- | --- | --- |
| Hauptüberschrift | 50 px, Gewicht 600, Zeilenhöhe 60 px | Klar, groß, ohne extrem fetten Schnitt |
| Hauptüberschrift mobil | 28 px, Gewicht 600, Zeilenhöhe 33,6 px | Mobile Referenzmessung bei 390 px Breite |
| Viele Abschnittstitel | 35 px / 42 px, Gewicht 600 | Konsistente wiederkehrende Hierarchie |
| Prozessüberschriften | 29 px / 34,8 px, Gewicht 600 | Zwischenstufe innerhalb großer Panels |
| Kartenüberschriften | 20 px / 30 px, Gewicht 600 | Kompakte, gut erkennbare Kartenhierarchie |
| Buttons | 14 px, Gewicht 500, Padding 15 × 36 px | Pillenform; gemessener Radius 140 px |
| Eyebrow-Beispiel | 12 px / 21 px, Laufweite 2,4 px | Großbuchstaben, dünn umrandete Pille |
| Karten und Hero | 12 px Radius | Deutlich ruhiger als extrem runde Bubble-Flächen |
| Karteninnenabstand | 36 px | Gleicher Abstand für Icon, Text und Kartenrand |
| Hauptnavigation | 84 px hoch | Desktop und untersuchtes Mobilgerät |
| Hero bei 1440 px | x ≈ 1, y = 120, Breite ≈ 1438, Höhe 558 px | 36 px Abstand nach der Navigation |
| Hero bei 390 px | x ≈ 10, y ≈ 84, Breite ≈ 370, Höhe ≈ 512 px | Eigene mobile Komposition statt bloßer Skalierung |

Diese Pixelwerte beschreiben den untersuchten Zustand. Sie sind keine universellen Sollmaße für alle Browsergrößen. Die eigene Seite erhält fließende Größen und inhaltlich passende Umbrüche.

## 3. Abschnitt für Abschnitt

### Navigation und Einstieg

Schwarze Navigation mit links stehendem Logo, mittigen Textlinks und zwei deutlich abgesetzten Handlungsoptionen rechts. Im untersuchten Scrollverlauf blieb die Navigation nicht dauerhaft sichtbar und erschien auch bei einem kurzen Scrollen nach oben nicht wieder. Ein aufwendig versteckender Sticky-Header ist damit kein belegtes Kernelement.

Der Hero der Startseite verwendet ein **statisches JPEG als Hintergrund**, `background-size: cover`, zentriert. Der Quellpfad endet auf `headerr_gastvertrauen.jpeg`. Darüber liegt eine dunkle Überlagerung; die Desktopvariante trägt eine Overlay-Opacity von 0,59, die mobile Variante 0,5. Die genaue optische Abdunklung hängt außerdem von der Overlay-Füllung ab.

Desktop: große Überschrift links unten, Beschreibung und CTA-Paar rechts unten. Mobil: Bild, Textblock und vertikal angeordnete Buttons werden zu einer schmalen, längeren Bildkarte. Keine belegte Hero-Videosequenz, kein nachgewiesenes Text-Splitting und kein nachgewiesenes Hero-Parallax.

### Vorteile und Angebot

Zentrierte Einleitung auf Schwarz. Darunter drei vergleichbare dunkle Karten mit feinem Rahmen, Outline-Icon, Überschrift und grauer Beschreibung. Die Bewegung erfolgt auf Kartenebene; nicht jeder Buchstabe animiert separat.

Im Angebotsbereich ergänzen Fotografie und dunkle Überlagerung die schwarze Fläche. Eine hervorgehobene blaue Karte steht neben dunklen Preiskarten. Visuelle Abwechslung entsteht durch unterschiedliche Gewichtung innerhalb desselben Rasters.

### Prozesspanel

Große, nach außen eingerückte blaugraue Fläche. Links ein kurzer Titel mit Eyebrow, rechts drei nummerierte Schritte. Die warme Titelfarbe und die langsame Hintergrundbewegung bilden den stärksten ruhigen Gegenpol zum Schwarz. Auf Desktop großzügig zweispaltig; auf Mobilgeräten gestapelt.

### Preise

Ein zentrierter Umschalter verbindet zwei Preiszustände. Drei Karten, davon eine visuell hervorgehoben. Der Wechsel blendet den Tab-Inhalt kurz aus/ein und startet die Karteneinblendungen erneut. Diese Referenzfunktion rechtfertigt auf Meixner Digital keinen erfundenen jährlichen oder monatlichen Tarif: Dort bleiben die vorhandenen drei Angebote und ihre Preise verbindlich.

### Integrationserklärung

Ein dunkler, abgerundeter Medienrahmen zeigt Personen, Verbindungslinien und wandernde Kommunikationssignale. **Das ist ein MP4-Video**, keine auf der Seite berechnete SVG-Datenflussanimation. Gemessen: 1920 × 1080, Dauer 52,3 Sekunden, Wiedergaberate 1; im DOM `autoplay`, `muted` und `loop`. Desktop- und Mobilvarianten existieren nebeneinander im DOM. [Originalmedium, nur als Referenz ansehen](https://gastvertrauen.com/wp-content/uploads/2025/08/Video_Gastvertrauen_Erklaerung-2.mp4).

Zusätzlich sind Video-Lightbox-Trigger im Markup vorhanden. Deren vollständige Zustandsfolge wurde nicht vermessen. Im untersuchten DOM wurde kein Owl-Karussell gefunden. Ein endlos laufendes Logo-Marquee ist nicht belastbar als eigenständiger Seiteneffekt belegt; bewegte Bestandteile des Videos dürfen nicht damit verwechselt werden.

### Bewertungen, FAQ, Team und Abschluss

Bewertungen stehen offen auf Schwarz mit runden Porträts, Sternen und Text. Der ganze Bewertungsblock erscheint langsam. Das wird für die eigene Seite auf echte Projektbelege übertragen, ohne neue Kundenstimmen oder Ergebnisse zu erfinden.

Die FAQ verwendet horizontale Trennlinien, rechts ein Öffnungssymbol und viel vertikalen Abstand. Antworten öffnen über eine messbare Höhenanimation. Der Teamabschnitt kombiniert große Fotos mit schwarzen Textflächen; linke und rechte Teile werden aus entgegengesetzten Richtungen eingeblendet. Eine kleine vertikale Versetzung ist Teil des Layouts und nicht automatisch Parallax.

Der Abschluss nutzt eine große Überschrift und eine klare Hauptaktion auf Schwarz. Ein kleiner runder Button zum Seitenanfang erscheint im Scrollverlauf.

## 4. Tatsächlich nachgewiesene Animationen

| ID | Effekt / Auslöser | Gemessene Parameter | Verhalten / Übertragung |
| --- | --- | --- | --- |
| M01 | Vorteilskarten bei Annäherung an den sichtbaren Bereich | `anim_rtl`: X von +100 px auf 0, Opacity 0 → 1; 600 ms; CSS `ease`; Verzögerungen 100 / 200 / 300 ms | Nacheinander von rechts einlaufende Karten. Auf Desktop eng an der Referenz rekonstruieren. |
| M02 | Angebots-/Prozessinhalte beim Scrollen | `anim_ttb`: Y von −100 px auf 0, Opacity 0 → 1; 600 ms; `ease`; teilweise 200 / 300 ms Verzögerung | Inhalte kommen tatsächlich von oben. Nicht pauschal als Fade-up bezeichnen. |
| M03 | Preiskarten beim Sichtbarwerden / Tabwechsel | `anim_ltr`: X von −100 px auf 0, Opacity 0 → 1; 600 ms; `ease`; 100 / 200 / 300 ms Verzögerung | Einlauf von links; beim Wechsel des Preis-Tabs erneut möglich. |
| M04 | Langsames Erscheinen des Bewertungsblocks | `alpha-in`: Opacity 0 → 1, 1400 ms, `ease` | Hervorgehobener langsamer Moment. 1400 ms ist keine allgemeine Dauer aller Reveals. |
| M05 | Teamfotos und zugehörige Texte | Links/rechts gerichtete 100-px-Einblendung; meist 600 ms; Titel 100 ms, Text 300 ms verzögert; zusätzlicher Block-Fade mit 200 ms Delay | Gegenläufige Bewegung bei zusammengehörigen Spalten. |
| M06 | Bewegte dunkle Hintergrundverläufe | Canvas; Farbquellen `#000000` und `#263A46`; Attribute Speed `200`, Size `1`; Simplex-Noise im öffentlichen Theme-Code | Kontinuierliche organische Farbverschiebung. **200 ist ein interner Rechenparameter, weder 200 ms noch eine Loop-Dauer.** |
| M07 | Wechsel der großen Seitenhintergrundfarbe beim Scrollen | `#changer-back-color`; Schwarz ↔ `#1A2835`; `background-color 1s cubic-bezier(0.25, 1, 0.5, 1)`; vier Übergänge im Scrollprotokoll | Besonders prägend für den Zusammenhang der Abschnitte. Nach Abschnittsaktivität ausgelöst, kein Beleg für einen GSAP-Scrub. |
| M08 | Hauptbutton bei Hover | 200 ms; `cubic-bezier(0.785, 0.135, 0.15, 0.86)` für Farbe, Hintergrund und Rahmen | Eisblau gefüllt / schwarze Schrift → transparenter Hintergrund / eisblaue Schrift und Kontur. Gemessener Transform bleibt `none`. Kein magnetischer Effekt. |
| M09 | FAQ öffnen/schließen | Gemessen während Öffnung: `height 0.35s ease`, Antwort wächst auf natürliche Höhe | 350 ms. Fokus, semantischer Zustand und Inhalt müssen unabhängig von dieser Animation funktionieren. |
| M10 | Preis-Tab aus-/einblenden | `opacity 0.15s linear` am Tab-Panel; zusätzlich erneute 600-ms-Karteneinblendungen | Schneller Übergang plus langsamerer Kartenaufbau. Nur auf tatsächlich vorhandene vergleichbare Interaktionen übertragen. |
| M11 | Mobiles Menü | Sichtbar nach unten aufklappend; zugehöriger Code: Höhe, 600 ms, `easeInOutCirc`; Burger-Element mit 300-ms-Transition | Kein belegter seitlicher Vollbild-Drawer. Im 390-px-Screenshot reicht der offene Header samt Menü bis ca. y = 540. |
| M12 | Erklärungsvideo | MP4, 52,3 s, Loop, stumm | Wirkung als eigenständige SVG-/CSS-Grafik für das Tracking-Thema neu entwerfen; nicht das fremde Video einbauen. |
| M13 | Button zum Seitenanfang | `alpha-in` 500 ms beim Erscheinen nach Scrollen | Kleiner sekundärer Effekt. Das genaue Scrollziel-Timing wurde nicht vermessen. |

Die Standard-Reveals wurden über `animationstart`/`animationend` und die tatsächlichen Klassenzustände bestätigt. Die 100-px-Startwerte stammen aus den passenden Keyframes, deren Namen auf sichtbaren Elementen liefen. Ein exemplarischer früher Screenshot-/DOM-Zustand zeigte die erste Karte noch bei X = 100 px und Opacity 0.

Beim erneuten kurzen Zurückscrollen blieben bereits erschienene Inhalte sichtbar. Die genaue Sichtbarkeitsschwelle der Theme-Logik wurde nicht vollständig rekonstruiert. Für die eigene Implementierung wird deshalb unten eine konkrete, als Entwurf gekennzeichnete Schwelle vorgegeben.

### Hintergrundverlauf genauer

Der Code berechnet Noise-Farbwerte in einem Canvas und verändert sie pro Frame. Ein IntersectionObserver begrenzt die eigentliche Pixelberechnung auf sichtbare Flächen; die RAF-Funktion plant trotzdem weitere Durchläufe. Für Meixner Digital genügt eine eigene, sparsamere Rekonstruktion der sichtbaren Wirkung. Eine CSS-Animation weniger vorbereiteter Verlaufsflächen kann reichen; ein eigener kleiner Canvas ist möglich, wenn der Bildvergleich einen klaren Vorteil zeigt.

Keine angeblich exakte Sekundenperiode erfinden: Der Referenzparameter ist an einen Zähler gekoppelt und die organische Bewegung ist kein einfaches lineares 12-Sekunden-Loop.

### Geladene Bibliothek ist nicht gleich eingesetzter Effekt

WordPress, das Uncode-Theme und jQuery sind im ausgelieferten Quellcode erkennbar. `gsap`, `ScrollTrigger` und die Klasse `Lenis` waren im Browser verfügbar. Gleichzeitig ergab die konkrete Startseitenprüfung:

- `SiteParameters.smoothScroll === "off"`.
- Keine aktive `window.lenis`-Instanz.
- `ScrollTrigger.getAll()` lieferte beim untersuchten initialen Zustand eine leere Liste.
- Kein beobachtetes Scroll-Pinning, kein Cursor-Follower, keine magnetischen Buttons, kein nachgewiesener horizontal gepinnter Abschnitt und kein belegtes Buchstaben-Splitting im Hero.

Deshalb ist der pauschale Auftrag „Baue dieselben GSAP-/Lenis-Animationen“ fachlich falsch. Die sichtbare Bewegung lässt sich größtenteils mit CSS und kleinen, klar abgegrenzten Browser-APIs umsetzen. Die [Uncode-Dokumentation zu animierten Überschriften](https://support.undsgn.com/hc/en-us/articles/360000839077-Animated-Headings) beschreibt zusätzliche Theme-Möglichkeiten; sie beweist nicht deren Verwendung auf dieser Website.

## 5. Mobile Gestaltung und Dinge, die verbessert werden sollten

Die mobile Startseite bewahrt Farben, Typografie und Bildwelt. Der Hero wird deutlich höher relativ zur Breite; Buttons stehen untereinander. Karten werden gestapelt. Das Menü ist eine dunkle aufklappende Fläche direkt unter dem Logo. Besonders wichtig sind die Bildausschnitte und ausreichend Platz für mehrzeilige deutsche Überschriften.

Für die eigene Seite werden nicht alle Implementierungsdetails übernommen:

- Die Referenz verwendet teilweise getrennte Desktop-/Mobil-Blöcke. Meixner Digital soll möglichst eine semantische Inhaltsquelle pro Element verwenden.
- Im Reduced-Motion-Durchlauf liefen weiterhin ein Hintergrundübergang und Videos; Canvas-Elemente waren weiterhin vorhanden. Ein vorhandener Canvas allein beweist keine aktive Pixeländerung. Trotzdem ist eine vollständige Deaktivierung aller dekorativen Bewegung in der Referenz nicht nachgewiesen. Die eigene Seite soll das ausdrücklich besser lösen.
- Der öffentliche Theme-Ballast ist groß: Zwei heruntergeladene CSS-Pakete umfassen zusammen rund 1,6 Millionen Zeichen; die untersuchten Theme-Skripte weit über zwei Millionen. Das sind unkomprimierte Quelltextgrößen, keine gemessenen Netzwerk-Transfergrößen und kein vollständiger Performance-Benchmark.
- Im ersten Browserlauf traten Video-Play/Pause-Promise-Fehler auf. Die eigene Motion-Schicht soll Fehler behandeln und Grundfunktionen nicht von laufenden Animationen abhängig machen.
- Das Kontaktformular der Referenz wirkt ruhig, seine sehr große rechte Karte ist für die eigene Kontaktseite nicht zwingend sinnvoll. Dort zählt die Nutzbarkeit der tatsächlich umfangreicheren Themen- und Zusatzoptionen.

## 6. Konkreter Entwurf für Meixner Digital

**Richtung: eine dunkle, persönliche Website für einen präzise arbeitenden Tracking- und Web-Spezialisten.** Die Referenz bestimmt die Farbfamilie, Materialwirkung und Bewegungsrhythmik. Die Bildwelt, Fachlichkeit und Inhalte gehören Tobias.

| Referenzprinzip | Übertragung auf das bestehende Repository |
| --- | --- |
| Große abgerundete fotografische Einstiegsfläche | Eigener großzügiger Hero mit vorhandener Überschrift, CTAs und Tobias-Porträt; Bild rechts, starker Textbereich links, ruhige dunkle Verbindung der Flächen |
| Eisblau und warmer heller Akzent | Eisblau für Hauptaktionen; Beige gezielt für besondere Abschnittstitel; viel Schwarz und Blaugrau |
| Drei klar vergleichbare Karten | Bestehende Leistungen und Preise: Tracking, Website, Betreuung |
| Großes Prozesspanel | Bestehende Zusammenarbeitsschritte in einer blaugrauen Fläche mit nummerierter Vertikale |
| Bewegtes Kommunikationsschaubild | Eigene Tracking-Erklärung: Website → Consent-Prüfung → Tags / Server → Analytics, Ads, CRM; ein erklärendes Schema, keine angeblichen Live-Daten |
| Social Proof | Bereits vorhandene Projekte, eigene Produkte, Kundenlogos und Zertifizierungen sichtbar aufwerten |
| Gegenläufige Team-Einblendungen | Tobias-Fotografie und bestehende persönliche Geschichte als zusammenhängende Zweispalte |
| Hintergrundwechsel | Auf der Startseite gezielter Wechsel bei Tracking-Erklärung und persönlichem Abschnitt; lange Blogtexte bleiben optisch stabil |
| Ruhige FAQ und Kontaktaktion | Vorhandene Fragen und Formularzustände im gleichen Designsystem |

Die Tracking-Grafik ist ein **neuer Entwurf**, der die Wirkung des Referenzvideos übersetzt: dünne Verbindungslinien, sehr kleine eisblaue Signale, wenige klar beschriftete Stationen. Ein mobiles vertikales Schema bleibt auch ohne Bewegung verständlich. Kein Dashboard mit erfundenen KPIs und kein ungeprüfter Anspruch auf tatsächlich vorhandene Integrationen.

Für die neue Typografie sind eine etwas größere Desktop-H1, 16–18 px lesbarer Fließtext und mobile Bewegungswege von nur 20–28 px sinnvolle bewusste Anpassungen. Die dokumentierten 100 px bleiben Ausgangspunkt für ausgewählte Desktop-Karteneinblendungen. Nicht jeden Absatz animieren; größere Abschnitte brauchen Ruhe.

## 7. Umsetzung und Quellen für Claude Code

Die vollständige technische und gestalterische Anweisung steht im [Claude-Code-Prompt](CLAUDE_CODE_REDESIGN_PROMPT.md). Wichtige Grundlage sind außerdem die bestehenden lokalen Berichte [VISUAL_RESET_AUDIT.md](VISUAL_RESET_AUDIT.md) und [CSS_AUDIT.md](CSS_AUDIT.md).

Öffentliche Primärquellen der Referenz: [Website](https://gastvertrauen.com/), [untersuchtes Haupt-CSS](https://gastvertrauen.com/wp-content/cache/wpfc-minified/8kee82dp/4h9e4.css), [zweites CSS-Paket](https://gastvertrauen.com/wp-content/cache/wpfc-minified/6lu4usjl/4h9e4.css), [Theme-App-Skript](https://gastvertrauen.com/wp-content/themes/uncode/library/js/app.js). Cachepfade und Inhalte können sich nach dem Untersuchungsdatum ändern. Es wurde kein Theme-Code ins Projekt kopiert.

Für die eigene Implementierung: Sichtbarkeitsbeobachtung kann Reveal-Trigger und das Pausieren dekorativer Effekte steuern. [MDN: Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).

Die Betriebssystempräferenz für reduzierte Bewegung muss in CSS und JS berücksichtigt werden, auch wenn sie während der Sitzung wechselt. [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).

Für kontinuierlich bewegte Inhalte gehört eine gut erreichbare Pausenmöglichkeit zum Entwurf; der Nutzer soll nicht allein auf eine Systemeinstellung angewiesen sein. [W3C: Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).
