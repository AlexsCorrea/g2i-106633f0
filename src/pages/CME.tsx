import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft, Package, FlaskConical, Thermometer, Archive, Truck, RotateCcw,
  AlertTriangle, Plus, Search, Shield, ClipboardList, Settings, BarChart3,
  CheckCircle2, XCircle, Clock, Activity, Box, Wrench, FileText, GitBranch,
  Stethoscope, PieChart
} from "lucide-react";
import {
  useCmeDashboardStats, useCmeMateriais, useCmeKits, useCmeRecebimentos,
  useCmeCargas, useCmeArmazenamento, useCmeDistribuicoes, useCmeNaoConformidades,
  useCmeEquipamentos, useCmeTestes,
  useCreateCmeMaterial, useCreateCmeKit, useCreateCmeRecebimento,
  useCreateCmeCarga, useUpdateCmeCarga, useCreateCmeNaoConformidade, useCreateCmeEquipamento,
  useCreateCmeDistribuicao, useUpdateCmeRecebimento, useCreateCmeTeste, useCreateCmeArmazenamento
} from "@/hooks/useCME";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";

const statusColors: Record<string, string> = {
  recebido_expurgo: "bg-red-100 text-red-800",
  em_triagem: "bg-orange-100 text-orange-800",
  em_limpeza_manual: "bg-yellow-100 text-yellow-800",
  em_limpeza_automatizada: "bg-yellow-100 text-yellow-800",
  aguardando_preparo: "bg-blue-100 text-blue-800",
  em_preparo: "bg-indigo-100 text-indigo-800",
  em_esterilizacao: "bg-purple-100 text-purple-800",
  em_quarentena: "bg-gray-100 text-gray-800",
  liberado: "bg-green-100 text-green-800",
  distribuido: "bg-emerald-100 text-emerald-800",
  reprocessar: "bg-red-100 text-red-700",
  nao_conforme: "bg-red-200 text-red-900",
  em_andamento: "bg-blue-100 text-blue-800",
  aprovado: "bg-green-100 text-green-800",
  reprovado: "bg-red-100 text-red-800",
  disponivel: "bg-green-100 text-green-800",
  reservado: "bg-yellow-100 text-yellow-800",
  aberta: "bg-red-100 text-red-800",
  resolvida: "bg-green-100 text-green-800",
  separado: "bg-yellow-100 text-yellow-800",
  entregue: "bg-green-100 text-green-800",
  ativo: "bg-green-100 text-green-800",
  inativo: "bg-gray-100 text-gray-600",
  pendente: "bg-yellow-100 text-yellow-800",
  conforme: "bg-green-100 text-green-800",
  nao_conforme_teste: "bg-red-100 text-red-800",
};

const statusLabel: Record<string, string> = {
  recebido_expurgo: "Recebido Expurgo", em_triagem: "Em Triagem",
  em_limpeza_manual: "Limpeza Manual", em_limpeza_automatizada: "Limpeza Automática",
  aguardando_preparo: "Aguardando Preparo", em_preparo: "Em Preparo",
  em_esterilizacao: "Em Esterilização", em_quarentena: "Quarentena",
  liberado: "Liberado", distribuido: "Distribuído", reprocessar: "Reprocessar",
  nao_conforme: "Não Conforme", em_andamento: "Em Andamento",
  aprovado: "Aprovado", reprovado: "Reprovado", disponivel: "Disponível",
  reservado: "Reservado", aberta: "Aberta", resolvida: "Resolvida",
  separado: "Separado", entregue: "Entregue", pendente: "Pendente", conforme: "Conforme",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={`${statusColors[status] || "bg-muted text-muted-foreground"} border-0`}>
      {statusLabel[status] || status}
    </Badge>
  );
}

function formatDate(d: string | null) {
  if (!d) return "—";
  try { return format(new Date(d), "dd/MM/yy HH:mm", { locale: ptBR }); } catch { return d; }
}

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#f97316"];

export default function CME() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [search, setSearch] = useState("");

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-purple-100 flex items-center justify-center">
              <FlaskConical className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Central de Material Esterilizado</h1>
              <p className="text-xs text-muted-foreground">Controle operacional e rastreabilidade</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar lote, material, kit..." className="pl-8 w-64" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="dashboard" className="gap-1"><BarChart3 className="h-3.5 w-3.5" />Painel</TabsTrigger>
            <TabsTrigger value="materiais" className="gap-1"><Box className="h-3.5 w-3.5" />Materiais</TabsTrigger>
            <TabsTrigger value="kits" className="gap-1"><Package className="h-3.5 w-3.5" />Kits</TabsTrigger>
            <TabsTrigger value="expurgo" className="gap-1"><ClipboardList className="h-3.5 w-3.5" />Expurgo</TabsTrigger>
            <TabsTrigger value="esterilizacao" className="gap-1"><Thermometer className="h-3.5 w-3.5" />Esterilização</TabsTrigger>
            <TabsTrigger value="qualidade" className="gap-1"><Shield className="h-3.5 w-3.5" />Qualidade</TabsTrigger>
            <TabsTrigger value="armazenamento" className="gap-1"><Archive className="h-3.5 w-3.5" />Armazenamento</TabsTrigger>
            <TabsTrigger value="distribuicao" className="gap-1"><Truck className="h-3.5 w-3.5" />Distribuição</TabsTrigger>
            <TabsTrigger value="equipamentos" className="gap-1"><Settings className="h-3.5 w-3.5" />Equipamentos</TabsTrigger>
            <TabsTrigger value="naoconformidade" className="gap-1"><AlertTriangle className="h-3.5 w-3.5" />NC</TabsTrigger>
            <TabsTrigger value="rastreabilidade" className="gap-1"><GitBranch className="h-3.5 w-3.5" />Rastreabilidade</TabsTrigger>
            <TabsTrigger value="requisicoes" className="gap-1"><Stethoscope className="h-3.5 w-3.5" />Requisições CC</TabsTrigger>
            <TabsTrigger value="relatorios" className="gap-1"><PieChart className="h-3.5 w-3.5" />Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><DashboardTab /></TabsContent>
          <TabsContent value="materiais"><MateriaisTab search={search} /></TabsContent>
          <TabsContent value="kits"><KitsTab search={search} /></TabsContent>
          <TabsContent value="expurgo"><ExpurgoTab search={search} /></TabsContent>
          <TabsContent value="esterilizacao"><EsterilizacaoTab search={search} /></TabsContent>
          <TabsContent value="qualidade"><QualidadeTab /></TabsContent>
          <TabsContent value="armazenamento"><ArmazenamentoTab search={search} /></TabsContent>
          <TabsContent value="distribuicao"><DistribuicaoTab search={search} /></TabsContent>
          <TabsContent value="equipamentos"><EquipamentosTab search={search} /></TabsContent>
          <TabsContent value="naoconformidade"><NaoConformidadeTab /></TabsContent>
          <TabsContent value="rastreabilidade"><RastreabilidadeTab search={search} /></TabsContent>
          <TabsContent value="requisicoes"><RequisicoesCCTab /></TabsContent>
          <TabsContent value="relatorios"><RelatoriosTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// =================== DASHBOARD ===================
