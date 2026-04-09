import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { FileText, Loader2, Printer, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDocMovements, useDocProtocols, useDocSectors } from "@/hooks/useDocProtocol";
import { PROTOCOL_STATUS_LABELS } from "@/lib/docProtocol";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const REPORT_TYPES = [
  { id: "protocolos_periodo", name: "Protocolos por período" },
  { id: "movimentacoes_setor", name: "Movimentações por setor" },
  { id: "pendentes", name: "Pendentes de recebimento" },
  { id: "paciente", name: "Rastreabilidade por paciente" },
  { id: "conta", name: "Rastreabilidade por conta" },
  { id: "documentos_tipo", name: "Documentos por tipo" },
  { id: "produtividade_usuario", name: "Produtividade por usuário" },
  { id: "analitico", name: "Relatório analítico do protocolo" },
];

function fmtDate(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return format(parsed, "dd/MM/yyyy HH:mm");
}

export default function ProtocolReports() {
  const [reportType, setReportType] = useState("protocolos_periodo");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sectorFilter, setSectorFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const { data: protocols, isLoading } = useDocProtocols({ status: statusFilter, date_from: dateFrom || undefined, date_to: dateTo || undefined });
  const { data: sectors } = useDocSectors();
  const { data: movements } = useDocMovements({ date_from: dateFrom || undefined, date_to: dateTo || undefined });
  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ["doc_protocol_report_items", dateFrom, dateTo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doc_protocol_items")
        .select(`
          *,
          patient:patients(id, full_name),
          document_type:doc_protocol_document_types(id, name, category)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const filteredProtocols = useMemo(() => {
    return (protocols || []).filter((protocol) => {
      if (sectorFilter !== "todos" && protocol.sector_origin_id !== sectorFilter && protocol.sector_destination_id !== sectorFilter) return false;
      if (!search) return true;
      const term = search.toLowerCase();
      return [
        protocol.protocol_number,
        protocol.sector_origin?.name,
        protocol.sector_destination?.name,
        protocol.emitter?.full_name,
        protocol.receiver?.full_name,
        protocol.batch_number,
        protocol.external_protocol,
      ].some((value) => (value || "").toLowerCase().includes(term));
    });
  }, [protocols, sectorFilter, search]);

  const analyticRows = useMemo(() => {
    const itemMap = new Map((items || []).map((item: any) => [item.protocol_id, [...((items || []).filter((inner: any) => inner.protocol_id === item.protocol_id))]]));
    return filteredProtocols.flatMap((protocol) => {
      const protocolItems = itemMap.get(protocol.id) || [];
      return protocolItems.map((item: any) => ({
        protocolo: protocol.protocol_number,
        paciente: String(item.snapshot?.patient_name || item.patient?.full_name || item.manual_title || "—"),
        convenio: item.insurance_name || "—",
        conta: item.account_number || item.document_reference || item.protocol_reference || "—",
        tipo_documento: item.document_type?.name || item.item_type,
        motivo: item.item_reason?.name || item.snapshot?.item_reason_name || "—",
        observacao: item.notes || "—",
        origem: protocol.sector_origin?.name || "—",
        destino: protocol.sector_destination?.name || "—",
        data_hora: fmtDate(protocol.sent_at || protocol.created_at),
        status: PROTOCOL_STATUS_LABELS[protocol.status] || protocol.status,
        emissor: protocol.emitter?.full_name || "—",
        recebedor: protocol.receiver?.full_name || "—",
      }));
    });
  }, [filteredProtocols, items]);

  const documentsByType = useMemo(() => {
    const map = new Map<string, { type: string; quantity: number; sectors: Set<string> }>();
    analyticRows.forEach((row) => {
      const current = map.get(row.tipo_documento) || { type: row.tipo_documento, quantity: 0, sectors: new Set<string>() };
      current.quantity += 1;
      current.sectors.add(`${row.origem} → ${row.destino}`);
      map.set(row.tipo_documento, current);
    });
    return Array.from(map.values()).map((entry) => ({ ...entry, sectors: Array.from(entry.sectors).join(", ") }));
  }, [analyticRows]);

  const productivityByUser = useMemo(() => {
    const map = new Map<string, { user: string; generated: number; received: number; returned: number }>();
    filteredProtocols.forEach((protocol) => {
      const emitter = protocol.emitter?.full_name || "—";
      const receiver = protocol.receiver?.full_name || "—";
      const emitterEntry = map.get(emitter) || { user: emitter, generated: 0, received: 0, returned: 0 };
      emitterEntry.generated += 1;
      map.set(emitter, emitterEntry);
      const receiverEntry = map.get(receiver) || { user: receiver, generated: 0, received: 0, returned: 0 };
      if (protocol.receiver?.full_name) receiverEntry.received += 1;
      if (protocol.status === "devolvido") receiverEntry.returned += 1;
      map.set(receiver, receiverEntry);
    });
    return Array.from(map.values()).filter((entry) => entry.user !== "—");
  }, [filteredProtocols]);

  const movementBySector = useMemo(() => {
    const map = new Map<string, { sector: string; sent: number; received: number; returned: number }>();
    (movements || []).forEach((movement) => {
      const origin = movement.sector_origin?.name || "—";
      const destination = movement.sector_destination?.name || "—";
      const originEntry = map.get(origin) || { sector: origin, sent: 0, received: 0, returned: 0 };
      if (movement.movement_type === "envio") originEntry.sent += 1;
      if (movement.movement_type === "devolucao") originEntry.returned += 1;
      map.set(origin, originEntry);
      const destinationEntry = map.get(destination) || { sector: destination, sent: 0, received: 0, returned: 0 };
      if (movement.movement_type === "recebimento") destinationEntry.received += 1;
      map.set(destination, destinationEntry);
    });
    return Array.from(map.values());
  }, [movements]);

  const pendingProtocols = filteredProtocols.filter((protocol) => ["pendente_recebimento", "enviado", "aceito_parcialmente"].includes(protocol.status));

  const exportExcel = () => {
    let rows: Record<string, unknown>[] = [];
    switch (reportType) {
      case "movimentacoes_setor":
        rows = movementBySector;
        break;
      case "pendentes":
        rows = pendingProtocols;
        break;
      case "paciente":
        rows = analyticRows.filter((row) => row.paciente.toLowerCase().includes(search.toLowerCase()));
        break;
      case "conta":
        rows = analyticRows.filter((row) => row.conta.toLowerCase().includes(search.toLowerCase()));
        break;
      case "documentos_tipo":
        rows = documentsByType;
        break;
      case "produtividade_usuario":
        rows = productivityByUser;
        break;
      case "analitico":
        rows = analyticRows;
        break;
      default:
        rows = filteredProtocols.map((protocol) => ({
          protocolo: protocol.protocol_number,
          origem: protocol.sector_origin?.name,
          destino: protocol.sector_destination?.name,
          status: PROTOCOL_STATUS_LABELS[protocol.status] || protocol.status,
          data_hora: fmtDate(protocol.sent_at || protocol.created_at),
          emissor: protocol.emitter?.full_name || "—",
        }));
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatorio");
    XLSX.writeFile(wb, `relatorio-protocolos-${reportType}.xlsx`);
  };

  const renderTable = () => {
    switch (reportType) {
      case "movimentacoes_setor":
        return (
          <Table>
            <TableHeader><TableRow><TableHead>Setor</TableHead><TableHead>Qtd. enviada</TableHead><TableHead>Qtd. recebida</TableHead><TableHead>Qtd. devolvida</TableHead></TableRow></TableHeader>
            <TableBody>
              {movementBySector.map((row) => (
                <TableRow key={row.sector}>
                  <TableCell>{row.sector}</TableCell>
                  <TableCell>{row.sent}</TableCell>
                  <TableCell>{row.received}</TableCell>
                  <TableCell>{row.returned}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      case "pendentes":
        return (
          <Table>
            <TableHeader><TableRow><TableHead>Protocolo</TableHead><TableHead>Origem</TableHead><TableHead>Destino</TableHead><TableHead>Pendências</TableHead><TableHead>Dias em aberto</TableHead></TableRow></TableHeader>
            <TableBody>
              {pendingProtocols.map((protocol) => (
                <TableRow key={protocol.id}>
                  <TableCell>{protocol.protocol_number}</TableCell>
                  <TableCell>{protocol.sector_origin?.name || "—"}</TableCell>
                  <TableCell>{protocol.sector_destination?.name || "—"}</TableCell>
                  <TableCell>{protocol.pending_items || protocol.total_items}</TableCell>
                  <TableCell>{Math.max(0, Math.floor((Date.now() - new Date(protocol.created_at).getTime()) / 86400000))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      case "documentos_tipo":
        return (
          <Table>
            <TableHeader><TableRow><TableHead>Tipo</TableHead><TableHead>Quantidade</TableHead><TableHead>Setores envolvidos</TableHead></TableRow></TableHeader>
            <TableBody>
              {documentsByType.map((row) => (
                <TableRow key={row.type}>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.quantity}</TableCell>
                  <TableCell>{row.sectors}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      case "produtividade_usuario":
        return (
          <Table>
            <TableHeader><TableRow><TableHead>Usuário</TableHead><TableHead>Gerados</TableHead><TableHead>Recebidos</TableHead><TableHead>Devolvidos</TableHead></TableRow></TableHeader>
            <TableBody>
              {productivityByUser.map((row) => (
                <TableRow key={row.user}>
                  <TableCell>{row.user}</TableCell>
                  <TableCell>{row.generated}</TableCell>
                  <TableCell>{row.received}</TableCell>
                  <TableCell>{row.returned}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      case "analitico":
      case "paciente":
      case "conta":
        return (
          <Table>
            <TableHeader><TableRow><TableHead>Protocolo</TableHead><TableHead>Paciente</TableHead><TableHead>Conta</TableHead><TableHead>Convênio</TableHead><TableHead>Tipo</TableHead><TableHead>Origem</TableHead><TableHead>Destino</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {analyticRows
                .filter((row) => reportType === "paciente" ? row.paciente.toLowerCase().includes(search.toLowerCase()) : reportType === "conta" ? row.conta.toLowerCase().includes(search.toLowerCase()) : true)
                .map((row, index) => (
                  <TableRow key={`${row.protocolo}-${index}`}>
                    <TableCell>{row.protocolo}</TableCell>
                    <TableCell>{row.paciente}</TableCell>
                    <TableCell>{row.conta}</TableCell>
                    <TableCell>{row.convenio}</TableCell>
                    <TableCell>{row.tipo_documento}</TableCell>
                    <TableCell>{row.origem}</TableCell>
                    <TableCell>{row.destino}</TableCell>
                    <TableCell>{row.status}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        );
      default:
        return (
          <Table>
            <TableHeader><TableRow><TableHead>Protocolo</TableHead><TableHead>Origem</TableHead><TableHead>Destino</TableHead><TableHead>Status</TableHead><TableHead>Data/Hora</TableHead><TableHead>Emissor</TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredProtocols.map((protocol) => (
                <TableRow key={protocol.id}>
                  <TableCell className="font-medium">{protocol.protocol_number}</TableCell>
                  <TableCell>{protocol.sector_origin?.name || "—"}</TableCell>
                  <TableCell>{protocol.sector_destination?.name || "—"}</TableCell>
                  <TableCell><Badge variant="secondary">{PROTOCOL_STATUS_LABELS[protocol.status] || protocol.status}</Badge></TableCell>
                  <TableCell>{fmtDate(protocol.sent_at || protocol.created_at)}</TableCell>
                  <TableCell>{protocol.emitter?.full_name || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Relatórios do protocolo documental</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <div>
            <Label>Relatório</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((report) => <SelectItem key={report.id} value={report.id}>{report.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Data inicial</Label>
            <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          </div>
          <div>
            <Label>Data final</Label>
            <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          </div>
          <div>
            <Label>Setor</Label>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {(sectors || []).map((sector) => <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {Object.entries(PROTOCOL_STATUS_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <Label>Busca complementar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Paciente, conta, protocolo, convênio..." />
            </div>
          </div>
          <div className="flex items-end gap-2 md:col-span-2">
            <Button className="gap-1.5" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
            <Button variant="outline" className="gap-1.5" onClick={exportExcel}>
              <FileText className="h-4 w-4" />
              Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading || itemsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            renderTable()
          )}
        </CardContent>
      </Card>
    </div>
  );
}
