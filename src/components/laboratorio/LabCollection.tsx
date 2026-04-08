import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLabLog } from "@/hooks/useLaboratory";
import { Droplets, CheckCircle2, Search } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const statusMap: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-amber-100 text-amber-800" },
  coletado: { label: "Coletado", color: "bg-green-100 text-green-800" },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800" },
};

function useCollectionsWithDetails() {
  return useQuery({
    queryKey: ["lab-collections-details"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("lab_collections")
        .select("*, patients(full_name), lab_request_items(*, lab_exams(name, code), lab_requests(request_number))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

// Items pending collection (request_items in status 'solicitado' from active requests)
function usePendingCollectionItems() {
  return useQuery({
    queryKey: ["lab-pending-collection-items"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("lab_request_items")
        .select("*, lab_exams(name, code, material_id), lab_requests(request_number, patient_id, patients(full_name), priority)")
        .eq("status", "solicitado")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
  });
}

export default function LabCollection() {
  const { data: collections, isLoading } = useCollectionsWithDetails();
  const { data: pendingItems } = usePendingCollectionItems();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCollect, setShowCollect] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [collectForm, setCollectForm] = useState({ collection_site: "Sala de Coleta 1", notes: "" });

  const toggleItem = (id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleCollect = async () => {
    if (!selectedItems.length) return;
    try {
      const now = new Date().toISOString();
      for (const itemId of selectedItems) {
        const item = pendingItems?.find((i: any) => i.id === itemId);
        if (!item) continue;
        const patientId = item.lab_requests?.patient_id;
        // Create collection record
        const { data: colData } = await (supabase as any).from("lab_collections").insert({
          request_item_id: itemId,
          patient_id: patientId,
          collector_id: user?.id,
          collected_at: now,
          collection_site: collectForm.collection_site,
          status: "coletado",
          notes: collectForm.notes || null,
        }).select("id").single();
        // Auto-create sample with barcode
        const seq = Date.now().toString().slice(-6);
        const barcode = `SMP-${new Date().getFullYear()}-${seq}`;
        const materialId = item.lab_exams?.material_id || null;
        await (supabase as any).from("lab_samples").insert({
          barcode,
          collection_id: colData?.id || null,
          request_item_id: itemId,
          patient_id: patientId,
          material_id: materialId,
          status: "coletada",
          condition: "adequada",
          collected_at: now,
        });
        // Update request_item status
        await (supabase as any).from("lab_request_items").update({ status: "coletado" }).eq("id", itemId);
        await createLabLog("lab_request_items", itemId, "coleta_realizada", user?.id, { site: collectForm.collection_site, barcode });
      }
      qc.invalidateQueries({ queryKey: ["lab-collections-details"] });
      qc.invalidateQueries({ queryKey: ["lab-pending-collection-items"] });
      qc.invalidateQueries({ queryKey: ["lab-processing-items"] });
      qc.invalidateQueries({ queryKey: ["lab-samples-details"] });
      toast.success(`${selectedItems.length} exame(s) coletado(s) — amostras criadas`);
      setShowCollect(false);
      setSelectedItems([]);
      setCollectForm({ collection_site: "Sala de Coleta 1", notes: "" });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleMarkCollected = async (c: any) => {
    await (supabase as any).from("lab_collections").update({ status: "coletado", collected_at: new Date().toISOString(), collector_id: user?.id }).eq("id", c.id);
    if (c.request_item_id) {
      await (supabase as any).from("lab_request_items").update({ status: "coletado" }).eq("id", c.request_item_id);
    }
    await createLabLog("lab_collections", c.id, "coleta_confirmada", user?.id);
    qc.invalidateQueries({ queryKey: ["lab-collections-details"] });
    toast.success("Coleta confirmada");
  };

  const filtered = collections?.filter((c: any) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.patients?.full_name?.toLowerCase().includes(q) || c.lab_request_items?.lab_requests?.request_number?.toLowerCase().includes(q) || c.collection_site?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  }) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Droplets className="h-5 w-5" />
          <span className="text-sm">Fila de coletas e registro de amostras</span>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">{pendingItems?.length ?? 0} pendente(s)</Badge>
          <Button size="sm" onClick={() => setShowCollect(true)} disabled={!pendingItems?.length}>
            <Droplets className="h-4 w-4 mr-1" />Registrar Coleta
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar coleta..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="coletado">Coletado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Solicitação</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Exame</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Coleta</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma coleta registrada</TableCell></TableRow>
              ) : filtered.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-sm">{c.lab_request_items?.lab_requests?.request_number ?? "—"}</TableCell>
                  <TableCell className="font-medium">{c.patients?.full_name ?? "—"}</TableCell>
                  <TableCell>{c.lab_request_items?.lab_exams?.name ?? "—"} <span className="text-xs text-muted-foreground">({c.lab_request_items?.lab_exams?.code})</span></TableCell>
                  <TableCell>{c.collection_site ?? "—"}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${statusMap[c.status]?.color || "bg-muted"}`}>{statusMap[c.status]?.label || c.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{c.collected_at ? format(new Date(c.collected_at), "dd/MM/yy HH:mm") : "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">{c.notes ?? "—"}</TableCell>
                  <TableCell>
                    {c.status === "pendente" && (
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-green-600 gap-1" onClick={() => handleMarkCollected(c)}>
                        <CheckCircle2 className="h-3.5 w-3.5" />Coletar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Collect Dialog */}
      <Dialog open={showCollect} onOpenChange={setShowCollect}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar Coleta</DialogTitle>
            <DialogDescription>Selecione os exames a coletar e registre o local da coleta</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="border rounded-md max-h-48 overflow-y-auto">
              {pendingItems?.map((item: any) => (
                <label key={item.id} className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 border-b last:border-b-0 cursor-pointer">
                  <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => toggleItem(item.id)} className="rounded" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm">{item.lab_exams?.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">({item.lab_exams?.code})</span>
                    <div className="text-xs text-muted-foreground">
                      {item.lab_requests?.patients?.full_name} — {item.lab_requests?.request_number}
                      {item.lab_requests?.priority !== "rotina" && (
                        <Badge variant="destructive" className="text-[10px] ml-1 h-4">{item.lab_requests?.priority}</Badge>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div>
              <Label>Local da Coleta</Label>
              <Select value={collectForm.collection_site} onValueChange={v => setCollectForm(f => ({ ...f, collection_site: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sala de Coleta 1">Sala de Coleta 1</SelectItem>
                  <SelectItem value="Sala de Coleta 2">Sala de Coleta 2</SelectItem>
                  <SelectItem value="Leito">Leito</SelectItem>
                  <SelectItem value="Emergência">Emergência</SelectItem>
                  <SelectItem value="UTI">UTI</SelectItem>
                  <SelectItem value="Centro Cirúrgico">Centro Cirúrgico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={collectForm.notes} onChange={e => setCollectForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Intercorrências, jejum, etc." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCollect(false)}>Cancelar</Button>
            <Button onClick={handleCollect} disabled={!selectedItems.length}>
              Confirmar Coleta ({selectedItems.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
