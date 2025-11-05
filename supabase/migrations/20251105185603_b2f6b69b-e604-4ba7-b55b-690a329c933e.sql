-- Tabela de Drinks
CREATE TABLE IF NOT EXISTS public.drinks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  custo_total NUMERIC NOT NULL DEFAULT 0,
  preco_venda_sugerido NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Ingredientes dos Drinks
CREATE TABLE IF NOT EXISTS public.drink_ingredientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drink_id UUID NOT NULL REFERENCES public.drinks(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  quantidade NUMERIC NOT NULL,
  unidade TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drink_ingredientes ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas (sem autenticação)
CREATE POLICY "Permitir acesso total a drinks" ON public.drinks
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acesso total a drink_ingredientes" ON public.drink_ingredientes
  FOR ALL USING (true) WITH CHECK (true);

-- Trigger para atualizar updated_at em drinks
CREATE TRIGGER update_drinks_updated_at
BEFORE UPDATE ON public.drinks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_drink_ingredientes_drink_id ON public.drink_ingredientes(drink_id);
CREATE INDEX IF NOT EXISTS idx_drink_ingredientes_produto_id ON public.drink_ingredientes(produto_id);