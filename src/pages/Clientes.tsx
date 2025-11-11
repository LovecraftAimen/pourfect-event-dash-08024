import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Cliente, Orcamento } from '@/types';
import { Plus, User, FileText, Pencil, Trash2, Mail, Phone, MapPin, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OrcamentoCalculator } from '@/components/OrcamentoCalculator';
import { OrcamentoDetalhes } from '@/components/OrcamentoDetalhes';
import { supabase } from '@/integrations/supabase/client';


const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isClienteOpen, setIsClienteOpen] = useState(false);
  const [isOrcamentoOpen, setIsOrcamentoOpen] = useState(false);
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | null>(null);
  const [viewingOrcamento, setViewingOrcamento] = useState<Orcamento | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadClientes();
    loadOrcamentos();
  }, []);

  const loadClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const clientesFormatados: Cliente[] = (data || []).map(c => ({
        id: c.id,
        nome: c.nome,
        email: c.email,
        telefone: c.telefone,
        endereco: c.endereco || '',
      }));

      setClientes(clientesFormatados);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar clientes',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadOrcamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const orcamentosFormatados: Orcamento[] = (data || []).map(o => ({
        id: o.id,
        clienteId: o.cliente_id,
        eventoId: o.evento_id || undefined,
        valorTotal: Number(o.valor_total),
        status: o.status as 'enviado' | 'aprovado' | 'recusado',
        dataEnvio: o.data_envio,
        itens: o.itens,
        nomeEvento: o.nome_evento || undefined,
        dataEvento: o.data_evento || undefined,
        horarioAbertura: o.horario_abertura || undefined,
        horarioFechamento: o.horario_fechamento || undefined,
        localEvento: o.local_evento || undefined,
        numeroConvidados: o.numero_convidados || undefined,
        cartasDrinks: Array.isArray(o.cartas_drinks) ? o.cartas_drinks as string[] : undefined,
        numeroBartendes: o.numero_bartendes || undefined,
        estrutura: o.estrutura || undefined,
        condicoesFinanceiras: o.condicoes_financeiras as any || undefined,
        horarioExtra: o.horario_extra ? Number(o.horario_extra) : undefined,
        listaInsumos: o.lista_insumos as any || undefined,
      }));

      setOrcamentos(orcamentosFormatados);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar orçamentos',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const [clienteForm, setClienteForm] = useState<Partial<Cliente>>({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
  });

  const [orcamentoForm, setOrcamentoForm] = useState<Partial<Orcamento>>({
    clienteId: '',
    valorTotal: 0,
    status: 'enviado',
    dataEnvio: new Date().toISOString().split('T')[0],
    itens: '',
  });

  const handleClienteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingCliente) {
        const { error } = await supabase
          .from('clientes')
          .update({
            nome: clienteForm.nome,
            email: clienteForm.email,
            telefone: clienteForm.telefone,
            endereco: clienteForm.endereco,
          })
          .eq('id', editingCliente.id);

        if (error) throw error;
        toast({ title: 'Cliente atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('clientes')
          .insert([{
            nome: clienteForm.nome,
            email: clienteForm.email,
            telefone: clienteForm.telefone,
            endereco: clienteForm.endereco,
          }]);

        if (error) throw error;
        toast({ title: 'Cliente cadastrado com sucesso!' });
      }
      
      await loadClientes();
      resetClienteForm();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar cliente',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOrcamentoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingOrcamento) {
        const { error } = await supabase
          .from('orcamentos')
          .update({
            cliente_id: orcamentoForm.clienteId,
            valor_total: orcamentoForm.valorTotal,
            status: orcamentoForm.status,
            data_envio: orcamentoForm.dataEnvio,
            itens: orcamentoForm.itens,
          })
          .eq('id', editingOrcamento.id);

        if (error) throw error;
        toast({ title: 'Orçamento atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('orcamentos')
          .insert([{
            cliente_id: orcamentoForm.clienteId,
            valor_total: orcamentoForm.valorTotal,
            status: orcamentoForm.status,
            data_envio: orcamentoForm.dataEnvio,
            itens: orcamentoForm.itens,
          }]);

        if (error) throw error;
        toast({ title: 'Orçamento criado com sucesso!' });
      }
      
      await loadOrcamentos();
      resetOrcamentoForm();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar orçamento',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetClienteForm = () => {
    setClienteForm({ nome: '', email: '', telefone: '', endereco: '' });
    setEditingCliente(null);
    setIsClienteOpen(false);
  };

  const resetOrcamentoForm = () => {
    setOrcamentoForm({
      clienteId: '',
      valorTotal: 0,
      status: 'enviado',
      dataEnvio: new Date().toISOString().split('T')[0],
      itens: '',
    });
    setEditingOrcamento(null);
    setIsOrcamentoOpen(false);
  };

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setClienteForm(cliente);
    setIsClienteOpen(true);
  };

  const handleEditOrcamento = (orcamento: Orcamento) => {
    setEditingOrcamento(orcamento);
    setOrcamentoForm(orcamento);
    setIsOrcamentoOpen(true);
  };

  const handleViewOrcamento = (orcamento: Orcamento) => {
    setViewingOrcamento(orcamento);
    setIsDetalhesOpen(true);
  };

  const handleSaveDetalhes = async (orcamento: Orcamento) => {
    try {
      const { error } = await supabase
        .from('orcamentos')
        .update({
          nome_evento: orcamento.nomeEvento,
          data_evento: orcamento.dataEvento,
          horario_abertura: orcamento.horarioAbertura,
          horario_fechamento: orcamento.horarioFechamento,
          local_evento: orcamento.localEvento,
          numero_convidados: orcamento.numeroConvidados,
          cartas_drinks: orcamento.cartasDrinks,
          numero_bartendes: orcamento.numeroBartendes,
          estrutura: orcamento.estrutura,
          condicoes_financeiras: orcamento.condicoesFinanceiras,
          horario_extra: orcamento.horarioExtra,
          lista_insumos: orcamento.listaInsumos,
        })
        .eq('id', orcamento.id);

      if (error) throw error;
      
      await loadOrcamentos();
      toast({ title: 'Orçamento atualizado com sucesso!' });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar orçamento',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCliente = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await loadClientes();
      toast({ title: 'Cliente excluído com sucesso!' });
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir cliente',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteOrcamento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('orcamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await loadOrcamentos();
      toast({ title: 'Orçamento excluído com sucesso!' });
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir orçamento',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'enviado': return 'bg-secondary/20 text-secondary border-secondary/50';
      case 'recusado': return 'bg-destructive/20 text-destructive border-destructive/50';
      default: return '';
    }
  };

  const totalOrcamentos = orcamentos.length;
  const orcamentosAprovados = orcamentos.filter(o => o.status === 'aprovado').length;
  const taxaConversao = totalOrcamentos > 0 ? ((orcamentosAprovados / totalOrcamentos) * 100).toFixed(1) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Clientes & Orçamentos</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gerencie sua base de clientes e propostas</p>
        </div>

        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Total de Clientes
              </CardTitle>
              <User className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{clientes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Orçamentos Aprovados
              </CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{orcamentosAprovados}/{totalOrcamentos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Taxa de Conversão
              </CardTitle>
              <FileText className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-secondary">{taxaConversao}%</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="clientes" className="space-y-4">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="clientes" className="text-xs sm:text-sm">Clientes</TabsTrigger>
            <TabsTrigger value="orcamentos" className="text-xs sm:text-sm">Orçamentos</TabsTrigger>
            <TabsTrigger value="calculadora" className="text-xs sm:text-sm">Calculadora de Orçamento</TabsTrigger>
          </TabsList>

          <TabsContent value="clientes" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isClienteOpen} onOpenChange={setIsClienteOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingCliente(null); resetClienteForm(); }} size="sm" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Novo Cliente</span>
                    <span className="sm:hidden">Cliente</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto max-w-[95vw] sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editingCliente ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleClienteSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="nome">Nome</Label>
                      <Input
                        id="nome"
                        value={clienteForm.nome}
                        onChange={(e) => setClienteForm({ ...clienteForm, nome: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={clienteForm.email}
                        onChange={(e) => setClienteForm({ ...clienteForm, email: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={clienteForm.telefone}
                        onChange={(e) => setClienteForm({ ...clienteForm, telefone: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="endereco">Endereço</Label>
                      <Textarea
                        id="endereco"
                        value={clienteForm.endereco}
                        onChange={(e) => setClienteForm({ ...clienteForm, endereco: e.target.value })}
                        rows={2}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={resetClienteForm} disabled={submitting}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {editingCliente ? 'Atualizar' : 'Cadastrar'} Cliente
                      </Button>
                    </div>
                  </form>
                </DialogContent>
            </Dialog>
            </div>

            {loading ? (
              <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {clientes.map((cliente) => {
                const clienteOrcamentos = orcamentos.filter(o => o.clienteId === cliente.id);
                return (
                  <Card key={cliente.id}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        {cliente.nome}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">{cliente.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">{cliente.telefone}</span>
                      </div>
                      {cliente.endereco && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-primary mt-0.5" />
                          <span className="text-muted-foreground">{cliente.endereco}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                          {clienteOrcamentos.length} orçamento(s)
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditCliente(cliente)} className="flex-1">
                          <Pencil className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteCliente(cliente.id)} className="flex-1">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orcamentos" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isOrcamentoOpen} onOpenChange={setIsOrcamentoOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingOrcamento(null); resetOrcamentoForm(); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Orçamento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto max-w-[95vw] sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editingOrcamento ? 'Editar Orçamento' : 'Novo Orçamento'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleOrcamentoSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="clienteId">Cliente</Label>
                      <Select value={orcamentoForm.clienteId} onValueChange={(value) => setOrcamentoForm({ ...orcamentoForm, clienteId: value })}>
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
                      <Label htmlFor="valorTotal">Valor Total (R$)</Label>
                      <Input
                        id="valorTotal"
                        type="number"
                        step="0.01"
                        value={orcamentoForm.valorTotal}
                        onChange={(e) => setOrcamentoForm({ ...orcamentoForm, valorTotal: Number(e.target.value) })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="itens">Descrição dos Itens</Label>
                      <Textarea
                        id="itens"
                        value={orcamentoForm.itens}
                        onChange={(e) => setOrcamentoForm({ ...orcamentoForm, itens: e.target.value })}
                        rows={3}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dataEnvio">Data de Envio</Label>
                        <Input
                          id="dataEnvio"
                          type="date"
                          value={orcamentoForm.dataEnvio}
                          onChange={(e) => setOrcamentoForm({ ...orcamentoForm, dataEnvio: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={orcamentoForm.status} onValueChange={(value: any) => setOrcamentoForm({ ...orcamentoForm, status: value })}>
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
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={resetOrcamentoForm} disabled={submitting}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {editingOrcamento ? 'Atualizar' : 'Criar'} Orçamento
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-8 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {orcamentos.map((orcamento) => {
                const cliente = clientes.find(c => c.id === orcamento.clienteId);
                return (
                  <Card key={orcamento.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {cliente?.nome || 'Cliente não encontrado'}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {new Date(orcamento.dataEnvio).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Badge className={getStatusColor(orcamento.status)}>
                          {orcamento.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          {orcamento.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Itens:</p>
                        <p className="text-sm text-muted-foreground">{orcamento.itens}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewOrcamento(orcamento)} className="flex-1 text-xs sm:text-sm">
                          <Eye className="h-3 w-3 sm:mr-1" />
                          <span className="hidden sm:inline">Ver Detalhes</span>
                          <span className="sm:hidden">Ver</span>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditOrcamento(orcamento)} className="flex-1 text-xs sm:text-sm">
                          <Pencil className="h-3 w-3 sm:mr-1" />
                          <span className="hidden sm:inline">Editar</span>
                          <span className="sm:hidden">Edit</span>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteOrcamento(orcamento.id)} className="flex-1 text-xs sm:text-sm">
                          <Trash2 className="h-3 w-3 sm:mr-1" />
                          <span className="hidden sm:inline">Excluir</span>
                          <span className="sm:hidden">Del</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="calculadora">
            <OrcamentoCalculator />
          </TabsContent>
        </Tabs>

        <OrcamentoDetalhes
          orcamento={viewingOrcamento}
          clientes={clientes}
          open={isDetalhesOpen}
          onOpenChange={setIsDetalhesOpen}
          onSave={handleSaveDetalhes}
        />
      </div>
    </DashboardLayout>
  );
};

export default Clientes;
