import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBeds, useCreateBed, useUpdateBed } from "@/hooks/useBeds";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BedDouble, Plus, Search, Loader2, ArrowLeft, LayoutGrid, List, User } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  livre: { label: "Livre", color: "text-emerald-700", bg: "bg-emerald-500/10 border-emerald-500/30" },
  ocupado: { label: "Ocupado", color: "text-red-700", bg: "bg-red-500/10 border-red-500/30" },
  reservado: { label: "Reservado", color: "text-blue-700", bg: "bg-blue-500/10 border-blue-500/30" },
  higienizacao: { label: "Higienização", color: "text-yellow-700", bg: "bg-yellow-500/10 border-yellow-500/30" },
  bloqueado: { label: "Bloqueado", color: "text-muted-foreground", bg: "bg-muted border-border" },
  transferencia: { label: "Transferência", color: "text-purple-700", bg: "bg-purple-500/10 border-purple-500/30" },
};

const bedTypes = [
  { value: "enfermaria", label: "Enfermaria" },
  { value: "apartamento", label: "Apartamento" },
  { value: "uti", label: "UTI" },
  { value: "semi_intensiva", label: "Semi-Intensiva" },
  { value: "isolamento", label: "Isolamento" },
  { value: "berco", label: "Berço" },
];

export default function Leitos() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"mapa" | "lista">("mapa");
  const [showNew, setShowNew] = useState(false);
  const { data: beds, isLoading } = useBeds({ status: statusFilter });
  const createBed = useCreateBed();
  const updateBed = useUpdateBed();

  const [form, setForm] = useState({ bed_number: "", room: "", unit: "Geral", sector: "", bed_type: "enfermaria" });

  const filtered = beds?.filter((b) =>
    b.bed_number.toLowerCase().includes(search.toLowerCase()) ||
    b.room.toLowerCase().includes(search.toLowerCase()) ||
    b.patients?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    createBed.mutate(form as any, { onSuccess: () => { setShowNew(false); setForm({ bed_number: "", room: "", unit: "Geral", sector: "", bed_type: "enfermaria" }); } });
  };

  const counts = {
    total: beds?.length || 0,
    livres: beds?.filter((b) => b.status === "livre").length || 0,
    ocupados: beds?.filter((b) => b.status === "ocupado").length || 0,
    taxa: beds?.length ? Math.round((beds.filter((b) => b.status === "ocupado").length / beds.length) * 100) : 0,
  };

  // Group by room for map view
  const rooms = filtered?.reduce((acc, bed) => {
    if (!acc[bed.room]) acc[bed.room] = [];
    acc[bed.room].push(bed);
    return acc;
  }, {} as Record<string, typeof filtered>);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Gestão de Leitos</h1>
            <p className="text-sm text-muted-foreground">Mapa e controle de leitos</p>
          </div>
        </div>
        <Button onClick={() => setShowNew(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Novo Leito</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">{counts.total}</p><p className="text-xs text-muted-foreground">Total de Leitos</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-emerald-600">{counts.livres}</p><p className="text-xs text-muted-foreground">Livres</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-red-600">{counts.ocupados}</p><p className="text-xs text-muted-foreground">Ocupados</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-primary">{counts.taxa}%</p><p className="text-xs text-muted-foreground">Taxa de Ocupação</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar quarto, leito ou paciente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex border rounded-md">
          <Button variant={view === "mapa" ? "default" : "ghost"} size="sm" onClick={() => setView("mapa")} className="gap-1"><LayoutGrid className="h-3.5 w-3.5" /> Mapa</Button>
          <Button variant={view === "lista" ? "default" : "ghost"} size="sm" onClick={() => setView("lista")} className="gap-1"><List className="h-3.5 w-3.5" /> Lista</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : view === "mapa" ? (
        <div className="space-y-4">
          {rooms && Object.entries(rooms).map(([room, roomBeds]) => (
            <div key={room}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Quarto {room}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {roomBeds?.map((bed) => {
                  const st = statusConfig[bed.status] || statusConfig.livre;
                  return (
                    <button
                      key={bed.id}
                      onClick={() => bed.status !== "livre" ? updateBed.mutate({ id: bed.id, status: "livre", patient_id: null }) : null}
                      className={cn("border rounded-lg p-3 text-left transition-all hover:shadow-md", st.bg)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <BedDouble className={cn("h-4 w-4", st.color)} />
                        <span className="font-semibold text-sm">{bed.bed_number}</span>
                      </div>
                      <Badge variant="outline" className={cn("text-[10px] mb-1", st.color)}>{st.label}</Badge>
                      {bed.patients?.full_name && (
                        <div className="flex items-center gap-1 mt-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[11px] text-foreground truncate">{bed.patients.full_name}</span>
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{bed.bed_type}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {!rooms || Object.keys(rooms).length === 0 && (
            <div className="text-center py-12 text-muted-foreground">Nenhum leito cadastrado</div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Leito</TableHead>
                  <TableHead>Quarto</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.map((bed) => (
                  <TableRow key={bed.id}>
                    <TableCell className="font-medium">{bed.bed_number}</TableCell>
                    <TableCell>{bed.room}</TableCell>
                    <TableCell>{bed.unit}</TableCell>
                    <TableCell className="capitalize">{bed.bed_type}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusConfig[bed.status]?.color}>{statusConfig[bed.status]?.label}</Badge>
                    </TableCell>
                    <TableCell>{bed.patients?.full_name || "—"}</TableCell>
                    <TableCell>
                      <Select value={bed.status} onValueChange={(v) => updateBed.mutate({ id: bed.id, status: v })}>
                        <SelectTrigger className="h-7 text-xs w-[130px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* New Bed Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cadastrar Leito</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Número do Leito *</Label><Input value={form.bed_number} onChange={(e) => setForm({ ...form, bed_number: e.target.value })} /></div>
              <div><Label>Quarto *</Label><Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Unidade</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
              <div><Label>Setor</Label><Input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} /></div>
            </div>
            <div>
              <Label>Tipo de Leito</Label>
              <Select value={form.bed_type} onValueChange={(v) => setForm({ ...form, bed_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{bedTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={!form.bed_number || !form.room}>Cadastrar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
