import { Fragment } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import type { LearningActivityItem } from '../../types/rpp';

const stageLabel = (stage: LearningActivityItem['stage']) => stage === 'PENDAHULUAN' ? 'Pendahuluan' : stage === 'PENUTUP' ? 'Penutup' : 'Kegiatan Inti';

interface Props { activities: LearningActivityItem[]; totalMinutes: number; regenerating: boolean; onRegenerate: () => void; sectionTitle?: string; }
export default function LearningActivitiesSection({ activities, totalMinutes, regenerating, onRegenerate, sectionTitle = 'H. LANGKAH-LANGKAH PEMBELAJARAN MENDALAM' }: Props) {
  // Determine distinct meeting numbers
  const meetingNumbers = Array.from(new Set(activities.map((a) => a.meetingNumber || 1))).sort((a, b) => a - b);
  const isMultiMeeting = meetingNumbers.length > 1;

  return <section className="space-y-3">
    <div className="section-title"><span>{sectionTitle}</span><button onClick={onRegenerate} disabled={regenerating} className="text-xs font-normal text-blue-700 flex gap-1">{regenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}Buat Ulang</button></div>
    <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg text-xs font-bold text-blue-900 flex justify-between"><span>MEMAHAMI → MENGAPLIKASI → MEREFLEKSI</span><span>Total: {totalMinutes} menit</span></div>
    <div className="border border-slate-200 rounded-lg overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-800 text-white">
            <th className="p-2.5">Tahap & Waktu</th>
            <th className="p-2.5">Tahap Model / Prinsip</th>
            <th className="p-2.5">Deskripsi Kegiatan</th>
            <th className="p-2.5">Pengalaman & Prinsip Deep Learning</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {meetingNumbers.map((mNum) => {
            const meetingActivities = activities.filter((a) => (a.meetingNumber || 1) === mNum);
            const mTotal = meetingActivities.reduce((sum, item) => sum + item.timeMinutes, 0);
            return (
              <Fragment key={`meeting-${mNum}`}>
                {isMultiMeeting && (
                  <tr className="bg-blue-50 font-bold text-slate-900">
                    <td colSpan={4} className="p-2.5 bg-blue-50">
                      PERTEMUAN {mNum} ({mTotal} Menit)
                    </td>
                  </tr>
                )}
                {meetingActivities.map((a, index) => (
                  <tr key={`${mNum}-${a.stage}-${index}`}>
                    <td className="p-2.5 font-bold">{stageLabel(a.stage)}<br/><span className="text-blue-700 font-normal">{a.timeMinutes} menit</span></td>
                    <td className="p-2.5 font-bold">{a.syntaxOrPrinciple}</td>
                    <td className="p-2.5">{a.description}{a.scaffoldingNotes ? <p className="mt-1 text-[11px] text-amber-800 italic bg-amber-50 p-1.5 rounded-md">*Dukungan Guru: {a.scaffoldingNotes}</p> : null}</td>
                    <td className="p-2.5"><b className="text-blue-800">{a.experience}</b><div>{a.deepLearningBadges?.join(' · ')}</div></td>
                  </tr>
                ))}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
    <style jsx>{`.section-title{display:flex;justify-content:space-between;background:#f1f5f9;padding:.375rem .75rem;border-left:4px solid #2563eb;font-weight:700;color:#172018}`}</style>
  </section>;
}
