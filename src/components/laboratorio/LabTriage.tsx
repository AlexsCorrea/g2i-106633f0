import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLabSamplesWithDetails, useLabSamples, createLabLog } from "@/hooks/useLaboratory";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, FlaskConical } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function LabTriage() {
  const { data: samples, isLoading } = useLabSamplesWithDetails();
  const { user } = useAuth();
  const qc = useQueryClient();

  const pendingSamples = samples?.filter((s: any) => s.status === "coletada" || s.status === "em_transito") ?? [];

  const handleAction = async (sampleId: string, action: "aceita" | "recusada") => {
    const newStatus = action === "aceita" ? "recebida" : "recusada";
    const { error } = await supabase.from("lab_samples").update({ status: newStatus, received_at: new Date().toISOString() }).eq("id", sampleId);
    if (error) { toast.error(error.message); return; }
    await supabase.from("lab_sample_triage").insert({ sample_id: sampleId, action, performed_by: user?.id });
    await createLabLog("lab_samples", sampleId, `triagem_${action}`, user?.id);
    qc.invalidateQueries({ queryKey: ["lab-samples-details"] });
    toast.success(action === "aceita" ? "Amostra aceita" : "Amostra recusada");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <FlaskConical className="h-5 w-5" />
        <span className="text-sm">Recebimento e triagem de amostras — aceite ou recusa</span>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Barcode</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Tubo</TableHead>
                <TableHead>Condição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !pendingSamples.length ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma amostra pendente de triagem</TableCell></TableRow>
              ) : pendingSamples.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-sm">{s.barcode}</TableCell>
                  <TableCell>{s.patients?.full_name ?? "—"}</TableCell>
                  <TableCell>{s.lab_materials?.name ?? "—"}</TableCell>
                  <TableCell>
                    {s.lab_tubes ? (
                      <Badge variant="outline" className="text-xs">{s.lab_tubes.name} ({s.lab_tubes.color})</Badge>
                    ) : "—"}
                  </TableCell>
                  <TableCell>{s.condition}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{s.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="text-green-600 h-7 px-2" onClick={() => handleAction(s.id, "aceita")}>
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600 h-7 px-2" onClick={() => handleAction(s.id, "recusada")}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
