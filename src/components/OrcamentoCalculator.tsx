import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Users, DollarSign, Plus, Trash2, Wine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Drink, MembroEquipe } from '@/types';

interface ItemEquipe {
  id: string;
  membroId: string;
  nome: string;
  funcao: string;
  quantidade: number;
  valorUnitario: number;
}

interface ItemEstrutura {
  id: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
}

interface ItemPreparo {
  id: string;
  descricao: string;
  quantidade: number;
  valorPorLitro: number;
}

export const OrcamentoCalculator = () => {
  const { toast } = useToast();
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [membrosEquipe, setMembrosEquipe] = useState<MembroEquipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [nomeCliente, setNomeCliente] = useState('');
  const [dataEvento, setDataEvento] = useState('');
  const [numeroConvidados, setNumeroConvidados] = useState(120);
  const [localizacao, setLocalizacao] = useState('');
  const [drinksSelecionados, setDrinksSelecionados] = useState<string[]>([]);
  const [membroSelecionado, setMembroSelecionado] = useState<string>('');

  useEffect(() => {
    loadDrinks();
    loadMembrosEquipe();
  }, []);

  const loadDrinks = async () => {
    try {
      const { data, error } = await supabase
        .from('drinks')
        .select('*')
        .order('nome');

      if (error) throw error;

      const drinksFormatados: Drink[] = (data || []).map(d => ({
        id: d.id,
        nome: d.nome,
        descricao: d.descricao || '',
        ingredientes: [],
        custoTotal: Number(d.custo_total),
        precoVendaSugerido: Number(d.preco_venda_sugerido),
      }));

      setDrinks(drinksFormatados);
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

  const loadMembrosEquipe = async () => {
    try {
      const { data, error } = await supabase
        .from('membros_equipe')
        .select('*')
        .eq('disponibilidade', 'disponivel')
        .order('nome');

      if (error) throw error;

      const membrosFormatados: MembroEquipe[] = (data || []).map(m => ({
        id: m.id,
        nome: m.nome,
        funcao: m.funcao,
        telefone: m.telefone,
        email: m.email,
        salarioPorEvento: Number(m.salario_por_evento),
        disponibilidade: m.disponibilidade as 'disponivel' | 'ocupado' | 'inativo',
      }));

      setMembrosEquipe(membrosFormatados);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar membros da equipe',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Equipe
  const [itensEquipe, setItensEquipe] = useState<ItemEquipe[]>([]);

  // Estrutura
  const [itensEstrutura, setItensEstrutura] = useState<ItemEstrutura[]>([
    { id: '1', descricao: 'Deslocamento', quantidade: 1, valorUnitario: 50 },
    { id: '2', descricao: 'Aluguel de Vidros', quantidade: 1, valorUnitario: 150 },
  ]);

  // Preparos Especiais
  const [itensPreparos, setItensPreparos] = useState<ItemPreparo[]>([
    { id: '1', descricao: 'Xarope de baunilha (L)', quantidade: 2, valorPorLitro: 30 },
    { id: '2', descricao: 'Chá mate (L)', quantidade: 2, valorPorLitro: 30 },
    { id: '3', descricao: 'Chá de canela (L)', quantidade: 2, valorPorLitro: 30 },
    { id: '4', descricao: 'Chá de cravo (L)', quantidade: 1, valorPorLitro: 30 },
  ]);

  // Cálculos
  const subtotalEquipe = itensEquipe.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0);
  const subtotalEstrutura = itensEstrutura.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0);
  const subtotalPreparos = itensPreparos.reduce((acc, item) => acc + (item.quantidade * item.valorPorLitro), 0);
  const valorTotal = subtotalEquipe + subtotalEstrutura + subtotalPreparos;
  const custoPorConvidado = numeroConvidados > 0 ? valorTotal / numeroConvidados : 0;
  const totalEquipe = itensEquipe.reduce((acc, item) => acc + item.quantidade, 0);

  // Funções para Equipe
  const addMembroEquipe = () => {
    if (!membroSelecionado) {
      toast({
        title: 'Selecione um membro',
        description: 'Escolha um membro da equipe disponível',
        variant: 'destructive',
      });
      return;
    }

    const membro = membrosEquipe.find(m => m.id === membroSelecionado);
    if (!membro) return;

    // Verificar se já foi adicionado
    const jaAdicionado = itensEquipe.find(item => item.membroId === membro.id);
    if (jaAdicionado) {
      toast({
        title: 'Membro já adicionado',
        description: 'Este membro já está na equipe do orçamento',
        variant: 'destructive',
      });
      return;
    }

    setItensEquipe([
      ...itensEquipe,
      {
        id: Date.now().toString(),
        membroId: membro.id,
        nome: membro.nome,
        funcao: membro.funcao,
        quantidade: 1,
        valorUnitario: membro.salarioPorEvento,
      }
    ]);

    setMembroSelecionado('');
  };

  const updateItemEquipe = (id: string, field: keyof ItemEquipe, value: string | number) => {
    setItensEquipe(itensEquipe.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItemEquipe = (id: string) => {
    setItensEquipe(itensEquipe.filter(item => item.id !== id));
  };

  // Funções para Estrutura
  const addItemEstrutura = () => {
    setItensEstrutura([...itensEstrutura, { id: Date.now().toString(), descricao: '', quantidade: 1, valorUnitario: 0 }]);
  };

  const updateItemEstrutura = (id: string, field: keyof ItemEstrutura, value: string | number) => {
    setItensEstrutura(itensEstrutura.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItemEstrutura = (id: string) => {
    setItensEstrutura(itensEstrutura.filter(item => item.id !== id));
  };

  // Funções para Preparos
  const addItemPreparo = () => {
    setItensPreparos([...itensPreparos, { id: Date.now().toString(), descricao: '', quantidade: 0, valorPorLitro: 0 }]);
  };

  const updateItemPreparo = (id: string, field: keyof ItemPreparo, value: string | number) => {
    setItensPreparos(itensPreparos.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItemPreparo = (id: string) => {
    setItensPreparos(itensPreparos.filter(item => item.id !== id));
  };

  const addDrink = (drinkId: string) => {
    if (!drinksSelecionados.includes(drinkId)) {
      setDrinksSelecionados([...drinksSelecionados, drinkId]);
    }
  };

  const removeDrink = (drinkId: string) => {
    setDrinksSelecionados(drinksSelecionados.filter(id => id !== drinkId));
  };

  const salvarOrcamento = () => {
    if (!nomeCliente || !dataEvento || !localizacao) {
      toast({ 
        title: 'Campos obrigatórios', 
        description: 'Preencha cliente, data e localização',
        variant: 'destructive' 
      });
      return;
    }

    toast({ 
      title: 'Orçamento salvo!', 
      description: `Orçamento de R$ ${valorTotal.toFixed(2)} criado com sucesso` 
    });
  };

  return (
    <div className="space-y-6">
      {/* Resumo Superior */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Orçamento Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Custo por Convidado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">
              {custoPorConvidado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Equipe Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalEquipe} {totalEquipe === 1 ? 'pessoa' : 'pessoas'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações do Evento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Informações do Evento
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="cliente">Cliente</Label>
            <Input 
              id="cliente"
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              placeholder="Nome do cliente"
            />
          </div>
          <div>
            <Label htmlFor="dataEvento">Data do Evento</Label>
            <Input 
              id="dataEvento"
              type="date"
              value={dataEvento}
              onChange={(e) => setDataEvento(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="convidados">Número de Convidados</Label>
            <Input 
              id="convidados"
              type="number"
              value={numeroConvidados}
              onChange={(e) => setNumeroConvidados(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="localizacao">Localização</Label>
            <Input 
              id="localizacao"
              value={localizacao}
              onChange={(e) => setLocalizacao(e.target.value)}
              placeholder="Cidade/Local do evento"
            />
          </div>
        </CardContent>
      </Card>

      {/* Drinks do Evento */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Wine className="h-5 w-5" />
              Drinks do Evento
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Carregando drinks...
            </p>
          ) : drinks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum drink cadastrado ainda
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {drinks.map((drink) => {
              const isSelecionado = drinksSelecionados.includes(drink.id);
              return (
                <button
                  key={drink.id}
                  onClick={() => isSelecionado ? removeDrink(drink.id) : addDrink(drink.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    isSelecionado
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium">{drink.nome}</p>
                      {drink.descricao && (
                        <p className="text-xs text-muted-foreground mt-1">{drink.descricao}</p>
                      )}
                      <p className="text-sm text-primary font-semibold mt-2">
                        {drink.precoVendaSugerido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                    {isSelecionado && (
                      <Badge variant="default" className="shrink-0">
                        Selecionado
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
            </div>
          )}

          {!loading && drinksSelecionados.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum drink selecionado ainda
            </p>
          )}

          {!loading && drinksSelecionados.length > 0 && (
            <div className="mt-4 p-3 bg-secondary/20 rounded-lg">
              <p className="text-sm font-semibold mb-2">
                Drinks Selecionados ({drinksSelecionados.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {drinksSelecionados.map((drinkId) => {
                  const drink = drinks.find(d => d.id === drinkId);
                  if (!drink) return null;
                  return (
                    <Badge key={drinkId} variant="secondary" className="gap-1">
                      {drink.nome}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDrink(drinkId);
                        }}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Equipe */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Equipe
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Select value={membroSelecionado} onValueChange={setMembroSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um membro da equipe" />
                </SelectTrigger>
                <SelectContent>
                  {membrosEquipe.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Nenhum membro disponível
                    </div>
                  ) : (
                    membrosEquipe.map((membro) => (
                      <SelectItem key={membro.id} value={membro.id}>
                        {membro.nome} - {membro.funcao} (R$ {membro.salarioPorEvento.toFixed(2)})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addMembroEquipe} disabled={!membroSelecionado}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>

          {itensEquipe.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum membro adicionado à equipe ainda
            </p>
          ) : (
            <div className="space-y-3">
              {itensEquipe.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-3 bg-secondary/10 rounded-lg">
                  <div className="col-span-4">
                    <Label className="text-xs">Nome</Label>
                    <p className="font-medium text-sm">{item.nome}</p>
                  </div>
                  <div className="col-span-3">
                    <Label className="text-xs">Função</Label>
                    <p className="text-sm text-muted-foreground">{item.funcao}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Qtd.</Label>
                    <Input 
                      type="number"
                      value={item.quantidade}
                      onChange={(e) => updateItemEquipe(item.id, 'quantidade', Number(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div className="col-span-3 flex items-center justify-end gap-2">
                    <div className="text-right">
                      <Label className="text-xs">Total</Label>
                      <p className="text-sm font-medium">
                        R$ {(item.quantidade * item.valorUnitario).toFixed(2)}
                      </p>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => removeItemEquipe(item.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Separator />
          <div className="flex justify-between items-center pt-2">
            <span className="font-semibold">Subtotal Equipe:</span>
            <span className="text-xl font-bold text-primary">
              {subtotalEquipe.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Estrutura e Deslocamento */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Estrutura e Deslocamento
            </CardTitle>
            <Button size="sm" onClick={addItemEstrutura}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {itensEstrutura.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                <Label className="text-xs">Descrição</Label>
                <Input 
                  value={item.descricao}
                  onChange={(e) => updateItemEstrutura(item.id, 'descricao', e.target.value)}
                  placeholder="Ex: Deslocamento"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Qtd.</Label>
                <Input 
                  type="number"
                  value={item.quantidade}
                  onChange={(e) => updateItemEstrutura(item.id, 'quantidade', Number(e.target.value))}
                />
              </div>
              <div className="col-span-3">
                <Label className="text-xs">Valor Unit. (R$)</Label>
                <Input 
                  type="number"
                  step="0.01"
                  value={item.valorUnitario}
                  onChange={(e) => updateItemEstrutura(item.id, 'valorUnitario', Number(e.target.value))}
                />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <span className="text-sm font-medium">
                  R$ {(item.quantidade * item.valorUnitario).toFixed(2)}
                </span>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => removeItemEstrutura(item.id)}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between items-center pt-2">
            <span className="font-semibold">Subtotal Estrutura:</span>
            <span className="text-xl font-bold text-primary">
              {subtotalEstrutura.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Preparos Especiais */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Preparos Especiais</CardTitle>
            <Button size="sm" onClick={addItemPreparo}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {itensPreparos.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                <Label className="text-xs">Descrição</Label>
                <Input 
                  value={item.descricao}
                  onChange={(e) => updateItemPreparo(item.id, 'descricao', e.target.value)}
                  placeholder="Ex: Xarope de baunilha (L)"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Qtd. (L)</Label>
                <Input 
                  type="number"
                  value={item.quantidade}
                  onChange={(e) => updateItemPreparo(item.id, 'quantidade', Number(e.target.value))}
                />
              </div>
              <div className="col-span-3">
                <Label className="text-xs">R$/Litro</Label>
                <Input 
                  type="number"
                  step="0.01"
                  value={item.valorPorLitro}
                  onChange={(e) => updateItemPreparo(item.id, 'valorPorLitro', Number(e.target.value))}
                />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <span className="text-sm font-medium">
                  R$ {(item.quantidade * item.valorPorLitro).toFixed(2)}
                </span>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => removeItemPreparo(item.id)}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between items-center pt-2">
            <span className="font-semibold">Subtotal Preparos:</span>
            <span className="text-xl font-bold text-primary">
              {subtotalPreparos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Total Final */}
      <Card className="border-primary">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">VALOR TOTAL</span>
            <span className="text-4xl font-bold text-primary">
              {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button size="lg" onClick={salvarOrcamento}>
          Salvar Orçamento
        </Button>
      </div>
    </div>
  );
};
