import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Plus, Search, Edit2, UserCheck, UserX, Users, Stethoscope, ChevronLeft, ChevronRight } from "lucide-react";
import { useSolicitantes, useSaveSolicitante, useLookupTables, type Solicitante } from "@/hooks/useSolicitantes";
import { toast } from "sonner";

/* ── Masks ── */
const maskCPF = (v: string) => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
const maskCEP = (v: string) => v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
};

const emptyForm: Partial<Solicitante> = {
  nome: '', conselho: '', sigla: '', cpf: '', situacao_id: null, unidade_id: null,
  cbo_id: null, tipo_conselho_id: null, login: null, senha: null,
  cep: null, endereco: null, numero: null, complemento: null, bairro: null, estado: null, cidade: null, fone1: null, fone2: null,
  produtividade_habilitado: false, produtividade_percentual: 0,
  produtividade_perc_recebe_vl_caixa: 0, produtividade_perc_recebe_vl_convenio: 0,
  produtividade_perc_desconto_vl_caixa: 0, produtividade_perc_desconto_vl_convenio: 0,
};

const estados = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export default function SolicitantesPage() {
  const { data: solicitantes = [], isLoading } = useSolicitantes();
  const save = useSaveSolicitante();
  const { situacoes, conselhos, cbos, unidades } = useLookupTables();

  const [search, setSearch] = useState('');
  const [filterSituacao, setFilterSituacao] = useState<string>('all');
  const [filterUnidade, setFilterUnidade] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Partial<Solicitante>>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);

  const situacaoAtiva = situacoes.data?.find(s => s.nome === 'Ativo');

  const filtered = solicitantes.filter(s => {
    const q = search.toLowerCase();
    if (q && !s.nome.toLowerCase().includes(q) && !s.cpf.includes(q) && !s.conselho.toLowerCase().includes(q) && !s.sigla.toLowerCase().includes(q)) return false;
    if (filterSituacao !== 'all' && s.situacao_id !== filterSituacao) return false;
    if (filterUnidade !== 'all' && s.unidade_id !== filterUnidade) return false;
    return true;
  });

  const openNew = () => {
    setEditId(null);
    setForm({ ...emptyForm, situacao_id: situacaoAtiva?.id ?? null, cbo_id: cbos.data?.find(c => c.codigo === '000000')?.id ?? null });
    setDialogOpen(true);
  };

  const openEdit = (s: Solicitante) => {
    setEditId(s.id);
    setForm({ ...s });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nome?.trim()) { toast.error('Nome é obrigatório'); return; }
    if (!form.conselho?.trim()) { toast.error('Conselho é obrigatório'); return; }
    if (!form.sigla?.trim()) { toast.error('Sigla é obrigatória'); return; }
    if (!form.cpf || form.cpf.replace(/\D/g, '').length < 11) { toast.error('CPF inválido'); return; }
    if (!form.situacao_id) { toast.error('Situação é obrigatória'); return; }
    if (!form.cbo_id) { toast.error('CBO é obrigatório'); return; }
    await save.mutateAsync({ ...form, id: editId ?? undefined } as any);
    setDialogOpen(false);
  };

  const getSituacaoNome = (id: string | null) => situacoes.data?.find(s => s.id === id)?.nome ?? '—';
  const getUnidadeNome = (id: string | null) => unidades.data?.find(u => u.id === id)?.nome ?? '—';

  const set = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">Início</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Solicitantes</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Stethoscope className="h-7 w-7 text-primary" /> Cadastro de Solicitantes
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Gerenciamento de profissionais solicitantes do sistema</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Novo Solicitante</Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome, CPF, conselho ou sigla..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterSituacao} onValueChange={setFilterSituacao}>
              <SelectTrigger><SelectValue placeholder="Situação" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas situações</SelectItem>
                {situacoes.data?.map(s => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterUnidade} onValueChange={setFilterUnidade}>
              <SelectTrigger><SelectValue placeholder="Unidade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas unidades</SelectItem>
                {unidades.data?.map(u => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" /> Solicitantes ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Conselho</TableHead>
                  <TableHead>Sigla</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead className="w-20">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum solicitante encontrado</TableCell></TableRow>
                ) : filtered.map(s => (
                  <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openEdit(s)}>
                    <TableCell className="font-medium">{s.nome}</TableCell>
                    <TableCell>{s.conselho}</TableCell>
                    <TableCell>{s.sigla}</TableCell>
                    <TableCell className="font-mono text-xs">{maskCPF(s.cpf)}</TableCell>
                    <TableCell>
                      <Badge variant={getSituacaoNome(s.situacao_id) === 'Ativo' ? 'default' : 'secondary'}>
                        {getSituacaoNome(s.situacao_id)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getUnidadeNome(s.unidade_id)}</TableCell>
                    <TableCell><Button variant="ghost" size="icon"><Edit2 className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{editId ? 'Editar Solicitante' : 'Novo Solicitante'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-2">
            {/* Dados Principais */}
            <section>
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Dados Principais</h3>
              <Separator className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label>Nome *</Label>
                  <Input value={form.nome ?? ''} onChange={e => set('nome', e.target.value)} placeholder="Nome completo" />
                </div>
                <div>
                  <Label>CPF *</Label>
                  <Input value={form.cpf ? maskCPF(form.cpf) : ''} onChange={e => set('cpf', e.target.value.replace(/\D/g, ''))} placeholder="000.000.000-00" />
                </div>
                <div>
                  <Label>Tipo de Conselho</Label>
                  <Select value={form.tipo_conselho_id ?? ''} onValueChange={v => set('tipo_conselho_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {conselhos.data?.map(c => <SelectItem key={c.id} value={c.id}>{c.sigla} — {c.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Conselho *</Label>
                  <Input value={form.conselho ?? ''} onChange={e => set('conselho', e.target.value)} placeholder="Nº do conselho" />
                </div>
                <div>
                  <Label>Sigla *</Label>
                  <Input value={form.sigla ?? ''} onChange={e => set('sigla', e.target.value)} placeholder="Ex: CRM" />
                </div>
                <div>
                  <Label>Situação *</Label>
                  <Select value={form.situacao_id ?? ''} onValueChange={v => set('situacao_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {situacoes.data?.map(s => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Unidade</Label>
                  <Select value={form.unidade_id ?? ''} onValueChange={v => set('unidade_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {unidades.data?.map(u => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>CBO *</Label>
                  <Select value={form.cbo_id ?? ''} onValueChange={v => set('cbo_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {cbos.data?.map(c => <SelectItem key={c.id} value={c.id}>{c.codigo} — {c.descricao}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Login</Label>
                  <Input value={form.login ?? ''} onChange={e => set('login', e.target.value)} />
                </div>
                <div>
                  <Label>Senha</Label>
                  <Input type="password" value={form.senha ?? ''} onChange={e => set('senha', e.target.value)} />
                </div>
              </div>
            </section>

            {/* Endereço */}
            <section>
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Endereço e Contato</h3>
              <Separator className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>CEP</Label>
                  <Input value={form.cep ? maskCEP(form.cep) : ''} onChange={e => set('cep', e.target.value.replace(/\D/g, ''))} placeholder="00000-000" />
                </div>
                <div className="md:col-span-2">
                  <Label>Endereço</Label>
                  <Input value={form.endereco ?? ''} onChange={e => set('endereco', e.target.value)} />
                </div>
                <div>
                  <Label>Número</Label>
                  <Input value={form.numero ?? ''} onChange={e => set('numero', e.target.value)} />
                </div>
                <div>
                  <Label>Complemento</Label>
                  <Input value={form.complemento ?? ''} onChange={e => set('complemento', e.target.value)} />
                </div>
                <div>
                  <Label>Bairro</Label>
                  <Input value={form.bairro ?? ''} onChange={e => set('bairro', e.target.value)} />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Select value={form.estado ?? ''} onValueChange={v => set('estado', v)}>
                    <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                    <SelectContent>{estados.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Input value={form.cidade ?? ''} onChange={e => set('cidade', e.target.value)} />
                </div>
                <div>
                  <Label>Fone 1</Label>
                  <Input value={form.fone1 ? maskPhone(form.fone1) : ''} onChange={e => set('fone1', e.target.value.replace(/\D/g, ''))} placeholder="(00) 00000-0000" />
                </div>
                <div>
                  <Label>Fone 2</Label>
                  <Input value={form.fone2 ? maskPhone(form.fone2) : ''} onChange={e => set('fone2', e.target.value.replace(/\D/g, ''))} placeholder="(00) 00000-0000" />
                </div>
              </div>
            </section>

            {/* Produtividade */}
            <section>
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Produtividade</h3>
              <Separator className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Switch checked={form.produtividade_habilitado ?? false} onCheckedChange={v => set('produtividade_habilitado', v)} />
                  <Label>Produtividade habilitada</Label>
                </div>
                <div>
                  <Label>Percentual (%)</Label>
                  <Input type="number" step="0.01" value={form.produtividade_percentual ?? 0} onChange={e => set('produtividade_percentual', parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <Label>% Recebe Vl Caixa</Label>
                  <Input type="number" step="0.01" value={form.produtividade_perc_recebe_vl_caixa ?? 0} onChange={e => set('produtividade_perc_recebe_vl_caixa', parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <Label>% Recebe Vl Convênio</Label>
                  <Input type="number" step="0.01" value={form.produtividade_perc_recebe_vl_convenio ?? 0} onChange={e => set('produtividade_perc_recebe_vl_convenio', parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <Label>% Desconto Vl Caixa</Label>
                  <Input type="number" step="0.01" value={form.produtividade_perc_desconto_vl_caixa ?? 0} onChange={e => set('produtividade_perc_desconto_vl_caixa', parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <Label>% Desconto Vl Convênio</Label>
                  <Input type="number" step="0.01" value={form.produtividade_perc_desconto_vl_convenio ?? 0} onChange={e => set('produtividade_perc_desconto_vl_convenio', parseFloat(e.target.value) || 0)} />
                </div>
              </div>
            </section>

            {/* Auditoria (somente leitura no modo edição) */}
            {editId && (
              <section>
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Auditoria</h3>
                <Separator className="mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground block">Criado em</span>
                    {form.created_at ? new Date(form.created_at).toLocaleString('pt-BR') : '—'}
                  </div>
                  <div>
                    <span className="font-medium text-foreground block">Modificado em</span>
                    {form.updated_at ? new Date(form.updated_at).toLocaleString('pt-BR') : '—'}
                  </div>
                  <div>
                    <span className="font-medium text-foreground block">Criado por</span>
                    {form.user_id ?? '—'}
                  </div>
                  <div>
                    <span className="font-medium text-foreground block">Modificado por</span>
                    {form.user_modified ?? '—'}
                  </div>
                </div>
              </section>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                {editId && (
                  <Button variant="outline" size="sm" onClick={() => {
                    const inativoId = situacoes.data?.find(s => s.nome === 'Inativo')?.id;
                    const ativoId = situacoes.data?.find(s => s.nome === 'Ativo')?.id;
                    const isAtivo = form.situacao_id === ativoId;
                    set('situacao_id', isAtivo ? inativoId : ativoId);
                  }}>
                    {form.situacao_id === situacoes.data?.find(s => s.nome === 'Ativo')?.id
                      ? <><UserX className="h-4 w-4 mr-2" /> Inativar</>
                      : <><UserCheck className="h-4 w-4 mr-2" /> Reativar</>
                    }
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave} disabled={save.isPending}>{save.isPending ? 'Salvando...' : 'Salvar'}</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
