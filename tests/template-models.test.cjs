const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const templates = fs.readFileSync(path.join(root, 'lib/templates.ts'), 'utf8');
const learningStep = fs.readFileSync(path.join(root, 'components/wizard/LearningSettingsStep.tsx'), 'utf8');
const templateView = fs.readFileSync(path.join(root, 'components/TemplateView.tsx'), 'utf8');
const prompt = fs.readFileSync(path.join(root, 'app/api/gemini/generate-rpp/prompt.ts'), 'utf8');

test('cooperative templates split Jigsaw and STAD instead of mixing both', () => {
  assert.match(templates, /Cooperative Learning - Jigsaw/);
  assert.match(templates, /Cooperative Learning - STAD/);
  assert.doesNotMatch(templates, /Jigsaw\/STAD/);
});

test('Jigsaw uses origin/expert groups while STAD uses individual assessment', () => {
  const jigsawBlock = templates.match(/id: 'tpl_jigsaw'[\s\S]*?\n  },\n  \{/)[0];
  const stadBlock = templates.match(/id: 'tpl_stad'[\s\S]*?\n  },\n\];/)[0];
  assert.match(jigsawBlock, /kelompok asal/);
  assert.match(jigsawBlock, /kelompok ahli/);
  assert.doesNotMatch(stadBlock, /kelompok ahli/);
  assert.match(stadBlock, /penilaian individual/);
  assert.match(stadBlock, /penghargaan tim/);
});

test('template syntax steps rely on UI numbering only', () => {
  assert.doesNotMatch(templates, /syntaxSteps:\s*\[[\s\S]*?'\d+\./);
  assert.match(templateView, /\{index \+ 1\}\.\<\/span\>\{step\}/);
});

test('learning model selector exposes Jigsaw and STAD as separate choices', () => {
  assert.match(learningStep, /'Cooperative Learning - Jigsaw'/);
  assert.match(learningStep, /'Cooperative Learning - STAD'/);
  assert.doesNotMatch(learningStep, /,'Cooperative Learning',/);
});

test('selected template syntax is enforced in generation prompt', () => {
  assert.match(prompt, /getTemplateSyntaxSteps/);
  assert.match(prompt, /jangan mencampurkannya dengan tipe Cooperative Learning lain/);
  assert.match(templateView, /onUseTemplate\(template\.model\)/);
});
