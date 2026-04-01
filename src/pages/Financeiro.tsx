import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccountsPayable, useCreateAccountPayable, useAccountsReceivable, useCreateAccountReceivable } from "@/hooks/useFinancial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, ArrowLeft, Plus, Search, Loader2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { format, parseISO } from "date-fns";

const payStatusConfig: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-700" },
  pago: { label: "Pago", color: "bg-emerald-500/10 text-emerald-700" },
  vencido: { label: "Vencido", color: "bg-destructive/10 text-destructive" },
  cancelado: { label: "Cancelado", color: "bg-muted text-muted-foreground" },
};

const recStatusConfig: Record<string, { label: string; color: string }> = {
  em_aberto: { label: "Em Aberto", color: "bg-yellow-500/10 text-yellow-700" },
  recebido: { label: "Recebido", color: "bg-emerald-500/10 text-emerald-700" },
  atrasado: { label: "Atrasado", color: "bg-destructive/10 text-destructive" },
  cancelado: { label: "Cancelado", color: "bg-muted text-muted-foreground" },
};

export default function Financeiro() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("pagar");
  const [showNewPay, setShowNewPay] = useState(false);
  const [showNewRec, setShowNewRec] = useState(false);
  const { data: payables, isLoading: loadingPay } = useAccountsPayable();
  const { data: receivables, isLoading: loadingRec } = useAccountsReceivable();
  const createPayable = useCreateAccountPayable();
  const createReceivable = useCreateAccountReceivable();

  const [payForm, setPayForm] = useState({ supplier: "", category: "", amount: "", due_date: "", payment_method: "" });
  const [recForm, setRecForm] = useState({ source: "particular", amount: "", due_date: "" });

  const totalPay = payables?.reduce((s, p) => s + Number(p.amount), 0) || 0;
  const totalRec = receivables?.reduce((s, r) => s + Number(r.amount), 0) || 0;
  const pendingPay = payables?.filter((p) => p.status === "pendente").reduce((s, p) => s + Number(p.amount), 0) || 0;
  const pendingRec = receivables?.filter((r) => r.status === "em_aberto").reduce((s, r) => s + Number(r.amount), 0) || 0;

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Financeiro</h1>
            <p className="text-sm text-muted-foreground">Contas a pagar e receber</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><TrendingDown className="h-5 w-5 text-red-500" /><div><p className="text-lg font-bold text-red-600">{fmt(pendingPay)}</p><p className="text-xs text-muted-foreground">A Pagar (Pendente)</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><TrendingUp className="h-5 w-5 text-emerald-500" /><div><p className="text-lg font-bold text-emerald-600">{fmt(pendingRec)}</p><p className="text-xs text-muted-foreground">A Receber (Aberto)</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><DollarSign className="h-5 w-5 text-muted-foreground" /><div><p className="text-lg font-bold">{fmt(totalRec - totalPay)}</p><p className="text-xs text-muted-foreground">Saldo Projetado</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Wallet className="h-5 w-5 text-primary" /><div><p className="text-lg font-bold">{(payables?.length || 0) + (receivables?.length || 0)}</p><p className="text-xs text-muted-foreground">Total Lançamentos</p></div></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pagar">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="receber">Contas a Receber</TabsTrigger>
        </TabsList>

        <TabsContent value="pagar" className="space-y-3 mt-4">
          <div className="flex justify-end"><Button onClick={() => setShowNewPay(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Nova Conta</Button></div>
          <Card><CardContent className="p-0">
            {loadingPay ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Fornecedor</TableHead><TableHead>Categoria</TableHead><TableHead>Valor</TableHead><TableHead>Vencimento</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {payables?.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.supplier}</TableCell>
                      <TableCell>{p.category || "—"}</TableCell>
                      <TableCell>{fmt(Number(p.amount))}</TableCell>
                      <TableCell>{format(parseISO(p.due_date), "dd/MM/yyyy")}</TableCell>
                      <TableCell><Badge variant="secondary" className={payStatusConfig[p.status]?.color}>{payStatusConfig[p.status]?.label}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="receber" className="space-y-3 mt-4">
          <div className="flex justify-end"><Button onClick={() => setShowNewRec(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Novo Recebível</Button></div>
          <Card><CardContent className="p-0">
            {loadingRec ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Paciente</TableHead><TableHead>Origem</TableHead><TableHead>Valor</TableHead><TableHead>Vencimento</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {receivables?.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.patients?.full_name || "—"}</TableCell>
                      <TableCell className="capitalize">{r.source}</TableCell>
                      <TableCell>{fmt(Number(r.amount))}</TableCell>
                      <TableCell>{format(parseISO(r.due_date), "dd/MM/yyyy")}</TableCell>
                      <TableCell><Badge variant="secondary" className={recStatusConfig[r.status]?.color}>{recStatusConfig[r.status]?.label}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* New Payable */}
      <Dialog open={showNewPay} onOpenChange={setShowNewPay}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Conta a Pagar</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label>Fornecedor *</Label><Input value={payForm.supplier} onChange={(e) => setPayForm({ ...payForm, supplier: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Categoria</Label><Input value={payForm.category} onChange={(e) => setPayForm({ ...payForm, category: e.target.value })} /></div>
              <div><Label>Valor *</Label><Input type="number" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Vencimento *</Label><Input type="date" value={payForm.due_date} onChange={(e) => setPayForm({ ...payForm, due_date: e.target.value })} /></div>
              <div><Label>Forma de Pagamento</Label><Input value={payForm.payment_method} onChange={(e) => setPayForm({ ...payForm, payment_method: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewPay(false)}>Cancelar</Button>
              <Button onClick={() => { createPayable.mutate({ supplier: payForm.supplier, category: payForm.category, amount: Number(payForm.amount), due_date: payForm.due_date, payment_method: payForm.payment_method } as any, { onSuccess: () => setShowNewPay(false) }); }} disabled={!payForm.supplier || !payForm.amount || !payForm.due_date}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Receivable */}
      <Dialog open={showNewRec} onOpenChange={setShowNewRec}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Recebível</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Origem</Label>
                <Select value={recForm.source} onValueChange={(v) => setRecForm({ ...recForm, source: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="particular">Particular</SelectItem>
                    <SelectItem value="convenio">Convênio</SelectItem>
                    <SelectItem value="sus">SUS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Valor *</Label><Input type="number" value={recForm.amount} onChange={(e) => setRecForm({ ...recForm, amount: e.target.value })} /></div>
            </div>
            <div><Label>Vencimento *</Label><Input type="date" value={recForm.due_date} onChange={(e) => setRecForm({ ...recForm, due_date: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewRec(false)}>Cancelar</Button>
              <Button onClick={() => { createReceivable.mutate({ source: recForm.source, amount: Number(recForm.amount), due_date: recForm.due_date } as any, { onSuccess: () => setShowNewRec(false) }); }} disabled={!recForm.amount || !recForm.due_date}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
