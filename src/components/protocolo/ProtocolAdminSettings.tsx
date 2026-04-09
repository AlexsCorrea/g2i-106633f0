import { Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocFlowProfiles, useDocFlowRules, useDocReasons, useDocSectors, useDocTypes } from "@/hooks/useDocProtocol";

export default function ProtocolAdminSettings() {
  const { data: sectors } = useDocSectors();
  const { data: docTypes } = useDocTypes();
  const { data: reasons } = useDocReasons();
  const { data: profiles } = useDocFlowProfiles();
  const { data: rules } = useDocFlowRules();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <Settings2 className="h-4 w-4" />
          Configurações gerais
        </h3>
        <p className="text-sm text-muted-foreground">Resumo rápido da parametrização do módulo e do estado atual das regras operacionais.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Setores</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{(sectors || []).length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Tipos</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{(docTypes || []).length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Motivos</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{(reasons || []).length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Perfis de fluxo</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{(profiles || []).length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Regras ativas</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{(rules || []).filter((rule) => rule.active).length}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Leitura operacional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>O usuário operacional sempre escolhe setor de origem e setor de destino.</p>
          <p>As regras de fluxo cadastradas aqui existem para validar se a transição é permitida e para dar rastreabilidade administrativa ao percurso documental.</p>
          <p>Se não houver regra para a combinação origem/destino e contexto documental, o backend bloqueia a criação do protocolo.</p>
        </CardContent>
      </Card>
    </div>
  );
}
