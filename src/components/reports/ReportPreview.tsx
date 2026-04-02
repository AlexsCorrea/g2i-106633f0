import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { ReportTemplate, ReportFilters } from "@/lib/reportEngine";
import { groupRows } from "@/lib/reportEngine";

interface ReportPreviewProps {
  template: ReportTemplate;
  filters: ReportFilters;
  rows: Record<string, any>[];
  companyName?: string;
}

export default function ReportPreview({ template, filters, rows, companyName = "Zurich 2.0" }: ReportPreviewProps) {
  const visibleFields = useMemo(() => template.fields.filter(f => f.visible), [template.fields]);

  const grouped = useMemo(() => {
    if (template.groupBy) {
      return groupRows(rows, template.groupBy);
    }
    return new Map([["__all__", rows]]);
  }, [rows, template.groupBy]);

  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    if (filters.startDate && filters.endDate) {
      const s = filters.startDate.split("-");
      const e = filters.endDate.split("-");
      parts.push(`Período: ${s[2]}/${s[1]}/${s[0]} a ${e[2]}/${e[1]}/${e[0]}`);
    }
    if (filters.period) parts.push(`Turno: ${filters.period}`);
    if (filters.statuses?.length) parts.push(`Situações: ${filters.statuses.join(", ")}`);
    return parts;
  }, [filters]);

  return (
    <div className="bg-white text-black print:bg-white" id="report-preview">
      {/* Page wrapper */}
      <div className="max-w-[1100px] mx-auto p-8 print:p-4 print:max-w-full">
        {/* Header */}
        {template.showHeader && (
          <div className="mb-6 pb-4 border-b-2 border-black/10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-black">{template.name}</h1>
                <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-black">{companyName}</p>
                <p className="text-[10px] text-gray-500">
                  Gerado em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter summary */}
        {template.showFilters && filterSummary.length > 0 && (
          <div className="mb-4 text-[10px] text-gray-600 flex flex-wrap gap-x-4 gap-y-1 bg-gray-50 rounded px-3 py-2 border border-gray-100">
            {filterSummary.map((f, i) => (
              <span key={i}>{f}</span>
            ))}
          </div>
        )}

        {/* Table content */}
        {Array.from(grouped.entries()).map(([groupKey, groupRows]) => (
          <div key={groupKey} className={cn(template.pageBreakOnGroup && groupKey !== "__all__" && "break-before-page")}>
            {groupKey !== "__all__" && (
              <div className="bg-gray-100 px-3 py-1.5 font-semibold text-xs text-gray-700 rounded mt-4 mb-2 border border-gray-200">
                {template.groupBy ? template.fields.find(f => f.key === template.groupBy)?.label || template.groupBy : ""}: {groupKey}
              </div>
            )}

            <table className="w-full text-xs border-collapse mb-4">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  {visibleFields.map(f => (
                    <th
                      key={f.key}
                      className={cn(
                        "py-2 px-2 font-bold text-gray-700 uppercase tracking-wider text-[10px]",
                        f.align === "center" && "text-center",
                        f.align === "right" && "text-right",
                        !f.align && "text-left"
                      )}
                      style={{ width: f.width !== "auto" ? f.width : undefined }}
                    >
                      {f.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupRows.length > 0 ? groupRows.map((row, idx) => (
                  <tr key={row.id || idx} className={cn("border-b border-gray-100", idx % 2 === 0 ? "bg-white" : "bg-gray-50/50")}>
                    {visibleFields.map(f => (
                      <td
                        key={f.key}
                        className={cn(
                          "py-1.5 px-2 text-gray-800",
                          f.align === "center" && "text-center",
                          f.align === "right" && "text-right",
                          f.key === "scheduled_time" && "font-mono font-semibold",
                          f.key === "patient_name" && "font-medium"
                        )}
                      >
                        {f.format ? f.format(row[f.key], row) : (row[f.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={visibleFields.length} className="py-8 text-center text-gray-400">
                      Nenhum registro encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="text-[10px] text-gray-500 text-right mb-2">
              {groupKey !== "__all__" ? `Subtotal: ${groupRows.length} registro(s)` : ""}
            </div>
          </div>
        ))}

        {/* Footer */}
        {template.showFooter && (
          <div className="mt-6 pt-3 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-500">
            <span>Total: {rows.length} registro(s)</span>
            {template.showPageNumbers && <span>Página 1</span>}
          </div>
        )}
      </div>
    </div>
  );
}
