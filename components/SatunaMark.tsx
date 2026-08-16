import React from 'react';

interface Props {
  className?: string;
}

export default function SatunaMark({ className = '' }: Props) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-600 text-white shadow-sm ${className}`}
    >
      <span className="text-[19px] font-black tracking-[-0.08em]">S</span>
      <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-200/90" />
    </span>
  );
}
