import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction, ArrowLeft } from "lucide-react";

const routeTitles: Record<string, string> = {
  "/salas/espera": "Sala de Espera",
  "/salas/procedimentos": "Sala de Procedimentos / Exames",
  "/agenda/centro-cirurgico": "Centro Cirúrgico",
  "/agenda/imprimir": "Imprimir Agenda",
  "/pacientes/retornos": "Gerenciar Retornos",
  "/pacientes/tags": "Tags de Pacientes",
  "/pacientes/same": "SAME — Prontuário Documental",
  "/atendimentos/abertura": "Abertura de Atendimento",
  "/atendimentos/orcamento": "Orçamento",
  "/atendimentos/nf": "Nota Fiscal",
  "/atendimentos/relatorios": "Relatórios de Atendimento",
  "/atendimentos/escalas": "Escalas",
  "/atendimentos/leitos": "Gestão de Leitos",
  "/atendimentos/portaria": "Portaria",
  "/diagnostico/laudos": "Laudos",
  "/diagnostico/fila": "Fila de Exames",
  "/diagnostico/etiquetas": "Gerar Etiquetas",
  "/gerenciamento/financeiro": "Financeiro",
  "/gerenciamento/faturamento": "Faturamento",
  "/gerenciamento/produtividade": "Produtividade",
  "/gerenciamento/estoque/farmacia": "Estoque — Farmácia",
  "/gerenciamento/estoque/almoxarifado": "Estoque — Almoxarifado",
  "/gerenciamento/estoque/laboratorio": "Estoque — Laboratório",
  "/gerenciamento/estoque/nutricao": "Estoque — Nutrição",
  "/gerenciamento/caixa": "Fechamento de Caixa",
  "/assistencial/homecare": "Home Care",
  "/assistencial/internados": "Pacientes Internados",
  "/assistencial/uti": "UTI",
  "/assistencial/pa": "Pronto Atendimento",
  "/assistencial/enfermagem": "Enfermagem",
  "/assistencial/laboratorio": "Laboratório",
  "/assistencial/scih": "SCIH",
  "/assistencial/farmacia": "Farmácia — Atender Prescrição",
  "/assistencial/procedimentos": "Procedimentos",
  "/assistencial/nutricao": "Nutrição",
  "/assistencial/triagem": "Triagem",
  "/assistencial/oncologia": "Oncologia",
  "/crm/solicitacoes": "Solicitações",
  "/crm/negociacao": "Negociação",
  "/crm/relacionamento": "Relacionamento",
};

export default function PlaceholderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const title = routeTitles[location.pathname] || "Módulo em Desenvolvimento";

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 gap-1.5">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>
      <Card>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Construction className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Este módulo está em desenvolvimento e será disponibilizado em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
