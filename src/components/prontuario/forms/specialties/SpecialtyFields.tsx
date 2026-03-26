import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export interface SpecialtyData {
  [key: string]: string | boolean | number;
}

interface SpecialtyFieldsProps {
  specialty: string;
  data: SpecialtyData;
  onChange: (data: SpecialtyData) => void;
}

function Field({ label, id, value, onChange, type = "text", placeholder = "", rows }: {
  label: string; id: string; value: string; onChange: (v: string) => void;
  type?: "text" | "textarea" | "number"; placeholder?: string; rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium">{label}</Label>
      {type === "textarea" ? (
        <Textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="min-h-[60px] text-sm" rows={rows || 3} />
      ) : (
        <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="text-sm h-8" />
      )}
    </div>
  );
}

function SelectField({ label, id, value, onChange, options }: {
  label: string; id: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
        <SelectContent>
          {options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function CheckField({ label, id, checked, onChange }: {
  label: string; id: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(!!v)} />
      <Label htmlFor={id} className="text-xs">{label}</Label>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border pb-1 mt-4 first:mt-0">{children}</h4>;
}

const u = (data: SpecialtyData, onChange: (d: SpecialtyData) => void, key: string, val: string | boolean) => onChange({ ...data, [key]: val });
const g = (data: SpecialtyData, key: string) => (data[key] as string) || "";
const gb = (data: SpecialtyData, key: string) => !!data[key];

// ==================== CLÍNICA MÉDICA ====================
function ClinicaMedicaFields({ data, onChange }: { data: SpecialtyData; onChange: (d: SpecialtyData) => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle>SOAP Estruturado</SectionTitle>
      <Field label="S - Subjetivo (Queixas)" id="subjetivo" value={g(data, "subjetivo")} onChange={v => u(data, onChange, "subjetivo", v)} type="textarea" placeholder="Queixas, HDA..." />
      <Field label="O - Objetivo (Exame Físico)" id="objetivo" value={g(data, "objetivo")} onChange={v => u(data, onChange, "objetivo", v)} type="textarea" placeholder="Exame físico, achados..." />
      <Field label="A - Avaliação" id="avaliacao" value={g(data, "avaliacao")} onChange={v => u(data, onChange, "avaliacao", v)} type="textarea" placeholder="Diagnóstico/Hipótese diagnóstica..." />
      <div className="grid grid-cols-2 gap-3">
        <Field label="CID-10" id="cid" value={g(data, "cid")} onChange={v => u(data, onChange, "cid", v)} placeholder="Ex: J18.9" />
        <Field label="Hipótese Diagnóstica" id="hipotese" value={g(data, "hipotese")} onChange={v => u(data, onChange, "hipotese", v)} placeholder="Pneumonia comunitária" />
      </div>
      <Field label="P - Plano / Conduta" id="conduta" value={g(data, "conduta")} onChange={v => u(data, onChange, "conduta", v)} type="textarea" placeholder="Plano terapêutico, conduta..." />
      <Field label="Observações" id="observacoes" value={g(data, "observacoes")} onChange={v => u(data, onChange, "observacoes", v)} type="textarea" placeholder="Observações adicionais..." />
    </div>
  );
}

// ==================== CARDIOLOGIA ====================
function CardiologiaFields({ data, onChange }: { data: SpecialtyData; onChange: (d: SpecialtyData) => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Anamnese Cardiológica</SectionTitle>
      <Field label="Queixa Principal" id="queixa" value={g(data, "queixa")} onChange={v => u(data, onChange, "queixa", v)} type="textarea" />
      <Field label="História Cardiovascular Atual" id="historia_cv" value={g(data, "historia_cv")} onChange={v => u(data, onChange, "historia_cv", v)} type="textarea" />
      <div className="grid grid-cols-2 gap-3">
        <CheckField label="Dor Torácica" id="dor_toracica" checked={gb(data, "dor_toracica")} onChange={v => u(data, onChange, "dor_toracica", v)} />
        <CheckField label="Dispneia" id="dispneia" checked={gb(data, "dispneia")} onChange={v => u(data, onChange, "dispneia", v)} />
        <CheckField label="Palpitações" id="palpitacoes" checked={gb(data, "palpitacoes")} onChange={v => u(data, onChange, "palpitacoes", v)} />
        <CheckField label="Síncope" id="sincope" checked={gb(data, "sincope")} onChange={v => u(data, onChange, "sincope", v)} />
      </div>
      {gb(data, "dor_toracica") && <Field label="Caracterização da Dor Torácica" id="caract_dor" value={g(data, "caract_dor")} onChange={v => u(data, onChange, "caract_dor", v)} type="textarea" placeholder="Localização, irradiação, intensidade..." />}
      <SelectField label="Classe Funcional (NYHA)" id="nyha" value={g(data, "nyha")} onChange={v => u(data, onChange, "nyha", v)} options={[
        { value: "I", label: "I - Sem limitação" }, { value: "II", label: "II - Limitação leve" },
        { value: "III", label: "III - Limitação moderada" }, { value: "IV", label: "IV - Incapaz de qualquer atividade" },
      ]} />
      <SectionTitle>Exame Cardiovascular</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        <Field label="PA (mmHg)" id="pa" value={g(data, "pa")} onChange={v => u(data, onChange, "pa", v)} placeholder="120/80" />
        <Field label="FC (bpm)" id="fc" value={g(data, "fc")} onChange={v => u(data, onChange, "fc", v)} type="number" />
        <Field label="SpO₂ (%)" id="spo2" value={g(data, "spo2")} onChange={v => u(data, onChange, "spo2", v)} type="number" />
      </div>
      <Field label="Ausculta Cardíaca" id="ausculta" value={g(data, "ausculta")} onChange={v => u(data, onChange, "ausculta", v)} type="textarea" placeholder="BNF em 2T, sem sopros..." />
      <CheckField label="Edema de Membros Inferiores" id="edema_mmii" checked={gb(data, "edema_mmii")} onChange={v => u(data, onChange, "edema_mmii", v)} />
      <Field label="ECG (descrição)" id="ecg" value={g(data, "ecg")} onChange={v => u(data, onChange, "ecg", v)} type="textarea" placeholder="Ritmo sinusal, sem alterações..." />
      <Field label="Ecocardiograma Prévio" id="eco" value={g(data, "eco")} onChange={v => u(data, onChange, "eco", v)} type="textarea" />
      <SectionTitle>Conclusão</SectionTitle>
      <Field label="Diagnóstico / Estratificação" id="diagnostico" value={g(data, "diagnostico")} onChange={v => u(data, onChange, "diagnostico", v)} type="textarea" />
      <Field label="Conduta" id="conduta" value={g(data, "conduta")} onChange={v => u(data, onChange, "conduta", v)} type="textarea" />
    </div>
  );
}

// ==================== PEDIATRIA ====================
function PediatriaFields({ data, onChange }: { data: SpecialtyData; onChange: (d: SpecialtyData) => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Dados Pediátricos</SectionTitle>
      <Field label="Queixa Principal" id="queixa" value={g(data, "queixa")} onChange={v => u(data, onChange, "queixa", v)} type="textarea" />
      <div className="grid grid-cols-3 gap-3">
        <Field label="Idade Cronológica" id="idade_crono" value={g(data, "idade_crono")} onChange={v => u(data, onChange, "idade_crono", v)} placeholder="2a 3m" />
        <Field label="IG ao Nascer (sem)" id="ig_nascer" value={g(data, "ig_nascer")} onChange={v => u(data, onChange, "ig_nascer", v)} placeholder="39" />
        <Field label="Peso ao Nascer (g)" id="peso_nascer" value={g(data, "peso_nascer")} onChange={v => u(data, onChange, "peso_nascer", v)} type="number" />
      </div>
      <SectionTitle>Antropometria</SectionTitle>
      <div className="grid grid-cols-4 gap-3">
        <Field label="Peso (kg)" id="peso" value={g(data, "peso")} onChange={v => u(data, onChange, "peso", v)} type="number" />
        <Field label="Estatura (cm)" id="estatura" value={g(data, "estatura")} onChange={v => u(data, onChange, "estatura", v)} type="number" />
        <Field label="IMC" id="imc" value={g(data, "imc")} onChange={v => u(data, onChange, "imc", v)} type="number" />
        <Field label="PC (cm)" id="pc" value={g(data, "pc")} onChange={v => u(data, onChange, "pc", v)} type="number" />
      </div>
      <SectionTitle>Desenvolvimento e Alimentação</SectionTitle>
      <Field label="Alimentação" id="alimentacao" value={g(data, "alimentacao")} onChange={v => u(data, onChange, "alimentacao", v)} type="textarea" placeholder="AME, fórmula, alimentação complementar..." />
      <Field label="Vacinação" id="vacinacao" value={g(data, "vacinacao")} onChange={v => u(data, onChange, "vacinacao", v)} type="textarea" placeholder="Calendário atualizado / pendências..." />
      <Field label="Marcos do Desenvolvimento" id="marcos" value={g(data, "marcos")} onChange={v => u(data, onChange, "marcos", v)} type="textarea" placeholder="Motor, linguagem, social..." />
      <SectionTitle>Exame Físico Pediátrico</SectionTitle>
      <Field label="Exame Físico" id="exame_fisico" value={g(data, "exame_fisico")} onChange={v => u(data, onChange, "exame_fisico", v)} type="textarea" rows={4} />
      <SectionTitle>Conclusão</SectionTitle>
      <Field label="Hipótese Diagnóstica" id="diagnostico" value={g(data, "diagnostico")} onChange={v => u(data, onChange, "diagnostico", v)} type="textarea" />
      <Field label="Conduta" id="conduta" value={g(data, "conduta")} onChange={v => u(data, onChange, "conduta", v)} type="textarea" />
      <Field label="Orientações à Família" id="orientacoes" value={g(data, "orientacoes")} onChange={v => u(data, onChange, "orientacoes", v)} type="textarea" />
    </div>
  );
}

// ==================== OFTALMOLOGIA ====================
function OftalmologiaFields({ data, onChange }: { data: SpecialtyData; onChange: (d: SpecialtyData) => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Avaliação Oftalmológica</SectionTitle>
      <Field label="Queixa Oftalmológica" id="queixa" value={g(data, "queixa")} onChange={v => u(data, onChange, "queixa", v)} type="textarea" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Acuidade Visual OD" id="av_od" value={g(data, "av_od")} onChange={v => u(data, onChange, "av_od", v)} placeholder="20/20" />
        <Field label="Acuidade Visual OE" id="av_oe" value={g(data, "av_oe")} onChange={v => u(data, onChange, "av_oe", v)} placeholder="20/20" />
      </div>
      <Field label="Refração" id="refracao" value={g(data, "refracao")} onChange={v => u(data, onChange, "refracao", v)} type="textarea" />
      <Field label="Biomicroscopia" id="biomicroscopia" value={g(data, "biomicroscopia")} onChange={v => u(data, onChange, "biomicroscopia", v)} type="textarea" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="PIO OD (mmHg)" id="pio_od" value={g(data, "pio_od")} onChange={v => u(data, onChange, "pio_od", v)} type="number" />
        <Field label="PIO OE (mmHg)" id="pio_oe" value={g(data, "pio_oe")} onChange={v => u(data, onChange, "pio_oe", v)} type="number" />
      </div>
      <Field label="Fundo de Olho" id="fundo_olho" value={g(data, "fundo_olho")} onChange={v => u(data, onChange, "fundo_olho", v)} type="textarea" />
      <Field label="Motilidade Ocular" id="motilidade" value={g(data, "motilidade")} onChange={v => u(data, onChange, "motilidade", v)} type="textarea" />
      <SectionTitle>Conclusão</SectionTitle>
      <Field label="Diagnóstico" id="diagnostico" value={g(data, "diagnostico")} onChange={v => u(data, onChange, "diagnostico", v)} type="textarea" />
      <Field label="Conduta" id="conduta" value={g(data, "conduta")} onChange={v => u(data, onChange, "conduta", v)} type="textarea" />
      <Field label="Observações" id="observacoes" value={g(data, "observacoes")} onChange={v => u(data, onChange, "observacoes", v)} type="textarea" />
    </div>
  );
}

// ==================== NEUROLOGIA ====================
function NeurologiaFields({ data, onChange }: { data: SpecialtyData; onChange: (d: SpecialtyData) => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Anamnese Neurológica</SectionTitle>
      <Field label="Queixa Neurológica" id="queixa" value={g(data, "queixa")} onChange={v => u(data, onChange, "queixa", v)} type="textarea" />
      <Field label="Início e Evolução dos Sintomas" id="evolucao_sintomas" value={g(data, "evolucao_sintomas")} onChange={v => u(data, onChange, "evolucao_sintomas", v)} type="textarea" />
      <SectionTitle>Exame Neurológico</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Nível de Consciência" id="consciencia" value={g(data, "consciencia")} onChange={v => u(data, onChange, "consciencia", v)} options={[
          { value: "alerta", label: "Alerta" }, { value: "sonolento", label: "Sonolento" },
          { value: "torporoso", label: "Torporoso" }, { value: "comatoso", label: "Comatoso" },
        ]} />
        <Field label="Glasgow" id="glasgow" value={g(data, "glasgow")} onChange={v => u(data, onChange, "glasgow", v)} placeholder="15" />
      </div>
      <Field label="Força Muscular" id="forca" value={g(data, "forca")} onChange={v => u(data, onChange, "forca", v)} type="textarea" placeholder="MSD: 5/5, MSE: 5/5, MID: 5/5, MIE: 5/5" />
      <Field label="Sensibilidade" id="sensibilidade" value={g(data, "sensibilidade")} onChange={v => u(data, onChange, "sensibilidade", v)} type="textarea" />
      <Field label="Pares Cranianos" id="pares" value={g(data, "pares")} onChange={v => u(data, onChange, "pares", v)} type="textarea" />
      <Field label="Coordenação" id="coordenacao" value={g(data, "coordenacao")} onChange={v => u(data, onChange, "coordenacao", v)} type="textarea" />
      <Field label="Marcha" id="marcha" value={g(data, "marcha")} onChange={v => u(data, onChange, "marcha", v)} type="textarea" />
      <Field label="Reflexos" id="reflexos" value={g(data, "reflexos")} onChange={v => u(data, onChange, "reflexos", v)} type="textarea" />
      <SectionTitle>Conclusão</SectionTitle>
      <Field label="Hipótese Diagnóstica" id="diagnostico" value={g(data, "diagnostico")} onChange={v => u(data, onChange, "diagnostico", v)} type="textarea" />
      <Field label="Conduta" id="conduta" value={g(data, "conduta")} onChange={v => u(data, onChange, "conduta", v)} type="textarea" />
    </div>
  );
}

// ==================== ORTOPEDIA ====================
function OrtopediaFields({ data, onChange }: { data: SpecialtyData; onChange: (d: SpecialtyData) => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Avaliação Ortopédica</SectionTitle>
      <Field label="Queixa Ortopédica" id="queixa" value={g(data, "queixa")} onChange={v => u(data, onChange, "queixa", v)} type="textarea" />
      <Field label="Segmento Acometido" id="segmento" value={g(data, "segmento")} onChange={v => u(data, onChange, "segmento", v)} />
      <Field label="Mecanismo de Trauma" id="mecanismo" value={g(data, "mecanismo")} onChange={v => u(data, onChange, "mecanismo", v)} type="textarea" />
      <div className="grid grid-cols-2 gap-3">
        <CheckField label="Dor" id="dor" checked={gb(data, "dor")} onChange={v => u(data, onChange, "dor", v)} />
        <CheckField label="Edema" id="edema" checked={gb(data, "edema")} onChange={v => u(data, onChange, "edema", v)} />
        <CheckField label="Limitação Funcional" id="limitacao" checked={gb(data, "limitacao")} onChange={v => u(data, onChange, "limitacao", v)} />
      </div>
      <SectionTitle>Exame Físico</SectionTitle>
      <Field label="Inspeção" id="inspecao" value={g(data, "inspecao")} onChange={v => u(data, onChange, "inspecao", v)} type="textarea" />
      <Field label="Mobilidade" id="mobilidade" value={g(data, "mobilidade")} onChange={v => u(data, onChange, "mobilidade", v)} type="textarea" />
      <Field label="Testes Ortopédicos" id="testes" value={g(data, "testes")} onChange={v => u(data, onChange, "testes", v)} type="textarea" />
      <Field label="Exames de Imagem" id="imagem" value={g(data, "imagem")} onChange={v => u(data, onChange, "imagem", v)} type="textarea" />
      <SectionTitle>Conclusão</SectionTitle>
      <Field label="Diagnóstico" id="diagnostico" value={g(data, "diagnostico")} onChange={v => u(data, onChange, "diagnostico", v)} type="textarea" />
      <Field label="Conduta" id="conduta" value={g(data, "conduta")} onChange={v => u(data, onChange, "conduta", v)} type="textarea" />
    </div>
  );
}

// ==================== GINECOLOGIA ====================
function GinecologiaFields({ data, onChange }: { data: SpecialtyData; onChange: (d: SpecialtyData) => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Anamnese Ginecológica</SectionTitle>
      <Field label="Queixa Ginecológica" id="queixa" value={g(data, "queixa")} onChange={v => u(data, onChange, "queixa", v)} type="textarea" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="DUM" id="dum" value={g(data, "dum")} onChange={v => u(data, onChange, "dum", v)} placeholder="dd/mm/aaaa" />
        <Field label="Ciclo Menstrual" id="ciclo" value={g(data, "ciclo")} onChange={v => u(data, onChange, "ciclo", v)} placeholder="Regular, 28 dias" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CheckField label="Corrimento" id="corrimento" checked={gb(data, "corrimento")} onChange={v => u(data, onChange, "corrimento", v)} />
        <CheckField label="Sangramento Anormal" id="sangramento" checked={gb(data, "sangramento")} onChange={v => u(data, onChange, "sangramento", v)} />
        <CheckField label="Dor Pélvica" id="dor_pelvica" checked={gb(data, "dor_pelvica")} onChange={v => u(data, onChange, "dor_pelvica", v)} />
      </div>
      <Field label="Método Contraceptivo" id="contraceptivo" value={g(data, "contraceptivo")} onChange={v => u(data, onChange, "contraceptivo", v)} />
      <Field label="História Ginecológica" id="historia_gineco" value={g(data, "historia_gineco")} onChange={v => u(data, onChange, "historia_gineco", v)} type="textarea" />
      <Field label="Exame Ginecológico" id="exame" value={g(data, "exame")} onChange={v => u(data, onChange, "exame", v)} type="textarea" />
      <SectionTitle>Conclusão</SectionTitle>
      <Field label="Hipótese Diagnóstica" id="diagnostico" value={g(data, "diagnostico")} onChange={v => u(data, onChange, "diagnostico", v)} type="textarea" />
      <Field label="Conduta" id="conduta" value={g(data, "conduta")} onChange={v => u(data, onChange, "conduta", v)} type="textarea" />
    </div>
  );
}

// ==================== OBSTETRÍCIA ====================
function ObstetriciaFields({ data, onChange }: { data: SpecialtyData; onChange: (d: SpecialtyData) => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Dados Obstétricos</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        <Field label="IG (semanas)" id="ig" value={g(data, "ig")} onChange={v => u(data, onChange, "ig", v)} />
        <Field label="G/P/A" id="gpa" value={g(data, "gpa")} onChange={v => u(data, onChange, "gpa", v)} placeholder="G2P1A0" />
        <Field label="DPP" id="dpp" value={g(data, "dpp")} onChange={v => u(data, onChange, "dpp", v)} />
      </div>
      <Field label="DUM" id="dum" value={g(data, "dum")} onChange={v => u(data, onChange, "dum", v)} />
      <SectionTitle>Avaliação</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        <Field label="BCF (bpm)" id="bcf" value={g(data, "bcf")} onChange={v => u(data, onChange, "bcf", v)} type="number" />
        <Field label="PA (mmHg)" id="pa" value={g(data, "pa")} onChange={v => u(data, onChange, "pa", v)} />
        <Field label="Peso Materno (kg)" id="peso" value={g(data, "peso")} onChange={v => u(data, onChange, "peso", v)} type="number" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CheckField label="Movimentos Fetais Presentes" id="mov_fetais" checked={gb(data, "mov_fetais")} onChange={v => u(data, onChange, "mov_fetais", v)} />
        <CheckField label="Edema" id="edema" checked={gb(data, "edema")} onChange={v => u(data, onChange, "edema", v)} />
      </div>
      <Field label="Queixas Obstétricas" id="queixas" value={g(data, "queixas")} onChange={v => u(data, onChange, "queixas", v)} type="textarea" />
      <Field label="Exames Pré-Natais" id="exames_pn" value={g(data, "exames_pn")} onChange={v => u(data, onChange, "exames_pn", v)} type="textarea" />
      <Field label="Avaliação Obstétrica" id="avaliacao" value={g(data, "avaliacao")} onChange={v => u(data, onChange, "avaliacao", v)} type="textarea" />
      <Field label="Conduta" id="conduta" value={g(data, "conduta")} onChange={v => u(data, onChange, "conduta", v)} type="textarea" />
    </div>
  );
}

// ==================== PNEUMOLOGIA ====================
function PneumologiaFields({ data, onChange }: { data: SpecialtyData; onChange: (d: SpecialtyData) => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Anamnese Pneumológica</SectionTitle>
      <Field label="Queixa Respiratória" id="queixa" value={g(data, "queixa")} onChange={v => u(data, onChange, "queixa", v)} type="textarea" />
      <div className="grid grid-cols-2 gap-3">
        <CheckField label="Tosse" id="tosse" checked={gb(data, "tosse")} onChange={v => u(data, onChange, "tosse", v)} />
        <CheckField label="Dispneia" id="dispneia" checked={gb(data, "dispneia")} onChange={v => u(data, onChange, "dispneia", v)} />
        <CheckField label="Sibilância" id="sibilancia" checked={gb(data, "sibilancia")} onChange={v => u(data, onChange, "sibilancia", v)} />
        <CheckField label="Tabagismo" id="tabagismo" checked={gb(data, "tabagismo")} onChange={v => u(data, onChange, "tabagismo", v)} />
      </div>
      <Field label="Expectoração" id="expectoracao" value={g(data, "expectoracao")} onChange={v => u(data, onChange, "expectoracao", v)} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="SpO₂ (%)" id="spo2" value={g(data, "spo2")} onChange={v => u(data, onChange, "spo2", v)} type="number" />
        <Field label="FR (rpm)" id="fr" value={g(data, "fr")} onChange={v => u(data, onChange, "fr", v)} type="number" />
      </div>
      <Field label="Ausculta Pulmonar" id="ausculta" value={g(data, "ausculta")} onChange={v => u(data, onChange, "ausculta", v)} type="textarea" />
      <Field label="Exames Respiratórios" id="exames" value={g(data, "exames")} onChange={v => u(data, onChange, "exames", v)} type="textarea" />
      <SectionTitle>Conclusão</SectionTitle>
      <Field label="Diagnóstico" id="diagnostico" value={g(data, "diagnostico")} onChange={v => u(data, onChange, "diagnostico", v)} type="textarea" />
      <Field label="Conduta" id="conduta" value={g(data, "conduta")} onChange={v => u(data, onChange, "conduta", v)} type="textarea" />
    </div>
  );
}

// ==================== ENDOCRINOLOGIA ====================
function EndocrinologiaFields({ data, onChange }: { data: SpecialtyData; onChange: (d: SpecialtyData) => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Avaliação Endócrina</SectionTitle>
      <Field label="Queixa Endócrina" id="queixa" value={g(data, "queixa")} onChange={v => u(data, onChange, "queixa", v)} type="textarea" />
      <div className="grid grid-cols-4 gap-3">
        <Field label="Peso (kg)" id="peso" value={g(data, "peso")} onChange={v => u(data, onChange, "peso", v)} type="number" />
        <Field label="IMC" id="imc" value={g(data, "imc")} onChange={v => u(data, onChange, "imc", v)} type="number" />
        <Field label="Circ. Abdominal (cm)" id="circ_abd" value={g(data, "circ_abd")} onChange={v => u(data, onChange, "circ_abd", v)} type="number" />
        <Field label="Glicemia (mg/dL)" id="glicemia" value={g(data, "glicemia")} onChange={v => u(data, onChange, "glicemia", v)} type="number" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="HbA1c (%)" id="hba1c" value={g(data, "hba1c")} onChange={v => u(data, onChange, "hba1c", v)} />
        <Field label="TSH / T4" id="tsh_t4" value={g(data, "tsh_t4")} onChange={v => u(data, onChange, "tsh_t4", v)} />
      </div>
      <Field label="Exame Físico Endócrino" id="exame" value={g(data, "exame")} onChange={v => u(data, onChange, "exame", v)} type="textarea" />
      <SectionTitle>Conclusão</SectionTitle>
      <Field label="Diagnóstico" id="diagnostico" value={g(data, "diagnostico")} onChange={v => u(data, onChange, "diagnostico", v)} type="textarea" />
      <Field label="Conduta" id="conduta" value={g(data, "conduta")} onChange={v => u(data, onChange, "conduta", v)} type="textarea" />
    </div>
  );
}

// ==================== GASTROENTEROLOGIA ====================
function GastroenterologiaFields({ data, onChange }: { data: SpecialtyData; onChange: (d: SpecialtyData) => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Anamnese Gastrointestinal</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <CheckField label="Dor Abdominal" id="dor_abd" checked={gb(data, "dor_abd")} onChange={v => u(data, onChange, "dor_abd", v)} />
        <CheckField label="Náuseas/Vômitos" id="nauseas" checked={gb(data, "nauseas")} onChange={v => u(data, onChange, "nauseas", v)} />
        <CheckField label="Refluxo/Dispepsia" id="refluxo" checked={gb(data, "refluxo")} onChange={v => u(data, onChange, "refluxo", v)} />
      </div>
      <Field label="Hábito Intestinal" id="habito_intestinal" value={g(data, "habito_intestinal")} onChange={v => u(data, onChange, "habito_intestinal", v)} type="textarea" />
      <Field label="Exame Abdominal" id="exame_abd" value={g(data, "exame_abd")} onChange={v => u(data, onChange, "exame_abd", v)} type="textarea" />
      <Field label="Exames Laboratoriais/Imagenológicos" id="exames" value={g(data, "exames")} onChange={v => u(data, onChange, "exames", v)} type="textarea" />
      <SectionTitle>Conclusão</SectionTitle>
      <Field label="Diagnóstico" id="diagnostico" value={g(data, "diagnostico")} onChange={v => u(data, onChange, "diagnostico", v)} type="textarea" />
      <Field label="Conduta" id="conduta" value={g(data, "conduta")} onChange={v => u(data, onChange, "conduta", v)} type="textarea" />
    </div>
  );
}

// ==================== NEFROLOGIA ====================
function NefrologiaFields({ data, onChange }: { data: SpecialtyData; onChange: (d: SpecialtyData) => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Avaliação Nefrológica</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Diurese (mL/24h)" id="diurese" value={g(data, "diurese")} onChange={v => u(data, onChange, "diurese", v)} type="number" />
        <Field label="Creatinina (mg/dL)" id="creatinina" value={g(data, "creatinina")} onChange={v => u(data, onChange, "creatinina", v)} />
        <Field label="Ureia (mg/dL)" id="ureia" value={g(data, "ureia")} onChange={v => u(data, onChange, "ureia", v)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CheckField label="Edema" id="edema" checked={gb(data, "edema")} onChange={v => u(data, onChange, "edema", v)} />
        <Field label="PA (mmHg)" id="pa" value={g(data, "pa")} onChange={v => u(data, onChange, "pa", v)} />
      </div>
      <Field label="Distúrbios Hidroeletrolíticos" id="disturbios" value={g(data, "disturbios")} onChange={v => u(data, onChange, "disturbios", v)} type="textarea" />
      <Field label="Urinálise" id="urinalise" value={g(data, "urinalise")} onChange={v => u(data, onChange, "urinalise", v)} type="textarea" />
      <SectionTitle>Conclusão</SectionTitle>
      <Field label="Diagnóstico" id="diagnostico" value={g(data, "diagnostico")} onChange={v => u(data, onChange, "diagnostico", v)} type="textarea" />
      <Field label="Conduta" id="conduta" value={g(data, "conduta")} onChange={v => u(data, onChange, "conduta", v)} type="textarea" />
    </div>
  );
}

// ==================== UROLOGIA ====================
function UrologiaFields({ data, onChange }: { data: SpecialtyData; onChange: (d: SpecialtyData) => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Avaliação Urológica</SectionTitle>
      <Field label="Sintomas Urinários" id="sintomas" value={g(data, "sintomas")} onChange={v => u(data, onChange, "sintomas", v)} type="textarea" />
      <div className="grid grid-cols-2 gap-3">
        <CheckField label="Disúria" id="disuria" checked={gb(data, "disuria")} onChange={v => u(data, onChange, "disuria", v)} />
        <CheckField label="Hematúria" id="hematuria" checked={gb(data, "hematuria")} onChange={v => u(data, onChange, "hematuria", v)} />
        <CheckField label="Dor Lombar" id="dor_lombar" checked={gb(data, "dor_lombar")} onChange={v => u(data, onChange, "dor_lombar", v)} />
      </div>
      <Field label="Jato Urinário" id="jato" value={g(data, "jato")} onChange={v => u(data, onChange, "jato", v)} />
      <Field label="Toque Retal / Próstata" id="toque" value={g(data, "toque")} onChange={v => u(data, onChange, "toque", v)} type="textarea" />
      <Field label="Exames" id="exames" value={g(data, "exames")} onChange={v => u(data, onChange, "exames", v)} type="textarea" />
      <SectionTitle>Conclusão</SectionTitle>
      <Field label="Diagnóstico" id="diagnostico" value={g(data, "diagnostico")} onChange={v => u(data, onChange, "diagnostico", v)} type="textarea" />
      <Field label="Conduta" id="conduta" value={g(data, "conduta")} onChange={v => u(data, onChange, "conduta", v)} type="textarea" />
    </div>
  );
}

// ==================== DERMATOLOGIA ====================
function DermatologiaFields({ data, onChange }: { data: SpecialtyData; onChange: (d: SpecialtyData) => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Avaliação Dermatológica</SectionTitle>
      <Field label="Queixa Dermatológica" id="queixa" value={g(data, "queixa")} onChange={v => u(data, onChange, "queixa", v)} type="textarea" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Localização da Lesão" id="localizacao" value={g(data, "localizacao")} onChange={v => u(data, onChange, "localizacao", v)} />
        <Field label="Morfologia" id="morfologia" value={g(data, "morfologia")} onChange={v => u(data, onChange, "morfologia", v)} />
        <Field label="Distribuição" id="distribuicao" value={g(data, "distribuicao")} onChange={v => u(data, onChange, "distribuicao", v)} />
        <Field label="Cor" id="cor" value={g(data, "cor")} onChange={v => u(data, onChange, "cor", v)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CheckField label="Prurido" id="prurido" checked={gb(data, "prurido")} onChange={v => u(data, onChange, "prurido", v)} />
        <CheckField label="Dor" id="dor" checked={gb(data, "dor")} onChange={v => u(data, onChange, "dor", v)} />
      </div>
      <Field label="Tempo de Evolução" id="tempo" value={g(data, "tempo")} onChange={v => u(data, onChange, "tempo", v)} />
      <SectionTitle>Conclusão</SectionTitle>
      <Field label="Diagnóstico" id="diagnostico" value={g(data, "diagnostico")} onChange={v => u(data, onChange, "diagnostico", v)} type="textarea" />
      <Field label="Conduta" id="conduta" value={g(data, "conduta")} onChange={v => u(data, onChange, "conduta", v)} type="textarea" />
    </div>
  );
}

// ==================== PSIQUIATRIA ====================
function PsiquiatriaFields({ data, onChange }: { data: SpecialtyData; onChange: (d: SpecialtyData) => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Exame do Estado Mental</SectionTitle>
      <Field label="Queixa Principal" id="queixa" value={g(data, "queixa")} onChange={v => u(data, onChange, "queixa", v)} type="textarea" />
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Humor" id="humor" value={g(data, "humor")} onChange={v => u(data, onChange, "humor", v)} options={[
          { value: "eutimico", label: "Eutímico" }, { value: "deprimido", label: "Deprimido" },
          { value: "ansioso", label: "Ansioso" }, { value: "irritavel", label: "Irritável" },
          { value: "eufórico", label: "Eufórico" },
        ]} />
        <SelectField label="Afeto" id="afeto" value={g(data, "afeto")} onChange={v => u(data, onChange, "afeto", v)} options={[
          { value: "congruente", label: "Congruente" }, { value: "incongruente", label: "Incongruente" },
          { value: "embotado", label: "Embotado" }, { value: "labil", label: "Lábil" },
        ]} />
      </div>
      <Field label="Pensamento (Forma e Curso)" id="pensamento" value={g(data, "pensamento")} onChange={v => u(data, onChange, "pensamento", v)} type="textarea" />
      <Field label="Conteúdo do Pensamento" id="conteudo" value={g(data, "conteudo")} onChange={v => u(data, onChange, "conteudo", v)} type="textarea" placeholder="Delírios, ideação suicida..." />
      <Field label="Percepção" id="percepcao" value={g(data, "percepcao")} onChange={v => u(data, onChange, "percepcao", v)} type="textarea" placeholder="Alucinações..." />
      <Field label="Cognição" id="cognicao" value={g(data, "cognicao")} onChange={v => u(data, onChange, "cognicao", v)} type="textarea" />
      <Field label="Julgamento e Crítica" id="julgamento" value={g(data, "julgamento")} onChange={v => u(data, onChange, "julgamento", v)} type="textarea" />
      <SelectField label="Risco Suicida" id="risco_suicida" value={g(data, "risco_suicida")} onChange={v => u(data, onChange, "risco_suicida", v)} options={[
        { value: "ausente", label: "Ausente" }, { value: "baixo", label: "Baixo" },
        { value: "moderado", label: "Moderado" }, { value: "alto", label: "Alto" },
      ]} />
      <SectionTitle>Conclusão</SectionTitle>
      <Field label="Diagnóstico" id="diagnostico" value={g(data, "diagnostico")} onChange={v => u(data, onChange, "diagnostico", v)} type="textarea" />
      <Field label="Conduta" id="conduta" value={g(data, "conduta")} onChange={v => u(data, onChange, "conduta", v)} type="textarea" />
    </div>
  );
}

// ==================== ORL ====================
function ORLFields({ data, onChange }: { data: SpecialtyData; onChange: (d: SpecialtyData) => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Anamnese ORL</SectionTitle>
      <Field label="Queixa ORL" id="queixa" value={g(data, "queixa")} onChange={v => u(data, onChange, "queixa", v)} type="textarea" />
      <div className="grid grid-cols-2 gap-3">
        <CheckField label="Otalgia" id="otalgia" checked={gb(data, "otalgia")} onChange={v => u(data, onChange, "otalgia", v)} />
        <CheckField label="Hipoacusia" id="hipoacusia" checked={gb(data, "hipoacusia")} onChange={v => u(data, onChange, "hipoacusia", v)} />
        <CheckField label="Vertigem" id="vertigem" checked={gb(data, "vertigem")} onChange={v => u(data, onChange, "vertigem", v)} />
        <CheckField label="Obstrução Nasal" id="obstrucao" checked={gb(data, "obstrucao")} onChange={v => u(data, onChange, "obstrucao", v)} />
        <CheckField label="Odinofagia" id="odinofagia" checked={gb(data, "odinofagia")} onChange={v => u(data, onChange, "odinofagia", v)} />
      </div>
      <SectionTitle>Exame ORL</SectionTitle>
      <Field label="Otoscopia" id="otoscopia" value={g(data, "otoscopia")} onChange={v => u(data, onChange, "otoscopia", v)} type="textarea" />
      <Field label="Orofaringe" id="orofaringe" value={g(data, "orofaringe")} onChange={v => u(data, onChange, "orofaringe", v)} type="textarea" />
      <SectionTitle>Conclusão</SectionTitle>
      <Field label="Diagnóstico" id="diagnostico" value={g(data, "diagnostico")} onChange={v => u(data, onChange, "diagnostico", v)} type="textarea" />
      <Field label="Conduta" id="conduta" value={g(data, "conduta")} onChange={v => u(data, onChange, "conduta", v)} type="textarea" />
    </div>
  );
}

// ==================== INFECTOLOGIA ====================
function InfectologiaFields({ data, onChange }: { data: SpecialtyData; onChange: (d: SpecialtyData) => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Avaliação Infectológica</SectionTitle>
      <Field label="Foco Infeccioso Suspeito" id="foco" value={g(data, "foco")} onChange={v => u(data, onChange, "foco", v)} type="textarea" />
      <div className="grid grid-cols-2 gap-3">
        <CheckField label="Febre" id="febre" checked={gb(data, "febre")} onChange={v => u(data, onChange, "febre", v)} />
        <CheckField label="Isolamento" id="isolamento" checked={gb(data, "isolamento")} onChange={v => u(data, onChange, "isolamento", v)} />
      </div>
      <Field label="Antimicrobianos em Uso" id="antimicrobianos" value={g(data, "antimicrobianos")} onChange={v => u(data, onChange, "antimicrobianos", v)} type="textarea" />
      <Field label="Culturas" id="culturas" value={g(data, "culturas")} onChange={v => u(data, onChange, "culturas", v)} type="textarea" />
      <Field label="Exames Laboratoriais" id="exames" value={g(data, "exames")} onChange={v => u(data, onChange, "exames", v)} type="textarea" />
      <SectionTitle>Conclusão</SectionTitle>
      <Field label="Diagnóstico" id="diagnostico" value={g(data, "diagnostico")} onChange={v => u(data, onChange, "diagnostico", v)} type="textarea" />
      <Field label="Conduta" id="conduta" value={g(data, "conduta")} onChange={v => u(data, onChange, "conduta", v)} type="textarea" />
    </div>
  );
}

// ==================== REUMATOLOGIA ====================
function ReumatologiaFields({ data, onChange }: { data: SpecialtyData; onChange: (d: SpecialtyData) => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Avaliação Reumatológica</SectionTitle>
      <Field label="Dor Articular" id="dor_articular" value={g(data, "dor_articular")} onChange={v => u(data, onChange, "dor_articular", v)} type="textarea" />
      <Field label="Rigidez Matinal (duração)" id="rigidez" value={g(data, "rigidez")} onChange={v => u(data, onChange, "rigidez", v)} />
      <Field label="Articulações Acometidas" id="articulacoes" value={g(data, "articulacoes")} onChange={v => u(data, onChange, "articulacoes", v)} type="textarea" />
      <div className="grid grid-cols-2 gap-3">
        <CheckField label="Edema Articular" id="edema" checked={gb(data, "edema")} onChange={v => u(data, onChange, "edema", v)} />
        <CheckField label="Deformidades" id="deformidades" checked={gb(data, "deformidades")} onChange={v => u(data, onChange, "deformidades", v)} />
      </div>
      <Field label="Sorologias Relevantes" id="sorologias" value={g(data, "sorologias")} onChange={v => u(data, onChange, "sorologias", v)} type="textarea" />
      <SectionTitle>Conclusão</SectionTitle>
      <Field label="Diagnóstico" id="diagnostico" value={g(data, "diagnostico")} onChange={v => u(data, onChange, "diagnostico", v)} type="textarea" />
      <Field label="Conduta" id="conduta" value={g(data, "conduta")} onChange={v => u(data, onChange, "conduta", v)} type="textarea" />
    </div>
  );
}

// ==================== HEMATOLOGIA ====================
function HematologiaFields({ data, onChange }: { data: SpecialtyData; onChange: (d: SpecialtyData) => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Avaliação Hematológica</SectionTitle>
      <Field label="Queixa Hematológica" id="queixa" value={g(data, "queixa")} onChange={v => u(data, onChange, "queixa", v)} type="textarea" />
      <div className="grid grid-cols-3 gap-3">
        <Field label="Hb/Ht" id="hb_ht" value={g(data, "hb_ht")} onChange={v => u(data, onChange, "hb_ht", v)} />
        <Field label="Leucócitos" id="leucocitos" value={g(data, "leucocitos")} onChange={v => u(data, onChange, "leucocitos", v)} />
        <Field label="Plaquetas" id="plaquetas" value={g(data, "plaquetas")} onChange={v => u(data, onChange, "plaquetas", v)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CheckField label="Sangramentos" id="sangramentos" checked={gb(data, "sangramentos")} onChange={v => u(data, onChange, "sangramentos", v)} />
        <CheckField label="Linfonodos Palpáveis" id="linfonodos" checked={gb(data, "linfonodos")} onChange={v => u(data, onChange, "linfonodos", v)} />
      </div>
      <Field label="Exames Específicos" id="exames" value={g(data, "exames")} onChange={v => u(data, onChange, "exames", v)} type="textarea" />
      <SectionTitle>Conclusão</SectionTitle>
      <Field label="Diagnóstico" id="diagnostico" value={g(data, "diagnostico")} onChange={v => u(data, onChange, "diagnostico", v)} type="textarea" />
      <Field label="Conduta" id="conduta" value={g(data, "conduta")} onChange={v => u(data, onChange, "conduta", v)} type="textarea" />
    </div>
  );
}

// ==================== ONCOLOGIA ====================
function OncologiaFields({ data, onChange }: { data: SpecialtyData; onChange: (d: SpecialtyData) => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Evolução Oncológica</SectionTitle>
      <Field label="Diagnóstico Oncológico" id="diagnostico_onco" value={g(data, "diagnostico_onco")} onChange={v => u(data, onChange, "diagnostico_onco", v)} type="textarea" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Estadiamento" id="estadiamento" value={g(data, "estadiamento")} onChange={v => u(data, onChange, "estadiamento", v)} />
        <Field label="Linha de Tratamento" id="linha" value={g(data, "linha")} onChange={v => u(data, onChange, "linha", v)} />
      </div>
      <Field label="Sintomas Atuais" id="sintomas" value={g(data, "sintomas")} onChange={v => u(data, onChange, "sintomas", v)} type="textarea" />
      <Field label="Toxicidades" id="toxicidades" value={g(data, "toxicidades")} onChange={v => u(data, onChange, "toxicidades", v)} type="textarea" />
      <SelectField label="Performance Status (ECOG)" id="ecog" value={g(data, "ecog")} onChange={v => u(data, onChange, "ecog", v)} options={[
        { value: "0", label: "0 - Atividade normal" }, { value: "1", label: "1 - Sintomático, ambulatorial" },
        { value: "2", label: "2 - Acamado <50%" }, { value: "3", label: "3 - Acamado >50%" },
        { value: "4", label: "4 - Acamado 100%" },
      ]} />
      <Field label="Exames Relevantes" id="exames" value={g(data, "exames")} onChange={v => u(data, onChange, "exames", v)} type="textarea" />
      <SectionTitle>Conclusão</SectionTitle>
      <Field label="Conduta" id="conduta" value={g(data, "conduta")} onChange={v => u(data, onChange, "conduta", v)} type="textarea" />
    </div>
  );
}

// ==================== CIRURGIA GERAL ====================
function CirurgiaGeralFields({ data, onChange }: { data: SpecialtyData; onChange: (d: SpecialtyData) => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Avaliação Cirúrgica</SectionTitle>
      <Field label="Queixa Cirúrgica" id="queixa" value={g(data, "queixa")} onChange={v => u(data, onChange, "queixa", v)} type="textarea" />
      <Field label="História Atual" id="historia" value={g(data, "historia")} onChange={v => u(data, onChange, "historia", v)} type="textarea" />
      <Field label="Exame Abdominal / Segmento" id="exame" value={g(data, "exame")} onChange={v => u(data, onChange, "exame", v)} type="textarea" />
      <Field label="Diagnóstico Cirúrgico" id="diagnostico" value={g(data, "diagnostico")} onChange={v => u(data, onChange, "diagnostico", v)} type="textarea" />
      <Field label="Indicação de Procedimento" id="indicacao" value={g(data, "indicacao")} onChange={v => u(data, onChange, "indicacao", v)} type="textarea" />
      <SelectField label="Risco/Urgência" id="urgencia" value={g(data, "urgencia")} onChange={v => u(data, onChange, "urgencia", v)} options={[
        { value: "eletivo", label: "Eletivo" }, { value: "urgencia", label: "Urgência" }, { value: "emergencia", label: "Emergência" },
      ]} />
      <Field label="Conduta" id="conduta" value={g(data, "conduta")} onChange={v => u(data, onChange, "conduta", v)} type="textarea" />
    </div>
  );
}

// ==================== CIRURGIA VASCULAR ====================
function CirurgiaVascularFields({ data, onChange }: { data: SpecialtyData; onChange: (d: SpecialtyData) => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Avaliação Vascular</SectionTitle>
      <Field label="Queixa Vascular" id="queixa" value={g(data, "queixa")} onChange={v => u(data, onChange, "queixa", v)} type="textarea" />
      <div className="grid grid-cols-2 gap-3">
        <CheckField label="Dor em Membros" id="dor_membros" checked={gb(data, "dor_membros")} onChange={v => u(data, onChange, "dor_membros", v)} />
        <CheckField label="Claudicação" id="claudicacao" checked={gb(data, "claudicacao")} onChange={v => u(data, onChange, "claudicacao", v)} />
        <CheckField label="Edema" id="edema" checked={gb(data, "edema")} onChange={v => u(data, onChange, "edema", v)} />
        <CheckField label="Lesões/Úlceras" id="lesoes" checked={gb(data, "lesoes")} onChange={v => u(data, onChange, "lesoes", v)} />
      </div>
      <Field label="Pulsos Periféricos" id="pulsos" value={g(data, "pulsos")} onChange={v => u(data, onChange, "pulsos", v)} type="textarea" />
      <Field label="Exame Vascular" id="exame" value={g(data, "exame")} onChange={v => u(data, onChange, "exame", v)} type="textarea" />
      <SectionTitle>Conclusão</SectionTitle>
      <Field label="Diagnóstico" id="diagnostico" value={g(data, "diagnostico")} onChange={v => u(data, onChange, "diagnostico", v)} type="textarea" />
      <Field label="Conduta" id="conduta" value={g(data, "conduta")} onChange={v => u(data, onChange, "conduta", v)} type="textarea" />
    </div>
  );
}

// ==================== INTENSIVISMO ====================
function IntensivismoFields({ data, onChange }: { data: SpecialtyData; onChange: (d: SpecialtyData) => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Evolução UTI</SectionTitle>
      <Field label="Estado Geral" id="estado_geral" value={g(data, "estado_geral")} onChange={v => u(data, onChange, "estado_geral", v)} type="textarea" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ventilação" id="ventilacao" value={g(data, "ventilacao")} onChange={v => u(data, onChange, "ventilacao", v)} placeholder="VM PCV, FiO2 40%..." />
        <Field label="Glasgow" id="glasgow" value={g(data, "glasgow")} onChange={v => u(data, onChange, "glasgow", v)} />
      </div>
      <Field label="Drogas Vasoativas" id="dva" value={g(data, "dva")} onChange={v => u(data, onChange, "dva", v)} type="textarea" placeholder="Noradrenalina 0,1 mcg/kg/min..." />
      <Field label="Sedação" id="sedacao" value={g(data, "sedacao")} onChange={v => u(data, onChange, "sedacao", v)} type="textarea" />
      <Field label="Balanço Hídrico Resumido" id="balanco" value={g(data, "balanco")} onChange={v => u(data, onChange, "balanco", v)} />
      <Field label="Dispositivos Invasivos" id="dispositivos" value={g(data, "dispositivos")} onChange={v => u(data, onChange, "dispositivos", v)} type="textarea" placeholder="CVC, SVD, TOT..." />
      <Field label="Exames Críticos" id="exames" value={g(data, "exames")} onChange={v => u(data, onChange, "exames", v)} type="textarea" />
      <SectionTitle>Conclusão</SectionTitle>
      <Field label="Diagnóstico" id="diagnostico" value={g(data, "diagnostico")} onChange={v => u(data, onChange, "diagnostico", v)} type="textarea" />
      <Field label="Plano do Dia" id="conduta" value={g(data, "conduta")} onChange={v => u(data, onChange, "conduta", v)} type="textarea" />
    </div>
  );
}

// ==================== HEMODINÂMICA ====================
function HemodinamicaFields({ data, onChange }: { data: SpecialtyData; onChange: (d: SpecialtyData) => void }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Procedimento Hemodinâmico</SectionTitle>
      <Field label="Indicação Clínica" id="indicacao" value={g(data, "indicacao")} onChange={v => u(data, onChange, "indicacao", v)} type="textarea" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tipo de Procedimento" id="tipo_proc" value={g(data, "tipo_proc")} onChange={v => u(data, onChange, "tipo_proc", v)} />
        <Field label="Acesso Vascular" id="acesso" value={g(data, "acesso")} onChange={v => u(data, onChange, "acesso", v)} />
      </div>
      <Field label="Vasos Avaliados" id="vasos" value={g(data, "vasos")} onChange={v => u(data, onChange, "vasos", v)} type="textarea" />
      <Field label="Achados Angiográficos" id="achados" value={g(data, "achados")} onChange={v => u(data, onChange, "achados", v)} type="textarea" />
      <Field label="Materiais / Dispositivos" id="materiais" value={g(data, "materiais")} onChange={v => u(data, onChange, "materiais", v)} type="textarea" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Contraste (mL)" id="contraste" value={g(data, "contraste")} onChange={v => u(data, onChange, "contraste", v)} type="number" />
        <Field label="Complicações" id="complicacoes" value={g(data, "complicacoes")} onChange={v => u(data, onChange, "complicacoes", v)} />
      </div>
      <Field label="Conduta Pós-Procedimento" id="conduta" value={g(data, "conduta")} onChange={v => u(data, onChange, "conduta", v)} type="textarea" />
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
const specialtyComponents: Record<string, React.FC<{ data: SpecialtyData; onChange: (d: SpecialtyData) => void }>> = {
  clinica_medica: ClinicaMedicaFields,
  cardiologia: CardiologiaFields,
  pediatria: PediatriaFields,
  oftalmologia: OftalmologiaFields,
  neurologia: NeurologiaFields,
  ortopedia: OrtopediaFields,
  ginecologia: GinecologiaFields,
  obstetricia: ObstetriciaFields,
  pneumologia: PneumologiaFields,
  endocrinologia: EndocrinologiaFields,
  gastroenterologia: GastroenterologiaFields,
  nefrologia: NefrologiaFields,
  urologia: UrologiaFields,
  dermatologia: DermatologiaFields,
  psiquiatria: PsiquiatriaFields,
  otorrinolaringologia: ORLFields,
  infectologia: InfectologiaFields,
  reumatologia: ReumatologiaFields,
  hematologia: HematologiaFields,
  oncologia: OncologiaFields,
  cirurgia_geral: CirurgiaGeralFields,
  cirurgia_vascular: CirurgiaVascularFields,
  intensivismo: IntensivismoFields,
  hemodinamica: HemodinamicaFields,
};

export const MEDICAL_SPECIALTIES = [
  { value: "clinica_medica", label: "Clínica Médica" },
  { value: "cardiologia", label: "Cardiologia" },
  { value: "pediatria", label: "Pediatria" },
  { value: "oftalmologia", label: "Oftalmologia" },
  { value: "neurologia", label: "Neurologia" },
  { value: "ortopedia", label: "Ortopedia" },
  { value: "ginecologia", label: "Ginecologia" },
  { value: "obstetricia", label: "Obstetrícia" },
  { value: "pneumologia", label: "Pneumologia" },
  { value: "endocrinologia", label: "Endocrinologia" },
  { value: "gastroenterologia", label: "Gastroenterologia" },
  { value: "nefrologia", label: "Nefrologia" },
  { value: "urologia", label: "Urologia" },
  { value: "dermatologia", label: "Dermatologia" },
  { value: "psiquiatria", label: "Psiquiatria" },
  { value: "otorrinolaringologia", label: "Otorrinolaringologia" },
  { value: "infectologia", label: "Infectologia" },
  { value: "reumatologia", label: "Reumatologia" },
  { value: "hematologia", label: "Hematologia" },
  { value: "oncologia", label: "Oncologia" },
  { value: "cirurgia_geral", label: "Cirurgia Geral" },
  { value: "cirurgia_vascular", label: "Cirurgia Vascular" },
  { value: "intensivismo", label: "Intensivismo" },
  { value: "hemodinamica", label: "Hemodinâmica" },
];

export function SpecialtyFields({ specialty, data, onChange }: SpecialtyFieldsProps) {
  const Component = specialtyComponents[specialty];
  if (!Component) {
    return (
      <div className="space-y-3">
        <SectionTitle>Evolução</SectionTitle>
        <Field label="Conteúdo da Evolução" id="conteudo_geral" value={g(data, "conteudo_geral")} onChange={v => u(data, onChange, "conteudo_geral", v)} type="textarea" rows={6} placeholder="Descreva a evolução..." />
      </div>
    );
  }
  return <Component data={data} onChange={onChange} />;
}

export function specialtyDataToContent(specialty: string, data: SpecialtyData): string {
  const lines: string[] = [];
  const specLabel = MEDICAL_SPECIALTIES.find(s => s.value === specialty)?.label || specialty;
  lines.push(`[${specLabel}]`);
  
  Object.entries(data).forEach(([key, value]) => {
    if (value) {
      const label = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
      if (typeof value === "boolean") {
        lines.push(`${label}: Sim`);
      } else {
        lines.push(`${label}: ${value}`);
      }
    }
  });
  
  return lines.join("\n");
}
