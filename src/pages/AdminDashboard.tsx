import { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Settings, Plus, Pencil, Trash2, UserPlus } from 'lucide-react';

interface Colaborador {
  id: string;
  nome: string;
  email: string;
  permissoes: string[];
}

const menuPermissoes = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'eventos', label: 'Eventos' },
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'estoque', label: 'Estoque' },
  { id: 'drinks', label: 'Drinks' },
  { id: 'equipe', label: 'Equipe' },
  { id: 'clientes', label: 'Clientes & Orçamentos' },
];

const AdminDashboard = () => {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([
    {
      id: '1',
      nome: 'João Silva',
      email: 'joao@example.com',
      permissoes: ['dashboard', 'eventos', 'clientes'],
    },
    {
      id: '2',
      nome: 'Maria Santos',
      email: 'maria@example.com',
      permissoes: ['estoque', 'drinks'],
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formNome, setFormNome] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSenha, setFormSenha] = useState('');
  const [formPermissoes, setFormPermissoes] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setFormNome('');
    setFormEmail('');
    setFormSenha('');
    setFormPermissoes([]);
    setEditingId(null);
  };

  const handleOpenDialog = (colaborador?: Colaborador) => {
    if (colaborador) {
      setFormNome(colaborador.nome);
      setFormEmail(colaborador.email);
      setFormPermissoes(colaborador.permissoes);
      setEditingId(colaborador.id);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formNome || !formEmail) return;

    if (editingId) {
      setColaboradores(
        colaboradores.map((c) =>
          c.id === editingId
            ? { ...c, nome: formNome, email: formEmail, permissoes: formPermissoes }
            : c
        )
      );
    } else {
      const novoColaborador: Colaborador = {
        id: Date.now().toString(),
        nome: formNome,
        email: formEmail,
        permissoes: formPermissoes,
      };
      setColaboradores([...colaboradores, novoColaborador]);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setColaboradores(colaboradores.filter((c) => c.id !== id));
  };

  const togglePermissao = (permissaoId: string) => {
    if (formPermissoes.includes(permissaoId)) {
      setFormPermissoes(formPermissoes.filter((p) => p !== permissaoId));
    } else {
      setFormPermissoes([...formPermissoes, permissaoId]);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Settings className="h-6 w-6 md:h-8 md:w-8" />
              Painel de Administração
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie colaboradores e suas permissões de acesso
            </p>
          </div>
        </div>

        {/* Card de Colaboradores */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Colaboradores</CardTitle>
                <CardDescription>
                  Cadastre colaboradores e defina quais menus eles podem acessar
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Colaborador
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingId ? 'Editar Colaborador' : 'Novo Colaborador'}
                    </DialogTitle>
                    <DialogDescription>
                      Preencha os dados do colaborador e selecione as permissões de acesso
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input
                        id="nome"
                        value={formNome}
                        onChange={(e) => setFormNome(e.target.value)}
                        placeholder="Digite o nome completo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="email@example.com"
                      />
                    </div>

                    {!editingId && (
                      <div className="space-y-2">
                        <Label htmlFor="senha">Senha Inicial</Label>
                        <Input
                          id="senha"
                          type="password"
                          value={formSenha}
                          onChange={(e) => setFormSenha(e.target.value)}
                          placeholder="Digite uma senha inicial"
                        />
                      </div>
                    )}

                    <div className="space-y-3">
                      <Label>Permissões de Acesso ao Menu</Label>
                      <p className="text-sm text-muted-foreground">
                        Selecione quais páginas o colaborador poderá acessar
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-secondary/20 rounded-lg">
                        {menuPermissoes.map((permissao) => (
                          <div key={permissao.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permissao.id}
                              checked={formPermissoes.includes(permissao.id)}
                              onCheckedChange={() => togglePermissao(permissao.id)}
                            />
                            <label
                              htmlFor={permissao.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {permissao.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={!formNome || !formEmail}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      {editingId ? 'Salvar Alterações' : 'Cadastrar'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Permissões</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colaboradores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhum colaborador cadastrado ainda
                    </TableCell>
                  </TableRow>
                ) : (
                  colaboradores.map((colaborador) => (
                    <TableRow key={colaborador.id}>
                      <TableCell className="font-medium">{colaborador.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{colaborador.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {colaborador.permissoes.length === 0 ? (
                            <span className="text-xs text-muted-foreground">Sem permissões</span>
                          ) : (
                            colaborador.permissoes.map((permId) => {
                              const permissao = menuPermissoes.find((p) => p.id === permId);
                              return (
                                <Badge key={permId} variant="secondary" className="text-xs">
                                  {permissao?.label}
                                </Badge>
                              );
                            })
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDialog(colaborador)}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(colaborador.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
