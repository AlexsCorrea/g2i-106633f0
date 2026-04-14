import { format } from "date-fns";

/* ── Tipos ── */
interface ReportData {
  report_number: string;
  issued_at?: string;
  released_at?: string;
  patients?: { full_name?: string; cpf?: string; birth_date?: string; gender?: string; cns?: string };
  lab_requests?: {
    request_number?: string;
    specialty?: string;
    insurance_name?: string;
    clinical_notes?: string;
    profiles?: { full_name?: string; crm_coren?: string };
  };
}

interface ResultItem {
  id: string;
  value?: string;
  unit?: string;
  reference_text?: string;
  is_critical?: boolean;
  is_abnormal?: boolean;
  technical_notes?: string;
  performed_at?: string;
  lab_request_items?: {
    lab_exams?: { name?: string; code?: string; unit?: string; result_mode?: string };
  };
  _components?: ComponentItem[];
}

interface ComponentItem {
  id: string;
  value?: string;
  numeric_value?: number | null;
  is_abnormal?: boolean;
  is_critical?: boolean;
  lab_exam_components?: {
    name?: string;
    code?: string;
    group_name?: string;
    unit?: string;
    reference_text?: string;
    sort_order?: number;
  };
}

interface PrintProps {
  report: ReportData;
  results: ResultItem[];
  unitName?: string;
  logoUrl?: string;
}

/* ── CSS para impressão ── */
export const labReportCSS = `
@page { size: A4; margin: 12mm 15mm; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; font-size: 10px; line-height: 1.4; }

.report-page { page-break-after: always; }
.report-page:last-child { page-break-after: auto; }

.inst-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1a5276; padding-bottom: 8px; margin-bottom: 10px; }
.inst-header .logo { height: 44px; }
.inst-header .inst-info { text-align: center; flex: 1; }
.inst-header .inst-info h1 { font-size: 14px; color: #1a5276; font-weight: 700; letter-spacing: 0.5px; }
.inst-header .inst-info p { font-size: 8px; color: #666; margin-top: 1px; }

.patient-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 20px; margin-bottom: 10px; padding: 6px 8px; background: #f4f6f8; border: 1px solid #e0e4e8; border-radius: 3px; font-size: 9.5px; }
.patient-grid .pg-label { color: #666; font-size: 8px; text-transform: uppercase; letter-spacing: 0.3px; }
.patient-grid .pg-value { font-weight: 600; }
.patient-grid .pg-full { grid-column: 1 / -1; }

.exam-title { background: #1a5276; color: white; padding: 5px 10px; font-size: 12px; font-weight: 700; margin-top: 12px; margin-bottom: 2px; border-radius: 2px; letter-spacing: 0.5px; }
.exam-subtitle { font-size: 8px; color: #e0e0e0; font-weight: 400; margin-left: 8px; }
.exam-meta { display: flex; gap: 16px; font-size: 8px; color: #666; margin-bottom: 6px; padding: 2px 10px; }

.group-header { background: #e8eef4; padding: 3px 10px; font-size: 9px; font-weight: 700; color: #1a5276; border-bottom: 1px solid #c8d4e0; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.3px; }

.result-table { width: 100%; border-collapse: collapse; }
.result-table th { background: #f0f3f6; color: #333; padding: 3px 8px; text-align: left; font-size: 8px; text-transform: uppercase; letter-spacing: 0.3px; border-bottom: 1px solid #d0d4d8; }
.result-table td { padding: 3px 8px; border-bottom: 1px solid #eaeaea; font-size: 9.5px; }
.result-table tr:nth-child(even) { background: #fafbfc; }
.result-table .comp-name { padding-left: 14px; color: #333; }
.result-table .val-normal { color: #1a1a1a; }
.result-table .val-abnormal { color: #c77d00; font-weight: 600; }
.result-table .val-critical { color: #c0392b; font-weight: 700; }
.result-table .ref-col { color: #888; font-size: 9px; }

.simple-result { display: grid; grid-template-columns: 1fr auto auto auto; gap: 4px 12px; padding: 4px 8px; border-bottom: 1px solid #eaeaea; align-items: baseline; }
.simple-result .sr-exam { font-weight: 600; font-size: 10px; }
.simple-result .sr-value { font-family: 'Consolas', 'Courier New', monospace; font-size: 10px; }
.simple-result .sr-unit { font-size: 9px; color: #666; }
.simple-result .sr-ref { font-size: 9px; color: #888; }

.tech-notes { margin-top: 4px; padding: 3px 10px; font-size: 8.5px; color: #555; font-style: italic; }
.clinical-info { margin-top: 8px; padding: 4px 10px; font-size: 9px; color: #444; border-left: 3px solid #1a5276; background: #f8f9fb; }

.footer-signature { margin-top: 30px; display: flex; justify-content: center; gap: 60px; }
.sig-block { text-align: center; min-width: 180px; }
.sig-line { border-top: 1px solid #333; padding-top: 3px; margin-top: 20px; }
.sig-name { font-size: 9.5px; font-weight: 600; }
.sig-role { font-size: 8px; color: #666; }

.doc-footer { margin-top: 16px; padding-top: 6px; border-top: 1px solid #ccc; text-align: center; font-size: 7.5px; color: #aaa; }
`;

