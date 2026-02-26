import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateEvolutionNote } from "@/hooks/useEvolutionNotes";
import { usePatient } from "@/hooks/usePatients";
import { useLatestVitalSigns } from "@/hooks/useVitalSigns";
import { useMedications } from "@/hooks/useMedications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Eye,
  Loader2,
  Save,
  X,
  FileSignature,
  User,
  Calendar,
  Pill,
  Activity,
} from "lucide-react";
import { format, parseISO, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OphthalmologyFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface OphthalmologyData {
  anamnese: string;
  historia_pregressa: string;
  historico_familiar: string;
  av_sc_od: string;
  av_sc_oe: string;
  av_cc_od: string;
  av_cc_oe: string;
  autorefracaoOD: string;
  autorefracaoOE: string;
  refracaoSubjetivaOD: string;
  refracaoSubjetivaOE: string;
  avFinalOD: string;
  avFinalOE: string;
  biomicroscopiaOD: string;
  biomicroscopiaOE: string;
  tonometriaOD: string;
  tonometriaOE: string;
  fundoscopiaOD: string;
  fundoscopiaOE: string;
  mapeamentoRetinaOD: string;
  mapeamentoRetinaOE: string;
  gonioscopia_od: string;
  gonioscopia_oe: string;
  motilidade_ocular: string;
  teste_cobertura: string;
  teste_schirmer_od: string;
  teste_schirmer_oe: string;
  paquimetria_od: string;
  paquimetria_oe: string;
  campimetria_od: string;
  campimetria_oe: string;
  oct_od: string;
  oct_oe: string;
  diagnostico: string;
  cid: string;
  conduta: string;
  retorno: string;
  observacoes: string;
}

const initialData: OphthalmologyData = {
  anamnese: "",
  historia_pregressa: "",
  historico_familiar: "",
  av_sc_od: "",
  av_sc_oe: "",
  av_cc_od: "",
  av_cc_oe: "",
  autorefracaoOD: "",
  autorefracaoOE: "",
  refracaoSubjetivaOD: "",
  refracaoSubjetivaOE: "",
  avFinalOD: "",
  avFinalOE: "",
  biomicroscopiaOD: "",
  biomicroscopiaOE: "",
  tonometriaOD: "",
  tonometriaOE: "",
  fundoscopiaOD: "",
  fundoscopiaOE: "",
  mapeamentoRetinaOD: "",
  mapeamentoRetinaOE: "",
  gonioscopia_od: "",
  gonioscopia_oe: "",
  motilidade_ocular: "",
  teste_cobertura: "",
  teste_schirmer_od: "",
  teste_schirmer_oe: "",
  paquimetria_od: "",
  paquimetria_oe: "",
  campimetria_od: "",
  campimetria_oe: "",
  oct_od: "",
  oct_oe: "",
  diagnostico: "",
  cid: "",
  conduta: "",
  retorno: "",
  observacoes: "",
};

function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 py-2">
      {icon}
      <h4 className="font-semibold text-sm uppercase tracking-wide text-primary">
        {children}
      </h4>
    </div>
  );
}

function EyeFieldPair({
  label,
  odValue,
  oeValue,
  onODChange,
  onOEChange,
  placeholder,
  isTextarea = false,
}: {
  label: string;
  odValue: string;
  oeValue: string;
  onODChange: (v: string) => void;
  onOEChange: (v: string) => void;
  placeholder?: string;
  isTextarea?: boolean;
}) {
  const InputComponent = isTextarea ? Textarea : Input;
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </Label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-xs font-bold text-foreground mb-1 block">OD</span>
          <InputComponent
            value={odValue}
            onChange={(e) => onODChange(e.target.value)}
            placeholder={placeholder || "Olho direito"}
            className={isTextarea ? "min-h-[60px] text-sm" : "text-sm"}
          />
        </div>
        <div>
          <span className="text-xs font-bold text-foreground mb-1 block">OE</span>
          <InputComponent
            value={oeValue}
            onChange={(e) => onOEChange(e.target.value)}
            placeholder={placeholder || "Olho esquerdo"}
            className={isTextarea ? "min-h-[60px] text-sm" : "text-sm"}
          />
        </div>
      </div>
    </div>
  );
}

