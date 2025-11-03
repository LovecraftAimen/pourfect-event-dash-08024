import { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockTransacoes, mockEventos } from '@/data/mockData';
import { Transacao } from '@/types';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Financeiro = () => {
  const [transacoes, setTransacoes] = useLocalStorage<Transacao[]>('transacoes', mockTransacoes);
  const [eventos] = useLocalStorage('eventos', mockEventos);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransacao, setEditingTransacao] = useState<Transacao | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pendente' | 'pago' | 'recebido'>('todos');
  const { toast } = useToast();

  const [form, setForm] = useState<{
    tipo: 'receita' | 'despesa';
    categoria: string;
    descricao: string;
    valor: string;
    dataLancamento: string;
    eventoId: string;
    status: 'pendente' | 'pago' | 'recebido';
    formaPagamento: string;
  }>({
    tipo: 'receita',
    categoria: 'Evento',
    descricao: '',
    valor: '',
    dataLancamento: '',
    eventoId: 'none',
    status: 'pendente',
    formaPagamento: '',
  });

  const categorias = {
    receita: ['Evento', 'Orçamento', 'Outros'],
    despesa: ['Estoque', 'Equipe', 'Operacional', 'Marketing', 'Outros'],
  };

  const resetForm = () => {
    setForm({
      tipo: 'receita',
      categoria: 'Evento',
      descricao: '',
      valor: '',
      dataLancamento: '',
      eventoId: 'none',
      status: 'pendente',
      formaPagamento: '',
    });
    setEditingTransacao(null);
  };

  const handleSave = () => {
    if (!form.categoria || !form.descricao || !form.valor || !form.dataLancamento) {
      toast({ title: 'Erro', description: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }

    const transacaoData: Transacao = {
      id: editingTransacao?.id || Date.now().toString(),
      tipo: form.tipo,
      categoria: form.categoria,
      descricao: form.descricao,
      valor: parseFloat(form.valor),
      dataLancamento: form.dataLancamento,
      eventoId: form.eventoId === 'none' ? undefined : form.eventoId,
      status: form.status,
      formaPagamento: form.formaPagamento || undefined,
    };

    if (editingTransacao) {
      setTransacoes(transacoes.map(t => t.id === editingTransacao.id ? transacaoData : t));
      toast({ title: 'Transação atualizada com sucesso!' });
    } else {
      setTransacoes([...transacoes, transacaoData]);
      toast({ title: 'Transação adicionada com sucesso!' });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (transacao: Transacao) => {
    setEditingTransacao(transacao);
    setForm({
      tipo: transacao.tipo,
      categoria: transacao.categoria,
      descricao: transacao.descricao,
      valor: transacao.valor.toString(),
      dataLancamento: transacao.dataLancamento,
      eventoId: transacao.eventoId || 'none',
      status: transacao.status,
      formaPagamento: transacao.formaPagamento || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      setTransacoes(transacoes.filter(t => t.id !== id));
      toast({ title: 'Transação excluída com sucesso!' });
    }
  };

  const getEventoNome = (id?: string) => {
    if (!id) return '-';
    return eventos.find(e => e.id === id)?.nome || 'Desconhecido';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'pago': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'recebido': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const transacoesFiltradas = transacoes
    .filter(t => filtroTipo === 'todos' || t.tipo === filtroTipo)
    .filter(t => filtroStatus === 'todos' || t.status === filtroStatus)
    .sort((a, b) => new Date(b.dataLancamento).getTime() - new Date(a.dataLancamento).getTime());

  const totalReceitas = transacoes
    .filter(t => t.tipo === 'receita' && t.status === 'recebido')
    .reduce((acc, t) => acc + t.valor, 0);

  const totalDespesas = transacoes
    .filter(t => t.tipo === 'despesa' && t.status === 'pago')
    .reduce((acc, t) => acc + t.valor, 0);

  const saldo = totalReceitas - totalDespesas;

  const receitasPendentes = transacoes
    .filter(t => t.tipo === 'receita' && t.status !== 'recebido')
    .reduce((acc, t) => acc + t.valor, 0);

  const despesasPendentes = transacoes
    .filter(t => t.tipo === 'despesa' && t.status !== 'pago')
    .reduce((acc, t) => acc + t.valor, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Financeiro</h1>
            <p className="text-sm text-muted-foreground">Gerenciar receitas, despesas e fluxo de caixa</p>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Receitas</CardTitle>
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-green-500">R$ {totalReceitas.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1 hidden sm:block">Valores recebidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Despesas</CardTitle>
              <TrendingDown className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-red-500">R$ {totalDespesas.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1 hidden sm:block">Valores pagos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Saldo</CardTitle>
              <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
            </CardHeader>
            <CardContent>
              <div className={`text-lg md:text-2xl font-bold ${saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                R$ {saldo.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1 hidden sm:block">Receitas - Despesas</p>
            </CardContent>
          </Card>

          <Card className="col-span-2 md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Pendências</CardTitle>
              <AlertCircle className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xs md:text-sm">
                <div className="text-green-600">A Receber: R$ {receitasPendentes.toFixed(2)}</div>
                <div className="text-red-600">A Pagar: R$ {despesasPendentes.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Transações */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <CardTitle className="text-base md:text-lg">Lançamentos Financeiros</CardTitle>
                <CardDescription className="text-sm">Histórico completo de transações</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="sm:inline">Nova Transação</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md w-[95vw] sm:w-full">
                  <DialogHeader>
                    <DialogTitle>{editingTransacao ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
                    <DialogDescription>Registrar receita ou despesa</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Tipo</Label>
                      <Select value={form.tipo} onValueChange={(value: any) => setForm({...form, tipo: value, categoria: value === 'receita' ? 'Evento' : 'Estoque'})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="receita">Receita</SelectItem>
                          <SelectItem value="despesa">Despesa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Categoria</Label>
                      <Select value={form.categoria} onValueChange={(value) => setForm({...form, categoria: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias[form.tipo].map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Input value={form.descricao} onChange={(e) => setForm({...form, descricao: e.target.value})} placeholder="Descrição da transação" />
                    </div>
                    <div>
                      <Label>Valor (R$)</Label>
                      <Input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({...form, valor: e.target.value})} />
                    </div>
                    <div>
                      <Label>Data</Label>
                      <Input type="date" value={form.dataLancamento} onChange={(e) => setForm({...form, dataLancamento: e.target.value})} />
                    </div>
                    <div>
                      <Label>Evento (Opcional)</Label>
                      <Select value={form.eventoId || "none"} onValueChange={(value) => setForm({...form, eventoId: value === "none" ? "" : value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Nenhum" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {eventos.map(e => (
                            <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select value={form.status} onValueChange={(value: any) => setForm({...form, status: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="pago">Pago</SelectItem>
                          <SelectItem value="recebido">Recebido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Forma de Pagamento</Label>
                      <Input value={form.formaPagamento} onChange={(e) => setForm({...form, formaPagamento: e.target.value})} placeholder="PIX, Cartão, etc" />
                    </div>
                    <Button onClick={handleSave} className="w-full">Salvar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Tabs value={filtroTipo} onValueChange={(v: any) => setFiltroTipo(v)} className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="todos" className="text-xs sm:text-sm">Todos</TabsTrigger>
                  <TabsTrigger value="receita" className="text-xs sm:text-sm">Receitas</TabsTrigger>
                  <TabsTrigger value="despesa" className="text-xs sm:text-sm">Despesas</TabsTrigger>
                </TabsList>
              </Tabs>
              <Select value={filtroStatus} onValueChange={(v: any) => setFiltroStatus(v)}>
                <SelectTrigger className="w-full sm:w-48 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="recebido">Recebido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[90px]">Data</TableHead>
                  <TableHead className="min-w-[90px]">Tipo</TableHead>
                  <TableHead className="min-w-[100px]">Categoria</TableHead>
                  <TableHead className="min-w-[150px]">Descrição</TableHead>
                  <TableHead className="min-w-[100px]">Evento</TableHead>
                  <TableHead className="min-w-[100px]">Valor</TableHead>
                  <TableHead className="min-w-[90px]">Status</TableHead>
                  <TableHead className="text-right min-w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transacoesFiltradas.map((transacao) => (
                  <TableRow key={transacao.id}>
                    <TableCell>{new Date(transacao.dataLancamento).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={transacao.tipo === 'receita' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}>
                        {transacao.tipo === 'receita' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {transacao.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>{transacao.categoria}</TableCell>
                    <TableCell className="font-medium">{transacao.descricao}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{getEventoNome(transacao.eventoId)}</TableCell>
                    <TableCell className={`font-bold ${transacao.tipo === 'receita' ? 'text-green-500' : 'text-red-500'}`}>
                      {transacao.tipo === 'receita' ? '+' : '-'} R$ {transacao.valor.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(transacao.status)}>
                        {transacao.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(transacao)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(transacao.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Financeiro;
