# Arbeitsauftrag für Claude Code: vollständiger visueller Neuaufbau von Meixner Digital

Du arbeitest direkt im bestehenden Repository meiner Website. Entwickle und implementiere ein vollständiges, hochwertiges Designsystem für **alle Seiten**. Die wichtigste visuelle Referenz ist **https://gastvertrauen.com/**. Besonders gefallen mir deren Farben, dunkle Flächen, Typografie, Bildkomposition und Animationen.

Ich möchte eine Website, die sofort hochwertig wirkt: klar gestaltet, persönlich, technisch präzise und mit sichtbar sorgfältig abgestimmter Bewegung. Du sollst die Referenz gründlich verstehen und ihre gestalterischen Prinzipien sowie die nachgewiesenen Animationen eng auf meine Website übertragen. Entwickle dafür eigene, zum Inhalt passende Komponenten. Liefere die tatsächliche Umsetzung und prüfe sie im Browser. Ein Konzept, einige neue CSS-Variablen oder ausschließlich eine überarbeitete Startseite erfüllen diesen Auftrag nicht.

## 1. Projekt und verbindlicher Ausgangspunkt

- Projekt: Tobias Meixner / Meixner Digital, Tracking-Spezialist und Web-Freelancer aus Würzburg.
- Lokaler Projektpfad: `C:\Users\tobia\Documents\Meixner-Digital\2-Website`.
- Repository: `https://github.com/meixner-tobias/Meixner-Digital`.
- Öffentliche Website: `https://meixner-tobias.com/`.
- Technologie: statische HTML-Seiten, gemeinsames CSS und Vanilla JavaScript, veröffentlicht über GitHub Pages.
- Es gibt derzeit 35 HTML-Seiten einschließlich DE/EN und 404. Prüfe den aktuellen Bestand selbst.
- Zentrale Dateien: `css/style.css`, `js/main.js`, die jeweiligen `index.html`-Dateien.
- Die Seite wurde zuvor bewusst auf eine funktionale visuelle Basis zurückgesetzt. Das vorhandene CSS ist deshalb sehr klein und fast ungestaltet. Dieser Zustand ist der saubere Ausgangspunkt für das neue Design.
- Früheres GSAP/ScrollTrigger/Lenis/Three-JS und ältere Designreste wurden entfernt. Stelle das alte Design nicht aus einem Backup wieder her.

Lies zuerst:

1. Eventuell vorhandene `AGENTS.md` / `CLAUDE.md` und den aktuellen Git-Zustand.
2. `docs/GASTVERTRAUEN_REFERENCE_ANALYSIS.md`.
3. `docs/VISUAL_RESET_AUDIT.md`, `docs/CSS_AUDIT.md`, `docs/TOOLING_AUDIT.md`.
4. Das aktive HTML, CSS und JavaScript sowie die Tests.
5. `docs/preservation-baseline.json` und die Logik von `tests/test_preservation.py`.

**Die frühere Forderung nach einem vollständigen visuellen Reset ohne Animationen ist für diese neue Gestaltungsphase ausdrücklich abgelöst.** Neues CSS und Animationen sind jetzt gewünscht. Die funktionalen Erhaltungsvorgaben gelten weiter. Passe entsprechende historische Kommentare und reine Null-Animations-Tests fachgerecht an, statt sie als Verbot dieses Auftrags zu interpretieren.

Bleibe bei statischem Hosting. Es gibt für diese Aufgabe keinen Grund für einen Wechsel zu WordPress, React, Next.js, einem CMS oder einem neuen Backend.

## 2. Analysiere die Referenz vor dem Entwerfen

Eine fundierte Untersuchung vom 8. September 2026 liegt im lokalen Referenzbericht. Nutze sie als Ausgangspunkt und überprüfe die Website selbst im Browser, soweit deine Werkzeuge das ermöglichen. Beschränke dich nicht auf Quelltext oder einen Screenshot des Heros.

Prüfe Desktop, Tablet und Mobilgerät, scrolle durch die Startseite, bediene FAQ, Preisumschalter und mobiles Menü und beobachte Buttons im Hover- und Fokuszustand. Öffne auch die dort verlinkten Angebots-, Kontakt- und Partnerseiten zur Einordnung wiederkehrender Komponenten. Übermittle dabei keine Formulare oder Registrierungen.

Trenne immer:

- wirklich beobachtete Effekte;
- aus aktiven CSS-/JS-Zuständen gemessene Parameter;
- deine eigenen gestalterischen Ergänzungen;
- Zustände, die du nicht prüfen konntest.

Die folgenden Fakten sind bereits konkret untersucht:

### Farb- und Formensprache der Referenz

| Rolle | Gemessener Wert |
| --- | --- |
| Hauptflächen | `#000000` |
| Dunkle Karten | `#101213` |
| Feine Kartenrahmen | `#303133`, 1 px |
| Blaugraue Abschnitte | `#1A2835` |
| Farbe im bewegten dunklen Verlauf | `#263A46` gegen Schwarz |
| Eisblauer Hauptbutton | `#CBF2FE`, schwarze Schrift |
| Weiterer heller Blauton | `#B7C8D0` |
| Warmer heller Akzent | `#EBDCC8` |
| Überschriften | Weiß |
| Sekundärtext dunkler Karten | `#9C9998` |

