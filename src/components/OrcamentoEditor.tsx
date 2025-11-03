import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Orcamento, Cliente } from '@/types';
import { Plus, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface OrcamentoEditorProps {
  orcamento: Orcamento | null;
  clientes: Cliente[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (orcamento: Orcamento) => void;
}

export const OrcamentoEditor = ({ 
  orcamento, 
  clientes, 
  open, 
  onOpenChange, 
  onSave 
}: OrcamentoEditorProps) => {
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

  const addInsumo = (categoria: 'distilados' | 'frutas' | 'outrasBebidas' | 'outrosInsumos') => {
    const listaInsumos = form.listaInsumos || { distilados: [], frutas: [], outrasBebidas: [], outrosInsumos: [] };
    setForm({
      ...form,
      listaInsumos: {
        ...listaInsumos,
        [categoria]: [...(listaInsumos[categoria] || []), { nome: '', quantidade: '' }]
      }
    });
  };

  const updateInsumo = (
    categoria: 'distilados' | 'frutas' | 'outrasBebidas' | 'outrosInsumos',
    index: number,
    field: 'nome' | 'quantidade',
    value: string
  ) => {
    const listaInsumos = form.listaInsumos || { distilados: [], frutas: [], outrasBebidas: [], outrosInsumos: [] };
    const lista = [...(listaInsumos[categoria] || [])];
    lista[index] = { ...lista[index], [field]: value };
    setForm({
      ...form,
      listaInsumos: {
        ...listaInsumos,
        [categoria]: lista
      }
    });
  };

  const removeInsumo = (categoria: 'distilados' | 'frutas' | 'outrasBebidas' | 'outrosInsumos', index: number) => {
    const listaInsumos = form.listaInsumos || { distilados: [], frutas: [], outrasBebidas: [], outrosInsumos: [] };
    setForm({
      ...form,
      listaInsumos: {
        ...listaInsumos,
        [categoria]: listaInsumos[categoria]?.filter((_, i) => i !== index)
      }
    });
  };

  const handleSave = () => {
    if (!form.clienteId || !form.nomeEvento || !form.dataEvento || !form.localEvento) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios',
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
    toast({ title: 'Orçamento salvo com sucesso!' });
  };

  const generatePDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPos = 20;

    // Título
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DONKEY SHOT', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Informações do Evento
    pdf.setFontSize(14);
    pdf.text('Evento:', 20, yPos);
    yPos += 8;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${form.nomeEvento || ''} - Quantidades de convidados: ${form.numeroConvidados || 0}`, 20, yPos);
    yPos += 7;
    pdf.text(`Data: ${form.dataEvento ? new Date(form.dataEvento).toLocaleDateString('pt-BR') : ''}`, 20, yPos);
    yPos += 7;
    pdf.text(`Horário de Abertura: ${form.horarioAbertura || ''}`, 20, yPos);
    yPos += 7;
    pdf.text(`Local: ${form.localEvento || ''}`, 20, yPos);
    yPos += 7;
    pdf.text(`Horário de fechamento: ${form.horarioFechamento || ''}`, 20, yPos);
    yPos += 12;

    // Cartas de Drinks
    if (form.cartasDrinks && form.cartasDrinks.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Cartas de Drinks', 20, yPos);
      yPos += 8;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      form.cartasDrinks.forEach((drink) => {
        pdf.text(`- ${drink}`, 25, yPos);
        yPos += 6;
      });
      yPos += 6;
    }

    // Obrigações da Donkey Shot
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Obrigações da Donkey Shot', 20, yPos);
    yPos += 8;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Montagem: A contratada se compromete a chegar ao local do evento com,', 20, yPos);
    yPos += 6;
    pdf.text('no mínimo, 3 (três) horas de antecedência para preparar os drinks.', 20, yPos);
    yPos += 10;

    // Equipamentos e Serviços
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Equipamentos e Serviços:', 20, yPos);
    yPos += 8;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Prestação de serviço por ${form.numeroBartendes || 2} Bartenders (dimensionados para ${form.numeroConvidados || 0} convidados).`, 20, yPos);
    yPos += 10;

    // Estrutura
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Estrutura:', 20, yPos);
    yPos += 8;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const estruturaText = pdf.splitTextToSize(form.estrutura || '', pageWidth - 40);
    pdf.text(estruturaText, 20, yPos);
    yPos += estruturaText.length * 6 + 4;

    // Condições Financeiras
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Condições Financeiras', 20, yPos);
    yPos += 8;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const valorTotal = form.condicoesFinanceiras?.valorTotal || 0;
    pdf.text(`Valor Total do Serviço: R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPos);
    yPos += 7;

    const percentual = form.condicoesFinanceiras?.percentualAntecipado || 50;
    const valorAntecipado = (valorTotal * percentual) / 100;
    const diasAntecedencia = form.condicoesFinanceiras?.diasAntecedencia || 3;
    
    pdf.text(`Pagamento: ${percentual}% (R$ ${valorAntecipado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) a confirmar ${diasAntecedencia} dias antes do evento.`, 20, yPos);
    yPos += 10;

    // Horário Extra
    if (form.horarioExtra) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Horário Extra:', 20, yPos);
      yPos += 8;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Caso o contrato tenha que ser estendido, o valor adicional será R$ ${form.horarioExtra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`, 20, yPos);
      yPos += 10;
    }

    // Segunda página - Lista de Insumos
    if (form.listaInsumos && 
        (form.listaInsumos.distilados?.length || 
         form.listaInsumos.frutas?.length || 
         form.listaInsumos.outrasBebidas?.length || 
         form.listaInsumos.outrosInsumos?.length)) {
      
      pdf.addPage();
      yPos = 20;

      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DONKEY SHOT LIST', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      const renderCategoria = (titulo: string, items: { nome: string; quantidade: string }[] | undefined) => {
        if (!items || items.length === 0) return;
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(titulo, 20, yPos);
        yPos += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        items.forEach((item) => {
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
          pdf.text(`${item.nome}:`, 20, yPos);
          pdf.text(item.quantidade, 120, yPos);
          yPos += 6;
        });
        yPos += 5;
      };

      renderCategoria('Distilados:', form.listaInsumos.distilados);
      renderCategoria('Frutas:', form.listaInsumos.frutas);
      renderCategoria('Outras Bebidas:', form.listaInsumos.outrasBebidas);
      renderCategoria('Outros Insumos:', form.listaInsumos.outrosInsumos);
    }

    const cliente = clientes.find(c => c.id === form.clienteId);
    const nomeArquivo = `Orcamento_${cliente?.nome || 'Cliente'}_${form.nomeEvento || 'Evento'}.pdf`;
    pdf.save(nomeArquivo);

    toast({ title: 'PDF gerado com sucesso!' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {orcamento ? 'Editar Orçamento' : 'Novo Orçamento Detalhado'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Evento</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="cliente">Cliente *</Label>
                <Select 
                  value={form.clienteId} 
                  onValueChange={(value) => setForm({ ...form, clienteId: value })}
                >
                  <SelectTrigger>
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

              <div>
                <Label htmlFor="nomeEvento">Nome do Evento *</Label>
                <Input
                  id="nomeEvento"
                  value={form.nomeEvento || ''}
                  onChange={(e) => setForm({ ...form, nomeEvento: e.target.value })}
                  placeholder="Ex: Meio médico"
                />
              </div>

              <div>
                <Label htmlFor="dataEvento">Data do Evento *</Label>
                <Input
                  id="dataEvento"
                  type="date"
                  value={form.dataEvento || ''}
                  onChange={(e) => setForm({ ...form, dataEvento: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="localEvento">Local *</Label>
                <Input
                  id="localEvento"
                  value={form.localEvento || ''}
                  onChange={(e) => setForm({ ...form, localEvento: e.target.value })}
                  placeholder="Ex: Presidente Dutra"
                />
              </div>

              <div>
                <Label htmlFor="numeroConvidados">Número de Convidados</Label>
                <Input
                  id="numeroConvidados"
                  type="number"
                  value={form.numeroConvidados || 0}
                  onChange={(e) => setForm({ ...form, numeroConvidados: Number(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="horarioAbertura">Horário de Abertura</Label>
                <Input
                  id="horarioAbertura"
                  type="time"
                  value={form.horarioAbertura || ''}
                  onChange={(e) => setForm({ ...form, horarioAbertura: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="horarioFechamento">Horário de Fechamento</Label>
                <Input
                  id="horarioFechamento"
                  type="time"
                  value={form.horarioFechamento || ''}
                  onChange={(e) => setForm({ ...form, horarioFechamento: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="numeroBartendes">Número de Bartenders</Label>
                <Input
                  id="numeroBartendes"
                  type="number"
                  value={form.numeroBartendes || 2}
                  onChange={(e) => setForm({ ...form, numeroBartendes: Number(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Carta de Drinks */}
          <Card>
            <CardHeader>
              <CardTitle>Carta de Drinks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={novoDrink}
                  onChange={(e) => setNovoDrink(e.target.value)}
                  placeholder="Nome do drink"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDrink())}
                />
                <Button type="button" onClick={addDrink}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {form.cartasDrinks?.map((drink, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="flex-1">{drink}</span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeDrink(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Estrutura */}
          <Card>
            <CardHeader>
              <CardTitle>Estrutura</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={form.estrutura || ''}
                onChange={(e) => setForm({ ...form, estrutura: e.target.value })}
                rows={3}
                placeholder="Descreva a estrutura fornecida"
              />
            </CardContent>
          </Card>

          {/* Condições Financeiras */}
          <Card>
            <CardHeader>
              <CardTitle>Condições Financeiras</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="valorTotal">Valor Total do Serviço (R$)</Label>
                <Input
                  id="valorTotal"
                  type="number"
                  step="0.01"
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

              <div>
                <Label htmlFor="percentualAntecipado">% Pagamento Antecipado</Label>
                <Input
                  id="percentualAntecipado"
                  type="number"
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

              <div>
                <Label htmlFor="diasAntecedencia">Dias de Antecedência</Label>
                <Input
                  id="diasAntecedencia"
                  type="number"
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

              <div>
                <Label htmlFor="horarioExtra">Valor Horário Extra (R$)</Label>
                <Input
                  id="horarioExtra"
                  type="number"
                  step="0.01"
                  value={form.horarioExtra || 0}
                  onChange={(e) => setForm({ ...form, horarioExtra: Number(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de Insumos */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Insumos (Opcional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Distilados */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-base font-semibold">Distilados</Label>
                  <Button type="button" size="sm" onClick={() => addInsumo('distilados')}>
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
                <div className="space-y-2">
                  {form.listaInsumos?.distilados?.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2">
                      <Input
                        className="col-span-6"
                        value={item.nome}
                        onChange={(e) => updateInsumo('distilados', index, 'nome', e.target.value)}
                        placeholder="Nome"
                      />
                      <Input
                        className="col-span-5"
                        value={item.quantidade}
                        onChange={(e) => updateInsumo('distilados', index, 'quantidade', e.target.value)}
                        placeholder="Quantidade"
                      />
                      <Button
                        type="button"
                        className="col-span-1"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeInsumo('distilados', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Frutas */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-base font-semibold">Frutas</Label>
                  <Button type="button" size="sm" onClick={() => addInsumo('frutas')}>
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
                <div className="space-y-2">
                  {form.listaInsumos?.frutas?.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2">
                      <Input
                        className="col-span-6"
                        value={item.nome}
                        onChange={(e) => updateInsumo('frutas', index, 'nome', e.target.value)}
                        placeholder="Nome"
                      />
                      <Input
                        className="col-span-5"
                        value={item.quantidade}
                        onChange={(e) => updateInsumo('frutas', index, 'quantidade', e.target.value)}
                        placeholder="Quantidade"
                      />
                      <Button
                        type="button"
                        className="col-span-1"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeInsumo('frutas', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Outras Bebidas */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-base font-semibold">Outras Bebidas</Label>
                  <Button type="button" size="sm" onClick={() => addInsumo('outrasBebidas')}>
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
                <div className="space-y-2">
                  {form.listaInsumos?.outrasBebidas?.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2">
                      <Input
                        className="col-span-6"
                        value={item.nome}
                        onChange={(e) => updateInsumo('outrasBebidas', index, 'nome', e.target.value)}
                        placeholder="Nome"
                      />
                      <Input
                        className="col-span-5"
                        value={item.quantidade}
                        onChange={(e) => updateInsumo('outrasBebidas', index, 'quantidade', e.target.value)}
                        placeholder="Quantidade"
                      />
                      <Button
                        type="button"
                        className="col-span-1"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeInsumo('outrasBebidas', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Outros Insumos */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-base font-semibold">Outros Insumos</Label>
                  <Button type="button" size="sm" onClick={() => addInsumo('outrosInsumos')}>
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
                <div className="space-y-2">
                  {form.listaInsumos?.outrosInsumos?.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2">
                      <Input
                        className="col-span-6"
                        value={item.nome}
                        onChange={(e) => updateInsumo('outrosInsumos', index, 'nome', e.target.value)}
                        placeholder="Nome"
                      />
                      <Input
                        className="col-span-5"
                        value={item.quantidade}
                        onChange={(e) => updateInsumo('outrosInsumos', index, 'quantidade', e.target.value)}
                        placeholder="Quantidade"
                      />
                      <Button
                        type="button"
                        className="col-span-1"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeInsumo('outrosInsumos', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status do Orçamento</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={form.status} 
                  onValueChange={(value: any) => setForm({ ...form, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="recusado">Recusado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dataEnvio">Data de Envio</Label>
                <Input
                  id="dataEnvio"
                  type="date"
                  value={form.dataEnvio || ''}
                  onChange={(e) => setForm({ ...form, dataEnvio: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="secondary" onClick={generatePDF}>
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button type="button" onClick={handleSave}>
              Salvar Orçamento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
