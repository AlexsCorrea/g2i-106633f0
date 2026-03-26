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

  const SummaryCard = ({ label, value, unit, icon: Icon, trend, status }: {
    label: string; value: string; unit: string; icon: React.ElementType;
    trend?: "up" | "down" | "stable" | null; status?: "normal" | "warning" | "critical";
  }) => (
    <div className="medical-card p-3">
      <div className="flex items-center justify-between mb-1">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-center gap-1">
          {trend === "up" && <TrendingUp className="h-3 w-3 text-destructive" />}
          {trend === "down" && <TrendingDown className="h-3 w-3 text-success" />}
          {status && (
            <div className={`w-2 h-2 rounded-full ${
              status === "normal" ? "bg-success" : status === "warning" ? "bg-warning" : "bg-destructive animate-pulse"
            }`} />
          )}
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}<span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span></p>
    </div>
  );

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
  if (view === "geral") {
    const getHrStatus = (hr?: number | null) => !hr ? undefined : hr < 60 || hr > 100 ? "warning" : "normal";
    const getBpStatus = (s?: number | null, d?: number | null) => !s || !d ? undefined : s > 140 || d > 90 ? "warning" : s > 160 || d > 100 ? "critical" : "normal";
    const getSpo2Status = (v?: number | null) => !v ? undefined : v < 90 ? "critical" : v < 95 ? "warning" : "normal";
    const getTempStatus = (t?: number | null) => !t ? undefined : Number(t) > 38 ? "warning" : Number(t) > 39 ? "critical" : Number(t) < 35.5 ? "warning" : "normal";

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />Painel Clínico Geral</h3>
        
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {latest?.heart_rate && <SummaryCard label="FC" value={latest.heart_rate.toString()} unit="bpm" icon={Heart} trend={getTrend(latest.heart_rate, previous?.heart_rate)} status={getHrStatus(latest.heart_rate)} />}
          {latest?.blood_pressure_systolic && <SummaryCard label="PA" value={`${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic}`} unit="mmHg" icon={Activity} status={getBpStatus(latest.blood_pressure_systolic, latest.blood_pressure_diastolic)} />}
          {latest?.oxygen_saturation && <SummaryCard label="SpO₂" value={latest.oxygen_saturation.toString()} unit="%" icon={Droplets} trend={getTrend(latest.oxygen_saturation, previous?.oxygen_saturation)} status={getSpo2Status(latest.oxygen_saturation)} />}
          {latest?.temperature && <SummaryCard label="Temp" value={Number(latest.temperature).toFixed(1)} unit="°C" icon={Thermometer} status={getTempStatus(latest.temperature)} />}
          {latest?.respiratory_rate && <SummaryCard label="FR" value={latest.respiratory_rate.toString()} unit="rpm" icon={Activity} />}
          {latest?.glucose && <SummaryCard label="Glicemia" value={latest.glucose.toString()} unit="mg/dL" icon={Activity} />}
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

        {/* Scales summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {latestGlasgow?.total_score != null && (
            <div className="medical-card p-3">
              <p className="text-[10px] text-muted-foreground">Glasgow</p>
              <p className={`text-xl font-bold ${latestGlasgow.total_score <= 8 ? "text-destructive" : latestGlasgow.total_score <= 12 ? "text-warning" : ""}`}>
                {latestGlasgow.total_score}<span className="text-sm font-normal text-muted-foreground">/15</span>
              </p>
            </div>
          )}
          {latestBraden?.total_score != null && (
            <div className="medical-card p-3">
              <p className="text-[10px] text-muted-foreground">Braden</p>
              <p className={`text-xl font-bold ${latestBraden.total_score <= 12 ? "text-destructive" : latestBraden.total_score <= 14 ? "text-warning" : ""}`}>
                {latestBraden.total_score}<span className="text-sm font-normal text-muted-foreground">/23</span>
              </p>
            </div>
          )}
          {latestMorse?.total_score != null && (
            <div className="medical-card p-3">
              <p className="text-[10px] text-muted-foreground">Morse</p>
              <p className={`text-xl font-bold ${latestMorse.total_score >= 45 ? "text-destructive" : latestMorse.total_score >= 25 ? "text-warning" : ""}`}>
                {latestMorse.total_score}
              </p>
            </div>
          )}
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

        {/* Latest measurements */}
        {growthData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {growthData[growthData.length - 1].weight && (
              <div className="medical-card p-3">
                <p className="text-[10px] text-muted-foreground">Último Peso</p>
                <p className="text-xl font-bold">{growthData[growthData.length - 1].weight}<span className="text-sm font-normal text-muted-foreground ml-1">kg</span></p>
                <p className="text-[10px] text-muted-foreground">{growthData[growthData.length - 1].date} • {growthData[growthData.length - 1].ageLabel}</p>
              </div>
            )}
            {growthData[growthData.length - 1].height && (
              <div className="medical-card p-3">
                <p className="text-[10px] text-muted-foreground">Última Estatura</p>
                <p className="text-xl font-bold">{growthData[growthData.length - 1].height}<span className="text-sm font-normal text-muted-foreground ml-1">cm</span></p>
              </div>
            )}
            {growthData[growthData.length - 1].bmi && (
              <div className="medical-card p-3">
                <p className="text-[10px] text-muted-foreground">Último IMC</p>
                <p className="text-xl font-bold">{growthData[growthData.length - 1].bmi}<span className="text-sm font-normal text-muted-foreground ml-1">kg/m²</span></p>
              </div>
            )}
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
          {latest?.heart_rate && <SummaryCard label="FC Atual" value={latest.heart_rate.toString()} unit="bpm" icon={Heart} trend={getTrend(latest.heart_rate, previous?.heart_rate)} status={latest.heart_rate < 60 || latest.heart_rate > 100 ? "warning" : "normal"} />}
          {latest?.blood_pressure_systolic && <SummaryCard label="PAS" value={latest.blood_pressure_systolic.toString()} unit="mmHg" icon={Activity} status={latest.blood_pressure_systolic > 140 ? "warning" : "normal"} />}
          {latest?.blood_pressure_diastolic && <SummaryCard label="PAD" value={latest.blood_pressure_diastolic.toString()} unit="mmHg" icon={Activity} status={latest.blood_pressure_diastolic > 90 ? "warning" : "normal"} />}
          {latest?.oxygen_saturation && <SummaryCard label="SpO₂" value={latest.oxygen_saturation.toString()} unit="%" icon={Droplets} status={latest.oxygen_saturation < 95 ? "warning" : "normal"} />}
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
          {latest?.heart_rate && <SummaryCard label="FC" value={latest.heart_rate.toString()} unit="bpm" icon={Heart} trend={getTrend(latest.heart_rate, previous?.heart_rate)} status={latest.heart_rate < 50 || latest.heart_rate > 120 ? "critical" : latest.heart_rate < 60 || latest.heart_rate > 100 ? "warning" : "normal"} />}
          {latest?.blood_pressure_systolic && <SummaryCard label="PA" value={`${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic}`} unit="mmHg" icon={Activity} status={latest.blood_pressure_systolic < 90 || latest.blood_pressure_systolic > 160 ? "critical" : "normal"} />}
          {latest?.oxygen_saturation && <SummaryCard label="SpO₂" value={latest.oxygen_saturation.toString()} unit="%" icon={Droplets} status={latest.oxygen_saturation < 90 ? "critical" : latest.oxygen_saturation < 95 ? "warning" : "normal"} />}
          {latest?.temperature && <SummaryCard label="Temp" value={Number(latest.temperature).toFixed(1)} unit="°C" icon={Thermometer} status={Number(latest.temperature) > 38.5 ? "critical" : Number(latest.temperature) > 37.8 ? "warning" : "normal"} />}
          {latest?.respiratory_rate && <SummaryCard label="FR" value={latest.respiratory_rate.toString()} unit="rpm" icon={Activity} status={latest.respiratory_rate > 25 ? "critical" : latest.respiratory_rate > 20 ? "warning" : "normal"} />}
          {latest?.glucose && <SummaryCard label="Glicemia" value={latest.glucose.toString()} unit="mg/dL" icon={Activity} status={latest.glucose < 70 || latest.glucose > 200 ? "critical" : latest.glucose > 180 ? "warning" : "normal"} />}
        </div>

        {/* Scales for critical */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="medical-card p-3">
            <p className="text-[10px] text-muted-foreground">Glasgow</p>
            <p className={`text-2xl font-bold ${latestGlasgow?.total_score != null && latestGlasgow.total_score <= 8 ? "text-destructive" : latestGlasgow?.total_score != null && latestGlasgow.total_score <= 12 ? "text-warning" : ""}`}>
              {latestGlasgow?.total_score ?? "N/A"}<span className="text-sm font-normal text-muted-foreground">/15</span>
            </p>
            {latestGlasgow?.total_score != null && latestGlasgow.total_score <= 8 && <Badge variant="destructive" className="text-[10px] mt-1">Grave</Badge>}
          </div>
          <div className="medical-card p-3">
            <p className="text-[10px] text-muted-foreground">Braden (LPP)</p>
            <p className={`text-2xl font-bold ${latestBraden?.total_score != null && latestBraden.total_score <= 12 ? "text-destructive" : ""}`}>
              {latestBraden?.total_score ?? "N/A"}<span className="text-sm font-normal text-muted-foreground">/23</span>
            </p>
          </div>
          <div className="medical-card p-3">
            <p className="text-[10px] text-muted-foreground">Morse (Queda)</p>
            <p className={`text-2xl font-bold ${latestMorse?.total_score != null && latestMorse.total_score >= 45 ? "text-destructive" : ""}`}>
              {latestMorse?.total_score ?? "N/A"}
            </p>
          </div>
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
