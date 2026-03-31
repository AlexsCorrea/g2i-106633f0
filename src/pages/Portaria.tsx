import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useVisitors, useCreateVisitor, useUpdateVisitor } from "@/hooks/useVisitors";
import { usePatients } from "@/hooks/usePatients";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, Plus, Search, Loader2, ArrowLeft, LogIn, LogOut, User } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Portaria() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const { data: visitors, isLoading } = useVisitors({ status: statusFilter });
  const { data: patients } = usePatients();
  const createVisitor = useCreateVisitor();
  const updateVisitor = useUpdateVisitor();

  const [form, setForm] = useState({
    patient_id: "", visitor_name: "", document: "", visitor_type: "visitante", relationship: "", notes: "",
  });

  const filtered = visitors?.filter((v) =>
    v.visitor_name.toLowerCase().includes(search.toLowerCase()) ||
    v.patients?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    createVisitor.mutate({ ...form, authorized_by: user?.id } as any, {
      onSuccess: () => { setShowNew(false); setForm({ patient_id: "", visitor_name: "", document: "", visitor_type: "visitante", relationship: "", notes: "" }); },
    });
  };

  const handleExit = (id: string) => {
    updateVisitor.mutate({ id, exit_time: new Date().toISOString(), status: "finalizado" });
  };

  const active = visitors?.filter((v) => v.status === "ativo").length || 0;

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Portaria</h1>
            <p className="text-sm text-muted-foreground">Controle de visitantes e acompanhantes</p>
          </div>
        </div>
        <Button onClick={() => setShowNew(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Registrar Entrada</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">{visitors?.length || 0}</p><p className="text-xs text-muted-foreground">Total Registros</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-emerald-600">{active}</p><p className="text-xs text-muted-foreground">Ativos Agora</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-muted-foreground">{(visitors?.length || 0) - active}</p><p className="text-xs text-muted-foreground">Saídas Registradas</p></CardContent></Card>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar visitante ou paciente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="finalizado">Finalizados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitante</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Parentesco</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Saída</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div><p className="font-medium">{v.visitor_name}</p>{v.document && <p className="text-xs text-muted-foreground">{v.document}</p>}</div>
                    </TableCell>
                    <TableCell className="capitalize">{v.visitor_type}</TableCell>
                    <TableCell>{v.patients?.full_name || "—"}</TableCell>
                    <TableCell>{v.relationship || "—"}</TableCell>
                    <TableCell className="text-sm">{format(parseISO(v.entry_time), "dd/MM HH:mm", { locale: ptBR })}</TableCell>
                    <TableCell className="text-sm">{v.exit_time ? format(parseISO(v.exit_time), "HH:mm", { locale: ptBR }) : "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={v.status === "ativo" ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}>
                        {v.status === "ativo" ? "Ativo" : "Finalizado"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {v.status === "ativo" && (
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleExit(v.id)}>
                          <LogOut className="h-3 w-3" /> Registrar Saída
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Entrada</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome do Visitante *</Label><Input value={form.visitor_name} onChange={(e) => setForm({ ...form, visitor_name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Documento</Label><Input value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} /></div>
              <div>
                <Label>Tipo</Label>
                <Select value={form.visitor_type} onValueChange={(v) => setForm({ ...form, visitor_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visitante">Visitante</SelectItem>
                    <SelectItem value="acompanhante">Acompanhante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Paciente Visitado</Label>
              <Select value={form.patient_id} onValueChange={(v) => setForm({ ...form, patient_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{patients?.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Parentesco</Label><Input value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={!form.visitor_name}>Registrar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
