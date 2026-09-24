#!/usr/bin/env python3
"""Локальный dev-сервер без кэша: обычный http.server не шлёт Cache-Control,
и браузер по эвристике считает свежеотредактированный JS/CSS «свежим» сам,
без единого запроса к серверу. Правки в assets/* тогда просто не видны,
пока не сделать жёсткую перезагрузку. На проде так не бывает — там за
заголовки отвечает _headers (Cloudflare Pages), только для локальной
разработки здесь нужен свой сервер."""
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler

port = int(sys.argv[1]) if len(sys.argv) > 1 else 4321


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


HTTPServer(("", port), NoCacheHandler).serve_forever()
