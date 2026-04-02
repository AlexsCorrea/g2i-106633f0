import { useMemo, forwardRef } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ReportTemplate, ReportFilters } from "@/lib/reportEngine";
import { groupRows, STATUS_LABELS } from "@/lib/reportEngine";

interface ReportPreviewProps {
  template: ReportTemplate;
  filters: ReportFilters;
  rows: Record<string, any>[];
  companyName?: string;
  agendaName?: string;
  generatedByName?: string;
}

// ── Generic institutional logo ──────────────────────────────────────────────
const LOGO_PLACEHOLDER = (
  <div
    style={{
      width: 44,
      height: 44,
      borderRadius: 6,
      background: "linear-gradient(135deg,#1d4ed8,#1e3a5f)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      printColorAdjust: "exact" as any,
      WebkitPrintColorAdjust: "exact" as any,
    }}
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

// ── Derive styles from template ──────────────────────────────────────────────
function getPageWidth(template: ReportTemplate): string {
  // "usable" width (inside margins, in mm) for A4
  const marginsMap = { narrow: 20, normal: 30, wide: 40 }; // total horizontal margins
  const totalMargin = marginsMap[template.margins ?? "normal"];
  if (template.orientation === "landscape") {
    return `${297 - totalMargin}mm`; // A4 landscape = 297mm wide
  }
  return `${210 - totalMargin}mm`; // A4 portrait  = 210mm wide
}

function getDensity(template: ReportTemplate) {
  const map = {
    compact:     { cellPy: "3px",  cellPx: "6px",  fontSize: "7.5pt", thSize: "7pt" },
    normal:      { cellPy: "6px",  cellPx: "8px",  fontSize: "8.5pt", thSize: "7.5pt" },
    comfortable: { cellPy: "9px",  cellPx: "10px", fontSize: "9pt",   thSize: "8pt" },
  };
  return map[template.density ?? "normal"];
}

function getBorderStyle(template: ReportTemplate) {
  const bs = template.borderStyle ?? "light";
  return {
    none:  { td: "none",                    th: "1px solid #1e3a5f" },
    light: { td: "1px solid #e5e7eb",       th: "1px solid #1e3a5f" },
    full:  { td: "1px solid #d1d5db",       th: "1px solid #1e3a5f" },
  }[bs];
}

// ── Component ────────────────────────────────────────────────────────────────
const ReportPreview = forwardRef<HTMLDivElement, ReportPreviewProps>(
  ({ template, filters, rows, companyName = "Zurich 2.0", agendaName, generatedByName }, ref) => {
    const visibleFields = useMemo(() => template.fields.filter((f) => f.visible), [template.fields]);
    const density = getDensity(template);
    const border = getBorderStyle(template);
    const isLandscape = template.orientation === "landscape";
    const margin = { narrow: "10mm", normal: "15mm", wide: "20mm" }[template.margins ?? "normal"];

    const grouped = useMemo(() => {
      if (template.groupBy) return groupRows(rows, template.groupBy);
      return new Map<string, Record<string, any>[]>([["__all__", rows]]);
    }, [rows, template.groupBy]);

    const filterSummary = useMemo(() => {
      const parts: string[] = [];
      if (filters.startDate && filters.endDate) {
        const fmt = (s: string) => s.split("-").reverse().join("/");
        const s = fmt(filters.startDate), e = fmt(filters.endDate);
        parts.push(s === e ? `Data: ${s}` : `Período: ${s} a ${e}`);
      }
      if (filters.period) {
        parts.push(`Turno: ${{ manha: "Manhã", tarde: "Tarde", noite: "Noite" }[filters.period] ?? filters.period}`);
      }
      if (filters.statuses?.length) {
        parts.push(`Situação: ${filters.statuses.map((s) => STATUS_LABELS[s] ?? s).join(", ")}`);
      }
      if (filters.appointmentType && filters.appointmentType !== "all") {
        parts.push(`Tipo: ${filters.appointmentType}`);
      }
      if (agendaName) parts.push(`Agenda: ${agendaName}`);
      return parts;
    }, [filters, agendaName]);

    const reportTitle = template.title || template.name;
    const reportSubtitle = template.subtitle || template.description;
    const institution = template.unitName || companyName;
    const pageWidthMm = isLandscape ? 297 : 210;
    const marginMm = template.margins === "narrow" ? 10 : template.margins === "wide" ? 20 : 15;
    const usableWidthMm = pageWidthMm - marginMm * 2;

    // Print-only @page + row break-inside is injected via <style> inside the DOM node
    // so it applies when we clone this node into the print window.
    const pageCss = `
      @media print {
        @page {
          size: A4 ${isLandscape ? "landscape" : "portrait"};
          margin: ${margin};
        }
        .rp-doc { background: white !important; padding: 0 !important; }
        .rp-page {
          box-shadow: none !important;
          border-radius: 0 !important;
          margin: 0 auto !important;
          padding: 0 !important;
          width: ${usableWidthMm}mm !important;
        }
        .rp-row { page-break-inside: avoid; break-inside: avoid; }
        .rp-group { page-break-inside: avoid; break-inside: avoid; }
        .rp-break { page-break-before: always; break-before: page; }
        .rp-footer { page-break-inside: avoid; break-inside: avoid; }
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }
      }
      @media screen {
        .rp-doc { background: #f1f5f9; padding: 20px; }
        .rp-page { box-shadow: 0 2px 16px rgba(0,0,0,0.13); background: white; }
      }
      .rp-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      .rp-th {
        background: #1e3a5f;
        color: white;
        font-weight: 600;
        font-size: ${density.thSize};
        letter-spacing: 0.04em;
        text-transform: uppercase;
        padding: 7px ${density.cellPx};
        border: ${border.th};
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .rp-td {
        padding: ${density.cellPy} ${density.cellPx};
        font-size: ${density.fontSize};
        border-bottom: ${border.td};
        vertical-align: top;
        word-break: break-word;
        overflow-wrap: break-word;
      }
      .rp-td-left   { text-align: left; }
      .rp-td-center { text-align: center; }
      .rp-td-right  { text-align: right; }
      .rp-even td, .rp-even .rp-td {
        background: #f8fafc;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .rp-nodata td { text-align: center; color: #9ca3af; font-style: italic; padding: 20px 8px; }
      .rp-group-hdr {
        background: #e8eef6;
        padding: 5px 10px;
        font-weight: 700;
        font-size: 8pt;
        color: #1e3a5f;
        border-top: 2px solid #1e3a5f;
        border-bottom: 1px solid #c5d3e8;
        display: flex;
        justify-content: space-between;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    `;

    return (
      <div ref={ref} id="report-preview" className="rp-doc">
        <style dangerouslySetInnerHTML={{ __html: pageCss }} />

        <div
          className="rp-page"
          style={{
            width: `${usableWidthMm}mm`,
            margin: "0 auto",
            padding: margin,
            fontFamily: "'Inter', Arial, sans-serif",
            fontSize: "9pt",
            color: "#1a1a2e",
            boxSizing: "border-box",
          }}
        >
          {/* ── HEADER ─────────────────────────────────────────── */}
          {template.showHeader && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 16,
                  paddingBottom: 10,
                  borderBottom: "2.5px solid #1e3a5f",
                  marginBottom: 10,
                }}
              >
                {/* Left: Logo + Institution */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {template.showLogo !== false && LOGO_PLACEHOLDER}
                  <div>
                    <div style={{ fontSize: "11pt", fontWeight: 700, color: "#1e3a5f", lineHeight: 1.2 }}>
                      {institution}
                    </div>
                    <div style={{ fontSize: "7.5pt", color: "#6b7280", marginTop: 2 }}>
                      Sistema de Gestão Clínica
                    </div>
                  </div>
                </div>

                {/* Right: Title + Meta */}
                <div style={{ textAlign: "right", maxWidth: "55%" }}>
                  <div style={{ fontSize: "12pt", fontWeight: 700, color: "#1e3a5f", lineHeight: 1.2 }}>
                    {reportTitle}
                  </div>
                  {reportSubtitle && (
                    <div style={{ fontSize: "8pt", color: "#6b7280", marginTop: 2 }}>
                      {reportSubtitle}
                    </div>
                  )}
                  {template.showEmissionDate !== false && (
                    <div style={{ fontSize: "7pt", color: "#9ca3af", marginTop: 4 }}>
                      Gerado em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      {generatedByName && template.showUser && `  •  ${generatedByName}`}
                    </div>
                  )}
                </div>
              </div>

              {/* Filters row */}
              {template.showFilters && filterSummary.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "3px 14px",
                    padding: "5px 10px",
                    background: "#f0f4fb",
                    border: "1px solid #c5d3e8",
                    borderRadius: 4,
                    marginBottom: 12,
                    fontSize: "7.5pt",
                    color: "#374151",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#1e3a5f" }}>Filtros aplicados:</span>
                  {filterSummary.map((f, i) => (
                    <span key={i}>
                      {i > 0 && <span style={{ color: "#d1d5db", marginRight: 4 }}>|</span>}
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── DATA GROUPS ─────────────────────────────────────── */}
          {Array.from(grouped.entries()).map(([groupKey, groupRowsArr], groupIdx) => (
            <div
              key={groupKey}
              className={`rp-group${template.pageBreakOnGroup && groupIdx > 0 ? " rp-break" : ""}`}
              style={{ marginBottom: 14 }}
            >
              {/* Group header */}
              {groupKey !== "__all__" && (
                <div className="rp-group-hdr">
                  <span>
                    {template.fields.find((f) => f.key === template.groupBy)?.label ?? template.groupBy}: {groupKey}
                  </span>
                  <span style={{ fontWeight: 400, fontSize: "7.5pt", opacity: 0.8 }}>
                    {groupRowsArr.length} registro(s)
                  </span>
                </div>
              )}

              <table className="rp-table">
                <thead>
                  <tr>
                    <th className="rp-th" style={{ width: 22, textAlign: "center", padding: `7px 4px` }}>#</th>
                    {visibleFields.map((f) => (
                      <th
                        key={f.key}
                        className="rp-th"
                        style={{
                          width: f.width !== "auto" ? f.width : undefined,
                          textAlign: f.align === "center" ? "center" : f.align === "right" ? "right" : "left",
                        }}
                      >
                        {f.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groupRowsArr.length > 0 ? (
                    groupRowsArr.map((row, idx) => (
                      <tr key={row.id || idx} className={`rp-row${idx % 2 === 1 ? " rp-even" : ""}`}>
                        <td className="rp-td rp-td-center" style={{ color: "#9ca3af", fontSize: "7.5pt", width: 22 }}>
                          {idx + 1}
                        </td>
                        {visibleFields.map((f) => (
                          <td
                            key={f.key}
                            className={`rp-td rp-td-${f.align ?? "left"}`}
                            style={{
                              fontWeight: f.key === "scheduled_time" || f.key === "patient_name" ? 600 : undefined,
                              fontFamily: f.key === "scheduled_time" ? "monospace" : undefined,
                            }}
                          >
                            {f.format ? f.format(row[f.key], row) : (row[f.key] ?? "—")}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr className="rp-nodata">
                      <td colSpan={visibleFields.length + 1}>
                        Nenhum registro encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Subtotal per group */}
              {groupKey !== "__all__" && template.showSubtotals && (
                <div style={{ textAlign: "right", fontSize: "7.5pt", color: "#6b7280", marginTop: 3, paddingRight: 4 }}>
                  Subtotal do grupo: <strong>{groupRowsArr.length}</strong> registro(s)
                </div>
              )}
            </div>
          ))}

          {/* ── SIGNATURE LINE ──────────────────────────────────── */}
          {template.footerShowSignatureLine && (
            <div style={{ marginTop: 32, borderTop: "1px solid #374151", width: "40%", paddingTop: 6, fontSize: "8pt", color: "#374151" }}>
              Assinatura / Carimbo
            </div>
          )}

          {/* ── INSTITUTIONAL NOTE ──────────────────────────────── */}
          {template.footerInstitutionalNote && (
            <div style={{ marginTop: 10, fontSize: "7pt", color: "#9ca3af", fontStyle: "italic" }}>
              {template.footerInstitutionalNote}
            </div>
          )}

          {/* ── FOOTER ─────────────────────────────────────────── */}
          {template.showFooter && (
            <div
              className="rp-footer"
              style={{
                borderTop: "2px solid #1e3a5f",
                marginTop: 10,
                paddingTop: 6,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "7.5pt",
                color: "#6b7280",
              }}
            >
              <span>
                {template.footerText || institution}
                {template.showTotals !== false && (
                  <> — Total: <strong style={{ color: "#1e3a5f" }}>{rows.length}</strong> registro(s)</>
                )}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {template.footerShowDate && (
                  <span>{format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                )}
                {generatedByName && template.showUser && <span>Gerado por: {generatedByName}</span>}
                {template.showPageNumbers && (
                  <span>
                    {template.footerPaginationFormat === "page_only" ? "Página 1" : "Página 1 de 1"}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

ReportPreview.displayName = "ReportPreview";
export default ReportPreview;
