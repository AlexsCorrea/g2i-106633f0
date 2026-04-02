import { useMemo, forwardRef } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
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

const LOGO_PLACEHOLDER = (
  <div
    style={{
      width: 48,
      height: 48,
      borderRadius: 8,
      background: "#1d4ed8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

function getPageStyle(template: ReportTemplate): React.CSSProperties {
  const isLandscape = template.orientation === "landscape";
  const marginMap = {
    narrow: "10mm",
    normal: "15mm",
    wide: "20mm",
  };
  const margin = marginMap[template.margins ?? "normal"];

  return {
    width: isLandscape ? "277mm" : "190mm",
    margin: "0 auto",
    padding: margin,
    fontFamily: "'Inter', 'Arial', sans-serif",
    fontSize: "9pt",
    color: "#1a1a2e",
    background: "white",
    minHeight: isLandscape ? "190mm" : "277mm",
    boxSizing: "border-box" as const,
  };
}

function getDensityStyle(template: ReportTemplate) {
  const map = {
    compact: { cellPy: "4px", fontSize: "8pt" },
    normal: { cellPy: "7px", fontSize: "9pt" },
    comfortable: { cellPy: "10px", fontSize: "9.5pt" },
  };
  return map[template.density ?? "normal"];
}

const ReportPreview = forwardRef<HTMLDivElement, ReportPreviewProps>(
  (
    {
      template,
      filters,
      rows,
      companyName = "Zurich 2.0",
      agendaName,
      generatedByName,
    },
    ref
  ) => {
    const visibleFields = useMemo(
      () => template.fields.filter((f) => f.visible),
      [template.fields]
    );

    const grouped = useMemo(() => {
      if (template.groupBy) {
        return groupRows(rows, template.groupBy);
      }
      return new Map([["__all__", rows]]);
    }, [rows, template.groupBy]);

    const filterSummary = useMemo(() => {
      const parts: string[] = [];
      if (filters.startDate && filters.endDate) {
        const [sy, sm, sd] = filters.startDate.split("-");
        const [ey, em, ed] = filters.endDate.split("-");
        const start = `${sd}/${sm}/${sy}`;
        const end = `${ed}/${em}/${ey}`;
        parts.push(start === end ? `Data: ${start}` : `Período: ${start} a ${end}`);
      }
      if (filters.period) {
        const periodMap: Record<string, string> = {
          manha: "Manhã",
          tarde: "Tarde",
          noite: "Noite",
        };
        parts.push(`Turno: ${periodMap[filters.period] ?? filters.period}`);
      }
      if (filters.statuses?.length) {
        const labels = filters.statuses.map((s) => STATUS_LABELS[s] ?? s);
        parts.push(`Situação: ${labels.join(", ")}`);
      }
      if (filters.appointmentType && filters.appointmentType !== "all") {
        parts.push(`Tipo: ${filters.appointmentType}`);
      }
      if (agendaName) parts.push(`Agenda: ${agendaName}`);
      return parts;
    }, [filters, agendaName]);

    const density = getDensityStyle(template);
    const pageStyle = getPageStyle(template);

    const reportTitle = template.title || template.name;
    const reportSubtitle = template.subtitle || template.description;
    const institution = template.unitName || companyName;

    return (
      <div ref={ref} id="report-preview" className="report-document">
        {/* ── Screen wrapper (not printed) ── */}
        <style>{`
          @media screen {
            .report-document {
              background: #f3f4f6;
              padding: 24px;
              min-height: 400px;
            }
            .report-page {
              background: white;
              box-shadow: 0 4px 24px rgba(0,0,0,0.12);
              border-radius: 4px;
            }
          }
          @media print {
            .report-document {
              background: white;
              padding: 0;
            }
            .report-page {
              box-shadow: none;
              border-radius: 0;
              margin: 0;
              width: 100% !important;
            }
            @page {
              size: ${template.orientation === "landscape" ? "A4 landscape" : "A4 portrait"};
              margin: ${template.margins === "narrow" ? "10mm" : template.margins === "wide" ? "20mm" : "15mm"};
            }
          }
          .report-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          .report-table th {
            background: #1e3a5f;
            color: white;
            text-align: left;
            font-weight: 600;
            font-size: 8pt;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            padding: 7px 8px;
            border: 1px solid #1e3a5f;
          }
          .report-table td {
            padding: ${density.cellPy} 8px;
            font-size: ${density.fontSize};
            border-bottom: 1px solid #e5e7eb;
            border-left: 1px solid #f3f4f6;
            border-right: 1px solid #f3f4f6;
            vertical-align: top;
            word-break: break-word;
          }
          .report-table tr:nth-child(even) td {
            background: #f8fafc;
          }
          .report-table tr:last-child td {
            border-bottom: 2px solid #d1d5db;
          }
          .report-group-header {
            background: #e8eef6 !important;
            font-weight: 700;
            font-size: 8.5pt;
            color: #1e3a5f;
            border-top: 2px solid #1e3a5f;
            border-bottom: 1px solid #c5d3e8;
          }
          .report-group-header td {
            padding: 5px 8px !important;
            background: #e8eef6 !important;
            border-bottom: none !important;
          }
          .report-no-data td {
            text-align: center;
            color: #9ca3af;
            font-style: italic;
            padding: 24px 8px !important;
          }
        `}</style>

        <div className="report-page" style={pageStyle}>
          {/* ─── HEADER ────────────────────────────────── */}
          {template.showHeader && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 16,
                  paddingBottom: 12,
                  borderBottom: "3px solid #1e3a5f",
                  marginBottom: 12,
                }}
              >
                {/* Left: Logo + Institution */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {template.showLogo !== false && LOGO_PLACEHOLDER}
                  <div>
                    <div
                      style={{
                        fontSize: "11pt",
                        fontWeight: 700,
                        color: "#1e3a5f",
                        lineHeight: 1.2,
                      }}
                    >
                      {institution}
                    </div>
                    <div
                      style={{ fontSize: "8pt", color: "#6b7280", marginTop: 2 }}
                    >
                      Sistema de Gestão Clínica
                    </div>
                  </div>
                </div>

                {/* Right: Report title + Meta */}
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "13pt",
                      fontWeight: 700,
                      color: "#1e3a5f",
                      lineHeight: 1.2,
                    }}
                  >
                    {reportTitle}
                  </div>
                  {reportSubtitle && (
                    <div
                      style={{
                        fontSize: "8.5pt",
                        color: "#6b7280",
                        marginTop: 2,
                        maxWidth: "320px",
                      }}
                    >
                      {reportSubtitle}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: "7.5pt",
                      color: "#9ca3af",
                      marginTop: 4,
                    }}
                  >
                    Gerado em:{" "}
                    {format(new Date(), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                    {generatedByName &&
                      template.showUser &&
                      `  •  ${generatedByName}`}
                  </div>
                </div>
              </div>

              {/* ─── FILTERS ─────────────────────────────── */}
              {template.showFilters && filterSummary.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "4px 16px",
                    padding: "6px 10px",
                    background: "#f0f4fb",
                    border: "1px solid #c5d3e8",
                    borderRadius: 4,
                    marginBottom: 12,
                    fontSize: "8pt",
                    color: "#374151",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#1e3a5f" }}>
                    Filtros aplicados:
                  </span>
                  {filterSummary.map((f, i) => (
                    <span key={i}>
                      {i > 0 && (
                        <span style={{ color: "#d1d5db", marginRight: 4 }}>
                          |
                        </span>
                      )}
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ─── DATA TABLE ──────────────────────────────── */}
          {Array.from(grouped.entries()).map(
            ([groupKey, groupRowsArr], groupIdx) => (
              <div
                key={groupKey}
                className={
                  template.pageBreakOnGroup && groupIdx > 0
                    ? "break-before-page"
                    : ""
                }
                style={{ marginBottom: 16 }}
              >
                {groupKey !== "__all__" && (
                  <div
                    style={{
                      background: "#1e3a5f",
                      color: "white",
                      padding: "5px 10px",
                      fontWeight: 700,
                      fontSize: "8.5pt",
                      borderRadius: "4px 4px 0 0",
                    }}
                  >
                    {template.fields.find((f) => f.key === template.groupBy)
                      ?.label ?? template.groupBy}
                    : {groupKey}
                    <span
                      style={{
                        float: "right",
                        fontWeight: 400,
                        fontSize: "7.5pt",
                        opacity: 0.8,
                      }}
                    >
                      {groupRowsArr.length} registro(s)
                    </span>
                  </div>
                )}

                <table className="report-table break-inside-avoid">
                  <thead>
                    <tr>
                      <th
                        style={{
                          width: 20,
                          textAlign: "center",
                          padding: "7px 4px",
                        }}
                      >
                        #
                      </th>
                      {visibleFields.map((f) => (
                        <th
                          key={f.key}
                          style={{
                            width: f.width !== "auto" ? f.width : undefined,
                            textAlign:
                              f.align === "center"
                                ? "center"
                                : f.align === "right"
                                ? "right"
                                : "left",
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
                        <tr key={row.id || idx} className="break-inside-avoid">
                          <td
                            style={{
                              textAlign: "center",
                              color: "#9ca3af",
                              fontSize: "7.5pt",
                              width: 20,
                            }}
                          >
                            {idx + 1}
                          </td>
                          {visibleFields.map((f) => (
                            <td
                              key={f.key}
                              style={{
                                textAlign:
                                  f.align === "center"
                                    ? "center"
                                    : f.align === "right"
                                    ? "right"
                                    : "left",
                                fontWeight:
                                  f.key === "scheduled_time" ||
                                  f.key === "patient_name"
                                    ? 600
                                    : undefined,
                                fontFamily:
                                  f.key === "scheduled_time"
                                    ? "monospace"
                                    : undefined,
                              }}
                            >
                              {f.format
                                ? f.format(row[f.key], row)
                                : (row[f.key] ?? "—")}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr className="report-no-data">
                        <td colSpan={visibleFields.length + 1}>
                          Nenhum registro encontrado para os filtros selecionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {groupKey !== "__all__" && (
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: "7.5pt",
                      color: "#6b7280",
                      marginTop: 4,
                      paddingRight: 4,
                    }}
                  >
                    Subtotal: {groupRowsArr.length} registro(s)
                  </div>
                )}
              </div>
            )
          )}

          {/* ─── FOOTER ─────────────────────────────────── */}
          {template.showFooter && (
            <div
              style={{
                borderTop: "2px solid #1e3a5f",
                marginTop: 8,
                paddingTop: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "7.5pt",
                color: "#6b7280",
              }}
            >
              <span>
                {template.footerText || institution} — Total:{" "}
                <strong style={{ color: "#1e3a5f" }}>{rows.length}</strong>{" "}
                registro(s)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {generatedByName && template.showUser && (
                  <span>Gerado por: {generatedByName}</span>
                )}
                {template.showPageNumbers && <span>Página 1</span>}
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
