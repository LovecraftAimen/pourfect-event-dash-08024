-- Criar tabela de transações financeiras
CREATE TABLE public.transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  data_lancamento DATE NOT NULL,
  evento_id UUID REFERENCES public.eventos(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'recebido')),
  forma_pagamento TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso total (ajustar conforme necessário)
CREATE POLICY "Permitir acesso total a transacoes" 
ON public.transacoes 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_transacoes_updated_at
BEFORE UPDATE ON public.transacoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para melhorar performance
CREATE INDEX idx_transacoes_tipo ON public.transacoes(tipo);
CREATE INDEX idx_transacoes_status ON public.transacoes(status);
CREATE INDEX idx_transacoes_evento_id ON public.transacoes(evento_id);
CREATE INDEX idx_transacoes_data_lancamento ON public.transacoes(data_lancamento);