# Bewegungssystem — Meixner Digital

Stand: 12. September 2026. Umgesetzt in `css/style.css` (Abschnitt 17) und
`js/main.js` (`initMotionToggle`).

**Keine Animationsbibliothek.** Kein GSAP, kein ScrollTrigger, kein Lenis, kein
three.js. Die Bewegung besteht aus scroll-gebundenen CSS-Animationen, wenigen
Keyframes, View Transitions und der Web Animations API für die FAQ-Höhe. Das
erzwingt `tests/test_static.py`.

## 1. Grundsatz: Bewegung versteckt nichts

Die vorherige Fassung blendete jeden Abschnitt beim Scrollen ein. Das ist aus
zwei Gründen abgeräumt:

1. Es ist das Muster, das jede zweite erzeugte Seite benutzt.
2. Es versteckt Inhalt. Wer nicht scrollt oder wessen Browser den Effekt nicht
   auslöst, sieht eine leere Seite. Genau das trat in der Messung auf.

Die Bewegung liegt jetzt dort, wo sie nichts verdeckt: **an den Bildern und an
den Trennlinien**. Jeder Inhalt ist von der ersten Millisekunde an sichtbar,
mit und ohne JavaScript.

## 2. Effekte

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

## 3. Scroll-gebunden statt zeitgesteuert

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

## 4. Seitenwechsel

`@view-transition { navigation: auto; }` — Cross-Document View Transitions. Die
alte Seite blendet aus, die neue kommt mit 8 px Versatz herein. Fortschrittliche
Verbesserung: Browser ohne Unterstützung navigieren wie gewohnt.

## 5. Reduzierte Bewegung und ausdrückliche Pause

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

## 6. Robustheit

- FAQ: `hidden` und `aria-expanded` gelten **sofort**; die Höhenanimation ist
  reine Dekoration und darf abbrechen. Beim Schließen bleibt keine unsichtbare,
  weiter fokussierbare Fläche stehen.
- Keine RAF-Schleife, kein Canvas, kein Scroll-Hijacking.
- JavaScript steuert nur noch die Pause. Fällt es aus, ist die Seite
  vollständig sichtbar und bedienbar.
