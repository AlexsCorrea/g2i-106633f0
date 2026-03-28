import React, { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueueTickets } from "@/hooks/useQueueTickets";
import {
  useUnitConfig, useUnitAds, formatPatientDisplay,
  getPatientNameForSpeech, ticketToSpeech, priorityToSpeech,
} from "@/hooks/useUnitConfig";
import { Volume2, MapPin, Clock } from "lucide-react";

interface QueuedCall {
  id: string;
  ticket: any;
  timestamp: number;
}

export default function QueueTV() {
  const { data: config } = useUnitConfig();
  const { data: ads } = useUnitAds();
  const { data: calledTickets } = useQueueTickets({ queue_name: "recepcao", status: "chamada" });
  const { data: recentDone } = useQueueTickets({ queue_name: "recepcao", status: "concluida" });
  const { data: recentAbsent } = useQueueTickets({ queue_name: "recepcao", status: "ausente" });

  // Call queue: display one at a time
  const [callQueue, setCallQueue] = useState<QueuedCall[]>([]);
  const [activeCall, setActiveCall] = useState<QueuedCall | null>(null);
  const activeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ads playlist
  const [currentAdIdx, setCurrentAdIdx] = useState(0);
  const [idleMode, setIdleMode] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const adTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Locution queue
  const locutionQueueRef = useRef<string[]>([]);
  const isSpeakingRef = useRef(false);

  // Animation state
  const [flashCall, setFlashCall] = useState(false);
  const [pulseScale, setPulseScale] = useState(false);

  // Track processed calls to avoid duplicates
  const processedCallsRef = useRef<Set<string>>(new Set());

  // Config values
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
  const voiceRate = config?.voice_rate || 0.85;
  const voicePitch = config?.voice_pitch || 1.0;
  const voiceVolume = config?.voice_volume || 1.0;
  const preCallSound = config?.pre_call_sound || "triple_tone";

  // History
  const recentHistory = [
    ...(recentDone || []),
    ...(recentAbsent || []),
  ]
    .filter((t) => t.called_at)
    .sort((a, b) => new Date(b.called_at!).getTime() - new Date(a.called_at!).getTime())
    .slice(0, 8);

  // Clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  // Load voices
  useEffect(() => { window.speechSynthesis?.getVoices(); }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("tv-panel")
      .on("postgres_changes", { event: "*", schema: "public", table: "queue_tickets" }, () => {})
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // ---- LOCUTION ENGINE (queued) ----
  const processLocutionQueue = useCallback(() => {
    if (isSpeakingRef.current || locutionQueueRef.current.length === 0) return;
    if (!locutionEnabled) {
      locutionQueueRef.current = [];
      return;
    }
    isSpeakingRef.current = true;
    const text = locutionQueueRef.current.shift()!;
    try {
      const synth = window.speechSynthesis;
      if (!synth) { isSpeakingRef.current = false; return; }
      synth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "pt-BR";
      utter.rate = voiceRate;
      utter.pitch = voicePitch;
      utter.volume = voiceVolume;
      const voices = synth.getVoices();
      const ptVoice = voices.find(v => v.lang.startsWith("pt-BR")) || voices.find(v => v.lang.startsWith("pt"));
      if (ptVoice) utter.voice = ptVoice;
      utter.onend = () => {
        isSpeakingRef.current = false;
        setTimeout(() => processLocutionQueue(), 300);
      };
      utter.onerror = () => {
        isSpeakingRef.current = false;
        setTimeout(() => processLocutionQueue(), 300);
      };
      synth.speak(utter);
    } catch {
      isSpeakingRef.current = false;
    }
  }, [locutionEnabled, voiceRate, voicePitch, voiceVolume]);

  const enqueueLocution = useCallback((text: string) => {
    locutionQueueRef.current.push(text);
    processLocutionQueue();
  }, [processLocutionQueue]);

  const playTones = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (!soundEnabled || preCallSound === "none") { resolve(); return; }
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const playTone = (freq: number, delay: number, dur = 0.25) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.value = freq; osc.type = "sine";
          gain.gain.setValueAtTime(0.4, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + dur);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + dur + 0.05);
        };
        if (preCallSound === "double_tone") {
          playTone(880, 0, 0.2); playTone(1100, 0.3, 0.2);
          setTimeout(resolve, 700);
        } else {
          playTone(880, 0, 0.2); playTone(1100, 0.3, 0.2); playTone(880, 0.6, 0.3);
          setTimeout(resolve, 1100);
        }
      } catch { resolve(); }
    });
  }, [soundEnabled, preCallSound]);

  const buildSpeechText = useCallback((ticket: any) => {
    const parts: string[] = [];
    parts.push(`Senha ${ticketToSpeech(ticket.ticket_number)}`);
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
    return parts.join(", ") + ".";
  }, [privacyMode, speakPriority, speakLocation]);

  // ---- DETECT NEW CALLS → enqueue ----
  useEffect(() => {
    if (!calledTickets) return;
    const newCalls: QueuedCall[] = [];
    for (const t of calledTickets) {
      const key = `${t.id}_${t.called_at}`;
      if (!processedCallsRef.current.has(key)) {
        processedCallsRef.current.add(key);
        newCalls.push({ id: key, ticket: t, timestamp: new Date(t.called_at || Date.now()).getTime() });
      }
    }
    if (newCalls.length > 0) {
      newCalls.sort((a, b) => a.timestamp - b.timestamp);
      setCallQueue(prev => [...prev, ...newCalls]);
    }
  }, [calledTickets]);

  // ---- PROCESS CALL QUEUE: show one at a time ----
  useEffect(() => {
    if (activeCall) return; // already showing one
    if (callQueue.length === 0) return;

    const next = callQueue[0];
    setCallQueue(prev => prev.slice(1));
    setActiveCall(next);
    setIdleMode(false);
    setFlashCall(true);
    setPulseScale(true);

    // Clear idle timer
    if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
    if (adTimerRef.current) { clearTimeout(adTimerRef.current); adTimerRef.current = null; }

    // Play sound then enqueue locution
    playTones().then(() => {
      enqueueLocution(buildSpeechText(next.ticket));
    });

    setTimeout(() => setFlashCall(false), 3000);
    setTimeout(() => setPulseScale(false), 1500);

    // Auto-advance after display time
    if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
    activeTimerRef.current = setTimeout(() => {
      setActiveCall(null);
    }, callDisplaySec * 1000);
  }, [callQueue, activeCall, callDisplaySec, playTones, enqueueLocution, buildSpeechText]);

  // ---- IDLE MODE: start ads after no active call ----
  useEffect(() => {
    if (activeCall || callQueue.length > 0) {
      setIdleMode(false);
      if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
      return;
    }
    // No active call and queue empty → start idle timer
    idleTimerRef.current = setTimeout(() => {
      if (adsEnabled) {
        setIdleMode(true);
        setCurrentAdIdx(0);
      }
    }, adsIdleSec * 1000);
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, [activeCall, callQueue.length, adsEnabled, adsIdleSec]);

  // ---- AD PLAYLIST ROTATION ----
  useEffect(() => {
    if (!idleMode || !ads?.length) return;
    const dur = (ads[currentAdIdx]?.duration_seconds || 10) * 1000;
    adTimerRef.current = setTimeout(() => {
      setCurrentAdIdx(prev => (prev + 1) % ads.length);
    }, dur);
    return () => { if (adTimerRef.current) clearTimeout(adTimerRef.current); };
  }, [idleMode, currentAdIdx, ads]);

  // Interrupt ads when new call arrives
  useEffect(() => {
    if (idleMode && callQueue.length > 0) {
      setIdleMode(false);
    }
  }, [callQueue.length, idleMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (adTimerRef.current) clearTimeout(adTimerRef.current);
    };
  }, []);

  // ---- HELPERS ----
  const displayNameOnly = (ticket: any) => {
    if (!ticket.patient_id || !ticket.patients?.full_name) return null;
    if (privacyMode === "somente_senha") return null;
    return formatPatientDisplay(
      ticket.patients?.full_name,
      ticket.patients?.nome_social || null,
      privacyMode, ""
    ).replace(/^\s*—\s*/, "").trim();
  };

  const priorityLabel = (type: string) => {
    const map: Record<string, string> = {
      preferencial_80: "80+", preferencial_60: "60+", preferencial: "Preferencial",
      retorno_pos_operatorio: "Retorno", consulta: "Consulta", normal: "Normal",
      exames: "Exames", financeiro: "Financeiro", triagem: "Triagem",
    };
    return map[type] || type;
  };

  const priorityBgColor = (type: string) => {
    switch (type) {
      case "preferencial_80": return "rgba(239,68,68,0.4)";
      case "preferencial_60": return "rgba(249,115,22,0.4)";
      case "preferencial": return "rgba(234,179,8,0.35)";
      default: return "rgba(255,255,255,0.15)";
    }
  };

  // Other active calls (from calledTickets minus current activeCall)
  const otherActiveCalls = (calledTickets || [])
    .filter(t => activeCall ? t.id !== activeCall.ticket.id : true)
    .sort((a, b) => new Date(b.called_at!).getTime() - new Date(a.called_at!).getTime())
    .slice(0, 4);

  // ---- RENDER: AD/IDLE MODE ----
  if (idleMode && ads && ads.length > 0) {
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
            <video key={ad.id} src={ad.media_url} autoPlay muted className="max-h-full max-w-full object-contain"
              onEnded={() => setCurrentAdIdx(prev => (prev + 1) % ads.length)} />
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

  // ---- RENDER: CALL MODE / WAITING ----
  const ticket = activeCall?.ticket || null;

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
      {/* Top bar */}
      <div className="h-20 flex items-center justify-between px-10 bg-black/20">
        <div className="flex items-center gap-4">
          {config?.logo_url && <img src={config.logo_url} alt="Logo" className="h-12 w-12 rounded-xl object-cover" />}
          <span className="text-white text-2xl font-bold">{unitName}</span>
        </div>
        <div className="flex items-center gap-6">
          {callQueue.length > 0 && (
            <span className="text-white/60 text-sm bg-white/10 px-3 py-1 rounded-full">
              +{callQueue.length} na fila
            </span>
          )}
          {showClock && (
            <div className="flex items-center gap-3 text-white/80">
              <Clock className="w-5 h-5" />
              <span className="text-xl font-mono">{timeStr}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Current call - large center area */}
        <div className="flex-1 flex items-center justify-center">
          {ticket ? (
            <div
              className="text-center space-y-6"
              style={{
                animation: pulseScale
                  ? "tvCallZoom 0.8s ease-out forwards"
                  : flashCall
                  ? "tvCallPulse 1s ease-in-out 3"
                  : "none",
              }}
            >
              <div className="flex items-center justify-center gap-3 text-white/70 text-xl">
                <Volume2 className="w-7 h-7 animate-pulse" />
                <span className="uppercase tracking-[0.3em] font-light">Chamada</span>
              </div>

              <p
                className="text-white leading-none font-black tracking-widest drop-shadow-[0_4px_30px_rgba(255,255,255,0.3)]"
                style={{ fontSize: "clamp(6rem, 14vw, 12rem)" }}
              >
                {ticket.ticket_number}
              </p>

              {displayNameOnly(ticket) && (
                <p className="text-white/90 text-4xl font-semibold tracking-wide">
                  {displayNameOnly(ticket)}
                </p>
              )}

              <div className="flex items-center justify-center gap-4 flex-wrap">
                <span
                  className="px-6 py-2.5 rounded-full text-white text-xl font-bold border border-white/20"
                  style={{ background: priorityBgColor(ticket.ticket_type) }}
                >
                  {priorityLabel(ticket.ticket_type)}
                </span>
              </div>

              {ticket.called_to && (
                <div className="flex items-center justify-center gap-3 text-white text-3xl mt-2">
                  <MapPin className="w-8 h-8" />
                  <span className="font-bold">{ticket.called_to}</span>
                </div>
              )}

              {(ticket as any).recall_count > 0 && (
                <p className="text-white/40 text-sm mt-2">
                  Rechamada #{(ticket as any).recall_count}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center space-y-6">
              {config?.logo_url && (
                <img src={config.logo_url} alt="Logo" className="h-24 w-24 rounded-2xl object-cover mx-auto opacity-40" />
              )}
              <p className="text-white/30 text-5xl font-light">Aguardando chamada</p>
              <p className="text-white/15 text-xl">{unitName}</p>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        {showHistory && (
          <div className="w-80 bg-black/30 flex flex-col border-l border-white/5">
            {/* Other active calls */}
            {otherActiveCalls.length > 0 && (
              <>
                <div className="px-5 py-3 border-b border-white/10 bg-white/5">
                  <h3 className="text-white/70 text-xs font-semibold uppercase tracking-wider">Outras chamadas</h3>
                </div>
                <div className="border-b border-white/10">
                  {otherActiveCalls.slice(0, 3).map((t) => (
                    <div key={t.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-white font-bold text-lg">{t.ticket_number}</p>
                        <p className="text-white/40 text-xs">{displayNameOnly(t) || ""}</p>
                      </div>
                      <p className="text-white/60 text-sm">{t.called_to || "—"}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="px-5 py-4 border-b border-white/10">
              <h3 className="text-white/70 text-sm font-semibold uppercase tracking-wider">Últimas chamadas</h3>
            </div>
            <div className="flex-1 overflow-auto">
              {recentHistory.length === 0 ? (
                <p className="text-white/20 text-center py-8 text-sm">Nenhuma chamada</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {recentHistory.map((t) => (
                    <div key={t.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-white font-bold text-lg">{t.ticket_number}</p>
                        <p className="text-white/40 text-xs">{displayNameOnly(t) || ""}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/50 text-sm">{t.called_to || "—"}</p>
                        <p className="text-white/30 text-xs">
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
      <div className="h-10 bg-black/30 flex items-center justify-center">
        <p className="text-white/20 text-xs">{unitName} • Painel de Chamadas</p>
      </div>

      <style>{`
        @keyframes tvCallPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.02); }
        }
        @keyframes tvCallZoom {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
