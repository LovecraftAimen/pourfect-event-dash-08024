import { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockProdutos } from '@/data/mockData';
import { Produto } from '@/types';
import { Plus, AlertTriangle, Package, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const Estoque = () => {
  const [produtos, setProdutos] = useLocalStorage<Produto[]>('produtos', mockProdutos);
  const [categorias, setCategorias] = useLocalStorage<string[]>('categorias', ['Bebidas', 'Insumos', 'Descartáveis', 'Utensílios', 'Alimentos', 'Decoração']);
  const [isOpen, setIsOpen] = useState(false);
  const [isCategoriaOpen, setIsCategoriaOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [filtroValidade, setFiltroValidade] = useState<string>('todas');
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<Produto>>({
    nome: '',
    categoria: '',
    quantidade: 0,
    capacidadeProduto: 0,
    unidade: 'unidade',
    alertaReposicao: 0,
    precoCompra: 0,
    dataValidade: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProduto) {
      setProdutos(produtos.map(p => p.id === editingProduto.id ? { ...formData, id: editingProduto.id } as Produto : p));
      toast({ title: 'Produto atualizado com sucesso!' });
    } else {
      const novoProduto: Produto = {
        ...formData,
        id: Date.now().toString(),
      } as Produto;
      setProdutos([...produtos, novoProduto]);
      toast({ title: 'Produto adicionado com sucesso!' });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      categoria: '',
      quantidade: 0,
      capacidadeProduto: 0,
      unidade: 'unidade',
      alertaReposicao: 0,
      precoCompra: 0,
      dataValidade: '',
    });
    setEditingProduto(null);
    setIsOpen(false);
  };

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setFormData(produto);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    setProdutos(produtos.filter(p => p.id !== id));
    toast({ title: 'Produto excluído com sucesso!' });
  };

  const handleAddCategoria = () => {
    if (novaCategoria.trim() && !categorias.includes(novaCategoria.trim())) {
      setCategorias([...categorias, novaCategoria.trim()]);
      toast({ title: 'Categoria adicionada com sucesso!' });
      setNovaCategoria('');
    } else {
      toast({ title: 'Categoria já existe ou inválida', variant: 'destructive' });
    }
  };

  const handleDeleteCategoria = (categoria: string) => {
    const produtosUsandoCategoria = produtos.filter(p => p.categoria === categoria);
    if (produtosUsandoCategoria.length > 0) {
      toast({ 
        title: 'Não é possível deletar esta categoria', 
        description: `${produtosUsandoCategoria.length} produto(s) estão usando esta categoria.`,
        variant: 'destructive' 
      });
      return;
    }
    setCategorias(categorias.filter(c => c !== categoria));
    toast({ title: 'Categoria deletada com sucesso!' });
  };

  const isProximoVencimento = (dataValidade?: string) => {
    if (!dataValidade) return false;
    const hoje = new Date();
    const vencimento = new Date(dataValidade);
    const umMesEmMs = 30 * 24 * 60 * 60 * 1000;
    return vencimento.getTime() - hoje.getTime() <= umMesEmMs && vencimento.getTime() > hoje.getTime();
  };

  const isVencido = (dataValidade?: string) => {
    if (!dataValidade) return false;
    const hoje = new Date();
    const vencimento = new Date(dataValidade);
    return vencimento.getTime() < hoje.getTime();
  };

  // Filtros
  let produtosFiltrados = produtos;
  
  if (filtroCategoria !== 'todas') {
    produtosFiltrados = produtosFiltrados.filter(p => p.categoria === filtroCategoria);
  }
  
  if (filtroValidade === 'proximos') {
    produtosFiltrados = produtosFiltrados.filter(p => isProximoVencimento(p.dataValidade));
  } else if (filtroValidade === 'vencidos') {
    produtosFiltrados = produtosFiltrados.filter(p => isVencido(p.dataValidade));
  }

  const produtosComAlerta = produtos.filter(p => p.quantidade <= p.alertaReposicao);
  const produtosProximosVencimento = produtos.filter(p => isProximoVencimento(p.dataValidade));
  const produtosVencidos = produtos.filter(p => isVencido(p.dataValidade));
  const valorTotalEstoque = produtos.reduce((acc, p) => acc + (p.quantidade * p.precoCompra), 0);

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Estoque</h1>
            <p className="text-sm md:text-base text-muted-foreground">Controle de produtos e insumos</p>
          </div>
          
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <Dialog open={isCategoriaOpen} onOpenChange={setIsCategoriaOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                  <Package className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Gerenciar Categorias</span>
                  <span className="sm:hidden">Categorias</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl w-[95vw] sm:w-full">
                <DialogHeader>
                  <DialogTitle>Gerenciar Categorias</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="novaCategoria">Nova Categoria</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        id="novaCategoria"
                        value={novaCategoria}
                        onChange={(e) => setNovaCategoria(e.target.value)}
                        placeholder="Digite o nome da categoria"
                      />
                      <Button onClick={handleAddCategoria} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Categorias Existentes</Label>
                    <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                      {categorias.map(cat => {
                        const produtosCount = produtos.filter(p => p.categoria === cat).length;
                        return (
                          <div key={cat} className="flex justify-between items-center p-2 rounded bg-muted">
                            <div>
                              <span className="font-medium">{cat}</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                ({produtosCount} produto{produtosCount !== 1 ? 's' : ''})
                              </span>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleDeleteCategoria(cat)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setIsCategoriaOpen(false)}>
                      Fechar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingProduto(null); resetForm(); }} size="sm" className="flex-1 sm:flex-none">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Novo Produto</span>
                  <span className="sm:hidden">Produto</span>
                </Button>
              </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-[95vw] sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingProduto ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome do Produto</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantidade">Quantidade</Label>
                      <Input
                        id="quantidade"
                        type="number"
                        value={formData.quantidade}
                        onChange={(e) => setFormData({ ...formData, quantidade: Number(e.target.value) })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="capacidadeProduto">Capacidade do Produto</Label>
                      <Input
                        id="capacidadeProduto"
                        type="number"
                        value={formData.capacidadeProduto}
                        onChange={(e) => setFormData({ ...formData, capacidadeProduto: Number(e.target.value) })}
                        placeholder="Ex: 750"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="unidade">Unidade</Label>
                    <Select
                      value={formData.unidade}
                      onValueChange={(value) => setFormData({ ...formData, unidade: value as 'unidade' | 'ml' | 'g' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unidade">Unidade</SelectItem>
                        <SelectItem value="ml">Mililitros (ml)</SelectItem>
                        <SelectItem value="g">Gramas (g)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    
                    <div>
                      <Label htmlFor="alertaReposicao">Alerta Reposição</Label>
                      <Input
                        id="alertaReposicao"
                        type="number"
                        value={formData.alertaReposicao}
                        onChange={(e) => setFormData({ ...formData, alertaReposicao: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="precoCompra">Preço de Compra (R$)</Label>
                    <Input
                      id="precoCompra"
                      type="number"
                      step="0.01"
                      value={formData.precoCompra}
                      onChange={(e) => setFormData({ ...formData, precoCompra: Number(e.target.value) })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dataValidade">Data de Validade (opcional)</Label>
                    <Input
                      id="dataValidade"
                      type="date"
                      value={formData.dataValidade}
                      onChange={(e) => setFormData({ ...formData, dataValidade: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingProduto ? 'Atualizar' : 'Adicionar'} Produto
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Total de Produtos
              </CardTitle>
              <Package className="h-4 w-4 text-primary flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{produtos.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Alertas de Estoque
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-secondary flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{produtosComAlerta.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Valor Total Estoque
              </CardTitle>
              <Package className="h-4 w-4 text-primary flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">
                {valorTotalEstoque.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
          <div>
            <Label>Filtrar por Categoria</Label>
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Categorias</SelectItem>
                {categorias.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Filtrar por Validade</Label>
            <Select value={filtroValidade} onValueChange={setFiltroValidade}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="proximos">Próximos do Vencimento (1 mês)</SelectItem>
                <SelectItem value="vencidos">Vencidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {produtosVencidos.length > 0 && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Produtos Vencidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {produtosVencidos.map(produto => (
                  <div key={produto.id} className="flex justify-between items-center p-2 rounded bg-muted">
                    <span>{produto.nome}</span>
                    <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/50">
                      Vencido em {new Date(produto.dataValidade!).toLocaleDateString('pt-BR')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {produtosProximosVencimento.length > 0 && (
          <Card className="border-yellow-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                Produtos Próximos do Vencimento (1 mês)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {produtosProximosVencimento.map(produto => (
                  <div key={produto.id} className="flex justify-between items-center p-2 rounded bg-muted">
                    <span>{produto.nome}</span>
                    <Badge variant="outline" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/50">
                      Vence em {new Date(produto.dataValidade!).toLocaleDateString('pt-BR')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {produtosComAlerta.length > 0 && (
          <Card className="border-secondary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-secondary">
                <AlertTriangle className="h-5 w-5" />
                Produtos com Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {produtosComAlerta.map(produto => (
                  <div key={produto.id} className="flex justify-between items-center p-2 rounded bg-muted">
                    <span>{produto.nome}</span>
                    <Badge variant="outline" className="bg-secondary/20 text-secondary border-secondary/50">
                      {produto.quantidade} {produto.capacidadeProduto ? `unidades (${produto.capacidadeProduto}${produto.unidade} cada)` : produto.unidade}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Lista de Produtos</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Produto</TableHead>
                  <TableHead className="min-w-[100px]">Categoria</TableHead>
                  <TableHead className="text-right min-w-[100px]">Quantidade</TableHead>
                  <TableHead className="text-right min-w-[100px]">Preço Compra</TableHead>
                  <TableHead className="text-right min-w-[100px]">Valor Total</TableHead>
                  <TableHead className="min-w-[150px]">Validade</TableHead>
                  <TableHead className="text-right min-w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtosFiltrados.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium">{produto.nome}</TableCell>
                    <TableCell>{produto.categoria}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {produto.quantidade} {produto.capacidadeProduto ? `x ${produto.capacidadeProduto}${produto.unidade}` : produto.unidade}
                        {produto.quantidade <= produto.alertaReposicao && (
                          <AlertTriangle className="h-4 w-4 text-secondary" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {produto.precoCompra.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell className="text-right">
                      {(produto.quantidade * produto.precoCompra).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell>
                      {produto.dataValidade ? (
                        <div className="flex items-center gap-2">
                          {new Date(produto.dataValidade).toLocaleDateString('pt-BR')}
                          {isVencido(produto.dataValidade) && (
                            <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/50">
                              Vencido
                            </Badge>
                          )}
                          {isProximoVencimento(produto.dataValidade) && (
                            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/50">
                              Próximo
                            </Badge>
                          )}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(produto)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(produto.id)}>
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

export default Estoque;
