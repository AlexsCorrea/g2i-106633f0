import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/lib/errorHandler";
import { evolutionNoteSchema } from "@/lib/validations";

export interface EvolutionNote {
  id: string;
  patient_id: string;
  professional_id: string;
  note_type: "medica" | "enfermagem" | "fisioterapia" | "nutricao" | "psicologia";
  content: string;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
    specialty: string | null;
  };
}

export function useEvolutionNotes(patientId: string | undefined) {
  return useQuery({
    queryKey: ["evolution_notes", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const { data, error } = await supabase
        .from("evolution_notes")
        .select("*, profiles(full_name, specialty)")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as EvolutionNote[];
    },
    enabled: !!patientId,
  });
}

export function useCreateEvolutionNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note: Omit<EvolutionNote, "id" | "created_at" | "profiles">) => {
      evolutionNoteSchema.parse(note);
      const { data, error } = await supabase
        .from("evolution_notes")
        .insert(note)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["evolution_notes", data.patient_id] });
      toast.success("Evolução registrada com sucesso!");
    },
    onError: (error) => {
      toast.error(getUserFriendlyError(error));
    },
  });
}
