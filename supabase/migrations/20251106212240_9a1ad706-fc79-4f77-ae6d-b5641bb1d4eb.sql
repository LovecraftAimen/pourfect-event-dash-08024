-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS public.clientes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  email text NOT NULL,
  telefone text NOT NULL,
  endereco text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de orçamentos
CREATE TABLE IF NOT EXISTS public.orcamentos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  evento_id uuid,
  valor_total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'enviado' CHECK (status IN ('enviado', 'aprovado', 'recusado')),
  data_envio date NOT NULL,
  itens text NOT NULL,
  nome_evento text,
  data_evento date,
  horario_abertura text,
  horario_fechamento text,
  local_evento text,
  numero_convidados integer,
  cartas_drinks jsonb,
  numero_bartendes integer,
  estrutura text,
  condicoes_financeiras jsonb,
  horario_extra numeric,
  lista_insumos jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS permissivas para clientes
CREATE POLICY "Permitir acesso total a clientes"
  ON public.clientes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Criar políticas RLS permissivas para orçamentos
CREATE POLICY "Permitir acesso total a orcamentos"
  ON public.orcamentos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Criar trigger para atualizar updated_at em clientes
CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar trigger para atualizar updated_at em orçamentos
CREATE TRIGGER update_orcamentos_updated_at
  BEFORE UPDATE ON public.orcamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para melhorar performance
CREATE INDEX idx_orcamentos_cliente_id ON public.orcamentos(cliente_id);
CREATE INDEX idx_orcamentos_status ON public.orcamentos(status);