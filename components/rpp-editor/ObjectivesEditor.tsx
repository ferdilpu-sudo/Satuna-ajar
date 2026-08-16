import type { RPPData } from '../../types/rpp';
import { inferEvidenceTypeFromObjective } from '../../lib/validation/pedagogy';
import { structureSuccessCriterionEvidence } from '../../lib/validation/evidence-structure';
import { EditorSection, Field, TextArea, TextInput } from './EditorPrimitives';

export default function ObjectivesEditor({ rpp, onChange }: { rpp: RPPData; onChange: (rpp: RPPData) => void }) {
  const updateObjective = (index: number, value: string) => {
    const learningObjectives = [...rpp.learningObjectives];
    learningObjectives[index] = value;
    const successCriteria = rpp.successCriteria.map((item, itemIndex) => itemIndex === index
      ? structureSuccessCriterionEvidence({ ...item, objective: `TP${index + 1}`, primaryEvidence: [], supportingEvidence: [] }, inferEvidenceTypeFromObjective(value))
      : item);
    onChange({ ...rpp, learningObjectives, successCriteria });
  };
  const updateCriteria = (index: number, patch: Partial<RPPData['successCriteria'][number]>) => {
    const successCriteria = [...rpp.successCriteria];
    const current = { ...successCriteria[index], ...patch };
    successCriteria[index] = patch.assessmentEvidence === undefined
      ? current
      : structureSuccessCriterionEvidence({ ...current, primaryEvidence: [], supportingEvidence: [] }, inferEvidenceTypeFromObjective(rpp.learningObjectives[index] || ''));
    onChange({ ...rpp, successCriteria });
  };

  return <EditorSection title="Tujuan Pembelajaran & KKTP" description="Review tujuan, kriteria ketercapaian, dan bukti asesmen.">
    <div className="space-y-4">{rpp.learningObjectives.map((objective, index) => {
      const criterion = rpp.successCriteria[index] || { objective: `TP${index + 1}`, criteria: '', assessmentEvidence: '' };
      return <div key={index} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
        <Field label={`TP${index + 1}`}><TextArea rows={2} value={objective} onChange={(e) => updateObjective(index, e.target.value)} /></Field>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Kriteria Ketercapaian"><TextArea rows={3} value={criterion.criteria} onChange={(e) => updateCriteria(index, { criteria: e.target.value })} /></Field>
          <Field label="Bukti / Asesmen"><TextArea rows={3} value={criterion.assessmentEvidence} onChange={(e) => updateCriteria(index, { assessmentEvidence: e.target.value })} /></Field>
        </div>
      </div>;
    })}</div>
    <button type="button" onClick={() => onChange({ ...rpp, learningObjectives: [...rpp.learningObjectives, ''], successCriteria: [...rpp.successCriteria, { objective: `TP${rpp.learningObjectives.length + 1}`, criteria: '', assessmentEvidence: '' }] })} className="mt-3 rounded-lg border border-dashed border-blue-300 px-3 py-2 text-[11px] font-bold text-blue-700">+ Tambah Tujuan Pembelajaran</button>
  </EditorSection>;
}
