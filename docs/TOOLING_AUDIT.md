# Tooling-, Konfigurations- und Metadaten-Audit

Audit und Bereinigung: 7.–8. September 2026. Ausgangsstand:
`backup/pre-visual-reset-2026-09-07` (Commit `9db6a350`).
Die gelöschten Dateien bleiben dort vollständig reproduzierbar.

## Architektur und geprüfter Umfang

Die Website besteht aus 35 statischen HTML-Seiten in Deutsch und Englisch.
Es gibt kein Framework, Backend im Repository, Template-System, npm-Paket,
Bundler, CSS-Präprozessor, TypeScript-Projekt, Build-Skript oder vorhandenes
Test-/Lint-System. Die HTML-Dateien sind das auszuliefernde Ergebnis.
Die Python-Dateien sind Wartungswerkzeuge und kein Teil der Website-Laufzeit.

Vollständig gelesen und geprüft wurden die sieben ursprünglichen Python-Dateien,
alle drei Code-Zellen des Refactoring-Notebooks, der aktive Git-Hook, die
lokale Agent-Konfiguration, Manifest, CNAME, robots.txt, beide llms-Dateien,
Sitemap und beide RSS-Feeds. Die beiden historischen CSS-Sammlungen wurden
zusätzlich im CSS-Audit untersucht. Die SVG-Dateien wurden als XML geparst.
Rasterbilder und das Lebenslauf-PDF wurden als vorhandene Inhaltsdateien
inventarisiert; dieser Teilbericht umfasst keine redaktionelle Prüfung dieser Inhalte.

`core.hooksPath` ist lokal auf `.githooks` gesetzt. Der Hook führt bei
entsprechend vorgemerkten Dateien Cache-Busting und Sitemap-Aktualisierung aus.
`bump_assets.py`, `update_sitemap.py` und `add_breadcrumbs.py` bleiben erhalten.
Der Breadcrumb-Generator erzeugt semantische Navigation und enthält keine
Animationen. Seine DOM-Klassen wurden bei der Bereinigung beibehalten.

Ursprünglich eingebunden waren lokal kopierte GSAP 3.12.5, ScrollTrigger 3.12.5,
Lenis 1.1.13 und Three.js r128. Es existierte kein Paketmanifest oder Lockfile
für diese Kopien. Ihre Nutzung und Entfernung werden im Hauptbericht behandelt;
ein umfassender Sicherheits-Audit der minifizierten Bibliotheksimplementierungen
war nicht Bestandteil dieser Prüfung. Lenis referenzierte außerdem eine nicht
mitgelieferte Source-Map; das betraf Debugging, nicht die Laufzeit.

## Befunde und Korrekturen

Zeilenangaben unter „Vorher“ beziehen sich auf den gesicherten Ausgangsstand.

