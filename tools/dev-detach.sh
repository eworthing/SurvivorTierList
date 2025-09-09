#!/usr/bin/env sh
# Start Vite dev server detached and write logs to /tmp/vite.log
# Usage: sh tools/dev-detach.sh

LOG=/tmp/vite.log
PIDFILE=/tmp/vite.pid

if [ -f "$PIDFILE" ]; then
  PID=$(cat "$PIDFILE")
  if kill -0 "$PID" 2>/dev/null; then
    echo "Vite already running (pid $PID). Log: $LOG"
    tail -n 40 "$LOG"
    exit 0
  else
    echo "Stale pidfile found, removing"
    rm -f "$PIDFILE"
  fi
fi

HOST=${DEV_HOST:-127.0.0.1}
echo "Starting Vite dev bound to $HOST (overridable with DEV_HOST env)"
# start Vite bound to an explicit host to prefer IPv4 loopback
nohup npm run dev -- --host "$HOST" > "$LOG" 2>&1 &
echo $! > "$PIDFILE"
# wait a moment for the server to start
sleep 0.6
echo "Started Vite dev (pid $(cat $PIDFILE)). Recent logs:"
tail -n 120 "$LOG"

echo "To curl safely, run: npm run dev:curl"
