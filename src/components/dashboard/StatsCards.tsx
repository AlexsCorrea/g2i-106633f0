import { Card } from "@/components/ui/card";
import { Users, Calendar, AlertTriangle, ArrowUpRight } from "lucide-react";
import type { DashboardStats } from "@/hooks/useDashboardStats";

interface StatsCardsProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

const statItems = [
  { key: "internados" as const, label: "Pacientes Internados", icon: Users, color: "text-primary", bg: "bg-primary/10" },
  { key: "consultasHoje" as const, label: "Consultas Hoje", icon: Calendar, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "pendencias" as const, label: "Pendências", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
  { key: "altasPrevistas" as const, label: "Altas Previstas", icon: ArrowUpRight, color: "text-sky-600", bg: "bg-sky-50" },
];

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map(({ key, label, icon: Icon, color, bg }) => (
        <Card key={key} className="p-5 flex items-start gap-4">
          <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div>
            <div className={`text-2xl font-bold ${color}`}>
              {isLoading ? (
                <span className="inline-block w-8 h-7 bg-muted animate-pulse rounded" />
              ) : (
                stats?.[key] ?? 0
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