- Schrift: **Plus Jakarta Sans**.
- Desktop-H1 der Referenz: 50 / 60 px, Gewicht 600.
- Mobile H1 bei 390 px: 28 / 33,6 px, Gewicht 600.
- Häufige H2: 35 / 42 px, Gewicht 600.
- Kartenüberschriften: 20 / 30 px, Gewicht 600.
- Karten und Hero: 12 px Radius; Karten oft 36 px Innenabstand.
- Buttons: Pillenform, 14 px, Gewicht 500, etwa 15 × 36 px Padding.
- Eyebrow-Beispiel: 12 px, 2,4 px Laufweite, Großbuchstaben, dünne Kontur.
- Navigation etwa 84 px hoch. Die Hero-Fläche auf Desktop beginnt nach zusätzlichem Abstand bei y = 120 px.
- Große freie Zwischenräume, klare Raster, wenige gleichzeitig konkurrierende Akzente.

### Tatsächliche Referenzanimationen

| Effekt | Originalparameter / Beobachtung |
| --- | --- |
| Vorteilskarten von rechts | X: +100 → 0 px, Opacity: 0 → 1, 600 ms, `ease`, Delays 100 / 200 / 300 ms |
| Prozess-/Angebotstext von oben | Y: −100 → 0 px, Opacity: 0 → 1, 600 ms, `ease`, teilweise 200 / 300 ms Delay |
| Preiskarten von links | X: −100 → 0 px, Opacity: 0 → 1, 600 ms, `ease`, Delays 100 / 200 / 300 ms |
| Langsamer Bewertungsblock | Opacity: 0 → 1, 1400 ms, `ease` |
| Team-Bild/Text | Gegenläufige linke/rechte Einblendungen, meist 600 ms; Titel 100 ms, Text 300 ms verzögert |
| Organischer Hintergrund | Canvas-Noise, Schwarz und `#263A46`; interner Speed-Wert `200`, keine belegte Millisekunden- oder Loop-Dauer |
| Großer Hintergrundwechsel | Schwarz ↔ `#1A2835`; 1000 ms, `cubic-bezier(0.25, 1, 0.5, 1)`, abschnittsabhängig |
| Primärer Button-Hover | Gefülltes Eisblau → transparent mit eisblauer Kontur/Schrift; 200 ms, `cubic-bezier(0.785, 0.135, 0.15, 0.86)`; kein gemessener Transform |
| FAQ | Natürliche Höhe öffnen/schließen, 350 ms, `ease` |
| Preis-Tab | Opacity-Übergang 150 ms `linear`, danach erneut Karteneinblendungen |
| Mobiles Menü | Nach unten aufklappende dunkle Fläche, Höhe über 600 ms, `easeInOutCirc`; Burger mit 300-ms-Transition |
| Erklärgrafik | Eingebettetes stummes Loop-MP4, 1920 × 1080, 52,3 Sekunden |
| Zum-Seitenanfang-Button | Einblenden über 500 ms |

Wichtige Unterscheidungen:

- Der Startseiten-Hero ist ein statisches Hintergrundfoto, kein nachgewiesenes Hero-Video.
- Das bewegte Kommunikationsdiagramm ist ein Video. Seine Pfadbewegungen laufen nicht als SVG-Animation im Seiten-DOM.
- Lenis ist im Theme-Paket enthalten, aber `smoothScroll` war `off`, `window.lenis` nicht aktiv.
- Für den untersuchten initialen Zustand lieferte `ScrollTrigger.getAll()` keine Trigger.
- Magnetische Buttons, Cursor-Follower, Buchstaben-Splitting im Hero, Scroll-Pinning und ein endloses Logo-Marquee sind nicht als zentrale Referenzeffekte belegt.
- Eine Theme-Dokumentation beschreibt Möglichkeiten; sie beweist nicht, dass die Referenz diese verwendet.

Baue die tatsächliche sichtbare Wirkung nach. Kopiere keine WordPress-Theme-Dateien, fremden Fotos, Logos, Kundenaussagen oder das Referenzvideo in mein Repository.

## 3. Verbindliche kreative Richtung

Gestalte eine dunkle, persönliche Website für einen Spezialisten, der Websites und messbare Datenflüsse sauber umsetzt. Die Nähe zu Gastvertrauen soll bei Farben, Flächen, Typografie, Buttons, großzügiger Komposition und Bewegungsrhythmus sofort erkennbar sein.

Meine Website soll stärker auf **Tobias als Person, echte Projekte und die Verbindung von Website und Tracking** zugeschnitten sein. Behalte die vorhandene direkte, persönliche Sprache. Erfinde kein großes Agenturteam, keine Kundenstimmen, keine Conversion-Ergebnisse und keine Live-Daten.

Lege eine zusammenhängende Richtung fest und setze sie vollständig um:

- Eine breite, abgerundete Hero-Komposition mit starkem Text, eigenem Porträt und klaren Hauptaktionen.
- Schwarze Flächen als Grundton; dunkles Blaugrau für ausgewählte große Momente.
- Eisblau für Interaktion und feine Signale; Beige sparsam für besondere Titel und Hervorhebungen.
- Gut lesbare geometrische Typografie mit sorgfältigen Zeilenumbrüchen.
- Echte Fotografien und Projektmaterialien in großen, bewusst komponierten Bildflächen.
- Ruhige Karten mit feinen Konturen, wenig Schatten und konsistenten Radien.
- Gezielt choreografierte Einblendungen und weiche Farbwechsel.
- Eine selbst entworfene animierte Tracking-Erklärung als fachlicher Blickfang.

