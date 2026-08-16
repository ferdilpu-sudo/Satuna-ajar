const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const iconSource = read('components/icons/StreamlineDuotoneIcon.tsx');
const sidebar = read('components/Sidebar.tsx');
const dashboard = read('components/DashboardView.tsx');
const templateView = read('components/TemplateView.tsx');
const stepper = read('components/wizard/WizardStepper.tsx');
const material = read('components/wizard/MaterialStep.tsx');
const output = read('components/wizard/OutputStep.tsx');
const detailHeader = read('components/rpp-detail/RPPDetailHeader.tsx');
const settings = read('components/SettingsView.tsx');

test('local Streamline duotone icon renderer contains semantic app icons', () => {
  assert.match(iconSource, /export type StreamlineIconName/);
  for (const name of ['dashboard','add','history','template','settings','profile','document','module','magic','layers','view','edit','duplicate','delete']) {
    assert.match(iconSource, new RegExp(`\\b${name}: \\{`));
  }
  assert.match(iconSource, /secondaryOpacity/);
});

test('primary navigation and dashboard actions use Streamline duotone icons', () => {
  assert.match(sidebar, /StreamlineDuotoneIcon/);
  assert.match(sidebar, /icon: 'dashboard'/);
  assert.match(sidebar, /icon: 'settings'/);
  assert.match(dashboard, /name="view"/);
  assert.match(dashboard, /name="edit"/);
  assert.match(dashboard, /name="duplicate"/);
  assert.match(dashboard, /name="delete"/);
});

test('wizard and template surfaces use semantic Streamline icons', () => {
  assert.match(templateView, /name="magic"/);
  assert.match(templateView, /name="layers"/);
  assert.match(stepper, /StreamlineDuotoneIcon/);
  assert.match(material, /name="template"/);
  assert.match(material, /name="magic"/);
  assert.match(output, /name="document"/);
  assert.match(output, /name="magic"/);
});

test('document detail uses Streamline icons for document and edit actions', () => {
  assert.match(detailHeader, /name="edit"/);
  assert.match(detailHeader, /name="document"/);
});

test('free Streamline attribution is removed from primary sidebar chrome and kept under About & Lisensi', () => {
  assert.doesNotMatch(sidebar, /Free icons from Streamline/);
  assert.match(settings, /Tentang & Lisensi/);
  assert.match(settings, /https:\/\/streamlinehq\.com/);
  assert.match(settings, /Free icons from Streamline/);
});
