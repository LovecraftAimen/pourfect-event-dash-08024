-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS public.categorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  quantidade NUMERIC NOT NULL DEFAULT 0,
  capacidade_produto NUMERIC,
  unidade TEXT NOT NULL DEFAULT 'unidade' CHECK (unidade IN ('unidade', 'ml', 'g')),
  alerta_reposicao NUMERIC NOT NULL DEFAULT 0,
  preco_compra NUMERIC NOT NULL DEFAULT 0,
  data_validade DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir categorias padrão
INSERT INTO public.categorias (nome) VALUES
  ('Bebidas'),
  ('Insumos'),
  ('Descartáveis'),
  ('Utensílios'),
  ('Alimentos'),
  ('Decoração')
ON CONFLICT (nome) DO NOTHING;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at em produtos
CREATE TRIGGER update_produtos_updated_at
BEFORE UPDATE ON public.produtos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON public.produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_data_validade ON public.produtos(data_validade);
CREATE INDEX IF NOT EXISTS idx_produtos_quantidade ON public.produtos(quantidade);

-- Habilitar Row Level Security (sem políticas por enquanto, já que não tem autenticação)
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- Criar políticas permissivas (sem autenticação)
CREATE POLICY "Permitir acesso total a produtos" ON public.produtos
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acesso total a categorias" ON public.categorias
  FOR ALL USING (true) WITH CHECK (true);