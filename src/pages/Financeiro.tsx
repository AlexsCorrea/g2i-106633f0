import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAccountsPayable, useAccountsReceivable, useCreateAccountPayable, useCreateAccountReceivable,
  useSuppliers, useCustomers, useBanks, usePaymentMethods, useDocumentTypes, useClassifications,
  useChartOfAccounts, useCostCenters, useCostCenterGroups, useCompanies, useCompanyGroups,
  useCashMovements, useRecurringExpenses, useJournalEntries, useReconciliations,
  type AccountPayable, type AccountReceivable,
} from "@/hooks/useFinancial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Wallet, ArrowLeft, Plus, Loader2, TrendingUp, TrendingDown, DollarSign,
  Building2, Users, CreditCard, Receipt, BarChart3, Database, ChevronLeft, ChevronRight,
  ArrowUpDown, Banknote, RotateCcw, BookOpen, PieChart, FileText,
} from "lucide-react";
import { format, parseISO, subDays, addDays, isAfter, isBefore } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const PAGE_SIZE = 30;
const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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

const sidebarItems = [
  { key: "dashboard", label: "Dashboard", icon: PieChart },
  { key: "fluxo", label: "Fluxo de Caixa", icon: ArrowUpDown },
  { key: "fornecedores", label: "Fornecedores", icon: Building2 },
  { key: "clientes", label: "Clientes", icon: Users },
  { key: "pagar", label: "Contas a Pagar", icon: TrendingDown },
  { key: "receber", label: "Contas a Receber", icon: TrendingUp },
  { key: "movimentos", label: "Movimentos", icon: RotateCcw },
  { key: "resultados", label: "Resultados", icon: BarChart3 },
  { key: "dados", label: "Dados Base", icon: Database },
];

// ── Pagination component ──
function Pagination({ total, page, setPage }: { total: number; page: number; setPage: (p: number) => void }) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <span className="text-xs text-muted-foreground">
        Mostrando {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} de {total}
      </span>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page === 1} onClick={() => setPage(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          let p: number;
          if (totalPages <= 7) p = i + 1;
          else if (page <= 4) p = i + 1;
          else if (page >= totalPages - 3) p = totalPages - 6 + i;
          else p = page - 3 + i;
          return (
            <Button key={p} variant={p === page ? "default" : "ghost"} size="icon" className="h-7 w-7 text-xs" onClick={() => setPage(p)}>
              {p}
            </Button>
          );
        })}
        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Dashboard Section ──
