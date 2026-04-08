import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLabLog } from "@/hooks/useLaboratory";
import { Activity, Search, Play, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  solicitado: "bg-blue-100 text-blue-800",
  coletado: "bg-cyan-100 text-cyan-800",
  em_processamento: "bg-purple-100 text-purple-800",
  concluido: "bg-green-100 text-green-800",
  repetir: "bg-orange-100 text-orange-800",
};

const statusLabels: Record<string, string> = {
  solicitado: "Solicitado", coletado: "Coletado", em_processamento: "Processando",
  concluido: "Concluído", repetir: "Repetir",
};

function useProcessingItems() {
  return useQuery({
    queryKey: ["lab-processing-items"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("lab_request_items")
        .select("*, lab_exams(name, code, sector_id), lab_requests(request_number, patients(full_name), priority)")
        .in("status", ["coletado", "em_processamento", "repetir"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

export default function LabProcessing() {
  const { data: items, isLoading } = useProcessingItems();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleStartProcessing = async (item: any) => {
    const { error } = await (supabase as any).from("lab_request_items").update({ status: "em_processamento" }).eq("id", item.id);
    if (error) { toast.error(error.message); return; }
    await createLabLog("lab_request_items", item.id, "inicio_processamento", user?.id);
    qc.invalidateQueries({ queryKey: ["lab-processing-items"] });
    toast.success("Processamento iniciado");
  };

  const handleComplete = async (item: any) => {
    const { error } = await (supabase as any).from("lab_request_items").update({ status: "concluido" }).eq("id", item.id);
    if (error) { toast.error(error.message); return; }
    // Auto-create result record for this item
    const { data: existingResult } = await (supabase as any)
      .from("lab_results").select("id").eq("request_item_id", item.id).limit(1);
    if (!existingResult?.length) {
      // Find sample linked to this item
      const { data: sampleData } = await (supabase as any)
        .from("lab_samples").select("id").eq("request_item_id", item.id).limit(1);
      await (supabase as any).from("lab_results").insert({
        request_item_id: item.id,
        sample_id: sampleData?.[0]?.id || null,
        status: "em_processamento",
        result_source: "manual",
        performed_by: user?.id,
      });
    }
    await createLabLog("lab_request_items", item.id, "processamento_concluido", user?.id);
    qc.invalidateQueries({ queryKey: ["lab-processing-items"] });
    qc.invalidateQueries({ queryKey: ["lab-request-items"] });
    qc.invalidateQueries({ queryKey: ["lab-results-details"] });
    toast.success("Processamento concluído — resultado criado para digitação");
  };

  const filtered = items?.filter((i: any) => {
    const s = search.toLowerCase();
    const matchSearch = !s || i.lab_exams?.name?.toLowerCase().includes(s) || i.lab_requests?.patients?.full_name?.toLowerCase().includes(s) || i.lab_requests?.request_number?.toLowerCase().includes(s);
    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    return matchSearch && matchStatus;
  }) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Activity className="h-5 w-5" />
          <span className="text-sm">Fila de processamento por setor técnico</span>
        </div>
        <Badge variant="secondary">{filtered.length} item(ns)</Badge>
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar exame, paciente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="coletado">Coletado</SelectItem>
            <SelectItem value="em_processamento">Processando</SelectItem>
            <SelectItem value="repetir">Repetir</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Solicitação</TableHead>
                <TableHead>Exame</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum item em processamento</TableCell></TableRow>
              ) : filtered.map((i: any) => (
                <TableRow key={i.id} className={i.lab_requests?.priority === "emergencia" ? "bg-red-50/30" : i.status === "repetir" ? "bg-orange-50/30" : ""}>
                  <TableCell className="font-mono text-sm">{i.lab_requests?.request_number ?? "—"}</TableCell>
                  <TableCell className="font-medium">{i.lab_exams?.name ?? "—"} <span className="text-xs text-muted-foreground">({i.lab_exams?.code})</span></TableCell>
                  <TableCell>{i.lab_requests?.patients?.full_name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={i.priority === "urgente" || i.priority === "emergencia" ? "destructive" : "secondary"} className="text-xs">{i.priority}</Badge>
                  </TableCell>
                  <TableCell><Badge className={`text-xs ${statusColors[i.status] || ""}`}>{statusLabels[i.status] || i.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {i.status === "coletado" && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => handleStartProcessing(i)}><Play className="h-3.5 w-3.5" />Iniciar</Button>
                      )}
                      {i.status === "em_processamento" && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-green-600 gap-1" onClick={() => handleComplete(i)}><CheckCircle2 className="h-3.5 w-3.5" />Concluir</Button>
                      )}
                      {i.status === "repetir" && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => handleStartProcessing(i)}><Play className="h-3.5 w-3.5" />Reprocessar</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
