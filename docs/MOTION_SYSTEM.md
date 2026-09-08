# Bewegungssystem — Meixner Digital

Stand: 8. September 2026. Umgesetzt in `css/style.css` (Abschnitt 13) und
`js/main.js` (`initMotion`). Referenz-IDs M01–M13 verweisen auf
[GASTVERTRAUEN_REFERENCE_ANALYSIS.md](GASTVERTRAUEN_REFERENCE_ANALYSIS.md).

**Keine Animationsbibliothek.** Kein GSAP, kein ScrollTrigger, kein Lenis, kein
three.js. Die Bewegung besteht aus CSS-Transitions, wenigen Keyframes, einem
IntersectionObserver und der Web Animations API für die FAQ-Höhe. Das erzwingt
`tests/test_static.py::test_motion_stays_dependency_free_and_css_is_safe`.

## 1. Trennung von Funktion und Animation

Das HTML ist standardmäßig sichtbar. Der vorbereitete Reveal-Zustand hängt an
`html.js-motion`, und diese Klasse setzt **nur JavaScript** — und nur, wenn die
Initialisierung erfolgreich war und Bewegung erwünscht ist.

Daraus folgt: ohne JS, bei blockiertem Skript, bei fehlendem
`IntersectionObserver`, bei reduzierter Bewegung oder bei ausdrücklicher Pause ist
jeder Inhalt sofort sichtbar. Geprüft in
`test_without_javascript_and_reduced_motion`.

`data-ui-ready` bleibt das Signal der UI-Initialisierung. Bewegung nutzt einen
eigenen Zustand und mischt sich dort nicht ein.

## 2. Effekte

| Effekt | Auslöser | Weg | Dauer | Easing | Delay | Wiederholung | Mobil | Reduziert / Pause |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Reveal Vergleichskarten (M01) | Eintritt in den Viewport | X +100 → 0, Opacity 0 → 1 | 600 ms | `ease` | 100/200/300/400 ms über `data-d` | einmal pro Aufruf | X auf 24 px, Delays 60–240 ms | sofort sichtbar |
| Reveal Preis-/Servicekarten (M03) | wie oben | X −100 → 0 | 600 ms | `ease` | wie oben | einmal | wie oben | sofort sichtbar |
| Reveal Überschriften, Panels (M02) | wie oben | Y −32 → 0 | 600 ms | `ease` | wie oben | einmal | Y −19 px | sofort sichtbar |
| Langsamer Projektbeleg (M04) | wie oben | nur Opacity | **1400 ms** | `ease` | wie oben | einmal | auf 600 ms verkürzt | sofort sichtbar |
| Gegenläufige Spalten (M05) | wie oben | erste Spalte von links, letzte von rechts | 600 ms | `ease` | — | einmal | 24 px | sofort sichtbar |
| Hintergrundwechsel (M07) | aktive Sektion | Schwarz ↔ `#0d151d` | 1000 ms | `cubic-bezier(.25,1,.5,1)` | — | beidseitig | wie Desktop | aus |
| Organische Verlaufsflächen (M06) | dauerhaft im Prozesspanel | Transform + Scale | 19 s / 23 s | `--ease-background` | — | `infinite alternate` | wie Desktop | aus |
| Button-Hover (M08) | Hover, Fokus | Farbe, Rahmen | 200 ms | `cubic-bezier(.785,.135,.15,.86)` | — | — | wie Desktop | bleibt (funktionales Feedback) |
| FAQ öffnen (M09) | Klick, Enter | Höhe 0 → natürlich | 350 ms | `ease` | — | pro Öffnung | wie Desktop | ohne Animation, Zustand identisch |
| Mobiles Menü / Burger | Klick | Striche zu Kreuz | 300 ms | `--ease-ui` | — | — | — | bleibt (funktionales Feedback) |
| Tracking-Signale | dauerhaft, sichtbar | Punkt entlang der Verbindung | 7 s Zyklus | `linear` | 0 / 1,4 / 2,8 s | `infinite` | senkrecht statt waagerecht | aus |

**Der 1400-ms-Fade wird bewusst nur einmal verwendet** — für die Projektkarten der
Startseite, den einzigen echten Vertrauensabschnitt. Auf Mobilgeräten fällt er auf
600 ms zurück, damit der Inhalt früh lesbar ist.

