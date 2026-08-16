'use client';

import { useMemo, useState } from 'react';
import mammoth from 'mammoth';
import type { LearningSettings, MaterialAnalysis, OutputConfig, SchoolIdentity, SelectedDimension } from '../types/rpp';
import { getUserSettings } from '../lib/storage';
import {
  expectedPhaseForGrade,
  normalizeEducationLevel,
  normalizeGrade,
  normalizePhase,
  parseGradeNumber,
  validateBeforeGeneration,
} from '../lib/validation';
import DimensionsStep from './wizard/DimensionsStep';
import DocumentTypeStep from './wizard/DocumentTypeStep';
import IdentityStep from './wizard/IdentityStep';
import LearningSettingsStep from './wizard/LearningSettingsStep';
import MaterialStep from './wizard/MaterialStep';
import OutputStep from './wizard/OutputStep';
import WizardStepper from './wizard/WizardStepper';
import WizardSummaryPanel from './wizard/WizardSummaryPanel';
import { validateIdentityStep } from './wizard/identity-validation';
import { buildMaterialAutofill } from './wizard/material-autofill';
import type { GradeConflict, UploadedMaterialFile } from './wizard/types';
import { useWizardStepNavigation } from './wizard/use-wizard-step-navigation';

interface WizardFormProps {
  onGenerateSubmit: (data: {
    materialAnalysis: MaterialAnalysis;
    identity: SchoolIdentity;
    settings: LearningSettings;
    selectedDimensions: SelectedDimension[];
    outputConfig: OutputConfig;
    sourceFiles: string[];
  }) => void;
  presetTemplateModel?: string;
}

const ALL_DIMENSIONS = [
  'Keimanan dan Ketakwaan kepada Tuhan Yang Maha Esa', 'Kewargaan', 'Penalaran Kritis', 'Kreativitas',
  'Kolaborasi', 'Kemandirian', 'Kesehatan', 'Komunikasi',
];

function initialDimensions(): SelectedDimension[] {
  return ['Penalaran Kritis', 'Kolaborasi', 'Kreativitas'].map((name) => ({
    name,
    reason: `Dimensi ${name} dipilih untuk dikembangkan melalui aktivitas pembelajaran yang relevan.`,
    indicator: `Perilaku ${name.toLowerCase()} dapat diamati selama proses belajar.`,
    activity: 'Aktivitas akan disesuaikan AI dengan materi dan tujuan pembelajaran.',
    evidence: 'Bukti belajar akan ditautkan ke aktivitas, asesmen, dan rubrik.',
  }));
}

