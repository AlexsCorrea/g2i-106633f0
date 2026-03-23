import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Square, User, Stethoscope, RotateCcw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
}

export function VoiceTranscription({ onTranscriptUpdate, transcript }: VoiceTranscriptionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<"medico" | "paciente">("medico");
  const [interimText, setInterimText] = useState("");
  const [duration, setDuration] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const isSupported = !!SpeechRecognition;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, interimText]);

  const startRecording = useCallback(() => {
    if (!isSupported) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const entry: TranscriptEntry = {
            id: crypto.randomUUID(),
            speaker: currentSpeaker,
            text: result[0].transcript.trim(),
            timestamp: new Date(),
          };
          onTranscriptUpdate([...transcript, entry]);
          setInterimText("");
        } else {
          interim += result[0].transcript;
        }
      }
      if (interim) setInterimText(interim);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setIsRecording(false);
      }
    };

    recognition.onend = () => {
      // Restart if still recording (browser may stop after silence)
      if (isRecording && recognitionRef.current) {
        try { recognition.start(); } catch {}
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setDuration(0);
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
  }, [isSupported, currentSpeaker, transcript, onTranscriptUpdate, isRecording]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setInterimText("");
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Update speaker ref for callback
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            const entry: TranscriptEntry = {
              id: crypto.randomUUID(),
              speaker: currentSpeaker,
              text: result[0].transcript.trim(),
              timestamp: new Date(),
            };
            onTranscriptUpdate([...transcript, entry]);
            setInterimText("");
          } else {
            interim += result[0].transcript;
          }
        }
        if (interim) setInterimText(interim);
      };
    }
  }, [currentSpeaker, transcript, onTranscriptUpdate]);

  const formatDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const clearTranscript = () => {
    onTranscriptUpdate([]);
    setDuration(0);
  };

  if (!isSupported) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
        Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge para esta funcionalidade.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {!isRecording ? (
          <Button onClick={startRecording} className="gap-2" variant="default">
            <Mic className="h-4 w-4" />
            Iniciar Gravação
          </Button>
        ) : (
          <Button onClick={stopRecording} variant="destructive" className="gap-2">
            <Square className="h-3.5 w-3.5" />
            Parar
          </Button>
        )}

        {/* Speaker toggle */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setCurrentSpeaker("medico")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
              currentSpeaker === "medico"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            <Stethoscope className="h-3.5 w-3.5" />
            Médico
          </button>
          <button
            onClick={() => setCurrentSpeaker("paciente")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
              currentSpeaker === "paciente"
                ? "bg-emerald-600 text-white"
                : "bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            <User className="h-3.5 w-3.5" />
            Paciente
          </button>
        </div>

        {isRecording && (
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono text-muted-foreground">{formatDuration(duration)}</span>
          </div>
        )}

        {transcript.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearTranscript} className="gap-1 ml-auto">
            <RotateCcw className="h-3.5 w-3.5" />
            Limpar
          </Button>
        )}
      </div>

      {/* Transcript display */}
      <div ref={scrollRef} className="max-h-64 overflow-y-auto space-y-2 pr-1">
        {transcript.length === 0 && !interimText && (
          <p className="text-sm text-muted-foreground text-center py-8">
            {isRecording ? "Fale algo para começar a transcrição..." : "Clique em \"Iniciar Gravação\" para transcrever a consulta"}
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

        {interimText && (
          <div className="flex gap-2 opacity-60">
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 mt-0.5 text-[10px]",
                currentSpeaker === "medico"
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
              )}
            >
              {currentSpeaker === "medico" ? "Médico" : "Paciente"}
            </Badge>
            <p className="text-sm text-foreground/60 italic leading-relaxed">{interimText}...</p>
          </div>
        )}
      </div>
    </div>
  );
}
