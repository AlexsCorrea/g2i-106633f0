import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePatients } from "@/hooks/usePatients";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HeartPulse, ArrowLeft, Search, Loader2, BedDouble, Siren, Home as HomeIcon,
  Activity, Pill, Stethoscope, Utensils, ListChecks, FlaskConical, Radiation, User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  { key: "internados", label: "Internados", icon: BedDouble, statusFilter: "internado" },
  { key: "uti", label: "UTI", icon: HeartPulse, statusFilter: "internado" },
  { key: "pa", label: "Pronto Atendimento", icon: Siren, statusFilter: "ambulatorial" },
  { key: "homecare", label: "Home Care", icon: HomeIcon, statusFilter: "ambulatorial" },
];

const executorSections = [
  { key: "enfermagem", label: "Enfermagem", icon: Activity, description: "Pendências de enfermagem e prescrições para executar" },
  { key: "farmacia", label: "Farmácia", icon: Pill, description: "Prescrições aguardando dispensação" },
  { key: "procedimentos", label: "Procedimentos", icon: Stethoscope, description: "Procedimentos prescritos aguardando execução" },
  { key: "nutricao", label: "Nutrição", icon: Utensils, description: "Dietas prescritas e controle nutricional" },
  { key: "triagem", label: "Triagem", icon: ListChecks, description: "Pacientes aguardando classificação de risco" },
  { key: "laboratorio", label: "Laboratório", icon: FlaskConical, description: "Exames laboratoriais solicitados" },
  { key: "oncologia", label: "Oncologia", icon: Radiation, description: "Prescrições oncológicas e autorizações" },
];

export default function Assistencial() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("internados");
  const [search, setSearch] = useState("");
  const { data: patients, isLoading } = usePatients();

  const activeSection = sections.find((s) => s.key === tab);
  const isExecutor = executorSections.some((s) => s.key === tab);

  const filteredPatients = patients?.filter((p) => {
    if (activeSection?.statusFilter && p.status !== activeSection.statusFilter) return false;
    if (search && !p.full_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Assistencial</h1>
            <p className="text-sm text-muted-foreground">Gestão clínica e setores executores</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">{patients?.filter((p) => p.status === "internado").length || 0}</p><p className="text-xs text-muted-foreground">Internados</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-primary">{patients?.filter((p) => p.status === "ambulatorial").length || 0}</p><p className="text-xs text-muted-foreground">Ambulatoriais</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-emerald-600">{patients?.filter((p) => p.status === "alta").length || 0}</p><p className="text-xs text-muted-foreground">Altas</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">{patients?.length || 0}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          {sections.map((s) => (
            <TabsTrigger key={s.key} value={s.key} className="gap-1.5 text-xs">
              <s.icon className="h-3.5 w-3.5" /> {s.label}
            </TabsTrigger>
          ))}
          {executorSections.map((s) => (
            <TabsTrigger key={s.key} value={s.key} className="gap-1.5 text-xs">
              <s.icon className="h-3.5 w-3.5" /> {s.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Patient sections */}
        {sections.map((section) => (
          <TabsContent key={section.key} value={section.key} className="space-y-3 mt-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar paciente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Card><CardContent className="p-0">
              {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Paciente</TableHead><TableHead>Status</TableHead><TableHead>Quarto/Leito</TableHead><TableHead>Convênio</TableHead><TableHead>Ações</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {filteredPatients?.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="font-medium">{p.full_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">{p.status}</Badge>
                        </TableCell>
                        <TableCell>{p.room && p.bed ? `${p.room}/${p.bed}` : "—"}</TableCell>
                        <TableCell>{p.health_insurance || "—"}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => navigate(`/prontuario/${p.id}`)}>
                            Prontuário
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent></Card>
          </TabsContent>
        ))}

        {/* Executor sections */}
        {executorSections.map((section) => (
          <TabsContent key={section.key} value={section.key} className="mt-4">
            <Card><CardContent className="p-8 text-center">
              <section.icon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">{section.label}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">{section.description}</p>
              <p className="text-sm">Pendências serão exibidas aqui conforme prescrições médicas forem geradas.</p>
            </CardContent></Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
