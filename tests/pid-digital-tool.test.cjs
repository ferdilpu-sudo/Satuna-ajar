const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const learningStep = fs.readFileSync(path.join(root, 'components/wizard/LearningSettingsStep.tsx'), 'utf8');
const prompt = fs.readFileSync(path.join(root, 'app/api/gemini/generate-rpp/prompt.ts'), 'utf8');

test('pemanfaatan digital menyediakan PID sebagai pilihan eksplisit', () => {
  assert.match(learningStep, /PID \(Papan Interaktif Digital\)/);
});

test('generator memahami PID sebagai papan interaktif digital kelas', () => {
  assert.match(prompt, /Jika PID \(Papan Interaktif Digital\) dipilih/);
  assert.match(prompt, /papan\/layar interaktif kelas/);
  assert.match(prompt, /jangan mengubah PID menjadi nama aplikasi lain/);
});
