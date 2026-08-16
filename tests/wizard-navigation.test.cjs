const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

test('wizard step changes return the viewport to the top of the wizard', () => {
  const wizard = read('components/WizardForm.tsx');
  const navigation = read('components/wizard/use-wizard-step-navigation.ts');

  assert.match(wizard, /useWizardStepNavigation\(\)/);
  assert.match(wizard, /ref=\{wizardTopRef\}/);
  assert.match(wizard, /onStepChange=\{goToStep\}/);
  assert.doesNotMatch(wizard, /setCurrentStep/);
  assert.match(navigation, /window\.requestAnimationFrame/);
  assert.match(navigation, /window\.scrollTo/);
  assert.match(navigation, /prefers-reduced-motion/);
  assert.match(navigation, /document\.querySelector\('header'\)/);
});