**Richtungen ohne neue Attribute.** Die Referenz unterscheidet Einlaufrichtungen je
Komponente. Da das Markup nur `reveal` und `data-d` kennt und `data-*`-Attribute
vom Erhaltungstest exakt geprüft werden, ergibt sich die Richtung aus dem
**Kontextselektor** (`.pain-card.reveal`, `.svc-main-card.reveal`, …).

## 3. Trigger-Vorgabe (Entwurf)

`rootMargin: 0px 0px -10% 0px`, `threshold: 0`. Elemente, die beim Laden bereits im
oder über dem Viewport liegen, gelten sofort als angekommen — sehr hohe Elemente
warten damit nie auf eine unerreichbare Sichtbarkeitsquote.

**Nachlauf gegen verpasste Elemente.** Ein IntersectionObserver tastet ab und kann
bei sehr schnellem oder programmatischem Scrollen Elemente überspringen. Das war
kein theoretisches Risiko: die Testmatrix hat es bei 812 × 375 reproduzierbar
ausgelöst, Inhalte blieben unsichtbar. Deshalb läuft zusätzlich ein per
`requestAnimationFrame` gedrosselter Scroll-/Resize-Nachlauf, der ausstehende
Elemente einholt. Er hängt sich selbst aus, sobald nichts mehr aussteht.

Ein pauschales Zeit-Sicherheitsnetz gibt es bewusst **nicht** mehr — es hätte den
eigentlichen Fehler nur verdeckt.

Reveals laufen einmal pro Seitenaufruf. Beim Zurückscrollen verschwindet nichts.

## 4. Hintergrundwechsel

Die aktive Sektion wird über eine Zone um die Viewportmitte bestimmt
(`rootMargin: -45% 0px -45% 0px`) und über einen Zähler aktiver Zonen gehalten.
Dadurch flackert die Farbe bei schnellem Vor- und Zurückscrollen nicht. Betroffen
sind `.about-strip` und `.why-box`. Lange Blogtexte bleiben optisch stabil.

## 5. Reduzierte Bewegung und ausdrückliche Pause

Bei `prefers-reduced-motion: reduce` entfallen alle dekorativen Translationen,
Skalierungen, Loops und der Hintergrundwechsel; Inhalte sind unmittelbar sichtbar.
Wechselt die Präferenz **mitten in der Sitzung**, räumt `handleReduceMotionChange`
auf: `js-motion` fällt weg, alle Reveals gehen in ihren sichtbaren Endzustand, der
Hintergrund wird zurückgesetzt, der Pause-Schalter entfernt.

Zusätzlich gibt es einen sichtbaren **Pause-/Fortsetzen-Schalter** (WCAG 2.2
„Pause, Stop, Hide"; Entwurf). Er wird von `js/main.js` erzeugt und liegt außerhalb
von `<main>`, damit dafür kein Seitenmarkup geändert werden musste. Beschriftung
DE/EN, `aria-pressed`, Entscheidung in `localStorage` unter `motion-preference`.
Fehlender Speicherzugriff wird abgefangen und beschädigt nichts — die Entscheidung
gilt dann nur für die aktuelle Seite. Wenn das System bereits reduzierte Bewegung
meldet, erscheint der Schalter nicht.

## 6. Robustheit

- FAQ: `hidden`, `aria-expanded` und die Klasse gelten **sofort**; die Höhenanimation
  ist reine Dekoration. Beim Schließen greift `hidden` unmittelbar, es bleibt keine
  unsichtbare, weiter fokussierbare Fläche stehen. Mehrfaches schnelles Betätigen
  bricht die laufende Animation sauber ab (`cancel`), Höhenreste werden entfernt.
- Keine ungebremste RAF-Schleife: Der einzige RAF-Einsatz ist der gedrosselte
  Reveal-Nachlauf, der sich beendet.
- Kein Canvas, kein Scroll-Hijacking, keine magnetischen Buttons, kein
  Cursor-Follower, kein Buchstaben-Splitting — alles Effekte, die die Referenzanalyse
  ausdrücklich **nicht** belegen konnte.
