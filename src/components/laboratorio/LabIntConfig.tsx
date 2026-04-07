import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings2, Globe, Shield, Clock } from "lucide-react";

export default function LabIntConfig() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Settings2 className="h-5 w-5" />
        <span className="text-sm">Configurações da camada de integração</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" />Protocolos Suportados</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>• API REST (JSON)</p>
            <p>• SFTP (arquivos)</p>
            <p>• E-mail (resultados)</p>
            <p>• HL7 v2 (preparado)</p>
            <p>• FHIR R4 (preparado)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" />Segurança</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>• Credenciais armazenadas com criptografia</p>
            <p>• Tokens e senhas não exibidos na tela</p>
            <p>• Logs de acesso por parceiro</p>
            <p>• Auditoria completa de toda operação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" />Retry e Timeout</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>• Timeout padrão: 30 segundos</p>
            <p>• Tentativas padrão: 3</p>
            <p>• Intervalo entre retries: 60 segundos</p>
            <p>• Configurável por parceiro</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" />Interoperabilidade</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>• Suporte a LOINC no mapeamento</p>
            <p>• Suporte a TUSS/TISS no mapeamento</p>
            <p>• Payload bruto armazenado separadamente</p>
            <p>• Dados normalizados para uso interno</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
