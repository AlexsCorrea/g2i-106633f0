import { Heart, Thermometer, Activity, Wind, Droplets, Gauge } from "lucide-react";

interface Vital {
  label: string;
  value: string;
  unit: string;
  status: "normal" | "warning" | "critical";
  icon: "heart" | "temp" | "activity" | "wind" | "oxygen" | "pressure";
  trend?: "up" | "down" | "stable";
}

interface VitalsCardProps {
  vitals: Vital[];
  lastUpdate: string;
}

const iconMap = {
  heart: Heart,
  temp: Thermometer,
  activity: Activity,
  wind: Wind,
  oxygen: Droplets,
  pressure: Gauge,
};

const statusStyles = {
  normal: "vital-normal",
  warning: "vital-warning",
  critical: "vital-critical",
};

const statusDot = {
  normal: "bg-success",
  warning: "bg-warning",
  critical: "bg-destructive",
};

export function VitalsCard({ vitals, lastUpdate }: VitalsCardProps) {
  return (
    <div className="medical-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-header mb-0">
          <Activity className="h-4 w-4 text-primary" />
          Sinais Vitais
        </h3>
        <span className="text-xs text-muted-foreground">
          Atualizado: {lastUpdate}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {vitals.map((vital, index) => {
          const Icon = iconMap[vital.icon];
          return (
            <div
              key={index}
              className="p-4 rounded-lg bg-muted/30 hover-lift cursor-default"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div className={`w-2 h-2 rounded-full ${statusDot[vital.status]} ${vital.status === 'critical' ? 'animate-pulse-soft' : ''}`} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{vital.label}</p>
                <p className="text-xl font-bold text-foreground">
                  {vital.value}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {vital.unit}
                  </span>
                </p>
              </div>
              <span className={`vital-badge mt-2 ${statusStyles[vital.status]}`}>
                {vital.status === "normal" ? "Normal" : vital.status === "warning" ? "Atenção" : "Crítico"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