Die folgenden Ergänzungen sind eigene Entwurfsentscheidungen: etwas größere Desktop-H1, die Tracking-Grafik, kürzere Bewegungswege auf Mobilgeräten und eine gut erreichbare Möglichkeit, dekorative Bewegung zu pausieren. Bezeichne sie in deiner Dokumentation entsprechend.

## 4. Designsystem und CSS-Aufbau

Erstelle zuerst gemeinsame Tokens für Farbe, Typografie, Abstände, Radien, Rahmen, Ebenen und Motion. Verwende diese anschließend auf allen Seiten.

Ein sinnvoller Ausgangspunkt, nach Bildvergleich feinzujustieren:

```css
--color-bg: #000000;
--color-surface: #101213;
--color-surface-blue: #1a2835;
--color-atmosphere: #263a46;
--color-border: #303133;
--color-text: #ffffff;
--color-text-muted: #b3b0ae; /* bewusste Lesbarkeitsanpassung */
--color-accent: #cbf2fe;
--color-accent-soft: #b7c8d0;
--color-warm: #ebdcc8;
--radius-card: 12px;
--radius-pill: 999px;
--motion-ui: 200ms;
--motion-reveal: 600ms;
--motion-background: 1000ms;
--motion-slow-reveal: 1400ms;
--ease-reveal: ease;
--ease-ui: cubic-bezier(.785, .135, .15, .86);
--ease-background: cubic-bezier(.25, 1, .5, 1);
```

Diese Variablen sind ein Anfang, kein fertiges Design. Definiere zusätzliche semantische Zustandsfarben für Fehler, Erfolg, Fokus und deaktivierte Controls mit ausreichendem Kontrast.

Typografie:

- Verwende Plus Jakarta Sans, bevorzugt lokal gehostet als WOFF2 mit passender Lizenzdatei und `font-display: swap`.
- Lade nur tatsächlich benötigte Schnitte beziehungsweise eine sinnvoll begrenzte variable Datei.
- Zielwerte für den Entwurf: Hero Desktop ungefähr 56–72 px, mobil ungefähr 34–42 px; Abschnittstitel ungefähr 32–44 px, mobil 28–34 px; Fließtext 16–18 px bei etwa 1,6 Zeilenhöhe. Bei sehr langen bestehenden Titeln inhaltlich passend kleiner werden.
- Setze fließende Größen mit `clamp()`, ohne die mobile Lesbarkeit durch aggressive Skalierung zu beschädigen.
- Begrenze lange Lesetexte auf ungefähr 65–75 Zeichen pro Zeile. Blog-Artikel brauchen besonders gute Zeilenhöhe.
- Hauptüberschriften überwiegend Gewicht 600. Laufweite sorgfältig wählen; Eyebrows dürfen gesperrt sein, ganze Fließtextabsätze nicht.
- Prüfe echte deutsche und englische Zeilenumbrüche. Keine pauschalen `white-space: nowrap`-Regeln für Überschriften.

Layout:

- Breiter gemeinsamer Container, etwa 1200–1360 px; größere Bildflächen dürfen darüber hinausgehen.
- Außenabstände mobil etwa 20–24 px, Desktop etwa 36–64 px; große Sektionen ungefähr 96–144 px vertikal, mobil etwa 64–88 px. Passe sie an die konkrete Komposition an.
- Nutze Grid und Flexbox im natürlichen Dokumentfluss. Absolute Positionierung bleibt dekorativen Ebenen und klar definierten Overlays vorbehalten.
- Wechsle bewusst zwischen Zweispalten, offenen Textbereichen, Bildflächen, einzelnen großen Panels und vergleichbaren Karten.
- Buttons haben ausreichend große Trefferflächen, klare Fokuszustände und konsistente Größen. Mobile Hauptaktionen bei Platzbedarf stapeln.

CSS-Architektur:

- Baue das aktive Stylesheet nachvollziehbar auf: Tokens → Basis → Layout → Komponenten → Seitenvarianten → Motion → Responsive / Präferenzen.
- Ein gut strukturiertes gemeinsames `css/style.css` ist für dieses Projekt ausreichend. Wenn du Dateien aufteilst, aktualisiere Einbindung, Cache-Busting und Tests vollständig.
- Bevorzuge Klassen mit geringer Spezifität und gezielte Komponentenvarianten. Neue große Override-Anhänge lösen das Architekturproblem nicht.
- Bestehende funktionale Selektoren bleiben verwendbar; zusätzliche Klassen für Gestaltung sind erlaubt.
- Erhalte `[hidden] { display: none !important; }`, `.sr-only`, sinnvolle Medienbegrenzungen und die Scrollbarkeit langer Code-/Tabellenbereiche.
- Verwende kein globales `transition: all`. Benenne die tatsächlich animierten Eigenschaften.
- Verwende kein `overflow-x: hidden` auf dem gesamten Body, um fehlerhafte Geometrie zu verstecken. Begrenze ausschließlich die dekorative Bewegung innerhalb ihrer eigenen Komponente.
- Verwende `will-change` nur vorübergehend an tatsächlich bewegten Elementen.

## 5. Gestaltung sämtlicher Seitenfamilien

Erzeuge zu Beginn eine Seiteninventarliste. Es reicht nicht, nur die folgenden Beispiele zu ändern; alle tatsächlich vorhandenen HTML-Seiten müssen das gemeinsame System verwenden.

### Startseite: `/` und `/en/`

Bewahre die vorhandenen Texte, Hauptaktionen und Abschnitte. Entwickle deren visuelle Hierarchie:

