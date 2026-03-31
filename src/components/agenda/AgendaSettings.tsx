import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings2, Calendar, Clock, CalendarOff, Star, Flag, ListOrdered, FileText, Shield } from "lucide-react";

const features = [
  { icon: Calendar, title: "Agendas Configuráveis", desc: "Múltiplas agendas por profissional, especialidade e unidade", status: "Ativo" },
  { icon: Clock, title: "Períodos Semanais", desc: "Grade fixa com manhã, tarde e noite por dia da semana", status: "Ativo" },
  { icon: Star, title: "Horários Especiais", desc: "Mutirões, exceções e datas avulsas fora da grade", status: "Ativo" },
  { icon: CalendarOff, title: "Bloqueios", desc: "Bloqueios totais, parciais, por férias e por recurso", status: "Ativo" },
  { icon: Flag, title: "Feriados", desc: "Nacionais, estaduais, municipais com bloqueio automático", status: "Ativo" },
  { icon: ListOrdered, title: "Fila de Espera", desc: "Pacientes aguardando vaga com prioridade e período", status: "Ativo" },
  { icon: FileText, title: "Anotações", desc: "Particularidades permanentes e observações do dia", status: "Ativo" },
  { icon: Shield, title: "Multiunidade", desc: "Suporte a múltiplas unidades e setores", status: "Preparado" },
];

export default function AgendaSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Configurações da Agenda</h2>
        <p className="text-sm text-muted-foreground">Visão geral das funcionalidades e integrações do módulo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f) => (
          <Card key={f.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <f.icon className="h-4 w-4 text-primary" />
                </div>
                <Badge variant="outline" className={f.status === "Ativo" ? "bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]" : "text-[10px]"}>
                  {f.status}
                </Badge>
              </div>
              <CardTitle className="text-sm">{f.title}</CardTitle>
              <CardDescription className="text-xs">{f.desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Arquitetura do Módulo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Estrutura</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Agendas com ou sem profissional fixo</li>
                <li>• Grade fixa, manual ou híbrida</li>
                <li>• Múltiplos períodos por dia</li>
                <li>• Bloqueios com recorrência</li>
                <li>• Feriados com bloqueio automático</li>
                <li>• Fila de espera com prioridade</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Integração</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Vinculado ao cadastro de pacientes</li>
                <li>• Vinculado ao perfil de profissionais</li>
                <li>• Suporte a convênios por agenda</li>
                <li>• Agendamentos integrados ao prontuário</li>
                <li>• Preparado para multi-unidade</li>
                <li>• Preparado para notificações WhatsApp</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
