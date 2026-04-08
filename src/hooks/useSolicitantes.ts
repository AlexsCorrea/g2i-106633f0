import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Solicitante {
  id: string;
  nome: string;
  conselho: string;
  sigla: string;
  cpf: string;
  situacao_id: string | null;
  unidade_id: string | null;
  cbo_id: string | null;
  tipo_conselho_id: string | null;
  login: string | null;
  senha: string | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  estado: string | null;
  cidade: string | null;
  fone1: string | null;
  fone2: string | null;
  produtividade_habilitado: boolean;
  produtividade_percentual: number;
  produtividade_perc_recebe_vl_caixa: number;
  produtividade_perc_recebe_vl_convenio: number;
  produtividade_perc_desconto_vl_caixa: number;
  produtividade_perc_desconto_vl_convenio: number;
  user_id: string | null;
  user_modified: string | null;
  created_at: string;
  updated_at: string;
}

export function useSolicitantes() {
  return useQuery({
    queryKey: ['solicitantes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solicitantes')
        .select('*')
        .order('nome');
      if (error) throw error;
      return data as Solicitante[];
    },
  });
}

export function useSolicitante(id: string | null) {
  return useQuery({
    queryKey: ['solicitantes', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solicitantes')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as Solicitante;
    },
  });
}

export function useSaveSolicitante() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (values: Partial<Solicitante> & { id?: string }) => {
      const isEdit = !!values.id;
      const payload: any = { ...values };
      if (!isEdit) {
        payload.user_id = user?.id ?? null;
      }
      payload.user_modified = user?.id ?? null;
      payload.updated_at = new Date().toISOString();

      if (isEdit) {
        const { error } = await supabase.from('solicitantes').update(payload).eq('id', values.id!);
        if (error) throw error;
      } else {
        delete payload.id;
        const { error } = await supabase.from('solicitantes').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['solicitantes'] });
      toast.success('Solicitante salvo com sucesso');
    },
    onError: (e: any) => {
      toast.error('Erro ao salvar: ' + e.message);
    },
  });
}

export function useLookupTables() {
  const situacoes = useQuery({
    queryKey: ['situacao_cadastral'],
    queryFn: async () => {
      const { data, error } = await supabase.from('situacao_cadastral').select('*').eq('active', true).order('nome');
      if (error) throw error;
      return data as { id: string; nome: string }[];
    },
  });
  const conselhos = useQuery({
    queryKey: ['tipo_conselho_profissional'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tipo_conselho_profissional').select('*').eq('active', true).order('nome');
      if (error) throw error;
      return data as { id: string; nome: string; sigla: string }[];
    },
  });
  const cbos = useQuery({
    queryKey: ['solicitante_cbo'],
    queryFn: async () => {
      const { data, error } = await supabase.from('solicitante_cbo').select('*').eq('active', true).order('descricao');
      if (error) throw error;
      return data as { id: string; codigo: string; descricao: string }[];
    },
  });
  const unidades = useQuery({
    queryKey: ['unidades'],
    queryFn: async () => {
      const { data, error } = await supabase.from('unidades').select('*').eq('active', true).order('nome');
      if (error) throw error;
      return data as { id: string; nome: string; codigo: string | null }[];
    },
  });
  return { situacoes, conselhos, cbos, unidades };
}
