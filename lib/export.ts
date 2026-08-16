import type { RPPData } from '../types/rpp';
import { renderAssessment, renderRubrics } from './export/assessment-sections';
import { renderDimensions, renderFramework, renderIdentity, renderObjectives } from './export/base-sections';
import { renderReflection, renderWorksheet } from './export/closing-sections';
import { generateDocxBlob } from './export/docx-export';
import { escapeHtml } from './export/format';
import { renderLearningActivities } from './export/learning-section';
import { renderSourceBox } from './export/source-section';
import { DOCUMENT_STYLES } from './export/styles';
import { prepareFinalExportRPP } from './export/finalize';

export function generateHTMLDocument(inputRPP: RPPData): string {
  const rpp = prepareFinalExportRPP(inputRPP);
  const isRingkas = rpp.documentFormat === 'Ringkas';
  const documentTitle = isRingkas ? 'RENCANA PELAKSANAAN PEMBELAJARAN (RPP)' : 'MODUL AJAR KURIKULUM MERDEKA';
  const browserTitle = isRingkas ? `RPP ${escapeHtml(rpp.identity.subject)}` : `MODUL AJAR ${escapeHtml(rpp.identity.subject)}`;
  const subtitle = isRingkas ? 'KURIKULUM MERDEKA · PENDEKATAN PEMBELAJARAN MENDALAM (DEEP LEARNING)' : 'PENDEKATAN PEMBELAJARAN MENDALAM (DEEP LEARNING)';
  const mainSections = isRingkas
    ? `${renderIdentity(rpp)}${renderObjectives(rpp)}${renderLearningActivities(rpp)}${renderAssessment(rpp)}`
    : `${renderIdentity(rpp)}${renderDimensions(rpp)}${renderFramework(rpp)}${renderObjectives(rpp)}${renderLearningActivities(rpp)}${renderAssessment(rpp)}${renderRubrics(rpp)}${renderReflection(rpp)}${renderWorksheet(rpp)}`;

  return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>${browserTitle}</title><style>${DOCUMENT_STYLES}</style></head><body><div class="doc-container">
<h1 class="doc-title">${documentTitle}</h1><div class="doc-subtitle">${subtitle}</div>
${mainSections}
${renderSourceBox(rpp)}
</div></body></html>`;
}

export function printRPPToPDF(rpp: RPPData): void {
  try {
    const html = generateHTMLDocument(rpp);

    // Create a hidden iframe for print preview to avoid popup blockers in sandboxed environment
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (err) {
          console.error('Failed iframe print:', err);
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 2000);
        }
      }, 300);
      return;
    }
  } catch (err) {
    console.warn('Iframe print error, falling back to popup window:', err);
  }

  // Fallback to window.open if iframe is not supported
  try {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateHTMLDocument(rpp));
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  } catch (err) {
    console.error('Print popup blocked or failed:', err);
  }
}

export async function exportRPPToDocx(rpp: RPPData): Promise<void> {
  try {
    const finalRPP = prepareFinalExportRPP(rpp);
    const blob = await generateDocxBlob(finalRPP);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const sanitize = (value: string) => (value || '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'Dokumen';
    anchor.href = url;
    const prefix = rpp.documentFormat === 'Ringkas' ? 'RPP' : 'Modul_Ajar';
    anchor.download = `${prefix}_${sanitize(rpp.identity.subject)}_${sanitize(rpp.identity.grade)}_${sanitize(rpp.identity.topic)}.docx`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error('Export to DOCX failed, falling back to html blob:', err);
    try {
      const htmlContent = generateHTMLDocument(rpp);
      const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const sanitize = (value: string) => (value || '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'Dokumen';
      anchor.href = url;
      const prefix = rpp.documentFormat === 'Ringkas' ? 'RPP' : 'Modul_Ajar';
      anchor.download = `${prefix}_${sanitize(rpp.identity.subject)}_${sanitize(rpp.identity.grade)}_${sanitize(rpp.identity.topic)}.doc`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (fallbackErr) {
      console.error('Fallback export failed:', fallbackErr);
    }
  }
}
