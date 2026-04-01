import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStockItems, useCreateStockItem, useStockMovements, useCreateStockMovement } from "@/hooks/useStock";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Plus, Search, Loader2, ArrowLeft, ArrowDownRight, ArrowUpRight, AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";

const stockTypeLabels: Record<string, string> = {
  farmacia: "Farmácia",
  almoxarifado: "Almoxarifado",
  laboratorio: "Laboratório",
  nutricao: "Nutrição",
};

interface Props {
  stockType?: string;
}

export default function Estoque({ stockType: propType }: Props) {
  const navigate = useNavigate();
  // Determine stock type from URL path if not provided as prop
  const path = window.location.pathname;
  const stockType = propType || path.split("/").pop() || "farmacia";
  
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showMovement, setShowMovement] = useState<string | null>(null);
  const { data: items, isLoading } = useStockItems(stockType);
  const createItem = useCreateStockItem();
  const createMovement = useCreateStockMovement();

  const [form, setForm] = useState({ name: "", code: "", category: "", unit_measure: "unidade", min_balance: "0" });
  const [movForm, setMovForm] = useState({ movement_type: "entrada", quantity: "", batch: "", notes: "" });

  const filtered = items?.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.code?.toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = items?.filter((i) => i.min_balance && i.current_balance <= i.min_balance).length || 0;
  const totalItems = items?.length || 0;

  const handleCreate = () => {
    createItem.mutate({ name: form.name, code: form.code, category: form.category, unit_measure: form.unit_measure, min_balance: Number(form.min_balance), stock_type: stockType } as any, {
      onSuccess: () => { setShowNew(false); setForm({ name: "", code: "", category: "", unit_measure: "unidade", min_balance: "0" }); },
    });
  };

  const handleMovement = () => {
    if (!showMovement) return;
    createMovement.mutate({ stock_item_id: showMovement, movement_type: movForm.movement_type, quantity: Number(movForm.quantity), batch: movForm.batch, notes: movForm.notes } as any, {
      onSuccess: () => { setShowMovement(null); setMovForm({ movement_type: "entrada", quantity: "", batch: "", notes: "" }); },
    });
  };

  const title = stockTypeLabels[stockType] || "Estoque";

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Estoque — {title}</h1>
            <p className="text-sm text-muted-foreground">Gestão de itens e movimentações</p>
          </div>
        </div>
        <Button onClick={() => setShowNew(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Novo Item</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">{totalItems}</p><p className="text-xs text-muted-foreground">Itens Cadastrados</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-emerald-600">{items?.filter((i) => i.status === "ativo").length || 0}</p><p className="text-xs text-muted-foreground">Ativos</p></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-2">
          {lowStock > 0 && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
          <div><p className="text-2xl font-bold text-yellow-600">{lowStock}</p><p className="text-xs text-muted-foreground">Estoque Baixo</p></div>
        </CardContent></Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar item..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card><CardContent className="p-0">
        {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Item</TableHead><TableHead>Código</TableHead><TableHead>Categoria</TableHead><TableHead>Saldo</TableHead><TableHead>Mín.</TableHead><TableHead>Unidade</TableHead><TableHead>Status</TableHead><TableHead>Ações</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered?.map((item) => {
                const isLow = item.min_balance && item.current_balance <= item.min_balance;
                return (
                  <TableRow key={item.id} className={isLow ? "bg-yellow-500/5" : ""}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="font-mono text-xs">{item.code || "—"}</TableCell>
                    <TableCell>{item.category || "—"}</TableCell>
                    <TableCell>
                      <span className={isLow ? "text-yellow-700 font-bold" : ""}>{item.current_balance}</span>
                    </TableCell>
                    <TableCell>{item.min_balance || "—"}</TableCell>
                    <TableCell>{item.unit_measure}</TableCell>
                    <TableCell><Badge variant="secondary" className={item.status === "ativo" ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}>{item.status === "ativo" ? "Ativo" : "Inativo"}</Badge></TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setShowMovement(item.id)}>
                        <Package className="h-3 w-3" /> Movimentar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent></Card>

      {/* New Item */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Item de Estoque</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Código</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
              <div><Label>Categoria</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Unidade de Medida</Label><Input value={form.unit_measure} onChange={(e) => setForm({ ...form, unit_measure: e.target.value })} /></div>
              <div><Label>Estoque Mínimo</Label><Input type="number" value={form.min_balance} onChange={(e) => setForm({ ...form, min_balance: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={!form.name}>Cadastrar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Movement */}
      <Dialog open={!!showMovement} onOpenChange={() => setShowMovement(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Movimentação</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Tipo</Label>
              <Select value={movForm.movement_type} onValueChange={(v) => setMovForm({ ...movForm, movement_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                  <SelectItem value="ajuste">Ajuste</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Quantidade *</Label><Input type="number" value={movForm.quantity} onChange={(e) => setMovForm({ ...movForm, quantity: e.target.value })} /></div>
              <div><Label>Lote</Label><Input value={movForm.batch} onChange={(e) => setMovForm({ ...movForm, batch: e.target.value })} /></div>
            </div>
            <div><Label>Observações</Label><Input value={movForm.notes} onChange={(e) => setMovForm({ ...movForm, notes: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowMovement(null)}>Cancelar</Button>
              <Button onClick={handleMovement} disabled={!movForm.quantity}>Registrar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
