import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings2, Globe, Shield, Clock, FlaskConical, Loader2, CheckCircle2, XCircle, ChevronDown, ChevronRight, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FhirExam { exam: string; code: string; sr: string; obs: string; dr: string; result_id?: string }
interface FhirResult {
  success: boolean;
  message?: string;
  endpoint?: string;
  fhir_ids?: { patient: string; exams: FhirExam[] };
  patient?: string | null;
  service_request?: string | null;
  observation?: string | null;
  diagnostic_report?: string | null;
  result_imported?: boolean;
  error?: string;
}

const normalizeFhirResult = (input: any): FhirResult => {
  const payload = input?.data ?? input;
  const exams = Array.isArray(payload?.fhir_ids?.exams)
    ? payload.fhir_ids.exams.map((exam: any) => ({
        exam: exam?.exam ?? exam?.name ?? "Exame",
        code: exam?.code ?? "-",
        sr: exam?.sr ?? payload?.service_request ?? "",
        obs: exam?.obs ?? payload?.observation ?? "",
        dr: exam?.dr ?? payload?.diagnostic_report ?? "",
        result_id: exam?.result_id,
      }))
    : [];

  const patient = payload?.fhir_ids?.patient ?? payload?.patient ?? null;
  const hasCompleteIds = Boolean(patient) && exams.length > 0 && exams.every((exam: FhirExam) => exam.sr && exam.obs && exam.dr);

  if (payload?.success && !hasCompleteIds) {
    return {
      success: false,
      endpoint: payload?.endpoint,
      message: payload?.message,
      fhir_ids: patient ? { patient, exams } : undefined,
      patient,
      service_request: payload?.service_request ?? null,
      observation: payload?.observation ?? null,
      diagnostic_report: payload?.diagnostic_report ?? null,
      result_imported: payload?.result_imported,
      error: "O sandbox respondeu sem todos os IDs obrigatórios do ciclo FHIR.",
    };
  }

  return {
    success: Boolean(payload?.success),
    message: payload?.message,
    endpoint: payload?.endpoint,
    fhir_ids: patient ? { patient, exams } : undefined,
    patient,
    service_request: payload?.service_request ?? null,
    observation: payload?.observation ?? null,
    diagnostic_report: payload?.diagnostic_report ?? null,
    result_imported: payload?.result_imported,
    error: payload?.error,
  };
};

export default function LabIntConfig() {
  const [fhirLoading, setFhirLoading] = useState(false);
  const [fhirResult, setFhirResult] = useState<FhirResult | null>(null);
  const [patientName, setPatientName] = useState("Maria Helena Santos");
  const [examCode, setExamCode] = useState("HMG");
  const [examName, setExamName] = useState("Hemograma Completo");
  const [showRawJson, setShowRawJson] = useState(false);
  const [executedAt, setExecutedAt] = useState<string | null>(null);

  const runFhirTest = async () => {
    setFhirLoading(true);
    setFhirResult(null);
    setShowRawJson(false);
    setExecutedAt(null);
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
      const payload = normalizeFhirResult(data);
      console.log("[FHIR-SANDBOX] response:", JSON.stringify(payload));
      setFhirResult(payload);
      setExecutedAt(new Date().toISOString());
      if (payload.success) {
        toast.success("Teste FHIR concluído com sucesso!");
      } else {
        toast.error(payload.error || "Erro no teste FHIR");
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
          {fhirResult?.success && (
            <div className="bg-background rounded border p-3 text-xs space-y-3">
              {/* Summary */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{fhirResult.message}</span>
                {executedAt && <span className="text-muted-foreground">{new Date(executedAt).toLocaleString("pt-BR")}</span>}
              </div>

              {/* Patient */}
              {fhirResult.fhir_ids?.patient && (
                <div className="font-mono">
                  <span className="text-muted-foreground">Patient ID:</span>{" "}
                  <a href={`https://hapi.fhir.org/baseR4/Patient/${fhirResult.fhir_ids.patient}`} target="_blank" rel="noreferrer" className="text-primary underline">{fhirResult.fhir_ids.patient}</a>
                </div>
              )}

              {/* Exams table */}
              {fhirResult.fhir_ids?.exams?.length ? (
                <div className="border rounded overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-2 py-1 font-medium">Exame</th>
                        <th className="text-left px-2 py-1 font-medium">ServiceRequest</th>
                        <th className="text-left px-2 py-1 font-medium">Observation</th>
                        <th className="text-left px-2 py-1 font-medium">DiagnosticReport</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fhirResult.fhir_ids.exams.map((e, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-2 py-1 font-medium">{e.exam} <span className="text-muted-foreground">({e.code})</span></td>
                          <td className="px-2 py-1 font-mono"><a href={`https://hapi.fhir.org/baseR4/ServiceRequest/${e.sr}`} target="_blank" rel="noreferrer" className="text-primary underline">{e.sr}</a></td>
                          <td className="px-2 py-1 font-mono"><a href={`https://hapi.fhir.org/baseR4/Observation/${e.obs}`} target="_blank" rel="noreferrer" className="text-primary underline">{e.obs}</a></td>
                          <td className="px-2 py-1 font-mono"><a href={`https://hapi.fhir.org/baseR4/DiagnosticReport/${e.dr}`} target="_blank" rel="noreferrer" className="text-primary underline">{e.dr}</a></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {/* Meta */}
              <div className="flex flex-wrap gap-3 font-mono text-muted-foreground">
                <span>Endpoint: {fhirResult.endpoint || "https://hapi.fhir.org/baseR4"}</span>
                {fhirResult.result_imported && <Badge variant="secondary" className="text-xs">Resultado importado no banco</Badge>}
              </div>

              {/* Raw JSON toggle */}
              <div>
                <button onClick={() => setShowRawJson(!showRawJson)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {showRawJson ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  {showRawJson ? "Ocultar JSON" : "Ver JSON completo"}
                </button>
                {showRawJson && (
                  <div className="relative mt-1">
                    <pre className="bg-muted/50 p-3 rounded text-[11px] overflow-auto max-h-64 font-mono whitespace-pre-wrap break-words">{JSON.stringify(fhirResult, null, 2)}</pre>
                    <Button size="sm" variant="ghost" className="absolute top-1 right-1 h-6 w-6 p-0" onClick={() => { navigator.clipboard.writeText(JSON.stringify(fhirResult, null, 2)); toast.success("JSON copiado"); }}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