export default function WizardForm({ onGenerateSubmit, presetTemplateModel }: WizardFormProps) {
  const defaults = getUserSettings();
  const { currentStep, goToStep, wizardTopRef } = useWizardStepNavigation();
  const [documentTypeSelected, setDocumentTypeSelected] = useState(false);
  const [typedMaterial, setTypedMaterial] = useState('');
  const [aiNotes, setAiNotes] = useState('');
  const [useWebResearch, setUseWebResearch] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedMaterialFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MaterialAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [gradeConflict, setGradeConflict] = useState<GradeConflict | null>(null);

  const [identity, setIdentity] = useState<SchoolIdentity>({
    teacherName: defaults.defaultTeacherName,
    schoolName: defaults.defaultSchoolName,
    academicYear: defaults.defaultAcademicYear,
    educationLevel: defaults.defaultLevel,
    subject: '', grade: '', phase: '', semester: 'Ganjil', element: '', elementSource: 'manual', topic: '', subtopic: '',
    jpCount: 3, durationPerJP: 40, meetingCount: 1,
    totalMinutes: 120, learningOutcomes: '', cpSource: 'manual',
  });
  const [learningSettings, setLearningSettings] = useState<LearningSettings>({
    model: presetTemplateModel || 'Auto', methods: ['Diskusi Kelompok', 'Observasi', 'Tanya Jawab', 'Presentasi'],
    partners: ['Tidak Ada'], digitalTools: ['Canva', 'YouTube', 'Google Forms'],
  });
  const [selectedDimensions, setSelectedDimensions] = useState<SelectedDimension[]>(initialDimensions);
  const [outputConfig, setOutputConfig] = useState<OutputConfig>({
    format: 'Ringkas', pgCount: 5, essayCount: 3, includeLKPD: true, includeRubrics: true,
    includeRemedialEnrichment: true, includeStudentReflection: true, includeTeacherReflection: true,
  });

  const validation = useMemo(() => validateBeforeGeneration(identity, analysisResult), [identity, analysisResult]);
  const identityStepValidation = useMemo(() => validateIdentityStep(identity), [identity]);
  const materialValidationMessages = [
    ...validation.errors.filter((issue) => ['element', 'topic', 'learningOutcomes', 'grade', 'phase'].includes(issue.field)).map((issue) => issue.message),
    ...(gradeConflict ? ['Konflik kelas sumber belum diselesaikan.'] : []),
  ];
  const materialReady = Boolean(analysisResult && materialValidationMessages.length === 0);
  const dimensionsReady = selectedDimensions.length >= 2 && selectedDimensions.length <= 5;
  const canAdvanceCurrent = currentStep === 1 ? documentTypeSelected
    : currentStep === 2 ? identityStepValidation.valid
      : currentStep === 3 ? materialReady
        : currentStep === 5 ? dimensionsReady
          : currentStep === 4;
  const finalErrors = [
    ...validation.errors.map((issue) => issue.message),
    ...(!dimensionsReady ? ['Pilih 2–5 Dimensi Profil Lulusan.'] : []),
    ...(gradeConflict ? ['Konflik kelas sumber belum diselesaikan.'] : []),
  ];
  const summaryErrors = currentStep === 1 ? (documentTypeSelected ? [] : ['Pilih RPP atau Modul Ajar untuk melanjutkan.'])
    : currentStep === 2 ? identityStepValidation.errors
      : currentStep === 3 ? materialValidationMessages
        : finalErrors;

  const handleDocumentTypeSelect = (format: OutputConfig['format']) => {
    setDocumentTypeSelected(true);
    setOutputConfig((previous) => format === 'Ringkas'
      ? { ...previous, format, includeLKPD: false, includeRubrics: false, includeRemedialEnrichment: false, includeStudentReflection: false, includeTeacherReflection: false }
      : { ...previous, format, includeLKPD: true, includeRubrics: true, includeRemedialEnrichment: true, includeStudentReflection: true, includeTeacherReflection: true });
  };

  const handleIdentityChange = (field: keyof SchoolIdentity, value: string | number) => {
    const invalidatesAnalysis = Boolean(analysisResult && ['educationLevel', 'subject', 'grade', 'phase'].includes(field));
    if (invalidatesAnalysis) {
      setAnalysisResult(null);
      setGradeConflict(null);
      setAnalysisError(null);
    }
    setIdentity((previous) => {
      let updated = { ...previous, [field]: value } as SchoolIdentity;
      if (field === 'element') updated.elementSource = 'manual';
      if (invalidatesAnalysis) {
        if (previous.cpSource !== 'manual') { updated.learningOutcomes = ''; updated.cpSource = 'manual'; }
        if (previous.elementSource && previous.elementSource !== 'manual') { updated.element = ''; updated.elementSource = 'manual'; }
      }

      // Auto-adjust Phase & Level when Grade changes
      if (field === 'grade' && typeof value === 'string') {
        const expectedPhase = expectedPhaseForGrade(value);
        if (expectedPhase) {
          updated.phase = expectedPhase;
        }
        const gradeNumber = parseGradeNumber(value);
        if (gradeNumber) {
          if (gradeNumber <= 6 && (!previous.educationLevel || previous.educationLevel === 'SMP/MTs' || previous.educationLevel === 'SMA/MA')) {
            updated.educationLevel = 'SD/MI';
            updated.durationPerJP = 35;
          } else if (gradeNumber >= 7 && gradeNumber <= 9 && (!previous.educationLevel || previous.educationLevel === 'SD/MI' || previous.educationLevel === 'SMA/MA')) {
            updated.educationLevel = 'SMP/MTs';
            updated.durationPerJP = 40;
          } else if (gradeNumber >= 10 && (!previous.educationLevel || previous.educationLevel === 'SD/MI' || previous.educationLevel === 'SMP/MTs')) {
            updated.educationLevel = 'SMA/MA';
            updated.durationPerJP = 45;
          }
        }
      }

      // Auto-adjust duration when Education Level changes directly
      if (field === 'educationLevel' && typeof value === 'string') {
        if (value === 'SD/MI') updated.durationPerJP = 35;
        else if (value === 'SMP/MTs') updated.durationPerJP = 40;
        else if (value === 'SMA/MA' || value === 'SMK/MAK') updated.durationPerJP = 45;
      }

      updated.totalMinutes = Math.max(1, Number(updated.jpCount) || 1) * Math.max(1, Number(updated.durationPerJP) || 1) * Math.max(1, Number(updated.meetingCount) || 1);
      return updated;
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    for (const file of files) {
      const mimeType = file.type || 'application/octet-stream';
      if (file.name.toLowerCase().endsWith('.docx')) {
        try {
          const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
          setUploadedFiles((prev) => [...prev, { name: file.name, size: file.size, mimeType: 'text/plain', text: result.value }]);
        } catch {
          setAnalysisError(`File ${file.name} tidak berhasil dibaca. Gunakan PDF/TXT atau salin materinya ke kolom teks.`);
        }
      } else if (mimeType.startsWith('text/') || file.name.toLowerCase().endsWith('.txt')) {
        const textContent = await file.text();
        setUploadedFiles((prev) => [...prev, { name: file.name, size: file.size, mimeType: 'text/plain', text: textContent }]);
      } else {
        const base64 = await readFileAsBase64(file);
        setUploadedFiles((prev) => [...prev, { name: file.name, size: file.size, mimeType, base64 }]);
      }
    }
    event.target.value = '';
  };

  const handleAnalyzeMaterial = async () => {
    setIsAnalyzing(true); setAnalysisError(null);
    try {
      const response = await fetch('/api/gemini/analyze-material', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ typedText: typedMaterial, fileData: uploadedFiles, notes: aiNotes, useWebResearch, identityContext: { educationLevel: identity.educationLevel, subject: identity.subject, grade: identity.grade, phase: identity.phase, element: identity.element, topic: identity.topic, subtopic: identity.subtopic } }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal menganalisis materi.');
      const analysis = data.analysis as MaterialAnalysis;
      setAnalysisResult(analysis);
      applyAnalysisToIdentity(analysis);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Terjadi kesalahan saat menganalisis materi.');
    } finally { setIsAnalyzing(false); }
  };

  const applyAnalysisToIdentity = (analysis: MaterialAnalysis) => {
    const detectedGrade = normalizeGrade(analysis.detectedGrade || '');
    const detectedLevel = normalizeEducationLevel(analysis.detectedLevel || '');
    const detectedPhase = normalizePhase(analysis.detectedPhase || '');
    const currentGrade = normalizeGrade(identity.grade);
    const hasConflict = Boolean(detectedGrade && currentGrade && detectedGrade !== currentGrade);
    setGradeConflict(hasConflict ? { detectedGrade, detectedLevel, detectedPhase, formGrade: currentGrade } : null);

    const targetSubject = identity.subject || analysis.detectedSubject || '';

    setIdentity((previous) => {
      const finalGrade = normalizeGrade(previous.grade) || detectedGrade;
      const finalPhase = normalizePhase(previous.phase) || detectedPhase || (finalGrade ? expectedPhaseForGrade(finalGrade) || '' : '');
      const autofill = buildMaterialAutofill(previous, analysis);
      return {
        ...previous,
        ...autofill,
        subject: previous.subject || targetSubject,
        grade: finalGrade,
        educationLevel: previous.educationLevel || detectedLevel,
        phase: finalPhase,
      };
    });
  };

  const useDetectedGrade = () => {
    if (!gradeConflict) return;
    setIdentity((previous) => {
      const durationPerJP = gradeConflict.detectedLevel === 'SD/MI' ? 35 : gradeConflict.detectedLevel === 'SMP/MTs' ? 40 : 45;
      return { ...previous, grade: gradeConflict.detectedGrade, educationLevel: gradeConflict.detectedLevel, phase: gradeConflict.detectedPhase, durationPerJP, totalMinutes: previous.jpCount * durationPerJP * previous.meetingCount, gradeAdaptationNote: undefined };
    });
    setGradeConflict(null);
  };

  const keepCurrentGrade = () => {
    if (!gradeConflict || !identity.grade) return;
    setIdentity((previous) => ({ ...previous, gradeAdaptationNote: `Materi sumber diadaptasi dari ${gradeConflict.detectedGrade} untuk ${previous.grade} berdasarkan pilihan pengguna.` }));
    setGradeConflict(null);
  };

  const useDetectedCP = () => {
    const detected = analysisResult?.detectedCP?.trim();
    if (detected) setIdentity((previous) => ({ ...previous, learningOutcomes: detected, cpSource: 'file' }));
  };

  const useGeneratedDraftCP = () => {
    const generated = analysisResult?.generatedCP?.trim();
    if (generated) setIdentity((previous) => ({ ...previous, learningOutcomes: generated, cpSource: 'ai_draft' }));
  };

  const toggleDimension = (name: string) => {
    setSelectedDimensions((previous) => previous.some((item) => item.name === name)
      ? previous.filter((item) => item.name !== name)
      : [...previous, { name, reason: `Dimensi ${name} relevan dengan aktivitas yang akan dirancang.`, indicator: `Perilaku ${name.toLowerCase()} dapat diamati.`, activity: 'Disesuaikan dengan materi.', evidence: 'Observasi, tugas, atau produk belajar.' }]);
  };

  const handleFinalSubmit = () => {
    if (!analysisResult || finalErrors.length) return;
    const sourceFiles = uploadedFiles.map((file) => file.name);
    if (typedMaterial.trim()) sourceFiles.push('Materi Teks Pengguna');
    onGenerateSubmit({ materialAnalysis: analysisResult, identity: { ...identity, grade: normalizeGrade(identity.grade), phase: normalizePhase(identity.phase), educationLevel: normalizeEducationLevel(identity.educationLevel) }, settings: learningSettings, selectedDimensions, outputConfig, sourceFiles });
  };

  return (
    <div ref={wizardTopRef} className="mx-auto max-w-7xl space-y-5 pb-12">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">Guided Workspace</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Rancang perangkat pembelajaran</h1>
        <p className="mt-1 text-sm text-slate-500">Pilih jenis dokumen terlebih dahulu, lalu lengkapi identitas dan materi agar AI mengikuti kebutuhan pembelajaran yang sudah ditentukan.</p>
      </div>
      <WizardStepper currentStep={currentStep} canAdvance={canAdvanceCurrent} onStepChange={goToStep} />
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          {currentStep === 1 && <DocumentTypeStep selectedFormat={outputConfig.format} hasSelection={documentTypeSelected} onSelect={handleDocumentTypeSelect} onContinue={() => goToStep(2)} />}
          {currentStep === 2 && <IdentityStep documentName={outputConfig.format === 'Ringkas' ? 'RPP' : 'Modul Ajar'} identity={identity} validationMessages={identityStepValidation.errors} warningMessages={identityStepValidation.warnings} onChange={handleIdentityChange} onContinue={() => goToStep(3)} />}
          {currentStep === 3 && <MaterialStep identityLabel={`${identity.subject || 'Mapel belum diisi'} · ${identity.grade || 'Kelas belum diisi'} · ${identity.phase ? `Fase ${normalizePhase(identity.phase)}` : 'Fase belum diisi'}`} subject={identity.subject} element={identity.element} elementSource={identity.elementSource || 'manual'} topic={identity.topic} subtopic={identity.subtopic} typedMaterial={typedMaterial} aiNotes={aiNotes} useWebResearch={useWebResearch} uploadedFiles={uploadedFiles} isAnalyzing={isAnalyzing} analysisResult={analysisResult} analysisError={analysisError} gradeConflict={gradeConflict} learningOutcomes={identity.learningOutcomes} cpSource={identity.cpSource} validationMessages={materialValidationMessages} canContinue={materialReady} onElementChange={(value) => handleIdentityChange('element', value)} onVerifyElement={() => handleIdentityChange('element', identity.element)} onTopicChange={(value) => handleIdentityChange('topic', value)} onSubtopicChange={(value) => handleIdentityChange('subtopic', value)} onTypedMaterialChange={setTypedMaterial} onAiNotesChange={setAiNotes} onUseWebResearchChange={setUseWebResearch} onFileUpload={handleFileUpload} onRemoveFile={(index) => setUploadedFiles((prev) => prev.filter((_, i) => i !== index))} onLearningOutcomesChange={(value) => setIdentity((previous) => ({ ...previous, learningOutcomes: value, cpSource: 'manual' }))} onUseDetectedCP={useDetectedCP} onUseGeneratedCP={useGeneratedDraftCP} onAnalyze={handleAnalyzeMaterial} onUseDetectedGrade={useDetectedGrade} onKeepCurrentGrade={keepCurrentGrade} onBack={() => goToStep(2)} onContinue={() => goToStep(4)} />}
          {currentStep === 4 && <LearningSettingsStep settings={learningSettings} onChange={setLearningSettings} onBack={() => goToStep(3)} onContinue={() => goToStep(5)} />}
          {currentStep === 5 && <DimensionsStep dimensions={ALL_DIMENSIONS} selected={selectedDimensions} onToggle={toggleDimension} onBack={() => goToStep(4)} onContinue={() => goToStep(6)} />}
          {currentStep === 6 && <OutputStep output={outputConfig} identity={identity} settings={learningSettings} dimensions={selectedDimensions} errors={finalErrors} onOutputChange={setOutputConfig} onBack={() => goToStep(5)} onGenerate={handleFinalSubmit} />}
        </div>
        <div className="hidden lg:block">
          <WizardSummaryPanel analysis={analysisResult} identity={identity} settings={learningSettings} dimensions={selectedDimensions} output={outputConfig} documentTypeSelected={documentTypeSelected} errors={summaryErrors} />
        </div>
      </div>
    </div>
  );
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Gagal membaca ${file.name}`));
    reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '');
    reader.readAsDataURL(file);
  });
}
