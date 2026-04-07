import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLabReports, createLabLog } from "@/hooks/useLaboratory";
import { FileText, Printer, CheckCircle2, Eye } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const statusColors: Record<string, string> = {
  rascunho: "bg-gray-100 text-gray-800",
  emitido: "bg-blue-100 text-blue-800",
  liberado: "bg-green-100 text-green-800",
  retificado: "bg-amber-100 text-amber-800",
  cancelado: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  rascunho: "Rascunho", emitido: "Emitido", liberado: "Liberado",
  retificado: "Retificado", cancelado: "Cancelado",
};

export default function LabReports() {
  const { list } = useLabReports();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showDetail, setShowDetail] = useState<any>(null);

  const handleEmit = async (r: any) => {
    const { error } = await supabase.from("lab_reports").update({
      status: "emitido", issued_at: new Date().toISOString(),
    }).eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    await createLabLog("lab_reports", r.id, "laudo_emitido", user?.id);
    qc.invalidateQueries({ queryKey: ["lab-reports"] });
    toast.success("Laudo emitido");
  };

  const handleRelease = async (r: any) => {
    const { error } = await supabase.from("lab_reports").update({
      status: "liberado", released_at: new Date().toISOString(), released_by: user?.id,
    }).eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    await createLabLog("lab_reports", r.id, "laudo_liberado", user?.id);
    qc.invalidateQueries({ queryKey: ["lab-reports"] });
    toast.success("Laudo liberado");
  };

  const handlePrint = (r: any) => {
    toast.info(`Impressão do laudo ${r.report_number} (simulação)`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="h-5 w-5" />
          <span className="text-sm">Emissão e gestão de laudos laboratoriais</span>
        </div>
        <Badge variant="secondary">{list.data?.length ?? 0} laudo(s)</Badge>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Laudo</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead>Liberação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !list.data?.length ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum laudo encontrado</TableCell></TableRow>
              ) : list.data.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-sm">{r.report_number}</TableCell>
                  <TableCell>v{r.version}</TableCell>
                  <TableCell><Badge className={`text-xs ${statusColors[r.status] || ""}`}>{statusLabels[r.status] || r.status}</Badge></TableCell>
                  <TableCell className="text-sm">{r.issued_at ? format(new Date(r.issued_at), "dd/MM/yy HH:mm") : "—"}</TableCell>
                  <TableCell className="text-sm">{r.released_at ? format(new Date(r.released_at), "dd/MM/yy HH:mm") : "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setShowDetail(r)}><Eye className="h-3.5 w-3.5" /></Button>
                      {r.status === "rascunho" && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-primary" onClick={() => handleEmit(r)}>Emitir</Button>
                      )}
                      {r.status === "emitido" && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-green-600 gap-1" onClick={() => handleRelease(r)}>
                          <CheckCircle2 className="h-3.5 w-3.5" />Liberar
                        </Button>
                      )}
                      {r.status === "liberado" && (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handlePrint(r)}><Printer className="h-3.5 w-3.5" /></Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Laudo {showDetail?.report_number}</DialogTitle>
            <DialogDescription>Detalhes do laudo laboratorial</DialogDescription>
          </DialogHeader>
          {showDetail && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Nº Laudo:</span> <span className="font-mono">{showDetail.report_number}</span></div>
              <div><span className="text-muted-foreground">Versão:</span> v{showDetail.version}</div>
              <div><span className="text-muted-foreground">Status:</span> <Badge className={`text-xs ${statusColors[showDetail.status] || ""}`}>{statusLabels[showDetail.status]}</Badge></div>
              <div><span className="text-muted-foreground">Emissão:</span> {showDetail.issued_at ? format(new Date(showDetail.issued_at), "dd/MM/yy HH:mm") : "—"}</div>
              <div><span className="text-muted-foreground">Liberação:</span> {showDetail.released_at ? format(new Date(showDetail.released_at), "dd/MM/yy HH:mm") : "—"}</div>
              <div><span className="text-muted-foreground">Criado em:</span> {format(new Date(showDetail.created_at), "dd/MM/yy HH:mm")}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
