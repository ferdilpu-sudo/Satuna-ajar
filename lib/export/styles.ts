export const DOCUMENT_STYLES = `
@page { size: A4; margin: 20mm 15mm; }
body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; line-height: 1.5; color: #1a1a1a; margin: 0; }
.doc-container { max-width: 800px; margin: 0 auto; padding: 20px; }
h1.doc-title { font-size: 16pt; text-align: center; margin-bottom: 4px; color: #1e1b4b; text-transform: uppercase; }
.doc-subtitle { font-size: 12pt; font-weight: bold; text-align: center; margin-bottom: 20px; color: #3730a3; }
.section-header { font-size: 12pt; font-weight: bold; color: #1e1b4b; background: #f1f5f9; padding: 6px 10px; border-left: 4px solid #4f46e5; margin: 24px 0 12px; }
table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 10.5pt; }
table.data-table th { background: #312e81; color: #fff; padding: 8px; border: 1px solid #cbd5e1; text-align: left; }
table.data-table td { padding: 8px; border: 1px solid #cbd5e1; vertical-align: top; }
table.data-table tr:nth-child(even) td { background: #f8fafc; }
.badge { display: inline-block; padding: 2px 6px; font-size: 8.5pt; font-weight: bold; border-radius: 4px; margin: 0 4px 4px 0; }
.badge-experience { background:#ede9fe; color:#5b21b6; border:1px solid #ddd6fe; }
.badge-mindful { background:#dcfce7; color:#166534; border:1px solid #bbf7d0; }
.badge-meaningful { background:#e0f2fe; color:#075985; border:1px solid #bae6fd; }
.badge-joyful { background:#fef3c7; color:#92400e; border:1px solid #fde68a; }
ul,ol { margin:4px 0 8px; padding-left:20px; } li { margin-bottom:4px; }
.source-box { font-size:9.5pt; padding:8px 12px; margin-top:20px; border-radius:4px; color:#64748b; background:#f8fafc; border:1px dashed #cbd5e1; }
@media print { tr, .section-header { break-inside: avoid; } }
`;
