import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Clock, FlaskConical } from "lucide-react";
import { format } from "date-fns";

interface Props {
  patientId: string;
}

const statusLabel: Record<string, string> = {
  validado: "Validado",
  aguardando_conferencia: "Aguardando Conferência",
  em_processamento: "Em Processamento",
};

export function LabResultsForPatient({ patientId }: Props) {
  const { data: results, isLoading } = useQuery({
    queryKey: ["lab-results-for-patient", patientId],
    queryFn: async () => {
      // Get all lab_requests for this patient, then their items, then results
      const { data: requests } = await (supabase as any)
        .from("lab_requests")
        .select("id, request_number, created_at, priority, clinical_notes, profiles!lab_requests_requesting_doctor_id_fkey(full_name)")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (!requests?.length) return [];

      const requestIds = requests.map((r: any) => r.id);
      const { data: items } = await (supabase as any)
        .from("lab_request_items")
        .select("id, request_id, lab_exams(name, code, unit)")
        .in("request_id", requestIds);

      if (!items?.length) return [];

      const itemIds = items.map((i: any) => i.id);
      const { data: labResults } = await (supabase as any)
        .from("lab_results")
        .select("*")
        .in("request_item_id", itemIds)
        .in("status", ["validado", "aguardando_conferencia"])
        .order("performed_at", { ascending: false });

      if (!labResults?.length) return [];

      // Build grouped results by request
      const requestMap = new Map(requests.map((r: any) => [r.id, r]));
      const itemMap = new Map(items.map((i: any) => [i.id, i]));

      return labResults.map((res: any) => {
        const item = itemMap.get(res.request_item_id);
        const req = item ? requestMap.get(item.request_id) : null;
        return { ...res, exam: item?.lab_exams, request: req };
      });
    },
    enabled: !!patientId,
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando resultados...</p>;
  if (!results?.length) return <p className="text-sm text-muted-foreground">Nenhum resultado laboratorial disponível.</p>;

  // Group by request
  const grouped = results.reduce((acc: Record<string, any[]>, r: any) => {
    const key = r.request?.request_number || "sem-requisição";
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([reqNum, items]) => {
        const req = (items as any[])[0]?.request;
        return (
          <Card key={reqNum} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">{reqNum}</span>
                  {req?.priority && req.priority !== "rotina" && (
                    <Badge variant="destructive" className="text-[10px]">{req.priority}</Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {req?.created_at && format(new Date(req.created_at), "dd/MM/yyyy HH:mm")}
                  {req?.profiles?.full_name && ` • ${req.profiles.full_name}`}
                </span>
              </div>

              <div className="space-y-2">
                {(items as any[]).map((r: any) => (
                  <div key={r.id} className={`flex items-start gap-3 p-2 rounded border text-sm ${
                    r.is_critical ? "border-destructive/50 bg-destructive/5" :
                    r.is_abnormal ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20" :
                    "border-border/50 bg-muted/20"
                  }`}>
                    <div className="shrink-0 mt-0.5">
                      {r.is_critical ? <AlertTriangle className="h-4 w-4 text-destructive" /> :
                       r.status === "validado" ? <CheckCircle2 className="h-4 w-4 text-green-600" /> :
                       <Clock className="h-4 w-4 text-amber-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{r.exam?.name || "Exame"}</span>
                        <span className="text-xs text-muted-foreground font-mono">{r.exam?.code}</span>
                        <Badge variant="outline" className="text-[10px] ml-auto">
                          {statusLabel[r.status] || r.status}
                        </Badge>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className={`font-semibold ${r.is_critical ? "text-destructive" : r.is_abnormal ? "text-amber-700 dark:text-amber-400" : ""}`}>
                          {r.value}
                        </span>
                        {r.unit && <span className="text-xs text-muted-foreground">{r.unit}</span>}
                        {r.reference_text && (
                          <span className="text-xs text-muted-foreground ml-2">Ref: {r.reference_text}</span>
                        )}
                      </div>
                      {r.technical_notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">{r.technical_notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}