import { Evento, Cliente, Produto, Drink, Orcamento, MembroEquipe, Escala, Transacao } from '@/types';

export const mockClientes: Cliente[] = [
  {
    id: '1',
    nome: 'Maria Silva',
    email: 'maria@email.com',
    telefone: '(11) 98765-4321',
    endereco: 'Rua das Flores, 123 - São Paulo',
  },
  {
    id: '2',
    nome: 'João Santos',
    email: 'joao@email.com',
    telefone: '(11) 99876-5432',
    endereco: 'Av. Paulista, 1000 - São Paulo',
  },
];

export const mockEventos: Evento[] = [
  {
    id: '1',
    nome: 'Casamento Silva',
    dataInicio: '2025-11-15T18:00',
    dataFim: '2025-11-15T23:00',
    local: 'Espaço Jardim das Rosas',
    status: 'confirmado',
    numeroConvidados: 150,
    clienteId: '1',
    observacoes: 'Bar premium com drinks autorais',
  },
  {
    id: '2',
    nome: 'Aniversário Corporativo',
    dataInicio: '2025-11-20T19:00',
    dataFim: '2025-11-20T22:00',
    local: 'Hotel Majestic',
    status: 'pendente',
    numeroConvidados: 80,
    clienteId: '2',
  },
];

export const mockProdutos: Produto[] = [
  {
    id: '1',
    nome: 'Vodka Premium',
    categoria: 'Destilados',
    quantidade: 8,
    capacidadeProduto: 750,
    unidade: 'ml',
    alertaReposicao: 10,
    precoCompra: 85.00,
    dataValidade: '2026-12-31',
  },
  {
    id: '2',
    nome: 'Gin London Dry',
    categoria: 'Destilados',
    quantidade: 15,
    capacidadeProduto: 750,
    unidade: 'ml',
    alertaReposicao: 10,
    precoCompra: 95.00,
  },
  {
    id: '3',
    nome: 'Limão Tahiti',
    categoria: 'Frutas',
    quantidade: 50,
    unidade: 'unidade',
    alertaReposicao: 20,
    precoCompra: 0.80,
  },
  {
    id: '4',
    nome: 'Xarope de Açúcar',
    categoria: 'Xaropes',
    quantidade: 5,
    capacidadeProduto: 1000,
    unidade: 'ml',
    alertaReposicao: 8,
    precoCompra: 15.00,
  },
];

export const mockDrinks: Drink[] = [
  {
    id: '1',
    nome: 'Caipirinha Premium',
    ingredientes: [
      { produtoId: '1', quantidade: 50, unidade: 'ml' },
      { produtoId: '3', quantidade: 1, unidade: 'un' },
      { produtoId: '4', quantidade: 20, unidade: 'ml' },
    ],
    custoTotal: 8.50,
    precoVendaSugerido: 25.00,
    descricao: 'Caipirinha com vodka premium',
  },
  {
    id: '2',
    nome: 'Gin Tônica',
    ingredientes: [
      { produtoId: '2', quantidade: 50, unidade: 'ml' },
      { produtoId: '3', quantidade: 0.5, unidade: 'un' },
    ],
    custoTotal: 6.20,
    precoVendaSugerido: 22.00,
    descricao: 'Gin London Dry com água tônica',
  },
];

export const mockOrcamentos: Orcamento[] = [
  {
    id: '1',
    clienteId: '1',
    eventoId: '1',
    valorTotal: 4500.00,
    status: 'aprovado',
    dataEnvio: '2025-10-01',
    itens: 'Bar completo com 3 bartenders, 150 drinks',
  },
  {
    id: '2',
    clienteId: '2',
    valorTotal: 2800.00,
    status: 'enviado',
    dataEnvio: '2025-10-15',
    itens: 'Bar premium com 2 bartenders, 80 drinks',
  },
];

export const mockMembrosEquipe: MembroEquipe[] = [
  {
    id: '1',
    nome: 'Carlos Silva',
    funcao: 'Bartender Senior',
    telefone: '(11) 98888-1111',
    email: 'carlos@donkeyshot.com',
    salarioPorEvento: 800.00,
    disponibilidade: 'disponivel',
  },
  {
    id: '2',
    nome: 'Ana Costa',
    funcao: 'Bartender',
    telefone: '(11) 98888-2222',
    email: 'ana@donkeyshot.com',
    salarioPorEvento: 600.00,
    disponibilidade: 'disponivel',
  },
  {
    id: '3',
    nome: 'Pedro Santos',
    funcao: 'Auxiliar de Bar',
    telefone: '(11) 98888-3333',
    email: 'pedro@donkeyshot.com',
    salarioPorEvento: 400.00,
    disponibilidade: 'ocupado',
  },
];

export const mockEscalas: Escala[] = [
  {
    id: '1',
    membroEquipeId: '1',
    eventoId: '1',
    horarioEntrada: '2025-11-15T17:00',
    horarioSaida: '2025-11-15T23:30',
    valorPago: 800.00,
    status: 'confirmado',
  },
  {
    id: '2',
    membroEquipeId: '2',
    eventoId: '1',
    horarioEntrada: '2025-11-15T17:00',
    horarioSaida: '2025-11-15T23:30',
    valorPago: 600.00,
    status: 'confirmado',
  },
];

export const mockTransacoes: Transacao[] = [
  {
    id: '1',
    tipo: 'receita',
    categoria: 'Evento',
    descricao: 'Pagamento Casamento Silva',
    valor: 4500.00,
    dataLancamento: '2025-10-15',
    eventoId: '1',
    status: 'recebido',
    formaPagamento: 'PIX',
  },
  {
    id: '2',
    tipo: 'despesa',
    categoria: 'Estoque',
    descricao: 'Compra de destilados',
    valor: 1200.00,
    dataLancamento: '2025-10-10',
    status: 'pago',
    formaPagamento: 'Cartão',
  },
  {
    id: '3',
    tipo: 'despesa',
    categoria: 'Equipe',
    descricao: 'Pagamento Carlos Silva - Evento 1',
    valor: 800.00,
    dataLancamento: '2025-10-16',
    eventoId: '1',
    status: 'pago',
    formaPagamento: 'Transferência',
  },
  {
    id: '4',
    tipo: 'receita',
    categoria: 'Orçamento',
    descricao: 'Sinal Aniversário Corporativo',
    valor: 1400.00,
    dataLancamento: '2025-10-20',
    status: 'recebido',
    formaPagamento: 'PIX',
  },
  {
    id: '5',
    tipo: 'despesa',
    categoria: 'Operacional',
    descricao: 'Aluguel de equipamentos',
    valor: 350.00,
    dataLancamento: '2025-10-18',
    status: 'pendente',
  },
];