1. **Hero:** Die vorhandene Überschrift und Beschreibung werden stark gesetzt. Das bereits verwendete Tobias-Foto erhält rechts einen großen, sauberen Bildbereich innerhalb einer breiten, abgerundeten Komposition. Verbinde die dunkle Textfläche optisch mit dem Foto. Gesicht und Text dürfen sich nicht überlagern. Auf Mobilgeräten folgt eine bewusst komponierte vertikale Variante. Kein Lade-Intro darf H1 oder CTA blockieren.
2. **Bestehende Problem-/Bedarfsargumente:** Klare dunkle Karten oder offene Zeilen mit ruhigen Icons; gestaffelte Einblendung wie die Vorteilskarten der Referenz.
3. **Persönlicher Abschnitt:** Großzügige Foto-/Textkomposition auf einer blaugrauen Fläche. Bestehende persönliche Aussagen bleiben erhalten.
4. **Drei Leistungen:** Tracking, Website und Betreuung erhalten ein sauberes Vergleichsraster. Die fachliche Schwerpunktsetzung darf Tracking hervorheben, ohne erfundene Beliebtheits- oder Verkaufsaussagen.
5. **Tracking-Erklärung:** Integriere die unten beschriebene eigene Grafik an einer inhaltlich sinnvollen Stelle bei der bestehenden Tracking-Leistung. Vermeide einen zusätzlichen langen Marketingtextblock.
6. **Projekte:** Hebe tatsächliche Projektbelege und vorhandene Bildmaterialien hervor. Klare Unterscheidung zwischen Kundenprojekten und Eigenprodukten.
7. **Zusammenarbeit:** Übertrage die vorhandenen Schritte in ein großes Prozesspanel mit linker Einleitung und rechter nummerierter Vertikale.
8. **Kontaktabschluss:** Großzügige schwarze Fläche, präzise Typografie und eine offensichtliche primäre Handlung.

### Leistungen: `/leistungen/` und `/en/services/`

- Gleiche visuelle Sprache wie die Startseite, eigenständig komponierter kompakter Hero.
- Einheitliche Preis-/Leistungskarten, ausgerichtete Informationshierarchie und klar erkennbare CTAs.
- Alle vorhandenen Preisangaben, Leistungsbestandteile und Zusatzoptionen erhalten.
- Bestehende technische Detailbereiche übersichtlich gestalten, ohne ganze Absätze zugunsten einer hübscheren Karte zu streichen.
- Prozesspanel und FAQ konsequent mit denselben Komponenten aufbauen.
- Keine neuen Monat/Jahr-Tabs erfinden, wenn die vorhandenen Angebote diese Logik nicht besitzen.

### Projekte: `/projekte/` und `/en/projects/`

- Das vorhandene BikeCare-Eigenprodukt erhält eine starke, eigenständige Präsentation mit vorhandenem Material.
- Kundenprojekte zeigen klare Titel, Rolle, Inhalt und vorhandene Ergebnisse in ruhigen Bild-/Textflächen.
- Bestehende native `details`/`summary`-Funktion erhalten; Desktop-/Mobilverhalten nachvollziehbar gestalten.
- Zeitleiste und Lernprojekte bleiben erhalten und visuell vom Kundenprojektbereich unterscheidbar.
- Keine erfundenen Produkt-Screenshots, Bewertungen oder Kennzahlen. Vorhandene Logos nicht als unlesbare Vollflächenbilder aufblasen.

### Über mich: `/ueber-mich/` und `/en/about/`

- Redaktionelle Foto-/Textkompositionen, die Persönlichkeit zeigen.
- Bestehende Bilder aus Island, Mallorca, Südamerika und dem Roadtrip sinnvoll verwenden, mit sorgfältigem Zuschnitt und passendem `srcset`.
- Raum zwischen Geschichten; persönliche Fotos dürfen größer sein als gewöhnliche Kartenbilder.
- Ausgewählte gegenüberliegende Bild-/Text-Reveals wie im Teamabschnitt der Referenz.
- Keine fachlichen oder persönlichen Aussagen ungefragt ändern, einschließlich bestehender Altersangaben.

### Kontakt: `/kontakt/` und `/en/contact/`

- Hochwertige, übersichtliche Zweispalte auf Desktop; natürlicher vertikaler Ablauf mobil.
- Ruhige dunkle Felder, sichtbare Labels, eindeutiger Fokus, gut lesbarer Hilfstext, sauber gestaltete Checkboxen, Selects und Zusatzoptionen.
- Passe auch Validierungsfehler, Senden, Erfolg, Netzwerkfehler, Wiederholung und Browser-Zurück-Zustand an das Design an.
- Die tatsächlich vorhandene Themenauswahl und alle abhängigen Felder müssen vollständig bedienbar bleiben.
- Kein neues Multi-Step-Formular und keine Übernahme des Referenz-Onboardings. Hier wird das bestehende Formular veredelt.

### Blog-Übersichten und alle DE-/EN-Artikel

- Übersicht: klare Gewichtung von Artikelserien, einzelnen Beiträgen, Datum und Themen.
- Artikel: gut lesbare dunkle Editorial-Gestaltung, nachvollziehbare Überschriftenhierarchie, Inhaltsverzeichnis, Links, Listen, Zitate, Hinweise, Tabellen und Codeblöcke.
- Lange Codezeilen und Tabellen dürfen innerhalb ihrer eigenen Container horizontal scrollen.
- Inhaltsverzeichnis und native Anker müssen unverändert zuverlässig funktionieren.
- Keine absatzweise Scrollanimation im Artikeltext. Maximal ein ruhiger Einstieg und wenige Bild-/Karten-Reveals.
- Linkfarbe und Unterstreichung müssen Links auch im Fließtext erkennbar machen.

