import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Scale, ArrowLeft, Plus, Search, Loader2, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

const shifts = [
  { value: "manha", label: "Manhã (07h–13h)" },
  { value: "tarde", label: "Tarde (13h–19h)" },
  { value: "noite", label: "Noite (19h–07h)" },
  { value: "integral", label: "Integral" },
];

export default function Escalas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["staff_schedules"],
    queryFn: async () => {
      const { data, error } = await supabase.from("staff_schedules").select("*").order("schedule_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createSchedule = useMutation({
    mutationFn: async (s: any) => {
      const { data, error } = await supabase.from("staff_schedules").insert(s).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["staff_schedules"] }); toast.success("Escala registrada!"); },
    onError: () => toast.error("Erro ao registrar escala"),
  });

  const [form, setForm] = useState({ professional_name: "", sector: "", shift: "manha", schedule_date: "", notes: "" });

  const filtered = schedules?.filter((s: any) =>
    s.professional_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.sector?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Escalas</h1>
            <p className="text-sm text-muted-foreground">Gestão de escalas profissionais</p>
          </div>
        </div>
        <Button onClick={() => setShowNew(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Nova Escala</Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar profissional ou setor..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card><CardContent className="p-0">
        {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Profissional</TableHead><TableHead>Setor</TableHead><TableHead>Turno</TableHead><TableHead>Data</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered?.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.professional_name}</TableCell>
                  <TableCell>{s.sector}</TableCell>
                  <TableCell className="capitalize">{shifts.find((sh) => sh.value === s.shift)?.label || s.shift}</TableCell>
                  <TableCell>{format(parseISO(s.schedule_date), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={s.status === "confirmada" ? "bg-emerald-500/10 text-emerald-700" : "bg-yellow-500/10 text-yellow-700"}>
                      {s.status === "confirmada" ? "Confirmada" : "Pendente"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent></Card>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Escala</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Profissional *</Label><Input value={form.professional_name} onChange={(e) => setForm({ ...form, professional_name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Setor *</Label><Input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} /></div>
              <div>
                <Label>Turno</Label>
                <Select value={form.shift} onValueChange={(v) => setForm({ ...form, shift: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{shifts.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Data *</Label><Input type="date" value={form.schedule_date} onChange={(e) => setForm({ ...form, schedule_date: e.target.value })} /></div>
            <div><Label>Observações</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
              <Button onClick={() => { createSchedule.mutate({ ...form, created_by: user?.id }); setShowNew(false); }} disabled={!form.professional_name || !form.sector || !form.schedule_date}>Registrar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
