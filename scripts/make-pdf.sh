#!/bin/bash
# Генерация public/resume.pdf из public/resume.html (headless Chromium-браузер).
# Запуск из корня репо: bash scripts/make-pdf.sh
set -e
cd "$(dirname "$0")/.."

EDGE="C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
[ -f "$EDGE" ] || EDGE="C:/Program Files/Google/Chrome/Application/chrome.exe"

"$EDGE" --headless=new --disable-gpu \
  --run-all-compositor-stages-before-draw --virtual-time-budget=10000 \
  --no-pdf-header-footer \
  --print-to-pdf="D:\\study\\CV\\Belgazprombank\\public\\resume.pdf" \
  "file:///D:/study/CV/Belgazprombank/public/resume.html" 2>/dev/null

ls -la public/resume.pdf
