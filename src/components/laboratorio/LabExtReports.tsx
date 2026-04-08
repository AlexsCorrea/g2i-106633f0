import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLabLog } from "@/hooks/useLaboratory";
import { FileText, Search, CheckCircle2, Eye, Download, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function LabExtReports() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<any>(null);

  const { data: results, isLoading } = useQuery({
    queryKey: ["lab-ext-reports"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("lab_external_results")
        .select("*, lab_external_orders(order_number, lab_integration_partners(name)), patients(full_name, cpf)")
        .or("attachment_url.neq.null,status.eq.liberado,status.eq.conferido")
        .order("received_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const filtered = results?.filter((r: any) => {
    const q = search.toLowerCase();
    return !q ||
      r.external_protocol?.toLowerCase().includes(q) ||
      r.exam_name?.toLowerCase().includes(q) ||
      r.patients?.full_name?.toLowerCase().includes(q) ||
      r.lab_external_orders?.order_number?.toLowerCase().includes(q);
  }) ?? [];

  const handleRelease = async (r: any) => {
    const { error } = await (supabase as any).from("lab_external_results").update({
      status: "liberado",
      released_at: new Date().toISOString(),
      released_by: user?.id,
    }).eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    await createLabLog("lab_external_results", r.id, "laudo_externo_liberado", user?.id);
    qc.invalidateQueries({ queryKey: ["lab-ext-reports"] });
    toast.success("Laudo externo liberado");
  };

  const statusColors: Record<string, string> = {
    recebido: "bg-blue-100 text-blue-800",
    conferido: "bg-amber-100 text-amber-800",
    liberado: "bg-green-100 text-green-800",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="h-5 w-5" />
          <span className="text-sm">Laudos e documentos retornados por parceiros externos</span>
        </div>
        <Badge variant="secondary">{results?.length ?? 0} documento(s)</Badge>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por protocolo, exame, paciente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Parceiro</TableHead>
                <TableHead>Exame</TableHead>
                <TableHead>Protocolo Ext.</TableHead>
                <TableHead>Recebido</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Anexo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhum laudo externo encontrado</TableCell></TableRow>
              ) : filtered.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-sm">{r.lab_external_orders?.order_number ?? "—"}</TableCell>
                  <TableCell className="text-sm">{r.lab_external_orders?.lab_integration_partners?.name ?? "—"}</TableCell>
                  <TableCell className="font-medium">{r.exam_name ?? "—"}</TableCell>
                  <TableCell className="font-mono text-sm">{r.external_protocol ?? "—"}</TableCell>
                  <TableCell className="text-sm">{r.received_at ? format(new Date(r.received_at), "dd/MM/yy HH:mm") : "—"}</TableCell>
                  <TableCell>{r.patients?.full_name ?? "—"}</TableCell>
                  <TableCell>
                    {r.attachment_url ? (
                      <a href={r.attachment_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-xs">
                        <Download className="h-3.5 w-3.5" />PDF
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${statusColors[r.status] || "bg-muted"}`}>{r.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setDetail(r)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {r.status !== "liberado" && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-green-600 gap-1" onClick={() => handleRelease(r)}>
                          <CheckCircle2 className="h-3.5 w-3.5" />Liberar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Laudo Externo — {detail?.exam_name}</DialogTitle>
            <DialogDescription>Detalhes do documento retornado pelo parceiro</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Pedido:</span> <span className="font-mono">{detail.lab_external_orders?.order_number ?? "—"}</span></div>
                <div><span className="text-muted-foreground">Parceiro:</span> {detail.lab_external_orders?.lab_integration_partners?.name ?? "—"}</div>
                <div><span className="text-muted-foreground">Paciente:</span> <span className="font-medium">{detail.patients?.full_name ?? "—"}</span></div>
                <div><span className="text-muted-foreground">Protocolo:</span> <span className="font-mono">{detail.external_protocol ?? "—"}</span></div>
                <div><span className="text-muted-foreground">Recebido:</span> {detail.received_at ? format(new Date(detail.received_at), "dd/MM/yyyy HH:mm") : "—"}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge className={`text-xs ${statusColors[detail.status] || ""}`}>{detail.status}</Badge></div>
              </div>
              {detail.result_data && (
                <div>
                  <span className="text-muted-foreground text-xs">Resultado:</span>
                  <pre className="mt-1 p-2 bg-muted/30 rounded text-xs overflow-auto max-h-40">{typeof detail.result_data === "object" ? JSON.stringify(detail.result_data, null, 2) : detail.result_data}</pre>
                </div>
              )}
              {detail.attachment_url && (
                <a href={detail.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="h-4 w-4" />Abrir documento/PDF
                </a>
              )}
              {detail.released_at && (
                <div className="text-xs text-muted-foreground">Liberado em: {format(new Date(detail.released_at), "dd/MM/yyyy HH:mm")}</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
