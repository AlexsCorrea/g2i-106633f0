export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      adverse_events: {
        Row: {
          actions_taken: string | null
          created_at: string
          description: string
          event_type: string
          id: string
          occurred_at: string
          patient_id: string
          reported_by: string
          severity: string
          status: string
          updated_at: string
        }
        Insert: {
          actions_taken?: string | null
          created_at?: string
          description: string
          event_type: string
          id?: string
          occurred_at?: string
          patient_id: string
          reported_by: string
          severity?: string
          status?: string
          updated_at?: string
        }
        Update: {
          actions_taken?: string | null
          created_at?: string
          description?: string
          event_type?: string
          id?: string
          occurred_at?: string
          patient_id?: string
          reported_by?: string
          severity?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "adverse_events_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adverse_events_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      allergies: {
        Row: {
          allergen: string
          allergy_type: string
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          reaction: string | null
          registered_by: string | null
          severity: Database["public"]["Enums"]["allergy_severity"]
        }
        Insert: {
          allergen: string
          allergy_type: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          reaction?: string | null
          registered_by?: string | null
          severity?: Database["public"]["Enums"]["allergy_severity"]
        }
        Update: {
          allergen?: string
          allergy_type?: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          reaction?: string | null
          registered_by?: string | null
          severity?: Database["public"]["Enums"]["allergy_severity"]
        }
        Relationships: [
          {
            foreignKeyName: "allergies_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allergies_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_type: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          location: string | null
          notes: string | null
          patient_id: string
          professional_id: string | null
          scheduled_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          appointment_type: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          patient_id: string
          professional_id?: string | null
          scheduled_at: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          appointment_type?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          patient_id?: string
          professional_id?: string | null
          scheduled_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      braden_scale: {
        Row: {
          activity: number
          evaluated_at: string
          evaluated_by: string
          friction_shear: number
          id: string
          mobility: number
          moisture: number
          notes: string | null
          nutrition: number
          patient_id: string
          sensory_perception: number
          total_score: number | null
        }
        Insert: {
          activity: number
          evaluated_at?: string
          evaluated_by: string
          friction_shear: number
          id?: string
          mobility: number
          moisture: number
          notes?: string | null
          nutrition: number
          patient_id: string
          sensory_perception: number
          total_score?: number | null
        }
        Update: {
          activity?: number
          evaluated_at?: string
          evaluated_by?: string
          friction_shear?: number
          id?: string
          mobility?: number
          moisture?: number
          notes?: string | null
          nutrition?: number
          patient_id?: string
          sensory_perception?: number
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "braden_scale_evaluated_by_fkey"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "braden_scale_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      cme_armazenamento: {
        Row: {
          carga_id: string | null
          created_at: string
          data_esterilizacao: string
          data_validade: string
          id: string
          kit_id: string | null
          local_armazenamento: string | null
          lote: string
          material_id: string | null
          prateleira: string | null
          quantidade: number
          reservado_para: string | null
          status: string
          updated_at: string
        }
        Insert: {
          carga_id?: string | null
          created_at?: string
          data_esterilizacao: string
          data_validade: string
          id?: string
          kit_id?: string | null
          local_armazenamento?: string | null
          lote: string
          material_id?: string | null
          prateleira?: string | null
          quantidade?: number
          reservado_para?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          carga_id?: string | null
          created_at?: string
          data_esterilizacao?: string
          data_validade?: string
          id?: string
          kit_id?: string | null
          local_armazenamento?: string | null
          lote?: string
          material_id?: string | null
          prateleira?: string | null
          quantidade?: number
          reservado_para?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cme_armazenamento_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: false
            referencedRelation: "cme_cargas_esterilizacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_armazenamento_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "cme_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_armazenamento_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "cme_materiais"
            referencedColumns: ["id"]
          },
        ]
      }
      cme_carga_itens: {
        Row: {
          carga_id: string
          created_at: string
          id: string
          kit_id: string | null
          material_id: string | null
          quantidade: number
          recebimento_id: string | null
        }
        Insert: {
          carga_id: string
          created_at?: string
          id?: string
          kit_id?: string | null
          material_id?: string | null
          quantidade?: number
          recebimento_id?: string | null
        }
        Update: {
          carga_id?: string
          created_at?: string
          id?: string
          kit_id?: string | null
          material_id?: string | null
          quantidade?: number
          recebimento_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cme_carga_itens_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: false
            referencedRelation: "cme_cargas_esterilizacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_carga_itens_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "cme_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_carga_itens_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "cme_materiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_carga_itens_recebimento_id_fkey"
            columns: ["recebimento_id"]
            isOneToOne: false
            referencedRelation: "cme_recebimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      cme_cargas_esterilizacao: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string
          data_liberacao: string | null
          equipamento_id: string | null
          id: string
          indicador_biologico: string | null
          indicador_quimico: string | null
          integrador: string | null
          liberado_por: string | null
          lote: string
          metodo: string
          numero_carga: string
          observacoes: string | null
          operador_id: string | null
          pressao: number | null
          resultado: string | null
          temperatura: number | null
          tempo_minutos: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          data_liberacao?: string | null
          equipamento_id?: string | null
          id?: string
          indicador_biologico?: string | null
          indicador_quimico?: string | null
          integrador?: string | null
          liberado_por?: string | null
          lote: string
          metodo?: string
          numero_carga: string
          observacoes?: string | null
          operador_id?: string | null
          pressao?: number | null
          resultado?: string | null
          temperatura?: number | null
          tempo_minutos?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          data_liberacao?: string | null
          equipamento_id?: string | null
          id?: string
          indicador_biologico?: string | null
          indicador_quimico?: string | null
          integrador?: string | null
          liberado_por?: string | null
          lote?: string
          metodo?: string
          numero_carga?: string
          observacoes?: string | null
          operador_id?: string | null
          pressao?: number | null
          resultado?: string | null
          temperatura?: number | null
          tempo_minutos?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cme_cargas_esterilizacao_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "cme_equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_cargas_esterilizacao_liberado_por_fkey"
            columns: ["liberado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_cargas_esterilizacao_operador_id_fkey"
            columns: ["operador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cme_devolucoes: {
        Row: {
          created_at: string
          data_devolucao: string
          destino_final: string | null
          distribuicao_id: string | null
          id: string
          material_danificado: boolean | null
          motivo: string
          observacoes: string | null
          responsavel_id: string | null
          setor_devolvente: string
          usado: boolean | null
          validade_expirada: boolean | null
          violacao_embalagem: boolean | null
        }
        Insert: {
          created_at?: string
          data_devolucao?: string
          destino_final?: string | null
          distribuicao_id?: string | null
          id?: string
          material_danificado?: boolean | null
          motivo: string
          observacoes?: string | null
          responsavel_id?: string | null
          setor_devolvente: string
          usado?: boolean | null
          validade_expirada?: boolean | null
          violacao_embalagem?: boolean | null
        }
        Update: {
          created_at?: string
          data_devolucao?: string
          destino_final?: string | null
          distribuicao_id?: string | null
          id?: string
          material_danificado?: boolean | null
          motivo?: string
          observacoes?: string | null
          responsavel_id?: string | null
          setor_devolvente?: string
          usado?: boolean | null
          validade_expirada?: boolean | null
          violacao_embalagem?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "cme_devolucoes_distribuicao_id_fkey"
            columns: ["distribuicao_id"]
            isOneToOne: false
            referencedRelation: "cme_distribuicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_devolucoes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cme_distribuicoes: {
        Row: {
          armazenamento_id: string | null
          created_at: string
          data_distribuicao: string
          entregue_por: string | null
          finalidade: string | null
          id: string
          kit_id: string | null
          lote: string
          material_id: string | null
          observacoes: string | null
          profissional_solicitante: string | null
          quantidade: number
          recebido_por: string | null
          setor_destino: string
          status: string
          updated_at: string
        }
        Insert: {
          armazenamento_id?: string | null
          created_at?: string
          data_distribuicao?: string
          entregue_por?: string | null
          finalidade?: string | null
          id?: string
          kit_id?: string | null
          lote: string
          material_id?: string | null
          observacoes?: string | null
          profissional_solicitante?: string | null
          quantidade?: number
          recebido_por?: string | null
          setor_destino: string
          status?: string
          updated_at?: string
        }
        Update: {
          armazenamento_id?: string | null
          created_at?: string
          data_distribuicao?: string
          entregue_por?: string | null
          finalidade?: string | null
          id?: string
          kit_id?: string | null
          lote?: string
          material_id?: string | null
          observacoes?: string | null
          profissional_solicitante?: string | null
          quantidade?: number
          recebido_por?: string | null
          setor_destino?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cme_distribuicoes_armazenamento_id_fkey"
            columns: ["armazenamento_id"]
            isOneToOne: false
            referencedRelation: "cme_armazenamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_distribuicoes_entregue_por_fkey"
            columns: ["entregue_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_distribuicoes_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "cme_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_distribuicoes_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "cme_materiais"
            referencedColumns: ["id"]
          },
        ]
      }
      cme_equipamentos: {
        Row: {
          created_at: string
          fabricante: string | null
          id: string
          localizacao: string | null
          modelo: string | null
          nome: string
          numero_serie: string | null
          observacoes: string | null
          proxima_manutencao: string | null
          status: string
          tipo: string
          ultima_manutencao: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          fabricante?: string | null
          id?: string
          localizacao?: string | null
          modelo?: string | null
          nome: string
          numero_serie?: string | null
          observacoes?: string | null
          proxima_manutencao?: string | null
          status?: string
          tipo?: string
          ultima_manutencao?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          fabricante?: string | null
          id?: string
          localizacao?: string | null
          modelo?: string | null
          nome?: string
          numero_serie?: string | null
          observacoes?: string | null
          proxima_manutencao?: string | null
          status?: string
          tipo?: string
          ultima_manutencao?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cme_etapas_processamento: {
        Row: {
          checklist: Json | null
          created_at: string
          data_fim: string | null
          data_inicio: string
          embalagem_utilizada: string | null
          equipamento_utilizado: string | null
          etapa: string
          id: string
          inspecao_visual: boolean | null
          integridade_ok: boolean | null
          observacoes: string | null
          recebimento_id: string
          responsavel_id: string | null
          selagem_ok: boolean | null
          tipo_limpeza: string | null
        }
        Insert: {
          checklist?: Json | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          embalagem_utilizada?: string | null
          equipamento_utilizado?: string | null
          etapa: string
          id?: string
          inspecao_visual?: boolean | null
          integridade_ok?: boolean | null
          observacoes?: string | null
          recebimento_id: string
          responsavel_id?: string | null
          selagem_ok?: boolean | null
          tipo_limpeza?: string | null
        }
        Update: {
          checklist?: Json | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          embalagem_utilizada?: string | null
          equipamento_utilizado?: string | null
          etapa?: string
          id?: string
          inspecao_visual?: boolean | null
          integridade_ok?: boolean | null
          observacoes?: string | null
          recebimento_id?: string
          responsavel_id?: string | null
          selagem_ok?: boolean | null
          tipo_limpeza?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cme_etapas_processamento_recebimento_id_fkey"
            columns: ["recebimento_id"]
            isOneToOne: false
            referencedRelation: "cme_recebimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_etapas_processamento_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cme_kit_itens: {
        Row: {
          created_at: string
          id: string
          kit_id: string
          material_id: string
          obrigatorio: boolean | null
          observacoes: string | null
          quantidade: number
        }
        Insert: {
          created_at?: string
          id?: string
          kit_id: string
          material_id: string
          obrigatorio?: boolean | null
          observacoes?: string | null
          quantidade?: number
        }
        Update: {
          created_at?: string
          id?: string
          kit_id?: string
          material_id?: string
          obrigatorio?: boolean | null
          observacoes?: string | null
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "cme_kit_itens_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "cme_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_kit_itens_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "cme_materiais"
            referencedColumns: ["id"]
          },
        ]
      }
      cme_kits: {
        Row: {
          codigo: string | null
          created_at: string
          especialidade: string | null
          id: string
          instrucoes_montagem: string | null
          metodo_esterilizacao: string | null
          nome: string
          observacoes: string | null
          setores_uso: string | null
          status: string
          tipo_embalagem: string | null
          updated_at: string
        }
        Insert: {
          codigo?: string | null
          created_at?: string
          especialidade?: string | null
          id?: string
          instrucoes_montagem?: string | null
          metodo_esterilizacao?: string | null
          nome: string
          observacoes?: string | null
          setores_uso?: string | null
          status?: string
          tipo_embalagem?: string | null
          updated_at?: string
        }
        Update: {
          codigo?: string | null
          created_at?: string
          especialidade?: string | null
          id?: string
          instrucoes_montagem?: string | null
          metodo_esterilizacao?: string | null
          nome?: string
          observacoes?: string | null
          setores_uso?: string | null
          status?: string
          tipo_embalagem?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cme_logs_rastreabilidade: {
        Row: {
          acao: string
          created_at: string
          detalhes: Json | null
          entidade_id: string
          entidade_tipo: string
          id: string
          usuario_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          detalhes?: Json | null
          entidade_id: string
          entidade_tipo: string
          id?: string
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          detalhes?: Json | null
          entidade_id?: string
          entidade_tipo?: string
          id?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cme_logs_rastreabilidade_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cme_materiais: {
        Row: {
          categoria: string | null
          codigo: string
          complexidade: string | null
          created_at: string
          criticidade: string
          descricao: string | null
          embalagem_especifica: boolean | null
          especialidade: string | null
          id: string
          metodo_esterilizacao: string | null
          necessita_montagem_kit: boolean | null
          nome: string
          observacoes: string | null
          setor_principal: string | null
          status: string
          tempo_processamento_min: number | null
          tipo: string
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          codigo: string
          complexidade?: string | null
          created_at?: string
          criticidade?: string
          descricao?: string | null
          embalagem_especifica?: boolean | null
          especialidade?: string | null
          id?: string
          metodo_esterilizacao?: string | null
          necessita_montagem_kit?: boolean | null
          nome: string
          observacoes?: string | null
          setor_principal?: string | null
          status?: string
          tempo_processamento_min?: number | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          codigo?: string
          complexidade?: string | null
          created_at?: string
          criticidade?: string
          descricao?: string | null
          embalagem_especifica?: boolean | null
          especialidade?: string | null
          id?: string
          metodo_esterilizacao?: string | null
          necessita_montagem_kit?: boolean | null
          nome?: string
          observacoes?: string | null
          setor_principal?: string | null
          status?: string
          tempo_processamento_min?: number | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      cme_nao_conformidades: {
        Row: {
          acao_corretiva: string | null
          carga_id: string | null
          created_at: string
          data_ocorrencia: string
          data_resolucao: string | null
          descricao: string
          equipamento_id: string | null
          id: string
          kit_id: string | null
          material_id: string | null
          observacoes: string | null
          responsavel_id: string | null
          severidade: string
          status: string
          tipo: string
          updated_at: string
        }
        Insert: {
          acao_corretiva?: string | null
          carga_id?: string | null
          created_at?: string
          data_ocorrencia?: string
          data_resolucao?: string | null
          descricao: string
          equipamento_id?: string | null
          id?: string
          kit_id?: string | null
          material_id?: string | null
          observacoes?: string | null
          responsavel_id?: string | null
          severidade?: string
          status?: string
          tipo: string
          updated_at?: string
        }
        Update: {
          acao_corretiva?: string | null
          carga_id?: string | null
          created_at?: string
          data_ocorrencia?: string
          data_resolucao?: string | null
          descricao?: string
          equipamento_id?: string | null
          id?: string
          kit_id?: string | null
          material_id?: string | null
          observacoes?: string | null
          responsavel_id?: string | null
          severidade?: string
          status?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cme_nao_conformidades_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: false
            referencedRelation: "cme_cargas_esterilizacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_nao_conformidades_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "cme_equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_nao_conformidades_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "cme_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_nao_conformidades_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "cme_materiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_nao_conformidades_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cme_recebimentos: {
        Row: {
          created_at: string
          data_recebimento: string
          id: string
          kit_id: string | null
          material_id: string | null
          observacoes: string | null
          prioridade: string | null
          profissional_entregou: string | null
          quantidade: number
          recebido_por: string | null
          setor_origem: string
          situacao_sujidade: string | null
          status: string
          tipo_material: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_recebimento?: string
          id?: string
          kit_id?: string | null
          material_id?: string | null
          observacoes?: string | null
          prioridade?: string | null
          profissional_entregou?: string | null
          quantidade?: number
          recebido_por?: string | null
          setor_origem: string
          situacao_sujidade?: string | null
          status?: string
          tipo_material: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_recebimento?: string
          id?: string
          kit_id?: string | null
          material_id?: string | null
          observacoes?: string | null
          prioridade?: string | null
          profissional_entregou?: string | null
          quantidade?: number
          recebido_por?: string | null
          setor_origem?: string
          situacao_sujidade?: string | null
          status?: string
          tipo_material?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cme_recebimentos_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "cme_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_recebimentos_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "cme_materiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_recebimentos_recebido_por_fkey"
            columns: ["recebido_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cme_testes_qualidade: {
        Row: {
          acao_corretiva: string | null
          carga_id: string | null
          created_at: string
          data_teste: string
          equipamento_id: string | null
          id: string
          lote_indicador: string | null
          observacoes: string | null
          responsavel_id: string | null
          resultado: string
          situacao: string | null
          tipo_teste: string
        }
        Insert: {
          acao_corretiva?: string | null
          carga_id?: string | null
          created_at?: string
          data_teste?: string
          equipamento_id?: string | null
          id?: string
          lote_indicador?: string | null
          observacoes?: string | null
          responsavel_id?: string | null
          resultado?: string
          situacao?: string | null
          tipo_teste: string
        }
        Update: {
          acao_corretiva?: string | null
          carga_id?: string | null
          created_at?: string
          data_teste?: string
          equipamento_id?: string | null
          id?: string
          lote_indicador?: string | null
          observacoes?: string | null
          responsavel_id?: string | null
          resultado?: string
          situacao?: string | null
          tipo_teste?: string
        }
        Relationships: [
          {
            foreignKeyName: "cme_testes_qualidade_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: false
            referencedRelation: "cme_cargas_esterilizacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_testes_qualidade_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "cme_equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cme_testes_qualidade_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      evolution_notes: {
        Row: {
          assessment: string | null
          content: string
          created_at: string
          id: string
          note_type: string
          objective: string | null
          patient_id: string
          plan: string | null
          professional_id: string
          subjective: string | null
        }
        Insert: {
          assessment?: string | null
          content: string
          created_at?: string
          id?: string
          note_type: string
          objective?: string | null
          patient_id: string
          plan?: string | null
          professional_id: string
          subjective?: string | null
        }
        Update: {
          assessment?: string | null
          content?: string
          created_at?: string
          id?: string
          note_type?: string
          objective?: string | null
          patient_id?: string
          plan?: string | null
          professional_id?: string
          subjective?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evolution_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evolution_notes_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_gallery_items: {
        Row: {
          annotations: Json | null
          category: string
          created_at: string
          equipment: string | null
          exam_date: string
          exam_request_id: string | null
          exam_time: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          laterality: string | null
          metadata: Json | null
          mime_type: string | null
          observations: string | null
          origin: string | null
          patient_id: string
          professional_name: string | null
          report_text: string | null
          report_url: string | null
          status: string
          subcategory: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          annotations?: Json | null
          category?: string
          created_at?: string
          equipment?: string | null
          exam_date?: string
          exam_request_id?: string | null
          exam_time?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string
          file_url: string
          id?: string
          laterality?: string | null
          metadata?: Json | null
          mime_type?: string | null
          observations?: string | null
          origin?: string | null
          patient_id: string
          professional_name?: string | null
          report_text?: string | null
          report_url?: string | null
          status?: string
          subcategory?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          annotations?: Json | null
          category?: string
          created_at?: string
          equipment?: string | null
          exam_date?: string
          exam_request_id?: string | null
          exam_time?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          laterality?: string | null
          metadata?: Json | null
          mime_type?: string | null
          observations?: string | null
          origin?: string | null
          patient_id?: string
          professional_name?: string | null
          report_text?: string | null
          report_url?: string | null
          status?: string
          subcategory?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_gallery_items_exam_request_id_fkey"
            columns: ["exam_request_id"]
            isOneToOne: false
            referencedRelation: "exam_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_gallery_items_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_gallery_items_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_requests: {
        Row: {
          collected_at: string | null
          created_at: string
          exam_category: string
          exam_type: string
          id: string
          observations: string | null
          patient_id: string
          priority: string
          requested_by: string
          result_date: string | null
          result_text: string | null
          status: string
          updated_at: string
        }
        Insert: {
          collected_at?: string | null
          created_at?: string
          exam_category?: string
          exam_type: string
          id?: string
          observations?: string | null
          patient_id: string
          priority?: string
          requested_by: string
          result_date?: string | null
          result_text?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          collected_at?: string | null
          created_at?: string
          exam_category?: string
          exam_type?: string
          id?: string
          observations?: string | null
          patient_id?: string
          priority?: string
          requested_by?: string
          result_date?: string | null
          result_text?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fluid_balance: {
        Row: {
          created_at: string
          direction: string
          id: string
          notes: string | null
          patient_id: string
          recorded_at: string
          recorded_by: string
          shift: string | null
          type: string
          volume_ml: number
        }
        Insert: {
          created_at?: string
          direction: string
          id?: string
          notes?: string | null
          patient_id: string
          recorded_at?: string
          recorded_by: string
          shift?: string | null
          type: string
          volume_ml: number
        }
        Update: {
          created_at?: string
          direction?: string
          id?: string
          notes?: string | null
          patient_id?: string
          recorded_at?: string
          recorded_by?: string
          shift?: string | null
          type?: string
          volume_ml?: number
        }
        Relationships: [
          {
            foreignKeyName: "fluid_balance_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fluid_balance_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      glasgow_scale: {
        Row: {
          evaluated_at: string
          evaluated_by: string
          eye_response: number
          id: string
          motor_response: number
          notes: string | null
          patient_id: string
          pupil_left: string | null
          pupil_right: string | null
          total_score: number | null
          verbal_response: number
        }
        Insert: {
          evaluated_at?: string
          evaluated_by: string
          eye_response: number
          id?: string
          motor_response: number
          notes?: string | null
          patient_id: string
          pupil_left?: string | null
          pupil_right?: string | null
          total_score?: number | null
          verbal_response: number
        }
        Update: {
          evaluated_at?: string
          evaluated_by?: string
          eye_response?: number
          id?: string
          motor_response?: number
          notes?: string | null
          patient_id?: string
          pupil_left?: string | null
          pupil_right?: string | null
          total_score?: number | null
          verbal_response?: number
        }
        Relationships: [
          {
            foreignKeyName: "glasgow_scale_evaluated_by_fkey"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "glasgow_scale_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_history: {
        Row: {
          created_at: string
          date: string | null
          description: string
          history_type: string
          id: string
          notes: string | null
          patient_id: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          description: string
          history_type: string
          id?: string
          notes?: string | null
          patient_id: string
        }
        Update: {
          created_at?: string
          date?: string | null
          description?: string
          history_type?: string
          id?: string
          notes?: string | null
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_history_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_administrations: {
        Row: {
          administered_at: string | null
          administered_by: string
          created_at: string
          id: string
          medication_id: string
          notes: string | null
          patient_id: string
          scheduled_time: string
          status: string
        }
        Insert: {
          administered_at?: string | null
          administered_by: string
          created_at?: string
          id?: string
          medication_id: string
          notes?: string | null
          patient_id: string
          scheduled_time: string
          status?: string
        }
        Update: {
          administered_at?: string | null
          administered_by?: string
          created_at?: string
          id?: string
          medication_id?: string
          notes?: string | null
          patient_id?: string
          scheduled_time?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_administrations_administered_by_fkey"
            columns: ["administered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_administrations_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_administrations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          instructions: string | null
          name: string
          patient_id: string
          prescribed_by: string
          route: string
          start_date: string
          status: Database["public"]["Enums"]["medication_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          instructions?: string | null
          name: string
          patient_id: string
          prescribed_by: string
          route: string
          start_date: string
          status?: Database["public"]["Enums"]["medication_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          name?: string
          patient_id?: string
          prescribed_by?: string
          route?: string
          start_date?: string
          status?: Database["public"]["Enums"]["medication_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medications_prescribed_by_fkey"
            columns: ["prescribed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      morse_scale: {
        Row: {
          ambulatory_aid: number
          evaluated_at: string
          evaluated_by: string
          fall_history: number
          gait: number
          id: string
          iv_therapy: number
          mental_status: number
          notes: string | null
          patient_id: string
          secondary_diagnosis: number
          total_score: number | null
        }
        Insert: {
          ambulatory_aid: number
          evaluated_at?: string
          evaluated_by: string
          fall_history: number
          gait: number
          id?: string
          iv_therapy: number
          mental_status: number
          notes?: string | null
          patient_id: string
          secondary_diagnosis: number
          total_score?: number | null
        }
        Update: {
          ambulatory_aid?: number
          evaluated_at?: string
          evaluated_by?: string
          fall_history?: number
          gait?: number
          id?: string
          iv_therapy?: number
          mental_status?: number
          notes?: string | null
          patient_id?: string
          secondary_diagnosis?: number
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "morse_scale_evaluated_by_fkey"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "morse_scale_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      multidisciplinary_notes: {
        Row: {
          content: string
          created_at: string
          goals: string | null
          id: string
          note_type: string
          patient_id: string
          professional_id: string
          specialty: string
          therapeutic_plan: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          goals?: string | null
          id?: string
          note_type?: string
          patient_id: string
          professional_id: string
          specialty: string
          therapeutic_plan?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          goals?: string | null
          id?: string
          note_type?: string
          patient_id?: string
          professional_id?: string
          specialty?: string
          therapeutic_plan?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "multidisciplinary_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "multidisciplinary_notes_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          admission_date: string | null
          bed: string | null
          birth_date: string
          blood_type: string | null
          cpf: string | null
          created_at: string
          emergency_contact: string | null
          emergency_phone: string | null
          full_name: string
          gender: string
          health_insurance: string | null
          health_insurance_number: string | null
          id: string
          nome_social: string | null
          phone: string | null
          photo_url: string | null
          rg: string | null
          room: string | null
          status: Database["public"]["Enums"]["patient_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          admission_date?: string | null
          bed?: string | null
          birth_date: string
          blood_type?: string | null
          cpf?: string | null
          created_at?: string
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name: string
          gender: string
          health_insurance?: string | null
          health_insurance_number?: string | null
          id?: string
          nome_social?: string | null
          phone?: string | null
          photo_url?: string | null
          rg?: string | null
          room?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          admission_date?: string | null
          bed?: string | null
          birth_date?: string
          blood_type?: string | null
          cpf?: string | null
          created_at?: string
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name?: string
          gender?: string
          health_insurance?: string | null
          health_insurance_number?: string | null
          id?: string
          nome_social?: string | null
          phone?: string | null
          photo_url?: string | null
          rg?: string | null
          room?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          updated_at?: string
        }
        Relationships: []
      }
      pharmacy_dispensations: {
        Row: {
          batch_number: string | null
          created_at: string
          dispensed_at: string | null
          dispensed_by: string
          id: string
          medication_id: string
          notes: string | null
          patient_id: string
          quantity: number
          status: string
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          dispensed_at?: string | null
          dispensed_by: string
          id?: string
          medication_id: string
          notes?: string | null
          patient_id: string
          quantity?: number
          status?: string
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          dispensed_at?: string | null
          dispensed_by?: string
          id?: string
          medication_id?: string
          notes?: string | null
          patient_id?: string
          quantity?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_dispensations_dispensed_by_fkey"
            columns: ["dispensed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_dispensations_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_dispensations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          crm_coren: string | null
          full_name: string
          id: string
          role: Database["public"]["Enums"]["professional_role"]
          specialty: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          crm_coren?: string | null
          full_name: string
          id: string
          role?: Database["public"]["Enums"]["professional_role"]
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          crm_coren?: string | null
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["professional_role"]
          specialty?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      queue_counters: {
        Row: {
          counter_date: string
          id: string
          last_number: number
          queue_name: string
        }
        Insert: {
          counter_date?: string
          id?: string
          last_number?: number
          queue_name: string
        }
        Update: {
          counter_date?: string
          id?: string
          last_number?: number
          queue_name?: string
        }
        Relationships: []
      }
      queue_history: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          new_status: string | null
          old_status: string | null
          performed_by: string | null
          ticket_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          new_status?: string | null
          old_status?: string | null
          performed_by?: string | null
          ticket_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          new_status?: string | null
          old_status?: string | null
          performed_by?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "queue_history_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "queue_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      queue_tickets: {
        Row: {
          appointment_id: string | null
          attended_at: string | null
          called_at: string | null
          called_to: string | null
          checkin_data: Json | null
          completed_at: string | null
          created_at: string
          id: string
          notification_enabled: boolean | null
          notification_token: string | null
          patient_id: string | null
          priority: number
          queue_name: string
          recall_count: number
          sector: string
          source: string
          status: string
          ticket_number: string
          ticket_type: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          attended_at?: string | null
          called_at?: string | null
          called_to?: string | null
          checkin_data?: Json | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notification_enabled?: boolean | null
          notification_token?: string | null
          patient_id?: string | null
          priority?: number
          queue_name?: string
          recall_count?: number
          sector?: string
          source?: string
          status?: string
          ticket_number: string
          ticket_type?: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          attended_at?: string | null
          called_at?: string | null
          called_to?: string | null
          checkin_data?: Json | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notification_enabled?: boolean | null
          notification_token?: string | null
          patient_id?: string | null
          priority?: number
          queue_name?: string
          recall_count?: number
          sector?: string
          source?: string
          status?: string
          ticket_number?: string
          ticket_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "queue_tickets_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_tickets_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      surgical_procedures: {
        Row: {
          anesthesia_type: string | null
          created_at: string
          description: string | null
          end_time: string | null
          id: string
          notes: string | null
          patient_id: string
          procedure_type: string
          scheduled_date: string | null
          start_time: string | null
          status: string
          surgeon_id: string
          team_members: string | null
          updated_at: string
        }
        Insert: {
          anesthesia_type?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          procedure_type: string
          scheduled_date?: string | null
          start_time?: string | null
          status?: string
          surgeon_id: string
          team_members?: string | null
          updated_at?: string
        }
        Update: {
          anesthesia_type?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          procedure_type?: string
          scheduled_date?: string | null
          start_time?: string | null
          status?: string
          surgeon_id?: string
          team_members?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "surgical_procedures_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgical_procedures_surgeon_id_fkey"
            columns: ["surgeon_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_ads: {
        Row: {
          active: boolean
          created_at: string
          display_order: number
          duration_seconds: number
          id: string
          media_type: string
          media_url: string
          title: string
          unit_config_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_order?: number
          duration_seconds?: number
          id?: string
          media_type?: string
          media_url: string
          title: string
          unit_config_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          display_order?: number
          duration_seconds?: number
          id?: string
          media_type?: string
          media_url?: string
          title?: string
          unit_config_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unit_ads_unit_config_id_fkey"
            columns: ["unit_config_id"]
            isOneToOne: false
            referencedRelation: "unit_config"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_config: {
        Row: {
          ads_enabled: boolean
          ads_idle_seconds: number
          ads_interval_seconds: number
          background_image_url: string | null
          call_display_seconds: number
          created_at: string
          id: string
          locution_enabled: boolean
          locution_speak_location: boolean
          locution_speak_priority: boolean
          logo_url: string | null
          pre_call_sound: string
          primary_color: string | null
          print_auto: boolean
          print_auto_cut: boolean
          print_block_spacing: number
          print_copies: number
          print_cut_extra_height: number
          print_enabled: boolean
          print_font_size: string
          print_footer_text: string
          print_header_text: string
          print_margin_bottom: number
          print_margin_left: number
          print_margin_right: number
          print_margin_top: number
          print_paper_width: string
          print_show_logo: boolean
          print_show_qr: boolean
          print_template: string
          privacy_mode: string
          result_countdown_seconds: number
          secondary_color: string | null
          show_clock: boolean
          show_history: boolean
          social_name_policy: string
          sound_enabled: boolean
          totem_checkin: boolean
          totem_retirar_senha: boolean
          totem_timeout_seconds: number
          unit_name: string
          updated_at: string
          voice_pitch: number
          voice_rate: number
          voice_volume: number
        }
        Insert: {
          ads_enabled?: boolean
          ads_idle_seconds?: number
          ads_interval_seconds?: number
          background_image_url?: string | null
          call_display_seconds?: number
          created_at?: string
          id?: string
          locution_enabled?: boolean
          locution_speak_location?: boolean
          locution_speak_priority?: boolean
          logo_url?: string | null
          pre_call_sound?: string
          primary_color?: string | null
          print_auto?: boolean
          print_auto_cut?: boolean
          print_block_spacing?: number
          print_copies?: number
          print_cut_extra_height?: number
          print_enabled?: boolean
          print_font_size?: string
          print_footer_text?: string
          print_header_text?: string
          print_margin_bottom?: number
          print_margin_left?: number
          print_margin_right?: number
          print_margin_top?: number
          print_paper_width?: string
          print_show_logo?: boolean
          print_show_qr?: boolean
          print_template?: string
          privacy_mode?: string
          result_countdown_seconds?: number
          secondary_color?: string | null
          show_clock?: boolean
          show_history?: boolean
          social_name_policy?: string
          sound_enabled?: boolean
          totem_checkin?: boolean
          totem_retirar_senha?: boolean
          totem_timeout_seconds?: number
          unit_name?: string
          updated_at?: string
          voice_pitch?: number
          voice_rate?: number
          voice_volume?: number
        }
        Update: {
          ads_enabled?: boolean
          ads_idle_seconds?: number
          ads_interval_seconds?: number
          background_image_url?: string | null
          call_display_seconds?: number
          created_at?: string
          id?: string
          locution_enabled?: boolean
          locution_speak_location?: boolean
          locution_speak_priority?: boolean
          logo_url?: string | null
          pre_call_sound?: string
          primary_color?: string | null
          print_auto?: boolean
          print_auto_cut?: boolean
          print_block_spacing?: number
          print_copies?: number
          print_cut_extra_height?: number
          print_enabled?: boolean
          print_font_size?: string
          print_footer_text?: string
          print_header_text?: string
          print_margin_bottom?: number
          print_margin_left?: number
          print_margin_right?: number
          print_margin_top?: number
          print_paper_width?: string
          print_show_logo?: boolean
          print_show_qr?: boolean
          print_template?: string
          privacy_mode?: string
          result_countdown_seconds?: number
          secondary_color?: string | null
          show_clock?: boolean
          show_history?: boolean
          social_name_policy?: string
          sound_enabled?: boolean
          totem_checkin?: boolean
          totem_retirar_senha?: boolean
          totem_timeout_seconds?: number
          unit_name?: string
          updated_at?: string
          voice_pitch?: number
          voice_rate?: number
          voice_volume?: number
        }
        Relationships: []
      }
      vital_signs: {
        Row: {
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          created_at: string
          glucose: number | null
          heart_rate: number | null
          height: number | null
          id: string
          notes: string | null
          oxygen_saturation: number | null
          pain_level: number | null
          patient_id: string
          recorded_at: string
          recorded_by: string
          respiratory_rate: number | null
          temperature: number | null
          weight: number | null
        }
        Insert: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string
          glucose?: number | null
          heart_rate?: number | null
          height?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          pain_level?: number | null
          patient_id: string
          recorded_at?: string
          recorded_by: string
          respiratory_rate?: number | null
          temperature?: number | null
          weight?: number | null
        }
        Update: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string
          glucose?: number | null
          heart_rate?: number | null
          height?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          pain_level?: number | null
          patient_id?: string
          recorded_at?: string
          recorded_by?: string
          respiratory_rate?: number | null
          temperature?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vital_signs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vital_signs_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      allergy_severity: "leve" | "moderada" | "grave"
      medication_status: "ativo" | "suspenso" | "concluido"
      patient_status:
        | "internado"
        | "ambulatorial"
        | "alta"
        | "transferido"
        | "obito"
      professional_role:
        | "medico"
        | "enfermeiro"
        | "tecnico_enfermagem"
        | "fisioterapeuta"
        | "nutricionista"
        | "psicologo"
        | "farmaceutico"
        | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      allergy_severity: ["leve", "moderada", "grave"],
      medication_status: ["ativo", "suspenso", "concluido"],
      patient_status: [
        "internado",
        "ambulatorial",
        "alta",
        "transferido",
        "obito",
      ],
      professional_role: [
        "medico",
        "enfermeiro",
        "tecnico_enfermagem",
        "fisioterapeuta",
        "nutricionista",
        "psicologo",
        "farmaceutico",
        "admin",
      ],
    },
  },
} as const
