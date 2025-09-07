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

const msgArg = process.argv.slice(2).join(' ');
const msg = msgArg || 'assistant: automated changes';

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

// Build a detailed summary for visibility (used as commit message and PR body)
let summary = `# ${msg}\n\n`;
try {
  const nameStatus = run('git diff --staged --name-status || true');
  const numstat = run('git diff --staged --numstat || true');
  const files = [];
  const counts = { A: 0, M: 0, D: 0 };
  if (nameStatus) {
    nameStatus.split('\n').forEach(line => {
      const parts = line.trim().split('\t');
      const status = parts[0];
      const file = parts.slice(1).join('\t');
      files.push({ status, file });
      if (status && counts[status] !== undefined) counts[status]++;
    });
  }

  summary += `**Files changed:** ${files.length} (A=${counts.A} M=${counts.M} D=${counts.D})\n\n`;
  if (numstat) {
    summary += "```\nFile\tAdded\tRemoved\n";
    numstat.split('\n').forEach(line => {
      const [add, del, file] = line.split('\t');
      summary += `${file}\t${add || 0}\t${del || 0}\n`;
    });
    summary += "```\n\n";
  }

  if (files.length) {
    summary += 'Changed files:\n\n';
    files.forEach(f => {
      summary += `- ${f.status}\t${f.file}\n`;
    });
    summary += '\n';
  }
  // include optional user-provided message at the end
  if (msgArg) summary += `Notes: ${msgArg}\n`;
} catch (e) {
  // ignore
}

// write summary to a file and use it as the commit message
const summaryPath = path.join(root, '.assistant_autocommit_summary.md');
try { fs.writeFileSync(summaryPath, summary, 'utf8'); } catch (e) {}

run(`git add -A`);
run(`git commit -F "${summaryPath}" || true`);
run(`git push -u origin ${branch}`);
console.log(`Pushed auto-commit to ${branch} with summary at ${summaryPath}`);
