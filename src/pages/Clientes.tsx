import { useState } from 'react';
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
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockClientes, mockOrcamentos } from '@/data/mockData';
import { Cliente, Orcamento } from '@/types';
import { Plus, User, FileText, Pencil, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OrcamentoCalculator } from '@/components/OrcamentoCalculator';

const Clientes = () => {
  const [clientes, setClientes] = useLocalStorage<Cliente[]>('clientes', mockClientes);
  const [orcamentos, setOrcamentos] = useLocalStorage<Orcamento[]>('orcamentos', mockOrcamentos);
  const [isClienteOpen, setIsClienteOpen] = useState(false);
  const [isOrcamentoOpen, setIsOrcamentoOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | null>(null);
  const { toast } = useToast();

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

  const handleClienteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCliente) {
      setClientes(clientes.map(c => c.id === editingCliente.id ? { ...clienteForm, id: editingCliente.id } as Cliente : c));
      toast({ title: 'Cliente atualizado com sucesso!' });
    } else {
      const novoCliente: Cliente = {
        ...clienteForm,
        id: Date.now().toString(),
      } as Cliente;
      setClientes([...clientes, novoCliente]);
      toast({ title: 'Cliente cadastrado com sucesso!' });
    }
    
    resetClienteForm();
  };

  const handleOrcamentoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingOrcamento) {
      setOrcamentos(orcamentos.map(o => o.id === editingOrcamento.id ? { ...orcamentoForm, id: editingOrcamento.id } as Orcamento : o));
      toast({ title: 'Orçamento atualizado com sucesso!' });
    } else {
      const novoOrcamento: Orcamento = {
        ...orcamentoForm,
        id: Date.now().toString(),
      } as Orcamento;
      setOrcamentos([...orcamentos, novoOrcamento]);
      toast({ title: 'Orçamento criado com sucesso!' });
    }
    
    resetOrcamentoForm();
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

  const handleDeleteCliente = (id: string) => {
    setClientes(clientes.filter(c => c.id !== id));
    toast({ title: 'Cliente excluído com sucesso!' });
  };

  const handleDeleteOrcamento = (id: string) => {
    setOrcamentos(orcamentos.filter(o => o.id !== id));
    toast({ title: 'Orçamento excluído com sucesso!' });
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
                      <Button type="button" variant="outline" onClick={resetClienteForm}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingCliente ? 'Atualizar' : 'Cadastrar'} Cliente
                      </Button>
                    </div>
                  </form>
                </DialogContent>
            </Dialog>
            </div>

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
                      <Button type="button" variant="outline" onClick={resetOrcamentoForm}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingOrcamento ? 'Atualizar' : 'Criar'} Orçamento
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

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
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditOrcamento(orcamento)} className="flex-1">
                          <Pencil className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteOrcamento(orcamento.id)} className="flex-1">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="calculadora">
            <OrcamentoCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Clientes;
