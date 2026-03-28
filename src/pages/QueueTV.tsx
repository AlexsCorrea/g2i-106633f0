import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueueTickets } from "@/hooks/useQueueTickets";
import { useUnitConfig, useUnitAds, formatPatientDisplay } from "@/hooks/useUnitConfig";
import { Volume2, MapPin, Clock } from "lucide-react";

export default function QueueTV() {
  const { data: config } = useUnitConfig();
  const { data: ads } = useUnitAds();
  const { data: calledTickets } = useQueueTickets({ queue_name: "recepcao", status: "chamada" });
  const { data: recentDone } = useQueueTickets({ queue_name: "recepcao", status: "concluida" });
  const { data: recentAbsent } = useQueueTickets({ queue_name: "recepcao", status: "ausente" });

  const [currentAdIdx, setCurrentAdIdx] = useState(0);
  const [showingAd, setShowingAd] = useState(false);
  const [lastCallTime, setLastCallTime] = useState<number>(0);
  const [flashCall, setFlashCall] = useState(false);
  const prevCalledRef = useRef<string | null>(null);

  const primaryColor = config?.primary_color || "#1e5a8a";
  const secondaryColor = config?.secondary_color || "#0f3460";
  const unitName = config?.unit_name || "OftalmoCenter";
  const privacyMode = config?.privacy_mode || "senha_iniciais";
  const callDisplaySec = config?.call_display_seconds || 15;
  const adsEnabled = config?.ads_enabled && ads && ads.length > 0;

  // Build recent history
  const recentHistory = [
    ...(recentDone || []),
    ...(recentAbsent || []),
  ]
    .filter((t) => t.called_at)
    .sort((a, b) => new Date(b.called_at!).getTime() - new Date(a.called_at!).getTime())
    .slice(0, 6);

  const currentCall = calledTickets?.[0] || null;

  // Detect new call
  useEffect(() => {
    if (currentCall && currentCall.id !== prevCalledRef.current) {
      prevCalledRef.current = currentCall.id;
      setShowingAd(false);
      setLastCallTime(Date.now());
      setFlashCall(true);
      // Play sound
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const playTone = (freq: number, delay: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = "sine";
          gain.gain.value = 0.6;
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + 0.4);
        };
        playTone(800, 0);
        playTone(1000, 0.5);
        playTone(800, 1.0);
      } catch {}
      setTimeout(() => setFlashCall(false), 3000);
    }
  }, [currentCall?.id]);

  // Timer: after call display time, show ads
  useEffect(() => {
    if (!currentCall && adsEnabled) {
      setShowingAd(true);
      return;
    }
    if (!currentCall) return;
    const timer = setTimeout(() => {
      if (adsEnabled) setShowingAd(true);
    }, callDisplaySec * 1000);
    return () => clearTimeout(timer);
  }, [currentCall, callDisplaySec, adsEnabled, lastCallTime]);

  // When a new call comes in while showing ad, interrupt
  useEffect(() => {
    if (currentCall && showingAd) {
      setShowingAd(false);
      setLastCallTime(Date.now());
    }
  }, [currentCall?.id]);

  // Rotate ads
  useEffect(() => {
    if (!showingAd || !ads?.length) return;
    const interval = (ads[currentAdIdx]?.duration_seconds || 10) * 1000;
    const timer = setTimeout(() => {
      setCurrentAdIdx((prev) => (prev + 1) % ads.length);
    }, interval);
    return () => clearTimeout(timer);
  }, [showingAd, currentAdIdx, ads]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("tv-panel")
      .on("postgres_changes", { event: "*", schema: "public", table: "queue_tickets" }, () => {})
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const displayName = (ticket: any) =>
    formatPatientDisplay(
      ticket.patients?.full_name,
      null,
      privacyMode,
      ticket.ticket_number,
    );

  const now = new Date();
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  // AD MODE
  if (showingAd && ads && ads.length > 0 && !currentCall) {
    const ad = ads[currentAdIdx];
    return (
      <div className="fixed inset-0 bg-black flex flex-col">
        {/* Top bar */}
        <div className="h-16 flex items-center justify-between px-8" style={{ background: primaryColor }}>
          <div className="flex items-center gap-3">
            {config?.logo_url && <img src={config.logo_url} alt="Logo" className="h-10 w-10 rounded-lg object-cover" />}
            <span className="text-white text-xl font-bold">{unitName}</span>
          </div>
          <span className="text-white/80 text-lg font-mono">{timeStr}</span>
        </div>
        {/* Media */}
        <div className="flex-1 flex items-center justify-center bg-black">
          {ad.media_type === "video" ? (
            <video src={ad.media_url} autoPlay muted loop className="max-h-full max-w-full object-contain" />
          ) : (
            <img src={ad.media_url} alt={ad.title} className="max-h-full max-w-full object-contain" />
          )}
        </div>
        {/* Bottom ticker with recent calls */}
        {recentHistory.length > 0 && (
          <div className="h-14 flex items-center gap-6 px-8 overflow-hidden" style={{ background: secondaryColor }}>
            <span className="text-white/60 text-sm font-medium flex-shrink-0">Últimas:</span>
            {recentHistory.slice(0, 5).map((t) => (
              <span key={t.id} className="text-white font-bold text-sm flex-shrink-0">
                {t.ticket_number} → {t.called_to || "—"}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // CALL MODE
  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
      {/* Top bar */}
      <div className="h-20 flex items-center justify-between px-10 bg-black/20">
        <div className="flex items-center gap-4">
          {config?.logo_url && <img src={config.logo_url} alt="Logo" className="h-12 w-12 rounded-xl object-cover" />}
          <span className="text-white text-2xl font-bold">{unitName}</span>
        </div>
        <div className="flex items-center gap-4 text-white/80">
          <Clock className="w-5 h-5" />
          <span className="text-xl font-mono">{timeStr}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Current call - large */}
        <div className="flex-1 flex items-center justify-center">
          {currentCall ? (
            <div className={`text-center space-y-6 ${flashCall ? "animate-pulse" : ""}`}>
              <div className="flex items-center justify-center gap-3 text-white/70 text-xl">
                <Volume2 className="w-7 h-7" />
                <span>SENHA CHAMADA</span>
              </div>
              <p className="text-white text-[8rem] leading-none font-black tracking-widest drop-shadow-2xl">
                {currentCall.ticket_number}
              </p>
              <p className="text-white/90 text-3xl font-medium">
                {displayName(currentCall)}
              </p>
              {currentCall.called_to && (
                <div className="flex items-center justify-center gap-3 text-white text-2xl">
                  <MapPin className="w-7 h-7" />
                  <span className="font-bold">{currentCall.called_to}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-white/40 text-4xl">Aguardando chamada...</p>
              <p className="text-white/20 text-xl">{unitName}</p>
            </div>
          )}
        </div>

        {/* Right sidebar - history */}
        <div className="w-80 bg-black/30 flex flex-col">
          <div className="px-6 py-4 border-b border-white/10">
            <h3 className="text-white/80 text-lg font-semibold">Últimas Chamadas</h3>
          </div>
          <div className="flex-1 overflow-auto">
            {recentHistory.length === 0 ? (
              <p className="text-white/30 text-center py-8 text-sm">Nenhuma chamada</p>
            ) : (
              <div className="divide-y divide-white/5">
                {recentHistory.map((t) => (
                  <div key={t.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold text-xl">{t.ticket_number}</p>
                      <p className="text-white/50 text-sm">{displayName(t)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/70 text-sm font-medium">{t.called_to || "—"}</p>
                      <p className="text-white/40 text-xs">
                        {t.called_at ? new Date(t.called_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="h-12 bg-black/30 flex items-center justify-center">
        <p className="text-white/30 text-sm">{unitName} • Painel de Chamadas</p>
      </div>
    </div>
  );
}
