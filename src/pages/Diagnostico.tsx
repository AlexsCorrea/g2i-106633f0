import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ArrowLeft, Search, Loader2, CheckCircle2, Edit3, Tag, Printer } from "lucide-react";
import { format, parseISO } from "date-fns";

const laudoStatusConfig: Record<string, { label: string; color: string }> = {
  solicitado: { label: "Solicitado", color: "bg-yellow-500/10 text-yellow-700" },
  coletado: { label: "Coletado", color: "bg-blue-500/10 text-blue-700" },
  em_analise: { label: "Em Análise", color: "bg-primary/10 text-primary" },
  concluido: { label: "Concluído", color: "bg-emerald-500/10 text-emerald-700" },
  cancelado: { label: "Cancelado", color: "bg-muted text-muted-foreground" },
};

export default function Diagnostico() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("laudos");
  const [search, setSearch] = useState("");
  const { data: exams, isLoading } = useExamRequests();

  const filtered = exams?.filter((e: any) =>
    e.exam_type?.toLowerCase().includes(search.toLowerCase())
  );

  const pending = exams?.filter((e: any) => e.status === "solicitado" || e.status === "coletado").length || 0;

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Diagnóstico</h1>
            <p className="text-sm text-muted-foreground">Laudos e etiquetas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">{exams?.length || 0}</p><p className="text-xs text-muted-foreground">Total de Exames</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-yellow-600">{pending}</p><p className="text-xs text-muted-foreground">Aguardando Laudo</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-emerald-600">{exams?.filter((e: any) => e.status === "concluido").length || 0}</p><p className="text-xs text-muted-foreground">Concluídos</p></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="laudos">Laudos</TabsTrigger>
          <TabsTrigger value="etiquetas">Etiquetas</TabsTrigger>
        </TabsList>

        <TabsContent value="laudos" className="space-y-3 mt-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar exame..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
          <Card><CardContent className="p-0">
            {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Exame</TableHead><TableHead>Categoria</TableHead><TableHead>Prioridade</TableHead><TableHead>Data</TableHead><TableHead>Status</TableHead><TableHead>Ações</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered?.map((exam: any) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.exam_type}</TableCell>
                      <TableCell>{exam.exam_category}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={exam.priority === "urgente" ? "border-destructive text-destructive" : ""}>{exam.priority}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{format(parseISO(exam.created_at), "dd/MM/yyyy")}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={laudoStatusConfig[exam.status]?.color}>
                          {laudoStatusConfig[exam.status]?.label || exam.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
                          <Edit3 className="h-3 w-3" /> Laudar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="etiquetas" className="mt-4">
          <Card><CardContent className="p-8 text-center">
            <Printer className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Geração de Etiquetas</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Gere etiquetas para exames, materiais e pacientes</p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" className="gap-1.5"><Tag className="h-4 w-4" /> Etiqueta de Exame</Button>
              <Button variant="outline" className="gap-1.5"><Tag className="h-4 w-4" /> Etiqueta de Paciente</Button>
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
