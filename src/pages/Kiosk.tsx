import React, { useState, useEffect, useCallback } from "react";
import { KioskHome } from "@/components/kiosk/KioskHome";
import { KioskTicket } from "@/components/kiosk/KioskTicket";
import { KioskCheckin } from "@/components/kiosk/KioskCheckin";
import { KioskResult } from "@/components/kiosk/KioskResult";

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

const INACTIVITY_TIMEOUT = 60000; // 60 seconds

export default function Kiosk() {
  const [flow, setFlow] = useState<KioskFlow>("home");
  const [resultData, setResultData] = useState<KioskResultData | null>(null);

  const goHome = useCallback(() => {
    setFlow("home");
    setResultData(null);
  }, []);

  const showResult = (data: KioskResultData) => {
    setResultData(data);
    setFlow("result");
  };

  // Inactivity timeout - return to home if no interaction
  useEffect(() => {
    if (flow === "home") return;
    let timer: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(goHome, INACTIVITY_TIMEOUT);
    };
    resetTimer();
    const events = ["touchstart", "mousedown", "keydown", "scroll"];
    events.forEach(e => document.addEventListener(e, resetTimer));
    return () => {
      clearTimeout(timer);
      events.forEach(e => document.removeEventListener(e, resetTimer));
    };
  }, [flow, goHome]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(210,85%,45%)] to-[hsl(210,85%,30%)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {flow === "home" && <KioskHome onSelect={setFlow} />}
        {flow === "ticket" && <KioskTicket onBack={goHome} onResult={showResult} />}
        {flow === "checkin" && <KioskCheckin onBack={goHome} onResult={showResult} />}
        {flow === "result" && resultData && <KioskResult data={resultData} onBack={goHome} />}
      </div>
    </div>
  );
}
