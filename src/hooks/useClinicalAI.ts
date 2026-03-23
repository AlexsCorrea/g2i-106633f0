import { useState, useCallback } from "react";
import { toast } from "sonner";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/clinical-ai`;

interface UseClinicalAIOptions {
  patientContext: string;
}

export function useClinicalAI({ patientContext }: UseClinicalAIOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");

  const callAI = useCallback(
    async ({
      action,
      userMessage,
      transcript,
    }: {
      action: string;
      userMessage: string;
      transcript?: string;
    }): Promise<string> => {
      setIsLoading(true);
      setStreamingText("");

      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            action,
            messages: [{ role: "user", content: userMessage }],
            patientContext,
            transcript,
          }),
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: "Erro desconhecido" }));
          if (resp.status === 429) {
            toast.error("Limite de requisições excedido. Aguarde alguns segundos.");
          } else if (resp.status === 402) {
            toast.error("Créditos de IA esgotados. Adicione créditos nas configurações.");
          } else {
            toast.error(err.error || "Erro ao processar com IA");
          }
          throw new Error(err.error);
        }

        if (!resp.body) throw new Error("No response body");

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
              if (content) {
                fullText += content;
                setStreamingText(fullText);
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        setIsLoading(false);
        return fullText;
      } catch (e) {
        setIsLoading(false);
        throw e;
      }
    },
    [patientContext]
  );

  return { callAI, isLoading, streamingText, setStreamingText };
}
