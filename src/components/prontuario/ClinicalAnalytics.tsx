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
    const age = patientBirthDate ? differenceInYears(new Date(), parseISO(patientBirthDate)) : 0;

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Baby className="h-4 w-4 text-primary" />Análise Pediátrica</h3>
        
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
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Curva de Peso × Idade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={growthData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="ageLabel" tick={{ fontSize: 10 }} label={{ value: "Idade (meses)", position: "insideBottom", offset: -5, fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} label={{ value: "Peso (kg)", angle: -90, position: "insideLeft", fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="weight" name="Peso (kg)" stroke={chartColors.weight} fill={chartColors.weight} fillOpacity={0.1} strokeWidth={2} dot={{ r: 4 }} connectNulls />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {growthData.filter(d => d.weight).map((d, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">{d.date}: {d.weight}kg ({d.ageLabel})</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="altura">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Curva de Estatura × Idade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={growthData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="ageLabel" tick={{ fontSize: 10 }} label={{ value: "Idade (meses)", position: "insideBottom", offset: -5, fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} label={{ value: "Estatura (cm)", angle: -90, position: "insideLeft", fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="height" name="Estatura (cm)" stroke={chartColors.height} fill={chartColors.height} fillOpacity={0.1} strokeWidth={2} dot={{ r: 4 }} connectNulls />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="imc">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">IMC × Idade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={growthData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="ageLabel" tick={{ fontSize: 10 }} label={{ value: "Idade (meses)", position: "insideBottom", offset: -5, fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} label={{ value: "IMC (kg/m²)", angle: -90, position: "insideLeft", fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="bmi" name="IMC" stroke={chartColors.bmi} fill={chartColors.bmi} fillOpacity={0.1} strokeWidth={2} dot={{ r: 4 }} connectNulls />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Latest measurements with classification */}
        {growthData.length > 0 && (() => {
          const last = growthData[growthData.length - 1];
          const gender = (patientGender === "M" || patientGender === "F") ? patientGender : "M";
          const weightCls = last.weight ? classifyPediatricWeight(last.weight, last.ageMonths, gender as "M" | "F") : null;
          const heightCls = last.height ? classifyPediatricHeight(last.height, last.ageMonths, gender as "M" | "F") : null;
          const bmiCls = last.bmi ? classifyBMI(last.bmi, patientAgeYears) : null;
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {last.weight && (
                <div className="medical-card p-3">
                  <p className="text-[10px] text-muted-foreground">Último Peso</p>
                  <p className="text-xl font-bold">{last.weight}<span className="text-sm font-normal text-muted-foreground ml-1">kg</span></p>
                  <p className="text-[10px] text-muted-foreground">{last.date} • {last.ageLabel}</p>
                  {weightCls && <span className={`inline-block mt-1 ${getClassificationBadge(weightCls).className}`}>{weightCls.label}</span>}
                </div>
              )}
              {last.height && (
                <div className="medical-card p-3">
                  <p className="text-[10px] text-muted-foreground">Última Estatura</p>
                  <p className="text-xl font-bold">{last.height}<span className="text-sm font-normal text-muted-foreground ml-1">cm</span></p>
                  {heightCls && <span className={`inline-block mt-1 ${getClassificationBadge(heightCls).className}`}>{heightCls.label}</span>}
                </div>
              )}
              {last.bmi && (
                <div className="medical-card p-3">
                  <p className="text-[10px] text-muted-foreground">Último IMC</p>
                  <p className="text-xl font-bold">{last.bmi}<span className="text-sm font-normal text-muted-foreground ml-1">kg/m²</span></p>
                  {bmiCls && <span className={`inline-block mt-1 ${getClassificationBadge(bmiCls).className}`}>{bmiCls.label}</span>}
                </div>
              )}
            </div>
          );
        })()}
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
