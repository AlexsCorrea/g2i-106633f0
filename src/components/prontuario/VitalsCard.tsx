import { Heart, Thermometer, Activity, Wind, Droplets, Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  classifyHeartRate, classifyBloodPressure, classifyTemperature,
  classifyOxygenSaturation, classifyRespiratoryRate, classifyGlucose,
  getClassificationBadge,
} from "@/lib/clinicalRules";

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
  patientAge?: number;
}

const iconMap = {
  heart: Heart,
  temp: Thermometer,
  activity: Activity,
  wind: Wind,
  oxygen: Droplets,
  pressure: Gauge,
};

const statusDot = {
  normal: "bg-success",
  warning: "bg-warning",
  critical: "bg-destructive",
};

function getClinicalLabel(vital: Vital, patientAge?: number) {
  const numVal = parseFloat(vital.value.replace(",", "."));
  if (isNaN(numVal)) return null;

  switch (vital.icon) {
    case "heart": return classifyHeartRate(numVal, patientAge);
    case "pressure": {
      const parts = vital.value.split("/");
      if (parts.length === 2) {
        const s = parseInt(parts[0]);
        const d = parseInt(parts[1]);
        if (!isNaN(s) && !isNaN(d)) return classifyBloodPressure(s, d);
      }
      return null;
    }
    case "temp": return classifyTemperature(numVal);
    case "oxygen": return classifyOxygenSaturation(numVal);
    case "wind": return classifyRespiratoryRate(numVal, patientAge);
    case "activity": return classifyGlucose(numVal);
    default: return null;
  }
}

export function VitalsCard({ vitals, lastUpdate, patientAge }: VitalsCardProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">
          Atualizado: {lastUpdate}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {vitals.map((vital, index) => {
          const Icon = iconMap[vital.icon];
          const clinical = getClinicalLabel(vital, patientAge);
          const badge = clinical ? getClassificationBadge(clinical) : null;

          return (
            <div
              key={index}
              className="p-3 rounded-lg bg-muted/30 hover-lift cursor-default"
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div className={`w-2 h-2 rounded-full ${statusDot[clinical?.level || vital.status]} ${(clinical?.level || vital.status) === 'critical' ? 'animate-pulse-soft' : ''}`} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] text-muted-foreground">{vital.label}</p>
                <p className="text-lg font-bold text-foreground">
                  {vital.value}
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    {vital.unit}
                  </span>
                </p>
              </div>
              {badge && (
                <span className={`inline-block mt-1.5 ${badge.className}`}>
                  {badge.text}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
