import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Orcamento, Cliente } from '@/types';
import { Plus, Trash2, Calendar, Clock, MapPin, Users, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrcamentoEditorProps {
  orcamento: Orcamento | null;
  clientes: Cliente[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (orcamento: Orcamento) => void;
}

export function OrcamentoEditor({ 
  orcamento, 
  clientes, 
  open, 
  onOpenChange, 
  onSave 
}: OrcamentoEditorProps) {
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<Orcamento>>(
    orcamento || {
      clienteId: '',
      status: 'enviado',
      dataEnvio: new Date().toISOString().split('T')[0],
      nomeEvento: '',
      dataEvento: '',
      horarioAbertura: '18:00',
      horarioFechamento: '23:00',
      localEvento: '',
      numeroConvidados: 60,
      cartasDrinks: [],
      numeroBartendes: 2,
      estrutura: 'Fornecer uma bancada de atendimento local para a montagem dos drinks.',
      condicoesFinanceiras: {
        valorTotal: 1000,
        percentualAntecipado: 50,
        diasAntecedencia: 3,
      },
      horarioExtra: 1550,
      listaInsumos: {
        distilados: [],
        frutas: [],
        outrasBebidas: [],
        outrosInsumos: [],
      }
    }
  );

  const [novoDrink, setNovoDrink] = useState('');

  const addDrink = () => {
    if (novoDrink.trim()) {
      setForm({
        ...form,
        cartasDrinks: [...(form.cartasDrinks || []), novoDrink.trim()]
      });
      setNovoDrink('');
    }
  };

  const removeDrink = (index: number) => {
    setForm({
      ...form,
      cartasDrinks: form.cartasDrinks?.filter((_, i) => i !== index)
    });
  };

  const handleSave = () => {
    if (!form.clienteId || !form.nomeEvento || !form.dataEvento || !form.localEvento) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha cliente, nome do evento, data e local',
        variant: 'destructive'
      });
      return;
    }

    const valorTotal = form.condicoesFinanceiras?.valorTotal || 0;
    const orcamentoCompleto: Orcamento = {
      id: orcamento?.id || Date.now().toString(),
      ...form,
      valorTotal,
      itens: `Evento: ${form.nomeEvento} - ${form.numeroConvidados} convidados`,
    } as Orcamento;

    onSave(orcamentoCompleto);
    onOpenChange(false);
    toast({ title: 'Orçamento salvo com sucesso!' });
  };

  const valorTotal = form.condicoesFinanceiras?.valorTotal || 0;
  const percentualAntecipado = form.condicoesFinanceiras?.percentualAntecipado || 50;
  const valorAntecipado = (valorTotal * percentualAntecipado) / 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {orcamento ? 'Editar Orçamento' : 'Novo Orçamento'}
          </DialogTitle>
          <CardDescription>
            Preencha as informações do evento para gerar o orçamento
          </CardDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cliente e Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Cliente e Status
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente *</Label>
                <Select 
                  value={form.clienteId} 
                  onValueChange={(value) => setForm({ ...form, clienteId: value })}
                >
                  <SelectTrigger id="cliente">
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status do Orçamento</Label>
                <Select 
                  value={form.status} 
                  onValueChange={(value: any) => setForm({ ...form, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="recusado">Recusado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Evento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informações do Evento
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nomeEvento">Nome do Evento *</Label>
                  <Input
                    id="nomeEvento"
                    value={form.nomeEvento || ''}
                    onChange={(e) => setForm({ ...form, nomeEvento: e.target.value })}
                    placeholder="Ex: Meio médico, Festa de fim de ano..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroConvidados">Número de Convidados</Label>
                  <Input
                    id="numeroConvidados"
                    type="number"
                    min="1"
                    value={form.numeroConvidados || 0}
                    onChange={(e) => setForm({ ...form, numeroConvidados: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="dataEvento" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data do Evento *
                  </Label>
                  <Input
                    id="dataEvento"
                    type="date"
                    value={form.dataEvento || ''}
                    onChange={(e) => setForm({ ...form, dataEvento: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horarioAbertura" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horário de Abertura
                  </Label>
                  <Input
                    id="horarioAbertura"
                    type="time"
                    value={form.horarioAbertura || ''}
                    onChange={(e) => setForm({ ...form, horarioAbertura: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horarioFechamento" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horário de Fechamento
                  </Label>
                  <Input
                    id="horarioFechamento"
                    type="time"
                    value={form.horarioFechamento || ''}
                    onChange={(e) => setForm({ ...form, horarioFechamento: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="localEvento" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Local do Evento *
                </Label>
                <Input
                  id="localEvento"
                  value={form.localEvento || ''}
                  onChange={(e) => setForm({ ...form, localEvento: e.target.value })}
                  placeholder="Ex: Presidente Dutra, Rua ABC..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Carta de Drinks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Carta de Drinks</CardTitle>
              <CardDescription>
                Adicione os drinks que serão servidos no evento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={novoDrink}
                  onChange={(e) => setNovoDrink(e.target.value)}
                  placeholder="Ex: Siciliana, Sol Nascente, Gin Tônica..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addDrink();
                    }
                  }}
                />
                <Button type="button" onClick={addDrink} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {form.cartasDrinks && form.cartasDrinks.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {form.cartasDrinks.map((drink, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between gap-2 p-3 bg-secondary/20 rounded-lg border border-border"
                    >
                      <span className="font-medium">{drink}</span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeDrink(index)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {(!form.cartasDrinks || form.cartasDrinks.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum drink adicionado ainda
                </p>
              )}
            </CardContent>
          </Card>

          {/* Equipamentos e Serviços */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Equipamentos e Serviços</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="numeroBartendes">Número de Bartenders</Label>
                <Input
                  id="numeroBartendes"
                  type="number"
                  min="1"
                  value={form.numeroBartendes || 2}
                  onChange={(e) => setForm({ ...form, numeroBartendes: Number(e.target.value) })}
                />
                <p className="text-sm text-muted-foreground">
                  Bartenders dimensionados para {form.numeroConvidados || 0} convidados
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estrutura">Estrutura Fornecida</Label>
                <Textarea
                  id="estrutura"
                  value={form.estrutura || ''}
                  onChange={(e) => setForm({ ...form, estrutura: e.target.value })}
                  rows={3}
                  placeholder="Descreva a estrutura que será fornecida para o evento..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Condições Financeiras */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Condições Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="valorTotal">Valor Total do Serviço (R$)</Label>
                  <Input
                    id="valorTotal"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.condicoesFinanceiras?.valorTotal || 0}
                    onChange={(e) => setForm({
                      ...form,
                      condicoesFinanceiras: {
                        ...form.condicoesFinanceiras,
                        valorTotal: Number(e.target.value)
                      }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horarioExtra">Valor Horário Extra (R$)</Label>
                  <Input
                    id="horarioExtra"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.horarioExtra || 0}
                    onChange={(e) => setForm({ ...form, horarioExtra: Number(e.target.value) })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold">Condições de Pagamento</h4>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="percentualAntecipado">% Pagamento Antecipado</Label>
                    <Input
                      id="percentualAntecipado"
                      type="number"
                      min="0"
                      max="100"
                      value={form.condicoesFinanceiras?.percentualAntecipado || 50}
                      onChange={(e) => setForm({
                        ...form,
                        condicoesFinanceiras: {
                          ...form.condicoesFinanceiras,
                          percentualAntecipado: Number(e.target.value)
                        }
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diasAntecedencia">Dias de Antecedência</Label>
                    <Input
                      id="diasAntecedencia"
                      type="number"
                      min="0"
                      value={form.condicoesFinanceiras?.diasAntecedencia || 3}
                      onChange={(e) => setForm({
                        ...form,
                        condicoesFinanceiras: {
                          ...form.condicoesFinanceiras,
                          diasAntecedencia: Number(e.target.value)
                        }
                      })}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Valor do Sinal:</span>
                    <span className="text-lg font-bold text-primary">
                      {valorAntecipado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pagamento antecipado de {percentualAntecipado}% a confirmar {form.condicoesFinanceiras?.diasAntecedencia || 3} dias antes do evento
                  </p>
                </div>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Valor Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} size="lg">
              Salvar Orçamento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
