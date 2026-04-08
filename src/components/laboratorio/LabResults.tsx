import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLabResults, useLabResultsWithDetails, createLabLog, useExamComponentsByExamId } from "@/hooks/useLaboratory";
import { supabase } from "@/integrations/supabase/client";
import { Search, AlertTriangle, CheckCircle2, FileCheck } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

const statusColors: Record<string, string> = {
  em_processamento: "bg-purple-100 text-purple-800",
  aguardando_conferencia: "bg-amber-100 text-amber-800",
  validado: "bg-green-100 text-green-800",
};
const statusLabels: Record<string, string> = {
  em_processamento: "Processando", aguardando_conferencia: "Aguard. Conferência", validado: "Validado",
};

function checkFlag(val: number | null, min: number | null, max: number | null): boolean {
  if (val == null) return false;
  if (min != null && val < min) return true;
  if (max != null && val > max) return true;
  return false;
}

export default function LabResults() {
  const { data: results, isLoading } = useLabResultsWithDetails();
  const { update } = useLabResults();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState<any>(null);

  // Simple mode state
  const [simpleForm, setSimpleForm] = useState({ value: "", technical_notes: "", is_critical: false, is_abnormal: false });

  // Structured mode state
  const [componentValues, setComponentValues] = useState<Record<string, { value: string; numeric_value: number | null }>>({});

  // Get exam info for the editing result
  const examId = editing?.lab_request_items?.lab_exams?.id || null;
  const resultMode = editing?.lab_request_items?.lab_exams?.result_mode || "simples";
  const { data: examComponents } = useExamComponentsByExamId(
    resultMode === "estruturado" ? examId : null
  );

  const isStructured = resultMode === "estruturado" && examComponents && examComponents.length > 0;

  // Load existing component values when editing
  useEffect(() => {
    if (!editing || !isStructured) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("lab_result_components")
        .select("component_id, value, numeric_value")
        .eq("result_id", editing.id);
      if (data?.length) {
        const vals: Record<string, { value: string; numeric_value: number | null }> = {};
        data.forEach((d: any) => {
          vals[d.component_id] = { value: d.value || "", numeric_value: d.numeric_value };
        });
        setComponentValues(vals);
      } else {
        setComponentValues({});
      }
    })();
  }, [editing?.id, isStructured]);

  const filtered = results?.filter((r: any) => {
    const q = search.toLowerCase();
    const examName = r.lab_request_items?.lab_exams?.name || "";
    const patName = r.lab_request_items?.lab_requests?.patients?.full_name || "";
    const reqNum = r.lab_request_items?.lab_requests?.request_number || "";
    const matchSearch = !q || examName.toLowerCase().includes(q) || patName.toLowerCase().includes(q) || reqNum.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  }) ?? [];

  const openEdit = (r: any) => {
    setEditing(r);
    setSimpleForm({ value: r.value || "", technical_notes: r.technical_notes || "", is_critical: r.is_critical, is_abnormal: r.is_abnormal });
    setComponentValues({});
  };

  // Group components by group_name
  const groupedComponents = useMemo(() => {
    if (!examComponents) return [];
    const groups: { name: string; items: any[] }[] = [];
    const map = new Map<string, any[]>();
    examComponents.forEach((c: any) => {
      const g = c.group_name || "Geral";
      if (!map.has(g)) { map.set(g, []); groups.push({ name: g, items: map.get(g)! }); }
      map.get(g)!.push(c);
    });
    return groups;
  }, [examComponents]);

  const setCompValue = (compId: string, val: string) => {
    const numVal = parseFloat(val);
    setComponentValues(prev => ({
      ...prev,
      [compId]: { value: val, numeric_value: isNaN(numVal) ? null : numVal },
    }));
  };

  const getCompFlag = (comp: any) => {
    const v = componentValues[comp.id];
    if (!v || v.numeric_value == null) return { abnormal: false, critical: false };
    return {
      abnormal: checkFlag(v.numeric_value, comp.reference_min, comp.reference_max),
      critical: checkFlag(v.numeric_value, comp.critical_min, comp.critical_max),
    };
  };

  const saveResult = async () => {
    if (!editing) return;

    if (isStructured) {
      // Save structured components
      const anyCritical = examComponents!.some((c: any) => getCompFlag(c).critical);
      const anyAbnormal = examComponents!.some((c: any) => getCompFlag(c).abnormal || getCompFlag(c).critical);

      // Build summary value
      const summaryParts = examComponents!.map((c: any) => {
        const v = componentValues[c.id];
        return `${c.name}: ${v?.value || "—"} ${c.unit || ""}`.trim();
      });

      // Update parent result
      update.mutate({
        id: editing.id,
        value: summaryParts.join("; "),
        is_critical: anyCritical,
        is_abnormal: anyAbnormal,
        status: "aguardando_conferencia",
        performed_by: user?.id,
        performed_at: new Date().toISOString(),
        technical_notes: simpleForm.technical_notes || null,
      } as any, {
        onSuccess: async () => {
          // Upsert component values
          for (const comp of examComponents!) {
            const v = componentValues[comp.id];
            const flags = getCompFlag(comp);
            const existing = await (supabase as any)
              .from("lab_result_components")
              .select("id")
              .eq("result_id", editing.id)
              .eq("component_id", comp.id)
              .maybeSingle();

            if (existing.data) {
              await (supabase as any).from("lab_result_components").update({
                value: v?.value || null,
                numeric_value: v?.numeric_value ?? null,
                is_abnormal: flags.abnormal,
                is_critical: flags.critical,
              }).eq("id", existing.data.id);
            } else if (v?.value) {
              await (supabase as any).from("lab_result_components").insert({
                result_id: editing.id,
                component_id: comp.id,
                value: v.value,
                numeric_value: v.numeric_value,
                is_abnormal: flags.abnormal,
                is_critical: flags.critical,
              });
            }

            // Audit log per component
            if (v?.value) {
              await createLabLog("result_component", comp.id, "resultado_componente_preenchido", user?.id, {
                result_id: editing.id,
                component_name: comp.name,
                value: v.value,
                origin: "manual",
                is_abnormal: flags.abnormal,
                is_critical: flags.critical,
              });
            }
          }
          await createLabLog("lab_results", editing.id, "resultado_estruturado_digitado", user?.id);
          qc.invalidateQueries({ queryKey: ["lab-results-details"] });
          setEditing(null);
        },
      });
    } else {
      // Simple mode
      update.mutate({
        id: editing.id,
        value: simpleForm.value,
        numeric_value: parseFloat(simpleForm.value) || null,
        technical_notes: simpleForm.technical_notes || null,
        is_critical: simpleForm.is_critical,
        is_abnormal: simpleForm.is_abnormal,
        status: "aguardando_conferencia",
        performed_by: user?.id,
        performed_at: new Date().toISOString(),
      } as any, {
        onSuccess: () => {
          createLabLog("lab_results", editing.id, "resultado_digitado", user?.id);
          setEditing(null);
        },
      });
    }
  };

  const validateResult = (r: any) => {
    update.mutate({
      id: r.id,
      status: "validado",
      validated_by: user?.id,
      validated_at: new Date().toISOString(),
    } as any, {
      onSuccess: () => createLabLog("lab_results", r.id, "resultado_validado", user?.id),
    });
  };

  const countByStatus = (status: string) => results?.filter((r: any) => r.status === status).length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileCheck className="h-5 w-5" />
          <span className="text-sm">Lançamento e conferência de resultados</span>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-xs">{countByStatus("em_processamento")} pendente(s)</Badge>
          <Badge className="text-xs bg-amber-100 text-amber-800">{countByStatus("aguardando_conferencia")} conferência</Badge>
          <Badge className="text-xs bg-green-100 text-green-800">{countByStatus("validado")} validado(s)</Badge>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar exame, paciente, solicitação..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="em_processamento">Pendente Digitação</SelectItem>
            <SelectItem value="aguardando_conferencia">Aguard. Conferência</SelectItem>
            <SelectItem value="validado">Validado</SelectItem>
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
                <TableHead>Modo</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum resultado encontrado</TableCell></TableRow>
              ) : filtered.map((r: any) => (
                <TableRow key={r.id} className={r.is_critical ? "bg-destructive/5" : ""}>
                  <TableCell className="font-mono text-sm">{r.lab_request_items?.lab_requests?.request_number ?? "—"}</TableCell>
                  <TableCell className="font-medium">{r.lab_request_items?.lab_exams?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {r.lab_request_items?.lab_exams?.result_mode === "estruturado" ? "Estruturado" : "Simples"}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.lab_request_items?.lab_requests?.patients?.full_name ?? "—"}</TableCell>
                  <TableCell className="font-mono max-w-[200px] truncate">{r.value ?? <span className="text-muted-foreground italic">pendente</span>}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {r.is_critical && <Badge variant="destructive" className="text-xs">Crítico</Badge>}
                      {r.is_abnormal && !r.is_critical && <Badge className="text-xs bg-amber-100 text-amber-800">Alterado</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${statusColors[r.status] || "bg-muted"}`}>{statusLabels[r.status] || r.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => openEdit(r)}>
                        {r.value ? "Editar" : "Digitar"}
                      </Button>
                      {r.status === "aguardando_conferencia" && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-green-600 gap-1" onClick={() => validateResult(r)}>
                          <CheckCircle2 className="h-3.5 w-3.5" />Conferir
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

      {/* Result Dialog — Dynamic by result_mode */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className={isStructured ? "max-w-3xl max-h-[90vh] overflow-y-auto" : "max-w-md"}>
          <DialogHeader>
            <DialogTitle>
              {isStructured ? "Resultado Estruturado" : "Digitar / Editar Resultado"}
            </DialogTitle>
            <DialogDescription>
              {editing?.lab_request_items?.lab_exams?.name} — {editing?.lab_request_items?.lab_requests?.patients?.full_name}
            </DialogDescription>
          </DialogHeader>

          {isStructured ? (
            <div className="space-y-4">
              {groupedComponents.map(group => (
                <div key={group.name}>
                  <h4 className="text-sm font-semibold text-primary mb-2 border-b border-border pb-1">{group.name}</h4>
                  <div className="space-y-1">
                    <div className="grid grid-cols-[1fr_100px_60px_120px_60px] gap-2 text-xs text-muted-foreground font-medium px-1">
                      <span>Parâmetro</span>
                      <span>Resultado</span>
                      <span>Unidade</span>
                      <span>Referência</span>
                      <span>Flag</span>
                    </div>
                    {group.items.map((comp: any) => {
                      const v = componentValues[comp.id];
                      const flags = getCompFlag(comp);
                      return (
                        <div key={comp.id} className={`grid grid-cols-[1fr_100px_60px_120px_60px] gap-2 items-center px-1 py-1 rounded ${
                          flags.critical ? "bg-destructive/10 border border-destructive/30" :
                          flags.abnormal ? "bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700" :
                          "hover:bg-muted/30"
                        }`}>
                          <span className="text-sm font-medium">{comp.name}</span>
                          <Input
                            className="h-7 text-sm font-mono"
                            value={v?.value || ""}
                            onChange={e => setCompValue(comp.id, e.target.value)}
                            placeholder="—"
                          />
                          <span className="text-xs text-muted-foreground">{comp.unit || ""}</span>
                          <span className="text-xs text-muted-foreground">{comp.reference_text || ""}</span>
                          <div className="flex gap-0.5">
                            {flags.critical && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                            {flags.abnormal && !flags.critical && <span className="text-amber-500 text-xs font-bold">↑</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div>
                <Label>Observação Técnica</Label>
                <Textarea value={simpleForm.technical_notes} onChange={e => setSimpleForm(f => ({ ...f, technical_notes: e.target.value }))} rows={2} />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label>Valor / Resultado *</Label>
                <Textarea value={simpleForm.value} onChange={e => setSimpleForm(f => ({ ...f, value: e.target.value }))} rows={3} placeholder="Ex: 25000 ou texto descritivo" />
              </div>
              <div>
                <Label>Observação Técnica</Label>
                <Textarea value={simpleForm.technical_notes} onChange={e => setSimpleForm(f => ({ ...f, technical_notes: e.target.value }))} rows={2} />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={simpleForm.is_critical} onCheckedChange={v => setSimpleForm(f => ({ ...f, is_critical: v }))} />
                  <Label className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-destructive" />Crítico</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={simpleForm.is_abnormal} onCheckedChange={v => setSimpleForm(f => ({ ...f, is_abnormal: v }))} />
                  <Label>Alterado</Label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={saveResult} disabled={!isStructured && !simpleForm.value.trim()}>Salvar Resultado</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
