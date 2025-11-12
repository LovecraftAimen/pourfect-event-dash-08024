-- Criar tabela de colaboradores
CREATE TABLE public.colaboradores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT,
  permissoes JSONB DEFAULT '[]'::jsonb,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Por enquanto permitindo acesso total (apenas admin deve acessar)
CREATE POLICY "Permitir acesso total a colaboradores"
ON public.colaboradores
FOR ALL
USING (true)
WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_colaboradores_updated_at
BEFORE UPDATE ON public.colaboradores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índice para melhorar performance de busca por email
CREATE INDEX idx_colaboradores_email ON public.colaboradores(email);

-- Índice para melhorar performance de busca por permissões
CREATE INDEX idx_colaboradores_permissoes ON public.colaboradores USING GIN(permissoes);