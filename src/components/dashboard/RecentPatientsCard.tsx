import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight } from "lucide-react";
import type { RecentPatient } from "@/hooks/useDashboardStats";

const statusColors: Record<string, string> = {
  internado: "bg-primary/10 text-primary",
  ambulatorial: "bg-emerald-100 text-emerald-700",
  alta: "bg-muted text-muted-foreground",
  transferido: "bg-amber-100 text-amber-700",
  obito: "bg-destructive/10 text-destructive",
};

const statusLabels: Record<string, string> = {
  internado: "Internado",
  ambulatorial: "Ambulatorial",
  alta: "Alta",
  transferido: "Transferido",
  obito: "Óbito",
};

interface Props {
  patients: RecentPatient[] | undefined;
  isLoading: boolean;
}

export function RecentPatientsCard({ patients, isLoading }: Props) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Pacientes Ativos
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate("/patients")} className="gap-1 text-xs">
          Ver todos <ArrowRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !patients?.length ? (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhum paciente ativo</p>
        ) : (
          patients.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/prontuario/${p.id}`)}
              className="flex items-center gap-3 p-2.5 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-primary">
                  {p.full_name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.full_name}</p>
                {p.room && p.bed && (
                  <p className="text-[11px] text-muted-foreground">Quarto {p.room} / Leito {p.bed}</p>
                )}
              </div>
              <Badge variant="secondary" className={`text-[10px] ${statusColors[p.status] ?? ""}`}>
                {statusLabels[p.status] ?? p.status}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
