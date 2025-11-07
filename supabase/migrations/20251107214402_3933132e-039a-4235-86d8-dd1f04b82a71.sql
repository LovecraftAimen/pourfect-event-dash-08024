-- Criar tabela de membros da equipe
CREATE TABLE public.membros_equipe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  funcao TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  salario_por_evento NUMERIC NOT NULL DEFAULT 0,
  disponibilidade TEXT NOT NULL DEFAULT 'disponivel' CHECK (disponibilidade IN ('disponivel', 'ocupado', 'inativo')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de escalas
CREATE TABLE public.escalas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membro_equipe_id UUID NOT NULL REFERENCES public.membros_equipe(id) ON DELETE CASCADE,
  evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  horario_entrada TIMESTAMP WITH TIME ZONE NOT NULL,
  horario_saida TIMESTAMP WITH TIME ZONE NOT NULL,
  valor_pago NUMERIC,
  status TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'concluido', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.membros_equipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalas ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acesso total
CREATE POLICY "Permitir acesso total a membros_equipe" 
ON public.membros_equipe 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Permitir acesso total a escalas" 
ON public.escalas 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_membros_equipe_updated_at
BEFORE UPDATE ON public.membros_equipe
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_escalas_updated_at
BEFORE UPDATE ON public.escalas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para melhorar performance
CREATE INDEX idx_membros_equipe_disponibilidade ON public.membros_equipe(disponibilidade);
CREATE INDEX idx_escalas_membro_equipe_id ON public.escalas(membro_equipe_id);
CREATE INDEX idx_escalas_evento_id ON public.escalas(evento_id);
CREATE INDEX idx_escalas_status ON public.escalas(status);