/* ── Componente de renderização HTML ── */
export function renderLabReportHTML(props: PrintProps): string {
  const { report, results, unitName, logoUrl } = props;
  const p = report.patients;
  const req = report.lab_requests;

  const fmtDate = (d?: string) => d ? format(new Date(d), "dd/MM/yyyy HH:mm") : "—";
  const fmtDateShort = (d?: string) => d ? format(new Date(d), "dd/MM/yyyy") : "—";

  const age = (bd?: string) => {
    if (!bd) return "";
    const diff = Date.now() - new Date(bd).getTime();
    const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
    return `${years} anos`;
  };

  const gender = (g?: string) => g === "M" ? "Masculino" : g === "F" ? "Feminino" : g || "—";

  // Header
  let html = `<div class="inst-header">`;
  if (logoUrl) html += `<img src="${logoUrl}" class="logo" />`;
  html += `<div class="inst-info">
    <h1>${unitName || "LABORATÓRIO CLÍNICO"}</h1>
    <p>Sistema Zurich 2.0 — Gestão Laboratorial</p>
  </div>`;
  html += `</div>`;

  // Patient info
  html += `<div class="patient-grid">
    <div><span class="pg-label">Paciente:</span> <span class="pg-value">${p?.full_name || "—"}</span></div>
    <div><span class="pg-label">Nº Laudo:</span> <span class="pg-value">${report.report_number}</span></div>
    <div><span class="pg-label">Nasc.:</span> <span class="pg-value">${fmtDateShort(p?.birth_date)} ${age(p?.birth_date) ? `(${age(p?.birth_date)})` : ""}</span></div>
    <div><span class="pg-label">Sexo:</span> <span class="pg-value">${gender(p?.gender)}</span></div>
    <div><span class="pg-label">CPF:</span> <span class="pg-value">${p?.cpf || "—"}</span></div>
    <div><span class="pg-label">Pedido:</span> <span class="pg-value">${req?.request_number || "—"}</span></div>
    <div><span class="pg-label">Médico Solicitante:</span> <span class="pg-value">${req?.profiles?.full_name || "—"}</span></div>
    <div><span class="pg-label">Convênio:</span> <span class="pg-value">${req?.insurance_name || "Particular"}</span></div>
    <div><span class="pg-label">Emissão:</span> <span class="pg-value">${fmtDate(report.issued_at)}</span></div>
    <div><span class="pg-label">Liberação:</span> <span class="pg-value">${fmtDate(report.released_at)}</span></div>
  </div>`;

  // Render each result
  for (const r of results) {
    const exam = r.lab_request_items?.lab_exams;
    const examName = exam?.name || "Exame";
    const isStructured = exam?.result_mode === "estruturado" && r._components?.length;

    html += `<div class="exam-title">${examName}`;
    if (r.is_critical) html += ` <span style="color:#ff6b6b; font-size:10px;">⚠ VALOR CRÍTICO</span>`;
    html += `</div>`;

    // Exam metadata
    html += `<div class="exam-meta">`;
    if (r.performed_at) html += `<span>Data da Coleta: ${fmtDate(r.performed_at)}</span>`;
    html += `</div>`;

    if (isStructured) {
      // Group components
      const groups = new Map<string, ComponentItem[]>();
      for (const c of r._components!) {
        const g = c.lab_exam_components?.group_name || "Geral";
        if (!groups.has(g)) groups.set(g, []);
        groups.get(g)!.push(c);
      }

      for (const [gName, comps] of groups) {
        html += `<div class="group-header">${gName}</div>`;
        html += `<table class="result-table"><thead><tr>
          <th style="width:40%">Parâmetro</th>
          <th style="width:20%">Resultado</th>
          <th style="width:10%">Unidade</th>
          <th style="width:30%">Valores Referenciais</th>
        </tr></thead><tbody>`;

        for (const c of comps) {
          const ec = c.lab_exam_components;
          const valClass = c.is_critical ? "val-critical" : c.is_abnormal ? "val-abnormal" : "val-normal";
          const displayVal = c.value || "—";
          const boldVal = c.is_critical || c.is_abnormal;

          html += `<tr>
            <td class="comp-name">${ec?.name || "—"}</td>
            <td class="${valClass}">${boldVal ? `<strong>${displayVal}</strong>` : displayVal}</td>
            <td>${ec?.unit || ""}</td>
            <td class="ref-col">${ec?.reference_text || ""}</td>
          </tr>`;
        }
        html += `</tbody></table>`;
      }
    } else {
      // Simple exam
      const valClass = r.is_critical ? "val-critical" : r.is_abnormal ? "val-abnormal" : "val-normal";
      html += `<div class="simple-result">
        <span class="sr-exam">${examName}</span>
        <span class="sr-value ${valClass}">${r.is_critical || r.is_abnormal ? `<strong>${r.value || "—"}</strong>` : (r.value || "—")}</span>
        <span class="sr-unit">${r.unit || exam?.unit || ""}</span>
        <span class="sr-ref">${r.reference_text || ""}</span>
      </div>`;
    }

    if (r.technical_notes) {
      html += `<div class="tech-notes">Obs.: ${r.technical_notes}</div>`;
    }
  }

  // Clinical info
  if (req?.clinical_notes) {
    html += `<div class="clinical-info"><strong>Informação Clínica:</strong> ${req.clinical_notes}</div>`;
  }

  // Footer signature
  html += `<div class="footer-signature">
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-name">Responsável Técnico</div>
      <div class="sig-role">CRF/CRM — Laboratório</div>
    </div>
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-name">Liberado por</div>
      <div class="sig-role">${unitName || "Laboratório Zurich"}</div>
    </div>
  </div>`;

  // Doc footer
  html += `<div class="doc-footer">
    Documento emitido eletronicamente pelo Sistema Zurich 2.0 — ${format(new Date(), "dd/MM/yyyy HH:mm")}
  </div>`;

  return html;
}

/* ── Impressão consolidada (múltiplos laudos) ── */
export function renderConsolidatedReportHTML(
  reports: { report: ReportData; results: ResultItem[] }[],
  unitName?: string,
  logoUrl?: string
): string {
  return reports.map((r, i) =>
    `<div class="report-page">${renderLabReportHTML({ report: r.report, results: r.results, unitName, logoUrl })}</div>`
  ).join("");
}

/* ── Abrir janela de impressão ── */
export function openPrintWindow(htmlContent: string, title: string) {
  const w = window.open("", "_blank", "width=800,height=1100");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head>
    <title>${title}</title>
    <style>${labReportCSS}</style>
  </head><body>${htmlContent}</body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 350);
}

/* ── Preview React Component ── */
export function LabReportPreview({ report, results, unitName, logoUrl }: PrintProps) {
  const html = renderLabReportHTML({ report, results, unitName, logoUrl });
  return (
    <div
      className="border rounded-lg bg-white text-black p-6 shadow-sm"
      style={{ fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 11, lineHeight: 1.4 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
