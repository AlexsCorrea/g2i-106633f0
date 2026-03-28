import React, { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueueTickets } from "@/hooks/useQueueTickets";
import {
  useUnitConfig, useUnitAds, formatPatientDisplay,
  getPatientNameForSpeech, ticketToSpeech, priorityToSpeech,
} from "@/hooks/useUnitConfig";
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
  const [pulseScale, setPulseScale] = useState(false);
  const prevCalledRef = useRef<string | null>(null);

  const primaryColor = config?.primary_color || "#1e5a8a";
  const secondaryColor = config?.secondary_color || "#0f3460";
  const unitName = config?.unit_name || "OftalmoCenter";
  const privacyMode = config?.privacy_mode || "senha_iniciais";
  const callDisplaySec = config?.call_display_seconds || 15;
  const adsEnabled = config?.ads_enabled && ads && ads.length > 0;
  const adsIdleSec = config?.ads_idle_seconds || 20;
  const showClock = config?.show_clock !== false;
  const showHistory = config?.show_history !== false;
  const soundEnabled = config?.sound_enabled !== false;
  const locutionEnabled = config?.locution_enabled !== false;
  const speakPriority = config?.locution_speak_priority !== false;
  const speakLocation = config?.locution_speak_location === true;

  // Build recent history
  const recentHistory = [
    ...(recentDone || []),
    ...(recentAbsent || []),
  ]
    .filter((t) => t.called_at)
    .sort((a, b) => new Date(b.called_at!).getTime() - new Date(a.called_at!).getTime())
    .slice(0, 6);

  const currentCall = calledTickets?.[0] || null;

  // Speech synthesis
  const speak = useCallback((text: string) => {
    if (!locutionEnabled) return;
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      synth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "pt-BR";
      utter.rate = 0.85;
      utter.pitch = 1;
      utter.volume = 1;
      // Try to find a PT-BR voice
      const voices = synth.getVoices();
      const ptVoice = voices.find(v => v.lang.startsWith("pt"));
      if (ptVoice) utter.voice = ptVoice;
      synth.speak(utter);
    } catch {}
  }, [locutionEnabled]);

  const playTones = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, delay: number, dur = 0.3) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.5, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + dur);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + dur + 0.05);
      };
      playTone(880, 0, 0.25);
      playTone(1100, 0.35, 0.25);
      playTone(880, 0.7, 0.35);
    } catch {}
  }, [soundEnabled]);

  const buildSpeechText = useCallback((ticket: any) => {
    const parts: string[] = [];
    parts.push(`Senha ${ticketToSpeech(ticket.ticket_number)}`);

    // Patient identification (only if patient_id exists = identified)
    if (ticket.patient_id && ticket.patients?.full_name) {
      const namePart = getPatientNameForSpeech(
        ticket.patients.full_name,
        ticket.patients.nome_social || null,
        privacyMode
      );
      if (namePart) parts.push(namePart);
    }

    if (speakPriority) {
      parts.push(`prioridade ${priorityToSpeech(ticket.ticket_type)}`);
    }

    if (speakLocation && ticket.called_to) {
      parts.push(ticket.called_to);
    }

    return parts.join(", ");
  }, [privacyMode, speakPriority, speakLocation]);

  // Detect new call
  useEffect(() => {
    if (currentCall && currentCall.id !== prevCalledRef.current) {
      prevCalledRef.current = currentCall.id;
      setShowingAd(false);
      setLastCallTime(Date.now());
      setFlashCall(true);
      setPulseScale(true);

      // Play sound then speak
      playTones();
      setTimeout(() => {
        speak(buildSpeechText(currentCall));
      }, 1200);

      setTimeout(() => setFlashCall(false), 3000);
      setTimeout(() => setPulseScale(false), 1500);
    }
  }, [currentCall?.id, playTones, speak, buildSpeechText]);

  // Timer: after call display + idle time, show ads
  useEffect(() => {
    if (!currentCall && adsEnabled) {
      const timer = setTimeout(() => setShowingAd(true), adsIdleSec * 1000);
      return () => clearTimeout(timer);
    }
    if (!currentCall) return;
    const timer = setTimeout(() => {
      if (adsEnabled) setShowingAd(true);
    }, callDisplaySec * 1000);
    return () => clearTimeout(timer);
  }, [currentCall, callDisplaySec, adsEnabled, lastCallTime, adsIdleSec]);

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

  // Load voices on mount
  useEffect(() => {
    window.speechSynthesis?.getVoices();
  }, []);

  const displayName = (ticket: any) => {
    if (!ticket.patient_id || !ticket.patients?.full_name) {
      return ticket.ticket_number;
    }
    return formatPatientDisplay(
      ticket.patients?.full_name,
      ticket.patients?.nome_social || null,
      privacyMode,
      ticket.ticket_number,
    );
  };

  const displayNameOnly = (ticket: any) => {
    if (!ticket.patient_id || !ticket.patients?.full_name) return null;
    if (privacyMode === "somente_senha") return null;
    return formatPatientDisplay(
      ticket.patients?.full_name,
      ticket.patients?.nome_social || null,
      privacyMode,
      "",
    ).replace(/^\s*—\s*/, "").trim();
  };

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  // AD MODE
  if (showingAd && ads && ads.length > 0 && !currentCall) {
    const ad = ads[currentAdIdx];
    return (
      <div className="fixed inset-0 bg-black flex flex-col">
        <div className="h-16 flex items-center justify-between px-8" style={{ background: primaryColor }}>
          <div className="flex items-center gap-3">
            {config?.logo_url && <img src={config.logo_url} alt="Logo" className="h-10 w-10 rounded-lg object-cover" />}
            <span className="text-white text-xl font-bold">{unitName}</span>
          </div>
          {showClock && <span className="text-white/80 text-lg font-mono">{timeStr}</span>}
        </div>
        <div className="flex-1 flex items-center justify-center bg-black">
          {ad.media_type === "video" ? (
            <video src={ad.media_url} autoPlay muted loop className="max-h-full max-w-full object-contain" />
          ) : (
            <img src={ad.media_url} alt={ad.title} className="max-h-full max-w-full object-contain" />
          )}
        </div>
        {showHistory && recentHistory.length > 0 && (
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
        {showClock && (
          <div className="flex items-center gap-4 text-white/80">
            <Clock className="w-5 h-5" />
            <span className="text-xl font-mono">{timeStr}</span>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Current call - large */}
        <div className="flex-1 flex items-center justify-center">
          {currentCall ? (
            <div
              className="text-center space-y-6"
              style={{
                animation: flashCall
                  ? "tvCallFlash 0.6s ease-in-out 3"
                  : pulseScale
                  ? "tvCallZoom 0.8s ease-out"
                  : "none",
              }}
            >
              <div className="flex items-center justify-center gap-3 text-white/70 text-xl">
                <Volume2 className="w-7 h-7" />
                <span>SENHA CHAMADA</span>
              </div>
              <p
                className="text-white leading-none font-black tracking-widest drop-shadow-2xl"
                style={{ fontSize: "clamp(5rem, 12vw, 10rem)" }}
              >
                {currentCall.ticket_number}
              </p>
              {displayNameOnly(currentCall) && (
                <p className="text-white/90 text-3xl font-medium">
                  {displayNameOnly(currentCall)}
                </p>
              )}
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
        {showHistory && (
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
                        <p className="text-white/50 text-sm">{displayNameOnly(t) || ""}</p>
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
        )}
      </div>

      {/* Bottom bar */}
      <div className="h-12 bg-black/30 flex items-center justify-center">
        <p className="text-white/30 text-sm">{unitName} • Painel de Chamadas</p>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes tvCallFlash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes tvCallZoom {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
