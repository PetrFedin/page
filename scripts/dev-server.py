#!/usr/bin/env python3
"""Локальный dev-сервер без кэша: обычный http.server не шлёт Cache-Control,
и браузер по эвристике считает свежеотредактированный JS/CSS «свежим» сам,
без единого запроса к серверу. На проде так не бывает — там за заголовки
отвечает _headers (Cloudflare Pages), только для локальной разработки
здесь нужен свой сервер.

Заголовка недостаточно: вкладка, уже открытая до правки, может держать
подресурс (app.js/styles.css) в памяти и не перезапросить его даже после
обычной перезагрузки страницы. Поэтому HTML-страницы отдаются с версией,
подставленной в src/href локальных assets/* — при каждом запросе она
своя, и такая ссылка ещё никогда не была в кэше браузера."""
import os
import re
import sys
import time
from http.server import HTTPServer, SimpleHTTPRequestHandler

port = int(sys.argv[1]) if len(sys.argv) > 1 else 4321

ASSET_REF = re.compile(rb'((?:src|href)=")(/assets/[^"?]+\.(?:js|css))("|\?[^"]*")')


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        path = self.translate_path(self.path.split("?", 1)[0])
        if os.path.isdir(path):
            path = os.path.join(path, "index.html")
        if path.endswith(".html"):
            try:
                with open(path, "rb") as f:
                    body = f.read()
            except OSError:
                return super().do_GET()
            version = str(int(time.time() * 1000)).encode()
            body = ASSET_REF.sub(lambda m: m.group(1) + m.group(2) + b'?v=' + version + b'"', body)
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()


HTTPServer(("", port), NoCacheHandler).serve_forever()
