#!/usr/bin/env sh
# Safely curl the Vite dev server using the URL found in /tmp/vite.log
# Usage: sh tools/dev-curl.sh
LOG=/tmp/vite.log
if [ ! -f "$LOG" ]; then
  echo "Log $LOG not found. Start the dev server with: npm run dev:detached" >&2
  exit 2
fi
URL=$(grep -Eo 'http://localhost:[0-9]+' "$LOG" | head -n1)
if [ -z "$URL" ]; then
  URL="http://localhost:5173"
fi
echo "Using URL: $URL/"
# try IPv4 first (fast failure), then fall back to IPv6 if needed
echo "Trying IPv4..."
if curl -4 --max-time 8 -sS -D - "$URL/" | sed -n '1,160p'; then
  exit 0
fi

echo "IPv4 failed, trying IPv6..."
# try IPv6 (use bracketed host if needed)
if curl -6 --max-time 8 -sS -D - "$URL/" | sed -n '1,160p'; then
  exit 0
fi

echo "Both IPv4 and IPv6 attempts failed. You can inspect /tmp/vite.log for the exact URL." >&2
exit 2
