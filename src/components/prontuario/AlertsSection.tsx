import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  date?: string;
}

interface AlertsSectionProps {
  alerts: Alert[];
  onDismiss?: (id: string) => void;
}

const alertConfig = {
  critical: {
    icon: AlertTriangle,
    className: "alert-critical",
    iconClassName: "text-destructive",
  },
  warning: {
    icon: AlertCircle,
    className: "alert-warning",
    iconClassName: "text-warning",
  },
  info: {
    icon: Info,
    className: "alert-info",
    iconClassName: "text-info",
  },
};

export function AlertsSection({ alerts, onDismiss }: AlertsSectionProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 animate-slide-in">
      {alerts.map((alert) => {
        const config = alertConfig[alert.type];
        const Icon = config.icon;

        return (
          <div key={alert.id} className={`alert-banner ${config.className}`}>
            <Icon className={`h-5 w-5 flex-shrink-0 ${config.iconClassName}`} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{alert.title}</p>
              <p className="text-xs opacity-80">{alert.description}</p>
            </div>
            {alert.date && (
              <span className="text-xs opacity-60 flex-shrink-0">{alert.date}</span>
            )}
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0 opacity-50 hover:opacity-100"
                onClick={() => onDismiss(alert.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