### Rechtliches und 404

- `/impressum/`, `/datenschutz/`, `/agb/`, ihre englischen Entsprechungen und `404.html` erhalten die gemeinsamen Fonts, Abstände, Navigation, Footer und gut lesbare Textgestaltung.
- Rechtstexte bleiben vollständig unverändert. Lange Dokumente erhalten eine ruhige, stabile Hintergrundfläche.
- 404 erhält eine klare Hierarchie und funktionierende bestehende Rückwege.

## 6. Eigene animierte Tracking-Erklärung

Entwirf ein originales Schema, das dieselbe klare, ruhige Wirkung wie das Referenzvideo hat und meine Kompetenz erklärt.

Visuell:

- Breiter dunkler Rahmen mit feiner Kontur und 12-px-Radius innerhalb einer blaugrauen Sektion.
- Wenige Stationen, dünne weiße/blaugraue Verbindungen und kleine eisblaue Signale.
- Die Grafik folgt dem Thema Website → Consent-Prüfung → Tags / Server → Analytics, Ads, CRM. Beschrifte sie in DE und EN passend.
- Zeige einen schematischen Ablauf. Suggeriere weder echte Besucheraktivität noch die tatsächliche Verbindung eines konkreten Kundenkontos.
- Stelle die Consent-Prüfung verständlich dar; animiere keine generelle Freigabe sämtlicher Analytics-/Ads-Daten unabhängig von einer Entscheidung.
- Verwende vorhandene zugelassene Logos, wenn wirklich sinnvoll; neutrale beschriftete Knoten sind häufig klarer.

Technik und Motion:

- Bevorzuge ein eigenes SVG mit zugänglicher Beschreibung und wenigen bewegten Signalpunkten. Keine neue 3D-Engine für eine zweidimensionale Erklärung.
- Halte die statischen Labels als klaren, lesbaren Inhalt verfügbar. Dekorative Signalpunkte bekommen keine wiederholten Screenreader-Ansagen.
- Entwurfsrhythmus: ungefähr 6–8 Sekunden für eine vollständige Erklärsequenz, kurze ruhige Pause, dann Wiederholung. Das ist eine neue Vorgabe, nicht die gemessene Videolänge.
- Desktop zeigt den Ablauf überwiegend horizontal; mobil eine einfache vertikale Anordnung, ohne Miniaturschrift und abgeschnittene Pfade.
- Bei reduzierter Bewegung: vollständiges statisches Schema. Bei Offscreen oder verborgenem Browser-Tab: pausieren.
- Biete einen verständlich beschrifteten Pause-/Fortsetzen-Button für dekorative Bewegung an. Dieser kann zugleich die organischen Hintergrundbewegungen steuern; übersetze ihn in DE/EN und speichere eine explizite Nutzerentscheidung lokal, sofern möglich. Fehlender Speicherzugriff darf nichts beschädigen.
- Die initiale Seite bleibt leicht: Eine Diagramm- oder Font-Ressource darf die Grundnavigation und das Kontaktformular nicht aufhalten.

## 7. Konkrete Motion-Implementierung

Verwende CSS-Transitions/Keyframes sowie einen kleinen Motion-Controller mit IntersectionObserver und gegebenenfalls Web Animations API. Die genannten Referenzeffekte benötigen keine pauschale Wiederinstallation der alten Animationsbibliotheken.

### Einblendungen

- Vorteil-/Servicekarten: 600 ms, `ease`, Desktop nach Bedarf aus +100 px oder −100 px, Opacity 0 → 1. Gestaffelte Starts mit 100 / 200 / 300 ms entsprechen der Referenz.
- Prozessschritte: gezielte Einblendung von oben, 600 ms. Verwende den vollen 100-px-Weg nur, wenn die reale Komposition das trägt; bei dichten Textgruppen kürzere Wege dokumentiert einsetzen.
- Ein langsamer 1400-ms-Fade darf einen echten Projektbeleg-/Vertrauensabschnitt hervorheben. Verwende diese Dauer sparsam.
- Mobil: seitliche Bewegungswege auf 20–28 px reduzieren oder einen kurzen vertikalen Weg wählen; Staffelung auf etwa 60–100 ms begrenzen. Inhalt soll früh lesbar sein.
- Als eigene Trigger-Vorgabe: ungefähr beim Eintritt in die unteren 90 % des Viewports auslösen, etwa mit `rootMargin: 0px 0px -10% 0px` und kleiner geeigneter Schwelle. Sehr hohe Elemente dürfen nie auf eine unerreichbare Sichtbarkeitsquote warten.
- Reveals laufen normalerweise einmal pro Seitenaufruf. Beim Zurückscrollen verschwinden Inhalte nicht wieder. Funktionale Panels dürfen beim gezielten Öffnen eine eigene kurze Eintrittsanimation haben.

### Hintergründe

