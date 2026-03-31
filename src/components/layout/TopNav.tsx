import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Heart, LogOut, User, ChevronDown,
  DoorOpen, Calendar, Users, ClipboardList, Microscope,
  BarChart3, Stethoscope, Handshake, Bell, Search,
  CalendarDays, Scissors, Printer, Settings2,
  UserPlus, Tag, FolderArchive, RotateCcw,
  FileText, Receipt, Scale, BedDouble, ShieldCheck,
  FlaskConical, FileBarChart, Pill, Package, Utensils,
  Wallet, TrendingUp, CreditCard, Activity,
  Home as HomeIcon, Siren, HeartPulse, Beaker,
  ShieldAlert, Truck, ListChecks, Radiation,
  KeyRound, MonitorSmartphone
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  items?: { label: string; icon: React.ElementType; path: string; description?: string }[];
}

const menuConfig: MenuItem[] = [
  {
    label: "Salas",
    icon: DoorOpen,
    items: [
      { label: "Sala de Espera", icon: DoorOpen, path: "/salas/espera", description: "Pacientes aguardando atendimento" },
      { label: "Sala de Procedimentos", icon: Stethoscope, path: "/salas/procedimentos", description: "Exames e procedimentos em execução" },
    ],
  },
  {
    label: "Agenda",
    icon: Calendar,
    items: [
      { label: "Calendário", icon: CalendarDays, path: "/agenda", description: "Agenda geral e por profissional" },
      { label: "Centro Cirúrgico", icon: Scissors, path: "/agenda/centro-cirurgico", description: "Mapa e programação cirúrgica" },
      { label: "Imprimir Agenda", icon: Printer, path: "/agenda/imprimir", description: "Impressão por profissional ou setor" },
      { label: "Gestão de Agendas", icon: Settings2, path: "/agenda/admin", description: "Parametrização e cadastro de agendas" },
    ],
  },
  {
    label: "Pacientes",
    icon: Users,
    items: [
      { label: "Pacientes", icon: Users, path: "/patients", description: "Listagem e busca de pacientes" },
      { label: "Cadastrar Paciente", icon: UserPlus, path: "/patients?new=1", description: "Novo cadastro de paciente" },
      { label: "Gerenciar Retornos", icon: RotateCcw, path: "/pacientes/retornos", description: "Controle de retornos pendentes" },
      { label: "Tags", icon: Tag, path: "/pacientes/tags", description: "Categorização de pacientes" },
      { label: "SAME", icon: FolderArchive, path: "/pacientes/same", description: "Prontuário documental e anexos" },
    ],
  },
  {
    label: "Atendimentos",
    icon: ClipboardList,
    items: [
      { label: "Abertura de Atendimento", icon: ClipboardList, path: "/atendimentos/abertura", description: "Abertura de ficha e registro de chegada" },
      { label: "Orçamento", icon: Receipt, path: "/atendimentos/orcamento", description: "Orçamentos de procedimentos" },
      { label: "Nota Fiscal", icon: FileText, path: "/atendimentos/nf", description: "Solicitação e emissão de NF" },
      { label: "Relatórios", icon: FileBarChart, path: "/atendimentos/relatorios", description: "Relatórios administrativos" },
      { label: "Escalas", icon: Scale, path: "/atendimentos/escalas", description: "Escalas de plantão e operacionais" },
      { label: "Leitos", icon: BedDouble, path: "/atendimentos/leitos", description: "Mapa e gestão de leitos" },
      { label: "Portaria", icon: ShieldCheck, path: "/atendimentos/portaria", description: "Acompanhantes e visitantes" },
    ],
  },
  {
    label: "Diagnóstico",
    icon: Microscope,
    items: [
      { label: "Laudos", icon: FileText, path: "/diagnostico/laudos", description: "Digitação e liberação de laudos" },
      { label: "Fila de Exames", icon: ListChecks, path: "/diagnostico/fila", description: "Exames pendentes e em execução" },
      { label: "Gerar Etiquetas", icon: Tag, path: "/diagnostico/etiquetas", description: "Etiquetas de materiais e exames" },
    ],
  },
  {
    label: "Gerenciamento",
    icon: BarChart3,
    items: [
      { label: "Financeiro", icon: Wallet, path: "/gerenciamento/financeiro", description: "Contas, fluxo de caixa e conciliação" },
      { label: "Indicadores", icon: TrendingUp, path: "/dashboards", description: "Dashboards e indicadores gerenciais" },
      { label: "Faturamento", icon: CreditCard, path: "/gerenciamento/faturamento", description: "Convênio, SUS e particular" },
      { label: "Produtividade", icon: Activity, path: "/gerenciamento/produtividade", description: "Repasses e produtividade" },
      { label: "Farmácia", icon: Pill, path: "/gerenciamento/estoque/farmacia", description: "Estoque de medicamentos" },
      { label: "Almoxarifado", icon: Package, path: "/gerenciamento/estoque/almoxarifado", description: "Materiais e insumos" },
      { label: "Laboratório", icon: Beaker, path: "/gerenciamento/estoque/laboratorio", description: "Insumos laboratoriais" },
      { label: "Nutrição", icon: Utensils, path: "/gerenciamento/estoque/nutricao", description: "Dietas e insumos nutricionais" },
      { label: "CME", icon: FlaskConical, path: "/cme", description: "Material esterilizado" },
      { label: "Fechamento de Caixa", icon: Receipt, path: "/gerenciamento/caixa", description: "Conferência e fechamento diário" },
    ],
  },
  {
    label: "Assistencial",
    icon: HeartPulse,
    items: [
      { label: "Home Care", icon: HomeIcon, path: "/assistencial/homecare", description: "Pacientes admitidos em domicílio" },
      { label: "Internados", icon: BedDouble, path: "/assistencial/internados", description: "Pacientes internados" },
      { label: "UTI", icon: HeartPulse, path: "/assistencial/uti", description: "Unidade de Terapia Intensiva" },
      { label: "Pronto Atendimento", icon: Siren, path: "/assistencial/pa", description: "Atendimento emergencial" },
      { label: "Enfermagem", icon: Activity, path: "/assistencial/enfermagem", description: "Evolução, checagem e cuidados" },
      { label: "Laboratório", icon: FlaskConical, path: "/assistencial/laboratorio", description: "Solicitações e resultados" },
      { label: "SCIH", icon: ShieldAlert, path: "/assistencial/scih", description: "Controle de infecção hospitalar" },
      { label: "Farmácia", icon: Pill, path: "/assistencial/farmacia", description: "Dispensação e atendimento à prescrição" },
      { label: "Procedimentos", icon: Stethoscope, path: "/assistencial/procedimentos", description: "Execução de procedimentos" },
      { label: "Nutrição", icon: Utensils, path: "/assistencial/nutricao", description: "Dietas e acompanhamento" },
      { label: "CME / Expurgo", icon: FlaskConical, path: "/cme", description: "Esterilização e rastreabilidade" },
      { label: "Triagem", icon: ListChecks, path: "/assistencial/triagem", description: "Classificação de risco" },
      { label: "Oncologia", icon: Radiation, path: "/assistencial/oncologia", description: "Prescrições e autorizações" },
    ],
  },
  {
    label: "CRM",
    icon: Handshake,
    items: [
      { label: "Solicitações", icon: FileText, path: "/crm/solicitacoes", description: "Solicitações de exames e serviços" },
      { label: "Negociação", icon: Handshake, path: "/crm/negociacao", description: "Acompanhamento comercial" },
      { label: "Relacionamento", icon: Users, path: "/crm/relacionamento", description: "CRM e contatos" },
    ],
  },
];

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const handleEnter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };
  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 200);
  };

  useEffect(() => {
    setOpenMenu(null);
  }, [location.pathname]);

  if (!user) return null;

  const roleName = profile?.role
    ? profile.role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Profissional";

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-md shadow-sm">
      <div className="max-w-[1800px] mx-auto flex items-center h-14 px-4 gap-1">
        {/* Brand */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mr-4 shrink-0 hover:opacity-80 transition-opacity"
        >
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Heart className="h-4 w-4 text-primary" />
          </div>
          <span className="font-bold text-sm text-foreground hidden lg:inline">Solaris HIS</span>
        </button>

        {/* Menu items */}
        <nav ref={navRef} className="flex items-center gap-0.5 overflow-x-auto flex-1">
          {menuConfig.map((menu) => (
            <div
              key={menu.label}
              className="relative"
              onMouseEnter={() => handleEnter(menu.label)}
              onMouseLeave={handleLeave}
            >
              <button
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                  openMenu === menu.label
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <menu.icon className="h-4 w-4" />
                <span className="hidden xl:inline">{menu.label}</span>
                <ChevronDown className={cn("h-3 w-3 transition-transform", openMenu === menu.label && "rotate-180")} />
              </button>

              {/* Dropdown */}
              {openMenu === menu.label && menu.items && (
                <div
                  className="absolute top-full left-0 mt-1 w-72 bg-popover border rounded-lg shadow-lg py-1.5 animate-fade-in z-50"
                  onMouseEnter={() => handleEnter(menu.label)}
                  onMouseLeave={handleLeave}
                >
                  {menu.items.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={cn(
                        "w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/50",
                        location.pathname === item.path && "bg-primary/5 text-primary"
                      )}
                    >
                      <item.icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground">{item.label}</div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-2 shrink-0">
          <button
            onClick={() => navigate("/patients")}
            className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            title="Buscar paciente"
          >
            <Search className="h-4 w-4" />
          </button>
          <button className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors relative" title="Notificações">
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
