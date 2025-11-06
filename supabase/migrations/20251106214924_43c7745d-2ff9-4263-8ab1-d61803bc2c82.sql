-- Criar tabela de eventos
CREATE TABLE IF NOT EXISTS public.eventos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  data_inicio timestamp with time zone NOT NULL,
  data_fim timestamp with time zone NOT NULL,
  local text NOT NULL,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('confirmado', 'pendente', 'cancelado')),
  numero_convidados integer NOT NULL DEFAULT 0,
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

-- Criar política RLS permissiva
CREATE POLICY "Permitir acesso total a eventos"
  ON public.eventos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_eventos_updated_at
  BEFORE UPDATE ON public.eventos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para melhorar performance
CREATE INDEX idx_eventos_cliente_id ON public.eventos(cliente_id);
CREATE INDEX idx_eventos_status ON public.eventos(status);
CREATE INDEX idx_eventos_data_inicio ON public.eventos(data_inicio);