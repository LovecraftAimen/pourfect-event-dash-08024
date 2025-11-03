import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, DollarSign, TrendingUp, AlertTriangle, Package, Users, TrendingDown } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockTransacoes, mockEventos, mockProdutos, mockMembrosEquipe } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const Index = () => {
  const [transacoes] = useLocalStorage('transacoes', mockTransacoes);
  const [eventos] = useLocalStorage('eventos', mockEventos);
  const [produtos] = useLocalStorage('produtos', mockProdutos);
  const [membros] = useLocalStorage('membros-equipe', mockMembrosEquipe);

  // Calcular métricas do mês atual
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const transacoesDoMes = transacoes.filter(t => {
    const dataTransacao = new Date(t.dataLancamento);
    return dataTransacao >= firstDayOfMonth;
  });

  const receitasDoMes = transacoesDoMes
    .filter(t => t.tipo === 'receita' && t.status === 'recebido')
    .reduce((acc, t) => acc + t.valor, 0);

  const despesasDoMes = transacoesDoMes
    .filter(t => t.tipo === 'despesa' && t.status === 'pago')
    .reduce((acc, t) => acc + t.valor, 0);

  const lucroDoMes = receitasDoMes - despesasDoMes;

  const eventosConfirmados = eventos.filter(e => e.status === 'confirmado').length;
  const eventosPendentes = eventos.filter(e => e.status === 'pendente').length;

  // Eventos desta semana
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const eventosDestaSemana = eventos.filter(e => {
    const dataEvento = new Date(e.dataInicio);
    return dataEvento >= today && dataEvento <= nextWeek;
  });

  // Produtos com estoque baixo
  const produtosEstoqueBaixo = produtos.filter(p => p.quantidade <= p.alertaReposicao);

  // Contas a receber e pagar
  const contasAReceber = transacoes
    .filter(t => t.tipo === 'receita' && t.status !== 'recebido')
    .reduce((acc, t) => acc + t.valor, 0);

  const contasAPagar = transacoes
    .filter(t => t.tipo === 'despesa' && t.status !== 'pago')
    .reduce((acc, t) => acc + t.valor, 0);

  const stats = [
    { 
      title: 'Receitas do Mês', 
      value: `R$ ${receitasDoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      icon: DollarSign, 
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    { 
      title: 'Despesas do Mês', 
      value: `R$ ${despesasDoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      icon: TrendingDown, 
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    { 
      title: 'Lucro do Mês', 
      value: `R$ ${lucroDoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      icon: TrendingUp, 
      color: lucroDoMes >= 0 ? 'text-green-500' : 'text-red-500',
      bgColor: lucroDoMes >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
    },
    { 
      title: 'Eventos Confirmados', 
      value: eventosConfirmados.toString(), 
      icon: Calendar, 
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">Visão geral do seu negócio - DonkeyShot</p>
        </div>

        {/* Cards de métricas principais */}
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-xl md:text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cards secundários */}
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium">Contas a Receber</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-xl font-bold text-green-500">
                R$ {contasAReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Valores pendentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium">Contas a Pagar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-xl font-bold text-red-500">
                R$ {contasAPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Valores pendentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium">Equipe Ativa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-xl font-bold text-primary">
                {membros.filter(m => m.disponibilidade === 'disponivel').length} / {membros.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Membros disponíveis</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
          {/* Próximos Eventos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Próximos Eventos
              </CardTitle>
              <CardDescription>Eventos dos próximos 7 dias</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {eventosDestaSemana.length > 0 ? (
                eventosDestaSemana.map((evento) => (
                  <div
                    key={evento.id}
                    className="p-3 rounded-lg bg-muted border border-border flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{evento.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(evento.dataInicio).toLocaleDateString('pt-BR')} - {evento.local}
                      </p>
                    </div>
                    <Badge variant="outline" className={
                      evento.status === 'confirmado' 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }>
                      {evento.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum evento nos próximos 7 dias</p>
              )}
              {eventosPendentes > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    + {eventosPendentes} eventos pendentes de confirmação
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alertas e Notificações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-secondary" />
                Alertas e Notificações
              </CardTitle>
              <CardDescription>Itens que precisam de atenção</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Alertas de estoque */}
              {produtosEstoqueBaixo.length > 0 && (
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-start gap-2">
                    <Package className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-yellow-500">Estoque Baixo</p>
                      <p className="text-sm text-muted-foreground">
                        {produtosEstoqueBaixo.length} produto(s) precisam de reposição
                      </p>
                      <div className="mt-2 space-y-1">
                        {produtosEstoqueBaixo.slice(0, 3).map(p => (
                          <div key={p.id} className="text-xs">
                            • {p.nome}: {p.quantidade} unidades
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Alerta de contas a pagar */}
              {contasAPagar > 0 && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-red-500">Contas Pendentes</p>
                      <p className="text-sm text-muted-foreground">
                        R$ {contasAPagar.toFixed(2)} em pagamentos pendentes
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Alerta de eventos da semana */}
              {eventosDestaSemana.length > 0 && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-500">Eventos Próximos</p>
                      <p className="text-sm text-muted-foreground">
                        {eventosDestaSemana.length} evento(s) programados para esta semana
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mensagem quando não há alertas */}
              {produtosEstoqueBaixo.length === 0 && contasAPagar === 0 && eventosDestaSemana.length === 0 && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-green-500">Tudo em ordem!</p>
                      <p className="text-sm text-muted-foreground">
                        Não há alertas no momento
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumo Financeiro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Resumo Financeiro do Mês
            </CardTitle>
            <CardDescription>Visão geral das finanças</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Receitas</span>
                <span className="text-sm font-bold text-green-500">
                  R$ {receitasDoMes.toFixed(2)}
                </span>
              </div>
              <Progress value={(receitasDoMes / (receitasDoMes + despesasDoMes)) * 100} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Despesas</span>
                <span className="text-sm font-bold text-red-500">
                  R$ {despesasDoMes.toFixed(2)}
                </span>
              </div>
              <Progress value={(despesasDoMes / (receitasDoMes + despesasDoMes)) * 100} className="h-2" />
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold">Lucro Líquido</span>
                <span className={`text-xl font-bold ${lucroDoMes >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  R$ {lucroDoMes.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Index;
