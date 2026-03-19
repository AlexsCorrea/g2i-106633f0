import { useState } from "react";
import {
  LayoutDashboard,
  Stethoscope,
  Heart,
  Activity,
  Apple,
  Brain,
  Pill,
  Eye,
  Ear,
  FileText,
  Scale,
  ClipboardList,
  Shield,
  Users,
  Scissors,
  Zap,
  Link2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface SidebarSection {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  children?: { id: string; label: string; icon?: React.ElementType }[];
}

const sections: SidebarSection[] = [
  { id: "resumo", label: "Resumo", icon: LayoutDashboard },
  {
    id: "area-medica",
    label: "Área Médica",
    icon: Stethoscope,
    children: [
      { id: "evolucao-medica", label: "Evolução Médica", icon: ClipboardList },
      { id: "prescricoes", label: "Prescrições", icon: Pill },
      { id: "pedidos-exames", label: "Pedidos de Exames", icon: FileText },
      { id: "oftalmologia", label: "Oftalmologia", icon: Eye },
      { id: "admissao-diagnostico", label: "Admissão e Diagnóstico", icon: FileText },
    ],
  },
  {
    id: "area-enfermagem",
    label: "Área Enfermagem",
    icon: Heart,
    children: [
      { id: "evolucao-enfermagem", label: "Evolução Enfermagem", icon: ClipboardList },
      { id: "sinais-vitais", label: "Sinais Vitais", icon: Activity },
      { id: "escalas", label: "Escalas", icon: Scale },
      { id: "balanço-hidrico", label: "Balanço Hídrico", icon: Activity },
    ],
  },
  {
    id: "area-fisioterapia",
    label: "Área Fisioterapia",
    icon: Activity,
    children: [
      { id: "evolucao-fisioterapia", label: "Evolução Fisioterapia", icon: ClipboardList },
    ],
  },
  {
    id: "area-nutricao",
    label: "Área Nutricionista",
    icon: Apple,
    children: [
      { id: "evolucao-nutricao", label: "Evolução Nutricional", icon: ClipboardList },
      { id: "dieta", label: "Dieta Prescrita", icon: FileText },
    ],
  },
  {
    id: "area-psicologia",
    label: "Área Psicologia",
    icon: Brain,
    children: [
      { id: "evolucao-psicologia", label: "Evolução Psicológica", icon: ClipboardList },
    ],
  },
  {
    id: "area-farmacia",
    label: "Área Farmácia",
    icon: Pill,
    children: [
      { id: "dispensacao", label: "Dispensação", icon: Pill },
      { id: "interacoes", label: "Interações Medicamentosas", icon: Shield },
    ],
  },
  {
    id: "area-fonoaudiologia",
    label: "Área Fonoaudiologia",
    icon: Ear,
    children: [
      { id: "evolucao-fono", label: "Evolução Fono", icon: ClipboardList },
    ],
  },
  {
    id: "assistencia-social",
    label: "Assistência Social",
    icon: Users,
    children: [
      { id: "evolucao-social", label: "Evolução Social", icon: ClipboardList },
    ],
  },
  { id: "bloco-cirurgico", label: "Bloco Cirúrgico", icon: Scissors },
  { id: "hemodinamica", label: "Hemodinâmica", icon: Zap },
  {
    id: "documentos",
    label: "Documentos",
    icon: FileText,
    children: [
      { id: "termos", label: "Termos", icon: FileText },
      { id: "anexos", label: "Anexos", icon: Link2 },
      { id: "auditoria", label: "Auditoria", icon: Shield },
    ],
  },
];

interface ProntuarioSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  allergiesCount?: number;
  documentsCount?: number;
}

export function ProntuarioSidebar({
  activeSection,
  onSectionChange,
  allergiesCount,
  documentsCount,
}: ProntuarioSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["area-medica", "area-enfermagem"]);

  const toggleExpand = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((s) => s !== sectionId) : [...prev, sectionId]
    );
  };

  const handleClick = (section: SidebarSection) => {
    if (section.children) {
      toggleExpand(section.id);
      // Navigate to first child
      if (!expandedSections.includes(section.id)) {
        onSectionChange(section.children[0].id);
      }
    } else {
      onSectionChange(section.id);
    }
  };

  const getBadge = (id: string) => {
    if (id === "documentos" && documentsCount) return documentsCount;
    return undefined;
  };

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <nav className="pr-2 space-y-0.5">
        {sections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSections.includes(section.id);
          const isActive = activeSection === section.id;
          const hasActiveChild = section.children?.some((c) => c.id === activeSection);
          const badge = getBadge(section.id);

          return (
            <div key={section.id}>
              <button
                onClick={() => handleClick(section)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive || hasActiveChild
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left truncate">{section.label}</span>
                {badge && (
                  <Badge variant="destructive" className="text-[10px] h-5 min-w-5 px-1.5">
                    {badge}
                  </Badge>
                )}
                {section.children &&
                  (isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                  ))}
              </button>

              {section.children && isExpanded && (
                <div className="ml-4 pl-3 border-l border-border space-y-0.5 mt-0.5">
                  {section.children.map((child) => {
                    const ChildIcon = child.icon || FileText;
                    const isChildActive = activeSection === child.id;

                    return (
                      <button
                        key={child.id}
                        onClick={() => onSectionChange(child.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors",
                          isChildActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        <ChildIcon className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{child.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </ScrollArea>
  );
}
