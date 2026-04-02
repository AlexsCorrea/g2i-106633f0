import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Copy, Edit, Eye, Star, Trash2, Plus, FileText, Lock, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ReportTemplate } from "@/lib/reportEngine";
import { SYSTEM_TEMPLATES, getCustomTemplates, saveCustomTemplates, AGENDA_FIELDS } from "@/lib/reportEngine";
import ReportTemplateEditor from "./ReportTemplateEditor";

interface Props {
  module: string;
  onSelect: (template: ReportTemplate) => void;
  onClose: () => void;
}

export default function ReportTemplateManager({ module, onSelect, onClose }: Props) {
  const [customTemplates, setCustomTemplates] = useState<ReportTemplate[]>(getCustomTemplates());
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTemplate, setEditorTemplate] = useState<ReportTemplate | null>(null);

  const systemTemplates = SYSTEM_TEMPLATES.filter((t) => t.module === module);
  const userTemplates = customTemplates.filter((t) => t.module === module);

  function openEditorNew() {
    setEditorTemplate(null);
    setEditorOpen(true);
  }

  function openEditorEdit(template: ReportTemplate) {
    // Clone it so we always edit a mutable copy
    setEditorTemplate({ ...template, fields: template.fields.map((f) => ({ ...f })) });
    setEditorOpen(true);
  }

  function handleSave(saved: ReportTemplate) {
    let updated: ReportTemplate[];
    const exists = customTemplates.some((t) => t.id === saved.id);
    if (exists) {
      updated = customTemplates.map((t) => (t.id === saved.id ? saved : t));
    } else {
      updated = [...customTemplates, saved];
    }
    setCustomTemplates(updated);
    saveCustomTemplates(updated);
    setEditorOpen(false);
    toast.success(exists ? "Modelo atualizado com sucesso" : "Novo modelo criado com sucesso");
  }

  function handleClone(template: ReportTemplate) {
    const cloned: ReportTemplate = {
      ...template,
      fields: template.fields.map((f) => ({ ...f })),
      id: `custom-${Date.now()}`,
      name: `${template.name} (Cópia)`,
      isSystem: false,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [...customTemplates, cloned];
    setCustomTemplates(updated);
    saveCustomTemplates(updated);
    toast.success("Modelo duplicado com sucesso — clique em Editar para personalizar");
  }

  function handleDelete(id: string) {
    if (!confirm("Excluir este modelo permanentemente?")) return;
    const updated = customTemplates.filter((t) => t.id !== id);
    setCustomTemplates(updated);
    saveCustomTemplates(updated);
    toast.success("Modelo excluído");
  }

  function renderCard(template: ReportTemplate) {
    const visibleCount = template.fields.filter((f) => f.visible).length;
    return (
      <Card key={template.id} className="group hover:shadow-md transition-all">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-semibold text-sm">{template.name}</span>
                {template.isSystem && (
                  <Badge variant="secondary" className="text-[10px] gap-0.5">
                    <Lock className="h-3 w-3" />Sistema
                  </Badge>
                )}
                {template.isDefault && (
                  <Badge className="text-[10px] bg-primary/10 text-primary gap-0.5">
                    <Star className="h-3 w-3" />Padrão
                  </Badge>
                )}
                {template.isShared && (
                  <Badge variant="outline" className="text-[10px] gap-0.5">
                    <Share2 className="h-3 w-3" />Compartilhado
                  </Badge>
                )}
                {!template.active && (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">Inativo</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{template.description || template.title || "—"}</p>
              <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{visibleCount} campos</span>
                <span>·</span>
                <span>{template.orientation === "landscape" ? "Paisagem" : "Retrato"}</span>
                {template.pageSize && <><span>·</span><span>{template.pageSize.toUpperCase()}</span></>}
                {template.groupBy && (
                  <><span>·</span><span>Agrupado</span></>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Use */}
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Usar este modelo" onClick={() => onSelect(template)}>
                <Eye className="h-4 w-4" />
              </Button>

              {/* Clone */}
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Duplicar" onClick={() => handleClone(template)}>
                <Copy className="h-4 w-4" />
              </Button>

              {/* Edit (custom only) */}
              {!template.isSystem ? (
                <>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar modelo" onClick={() => openEditorEdit(template)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="Excluir" onClick={() => handleDelete(template.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] gap-1 ml-1"
                  title="Duplicar e editar"
                  onClick={() => {
                    const cloned: ReportTemplate = {
                      ...template,
                      fields: template.fields.map((f) => ({ ...f })),
                      id: `custom-${Date.now()}`,
                      name: `${template.name} (Cópia)`,
                      isSystem: false,
                      isDefault: false,
                      createdAt: new Date().toISOString(),
                    };
                    setEditorTemplate(cloned);
                    setEditorOpen(true);
                  }}
                >
                  <Copy className="h-3 w-3" />Usar como base
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6 px-1">
        {/* System templates */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Modelos do Sistema</h3>
            <span className="text-xs text-muted-foreground">Somente leitura — use como base</span>
          </div>
          <div className="grid gap-2">{systemTemplates.map(renderCard)}</div>
        </div>

        <Separator />

        {/* Custom templates */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Modelos Personalizados</h3>
            <Button size="sm" onClick={openEditorNew} className="gap-1.5 h-8 text-xs">
              <Plus className="h-3.5 w-3.5" />Novo Modelo
            </Button>
          </div>

          {userTemplates.length > 0 ? (
            <div className="grid gap-2">{userTemplates.map(renderCard)}</div>
          ) : (
            <div className="text-center py-10 text-sm text-muted-foreground border border-dashed rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="font-medium">Nenhum modelo personalizado</p>
              <p className="text-xs mt-1 mb-3">Crie do zero ou use um modelo do sistema como base</p>
              <Button size="sm" variant="outline" onClick={openEditorNew} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />Criar primeiro modelo
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Editor Dialog */}
      <ReportTemplateEditor
        template={editorTemplate}
        module={module}
        open={editorOpen}
        onSave={handleSave}
        onClose={() => setEditorOpen(false)}
      />
    </>
  );
}