- Setze den abschnittsabhängigen Wechsel Schwarz ↔ `#1A2835` mit 1000 ms und `cubic-bezier(.25,1,.5,1)` auf der Startseite um.
- Definiere die aktive Sektion deterministisch, beispielsweise über eine Aktivierungszone um die Viewportmitte. Bei schnellem Vor-/Zurückscrollen darf die Farbe nicht flackern.
- Beschränke den Effekt auf passende große Abschnitte. Alle Textfarben müssen während des gesamten Farbwechsels lesbar bleiben.
- Erzeuge wenige sehr dunkle organische Verlaufsflächen in Prozess-/Diagramm-Panels. Beginne mit zwei bis drei eigenen weichen CSS-Verläufen, die langsam über Transform/Opacity driften. Ein Entwurfszyklus von ungefähr 12–20 Sekunden ist möglich; justiere ihn nach sichtbarer Wirkung.
- Nur wenn die CSS-Version erkennbar nicht die gewünschte Referenzwirkung erreicht, verwende einen kleinen eigenen Canvas mit begrenzter Auflösung und sauberer Pausenlogik. Kopiere keinen Uncode-Noise-Code.

### Interaktionen

- Buttons: 200-ms-Farb-/Rahmenwechsel wie in der Referenz, auch konsistent für Tastaturfokus. Hauptaktionen bleiben im Ruhezustand klar gefüllt.
- Karten benötigen vor allem gute Flächen und Konturen. Ein sehr kleiner Hover-Unterschied ist erlaubt; große Kipp-, Magnet- und Mausfolger-Effekte gehören nicht zu diesem Entwurf.
- FAQ: 350-ms-Öffnung auf natürliche Höhe; schnelle Mehrfachbetätigung und Abbruch sauber behandeln. Inhalte dürfen nicht an einer festen `max-height` abgeschnitten werden.
- Mobiles Menü: optisch passende dunkle Fläche unter dem Header, sanftes Öffnen nach unten und konsistente Burger-/Schließen-Darstellung. Orientiere dich an 600 ms der Referenz, verkürze nur begründet nach Bedienprüfung.
- Sprachmenü: kurzer, ruhiger Übergang. Fokus, Escape und Klick außerhalb funktionieren jederzeit.
- Native Anker bleiben erhalten. Optionales CSS-Smooth-Scrolling nur bei normaler Bewegungspräferenz. Kein globales Scroll-Hijacking und keine Lenis-Pflicht.

### Funktion und Animation sauber trennen

- Das HTML ist standardmäßig sichtbar und nutzbar. Inhalte werden niemals pauschal durch eine globale `.js`-Klasse unsichtbar gemacht.
- Bevorzuge das Starten einer Animation erst beim Trigger auf einem ansonsten sichtbaren Element. Wenn ein vorbereiteter Zustand nötig ist, aktiviere ihn nur nach erfolgreicher Initialisierung für das konkrete Element und räume ihn bei Abbruch zuverlässig auf.
- `data-ui-ready` bleibt ein Signal für die vorhandene UI-Initialisierung. Nutze einen eigenen Motion-Zustand, falls erforderlich.
- `hidden`, `inert`, `aria-expanded`, Fokus und Formularzustände bleiben die verlässliche Wahrheit. Verlasse dich funktional nicht ausschließlich auf `animationend` oder `transitionend`.
- Beim Schließen eines Menüs/FAQ darf keine unsichtbare, weiter fokussierbare Fläche verbleiben. Nutze bei Bedarf eine dekorative animierte Hülle oder einen klaren abbrechbaren Zustandsablauf mit sicherem Abschluss.
- Wechsel der Bewegungspräferenz, Resize, Browser-Zurück und ein abgebrochener Effekt müssen im sinnvollen finalen Zustand enden.
- Bei `prefers-reduced-motion: reduce`: keine dekorativen Translations-, Skalierungs-, Parallax-, Loop- oder Hintergrundwechselanimationen. Alle Inhalte unmittelbar sichtbar; Funktion bleibt vollständig erhalten. Eine explizite Pausenentscheidung respektieren.
- Pausiere kontinuierliche Effekte außerhalb des Viewports und bei `document.hidden`. Keine ungebremste RAF-Schleife pro Karte.

## 8. Unverändert zu erhaltende Verträge

Das visuelle Redesign erlaubt notwendige neue Wrapper, Layoutklassen, semantisch saubere Gruppierungen, neue Dekoration und die eigene Erklärgrafik. Es erlaubt kein beiläufiges Umschreiben oder Entfernen bestehender Inhalte und Integrationen.

Erhalte insbesondere:

- Alle vorhandenen Routen, internen/externalen Ziel-URLs, Sprachzuordnungen, Anker und Download-/Feed-Verknüpfungen.
- Bestehende sichtbare Texte, Preise, Leistungsbestandteile, Projektangaben, Blogartikel und rechtliche Texte.
- Seitentitel, Meta-Beschreibungen, Canonicals, Hreflang, Open Graph, strukturierte Daten, Sitemap und Robots-Konfiguration, soweit keine rein technische Asset-Aktualisierung erforderlich ist.
- Bestehende Tracking-/Consent-Einbindungen, deren Einwilligungslogik und Ereignisnamen. Kein neuer Analytics-Anbieter.
- Formular-Endpunkt, Payload-Schlüssel, Themen-/Add-on-Logik, Validierung, Timeout, Fehler, Wiederholung, Erfolg und Wiederherstellung nach Navigation.
- Das bestehende `generate_lead`-Ereignis: Erfolg genau einmal, kein Erfolgsevent bei fehlgeschlagener Anfrage.
- Wichtige Hooks wie `#burger`, `#drawer`, `#langBtn`, `#langDropdown`, `#main-content` sowie die vorhandenen Formular- und FAQ-IDs.
- Native `details`/`summary`, Skip-Link und logische Tab-Reihenfolge.
- Ohne JavaScript: sichtbare normale Navigation und Sprachlinks, zugängliche Inhalte/FAQ, bisheriger sinnvoller Formular-Fallback; keine scheinbar funktionierende Senden-Aktion, die nichts versendet.

