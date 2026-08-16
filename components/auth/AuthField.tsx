import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
  error?: string;
  trailing?: React.ReactNode;
}

export default function AuthField({ label, icon, error, trailing, className = '', id, ...props }: Props) {
  const inputId = id || props.name;
  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-2 block text-[13px] font-bold text-slate-700">{label}</span>
      <span className={`flex min-h-12 items-center rounded-xl border bg-white transition ${error ? 'border-red-300 ring-2 ring-red-50' : 'border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50'} ${className}`}>
        <span className="ml-3.5 shrink-0 text-slate-400">{icon}</span>
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error && inputId ? `${inputId}-error` : undefined}
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          {...props}
        />
        {trailing}
      </span>
      {error && inputId && <span id={`${inputId}-error`} className="mt-1.5 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}
