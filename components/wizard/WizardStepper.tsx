import { Check } from 'lucide-react';
import StreamlineDuotoneIcon, { type StreamlineIconName } from '../icons/StreamlineDuotoneIcon';

interface Props { currentStep: number; canAdvance: boolean; onStepChange: (step: number) => void; }

const STEPS: Array<{ step: number; short: string; label: string; icon: StreamlineIconName }> = [
  { step: 1, short: 'Jenis', label: 'Pilih RPP atau Modul Ajar', icon: 'module' },
  { step: 2, short: 'Identitas', label: 'Identitas Pembelajaran', icon: 'profile' },
  { step: 3, short: 'Materi', label: 'Materi, Elemen, Topik & CP', icon: 'template' },
  { step: 4, short: 'Pembelajaran', label: 'Pengaturan Pembelajaran', icon: 'settings' },
  { step: 5, short: 'DPL', label: 'Dimensi Profil Lulusan', icon: 'layers' },
  { step: 6, short: 'Generate', label: 'Output & Generate', icon: 'magic' },
];

export default function WizardStepper({ currentStep, canAdvance, onStepChange }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#DDE3DC] bg-white p-3 shadow-sm sm:p-4">
      <div className="flex min-w-[760px] items-center">
        {STEPS.map(({ step, short, label, icon }, index) => {
          const completed = currentStep > step;
          const current = currentStep === step;
          const enabled = step < currentStep || (step === currentStep + 1 && canAdvance);
          return (
            <div key={step} className="flex min-w-0 flex-1 items-center">
              <button type="button" title={label} onClick={() => enabled && onStepChange(step)} disabled={!enabled && !current} className={`flex min-h-10 items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold transition-colors ${current ? 'bg-blue-50 text-blue-700' : completed ? 'text-emerald-700 hover:bg-emerald-50' : 'text-slate-400'}`}>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${current ? 'border-blue-200 bg-white text-blue-700' : completed ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50'}`}>
                  {completed ? <Check className="h-3.5 w-3.5" /> : <StreamlineDuotoneIcon name={icon} className="h-3.5 w-3.5" />}
                </span>
                <span>{short}</span>
              </button>
              {index < STEPS.length - 1 && <div className={`mx-1 h-px flex-1 ${completed ? 'bg-emerald-200' : 'bg-slate-200'}`} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
