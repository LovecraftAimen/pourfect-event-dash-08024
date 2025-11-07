import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MembroEquipe, Escala } from '@/types';
import { Plus, Edit, Trash2, Calendar, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Equipe = () => {
  const [membros, setMembros] = useState<MembroEquipe[]>([]);
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isMembroDialogOpen, setIsMembroDialogOpen] = useState(false);
  const [isEscalaDialogOpen, setIsEscalaDialogOpen] = useState(false);
  const [editingMembro, setEditingMembro] = useState<MembroEquipe | null>(null);
  const [editingEscala, setEditingEscala] = useState<Escala | null>(null);
  const { toast } = useToast();

  const [formMembro, setFormMembro] = useState<{
    nome: string;
    funcao: string;
    telefone: string;
    email: string;
    salarioPorEvento: string;
    disponibilidade: 'disponivel' | 'ocupado' | 'inativo';
  }>({
    nome: '',
    funcao: '',
    telefone: '',
    email: '',
    salarioPorEvento: '',
    disponibilidade: 'disponivel',
  });

  const [formEscala, setFormEscala] = useState<{
    membroEquipeId: string;
    eventoId: string;
    horarioEntrada: string;
    horarioSaida: string;
    valorPago: string;
    status: 'agendado' | 'confirmado' | 'concluido' | 'cancelado';
  }>({
    membroEquipeId: '',
    eventoId: '',
    horarioEntrada: '',
    horarioSaida: '',
    valorPago: '',
    status: 'agendado',
  });

  useEffect(() => {
    loadMembros();
    loadEscalas();
    loadEventos();
  }, []);

  const loadMembros = async () => {
    try {
      const { data, error } = await supabase
        .from('membros_equipe')
        .select('*')
        .order('nome');

      if (error) throw error;

      const membrosFormatados = (data || []).map(m => ({
        id: m.id,
        nome: m.nome,
        funcao: m.funcao,
        telefone: m.telefone,
        email: m.email,
        salarioPorEvento: Number(m.salario_por_evento),
        disponibilidade: m.disponibilidade as 'disponivel' | 'ocupado' | 'inativo',
      }));

      setMembros(membrosFormatados);
    } catch (error: any) {
      toast({ title: 'Erro ao carregar membros', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadEscalas = async () => {
    try {
      const { data, error } = await supabase
        .from('escalas')
        .select('*')
        .order('horario_entrada', { ascending: false });

      if (error) throw error;

      const escalasFormatadas = (data || []).map(e => ({
        id: e.id,
        membroEquipeId: e.membro_equipe_id,
        eventoId: e.evento_id,
        horarioEntrada: e.horario_entrada,
        horarioSaida: e.horario_saida,
        valorPago: e.valor_pago ? Number(e.valor_pago) : undefined,
        status: e.status as 'agendado' | 'confirmado' | 'concluido' | 'cancelado',
      }));

      setEscalas(escalasFormatadas);
    } catch (error: any) {
      toast({ title: 'Erro ao carregar escalas', description: error.message, variant: 'destructive' });
    }
  };

  const loadEventos = async () => {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('id, nome')
        .order('nome');

      if (error) throw error;
      setEventos(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar eventos:', error);
    }
  };

  const resetFormMembro = () => {
    setFormMembro({
      nome: '',
      funcao: '',
      telefone: '',
      email: '',
      salarioPorEvento: '',
      disponibilidade: 'disponivel',
    });
    setEditingMembro(null);
  };

  const resetFormEscala = () => {
    setFormEscala({
      membroEquipeId: '',
      eventoId: '',
      horarioEntrada: '',
      horarioSaida: '',
      valorPago: '',
      status: 'agendado',
    });
    setEditingEscala(null);
  };

  const handleSaveMembro = async () => {
    if (!formMembro.nome || !formMembro.funcao || !formMembro.telefone || !formMembro.email || !formMembro.salarioPorEvento) {
      toast({ title: 'Erro', description: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    setSubmitting(true);

    try {
      const membroData = {
        nome: formMembro.nome,
        funcao: formMembro.funcao,
        telefone: formMembro.telefone,
        email: formMembro.email,
        salario_por_evento: parseFloat(formMembro.salarioPorEvento),
        disponibilidade: formMembro.disponibilidade,
      };

      if (editingMembro) {
        const { error } = await supabase
          .from('membros_equipe')
          .update(membroData)
          .eq('id', editingMembro.id);

        if (error) throw error;
        toast({ title: 'Membro atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('membros_equipe')
          .insert([membroData]);

        if (error) throw error;
        toast({ title: 'Membro adicionado com sucesso!' });
      }

      setIsMembroDialogOpen(false);
      resetFormMembro();
      loadMembros();
    } catch (error: any) {
      toast({ title: 'Erro ao salvar membro', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditMembro = (membro: MembroEquipe) => {
    setEditingMembro(membro);
    setFormMembro({
      nome: membro.nome,
      funcao: membro.funcao,
      telefone: membro.telefone,
      email: membro.email,
      salarioPorEvento: membro.salarioPorEvento.toString(),
      disponibilidade: membro.disponibilidade,
    });
    setIsMembroDialogOpen(true);
  };

  const handleDeleteMembro = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este membro?')) return;

    try {
      const { error } = await supabase
        .from('membros_equipe')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Membro excluído com sucesso!' });
      loadMembros();
    } catch (error: any) {
      toast({ title: 'Erro ao excluir membro', description: error.message, variant: 'destructive' });
    }
  };

  const handleSaveEscala = async () => {
    if (!formEscala.membroEquipeId || !formEscala.eventoId || !formEscala.horarioEntrada || !formEscala.horarioSaida) {
      toast({ title: 'Erro', description: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }

    setSubmitting(true);

    try {
      const escalaData = {
        membro_equipe_id: formEscala.membroEquipeId,
        evento_id: formEscala.eventoId,
        horario_entrada: formEscala.horarioEntrada,
        horario_saida: formEscala.horarioSaida,
        valor_pago: formEscala.valorPago ? parseFloat(formEscala.valorPago) : null,
        status: formEscala.status,
      };

      if (editingEscala) {
        const { error } = await supabase
          .from('escalas')
          .update(escalaData)
          .eq('id', editingEscala.id);

        if (error) throw error;
        toast({ title: 'Escala atualizada com sucesso!' });
      } else {
        const { error } = await supabase
          .from('escalas')
          .insert([escalaData]);

        if (error) throw error;
        toast({ title: 'Escala criada com sucesso!' });
      }

      setIsEscalaDialogOpen(false);
      resetFormEscala();
      loadEscalas();
    } catch (error: any) {
      toast({ title: 'Erro ao salvar escala', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditEscala = (escala: Escala) => {
    setEditingEscala(escala);
    setFormEscala({
      membroEquipeId: escala.membroEquipeId,
      eventoId: escala.eventoId,
      horarioEntrada: escala.horarioEntrada,
      horarioSaida: escala.horarioSaida,
      valorPago: escala.valorPago?.toString() || '',
      status: escala.status,
    });
    setIsEscalaDialogOpen(true);
  };

  const handleDeleteEscala = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta escala?')) return;

    try {
      const { error } = await supabase
        .from('escalas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Escala excluída com sucesso!' });
      loadEscalas();
    } catch (error: any) {
      toast({ title: 'Erro ao excluir escala', description: error.message, variant: 'destructive' });
    }
  };

  const getMembroNome = (id: string) => membros.find(m => m.id === id)?.nome || 'Desconhecido';
  const getEventoNome = (id: string) => eventos.find(e => e.id === id)?.nome || 'Desconhecido';

  const getDisponibilidadeColor = (disponibilidade: string) => {
    switch (disponibilidade) {
      case 'disponivel': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'ocupado': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'inativo': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'confirmado': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'concluido': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'cancelado': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Equipe</h1>
            <p className="text-sm text-muted-foreground">Gerenciar membros da equipe e escalas</p>
          </div>
        </div>

        {/* Membros da Equipe */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <CardTitle className="text-base md:text-lg">Membros da Equipe</CardTitle>
                <CardDescription className="text-sm">Lista de bartenders e auxiliares</CardDescription>
              </div>
              <Dialog open={isMembroDialogOpen} onOpenChange={setIsMembroDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetFormMembro} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="sm:inline">Adicionar</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md w-[95vw] sm:w-full">
                  <DialogHeader>
                    <DialogTitle>{editingMembro ? 'Editar Membro' : 'Novo Membro'}</DialogTitle>
                    <DialogDescription>Preencha os dados do membro da equipe</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nome</Label>
                      <Input value={formMembro.nome} onChange={(e) => setFormMembro({...formMembro, nome: e.target.value})} />
                    </div>
                    <div>
                      <Label>Função</Label>
                      <Input value={formMembro.funcao} onChange={(e) => setFormMembro({...formMembro, funcao: e.target.value})} placeholder="Ex: Bartender Senior" />
                    </div>
                    <div>
                      <Label>Telefone</Label>
                      <Input value={formMembro.telefone} onChange={(e) => setFormMembro({...formMembro, telefone: e.target.value})} placeholder="(11) 98888-8888" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" value={formMembro.email} onChange={(e) => setFormMembro({...formMembro, email: e.target.value})} />
                    </div>
                    <div>
                      <Label>Salário por Evento (R$)</Label>
                      <Input type="number" value={formMembro.salarioPorEvento} onChange={(e) => setFormMembro({...formMembro, salarioPorEvento: e.target.value})} />
                    </div>
                    <div>
                      <Label>Disponibilidade</Label>
                      <Select value={formMembro.disponibilidade} onValueChange={(value: any) => setFormMembro({...formMembro, disponibilidade: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disponivel">Disponível</SelectItem>
                          <SelectItem value="ocupado">Ocupado</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                     <Button onClick={handleSaveMembro} className="w-full" disabled={submitting}>
                       {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                       Salvar
                     </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Nome</TableHead>
                      <TableHead className="min-w-[100px]">Função</TableHead>
                      <TableHead className="min-w-[140px]">Contato</TableHead>
                      <TableHead className="min-w-[100px]">Salário/Evento</TableHead>
                      <TableHead className="min-w-[90px]">Status</TableHead>
                      <TableHead className="text-right min-w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {membros.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Nenhum membro cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      membros.map((membro) => (
                  <TableRow key={membro.id}>
                    <TableCell className="font-medium">{membro.nome}</TableCell>
                    <TableCell>{membro.funcao}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{membro.telefone}</div>
                        <div className="text-muted-foreground">{membro.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>R$ {membro.salarioPorEvento.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getDisponibilidadeColor(membro.disponibilidade)}>
                        {membro.disponibilidade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditMembro(membro)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteMembro(membro.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Escalas */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                  Escalas de Eventos
                </CardTitle>
                <CardDescription className="text-sm">Gerenciar escalas da equipe por evento</CardDescription>
              </div>
              <Dialog open={isEscalaDialogOpen} onOpenChange={setIsEscalaDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetFormEscala} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="sm:inline">Nova Escala</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md w-[95vw] sm:w-full">
                  <DialogHeader>
                    <DialogTitle>{editingEscala ? 'Editar Escala' : 'Nova Escala'}</DialogTitle>
                    <DialogDescription>Alocar membro para evento</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Membro da Equipe</Label>
                      <Select value={formEscala.membroEquipeId} onValueChange={(value) => setFormEscala({...formEscala, membroEquipeId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {membros.map(m => (
                            <SelectItem key={m.id} value={m.id}>{m.nome} - {m.funcao}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Evento</Label>
                      <Select value={formEscala.eventoId} onValueChange={(value) => setFormEscala({...formEscala, eventoId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {eventos.map(e => (
                            <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Horário de Entrada</Label>
                      <Input type="datetime-local" value={formEscala.horarioEntrada} onChange={(e) => setFormEscala({...formEscala, horarioEntrada: e.target.value})} />
                    </div>
                    <div>
                      <Label>Horário de Saída</Label>
                      <Input type="datetime-local" value={formEscala.horarioSaida} onChange={(e) => setFormEscala({...formEscala, horarioSaida: e.target.value})} />
                    </div>
                    <div>
                      <Label>Valor Pago (R$)</Label>
                      <Input type="number" value={formEscala.valorPago} onChange={(e) => setFormEscala({...formEscala, valorPago: e.target.value})} placeholder="Opcional" />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select value={formEscala.status} onValueChange={(value: any) => setFormEscala({...formEscala, status: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agendado">Agendado</SelectItem>
                          <SelectItem value="confirmado">Confirmado</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                     <Button onClick={handleSaveEscala} className="w-full" disabled={submitting}>
                       {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                       Salvar
                     </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Membro</TableHead>
                    <TableHead className="min-w-[120px]">Evento</TableHead>
                    <TableHead className="min-w-[140px]">Horário</TableHead>
                    <TableHead className="min-w-[80px]">Valor</TableHead>
                    <TableHead className="min-w-[90px]">Status</TableHead>
                    <TableHead className="text-right min-w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {escalas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Nenhuma escala cadastrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    escalas.map((escala) => (
                      <TableRow key={escala.id}>
                        <TableCell className="font-medium">{getMembroNome(escala.membroEquipeId)}</TableCell>
                        <TableCell>{getEventoNome(escala.eventoId)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Entrada: {new Date(escala.horarioEntrada).toLocaleString('pt-BR')}</div>
                            <div className="text-muted-foreground">Saída: {new Date(escala.horarioSaida).toLocaleString('pt-BR')}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {escala.valorPago ? (
                            <span>R$ {escala.valorPago.toFixed(2)}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(escala.status)}>
                            {escala.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditEscala(escala)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteEscala(escala.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Equipe;
