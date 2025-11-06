import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Evento } from '@/types';
import { Plus, Calendar, MapPin, Users, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Eventos = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const { toast } = useToast();

  useEffect(() => {
    loadEventos();
    loadClientes();
  }, []);

  const loadEventos = async () => {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('data_inicio', { ascending: false });

      if (error) throw error;

      const eventosFormatados: Evento[] = (data || []).map(e => ({
        id: e.id,
        nome: e.nome,
        dataInicio: e.data_inicio,
        dataFim: e.data_fim,
        local: e.local,
        status: e.status as 'confirmado' | 'pendente' | 'cancelado',
        numeroConvidados: e.numero_convidados,
        clienteId: e.cliente_id,
        observacoes: e.observacoes || undefined,
      }));

      setEventos(eventosFormatados);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar eventos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome')
        .order('nome');

      if (error) throw error;
      setClientes(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const [formData, setFormData] = useState<Partial<Evento>>({
    nome: '',
    dataInicio: '',
    dataFim: '',
    local: '',
    status: 'pendente',
    numeroConvidados: 0,
    clienteId: '',
    observacoes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingEvento) {
        const { error } = await supabase
          .from('eventos')
          .update({
            nome: formData.nome,
            data_inicio: formData.dataInicio,
            data_fim: formData.dataFim,
            local: formData.local,
            status: formData.status,
            numero_convidados: formData.numeroConvidados,
            cliente_id: formData.clienteId,
            observacoes: formData.observacoes,
          })
          .eq('id', editingEvento.id);

        if (error) throw error;
        toast({ title: 'Evento atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('eventos')
          .insert([{
            nome: formData.nome,
            data_inicio: formData.dataInicio,
            data_fim: formData.dataFim,
            local: formData.local,
            status: formData.status,
            numero_convidados: formData.numeroConvidados,
            cliente_id: formData.clienteId,
            observacoes: formData.observacoes,
          }]);

        if (error) throw error;
        toast({ title: 'Evento criado com sucesso!' });
      }
      
      await loadEventos();
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar evento',
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
      dataInicio: '',
      dataFim: '',
      local: '',
      status: 'pendente',
      numeroConvidados: 0,
      clienteId: '',
      observacoes: '',
    });
    setEditingEvento(null);
    setIsOpen(false);
  };

  const handleEdit = (evento: Evento) => {
    setEditingEvento(evento);
    setFormData(evento);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await loadEventos();
      toast({ title: 'Evento excluído com sucesso!' });
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir evento',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'pendente': return 'bg-secondary/20 text-secondary border-secondary/50';
      case 'cancelado': return 'bg-destructive/20 text-destructive border-destructive/50';
      default: return '';
    }
  };

  const eventosFiltrados = filtroStatus === 'todos' 
    ? eventos 
    : eventos.filter(ev => ev.status === filtroStatus);

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Eventos</h1>
            <p className="text-sm md:text-base text-muted-foreground">Gerencie todos os eventos da empresa</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingEvento(null); resetForm(); }} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Novo Evento</span>
                <span className="sm:hidden">Evento</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEvento ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-1 sm:col-span-2">
                    <Label htmlFor="nome">Nome do Evento</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dataInicio">Data/Hora Início</Label>
                    <Input
                      id="dataInicio"
                      type="datetime-local"
                      value={formData.dataInicio}
                      onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dataFim">Data/Hora Fim</Label>
                    <Input
                      id="dataFim"
                      type="datetime-local"
                      value={formData.dataFim}
                      onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="local">Local</Label>
                    <Input
                      id="local"
                      value={formData.local}
                      onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cliente">Cliente</Label>
                    <Select value={formData.clienteId} onValueChange={(value) => setFormData({ ...formData, clienteId: value })}>
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
                    <Label htmlFor="numeroConvidados">Nº Convidados</Label>
                    <Input
                      id="numeroConvidados"
                      type="number"
                      value={formData.numeroConvidados}
                      onChange={(e) => setFormData({ ...formData, numeroConvidados: Number(e.target.value) })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingEvento ? 'Atualizar' : 'Criar'} Evento
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            className="flex-1 sm:flex-none"
            variant={filtroStatus === 'todos' ? 'default' : 'outline'}
            onClick={() => setFiltroStatus('todos')}
          >
            Todos
          </Button>
          <Button
            className="flex-1 sm:flex-none"
            variant={filtroStatus === 'confirmado' ? 'default' : 'outline'}
            onClick={() => setFiltroStatus('confirmado')}
          >
            Confirmados
          </Button>
          <Button
            className="flex-1 sm:flex-none"
            variant={filtroStatus === 'pendente' ? 'default' : 'outline'}
            onClick={() => setFiltroStatus('pendente')}
          >
            Pendentes
          </Button>
          <Button
            className="flex-1 sm:flex-none"
            variant={filtroStatus === 'cancelado' ? 'default' : 'outline'}
            onClick={() => setFiltroStatus('cancelado')}
          >
            Cancelados
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {eventosFiltrados.map((evento) => {
            const cliente = clientes.find(c => c.id === evento.clienteId);
            return (
              <Card key={evento.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{evento.nome}</CardTitle>
                    <Badge className={getStatusColor(evento.status)}>
                      {evento.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{new Date(evento.dataInicio).toLocaleDateString('pt-BR')} - {new Date(evento.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{evento.local}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{evento.numeroConvidados} convidados</span>
                  </div>
                  {cliente && (
                    <div className="text-sm text-muted-foreground">
                      Cliente: {cliente.nome}
                    </div>
                  )}
                  {evento.observacoes && (
                    <p className="text-sm text-muted-foreground border-t border-border pt-2">
                      {evento.observacoes}
                    </p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(evento)}>
                      <Pencil className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(evento.id)}>
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
      </div>
    </DashboardLayout>
  );
};

export default Eventos;
