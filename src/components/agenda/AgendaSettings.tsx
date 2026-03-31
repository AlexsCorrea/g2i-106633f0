import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Settings2, Save, Loader2, Bell, CalendarClock, Flag, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function AgendaSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("g2i_agenda_settings");
    return saved ? JSON.parse(saved) : {
      enable_whatsapp: false,
      enable_waitlist: true,
      enable_fit_in: true,
      auto_holidays: true,
      multi_unit: true,
      min_advance_schedule: 0,
      min_advance_cancel: 24,
      default_holiday_behavior: "block",
      default_fit_in_behavior: "professional_approval",
      absence_rules: "Cobrar taxa de no-show na próxima consulta. Bloquear agendamento online se > 3 faltas.",
      visual_layout: "default"
    };
  });

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulating API call
    await new Promise(r => setTimeout(r, 600));
    localStorage.setItem("g2i_agenda_settings", JSON.stringify(settings));
    toast.success("Configurações gerais salvas com sucesso!");
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Configurações Gerais da Agenda</h2>
          <p className="text-sm text-muted-foreground">Parametrização global aplicável a todas as agendas</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar Configurações
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Ativações Globais */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-primary" /> Ativações Globais do Módulo
            </CardTitle>
            <CardDescription className="text-xs">Habilite ou desabilite recursos globais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Confirmação via WhatsApp</Label>
                <p className="text-xs text-muted-foreground">Disparar lembretes 24h antes da consulta</p>
              </div>
              <Switch checked={settings.enable_whatsapp} onCheckedChange={(v) => handleChange("enable_whatsapp", v)} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Fila de Espera Global</Label>
                <p className="text-xs text-muted-foreground">Permitir encaixe de pacientes em desistências</p>
              </div>
              <Switch checked={settings.enable_waitlist} onCheckedChange={(v) => handleChange("enable_waitlist", v)} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Multi-unidade Habilitado</Label>
                <p className="text-xs text-muted-foreground">Permitir agendas para múltiplas filiais</p>
              </div>
              <Switch checked={settings.multi_unit} onCheckedChange={(v) => handleChange("multi_unit", v)} />
            </div>
          </CardContent>
        </Card>

        {/* Prazos e Tempos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" /> Regras de Tempo
            </CardTitle>
            <CardDescription className="text-xs">Janelas de agendamento e cancelamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Antecedência p/ Agendamento (horas)</Label>
                <Input 
                  type="number" 
                  value={settings.min_advance_schedule} 
                  onChange={(e) => handleChange("min_advance_schedule", +e.target.value)} 
                  placeholder="Ex: 0"
                />
                <p className="text-[10px] text-muted-foreground">Tempo mínimo antes do horário p/ marcar</p>
              </div>
              <div className="space-y-1.5">
                <Label>Antecedência p/ Cancelamento (horas)</Label>
                <Input 
                  type="number" 
                  value={settings.min_advance_cancel} 
                  onChange={(e) => handleChange("min_advance_cancel", +e.target.value)} 
                  placeholder="Ex: 24"
                />
                <p className="text-[10px] text-muted-foreground">Tempo mínimo p/ cancelar sem ônus</p>
              </div>
            </div>
            
            <div className="space-y-1.5 pt-2">
              <Label>Regras de Ausência / Falta (No-Show)</Label>
              <Textarea 
                value={settings.absence_rules} 
                onChange={(e) => handleChange("absence_rules", e.target.value)}
                rows={3} 
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Comportamento e Feriados */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Flag className="h-4 w-4 text-primary" /> Comportamento e Feriados
            </CardTitle>
            <CardDescription className="text-xs">Como o sistema deve reagir a eventos fixos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card mb-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Bloqueio Automático em Feriados</Label>
                <p className="text-xs text-muted-foreground">Feriados cadastrados derrubam a grade</p>
              </div>
              <Switch checked={settings.auto_holidays} onCheckedChange={(v) => handleChange("auto_holidays", v)} />
            </div>

            <div className="space-y-1.5">
              <Label>Ação Padrão para Feriados</Label>
              <Select value={settings.default_holiday_behavior} onValueChange={(v) => handleChange("default_holiday_behavior", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="block">Bloquear agenda inteira</SelectItem>
                  <SelectItem value="cancel_notify">Cancelar agendados e notificar</SelectItem>
                  <SelectItem value="reschedule_queue">Mover para fila de remarcação</SelectItem>
                  <SelectItem value="ignore">Ignorar (Manter aberta)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Autorização Padrão para Encaixes</Label>
              <Select value={settings.default_fit_in_behavior} onValueChange={(v) => handleChange("default_fit_in_behavior", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Livre (Recepção escolhe)</SelectItem>
                  <SelectItem value="professional_approval">Apenas com aprovação do profissional</SelectItem>
                  <SelectItem value="coordinator_approval">Apenas com aprovação da coordenação</SelectItem>
                  <SelectItem value="limit_reached">Até o limite da agenda preestabelecido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Preferências Visuais */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Preferências Visuais / Alertas
            </CardTitle>
            <CardDescription className="text-xs">Customizações de layout operacional</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Layout Operacional da Agenda</Label>
              <Select value={settings.visual_layout} onValueChange={(v) => handleChange("visual_layout", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Visão Calendário (Padrão)</SelectItem>
                  <SelectItem value="compact">Visão Compacta (Agendas múltiplas)</SelectItem>
                  <SelectItem value="list">Visão em Lista (Apenas o dia atual)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs">
              <strong>Nota do Sistema:</strong> As configurações salvas aqui são globais aplicadas como regra base. Uma Agenda específica pode sobrepor estas regras em sua aba "Configuração Operacional".
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
