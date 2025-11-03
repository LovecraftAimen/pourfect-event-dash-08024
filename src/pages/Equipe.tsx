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
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockMembrosEquipe, mockEscalas, mockEventos } from '@/data/mockData';
import { MembroEquipe, Escala } from '@/types';
import { Plus, Edit, Trash2, Calendar, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Equipe = () => {
  const [membros, setMembros] = useLocalStorage<MembroEquipe[]>('membros-equipe', mockMembrosEquipe);
  const [escalas, setEscalas] = useLocalStorage<Escala[]>('escalas', mockEscalas);
  const [eventos] = useLocalStorage('eventos', mockEventos);
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

  const handleSaveMembro = () => {
    if (!formMembro.nome || !formMembro.funcao || !formMembro.telefone || !formMembro.email || !formMembro.salarioPorEvento) {
      toast({ title: 'Erro', description: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    const membroData: MembroEquipe = {
      id: editingMembro?.id || Date.now().toString(),
      nome: formMembro.nome,
      funcao: formMembro.funcao,
      telefone: formMembro.telefone,
      email: formMembro.email,
      salarioPorEvento: parseFloat(formMembro.salarioPorEvento),
      disponibilidade: formMembro.disponibilidade,
    };

    if (editingMembro) {
      setMembros(membros.map(m => m.id === editingMembro.id ? membroData : m));
      toast({ title: 'Membro atualizado com sucesso!' });
    } else {
      setMembros([...membros, membroData]);
      toast({ title: 'Membro adicionado com sucesso!' });
    }

    setIsMembroDialogOpen(false);
    resetFormMembro();
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

  const handleDeleteMembro = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este membro?')) {
      setMembros(membros.filter(m => m.id !== id));
      toast({ title: 'Membro excluído com sucesso!' });
    }
  };

  const handleSaveEscala = () => {
    if (!formEscala.membroEquipeId || !formEscala.eventoId || !formEscala.horarioEntrada || !formEscala.horarioSaida) {
      toast({ title: 'Erro', description: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }

    const escalaData: Escala = {
      id: editingEscala?.id || Date.now().toString(),
      membroEquipeId: formEscala.membroEquipeId,
      eventoId: formEscala.eventoId,
      horarioEntrada: formEscala.horarioEntrada,
      horarioSaida: formEscala.horarioSaida,
      valorPago: formEscala.valorPago ? parseFloat(formEscala.valorPago) : undefined,
      status: formEscala.status,
    };

    if (editingEscala) {
      setEscalas(escalas.map(e => e.id === editingEscala.id ? escalaData : e));
      toast({ title: 'Escala atualizada com sucesso!' });
    } else {
      setEscalas([...escalas, escalaData]);
      toast({ title: 'Escala criada com sucesso!' });
    }

    setIsEscalaDialogOpen(false);
    resetFormEscala();
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

  const handleDeleteEscala = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta escala?')) {
      setEscalas(escalas.filter(e => e.id !== id));
      toast({ title: 'Escala excluída com sucesso!' });
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
                    <Button onClick={handleSaveMembro} className="w-full">Salvar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
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
                {membros.map((membro) => (
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
                ))}
              </TableBody>
            </Table>
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
                    <Button onClick={handleSaveEscala} className="w-full">Salvar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
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
                {escalas.map((escala) => (
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
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          R$ {escala.valorPago.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Não informado</span>
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

export default Equipe;
