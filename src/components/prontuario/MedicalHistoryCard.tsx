import { FileText, Heart, Stethoscope, Scissors, Syringe } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface HistoryItem {
  category: "doenca" | "cirurgia" | "exame" | "internacao";
  title: string;
  date?: string;
  details?: string;
}

interface MedicalHistoryCardProps {
  history: HistoryItem[];
  familyHistory?: string[];
}

const categoryConfig = {
  doenca: { icon: Heart, label: "Doenças Prévias", color: "text-destructive" },
  cirurgia: { icon: Scissors, label: "Cirurgias", color: "text-warning" },
  exame: { icon: Stethoscope, label: "Exames Relevantes", color: "text-info" },
  internacao: { icon: FileText, label: "Internações Anteriores", color: "text-primary" },
};

export function MedicalHistoryCard({ history, familyHistory }: MedicalHistoryCardProps) {
  const groupedHistory = history.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, HistoryItem[]>);

  return (
    <div className="medical-card p-5">
      <h3 className="section-header">
        <FileText className="h-4 w-4 text-primary" />
        Histórico Médico
      </h3>

      <Accordion type="multiple" className="w-full">
        {Object.entries(groupedHistory).map(([category, items]) => {
          const config = categoryConfig[category as keyof typeof categoryConfig];
          const Icon = config.icon;

          return (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <span className="font-medium">{config.label}</span>
                  <span className="text-xs text-muted-foreground">({items.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-6">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-foreground">{item.title}</p>
                        {item.date && (
                          <p className="text-xs text-muted-foreground">{item.date}</p>
                        )}
                        {item.details && (
                          <p className="text-xs text-muted-foreground mt-1">{item.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}

        {familyHistory && familyHistory.length > 0 && (
          <AccordionItem value="family">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Syringe className="h-4 w-4 text-accent" />
                <span className="font-medium">Histórico Familiar</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pl-6">
                {familyHistory.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                    <p className="text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}
