import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export const INPUT = 'w-full rounded-lg border border-[#DDE3DC] bg-white px-3 py-2 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

export function EditorSection({ title, description, children, open = false }: { title: string; description?: string; children: ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group rounded-xl border border-[#DDE3DC] bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <div><p className="text-xs font-extrabold text-slate-900">{title}</p>{description ? <p className="mt-0.5 text-[11px] text-slate-500">{description}</p> : null}</div>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-[#EDF0EC] p-4">{children}</div>
    </details>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="block space-y-1.5"><span className="text-[11px] font-bold text-slate-700">{label}</span>{children}{hint ? <span className="block text-[10px] text-slate-400">{hint}</span> : null}</label>;
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${INPUT} ${props.className || ''}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${INPUT} min-h-20 resize-y ${props.className || ''}`} />;
}

export function LineListEditor({ label, values, onChange, placeholder }: { label: string; values: string[]; onChange: (values: string[]) => void; placeholder?: string }) {
  return <Field label={label}><TextArea rows={4} value={values.join('\n')} placeholder={placeholder} onChange={(event) => onChange(event.target.value.split('\n').map((item) => item.trim()).filter(Boolean))} /></Field>;
}
