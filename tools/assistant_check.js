#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const cfgPath = path.join(root, 'assistant.config.json');
const policyPath = path.join(root, '.assistant-autonomy.md');

function ok(msg) { console.log('[OK] ' + msg); }
function warn(msg) { console.warn('[WARN] ' + msg); }

if (fs.existsSync(cfgPath)) {
  try {
    const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    ok('assistant.config.json exists and is valid JSON');
    if (!cfg.autonomyEnabled) warn('autonomyEnabled is false');
  } catch (e) {
    console.error('[ERR] assistant.config.json is invalid JSON');
    process.exit(2);
  }
} else {
  warn('assistant.config.json not found');
}

if (fs.existsSync(policyPath)) ok('.assistant-autonomy.md found'); else warn('.assistant-autonomy.md not found');

// exit 0 so this can be run safely
process.exit(0);
