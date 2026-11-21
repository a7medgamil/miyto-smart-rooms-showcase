import { readdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
async function sourceFiles(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const url = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    if (entry.isDirectory()) result.push(...await sourceFiles(url));
    else if (entry.name.endsWith('.mjs')) result.push(url);
  }
  return result;
}

const sources = await sourceFiles(root);
for (const file of sources) {
  const result = spawnSync(process.execPath, ['--check', fileURLToPath(file)], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
}

const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
assert.equal(Object.keys(pkg.dependencies ?? {}).length, 0, 'No runtime dependencies');
assert.equal(Object.keys(pkg.devDependencies ?? {}).length, 0, 'No development dependencies');
const html = await readFile(new URL('index.html', root), 'utf8');
assert.match(html, /<html lang="en">/);
assert.match(html, /name="viewport"/);
assert.match(html, /Independent synthetic demonstration/);
assert.match(html, /aria-live="polite"/);
const css = await readFile(new URL('styles.css', root), 'utf8');
assert.match(css, /:focus-visible/);
assert.match(css, /prefers-reduced-motion/);

// Deliberately narrow static guardrails, not a complete security or accessibility audit.
const browser = await Promise.all(['app.mjs', 'engine.mjs', 'index.html', 'styles.css'].map(file => readFile(new URL(file, root), 'utf8')));
for (const content of browser) {
  assert.doesNotMatch(content, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|localStorage|sessionStorage|indexedDB|getUserMedia|RTCPeerConnection)\b|document\.cookie/);
  assert.doesNotMatch(content, /https?:\/\/|@import\b/);
}
console.log(`PASS: ${sources.length} JavaScript syntax checks; dependency, UI structure and browser API guardrails. These checks do not replace browser QA.`);
