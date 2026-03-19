import { Construction } from "lucide-react";

interface PlaceholderSectionProps {
  title: string;
  description?: string;
}

export function PlaceholderSection({ title, description }: PlaceholderSectionProps) {
  return (
    <div className="medical-card p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Construction className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        {description || "Esta seção está em desenvolvimento e estará disponível em breve."}
      </p>
    </div>
  );
}
