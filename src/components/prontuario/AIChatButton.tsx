import { useState } from "react";
import { MessageSquare, X, Send, Loader2, Sparkles, AlertTriangle, Pill, Heart, FileText, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PatientContext {
  patientName: string;
  allergies: string[];
  medications: string[];
  latestVitals: string;
  evolutionSummary: string;
  scales: string;
  medicalHistory: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const presetQuestions = [
  { icon: AlertTriangle, label: "Alergias", prompt: "Quais são as alergias deste paciente e suas severidades?" },
  { icon: Pill, label: "Medicamentos", prompt: "Liste os medicamentos em uso, dosagens e frequências." },
  { icon: Activity, label: "Sinais Vitais", prompt: "Qual o último registro de sinais vitais deste paciente? Há algo fora do normal?" },
  { icon: Heart, label: "Resumo Clínico", prompt: "Faça um resumo clínico completo deste paciente." },
  { icon: FileText, label: "Alertas", prompt: "Quais são os alertas e riscos ativos para este paciente? Incluindo escalas de risco." },
  { icon: Sparkles, label: "Interações", prompt: "Existem possíveis interações medicamentosas entre os medicamentos em uso?" },
];

interface AIChatButtonProps {
  patientContext: PatientContext;
}

export function AIChatButton({ patientContext }: AIChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const buildContextPrompt = () => {
    return `Dados do paciente ${patientContext.patientName}:
- Alergias: ${patientContext.allergies.length > 0 ? patientContext.allergies.join(", ") : "Nenhuma alergia registrada (NKDA)"}
- Medicamentos em uso: ${patientContext.medications.length > 0 ? patientContext.medications.join("; ") : "Nenhum medicamento prescrito"}
- Últimos sinais vitais: ${patientContext.latestVitals || "Sem registro"}
- Escalas de risco: ${patientContext.scales || "Sem avaliação"}
- Histórico médico: ${patientContext.medicalHistory || "Sem histórico registrado"}
- Últimas evoluções: ${patientContext.evolutionSummary || "Sem evoluções"}`;
  };

  const handleSend = async (question: string) => {
    if (!question.trim()) return;
    
    const userMessage: ChatMessage = { role: "user", content: question };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Generate response based on context without calling external API
    setTimeout(() => {
      const context = buildContextPrompt();
      let response = "";

      if (question.toLowerCase().includes("alergia")) {
        response = patientContext.allergies.length > 0
          ? `🚨 **Alergias Registradas:**\n\n${patientContext.allergies.map(a => `• ${a}`).join("\n")}\n\n⚠️ Sempre verificar alergias cruzadas antes de prescrever novos medicamentos.`
          : "✅ Nenhuma alergia conhecida (NKDA). Prontuário não possui registros de alergias.";
      } else if (question.toLowerCase().includes("medicamento")) {
        response = patientContext.medications.length > 0
          ? `💊 **Medicamentos em Uso:**\n\n${patientContext.medications.map(m => `• ${m}`).join("\n")}`
          : "Nenhum medicamento prescrito atualmente.";
      } else if (question.toLowerCase().includes("sinais vitais") || question.toLowerCase().includes("vital")) {
        response = patientContext.latestVitals
          ? `📊 **Últimos Sinais Vitais:**\n\n${patientContext.latestVitals}`
          : "Sem registros recentes de sinais vitais.";
      } else if (question.toLowerCase().includes("resumo")) {
        response = `📋 **Resumo Clínico - ${patientContext.patientName}**\n\n${context}`;
      } else if (question.toLowerCase().includes("alerta") || question.toLowerCase().includes("risco")) {
        response = `⚠️ **Alertas e Riscos:**\n\n${patientContext.scales || "Sem escalas de risco avaliadas"}\n\n${patientContext.allergies.length > 0 ? `🚨 Alergias: ${patientContext.allergies.join(", ")}` : "✅ Sem alergias conhecidas"}`;
      } else if (question.toLowerCase().includes("interaç")) {
        response = patientContext.medications.length > 1
          ? `⚕️ **Análise de Interações Medicamentosas:**\n\nMedicamentos em uso:\n${patientContext.medications.map(m => `• ${m}`).join("\n")}\n\n⚠️ Recomenda-se consultar a farmácia clínica para verificação detalhada de interações entre os medicamentos prescritos.`
          : "Apenas um ou nenhum medicamento em uso. Sem risco de interações medicamentosas no momento.";
      } else {
        response = `Com base nos dados disponíveis no prontuário de **${patientContext.patientName}**:\n\n${context}\n\n💡 Utilize as perguntas pré-selecionadas para consultas rápidas sobre alergias, medicamentos e sinais vitais.`;
      }

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300",
          isOpen
            ? "bg-destructive text-destructive-foreground rotate-0"
            : "bg-primary text-primary-foreground hover:scale-105"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-h-[520px] rounded-xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-primary-foreground">Assistente Clínico IA</h3>
              <p className="text-[10px] text-primary-foreground/70">Consulte dados do paciente</p>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-4 py-3 max-h-72">
            {messages.length === 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground mb-3">Perguntas rápidas:</p>
                <div className="grid grid-cols-2 gap-2">
                  {presetQuestions.map((q) => {
                    const Icon = q.icon;
                    return (
                      <button
                        key={q.label}
                        onClick={() => handleSend(q.prompt)}
                        className="flex items-center gap-2 p-2 rounded-lg border border-border text-xs text-foreground hover:bg-muted/50 transition-colors text-left"
                      >
                        <Icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span>{q.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "text-xs leading-relaxed rounded-lg p-3 max-w-[90%]",
                      msg.role === "user"
                        ? "bg-primary/10 text-foreground ml-auto"
                        : "bg-muted/50 text-foreground"
                    )}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground p-3">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Analisando dados do paciente...
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte sobre o paciente..."
                className="text-xs h-9"
                onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                disabled={isLoading}
              />
              <Button
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => handleSend(input)}
                disabled={isLoading || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="text-[10px] text-muted-foreground mt-2 hover:text-foreground transition-colors"
              >
                Limpar conversa
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
