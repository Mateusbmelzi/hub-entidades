// Tipos gerados automaticamente do Supabase
// Execute: npx supabase gen types typescript --local > src/integrations/supabase/types.ts
// para gerar os tipos completos do banco

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          activity_type: string
          activity_subtype: string | null
          title: string
          description: string | null
          entity_id: number | null
          evento_id: string | null
          metadata: Json
          status: 'completed' | 'pending' | 'failed' | 'cancelled'
          page_url: string | null
          referrer: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          activity_type: string
          activity_subtype?: string | null
          title: string
          description?: string | null
          entity_id?: number | null
          evento_id?: string | null
          metadata?: Json
          status?: 'completed' | 'pending' | 'failed' | 'cancelled'
          page_url?: string | null
          referrer?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          activity_type?: string
          activity_subtype?: string | null
          title?: string
          description?: string | null
          entity_id?: number | null
          evento_id?: string | null
          metadata?: Json
          status?: 'completed' | 'pending' | 'failed' | 'cancelled'
          page_url?: string | null
          referrer?: string | null
          created_at?: string
        }
      }
      page_visits: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          page_url: string
          entity_id: number | null
          referrer: string | null
          user_agent: string | null
          screen_resolution: string | null
          language: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          page_url: string
          entity_id?: number | null
          referrer?: string | null
          user_agent?: string | null
          screen_resolution?: string | null
          language?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          page_url?: string
          entity_id?: number | null
          referrer?: string | null
          user_agent?: string | null
          screen_resolution?: string | null
          language?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      templates_formularios: {
        Row: {
          id: string
          entidade_id: number
          nome_template: string
          descricao: string | null
          tipo_evento: string | null
          campos_basicos_visiveis: Json
          campos_personalizados: Json
          usa_limite_sala: boolean
          limite_vagas_customizado: number | null
          aceita_lista_espera: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          entidade_id: number
          nome_template: string
          descricao?: string | null
          tipo_evento?: string | null
          campos_basicos_visiveis?: Json
          campos_personalizados?: Json
          usa_limite_sala?: boolean
          limite_vagas_customizado?: number | null
          aceita_lista_espera?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          entidade_id?: number
          nome_template?: string
          descricao?: string | null
          tipo_evento?: string | null
          campos_basicos_visiveis?: Json
          campos_personalizados?: Json
          usa_limite_sala?: boolean
          limite_vagas_customizado?: number | null
          aceita_lista_espera?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      log_activity: {
        Args: {
          p_activity_type: string
          p_activity_subtype?: string | null
          p_title?: string
          p_description?: string | null
          p_user_id?: string | null
          p_entity_id?: number | null
          p_metadata?: Json
          p_status?: string
          p_page_url?: string | null
          p_session_id?: string | null
          p_referrer?: string | null
        }
        Returns: string
      }
      log_page_visit: {
        Args: {
          p_page_url: string
          p_entity_id?: number | null
          p_session_id?: string | null
          p_referrer?: string | null
          p_user_agent?: string | null
          p_screen_resolution?: string | null
          p_language?: string | null
          p_metadata?: Json
        }
        Returns: string
      }
      get_dashboard_stats: {
        Args: Record<string, never>
        Returns: Json
      }
      get_comprehensive_dashboard_stats: {
        Args: Record<string, never>
        Returns: Json
      }
      get_entity_visit_stats: {
        Args: {
          p_entity_id?: string | null
          p_start_date?: string | null
          p_end_date?: string | null
        }
        Returns: Json
      }
      generate_dashboard_report: {
        Args: {
          p_start_date: string
          p_end_date: string
          p_entity_type?: string
          p_activity_type?: string
          p_engagement_level?: string
        }
        Returns: Json
      }
      vincular_evento_reserva: {
        Args: {
          p_evento_id: string
          p_reserva_id: string
        }
        Returns: Json
      }
      desvincular_evento_reserva: {
        Args: {
          p_evento_id: string
          p_reserva_id: string
        }
        Returns: Json
      }
      inscrever_evento_atomico: {
        Args: {
          p_evento_id: string
          p_nome_completo: string
          p_email: string
          p_profile_id?: string | null
          p_curso?: string | null
          p_semestre?: number | null
          p_campos_adicionais?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Exportar tipos específicos para uso nos componentes
export type ActivityLogsRow = Database['public']['Tables']['activity_logs']['Row']
export type ActivityLogsInsert = Database['public']['Tables']['activity_logs']['Insert']

export type PageVisitsRow = Database['public']['Tables']['page_visits']['Row']
export type PageVisitsInsert = Database['public']['Tables']['page_visits']['Insert']

export type TemplatesFormulariosRow = Database['public']['Tables']['templates_formularios']['Row']
export type TemplatesFormulariosInsert = Database['public']['Tables']['templates_formularios']['Insert']
export type TemplatesFormulariosUpdate = Database['public']['Tables']['templates_formularios']['Update']
