export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      demonstracoes_interesse: {
        Row: {
          id: number
          entidade_id: number
          nome_estudante: string
          email_estudante: string
          curso_estudante: string
          semestre_estudante: number
          area_interesse: string | null
          status: 'pendente' | 'aprovada' | 'rejeitada'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          entidade_id: number
          nome_estudante: string
          email_estudante: string
          curso_estudante: string
          semestre_estudante: number
          area_interesse?: string | null
          status?: 'pendente' | 'aprovada' | 'rejeitada'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          entidade_id?: number
          nome_estudante?: string
          email_estudante?: string
          curso_estudante?: string
          semestre_estudante?: number
          area_interesse?: string | null
          status?: 'pendente' | 'aprovada' | 'rejeitada'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "demonstracoes_interesse_entidade_id_fkey"
            columns: ["entidade_id"]
            isOneToOne: false
            referencedRelation: "entidades"
            referencedColumns: ["id"]
          }
        ]
      }
      entidade_credentials: {
        Row: {
          created_at: string
          entidade_id: number
          id: string
          last_login: string | null
          password_hash: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          entidade_id: number
          id?: string
          last_login?: string | null
          password_hash: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          entidade_id?: number
          id?: string
          last_login?: string | null
          password_hash?: string
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "entidade_credentials_entidade_id_fkey"
            columns: ["entidade_id"]
            isOneToOne: true
            referencedRelation: "entidades"
            referencedColumns: ["id"]
          }
        ]
      }
      empresas_parceiras: {
        Row: {
          id: number
          entidade_id: number
          nome: string
          descricao: string | null
          site_url: string | null
          logo_url: string | null
          email_contato: string | null
          telefone_contato: string | null
          area_atuacao: string[]
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          entidade_id: number
          nome: string
          descricao?: string | null
          site_url?: string | null
          logo_url?: string | null
          email_contato?: string | null
          telefone_contato?: string | null
          area_atuacao?: string[]
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          entidade_id?: number
          nome?: string
          descricao?: string | null
          site_url?: string | null
          logo_url?: string | null
          email_contato?: string | null
          telefone_contato?: string | null
          area_atuacao?: string[]
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresas_parceiras_entidade_id_fkey"
            columns: ["entidade_id"]
            isOneToOne: false
            referencedRelation: "entidades"
            referencedColumns: ["id"]
          }
        ]
      }
      entidades: {
        Row: {
          ano_criacao: number | null
          area_atuacao: string | null
          areas_internas: string[] | null
          contato: string | null
          created_at: string
          data_primeira_fase: string | null
          encerramento_primeira_fase: string | null
          data_segunda_fase: string | null
          encerramento_segunda_fase: string | null
          data_terceira_fase: string | null
          encerramento_terceira_fase: string | null
          descricao_curta: string | null
          descricao_detalhada: string | null
          email_contato: string | null
          empresas_parceiras: Json | null
          foto_perfil_url: string | null
          grau_exigencia: string | null
          horario_apresentacao: string | null
          id: number
          instagram_url: string | null
          link_processo_seletivo: string | null
          linkedin_url: string | null
          local_apresentacao: string | null
          local_feira: string | null
          nivel_exigencia: string | null
          nome: string | null
          numero_membros: number | null
          processo_seletivo_ativo: boolean | null
          abertura_processo_seletivo: string | null
          fechamento_processo_seletivo: string | null
          feira_ativa: boolean | null
          sala_feira: string | null
          site_url: string | null
        }
                 Insert: {
          ano_criacao?: number | null
          area_atuacao?: string | null
          areas_internas?: string[] | null
          contato?: string | null
          created_at?: string
          data_primeira_fase?: string | null
          data_primeira_fase_2?: string | null
          data_primeira_fase_3?: string | null
          data_segunda_fase?: string | null
          data_segunda_fase_2?: string | null
          data_segunda_fase_3?: string | null
          data_terceira_fase?: string | null
          data_terceira_fase_2?: string | null
          data_terceira_fase_3?: string | null
          descricao_curta?: string | null
          descricao_detalhada?: string | null
          email_contato?: string | null
          empresas_parceiras?: Json | null
          foto_perfil_url?: string | null
          grau_exigencia?: string | null
          horario_apresentacao?: string | null
          id?: number
          instagram_url?: string | null
          link_processo_seletivo?: string | null
          linkedin_url?: string | null
          local_apresentacao?: string | null
          local_feira?: string | null
          nivel_exigencia?: string | null
          nome?: string | null
          numero_membros?: number | null
          processo_seletivo_ativo?: boolean | null
          feira_ativa?: boolean | null
          sala_feira?: string | null
          site_url?: string | null
        }
                 Update: {
          ano_criacao?: number | null
          area_atuacao?: string | null
          areas_internas?: string[] | null
          contato?: string | null
          created_at?: string
          data_primeira_fase?: string | null
          encerramento_primeira_fase?: string | null
          data_segunda_fase?: string | null
          encerramento_segunda_fase?: string | null
          data_terceira_fase?: string | null
          encerramento_terceira_fase?: string | null
          descricao_curta?: string | null
          descricao_detalhada?: string | null
          email_contato?: string | null
          empresas_parceiras?: Json | null
          foto_perfil_url?: string | null
          grau_exigencia?: string | null
          horario_apresentacao?: string | null
          id?: number
          instagram_url?: string | null
          link_processo_seletivo?: string | null
          linkedin_url?: string | null
          local_apresentacao?: string | null
          local_feira?: string | null
          nivel_exigencia?: string | null
          nome?: string | null
          numero_membros?: number | null
          processo_seletivo_ativo?: boolean | null
          feira_ativa?: boolean | null
          sala_feira?: string | null
          site_url?: string | null
        }
        Relationships: []
      }
      areas_padrao: {
        Row: {
          id: number
          nome: string
          descricao: string | null
          categoria: string | null
          ativo: boolean
          created_at: string
        }
        Insert: {
          id?: number
          nome: string
          descricao?: string | null
          categoria?: string | null
          ativo?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          nome?: string
          descricao?: string | null
          categoria?: string | null
          ativo?: boolean
          created_at?: string
        }
        Relationships: []
      }
      entity_leaders: {
        Row: {
          created_at: string
          entidade_id: number
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entidade_id: number
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entidade_id?: number
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_leaders_entidade_id_fkey"
            columns: ["entidade_id"]
            isOneToOne: false
            referencedRelation: "entidades"
            referencedColumns: ["id"]
          }
        ]
      }
      eventos: {
        Row: {
          capacidade: number | null
          created_at: string
          data: string
          horario_inicio: string | null
          horario_termino: string | null
          descricao: string | null
          entidade_id: number | null
          id: string
          local: string | null
          nome: string
          link_evento: string | null
          status: string | null
          status_aprovacao: string | null
          comentario_aprovacao: string | null
          data_aprovacao: string | null
          aprovador_email: string | null
          updated_at: string
          area_atuacao: string[] | null
        }
        Insert: {
          capacidade?: number | null
          created_at?: string
          data: string
          horario_inicio?: string | null
          horario_termino?: string | null
          descricao?: string | null
          entidade_id?: number | null
          id?: string
          local?: string | null
          nome: string
          link_evento: string | null
          status?: string | null
          status_aprovacao?: string | null
          comentario_aprovacao?: string | null
          data_aprovacao?: string | null
          aprovador_email?: string | null
          updated_at?: string
          area_atuacao?: string[] | null
        }
        Update: {
          capacidade?: number | null
          created_at?: string
          data?: string
          horario_inicio?: string | null
          horario_termino?: string | null
          descricao?: string | null
          entidade_id?: number | null
          id?: string
          local?: string | null
          nome?: string
          link_evento: string | null
          status?: string | null
          status_aprovacao?: string | null
          comentario_aprovacao?: string | null
          data_aprovacao?: string | null
          aprovador_email?: string | null
          updated_at?: string
          area_atuacao?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_entidade_id_fkey"
            columns: ["entidade_id"]
            isOneToOne: false
            referencedRelation: "entidades"
            referencedColumns: ["id"]
          }
        ]
      }
      participantes_evento: {
        Row: {
          data_inscricao: string
          email: string | null
          evento_id: string | null
          id: string
          nome_participante: string
          status_participacao: string | null
          telefone: string | null
        }
        Insert: {
          data_inscricao?: string
          email?: string | null
          evento_id?: string | null
          id?: string
          nome_participante: string
          status_participacao?: string | null
          telefone?: string | null
        }
        Update: {
          data_inscricao?: string
          email?: string | null
          evento_id?: string | null
          id?: string
          nome_participante?: string
          status_participacao?: string | null
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participantes_evento_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          area_interesse: string | null
          areas_interesse: string[] | null
          celular: string | null
          created_at: string
          curso: string | null
          data_nascimento: string | null
          id: string
          nome: string | null
          profile_completed: boolean | null
          semestre: number | null
          updated_at: string
        }
        Insert: {
          area_interesse?: string | null
          areas_interesse?: string[] | null
          celular?: string | null
          created_at?: string
          curso?: string | null
          data_nascimento?: string | null
          id: string
          nome?: string | null
          profile_completed?: boolean | null
          semestre?: number | null
          updated_at?: string
        }
        Update: {
          area_interesse?: string | null
          areas_interesse?: string[] | null
          celular?: string | null
          created_at?: string
          curso?: string | null
          data_nascimento?: string | null
          id?: string
          nome?: string | null
          profile_completed?: boolean | null
          semestre?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      reservas: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          profile_id: string
          entidade_id: number | null
          evento_id: string
          tipo_reserva: 'sala' | 'auditorio'
          data_reserva: string
          horario_inicio: string
          horario_termino: string
          quantidade_pessoas: number
          nome_solicitante: string
          telefone_solicitante: string
          tem_palestrante_externo: boolean | null
          nome_palestrante_externo: string | null
          apresentacao_palestrante_externo: string | null
          eh_pessoa_publica: boolean | null
          necessidade_sala_plana: boolean | null
          motivo_sala_plana: string | null
          precisa_sistema_som: boolean | null
          precisa_projetor: boolean | null
          precisa_iluminacao_especial: boolean | null
          precisa_montagem_palco: boolean | null
          precisa_gravacao: boolean | null
          motivo_gravacao: string | null
          equipamentos_adicionais: string | null
          precisa_suporte_tecnico: boolean | null
          detalhes_suporte_tecnico: string | null
          configuracao_sala: 'Teatro' | 'U' | 'Mesas' | 'Cadeiras em linha' | null
          motivo_configuracao_sala: string | null
          precisa_alimentacao: boolean | null
          detalhes_alimentacao: string | null
          custo_estimado_alimentacao: number | null
          precisa_seguranca: boolean | null
          detalhes_seguranca: string | null
          precisa_controle_acesso: boolean | null
          detalhes_controle_acesso: string | null
          precisa_limpeza_especial: boolean | null
          detalhes_limpeza_especial: string | null
          precisa_manutencao: boolean | null
          detalhes_manutencao: string | null
          status: 'pendente' | 'aprovada' | 'rejeitada' | 'cancelada'
          comentario_aprovacao: string | null
          data_aprovacao: string | null
          aprovador_email: string | null
          observacoes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          profile_id: string
          entidade_id?: number | null
          evento_id: string
          tipo_reserva: 'sala' | 'auditorio'
          data_reserva: string
          horario_inicio: string
          horario_termino: string
          quantidade_pessoas: number
          nome_solicitante: string
          telefone_solicitante: string
          tem_palestrante_externo?: boolean | null
          nome_palestrante_externo?: string | null
          apresentacao_palestrante_externo?: string | null
          eh_pessoa_publica?: boolean | null
          necessidade_sala_plana?: boolean | null
          motivo_sala_plana?: string | null
          precisa_sistema_som?: boolean | null
          precisa_projetor?: boolean | null
          precisa_iluminacao_especial?: boolean | null
          precisa_montagem_palco?: boolean | null
          precisa_gravacao?: boolean | null
          motivo_gravacao?: string | null
          equipamentos_adicionais?: string | null
          precisa_suporte_tecnico?: boolean | null
          detalhes_suporte_tecnico?: string | null
          configuracao_sala?: 'Teatro' | 'U' | 'Mesas' | 'Cadeiras em linha' | null
          motivo_configuracao_sala?: string | null
          precisa_alimentacao?: boolean | null
          detalhes_alimentacao?: string | null
          custo_estimado_alimentacao?: number | null
          precisa_seguranca?: boolean | null
          detalhes_seguranca?: string | null
          precisa_controle_acesso?: boolean | null
          detalhes_controle_acesso?: string | null
          precisa_limpeza_especial?: boolean | null
          detalhes_limpeza_especial?: string | null
          precisa_manutencao?: boolean | null
          detalhes_manutencao?: string | null
          status?: 'pendente' | 'aprovada' | 'rejeitada' | 'cancelada'
          comentario_aprovacao?: string | null
          data_aprovacao?: string | null
          aprovador_email?: string | null
          observacoes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          profile_id?: string
          entidade_id?: number | null
          evento_id?: string
          tipo_reserva?: 'sala' | 'auditorio'
          data_reserva?: string
          horario_inicio?: string
          horario_termino?: string
          quantidade_pessoas?: number
          nome_solicitante?: string
          telefone_solicitante?: string
          tem_palestrante_externo?: boolean | null
          nome_palestrante_externo?: string | null
          apresentacao_palestrante_externo?: string | null
          eh_pessoa_publica?: boolean | null
          necessidade_sala_plana?: boolean | null
          motivo_sala_plana?: string | null
          precisa_sistema_som?: boolean | null
          precisa_projetor?: boolean | null
          precisa_iluminacao_especial?: boolean | null
          precisa_montagem_palco?: boolean | null
          precisa_gravacao?: boolean | null
          motivo_gravacao?: string | null
          equipamentos_adicionais?: string | null
          precisa_suporte_tecnico?: boolean | null
          detalhes_suporte_tecnico?: string | null
          configuracao_sala?: 'Teatro' | 'U' | 'Mesas' | 'Cadeiras em linha' | null
          motivo_configuracao_sala?: string | null
          precisa_alimentacao?: boolean | null
          detalhes_alimentacao?: string | null
          custo_estimado_alimentacao?: number | null
          precisa_seguranca?: boolean | null
          detalhes_seguranca?: string | null
          precisa_controle_acesso?: boolean | null
          detalhes_controle_acesso?: string | null
          precisa_limpeza_especial?: boolean | null
          detalhes_limpeza_especial?: string | null
          precisa_manutencao?: boolean | null
          detalhes_manutencao?: string | null
          status?: 'pendente' | 'aprovada' | 'rejeitada' | 'cancelada'
          comentario_aprovacao?: string | null
          data_aprovacao?: string | null
          aprovador_email?: string | null
          observacoes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservas_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_entidade_id_fkey"
            columns: ["entidade_id"]
            referencedRelation: "entidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_evento_id_fkey"
            columns: ["evento_id"]
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          }
        ]
      }
      projetos: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          entidade_id: number
          id: string
          nome: string
          repositorio_url: string | null
          status: string | null
          tecnologias: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          entidade_id: number
          id?: string
          nome: string
          repositorio_url?: string | null
          status?: string | null
          tecnologias?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          entidade_id?: number
          id?: string
          nome?: string
          repositorio_url?: string | null
          status?: string | null
          tecnologias?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projetos_entidade_id_fkey"
            columns: ["entidade_id"]
            isOneToOne: false
            referencedRelation: "entidades"
            referencedColumns: ["id"]
          }
        ]
      }
      processos_seletivos: {
        Row: {
          id: number
          created_at: string
          link_inscricao: string | null
          is_active: boolean | null
          data_primeira_fase: string | null
          data_primeira_fase_2: string | null
          data_primeira_fase_3: string | null
          data_segunda_fase: string | null
          data_segunda_fase_2: string | null
          data_segunda_fase_3: string | null
          data_terceira_fase: string | null
          data_terceira_fase_2: string | null
          data_terceira_fase_3: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          link_inscricao?: string | null
          is_active?: boolean | null
          data_primeira_fase?: string | null
          data_primeira_fase_2: string | null
          data_primeira_fase_3: string | null
          data_segunda_fase?: string | null
          data_segunda_fase_2: string | null
          data_segunda_fase_3: string | null
          data_terceira_fase?: string | null
          data_terceira_fase_2: string | null
          data_terceira_fase_3: string | null
        }
        Update: {
          id?: number
          created_at?: string
          link_inscricao?: string | null
          is_active?: boolean | null
          data_primeira_fase?: string | null
          data_primeira_fase_2?: string | null
          data_primeira_fase_3?: string | null
          data_segunda_fase?: string | null
          data_segunda_fase_2?: string | null
          data_segunda_fase_3?: string | null
          data_terceira_fase?: string | null
          data_terceira_fase_2?: string | null
          data_terceira_fase_3?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      activities: {
        Row: {
          id: string
          user_id: string | null
          entity_id: string | null
          activity_type: string
          activity_subtype: string | null
          title: string
          description: string | null
          metadata: Json
          status: string
          ip_address: unknown | null
          user_agent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          entity_id?: string | null
          activity_type: string
          activity_subtype?: string | null
          title: string
          description?: string | null
          metadata?: Json
          status?: string
          ip_address?: unknown | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          entity_id?: string | null
          activity_type?: string
          activity_subtype?: string | null
          title?: string
          description?: string | null
          metadata?: Json
          status?: string
          ip_address?: unknown | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_entity_leader: {
        Args: { _user_id: string; _entidade_id: number }
        Returns: boolean
      }
      authenticate_entity: {
        Args: { _username: string; _password: string }
        Returns: {
          entidade_id: number
          success: boolean
          message: string
        }[]
      }
      authenticate_entity_simple: {
        Args: { _username: string; _password: string }
        Returns: {
          entidade_id: number
          success: boolean
          message: string
        }[]
      }
      change_user_role: {
        Args: {
          _user_id: string
          _new_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      create_event_as_entity: {
        Args: {
          _entidade_id: number
          _nome: string
          _data_evento: string
          _descricao?: string
          _local?: string
          _capacidade?: number
        }
        Returns: string
      }
      create_event_as_entity_pending: {
        Args: {
          _entidade_id: number
          _nome: string
          _data_evento: string
          _descricao?: string
          _local?: string
          _capacidade?: number
          _link_evento?: string
        }
        Returns: string
      }
      create_project_as_entity: {
        Args: {
          _entidade_id: number
          _nome: string
          _descricao?: string
          _data_inicio?: string
          _data_fim?: string
          _repositorio_url?: string
          _tecnologias?: string[]
          _status?: string
        }
        Returns: string
      }
      delete_event_as_entity: {
        Args: { _evento_id: string; _entidade_id: number }
        Returns: boolean
      }
      delete_project_as_entity: {
        Args: { _projeto_id: string; _entidade_id: number }
        Returns: boolean
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_entity_authenticated: {
        Args: { _entidade_id: number }
        Returns: boolean
      }
      is_entity_leader: {
        Args: { _user_id: string; _entidade_id: number }
        Returns: boolean
      }
      is_valid_email: {
        Args: { email_text: string }
        Returns: boolean
      }
      promote_to_admin: {
        Args: { _email: string }
        Returns: boolean
      }
      remove_entity_leader: {
        Args: { _user_id: string; _entidade_id: number }
        Returns: boolean
      }
      update_entity_as_entity: {
        Args: {
          _entidade_id: number
          _nome?: string
          _descricao_curta?: string
          _descricao_detalhada?: string
          _area_atuacao?: string
          _numero_membros?: number
          _contato?: string
          _endereco?: string
          _site?: string
          _linkedin?: string
          _instagram?: string
          _facebook?: string
          _twitter?: string
          _youtube?: string
          _tiktok?: string
          _informacoes_feira?: string
          _local_palestra?: string
          _data_primeira_fase_2?: string
          _data_primeira_fase_3?: string
          _encerramento_primeira_fase?: string
          _data_segunda_fase_2?: string
          _data_segunda_fase_3?: string
          _data_terceira_fase_2?: string
          _data_terceira_fase_3?: string
        }
        Returns: boolean
      }
      update_event_as_entity: {
        Args: {
          _evento_id: string
          _data: string
          _entidade_id: number
          _capacidade?: number
          _horario: string
          _link_evento?: string
          _nome?: string
          _descricao?: string
          _local?: string
          _status?: string
        }
        Returns: boolean
      }
      update_project_as_entity: {
        Args: {
          _projeto_id: string
          _entidade_id: number
          _nome?: string
          _descricao?: string
          _data_inicio?: string
          _data_fim?: string
          _repositorio_url?: string
          _tecnologias?: string[]
          _status?: string
        }
        Returns: boolean
      }
      update_student_area_interesse: {
        Args: {
          _user_id: string
          _area_interesse?: string
        }
        Returns: boolean
      }
      aprovar_evento: {
        Args: {
          _evento_id: string
          _status_aprovacao: string
          _comentario_aprovacao?: string
        }
        Returns: boolean
      }
      validate_first_semester_student: {
        Args: { email_input: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "aluno" | "lider_entidade" | "admin"
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
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