Die Navigationslogik teilt derzeit eine Grenze von 768 px in CSS und JS. Wenn das neue Layout früher in die mobile Navigation wechseln muss, aktualisiere alle davon abhängigen CSS-/JS-/Teststellen gemeinsam. Eine einzelne neue CSS-Grenze bei unveränderter JS-Logik genügt nicht.

Bewahre existierende Assets. Optimierte Varianten sind erlaubt, wenn Herkunft, Darstellung, Alt-Texte und Ressourcenreferenzen nachvollziehbar bleiben. Prüfe vorhandene Bilder visuell vor ihrer Auswahl. `assets/img/about/ueber-mich-roadtrip.webp` und `Profilbild2.webp` sind echte vorhandene Porträts; wähle den Einsatz passend zur jeweiligen Seite.

## 9. Tests fachgerecht weiterentwickeln

Die bestehende Suite hat 26 Tests und schützt wichtige Funktionen. Lies ihre konkreten Assertions, bevor du sie änderst.

Insbesondere veraltet für diesen Auftrag sind:

- `test_no_runtime_animation_dependencies` in `tests/test_static.py`: verbietet bisher unter anderem Animation, Transition, RAF/Timer und SVG-Motion.
- `test_all_pages_responsive_and_no_animations` in `tests/test_browser.py`: erwartet bislang überall null Animationen/Transitions.
- Teile von `test_without_javascript_and_reduced_motion`: erwarten auch bei `no-preference` weiterhin null Bewegung.

Ersetze diese reinen Reset-Annahmen durch sinnvolle neue Kriterien:

1. Bei normaler Bewegungspräferenz laufen die geplanten Effekte an passenden Auslösern und enden korrekt.
2. Bei reduzierter Bewegung sowie expliziter Pause laufen keine dekorativen Animationen weiter. Ein Wechsel während eines laufenden Effekts räumt dessen Zustand auf.
3. Inhalte bleiben nach fehlender Motion-Initialisierung, deaktiviertem JS, schnellem Scrollen, Resize und Browser-Zurück sichtbar und erreichbar.
4. Menüs, FAQ, Projektdetails und Formular bleiben während und nach Übergängen funktionsfähig.
5. Kein horizontaler Seitenoverflow, keine kaputten Bilder, keine fehlenden lokalen Ressourcen und keine eigenen Browserfehler.

Beachte: `document.getAnimations()` erfasst nicht beliebige Canvas-RAF-Schleifen. Prüfe bei einem Canvas zusätzlich, ob dessen Updates bei Pause/offscreen/reduced motion tatsächlich stoppen.

Der Erhaltungstest vergleicht derzeit auch Text, Bilder und `data-*`-Attribute sehr strikt. Neue Motion-Hooks oder die neue Diagrammbeschriftung können deshalb eine eng begrenzte Anpassung erfordern. Dokumentiere solche erlaubten Ergänzungen gezielt. Prüfe bestehende Inhalte und Integrationen weiterhin gegen die ursprüngliche Basis; überschreibe nicht einfach die gesamte Baseline mit deinem Ergebnis. Für bewusst veränderte Bildvarianten oder zusätzliche Dekoration braucht es eine nachvollziehbare eng gefasste Ausnahme. Metadaten, vorhandene fachliche Texte, Links und Formularverträge bleiben geschützt.

Führe die erforderlichen Tests aus, zum Beispiel mit der vorhandenen Python-Umgebung:

```text
python -m unittest discover -s tests -p "test_*.py"
```

Passe den Aufruf an die tatsächlich vorhandene Umgebung an. Mocke externe Formular- und Tracking-Anfragen in Tests; sende keine Testanfragen an das produktive Kontaktformular.

## 10. Visuelle und technische Abnahme

Du bist erst fertig, wenn alle Seitenfamilien sichtbar gestaltet und geprüft sind. Tests ersetzen die visuelle Prüfung nicht.

Prüfe mindestens:

- Alle vorhandenen 35 HTML-Seiten auf Struktur, Ressourcen und gemeinsame Gestaltung.
- Die bestehende Viewport-Matrix: 320 × 740, 768 × 1024, 1024 × 768, 1440 × 900, 2560 × 1440 und 812 × 375.
- Zusätzlich repräsentative Screenshots bei 390 × 844 und 1440 × 1000 für den Vergleich mit der Referenz.
- Je ein vollständiger Durchlauf von Startseite, Leistungen, Projekten, Über mich, Kontakt, Blogübersicht, langem Blogartikel, Rechtstext und 404; DE und EN berücksichtigen.
- Menüs geschlossen/geöffnet, Sprachmenü, Hover/Fokus, FAQ geschlossen/geöffnet, Formular mit Zusatzoptionen sowie Fehler-/Erfolgszustand.
- Normale Bewegung, reduzierte Bewegung, Pause, JS deaktiviert und nach Möglichkeit blockiertes Motion-Skript.
- Tastaturbedienung, Escape, Fokus nach Schließen, 200-%-Zoom, lange Überschriften und schmale Querformate.
- Keine durch Sticky-Elemente überdeckten Ankerziele oder Fokusringe.

