import * as XLSX from "xlsx";
import QRCode from "qrcode";
import { format } from "date-fns";
import type { DocProtocolItem, DocProtocolSummary } from "@/hooks/useDocProtocol";
import { ITEM_TYPE_LABELS, PRIORITY_LABELS, PROTOCOL_STATUS_LABELS } from "@/lib/docProtocol";

function fmtDate(value?: string | null, pattern = "dd/MM/yyyy HH:mm") {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, pattern);
}

export async function printProtocolMirror(protocol: DocProtocolSummary, items: DocProtocolItem[]) {
  const qrCode = await QRCode.toDataURL(protocol.protocol_number, { margin: 1, width: 90 });
  const win = window.open("", "_blank");
  if (!win) return;

  const rows = items.map((item) => `
    <tr>
      <td>${item.account_number || item.document_reference || "—"}</td>
      <td>${String((item.snapshot as any)?.patient_name || item.patient?.full_name || item.manual_title || "—")}</td>
      <td>${item.insurance_name || "—"}</td>
      <td>${fmtDate(item.attendance_date || item.item_date, "dd/MM/yyyy")}</td>
      <td>${item.document_type?.name || ITEM_TYPE_LABELS[item.item_type] || item.item_type}</td>
      <td>${(item.snapshot as any)?.item_reason_name || item.item_reason?.name || "—"}</td>
      <td>${item.notes || "—"}</td>
    </tr>
  `).join("");

  win.document.write(`
    <html>
      <head>
        <title>Espelho ${protocol.protocol_number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 28px; color: #111827; }
          .header, .meta, .signatures { display: flex; justify-content: space-between; gap: 24px; }
          .header { align-items: flex-start; border-bottom: 2px solid #111827; padding-bottom: 16px; margin-bottom: 16px; }
          .title { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
          .subtitle { font-size: 12px; color: #4b5563; }
          .meta { margin-bottom: 16px; font-size: 12px; }
          .meta-block { flex: 1; display: grid; grid-template-columns: 120px 1fr; row-gap: 6px; column-gap: 8px; }
          .meta-block b { color: #374151; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 11px; vertical-align: top; }
          th { background: #f3f4f6; }
          .footer { margin-top: 24px; border-top: 1px solid #d1d5db; padding-top: 16px; font-size: 11px; color: #4b5563; }
          .signatures { margin-top: 40px; }
          .signature { width: 240px; border-top: 1px solid #111827; text-align: center; padding-top: 6px; font-size: 11px; }
          .badge { display: inline-block; border: 1px solid #d1d5db; border-radius: 999px; padding: 2px 8px; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">Zurich 2.0</div>
            <div class="subtitle">Espelho do Protocolo de Envio de Documentos</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:18px;font-weight:700">${protocol.protocol_number}</div>
            <div class="subtitle">Emitido em ${fmtDate(new Date().toISOString())}</div>
            <div class="badge">${PROTOCOL_STATUS_LABELS[protocol.status] || protocol.status}</div>
          </div>
        </div>

        <div class="meta">
          <div class="meta-block">
            <b>Origem</b><span>${protocol.sector_origin?.name || "—"}</span>
            <b>Destino</b><span>${protocol.sector_destination?.name || "—"}</span>
            <b>Tipo</b><span>${protocol.protocol_type}</span>
            <b>Prioridade</b><span>${PRIORITY_LABELS[protocol.priority] || protocol.priority}</span>
            <b>Emissor</b><span>${protocol.emitter?.full_name || "—"}</span>
            <b>Recebedor</b><span>${protocol.receiver?.full_name || "—"}</span>
          </div>
          <div class="meta-block">
            <b>Data/Hora</b><span>${fmtDate(protocol.sent_at || protocol.created_at)}</span>
            <b>Protocolo Externo</b><span>${protocol.external_protocol || "—"}</span>
            <b>Lote / Remessa</b><span>${protocol.batch_number || "—"}</span>
            <b>Motivo</b><span>${protocol.reason?.name || "—"}</span>
            <b>Aceite</b><span>${protocol.acceptance_type || "—"}</span>
            <b>Observação</b><span>${protocol.notes || "—"}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Documento / Conta</th>
              <th>Paciente</th>
              <th>Convênio</th>
              <th>Data</th>
              <th>Tipo</th>
              <th>Motivo</th>
              <th>Observação</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `<tr><td colspan="7" style="text-align:center">Nenhum item</td></tr>`}
          </tbody>
        </table>

        <div class="footer">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div>QR Code do protocolo</div>
              <div>Aceite digital: usuário, data/hora e sessão registrados no histórico do protocolo.</div>
            </div>
            <img src="${qrCode}" alt="QR Code" width="90" height="90" />
          </div>
          <div class="signatures">
            <div class="signature">Emissor</div>
            <div class="signature">Recebedor</div>
          </div>
        </div>
      </body>
    </html>
  `);
  win.document.close();
  win.print();
}

export function exportProtocolItemsToExcel(protocol: DocProtocolSummary, items: DocProtocolItem[]) {
  const rows = items.map((item) => ({
    Protocolo: protocol.protocol_number,
    Status: PROTOCOL_STATUS_LABELS[protocol.status] || protocol.status,
    Origem: protocol.sector_origin?.name || "",
    Destino: protocol.sector_destination?.name || "",
    TipoMovimento: protocol.protocol_type,
    Prioridade: PRIORITY_LABELS[protocol.priority] || protocol.priority,
    Paciente: String((item.snapshot as any)?.patient_name || item.patient?.full_name || item.manual_title || ""),
    Atendimento: item.attendance_id || "",
    Conta: item.account_number || "",
    Documento: item.document_reference || item.protocol_reference || "",
    Convenio: item.insurance_name || "",
    Competencia: item.competence || "",
    TipoItem: ITEM_TYPE_LABELS[item.item_type] || item.item_type,
    TipoDocumento: item.document_type?.name || "",
    Motivo: (item.snapshot as any)?.item_reason_name || item.item_reason?.name || "",
    Observacao: item.notes || "",
    StatusItem: item.item_status,
    SetorAtual: item.sector_current?.name || "",
    DataItem: fmtDate(item.item_date || item.attendance_date, "dd/MM/yyyy"),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Protocolo");
  XLSX.writeFile(workbook, `${protocol.protocol_number}.xlsx`);
}
