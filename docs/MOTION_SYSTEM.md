# Bewegungssystem — Meixner Digital

Stand: 12. September 2026. Umgesetzt in `css/style.css` (Abschnitt 17) und
`js/main.js` (`initMotionToggle`).

**Keine Animationsbibliothek.** Kein GSAP, kein ScrollTrigger, kein Lenis, kein
three.js. Die Bewegung besteht aus scroll-gebundenen CSS-Animationen, wenigen
Keyframes, View Transitions und der Web Animations API für die FAQ-Höhe. Das
erzwingt `tests/test_static.py`.

## 1. Auftritt beim Hereinscrollen

Nachgebaut nach gastvertrauen.com. Dort gemessen, nicht geschätzt:

| | Wert |
| --- | --- |
| Dauer | 0,6 s |
| Kurve | `ease` |
| Versatz | 100 px |
| Staffelung | 100 / 200 / 300 ms |
| Auslösung | Oberkante rund 26 % der Fensterhöhe über dem unteren Rand |

Die Vorlage benutzt vier Richtungen und wechselt sie je Abschnitt. Hier sind
sie den Bausteinen zugeordnet, die inhaltlich dasselbe tun:

| Richtung | Bausteine |
| --- | --- |
| von rechts | Merkmals- und Eintragskästen (`.pain-card`, `.svc-card`, `.svc-detail-card`, `.skill-card`, `.travel-card`, Kennzahlen) |
| von links | Preisblöcke und Projektkarten (`.svc-main-card`, `.scope-tier`, `.proj-card`, `.case-card`) |
| von oben | nummerierte Abläufe (`.step-card`, `.tl-item`) |
| nur Deckkraft, 1 s | Fotoplatten, Abschnittsköpfe, lange Listen |

Die Staffelung liest das Markup aus `data-d`, das bereits vorhanden war;
Reihen ohne `data-d` staffeln über `:nth-child`.

**Zwei Unterschiede zur Vorlage, beide mit Grund:**

1. Dort ist `opacity: 0` der Grundzustand des Markups — fällt das Skript aus,
   bleibt die Seite leer. Hier hängt der versteckte Zustand an
   `html[data-ui-ready]`. Ohne JavaScript ist alles sofort da, was
   `test_without_javascript_and_reduced_motion` festhält.
2. Ein IntersectionObserver meldet nichts, wenn ein Element den Sichtbereich
   nie schneidet — beim Sprung ans Seitenende oder über eine Sprungmarke.
   Solche Abschnitte blieben dauerhaft unsichtbar. `initReveal` hat deshalb
   eine Nachlese über `scroll`/`resize` mit Bild- und Zeitdrosselung;
   `test_reveal_survives_a_jump` hält das fest.

Nur der innerste Träger bewegt sich (`:not(:has(.reveal))`) — sonst führe erst
die Fläche ein und darin noch einmal jede Karte.

### Der Hintergrund wechselt nicht von selbst

Gemessen über die gesamte Höhe der Vorlage: die Body-Klassen ändern sich beim
Scrollen kein einziges Mal. Es gibt dort keinen umschaltenden Hintergrund. Die
Seite besteht aus Blöcken mit festen Flächen (schwarz, `#1a2835`, `#f7f7f7`,
weiß), die beim Durchscrollen aufeinander folgen — dasselbe Prinzip wie unser
Wechsel zwischen Ink und Papier.

## 2. Bilder, Reaktion und Kennzahlen

**Fotoplatten** fahren scroll-gebunden von Maßstab 1,04 auf 1 (vorher 1,06 —
der Weg soll zu sehen sein, nicht auffallen). Betroffen sind nur echte
Fotoplatten: Hero, Porträts und die Reisebilder. Kundenlogos und Sinnbilder
bleiben ruhig.

**Reaktion beim Überfahren** — bewusst nicht der übliche Kartenhub mit
Schatten, den jede zweite Seite benutzt. An der oberen Kante zeichnet sich
eine Signallinie ein, dieselbe Geste wie in der Navigation. Weil die bei einer
hohen Karte beim Lesen im unteren Teil nicht zu sehen ist, färbt sich
zusätzlich der Rahmen gedämpft mit. Gilt nur bei Zeigergeräten
(`hover: hover` und `pointer: fine`) — auf dem Handy löste der Effekt beim
Tippen aus und blieb danach stehen.

**Kennzahlen** zählen beim Erscheinen hoch. Die Werte sind sehr unterschiedlich
geschrieben: `30-40 %`, `>2,5 Mrd.`, `700.000+`, `100<em>/100</em>`, aber auch
`v2`, `3 Modelle` oder `Token für Token`. Deshalb wird nicht der Text ersetzt,
sondern es werden nur die Ziffernfolgen **in den Textknoten** hochgezählt —
Markup, Vorzeichen, Einheiten und Trennzeichen bleiben unberührt. Einstellige
Zahlen bleiben stehen (bei `v2` oder `4+` wäre Hochzählen sinnlos), und am Ende
wird immer der Originaltext zurückgeschrieben, damit keine Rundung stehen
bleibt. Gemessen: 39 Zellen über fünf Seiten, **null Abweichungen** gegen den
Wert im Markup.

Die Breite wird für die Dauer des Zählens festgehalten, sonst springt die
Zeile.

## 3. Grundsatz: Bewegung versteckt nichts