Nutze `tests/capture_visuals.py`, falls es geeignet ist, oder eine begrenzte eigene Browseraufnahme. Vergleiche Screenshots aktiv und korrigiere sichtbare Schwächen: Abstände, Textumbrüche, Bildzuschnitte, unruhige Raster, unfertige Zustände und unterschiedliche DE-/EN-Qualität.

Performance-Ziele für die neue Gestaltung:

- Kein blockierender Seitenlader; H1, Navigation und Haupt-CTA sofort verfügbar.
- Bilder mit festen Abmessungen / Seitenverhältnissen und passenden Größen; nur das tatsächliche wichtige Hero-Medium priorisieren.
- Keine Layout-Sprünge durch Fonts, Bildnachladen oder Diagramminitialisierung.
- Eigener CSS-Zuwachs nach Möglichkeit unter 40 KB gzip, zusätzliche Motion-Logik unter 20 KB gzip; Fonts und Bilder separat messen. Das sind Arbeitsbudgets, keine bereits erreichten Messwerte.
- Keine neue UI-/Animationsbibliothek ohne konkret begründeten Mehrwert. Ein kleines statisches Projekt soll klein bleiben.
- Prüfe Scrollen und Interaktion auf unnötige Long Tasks, dauerhafte Layoutmessungen und großflächig teure Filter. Dokumentiere Messbedingungen; erfinde keine Lighthouse- oder Core-Web-Vitals-Werte.
- Gute Kontraste in allen Zuständen, ausreichend große Trefferflächen und gut sichtbare Tastaturfokusse. Prüfe die tatsächlich kombinierten Farben auf Fotos und Verläufen.

## 11. Arbeitsablauf und Ergebnis

Arbeite in nachvollziehbaren Schritten, ohne nach jedem gewöhnlichen Designschritt auf Bestätigung zu warten:

1. Repository und vorhandene Verträge verstehen; Seiten- und Komponentenbestand erfassen.
2. Referenzbericht lesen und zentrale Design-/Motion-Befunde im Browser prüfen.
3. Eine konkrete Gestaltung festlegen und Tokens, Typografie sowie globale Komponenten umsetzen.
4. Die komplette Startseite inklusive eigener Tracking-Grafik und Motion ausarbeiten.
5. Dasselbe System auf sämtliche Seitenfamilien und beide Sprachen übertragen.
6. Alte Null-Animations-Annahmen gezielt aktualisieren, Erhaltungstests weiterführen.
7. Funktionale Tests, responsive Screenshots und reale Bedienprüfung durchführen; sichtbare Probleme korrigieren.
8. Asset-Hashes und notwendige Einbindungen konsistent aktualisieren. Beachte `bump_assets.py` und `.githooks/pre-commit`; eine zusätzliche JS-/CSS-Datei benötigt ebenfalls eine nachvollziehbare Cache-Strategie.
9. Änderungen und Prüfresultate kurz dokumentieren.

Erstelle zusätzlich:

- `docs/DESIGN_SYSTEM.md`: Tokens, Typografie, Layoutprinzipien, Komponenten und Seitenvarianten.
- `docs/MOTION_SYSTEM.md`: pro Effekt Auslöser, Ziel, Dauer, Weg, Easing, Delay, Wiederholung, mobile Variante und Verhalten bei reduzierter Bewegung / Pause.
- `docs/REDESIGN_VALIDATION.md`: tatsächliche Prüfergebnisse, Seiten-/Viewport-Abdeckung, Screenshotpfade, begründete Abweichungen von der Referenz und verbleibende Einschränkungen.

Im Abschlussbericht nenne die konkret umgesetzte Gestaltung, die abgedeckten Seiten, das Testergebnis und den erreichbaren lokalen Vorschau-Link. Starte eine lokale Vorschau, wenn deine Umgebung dies ermöglicht. Wenn du einen Schritt nicht verifizieren konntest, benenne ihn eindeutig.

Die aktuelle Aufgabe endet mit einer vollständig implementierten und geprüften lokalen Version. Git-Push und produktives Deployment sind ein separater Auftrag, sofern sie nicht zusätzlich ausdrücklich für diese neue Version angefordert werden. Überschreibe keine fremden oder zwischenzeitlichen Änderungen und verwende keinen Force-Push.

**Beginne jetzt mit der Analyse des tatsächlichen Repository-Zustands und führe anschließend die vollständige Umsetzung bis zur geprüften Vorschau durch. Triff die üblichen gestalterischen und technischen Entscheidungen selbst. Halte mich mit kurzen, konkreten Zwischenständen auf dem Laufenden.**

## Primärquellen für die Umsetzung

Die Referenzmessungen und genaue Untersuchungsgrenzen stehen in `docs/GASTVERTRAUEN_REFERENCE_ANALYSIS.md`. Besuche die [Referenzseite](https://gastvertrauen.com/) für den visuellen Vergleich; unterscheide aktuelle Änderungen von den protokollierten Werten.

Für Sichtbarkeits-Trigger und das Pausieren außerhalb des Viewports: [MDN – Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).

Für das Respektieren der Bewegungspräferenz: [MDN – prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).

Für kontinuierlich bewegte Inhalte und ihre Pausenmöglichkeit: [W3C – Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).

Für die Schriftfamilie: [Google Fonts – Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans). Verwende eine geeignete offizielle Fontquelle und behalte die Lizenz bei.
