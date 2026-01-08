import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Patient {
  id: string;
  full_name: string;
  birth_date: string;
  gender: string;
  cpf: string | null;
  rg: string | null;
  blood_type: string | null;
  phone: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  address: string | null;
  health_insurance: string | null;
  health_insurance_number: string | null;
  status: "internado" | "ambulatorial" | "alta" | "transferido" | "obito";
  room: string | null;
  bed: string | null;
  admission_date: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export function usePatients() {
  return useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Patient[];
    },
  });
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as Patient | null;
    },
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patient: Omit<Patient, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("patients")
        .insert(patient)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Paciente cadastrado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar paciente: " + error.message);
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...patient }: Partial<Patient> & { id: string }) => {
      const { data, error } = await supabase
        .from("patients")
        .update(patient)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient", data.id] });
      toast.success("Paciente atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar paciente: " + error.message);
    },
  });
}
