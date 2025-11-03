import { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockDrinks, mockProdutos } from '@/data/mockData';
import { Drink, Ingrediente } from '@/types';
import { Plus, Beaker, DollarSign, Pencil, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Drinks = () => {
  const [drinks, setDrinks] = useLocalStorage<Drink[]>('drinks', mockDrinks);
  const [produtos] = useLocalStorage('produtos', mockProdutos);
  const [isOpen, setIsOpen] = useState(false);
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);
  const { toast } = useToast();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ingredientes || formData.ingredientes.length === 0) {
      toast({ title: 'Erro', description: 'Adicione pelo menos um ingrediente', variant: 'destructive' });
      return;
    }
    
    if (editingDrink) {
      setDrinks(drinks.map(d => d.id === editingDrink.id ? { ...formData, id: editingDrink.id } as Drink : d));
      toast({ title: 'Drink atualizado com sucesso!' });
    } else {
      const novoDrink: Drink = {
        ...formData,
        id: Date.now().toString(),
      } as Drink;
      setDrinks([...drinks, novoDrink]);
      toast({ title: 'Drink criado com sucesso!' });
    }
    
    resetForm();
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

  const handleDelete = (id: string) => {
    setDrinks(drinks.filter(d => d.id !== id));
    toast({ title: 'Drink excluído com sucesso!' });
  };

  const calcularMargem = (custo: number, venda: number) => {
    if (custo === 0) return 0;
    return ((venda - custo) / custo * 100).toFixed(1);
  };

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
                  <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto">
                    Cancelar
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">
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
