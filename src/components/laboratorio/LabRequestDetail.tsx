import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLabLog } from "@/hooks/useLaboratory";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ArrowLeft, Droplets, FlaskConical, Activity, FileCheck, CheckCircle2,
  AlertTriangle, Clock, XCircle, FileText, ScrollText,
} from "lucide-react";

interface Props {
  requestId: string;
  onBack: () => void;
}

const statusColors: Record<string, string> = {
  solicitado: "bg-blue-100 text-blue-800", coletado: "bg-cyan-100 text-cyan-800",
  em_processamento: "bg-purple-100 text-purple-800", concluido: "bg-green-100 text-green-800",
  aguardando_conferencia: "bg-amber-100 text-amber-800", validado: "bg-emerald-100 text-emerald-800",
  cancelado: "bg-red-100 text-red-800", repetir: "bg-orange-100 text-orange-800",
};

export default function LabRequestDetail({ requestId, onBack }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [editingResult, setEditingResult] = useState<any>(null);
  const [resultForm, setResultForm] = useState({ value: "", technical_notes: "", is_critical: false, is_abnormal: false });

  // Request with details
  const { data: request } = useQuery({
    queryKey: ["lab-request-detail", requestId],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("lab_requests")
        .select("*, patients(full_name, cpf, birth_date, gender), profiles!lab_requests_requesting_doctor_id_fkey(full_name)")
        .eq("id", requestId).single();
      return data;
    },
  });

  // Items with exams
  const { data: items } = useQuery({
    queryKey: ["lab-request-detail-items", requestId],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("lab_request_items")
        .select("*, lab_exams(name, code, unit, sector_id, lab_sectors(name))")
        .eq("request_id", requestId)
        .order("created_at");
      return data ?? [];
    },
  });

  // Results for this request's items
  const { data: results } = useQuery({
    queryKey: ["lab-request-detail-results", requestId],
    queryFn: async () => {
      if (!items?.length) return [];
      const itemIds = items.map((i: any) => i.id);
      const { data } = await (supabase as any)
        .from("lab_results")
        .select("*")
        .in("request_item_id", itemIds);
      return data ?? [];
    },
    enabled: !!items?.length,
  });

  // Collections
  const { data: collections } = useQuery({
    queryKey: ["lab-request-detail-collections", requestId],
    queryFn: async () => {
      if (!items?.length) return [];
      const itemIds = items.map((i: any) => i.id);
      const { data } = await (supabase as any)
        .from("lab_collections")
        .select("*")
        .in("request_item_id", itemIds);
      return data ?? [];
    },
    enabled: !!items?.length,
  });

  // Logs
  const { data: logs } = useQuery({
    queryKey: ["lab-request-detail-logs", requestId],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("lab_logs")
        .select("*")
        .eq("entity_id", requestId)
        .order("created_at", { ascending: false })
        .limit(30);
      return data ?? [];
    },
  });

  const getResultForItem = (itemId: string) => results?.find((r: any) => r.request_item_id === itemId);
  const getCollectionForItem = (itemId: string) => collections?.find((c: any) => c.request_item_id === itemId);

  const handleSaveResult = async () => {
    if (!editingResult) return;
    const existing = getResultForItem(editingResult.id);
    if (existing) {
      const { error } = await (supabase as any).from("lab_results").update({
        value: resultForm.value, numeric_value: parseFloat(resultForm.value) || null,
        technical_notes: resultForm.technical_notes || null,
        is_critical: resultForm.is_critical, is_abnormal: resultForm.is_abnormal,
        status: "aguardando_conferencia", performed_by: user?.id, performed_at: new Date().toISOString(),
      }).eq("id", existing.id);
      if (error) { toast.error(error.message); return; }
      await createLabLog("lab_results", existing.id, "resultado_digitado", user?.id);
    } else {
      const { error } = await (supabase as any).from("lab_results").insert({
        request_item_id: editingResult.id,
        value: resultForm.value, numeric_value: parseFloat(resultForm.value) || null,
        technical_notes: resultForm.technical_notes || null,
        is_critical: resultForm.is_critical, is_abnormal: resultForm.is_abnormal,
        status: "aguardando_conferencia", result_source: "manual",
        performed_by: user?.id, performed_at: new Date().toISOString(),
      });
      if (error) { toast.error(error.message); return; }
    }
    // Update item status
    await (supabase as any).from("lab_request_items").update({ status: "concluido" }).eq("id", editingResult.id);
    qc.invalidateQueries({ queryKey: ["lab-request-detail-results", requestId] });
    qc.invalidateQueries({ queryKey: ["lab-request-detail-items", requestId] });
    toast.success("Resultado salvo");
    setEditingResult(null);
  };

  const handleValidateResult = async (itemId: string) => {
    const result = getResultForItem(itemId);
    if (!result) return;
    await (supabase as any).from("lab_results").update({
      status: "validado", validated_by: user?.id, validated_at: new Date().toISOString(),
    }).eq("id", result.id);
    await createLabLog("lab_results", result.id, "resultado_validado", user?.id);
    qc.invalidateQueries({ queryKey: ["lab-request-detail-results", requestId] });
    toast.success("Resultado validado/conferido");
  };

  const openEditResult = (item: any) => {
    const existing = getResultForItem(item.id);
    setEditingResult(item);
    setResultForm({
      value: existing?.value || "", technical_notes: existing?.technical_notes || "",
      is_critical: existing?.is_critical || false, is_abnormal: existing?.is_abnormal || false,
    });
  };

  if (!request) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h2 className="text-lg font-semibold">Requisição {request.request_number}</h2>
          <p className="text-sm text-muted-foreground">{request.patients?.full_name} — {format(new Date(request.created_at), "dd/MM/yyyy HH:mm")}</p>
        </div>
        <Badge className={`ml-auto ${statusColors[request.status] || "bg-gray-100"}`}>{request.status}</Badge>
        {request.priority !== "rotina" && <Badge variant="destructive">{request.priority}</Badge>}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/50"><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Paciente</p>
          <p className="text-sm font-medium">{request.patients?.full_name}</p>
          <p className="text-xs text-muted-foreground">{request.patients?.cpf || "—"}</p>
        </CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Médico Solicitante</p>
          <p className="text-sm font-medium">{request.profiles?.full_name || "—"}</p>
        </CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Convênio</p>
          <p className="text-sm font-medium">{request.insurance_name || "Não informado"}</p>
        </CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Informação Clínica</p>
          <p className="text-sm">{request.clinical_notes || "—"}</p>
        </CardContent></Card>
      </div>

      {/* Items table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Exames da Requisição ({items?.length || 0})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-2 pl-4">Exame</th>
                  <th className="text-left p-2">Código</th>
                  <th className="text-left p-2">Setor</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Coleta</th>
                  <th className="text-left p-2">Resultado</th>
                  <th className="text-left p-2">Conferência</th>
                  <th className="text-left p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {(items ?? []).map((item: any) => {
                  const result = getResultForItem(item.id);
                  const collection = getCollectionForItem(item.id);
                  return (
                    <tr key={item.id} className="border-b hover:bg-muted/20">
                      <td className="p-2 pl-4 font-medium">{item.lab_exams?.name}</td>
                      <td className="p-2 font-mono text-xs">{item.lab_exams?.code}</td>
                      <td className="p-2 text-xs">{item.lab_exams?.lab_sectors?.name || "—"}</td>
                      <td className="p-2">
                        <Badge className={`text-xs ${statusColors[item.status] || "bg-gray-100"}`}>{item.status}</Badge>
                      </td>
                      <td className="p-2 text-xs">
                        {collection ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <Droplets className="h-3 w-3" />
                            {format(new Date(collection.collected_at), "dd/MM HH:mm")}
                          </span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="p-2 text-xs">
                        {result ? (
                          <span className={`flex items-center gap-1 ${result.is_critical ? "text-red-600 font-bold" : result.is_abnormal ? "text-amber-600 font-medium" : "text-foreground"}`}>
                            {result.is_critical && <AlertTriangle className="h-3 w-3" />}
                            {result.value?.substring(0, 30)}{result.value?.length > 30 ? "..." : ""}
                            {result.unit && <span className="text-muted-foreground ml-1">{result.unit}</span>}
                          </span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="p-2 text-xs">
                        {result?.status === "validado" ? (
                          <Badge className="bg-emerald-100 text-emerald-800 text-xs">Validado</Badge>
                        ) : result?.status === "aguardando_conferencia" ? (
                          <Badge className="bg-amber-100 text-amber-800 text-xs">Aguardando</Badge>
                        ) : "—"}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          {(item.status === "em_processamento" || item.status === "coletado" || item.status === "concluido") && (
                            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => openEditResult(item)}>
                              <FileCheck className="h-3 w-3 mr-1" />Resultado
                            </Button>
                          )}
                          {result?.status === "aguardando_conferencia" && (
                            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-green-600" onClick={() => handleValidateResult(item.id)}>
                              <CheckCircle2 className="h-3 w-3 mr-1" />Conferir
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Audit log */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ScrollText className="h-4 w-4" />Auditoria</CardTitle></CardHeader>
        <CardContent>
          {!logs?.length ? (
            <p className="text-sm text-muted-foreground">Nenhum log registrado</p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {logs.map((log: any) => (
                <div key={log.id} className="flex items-center gap-2 text-xs border-b border-border/30 py-1.5">
                  <span className="font-mono text-muted-foreground w-32 shrink-0">
                    {format(new Date(log.created_at), "dd/MM HH:mm:ss")}
                  </span>
                  <Badge variant="outline" className="text-xs shrink-0">{log.action}</Badge>
                  <span className="text-muted-foreground truncate">{log.entity_type} — {log.performed_by?.substring(0, 8) || "sistema"}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result edit dialog */}
      <Dialog open={!!editingResult} onOpenChange={() => setEditingResult(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Lançar Resultado — {editingResult?.lab_exams?.name}</DialogTitle>
            <DialogDescription>Digite o valor do resultado e marque as flags</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Valor / Resultado *</Label>
              <Textarea value={resultForm.value} onChange={e => setResultForm(f => ({ ...f, value: e.target.value }))} rows={3} placeholder="Ex: 25000 ou texto descritivo" />
            </div>
            <div>
              <Label>Observação Técnica</Label>
              <Input value={resultForm.technical_notes} onChange={e => setResultForm(f => ({ ...f, technical_notes: e.target.value }))} />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={resultForm.is_abnormal} onCheckedChange={v => setResultForm(f => ({ ...f, is_abnormal: v }))} />
                <Label className="text-sm">Alterado</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={resultForm.is_critical} onCheckedChange={v => setResultForm(f => ({ ...f, is_critical: v }))} />
                <Label className="text-sm text-destructive">Crítico</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingResult(null)}>Cancelar</Button>
            <Button onClick={handleSaveResult} disabled={!resultForm.value.trim()}>Salvar Resultado</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
