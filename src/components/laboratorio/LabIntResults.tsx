import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLabExternalResultsWithDetails, useLabExternalResults, useLabPartners } from "@/hooks/useLabIntegration";
import { CheckCircle2, XCircle, FileDown, Search, Eye, FileText, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function LabIntResults() {
  const { data: results, isLoading } = useLabExternalResultsWithDetails();
  const { update } = useLabExternalResults();
  const { list: partners } = useLabPartners();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [confFilter, setConfFilter] = useState("all");
  const [partnerFilter, setPartnerFilter] = useState("all");
  const [showDetail, setShowDetail] = useState<any>(null);

  const handleConference = (id: string, action: "conferido" | "rejeitado") => {
    update.mutate({ id, conference_status: action, conferenced_by: user?.id, conferenced_at: new Date().toISOString() } as any, {
      onSuccess: () => toast.success(action === "conferido" ? "Resultado conferido" : "Resultado rejeitado"),
    });
  };
  const handleRelease = (id: string) => {
    update.mutate({ id, conference_status: "liberado", released_by: user?.id, released_at: new Date().toISOString() } as any, {
      onSuccess: () => toast.success("Resultado liberado"),
    });
  };

  const filtered = results?.filter((r: any) => {
    const s = search.toLowerCase();
    const matchSearch = !s || r.exam_name?.toLowerCase().includes(s) || r.external_protocol?.toLowerCase().includes(s) || r.exam_code?.toLowerCase().includes(s);
    const matchConf = confFilter === "all" || r.conference_status === confFilter;
    const matchPartner = partnerFilter === "all" || r.partner_id === partnerFilter;
    return matchSearch && matchConf && matchPartner;
  }) ?? [];

  // Group by protocol
  const grouped = filtered.reduce((acc: Record<string, any[]>, r: any) => {
    const key = r.external_protocol || "sem-protocolo";
    (acc[key] = acc[key] || []).push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <FileDown className="h-5 w-5" />
        <span className="text-sm">Resultados recebidos de laboratórios de apoio — conferência e liberação</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar exame ou protocolo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={confFilter} onValueChange={setConfFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Conferência" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="conferido">Conferido</SelectItem>
            <SelectItem value="rejeitado">Rejeitado</SelectItem>
            <SelectItem value="liberado">Liberado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={partnerFilter} onValueChange={setPartnerFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Parceiro" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {partners.data?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : !filtered.length ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum resultado externo</CardContent></Card>
      ) : Object.entries(grouped).map(([protocol, items]) => (
        <Card key={protocol}>
          <CardContent className="p-0">
            <div className="px-4 py-2 bg-muted/30 border-b flex items-center justify-between">
              <span className="text-sm font-medium">Protocolo: <span className="font-mono">{protocol}</span></span>
              <Badge variant="outline" className="text-xs">{(items as any[])[0]?.lab_partners?.name ?? "—"}</Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exame</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Referência</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Anexo</TableHead>
                  <TableHead>Conferência</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(items as any[]).map((r: any) => (
                  <TableRow key={r.id} className={r.is_critical ? "bg-red-50/40" : r.is_abnormal ? "bg-amber-50/30" : ""}>
                    <TableCell className="font-medium">{r.exam_name} <span className="text-xs text-muted-foreground">({r.exam_code})</span></TableCell>
                    <TableCell className={`font-mono ${r.is_critical ? "text-destructive font-bold" : ""}`}>{r.value}</TableCell>
                    <TableCell>{r.unit ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.reference_text ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {r.is_critical && <Badge variant="destructive" className="text-xs">Crítico</Badge>}
                        {r.is_abnormal && !r.is_critical && <Badge className="text-xs bg-amber-100 text-amber-800">Alterado</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {r.attachment_url ? (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => window.open(r.attachment_url, "_blank")}>
                          <FileText className="h-3.5 w-3.5 text-primary" />
                        </Button>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        r.conference_status === "pendente" ? "secondary" :
                        r.conference_status === "liberado" ? "default" :
                        r.conference_status === "rejeitado" ? "destructive" : "outline"
                      } className="text-xs">{r.conference_status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setShowDetail(r)}><Eye className="h-3.5 w-3.5" /></Button>
                        {r.conference_status === "pendente" && (
                          <>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600" onClick={() => handleConference(r.id, "conferido")}><CheckCircle2 className="h-4 w-4" /></Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600" onClick={() => handleConference(r.id, "rejeitado")}><XCircle className="h-4 w-4" /></Button>
                          </>
                        )}
                        {r.conference_status === "conferido" && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-primary" onClick={() => handleRelease(r.id)}>Liberar</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Detalhe do Resultado</DialogTitle></DialogHeader>
          {showDetail && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Parceiro:</span> {showDetail.lab_partners?.name}</div>
              <div><span className="text-muted-foreground">Protocolo:</span> <span className="font-mono">{showDetail.external_protocol}</span></div>
              <div><span className="text-muted-foreground">Exame:</span> {showDetail.exam_name}</div>
              <div><span className="text-muted-foreground">Código:</span> <span className="font-mono">{showDetail.exam_code}</span></div>
              <div><span className="text-muted-foreground">Valor:</span> <span className={`font-mono ${showDetail.is_critical ? "text-destructive font-bold" : ""}`}>{showDetail.value}</span></div>
              <div><span className="text-muted-foreground">Unidade:</span> {showDetail.unit ?? "—"}</div>
              <div className="col-span-2"><span className="text-muted-foreground">Referência:</span> {showDetail.reference_text ?? "—"}</div>
              {showDetail.observation && <div className="col-span-2"><span className="text-muted-foreground">Observação:</span> {showDetail.observation}</div>}
              <div><span className="text-muted-foreground">Crítico:</span> {showDetail.is_critical ? "Sim" : "Não"}</div>
              <div><span className="text-muted-foreground">Alterado:</span> {showDetail.is_abnormal ? "Sim" : "Não"}</div>
              <div><span className="text-muted-foreground">Conferência:</span> <Badge className="text-xs">{showDetail.conference_status}</Badge></div>
              {showDetail.attachment_url && (
                <div className="col-span-2">
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => window.open(showDetail.attachment_url, "_blank")}>
                    <ExternalLink className="h-3.5 w-3.5" />Abrir Anexo
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