export function OphthalmologyForm({ patientId, open, onOpenChange }: OphthalmologyFormProps) {
  const { profile } = useAuth();
  const createNote = useCreateEvolutionNote();
  const { data: patient } = usePatient(patientId);
  const { data: latestVitals } = useLatestVitalSigns(patientId);
  const { data: medications } = useMedications(patientId);
  const [formData, setFormData] = useState<OphthalmologyData>(initialData);

  const update = (field: keyof OphthalmologyData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const buildContent = () => {
    const sections: string[] = [];

    if (formData.anamnese) sections.push(`ANAMNESE:\n${formData.anamnese}`);
    if (formData.historia_pregressa) sections.push(`HISTÓRIA PREGRESSA:\n${formData.historia_pregressa}`);
    if (formData.historico_familiar) sections.push(`HISTÓRICO FAMILIAR:\n${formData.historico_familiar}`);

    if (formData.av_sc_od || formData.av_sc_oe)
      sections.push(`AV S/C:\nOD: ${formData.av_sc_od || "-"} | OE: ${formData.av_sc_oe || "-"}`);
    if (formData.av_cc_od || formData.av_cc_oe)
      sections.push(`AV C/C:\nOD: ${formData.av_cc_od || "-"} | OE: ${formData.av_cc_oe || "-"}`);

    if (formData.autorefracaoOD || formData.autorefracaoOE)
      sections.push(`AUTORREFRAÇÃO:\nOD: ${formData.autorefracaoOD || "-"} | OE: ${formData.autorefracaoOE || "-"}`);
    if (formData.refracaoSubjetivaOD || formData.refracaoSubjetivaOE)
      sections.push(`REFRAÇÃO SUBJETIVA:\nOD: ${formData.refracaoSubjetivaOD || "-"} | OE: ${formData.refracaoSubjetivaOE || "-"}`);
    if (formData.avFinalOD || formData.avFinalOE)
      sections.push(`AV FINAL (c/ refração):\nOD: ${formData.avFinalOD || "-"} | OE: ${formData.avFinalOE || "-"}`);

    if (formData.biomicroscopiaOD || formData.biomicroscopiaOE)
      sections.push(`BIOMICROSCOPIA:\nOD: ${formData.biomicroscopiaOD || "-"}\nOE: ${formData.biomicroscopiaOE || "-"}`);
    if (formData.tonometriaOD || formData.tonometriaOE)
      sections.push(`TONOMETRIA:\nOD: ${formData.tonometriaOD || "-"} mmHg | OE: ${formData.tonometriaOE || "-"} mmHg`);
    if (formData.fundoscopiaOD || formData.fundoscopiaOE)
      sections.push(`FUNDOSCOPIA:\nOD: ${formData.fundoscopiaOD || "-"}\nOE: ${formData.fundoscopiaOE || "-"}`);
    if (formData.mapeamentoRetinaOD || formData.mapeamentoRetinaOE)
      sections.push(`MAPEAMENTO DE RETINA:\nOD: ${formData.mapeamentoRetinaOD || "-"}\nOE: ${formData.mapeamentoRetinaOE || "-"}`);
    if (formData.gonioscopia_od || formData.gonioscopia_oe)
      sections.push(`GONIOSCOPIA:\nOD: ${formData.gonioscopia_od || "-"}\nOE: ${formData.gonioscopia_oe || "-"}`);

    if (formData.motilidade_ocular) sections.push(`MOTILIDADE OCULAR EXTRÍNSECA:\n${formData.motilidade_ocular}`);
    if (formData.teste_cobertura) sections.push(`TESTE DE COBERTURA:\n${formData.teste_cobertura}`);

    if (formData.teste_schirmer_od || formData.teste_schirmer_oe)
      sections.push(`TESTE DE SCHIRMER:\nOD: ${formData.teste_schirmer_od || "-"} mm | OE: ${formData.teste_schirmer_oe || "-"} mm`);
    if (formData.paquimetria_od || formData.paquimetria_oe)
      sections.push(`PAQUIMETRIA:\nOD: ${formData.paquimetria_od || "-"} µm | OE: ${formData.paquimetria_oe || "-"} µm`);
    if (formData.campimetria_od || formData.campimetria_oe)
      sections.push(`CAMPIMETRIA:\nOD: ${formData.campimetria_od || "-"}\nOE: ${formData.campimetria_oe || "-"}`);
    if (formData.oct_od || formData.oct_oe)
      sections.push(`OCT:\nOD: ${formData.oct_od || "-"}\nOE: ${formData.oct_oe || "-"}`);

    if (formData.diagnostico) sections.push(`DIAGNÓSTICO:\n${formData.diagnostico}`);
    if (formData.cid) sections.push(`CID: ${formData.cid}`);
    if (formData.conduta) sections.push(`CONDUTA:\n${formData.conduta}`);
    if (formData.retorno) sections.push(`RETORNO: ${formData.retorno}`);
    if (formData.observacoes) sections.push(`OBSERVAÇÕES:\n${formData.observacoes}`);

    return sections.join("\n\n");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const content = buildContent();
    if (!content.trim()) return;

    await createNote.mutateAsync({
      patient_id: patientId,
      professional_id: profile.id,
      note_type: "medica",
      content,
      subjective: formData.anamnese || null,
      objective: `AV S/C: OD ${formData.av_sc_od} OE ${formData.av_sc_oe} | Tonometria: OD ${formData.tonometriaOD} OE ${formData.tonometriaOE}` || null,
      assessment: formData.diagnostico || null,
      plan: formData.conduta || null,
    });

    setFormData(initialData);
    onOpenChange(false);
  };

  const activeMeds = medications?.filter((m) => m.status === "ativo") || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] p-0 gap-0">
        <DialogHeader className="p-4 pb-3 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-primary" />
            Formulário de Consulta - Oftalmologia
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Form */}
          <ScrollArea className="flex-1 h-[calc(95vh-80px)]">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Patient Info Bar */}
              {patient && (
                <div className="bg-muted/40 rounded-lg p-4 border">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Paciente</p>
                      <p className="font-semibold">{patient.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Dt. Nascimento</p>
                      <p className="font-medium text-sm">
                        {format(parseISO(patient.birth_date), "dd/MM/yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Idade</p>
                      <p className="font-medium text-sm">
                        {differenceInYears(new Date(), parseISO(patient.birth_date))} anos
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Prontuário</p>
                      <p className="font-mono text-sm">PRN-{patientId.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Anamnese */}
              <div className="space-y-3">
                <SectionTitle>Anamnese</SectionTitle>
                <Textarea
                  value={formData.anamnese}
                  onChange={(e) => update("anamnese", e.target.value)}
                  placeholder="Queixa principal, história da doença atual..."
                  className="min-h-[120px]"
                />
              </div>

              <Separator />

              {/* História */}
              <div className="space-y-3">
                <SectionTitle>História</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">História Pregressa</Label>
                    <Textarea
                      value={formData.historia_pregressa}
                      onChange={(e) => update("historia_pregressa", e.target.value)}
                      placeholder="Doenças oculares anteriores, cirurgias prévias, uso de óculos/lentes..."
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Histórico Familiar</Label>
                    <Textarea
                      value={formData.historico_familiar}
                      onChange={(e) => update("historico_familiar", e.target.value)}
                      placeholder="Glaucoma, catarata, doenças retinianas na família..."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Acuidade Visual */}
              <div className="space-y-4">
                <SectionTitle icon={<Eye className="h-4 w-4 text-primary" />}>
                  Acuidade Visual
                </SectionTitle>
                <EyeFieldPair
                  label="AV S/C (sem correção)"
                  odValue={formData.av_sc_od}
                  oeValue={formData.av_sc_oe}
                  onODChange={(v) => update("av_sc_od", v)}
                  onOEChange={(v) => update("av_sc_oe", v)}
                  placeholder="20/20"
                />
                <EyeFieldPair
                  label="AV C/C (com correção)"
                  odValue={formData.av_cc_od}
                  oeValue={formData.av_cc_oe}
                  onODChange={(v) => update("av_cc_od", v)}
                  onOEChange={(v) => update("av_cc_oe", v)}
                  placeholder="20/20"
                />
              </div>

              <Separator />

              {/* Refração */}
              <div className="space-y-4">
                <SectionTitle>Refração</SectionTitle>
                <EyeFieldPair
                  label="Autorrefração"
                  odValue={formData.autorefracaoOD}
                  oeValue={formData.autorefracaoOE}
                  onODChange={(v) => update("autorefracaoOD", v)}
                  onOEChange={(v) => update("autorefracaoOE", v)}
                  placeholder="Esf / Cil x Eixo"
                />
                <EyeFieldPair
                  label="Refração Subjetiva"
                  odValue={formData.refracaoSubjetivaOD}
                  oeValue={formData.refracaoSubjetivaOE}
                  onODChange={(v) => update("refracaoSubjetivaOD", v)}
                  onOEChange={(v) => update("refracaoSubjetivaOE", v)}
                  placeholder="Esf / Cil x Eixo"
                />
                <EyeFieldPair
                  label="AV Final (c/ refração)"
                  odValue={formData.avFinalOD}
                  oeValue={formData.avFinalOE}
                  onODChange={(v) => update("avFinalOD", v)}
                  onOEChange={(v) => update("avFinalOE", v)}
                  placeholder="20/20"
                />
              </div>

              <Separator />

              {/* Exame Externo / Biomicroscopia */}
              <div className="space-y-4">
                <SectionTitle>Biomicroscopia (Lâmpada de Fenda)</SectionTitle>
                <EyeFieldPair
                  label="Biomicroscopia"
                  odValue={formData.biomicroscopiaOD}
                  oeValue={formData.biomicroscopiaOE}
                  onODChange={(v) => update("biomicroscopiaOD", v)}
                  onOEChange={(v) => update("biomicroscopiaOE", v)}
                  placeholder="Cílios, conjuntiva, córnea, CA, íris, cristalino..."
                  isTextarea
                />
              </div>

              <Separator />

              {/* Tonometria */}
              <div className="space-y-4">
                <SectionTitle>Tonometria</SectionTitle>
                <EyeFieldPair
                  label="Pressão Intraocular (PIO)"
                  odValue={formData.tonometriaOD}
                  oeValue={formData.tonometriaOE}
                  onODChange={(v) => update("tonometriaOD", v)}
                  onOEChange={(v) => update("tonometriaOE", v)}
                  placeholder="mmHg"
                />
              </div>

              <Separator />

              {/* Fundoscopia */}
              <div className="space-y-4">
                <SectionTitle>Fundoscopia</SectionTitle>
                <EyeFieldPair
                  label="Fundoscopia Direta"
                  odValue={formData.fundoscopiaOD}
                  oeValue={formData.fundoscopiaOE}
                  onODChange={(v) => update("fundoscopiaOD", v)}
                  onOEChange={(v) => update("fundoscopiaOE", v)}
                  placeholder="Disco óptico, mácula, vasos, retina..."
                  isTextarea
                />
                <EyeFieldPair
                  label="Mapeamento de Retina"
                  odValue={formData.mapeamentoRetinaOD}
                  oeValue={formData.mapeamentoRetinaOE}
                  onODChange={(v) => update("mapeamentoRetinaOD", v)}
                  onOEChange={(v) => update("mapeamentoRetinaOE", v)}
                  placeholder="Descrição detalhada..."
                  isTextarea
                />
              </div>

              <Separator />

              {/* Gonioscopia */}
              <div className="space-y-4">
                <SectionTitle>Gonioscopia</SectionTitle>
                <EyeFieldPair
                  label="Ângulo camerular"
                  odValue={formData.gonioscopia_od}
                  oeValue={formData.gonioscopia_oe}
                  onODChange={(v) => update("gonioscopia_od", v)}
                  onOEChange={(v) => update("gonioscopia_oe", v)}
                  placeholder="Classificação de Shaffer..."
                />
              </div>

              <Separator />

              {/* Motilidade */}
              <div className="space-y-4">
                <SectionTitle>Motilidade e Alinhamento</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Motilidade Ocular Extrínseca</Label>
                    <Textarea
                      value={formData.motilidade_ocular}
                      onChange={(e) => update("motilidade_ocular", e.target.value)}
                      placeholder="Versões, duções..."
                      className="min-h-[60px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Teste de Cobertura</Label>
                    <Textarea
                      value={formData.teste_cobertura}
                      onChange={(e) => update("teste_cobertura", e.target.value)}
                      placeholder="Cover test, cover-uncover..."
                      className="min-h-[60px]"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Exames complementares */}
              <div className="space-y-4">
                <SectionTitle>Exames Complementares</SectionTitle>
                <EyeFieldPair
                  label="Teste de Schirmer"
                  odValue={formData.teste_schirmer_od}
                  oeValue={formData.teste_schirmer_oe}
                  onODChange={(v) => update("teste_schirmer_od", v)}
                  onOEChange={(v) => update("teste_schirmer_oe", v)}
                  placeholder="mm"
                />
                <EyeFieldPair
                  label="Paquimetria"
                  odValue={formData.paquimetria_od}
                  oeValue={formData.paquimetria_oe}
                  onODChange={(v) => update("paquimetria_od", v)}
                  onOEChange={(v) => update("paquimetria_oe", v)}
                  placeholder="µm"
                />
                <EyeFieldPair
                  label="Campimetria"
                  odValue={formData.campimetria_od}
                  oeValue={formData.campimetria_oe}
                  onODChange={(v) => update("campimetria_od", v)}
                  onOEChange={(v) => update("campimetria_oe", v)}
                  placeholder="Resultados..."
                  isTextarea
                />
                <EyeFieldPair
                  label="OCT"
                  odValue={formData.oct_od}
                  oeValue={formData.oct_oe}
                  onODChange={(v) => update("oct_od", v)}
                  onOEChange={(v) => update("oct_oe", v)}
                  placeholder="Resultados..."
                  isTextarea
                />
              </div>

              <Separator />

              {/* Diagnóstico e Conduta */}
              <div className="space-y-4">
                <SectionTitle>Diagnóstico e Conduta</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Diagnóstico</Label>
                    <Textarea
                      value={formData.diagnostico}
                      onChange={(e) => update("diagnostico", e.target.value)}
                      placeholder="Impressão diagnóstica..."
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">CID</Label>
                    <Input
                      value={formData.cid}
                      onChange={(e) => update("cid", e.target.value)}
                      placeholder="Ex: H40.1, H25.0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Conduta</Label>
                  <Textarea
                    value={formData.conduta}
                    onChange={(e) => update("conduta", e.target.value)}
                    placeholder="Prescrição, orientações, encaminhamentos..."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Retorno</Label>
                    <Input
                      value={formData.retorno}
                      onChange={(e) => update("retorno", e.target.value)}
                      placeholder="Ex: 30 dias, 3 meses..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Observações</Label>
                    <Input
                      value={formData.observacoes}
                      onChange={(e) => update("observacoes", e.target.value)}
                      placeholder="Notas adicionais..."
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={createNote.isPending} className="gap-2">
                  {createNote.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Salvar
                </Button>
                <Button
                  type="submit"
                  disabled={createNote.isPending}
                  variant="default"
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  <FileSignature className="h-4 w-4" />
                  Salvar e Assinar
                </Button>
              </div>
            </form>
          </ScrollArea>

          {/* Right Sidebar - Patient Summary */}
          <div className="w-[300px] border-l bg-muted/20 hidden lg:block">
            <ScrollArea className="h-[calc(95vh-80px)]">
              <div className="p-4 space-y-5">
                {/* Patient Quick Info */}
                {patient && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      Paciente
                    </h4>
                    <div className="bg-background rounded-lg p-3 border space-y-1.5">
                      <p className="font-semibold text-sm">{patient.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {differenceInYears(new Date(), parseISO(patient.birth_date))} anos •{" "}
                        {patient.gender === "M" ? "Masc." : patient.gender === "F" ? "Fem." : "Outro"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {format(parseISO(patient.birth_date), "dd/MM/yyyy")}
                      </p>
                      {patient.blood_type && (
                        <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
                          {patient.blood_type}
                        </Badge>
                      )}
                      {patient.health_insurance && (
                        <p className="text-xs">
                          <span className="text-muted-foreground">Convênio:</span>{" "}
                          <span className="font-medium">{patient.health_insurance}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Latest Vitals */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5" />
                    Últimos Sinais Vitais
                  </h4>
                  {latestVitals ? (
                    <div className="bg-background rounded-lg p-3 border space-y-1.5 text-xs">
                      {latestVitals.blood_pressure_systolic && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">PA</span>
                          <span className="font-medium">
                            {latestVitals.blood_pressure_systolic}/{latestVitals.blood_pressure_diastolic} mmHg
                          </span>
                        </div>
                      )}
                      {latestVitals.heart_rate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">FC</span>
                          <span className="font-medium">{latestVitals.heart_rate} bpm</span>
                        </div>
                      )}
                      {latestVitals.glucose && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Glicemia</span>
                          <span className="font-medium">{latestVitals.glucose} mg/dL</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Sem registros</p>
                  )}
                </div>

                <Separator />

                {/* Active Medications */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Pill className="h-3.5 w-3.5" />
                    Medicamentos Ativos
                  </h4>
                  {activeMeds.length > 0 ? (
                    <div className="space-y-1.5">
                      {activeMeds.map((med) => (
                        <div
                          key={med.id}
                          className="bg-background rounded-lg p-2.5 border text-xs"
                        >
                          <p className="font-medium">{med.name}</p>
                          <p className="text-muted-foreground">
                            {med.dosage} • {med.frequency}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Nenhum medicamento ativo</p>
                  )}
                </div>

                <Separator />

                {/* Quick summary of current form */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Resumo Atual
                  </h4>
                  <div className="bg-background rounded-lg p-3 border space-y-2 text-xs">
                    {formData.av_sc_od || formData.av_sc_oe ? (
                      <div>
                        <p className="text-muted-foreground">AV S/C</p>
                        <p className="font-medium">
                          OD: {formData.av_sc_od || "-"} | OE: {formData.av_sc_oe || "-"}
                        </p>
                      </div>
                    ) : null}
                    {formData.tonometriaOD || formData.tonometriaOE ? (
                      <div>
                        <p className="text-muted-foreground">PIO</p>
                        <p className="font-medium">
                          OD: {formData.tonometriaOD || "-"} | OE: {formData.tonometriaOE || "-"} mmHg
                        </p>
                      </div>
                    ) : null}
                    {formData.diagnostico && (
                      <div>
                        <p className="text-muted-foreground">Diagnóstico</p>
                        <p className="font-medium">{formData.diagnostico}</p>
                      </div>
                    )}
                    {!formData.av_sc_od && !formData.tonometriaOD && !formData.diagnostico && (
                      <p className="text-muted-foreground italic">
                        Preencha o formulário para ver o resumo
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
