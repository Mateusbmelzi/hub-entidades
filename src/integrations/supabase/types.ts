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
      // Outras tabelas existentes serão adicionadas quando o comando supabase gen types for executado
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
export type TemplatesFormulariosRow = Database['public']['Tables']['templates_formularios']['Row']
export type TemplatesFormulariosInsert = Database['public']['Tables']['templates_formularios']['Insert']
export type TemplatesFormulariosUpdate = Database['public']['Tables']['templates_formularios']['Update']
