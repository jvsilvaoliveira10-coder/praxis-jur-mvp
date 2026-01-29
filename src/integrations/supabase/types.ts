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
      cases: {
        Row: {
          action_type: Database["public"]["Enums"]["action_type"]
          client_id: string
          court: string
          created_at: string
          id: string
          opposing_party: string
          process_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action_type: Database["public"]["Enums"]["action_type"]
          client_id: string
          court: string
          created_at?: string
          id?: string
          opposing_party: string
          process_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["action_type"]
          client_id?: string
          court?: string
          created_at?: string
          id?: string
          opposing_party?: string
          process_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address_city: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          created_at: string
          document: string
          email: string | null
          id: string
          issuing_body: string | null
          legal_rep_cpf: string | null
          legal_rep_name: string | null
          legal_rep_position: string | null
          marital_status: Database["public"]["Enums"]["marital_status"] | null
          name: string
          nationality: string | null
          phone: string | null
          profession: string | null
          rg: string | null
          state_registration: string | null
          trade_name: string | null
          type: Database["public"]["Enums"]["client_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          created_at?: string
          document: string
          email?: string | null
          id?: string
          issuing_body?: string | null
          legal_rep_cpf?: string | null
          legal_rep_name?: string | null
          legal_rep_position?: string | null
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          name: string
          nationality?: string | null
          phone?: string | null
          profession?: string | null
          rg?: string | null
          state_registration?: string | null
          trade_name?: string | null
          type: Database["public"]["Enums"]["client_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          created_at?: string
          document?: string
          email?: string | null
          id?: string
          issuing_body?: string | null
          legal_rep_cpf?: string | null
          legal_rep_name?: string | null
          legal_rep_position?: string | null
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          name?: string
          nationality?: string | null
          phone?: string | null
          profession?: string | null
          rg?: string | null
          state_registration?: string | null
          trade_name?: string | null
          type?: Database["public"]["Enums"]["client_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deadlines: {
        Row: {
          case_id: string
          created_at: string
          deadline_datetime: string
          deadline_type: Database["public"]["Enums"]["deadline_type"]
          description: string | null
          google_event_id: string | null
          id: string
          notified_1_day: boolean
          notified_3_days: boolean
          notified_7_days: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          case_id: string
          created_at?: string
          deadline_datetime: string
          deadline_type: Database["public"]["Enums"]["deadline_type"]
          description?: string | null
          google_event_id?: string | null
          id?: string
          notified_1_day?: boolean
          notified_3_days?: boolean
          notified_7_days?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          case_id?: string
          created_at?: string
          deadline_datetime?: string
          deadline_type?: Database["public"]["Enums"]["deadline_type"]
          description?: string | null
          google_event_id?: string | null
          id?: string
          notified_1_day?: boolean
          notified_3_days?: boolean
          notified_7_days?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deadlines_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      jurisprudence_results: {
        Row: {
          created_at: string
          decision_type: string | null
          ementa: string
          external_id: string | null
          full_text: string | null
          id: string
          judgment_date: string | null
          metadata: Json | null
          orgao_julgador: string | null
          pdf_url: string | null
          process_number: string | null
          relator: string | null
          search_id: string | null
        }
        Insert: {
          created_at?: string
          decision_type?: string | null
          ementa: string
          external_id?: string | null
          full_text?: string | null
          id?: string
          judgment_date?: string | null
          metadata?: Json | null
          orgao_julgador?: string | null
          pdf_url?: string | null
          process_number?: string | null
          relator?: string | null
          search_id?: string | null
        }
        Update: {
          created_at?: string
          decision_type?: string | null
          ementa?: string
          external_id?: string | null
          full_text?: string | null
          id?: string
          judgment_date?: string | null
          metadata?: Json | null
          orgao_julgador?: string | null
          pdf_url?: string | null
          process_number?: string | null
          relator?: string | null
          search_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jurisprudence_results_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "jurisprudence_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      jurisprudence_searches: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          query_hash: string
          query_text: string
          results_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          query_hash: string
          query_text: string
          results_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          query_hash?: string
          query_text?: string
          results_count?: number
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          deadline_id: string | null
          id: string
          message: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deadline_id?: string | null
          id?: string
          message: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          deadline_id?: string | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_deadline_id_fkey"
            columns: ["deadline_id"]
            isOneToOne: false
            referencedRelation: "deadlines"
            referencedColumns: ["id"]
          },
        ]
      }
      petition_jurisprudence: {
        Row: {
          created_at: string
          id: string
          jurisprudence_id: string
          petition_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          jurisprudence_id: string
          petition_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          jurisprudence_id?: string
          petition_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "petition_jurisprudence_jurisprudence_id_fkey"
            columns: ["jurisprudence_id"]
            isOneToOne: false
            referencedRelation: "jurisprudence_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "petition_jurisprudence_petition_id_fkey"
            columns: ["petition_id"]
            isOneToOne: false
            referencedRelation: "petitions"
            referencedColumns: ["id"]
          },
        ]
      }
      petition_templates: {
        Row: {
          active: boolean
          content: string
          created_at: string
          folder_id: string | null
          id: string
          piece_type: Database["public"]["Enums"]["piece_type"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          content: string
          created_at?: string
          folder_id?: string | null
          id?: string
          piece_type: Database["public"]["Enums"]["piece_type"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          content?: string
          created_at?: string
          folder_id?: string | null
          id?: string
          piece_type?: Database["public"]["Enums"]["piece_type"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "petition_templates_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "template_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      petitions: {
        Row: {
          case_id: string
          content: string
          created_at: string
          id: string
          petition_type: Database["public"]["Enums"]["petition_type"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          case_id: string
          content: string
          created_at?: string
          id?: string
          petition_type: Database["public"]["Enums"]["petition_type"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          case_id?: string
          content?: string
          created_at?: string
          id?: string
          petition_type?: Database["public"]["Enums"]["petition_type"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "petitions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      process_movements: {
        Row: {
          codigo: number | null
          complementos: Json | null
          created_at: string
          data_hora: string
          id: string
          nome: string
          notified: boolean
          orgao_julgador: string | null
          tracked_process_id: string
        }
        Insert: {
          codigo?: number | null
          complementos?: Json | null
          created_at?: string
          data_hora: string
          id?: string
          nome: string
          notified?: boolean
          orgao_julgador?: string | null
          tracked_process_id: string
        }
        Update: {
          codigo?: number | null
          complementos?: Json | null
          created_at?: string
          data_hora?: string
          id?: string
          nome?: string
          notified?: boolean
          orgao_julgador?: string | null
          tracked_process_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "process_movements_tracked_process_id_fkey"
            columns: ["tracked_process_id"]
            isOneToOne: false
            referencedRelation: "tracked_processes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_jurisprudence: {
        Row: {
          created_at: string
          id: string
          jurisprudence_id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          jurisprudence_id: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          jurisprudence_id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jurisprudence_jurisprudence_id_fkey"
            columns: ["jurisprudence_id"]
            isOneToOne: false
            referencedRelation: "jurisprudence_results"
            referencedColumns: ["id"]
          },
        ]
      }
      template_folders: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tracked_processes: {
        Row: {
          active: boolean
          assuntos: string[] | null
          case_id: string | null
          classe: string | null
          created_at: string
          data_ajuizamento: string | null
          id: string
          last_checked_at: string | null
          orgao_julgador: string | null
          process_number: string
          tribunal: string
          ultimo_movimento: string | null
          ultimo_movimento_data: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          assuntos?: string[] | null
          case_id?: string | null
          classe?: string | null
          created_at?: string
          data_ajuizamento?: string | null
          id?: string
          last_checked_at?: string | null
          orgao_julgador?: string | null
          process_number: string
          tribunal: string
          ultimo_movimento?: string | null
          ultimo_movimento_data?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          assuntos?: string[] | null
          case_id?: string | null
          classe?: string | null
          created_at?: string
          data_ajuizamento?: string | null
          id?: string
          last_checked_at?: string | null
          orgao_julgador?: string | null
          process_number?: string
          tribunal?: string
          ultimo_movimento?: string | null
          ultimo_movimento_data?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracked_processes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
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
      action_type:
        | "obrigacao_de_fazer"
        | "cobranca"
        | "indenizacao_danos_morais"
      client_type: "pessoa_fisica" | "pessoa_juridica"
      deadline_type: "prazo_processual" | "audiencia" | "compromisso"
      marital_status:
        | "solteiro"
        | "casado"
        | "divorciado"
        | "viuvo"
        | "uniao_estavel"
        | "separado"
      petition_type: "peticao_inicial" | "contestacao" | "peticao_simples"
      piece_type:
        | "peticao_inicial"
        | "contestacao"
        | "peticao_simples"
        | "recurso"
        | "agravo"
        | "apelacao"
        | "embargos"
        | "manifestacao"
        | "outros"
      user_role: "admin" | "advogado"
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
      action_type: [
        "obrigacao_de_fazer",
        "cobranca",
        "indenizacao_danos_morais",
      ],
      client_type: ["pessoa_fisica", "pessoa_juridica"],
      deadline_type: ["prazo_processual", "audiencia", "compromisso"],
      marital_status: [
        "solteiro",
        "casado",
        "divorciado",
        "viuvo",
        "uniao_estavel",
        "separado",
      ],
      petition_type: ["peticao_inicial", "contestacao", "peticao_simples"],
      piece_type: [
        "peticao_inicial",
        "contestacao",
        "peticao_simples",
        "recurso",
        "agravo",
        "apelacao",
        "embargos",
        "manifestacao",
        "outros",
      ],
      user_role: ["admin", "advogado"],
    },
  },
} as const