| Priorität | Vorher | Ursache und Auswirkung | Umsetzung |
| --- | --- | --- | --- |
| P1 | `.githooks/pre-commit:23–28` | Bei einer CSS-/JS-Änderung wurden sämtliche gefundenen HTML-Dateien mit `git add` vorgemerkt. Dadurch konnten unzusammenhängende, bewusst noch nicht vorgemerkte Änderungen und unversionierte Entwürfe in einen Commit geraten. Teilweise vorgemerkte Assets konnten zudem Hashes der falschen Version erzeugen. | Vor jeglicher Änderung prüft der Hook auf betroffene nicht vorgemerkte Änderungen und bricht gegebenenfalls ohne Mutation ab. Hash-Generator und Hook bearbeiten ausschließlich versionierte HTML-Dateien. Unversionierte Entwürfe bleiben unberührt. |
| P2 | `update_sitemap.py:42–44, 77–80` | Der Pre-Commit-Aufruf las ausschließlich das Datum des bisherigen Commits. Gerade geänderte Seiten bekamen dadurch das alte Datum; fehlende Dateien bekamen ersatzweise ein neues Datum. | Geänderte Seiten erhalten das heutige Datum, unveränderte das letzte Commit-Datum. Im Hook zählt ausschließlich der Index (`--staged-only`); der manuelle Aufruf berücksichtigt zusätzlich Arbeitskopie und neue Seiten. Fehlende/fremde/aus dem Repository herausführende URLs behalten vorhandene Metadaten. Fehlendes `lastmod` wird für gültige Seiten ergänzt. |
| P2 | `bump_assets.py:49–57` | Eine unbeschränkte Basename-RegEx ersetzte auch ähnliche/externe Referenzen oder Dokumentationstext. Nichthexadezimale Versionswerte konnten zu doppelten Query-Strings führen. | Nur `href`/`src` in Link-/Script-Tags, die tatsächlich auf die lokalen beiden Assets auflösen, werden geändert. Bestehende andere Query-Parameter und Fragmente bleiben erhalten; beliebige alte `v`-Werte werden ersetzt. HTML-Entities werden korrekt verarbeitet. |
| P2 | `scripts/refactor_html.py:4–32`, Notebook Zellen 0–2, `scripts/gtm_update.py:7, 48–79` | Fest eingetragener alter H:-Pfad, Top-Level-Dateimutationen und gegensätzliche historische Tracking-Migrationen. Der Refactor konnte nach Änderung des Pfads Consent-/GTM-Code entfernen, zu breit Script-Blöcke erfassen und einen zweiten unversionierten `main.js`-Import einfügen. | Nach projektweiter Referenzprüfung entfernt. Diese einmaligen Migrationen sind keine Build-Schritte und wurden nicht ausgeführt. |
| P2 | `scripts/fix_main_wrapper.py:25–34` | Bereits vollständig angewendete Migration referenzierte zusätzlich die nicht mehr vorhandenen Seiten `produkte/` und `en/products/`; Ausführung konnte mit `FileNotFoundError` abbrechen. | Zusammen mit dem ebenfalls bereits angewendeten Legal-Wrapper-Skript entfernt. Die korrekten `<main>`-Strukturen bleiben in den HTML-Dateien erhalten und werden geprüft. |
| P2 | `scripts/all_page_styles.css`, `scripts/page-styles-append.css` | Nicht eingebundene historische CSS-Sammlungen konnten alte Designregeln wieder einführen. Ihre Regeln und funktionalen Abhängigkeiten wurden vor der Entfernung im CSS-Audit abgeglichen. | Beide Sammlungen entfernt; der aktuelle Funktions-Layer liegt ausschließlich in `css/style.css`. |
| P3 | `blog/feed.xml:12,27,38,49,60`, `en/blog/feed.xml:12,27,38,49,60` | Datumsangaben enthielten falsche Wochentage: 09.06.2026 war Dienstag, 08.06.2026 Montag. | Nur die Wochentagstokens korrigiert; Datum, Uhrzeit, Inhalte und URLs bleiben unverändert. |
| P3 | `llms.txt`, `llms-full.txt` | Redaktionell gepflegte Inhaltskopien haben keinen automatischen Abgleich mit HTML; die „Last updated“-Angabe in `llms.txt` nennt Juli, während Projektangaben auch August erwähnen. | Dokumentiert und unverändert belassen, da inhaltliche/SEO-Aktualisierung außerhalb des Visual Reset liegt. |

In diesem Teilbereich wurde kein P0-Befund festgestellt. Externe Systeme oder
rechtliche/marketingbezogene Aussagen in den Inhalten wurden nicht neu bewertet.

## Entfernte Dateien

- `scripts/refactor_html.py`: abgeschlossene, riskante Script-Migration.
- `scripts/refactor_html.ipynb`: dieselbe Migration und zwei Diagnosezellen mit altem Laufwerkspfad.
- `scripts/gtm_update.py`: historische Consent-/GTM-Migration.
- `scripts/fix_main_wrapper.py`: abgeschlossene Wrapper-Migration mit veralteten Seitenpfaden.
- `scripts/fix_legal_wrapper.py`: abgeschlossene Wrapper-Migration für die sechs Rechtsseiten.
- `scripts/all_page_styles.css`: historische CSS-Sammlung ohne Laufzeit-Import.
- `scripts/page-styles-append.css`: historische CSS-Ergänzung ohne Laufzeit-Import.

