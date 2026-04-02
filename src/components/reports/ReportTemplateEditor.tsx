import { useState, useMemo, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronUp, ChevronDown, AlignLeft, AlignCenter, AlignRight,
  Eye, BookOpen, LayoutTemplate, Table2, PanelTop, Settings2,
  ArrowUpDown, Save, Zap, ListFilter, ZoomIn, ZoomOut, Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ReportTemplate, ReportField } from "@/lib/reportEngine";
import { AGENDA_FIELDS, SAMPLE_REPORT_ROWS } from "@/lib/reportEngine";
import ReportPreview from "./ReportPreview";

interface Props {
  template: ReportTemplate | null;
  module: string;
  open: boolean;
  onSave: (template: ReportTemplate) => void;
  onClose: () => void;
}

type Tab = "geral" | "layout" | "colunas" | "cabecalho" | "rodape" | "agrupamento" | "preview";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "geral",       label: "Geral",          icon: BookOpen      },
  { id: "layout",      label: "Layout",         icon: LayoutTemplate },
  { id: "colunas",     label: "Colunas",        icon: Table2        },
  { id: "cabecalho",   label: "Cabeçalho",      icon: PanelTop      },
  { id: "rodape",      label: "Rodapé",         icon: Settings2     },
  { id: "agrupamento", label: "Agrupamento",    icon: ArrowUpDown   },
  { id: "preview",     label: "Preview",        icon: Eye           },
];

function makeBlank(module: string): ReportTemplate {
  return {
    id: `custom-${Date.now()}`,
    name: "Novo Modelo",
    title: "",
    subtitle: "",
    showLogo: true,
    unitName: "",
    description: "",
    module: module as ReportTemplate["module"],
    isSystem: false,
    isDefault: false,
    active: true,
    orientation: "landscape",
    pageSize: "a4",
    margins: "normal",
    density: "normal",
    borderStyle: "light",
    lineSpacing: "normal",
    fields: AGENDA_FIELDS.map((f) => ({ ...f })),
    groupBy: undefined,
    pageBreakOnGroup: false,
    sortBy: "scheduled_time",
    sortOrder: "asc",
    showTotals: true,
    showSubtotals: false,
    showHeader: true,
    showFilters: true,
    showPeriod: true,
    showEmissionDate: true,
    showInstitution: true,
    showFooter: true,
    showPageNumbers: true,
    footerText: "",
    showUser: false,
    footerShowDate: false,
    footerPaginationFormat: "page_of_total",
    footerInstitutionalNote: "",
    footerShowSignatureLine: false,
    enablePrint: true,
    enablePdf: true,
    isShared: false,
    createdAt: new Date().toISOString(),
  };
}

