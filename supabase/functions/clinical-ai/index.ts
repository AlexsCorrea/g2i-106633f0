import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  anamnesis: `Você é um assistente clínico especializado em estruturar anamneses médicas.
A partir da transcrição de uma conversa entre médico e paciente, organize as informações no formato:

**Queixa Principal (QP):** 
**História da Doença Atual (HDA):**
**Antecedentes Pessoais:**
**Antecedentes Familiares:**
**Hábitos de Vida:**
**Revisão de Sistemas:**
**Exame Físico (mencionado):**

Separe claramente o que foi dito pelo médico (prefixo "Médico:") e pelo paciente (prefixo "Paciente:").
Se alguma seção não tiver informações, indique "Não informado".
Mantenha linguagem clínica profissional em português.`,

  insights: `Você é um assistente clínico de suporte à decisão.
Com base nos dados do paciente e na transcrição da consulta, forneça:

1. **Alertas Clínicos**: Sinais ou sintomas que merecem atenção imediata
2. **Diagnósticos Diferenciais Sugeridos**: Com base nos sintomas relatados
3. **Exames Recomendados**: Exames complementares sugeridos
4. **CID-10 Sugerido**: Códigos CID-10 mais prováveis
5. **Interações Medicamentosas**: Se houver medicamentos em uso, alertar sobre possíveis interações

IMPORTANTE: Estas são SUGESTÕES para auxiliar o profissional. A decisão clínica final é SEMPRE do médico.
Responda em português.`,

  evolution: `Você é um assistente clínico para redação de evoluções médicas.
Com base na transcrição da consulta e dados do paciente, gere um rascunho de evolução clínica no formato SOAP:

**S (Subjetivo):** Queixas e relatos do paciente
**O (Objetivo):** Dados do exame físico e exames complementares mencionados
**A (Avaliação):** Impressão clínica e diagnósticos
**P (Plano):** Conduta proposta, medicamentos, exames solicitados, orientações

Mantenha linguagem clínica profissional. Seja conciso e objetivo.`,

  diarize: `Você é um assistente especializado em diarização de consultas médicas.
Receba um texto bruto transcrito de uma consulta entre médico e paciente.
Sua tarefa é identificar quem está falando em cada trecho, baseado no CONTEXTO:

Regras para identificar o MÉDICO:
- Faz perguntas clínicas (ex: "O que o senhor está sentindo?", "Há quanto tempo?", "Tem alguma alergia?")
- Usa terminologia médica e linguagem técnica
- Dá explicações, orientações e instruções
- Solicita exames ou prescreve medicamentos
- Faz anamnese estruturada

Regras para identificar o PACIENTE:
- Descreve sintomas e queixas (ex: "Estou com dor de cabeça", "Comecei a sentir ontem")
- Dá respostas curtas de confirmação ou negação ("Sim", "Não", "Isso mesmo")
- Usa linguagem leiga e coloquial
- Relata histórico pessoal e familiar
- Expressa preocupações e dúvidas sobre sua condição

IMPORTANTE: Retorne APENAS um JSON válido (sem markdown, sem backticks) no formato:
[{"speaker":"medico","text":"..."},{"speaker":"paciente","text":"..."},...]

Separe as falas em sentenças lógicas. Se uma frase longa contém falas de ambos, separe-as.
Não adicione texto que não estava na transcrição original.`,

  form_assist: `Você é um assistente de preenchimento de formulários clínicos.
Com base no contexto do paciente e na conversa, sugira valores para os campos do formulário.
Retorne as sugestões em formato estruturado, indicando o campo e o valor sugerido.
Se não houver informação suficiente para um campo, não sugira valor.
Responda em português.`,

  general: `Você é um assistente clínico inteligente integrado ao prontuário eletrônico MedPro.
Você tem acesso aos dados do paciente e pode ajudar com:
- Análise de dados clínicos
- Sugestões de conduta
- Alertas de interações medicamentosas
- Resumos clínicos
- Esclarecimento de dúvidas médicas

IMPORTANTE: Suas respostas são sugestões de suporte. A decisão clínica final é SEMPRE do profissional de saúde.
Responda em português de forma profissional e concisa.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Autenticação necessária" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { action, messages, patientContext, transcript } = await req.json();

    const systemPrompt = SYSTEM_PROMPTS[action] || SYSTEM_PROMPTS.general;

    let enrichedSystem = systemPrompt;
    if (patientContext) {
      enrichedSystem += `\n\n--- DADOS DO PACIENTE ---\n${patientContext}`;
    }
    if (transcript) {
      enrichedSystem += `\n\n--- TRANSCRIÇÃO DA CONSULTA ---\n${transcript}`;
    }

    const aiMessages = [
      { role: "system", content: enrichedSystem },
      ...(messages || []),
    ];

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: aiMessages,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos em Configurações." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("AI gateway error:", response.status);
      return new Response(
        JSON.stringify({ error: "Erro no serviço de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("clinical-ai error:", e);
    return new Response(
      JSON.stringify({ error: "Erro interno no serviço de IA" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
