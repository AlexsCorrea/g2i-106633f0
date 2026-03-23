import { ReactNode } from "react";
import { Plus, History as HistoryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ModuleSectionProps {
  title: string;
  icon: React.ElementType;
  description?: string;
  onAdd?: () => void;
  addLabel?: string;
  recordCount?: number;
  children?: ReactNode;
  tabs?: { id: string; label: string; content: ReactNode }[];
}

export function ModuleSection({
  title,
  icon: Icon,
  description,
  onAdd,
  addLabel = "Novo Registro",
  recordCount,
  children,
  tabs,
}: ModuleSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          {recordCount !== undefined && (
            <Badge variant="secondary" className="text-[10px] h-5">{recordCount} registros</Badge>
          )}
        </div>
        {onAdd && (
          <Button size="sm" onClick={onAdd} className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            {addLabel}
          </Button>
        )}
      </div>

      {tabs ? (
        <Tabs defaultValue={tabs[0]?.id} className="w-full">
          <TabsList className="w-full justify-start bg-muted/50 h-9">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-4">
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        children
      )}
    </div>
  );
}

interface EmptyModuleProps {
  title: string;
  description: string;
  icon: React.ElementType;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyModule({ title, description, icon: Icon, actionLabel, onAction }: EmptyModuleProps) {
  return (
    <div className="medical-card p-8 flex flex-col items-center justify-center text-center min-h-[250px]">
      <div className="w-14 h-14 rounded-xl bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} className="gap-1.5">
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