function FinDashboard({ payables, receivables, movements }: { payables: AccountPayable[]; receivables: AccountReceivable[]; movements: any[] }) {
  const pendingPay = payables.filter(p => p.status === "pendente").reduce((s, p) => s + Number(p.amount), 0);
  const pendingRec = receivables.filter(r => r.status === "em_aberto").reduce((s, r) => s + Number(r.amount), 0);
  const totalPaid = payables.filter(p => p.status === "pago").reduce((s, p) => s + Number(p.amount), 0);
  const totalReceived = receivables.filter(r => r.status === "recebido").reduce((s, r) => s + Number(r.amount), 0);
  const overdue = payables.filter(p => p.status === "vencido").length + receivables.filter(r => r.status === "atrasado").length;

  const chartData = useMemo(() => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = subDays(new Date(), 29 - i);
      const ds = format(d, "yyyy-MM-dd");
      const entradas = movements.filter(m => m.movement_type === "entrada" && m.movement_date === ds).reduce((s: number, m: any) => s + Number(m.amount), 0);
      const saidas = movements.filter(m => m.movement_type === "saida" && m.movement_date === ds).reduce((s: number, m: any) => s + Number(m.amount), 0);
      return { date: format(d, "dd/MM"), entradas, saidas };
    });
    return days;
  }, [movements]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">A Pagar (Pendente)</p><p className="text-xl font-bold text-red-600">{fmt(pendingPay)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">A Receber (Aberto)</p><p className="text-xl font-bold text-emerald-600">{fmt(pendingRec)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Pago</p><p className="text-xl font-bold">{fmt(totalPaid)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Recebido</p><p className="text-xl font-bold">{fmt(totalReceived)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Inadimplência</p><p className="text-xl font-bold text-destructive">{overdue} títulos</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-sm">Fluxo de Caixa — Últimos 30 dias</CardTitle></CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Area type="monotone" dataKey="entradas" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.3} name="Entradas" />
              <Area type="monotone" dataKey="saidas" stackId="2" stroke="hsl(var(--chart-5))" fill="hsl(var(--chart-5))" fillOpacity={0.3} name="Saídas" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Suppliers Section ──
function FinSuppliers() {
  const { data, isLoading, create } = useSuppliers();
  const [page, setPage] = useState(1);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", cnpj: "", city: "", state: "", phone: "", email: "", payment_terms: "", payment_days: "30" });
  const paginated = data?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) || [];

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Fornecedores</h2>
        <Button onClick={() => setShowNew(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Novo Fornecedor</Button>
      </div>
      <Card><CardContent className="p-0">
        {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
          <>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Nome</TableHead><TableHead>CNPJ</TableHead><TableHead>Cidade/UF</TableHead><TableHead>Telefone</TableHead><TableHead>Cond. Pagamento</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {paginated.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.cnpj || "—"}</TableCell>
                    <TableCell>{[s.city, s.state].filter(Boolean).join("/") || "—"}</TableCell>
                    <TableCell>{s.phone || "—"}</TableCell>
                    <TableCell>{s.payment_terms || `${s.payment_days}d`}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination total={data?.length || 0} page={page} setPage={setPage} />
          </>
        )}
      </CardContent></Card>
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Fornecedor</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label>Razão Social *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>CNPJ</Label><Input value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })} /></div>
              <div><Label>Telefone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Cidade</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
              <div><Label>UF</Label><Input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} /></div>
            </div>
            <div><Label>E-mail</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Condição Pgto</Label><Input value={form.payment_terms} onChange={e => setForm({ ...form, payment_terms: e.target.value })} /></div>
              <div><Label>Prazo (dias)</Label><Input type="number" value={form.payment_days} onChange={e => setForm({ ...form, payment_days: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
              <Button disabled={!form.name} onClick={() => { create.mutate(form as any, { onSuccess: () => setShowNew(false) }); }}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Customers Section ──
function FinCustomers() {
  const { data, isLoading, create } = useCustomers();
  const [page, setPage] = useState(1);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", cnpj: "", cpf: "", phone: "", email: "" });
  const paginated = data?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) || [];

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Clientes</h2>
        <Button onClick={() => setShowNew(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Novo Cliente</Button>
      </div>
      <Card><CardContent className="p-0">
        {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
          <>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Nome</TableHead><TableHead>CNPJ/CPF</TableHead><TableHead>Telefone</TableHead><TableHead>E-mail</TableHead><TableHead>Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {paginated.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.cnpj || c.cpf || "—"}</TableCell>
                    <TableCell>{c.phone || "—"}</TableCell>
                    <TableCell>{c.email || "—"}</TableCell>
                    <TableCell><Badge variant="secondary" className={c.active ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}>{c.active ? "Ativo" : "Inativo"}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination total={data?.length || 0} page={page} setPage={setPage} />
          </>
        )}
      </CardContent></Card>
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Cliente</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>CNPJ</Label><Input value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })} /></div>
              <div><Label>CPF</Label><Input value={form.cpf} onChange={e => setForm({ ...form, cpf: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Telefone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>E-mail</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
              <Button disabled={!form.name} onClick={() => { create.mutate(form as any, { onSuccess: () => setShowNew(false) }); }}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Accounts Payable Section ──
function FinContasPagar() {
  const { data: payables, isLoading } = useAccountsPayable();
  const createPayable = useCreateAccountPayable();
  const { data: suppliers } = useSuppliers();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [showNew, setShowNew] = useState(false);
  const [payForm, setPayForm] = useState({ supplier: "", category: "", amount: "", due_date: "", payment_method: "", supplier_id: "" });
  const [subTab, setSubTab] = useState("lista");

  const filtered = useMemo(() => {
    if (!payables) return [];
    return payables.filter(p => statusFilter === "todos" || p.status === statusFilter);
  }, [payables, statusFilter]);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-3">
      <Tabs value={subTab} onValueChange={setSubTab}>
        <div className="flex justify-between items-center">
          <TabsList><TabsTrigger value="lista">Lista</TabsTrigger><TabsTrigger value="recorrentes">Despesas Recorrentes</TabsTrigger></TabsList>
          {subTab === "lista" && <Button onClick={() => setShowNew(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Nova Conta</Button>}
        </div>
        <TabsContent value="lista" className="space-y-3 mt-3">
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Card><CardContent className="p-0">
            {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
              <>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Fornecedor</TableHead><TableHead>Categoria</TableHead><TableHead>Valor</TableHead><TableHead>Vencimento</TableHead><TableHead>Parcela</TableHead><TableHead>Status</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {paginated.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.supplier}</TableCell>
                        <TableCell>{p.category || "—"}</TableCell>
                        <TableCell>{fmt(Number(p.amount))}</TableCell>
                        <TableCell>{format(parseISO(p.due_date), "dd/MM/yyyy")}</TableCell>
                        <TableCell>{p.installment_number}/{p.installment_total}</TableCell>
                        <TableCell><Badge variant="secondary" className={payStatusConfig[p.status]?.color}>{payStatusConfig[p.status]?.label}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Pagination total={filtered.length} page={page} setPage={setPage} />
              </>
            )}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="recorrentes" className="mt-3"><FinRecorrentes /></TabsContent>
      </Tabs>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Conta a Pagar</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Fornecedor *</Label>
              <Select value={payForm.supplier_id} onValueChange={v => {
                const sup = suppliers?.find((s: any) => s.id === v);
                setPayForm({ ...payForm, supplier_id: v, supplier: sup?.name || "" });
              }}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{suppliers?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Categoria</Label><Input value={payForm.category} onChange={e => setPayForm({ ...payForm, category: e.target.value })} /></div>
              <div><Label>Valor *</Label><Input type="number" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Vencimento *</Label><Input type="date" value={payForm.due_date} onChange={e => setPayForm({ ...payForm, due_date: e.target.value })} /></div>
              <div><Label>Forma Pgto</Label><Input value={payForm.payment_method} onChange={e => setPayForm({ ...payForm, payment_method: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
              <Button disabled={!payForm.supplier || !payForm.amount || !payForm.due_date} onClick={() => {
                createPayable.mutate({ supplier: payForm.supplier, category: payForm.category, amount: Number(payForm.amount), due_date: payForm.due_date, payment_method: payForm.payment_method, supplier_id: payForm.supplier_id || null } as any, { onSuccess: () => setShowNew(false) });
              }}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Recurring Expenses Section ──
function FinRecorrentes() {
  const { data, isLoading } = useRecurringExpenses();
  return (
    <Card><CardContent className="p-0">
      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
        <Table>
          <TableHeader><TableRow>
            <TableHead>Descrição</TableHead><TableHead>Valor</TableHead><TableHead>Frequência</TableHead><TableHead>Dia</TableHead><TableHead>Status</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {data?.map((r: any) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.description}</TableCell>
                <TableCell>{fmt(Number(r.amount))}</TableCell>
                <TableCell className="capitalize">{r.frequency}</TableCell>
                <TableCell>{r.day_of_month}</TableCell>
                <TableCell><Badge variant="secondary" className={r.active ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}>{r.active ? "Ativa" : "Inativa"}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </CardContent></Card>
  );
}

// ── Accounts Receivable Section ──
function FinContasReceber() {
  const { data: receivables, isLoading } = useAccountsReceivable();
  const createReceivable = useCreateAccountReceivable();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [showNew, setShowNew] = useState(false);
  const [recForm, setRecForm] = useState({ source: "particular", amount: "", due_date: "" });

  const filtered = useMemo(() => {
    if (!receivables) return [];
    return receivables.filter(r => statusFilter === "todos" || r.status === statusFilter);
  }, [receivables, statusFilter]);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Contas a Receber</h2>
        <Button onClick={() => setShowNew(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Novo Recebível</Button>
      </div>
      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="em_aberto">Em Aberto</SelectItem>
            <SelectItem value="recebido">Recebido</SelectItem>
            <SelectItem value="atrasado">Atrasado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card><CardContent className="p-0">
        {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
          <>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Paciente/Cliente</TableHead><TableHead>Origem</TableHead><TableHead>Valor</TableHead><TableHead>Vencimento</TableHead><TableHead>Parcela</TableHead><TableHead>Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {paginated.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.patients?.full_name || "—"}</TableCell>
                    <TableCell className="capitalize">{r.source}</TableCell>
                    <TableCell>{fmt(Number(r.amount))}</TableCell>
                    <TableCell>{format(parseISO(r.due_date), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{r.installment_number}/{r.installment_total}</TableCell>
                    <TableCell><Badge variant="secondary" className={recStatusConfig[r.status]?.color}>{recStatusConfig[r.status]?.label}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination total={filtered.length} page={page} setPage={setPage} />
          </>
        )}
      </CardContent></Card>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Recebível</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Origem</Label>
                <Select value={recForm.source} onValueChange={v => setRecForm({ ...recForm, source: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="particular">Particular</SelectItem>
                    <SelectItem value="convenio">Convênio</SelectItem>
                    <SelectItem value="sus">SUS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Valor *</Label><Input type="number" value={recForm.amount} onChange={e => setRecForm({ ...recForm, amount: e.target.value })} /></div>
            </div>
            <div><Label>Vencimento *</Label><Input type="date" value={recForm.due_date} onChange={e => setRecForm({ ...recForm, due_date: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
              <Button disabled={!recForm.amount || !recForm.due_date} onClick={() => {
                createReceivable.mutate({ source: recForm.source, amount: Number(recForm.amount), due_date: recForm.due_date } as any, { onSuccess: () => setShowNew(false) });
              }}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Cash Flow Section ──
function FinFluxoCaixa() {
  const { data: movements, isLoading } = useCashMovements();
  const { data: banks } = useBanks();
  const [page, setPage] = useState(1);
  const paginated = movements?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) || [];

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Fluxo de Caixa</h2>
      {banks && banks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {banks.map((b: any) => (
            <Card key={b.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{b.bank_name}</p>
                    <p className="text-xs text-muted-foreground">{b.agency} / {b.account_number || "Caixa"}</p>
                  </div>
                </div>
                <p className="text-lg font-bold mt-2">{fmt(Number(b.current_balance))}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Card><CardContent className="p-0">
        {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
          <>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Data</TableHead><TableHead>Tipo</TableHead><TableHead>Descrição</TableHead><TableHead>Categoria</TableHead><TableHead>Valor</TableHead><TableHead>Conciliado</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {paginated.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell>{format(parseISO(m.movement_date), "dd/MM/yyyy")}</TableCell>
                    <TableCell><Badge variant="secondary" className={m.movement_type === "entrada" ? "bg-emerald-500/10 text-emerald-700" : "bg-red-500/10 text-red-700"}>{m.movement_type === "entrada" ? "Entrada" : "Saída"}</Badge></TableCell>
                    <TableCell className="font-medium">{m.description}</TableCell>
                    <TableCell>{m.category || "—"}</TableCell>
                    <TableCell className={m.movement_type === "entrada" ? "text-emerald-600" : "text-red-600"}>{m.movement_type === "entrada" ? "+" : "-"}{fmt(Number(m.amount))}</TableCell>
                    <TableCell>{m.reconciled ? "✓" : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination total={movements?.length || 0} page={page} setPage={setPage} />
          </>
        )}
      </CardContent></Card>
    </div>
  );
}

// ── Movements Section ──
function FinMovimentos() {
  const { data: movements, isLoading } = useCashMovements();
  const { data: reconciliations } = useReconciliations();
  const [subTab, setSubTab] = useState("geral");

  return (
    <div className="space-y-3">
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList>
          <TabsTrigger value="geral">Movimentação Geral</TabsTrigger>
          <TabsTrigger value="conciliacao">Conciliação Bancária</TabsTrigger>
          <TabsTrigger value="caixa">Abertura/Encerramento</TabsTrigger>
        </TabsList>
        <TabsContent value="geral" className="mt-3">
          <Card><CardContent className="p-0">
            {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Data</TableHead><TableHead>Tipo</TableHead><TableHead>Descrição</TableHead><TableHead>Valor</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {movements?.slice(0, 30).map((m: any) => (
                    <TableRow key={m.id}>
                      <TableCell>{format(parseISO(m.movement_date), "dd/MM/yyyy")}</TableCell>
                      <TableCell><Badge variant="secondary" className={m.movement_type === "entrada" ? "bg-emerald-500/10 text-emerald-700" : "bg-red-500/10 text-red-700"}>{m.movement_type === "entrada" ? "Entrada" : "Saída"}</Badge></TableCell>
                      <TableCell>{m.description}</TableCell>
                      <TableCell>{fmt(Number(m.amount))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="conciliacao" className="mt-3">
          <Card><CardContent className="p-6 text-center text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="font-medium">Conciliação Bancária</p>
            <p className="text-sm">Importe extratos bancários (CSV) e reconcilie com as movimentações registradas.</p>
            <Button className="mt-4" variant="outline">Importar Extrato</Button>
          </CardContent></Card>
          {reconciliations && reconciliations.length > 0 && (
            <Card className="mt-3"><CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Banco</TableHead><TableHead>Período</TableHead><TableHead>Conciliados</TableHead><TableHead>Pendentes</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>{reconciliations.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.bank_id?.substring(0, 8)}</TableCell>
                    <TableCell>{r.period_start} a {r.period_end}</TableCell>
                    <TableCell>{r.matched_count}</TableCell><TableCell>{r.unmatched_count}</TableCell>
                    <TableCell><Badge variant="secondary">{r.status}</Badge></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            </CardContent></Card>
          )}
        </TabsContent>
        <TabsContent value="caixa" className="mt-3">
          <Card><CardContent className="p-6 text-center text-muted-foreground">
            <Receipt className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="font-medium">Abertura / Encerramento de Caixa</p>
            <p className="text-sm">Controle de abertura e fechamento diário de caixa com conferência de valores.</p>
            <div className="flex gap-2 justify-center mt-4">
              <Button variant="outline">Abrir Caixa</Button>
              <Button variant="outline">Encerrar Caixa</Button>
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Results Section ──
function FinResultados() {
  const { data: payables } = useAccountsPayable();
  const { data: receivables } = useAccountsReceivable();

  const totalReceitas = receivables?.filter(r => r.status === "recebido").reduce((s, r) => s + Number(r.amount), 0) || 0;
  const totalDespesas = payables?.filter(p => p.status === "pago").reduce((s, p) => s + Number(p.amount), 0) || 0;
  const resultado = totalReceitas - totalDespesas;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Resultados Financeiros</h2>
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Receitas</p><p className="text-xl font-bold text-emerald-600">{fmt(totalReceitas)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Despesas</p><p className="text-xl font-bold text-red-600">{fmt(totalDespesas)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Resultado</p><p className={`text-xl font-bold ${resultado >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmt(resultado)}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">DRE Simplificado</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow><TableCell className="font-bold">RECEITA OPERACIONAL BRUTA</TableCell><TableCell className="text-right font-bold text-emerald-600">{fmt(totalReceitas)}</TableCell></TableRow>
              <TableRow><TableCell className="pl-6">Consultas e Atendimentos</TableCell><TableCell className="text-right">{fmt(totalReceitas * 0.4)}</TableCell></TableRow>
              <TableRow><TableCell className="pl-6">Exames e Procedimentos</TableCell><TableCell className="text-right">{fmt(totalReceitas * 0.35)}</TableCell></TableRow>
              <TableRow><TableCell className="pl-6">Convênios</TableCell><TableCell className="text-right">{fmt(totalReceitas * 0.25)}</TableCell></TableRow>
              <TableRow><TableCell className="font-bold">(-) DESPESAS OPERACIONAIS</TableCell><TableCell className="text-right font-bold text-red-600">{fmt(totalDespesas)}</TableCell></TableRow>
              <TableRow><TableCell className="pl-6">Pessoal</TableCell><TableCell className="text-right">{fmt(totalDespesas * 0.45)}</TableCell></TableRow>
              <TableRow><TableCell className="pl-6">Materiais e Medicamentos</TableCell><TableCell className="text-right">{fmt(totalDespesas * 0.25)}</TableCell></TableRow>
              <TableRow><TableCell className="pl-6">Serviços Terceirizados</TableCell><TableCell className="text-right">{fmt(totalDespesas * 0.15)}</TableCell></TableRow>
              <TableRow><TableCell className="pl-6">Administrativo</TableCell><TableCell className="text-right">{fmt(totalDespesas * 0.15)}</TableCell></TableRow>
              <TableRow className="border-t-2"><TableCell className="font-bold text-lg">RESULTADO DO PERÍODO</TableCell><TableCell className={`text-right font-bold text-lg ${resultado >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmt(resultado)}</TableCell></TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Base Data Section ──
function FinDadosBase() {
  const { data: accounts } = useChartOfAccounts();
  const { data: banks } = useBanks();
  const { data: payMethods } = usePaymentMethods();
  const { data: docTypes } = useDocumentTypes();
  const { data: classifications } = useClassifications();
  const { data: costCenters } = useCostCenters();
  const { data: ccGroups } = useCostCenterGroups();
  const { data: companies } = useCompanies();
  const { data: companyGroups } = useCompanyGroups();

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Dados Base</h2>
      <Accordion type="multiple" className="space-y-2">
        <AccordionItem value="plano" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium">Plano de Contas ({accounts?.length || 0})</AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader><TableRow><TableHead>Código</TableHead><TableHead>Nome</TableHead><TableHead>Tipo</TableHead><TableHead>Nível</TableHead><TableHead>Sintética</TableHead></TableRow></TableHeader>
              <TableBody>
                {accounts?.map((a: any) => (
                  <TableRow key={a.id} className={a.is_synthetic ? "font-semibold" : ""}>
                    <TableCell>{a.code}</TableCell><TableCell style={{ paddingLeft: `${(a.level - 1) * 16 + 16}px` }}>{a.name}</TableCell>
                    <TableCell className="capitalize">{a.account_type}</TableCell><TableCell>{a.level}</TableCell><TableCell>{a.is_synthetic ? "Sim" : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="bancos" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium">Bancos e Contas ({banks?.length || 0})</AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader><TableRow><TableHead>Banco</TableHead><TableHead>Agência</TableHead><TableHead>Conta</TableHead><TableHead>Tipo</TableHead><TableHead>Saldo</TableHead></TableRow></TableHeader>
              <TableBody>
                {banks?.map((b: any) => (
                  <TableRow key={b.id}><TableCell>{b.bank_name}</TableCell><TableCell>{b.agency || "—"}</TableCell><TableCell>{b.account_number || "—"}</TableCell><TableCell className="capitalize">{b.account_type}</TableCell><TableCell>{fmt(Number(b.current_balance))}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pagamento" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium">Formas de Pagamento ({payMethods?.length || 0})</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2">{payMethods?.map((p: any) => <Badge key={p.id} variant="secondary">{p.name}</Badge>)}</div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="documentos" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium">Tipos de Documento ({docTypes?.length || 0})</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2">{docTypes?.map((d: any) => <Badge key={d.id} variant="secondary">{d.name}</Badge>)}</div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="classificacoes" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium">Classificações ({classifications?.length || 0})</AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Tipo</TableHead></TableRow></TableHeader>
              <TableBody>{classifications?.map((c: any) => <TableRow key={c.id}><TableCell>{c.name}</TableCell><TableCell className="capitalize">{c.classification_type}</TableCell></TableRow>)}</TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="centros" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium">Centros de Custo ({costCenters?.length || 0})</AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader><TableRow><TableHead>Código</TableHead><TableHead>Nome</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>{costCenters?.map((c: any) => <TableRow key={c.id}><TableCell>{c.code}</TableCell><TableCell>{c.name}</TableCell><TableCell>{c.active ? "Ativo" : "Inativo"}</TableCell></TableRow>)}</TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="empresas" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium">Empresas ({companies?.length || 0})</AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader><TableRow><TableHead>Razão Social</TableHead><TableHead>Nome Fantasia</TableHead><TableHead>CNPJ</TableHead><TableHead>Matriz</TableHead></TableRow></TableHeader>
              <TableBody>{companies?.map((c: any) => <TableRow key={c.id}><TableCell>{c.name}</TableCell><TableCell>{c.trade_name || "—"}</TableCell><TableCell>{c.cnpj || "—"}</TableCell><TableCell>{c.is_matrix ? "Sim" : "—"}</TableCell></TableRow>)}</TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// ── Main Page ──
export default function Financeiro() {
  const navigate = useNavigate();
  const [section, setSection] = useState("dashboard");
  const { data: payables = [] } = useAccountsPayable();
  const { data: receivables = [] } = useAccountsReceivable();
  const { data: movements = [] } = useCashMovements();

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Financeiro</h1>
          <p className="text-sm text-muted-foreground">Gestão financeira completa</p>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Sidebar */}
        <div className="w-48 shrink-0 space-y-1">
          {sidebarItems.map(item => (
            <button
              key={item.key}
              onClick={() => setSection(item.key)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                section === item.key
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {section === "dashboard" && <FinDashboard payables={payables} receivables={receivables} movements={movements} />}
          {section === "fluxo" && <FinFluxoCaixa />}
          {section === "fornecedores" && <FinSuppliers />}
          {section === "clientes" && <FinCustomers />}
          {section === "pagar" && <FinContasPagar />}
          {section === "receber" && <FinContasReceber />}
          {section === "movimentos" && <FinMovimentos />}
          {section === "resultados" && <FinResultados />}
          {section === "dados" && <FinDadosBase />}
        </div>
      </div>
    </div>
  );
}
