import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Drink, Ingrediente, Produto } from '@/types';
import { Plus, Beaker, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const Drinks = () => {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDrinks();
    loadProdutos();
  }, []);

  const loadProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('nome');

      if (error) throw error;

      const produtosFormatados: Produto[] = (data || []).map(p => ({
        id: p.id,
        nome: p.nome,
        categoria: p.categoria,
        quantidade: Number(p.quantidade),
        capacidadeProduto: p.capacidade_produto ? Number(p.capacidade_produto) : undefined,
        unidade: p.unidade as 'unidade' | 'ml' | 'g',
        alertaReposicao: Number(p.alerta_reposicao),
        precoCompra: Number(p.preco_compra),
        dataValidade: p.data_validade || undefined,
      }));

      setProdutos(produtosFormatados);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar produtos',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const loadDrinks = async () => {
    try {
      setLoading(true);
      const { data: drinksData, error: drinksError } = await supabase
        .from('drinks')
        .select('*')
        .order('created_at', { ascending: false });

      if (drinksError) throw drinksError;

      const drinksComIngredientes = await Promise.all(
        (drinksData || []).map(async (drink) => {
          const { data: ingredientesData, error: ingredientesError } = await supabase
            .from('drink_ingredientes')
            .select('*')
            .eq('drink_id', drink.id);

          if (ingredientesError) throw ingredientesError;

          const ingredientes: Ingrediente[] = (ingredientesData || []).map(ing => ({
            produtoId: ing.produto_id,
            quantidade: Number(ing.quantidade),
            unidade: ing.unidade,
          }));

          return {
            id: drink.id,
            nome: drink.nome,
            descricao: drink.descricao || undefined,
            ingredientes,
            custoTotal: Number(drink.custo_total),
            precoVendaSugerido: Number(drink.preco_venda_sugerido),
          } as Drink;
        })
      );

      setDrinks(drinksComIngredientes);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar drinks',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState<Partial<Drink>>({
    nome: '',
    ingredientes: [],
    custoTotal: 0,
    precoVendaSugerido: 0,
    descricao: '',
  });

  const [novoIngrediente, setNovoIngrediente] = useState<Ingrediente>({
    produtoId: '',
    quantidade: 0,
    unidade: 'ml',
  });

  const calcularCustoTotal = (ingredientes: Ingrediente[]) => {
    return ingredientes.reduce((total, ing) => {
      const produto = produtos.find(p => p.id === ing.produtoId);
      if (!produto) return total;
      
      let custo = 0;
      if (ing.unidade === 'ml') {
        custo = (produto.precoCompra / 1000) * ing.quantidade;
      } else if (ing.unidade === 'un') {
        custo = produto.precoCompra * ing.quantidade;
      } else {
        custo = produto.precoCompra * ing.quantidade;
      }
      return total + custo;
    }, 0);
  };

  const adicionarIngrediente = () => {
    if (!novoIngrediente.produtoId || novoIngrediente.quantidade <= 0) return;
    
    const novosIngredientes = [...(formData.ingredientes || []), novoIngrediente];
    const custoTotal = calcularCustoTotal(novosIngredientes);
    
    setFormData({
      ...formData,
      ingredientes: novosIngredientes,
      custoTotal,
      precoVendaSugerido: custoTotal * 3,
    });
    
    setNovoIngrediente({ produtoId: '', quantidade: 0, unidade: 'ml' });
  };

  const removerIngrediente = (index: number) => {
    const novosIngredientes = formData.ingredientes?.filter((_, i) => i !== index) || [];
    const custoTotal = calcularCustoTotal(novosIngredientes);
    
    setFormData({
      ...formData,
      ingredientes: novosIngredientes,
      custoTotal,
      precoVendaSugerido: custoTotal * 3,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ingredientes || formData.ingredientes.length === 0) {
      toast({ title: 'Erro', description: 'Adicione pelo menos um ingrediente', variant: 'destructive' });
      return;
    }

    setSubmitting(true);

    try {
      const drinkData = {
        nome: formData.nome!,
        descricao: formData.descricao || null,
        custo_total: formData.custoTotal!,
        preco_venda_sugerido: formData.precoVendaSugerido!,
      };

      if (editingDrink) {
        // Atualizar drink
        const { error: drinkError } = await supabase
          .from('drinks')
          .update(drinkData)
          .eq('id', editingDrink.id);

        if (drinkError) throw drinkError;

        // Deletar ingredientes antigos
        const { error: deleteError } = await supabase
          .from('drink_ingredientes')
          .delete()
          .eq('drink_id', editingDrink.id);

        if (deleteError) throw deleteError;

        // Inserir novos ingredientes
        const ingredientesData = formData.ingredientes.map(ing => ({
          drink_id: editingDrink.id,
          produto_id: ing.produtoId,
          quantidade: ing.quantidade,
          unidade: ing.unidade,
        }));

        const { error: ingredientesError } = await supabase
          .from('drink_ingredientes')
          .insert(ingredientesData);

        if (ingredientesError) throw ingredientesError;

        toast({ title: 'Drink atualizado com sucesso!' });
      } else {
        // Criar novo drink
        const { data: newDrink, error: drinkError } = await supabase
          .from('drinks')
          .insert([drinkData])
          .select()
          .single();

        if (drinkError) throw drinkError;

        // Inserir ingredientes
        const ingredientesData = formData.ingredientes.map(ing => ({
          drink_id: newDrink.id,
          produto_id: ing.produtoId,
          quantidade: ing.quantidade,
          unidade: ing.unidade,
        }));

        const { error: ingredientesError } = await supabase
          .from('drink_ingredientes')
          .insert(ingredientesData);

        if (ingredientesError) throw ingredientesError;

        toast({ title: 'Drink criado com sucesso!' });
      }

      await loadDrinks();
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar drink',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      ingredientes: [],
      custoTotal: 0,
      precoVendaSugerido: 0,
      descricao: '',
    });
    setEditingDrink(null);
    setIsOpen(false);
  };

  const handleEdit = (drink: Drink) => {
    setEditingDrink(drink);
    setFormData(drink);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('drinks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Drink excluído com sucesso!' });
      await loadDrinks();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir drink',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const calcularMargem = (custo: number, venda: number) => {
    if (custo === 0) return 0;
    return ((venda - custo) / custo * 100).toFixed(1);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Drinks & Precificação</h1>
              <p className="text-sm text-muted-foreground">Gerencie fichas técnicas e custos</p>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Drinks & Precificação</h1>
            <p className="text-sm text-muted-foreground">Gerencie fichas técnicas e custos</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingDrink(null); resetForm(); }} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="sm:inline">Novo Drink</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
              <DialogHeader>
                <DialogTitle className="text-lg">{editingDrink ? 'Editar Drink' : 'Novo Drink'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome do Drink</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="border border-border rounded-lg p-3 md:p-4 space-y-3">
                  <h3 className="font-semibold text-sm md:text-base">Ingredientes</h3>
                  
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-12 sm:col-span-6">
                      <Select value={novoIngrediente.produtoId} onValueChange={(value) => setNovoIngrediente({ ...novoIngrediente, produtoId: value })}>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Selecione o produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {produtos.map((produto) => (
                            <SelectItem key={produto.id} value={produto.id}>
                              {produto.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-5 sm:col-span-3">
                      <Input
                        type="number"
                        placeholder="Qtd"
                        className="text-sm"
                        value={novoIngrediente.quantidade || ''}
                        onChange={(e) => setNovoIngrediente({ ...novoIngrediente, quantidade: Number(e.target.value) })}
                      />
                    </div>
                    
                    <div className="col-span-5 sm:col-span-2">
                      <Select value={novoIngrediente.unidade} onValueChange={(value) => setNovoIngrediente({ ...novoIngrediente, unidade: value })}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="un">un</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-2 sm:col-span-1">
                      <Button type="button" size="icon" className="w-full h-10" onClick={adicionarIngrediente}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {formData.ingredientes?.map((ing, index) => {
                      const produto = produtos.find(p => p.id === ing.produtoId);
                      return (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="text-sm">
                            {produto?.nome} - {ing.quantidade} {ing.unidade}
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removerIngrediente(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Custo Total (Calculado)</Label>
                    <Input
                      className="text-sm"
                      value={formData.custoTotal?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      disabled
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="precoVenda" className="text-sm">Preço de Venda Sugerido</Label>
                    <Input
                      id="precoVenda"
                      type="number"
                      step="0.01"
                      className="text-sm"
                      value={formData.precoVendaSugerido}
                      onChange={(e) => setFormData({ ...formData, precoVendaSugerido: Number(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Margem: {calcularMargem(formData.custoTotal || 0, formData.precoVendaSugerido || 0)}%
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto" disabled={submitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingDrink ? 'Atualizar' : 'Criar'} Drink
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {drinks.map((drink) => (
            <Card key={drink.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    <Beaker className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    {drink.nome}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                {drink.descricao && (
                  <p className="text-sm text-muted-foreground">{drink.descricao}</p>
                )}
                
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Ingredientes:</h4>
                  {drink.ingredientes.map((ing, index) => {
                    const produto = produtos.find(p => p.id === ing.produtoId);
                    return (
                      <div key={index} className="text-sm text-muted-foreground">
                        • {produto?.nome} - {ing.quantidade} {ing.unidade}
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Custo</p>
                    <p className="text-lg font-semibold">
                      {drink.custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Venda</p>
                    <p className="text-lg font-semibold text-secondary">
                      {drink.precoVendaSugerido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>

                <div className="bg-muted p-2 rounded">
                  <p className="text-xs text-muted-foreground">Margem de Lucro</p>
                  <p className="text-lg font-semibold text-primary">
                    {calcularMargem(drink.custoTotal, drink.precoVendaSugerido)}%
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(drink)} className="flex-1 text-xs">
                    <Pencil className="h-3 w-3 sm:mr-1" />
                    <span className="hidden sm:inline">Editar</span>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(drink.id)} className="flex-1 text-xs">
                    <Trash2 className="h-3 w-3 sm:mr-1" />
                    <span className="hidden sm:inline">Excluir</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Drinks;
