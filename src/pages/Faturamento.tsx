import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBillingAccounts, useUpdateBillingAccount } from "@/hooks/useBilling";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, ArrowLeft, Search, Loader2, CheckCircle2, Send, FileDown, AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";

const statusConfig: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-700" },
  conferido: { label: "Conferido", color: "bg-blue-500/10 text-blue-700" },
  liberado: { label: "Liberado", color: "bg-emerald-500/10 text-emerald-700" },
  enviado: { label: "Enviado", color: "bg-primary/10 text-primary" },
  glosado: { label: "Glosado", color: "bg-destructive/10 text-destructive" },
};

export default function Faturamento() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("conferencia");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const { data: accounts, isLoading } = useBillingAccounts({ status: statusFilter });
  const updateBilling = useUpdateBillingAccount();

  const filtered = accounts?.filter((a) =>
    a.patients?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.insurance_name?.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const total = accounts?.reduce((s, a) => s + Number(a.amount), 0) || 0;
  const pending = accounts?.filter((a) => a.status === "pendente").length || 0;

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Faturamento</h1>
            <p className="text-sm text-muted-foreground">Conferência e envio de contas</p>
          </div>
        </div>
        <Button variant="outline" className="gap-1.5" onClick={() => navigate("/gerenciamento/faturamento/protocolo")}>
          <CreditCard className="h-4 w-4" /> Protocolo e Envio
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><p className="text-lg font-bold">{accounts?.length || 0}</p><p className="text-xs text-muted-foreground">Total de Contas</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-lg font-bold text-yellow-600">{pending}</p><p className="text-xs text-muted-foreground">Pendentes</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-lg font-bold text-primary">{fmt(total)}</p><p className="text-xs text-muted-foreground">Valor Total</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-lg font-bold text-destructive">{accounts?.filter((a) => a.status === "glosado").length || 0}</p><p className="text-xs text-muted-foreground">Glosados</p></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="conferencia">Conferência</TabsTrigger>
          <TabsTrigger value="envio">Envio</TabsTrigger>
          <TabsTrigger value="xml">Exportação XML</TabsTrigger>
          <TabsTrigger value="sus">Conferência SUS</TabsTrigger>
        </TabsList>

        <TabsContent value="conferencia" className="space-y-3 mt-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar paciente ou convênio..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Card><CardContent className="p-0">
            {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Paciente</TableHead><TableHead>Convênio</TableHead><TableHead>Competência</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead><TableHead>Ações</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered?.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.patients?.full_name || "—"}</TableCell>
                      <TableCell>{a.insurance_name || "—"}</TableCell>
                      <TableCell>{a.competence || "—"}</TableCell>
                      <TableCell>{fmt(Number(a.amount))}</TableCell>
                      <TableCell><Badge variant="secondary" className={statusConfig[a.status]?.color}>{statusConfig[a.status]?.label}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {a.status === "pendente" && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => updateBilling.mutate({ id: a.id, status: "conferido" })}>
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Conferir
                            </Button>
                          )}
                          {a.status === "conferido" && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => updateBilling.mutate({ id: a.id, status: "liberado" })}>
                              Liberar
                            </Button>
                          )}
                          {a.status === "liberado" && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => updateBilling.mutate({ id: a.id, status: "enviado", sent_at: new Date().toISOString() })}>
                              <Send className="h-3 w-3 mr-1" /> Enviar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="envio" className="mt-4">
          <Card><CardContent className="p-8 text-center">
            <Send className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Envio de Faturamento</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Selecione contas conferidas para envio ao convênio</p>
            <p className="text-sm">{accounts?.filter((a) => a.status === "liberado").length || 0} contas prontas para envio</p>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="xml" className="mt-4">
          <Card><CardContent className="p-8 text-center">
            <FileDown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Exportação XML</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Exporte contas em formato XML para envio</p>
            <Button variant="outline" className="gap-1.5"><FileDown className="h-4 w-4" /> Exportar XML</Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="sus" className="mt-4">
          <Card><CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold">Conferência SUS</h3>
            <p className="text-sm text-muted-foreground mt-1">Contas SUS para conferência e exportação BPA/AIH</p>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
