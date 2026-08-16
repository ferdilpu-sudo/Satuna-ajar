import type { RPPData } from '../../types/rpp';
import { activityStageLabel, safe } from './format';

export function renderLearningActivities(rpp: RPPData): string {
  const isRingkas = rpp.documentFormat === 'Ringkas';
  const sectionTitle = isRingkas ? 'C. LANGKAH-LANGKAH PEMBELAJARAN MENDALAM' : 'H. LANGKAH-LANGKAH PEMBELAJARAN MENDALAM';
  const meetingCount = Math.max(1, rpp.identity.meetingCount || 1);
  const meetingMinutes = rpp.identity.jpCount * rpp.identity.durationPerJP;
  let rows = '';

  for (let meeting = 1; meeting <= meetingCount; meeting++) {
    const items = rpp.activities.filter((activity) => (activity.meetingNumber || 1) === meeting);
    if (!items.length) continue;
    const meetingTotal = items.reduce((sum, item) => sum + item.timeMinutes, 0);
    if (meetingCount > 1) {
      rows += `<tr style="background:#e2e8f0;font-weight:bold;"><td colspan="4">PERTEMUAN ${meeting} (${meetingTotal} Menit)</td></tr>`;
    }

    for (const activity of items) {
      const principles = (activity.deepLearningBadges || []).filter((badge) => ['Berkesadaran', 'Bermakna', 'Menggembirakan'].includes(badge));
      const principleText = principles.length ? principles.join(', ') : '—';
      rows += `<tr><td><b>${safe(activityStageLabel(activity.stage))}</b><br/>(${activity.timeMinutes} Menit)</td><td><b>${safe(activity.syntaxOrPrinciple)}</b></td><td>${safe(activity.description)}${activity.scaffoldingNotes ? `<br/><br/><i>*Dukungan Guru: ${safe(activity.scaffoldingNotes)}</i>` : ''}</td><td><b>Pengalaman:</b> ${safe(activity.experience)}<br/><b>Prinsip:</b> ${safe(principleText)}</td></tr>`;
    }
  }

  return `<div class="section-header">${sectionTitle}</div><p><i>Total Alokasi Waktu: ${rpp.identity.totalMinutes} Menit (${meetingCount} Pertemuan @ ${meetingMinutes} Menit)</i></p><table class="data-table"><thead><tr><th width="15%">Tahap & Waktu</th><th width="20%">Tahap Model / Prinsip</th><th width="40%">Deskripsi Kegiatan (Guru & Peserta Didik)</th><th width="25%">Pengalaman & Prinsip Deep Learning</th></tr></thead><tbody>${rows}</tbody></table>`;
}
