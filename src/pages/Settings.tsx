import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Users, Shield, Building2, Bell, Palette, Database, Globe,
  UserCog, Lock, KeyRound, FileText, Settings2, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── sidebar nav config ── */
interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  section: "admin" | "users";
}

const sidebarNav: NavItem[] = [
  // Administração
  { id: "geral", label: "Geral", icon: Building2, section: "admin" },
  { id: "notificacoes", label: "Notificações", icon: Bell, section: "admin" },
  { id: "aparencia", label: "Aparência", icon: Palette, section: "admin" },
  { id: "integracao", label: "Integrações", icon: Database, section: "admin" },
  { id: "unidades", label: "Unidades / Filiais", icon: Globe, section: "admin" },
  { id: "auditoria", label: "Auditoria", icon: FileText, section: "admin" },
  { id: "sistema", label: "Sistema", icon: Settings2, section: "admin" },
  // Usuários
  { id: "usuarios", label: "Usuários", icon: Users, section: "users" },
  { id: "perfis", label: "Perfis de Acesso", icon: Shield, section: "users" },
  { id: "permissoes", label: "Permissões", icon: Lock, section: "users" },
  { id: "minha-conta", label: "Minha Conta", icon: UserCog, section: "users" },
  { id: "seguranca", label: "Segurança", icon: KeyRound, section: "users" },
];

const adminItems = sidebarNav.filter((n) => n.section === "admin");
const userItems = sidebarNav.filter((n) => n.section === "users");

/* ── content panels ── */
function GeneralPanel() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da Instituição</CardTitle>
          <CardDescription>Informações gerais do estabelecimento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Nome da Instituição</Label>
              <Input placeholder="Hospital / Clínica" className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">CNPJ</Label>
              <Input placeholder="00.000.000/0001-00" className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">CNES</Label>
              <Input placeholder="0000000" className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Telefone</Label>
              <Input placeholder="(00) 0000-0000" className="text-sm" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Endereço</Label>
            <Input placeholder="Endereço completo" className="text-sm" />
          </div>
          <Button size="sm">Salvar Alterações</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Preferências de Notificação</CardTitle>
        <CardDescription>Configure como e quando receber alertas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { label: "Alertas de prescrições pendentes", desc: "Notificar quando prescrições estiverem sem dispensação" },
          { label: "Laudos aguardando assinatura", desc: "Notificar laudos pendentes de liberação" },
          { label: "Alertas de leitos", desc: "Notificar mudanças de status de leitos" },
          { label: "Notificações por e-mail", desc: "Receber resumo diário por e-mail" },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Switch />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MyAccountPanel() {
  const { profile } = useAuth();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Minha Conta</CardTitle>
        <CardDescription>Seus dados de acesso e perfil</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome Completo</Label>
            <Input defaultValue={profile?.full_name || ""} className="text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Especialidade</Label>
            <Input defaultValue={profile?.specialty || ""} className="text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">CRM / COREN</Label>
            <Input defaultValue={profile?.crm_coren || ""} className="text-sm" />
          </div>
        </div>
        <Button size="sm">Salvar</Button>
      </CardContent>
    </Card>
  );
}

function PlaceholderPanel({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>Este módulo será implementado em breve.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          A configuração de <strong>{title.toLowerCase()}</strong> estará disponível nas próximas versões do sistema.
        </p>
      </CardContent>
    </Card>
  );
}

/* ── main component ── */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("geral");

  const renderContent = () => {
    switch (activeTab) {
      case "geral": return <GeneralPanel />;
      case "notificacoes": return <NotificationsPanel />;
      case "minha-conta": return <MyAccountPanel />;
      default: {
        const item = sidebarNav.find((n) => n.id === activeTab);
        return <PlaceholderPanel title={item?.label || activeTab} />;
      }
    }
  };

  const activeItem = sidebarNav.find((n) => n.id === activeTab);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5">
      <h1 className="text-lg font-semibold text-foreground mb-4">Configurações</h1>

      <div className="flex gap-6 min-h-[600px]">
        {/* Sidebar */}
        <aside className="w-56 shrink-0">
          <div className="sticky top-20 space-y-4">
            {/* Administração */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                Administração
              </p>
              <nav className="space-y-0.5">
                {adminItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-sm transition-colors text-left",
                      activeTab === item.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-[13px]">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <Separator />

            {/* Usuários */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                Usuários
              </p>
              <nav className="space-y-0.5">
                {userItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-sm transition-colors text-left",
                      activeTab === item.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-[13px]">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
