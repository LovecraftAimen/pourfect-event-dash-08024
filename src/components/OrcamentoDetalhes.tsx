import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Orcamento, Cliente, Drink } from '@/types';
import { Calendar, MapPin, Users, DollarSign, Wine, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockDrinks } from '@/data/mockData';

interface OrcamentoDetalhesProps {
  orcamento: Orcamento | null;
  clientes: Cliente[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (orcamento: Orcamento) => void;
}

export function OrcamentoDetalhes({ 
  orcamento, 
  clientes, 
  open, 
  onOpenChange, 
  onSave 
}: OrcamentoDetalhesProps) {
  const { toast } = useToast();
  const [drinks] = useLocalStorage<Drink[]>('drinks', mockDrinks);
  const [drinksSelecionados, setDrinksSelecionados] = useState<string[]>(
    orcamento?.cartasDrinks || []
  );

  const cliente = clientes.find(c => c.id === orcamento?.clienteId);

  const addDrink = (drinkId: string) => {
    if (!drinksSelecionados.includes(drinkId)) {
      setDrinksSelecionados([...drinksSelecionados, drinkId]);
    }
  };

  const removeDrink = (drinkId: string) => {
    setDrinksSelecionados(drinksSelecionados.filter(id => id !== drinkId));
  };

  const handleSave = () => {
    if (!orcamento) return;

    const orcamentoAtualizado: Orcamento = {
      ...orcamento,
      cartasDrinks: drinksSelecionados,
    };

    onSave(orcamentoAtualizado);
    toast({ title: 'Drinks atualizados com sucesso!' });
    onOpenChange(false);
  };

  if (!orcamento) return null;

  const valorTotal = orcamento.condicoesFinanceiras?.valorTotal || orcamento.valorTotal;
  const percentualAntecipado = orcamento.condicoesFinanceiras?.percentualAntecipado || 50;
  const valorAntecipado = (valorTotal * percentualAntecipado) / 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Detalhes do Orçamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações do Cliente e Evento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-semibold">{cliente?.nome}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={
                    orcamento.status === 'aprovado' 
                      ? 'bg-green-500' 
                      : orcamento.status === 'recusado' 
                      ? 'bg-red-500' 
                      : ''
                  }>
                    {orcamento.status}
                  </Badge>
                </div>
              </div>

              {orcamento.nomeEvento && (
                <Separator />
              )}

              {orcamento.nomeEvento && (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Evento</p>
                      <p className="font-semibold">{orcamento.nomeEvento}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Convidados</p>
                        <p className="font-semibold">{orcamento.numeroConvidados}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {orcamento.dataEvento && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Data</p>
                          <p className="font-semibold">
                            {new Date(orcamento.dataEvento).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    )}
                    {orcamento.localEvento && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Local</p>
                          <p className="font-semibold">{orcamento.localEvento}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Drinks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wine className="h-5 w-5" />
                Drinks do Evento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2">
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
                            ✓
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {drinksSelecionados.length > 0 && (
                <div className="mt-4 p-3 bg-secondary/20 rounded-lg">
                  <p className="text-sm font-semibold mb-2">
                    Selecionados ({drinksSelecionados.length}):
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
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Valores */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Valores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Valor Total:</span>
                <span className="text-xl font-bold text-primary">
                  {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              
              {orcamento.condicoesFinanceiras && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Sinal ({percentualAntecipado}%):
                    </span>
                    <span className="font-semibold">
                      {valorAntecipado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A confirmar {orcamento.condicoesFinanceiras.diasAntecedencia} dias antes do evento
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave}>
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
