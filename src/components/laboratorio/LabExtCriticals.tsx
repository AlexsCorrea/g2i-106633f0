import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLabExternalResultsWithDetails, useLabPartners, createIntegrationLog } from "@/hooks/useLabIntegration";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Siren, Search, Phone, MessageSquare, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function LabExtCriticals() {
  const { data: results } = useLabExternalResultsWithDetails();
  const { list: partners } = useLabPartners();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [partnerFilter, setPartnerFilter] = useState("all");
  const [showComm, setShowComm] = useState<any>(null);
  const [commForm, setCommForm] = useState({ communicated_to: "", channel: "telefone", notes: "" });

  const comms = useQuery({
    queryKey: ["lab-ext-critical-comms"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("lab_external_critical_comms").select("*").order("communicated_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const createComm = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await (supabase as any).from("lab_external_critical_comms").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lab-ext-critical-comms"] }),
  });

  const criticals = results?.filter((r: any) => r.is_critical) ?? [];
  const filtered = criticals.filter((r: any) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.exam_name?.toLowerCase().includes(q) || r.lab_external_orders?.order_number?.toLowerCase().includes(q) || r.patients?.full_name?.toLowerCase().includes(q);
    const matchPartner = partnerFilter === "all" || r.partner_id === partnerFilter;
    return matchSearch && matchPartner;
  });

  const getCommCount = (resultId: string) => comms.data?.filter((c: any) => c.result_id === resultId).length ?? 0;

  const handleRegisterComm = () => {
    if (!commForm.communicated_to.trim()) { toast.error("Informe para quem foi comunicado"); return; }
    createComm.mutate({
      result_id: showComm.id, communicated_to: commForm.communicated_to,
      channel: commForm.channel, notes: commForm.notes || null, communicated_by: user?.id,
    }, {
      onSuccess: () => {
        createIntegrationLog({
          log_level: "info", log_type: "funcional", action: "critico_comunicado",
          message: `Crítico ${showComm.exam_name} comunicado a ${commForm.communicated_to} via ${commForm.channel}`,
          partner_id: showComm.partner_id, performed_by: user?.id,
        });
        setShowComm(null); setCommForm({ communicated_to: "", channel: "telefone", notes: "" });
        toast.success("Comunicação registrada");
      },
    });
  };

  const pendingComm = filtered.filter((r: any) => getCommCount(r.id) === 0).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground"><Siren className="h-5 w-5" /><span className="text-sm">Resultados críticos externos</span></div>
        <div className="flex gap-2">
          {pendingComm > 0 && <Badge variant="destructive">{pendingComm} sem comunicação</Badge>}
          <Badge variant="secondary">{filtered.length} crítico(s)</Badge>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar exame, pedido, paciente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={partnerFilter} onValueChange={setPartnerFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Parceiro" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {partners.data?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Parceiro</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Exame</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead>Conferência</TableHead>
                <TableHead>Comunicação</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!filtered.length ? (
                <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Nenhum resultado crítico externo</TableCell></TableRow>
              ) : filtered.map((r: any) => {
                const commCount = getCommCount(r.id);
                return (
                  <TableRow key={r.id} className="bg-red-50/30">
                    <TableCell className="font-mono text-sm">{r.lab_external_orders?.order_number ?? "—"}</TableCell>
                    <TableCell className="text-sm">{r.lab_partners?.name ?? "—"}</TableCell>
                    <TableCell className="text-sm">{r.patients?.full_name ?? "—"}</TableCell>
                    <TableCell className="font-medium">{r.exam_name}</TableCell>
                    <TableCell className="font-mono text-destructive font-bold">{r.value}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.reference_text ?? "—"}</TableCell>
                    <TableCell><Badge className={`text-xs ${r.conference_status === "liberado" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{r.conference_status}</Badge></TableCell>
                    <TableCell>
                      {commCount > 0 ? (
                        <Badge className="text-xs bg-green-100 text-green-800 gap-1"><CheckCircle2 className="h-3 w-3" />{commCount}x</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.created_at ? format(new Date(r.created_at), "dd/MM HH:mm") : "—"}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => setShowComm(r)}>
                        <Phone className="h-3 w-3" />Comunicar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!showComm} onOpenChange={() => setShowComm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Comunicação de Crítico</DialogTitle>
            <DialogDescription>{showComm?.exam_name}: {showComm?.value} {showComm?.unit ?? ""}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Comunicado para *</Label><Input value={commForm.communicated_to} onChange={e => setCommForm(f => ({ ...f, communicated_to: e.target.value }))} placeholder="Dr. João Silva" /></div>
            <div>
              <Label>Canal</Label>
              <Select value={commForm.channel} onValueChange={v => setCommForm(f => ({ ...f, channel: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="telefone">Telefone</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="sistema">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Observações</Label><Textarea value={commForm.notes} onChange={e => setCommForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            {comms.data?.filter((c: any) => c.result_id === showComm?.id).length > 0 && (
              <div className="border-t pt-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">Comunicações anteriores</p>
                {comms.data?.filter((c: any) => c.result_id === showComm?.id).map((c: any) => (
                  <div key={c.id} className="text-xs border-b py-1">
                    <span className="font-medium">{c.communicated_to}</span> via {c.channel} — {format(new Date(c.communicated_at), "dd/MM HH:mm")}
                    {c.notes && <span className="text-muted-foreground"> — {c.notes}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComm(null)}>Cancelar</Button>
            <Button onClick={handleRegisterComm} disabled={createComm.isPending}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