Die vorherige Fassung blendete jeden Abschnitt beim Scrollen ein. Das ist aus
zwei Gründen abgeräumt:

1. Es ist das Muster, das jede zweite erzeugte Seite benutzt.
2. Es versteckt Inhalt. Wer nicht scrollt oder wessen Browser den Effekt nicht
   auslöst, sieht eine leere Seite. Genau das trat in der Messung auf.

Die Bewegung liegt jetzt dort, wo sie nichts verdeckt: **an den Bildern und an
den Trennlinien**. Jeder Inhalt ist von der ersten Millisekunde an sichtbar,
mit und ohne JavaScript.

## 4. Effekte

| Effekt | Auslöser | Was | Dauer | Wiederholung | Reduziert / Pause |
| --- | --- | --- | --- | --- | --- |
| Hero-Auftritt | Seitenaufbau | Opacity 0→1, 18 px aufwärts, gestaffelt 0–300 ms | 900 ms | einmal | aus |
| Bildplatten | Scroll | Maßstab 1.06 → 1.0 über den Sichtbereich | scroll-gebunden | stetig | aus |
| Trennlinien | Scroll | Haarlinie zeichnet sich von 0 auf volle Breite | scroll-gebunden | stetig | aus |
| Seitenwechsel | Navigation | Cross-Document View Transition, weicher Übergang | 220/320 ms | je Wechsel | aus |
| Nav-Unterstreichung | Hover | Linie fährt von links ein | 280 ms | — | bleibt |
| Button-Füllung | Hover, Fokus | Füllung fährt nach unten weg | 280 ms | — | bleibt |
| FAQ öffnen | Klick, Enter | Höhe 0 → natürliche Höhe | 350 ms | je Öffnung | ohne Animation |
| Tracking-Signale | dauerhaft | Punkt entlang der Messkette | 7 s Zyklus | **endlos** | aus |

**Genau ein orchestrierter Moment**: der Hero-Auftritt. Kein Einblenden pro
Abschnitt.

## 5. Scroll-gebunden statt zeitgesteuert

Wo der Browser es nativ kann, hängt der Fortschritt am Scroll statt an einem
Zeitgeber — flüssiger und auf dem Compositor:

```css
@supports ((animation-timeline: view()) and (animation-range: entry)) { … }
```

Browser ohne Unterstützung (derzeit Firefox) zeigen schlicht den Endzustand.
Das ist unbedenklich, weil die Animation nichts versteckt — deshalb gibt es
hier bewusst **keinen** JavaScript-Fallback.

### Ein gemessener Fallstrick

Eine scroll-gebundene Animation **direkt am Elternelement eines Bildes**
verhindert, dass `loading="lazy"` auslöst — das Bild wird dann nie angefordert.
Gemessen in Chrome: mit `animation-timeline: view()` auf dem `<picture>` blieb
das Porträt dauerhaft ungeladen; ohne die Animation lud es sofort.

Die Animation liegt deshalb immer auf dem `<img>` selbst, der Wrapper clippt.
`tests/test_static.py::test_scroll_linked_animation_never_sits_on_an_image_parent`
hält das fest.

## 6. Seitenwechsel

`@view-transition { navigation: auto; }` — Cross-Document View Transitions. Die
alte Seite blendet aus, die neue kommt mit 8 px Versatz herein. Fortschrittliche
Verbesserung: Browser ohne Unterstützung navigieren wie gewohnt.

## 7. Reduzierte Bewegung und ausdrückliche Pause

Bei `prefers-reduced-motion: reduce` entfallen alle dekorativen Animationen;
Inhalte sind unmittelbar sichtbar. Wechselt die Präferenz mitten in der Sitzung,
räumt `handleReduceMotionChange` auf und entfernt den Pause-Schalter.

Zusätzlich gibt es einen sichtbaren **Pause-Schalter** (WCAG 2.2 „Pause, Stop,
Hide"). Er wird von `js/main.js` erzeugt, liegt außerhalb von `<main>`, trägt
`aria-pressed` und speichert die Entscheidung in `localStorage`. Fehlender
Speicherzugriff wird abgefangen. Meldet das System bereits reduzierte Bewegung,
erscheint der Schalter nicht.

Die Pause hält **jede** dekorative Bewegung an — auch die scroll-gebundene und
einen noch laufenden Hero-Auftritt.

### Was zwingend pausierbar sein muss

WCAG 2.2 „Pause, Stop, Hide" greift bei Bewegung, die selbsttätig startet,
länger als fünf Sekunden läuft und neben anderem Inhalt steht. Das ist genau
die Menge der `infinite`-Animationen — hier einzig die Tracking-Signale.
Einmal-Auftritte enden von selbst, scroll-gebundene Animationen laufen nur,
solange gescrollt wird. `tests/test_static.py` prüft entsprechend eng.

## 8. Robustheit

- FAQ: `hidden` und `aria-expanded` gelten **sofort**; die Höhenanimation ist
  reine Dekoration und darf abbrechen. Beim Schließen bleibt keine unsichtbare,
  weiter fokussierbare Fläche stehen.
- Keine RAF-Schleife, kein Canvas, kein Scroll-Hijacking.
- JavaScript steuert nur noch die Pause. Fällt es aus, ist die Seite
  vollständig sichtbar und bedienbar.
