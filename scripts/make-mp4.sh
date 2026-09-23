#!/bin/sh
# Рядом с каждым WebM кладёт MP4/H.264.
#
# iOS Safari понимает WebM, но декодирует его программно: греется процессор,
# садится батарея, а на страницах с несколькими роликами случаются падения.
# Основной сценарий у визитки — телефон по QR-коду, поэтому первым источником
# в <video> идёт MP4, а WebM остаётся запасным.
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd)
FF="$HOME/Library/Caches/ms-playwright/ffmpeg-1011/ffmpeg-mac"
TOOL="${TMPDIR:-/tmp}/frames-to-mp4"

[ -x "$FF" ] || { echo "нет ffmpeg от Playwright: $FF" >&2; exit 1; }
swiftc -O -o "$TOOL" "$ROOT/scripts/frames-to-mp4.swift"

for src in "$ROOT"/assets/video/*.webm; do
  name=$(basename "$src" .webm)
  frames=$(mktemp -d)
  "$FF" -v error -i "$src" "$frames/%05d.png"
  "$TOOL" "$frames" "$ROOT/assets/video/$name.mp4" 25
  rm -rf "$frames"
done
