export default function StatusBadge({ value }: { value: string }) {
  const positive = ['Aktif', 'Berhasil'].includes(value);
  const negative = ['Gagal', 'Jatuh tempo', 'Berisiko'].includes(value);
  const tone = positive ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : negative ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-amber-200 bg-amber-50 text-amber-700';
  return <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${tone}`}>{value}</span>;
}
