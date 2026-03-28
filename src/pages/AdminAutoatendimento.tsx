import React, { useState, useRef } from "react";
import { useUnitConfig, useUpdateUnitConfig, useUnitAds, useManageAds, type UnitConfig } from "@/hooks/useUnitConfig";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Palette, Image, Tv, Monitor, Settings2, Upload, Trash2, GripVertical,
  ArrowLeft, Eye, Volume2, Clock, ShieldCheck, Megaphone
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminAutoatendimento() {
  const navigate = useNavigate();
  const { data: config, isLoading } = useUnitConfig();
  const updateConfig = useUpdateUnitConfig();
  const { data: ads } = useUnitAds();
  const { add: addAd, remove: removeAd } = useManageAds();

  // Local form state
  const [unitName, setUnitName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1e5a8a");
  const [secondaryColor, setSecondaryColor] = useState("#0f3460");
  const [privacyMode, setPrivacyMode] = useState("senha_iniciais");
  const [socialNamePolicy, setSocialNamePolicy] = useState("iniciais_social");
  const [callDisplaySeconds, setCallDisplaySeconds] = useState(15);
  const [adsEnabled, setAdsEnabled] = useState(false);
  const [adsInterval, setAdsInterval] = useState(10);
  const [initialized, setInitialized] = useState(false);

  // Ad upload
  const [adTitle, setAdTitle] = useState("");
  const [adDuration, setAdDuration] = useState(10);
  const adFileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Sync config to local state once loaded
  React.useEffect(() => {
    if (config && !initialized) {
      setUnitName(config.unit_name || "");
      setPrimaryColor(config.primary_color || "#1e5a8a");
      setSecondaryColor(config.secondary_color || "#0f3460");
      setPrivacyMode(config.privacy_mode || "senha_iniciais");
      setSocialNamePolicy(config.social_name_policy || "iniciais_social");
      setCallDisplaySeconds(config.call_display_seconds || 15);
      setAdsEnabled(config.ads_enabled || false);
      setAdsInterval(config.ads_interval_seconds || 10);
      setInitialized(true);
    }
  }, [config, initialized]);

  const handleSave = () => {
    if (!config?.id) return;
    updateConfig.mutate({
      id: config.id,
      unit_name: unitName,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      privacy_mode: privacyMode,
      social_name_policy: socialNamePolicy,
      call_display_seconds: callDisplaySeconds,
      ads_enabled: adsEnabled,
      ads_interval_seconds: adsInterval,
    });
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !config?.id) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, "exam-gallery", `unit-branding/logo-${Date.now()}.${file.name.split(".").pop()}`);
      updateConfig.mutate({ id: config.id, logo_url: url } as any);
      toast.success("Logo atualizada!");
    } catch (err: any) {
      toast.error("Erro ao enviar logo: " + err.message);
    }
    setUploading(false);
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !config?.id) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, "exam-gallery", `unit-branding/bg-${Date.now()}.${file.name.split(".").pop()}`);
      updateConfig.mutate({ id: config.id, background_image_url: url } as any);
      toast.success("Imagem de fundo atualizada!");
    } catch (err: any) {
      toast.error("Erro ao enviar imagem: " + err.message);
    }
    setUploading(false);
  };

  const handleAdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!adTitle.trim()) { toast.error("Informe o título do anúncio"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const mediaType = ["mp4", "webm", "mov"].includes(ext) ? "video" : "image";
      const url = await uploadFile(file, "exam-gallery", `unit-ads/ad-${Date.now()}.${ext}`);
      addAd.mutate({
        title: adTitle,
        media_type: mediaType,
        media_url: url,
        display_order: (ads?.length || 0) + 1,
        duration_seconds: adDuration,
        active: true,
        unit_config_id: config?.id || null,
      });
      setAdTitle("");
      toast.success("Anúncio adicionado!");
    } catch (err: any) {
      toast.error("Erro ao enviar mídia: " + err.message);
    }
    setUploading(false);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;

  const privacyOptions = [
    { value: "somente_senha", label: "Somente Senha", desc: "Exibe apenas o número da senha" },
    { value: "senha_iniciais", label: "Senha + Iniciais", desc: "Ex: P8004 — A.C.S." },
    { value: "senha_nome_social", label: "Senha + Nome Social Abreviado", desc: "Ex: P8004 — Ana C." },
    { value: "nome_completo", label: "Nome Completo", desc: "Exibe nome completo (menos privado)" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Settings2 className="w-6 h-6" />
                Configurações do Autoatendimento
              </h1>
              <p className="text-sm text-muted-foreground">Totem, Painel de Chamadas e Painel TV</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/painel-tv")}>
              <Eye className="w-4 h-4 mr-2" /> Visualizar TV
            </Button>
            <Button onClick={handleSave} disabled={updateConfig.isPending}>
              Salvar Configurações
            </Button>
          </div>
        </div>

        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="branding" className="gap-1"><Palette className="w-4 h-4" /> Identidade</TabsTrigger>
            <TabsTrigger value="privacy" className="gap-1"><ShieldCheck className="w-4 h-4" /> Privacidade</TabsTrigger>
            <TabsTrigger value="tv" className="gap-1"><Tv className="w-4 h-4" /> Painel TV</TabsTrigger>
            <TabsTrigger value="ads" className="gap-1"><Megaphone className="w-4 h-4" /> Anúncios</TabsTrigger>
            <TabsTrigger value="totem" className="gap-1"><Monitor className="w-4 h-4" /> Totem</TabsTrigger>
          </TabsList>

          {/* BRANDING TAB */}
          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Identidade Visual</CardTitle>
                <CardDescription>Logo, cores e nome da unidade aplicados no totem, portal mobile e painel TV</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Nome da Instituição</Label>
                      <Input value={unitName} onChange={e => setUnitName(e.target.value)} placeholder="Nome da unidade" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Cor Principal</Label>
                        <div className="flex gap-2 items-center">
                          <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded border cursor-pointer" />
                          <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="flex-1" />
                        </div>
                      </div>
                      <div>
                        <Label>Cor Secundária</Label>
                        <div className="flex gap-2 items-center">
                          <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-10 h-10 rounded border cursor-pointer" />
                          <Input value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="flex-1" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Logo da Unidade</Label>
                      <div className="flex items-center gap-4 mt-1">
                        {config?.logo_url && (
                          <img src={config.logo_url} alt="Logo" className="w-16 h-16 rounded-xl object-cover border" />
                        )}
                        <Button variant="outline" onClick={() => logoFileRef.current?.click()} disabled={uploading}>
                          <Upload className="w-4 h-4 mr-2" /> {config?.logo_url ? "Trocar Logo" : "Enviar Logo"}
                        </Button>
                        <input ref={logoFileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      </div>
                    </div>
                    <div>
                      <Label>Imagem de Fundo (opcional)</Label>
                      <div className="flex items-center gap-4 mt-1">
                        {config?.background_image_url && (
                          <img src={config.background_image_url} alt="BG" className="w-24 h-16 rounded-lg object-cover border" />
                        )}
                        <Button variant="outline" onClick={() => bgFileRef.current?.click()} disabled={uploading}>
                          <Image className="w-4 h-4 mr-2" /> {config?.background_image_url ? "Trocar" : "Enviar Imagem"}
                        </Button>
                        <input ref={bgFileRef} type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <Label className="mb-2 block">Pré-visualização</Label>
                  <div className="rounded-xl overflow-hidden border" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                    <div className="h-14 flex items-center px-6 gap-3 bg-black/20">
                      {config?.logo_url && <img src={config.logo_url} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />}
                      <span className="text-white font-bold text-lg">{unitName || "Nome da Unidade"}</span>
                    </div>
                    <div className="p-8 text-center">
                      <p className="text-white/60 text-sm">SENHA CHAMADA</p>
                      <p className="text-white text-5xl font-black tracking-widest my-2">P8004</p>
                      <p className="text-white/80">Guichê 1</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRIVACY TAB */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Política de Privacidade do Paciente</CardTitle>
                <CardDescription>Define como o paciente é identificado no painel público da TV e nas chamadas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Modo de Exibição no Painel TV</Label>
                  <div className="grid gap-3">
                    {privacyOptions.map(opt => (
                      <div
                        key={opt.value}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          privacyMode === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                        }`}
                        onClick={() => setPrivacyMode(opt.value)}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          privacyMode === opt.value ? "border-primary" : "border-muted-foreground"
                        }`}>
                          {privacyMode === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{opt.label}</p>
                          <p className="text-sm text-muted-foreground">{opt.desc}</p>
                        </div>
                        {opt.value === "senha_iniciais" && <Badge>Recomendado</Badge>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Política de Nome Social</Label>
                  <Select value={socialNamePolicy} onValueChange={setSocialNamePolicy}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iniciais_social">Usar iniciais do nome social</SelectItem>
                      <SelectItem value="nome_social_abreviado">Nome social abreviado</SelectItem>
                      <SelectItem value="somente_senha">Ignorar nome social (somente senha)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Quando o paciente possui nome social cadastrado, esta regra define como ele é exibido</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TV PANEL TAB */}
          <TabsContent value="tv" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Painel TV</CardTitle>
                <CardDescription>Comportamento da tela pública de chamadas em sala de espera</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Tempo de exibição da chamada (segundos)</Label>
                      <div className="flex items-center gap-4 mt-2">
                        <Slider
                          value={[callDisplaySeconds]}
                          onValueChange={v => setCallDisplaySeconds(v[0])}
                          min={5}
                          max={60}
                          step={5}
                          className="flex-1"
                        />
                        <span className="text-sm font-mono w-12 text-right">{callDisplaySeconds}s</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Após esse tempo, o painel volta ao modo ocioso ou exibe anúncios</p>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl border">
                      <div>
                        <p className="font-medium flex items-center gap-2"><Volume2 className="w-4 h-4" /> Som de chamada</p>
                        <p className="text-xs text-muted-foreground">Toca bipes ao chamar uma senha</p>
                      </div>
                      <Badge variant="outline">Ativo</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl border">
                      <div>
                        <p className="font-medium flex items-center gap-2"><Clock className="w-4 h-4" /> Relógio</p>
                        <p className="text-xs text-muted-foreground">Exibe relógio no canto superior</p>
                      </div>
                      <Badge variant="outline">Ativo</Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border bg-muted/30">
                      <p className="font-medium mb-2">Composição da chamada</p>
                      <p className="text-sm text-muted-foreground mb-3">Ao chamar um paciente, o painel TV exibirá:</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2"><Badge className="w-2 h-2 p-0 rounded-full" /> Número da senha em destaque</li>
                        <li className="flex items-center gap-2"><Badge className="w-2 h-2 p-0 rounded-full" /> Identificação conforme política de privacidade</li>
                        <li className="flex items-center gap-2"><Badge className="w-2 h-2 p-0 rounded-full" /> Local de atendimento (guichê, sala, setor)</li>
                        <li className="flex items-center gap-2"><Badge className="w-2 h-2 p-0 rounded-full" /> Texto de orientação para o paciente</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl border bg-muted/30">
                      <p className="font-medium mb-2">Exemplo de chamada</p>
                      <div className="rounded-lg p-4 text-center" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                        <p className="text-white/60 text-xs">SENHA CHAMADA</p>
                        <p className="text-white text-3xl font-black my-1">P8004</p>
                        <p className="text-white/80 text-sm">
                          {privacyMode === "somente_senha" && ""}
                          {privacyMode === "senha_iniciais" && "A.C.S."}
                          {privacyMode === "senha_nome_social" && "Ana C."}
                          {privacyMode === "nome_completo" && "Ana Clara Silva"}
                        </p>
                        <p className="text-white text-sm mt-1">📍 Guichê 1</p>
                        <p className="text-white/60 text-xs mt-2 italic">Dirija-se ao Guichê 1</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ADS TAB */}
          <TabsContent value="ads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Anúncios do Painel TV</CardTitle>
                <CardDescription>Mídia exibida quando o painel está ocioso (sem chamadas ativas)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl border">
                  <div>
                    <p className="font-medium">Ativar anúncios</p>
                    <p className="text-xs text-muted-foreground">Quando ativado, exibe mídia entre as chamadas</p>
                  </div>
                  <Switch checked={adsEnabled} onCheckedChange={setAdsEnabled} />
                </div>

                {adsEnabled && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Título do anúncio</Label>
                        <Input value={adTitle} onChange={e => setAdTitle(e.target.value)} placeholder="Ex: Campanha de Vacinação" />
                      </div>
                      <div>
                        <Label>Duração (segundos)</Label>
                        <Input type="number" value={adDuration} onChange={e => setAdDuration(Number(e.target.value))} min={3} max={120} />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={() => adFileRef.current?.click()} disabled={uploading} className="w-full">
                          <Upload className="w-4 h-4 mr-2" /> Enviar Mídia
                        </Button>
                        <input ref={adFileRef} type="file" accept="image/*,video/mp4,video/webm,image/gif" className="hidden" onChange={handleAdUpload} />
                      </div>
                    </div>

                    {/* Ad list */}
                    <div className="space-y-3">
                      <Label>Anúncios cadastrados</Label>
                      {(!ads || ads.length === 0) ? (
                        <p className="text-sm text-muted-foreground text-center py-6 border rounded-xl border-dashed">
                          Nenhum anúncio cadastrado
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {ads.map((ad, idx) => (
                            <div key={ad.id} className="flex items-center gap-4 p-3 rounded-xl border bg-card">
                              <GripVertical className="w-4 h-4 text-muted-foreground" />
                              <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                {ad.media_type === "video" ? (
                                  <video src={ad.media_url} className="w-full h-full object-cover" />
                                ) : (
                                  <img src={ad.media_url} alt={ad.title} className="w-full h-full object-cover" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{ad.title}</p>
                                <p className="text-xs text-muted-foreground">{ad.media_type} • {ad.duration_seconds}s</p>
                              </div>
                              <Badge variant="outline">#{idx + 1}</Badge>
                              <Button size="icon" variant="ghost" onClick={() => removeAd.mutate(ad.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TOTEM TAB */}
          <TabsContent value="totem" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Totem</CardTitle>
                <CardDescription>Parâmetros de funcionamento do autoatendimento e check-in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border">
                      <p className="font-medium mb-2">Tela Inicial do Totem</p>
                      <p className="text-sm text-muted-foreground mb-3">Botões exibidos ao paciente na tela inicial</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2"><Badge variant="outline">1</Badge> Retirar Senha</li>
                        <li className="flex items-center gap-2"><Badge variant="outline">2</Badge> Check-in de Consulta</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl border">
                      <p className="font-medium mb-2">Tipos de Senha</p>
                      <p className="text-sm text-muted-foreground mb-3">Senhas disponíveis para emissão</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge>Normal</Badge>
                        <Badge>Preferencial</Badge>
                        <Badge>60+</Badge>
                        <Badge>80+</Badge>
                        <Badge>Consulta</Badge>
                        <Badge>Retorno Pós-op</Badge>
                        <Badge>Exames</Badge>
                        <Badge>Financeiro</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border">
                      <p className="font-medium mb-2">Timeout de Inatividade</p>
                      <p className="text-sm text-muted-foreground">O totem retorna à tela inicial após 60 segundos de inatividade</p>
                    </div>
                    <div className="p-4 rounded-xl border">
                      <p className="font-medium mb-2">Check-in</p>
                      <p className="text-sm text-muted-foreground mb-2">Identificação por CPF + Data de Nascimento</p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Busca agendamentos do dia</li>
                        <li>• Confirma presença automaticamente</li>
                        <li>• Gera senha vinculada à consulta</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl border">
                      <p className="font-medium mb-2">QR Code</p>
                      <p className="text-sm text-muted-foreground">Na tela de resultado, é exibido QR Code para o portal mobile onde o paciente acompanha a fila</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
