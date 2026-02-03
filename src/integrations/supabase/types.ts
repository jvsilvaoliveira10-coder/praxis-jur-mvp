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
      case_activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["case_activity_type"]
          case_id: string
          created_at: string
          description: string
          from_stage_id: string | null
          id: string
          metadata: Json | null
          to_stage_id: string | null
          user_id: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["case_activity_type"]
          case_id: string
          created_at?: string
          description: string
          from_stage_id?: string | null
          id?: string
          metadata?: Json | null
          to_stage_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["case_activity_type"]
          case_id?: string
          created_at?: string
          description?: string
          from_stage_id?: string | null
          id?: string
          metadata?: Json | null
          to_stage_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_activities_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_activities_from_stage_id_fkey"
            columns: ["from_stage_id"]
            isOneToOne: false
            referencedRelation: "case_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_activities_to_stage_id_fkey"
            columns: ["to_stage_id"]
            isOneToOne: false
            referencedRelation: "case_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      case_pipeline: {
        Row: {
          assigned_to: string | null
          case_id: string
          due_date: string | null
          entered_at: string
          id: string
          notes: string | null
          priority: Database["public"]["Enums"]["case_priority"] | null
          stage_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          case_id: string
          due_date?: string | null
          entered_at?: string
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["case_priority"] | null
          stage_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          case_id?: string
          due_date?: string | null
          entered_at?: string
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["case_priority"] | null
          stage_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_pipeline_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_pipeline_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "case_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      case_stages: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          is_final: boolean | null
          name: string
          position: number
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_final?: boolean | null
          name: string
          position?: number
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_final?: boolean | null
          name?: string
          position?: number
          user_id?: string
        }
        Relationships: []
      }
      case_tasks: {
        Row: {
          case_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          case_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          case_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_tasks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
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
      cost_centers: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          user_id: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          user_id: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
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
      fee_contracts: {
        Row: {
          auto_generate_receivables: boolean
          billing_day: number | null
          case_id: string | null
          client_id: string
          contract_name: string
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          monthly_amount: number | null
          notes: string | null
          per_act_amount: number | null
          start_date: string
          success_fee_percentage: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_generate_receivables?: boolean
          billing_day?: number | null
          case_id?: string | null
          client_id: string
          contract_name: string
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          monthly_amount?: number | null
          notes?: string | null
          per_act_amount?: number | null
          start_date: string
          success_fee_percentage?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_generate_receivables?: boolean
          billing_day?: number | null
          case_id?: string | null
          client_id?: string
          contract_name?: string
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          monthly_amount?: number | null
          notes?: string | null
          per_act_amount?: number | null
          start_date?: string
          success_fee_percentage?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_contracts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_accounts: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          bank_name: string | null
          color: string | null
          created_at: string
          current_balance: number
          id: string
          initial_balance: number
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          bank_name?: string | null
          color?: string | null
          created_at?: string
          current_balance?: number
          id?: string
          initial_balance?: number
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          bank_name?: string | null
          color?: string | null
          created_at?: string
          current_balance?: number
          id?: string
          initial_balance?: number
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          is_system: boolean
          name: string
          parent_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_system?: boolean
          name: string
          parent_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_system?: boolean
          name?: string
          parent_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
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
      law_firm_settings: {
        Row: {
          address_city: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          bank_info: string | null
          cases_monthly_avg: number | null
          clients_range: Database["public"]["Enums"]["clients_range"] | null
          cnpj: string | null
          cpf: string | null
          created_at: string
          email: string | null
          firm_name: string | null
          firm_type: Database["public"]["Enums"]["firm_type"] | null
          id: string
          interns_count: number | null
          lawyer_name: string | null
          lawyers_count: number | null
          logo_url: string | null
          main_courts: string[] | null
          oab_number: string | null
          oab_state: string | null
          onboarding_completed: boolean
          onboarding_step: number
          phone: string | null
          practice_areas: string[] | null
          signature_text: string | null
          staff_count: number | null
          updated_at: string
          user_id: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          bank_info?: string | null
          cases_monthly_avg?: number | null
          clients_range?: Database["public"]["Enums"]["clients_range"] | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          firm_name?: string | null
          firm_type?: Database["public"]["Enums"]["firm_type"] | null
          id?: string
          interns_count?: number | null
          lawyer_name?: string | null
          lawyers_count?: number | null
          logo_url?: string | null
          main_courts?: string[] | null
          oab_number?: string | null
          oab_state?: string | null
          onboarding_completed?: boolean
          onboarding_step?: number
          phone?: string | null
          practice_areas?: string[] | null
          signature_text?: string | null
          staff_count?: number | null
          updated_at?: string
          user_id: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          bank_info?: string | null
          cases_monthly_avg?: number | null
          clients_range?: Database["public"]["Enums"]["clients_range"] | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          firm_name?: string | null
          firm_type?: Database["public"]["Enums"]["firm_type"] | null
          id?: string
          interns_count?: number | null
          lawyer_name?: string | null
          lawyers_count?: number | null
          logo_url?: string | null
          main_courts?: string[] | null
          oab_number?: string | null
          oab_state?: string | null
          onboarding_completed?: boolean
          onboarding_step?: number
          phone?: string | null
          practice_areas?: string[] | null
          signature_text?: string | null
          staff_count?: number | null
          updated_at?: string
          user_id?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      legal_articles: {
        Row: {
          article_number: string
          chapter: string | null
          code_id: string
          content: string
          created_at: string
          id: string
          keywords: string[] | null
          search_vector: unknown
          themes: string[] | null
          title: string | null
          updated_at: string
        }
        Insert: {
          article_number: string
          chapter?: string | null
          code_id: string
          content: string
          created_at?: string
          id?: string
          keywords?: string[] | null
          search_vector?: unknown
          themes?: string[] | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          article_number?: string
          chapter?: string | null
          code_id?: string
          content?: string
          created_at?: string
          id?: string
          keywords?: string[] | null
          search_vector?: unknown
          themes?: string[] | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_articles_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "legal_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_codes: {
        Row: {
          abbreviation: string
          active: boolean
          code_type: Database["public"]["Enums"]["code_type"]
          created_at: string
          id: string
          last_updated: string
          law_number: string | null
          name: string
          publication_date: string | null
          source_url: string | null
        }
        Insert: {
          abbreviation: string
          active?: boolean
          code_type: Database["public"]["Enums"]["code_type"]
          created_at?: string
          id?: string
          last_updated?: string
          law_number?: string | null
          name: string
          publication_date?: string | null
          source_url?: string | null
        }
        Update: {
          abbreviation?: string
          active?: boolean
          code_type?: Database["public"]["Enums"]["code_type"]
          created_at?: string
          id?: string
          last_updated?: string
          law_number?: string | null
          name?: string
          publication_date?: string | null
          source_url?: string | null
        }
        Relationships: []
      }
      legal_themes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          parent_id: string | null
          related_codes: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          related_codes?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          related_codes?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_themes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "legal_themes"
            referencedColumns: ["id"]
          },
        ]
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
      payables: {
        Row: {
          amount: number
          amount_paid: number
          barcode: string | null
          case_id: string | null
          category_id: string | null
          created_at: string
          description: string
          due_date: string
          id: string
          installment_number: number | null
          installments_total: number | null
          notes: string | null
          parent_payable_id: string | null
          payable_type: Database["public"]["Enums"]["payable_type"]
          payment_date: string | null
          recurrence: Database["public"]["Enums"]["recurrence_type"]
          recurrence_end_date: string | null
          status: Database["public"]["Enums"]["payment_status"]
          supplier_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          amount_paid?: number
          barcode?: string | null
          case_id?: string | null
          category_id?: string | null
          created_at?: string
          description: string
          due_date: string
          id?: string
          installment_number?: number | null
          installments_total?: number | null
          notes?: string | null
          parent_payable_id?: string | null
          payable_type?: Database["public"]["Enums"]["payable_type"]
          payment_date?: string | null
          recurrence?: Database["public"]["Enums"]["recurrence_type"]
          recurrence_end_date?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          supplier_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          amount_paid?: number
          barcode?: string | null
          case_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          installment_number?: number | null
          installments_total?: number | null
          notes?: string | null
          parent_payable_id?: string | null
          payable_type?: Database["public"]["Enums"]["payable_type"]
          payment_date?: string | null
          recurrence?: Database["public"]["Enums"]["recurrence_type"]
          recurrence_end_date?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          supplier_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payables_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payables_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payables_parent_payable_id_fkey"
            columns: ["parent_payable_id"]
            isOneToOne: false
            referencedRelation: "payables"
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
      receivables: {
        Row: {
          amount: number
          amount_paid: number
          case_id: string | null
          category_id: string | null
          client_id: string | null
          created_at: string
          description: string
          due_date: string
          id: string
          installment_number: number | null
          installments_total: number | null
          notes: string | null
          parent_receivable_id: string | null
          payment_date: string | null
          receivable_type: Database["public"]["Enums"]["receivable_type"]
          recurrence: Database["public"]["Enums"]["recurrence_type"]
          recurrence_end_date: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          amount_paid?: number
          case_id?: string | null
          category_id?: string | null
          client_id?: string | null
          created_at?: string
          description: string
          due_date: string
          id?: string
          installment_number?: number | null
          installments_total?: number | null
          notes?: string | null
          parent_receivable_id?: string | null
          payment_date?: string | null
          receivable_type?: Database["public"]["Enums"]["receivable_type"]
          recurrence?: Database["public"]["Enums"]["recurrence_type"]
          recurrence_end_date?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          amount_paid?: number
          case_id?: string | null
          category_id?: string | null
          client_id?: string | null
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          installment_number?: number | null
          installments_total?: number | null
          notes?: string | null
          parent_receivable_id?: string | null
          payment_date?: string | null
          receivable_type?: Database["public"]["Enums"]["receivable_type"]
          recurrence?: Database["public"]["Enums"]["recurrence_type"]
          recurrence_end_date?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receivables_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivables_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivables_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivables_parent_receivable_id_fkey"
            columns: ["parent_receivable_id"]
            isOneToOne: false
            referencedRelation: "receivables"
            referencedColumns: ["id"]
          },
        ]
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
      sumulas: {
        Row: {
          content: string
          court: Database["public"]["Enums"]["court_type"]
          created_at: string
          id: string
          is_binding: boolean
          keywords: string[] | null
          notes: string | null
          number: number
          precedents: string[] | null
          publication_date: string | null
          search_vector: unknown
          source_url: string | null
          status: Database["public"]["Enums"]["sumula_status"]
          themes: string[] | null
          updated_at: string
        }
        Insert: {
          content: string
          court: Database["public"]["Enums"]["court_type"]
          created_at?: string
          id?: string
          is_binding?: boolean
          keywords?: string[] | null
          notes?: string | null
          number: number
          precedents?: string[] | null
          publication_date?: string | null
          search_vector?: unknown
          source_url?: string | null
          status?: Database["public"]["Enums"]["sumula_status"]
          themes?: string[] | null
          updated_at?: string
        }
        Update: {
          content?: string
          court?: Database["public"]["Enums"]["court_type"]
          created_at?: string
          id?: string
          is_binding?: boolean
          keywords?: string[] | null
          notes?: string | null
          number?: number
          precedents?: string[] | null
          publication_date?: string | null
          search_vector?: unknown
          source_url?: string | null
          status?: Database["public"]["Enums"]["sumula_status"]
          themes?: string[] | null
          updated_at?: string
        }
        Relationships: []
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
      transactions: {
        Row: {
          account_id: string | null
          amount: number
          category_id: string | null
          created_at: string
          description: string
          id: string
          is_confirmed: boolean
          notes: string | null
          payable_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          receivable_id: string | null
          transaction_date: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category_id?: string | null
          created_at?: string
          description: string
          id?: string
          is_confirmed?: boolean
          notes?: string | null
          payable_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          receivable_id?: string | null
          transaction_date: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category_id?: string | null
          created_at?: string
          description?: string
          id?: string
          is_confirmed?: boolean
          notes?: string | null
          payable_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          receivable_id?: string | null
          transaction_date?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_payable_id_fkey"
            columns: ["payable_id"]
            isOneToOne: false
            referencedRelation: "payables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_receivable_id_fkey"
            columns: ["receivable_id"]
            isOneToOne: false
            referencedRelation: "receivables"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_legal_references: {
        Args: {
          filter_code_types?: Database["public"]["Enums"]["code_type"][]
          filter_courts?: Database["public"]["Enums"]["court_type"][]
          include_articles?: boolean
          include_sumulas?: boolean
          result_limit?: number
          search_query: string
        }
        Returns: {
          ref_content: string
          ref_id: string
          ref_label: string
          ref_source: string
          ref_type: string
          relevance: number
        }[]
      }
    }
    Enums: {
      account_type: "banco" | "caixa" | "carteira_digital"
      action_type:
        | "obrigacao_de_fazer"
        | "cobranca"
        | "indenizacao_danos_morais"
      case_activity_type:
        | "stage_change"
        | "note"
        | "document"
        | "deadline"
        | "task"
        | "created"
      case_priority: "baixa" | "media" | "alta" | "urgente"
      client_type: "pessoa_fisica" | "pessoa_juridica"
      clients_range: "1-10" | "11-50" | "51-200" | "200+"
      code_type:
        | "CF"
        | "CC"
        | "CPC"
        | "CDC"
        | "CLT"
        | "CP"
        | "CPP"
        | "LEI"
        | "DECRETO"
      contract_type: "mensal_fixo" | "por_ato" | "exito" | "misto"
      court_type: "STF" | "STJ" | "TST" | "TSE"
      deadline_type: "prazo_processual" | "audiencia" | "compromisso"
      firm_type: "solo" | "partnership" | "firm"
      marital_status:
        | "solteiro"
        | "casado"
        | "divorciado"
        | "viuvo"
        | "uniao_estavel"
        | "separado"
      payable_type:
        | "custas_processuais"
        | "aluguel"
        | "software"
        | "impostos"
        | "funcionarios"
        | "prolabore"
        | "fornecedor"
        | "outros"
      payment_method:
        | "pix"
        | "boleto"
        | "cartao_credito"
        | "cartao_debito"
        | "transferencia"
        | "dinheiro"
        | "cheque"
      payment_status: "pendente" | "pago" | "atrasado" | "cancelado" | "parcial"
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
      receivable_type:
        | "honorario_contratual"
        | "honorario_exito"
        | "consulta"
        | "acordo"
        | "reembolso"
        | "outros"
      recurrence_type: "unico" | "semanal" | "mensal" | "trimestral" | "anual"
      sumula_status: "VIGENTE" | "CANCELADA" | "REVISADA"
      transaction_type: "receita" | "despesa"
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
      account_type: ["banco", "caixa", "carteira_digital"],
      action_type: [
        "obrigacao_de_fazer",
        "cobranca",
        "indenizacao_danos_morais",
      ],
      case_activity_type: [
        "stage_change",
        "note",
        "document",
        "deadline",
        "task",
        "created",
      ],
      case_priority: ["baixa", "media", "alta", "urgente"],
      client_type: ["pessoa_fisica", "pessoa_juridica"],
      clients_range: ["1-10", "11-50", "51-200", "200+"],
      code_type: [
        "CF",
        "CC",
        "CPC",
        "CDC",
        "CLT",
        "CP",
        "CPP",
        "LEI",
        "DECRETO",
      ],
      contract_type: ["mensal_fixo", "por_ato", "exito", "misto"],
      court_type: ["STF", "STJ", "TST", "TSE"],
      deadline_type: ["prazo_processual", "audiencia", "compromisso"],
      firm_type: ["solo", "partnership", "firm"],
      marital_status: [
        "solteiro",
        "casado",
        "divorciado",
        "viuvo",
        "uniao_estavel",
        "separado",
      ],
      payable_type: [
        "custas_processuais",
        "aluguel",
        "software",
        "impostos",
        "funcionarios",
        "prolabore",
        "fornecedor",
        "outros",
      ],
      payment_method: [
        "pix",
        "boleto",
        "cartao_credito",
        "cartao_debito",
        "transferencia",
        "dinheiro",
        "cheque",
      ],
      payment_status: ["pendente", "pago", "atrasado", "cancelado", "parcial"],
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
      receivable_type: [
        "honorario_contratual",
        "honorario_exito",
        "consulta",
        "acordo",
        "reembolso",
        "outros",
      ],
      recurrence_type: ["unico", "semanal", "mensal", "trimestral", "anual"],
      sumula_status: ["VIGENTE", "CANCELADA", "REVISADA"],
      transaction_type: ["receita", "despesa"],
      user_role: ["admin", "advogado"],
    },
  },
} as const
