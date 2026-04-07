import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings2, Globe, Shield, Clock, FlaskConical, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FhirResult {
  success: boolean;
  message?: string;
  fhir_ids?: { patient: string; service_request: string; observation: string; diagnostic_report: string };
  error?: string;
}

export default function LabIntConfig() {
  const [fhirLoading, setFhirLoading] = useState(false);
  const [fhirResult, setFhirResult] = useState<FhirResult | null>(null);
  const [patientName, setPatientName] = useState("Maria Helena Santos");
  const [examCode, setExamCode] = useState("HMG");
  const [examName, setExamName] = useState("Hemograma Completo");

  const runFhirTest = async () => {
    setFhirLoading(true);
    setFhirResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("fhir-sandbox", {
        body: {
          action: "simulate_full_cycle",
          patient_name: patientName,
          patient_id: "test-patient-fhir",
          exams: [{ code: examCode, name: examName }],
        },
      });
      if (error) throw error;
      setFhirResult(data);
      if (data?.success) {
        toast.success("Teste FHIR concluído com sucesso!");
      } else {
        toast.error(data?.error || "Erro no teste FHIR");
      }
    } catch (e: any) {
      setFhirResult({ success: false, error: e.message });
      toast.error(`Erro: ${e.message}`);
    } finally {
      setFhirLoading(false);
    }
  };

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
            <p>• <strong>FHIR R4 (ativo — sandbox conectado)</strong></p>
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

      {/* FHIR Sandbox Test Panel */}
      <Card className="border-teal-200 bg-teal-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-teal-600" />
            Teste FHIR R4 Sandbox
            <Badge className="bg-teal-100 text-teal-700 text-xs ml-2">hapi.fhir.org</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Simula o ciclo completo de integração usando o FHIR público da HL7: Patient → ServiceRequest → Observation → DiagnosticReport.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Nome do Paciente</Label>
              <Input value={patientName} onChange={e => setPatientName(e.target.value)} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Código do Exame</Label>
              <Input value={examCode} onChange={e => setExamCode(e.target.value)} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Nome do Exame</Label>
              <Input value={examName} onChange={e => setExamName(e.target.value)} className="h-8 text-sm" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={runFhirTest} disabled={fhirLoading} className="bg-teal-600 hover:bg-teal-700">
              {fhirLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Globe className="h-4 w-4 mr-2" />}
              Executar Ciclo Completo
            </Button>
            {fhirResult && (
              <div className="flex items-center gap-2 text-sm">
                {fhirResult.success ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-green-700">Sucesso</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-700">{fhirResult.error}</span>
                  </>
                )}
              </div>
            )}
          </div>
          {fhirResult?.success && fhirResult.fhir_ids && (
            <div className="bg-background rounded border p-3 text-xs font-mono space-y-1">
              <p><span className="text-muted-foreground">Patient:</span> {fhirResult.fhir_ids.patient}</p>
              <p><span className="text-muted-foreground">ServiceRequest:</span> {fhirResult.fhir_ids.service_request}</p>
              <p><span className="text-muted-foreground">Observation:</span> {fhirResult.fhir_ids.observation}</p>
              <p><span className="text-muted-foreground">DiagnosticReport:</span> {fhirResult.fhir_ids.diagnostic_report}</p>
              <p className="text-muted-foreground pt-1">Endpoint: https://hapi.fhir.org/baseR4</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
