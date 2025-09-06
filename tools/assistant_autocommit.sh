#!/usr/bin/env bash
# Guarded auto-commit helper for the assistant.
# Usage: tools/assistant_autocommit.sh "Commit message summary"

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

MSG=${1:-"assistant: automated commit"}

# compute lines changed
lines_changed=$(git diff --staged --numstat | awk '{added+=$1; deleted+=$2} END {print added+deleted+0}')
if [ -z "$lines_changed" ]; then
  lines_changed=0
fi

threshold=50
if [ -f assistant.config.json ]; then
  cfg_threshold=$(node -e "console.log(require('./assistant.config.json').autoCommitThresholdLines || '')" 2>/dev/null || echo "")
  if [ -n "$cfg_threshold" ]; then
    threshold=$cfg_threshold
  fi
fi

is_breaking=0
if git diff --staged --name-only | grep -E "(^|/)\.(github|circleci|gitlab-ci|travis)\/|(^|/)Dockerfile|(^|/)\.github\/workflows\/|(^|/)package.json" >/dev/null; then
  is_breaking=1
fi

if [ "$lines_changed" -lt "$threshold" ] && [ "$is_breaking" -eq 0 ]; then
  echo "No significant changes to auto-commit (lines_changed=$lines_changed, threshold=$threshold). Exiting."
  exit 0
fi

branch="assistant/autocommit/$(date +%Y%m%d%H%M%S)"
git checkout -b "$branch"
git commit -m "$MSG"
git push -u origin "$branch"

echo "Pushed auto-commit to $branch"
