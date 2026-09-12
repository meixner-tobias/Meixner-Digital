"""
Lokaler Vorschau-Server mit Auto-Reload.
=======================================

    python dev.py                 -> http://127.0.0.1:4000
    python dev.py --port 5000     -> anderer Port
    python dev.py --no-open       -> Browser nicht automatisch oeffnen

Zeigt immer die ECHTE Website von der Platte, unabhaengig vom Wartungsmodus
auf der Live-Seite. Die Wartungsseite selbst laesst sich unter /wartung ansehen.

Was der Server macht:
  * saubere Adressen wie im Netz: /leistungen/ laedt leistungen/index.html
  * unbekannte Adressen liefern 404.html mit Status 404, wie GitHub Pages
  * schaltet jedes Caching ab, damit nie eine alte Fassung im Browser haengt
  * laedt die Seite automatisch neu, sobald sich eine Datei aendert
  * bei reinen CSS-Aenderungen wird nur das Stylesheet getauscht,
    ohne Neuladen - Scrollposition und geoeffnete Menues bleiben erhalten

Nur Python-Standardbibliothek, keine Installation noetig.
"""

import argparse
import http.server
import json
import mimetypes
import os
import socketserver
import threading
import webbrowser
from pathlib import Path
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parent

# Verzeichnisse, die nicht zur Website gehoeren und den Watcher nur bremsen.
SKIP_DIRS = {".git", ".venv", "node_modules", "__pycache__", "docs", "tests", "scripts"}
WATCH_SUFFIXES = {".html", ".css", ".js", ".svg", ".json", ".xml", ".txt"}

# Wird in jede HTML-Antwort eingehaengt. Fragt zweimal pro Sekunde nach, ob
# sich etwas geaendert hat. Bewusst simpel: kein WebSocket, keine Abhaengigkeit.
LIVE_RELOAD = """
<script>
(function () {
  var current = null;
  function swapStylesheets() {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(function (link) {
      var url = new URL(link.href, location.href);
      url.searchParams.set("__dev", Date.now());
      // Neues Stylesheet daneben laden und das alte erst danach entfernen,
      // sonst blitzt die ungestylte Seite kurz auf.
      var fresh = link.cloneNode();
      fresh.href = url.toString();
      fresh.addEventListener("load", function () { link.remove(); });
      link.parentNode.insertBefore(fresh, link.nextSibling);
    });
  }
  function poll() {
    fetch("/__dev/version", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (next) {
        if (current === null) { current = next; return; }
        if (next.all !== current.all) {
          if (next.other === current.other) { swapStylesheets(); current = next; }
          else { location.reload(); }
        }
      })
      .catch(function () { /* Server neu gestartet - beim naechsten Mal wieder */ });
  }
  setInterval(poll, 500);
  poll();
})();
</script>
"""


def fingerprint():
    """Zwei Kennzahlen: alles zusammen, und alles ausser CSS.

    Unterscheiden sich nur die ersten, wurde ausschliesslich CSS geaendert -
    dann reicht ein Stylesheet-Tausch statt eines vollen Neuladens.
    """
    every, other = [], []
    for folder, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".")]
        for name in files:
            path = Path(folder) / name
            if path.suffix.lower() not in WATCH_SUFFIXES:
                continue
            try:
                stamp = f"{path}:{path.stat().st_mtime_ns}"
            except OSError:
                continue
            every.append(stamp)
            if path.suffix.lower() != ".css":
                other.append(stamp)
    return {"all": hash(tuple(sorted(every))), "other": hash(tuple(sorted(other)))}


class Handler(http.server.BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server_version = "meixner-dev"

    def log_message(self, fmt, *args):
        if "404" in (fmt % args):
            print(f"  404  {self.path}")

    def resolve(self, url_path):
        """Adresse -> Datei auf der Platte, mit denselben Regeln wie GitHub Pages."""
        if url_path == "/wartung" or url_path == "/wartung/":
            return ROOT / "_layouts" / "maintenance.html", 200
        rel = unquote(url_path).lstrip("/")
        candidate = (ROOT / rel).resolve()
        # Nie ausserhalb des Projektordners ausliefern.
        if not str(candidate).startswith(str(ROOT)):
            return ROOT / "404.html", 404
        if candidate.is_dir():
            candidate = candidate / "index.html"
        if candidate.is_file():
            return candidate, 200
        # /leistungen ohne Schraegstrich
        as_dir = (ROOT / rel / "index.html").resolve()
        if as_dir.is_file():
            return as_dir, 200
        return ROOT / "404.html", 404

    def do_GET(self):
        path = urlsplit(self.path).path

        if path == "/__dev/version":
            return self.respond(json.dumps(fingerprint()).encode(), "application/json", 200)

        target, status = self.resolve(path)
        try:
            body = target.read_bytes()
        except OSError:
            return self.respond(b"Not found", "text/plain; charset=utf-8", 404)

        ctype = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        if ctype.startswith("text/") or ctype in ("application/javascript", "application/json"):
            ctype += "; charset=utf-8"

        if target.suffix.lower() == ".html":
            marker = b"</body>"
            injected = LIVE_RELOAD.encode()
            body = (body.replace(marker, injected + marker, 1)
                    if marker in body else body + injected)

        self.respond(body, ctype, status)

    def do_HEAD(self):
        self.do_GET()

    def respond(self, body, ctype, status):
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        # Nichts zwischenspeichern - sonst zeigt der Browser alte Staende.
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    # Ohne mehrere Threads brechen parallele Anfragen ab und der Browser
    # zeigt die Seite dann ohne Stylesheet.
    daemon_threads = True
    allow_reuse_address = True
    request_queue_size = 128


def main():
    parser = argparse.ArgumentParser(description="Lokale Vorschau mit Auto-Reload")
    parser.add_argument("--port", type=int, default=4000)
    parser.add_argument("--no-open", action="store_true", help="Browser nicht oeffnen")
    args = parser.parse_args()

    try:
        server = Server(("127.0.0.1", args.port), Handler)
    except OSError as err:
        raise SystemExit(f"Port {args.port} ist belegt ({err}). "
                         f"Mit --port eine andere Nummer waehlen.")

    url = f"http://127.0.0.1:{args.port}/"
    print(f"\n  Vorschau laeuft:  {url}")
    print(f"  Wartungsseite:    {url}wartung")
    print("  Aenderungen laden automatisch nach. Beenden mit Strg+C.\n")
    if not args.no_open:
        threading.Timer(0.5, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Vorschau beendet.")


if __name__ == "__main__":
    main()
