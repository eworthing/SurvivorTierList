#!/usr/bin/env node
/*
 * Node helper: perform guarded auto-commit and push when staged changes meet threshold
 * Usage: node tools/assistant_autocommit.js "commit message"
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Use process.cwd() so the hook can run from repo root regardless of ESM URL quirks
const root = process.cwd();

function run(cmd) {
  try {
    return execSync(cmd, { cwd: root, stdio: 'pipe' }).toString().trim();
  } catch (e) {
    return '';
  }
}

const msg = process.argv.slice(2).join(' ') || 'assistant: automated commit';

let linesChanged = 0;
try {
  const out = run('git diff --staged --numstat || true');
  if (out) {
    out.split('\n').forEach(line => {
      const [a, b] = line.split('\t');
      linesChanged += Number(a || 0) + Number(b || 0);
    });
  }
} catch (e) {
  // ignore
}

let threshold = 50;
try {
  const cfg = JSON.parse(fs.readFileSync(path.join(root, 'assistant.config.json'), 'utf8'));
  if (cfg.autoCommitThresholdLines) threshold = cfg.autoCommitThresholdLines;
} catch (e) {
  // ignore
}

let isBreaking = false;
try {
  const names = run('git diff --staged --name-only || true');
  if (names) {
    const arr = names.split('\n');
    arr.forEach(n => {
      if (/\.github\/workflows\//.test(n) || /Dockerfile$/.test(n) || /package.json$/.test(n) || /(^|\/)\.circleci\//.test(n)) {
        isBreaking = true;
      }
    });
  }
} catch (e) {}

if (linesChanged < threshold && !isBreaking) {
  console.log(`No significant changes to auto-commit (lines_changed=${linesChanged}, threshold=${threshold}).`);
  process.exit(0);
}

const branch = `assistant/autocommit/${new Date().toISOString().replace(/[:.]/g,'')}`;
run(`git checkout -b ${branch}`);
run(`git commit -m "${msg.replace(/\"/g, '\\"')}" || true`);
run(`git push -u origin ${branch}`);
console.log(`Pushed auto-commit to ${branch}`);
