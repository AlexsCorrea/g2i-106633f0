import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Legend, ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity, Heart, Thermometer, Droplets, Brain, TrendingUp, TrendingDown,
  AlertTriangle, Baby, Stethoscope, HeartPulse, BarChart3, Ruler,
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
  weightReference, heightReference, bmiReference, headCircumferenceReference,
  buildReferenceCurve, interpolateReference, estimatePercentile,
  calculateZScore, zScoreToPercentile, detectGrowthAlerts,
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
  hc: "hsl(280, 60%, 55%)",
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

  // Gender & reference curves
  const gender = (patientGender === "M" || patientGender === "F") ? patientGender : "M";
  const genderKey = gender === "M" ? "male" : "female";
  const ageRange = useMemo(() => {
    if (growthData.length === 0) return { min: 0, max: 60 };
    return {
      min: Math.max(0, Math.min(...growthData.map(d => d.ageMonths)) - 3),
      max: Math.max(...growthData.map(d => d.ageMonths)) + 6,
    };
  }, [growthData]);

  const weightRefCurve = useMemo(() => buildReferenceCurve(weightReference[genderKey], ageRange.min, ageRange.max, 1), [genderKey, ageRange]);
  const heightRefCurve = useMemo(() => buildReferenceCurve(heightReference[genderKey], ageRange.min, ageRange.max, 1), [genderKey, ageRange]);
  const bmiRefCurve = useMemo(() => buildReferenceCurve(bmiReference[genderKey], Math.max(24, ageRange.min), ageRange.max, 1), [genderKey, ageRange]);
  const hcRefCurve = useMemo(() => buildReferenceCurve(headCircumferenceReference[genderKey], ageRange.min, Math.min(36, ageRange.max), 1), [genderKey, ageRange]);

  // Pre-compute pediatric data at top level (hooks can't be inside conditionals)
  const lastGrowth = growthData.length > 0 ? growthData[growthData.length - 1] : null;
  const calcPercentileData = (value: number | null | undefined, ageMonths: number, refSet: GrowthReferencePoint[]) => {
    if (!value) return null;
    const ref = interpolateReference(ageMonths, refSet);
    if (!ref) return null;
    return estimatePercentile(value, ref);
  };
  const weightP = lastGrowth ? calcPercentileData(lastGrowth.weight, lastGrowth.ageMonths, weightReference[genderKey]) : null;
  const heightP = lastGrowth ? calcPercentileData(lastGrowth.height, lastGrowth.ageMonths, heightReference[genderKey]) : null;
  const bmiP = lastGrowth?.bmi ? calcPercentileData(lastGrowth.bmi, lastGrowth.ageMonths, bmiReference[genderKey]) : null;

  const growthAlerts = useMemo(() =>
    detectGrowthAlerts(
      growthData.map(d => ({ ageMonths: d.ageMonths, weight: d.weight, height: d.height })),
      { weight: weightReference[genderKey], height: heightReference[genderKey] } as any,
      genderKey
    ),
    [growthData, genderKey]
  );

  const clinicalAnalysis = useMemo(() => {
    if (!lastGrowth) return null;
    const lines: string[] = [];
    if (weightP) {
      const zStr = weightP.zScore != null ? ` (Z-score: ${weightP.zScore.toFixed(2)}, P${weightP.exactPercentile?.toFixed(0)})` : "";
      if (weightP.zone === "normal") lines.push(`✅ Peso adequado para idade${zStr}`);
      else if (weightP.zone === "low") lines.push(`⚠️ Peso na faixa P3-P15 — acompanhar evolução ponderal${zStr}`);
      else if (weightP.zone === "critical-low") lines.push(`🔴 Peso abaixo do P3 — investigar desnutrição${zStr}`);
      else if (weightP.zone === "high") lines.push(`⚠️ Peso acima do P85 — atenção para sobrepeso${zStr}`);
      else if (weightP.zone === "critical-high") lines.push(`🔴 Peso acima do P97 — risco de obesidade infantil${zStr}`);
    }
    if (heightP) {
      const zStr = heightP.zScore != null ? ` (Z-score: ${heightP.zScore.toFixed(2)}, P${heightP.exactPercentile?.toFixed(0)})` : "";
      if (heightP.zone === "normal") lines.push(`✅ Estatura adequada para idade${zStr}`);
      else if (heightP.zone === "critical-low") lines.push(`🔴 Baixa estatura — investigar causas${zStr}`);
      else if (heightP.zone === "low") lines.push(`⚠️ Estatura abaixo do esperado${zStr}`);
    }
    if (bmiP) {
      const zStr = bmiP.zScore != null ? ` (Z-score: ${bmiP.zScore.toFixed(2)}, P${bmiP.exactPercentile?.toFixed(0)})` : "";
      if (bmiP.zone === "normal") lines.push(`✅ IMC dentro da normalidade${zStr}`);
      else if (bmiP.zone === "critical-high") lines.push(`🔴 IMC compatível com obesidade${zStr}`);
      else if (bmiP.zone === "high") lines.push(`⚠️ IMC indicando sobrepeso${zStr}`);
      else if (bmiP.zone === "critical-low") lines.push(`🔴 IMC indicando magreza acentuada${zStr}`);
    }
    if (growthData.length >= 3) {
      const recent = growthData.slice(-3);
      const allGrowing = recent.every((d, i) => i === 0 || (d.weight && recent[i-1].weight && d.weight >= recent[i-1].weight!));
      if (allGrowing) lines.push("📈 Tendência de ganho ponderal contínuo nos últimos registros");
    }
    return lines.length > 0 ? lines : null;
  }, [lastGrowth, weightP, heightP, bmiP, growthData]);

  // Summary indicators
  const latest = vitalSigns[0];
  const previous = vitalSigns[1];
  const patientAgeYears = patientBirthDate ? differenceInYears(new Date(), parseISO(patientBirthDate)) : undefined;

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
        {payload.filter((p: any) => p.value != null).map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong></p>
        ))}
      </div>
    );
  };

  // ============= GERAL VIEW =============
  if (view === "geral") {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />Painel Clínico Geral</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {latest?.heart_rate && <SummaryCard label="FC" value={latest.heart_rate.toString()} unit="bpm" icon={Heart} trend={getTrend(latest.heart_rate, previous?.heart_rate)} classification={classifyHeartRate(latest.heart_rate, patientAgeYears)} />}
          {latest?.blood_pressure_systolic && latest?.blood_pressure_diastolic && <SummaryCard label="PA" value={`${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic}`} unit="mmHg" icon={Activity} classification={classifyBloodPressure(latest.blood_pressure_systolic, latest.blood_pressure_diastolic)} />}
          {latest?.oxygen_saturation && <SummaryCard label="SpO₂" value={latest.oxygen_saturation.toString()} unit="%" icon={Droplets} trend={getTrend(latest.oxygen_saturation, previous?.oxygen_saturation)} classification={classifyOxygenSaturation(latest.oxygen_saturation)} />}
          {latest?.temperature && <SummaryCard label="Temp" value={Number(latest.temperature).toFixed(1)} unit="°C" icon={Thermometer} classification={classifyTemperature(Number(latest.temperature))} />}
          {latest?.respiratory_rate && <SummaryCard label="FR" value={latest.respiratory_rate.toString()} unit="rpm" icon={Activity} classification={classifyRespiratoryRate(latest.respiratory_rate, patientAgeYears)} />}
          {latest?.glucose && <SummaryCard label="Glicemia" value={latest.glucose.toString()} unit="mg/dL" icon={Activity} classification={classifyGlucose(latest.glucose)} />}
        </div>

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

  // ============= PEDIATRIA VIEW =============
  if (view === "pediatria") {
    // Merge patient data with reference curves
    const mergeWithRef = (patientData: typeof growthData, refCurve: GrowthReferencePoint[], valueKey: "weight" | "height" | "bmi") => {
      const refMap = new Map(refCurve.map(r => [r.ageMonths, r]));
      const patMap = new Map(patientData.filter(d => d[valueKey] != null).map(d => [d.ageMonths, d[valueKey] as number]));
      const allAges = [...new Set([...refMap.keys(), ...patMap.keys()])].sort((a, b) => a - b);
      return allAges.map(age => {
        const ref = refMap.get(age) || interpolateReference(age, refCurve);
        const patValue = patMap.get(age) ?? null;
        return {
          ageMonths: age,
          ageLabel: age % 6 === 0 ? `${age}m` : "",
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
    
    // Head circumference data (only for 0-36 months)
    const showHC = ageRange.max <= 42;
    const hcChartData = showHC ? (() => {
      const refMap = new Map(hcRefCurve.map(r => [r.ageMonths, r]));
      const allAges = [...new Set([...refMap.keys()])].sort((a, b) => a - b);
      return allAges.map(age => {
        const ref = refMap.get(age) || interpolateReference(age, hcRefCurve);
        return {
          ageMonths: age,
          ageLabel: age % 3 === 0 ? `${age}m` : "",
          value: null as number | null,
          p3: ref?.p3 ?? null, p15: ref?.p15 ?? null, p50: ref?.p50 ?? null, p85: ref?.p85 ?? null, p97: ref?.p97 ?? null,
        };
      });
    })() : [];

    // (percentile data and alerts already computed at top level)

    const zoneColors: Record<string, string> = {
      "critical-low": "text-destructive", "low": "text-warning", "normal": "text-success", "high": "text-warning", "critical-high": "text-destructive",
    };
    const zoneBg: Record<string, string> = {
      "critical-low": "bg-destructive/10", "low": "bg-warning/10", "normal": "bg-success/10", "high": "bg-warning/10", "critical-high": "bg-destructive/10",
    };
    const zoneLabels: Record<string, string> = {
      "critical-low": "Muito abaixo (< P3)", "low": "Abaixo (P3-P15)", "normal": "Adequado (P15-P85)", "high": "Acima (P85-P97)", "critical-high": "Muito acima (> P97)",
    };

    const PercentileCard = ({ label, value, unit, percentileData, ageLabel }: {
      label: string; value: number; unit: string; percentileData: ReturnType<typeof estimatePercentile> | null; ageLabel: string;
    }) => {
      if (!percentileData) return null;
      return (
        <div className="medical-card p-3">
          <p className="text-[10px] text-muted-foreground">{label} — {ageLabel}</p>
          <p className="text-xl font-bold">{value}<span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span></p>
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${zoneBg[percentileData.zone]} ${zoneColors[percentileData.zone]}`}>
                {percentileData.percentile}
              </span>
              <span className={`text-[10px] ${zoneColors[percentileData.zone]}`}>{zoneLabels[percentileData.zone]}</span>
            </div>
            {percentileData.zScore != null && (
              <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                <span className="font-mono bg-muted px-1 rounded">Z: {percentileData.zScore.toFixed(2)}</span>
                <span>Percentil: {percentileData.exactPercentile?.toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      );
    };

    const GrowthChart = ({ data, yLabel, title }: { data: any[]; yLabel: string; title: string }) => (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{title}</CardTitle>
          <p className="text-[10px] text-muted-foreground">Referência OMS/CDC — Sexo {gender === "M" ? "Masculino" : "Feminino"}</p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 10, left: 5, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="ageLabel" tick={{ fontSize: 9 }} interval="preserveStartEnd" label={{ value: "Idade (meses)", position: "insideBottom", offset: -10, fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 9 }} label={{ value: yLabel, angle: -90, position: "insideLeft", offset: 10, fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip content={({ active, payload, label }: any) => {
                  if (!active || !payload?.length) return null;
                  const age = payload[0]?.payload?.ageMonths;
                  return (
                    <div className="rounded-lg border bg-card p-2.5 shadow-md text-xs max-w-[200px]">
                      <p className="font-medium mb-1.5 text-foreground">Idade: {age}m</p>
                      {payload.filter((p: any) => p.value != null && !['p3','p15','p85','p97'].includes(p.dataKey)).map((p: any, i: number) => (
                        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong></p>
                      ))}
                      {payload.find((p: any) => p.dataKey === 'p50')?.value != null && (
                        <p className="text-muted-foreground mt-1 border-t border-border pt-1">Mediana (P50): {payload.find((p: any) => p.dataKey === 'p50').value.toFixed(1)}</p>
                      )}
                    </div>
                  );
                }} />
                {/* P3-P97 outer band */}
                <Area type="monotone" dataKey="p97" stroke="hsl(var(--primary)/0.3)" strokeWidth={0.5} fill="hsl(var(--primary))" fillOpacity={0.04} connectNulls dot={false} activeDot={false} name="P97" legendType="none" />
                <Area type="monotone" dataKey="p3" stroke="hsl(var(--primary)/0.3)" strokeWidth={0.5} fill="hsl(var(--background))" fillOpacity={1} connectNulls dot={false} activeDot={false} name="P3" legendType="none" />
                {/* P15-P85 normal band */}
                <Area type="monotone" dataKey="p85" stroke="hsl(var(--primary)/0.4)" strokeWidth={0.5} strokeDasharray="4 4" fill="hsl(var(--primary))" fillOpacity={0.08} connectNulls dot={false} activeDot={false} name="P85" legendType="none" />
                <Area type="monotone" dataKey="p15" stroke="hsl(var(--primary)/0.4)" strokeWidth={0.5} strokeDasharray="4 4" fill="hsl(var(--background))" fillOpacity={1} connectNulls dot={false} activeDot={false} name="P15" legendType="none" />
                {/* Median */}
                <Line type="monotone" dataKey="p50" name="Mediana (P50)" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="6 3" dot={false} connectNulls legendType="line" />
                {/* Patient line */}
                <Line type="monotone" dataKey="value" name="Paciente" stroke="hsl(var(--primary))" strokeWidth={3} dot={(props: any) => {
                  if (props.payload?.value == null) return <></>;
                  return (
                    <circle cx={props.cx} cy={props.cy} r={6} fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth={2.5} />
                  );
                }} connectNulls activeDot={{ r: 8, strokeWidth: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-muted-foreground border-t border-border pt-2">
            <span className="flex items-center gap-1.5"><span className="w-4 h-1 bg-primary rounded-full inline-block" /> Paciente</span>
            <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-muted-foreground inline-block" style={{ borderTop: "1.5px dashed" }} /> Mediana (P50)</span>
            <span className="flex items-center gap-1.5"><span className="w-4 h-3 bg-primary/10 inline-block rounded-sm border border-primary/20" /> Faixa Normal (P15-P85)</span>
            <span className="flex items-center gap-1.5"><span className="w-4 h-3 bg-primary/5 inline-block rounded-sm border border-primary/10" /> Limites (P3-P97)</span>
          </div>
        </CardContent>
      </Card>
    );

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Baby className="h-4 w-4 text-primary" />Análise Pediátrica — Curvas de Crescimento OMS/CDC</h3>

        {/* Percentile + Z-score indicators */}
        {lastGrowth && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {lastGrowth.weight && <PercentileCard label="Peso" value={lastGrowth.weight} unit="kg" percentileData={weightP} ageLabel={lastGrowth.ageLabel} />}
            {lastGrowth.height && <PercentileCard label="Estatura" value={lastGrowth.height} unit="cm" percentileData={heightP} ageLabel={lastGrowth.ageLabel} />}
            {lastGrowth.bmi && <PercentileCard label="IMC" value={lastGrowth.bmi} unit="kg/m²" percentileData={bmiP} ageLabel={lastGrowth.ageLabel} />}
          </div>
        )}

        {/* Clinical AI Analysis */}
        {clinicalAnalysis && (
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Análise Clínica Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {clinicalAnalysis.map((line, i) => (
                  <p key={i} className="text-xs text-muted-foreground">{line}</p>
                ))}
              </div>
            </CardContent>
          </Card>
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
              {showHC && <TabsTrigger value="pc" className="text-xs h-6">PC × Idade</TabsTrigger>}
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
            {showHC && (
              <TabsContent value="pc">
                <GrowthChart data={hcChartData} yLabel="PC (cm)" title="Perímetro Cefálico × Idade (0-36m)" />
              </TabsContent>
            )}
          </Tabs>
        )}

        {/* Growth history table with z-scores */}
        {growthData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Ruler className="h-4 w-4 text-primary" /> Histórico de Crescimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-1.5 pr-2">Data</th>
                      <th className="text-center py-1.5 px-1">Idade</th>
                      <th className="text-center py-1.5 px-1">Peso (kg)</th>
                      <th className="text-center py-1.5 px-1">Z Peso</th>
                      <th className="text-center py-1.5 px-1">Altura (cm)</th>
                      <th className="text-center py-1.5 px-1">Z Altura</th>
                      <th className="text-center py-1.5 px-1">IMC</th>
                      <th className="text-center py-1.5 px-1">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {growthData.map((d, i) => {
                      const wRef = interpolateReference(d.ageMonths, weightReference[genderKey]);
                      const hRef = interpolateReference(d.ageMonths, heightReference[genderKey]);
                      const wZ = d.weight && wRef ? calculateZScore(d.weight, wRef) : null;
                      const hZ = d.height && hRef ? calculateZScore(d.height, hRef) : null;
                      const wEst = d.weight && wRef ? estimatePercentile(d.weight, wRef) : null;
                      
                      const zColor = (z: number | null) => {
                        if (z == null) return "";
                        if (z < -2 || z > 2) return "text-destructive font-bold";
                        if (z < -1 || z > 1) return "text-warning font-medium";
                        return "text-success";
                      };
                      
                      return (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-1.5 pr-2 text-muted-foreground">{d.date}</td>
                          <td className="text-center py-1.5 px-1 font-medium">{d.ageLabel}</td>
                          <td className="text-center py-1.5 px-1">{d.weight ?? "—"}</td>
                          <td className={`text-center py-1.5 px-1 font-mono text-[10px] ${zColor(wZ)}`}>{wZ != null ? wZ.toFixed(2) : "—"}</td>
                          <td className="text-center py-1.5 px-1">{d.height ?? "—"}</td>
                          <td className={`text-center py-1.5 px-1 font-mono text-[10px] ${zColor(hZ)}`}>{hZ != null ? hZ.toFixed(2) : "—"}</td>
                          <td className="text-center py-1.5 px-1">{d.bmi ?? "—"}</td>
                          <td className="text-center py-1.5 px-1">
                            {wEst && (
                              <span className={`text-[9px] px-1 py-0.5 rounded ${zoneBg[wEst.zone]} ${zoneColors[wEst.zone]}`}>
                                {wEst.percentile}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Growth alerts */}
        {growthAlerts.length > 0 && (
          <div className="medical-card p-3 border-destructive/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-xs font-semibold text-destructive">Alertas de Crescimento</span>
            </div>
            <div className="space-y-1">
              {growthAlerts.map((alert, i) => (
                <p key={i} className="text-xs text-muted-foreground">⚠️ {alert}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============= CARDIOLOGIA VIEW =============
  if (view === "cardiologia") {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2"><HeartPulse className="h-4 w-4 text-primary" />Análise Cardiológica</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {latest?.heart_rate && <SummaryCard label="FC Atual" value={latest.heart_rate.toString()} unit="bpm" icon={Heart} trend={getTrend(latest.heart_rate, previous?.heart_rate)} classification={classifyHeartRate(latest.heart_rate, patientAgeYears)} />}
          {latest?.blood_pressure_systolic && latest?.blood_pressure_diastolic && <SummaryCard label="PA" value={`${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic}`} unit="mmHg" icon={Activity} classification={classifyBloodPressure(latest.blood_pressure_systolic, latest.blood_pressure_diastolic)} />}
          {latest?.oxygen_saturation && <SummaryCard label="SpO₂" value={latest.oxygen_saturation.toString()} unit="%" icon={Droplets} classification={classifyOxygenSaturation(latest.oxygen_saturation)} />}
        </div>

        {vitalData.length > 1 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Tendência Pressão Arterial</CardTitle></CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={vitalData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[40, 200]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <ReferenceLine y={140} stroke="hsl(var(--destructive))" strokeDasharray="3 3" strokeOpacity={0.5} />
                    <ReferenceLine y={90} stroke="hsl(var(--destructive))" strokeDasharray="3 3" strokeOpacity={0.3} />
                    <Area type="monotone" dataKey="systolic" name="PAS" stroke={chartColors.systolic} fill={chartColors.systolic} fillOpacity={0.1} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                    <Area type="monotone" dataKey="diastolic" name="PAD" stroke={chartColors.diastolic} fill={chartColors.diastolic} fillOpacity={0.05} strokeWidth={1.5} dot={{ r: 2 }} connectNulls />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex gap-3 text-[9px] text-muted-foreground">
                <span>— — Limite hipertensão (140/90 mmHg)</span>
              </div>
            </CardContent>
          </Card>
        )}

        {vitalData.length > 1 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Tendência Frequência Cardíaca</CardTitle></CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[40, 150]} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={100} stroke="hsl(var(--warning))" strokeDasharray="3 3" strokeOpacity={0.5} />
                    <ReferenceLine y={60} stroke="hsl(var(--warning))" strokeDasharray="3 3" strokeOpacity={0.5} />
                    <Line type="monotone" dataKey="hr" name="FC (bpm)" stroke={chartColors.hr} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex gap-3 text-[9px] text-muted-foreground">
                <span>— — Faixa normal: 60-100 bpm</span>
              </div>
            </CardContent>
          </Card>
        )}

        {vitalSigns.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Histórico de Registros</CardTitle></CardHeader>
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
                      <th className="text-center py-1.5 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vitalSigns.slice(0, 15).map((vs) => {
                      const bpCls = vs.blood_pressure_systolic && vs.blood_pressure_diastolic ? classifyBloodPressure(vs.blood_pressure_systolic, vs.blood_pressure_diastolic) : null;
                      return (
                        <tr key={vs.id} className="border-b border-border/50">
                          <td className="py-1.5 pr-3 text-muted-foreground">{format(parseISO(vs.recorded_at), "dd/MM HH:mm")}</td>
                          <td className={`text-center py-1.5 px-2 font-medium ${vs.heart_rate && (vs.heart_rate < 60 || vs.heart_rate > 100) ? "text-destructive" : ""}`}>{vs.heart_rate || "-"}</td>
                          <td className={`text-center py-1.5 px-2 font-medium ${vs.blood_pressure_systolic && vs.blood_pressure_systolic > 140 ? "text-destructive" : ""}`}>{vs.blood_pressure_systolic || "-"}</td>
                          <td className={`text-center py-1.5 px-2 font-medium ${vs.blood_pressure_diastolic && vs.blood_pressure_diastolic > 90 ? "text-destructive" : ""}`}>{vs.blood_pressure_diastolic || "-"}</td>
                          <td className={`text-center py-1.5 px-2 font-medium ${vs.oxygen_saturation && vs.oxygen_saturation < 95 ? "text-destructive" : ""}`}>{vs.oxygen_saturation ? `${vs.oxygen_saturation}%` : "-"}</td>
                          <td className="text-center py-1.5 px-2">
                            {bpCls && <span className={`text-[9px] px-1.5 py-0.5 rounded ${bpCls.bgColor} ${bpCls.color}`}>{bpCls.label}</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ============= UTI VIEW =============
  if (view === "uti") {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2"><HeartPulse className="h-4 w-4 text-primary" />Indicadores UTI / Paciente Crítico</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {latest?.heart_rate && <SummaryCard label="FC" value={latest.heart_rate.toString()} unit="bpm" icon={Heart} trend={getTrend(latest.heart_rate, previous?.heart_rate)} classification={classifyHeartRate(latest.heart_rate, patientAgeYears)} />}
          {latest?.blood_pressure_systolic && latest?.blood_pressure_diastolic && <SummaryCard label="PA" value={`${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic}`} unit="mmHg" icon={Activity} classification={classifyBloodPressure(latest.blood_pressure_systolic, latest.blood_pressure_diastolic)} />}
          {latest?.oxygen_saturation && <SummaryCard label="SpO₂" value={latest.oxygen_saturation.toString()} unit="%" icon={Droplets} classification={classifyOxygenSaturation(latest.oxygen_saturation)} />}
          {latest?.temperature && <SummaryCard label="Temp" value={Number(latest.temperature).toFixed(1)} unit="°C" icon={Thermometer} classification={classifyTemperature(Number(latest.temperature))} />}
          {latest?.respiratory_rate && <SummaryCard label="FR" value={latest.respiratory_rate.toString()} unit="rpm" icon={Activity} classification={classifyRespiratoryRate(latest.respiratory_rate, patientAgeYears)} />}
          {latest?.glucose && <SummaryCard label="Glicemia" value={latest.glucose.toString()} unit="mg/dL" icon={Activity} classification={classifyGlucose(latest.glucose)} />}
        </div>

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
                        <ReferenceLine y={95} stroke="hsl(var(--warning))" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: "SpO₂ mín", fontSize: 9 }} />
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
                        <ReferenceLine y={37.5} stroke="hsl(var(--warning))" strokeDasharray="3 3" strokeOpacity={0.5} />
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

        {medications.filter(m => m.status === "ativo").length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Medicações Ativas</CardTitle></CardHeader>
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

  // ============= TENDENCIAS VIEW =============
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