function DashboardTab() {
  const { data: stats, isLoading } = useCmeDashboardStats();
  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Carregando...</div>;
  const s = stats || {} as any;

  const cards = [
    { label: "Recebidos Hoje", value: s.recebidosHoje, icon: ClipboardList, color: "text-blue-600 bg-blue-50" },
    { label: "Em Limpeza", value: s.emLimpeza, icon: RotateCcw, color: "text-yellow-600 bg-yellow-50" },
    { label: "Em Preparo", value: s.emPreparo, icon: Package, color: "text-indigo-600 bg-indigo-50" },
    { label: "Em Esterilização", value: s.emEsterilizacao, icon: Thermometer, color: "text-purple-600 bg-purple-50" },
    { label: "Liberados Hoje", value: s.liberadosHoje, icon: CheckCircle2, color: "text-green-600 bg-green-50" },
    { label: "Distribuídos Hoje", value: s.distribuidosHoje, icon: Truck, color: "text-emerald-600 bg-emerald-50" },
    { label: "Vencendo (7d)", value: s.vencendo, icon: Clock, color: s.vencendo > 0 ? "text-red-600 bg-red-50" : "text-gray-600 bg-gray-50" },
    { label: "NC Abertas", value: s.naoConformidades, icon: AlertTriangle, color: s.naoConformidades > 0 ? "text-red-600 bg-red-50" : "text-gray-600 bg-gray-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{c.value ?? 0}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Resumo Geral</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Total Materiais Processados</span><span className="font-semibold">{s.totalMateriais}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total Cargas</span><span className="font-semibold">{s.totalCargas}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Materiais Armazenados</span><span className="font-semibold">{s.totalArmazenados}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Fluxo Operacional</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs flex-wrap">
              {["Expurgo", "Limpeza", "Preparo", "Esterilização", "Armazenamento", "Distribuição"].map((step, i) => (
                <React.Fragment key={step}>
                  <span className="px-2 py-1 rounded bg-primary/10 text-primary font-medium">{step}</span>
                  {i < 5 && <span className="text-muted-foreground">→</span>}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Alertas</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {s.vencendo > 0 && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <Clock className="h-4 w-4" />{s.vencendo} materiais vencendo em 7 dias
              </div>
            )}
            {s.naoConformidades > 0 && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertTriangle className="h-4 w-4" />{s.naoConformidades} não conformidades abertas
              </div>
            )}
            {s.vencendo === 0 && s.naoConformidades === 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />Nenhum alerta no momento
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// =================== MATERIAIS ===================
function MateriaisTab({ search }: { search: string }) {
  const { data: materiais, isLoading } = useCmeMateriais();
  const createMaterial = useCreateCmeMaterial();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ codigo: "", nome: "", descricao: "", tipo: "instrumental", categoria: "", especialidade: "", criticidade: "semi_critico", metodo_esterilizacao: "vapor" });

  const filtered = (materiais || []).filter((m: any) =>
    !search || m.nome?.toLowerCase().includes(search.toLowerCase()) || m.codigo?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.codigo || !form.nome) return;
    createMaterial.mutate(form, { onSuccess: () => { setOpen(false); setForm({ codigo: "", nome: "", descricao: "", tipo: "instrumental", categoria: "", especialidade: "", criticidade: "semi_critico", metodo_esterilizacao: "vapor" }); } });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Cadastro de Materiais e Instrumentais</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-1"><Plus className="h-4 w-4" />Novo Material</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Novo Material</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Código *" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
              <Input placeholder="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="instrumental">Instrumental</SelectItem>
                  <SelectItem value="caixa_cirurgica">Caixa Cirúrgica</SelectItem>
                  <SelectItem value="bandeja">Bandeja</SelectItem>
                  <SelectItem value="material_reutilizavel">Material Reutilizável</SelectItem>
                  <SelectItem value="consignado">Consignado</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Categoria" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
              <Input placeholder="Especialidade" value={form.especialidade} onChange={(e) => setForm({ ...form, especialidade: e.target.value })} />
              <Select value={form.criticidade} onValueChange={(v) => setForm({ ...form, criticidade: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critico">Crítico</SelectItem>
                  <SelectItem value="semi_critico">Semi-crítico</SelectItem>
                  <SelectItem value="nao_critico">Não-crítico</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.metodo_esterilizacao} onValueChange={(v) => setForm({ ...form, metodo_esterilizacao: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vapor">Vapor (Autoclave)</SelectItem>
                  <SelectItem value="oxido_etileno">Óxido de Etileno</SelectItem>
                  <SelectItem value="plasma">Plasma H2O2</SelectItem>
                  <SelectItem value="formaldeido">Formaldeído</SelectItem>
                </SelectContent>
              </Select>
              <Textarea placeholder="Descrição" className="col-span-2" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </div>
            <Button onClick={handleSave} disabled={createMaterial.isPending} className="w-full mt-2">Salvar Material</Button>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead><TableHead>Nome</TableHead><TableHead>Tipo</TableHead>
                <TableHead>Criticidade</TableHead><TableHead>Esterilização</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum material cadastrado</TableCell></TableRow>
              ) : filtered.map((m: any) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs">{m.codigo}</TableCell>
                  <TableCell className="font-medium">{m.nome}</TableCell>
                  <TableCell className="capitalize">{m.tipo?.replace(/_/g, " ")}</TableCell>
                  <TableCell><StatusBadge status={m.criticidade} /></TableCell>
                  <TableCell className="capitalize">{m.metodo_esterilizacao?.replace(/_/g, " ")}</TableCell>
                  <TableCell><StatusBadge status={m.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

// =================== KITS ===================
function KitsTab({ search }: { search: string }) {
  const { data: kits, isLoading } = useCmeKits();
  const createKit = useCreateCmeKit();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", codigo: "", especialidade: "", tipo_embalagem: "grau_cirurgico", metodo_esterilizacao: "vapor", instrucoes_montagem: "" });

  const filtered = (kits || []).filter((k: any) => !search || k.nome?.toLowerCase().includes(search.toLowerCase()));

  const handleSave = () => {
    if (!form.nome) return;
    createKit.mutate(form, { onSuccess: () => { setOpen(false); setForm({ nome: "", codigo: "", especialidade: "", tipo_embalagem: "grau_cirurgico", metodo_esterilizacao: "vapor", instrucoes_montagem: "" }); } });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Kits e Caixas Cirúrgicas</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-1"><Plus className="h-4 w-4" />Novo Kit</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Kit</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Código" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
              <Input placeholder="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              <Input placeholder="Especialidade" value={form.especialidade} onChange={(e) => setForm({ ...form, especialidade: e.target.value })} />
              <Select value={form.metodo_esterilizacao} onValueChange={(v) => setForm({ ...form, metodo_esterilizacao: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vapor">Vapor</SelectItem>
                  <SelectItem value="plasma">Plasma H2O2</SelectItem>
                  <SelectItem value="oxido_etileno">Óxido de Etileno</SelectItem>
                </SelectContent>
              </Select>
              <Textarea placeholder="Instruções de montagem" className="col-span-2" value={form.instrucoes_montagem} onChange={(e) => setForm({ ...form, instrucoes_montagem: e.target.value })} />
            </div>
            <Button onClick={handleSave} disabled={createKit.isPending} className="w-full mt-2">Salvar Kit</Button>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead><TableHead>Nome</TableHead><TableHead>Especialidade</TableHead>
                <TableHead>Esterilização</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum kit cadastrado</TableCell></TableRow>
              ) : filtered.map((k: any) => (
                <TableRow key={k.id}>
                  <TableCell className="font-mono text-xs">{k.codigo || "—"}</TableCell>
                  <TableCell className="font-medium">{k.nome}</TableCell>
                  <TableCell>{k.especialidade || "—"}</TableCell>
                  <TableCell className="capitalize">{k.metodo_esterilizacao?.replace(/_/g, " ")}</TableCell>
                  <TableCell><StatusBadge status={k.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

// =================== EXPURGO / RECEBIMENTO ===================
function ExpurgoTab({ search }: { search: string }) {
  const { data: recebimentos, isLoading } = useCmeRecebimentos();
  const { data: kits } = useCmeKits();
  const createRecebimento = useCreateCmeRecebimento();
  const updateRecebimento = useUpdateCmeRecebimento();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ setor_origem: "", tipo_material: "kit", kit_id: "", quantidade: 1, prioridade: "normal", situacao_sujidade: "contaminado", observacoes: "" });

  const filtered = (recebimentos || []).filter((r: any) =>
    !search || r.setor_origem?.toLowerCase().includes(search.toLowerCase()) || r.tipo_material?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.setor_origem) return;
    const payload: any = { ...form, recebido_por: user?.id };
    if (!payload.kit_id) delete payload.kit_id;
    createRecebimento.mutate(payload, { onSuccess: () => { setOpen(false); } });
  };

  const advanceStatus = (id: string, currentStatus: string) => {
    const flow: Record<string, string> = {
      recebido_expurgo: "em_triagem", em_triagem: "em_limpeza_manual",
      em_limpeza_manual: "aguardando_preparo", em_limpeza_automatizada: "aguardando_preparo",
      aguardando_preparo: "em_preparo", em_preparo: "liberado",
    };
    const next = flow[currentStatus];
    if (next) updateRecebimento.mutate({ id, status: next });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Recepção de Material / Expurgo</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-1"><Plus className="h-4 w-4" />Receber Material</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Receber Material Contaminado</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.setor_origem} onValueChange={(v) => setForm({ ...form, setor_origem: v })}>
                <SelectTrigger><SelectValue placeholder="Setor de Origem *" /></SelectTrigger>
                <SelectContent>
                  {["Centro Cirúrgico", "UTI", "Internação", "Ambulatório", "Pronto Atendimento", "Hemodinâmica"].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={form.tipo_material} onValueChange={(v) => setForm({ ...form, tipo_material: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kit">Kit/Caixa</SelectItem>
                  <SelectItem value="instrumental">Instrumental Avulso</SelectItem>
                  <SelectItem value="bandeja">Bandeja</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                </SelectContent>
              </Select>
              {form.tipo_material === "kit" && kits && (
                <Select value={form.kit_id} onValueChange={(v) => setForm({ ...form, kit_id: v })}>
                  <SelectTrigger className="col-span-2"><SelectValue placeholder="Selecionar Kit" /></SelectTrigger>
                  <SelectContent>
                    {kits.map((k: any) => <SelectItem key={k.id} value={k.id}>{k.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <Select value={form.prioridade} onValueChange={(v) => setForm({ ...form, prioridade: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="emergencia">Emergência</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Qtd" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: parseInt(e.target.value) || 1 })} />
              <Textarea placeholder="Observações" className="col-span-2" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
            </div>
            <Button onClick={handleSave} disabled={createRecebimento.isPending} className="w-full mt-2">Registrar Recebimento</Button>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead><TableHead>Setor</TableHead><TableHead>Tipo</TableHead>
                <TableHead>Qtd</TableHead><TableHead>Prioridade</TableHead><TableHead>Status</TableHead><TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhum recebimento</TableCell></TableRow>
              ) : filtered.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs">{formatDate(r.data_recebimento)}</TableCell>
                  <TableCell>{r.setor_origem}</TableCell>
                  <TableCell className="capitalize">{r.tipo_material}</TableCell>
                  <TableCell>{r.quantidade}</TableCell>
                  <TableCell><Badge variant={r.prioridade === "urgente" || r.prioridade === "emergencia" ? "destructive" : "secondary"}>{r.prioridade}</Badge></TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                  <TableCell>
                    {!["liberado", "distribuido"].includes(r.status) && (
                      <Button size="sm" variant="outline" onClick={() => advanceStatus(r.id, r.status)}>Avançar</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

// =================== ESTERILIZAÇÃO ===================
function EsterilizacaoTab({ search }: { search: string }) {
  const { data: cargas, isLoading } = useCmeCargas();
  const { data: equipamentos } = useCmeEquipamentos();
  const createCarga = useCreateCmeCarga();
  const updateCarga = useUpdateCmeCarga();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ numero_carga: "", lote: "", equipamento_id: "", metodo: "vapor", temperatura: 134, pressao: 2.1, tempo_minutos: 30 });

  const filtered = (cargas || []).filter((c: any) =>
    !search || c.numero_carga?.toLowerCase().includes(search.toLowerCase()) || c.lote?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.numero_carga || !form.lote) return;
    const payload: any = { ...form, operador_id: user?.id };
    if (!payload.equipamento_id) delete payload.equipamento_id;
    createCarga.mutate(payload, { onSuccess: () => setOpen(false) });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Cargas de Esterilização</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-1"><Plus className="h-4 w-4" />Nova Carga</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Carga de Esterilização</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Nº Carga *" value={form.numero_carga} onChange={(e) => setForm({ ...form, numero_carga: e.target.value })} />
              <Input placeholder="Lote *" value={form.lote} onChange={(e) => setForm({ ...form, lote: e.target.value })} />
              {equipamentos && equipamentos.length > 0 && (
                <Select value={form.equipamento_id} onValueChange={(v) => setForm({ ...form, equipamento_id: v })}>
                  <SelectTrigger className="col-span-2"><SelectValue placeholder="Equipamento" /></SelectTrigger>
                  <SelectContent>
                    {equipamentos.map((eq: any) => <SelectItem key={eq.id} value={eq.id}>{eq.nome} - {eq.modelo || eq.tipo}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <Select value={form.metodo} onValueChange={(v) => setForm({ ...form, metodo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vapor">Vapor</SelectItem>
                  <SelectItem value="plasma">Plasma H2O2</SelectItem>
                  <SelectItem value="oxido_etileno">Óxido de Etileno</SelectItem>
                  <SelectItem value="formaldeido">Formaldeído</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Temp (°C)" value={form.temperatura} onChange={(e) => setForm({ ...form, temperatura: parseFloat(e.target.value) })} />
              <Input type="number" placeholder="Pressão (atm)" value={form.pressao} onChange={(e) => setForm({ ...form, pressao: parseFloat(e.target.value) })} />
              <Input type="number" placeholder="Tempo (min)" value={form.tempo_minutos} onChange={(e) => setForm({ ...form, tempo_minutos: parseInt(e.target.value) })} />
            </div>
            <Button onClick={handleSave} disabled={createCarga.isPending} className="w-full mt-2">Iniciar Carga</Button>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Carga</TableHead><TableHead>Lote</TableHead><TableHead>Método</TableHead>
                <TableHead>Temp</TableHead><TableHead>Tempo</TableHead><TableHead>Início</TableHead><TableHead>Resultado</TableHead><TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhuma carga</TableCell></TableRow>
              ) : filtered.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-semibold">{c.numero_carga}</TableCell>
                  <TableCell className="font-mono text-xs">{c.lote}</TableCell>
                  <TableCell className="capitalize">{c.metodo?.replace(/_/g, " ")}</TableCell>
                  <TableCell>{c.temperatura}°C</TableCell>
                  <TableCell>{c.tempo_minutos} min</TableCell>
                  <TableCell className="text-xs">{formatDate(c.data_inicio)}</TableCell>
                  <TableCell><StatusBadge status={c.resultado} /></TableCell>
                  <TableCell>
                    {c.resultado === "em_andamento" && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="text-green-600" onClick={() => updateCarga.mutate({ id: c.id, resultado: "aprovado", data_fim: new Date().toISOString(), data_liberacao: new Date().toISOString(), liberado_por: user?.id })}>
                          <CheckCircle2 className="h-3 w-3 mr-1" />Aprovar
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => updateCarga.mutate({ id: c.id, resultado: "reprovado", data_fim: new Date().toISOString() })}>
                          <XCircle className="h-3 w-3 mr-1" />Reprovar
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

// =================== QUALIDADE ===================
function QualidadeTab() {
  const { data: testes, isLoading } = useCmeTestes();
  const { data: cargas } = useCmeCargas();
  const createTeste = useCreateCmeTeste();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tipo_teste: "biologico", carga_id: "", resultado: "pendente", lote_indicador: "", observacoes: "" });

  const handleSave = () => {
    const payload: any = { ...form, responsavel_id: user?.id };
    if (!payload.carga_id) delete payload.carga_id;
    createTeste.mutate(payload, { onSuccess: () => setOpen(false) });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Controle de Qualidade</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-1"><Plus className="h-4 w-4" />Novo Teste</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Teste de Qualidade</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.tipo_teste} onValueChange={(v) => setForm({ ...form, tipo_teste: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="biologico">Indicador Biológico</SelectItem>
                  <SelectItem value="quimico">Indicador Químico</SelectItem>
                  <SelectItem value="bowie_dick">Bowie & Dick</SelectItem>
                  <SelectItem value="integrador">Integrador</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.resultado} onValueChange={(v) => setForm({ ...form, resultado: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="conforme">Conforme</SelectItem>
                  <SelectItem value="nao_conforme">Não Conforme</SelectItem>
                </SelectContent>
              </Select>
              {cargas && cargas.length > 0 && (
                <Select value={form.carga_id} onValueChange={(v) => setForm({ ...form, carga_id: v })}>
                  <SelectTrigger className="col-span-2"><SelectValue placeholder="Carga vinculada" /></SelectTrigger>
                  <SelectContent>
                    {cargas.map((c: any) => <SelectItem key={c.id} value={c.id}>Carga {c.numero_carga} - Lote {c.lote}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <Input placeholder="Lote do indicador" value={form.lote_indicador} onChange={(e) => setForm({ ...form, lote_indicador: e.target.value })} />
              <Textarea placeholder="Observações" className="col-span-2" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
            </div>
            <Button onClick={handleSave} disabled={createTeste.isPending} className="w-full mt-2">Registrar Teste</Button>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead><TableHead>Tipo</TableHead><TableHead>Lote Indicador</TableHead>
                <TableHead>Resultado</TableHead><TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(testes || []).length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum teste registrado</TableCell></TableRow>
              ) : (testes || []).map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className="text-xs">{formatDate(t.data_teste)}</TableCell>
                  <TableCell className="capitalize">{t.tipo_teste?.replace(/_/g, " ")}</TableCell>
                  <TableCell className="font-mono text-xs">{t.lote_indicador || "—"}</TableCell>
                  <TableCell><StatusBadge status={t.resultado} /></TableCell>
                  <TableCell><StatusBadge status={t.situacao} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

// =================== ARMAZENAMENTO ===================
function ArmazenamentoTab({ search }: { search: string }) {
  const { data: armaz, isLoading } = useCmeArmazenamento();
  const filtered = (armaz || []).filter((a: any) =>
    !search || a.lote?.toLowerCase().includes(search.toLowerCase()) || a.local_armazenamento?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Armazenamento e Validade</h2>
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lote</TableHead><TableHead>Local</TableHead><TableHead>Prateleira</TableHead>
                <TableHead>Esterilização</TableHead><TableHead>Validade</TableHead><TableHead>Qtd</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhum material armazenado</TableCell></TableRow>
              ) : filtered.map((a: any) => {
                const isExpiring = a.data_validade && new Date(a.data_validade) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                return (
                  <TableRow key={a.id} className={isExpiring ? "bg-red-50" : ""}>
                    <TableCell className="font-mono text-xs">{a.lote}</TableCell>
                    <TableCell>{a.local_armazenamento || "—"}</TableCell>
                    <TableCell>{a.prateleira || "—"}</TableCell>
                    <TableCell className="text-xs">{formatDate(a.data_esterilizacao)}</TableCell>
                    <TableCell className="text-xs">{formatDate(a.data_validade)} {isExpiring && <Badge variant="destructive" className="ml-1 text-[10px]">Vencendo</Badge>}</TableCell>
                    <TableCell>{a.quantidade}</TableCell>
                    <TableCell><StatusBadge status={a.status} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

// =================== DISTRIBUIÇÃO ===================
function DistribuicaoTab({ search }: { search: string }) {
  const { data: distrib, isLoading } = useCmeDistribuicoes();
  const createDistribuicao = useCreateCmeDistribuicao();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ setor_destino: "", profissional_solicitante: "", lote: "", quantidade: 1, finalidade: "" });

  const filtered = (distrib || []).filter((d: any) =>
    !search || d.setor_destino?.toLowerCase().includes(search.toLowerCase()) || d.lote?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.setor_destino || !form.lote) return;
    createDistribuicao.mutate({ ...form, entregue_por: user?.id }, { onSuccess: () => setOpen(false) });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Distribuição de Materiais</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-1"><Plus className="h-4 w-4" />Nova Distribuição</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Distribuir Material</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.setor_destino} onValueChange={(v) => setForm({ ...form, setor_destino: v })}>
                <SelectTrigger><SelectValue placeholder="Setor Destino *" /></SelectTrigger>
                <SelectContent>
                  {["Centro Cirúrgico", "UTI", "Internação", "Ambulatório", "Pronto Atendimento", "Hemodinâmica"].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Solicitante" value={form.profissional_solicitante} onChange={(e) => setForm({ ...form, profissional_solicitante: e.target.value })} />
              <Input placeholder="Lote *" value={form.lote} onChange={(e) => setForm({ ...form, lote: e.target.value })} />
              <Input type="number" placeholder="Qtd" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: parseInt(e.target.value) || 1 })} />
              <Input placeholder="Finalidade / Procedimento" className="col-span-2" value={form.finalidade} onChange={(e) => setForm({ ...form, finalidade: e.target.value })} />
            </div>
            <Button onClick={handleSave} disabled={createDistribuicao.isPending} className="w-full mt-2">Registrar Distribuição</Button>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead><TableHead>Setor</TableHead><TableHead>Solicitante</TableHead>
                <TableHead>Lote</TableHead><TableHead>Qtd</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhuma distribuição</TableCell></TableRow>
              ) : filtered.map((d: any) => (
                <TableRow key={d.id}>
                  <TableCell className="text-xs">{formatDate(d.data_distribuicao)}</TableCell>
                  <TableCell>{d.setor_destino}</TableCell>
                  <TableCell>{d.profissional_solicitante || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{d.lote}</TableCell>
                  <TableCell>{d.quantidade}</TableCell>
                  <TableCell><StatusBadge status={d.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

// =================== EQUIPAMENTOS ===================
function EquipamentosTab({ search }: { search: string }) {
  const { data: equipamentos, isLoading } = useCmeEquipamentos();
  const createEquipamento = useCreateCmeEquipamento();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", tipo: "autoclave", modelo: "", numero_serie: "", fabricante: "", localizacao: "" });

  const filtered = (equipamentos || []).filter((e: any) =>
    !search || e.nome?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.nome) return;
    createEquipamento.mutate(form, { onSuccess: () => setOpen(false) });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Equipamentos CME</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-1"><Plus className="h-4 w-4" />Novo Equipamento</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Cadastrar Equipamento</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="autoclave">Autoclave</SelectItem>
                  <SelectItem value="lavadora">Lavadora Ultrassônica</SelectItem>
                  <SelectItem value="termodesinfectora">Termodesinfectora</SelectItem>
                  <SelectItem value="seladora">Seladora</SelectItem>
                  <SelectItem value="incubadora">Incubadora Biológica</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Modelo" value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} />
              <Input placeholder="Nº Série" value={form.numero_serie} onChange={(e) => setForm({ ...form, numero_serie: e.target.value })} />
              <Input placeholder="Fabricante" value={form.fabricante} onChange={(e) => setForm({ ...form, fabricante: e.target.value })} />
              <Input placeholder="Localização" value={form.localizacao} onChange={(e) => setForm({ ...form, localizacao: e.target.value })} />
            </div>
            <Button onClick={handleSave} disabled={createEquipamento.isPending} className="w-full mt-2">Salvar Equipamento</Button>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead><TableHead>Tipo</TableHead><TableHead>Modelo</TableHead>
                <TableHead>Nº Série</TableHead><TableHead>Localização</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum equipamento</TableCell></TableRow>
              ) : filtered.map((e: any) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.nome}</TableCell>
                  <TableCell className="capitalize">{e.tipo?.replace(/_/g, " ")}</TableCell>
                  <TableCell>{e.modelo || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{e.numero_serie || "—"}</TableCell>
                  <TableCell>{e.localizacao || "—"}</TableCell>
                  <TableCell><StatusBadge status={e.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

// =================== NÃO CONFORMIDADES ===================
function NaoConformidadeTab() {
  const { data: ncs, isLoading } = useCmeNaoConformidades();
  const createNC = useCreateCmeNaoConformidade();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tipo: "falha_esterilizacao", descricao: "", severidade: "media", acao_corretiva: "" });

  const handleSave = () => {
    if (!form.descricao) return;
    createNC.mutate({ ...form, responsavel_id: user?.id }, { onSuccess: () => setOpen(false) });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Não Conformidades</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="destructive" className="gap-1"><Plus className="h-4 w-4" />Registrar NC</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Não Conformidade</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="falha_esterilizacao">Falha de Esterilização</SelectItem>
                  <SelectItem value="indicador_reprovado">Indicador Reprovado</SelectItem>
                  <SelectItem value="embalagem_violada">Embalagem Violada</SelectItem>
                  <SelectItem value="material_danificado">Material Danificado</SelectItem>
                  <SelectItem value="validade_expirada">Validade Expirada</SelectItem>
                  <SelectItem value="processo_inadequado">Processo Inadequado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.severidade} onValueChange={(v) => setForm({ ...form, severidade: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
              <Textarea placeholder="Descrição detalhada *" className="col-span-2" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              <Textarea placeholder="Ação corretiva" className="col-span-2" value={form.acao_corretiva} onChange={(e) => setForm({ ...form, acao_corretiva: e.target.value })} />
            </div>
            <Button variant="destructive" onClick={handleSave} disabled={createNC.isPending} className="w-full mt-2">Registrar NC</Button>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead><TableHead>Tipo</TableHead><TableHead>Descrição</TableHead>
                <TableHead>Severidade</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(ncs || []).length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhuma NC registrada</TableCell></TableRow>
              ) : (ncs || []).map((nc: any) => (
                <TableRow key={nc.id}>
                  <TableCell className="text-xs">{formatDate(nc.data_ocorrencia)}</TableCell>
                  <TableCell className="capitalize">{nc.tipo?.replace(/_/g, " ")}</TableCell>
                  <TableCell className="max-w-xs truncate">{nc.descricao}</TableCell>
                  <TableCell>
                    <Badge variant={nc.severidade === "critica" || nc.severidade === "alta" ? "destructive" : "secondary"}>
                      {nc.severidade}
                    </Badge>
                  </TableCell>
                  <TableCell><StatusBadge status={nc.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

// =================== RASTREABILIDADE ===================
function RastreabilidadeTab({ search }: { search: string }) {
  const { data: recebimentos } = useCmeRecebimentos();
  const { data: cargas } = useCmeCargas();
  const { data: distribuicoes } = useCmeDistribuicoes();
  const { data: testes } = useCmeTestes();
  const [selectedLote, setSelectedLote] = useState("");

  // Build unique lotes from cargas and distribuicoes
  const lotes = Array.from(new Set([
    ...(cargas || []).map((c: any) => c.lote),
    ...(distribuicoes || []).map((d: any) => d.lote),
  ])).filter(Boolean).sort();

  const filteredLotes = lotes.filter(l => !search || l.toLowerCase().includes(search.toLowerCase()));

  // Build timeline for selected lote
  const timeline: { date: string; action: string; detail: string; status: string }[] = [];
  if (selectedLote) {
    const carga = (cargas || []).find((c: any) => c.lote === selectedLote);
    const distList = (distribuicoes || []).filter((d: any) => d.lote === selectedLote);

    // Recebimento (approximate - link to carga)
    if (carga) {
      timeline.push({ date: carga.data_inicio, action: "Esterilização iniciada", detail: `Carga ${carga.numero_carga} — ${carga.metodo}`, status: "em_andamento" });
      if (carga.data_fim) {
        timeline.push({ date: carga.data_fim, action: carga.resultado === "aprovado" ? "Carga aprovada" : "Carga reprovada", detail: `Temp: ${carga.temperatura}°C / ${carga.tempo_minutos}min`, status: carga.resultado });
      }
      if (carga.data_liberacao) {
        timeline.push({ date: carga.data_liberacao, action: "Liberado para armazenamento", detail: "Material liberado após testes", status: "liberado" });
      }
    }

    distList.forEach((d: any) => {
      timeline.push({ date: d.data_distribuicao, action: "Distribuído", detail: `${d.setor_destino} — ${d.profissional_solicitante || "N/I"}`, status: d.status });
    });

    timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Rastreabilidade por Lote</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Lotes Registrados</CardTitle></CardHeader>
          <CardContent className="space-y-1 max-h-[500px] overflow-y-auto">
            {filteredLotes.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum lote</p> :
              filteredLotes.map(l => (
                <button key={l} onClick={() => setSelectedLote(l)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-mono transition-colors ${selectedLote === l ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                  {l}
                </button>
              ))
            }
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Timeline — {selectedLote || "Selecione um lote"}</CardTitle></CardHeader>
          <CardContent>
            {!selectedLote ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Selecione um lote para ver a rastreabilidade completa</p>
            ) : timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Nenhum evento registrado para este lote</p>
            ) : (
              <div className="relative pl-6 space-y-6">
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border" />
                {timeline.map((ev, i) => (
                  <div key={i} className="relative">
                    <div className={`absolute -left-4 top-1 w-3 h-3 rounded-full border-2 border-background ${ev.status === "aprovado" || ev.status === "liberado" || ev.status === "entregue" ? "bg-green-500" : ev.status === "reprovado" ? "bg-red-500" : "bg-primary"}`} />
                    <div>
                      <p className="text-xs text-muted-foreground">{formatDate(ev.date)}</p>
                      <p className="font-medium text-sm">{ev.action}</p>
                      <p className="text-xs text-muted-foreground">{ev.detail}</p>
                      <StatusBadge status={ev.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// =================== REQUISIÇÕES CENTRO CIRÚRGICO ===================
function RequisicoesCCTab() {
  const { data: kits } = useCmeKits();
  const { data: armaz } = useCmeArmazenamento();
  const { data: distrib } = useCmeDistribuicoes();
  const createDistribuicao = useCreateCmeDistribuicao();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ kit_id: "", sala: "", procedimento: "", cirurgiao: "", data_procedimento: "" });

  // CC requests are distribuicoes to Centro Cirúrgico
  const ccDistrib = (distrib || []).filter((d: any) => d.setor_destino === "Centro Cirúrgico");

  const handleSave = () => {
    if (!form.procedimento) return;
    const kit = (kits || []).find((k: any) => k.id === form.kit_id);
    // Find available lote for this kit
    const avail = (armaz || []).find((a: any) => a.status === "disponivel");
    createDistribuicao.mutate({
      setor_destino: "Centro Cirúrgico",
      kit_id: form.kit_id || undefined,
      profissional_solicitante: form.cirurgiao,
      lote: avail?.lote || "A-DEFINIR",
      quantidade: 1,
      finalidade: `${form.procedimento}${form.sala ? ` — Sala ${form.sala}` : ""}`,
      entregue_por: user?.id,
    }, { onSuccess: () => setOpen(false) });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Requisições — Centro Cirúrgico</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-1"><Plus className="h-4 w-4" />Nova Requisição CC</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Requisição de Material — Centro Cirúrgico</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              {kits && kits.length > 0 && (
                <Select value={form.kit_id} onValueChange={(v) => setForm({ ...form, kit_id: v })}>
                  <SelectTrigger className="col-span-2"><SelectValue placeholder="Kit / Caixa Cirúrgica" /></SelectTrigger>
                  <SelectContent>
                    {kits.filter((k: any) => k.status === "ativo").map((k: any) => (
                      <SelectItem key={k.id} value={k.id}>{k.nome} {k.especialidade ? `(${k.especialidade})` : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Input placeholder="Sala Cirúrgica" value={form.sala} onChange={(e) => setForm({ ...form, sala: e.target.value })} />
              <Input placeholder="Cirurgião" value={form.cirurgiao} onChange={(e) => setForm({ ...form, cirurgiao: e.target.value })} />
              <Input placeholder="Procedimento *" className="col-span-2" value={form.procedimento} onChange={(e) => setForm({ ...form, procedimento: e.target.value })} />
              <Input type="date" className="col-span-2" value={form.data_procedimento} onChange={(e) => setForm({ ...form, data_procedimento: e.target.value })} />
            </div>
            <Button onClick={handleSave} disabled={createDistribuicao.isPending} className="w-full mt-2">Enviar Requisição</Button>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead><TableHead>Procedimento</TableHead><TableHead>Cirurgião</TableHead>
              <TableHead>Lote</TableHead><TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ccDistrib.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhuma requisição do CC</TableCell></TableRow>
            ) : ccDistrib.map((d: any) => (
              <TableRow key={d.id}>
                <TableCell className="text-xs">{formatDate(d.data_distribuicao)}</TableCell>
                <TableCell>{d.finalidade || "—"}</TableCell>
                <TableCell>{d.profissional_solicitante || "—"}</TableCell>
                <TableCell className="font-mono text-xs">{d.lote}</TableCell>
                <TableCell><StatusBadge status={d.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// =================== RELATÓRIOS E GRÁFICOS ===================
function RelatoriosTab() {
  const { data: recebimentos } = useCmeRecebimentos();
  const { data: cargas } = useCmeCargas();
  const { data: distribuicoes } = useCmeDistribuicoes();
  const { data: ncs } = useCmeNaoConformidades();
  const { data: testes } = useCmeTestes();

  // Distribution by sector
  const distBySector: Record<string, number> = {};
  (distribuicoes || []).forEach((d: any) => {
    distBySector[d.setor_destino] = (distBySector[d.setor_destino] || 0) + d.quantidade;
  });
  const sectorData = Object.entries(distBySector).map(([name, value]) => ({ name, value }));

  // Cargas por resultado
  const cargaResults: Record<string, number> = {};
  (cargas || []).forEach((c: any) => {
    const r = statusLabel[c.resultado] || c.resultado;
    cargaResults[r] = (cargaResults[r] || 0) + 1;
  });
  const cargaData = Object.entries(cargaResults).map(([name, value]) => ({ name, value }));

  // Recebimentos por setor
  const recBySector: Record<string, number> = {};
  (recebimentos || []).forEach((r: any) => {
    recBySector[r.setor_origem] = (recBySector[r.setor_origem] || 0) + r.quantidade;
  });
  const recSectorData = Object.entries(recBySector).map(([name, value]) => ({ name, value }));

  // NC by type
  const ncByType: Record<string, number> = {};
  (ncs || []).forEach((nc: any) => {
    const t = nc.tipo?.replace(/_/g, " ") || "Outros";
    ncByType[t] = (ncByType[t] || 0) + 1;
  });
  const ncData = Object.entries(ncByType).map(([name, value]) => ({ name, value }));

  // Testes summary
  const testeResults: Record<string, number> = {};
  (testes || []).forEach((t: any) => {
    const r = statusLabel[t.resultado] || t.resultado;
    testeResults[r] = (testeResults[r] || 0) + 1;
  });
  const testeData = Object.entries(testeResults).map(([name, value]) => ({ name, value }));

  // KPIs
  const totalCargas = (cargas || []).length;
  const aprovadas = (cargas || []).filter((c: any) => c.resultado === "aprovado").length;
  const taxaAprovacao = totalCargas > 0 ? ((aprovadas / totalCargas) * 100).toFixed(1) : "0";
  const totalDistribuido = (distribuicoes || []).reduce((s: number, d: any) => s + (d.quantidade || 0), 0);
  const ncAbertas = (ncs || []).filter((nc: any) => nc.status === "aberta").length;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Relatórios e Indicadores CME</h2>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-primary">{totalCargas}</p><p className="text-xs text-muted-foreground">Total de Cargas</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-green-600">{taxaAprovacao}%</p><p className="text-xs text-muted-foreground">Taxa Aprovação</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-blue-600">{totalDistribuido}</p><p className="text-xs text-muted-foreground">Itens Distribuídos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-red-600">{ncAbertas}</p><p className="text-xs text-muted-foreground">NC Abertas</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribuição por setor */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Distribuição por Setor</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RPieChart>
                <Pie data={sectorData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {sectorData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </RPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cargas por resultado */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Cargas por Resultado</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={cargaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recebimentos por setor */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Recebimentos por Setor de Origem</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={recSectorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                <Tooltip />
                <Bar dataKey="value" fill="#22c55e" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Testes de qualidade */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Testes de Qualidade</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RPieChart>
                <Pie data={testeData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
                  {testeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </RPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* NC by type */}
      {ncData.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Não Conformidades por Tipo</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ncData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#ef4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