export default function ReportTemplateEditor({ template, module, open, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<ReportTemplate>(() =>
    template ? { ...template, fields: template.fields.map((f) => ({ ...f })) } : makeBlank(module)
  );
  const [activeTab, setActiveTab] = useState<Tab>("geral");
  const [zoom, setZoom] = useState(65); // percent
  const previewScrollRef = useRef<HTMLDivElement>(null);

  // Re-initialize draft when dialog opens
  useMemo(() => {
    if (open) {
      setDraft(template ? { ...template, fields: template.fields.map((f) => ({ ...f })) } : makeBlank(module));
      setActiveTab("geral");
    }
  }, [open, template, module]);

  function patch(p: Partial<ReportTemplate>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  function patchField(key: string, p: Partial<ReportField>) {
    setDraft((d) => ({
      ...d,
      fields: d.fields.map((f) => (f.key === key ? { ...f, ...p } : f)),
    }));
  }

  function moveField(idx: number, dir: -1 | 1) {
    const next = [...draft.fields];
    const t = idx + dir;
    if (t < 0 || t >= next.length) return;
    [next[idx], next[t]] = [next[t], next[idx]];
    setDraft((d) => ({ ...d, fields: next }));
  }

  function handleSave() {
    if (!draft.name.trim()) { toast.error("Informe o nome do modelo"); return; }
    onSave({ ...draft, updatedAt: new Date().toISOString() });
  }

  const sampleFilters = { startDate: "2026-04-02", endDate: "2026-04-02" };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[96vw] w-[1320px] h-[92vh] max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">

        {/* ── Dialog Header ── */}
        <DialogHeader className="px-6 py-4 border-b shrink-0 bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                {template ? `Editando: ${template.name}` : "Novo Modelo de Relatório"}
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Configure o modelo e veja o preview em tempo real no painel à direita
              </DialogDescription>
            </div>
            <Badge variant="outline" className="text-xs gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", draft.active ? "bg-emerald-500" : "bg-muted-foreground")} />
              {draft.active ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </DialogHeader>

        {/* ── Main Split ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ── Left Panel: Tab nav + form ── */}
          <div className="flex flex-col w-[560px] shrink-0 border-r overflow-hidden">
            {/* Tab bar */}
            <div className="border-b bg-muted/20 px-3 pt-3 pb-0 shrink-0">
              <div className="flex gap-0.5 overflow-x-auto pb-0">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-t-md text-xs font-medium whitespace-nowrap transition-colors border-b-2 shrink-0",
                      activeTab === id
                        ? "border-primary text-primary bg-background"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <ScrollArea className="flex-1">
              <div className="p-5 space-y-5">
                {activeTab === "geral"       && <TabGeral draft={draft} patch={patch} />}
                {activeTab === "layout"      && <TabLayout draft={draft} patch={patch} />}
                {activeTab === "colunas"     && <TabColunas draft={draft} patchField={patchField} moveField={moveField} />}
                {activeTab === "cabecalho"   && <TabCabecalho draft={draft} patch={patch} />}
                {activeTab === "rodape"      && <TabRodape draft={draft} patch={patch} />}
                {activeTab === "agrupamento" && <TabAgrupamento draft={draft} patch={patch} />}
                {activeTab === "preview" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-700">
                      <ListFilter className="h-3.5 w-3.5 shrink-0" />
                      Preview com dados de exemplo. O resultado real usará os dados filtrados da agenda.
                    </div>
                    <div className="border rounded-lg overflow-hidden shadow-sm">
                      <ReportPreview
                        template={draft}
                        filters={sampleFilters}
                        rows={SAMPLE_REPORT_ROWS}
                        companyName={draft.unitName || "Zurich 2.0"}
                      />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* ── Right Panel: Live preview with zoom controls ── */}
          <div className="flex-1 min-w-0 bg-slate-50 flex flex-col overflow-hidden">
            {/* Zoom toolbar */}
            <div className="px-4 py-2 border-b bg-white flex items-center justify-between shrink-0">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Eye className="h-3.5 w-3.5" /> Prévia em tempo real
                <span className="text-[10px] font-normal text-muted-foreground italic normal-case">dados de exemplo</span>
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost" size="icon" className="h-7 w-7"
                  title="Reduzir zoom"
                  onClick={() => setZoom((z) => Math.max(30, z - 10))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs w-10 text-center tabular-nums">{zoom}%</span>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7"
                  title="Aumentar zoom"
                  onClick={() => setZoom((z) => Math.min(150, z + 10))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <div className="w-px h-5 bg-border mx-1" />
                {[50, 75, 100].map((z) => (
                  <button
                    key={z}
                    onClick={() => setZoom(z)}
                    className={cn(
                      "text-[10px] px-2 py-1 rounded transition-colors",
                      zoom === z ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
                    )}
                  >
                    {z}%
                  </button>
                ))}
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 ml-1"
                  title="Ajustar à largura"
                  onClick={() => setZoom(65)}
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Scrollable preview area */}
            <div
              ref={previewScrollRef}
              className="flex-1 overflow-auto"
              style={{ background: "#e8edf2" }}
            >
              <div
                style={{
                  transformOrigin: "top center",
                  transform: `scale(${zoom / 100})`,
                  width: `${(100 * 100) / zoom}%`,
                  minHeight: `${(100 * 100) / zoom}%`,
                  padding: "24px",
                  transition: "transform 0.15s ease",
                }}
              >
                <div className="border rounded-lg overflow-hidden shadow-xl bg-white" style={{ maxWidth: draft.orientation === "landscape" ? "297mm" : "210mm", margin: "0 auto" }}>
                  <ReportPreview
                    template={draft}
                    filters={sampleFilters}
                    rows={SAMPLE_REPORT_ROWS}
                    companyName={draft.unitName || "Zurich 2.0"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <DialogFooter className="px-6 py-3 border-t bg-muted/20 shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{draft.orientation === "landscape" ? "📄 Paisagem" : "🗒 Retrato"}</span>
              <span>·</span>
              <span>{(draft.pageSize ?? "a4").toUpperCase()}</span>
              <span>·</span>
              <span>{draft.fields.filter((f) => f.visible).length} colunas</span>
              <span>·</span>
              <span>Densidade {draft.density ?? "normal"}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Modelo
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════
// TAB COMPONENTS
// ═══════════════════════════════════════════════════

function TabGeral({ draft, patch }: { draft: ReportTemplate; patch: (p: Partial<ReportTemplate>) => void }) {
  return (
    <>
      <Section title="Identidade">
        <Field label="Nome do modelo" hint="Identificador interno — aparece na lista de seleção">
          <Input value={draft.name} onChange={(e) => patch({ name: e.target.value })} className="h-9 text-sm" />
        </Field>
        <Field label="Descrição interna">
          <Input value={draft.description} onChange={(e) => patch({ description: e.target.value })} className="h-9 text-sm" placeholder="Descrição opcional" />
        </Field>
      </Section>

      <Section title="Disponibilidade">
        <Toggle label="Modelo ativo" sub="Aparece na lista para seleção de usuários" value={draft.active} onChange={(v) => patch({ active: v })} />
        <Toggle label="Modelo padrão" sub="Pré-selecionado ao abrir o módulo de relatórios" value={draft.isDefault} onChange={(v) => patch({ isDefault: v })} />
        <Toggle label="Compartilhado com outros usuários" sub="Visível para todos os perfis na instituição" value={!!draft.isShared} onChange={(v) => patch({ isShared: v })} />
      </Section>

      <Section title="Uso">
        <Toggle label="Disponível para impressão" sub="Utilizável via botão Imprimir" value={draft.enablePrint !== false} onChange={(v) => patch({ enablePrint: v })} />
        <Toggle label="Disponível para exportação PDF" sub="Utilizável via botão PDF" value={draft.enablePdf !== false} onChange={(v) => patch({ enablePdf: v })} />
      </Section>
    </>
  );
}

function TabLayout({ draft, patch }: { draft: ReportTemplate; patch: (p: Partial<ReportTemplate>) => void }) {
  return (
    <>
      <Section title="Página">
        <Field label="Orientação">
          <div className="flex gap-2 mt-1">
            {(["portrait", "landscape"] as const).map((o) => (
              <button
                key={o}
                onClick={() => patch({ orientation: o })}
                className={cn(
                  "flex-1 py-2.5 rounded-md border text-xs font-medium transition-colors",
                  draft.orientation === o
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted"
                )}
              >
                {o === "portrait" ? "🗒 Retrato" : "📄 Paisagem"}
              </button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tamanho do papel">
            <Select value={draft.pageSize ?? "a4"} onValueChange={(v: any) => patch({ pageSize: v })}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="a4">A4 (297 × 210 mm)</SelectItem>
                <SelectItem value="letter">Carta (279 × 216 mm)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Margens">
            <Select value={draft.margins ?? "normal"} onValueChange={(v: any) => patch({ margins: v })}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="narrow">Estreita — 10mm</SelectItem>
                <SelectItem value="normal">Normal — 15mm</SelectItem>
                <SelectItem value="wide">Larga — 20mm</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Section>

      <Section title="Aparência da tabela">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Densidade visual">
            <Select value={draft.density ?? "normal"} onValueChange={(v: any) => patch({ density: v })}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compacta</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="comfortable">Espaçada</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Espaçamento entre linhas">
            <Select value={draft.lineSpacing ?? "normal"} onValueChange={(v: any) => patch({ lineSpacing: v })}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tight">Apertado</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="relaxed">Relaxado</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Bordas da tabela">
            <Select value={draft.borderStyle ?? "light"} onValueChange={(v: any) => patch({ borderStyle: v })}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem bordas</SelectItem>
                <SelectItem value="light">Bordas leves</SelectItem>
                <SelectItem value="full">Bordas completas</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Section>
    </>
  );
}

function TabColunas({ draft, patchField, moveField }: {
  draft: ReportTemplate;
  patchField: (key: string, p: Partial<ReportField>) => void;
  moveField: (idx: number, dir: -1 | 1) => void;
}) {
  const visibleCount = draft.fields.filter((f) => f.visible).length;
  return (
    <>
      <div>
        <p className="text-sm font-semibold">Colunas do relatório</p>
        <p className="text-xs text-muted-foreground mt-0.5">{visibleCount} de {draft.fields.length} campos visíveis · Edite o label, largura e alinhamento</p>
      </div>

      <div className="rounded-md border overflow-hidden text-xs">
        <div
          className="grid bg-muted/60 border-b px-3 py-2 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider"
          style={{ gridTemplateColumns: "32px 1fr 80px 92px 32px 32px" }}
        >
          <span></span>
          <span>Campo / Label</span>
          <span>Largura</span>
          <span>Alinhamento</span>
          <span></span>
          <span></span>
        </div>

        {draft.fields.map((field, idx) => (
          <div
            key={field.key}
            className={cn(
              "grid items-center px-3 py-2.5 border-b last:border-0 gap-2 transition-colors",
              field.visible ? "bg-background" : "bg-muted/20 opacity-60"
            )}
            style={{ gridTemplateColumns: "32px 1fr 80px 92px 32px 32px" }}
          >
            <Switch
              checked={field.visible}
              onCheckedChange={(v) => patchField(field.key, { visible: v })}
              className="scale-[0.7] origin-left"
            />

            <div className="min-w-0">
              <Input
                value={field.label}
                onChange={(e) => patchField(field.key, { label: e.target.value })}
                className="h-7 text-xs px-2 mb-0.5"
                placeholder={field.key}
              />
              <span className="text-[10px] text-muted-foreground font-mono">{field.key}</span>
            </div>

            <Input
              value={field.width === "auto" ? "" : (field.width ?? "")}
              onChange={(e) => patchField(field.key, { width: e.target.value || "auto" })}
              className="h-7 text-xs px-2"
              placeholder="auto"
            />

            <div className="flex gap-0.5">
              {(["left", "center", "right"] as const).map((a) => {
                const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
                return (
                  <button
                    key={a}
                    onClick={() => patchField(field.key, { align: a })}
                    className={cn(
                      "h-7 w-7 rounded flex items-center justify-center transition-colors",
                      field.align === a ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>

            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === 0} onClick={() => moveField(idx, -1)}>
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === draft.fields.length - 1} onClick={() => moveField(idx, 1)}>
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}

function TabCabecalho({ draft, patch }: { draft: ReportTemplate; patch: (p: Partial<ReportTemplate>) => void }) {
  return (
    <>
      <Section title="Exibição geral">
        <Toggle label="Exibir cabeçalho" sub="Bloco superior com logotipo, título e dados da emissão" value={draft.showHeader} onChange={(v) => patch({ showHeader: v })} />
        <Toggle label="Exibir logotipo" sub="Símbolo institucional à esquerda do cabeçalho" value={draft.showLogo !== false} onChange={(v) => patch({ showLogo: v })} />
      </Section>

      <Section title="Textos do cabeçalho">
        <Field label="Nome da instituição / Unidade">
          <Input value={draft.unitName ?? ""} onChange={(e) => patch({ unitName: e.target.value })} className="h-9 text-sm" placeholder="Ex.: Clínica Zurich" />
        </Field>
        <Field label="Título do relatório" hint="Aparece em destaque no lado direito do cabeçalho">
          <Input value={draft.title ?? ""} onChange={(e) => patch({ title: e.target.value })} className="h-9 text-sm" placeholder="Ex.: Mapa de Agendamentos do Dia" />
        </Field>
        <Field label="Subtítulo" hint="Texto secundário abaixo do título">
          <Input value={draft.subtitle ?? ""} onChange={(e) => patch({ subtitle: e.target.value })} className="h-9 text-sm" placeholder="Ex.: Lista completa de agendamentos" />
        </Field>
      </Section>

      <Section title="Informações no cabeçalho">
        <Toggle label="Exibir período" sub="Datas inicial e final dos filtros" value={draft.showPeriod !== false} onChange={(v) => patch({ showPeriod: v })} />
        <Toggle label="Exibir filtros aplicados" sub="Agenda, situação, turno, tipo, etc." value={draft.showFilters} onChange={(v) => patch({ showFilters: v })} />
        <Toggle label="Exibir data e hora de emissão" sub="Momento em que o relatório foi gerado" value={draft.showEmissionDate !== false} onChange={(v) => patch({ showEmissionDate: v })} />
        <Toggle label="Exibir nome da instituição" sub="Nomear a unidade que emitiu o relatório" value={draft.showInstitution !== false} onChange={(v) => patch({ showInstitution: v })} />
        <Toggle label="Exibir nome do usuário emissor" sub="Nome de quem gerou o relatório" value={!!draft.showUser} onChange={(v) => patch({ showUser: v })} />
      </Section>
    </>
  );
}

function TabRodape({ draft, patch }: { draft: ReportTemplate; patch: (p: Partial<ReportTemplate>) => void }) {
  return (
    <>
      <Section title="Paginação">
        <Toggle label="Exibir rodapé" sub="Linha inferior com totais e informações adicionais" value={draft.showFooter} onChange={(v) => patch({ showFooter: v })} />
        <Toggle label="Exibir número de página" sub="Página X ou Página X de Y" value={draft.showPageNumbers} onChange={(v) => patch({ showPageNumbers: v })} />
        {draft.showPageNumbers && (
          <Field label="Formato da paginação">
            <Select value={draft.footerPaginationFormat ?? "page_of_total"} onValueChange={(v: any) => patch({ footerPaginationFormat: v })}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="page_of_total">Página X de Y</SelectItem>
                <SelectItem value="page_only">Página X</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        )}
      </Section>

      <Section title="Textos do rodapé">
        <Field label="Texto fixo do rodapé" hint="Aparece no lado esquerdo do rodapé">
          <Input value={draft.footerText ?? ""} onChange={(e) => patch({ footerText: e.target.value })} className="h-9 text-sm" placeholder="Ex.: Uso interno — confidencial" />
        </Field>
        <Field label="Observação institucional" hint="Texto complementar de identificação">
          <Textarea
            value={draft.footerInstitutionalNote ?? ""}
            onChange={(e) => patch({ footerInstitutionalNote: e.target.value })}
            className="text-sm resize-none"
            rows={2}
            placeholder="Ex.: Documento gerado automaticamente pelo sistema Zurich 2.0"
          />
        </Field>
      </Section>

      <Section title="Informações adicionais">
        <Toggle label="Exibir data e hora no rodapé" value={!!draft.footerShowDate} onChange={(v) => patch({ footerShowDate: v })} />
        <Toggle label="Exibir nome do usuário emissor" value={!!draft.showUser} onChange={(v) => patch({ showUser: v })} />
        <Toggle label="Exibir linha de assinatura" sub="Linha em branco para assinatura ao final do documento" value={!!draft.footerShowSignatureLine} onChange={(v) => patch({ footerShowSignatureLine: v })} />
      </Section>
    </>
  );
}

function TabAgrupamento({ draft, patch }: { draft: ReportTemplate; patch: (p: Partial<ReportTemplate>) => void }) {
  const visibleFields = draft.fields.filter((f) => f.visible);

  return (
    <>
      <Section title="Agrupamento">
        <Field label="Agrupar por">
          <Select value={draft.groupBy ?? "__none__"} onValueChange={(v) => patch({ groupBy: v === "__none__" ? undefined : v })}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Sem agrupamento</SelectItem>
              {visibleFields.map((f) => <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        {draft.groupBy && (
          <>
            <Toggle label="Quebrar página por grupo" sub="Nova página a cada mudança de grupo" value={!!draft.pageBreakOnGroup} onChange={(v) => patch({ pageBreakOnGroup: v })} />
            <Toggle label="Exibir subtotal por grupo" sub="Contagem de registros ao final de cada grupo" value={!!draft.showSubtotals} onChange={(v) => patch({ showSubtotals: v })} />
          </>
        )}
      </Section>

      <Section title="Ordenação dos dados">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ordenar por">
            <Select value={draft.sortBy ?? "__none__"} onValueChange={(v) => patch({ sortBy: v === "__none__" ? undefined : v })}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Padrão (sem ordenação)</SelectItem>
                {visibleFields.map((f) => <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Direção">
            <Select value={draft.sortOrder ?? "asc"} onValueChange={(v: any) => patch({ sortOrder: v })}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Crescente (A → Z)</SelectItem>
                <SelectItem value="desc">Decrescente (Z → A)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Section>

      <Section title="Totalizadores">
        <Toggle label="Exibir total geral" sub="Total de registros no rodapé do relatório" value={draft.showTotals !== false} onChange={(v) => patch({ showTotals: v })} />
      </Section>
    </>
  );
}

// ─────────────────────────────────────────────────────
// Helper UI components
// ─────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-1.5 border-b">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium leading-none">{label}</Label>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

function Toggle({ label, sub, value, onChange }: {
  label: string; sub?: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <div className="min-w-0 mr-3">
        <p className="text-sm font-medium leading-none">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <Switch checked={value} onCheckedChange={onChange} className="shrink-0" />
    </div>
  );
}