Vor jeder Entfernung wurden der genaue absolute Dateipfad, die Lage innerhalb
des Arbeitsverzeichnisses und die Git-Versionierung überprüft. Es wurden keine
Verzeichnisse rekursiv gelöscht und keine bestehenden Nutzeränderungen verworfen.

## Validierung und Bedienung

Python 3.14.4, Node 22.23.2 und Git standen lokal zur Verfügung. Für die
Tooling- und Quelltests sind keine zusätzlichen Python-Pakete erforderlich.
Browserprüfungen verwenden separat Playwright und Chromium.

```powershell
python -B -m unittest discover -s tests -p test_tooling.py -v
python -B -m unittest discover -s tests -p test_static.py -v
python -B -m unittest discover -s tests -p test_preservation.py -v
python -B -m unittest discover -s tests -p test_browser.py -v
```

Die zwölf Tooling-Tests liefen erfolgreich in frisch angelegten temporären
Git-Repositories. Sie prüfen korrekte/idempotente Asset-URLs, unveränderte fremde
URLs und Entwürfe, Datumsverhalten bei Index-/Arbeitskopie-Änderungen, ungültige
Sitemap-Ziele, fehlendes `lastmod`, teilweise vorgemerkte Assets, unangetastete
unabhängige HTML-Änderungen und den erfolgreichen sicheren Hook-Ablauf.
Die eigentliche Arbeitskopie und ihr Git-Index werden von diesen Tests nicht verändert.

Die statische Suite prüft sämtliche aktuellen HTML-Dateien auf gekreuzte Tags,
eindeutige IDs, Main-/H1-Struktur, ARIA-/Label-Ziele, lokale Dateien und Fragmente.
Hinzu kommen JSON/JSON-LD/XML/Manifest/RSS-Prüfungen, Python-AST-Parsing,
`node --check` für alle lokalen JS-Dateien, ausführbare Inline-Scripts und
Event-Attribute sowie eine Regression gegen Animationen, Bibliotheksimporte
und visuelle Timer. Der explizite 20-Sekunden-Netzwerkabbruch bleibt zulässig.
HTMLParser ist kein vollständiger HTML5-Conformance-Validator; Layout,
DOM-Verhalten und CSS-Properties werden ergänzend im Browser geprüft.

Die ursprünglichen sieben Python-Dateien und drei Notebook-Zellen bestanden
bereits vor ihrer gezielten Bereinigung die Syntaxprüfung. XML-/JSON-Dateien
waren syntaktisch gültig. Alle 174 lokalen URL-Referenzen aus Sitemap und RSS
existierten; die Sitemap enthält 28 öffentliche Seiten. Die korrigierten
RSS-Wochentage wurden anschließend erneut geprüft. `git diff --check` bestand
für die hier geänderten Wartungsdateien.

Endgültige Ergebnisse der vollständigen Quell-, Erhaltungs- und Browser-Suites
stehen im [Hauptbericht](VISUAL_RESET_AUDIT.md). Build, Typecheck und ein bereits
konfigurierter Linter sind mangels entsprechender Projektkonfiguration nicht
ausführbar; sie werden nicht als erfolgreich ausgeführte Checks dargestellt.

Der manuelle Workflow bleibt:

```powershell
python bump_assets.py
python update_sitemap.py
```

Der Hook verweigert gezielt einen automatischen Cache-Refresh, solange betroffene
Dateien teilweise oder noch nicht vorgemerkt sind. Das verhindert die unbeabsichtigte
Übernahme von Nutzeränderungen; der Aufruf nennt die betroffenen Dateien.
