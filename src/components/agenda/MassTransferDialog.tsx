import { useState, useMemo } from "react";
import { useAppointments, useUpdateAppointment } from "@/hooks/useAppointments";
import { useSchedulePeriods, type ScheduleAgenda } from "@/hooks/useScheduleAgendas";
import { useCreateAppointmentLog } from "@/hooks/useAppointmentLogs";
import { useAuth } from "@/contexts/AuthContext";
import { isTimeAvailable } from "@/lib/agendaAvailability";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, ArrowRight, CheckCircle, XCircle, Users, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  agendas: ScheduleAgenda[];
}

type TransferRule = "same_time" | "next_available" | "as_fit_in";
type TransferResult = {
  appointmentId: string;
  patientName: string;
  originalTime: string;
  newTime: string | null;
  status: "success" | "conflict" | "blocked" | "no_slot";
  reason?: string;
};

const reasons = [
  "Ausência do profissional",
  "Reorganização operacional",
  "Indisponibilidade da agenda",
  "Manutenção / Bloqueio",
  "Outro",
];

export default function MassTransferDialog({ open, onOpenChange, defaultDate, agendas }: Props) {
  const { profile } = useAuth();
  const { data: allPeriods } = useSchedulePeriods();
  const periods = allPeriods || [];
  const updateAppointment = useUpdateAppointment();
  const createLog = useCreateAppointmentLog();

  const [step, setStep] = useState<"select" | "preview" | "result">("select");
  const [sourceAgendaId, setSourceAgendaId] = useState("");
  const [targetAgendaId, setTargetAgendaId] = useState("");
  const [transferDate, setTransferDate] = useState(defaultDate || format(new Date(), "yyyy-MM-dd"));
  const [periodFilter, setPeriodFilter] = useState("all");
  const [rule, setRule] = useState<TransferRule>("same_time");
  const [justification, setJustification] = useState("");
  const [justificationReason, setJustificationReason] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [results, setResults] = useState<TransferResult[]>([]);
  const [executing, setExecuting] = useState(false);

  const { data: dayAppointments } = useAppointments({ date: transferDate });

  const sourceAppointments = useMemo(() => {
    if (!dayAppointments || !sourceAgendaId) return [];
    return dayAppointments.filter((a: any) => {
      if (a.agenda_id !== sourceAgendaId) return false;
      if (a.status === "cancelado" || a.status === "concluido" || a.status === "nao_compareceu") return false;
      if (periodFilter !== "all") {
        const d = new Date(a.scheduled_at);
        const h = d.getHours();
        if (periodFilter === "manha" && h >= 12) return false;
        if (periodFilter === "tarde" && (h < 12 || h >= 18)) return false;
        if (periodFilter === "noite" && h < 18) return false;
      }
      return true;
    });
  }, [dayAppointments, sourceAgendaId, periodFilter]);

  const simulateTransfer = useMemo((): TransferResult[] => {
    if (!targetAgendaId || selectedIds.length === 0) return [];
    const targetAg = agendas.find(a => a.id === targetAgendaId);
    if (!targetAg) return [];
    const interval = targetAg.default_interval || 30;
    const dayOfWeek = new Date(transferDate + "T12:00:00").getDay();

    const targetExisting = (dayAppointments || []).filter((a: any) =>
      a.agenda_id === targetAgendaId && a.status !== "cancelado" && a.status !== "nao_compareceu"
    );
    const occupiedTimes = new Set(targetExisting.map((a: any) => {
      const d = new Date(a.scheduled_at);
      return `${d.getHours()}:${d.getMinutes()}`;
    }));

    const selected = sourceAppointments.filter(a => selectedIds.includes(a.id));
    const usedTimes = new Set<string>();

    return selected.map(appt => {
      const d = new Date(appt.scheduled_at);
      const origTime = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      const name = (appt as any).patients?.full_name || (appt as any).provisional_name || appt.title;

      if (rule === "same_time") {
        const timeKey = `${d.getHours()}:${d.getMinutes()}`;
        const available = isTimeAvailable(periods, targetAgendaId, dayOfWeek, origTime);
        if (!available) return { appointmentId: appt.id, patientName: name, originalTime: origTime, newTime: null, status: "blocked" as const, reason: "Fora do período" };
        if (occupiedTimes.has(timeKey) || usedTimes.has(timeKey)) return { appointmentId: appt.id, patientName: name, originalTime: origTime, newTime: null, status: "conflict" as const, reason: "Horário ocupado" };
        usedTimes.add(timeKey);
        return { appointmentId: appt.id, patientName: name, originalTime: origTime, newTime: origTime, status: "success" as const };
      }

      if (rule === "next_available") {
        for (let h = d.getHours(); h < 22; h++) {
          for (let m = (h === d.getHours() ? d.getMinutes() : 0); m < 60; m += interval) {
            const slotTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
            const timeKey = `${h}:${m}`;
            if (!isTimeAvailable(periods, targetAgendaId, dayOfWeek, slotTime)) continue;
            if (occupiedTimes.has(timeKey) || usedTimes.has(timeKey)) continue;
            usedTimes.add(timeKey);
            return { appointmentId: appt.id, patientName: name, originalTime: origTime, newTime: slotTime, status: "success" as const };
          }
        }
        return { appointmentId: appt.id, patientName: name, originalTime: origTime, newTime: null, status: "no_slot" as const, reason: "Sem vaga" };
      }

      // as_fit_in
      usedTimes.add(`${d.getHours()}:${d.getMinutes()}`);
      return { appointmentId: appt.id, patientName: name, originalTime: origTime, newTime: origTime, status: "success" as const };
    });
  }, [targetAgendaId, selectedIds, sourceAppointments, rule, periods, dayAppointments, transferDate, agendas]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleAll = () => {
    if (selectedIds.length === sourceAppointments.length) setSelectedIds([]);
    else setSelectedIds(sourceAppointments.map(a => a.id));
  };

  const executeTransfer = async () => {
    if (!justificationReason) { toast.error("Informe o motivo da transferência."); return; }
    const successItems = simulateTransfer.filter(r => r.status === "success");
    if (!successItems.length) { toast.error("Nenhum paciente pode ser transferido."); return; }

    setExecuting(true);
    const finalResults: TransferResult[] = [...simulateTransfer];

    for (const item of successItems) {
      try {
        const appt = sourceAppointments.find(a => a.id === item.appointmentId);
        if (!appt || !item.newTime) continue;
        const [h, m] = item.newTime.split(":").map(Number);
        const localIso = `${transferDate}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;

        await updateAppointment.mutateAsync({
          id: item.appointmentId,
          agenda_id: targetAgendaId,
          scheduled_at: localIso,
          is_fit_in: rule === "as_fit_in" ? true : undefined,
        } as any);

        createLog.mutate({
          appointment_id: item.appointmentId,
          action: "mass_transfer",
          old_status: appt.status,
          new_status: appt.status,
          changed_by: profile?.id,
          details: {
            type: "mass_transfer",
            source_agenda: sourceAgendaId,
            target_agenda: targetAgendaId,
            original_time: item.originalTime,
            new_time: item.newTime,
            rule,
            justification: `${justificationReason}: ${justification}`.trim(),
          } as any,
        });
      } catch {
        const idx = finalResults.findIndex(r => r.appointmentId === item.appointmentId);
        if (idx >= 0) finalResults[idx] = { ...finalResults[idx], status: "conflict", reason: "Erro ao salvar" };
      }
    }

    setResults(finalResults);
    setStep("result");
    setExecuting(false);
    toast.success(`${successItems.length} agendamento(s) transferido(s)`);
  };

  const reset = () => {
    setStep("select");
    setSourceAgendaId("");
    setTargetAgendaId("");
    setPeriodFilter("all");
    setRule("same_time");
    setJustification("");
    setJustificationReason("");
    setSelectedIds([]);
    setResults([]);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const successCount = simulateTransfer.filter(r => r.status === "success").length;
  const failCount = simulateTransfer.filter(r => r.status !== "success").length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col z-[120]">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Transferência em Massa
          </DialogTitle>
          <DialogDescription className="text-xs">
            Redistribua agendamentos de uma agenda para outra.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-5 py-2">
          {step === "select" && (
            <>
              {/* Source / Target */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Agenda Origem</Label>
                  <Select value={sourceAgendaId} onValueChange={v => { setSourceAgendaId(v); setSelectedIds([]); }}>
                    <SelectTrigger><SelectValue placeholder="Selecione a agenda de origem..." /></SelectTrigger>
                    <SelectContent className="z-[200]">
                      {agendas.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Agenda Destino</Label>
                  <Select value={targetAgendaId} onValueChange={setTargetAgendaId}>
                    <SelectTrigger><SelectValue placeholder="Selecione a agenda de destino..." /></SelectTrigger>
                    <SelectContent className="z-[200]">
                      {agendas.filter(a => a.id !== sourceAgendaId).map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Data</Label>
                  <input type="date" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={transferDate} onChange={e => setTransferDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Período</Label>
                  <Select value={periodFilter} onValueChange={setPeriodFilter}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="z-[200]">
                      <SelectItem value="all">Dia inteiro</SelectItem>
                      <SelectItem value="manha">Manhã</SelectItem>
                      <SelectItem value="tarde">Tarde</SelectItem>
                      <SelectItem value="noite">Noite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Patients list */}
              {sourceAgendaId && sourceAppointments.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-semibold">{sourceAppointments.length} agendamento(s)</Label>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={toggleAll}>
                      {selectedIds.length === sourceAppointments.length ? "Desmarcar todos" : "Selecionar todos"}
                    </Button>
                  </div>
                  <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                    {sourceAppointments.map(appt => {
                      const d = new Date(appt.scheduled_at);
                      const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
                      return (
                        <label key={appt.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30 cursor-pointer">
                          <Checkbox checked={selectedIds.includes(appt.id)} onCheckedChange={() => toggleSelect(appt.id)} />
                          <span className="text-xs font-mono w-12 shrink-0 font-semibold">{time}</span>
                          <span className="text-xs flex-1 truncate">{(appt as any).patients?.full_name || (appt as any).provisional_name || appt.title}</span>
                          <Badge variant="outline" className="text-[9px]">{(appt as any).insurance || "particular"}</Badge>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
              {sourceAgendaId && sourceAppointments.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg">Nenhum agendamento ativo nesta data/período.</div>
              )}

              <Separator />

              {/* Transfer rule */}
              <div>
                <Label className="text-xs font-semibold">Regra de transferência</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { value: "same_time" as const, label: "Mesmo horário", desc: "Manter horário original" },
                    { value: "next_available" as const, label: "Próximo livre", desc: "Buscar próximo disponível" },
                    { value: "as_fit_in" as const, label: "Como encaixe", desc: "Transferir como encaixe" },
                  ].map(r => (
                    <button key={r.value} type="button" className={cn("border rounded-lg p-3 text-left transition-all", rule === r.value ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/30")} onClick={() => setRule(r.value)}>
                      <span className="text-xs font-semibold block">{r.label}</span>
                      <span className="text-[10px] text-muted-foreground">{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Justification */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Motivo *</Label>
                <Select value={justificationReason} onValueChange={setJustificationReason}>
                  <SelectTrigger><SelectValue placeholder="Selecione o motivo..." /></SelectTrigger>
                  <SelectContent className="z-[200]">
                    {reasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Textarea placeholder="Observação complementar (opcional)..." className="text-xs" rows={2} value={justification} onChange={e => setJustification(e.target.value)} />
              </div>
            </>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Badge variant="outline">{agendas.find(a => a.id === sourceAgendaId)?.name}</Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">{agendas.find(a => a.id === targetAgendaId)?.name}</Badge>
              </div>

              <div className="flex gap-3">
                <div className="flex items-center gap-1.5 text-xs"><CheckCircle className="h-3.5 w-3.5 text-emerald-600" /><span>{successCount} transferível</span></div>
                {failCount > 0 && <div className="flex items-center gap-1.5 text-xs"><XCircle className="h-3.5 w-3.5 text-destructive" /><span>{failCount} com problema</span></div>}
              </div>

              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                {simulateTransfer.map(item => (
                  <div key={item.appointmentId} className={cn("flex items-center gap-3 px-3 py-2 text-xs", item.status !== "success" && "bg-destructive/5")}>
                    {item.status === "success" ? <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> : <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />}
                    <span className="flex-1 truncate">{item.patientName}</span>
                    <span className="font-mono text-muted-foreground">{item.originalTime}</span>
                    {item.newTime && <><ArrowRight className="h-3 w-3 text-muted-foreground" /><span className="font-mono font-semibold">{item.newTime}</span></>}
                    {item.reason && <span className="text-[10px] text-destructive max-w-[140px] truncate" title={item.reason}>{item.reason}</span>}
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-amber-800 dark:text-amber-300">Motivo: {justificationReason}</p>
                  {justification && <p className="text-amber-700 dark:text-amber-400 mt-0.5">{justification}</p>}
                </div>
              </div>
            </div>
          )}

          {step === "result" && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                <p className="font-semibold">Transferência concluída</p>
                <p className="text-sm text-muted-foreground">{results.filter(r => r.status === "success").length} de {results.length} transferido(s)</p>
              </div>
              <div className="border rounded-lg divide-y max-h-52 overflow-y-auto">
                {results.map(item => (
                  <div key={item.appointmentId} className={cn("flex items-center gap-3 px-3 py-2 text-xs", item.status !== "success" && "bg-destructive/5")}>
                    {item.status === "success" ? <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />}
                    <span className="flex-1 truncate">{item.patientName}</span>
                    <span className="font-mono">{item.originalTime}</span>
                    {item.newTime && <><ArrowRight className="h-3 w-3" /><span className="font-mono font-semibold">{item.newTime}</span></>}
                    {item.reason && <span className="text-[10px] text-destructive">{item.reason}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-between shrink-0 pt-2">
          {step === "select" && (
            <>
              <Button variant="outline" onClick={() => handleClose(false)}>Cancelar</Button>
              <Button onClick={() => setStep("preview")} disabled={!sourceAgendaId || !targetAgendaId || selectedIds.length === 0 || !justificationReason}>
                Simular ({selectedIds.length})
              </Button>
            </>
          )}
          {step === "preview" && (
            <>
              <Button variant="outline" onClick={() => setStep("select")}>Voltar</Button>
              <Button onClick={executeTransfer} disabled={executing || successCount === 0} className="gap-2">
                {executing && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirmar ({successCount})
              </Button>
            </>
          )}
          {step === "result" && (
            <Button className="ml-auto" onClick={() => handleClose(false)}>Fechar</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
