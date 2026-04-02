import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Copy, Edit, Eye, Star, Trash2, Plus, FileText, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ReportTemplate, ReportField } from "@/lib/reportEngine";
import { SYSTEM_TEMPLATES, getCustomTemplates, saveCustomTemplates, AGENDA_FIELDS } from "@/lib/reportEngine";

interface Props {
  module: string;
  onSelect: (template: ReportTemplate) => void;
  onClose: () => void;
}

export default function ReportTemplateManager({ module, onSelect, onClose }: Props) {
  const [customTemplates, setCustomTemplates] = useState<ReportTemplate[]>(getCustomTemplates());
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editFields, setEditFields] = useState<ReportField[]>([]);
  const [editGroupBy, setEditGroupBy] = useState("");
  const [showBuilder, setShowBuilder] = useState(false);

  const systemTemplates = SYSTEM_TEMPLATES.filter(t => t.module === module);
  const userTemplates = customTemplates.filter(t => t.module === module);

  function handleClone(template: ReportTemplate) {
    const cloned: ReportTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
      name: `${template.name} (Cópia)`,
      isSystem: false,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [...customTemplates, cloned];
    setCustomTemplates(updated);
    saveCustomTemplates(updated);
    toast.success("Modelo clonado com sucesso");
  }

  function handleDelete(id: string) {
    const updated = customTemplates.filter(t => t.id !== id);
    setCustomTemplates(updated);
    saveCustomTemplates(updated);
    toast.success("Modelo excluído");
  }

  function handleToggleActive(id: string) {
    const updated = customTemplates.map(t => t.id === id ? { ...t, active: !t.active } : t);
    setCustomTemplates(updated);
    saveCustomTemplates(updated);
  }

  function openBuilder(template?: ReportTemplate) {
    if (template) {
      setEditingTemplate(template);
      setEditName(template.name);
      setEditDesc(template.description);
      setEditFields([...template.fields]);
      setEditGroupBy(template.groupBy || "");
    } else {
      setEditingTemplate(null);
      setEditName("Novo Modelo");
      setEditDesc("");
      setEditFields(AGENDA_FIELDS.map(f => ({ ...f })));
      setEditGroupBy("");
    }
    setShowBuilder(true);
  }

  function saveBuilder() {
    if (!editName.trim()) {
      toast.error("Informe o nome do modelo");
      return;
    }

    const template: ReportTemplate = {
      id: editingTemplate?.id || `custom-${Date.now()}`,
      name: editName,
      description: editDesc,
      module: module as any,
      isSystem: false,
      isDefault: false,
      active: true,
      fields: editFields,
      groupBy: editGroupBy || undefined,
      pageBreakOnGroup: false,
      showHeader: true,
      showFooter: true,
      showFilters: true,
      showPageNumbers: true,
      orientation: "landscape",
      createdAt: editingTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updated: ReportTemplate[];
    if (editingTemplate) {
      updated = customTemplates.map(t => t.id === template.id ? template : t);
    } else {
      updated = [...customTemplates, template];
    }
    setCustomTemplates(updated);
    saveCustomTemplates(updated);
    setShowBuilder(false);
    toast.success(editingTemplate ? "Modelo atualizado" : "Modelo criado");
  }

  function toggleFieldVisible(key: string) {
    setEditFields(prev => prev.map(f => f.key === key ? { ...f, visible: !f.visible } : f));
  }

  function moveField(index: number, direction: -1 | 1) {
    const newFields = [...editFields];
    const target = index + direction;
    if (target < 0 || target >= newFields.length) return;
    [newFields[index], newFields[target]] = [newFields[target], newFields[index]];
    setEditFields(newFields);
  }

  function renderTemplateCard(template: ReportTemplate) {
    return (
      <Card key={template.id} className={cn("group transition-all hover:shadow-md", !template.active && "opacity-50")}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-semibold text-sm truncate">{template.name}</span>
                {template.isSystem && (
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    <Lock className="h-3 w-3 mr-0.5" />Sistema
                  </Badge>
                )}
                {template.isDefault && (
                  <Badge className="text-[10px] bg-primary/10 text-primary shrink-0">
                    <Star className="h-3 w-3 mr-0.5" />Padrão
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
              <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{template.fields.filter(f => f.visible).length} campos</span>
                {template.groupBy && <span>• Agrupado por {template.fields.find(f => f.key === template.groupBy)?.label}</span>}
                <span>• {template.orientation === "landscape" ? "Paisagem" : "Retrato"}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onSelect(template)} title="Usar este modelo">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleClone(template)} title="Clonar modelo">
                <Copy className="h-4 w-4" />
              </Button>
              {!template.isSystem && (
                <>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openBuilder(template)} title="Editar">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(template.id)} title="Excluir">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* System templates */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Modelos do Sistema</h3>
          <div className="grid gap-3">
            {systemTemplates.map(renderTemplateCard)}
          </div>
        </div>

        <Separator />

        {/* Custom templates */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Modelos Personalizados</h3>
            <Button size="sm" variant="outline" onClick={() => openBuilder()} className="gap-1.5 h-8 text-xs">
              <Plus className="h-3.5 w-3.5" />Novo Modelo
            </Button>
          </div>
          {userTemplates.length > 0 ? (
            <div className="grid gap-3">
              {userTemplates.map(renderTemplateCard)}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>Nenhum modelo personalizado</p>
              <p className="text-xs mt-1">Clone um modelo do sistema ou crie do zero</p>
            </div>
          )}
        </div>
      </div>

      {/* Builder dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Editar Modelo" : "Novo Modelo de Relatório"}</DialogTitle>
            <DialogDescription className="sr-only">Construtor de modelo de relatório</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Nome do modelo</Label>
                <Input value={editName} onChange={e => setEditName(e.target.value)} className="mt-1 h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Agrupar por</Label>
                <select
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={editGroupBy}
                  onChange={e => setEditGroupBy(e.target.value)}
                >
                  <option value="">Sem agrupamento</option>
                  {editFields.map(f => (
                    <option key={f.key} value={f.key}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Descrição</Label>
              <Input value={editDesc} onChange={e => setEditDesc(e.target.value)} className="mt-1 h-9 text-sm" placeholder="Descrição opcional" />
            </div>

            <Separator />

            <div>
              <Label className="text-xs font-semibold">Campos do relatório</Label>
              <p className="text-[10px] text-muted-foreground mb-2">Marque os campos visíveis e use as setas para reordenar</p>
              <ScrollArea className="h-[300px] border rounded-md">
                <div className="p-2 space-y-1">
                  {editFields.map((field, idx) => (
                    <div
                      key={field.key}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                        field.visible ? "bg-primary/5 border border-primary/10" : "bg-muted/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={field.visible}
                          onCheckedChange={() => toggleFieldVisible(field.key)}
                          className="scale-75"
                        />
                        <span className={cn("text-sm", !field.visible && "text-muted-foreground")}>{field.label}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{field.key}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === 0} onClick={() => moveField(idx, -1)}>
                          ↑
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === editFields.length - 1} onClick={() => moveField(idx, 1)}>
                          ↓
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBuilder(false)}>Cancelar</Button>
            <Button onClick={saveBuilder}>Salvar Modelo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
