import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Heart, LogOut, User, ChevronDown, ChevronRight, DoorOpen, Calendar, Users,
  ClipboardList, Microscope, BarChart3, Stethoscope, Handshake, Bell, Search,
  CalendarDays, Scissors, Printer, Settings2, UserPlus, Tag, FolderArchive,
  RotateCcw, FileText, Receipt, Scale, BedDouble, ShieldCheck, FlaskConical,
  FileBarChart, Pill, Package, Utensils, Wallet, TrendingUp, CreditCard,
  Activity, Home as HomeIcon, Siren, HeartPulse, Beaker, ShieldAlert,
  ListChecks, Radiation, MonitorSmartphone, Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── types ── */
interface SubItem {
  label: string;
  icon: React.ElementType;
  path: string;
  desc?: string;
}
interface MenuGroup {
  heading?: string;
  items: SubItem[];
}
interface MenuItem {
  label: string;
  icon: React.ElementType;
  groups: MenuGroup[];
  wide?: boolean;         // wide mega-menu (2-col)
  columns?: 2 | 3;       // how many columns
}

/* ── menu config ── */
const menuConfig: MenuItem[] = [
  {
    label: "Salas",
    icon: DoorOpen,
    groups: [
      {
        items: [
          { label: "Sala de Espera", icon: DoorOpen, path: "/salas/espera", desc: "Pacientes aguardando atendimento" },
          { label: "Sala de Procedimentos", icon: Stethoscope, path: "/salas/procedimentos", desc: "Exames e procedimentos em execução" },
        ],
      },
    ],
  },
  {
    label: "Agenda",
    icon: Calendar,
    groups: [
      {
        heading: "Operacional",
        items: [
          { label: "Calendário", icon: CalendarDays, path: "/agenda", desc: "Agenda geral e por profissional" },
          { label: "Centro Cirúrgico", icon: Scissors, path: "/agenda/centro-cirurgico", desc: "Mapa e programação cirúrgica" },
          { label: "Imprimir Agenda", icon: Printer, path: "/agenda/imprimir", desc: "Impressão por profissional ou setor" },
        ],
      },
      {
        heading: "Administração",
        items: [
          { label: "Gestão de Agendas", icon: Settings2, path: "/agenda/admin", desc: "Parametrização, bloqueios e períodos" },
        ],
      },
    ],
  },
  {
    label: "Pacientes",
    icon: Users,
    groups: [
      {
        heading: "Cadastro",
        items: [
          { label: "Pacientes", icon: Users, path: "/patients", desc: "Listagem e busca" },
          { label: "Cadastrar Paciente", icon: UserPlus, path: "/patients?new=1", desc: "Novo cadastro completo" },
        ],
      },
      {
        heading: "Gestão",
        items: [
          { label: "Gerenciar Retornos", icon: RotateCcw, path: "/pacientes/retornos", desc: "Retornos pendentes e reagendamentos" },
          { label: "Tags", icon: Tag, path: "/pacientes/tags", desc: "Categorização e classificação" },
          { label: "SAME", icon: FolderArchive, path: "/pacientes/same", desc: "Prontuário documental e anexos" },
        ],
      },
    ],
  },
  {
    label: "Atendimentos",
    icon: ClipboardList,
    wide: true,
    columns: 2,
    groups: [
      {
        heading: "Recepção",
        items: [
          { label: "Abertura de Atendimento", icon: ClipboardList, path: "/atendimentos/abertura", desc: "Ficha e registro de chegada" },
          { label: "Orçamento", icon: Receipt, path: "/atendimentos/orcamento", desc: "Orçamentos de procedimentos" },
          { label: "Nota Fiscal", icon: FileText, path: "/atendimentos/nf", desc: "Solicitação e emissão de NF" },
        ],
      },
      {
        heading: "Operacional",
        items: [
          { label: "Leitos", icon: BedDouble, path: "/atendimentos/leitos", desc: "Mapa e gestão de leitos" },
          { label: "Escalas", icon: Scale, path: "/atendimentos/escalas", desc: "Plantão e escalas operacionais" },
          { label: "Portaria", icon: ShieldCheck, path: "/atendimentos/portaria", desc: "Acompanhantes e visitantes" },
          { label: "Relatórios", icon: FileBarChart, path: "/atendimentos/relatorios", desc: "Relatórios administrativos" },
        ],
      },
    ],
  },
  {
    label: "Diagnóstico",
    icon: Microscope,
    groups: [
      {
        items: [
          { label: "Laudos", icon: FileText, path: "/diagnostico/laudos", desc: "Digitação e liberação de laudos" },
          { label: "Fila de Exames", icon: ListChecks, path: "/diagnostico/fila", desc: "Exames pendentes e em execução" },
          { label: "Gerar Etiquetas", icon: Tag, path: "/diagnostico/etiquetas", desc: "Etiquetas de materiais e exames" },
        ],
      },
    ],
  },
  {
    label: "Gerenciamento",
    icon: BarChart3,
    wide: true,
    columns: 3,
    groups: [
      {
        heading: "Financeiro",
        items: [
          { label: "Financeiro", icon: Wallet, path: "/gerenciamento/financeiro", desc: "Contas, fluxo de caixa e conciliação" },
          { label: "Faturamento", icon: CreditCard, path: "/gerenciamento/faturamento", desc: "Convênio, SUS e particular" },
          { label: "Fechamento de Caixa", icon: Receipt, path: "/gerenciamento/caixa", desc: "Conferência e fechamento diário" },
        ],
      },
      {
        heading: "Indicadores",
        items: [
          { label: "Dashboards", icon: TrendingUp, path: "/dashboards", desc: "Indicadores gerenciais e operacionais" },
          { label: "Produtividade", icon: Activity, path: "/gerenciamento/produtividade", desc: "Repasses e produtividade" },
        ],
      },
      {
        heading: "Estoque",
        items: [
          { label: "Farmácia", icon: Pill, path: "/gerenciamento/estoque/farmacia", desc: "Medicamentos e controlados" },
          { label: "Almoxarifado", icon: Package, path: "/gerenciamento/estoque/almoxarifado", desc: "Materiais e insumos" },
          { label: "Laboratório", icon: Beaker, path: "/gerenciamento/estoque/laboratorio", desc: "Insumos laboratoriais" },
          { label: "Nutrição", icon: Utensils, path: "/gerenciamento/estoque/nutricao", desc: "Dietas e insumos nutricionais" },
          { label: "CME", icon: FlaskConical, path: "/cme", desc: "Material esterilizado" },
        ],
      },
    ],
  },
  {
    label: "Assistencial",
    icon: HeartPulse,
    wide: true,
    columns: 3,
    groups: [
      {
        heading: "Pacientes Admitidos",
        items: [
          { label: "Home Care", icon: HomeIcon, path: "/assistencial/homecare", desc: "Pacientes em domicílio" },
          { label: "Internados", icon: BedDouble, path: "/assistencial/internados", desc: "Pacientes internados" },
          { label: "UTI", icon: HeartPulse, path: "/assistencial/uti", desc: "Terapia Intensiva" },
          { label: "Pronto Atendimento", icon: Siren, path: "/assistencial/pa", desc: "Emergência e urgência" },
        ],
      },
      {
        heading: "Setores Executores",
        items: [
          { label: "Enfermagem", icon: Activity, path: "/assistencial/enfermagem", desc: "Evolução, checagem e cuidados" },
          { label: "Farmácia", icon: Pill, path: "/assistencial/farmacia", desc: "Atender prescrição" },
          { label: "Procedimentos", icon: Stethoscope, path: "/assistencial/procedimentos", desc: "Atender prescrição" },
          { label: "Nutrição", icon: Utensils, path: "/assistencial/nutricao", desc: "Atender prescrição" },
          { label: "CME / Expurgo", icon: FlaskConical, path: "/cme", desc: "Esterilização e rastreabilidade" },
        ],
      },
      {
        heading: "Especializado",
        items: [
          { label: "Laboratório", icon: FlaskConical, path: "/assistencial/laboratorio", desc: "Solicitações e resultados" },
          { label: "SCIH", icon: ShieldAlert, path: "/assistencial/scih", desc: "Controle de infecção" },
          { label: "Triagem", icon: ListChecks, path: "/assistencial/triagem", desc: "Classificação de risco" },
          { label: "Oncologia", icon: Radiation, path: "/assistencial/oncologia", desc: "Prescrições e autorizações" },
        ],
      },
    ],
  },
  {
    label: "CRM",
    icon: Handshake,
    groups: [
      {
        items: [
          { label: "Solicitações", icon: FileText, path: "/crm/solicitacoes", desc: "Solicitações de exames e serviços" },
          { label: "Negociação", icon: Handshake, path: "/crm/negociacao", desc: "Acompanhamento comercial" },
          { label: "Relacionamento", icon: Users, path: "/crm/relacionamento", desc: "CRM e contatos" },
        ],
      },
    ],
  },
];

