import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft, Package, FlaskConical, Thermometer, Archive, Truck, RotateCcw,
  AlertTriangle, Plus, Search, Shield, ClipboardList, Settings, BarChart3,
  CheckCircle2, XCircle, Clock, Activity, Box, Wrench, FileText, GitBranch,
  Stethoscope, PieChart, Ban, Eye, ChevronRight, Undo2, Filter,
  ShieldAlert, Layers, PackageCheck, CircleDot, ListChecks
} from "lucide-react";
import {
  useCmeDashboardStats, useCmeMateriais, useCmeKits, useCmeRecebimentos,
  useCmeCargas, useCmeArmazenamento, useCmeDistribuicoes, useCmeNaoConformidades,
  useCmeEquipamentos, useCmeTestes, useCmeDevolucoes, useCmeAllEtapas, useCmeAllLogs,
  useCreateCmeMaterial, useCreateCmeKit, useCreateCmeRecebimento,
  useCreateCmeCarga, useUpdateCmeCarga, useCreateCmeNaoConformidade, useCreateCmeEquipamento,
  useCreateCmeDistribuicao, useUpdateCmeRecebimento, useCreateCmeTeste, useCreateCmeArmazenamento,
  useCreateCmeEtapa, useUpdateCmeEtapa, useCreateCmeDevolucao, useUpdateCmeNaoConformidade,
  useCreateCmeLog, useUpdateCmeArmazenamento, useUpdateCmeDistribuicao, useUpdateCmeTeste,
  useCmeBusinessRules
} from "@/hooks/useCME";
import { StatusBadge, formatDate, formatDateShort, CHART_COLORS, SETORES, CHECKLIST_LIMPEZA, CHECKLIST_PREPARO } from "@/components/cme/CmeShared";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";

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
            <TabsTrigger value="processamento" className="gap-1"><ListChecks className="h-3.5 w-3.5" />Processamento</TabsTrigger>
            <TabsTrigger value="esterilizacao" className="gap-1"><Thermometer className="h-3.5 w-3.5" />Esterilização</TabsTrigger>
            <TabsTrigger value="qualidade" className="gap-1"><Shield className="h-3.5 w-3.5" />Qualidade</TabsTrigger>
            <TabsTrigger value="armazenamento" className="gap-1"><Archive className="h-3.5 w-3.5" />Armazenamento</TabsTrigger>
            <TabsTrigger value="distribuicao" className="gap-1"><Truck className="h-3.5 w-3.5" />Distribuição</TabsTrigger>
            <TabsTrigger value="devolucoes" className="gap-1"><Undo2 className="h-3.5 w-3.5" />Devoluções</TabsTrigger>
            <TabsTrigger value="equipamentos" className="gap-1"><Settings className="h-3.5 w-3.5" />Equipamentos</TabsTrigger>
            <TabsTrigger value="naoconformidade" className="gap-1"><AlertTriangle className="h-3.5 w-3.5" />NC</TabsTrigger>
            <TabsTrigger value="rastreabilidade" className="gap-1"><GitBranch className="h-3.5 w-3.5" />Rastreabilidade</TabsTrigger>
            <TabsTrigger value="requisicoes" className="gap-1"><Stethoscope className="h-3.5 w-3.5" />Requisições CC</TabsTrigger>
            <TabsTrigger value="relatorios" className="gap-1"><PieChart className="h-3.5 w-3.5" />Relatórios</TabsTrigger>
            <TabsTrigger value="logs" className="gap-1"><FileText className="h-3.5 w-3.5" />Auditoria</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><DashboardTab /></TabsContent>
          <TabsContent value="materiais"><MateriaisTab search={search} /></TabsContent>
          <TabsContent value="kits"><KitsTab search={search} /></TabsContent>
          <TabsContent value="expurgo"><ExpurgoTab search={search} /></TabsContent>
          <TabsContent value="processamento"><ProcessamentoTab search={search} /></TabsContent>
          <TabsContent value="esterilizacao"><EsterilizacaoTab search={search} /></TabsContent>
          <TabsContent value="qualidade"><QualidadeTab /></TabsContent>
          <TabsContent value="armazenamento"><ArmazenamentoTab search={search} /></TabsContent>
          <TabsContent value="distribuicao"><DistribuicaoTab search={search} /></TabsContent>
          <TabsContent value="devolucoes"><DevolucoesTab search={search} /></TabsContent>
          <TabsContent value="equipamentos"><EquipamentosTab search={search} /></TabsContent>
          <TabsContent value="naoconformidade"><NaoConformidadeTab /></TabsContent>
          <TabsContent value="rastreabilidade"><RastreabilidadeTab search={search} /></TabsContent>
          <TabsContent value="requisicoes"><RequisicoesCCTab /></TabsContent>
          <TabsContent value="relatorios"><RelatoriosTab /></TabsContent>
          <TabsContent value="logs"><AuditoriaTab search={search} /></TabsContent>
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
    { label: "Em Triagem", value: s.emTriagem, icon: Filter, color: "text-orange-600 bg-orange-50" },
    { label: "Em Limpeza", value: s.emLimpeza, icon: RotateCcw, color: "text-yellow-600 bg-yellow-50" },
    { label: "Em Preparo", value: s.emPreparo, icon: Package, color: "text-indigo-600 bg-indigo-50" },
    { label: "Em Esterilização", value: s.emEsterilizacao, icon: Thermometer, color: "text-purple-600 bg-purple-50" },
    { label: "Liberados Hoje", value: s.liberadosHoje, icon: CheckCircle2, color: "text-green-600 bg-green-50" },
    { label: "Distribuídos Hoje", value: s.distribuidosHoje, icon: Truck, color: "text-emerald-600 bg-emerald-50" },
    { label: "Vencendo (7d)", value: s.vencendo, icon: Clock, color: s.vencendo > 0 ? "text-red-600 bg-red-50" : "text-gray-600 bg-gray-50" },
    { label: "Vencidos", value: s.vencidos, icon: Ban, color: s.vencidos > 0 ? "text-red-600 bg-red-50" : "text-gray-600 bg-gray-50" },
    { label: "Bloqueados", value: s.bloqueados, icon: ShieldAlert, color: s.bloqueados > 0 ? "text-red-600 bg-red-50" : "text-gray-600 bg-gray-50" },
    { label: "NC Abertas", value: s.naoConformidades, icon: AlertTriangle, color: s.naoConformidades > 0 ? "text-red-600 bg-red-50" : "text-gray-600 bg-gray-50" },
    { label: "Taxa Aprovação", value: `${s.taxaAprovacao}%`, icon: CheckCircle2, color: "text-green-600 bg-green-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${c.color}`}>
                <c.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-bold">{c.value ?? 0}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{c.label}</p>
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
            <div className="flex justify-between"><span className="text-muted-foreground">Aprovadas / Reprovadas</span><span className="font-semibold">{s.totalAprovadas} / {s.totalReprovadas}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Devoluções</span><span className="font-semibold">{s.totalDevolucoes}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Reprocessamentos</span><span className="font-semibold">{s.taxaReprocessamento}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Fluxo Operacional CME</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs flex-wrap">
              {["Expurgo", "Triagem", "Limpeza", "Preparo", "Embalagem", "Esterilização", "Qualidade", "Armazenamento", "Distribuição"].map((step, i) => (
                <React.Fragment key={step}>
                  <span className="px-2 py-1 rounded bg-primary/10 text-primary font-medium">{step}</span>
                  {i < 8 && <span className="text-muted-foreground">→</span>}
                </React.Fragment>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">Cada etapa gera registro de rastreabilidade automático</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Alertas Ativos</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {s.vencidos > 0 && <div className="flex items-center gap-2 text-sm text-red-600"><Ban className="h-4 w-4" />{s.vencidos} materiais vencidos</div>}
            {s.vencendo > 0 && <div className="flex items-center gap-2 text-sm text-orange-600"><Clock className="h-4 w-4" />{s.vencendo} vencendo em 7 dias</div>}
            {s.bloqueados > 0 && <div className="flex items-center gap-2 text-sm text-red-600"><ShieldAlert className="h-4 w-4" />{s.bloqueados} materiais bloqueados</div>}
            {s.naoConformidades > 0 && <div className="flex items-center gap-2 text-sm text-red-600"><AlertTriangle className="h-4 w-4" />{s.naoConformidades} NC abertas</div>}
            {!s.vencidos && !s.vencendo && !s.bloqueados && !s.naoConformidades && <div className="flex items-center gap-2 text-sm text-green-600"><CheckCircle2 className="h-4 w-4" />Nenhum alerta</div>}
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
  const [form, setForm] = useState({ codigo: "", nome: "", descricao: "", tipo: "instrumental", categoria: "", especialidade: "", criticidade: "semi_critico", metodo_esterilizacao: "vapor", setor_principal: "", complexidade: "media" });

  const filtered = (materiais || []).filter((m: any) =>
    !search || m.nome?.toLowerCase().includes(search.toLowerCase()) || m.codigo?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.codigo || !form.nome) return;
    createMaterial.mutate(form, { onSuccess: () => { setOpen(false); setForm({ codigo: "", nome: "", descricao: "", tipo: "instrumental", categoria: "", especialidade: "", criticidade: "semi_critico", metodo_esterilizacao: "vapor", setor_principal: "", complexidade: "media" }); } });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Cadastro de Materiais e Instrumentais</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-1"><Plus className="h-4 w-4" />Novo Material</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Novo Material</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
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
              <Select value={form.criticidade} onValueChange={(v) => setForm({ ...form, criticidade: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critico">Crítico</SelectItem>
                  <SelectItem value="semi_critico">Semi-crítico</SelectItem>
                  <SelectItem value="nao_critico">Não-crítico</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Categoria" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
              <Input placeholder="Especialidade" value={form.especialidade} onChange={(e) => setForm({ ...form, especialidade: e.target.value })} />
              <Select value={form.complexidade} onValueChange={(v) => setForm({ ...form, complexidade: v })}>
                <SelectTrigger><SelectValue placeholder="Complexidade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
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
              <Select value={form.setor_principal} onValueChange={(v) => setForm({ ...form, setor_principal: v })}>
                <SelectTrigger className="col-span-2"><SelectValue placeholder="Setor principal" /></SelectTrigger>
                <SelectContent>{SETORES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
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
                <TableHead>Criticidade</TableHead><TableHead>Complexidade</TableHead><TableHead>Esterilização</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhum material cadastrado</TableCell></TableRow>
              ) : filtered.map((m: any) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs">{m.codigo}</TableCell>
                  <TableCell className="font-medium">{m.nome}</TableCell>
                  <TableCell className="capitalize text-xs">{m.tipo?.replace(/_/g, " ")}</TableCell>
                  <TableCell><StatusBadge status={m.criticidade} /></TableCell>
                  <TableCell className="capitalize text-xs">{m.complexidade || "—"}</TableCell>
                  <TableCell className="capitalize text-xs">{m.metodo_esterilizacao?.replace(/_/g, " ")}</TableCell>
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
  const [form, setForm] = useState({ nome: "", codigo: "", especialidade: "", tipo_embalagem: "grau_cirurgico", metodo_esterilizacao: "vapor", instrucoes_montagem: "", setores_uso: "" });

  const filtered = (kits || []).filter((k: any) => !search || k.nome?.toLowerCase().includes(search.toLowerCase()));

  const handleSave = () => {
    if (!form.nome) return;
    createKit.mutate(form, { onSuccess: () => { setOpen(false); setForm({ nome: "", codigo: "", especialidade: "", tipo_embalagem: "grau_cirurgico", metodo_esterilizacao: "vapor", instrucoes_montagem: "", setores_uso: "" }); } });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Kits e Caixas Cirúrgicas</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-1"><Plus className="h-4 w-4" />Novo Kit</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Kit</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Código" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
              <Input placeholder="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              <Input placeholder="Especialidade" value={form.especialidade} onChange={(e) => setForm({ ...form, especialidade: e.target.value })} />
              <Select value={form.tipo_embalagem} onValueChange={(v) => setForm({ ...form, tipo_embalagem: v })}>
                <SelectTrigger><SelectValue placeholder="Embalagem" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="grau_cirurgico">Grau Cirúrgico</SelectItem>
                  <SelectItem value="tecido_nao_tecido">TNT</SelectItem>
                  <SelectItem value="container_rigido">Container Rígido</SelectItem>
                  <SelectItem value="tyvek">Tyvek</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.metodo_esterilizacao} onValueChange={(v) => setForm({ ...form, metodo_esterilizacao: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vapor">Vapor</SelectItem>
                  <SelectItem value="plasma">Plasma H2O2</SelectItem>
                  <SelectItem value="oxido_etileno">Óxido de Etileno</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Setores de uso" value={form.setores_uso} onChange={(e) => setForm({ ...form, setores_uso: e.target.value })} />
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
                <TableHead>Embalagem</TableHead><TableHead>Esterilização</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum kit cadastrado</TableCell></TableRow>
              ) : filtered.map((k: any) => (
                <TableRow key={k.id}>
                  <TableCell className="font-mono text-xs">{k.codigo || "—"}</TableCell>
                  <TableCell className="font-medium">{k.nome}</TableCell>
                  <TableCell>{k.especialidade || "—"}</TableCell>
                  <TableCell className="capitalize text-xs">{k.tipo_embalagem?.replace(/_/g, " ") || "—"}</TableCell>
                  <TableCell className="capitalize text-xs">{k.metodo_esterilizacao?.replace(/_/g, " ")}</TableCell>
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
  const { data: materiais } = useCmeMateriais();
  const createRecebimento = useCreateCmeRecebimento();
  const updateRecebimento = useUpdateCmeRecebimento();
  const createLog = useCreateCmeLog();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    setor_origem: "", tipo_material: "kit", kit_id: "", material_id: "", quantidade: 1,
    prioridade: "normal", situacao_sujidade: "contaminado", profissional_entregou: "", observacoes: ""
  });

  const filtered = (recebimentos || []).filter((r: any) =>
    !search || r.setor_origem?.toLowerCase().includes(search.toLowerCase()) || r.tipo_material?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.setor_origem) { toast({ title: "Setor de origem obrigatório", variant: "destructive" }); return; }
    const payload: any = { ...form, recebido_por: user?.id };
    if (!payload.kit_id) delete payload.kit_id;
    if (!payload.material_id) delete payload.material_id;
    createRecebimento.mutate(payload, {
      onSuccess: (data: any) => {
        createLog.mutate({ entidade_id: data.id, entidade_tipo: "recebimento", acao: "Recebimento no expurgo", usuario_id: user?.id, detalhes: { setor: form.setor_origem, tipo: form.tipo_material, sujidade: form.situacao_sujidade } });
        setOpen(false);
        setForm({ setor_origem: "", tipo_material: "kit", kit_id: "", material_id: "", quantidade: 1, prioridade: "normal", situacao_sujidade: "contaminado", profissional_entregou: "", observacoes: "" });
      }
    });
  };

  const advanceStatus = (id: string, currentStatus: string) => {
    const flow: Record<string, string> = {
      recebido_expurgo: "em_triagem", em_triagem: "em_limpeza_manual",
      em_limpeza_manual: "aguardando_preparo", em_limpeza_automatizada: "aguardando_preparo",
      aguardando_preparo: "em_preparo", em_preparo: "liberado",
    };
    const next = flow[currentStatus];
    if (next) {
      updateRecebimento.mutate({ id, status: next });
      createLog.mutate({ entidade_id: id, entidade_tipo: "recebimento", acao: `Status: ${next}`, usuario_id: user?.id });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Recepção de Material / Expurgo</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-1"><Plus className="h-4 w-4" />Receber Material</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Receber Material Contaminado</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.setor_origem} onValueChange={(v) => setForm({ ...form, setor_origem: v })}>
                <SelectTrigger><SelectValue placeholder="Setor de Origem *" /></SelectTrigger>
                <SelectContent>{SETORES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
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
                  <SelectContent>{kits.map((k: any) => <SelectItem key={k.id} value={k.id}>{k.nome}</SelectItem>)}</SelectContent>
                </Select>
              )}
              {(form.tipo_material === "instrumental" || form.tipo_material === "material") && materiais && (
                <Select value={form.material_id} onValueChange={(v) => setForm({ ...form, material_id: v })}>
                  <SelectTrigger className="col-span-2"><SelectValue placeholder="Selecionar Material" /></SelectTrigger>
                  <SelectContent>{materiais.map((m: any) => <SelectItem key={m.id} value={m.id}>{m.codigo} — {m.nome}</SelectItem>)}</SelectContent>
                </Select>
              )}
              <Select value={form.situacao_sujidade} onValueChange={(v) => setForm({ ...form, situacao_sujidade: v })}>
                <SelectTrigger><SelectValue placeholder="Nível sujidade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="contaminado">Contaminado</SelectItem>
                  <SelectItem value="altamente_contaminado">Altamente Contaminado</SelectItem>
                  <SelectItem value="contaminacao_biologica">Contaminação Biológica</SelectItem>
                  <SelectItem value="leve">Sujidade Leve</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.prioridade} onValueChange={(v) => setForm({ ...form, prioridade: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="emergencia">Emergência</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Qtd" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: parseInt(e.target.value) || 1 })} />
              <Input placeholder="Profissional que entregou" value={form.profissional_entregou} onChange={(e) => setForm({ ...form, profissional_entregou: e.target.value })} />
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
                <TableHead>Sujidade</TableHead><TableHead>Qtd</TableHead><TableHead>Prioridade</TableHead><TableHead>Status</TableHead><TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhum recebimento</TableCell></TableRow>
              ) : filtered.map((r: any) => (
                <TableRow key={r.id} className={r.prioridade === "emergencia" ? "bg-red-50/50" : r.prioridade === "urgente" ? "bg-yellow-50/50" : ""}>
                  <TableCell className="text-xs">{formatDate(r.data_recebimento)}</TableCell>
                  <TableCell>{r.setor_origem}</TableCell>
                  <TableCell className="capitalize text-xs">{r.tipo_material}</TableCell>
                  <TableCell className="capitalize text-xs">{r.situacao_sujidade?.replace(/_/g, " ") || "—"}</TableCell>
                  <TableCell>{r.quantidade}</TableCell>
                  <TableCell><Badge variant={r.prioridade === "urgente" || r.prioridade === "emergencia" ? "destructive" : "secondary"}>{r.prioridade}</Badge></TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                  <TableCell>
                    {!["liberado", "distribuido"].includes(r.status) && (
                      <Button size="sm" variant="outline" onClick={() => advanceStatus(r.id, r.status)} className="gap-1">
                        <ChevronRight className="h-3 w-3" />Avançar
                      </Button>
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

// =================== PROCESSAMENTO (Triagem + Limpeza + Preparo) ===================
function ProcessamentoTab({ search }: { search: string }) {
  const { data: recebimentos } = useCmeRecebimentos();
  const { data: etapas, isLoading } = useCmeAllEtapas();
  const createEtapa = useCreateCmeEtapa();
  const updateRecebimento = useUpdateCmeRecebimento();
  const createLog = useCreateCmeLog();
  const { user } = useAuth();
  const { toast } = useToast();
  const [subTab, setSubTab] = useState<"triagem" | "limpeza" | "preparo">("triagem");
  const [openTriagem, setOpenTriagem] = useState(false);
  const [openLimpeza, setOpenLimpeza] = useState(false);
  const [openPreparo, setOpenPreparo] = useState(false);
  const [selectedReceb, setSelectedReceb] = useState("");
  const [triagemForm, setTriagemForm] = useState({ criticidade: "semi_critico", integridade: true, decisao: "limpeza_manual", observacoes: "" });
  const [limpezaForm, setLimpezaForm] = useState({ tipo_limpeza: "manual", equipamento_utilizado: "", observacoes: "", checklist: {} as Record<string, boolean> });
  const [preparoForm, setPreparoForm] = useState({ embalagem_utilizada: "grau_cirurgico", observacoes: "", checklist: {} as Record<string, boolean> });

  const pendingTriagem = (recebimentos || []).filter((r: any) => r.status === "em_triagem");
  const pendingLimpeza = (recebimentos || []).filter((r: any) => ["em_limpeza_manual", "em_limpeza_automatizada"].includes(r.status));
  const pendingPreparo = (recebimentos || []).filter((r: any) => ["aguardando_preparo", "em_preparo"].includes(r.status));

  const etapasByType = (type: string) => (etapas || []).filter((e: any) => e.etapa === type);

  const handleTriagem = () => {
    if (!selectedReceb) return;
    const nextStatus = triagemForm.decisao === "bloqueado" ? "nao_conforme" : triagemForm.decisao === "limpeza_automatizada" ? "em_limpeza_automatizada" : "em_limpeza_manual";
    createEtapa.mutate({
      recebimento_id: selectedReceb, etapa: "triagem", responsavel_id: user?.id,
      observacoes: triagemForm.observacoes, inspecao_visual: true, integridade_ok: triagemForm.integridade,
      checklist: { criticidade: triagemForm.criticidade, decisao: triagemForm.decisao }
    });
    updateRecebimento.mutate({ id: selectedReceb, status: nextStatus });
    createLog.mutate({ entidade_id: selectedReceb, entidade_tipo: "recebimento", acao: `Triagem: ${triagemForm.decisao}`, usuario_id: user?.id, detalhes: triagemForm });
    setOpenTriagem(false);
    toast({ title: "Triagem registrada" });
  };

  const handleLimpeza = () => {
    if (!selectedReceb) return;
    const allChecked = CHECKLIST_LIMPEZA.every(c => limpezaForm.checklist[c.id]);
    if (!allChecked) { toast({ title: "Complete todos os itens do checklist", variant: "destructive" }); return; }
    createEtapa.mutate({
      recebimento_id: selectedReceb, etapa: "limpeza", responsavel_id: user?.id,
      tipo_limpeza: limpezaForm.tipo_limpeza, equipamento_utilizado: limpezaForm.equipamento_utilizado,
      observacoes: limpezaForm.observacoes, data_fim: new Date().toISOString(),
      checklist: limpezaForm.checklist, inspecao_visual: true, integridade_ok: true
    });
    updateRecebimento.mutate({ id: selectedReceb, status: "aguardando_preparo" });
    createLog.mutate({ entidade_id: selectedReceb, entidade_tipo: "recebimento", acao: "Limpeza concluída", usuario_id: user?.id, detalhes: { tipo: limpezaForm.tipo_limpeza } });
    setOpenLimpeza(false);
    toast({ title: "Limpeza concluída" });
  };

  const handlePreparo = () => {
    if (!selectedReceb) return;
    const allChecked = CHECKLIST_PREPARO.every(c => preparoForm.checklist[c.id]);
    if (!allChecked) { toast({ title: "Complete todos os itens do checklist", variant: "destructive" }); return; }
    createEtapa.mutate({
      recebimento_id: selectedReceb, etapa: "preparo", responsavel_id: user?.id,
      embalagem_utilizada: preparoForm.embalagem_utilizada, observacoes: preparoForm.observacoes,
      data_fim: new Date().toISOString(), checklist: preparoForm.checklist,
      selagem_ok: true, inspecao_visual: true, integridade_ok: true
    });
    updateRecebimento.mutate({ id: selectedReceb, status: "liberado" });
    createLog.mutate({ entidade_id: selectedReceb, entidade_tipo: "recebimento", acao: "Preparo concluído — liberado para esterilização", usuario_id: user?.id });
    setOpenPreparo(false);
    toast({ title: "Preparo concluído — material liberado" });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[{ key: "triagem", label: "Triagem", count: pendingTriagem.length }, { key: "limpeza", label: "Limpeza", count: pendingLimpeza.length }, { key: "preparo", label: "Preparo / Embalagem", count: pendingPreparo.length }].map(t => (
          <Button key={t.key} variant={subTab === t.key ? "default" : "outline"} onClick={() => setSubTab(t.key as any)} className="gap-2">
            {t.label} {t.count > 0 && <Badge variant="secondary" className="ml-1">{t.count}</Badge>}
          </Button>
        ))}
      </div>

      {/* TRIAGEM */}
      {subTab === "triagem" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Triagem — Classificação e Direcionamento</h3>
          </div>
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Setor</TableHead><TableHead>Tipo</TableHead><TableHead>Sujidade</TableHead><TableHead>Prioridade</TableHead><TableHead>Ação</TableHead></TableRow></TableHeader>
              <TableBody>
                {pendingTriagem.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum material aguardando triagem</TableCell></TableRow> :
                  pendingTriagem.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs">{formatDate(r.data_recebimento)}</TableCell>
                      <TableCell>{r.setor_origem}</TableCell>
                      <TableCell className="capitalize text-xs">{r.tipo_material}</TableCell>
                      <TableCell className="capitalize text-xs">{r.situacao_sujidade?.replace(/_/g, " ")}</TableCell>
                      <TableCell><Badge variant={r.prioridade !== "normal" ? "destructive" : "secondary"}>{r.prioridade}</Badge></TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => { setSelectedReceb(r.id); setOpenTriagem(true); }}>Realizar Triagem</Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>

          <Dialog open={openTriagem} onOpenChange={setOpenTriagem}>
            <DialogContent>
              <DialogHeader><DialogTitle>Triagem do Material</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
              <div className="space-y-3">
                <Select value={triagemForm.criticidade} onValueChange={(v) => setTriagemForm({ ...triagemForm, criticidade: v })}>
                  <SelectTrigger><SelectValue placeholder="Criticidade" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critico">Crítico</SelectItem>
                    <SelectItem value="semi_critico">Semi-crítico</SelectItem>
                    <SelectItem value="nao_critico">Não-crítico</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Checkbox checked={triagemForm.integridade} onCheckedChange={(v) => setTriagemForm({ ...triagemForm, integridade: !!v })} />
                  <span className="text-sm">Integridade física OK</span>
                </div>
                <Select value={triagemForm.decisao} onValueChange={(v) => setTriagemForm({ ...triagemForm, decisao: v })}>
                  <SelectTrigger><SelectValue placeholder="Decisão de fluxo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="limpeza_manual">Encaminhar para Limpeza Manual</SelectItem>
                    <SelectItem value="limpeza_automatizada">Encaminhar para Limpeza Automatizada</SelectItem>
                    <SelectItem value="bloqueado">Bloquear — Manutenção/Análise</SelectItem>
                    <SelectItem value="devolvido">Devolver ao setor — Não processável</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea placeholder="Observações" value={triagemForm.observacoes} onChange={(e) => setTriagemForm({ ...triagemForm, observacoes: e.target.value })} />
              </div>
              <Button onClick={handleTriagem} className="w-full">Registrar Triagem</Button>
            </DialogContent>
          </Dialog>

          {/* Recent triagens */}
          {etapasByType("triagem").length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Triagens Realizadas</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Integridade</TableHead><TableHead>Decisão</TableHead><TableHead>Obs</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {etapasByType("triagem").slice(0, 10).map((e: any) => (
                      <TableRow key={e.id}>
                        <TableCell className="text-xs">{formatDate(e.data_inicio)}</TableCell>
                        <TableCell>{e.integridade_ok ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}</TableCell>
                        <TableCell className="capitalize text-xs">{(e.checklist as any)?.decisao?.replace(/_/g, " ") || "—"}</TableCell>
                        <TableCell className="text-xs max-w-xs truncate">{e.observacoes || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* LIMPEZA */}
      {subTab === "limpeza" && (
        <div className="space-y-4">
          <h3 className="font-semibold">Limpeza — Checklist Obrigatório</h3>
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Setor</TableHead><TableHead>Tipo</TableHead><TableHead>Status</TableHead><TableHead>Ação</TableHead></TableRow></TableHeader>
              <TableBody>
                {pendingLimpeza.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum material em limpeza</TableCell></TableRow> :
                  pendingLimpeza.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs">{formatDate(r.data_recebimento)}</TableCell>
                      <TableCell>{r.setor_origem}</TableCell>
                      <TableCell className="capitalize text-xs">{r.tipo_material}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => { setSelectedReceb(r.id); setLimpezaForm({ tipo_limpeza: r.status === "em_limpeza_automatizada" ? "automatizada" : "manual", equipamento_utilizado: "", observacoes: "", checklist: {} }); setOpenLimpeza(true); }}>
                          Registrar Limpeza
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>

          <Dialog open={openLimpeza} onOpenChange={setOpenLimpeza}>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Registro de Limpeza</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Select value={limpezaForm.tipo_limpeza} onValueChange={(v) => setLimpezaForm({ ...limpezaForm, tipo_limpeza: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="automatizada">Automatizada</SelectItem>
                      <SelectItem value="ultrassonica">Ultrassônica</SelectItem>
                      <SelectItem value="termodesinfeccao">Termodesinfecção</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Equipamento utilizado" value={limpezaForm.equipamento_utilizado} onChange={(e) => setLimpezaForm({ ...limpezaForm, equipamento_utilizado: e.target.value })} />
                </div>
                <div className="border rounded-lg p-3 space-y-2">
                  <p className="text-sm font-semibold text-destructive">Checklist Obrigatório</p>
                  {CHECKLIST_LIMPEZA.map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Checkbox checked={!!limpezaForm.checklist[item.id]} onCheckedChange={(v) => setLimpezaForm({ ...limpezaForm, checklist: { ...limpezaForm.checklist, [item.id]: !!v } })} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
                <Textarea placeholder="Observações" value={limpezaForm.observacoes} onChange={(e) => setLimpezaForm({ ...limpezaForm, observacoes: e.target.value })} />
              </div>
              <Button onClick={handleLimpeza} className="w-full">Concluir Limpeza</Button>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* PREPARO */}
      {subTab === "preparo" && (
        <div className="space-y-4">
          <h3 className="font-semibold">Preparo e Embalagem — Conferência Obrigatória</h3>
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Setor</TableHead><TableHead>Tipo</TableHead><TableHead>Status</TableHead><TableHead>Ação</TableHead></TableRow></TableHeader>
              <TableBody>
                {pendingPreparo.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum material aguardando preparo</TableCell></TableRow> :
                  pendingPreparo.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs">{formatDate(r.data_recebimento)}</TableCell>
                      <TableCell>{r.setor_origem}</TableCell>
                      <TableCell className="capitalize text-xs">{r.tipo_material}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => { setSelectedReceb(r.id); setPreparoForm({ embalagem_utilizada: "grau_cirurgico", observacoes: "", checklist: {} }); setOpenPreparo(true); }}>
                          Registrar Preparo
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>

          <Dialog open={openPreparo} onOpenChange={setOpenPreparo}>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Preparo e Embalagem</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
              <div className="space-y-3">
                <Select value={preparoForm.embalagem_utilizada} onValueChange={(v) => setPreparoForm({ ...preparoForm, embalagem_utilizada: v })}>
                  <SelectTrigger><SelectValue placeholder="Tipo de embalagem" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grau_cirurgico">Grau Cirúrgico</SelectItem>
                    <SelectItem value="tnt">TNT</SelectItem>
                    <SelectItem value="container_rigido">Container Rígido</SelectItem>
                    <SelectItem value="tyvek">Tyvek</SelectItem>
                    <SelectItem value="papel_crepado">Papel Crepado</SelectItem>
                  </SelectContent>
                </Select>
                <div className="border rounded-lg p-3 space-y-2">
                  <p className="text-sm font-semibold text-destructive">Checklist Obrigatório — Conferência</p>
                  {CHECKLIST_PREPARO.map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Checkbox checked={!!preparoForm.checklist[item.id]} onCheckedChange={(v) => setPreparoForm({ ...preparoForm, checklist: { ...preparoForm.checklist, [item.id]: !!v } })} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
                <Textarea placeholder="Observações" value={preparoForm.observacoes} onChange={(e) => setPreparoForm({ ...preparoForm, observacoes: e.target.value })} />
              </div>
              <Button onClick={handlePreparo} className="w-full">Concluir Preparo — Liberar para Esterilização</Button>
            </DialogContent>
          </Dialog>
        </div>
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
  const createLog = useCreateCmeLog();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ numero_carga: "", lote: "", equipamento_id: "", metodo: "vapor", temperatura: 134, pressao: 2.1, tempo_minutos: 30, indicador_quimico: "", indicador_biologico: "", integrador: "" });

  const filtered = (cargas || []).filter((c: any) =>
    !search || c.numero_carga?.toLowerCase().includes(search.toLowerCase()) || c.lote?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.numero_carga || !form.lote) { toast({ title: "Nº Carga e Lote obrigatórios", variant: "destructive" }); return; }
    const payload: any = { ...form, operador_id: user?.id };
    if (!payload.equipamento_id) delete payload.equipamento_id;
    if (!payload.indicador_quimico) delete payload.indicador_quimico;
    if (!payload.indicador_biologico) delete payload.indicador_biologico;
    if (!payload.integrador) delete payload.integrador;
    createCarga.mutate(payload, {
      onSuccess: (data: any) => {
        createLog.mutate({ entidade_id: data.id, entidade_tipo: "carga", acao: "Carga de esterilização iniciada", usuario_id: user?.id, detalhes: { lote: form.lote, metodo: form.metodo } });
        setOpen(false);
      }
    });
  };

  const handleApprove = (c: any) => {
    updateCarga.mutate({ id: c.id, resultado: "aprovado", data_fim: new Date().toISOString(), data_liberacao: new Date().toISOString(), liberado_por: user?.id });
    createLog.mutate({ entidade_id: c.id, entidade_tipo: "carga", acao: "Carga APROVADA", usuario_id: user?.id });
    toast({ title: "Carga aprovada e liberada" });
  };

  const handleReject = (c: any) => {
    updateCarga.mutate({ id: c.id, resultado: "reprovado", data_fim: new Date().toISOString() });
    createLog.mutate({ entidade_id: c.id, entidade_tipo: "carga", acao: "Carga REPROVADA", usuario_id: user?.id });
    toast({ title: "Carga reprovada", variant: "destructive" });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Cargas de Esterilização</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-1"><Plus className="h-4 w-4" />Nova Carga</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nova Carga de Esterilização</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Nº Carga *" value={form.numero_carga} onChange={(e) => setForm({ ...form, numero_carga: e.target.value })} />
              <Input placeholder="Lote *" value={form.lote} onChange={(e) => setForm({ ...form, lote: e.target.value })} />
              {equipamentos && equipamentos.length > 0 && (
                <Select value={form.equipamento_id} onValueChange={(v) => setForm({ ...form, equipamento_id: v })}>
                  <SelectTrigger className="col-span-2"><SelectValue placeholder="Equipamento" /></SelectTrigger>
                  <SelectContent>{equipamentos.map((eq: any) => <SelectItem key={eq.id} value={eq.id}>{eq.nome} — {eq.modelo || eq.tipo}</SelectItem>)}</SelectContent>
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
              <Input type="number" step="0.1" placeholder="Pressão (atm)" value={form.pressao} onChange={(e) => setForm({ ...form, pressao: parseFloat(e.target.value) })} />
              <Input type="number" placeholder="Tempo (min)" value={form.tempo_minutos} onChange={(e) => setForm({ ...form, tempo_minutos: parseInt(e.target.value) })} />
              <Input placeholder="Indicador Químico" value={form.indicador_quimico} onChange={(e) => setForm({ ...form, indicador_quimico: e.target.value })} />
              <Input placeholder="Indicador Biológico" value={form.indicador_biologico} onChange={(e) => setForm({ ...form, indicador_biologico: e.target.value })} />
              <Input placeholder="Integrador" className="col-span-2" value={form.integrador} onChange={(e) => setForm({ ...form, integrador: e.target.value })} />
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
                <TableHead>Temp</TableHead><TableHead>Tempo</TableHead><TableHead>Indicadores</TableHead><TableHead>Início</TableHead><TableHead>Resultado</TableHead><TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Nenhuma carga</TableCell></TableRow>
              ) : filtered.map((c: any) => (
                <TableRow key={c.id} className={c.resultado === "reprovado" ? "bg-red-50/50" : ""}>
                  <TableCell className="font-mono font-semibold">{c.numero_carga}</TableCell>
                  <TableCell className="font-mono text-xs">{c.lote}</TableCell>
                  <TableCell className="capitalize text-xs">{c.metodo?.replace(/_/g, " ")}</TableCell>
                  <TableCell>{c.temperatura}°C</TableCell>
                  <TableCell>{c.tempo_minutos} min</TableCell>
                  <TableCell className="text-xs">
                    {c.indicador_quimico && <span className="block">Q: {c.indicador_quimico}</span>}
                    {c.indicador_biologico && <span className="block">B: {c.indicador_biologico}</span>}
                    {c.integrador && <span className="block">I: {c.integrador}</span>}
                    {!c.indicador_quimico && !c.indicador_biologico && "—"}
                  </TableCell>
                  <TableCell className="text-xs">{formatDate(c.data_inicio)}</TableCell>
                  <TableCell><StatusBadge status={c.resultado} /></TableCell>
                  <TableCell>
                    {c.resultado === "em_andamento" && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleApprove(c)}>
                          <CheckCircle2 className="h-3 w-3 mr-1" />Aprovar
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleReject(c)}>
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
  const { data: equipamentos } = useCmeEquipamentos();
  const createTeste = useCreateCmeTeste();
  const updateTeste = useUpdateCmeTeste();
  const createNC = useCreateCmeNaoConformidade();
  const createLog = useCreateCmeLog();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tipo_teste: "biologico", carga_id: "", equipamento_id: "", resultado: "pendente", lote_indicador: "", observacoes: "", acao_corretiva: "" });

  const handleSave = () => {
    const payload: any = { ...form, responsavel_id: user?.id };
    if (!payload.carga_id) delete payload.carga_id;
    if (!payload.equipamento_id) delete payload.equipamento_id;
    if (!payload.acao_corretiva) delete payload.acao_corretiva;

    createTeste.mutate(payload, {
      onSuccess: (data: any) => {
        createLog.mutate({ entidade_id: data.id, entidade_tipo: "teste", acao: `Teste ${form.tipo_teste}: ${form.resultado}`, usuario_id: user?.id });
        // Auto-create NC if non-conforming
        if (form.resultado === "nao_conforme" && form.carga_id) {
          createNC.mutate({ tipo: "indicador_reprovado", descricao: `Teste ${form.tipo_teste} não conforme — Carga vinculada`, severidade: "alta", responsavel_id: user?.id, carga_id: form.carga_id, acao_corretiva: form.acao_corretiva || "Aguardando análise" });
          toast({ title: "NC gerada automaticamente", variant: "destructive" });
        }
        setOpen(false);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Controle de Qualidade</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-1"><Plus className="h-4 w-4" />Novo Teste</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Registrar Teste de Qualidade</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.tipo_teste} onValueChange={(v) => setForm({ ...form, tipo_teste: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="biologico">Indicador Biológico</SelectItem>
                  <SelectItem value="quimico">Indicador Químico</SelectItem>
                  <SelectItem value="bowie_dick">Bowie & Dick</SelectItem>
                  <SelectItem value="integrador">Integrador</SelectItem>
                  <SelectItem value="leak_test">Leak Test</SelectItem>
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
              {cargas && (
                <Select value={form.carga_id} onValueChange={(v) => setForm({ ...form, carga_id: v })}>
                  <SelectTrigger className="col-span-2"><SelectValue placeholder="Carga vinculada" /></SelectTrigger>
                  <SelectContent>{cargas.map((c: any) => <SelectItem key={c.id} value={c.id}>Carga {c.numero_carga} — Lote {c.lote}</SelectItem>)}</SelectContent>
                </Select>
              )}
              {equipamentos && (
                <Select value={form.equipamento_id} onValueChange={(v) => setForm({ ...form, equipamento_id: v })}>
                  <SelectTrigger className="col-span-2"><SelectValue placeholder="Equipamento" /></SelectTrigger>
                  <SelectContent>{equipamentos.map((eq: any) => <SelectItem key={eq.id} value={eq.id}>{eq.nome}</SelectItem>)}</SelectContent>
                </Select>
              )}
              <Input placeholder="Lote do indicador" value={form.lote_indicador} onChange={(e) => setForm({ ...form, lote_indicador: e.target.value })} />
              <Input placeholder="Ação corretiva (se NC)" value={form.acao_corretiva} onChange={(e) => setForm({ ...form, acao_corretiva: e.target.value })} />
              <Textarea placeholder="Observações" className="col-span-2" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
            </div>
            {form.resultado === "nao_conforme" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700">
                ⚠ Uma Não Conformidade será gerada automaticamente ao salvar teste não conforme.
              </div>
            )}
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
                <TableHead>Resultado</TableHead><TableHead>Situação</TableHead><TableHead>Ação Corretiva</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(testes || []).length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum teste registrado</TableCell></TableRow>
              ) : (testes || []).map((t: any) => (
                <TableRow key={t.id} className={t.resultado === "nao_conforme" ? "bg-red-50/50" : ""}>
                  <TableCell className="text-xs">{formatDate(t.data_teste)}</TableCell>
                  <TableCell className="capitalize text-xs">{t.tipo_teste?.replace(/_/g, " ")}</TableCell>
                  <TableCell className="font-mono text-xs">{t.lote_indicador || "—"}</TableCell>
                  <TableCell><StatusBadge status={t.resultado} /></TableCell>
                  <TableCell><StatusBadge status={t.situacao || "pendente"} /></TableCell>
                  <TableCell className="text-xs max-w-xs truncate">{t.acao_corretiva || "—"}</TableCell>
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
  const createArmaz = useCreateCmeArmazenamento();
  const updateArmaz = useUpdateCmeArmazenamento();
  const { data: cargas } = useCmeCargas();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ lote: "", local_armazenamento: "", prateleira: "", data_esterilizacao: "", data_validade: "", quantidade: 1, carga_id: "", reservado_para: "" });

  const filtered = (armaz || []).filter((a: any) =>
    !search || a.lote?.toLowerCase().includes(search.toLowerCase()) || a.local_armazenamento?.toLowerCase().includes(search.toLowerCase())
  );

  const now = new Date();
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const handleSave = () => {
    if (!form.lote || !form.data_esterilizacao || !form.data_validade) { toast({ title: "Campos obrigatórios faltando", variant: "destructive" }); return; }
    const payload: any = { ...form };
    if (!payload.carga_id) delete payload.carga_id;
    if (!payload.reservado_para) delete payload.reservado_para;
    createArmaz.mutate(payload, { onSuccess: () => setOpen(false) });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Armazenamento e Validade</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-1"><Plus className="h-4 w-4" />Registrar Armazenamento</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Armazenar Material Esterilizado</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Lote *" value={form.lote} onChange={(e) => setForm({ ...form, lote: e.target.value })} />
              <Input type="number" placeholder="Quantidade" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: parseInt(e.target.value) || 1 })} />
              {cargas && (
                <Select value={form.carga_id} onValueChange={(v) => setForm({ ...form, carga_id: v })}>
                  <SelectTrigger className="col-span-2"><SelectValue placeholder="Carga vinculada" /></SelectTrigger>
                  <SelectContent>{(cargas || []).filter((c: any) => c.resultado === "aprovado").map((c: any) => <SelectItem key={c.id} value={c.id}>Carga {c.numero_carga} — Lote {c.lote}</SelectItem>)}</SelectContent>
                </Select>
              )}
              <Input placeholder="Local" value={form.local_armazenamento} onChange={(e) => setForm({ ...form, local_armazenamento: e.target.value })} />
              <Input placeholder="Prateleira" value={form.prateleira} onChange={(e) => setForm({ ...form, prateleira: e.target.value })} />
              <div className="col-span-2 grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground">Esterilização</label><Input type="date" value={form.data_esterilizacao} onChange={(e) => setForm({ ...form, data_esterilizacao: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">Validade</label><Input type="date" value={form.data_validade} onChange={(e) => setForm({ ...form, data_validade: e.target.value })} /></div>
              </div>
              <Select value={form.reservado_para} onValueChange={(v) => setForm({ ...form, reservado_para: v })}>
                <SelectTrigger className="col-span-2"><SelectValue placeholder="Reservar para setor (opcional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sem reserva</SelectItem>
                  {SETORES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} disabled={createArmaz.isPending} className="w-full mt-2">Armazenar</Button>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lote</TableHead><TableHead>Local</TableHead><TableHead>Prateleira</TableHead>
                <TableHead>Esterilização</TableHead><TableHead>Validade</TableHead><TableHead>Qtd</TableHead><TableHead>Reserva</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhum material armazenado</TableCell></TableRow>
              ) : filtered.map((a: any) => {
                const isExpired = a.data_validade && new Date(a.data_validade) <= now;
                const isExpiring = a.data_validade && new Date(a.data_validade) <= in7days && !isExpired;
                return (
                  <TableRow key={a.id} className={isExpired ? "bg-red-50/50" : isExpiring ? "bg-yellow-50/50" : ""}>
                    <TableCell className="font-mono text-xs">{a.lote}</TableCell>
                    <TableCell>{a.local_armazenamento || "—"}</TableCell>
                    <TableCell>{a.prateleira || "—"}</TableCell>
                    <TableCell className="text-xs">{formatDateShort(a.data_esterilizacao)}</TableCell>
                    <TableCell className="text-xs">
                      <span className={isExpired ? "text-red-600 font-bold" : isExpiring ? "text-orange-600 font-semibold" : ""}>
                        {formatDateShort(a.data_validade)}
                        {isExpired && " ⛔ VENCIDO"}
                        {isExpiring && " ⚠ VENCENDO"}
                      </span>
                    </TableCell>
                    <TableCell>{a.quantidade}</TableCell>
                    <TableCell className="text-xs">{a.reservado_para || "—"}</TableCell>
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
  const { data: distribuicoes, isLoading } = useCmeDistribuicoes();
  const { data: armaz } = useCmeArmazenamento();
  const createDistribuicao = useCreateCmeDistribuicao();
  const updateArmaz = useUpdateCmeArmazenamento();
  const createLog = useCreateCmeLog();
  const { isLoteBlocked } = useCmeBusinessRules();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ armazenamento_id: "", setor_destino: "", profissional_solicitante: "", recebido_por: "", finalidade: "", quantidade: 1, observacoes: "" });

  const filtered = (distribuicoes || []).filter((d: any) =>
    !search || d.setor_destino?.toLowerCase().includes(search.toLowerCase()) || d.lote?.toLowerCase().includes(search.toLowerCase())
  );

  const availableArmaz = (armaz || []).filter((a: any) => a.status === "disponivel" && (!a.data_validade || new Date(a.data_validade) > new Date()));

  const handleSave = () => {
    if (!form.setor_destino || !form.armazenamento_id) { toast({ title: "Setor e material obrigatórios", variant: "destructive" }); return; }
    const selectedArmaz = availableArmaz.find((a: any) => a.id === form.armazenamento_id);
    if (!selectedArmaz) return;

    const blockCheck = isLoteBlocked(selectedArmaz.lote);
    if (blockCheck.blocked) { toast({ title: `Distribuição bloqueada: ${blockCheck.reason}`, variant: "destructive" }); return; }

    createDistribuicao.mutate({
      armazenamento_id: form.armazenamento_id,
      setor_destino: form.setor_destino,
      profissional_solicitante: form.profissional_solicitante,
      recebido_por: form.recebido_por,
      lote: selectedArmaz.lote,
      quantidade: form.quantidade,
      finalidade: form.finalidade,
      entregue_por: user?.id,
      observacoes: form.observacoes,
    }, {
      onSuccess: (data: any) => {
        updateArmaz.mutate({ id: form.armazenamento_id, status: "distribuido", quantidade: Math.max(0, (selectedArmaz.quantidade || 0) - form.quantidade) });
        createLog.mutate({ entidade_id: data.id, entidade_tipo: "distribuicao", acao: `Distribuído para ${form.setor_destino}`, usuario_id: user?.id, detalhes: { lote: selectedArmaz.lote, setor: form.setor_destino } });
        setOpen(false);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Distribuição de Material</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-1"><Plus className="h-4 w-4" />Nova Distribuição</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Distribuir Material Esterilizado</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.armazenamento_id} onValueChange={(v) => setForm({ ...form, armazenamento_id: v })}>
                <SelectTrigger className="col-span-2"><SelectValue placeholder="Material disponível *" /></SelectTrigger>
                <SelectContent>
                  {availableArmaz.map((a: any) => (
                    <SelectItem key={a.id} value={a.id}>Lote {a.lote} — {a.local_armazenamento || "N/I"} (Qtd: {a.quantidade})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={form.setor_destino} onValueChange={(v) => setForm({ ...form, setor_destino: v })}>
                <SelectTrigger><SelectValue placeholder="Setor destino *" /></SelectTrigger>
                <SelectContent>{SETORES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="number" placeholder="Qtd" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: parseInt(e.target.value) || 1 })} />
              <Input placeholder="Solicitante" value={form.profissional_solicitante} onChange={(e) => setForm({ ...form, profissional_solicitante: e.target.value })} />
              <Input placeholder="Recebido por" value={form.recebido_por} onChange={(e) => setForm({ ...form, recebido_por: e.target.value })} />
              <Input placeholder="Finalidade" className="col-span-2" value={form.finalidade} onChange={(e) => setForm({ ...form, finalidade: e.target.value })} />
              <Textarea placeholder="Observações" className="col-span-2" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
            </div>
            <Button onClick={handleSave} disabled={createDistribuicao.isPending} className="w-full mt-2">Confirmar Distribuição</Button>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead><TableHead>Setor</TableHead><TableHead>Solicitante</TableHead>
                <TableHead>Recebido por</TableHead><TableHead>Lote</TableHead><TableHead>Qtd</TableHead><TableHead>Finalidade</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhuma distribuição</TableCell></TableRow>
              ) : filtered.map((d: any) => (
                <TableRow key={d.id}>
                  <TableCell className="text-xs">{formatDate(d.data_distribuicao)}</TableCell>
                  <TableCell>{d.setor_destino}</TableCell>
                  <TableCell className="text-xs">{d.profissional_solicitante || "—"}</TableCell>
                  <TableCell className="text-xs">{d.recebido_por || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{d.lote}</TableCell>
                  <TableCell>{d.quantidade}</TableCell>
                  <TableCell className="text-xs max-w-xs truncate">{d.finalidade || "—"}</TableCell>
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

// =================== DEVOLUÇÕES ===================
function DevolucoesTab({ search }: { search: string }) {
  const { data: devolucoes, isLoading } = useCmeDevolucoes();
  const { data: distribuicoes } = useCmeDistribuicoes();
  const createDevolucao = useCreateCmeDevolucao();
  const createLog = useCreateCmeLog();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    distribuicao_id: "", setor_devolvente: "", motivo: "nao_utilizado", usado: false,
    violacao_embalagem: false, validade_expirada: false, material_danificado: false,
    destino_final: "reprocessamento", observacoes: ""
  });

  const filtered = (devolucoes || []).filter((d: any) =>
    !search || d.setor_devolvente?.toLowerCase().includes(search.toLowerCase()) || d.motivo?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.setor_devolvente || !form.motivo) { toast({ title: "Campos obrigatórios", variant: "destructive" }); return; }
    const payload: any = { ...form, responsavel_id: user?.id };
    if (!payload.distribuicao_id) delete payload.distribuicao_id;
    createDevolucao.mutate(payload, {
      onSuccess: (data: any) => {
        createLog.mutate({ entidade_id: data.id, entidade_tipo: "devolucao", acao: `Devolução: ${form.motivo}`, usuario_id: user?.id, detalhes: { setor: form.setor_devolvente, destino: form.destino_final } });
        setOpen(false);
        setForm({ distribuicao_id: "", setor_devolvente: "", motivo: "nao_utilizado", usado: false, violacao_embalagem: false, validade_expirada: false, material_danificado: false, destino_final: "reprocessamento", observacoes: "" });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Devoluções e Reprocessamento</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-1"><Plus className="h-4 w-4" />Registrar Devolução</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Registrar Devolução</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
            <div className="space-y-3">
              {distribuicoes && (
                <Select value={form.distribuicao_id} onValueChange={(v) => setForm({ ...form, distribuicao_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Distribuição vinculada (opcional)" /></SelectTrigger>
                  <SelectContent>{distribuicoes.slice(0, 20).map((d: any) => <SelectItem key={d.id} value={d.id}>Lote {d.lote} — {d.setor_destino}</SelectItem>)}</SelectContent>
                </Select>
              )}
              <Select value={form.setor_devolvente} onValueChange={(v) => setForm({ ...form, setor_devolvente: v })}>
                <SelectTrigger><SelectValue placeholder="Setor devolvente *" /></SelectTrigger>
                <SelectContent>{SETORES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.motivo} onValueChange={(v) => setForm({ ...form, motivo: v })}>
                <SelectTrigger><SelectValue placeholder="Motivo *" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao_utilizado">Não utilizado</SelectItem>
                  <SelectItem value="embalagem_violada">Embalagem violada</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                  <SelectItem value="danificado">Danificado</SelectItem>
                  <SelectItem value="excedente">Excedente</SelectItem>
                  <SelectItem value="cirurgia_cancelada">Cirurgia cancelada</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2"><Checkbox checked={form.usado} onCheckedChange={(v) => setForm({ ...form, usado: !!v })} /><span className="text-sm">Material usado</span></div>
                <div className="flex items-center gap-2"><Checkbox checked={form.violacao_embalagem} onCheckedChange={(v) => setForm({ ...form, violacao_embalagem: !!v })} /><span className="text-sm">Embalagem violada</span></div>
                <div className="flex items-center gap-2"><Checkbox checked={form.validade_expirada} onCheckedChange={(v) => setForm({ ...form, validade_expirada: !!v })} /><span className="text-sm">Validade expirada</span></div>
                <div className="flex items-center gap-2"><Checkbox checked={form.material_danificado} onCheckedChange={(v) => setForm({ ...form, material_danificado: !!v })} /><span className="text-sm">Material danificado</span></div>
              </div>
              <Select value={form.destino_final} onValueChange={(v) => setForm({ ...form, destino_final: v })}>
                <SelectTrigger><SelectValue placeholder="Destino final" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="reprocessamento">Reprocessamento</SelectItem>
                  <SelectItem value="descarte">Descarte</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="reutilizacao_direta">Reutilização direta (válido)</SelectItem>
                </SelectContent>
              </Select>
              <Textarea placeholder="Observações" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
            </div>
            <Button onClick={handleSave} disabled={createDevolucao.isPending} className="w-full mt-2">Registrar Devolução</Button>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead><TableHead>Setor</TableHead><TableHead>Motivo</TableHead>
                <TableHead>Usado</TableHead><TableHead>Emb. Violada</TableHead><TableHead>Danificado</TableHead><TableHead>Destino</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhuma devolução</TableCell></TableRow>
              ) : filtered.map((d: any) => (
                <TableRow key={d.id} className={d.material_danificado ? "bg-red-50/50" : ""}>
                  <TableCell className="text-xs">{formatDate(d.data_devolucao)}</TableCell>
                  <TableCell>{d.setor_devolvente}</TableCell>
                  <TableCell className="capitalize text-xs">{d.motivo?.replace(/_/g, " ")}</TableCell>
                  <TableCell>{d.usado ? <CheckCircle2 className="h-4 w-4 text-orange-500" /> : <XCircle className="h-4 w-4 text-gray-400" />}</TableCell>
                  <TableCell>{d.violacao_embalagem ? <AlertTriangle className="h-4 w-4 text-red-500" /> : "—"}</TableCell>
                  <TableCell>{d.material_danificado ? <AlertTriangle className="h-4 w-4 text-red-500" /> : "—"}</TableCell>
                  <TableCell className="capitalize text-xs">{d.destino_final?.replace(/_/g, " ")}</TableCell>
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
  const filtered = (equipamentos || []).filter((e: any) => !search || e.nome?.toLowerCase().includes(search.toLowerCase()));
  const handleSave = () => { if (!form.nome) return; createEquipamento.mutate(form, { onSuccess: () => setOpen(false) }); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Equipamentos CME</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-1"><Plus className="h-4 w-4" />Novo Equipamento</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Cadastrar Equipamento</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
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
                  <SelectItem value="secadora">Secadora</SelectItem>
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
            <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Tipo</TableHead><TableHead>Modelo</TableHead><TableHead>Nº Série</TableHead><TableHead>Localização</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum equipamento</TableCell></TableRow> :
                filtered.map((e: any) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.nome}</TableCell>
                    <TableCell className="capitalize text-xs">{e.tipo?.replace(/_/g, " ")}</TableCell>
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
  const updateNC = useUpdateCmeNaoConformidade();
  const createLog = useCreateCmeLog();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tipo: "falha_esterilizacao", descricao: "", severidade: "media", acao_corretiva: "" });

  const handleSave = () => {
    if (!form.descricao) return;
    createNC.mutate({ ...form, responsavel_id: user?.id }, {
      onSuccess: (data: any) => {
        createLog.mutate({ entidade_id: data.id, entidade_tipo: "nc", acao: `NC aberta: ${form.tipo}`, usuario_id: user?.id });
        setOpen(false);
      }
    });
  };

  const resolveNC = (nc: any) => {
    updateNC.mutate({ id: nc.id, status: "resolvida", data_resolucao: new Date().toISOString() });
    createLog.mutate({ entidade_id: nc.id, entidade_tipo: "nc", acao: "NC resolvida", usuario_id: user?.id });
    toast({ title: "NC resolvida" });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Não Conformidades</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="destructive" className="gap-1"><Plus className="h-4 w-4" />Registrar NC</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Não Conformidade</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
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
                  <SelectItem value="contaminacao">Contaminação</SelectItem>
                  <SelectItem value="falha_equipamento">Falha de Equipamento</SelectItem>
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
                <TableHead>Severidade</TableHead><TableHead>Ação Corretiva</TableHead><TableHead>Status</TableHead><TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(ncs || []).length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhuma NC registrada</TableCell></TableRow>
              ) : (ncs || []).map((nc: any) => (
                <TableRow key={nc.id} className={nc.severidade === "critica" ? "bg-red-50/50" : ""}>
                  <TableCell className="text-xs">{formatDate(nc.data_ocorrencia)}</TableCell>
                  <TableCell className="capitalize text-xs">{nc.tipo?.replace(/_/g, " ")}</TableCell>
                  <TableCell className="max-w-xs truncate text-xs">{nc.descricao}</TableCell>
                  <TableCell><StatusBadge status={nc.severidade} /></TableCell>
                  <TableCell className="max-w-xs truncate text-xs">{nc.acao_corretiva || "—"}</TableCell>
                  <TableCell><StatusBadge status={nc.status} /></TableCell>
                  <TableCell>
                    {nc.status === "aberta" && (
                      <Button size="sm" variant="outline" onClick={() => resolveNC(nc)} className="text-green-600 gap-1">
                        <CheckCircle2 className="h-3 w-3" />Resolver
                      </Button>
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

// =================== RASTREABILIDADE COMPLETA ===================
function RastreabilidadeTab({ search }: { search: string }) {
  const { data: recebimentos } = useCmeRecebimentos();
  const { data: cargas } = useCmeCargas();
  const { data: distribuicoes } = useCmeDistribuicoes();
  const { data: testes } = useCmeTestes();
  const { data: etapas } = useCmeAllEtapas();
  const { data: devolucoes } = useCmeDevolucoes();
  const { data: ncs } = useCmeNaoConformidades();
  const { data: logs } = useCmeAllLogs();
  const [selectedLote, setSelectedLote] = useState("");
  const [selectedReceb, setSelectedReceb] = useState("");

  const lotes = Array.from(new Set([
    ...(cargas || []).map((c: any) => c.lote),
    ...(distribuicoes || []).map((d: any) => d.lote),
  ])).filter(Boolean).sort();

  const filteredLotes = lotes.filter(l => !search || l.toLowerCase().includes(search.toLowerCase()));

  // Build comprehensive timeline
  const timeline: { date: string; action: string; detail: string; status: string; user?: string; icon: string }[] = [];
  if (selectedLote) {
    const carga = (cargas || []).find((c: any) => c.lote === selectedLote);

    // Logs for entities related to this lote
    const relatedLogs = (logs || []).filter((l: any) => {
      if (carga && l.entidade_id === carga.id) return true;
      return false;
    });

    // Find recebimentos linked to this carga
    if (carga) {
      timeline.push({ date: carga.data_inicio, action: "Esterilização iniciada", detail: `Carga ${carga.numero_carga} — ${carga.metodo} — ${carga.temperatura}°C / ${carga.tempo_minutos}min`, status: "em_andamento", icon: "esterilizacao" });
      if (carga.data_fim) {
        timeline.push({ date: carga.data_fim, action: carga.resultado === "aprovado" ? "Carga APROVADA" : "Carga REPROVADA", detail: `Indicadores: Q:${carga.indicador_quimico || "N/I"} B:${carga.indicador_biologico || "N/I"}`, status: carga.resultado, icon: carga.resultado === "aprovado" ? "approved" : "rejected" });
      }
      if (carga.data_liberacao) {
        timeline.push({ date: carga.data_liberacao, action: "Liberado para armazenamento", detail: "Material liberado após aprovação dos testes", status: "liberado", icon: "storage" });
      }

      // Testes
      (testes || []).filter((t: any) => t.carga_id === carga.id).forEach((t: any) => {
        timeline.push({ date: t.data_teste, action: `Teste ${t.tipo_teste}`, detail: `Resultado: ${t.resultado} — Lote indicador: ${t.lote_indicador || "N/I"}`, status: t.resultado, icon: "test" });
      });

      // NCs
      (ncs || []).filter((nc: any) => nc.carga_id === carga.id).forEach((nc: any) => {
        timeline.push({ date: nc.data_ocorrencia, action: `NC: ${nc.tipo?.replace(/_/g, " ")}`, detail: nc.descricao, status: nc.status === "resolvida" ? "resolvida" : "aberta", icon: "nc" });
      });
    }

    // Distribuições
    (distribuicoes || []).filter((d: any) => d.lote === selectedLote).forEach((d: any) => {
      timeline.push({ date: d.data_distribuicao, action: "Distribuído", detail: `${d.setor_destino} — Solicitante: ${d.profissional_solicitante || "N/I"} — Recebido: ${d.recebido_por || "N/I"}`, status: d.status, icon: "distribution" });
    });

    // Devoluções linked to distribuições of this lote
    const distIds = (distribuicoes || []).filter((d: any) => d.lote === selectedLote).map((d: any) => d.id);
    (devolucoes || []).filter((dev: any) => distIds.includes(dev.distribuicao_id)).forEach((dev: any) => {
      timeline.push({ date: dev.data_devolucao, action: `Devolução: ${dev.motivo?.replace(/_/g, " ")}`, detail: `Setor: ${dev.setor_devolvente} — Destino: ${dev.destino_final}`, status: dev.destino_final === "reprocessamento" ? "reprocessar" : "devolvido", icon: "return" });
    });

    timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  const getIconColor = (icon: string) => {
    switch (icon) {
      case "approved": case "storage": case "distribution": return "bg-green-500";
      case "rejected": case "nc": return "bg-red-500";
      case "return": case "reprocessar": return "bg-orange-500";
      case "test": return "bg-blue-500";
      default: return "bg-primary";
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Rastreabilidade Completa por Lote</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Lotes ({filteredLotes.length})</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-1">
                {filteredLotes.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum lote</p> :
                  filteredLotes.map(l => (
                    <button key={l} onClick={() => setSelectedLote(l)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-mono transition-colors ${selectedLote === l ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                      {l}
                    </button>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Timeline — {selectedLote || "Selecione um lote"}</CardTitle></CardHeader>
          <CardContent>
            {!selectedLote ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Selecione um lote para ver a rastreabilidade completa</p>
            ) : timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Nenhum evento registrado</p>
            ) : (
              <div className="relative pl-6 space-y-6">
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border" />
                {timeline.map((ev, i) => (
                  <div key={i} className="relative">
                    <div className={`absolute -left-4 top-1 w-3 h-3 rounded-full border-2 border-background ${getIconColor(ev.icon)}`} />
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
  const updateDistribuicao = useUpdateCmeDistribuicao();
  const createLog = useCreateCmeLog();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ kit_id: "", sala: "", procedimento: "", cirurgiao: "", data_procedimento: "" });

  const ccDistrib = (distrib || []).filter((d: any) => d.setor_destino === "Centro Cirúrgico");

  const handleSave = () => {
    if (!form.procedimento) { toast({ title: "Procedimento obrigatório", variant: "destructive" }); return; }
    const avail = (armaz || []).find((a: any) => a.status === "disponivel");
    createDistribuicao.mutate({
      setor_destino: "Centro Cirúrgico",
      kit_id: form.kit_id || undefined,
      profissional_solicitante: form.cirurgiao,
      lote: avail?.lote || "A-DEFINIR",
      quantidade: 1,
      finalidade: `${form.procedimento}${form.sala ? ` — Sala ${form.sala}` : ""}`,
      entregue_por: user?.id,
      status: "solicitada",
    }, {
      onSuccess: (data: any) => {
        createLog.mutate({ entidade_id: data.id, entidade_tipo: "requisicao_cc", acao: `Requisição CC: ${form.procedimento}`, usuario_id: user?.id });
        setOpen(false);
      }
    });
  };

  const advanceReq = (d: any, newStatus: string) => {
    updateDistribuicao.mutate({ id: d.id, status: newStatus });
    createLog.mutate({ entidade_id: d.id, entidade_tipo: "requisicao_cc", acao: `Status: ${newStatus}`, usuario_id: user?.id });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Requisições — Centro Cirúrgico</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-1"><Plus className="h-4 w-4" />Nova Requisição CC</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Requisição de Material — Centro Cirúrgico</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              {kits && (
                <Select value={form.kit_id} onValueChange={(v) => setForm({ ...form, kit_id: v })}>
                  <SelectTrigger className="col-span-2"><SelectValue placeholder="Kit / Caixa Cirúrgica" /></SelectTrigger>
                  <SelectContent>{kits.filter((k: any) => k.status === "ativo").map((k: any) => <SelectItem key={k.id} value={k.id}>{k.nome} {k.especialidade ? `(${k.especialidade})` : ""}</SelectItem>)}</SelectContent>
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
              <TableHead>Lote</TableHead><TableHead>Status</TableHead><TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ccDistrib.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhuma requisição do CC</TableCell></TableRow>
            ) : ccDistrib.map((d: any) => (
              <TableRow key={d.id}>
                <TableCell className="text-xs">{formatDate(d.data_distribuicao)}</TableCell>
                <TableCell className="text-xs">{d.finalidade || "—"}</TableCell>
                <TableCell className="text-xs">{d.profissional_solicitante || "—"}</TableCell>
                <TableCell className="font-mono text-xs">{d.lote}</TableCell>
                <TableCell><StatusBadge status={d.status} /></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {d.status === "solicitada" && <Button size="sm" variant="outline" onClick={() => advanceReq(d, "em_separacao")}>Separar</Button>}
                    {d.status === "em_separacao" && <Button size="sm" variant="outline" onClick={() => advanceReq(d, "pronta")}>Pronta</Button>}
                    {d.status === "pronta" && <Button size="sm" variant="outline" className="text-green-600" onClick={() => advanceReq(d, "entregue")}>Entregar</Button>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// =================== RELATÓRIOS ===================
function RelatoriosTab() {
  const { data: recebimentos } = useCmeRecebimentos();
  const { data: cargas } = useCmeCargas();
  const { data: distribuicoes } = useCmeDistribuicoes();
  const { data: ncs } = useCmeNaoConformidades();
  const { data: testes } = useCmeTestes();
  const { data: devolucoes } = useCmeDevolucoes();
  const { data: etapas } = useCmeAllEtapas();

  const distBySector: Record<string, number> = {};
  (distribuicoes || []).forEach((d: any) => { distBySector[d.setor_destino] = (distBySector[d.setor_destino] || 0) + d.quantidade; });
  const sectorData = Object.entries(distBySector).map(([name, value]) => ({ name, value }));

  const cargaResults: Record<string, number> = {};
  (cargas || []).forEach((c: any) => { const r = c.resultado === "aprovado" ? "Aprovado" : c.resultado === "reprovado" ? "Reprovado" : "Em Andamento"; cargaResults[r] = (cargaResults[r] || 0) + 1; });
  const cargaData = Object.entries(cargaResults).map(([name, value]) => ({ name, value }));

  const recBySector: Record<string, number> = {};
  (recebimentos || []).forEach((r: any) => { recBySector[r.setor_origem] = (recBySector[r.setor_origem] || 0) + r.quantidade; });
  const recSectorData = Object.entries(recBySector).map(([name, value]) => ({ name, value }));

  const ncByType: Record<string, number> = {};
  (ncs || []).forEach((nc: any) => { ncByType[nc.tipo?.replace(/_/g, " ") || "Outros"] = (ncByType[nc.tipo?.replace(/_/g, " ") || "Outros"] || 0) + 1; });
  const ncData = Object.entries(ncByType).map(([name, value]) => ({ name, value }));

  const testeResults: Record<string, number> = {};
  (testes || []).forEach((t: any) => { const r = t.resultado === "conforme" ? "Conforme" : t.resultado === "nao_conforme" ? "Não Conforme" : "Pendente"; testeResults[r] = (testeResults[r] || 0) + 1; });
  const testeData = Object.entries(testeResults).map(([name, value]) => ({ name, value }));

  const devByMotivo: Record<string, number> = {};
  (devolucoes || []).forEach((d: any) => { devByMotivo[d.motivo?.replace(/_/g, " ") || "Outros"] = (devByMotivo[d.motivo?.replace(/_/g, " ") || "Outros"] || 0) + 1; });
  const devData = Object.entries(devByMotivo).map(([name, value]) => ({ name, value }));

  const totalCargas = (cargas || []).length;
  const aprovadas = (cargas || []).filter((c: any) => c.resultado === "aprovado").length;
  const taxaAprovacao = totalCargas > 0 ? ((aprovadas / totalCargas) * 100).toFixed(1) : "0";
  const totalDistribuido = (distribuicoes || []).reduce((s: number, d: any) => s + (d.quantidade || 0), 0);
  const ncAbertas = (ncs || []).filter((nc: any) => nc.status === "aberta").length;
  const totalDevolucoes = (devolucoes || []).length;
  const reprocessamentos = (devolucoes || []).filter((d: any) => d.destino_final === "reprocessamento").length;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Relatórios e Indicadores CME</h2>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-primary">{totalCargas}</p><p className="text-[10px] text-muted-foreground">Cargas</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-600">{taxaAprovacao}%</p><p className="text-[10px] text-muted-foreground">Aprovação</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-600">{totalDistribuido}</p><p className="text-[10px] text-muted-foreground">Distribuídos</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-red-600">{ncAbertas}</p><p className="text-[10px] text-muted-foreground">NC Abertas</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-orange-600">{totalDevolucoes}</p><p className="text-[10px] text-muted-foreground">Devoluções</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-purple-600">{reprocessamentos}</p><p className="text-[10px] text-muted-foreground">Reprocessamentos</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Distribuição por Setor</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RPieChart><Pie data={sectorData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>{sectorData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}</Pie><Tooltip /></RPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Cargas por Resultado</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={cargaData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#6366f1" radius={[4,4,0,0]} /></BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Recebimentos por Setor</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={recSectorData} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" allowDecimals={false} /><YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} /><Tooltip /><Bar dataKey="value" fill="#22c55e" radius={[0,4,4,0]} /></BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Testes de Qualidade</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RPieChart><Pie data={testeData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>{testeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}</Pie><Tooltip /><Legend /></RPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {devData.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Devoluções por Motivo</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={devData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#f59e0b" radius={[4,4,0,0]} /></BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {ncData.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">NC por Tipo</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ncData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#ef4444" radius={[4,4,0,0]} /></BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// =================== AUDITORIA / LOGS ===================
function AuditoriaTab({ search }: { search: string }) {
  const { data: logs, isLoading } = useCmeAllLogs();

  const filtered = (logs || []).filter((l: any) =>
    !search || l.acao?.toLowerCase().includes(search.toLowerCase()) || l.entidade_tipo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Log de Auditoria CME</h2>
      <p className="text-sm text-muted-foreground">Registro imutável de todas as ações realizadas no módulo CME</p>
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead><TableHead>Entidade</TableHead><TableHead>Ação</TableHead>
                <TableHead>Detalhes</TableHead><TableHead>ID Entidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum log registrado</TableCell></TableRow>
              ) : filtered.slice(0, 100).map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs">{formatDate(l.created_at)}</TableCell>
                  <TableCell className="capitalize text-xs"><Badge variant="outline">{l.entidade_tipo}</Badge></TableCell>
                  <TableCell className="text-xs">{l.acao}</TableCell>
                  <TableCell className="text-xs max-w-xs truncate">{l.detalhes ? JSON.stringify(l.detalhes) : "—"}</TableCell>
                  <TableCell className="font-mono text-[10px]">{l.entidade_id?.slice(0, 8)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
