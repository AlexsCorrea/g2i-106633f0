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
          phone?: string | null
          photo_url?: string | null
          rg?: string | null
          room?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          updated_at?: string
        }
        Relationships: []
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