/* ── component ── */
export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };
  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 180);
  };

  useEffect(() => { setOpenMenu(null); }, [location.pathname]);

  if (!user) return null;

  const roleName = profile?.role
    ? profile.role.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
    : "Profissional";

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-md shadow-sm">
      <div className="max-w-[1920px] mx-auto flex items-center h-14 px-4 gap-0.5">
        {/* Brand */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mr-3 shrink-0 hover:opacity-80 transition-opacity"
        >
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Heart className="h-4 w-4 text-primary" />
          </div>
          <span className="font-bold text-sm text-foreground hidden lg:inline">Zurich</span>
        </button>

        {/* Menu items */}
        <nav className="flex items-center gap-0 overflow-x-auto flex-1">
          {menuConfig.map((menu) => {
            const isOpen = openMenu === menu.label;
            const cols = menu.columns ?? 1;
            const dropW = cols === 3 ? "w-[680px]" : cols === 2 ? "w-[520px]" : "w-[290px]";

            return (
              <div
                key={menu.label}
                className="relative"
                onMouseEnter={() => handleEnter(menu.label)}
                onMouseLeave={handleLeave}
              >
                <button
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors whitespace-nowrap",
                    isOpen
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <menu.icon className="h-4 w-4" />
                  <span className="hidden xl:inline">{menu.label}</span>
                  <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
                </button>

                {/* Dropdown */}
                {isOpen && (
                  <div
                    className={cn(
                      "absolute top-full left-0 mt-1 bg-popover border rounded-xl shadow-xl py-2 animate-fade-in z-50",
                      dropW,
                    )}
                    onMouseEnter={() => handleEnter(menu.label)}
                    onMouseLeave={handleLeave}
                  >
                    <div className={cn(
                      cols > 1 && "grid gap-0",
                      cols === 2 && "grid-cols-2",
                      cols === 3 && "grid-cols-3",
                    )}>
                      {menu.groups.map((group, gi) => (
                        <div
                          key={gi}
                          className={cn(
                            "px-1",
                            cols > 1 && gi > 0 && "border-l border-border",
                          )}
                        >
                          {group.heading && (
                            <div className="px-3 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                              {group.heading}
                            </div>
                          )}
                          {group.items.map((item) => (
                            <button
                              key={item.path + item.label}
                              onClick={() => navigate(item.path)}
                              className={cn(
                                "w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition-colors hover:bg-muted/60",
                                location.pathname === item.path && "bg-primary/5 text-primary",
                              )}
                            >
                              <item.icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                              <div className="min-w-0">
                                <div className="text-[13px] font-medium text-foreground leading-tight">{item.label}</div>
                                {item.desc && (
                                  <div className="text-[11px] text-muted-foreground leading-snug mt-0.5 truncate">{item.desc}</div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          <button
            onClick={() => navigate("/patients")}
            className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            title="Buscar paciente"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors relative"
            title="Notificações"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          </button>

          {/* User menu */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors">
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-medium text-foreground leading-tight">
                  {profile?.full_name || user.email?.split("@")[0]}
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight">{roleName}</div>
              </div>
            </button>
            <div className="absolute top-full right-0 mt-1 w-48 bg-popover border rounded-lg shadow-lg py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
