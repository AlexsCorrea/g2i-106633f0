import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity, Heart, Thermometer, Droplets, Brain, TrendingUp, TrendingDown,
  AlertTriangle, Baby, Stethoscope, HeartPulse, BarChart3,
} from "lucide-react";
import { format, parseISO, differenceInMonths, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { VitalSign } from "@/hooks/useVitalSigns";
import type { EvolutionNote } from "@/hooks/useEvolutionNotes";
import {
  classifyHeartRate, classifyBloodPressure, classifyTemperature,
  classifyOxygenSaturation, classifyRespiratoryRate, classifyGlucose,
  classifyGlasgow, classifyBraden, classifyMorse,
  classifyPediatricWeight, classifyPediatricHeight, classifyBMI,
  getClassificationBadge, type ClinicalClassification,
} from "@/lib/clinicalRules";
import {
  weightReference, heightReference, bmiReference,
  buildReferenceCurve, interpolateReference, estimatePercentile,
  type GrowthReferencePoint,
} from "@/lib/pediatricGrowthReference";

interface ClinicalAnalyticsProps {
  view: "geral" | "pediatria" | "cardiologia" | "uti" | "tendencias";
  vitalSigns?: VitalSign[];
  evolutionNotes?: EvolutionNote[];
  patientBirthDate?: string;
  patientGender?: string;
  latestGlasgow?: { total_score: number | null } | null;
  latestBraden?: { total_score: number | null } | null;
  latestMorse?: { total_score: number | null } | null;
  medications?: { name: string; status: string }[];
  allergies?: { allergen: string; severity: string }[];
}

const chartColors = {
  hr: "hsl(var(--destructive))",
  systolic: "hsl(var(--primary))",
  diastolic: "hsl(var(--accent-foreground))",
  temp: "hsl(30, 90%, 55%)",
  spo2: "hsl(200, 80%, 50%)",
  rr: "hsl(150, 60%, 45%)",
  glucose: "hsl(270, 60%, 55%)",
  weight: "hsl(var(--primary))",
  height: "hsl(150, 60%, 45%)",
  bmi: "hsl(30, 90%, 55%)",
};

export function ClinicalAnalytics({
  view, vitalSigns = [], evolutionNotes = [], patientBirthDate,
  patientGender, latestGlasgow, latestBraden, latestMorse,
  medications = [], allergies = [],
}: ClinicalAnalyticsProps) {
  // Format vital signs for charts
  const vitalData = useMemo(() =>
    [...vitalSigns].reverse().map((vs) => ({
      date: format(parseISO(vs.recorded_at), "dd/MM HH:mm"),
      fullDate: format(parseISO(vs.recorded_at), "dd/MM/yyyy HH:mm"),
      hr: vs.heart_rate,
      systolic: vs.blood_pressure_systolic,
      diastolic: vs.blood_pressure_diastolic,
      temp: vs.temperature ? Number(vs.temperature) : null,
      spo2: vs.oxygen_saturation,
      rr: vs.respiratory_rate,
      glucose: vs.glucose,
      weight: vs.weight ? Number(vs.weight) : null,
      height: vs.height ? Number(vs.height) : null,
    })),
    [vitalSigns]
  );

  // Pediatric growth data
  const growthData = useMemo(() => {
    if (!patientBirthDate) return [];
    const birthDate = parseISO(patientBirthDate);
    return [...vitalSigns]
      .filter((vs) => vs.weight || vs.height)
      .reverse()
      .map((vs) => {
        const recordDate = parseISO(vs.recorded_at);
        const ageMonths = differenceInMonths(recordDate, birthDate);
        const w = vs.weight ? Number(vs.weight) : null;
        const h = vs.height ? Number(vs.height) : null;
        const bmi = w && h && h > 0 ? Number((w / ((h / 100) ** 2)).toFixed(1)) : null;
        return { ageMonths, ageLabel: `${ageMonths}m`, weight: w, height: h, bmi, date: format(recordDate, "dd/MM/yyyy") };
      });
  }, [vitalSigns, patientBirthDate]);

  // Summary indicators
  const latest = vitalSigns[0];
  const previous = vitalSigns[1];

  const getTrend = (current?: number | null, prev?: number | null) => {
    if (!current || !prev) return null;
    if (current > prev) return "up";
    if (current < prev) return "down";
    return "stable";
  };

  const SummaryCard = ({ label, value, unit, icon: Icon, trend, status, classification }: {
    label: string; value: string; unit: string; icon: React.ElementType;
    trend?: "up" | "down" | "stable" | null; status?: "normal" | "warning" | "critical";
    classification?: ClinicalClassification | null;
  }) => {
    const effectiveStatus = classification?.level || status;
    const badge = classification ? getClassificationBadge(classification) : null;
    return (
      <div className="medical-card p-3">
        <div className="flex items-center justify-between mb-1">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-1">
            {trend === "up" && <TrendingUp className="h-3 w-3 text-destructive" />}
            {trend === "down" && <TrendingDown className="h-3 w-3 text-success" />}
            {effectiveStatus && (
              <div className={`w-2 h-2 rounded-full ${
                effectiveStatus === "normal" ? "bg-success" : effectiveStatus === "warning" ? "bg-warning" : "bg-destructive animate-pulse"
              }`} />
            )}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">{value}<span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span></p>
        {badge && <span className={`inline-block mt-1 ${badge.className}`}>{badge.text}</span>}
      </div>
    );
  };



  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border bg-card p-2 shadow-md text-xs">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
        ))}
      </div>
    );
  };

  // === GERAL VIEW ===
  const patientAgeYears = patientBirthDate ? differenceInYears(new Date(), parseISO(patientBirthDate)) : undefined;

  if (view === "geral") {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />Painel Clínico Geral</h3>
        
        {/* Summary cards with clinical interpretation */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {latest?.heart_rate && <SummaryCard label="FC" value={latest.heart_rate.toString()} unit="bpm" icon={Heart} trend={getTrend(latest.heart_rate, previous?.heart_rate)} classification={classifyHeartRate(latest.heart_rate, patientAgeYears)} />}
          {latest?.blood_pressure_systolic && latest?.blood_pressure_diastolic && <SummaryCard label="PA" value={`${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic}`} unit="mmHg" icon={Activity} classification={classifyBloodPressure(latest.blood_pressure_systolic, latest.blood_pressure_diastolic)} />}
          {latest?.oxygen_saturation && <SummaryCard label="SpO₂" value={latest.oxygen_saturation.toString()} unit="%" icon={Droplets} trend={getTrend(latest.oxygen_saturation, previous?.oxygen_saturation)} classification={classifyOxygenSaturation(latest.oxygen_saturation)} />}
          {latest?.temperature && <SummaryCard label="Temp" value={Number(latest.temperature).toFixed(1)} unit="°C" icon={Thermometer} classification={classifyTemperature(Number(latest.temperature))} />}
          {latest?.respiratory_rate && <SummaryCard label="FR" value={latest.respiratory_rate.toString()} unit="rpm" icon={Activity} classification={classifyRespiratoryRate(latest.respiratory_rate, patientAgeYears)} />}
          {latest?.glucose && <SummaryCard label="Glicemia" value={latest.glucose.toString()} unit="mg/dL" icon={Activity} classification={classifyGlucose(latest.glucose)} />}
        </div>

        {/* Alertas */}
        {allergies.length > 0 && (
          <div className="medical-card p-3 border-destructive/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-xs font-semibold">Alertas Clínicos</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {allergies.map((a, i) => (
                <Badge key={i} variant="outline" className={a.severity === "grave" ? "bg-destructive/10 text-destructive border-destructive/30 text-[10px]" : "text-[10px]"}>
                  {a.allergen} ({a.severity})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Vital signs chart */}
        {vitalData.length > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Tendência de Sinais Vitais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="hr" name="FC" stroke={chartColors.hr} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                    <Line type="monotone" dataKey="systolic" name="PAS" stroke={chartColors.systolic} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                    <Line type="monotone" dataKey="diastolic" name="PAD" stroke={chartColors.diastolic} strokeWidth={1.5} strokeDasharray="4 2" dot={{ r: 2 }} connectNulls />
                    <Line type="monotone" dataKey="spo2" name="SpO₂" stroke={chartColors.spo2} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Last evolution */}
        {evolutionNotes.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Última Evolução</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{evolutionNotes[0].note_type}</Badge>
                  <span className="text-[10px] text-muted-foreground">{format(parseISO(evolutionNotes[0].created_at), "dd/MM/yyyy HH:mm")}</span>
                  <span className="text-[10px] text-muted-foreground">• {evolutionNotes[0].profiles?.full_name}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">{evolutionNotes[0].content}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scales summary with clinical interpretation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {latestGlasgow?.total_score != null && (() => {
            const cls = classifyGlasgow(latestGlasgow.total_score);
            const badge = getClassificationBadge(cls);
            return (
              <div className="medical-card p-3">
                <p className="text-[10px] text-muted-foreground">Glasgow</p>
                <p className={`text-xl font-bold ${cls.color}`}>{latestGlasgow.total_score}<span className="text-sm font-normal text-muted-foreground">/15</span></p>
                <span className={`inline-block mt-1 ${badge.className}`}>{badge.text}</span>
              </div>
            );
          })()}
          {latestBraden?.total_score != null && (() => {
            const cls = classifyBraden(latestBraden.total_score);
            const badge = getClassificationBadge(cls);
            return (
              <div className="medical-card p-3">
                <p className="text-[10px] text-muted-foreground">Braden</p>
                <p className={`text-xl font-bold ${cls.color}`}>{latestBraden.total_score}<span className="text-sm font-normal text-muted-foreground">/23</span></p>
                <span className={`inline-block mt-1 ${badge.className}`}>{badge.text}</span>
              </div>
            );
          })()}
          {latestMorse?.total_score != null && (() => {
            const cls = classifyMorse(latestMorse.total_score);
            const badge = getClassificationBadge(cls);
            return (
              <div className="medical-card p-3">
                <p className="text-[10px] text-muted-foreground">Morse</p>
                <p className={`text-xl font-bold ${cls.color}`}>{latestMorse.total_score}</p>
                <span className={`inline-block mt-1 ${badge.className}`}>{badge.text}</span>
              </div>
            );
          })()}
        </div>
      </div>
    );
  }

  // === PEDIATRIA VIEW ===
  if (view === "pediatria") {
    const gender = (patientGender === "M" || patientGender === "F") ? patientGender : "M";
    const genderKey = gender === "M" ? "male" : "female";

    // Build reference curves covering patient data range
    const ageRange = growthData.length > 0
      ? { min: Math.max(0, Math.min(...growthData.map(d => d.ageMonths)) - 3), max: Math.max(...growthData.map(d => d.ageMonths)) + 6 }
      : { min: 0, max: 60 };

    const weightRefCurve = useMemo(() => buildReferenceCurve(weightReference[genderKey], ageRange.min, ageRange.max), [genderKey, ageRange.min, ageRange.max]);
    const heightRefCurve = useMemo(() => buildReferenceCurve(heightReference[genderKey], ageRange.min, ageRange.max), [genderKey, ageRange.min, ageRange.max]);
    const bmiRefCurve = useMemo(() => buildReferenceCurve(bmiReference[genderKey], ageRange.min, ageRange.max), [genderKey, ageRange.min, ageRange.max]);

    // Merge patient data with reference curve for unified chart
    const mergeWithRef = (patientData: typeof growthData, refCurve: GrowthReferencePoint[], valueKey: "weight" | "height" | "bmi") => {
      const refMap = new Map(refCurve.map(r => [r.ageMonths, r]));
      const patMap = new Map(patientData.filter(d => d[valueKey] != null).map(d => [d.ageMonths, d[valueKey] as number]));
      const allAges = [...new Set([...refMap.keys(), ...patMap.keys()])].sort((a, b) => a - b);
      return allAges.map(age => {
        const ref = refMap.get(age) || interpolateReference(age, refCurve);
        const patValue = patMap.get(age) ?? null;
        return {
          ageMonths: age,
          ageLabel: `${age}m`,
          value: patValue,
          p3: ref?.p3 ?? null,
          p15: ref?.p15 ?? null,
          p50: ref?.p50 ?? null,
          p85: ref?.p85 ?? null,
          p97: ref?.p97 ?? null,
        };
      });
    };

    const weightChartData = mergeWithRef(growthData, weightRefCurve, "weight");
    const heightChartData = mergeWithRef(growthData, heightRefCurve, "height");
    const bmiChartData = mergeWithRef(growthData, bmiRefCurve, "bmi");

    // Latest percentile estimation
    const lastGrowth = growthData.length > 0 ? growthData[growthData.length - 1] : null;
    const weightPercentile = lastGrowth?.weight ? (() => {
      const ref = interpolateReference(lastGrowth.ageMonths, weightReference[genderKey]);
      return ref ? estimatePercentile(lastGrowth.weight, ref) : null;
    })() : null;
    const heightPercentile = lastGrowth?.height ? (() => {
      const ref = interpolateReference(lastGrowth.ageMonths, heightReference[genderKey]);
      return ref ? estimatePercentile(lastGrowth.height, ref) : null;
    })() : null;
    const bmiPercentile = lastGrowth?.bmi ? (() => {
      const ref = interpolateReference(lastGrowth.ageMonths, bmiReference[genderKey]);
      return ref ? estimatePercentile(lastGrowth.bmi, ref) : null;
    })() : null;

    const zoneColors: Record<string, string> = {
      "critical-low": "text-destructive",
      "low": "text-warning",
      "normal": "text-success",
      "high": "text-warning",
      "critical-high": "text-destructive",
    };
    const zoneBg: Record<string, string> = {
      "critical-low": "bg-destructive/10",
      "low": "bg-warning/10",
      "normal": "bg-success/10",
      "high": "bg-warning/10",
      "critical-high": "bg-destructive/10",
    };
    const zoneLabels: Record<string, string> = {
      "critical-low": "Muito abaixo (< P3)",
      "low": "Abaixo (P3-P15)",
      "normal": "Adequado (P15-P85)",
      "high": "Acima (P85-P97)",
      "critical-high": "Muito acima (> P97)",
    };

    const GrowthChart = ({ data, yLabel, title }: { data: typeof weightChartData; yLabel: string; title: string }) => (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{title}</CardTitle>
          <p className="text-[10px] text-muted-foreground">Referência OMS/CDC — Sexo {gender === "M" ? "Masculino" : "Feminino"}</p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="ageLabel" tick={{ fontSize: 10 }} label={{ value: "Idade (meses)", position: "insideBottom", offset: -5, fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} label={{ value: yLabel, angle: -90, position: "insideLeft", fontSize: 10 }} />
                <Tooltip content={({ active, payload, label }: any) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border bg-card p-2 shadow-md text-xs">
                      <p className="font-medium mb-1">{label}</p>
                      {payload.map((p: any, i: number) => (
                        <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value != null ? p.value : "—"}</strong></p>
                      ))}
                    </div>
                  );
                }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {/* P3-P97 band (outer) */}
                <Area type="monotone" dataKey="p97" name="P97" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.05} connectNulls dot={false} activeDot={false} />
                <Area type="monotone" dataKey="p3" name="P3" stroke="none" fill="hsl(var(--background))" fillOpacity={1} connectNulls dot={false} activeDot={false} />
                {/* P15-P85 band (normal zone) */}
                <Area type="monotone" dataKey="p85" name="P85" stroke="hsl(var(--primary))" strokeWidth={0.5} strokeDasharray="4 4" fill="hsl(var(--primary))" fillOpacity={0.08} connectNulls dot={false} activeDot={false} />
                <Area type="monotone" dataKey="p15" name="P15" stroke="hsl(var(--primary))" strokeWidth={0.5} strokeDasharray="4 4" fill="hsl(var(--background))" fillOpacity={1} connectNulls dot={false} activeDot={false} />
                {/* Median line */}
                <Line type="monotone" dataKey="p50" name="Mediana (P50)" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="6 3" dot={false} connectNulls />
                {/* Patient data */}
                <Line type="monotone" dataKey="value" name="Paciente" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 5, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }} connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Legend explanation */}
          <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary inline-block" /> Paciente</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-muted-foreground inline-block" style={{ borderTop: "1px dashed" }} /> Mediana (P50)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2 bg-primary/10 inline-block rounded-sm" /> Faixa P15-P85</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2 bg-primary/5 inline-block rounded-sm" /> Faixa P3-P97</span>
          </div>
        </CardContent>
      </Card>
    );

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Baby className="h-4 w-4 text-primary" />Análise Pediátrica — Curvas de Crescimento</h3>

        {/* Percentile indicators */}
        {lastGrowth && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {lastGrowth.weight && weightPercentile && (
              <div className="medical-card p-3">
                <p className="text-[10px] text-muted-foreground">Peso — {lastGrowth.ageLabel}</p>
                <p className="text-xl font-bold">{lastGrowth.weight}<span className="text-sm font-normal text-muted-foreground ml-1">kg</span></p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${zoneBg[weightPercentile.zone]} ${zoneColors[weightPercentile.zone]}`}>
                    {weightPercentile.percentile}
                  </span>
                  <span className={`text-[10px] ${zoneColors[weightPercentile.zone]}`}>{zoneLabels[weightPercentile.zone]}</span>
                </div>
              </div>
            )}
            {lastGrowth.height && heightPercentile && (
              <div className="medical-card p-3">
                <p className="text-[10px] text-muted-foreground">Estatura — {lastGrowth.ageLabel}</p>
                <p className="text-xl font-bold">{lastGrowth.height}<span className="text-sm font-normal text-muted-foreground ml-1">cm</span></p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${zoneBg[heightPercentile.zone]} ${zoneColors[heightPercentile.zone]}`}>
                    {heightPercentile.percentile}
                  </span>
                  <span className={`text-[10px] ${zoneColors[heightPercentile.zone]}`}>{zoneLabels[heightPercentile.zone]}</span>
                </div>
              </div>
            )}
            {lastGrowth.bmi && bmiPercentile && (
              <div className="medical-card p-3">
                <p className="text-[10px] text-muted-foreground">IMC — {lastGrowth.ageLabel}</p>
                <p className="text-xl font-bold">{lastGrowth.bmi}<span className="text-sm font-normal text-muted-foreground ml-1">kg/m²</span></p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${zoneBg[bmiPercentile.zone]} ${zoneColors[bmiPercentile.zone]}`}>
                    {bmiPercentile.percentile}
                  </span>
                  <span className={`text-[10px] ${zoneColors[bmiPercentile.zone]}`}>{zoneLabels[bmiPercentile.zone]}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {growthData.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Baby className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Sem dados de crescimento registrados.</p>
              <p className="text-xs text-muted-foreground mt-1">Registre sinais vitais com peso e altura para visualizar as curvas.</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="peso">
            <TabsList className="h-8">
              <TabsTrigger value="peso" className="text-xs h-6">Peso × Idade</TabsTrigger>
              <TabsTrigger value="altura" className="text-xs h-6">Altura × Idade</TabsTrigger>
              <TabsTrigger value="imc" className="text-xs h-6">IMC × Idade</TabsTrigger>
            </TabsList>
            <TabsContent value="peso">
              <GrowthChart data={weightChartData} yLabel="Peso (kg)" title="Curva de Peso × Idade" />
            </TabsContent>
            <TabsContent value="altura">
              <GrowthChart data={heightChartData} yLabel="Estatura (cm)" title="Curva de Estatura × Idade" />
            </TabsContent>
            <TabsContent value="imc">
              <GrowthChart data={bmiChartData} yLabel="IMC (kg/m²)" title="IMC × Idade" />
            </TabsContent>
          </Tabs>
        )}

        {/* Alerts */}
        {lastGrowth && (weightPercentile?.zone === "critical-low" || weightPercentile?.zone === "critical-high" || heightPercentile?.zone === "critical-low") && (
          <div className="medical-card p-3 border-destructive/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-xs font-semibold text-destructive">Alertas de Crescimento</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              {weightPercentile?.zone === "critical-low" && <p>⚠️ Peso abaixo do percentil 3 — investigar desnutrição ou patologia subjacente.</p>}
              {weightPercentile?.zone === "critical-high" && <p>⚠️ Peso acima do percentil 97 — avaliar obesidade infantil.</p>}
              {heightPercentile?.zone === "critical-low" && <p>⚠️ Estatura abaixo do percentil 3 — investigar baixa estatura patológica.</p>}
            </div>
          </div>
        )}
      </div>
    );
  }

  // === CARDIOLOGIA VIEW ===
  if (view === "cardiologia") {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2"><HeartPulse className="h-4 w-4 text-primary" />Análise Cardiológica</h3>

        {/* PA + FC Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {latest?.heart_rate && <SummaryCard label="FC Atual" value={latest.heart_rate.toString()} unit="bpm" icon={Heart} trend={getTrend(latest.heart_rate, previous?.heart_rate)} classification={classifyHeartRate(latest.heart_rate, patientAgeYears)} />}
          {latest?.blood_pressure_systolic && latest?.blood_pressure_diastolic && <SummaryCard label="PA" value={`${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic}`} unit="mmHg" icon={Activity} classification={classifyBloodPressure(latest.blood_pressure_systolic, latest.blood_pressure_diastolic)} />}
          {latest?.oxygen_saturation && <SummaryCard label="SpO₂" value={latest.oxygen_saturation.toString()} unit="%" icon={Droplets} classification={classifyOxygenSaturation(latest.oxygen_saturation)} />}
        </div>

        {/* PA trend */}
        {vitalData.length > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Tendência Pressão Arterial</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={vitalData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[40, 200]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="systolic" name="PAS" stroke={chartColors.systolic} fill={chartColors.systolic} fillOpacity={0.1} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                    <Area type="monotone" dataKey="diastolic" name="PAD" stroke={chartColors.diastolic} fill={chartColors.diastolic} fillOpacity={0.05} strokeWidth={1.5} dot={{ r: 2 }} connectNulls />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* HR trend */}
        {vitalData.length > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Tendência Frequência Cardíaca</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[40, 150]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="hr" name="FC (bpm)" stroke={chartColors.hr} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History table */}
        {vitalSigns.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Histórico de Registros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-1.5 pr-3">Data/Hora</th>
                      <th className="text-center py-1.5 px-2">FC</th>
                      <th className="text-center py-1.5 px-2">PAS</th>
                      <th className="text-center py-1.5 px-2">PAD</th>
                      <th className="text-center py-1.5 px-2">SpO₂</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vitalSigns.slice(0, 15).map((vs) => (
                      <tr key={vs.id} className="border-b border-border/50">
                        <td className="py-1.5 pr-3 text-muted-foreground">{format(parseISO(vs.recorded_at), "dd/MM HH:mm")}</td>
                        <td className={`text-center py-1.5 px-2 font-medium ${vs.heart_rate && (vs.heart_rate < 60 || vs.heart_rate > 100) ? "text-destructive" : ""}`}>{vs.heart_rate || "-"}</td>
                        <td className={`text-center py-1.5 px-2 font-medium ${vs.blood_pressure_systolic && vs.blood_pressure_systolic > 140 ? "text-destructive" : ""}`}>{vs.blood_pressure_systolic || "-"}</td>
                        <td className={`text-center py-1.5 px-2 font-medium ${vs.blood_pressure_diastolic && vs.blood_pressure_diastolic > 90 ? "text-destructive" : ""}`}>{vs.blood_pressure_diastolic || "-"}</td>
                        <td className={`text-center py-1.5 px-2 font-medium ${vs.oxygen_saturation && vs.oxygen_saturation < 95 ? "text-destructive" : ""}`}>{vs.oxygen_saturation ? `${vs.oxygen_saturation}%` : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // === UTI VIEW ===
  if (view === "uti") {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2"><HeartPulse className="h-4 w-4 text-primary" />Indicadores UTI / Paciente Crítico</h3>

        {/* Critical summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {latest?.heart_rate && <SummaryCard label="FC" value={latest.heart_rate.toString()} unit="bpm" icon={Heart} trend={getTrend(latest.heart_rate, previous?.heart_rate)} classification={classifyHeartRate(latest.heart_rate, patientAgeYears)} />}
          {latest?.blood_pressure_systolic && latest?.blood_pressure_diastolic && <SummaryCard label="PA" value={`${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic}`} unit="mmHg" icon={Activity} classification={classifyBloodPressure(latest.blood_pressure_systolic, latest.blood_pressure_diastolic)} />}
          {latest?.oxygen_saturation && <SummaryCard label="SpO₂" value={latest.oxygen_saturation.toString()} unit="%" icon={Droplets} classification={classifyOxygenSaturation(latest.oxygen_saturation)} />}
          {latest?.temperature && <SummaryCard label="Temp" value={Number(latest.temperature).toFixed(1)} unit="°C" icon={Thermometer} classification={classifyTemperature(Number(latest.temperature))} />}
          {latest?.respiratory_rate && <SummaryCard label="FR" value={latest.respiratory_rate.toString()} unit="rpm" icon={Activity} classification={classifyRespiratoryRate(latest.respiratory_rate, patientAgeYears)} />}
          {latest?.glucose && <SummaryCard label="Glicemia" value={latest.glucose.toString()} unit="mg/dL" icon={Activity} classification={classifyGlucose(latest.glucose)} />}
        </div>

        {/* Scales for critical with interpretation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(() => {
            const gCls = latestGlasgow?.total_score != null ? classifyGlasgow(latestGlasgow.total_score) : null;
            const bCls = latestBraden?.total_score != null ? classifyBraden(latestBraden.total_score) : null;
            const mCls = latestMorse?.total_score != null ? classifyMorse(latestMorse.total_score) : null;
            return (<>
              <div className="medical-card p-3">
                <p className="text-[10px] text-muted-foreground">Glasgow</p>
                <p className={`text-2xl font-bold ${gCls?.color || ""}`}>{latestGlasgow?.total_score ?? "N/A"}<span className="text-sm font-normal text-muted-foreground">/15</span></p>
                {gCls && <span className={`inline-block mt-1 ${getClassificationBadge(gCls).className}`}>{gCls.label}</span>}
              </div>
              <div className="medical-card p-3">
                <p className="text-[10px] text-muted-foreground">Braden (LPP)</p>
                <p className={`text-2xl font-bold ${bCls?.color || ""}`}>{latestBraden?.total_score ?? "N/A"}<span className="text-sm font-normal text-muted-foreground">/23</span></p>
                {bCls && <span className={`inline-block mt-1 ${getClassificationBadge(bCls).className}`}>{bCls.label}</span>}
              </div>
              <div className="medical-card p-3">
                <p className="text-[10px] text-muted-foreground">Morse (Queda)</p>
                <p className={`text-2xl font-bold ${mCls?.color || ""}`}>{latestMorse?.total_score ?? "N/A"}</p>
                {mCls && <span className={`inline-block mt-1 ${getClassificationBadge(mCls).className}`}>{mCls.label}</span>}
              </div>
            </>);
          })()}
        </div>

        {/* Vital trends for ICU */}
        {vitalData.length > 1 && (
          <Tabs defaultValue="hemodinamico">
            <TabsList className="h-8">
              <TabsTrigger value="hemodinamico" className="text-xs h-6">Hemodinâmico</TabsTrigger>
              <TabsTrigger value="respiratorio" className="text-xs h-6">Respiratório</TabsTrigger>
              <TabsTrigger value="metabolico" className="text-xs h-6">Metabólico</TabsTrigger>
            </TabsList>

            <TabsContent value="hemodinamico">
              <Card>
                <CardContent className="pt-4">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={vitalData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="hr" name="FC" stroke={chartColors.hr} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                        <Line type="monotone" dataKey="systolic" name="PAS" stroke={chartColors.systolic} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                        <Line type="monotone" dataKey="diastolic" name="PAD" stroke={chartColors.diastolic} strokeWidth={1.5} strokeDasharray="4 2" connectNulls />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="respiratorio">
              <Card>
                <CardContent className="pt-4">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={vitalData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="spo2" name="SpO₂ (%)" stroke={chartColors.spo2} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                        <Line type="monotone" dataKey="rr" name="FR (rpm)" stroke={chartColors.rr} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metabolico">
              <Card>
                <CardContent className="pt-4">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={vitalData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="temp" name="Temp (°C)" stroke={chartColors.temp} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                        <Line type="monotone" dataKey="glucose" name="Glicemia" stroke={chartColors.glucose} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Active medications */}
        {medications.filter(m => m.status === "ativo").length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Medicações Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {medications.filter(m => m.status === "ativo").map((m, i) => (
                  <Badge key={i} variant="outline" className="text-[10px]">{m.name}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // === TENDENCIAS VIEW (all vital signs individual charts) ===
  if (view === "tendencias") {
    const charts = [
      { key: "hr", label: "Frequência Cardíaca", unit: "bpm", color: chartColors.hr },
      { key: "systolic", label: "Pressão Sistólica", unit: "mmHg", color: chartColors.systolic },
      { key: "diastolic", label: "Pressão Diastólica", unit: "mmHg", color: chartColors.diastolic },
      { key: "spo2", label: "Saturação O₂", unit: "%", color: chartColors.spo2 },
      { key: "temp", label: "Temperatura", unit: "°C", color: chartColors.temp },
      { key: "rr", label: "Freq. Respiratória", unit: "rpm", color: chartColors.rr },
      { key: "glucose", label: "Glicemia", unit: "mg/dL", color: chartColors.glucose },
    ];

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Tendências Individuais</h3>
        
        {vitalData.length < 2 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Registre ao menos 2 sinais vitais para visualizar tendências.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {charts.map((c) => {
              const hasData = vitalData.some((d) => (d as any)[c.key] != null);
              if (!hasData) return null;
              return (
                <Card key={c.key}>
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs">{c.label} ({c.unit})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={vitalData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                          <YAxis tick={{ fontSize: 9 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line type="monotone" dataKey={c.key} name={c.label} stroke={c.color} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return null;
}
