import React, { useState, useEffect, useCallback, useMemo } from "react";
import { KioskHome } from "@/components/kiosk/KioskHome";
import { KioskTicket } from "@/components/kiosk/KioskTicket";
import { KioskCheckin } from "@/components/kiosk/KioskCheckin";
import { KioskResult } from "@/components/kiosk/KioskResult";
import { useUnitConfig } from "@/hooks/useUnitConfig";

export type KioskFlow = "home" | "ticket" | "checkin" | "result";

export interface KioskResultData {
  ticketNumber: string;
  ticketType: string;
  patientName?: string;
  professional?: string;
  time?: string;
  queuePosition?: number;
  ticketId?: string;
}

/**
 * Context-aware timeout multipliers:
 * - home: no timeout (already home)
 * - ticket: 1x (selection screen, short)
 * - checkin: 3x (patient filling forms, longer)
 * - result: fixed 30s countdown (handled internally)
 */
const TIMEOUT_MULTIPLIER: Record<KioskFlow, number> = {
  home: 0,
  ticket: 1,
  checkin: 3,
  result: 0, // result has its own internal countdown
};

export default function Kiosk() {
  const [flow, setFlow] = useState<KioskFlow>("home");
  const [resultData, setResultData] = useState<KioskResultData | null>(null);
  const { data: config } = useUnitConfig();

  const baseTimeoutMs = (config?.totem_timeout_seconds || 60) * 1000;

  const goHome = useCallback(() => {
    setFlow("home");
    setResultData(null);
  }, []);

  const showResult = (data: KioskResultData) => {
    setResultData(data);
    setFlow("result");
  };

  // Context-aware timeout: different per flow stage
  useEffect(() => {
    if (flow === "home" || flow === "result") return; // home=no timeout, result=own countdown

    const multiplier = TIMEOUT_MULTIPLIER[flow];
    const timeoutMs = baseTimeoutMs * multiplier;
    if (timeoutMs <= 0) return;

    let timer: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(goHome, timeoutMs);
    };
    resetTimer();

    // Listen to all interaction events including input-related ones
    const events = [
      "touchstart", "touchmove", "mousedown", "mousemove",
      "keydown", "keyup", "keypress", "scroll",
      "input", "change", "focus", "click",
    ];
    events.forEach(e => document.addEventListener(e, resetTimer, { passive: true }));

    return () => {
      clearTimeout(timer);
      events.forEach(e => document.removeEventListener(e, resetTimer));
    };
  }, [flow, goHome, baseTimeoutMs]);

  const primaryColor = config?.primary_color || "hsl(210,85%,45%)";
  const secondaryColor = config?.secondary_color || "hsl(210,85%,30%)";
  const bgStyle = config?.background_image_url
    ? { backgroundImage: `url(${config.background_image_url})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={bgStyle}>
      <div className="w-full max-w-lg">
        {flow === "home" && <KioskHome onSelect={setFlow} />}
        {flow === "ticket" && <KioskTicket onBack={goHome} onResult={showResult} config={config} />}
        {flow === "checkin" && <KioskCheckin onBack={goHome} onResult={showResult} />}
        {flow === "result" && resultData && <KioskResult data={resultData} onBack={goHome} config={config} />}
      </div>
    </div>
  );
}
