import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UnitConfig {
  id: string;
  unit_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  background_image_url: string | null;
  privacy_mode: string; // 'somente_senha' | 'senha_iniciais' | 'senha_nome_social' | 'nome_completo'
  social_name_policy: string; // 'iniciais_social' | 'somente_senha' | 'nome_social_abreviado'
  call_display_seconds: number;
  ads_enabled: boolean;
  ads_interval_seconds: number;
}

export interface UnitAd {
  id: string;
  unit_config_id: string | null;
  title: string;
  media_type: string;
  media_url: string;
  display_order: number;
  duration_seconds: number;
  active: boolean;
  created_at: string;
}

export function useUnitConfig() {
  return useQuery({
    queryKey: ["unit_config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unit_config")
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data as UnitConfig;
    },
    staleTime: 60000,
  });
}

export function useUpdateUnitConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: Partial<UnitConfig> & { id: string }) => {
      const { id, ...rest } = params;
      const { data, error } = await supabase
        .from("unit_config")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["unit_config"] });
      toast.success("Configuração atualizada!");
    },
  });
}

export function useUnitAds() {
  return useQuery({
    queryKey: ["unit_ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unit_ads")
        .select("*")
        .eq("active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as UnitAd[];
    },
    staleTime: 30000,
  });
}

export function useManageAds() {
  const qc = useQueryClient();
  return {
    add: useMutation({
      mutationFn: async (ad: Omit<UnitAd, "id" | "created_at">) => {
        const { data, error } = await supabase.from("unit_ads").insert(ad as any).select().single();
        if (error) throw error;
        return data;
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: ["unit_ads"] }),
    }),
    remove: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from("unit_ads").delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: ["unit_ads"] }),
    }),
  };
}

/** Format patient display name based on privacy mode */
export function formatPatientDisplay(
  fullName: string | null | undefined,
  nomeSocial: string | null | undefined,
  privacyMode: string,
  ticketNumber: string,
): string {
  if (!fullName) return ticketNumber;

  switch (privacyMode) {
    case "somente_senha":
      return ticketNumber;
    case "senha_iniciais": {
      const name = nomeSocial || fullName;
      const initials = name
        .split(" ")
        .map((w) => w[0]?.toUpperCase())
        .filter(Boolean)
        .join(".");
      return `${ticketNumber} — ${initials}.`;
    }
    case "senha_nome_social": {
      if (nomeSocial) {
        const parts = nomeSocial.split(" ");
        return `${ticketNumber} — ${parts[0]}${parts.length > 1 ? " " + parts[parts.length - 1][0] + "." : ""}`;
      }
      const parts = fullName.split(" ");
      return `${ticketNumber} — ${parts[0]} ${parts.length > 1 ? parts[parts.length - 1][0] + "." : ""}`;
    }
    case "nome_completo":
      return `${ticketNumber} — ${nomeSocial || fullName}`;
    default:
      return ticketNumber;
  }
}
