import React, { useState, useEffect, useCallback } from "react";
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

export default function Kiosk() {
  const [flow, setFlow] = useState<KioskFlow>("home");
  const [resultData, setResultData] = useState<KioskResultData | null>(null);
  const { data: config } = useUnitConfig();

  // Use config timeout (in seconds), convert to ms
  const timeoutMs = (config?.totem_timeout_seconds || 60) * 1000;

  const goHome = useCallback(() => {
    setFlow("home");
    setResultData(null);
  }, []);

  const showResult = (data: KioskResultData) => {
    setResultData(data);
    setFlow("result");
  };

  useEffect(() => {
    if (flow === "home") return;
    let timer: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(goHome, timeoutMs);
    };
    resetTimer();
    const events = ["touchstart", "mousedown", "keydown", "scroll"];
    events.forEach(e => document.addEventListener(e, resetTimer));
    return () => {
      clearTimeout(timer);
      events.forEach(e => document.removeEventListener(e, resetTimer));
    };
  }, [flow, goHome, timeoutMs]);

  const primaryColor = config?.primary_color || "hsl(210,85%,45%)";
  const secondaryColor = config?.secondary_color || "hsl(210,85%,30%)";
  const bgStyle = config?.background_image_url
    ? { backgroundImage: `url(${config.background_image_url})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={bgStyle}>
      <div className="w-full max-w-lg">
        {flow === "home" && <KioskHome onSelect={setFlow} />}
        {flow === "ticket" && <KioskTicket onBack={goHome} onResult={showResult} />}
        {flow === "checkin" && <KioskCheckin onBack={goHome} onResult={showResult} />}
        {flow === "result" && resultData && <KioskResult data={resultData} onBack={goHome} />}
      </div>
    </div>
  );
}
