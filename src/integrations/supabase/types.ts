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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      categorias: {
        Row: {
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          created_at: string
          email: string
          endereco: string | null
          id: string
          nome: string
          telefone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          endereco?: string | null
          id?: string
          nome: string
          telefone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          endereco?: string | null
          id?: string
          nome?: string
          telefone?: string
          updated_at?: string
        }
        Relationships: []
      }
      drink_ingredientes: {
        Row: {
          created_at: string
          drink_id: string
          id: string
          produto_id: string
          quantidade: number
          unidade: string
        }
        Insert: {
          created_at?: string
          drink_id: string
          id?: string
          produto_id: string
          quantidade: number
          unidade: string
        }
        Update: {
          created_at?: string
          drink_id?: string
          id?: string
          produto_id?: string
          quantidade?: number
          unidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "drink_ingredientes_drink_id_fkey"
            columns: ["drink_id"]
            isOneToOne: false
            referencedRelation: "drinks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drink_ingredientes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      drinks: {
        Row: {
          created_at: string
          custo_total: number
          descricao: string | null
          id: string
          nome: string
          preco_venda_sugerido: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          custo_total?: number
          descricao?: string | null
          id?: string
          nome: string
          preco_venda_sugerido?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          custo_total?: number
          descricao?: string | null
          id?: string
          nome?: string
          preco_venda_sugerido?: number
          updated_at?: string
        }
        Relationships: []
      }
      escalas: {
        Row: {
          created_at: string
          evento_id: string
          horario_entrada: string
          horario_saida: string
          id: string
          membro_equipe_id: string
          status: string
          updated_at: string
          valor_pago: number | null
        }
        Insert: {
          created_at?: string
          evento_id: string
          horario_entrada: string
          horario_saida: string
          id?: string
          membro_equipe_id: string
          status?: string
          updated_at?: string
          valor_pago?: number | null
        }
        Update: {
          created_at?: string
          evento_id?: string
          horario_entrada?: string
          horario_saida?: string
          id?: string
          membro_equipe_id?: string
          status?: string
          updated_at?: string
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "escalas_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalas_membro_equipe_id_fkey"
            columns: ["membro_equipe_id"]
            isOneToOne: false
            referencedRelation: "membros_equipe"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          cliente_id: string
          created_at: string
          data_fim: string
          data_inicio: string
          id: string
          local: string
          nome: string
          numero_convidados: number
          observacoes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_fim: string
          data_inicio: string
          id?: string
          local: string
          nome: string
          numero_convidados?: number
          observacoes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_fim?: string
          data_inicio?: string
          id?: string
          local?: string
          nome?: string
          numero_convidados?: number
          observacoes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      membros_equipe: {
        Row: {
          created_at: string
          disponibilidade: string
          email: string
          funcao: string
          id: string
          nome: string
          salario_por_evento: number
          telefone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          disponibilidade?: string
          email: string
          funcao: string
          id?: string
          nome: string
          salario_por_evento?: number
          telefone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          disponibilidade?: string
          email?: string
          funcao?: string
          id?: string
          nome?: string
          salario_por_evento?: number
          telefone?: string
          updated_at?: string
        }
        Relationships: []
      }
      orcamentos: {
        Row: {
          cartas_drinks: Json | null
          cliente_id: string
          condicoes_financeiras: Json | null
          created_at: string
          data_envio: string
          data_evento: string | null
          estrutura: string | null
          evento_id: string | null
          horario_abertura: string | null
          horario_extra: number | null
          horario_fechamento: string | null
          id: string
          itens: string
          lista_insumos: Json | null
          local_evento: string | null
          nome_evento: string | null
          numero_bartendes: number | null
          numero_convidados: number | null
          status: string
          updated_at: string
          valor_total: number
        }
        Insert: {
          cartas_drinks?: Json | null
          cliente_id: string
          condicoes_financeiras?: Json | null
          created_at?: string
          data_envio: string
          data_evento?: string | null
          estrutura?: string | null
          evento_id?: string | null
          horario_abertura?: string | null
          horario_extra?: number | null
          horario_fechamento?: string | null
          id?: string
          itens: string
          lista_insumos?: Json | null
          local_evento?: string | null
          nome_evento?: string | null
          numero_bartendes?: number | null
          numero_convidados?: number | null
          status?: string
          updated_at?: string
          valor_total?: number
        }
        Update: {
          cartas_drinks?: Json | null
          cliente_id?: string
          condicoes_financeiras?: Json | null
          created_at?: string
          data_envio?: string
          data_evento?: string | null
          estrutura?: string | null
          evento_id?: string | null
          horario_abertura?: string | null
          horario_extra?: number | null
          horario_fechamento?: string | null
          id?: string
          itens?: string
          lista_insumos?: Json | null
          local_evento?: string | null
          nome_evento?: string | null
          numero_bartendes?: number | null
          numero_convidados?: number | null
          status?: string
          updated_at?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          alerta_reposicao: number
          capacidade_produto: number | null
          categoria: string
          created_at: string
          data_validade: string | null
          id: string
          nome: string
          preco_compra: number
          quantidade: number
          unidade: string
          updated_at: string
        }
        Insert: {
          alerta_reposicao?: number
          capacidade_produto?: number | null
          categoria: string
          created_at?: string
          data_validade?: string | null
          id?: string
          nome: string
          preco_compra?: number
          quantidade?: number
          unidade?: string
          updated_at?: string
        }
        Update: {
          alerta_reposicao?: number
          capacidade_produto?: number | null
          categoria?: string
          created_at?: string
          data_validade?: string | null
          id?: string
          nome?: string
          preco_compra?: number
          quantidade?: number
          unidade?: string
          updated_at?: string
        }
        Relationships: []
      }
      transacoes: {
        Row: {
          categoria: string
          created_at: string
          data_lancamento: string
          descricao: string
          evento_id: string | null
          forma_pagamento: string | null
          id: string
          status: string
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string
          data_lancamento: string
          descricao: string
          evento_id?: string | null
          forma_pagamento?: string | null
          id?: string
          status?: string
          tipo: string
          updated_at?: string
          valor?: number
        }
        Update: {
          categoria?: string
          created_at?: string
          data_lancamento?: string
          descricao?: string
          evento_id?: string | null
          forma_pagamento?: string | null
          id?: string
          status?: string
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
