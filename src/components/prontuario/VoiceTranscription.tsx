import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, RotateCcw, Clock, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface TranscriptEntry {
  id: string;
  speaker: "medico" | "paciente";
  text: string;
  timestamp: Date;
}

interface VoiceTranscriptionProps {
  onTranscriptUpdate: (entries: TranscriptEntry[]) => void;
  transcript: TranscriptEntry[];
  patientContext?: string;
}

const DIARIZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/clinical-ai`;

export function VoiceTranscription({ onTranscriptUpdate, transcript, patientContext }: VoiceTranscriptionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [duration, setDuration] = useState(0);
  const [isDiarizing, setIsDiarizing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rawBufferRef = useRef<string[]>([]);

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const isSupported = !!SpeechRecognition;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, interimText]);

  const diarizeWithAI = useCallback(async (rawTexts: string[]) => {
    if (rawTexts.length === 0) return;
    setIsDiarizing(true);
    try {
      const rawTranscript = rawTexts.join(" ");
      const resp = await fetch(DIARIZE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: "diarize",
          messages: [{ role: "user", content: rawTranscript }],
          patientContext: patientContext || "",
        }),
      });

      if (!resp.ok || !resp.body) {
        // Fallback: treat all as raw unidentified
        const entries: TranscriptEntry[] = rawTexts.map((text) => ({
          id: crypto.randomUUID(),
          speaker: "medico" as const,
          text,
          timestamp: new Date(),
        }));
        onTranscriptUpdate([...transcript, ...entries]);
        return;
      }

      // Read the streamed response fully
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) fullText += content;
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Parse the AI response as JSON array
      try {
        // Clean potential markdown wrapping
        let cleaned = fullText.trim();
        if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }
        const diarized: { speaker: string; text: string }[] = JSON.parse(cleaned);
        const entries: TranscriptEntry[] = diarized.map((item) => ({
          id: crypto.randomUUID(),
          speaker: item.speaker === "paciente" ? "paciente" : "medico",
          text: item.text,
          timestamp: new Date(),
        }));
        onTranscriptUpdate([...transcript, ...entries]);
      } catch {
        // Fallback if parsing fails
        const entries: TranscriptEntry[] = rawTexts.map((text) => ({
          id: crypto.randomUUID(),
          speaker: "medico" as const,
          text,
          timestamp: new Date(),
        }));
        onTranscriptUpdate([...transcript, ...entries]);
      }
    } catch (err) {
      console.error("Diarization error:", err);
    } finally {
      setIsDiarizing(false);
    }
  }, [transcript, onTranscriptUpdate, patientContext]);

  const startRecording = useCallback(() => {
    if (!isSupported) return;

    rawBufferRef.current = [];
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const text = result[0].transcript.trim();
          if (text) rawBufferRef.current.push(text);
          setInterimText("");
        } else {
          interim += result[0].transcript;
        }
      }
      if (interim) setInterimText(interim);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") setIsRecording(false);
    };

    recognition.onend = () => {
      if (recognitionRef.current) {
        try { recognition.start(); } catch {}
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setDuration(0);
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
  }, [isSupported]);

  const stopRecording = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      rec.onend = null;
      rec.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setInterimText("");
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Send accumulated raw text to AI for diarization
    if (rawBufferRef.current.length > 0) {
      const texts = [...rawBufferRef.current];
      rawBufferRef.current = [];
      diarizeWithAI(texts);
    }
  }, [diarizeWithAI]);

  const formatDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const clearTranscript = () => {
    onTranscriptUpdate([]);
    rawBufferRef.current = [];
    setDuration(0);
  };

  if (!isSupported) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
        Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {!isRecording ? (
          <Button onClick={startRecording} className="gap-2" variant="default" disabled={isDiarizing}>
            <Mic className="h-4 w-4" />
            Iniciar Gravação
          </Button>
        ) : (
          <Button onClick={stopRecording} variant="destructive" className="gap-2">
            <Square className="h-3.5 w-3.5" />
            Parar
          </Button>
        )}

        {isRecording && (
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono text-muted-foreground">{formatDuration(duration)}</span>
          </div>
        )}

        {isDiarizing && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Identificando falas com IA...</span>
          </div>
        )}

        {transcript.length > 0 && !isRecording && (
          <Button variant="ghost" size="sm" onClick={clearTranscript} className="gap-1 ml-auto">
            <RotateCcw className="h-3.5 w-3.5" />
            Limpar
          </Button>
        )}
      </div>

      {/* Live raw text while recording */}
      {isRecording && (rawBufferRef.current.length > 0 || interimText) && (
        <div className="bg-muted/50 rounded-lg p-3 border border-border">
          <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
            <Mic className="h-3 w-3" /> Gravando conversa...
          </p>
          <p className="text-sm text-foreground/70">
            {rawBufferRef.current.join(" ")}
            {interimText && <span className="italic text-foreground/40"> {interimText}...</span>}
          </p>
        </div>
      )}

      {/* Diarized transcript display */}
      <div ref={scrollRef} className="max-h-64 overflow-y-auto space-y-2 pr-1">
        {transcript.length === 0 && !isRecording && !isDiarizing && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Clique em "Iniciar Gravação" para transcrever a consulta.
            <br />
            <span className="text-xs text-muted-foreground/70">
              A IA identificará automaticamente as falas do médico e do paciente.
            </span>
          </p>
        )}

        {transcript.map((entry) => (
          <div key={entry.id} className="flex gap-2">
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 mt-0.5 text-[10px]",
                entry.speaker === "medico"
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
              )}
            >
              {entry.speaker === "medico" ? "Médico" : "Paciente"}
            </Badge>
            <p className="text-sm text-foreground leading-relaxed">{entry.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
