const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function collectFiles(root) {
  if (!fs.existsSync(root)) return [];
  const entries = fs.readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) return collectFiles(fullPath);
    return /\.(ts|tsx|js|jsx|json|md)$/.test(entry.name) ? [fullPath] : [];
  });
}

test('runtime app is Gemini-only and no longer exposes alternate router settings', () => {
  const runtimeFiles = [
    ...collectFiles('app'),
    ...collectFiles('components'),
    ...collectFiles('lib'),
    ...collectFiles('types'),
    '.env.example',
  ].filter(fs.existsSync);

  const joined = runtimeFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
  assert.doesNotMatch(joined, /9router|nineRouter|NINE_ROUTER|Koneksi AI|runtimeAI/i);
  assert.match(fs.readFileSync('lib/gemini.ts', 'utf8'), /GEMINI_API_KEY/);
});
