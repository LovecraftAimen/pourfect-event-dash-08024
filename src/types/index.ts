export interface Evento {
  id: string;
  nome: string;
  dataInicio: string;
  dataFim: string;
  local: string;
  status: 'confirmado' | 'pendente' | 'cancelado';
  numeroConvidados: number;
  clienteId: string;
  observacoes?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
}

export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number;
  capacidadeProduto?: number;
  unidade: 'unidade' | 'ml' | 'g';
  alertaReposicao: number;
  precoCompra: number;
  dataValidade?: string;
}

export interface Ingrediente {
  produtoId: string;
  quantidade: number;
  unidade: string;
}

export interface Drink {
  id: string;
  nome: string;
  ingredientes: Ingrediente[];
  custoTotal: number;
  precoVendaSugerido: number;
  descricao?: string;
}

export interface Orcamento {
  id: string;
  clienteId: string;
  eventoId?: string;
  valorTotal: number;
  status: 'enviado' | 'aprovado' | 'recusado';
  dataEnvio: string;
  itens: string;
}

export interface MembroEquipe {
  id: string;
  nome: string;
  funcao: string;
  telefone: string;
  email: string;
  salarioPorEvento: number;
  disponibilidade: 'disponivel' | 'ocupado' | 'inativo';
}

export interface Escala {
  id: string;
  membroEquipeId: string;
  eventoId: string;
  horarioEntrada: string;
  horarioSaida: string;
  valorPago?: number;
  status: 'agendado' | 'confirmado' | 'concluido' | 'cancelado';
}

export interface Transacao {
  id: string;
  tipo: 'receita' | 'despesa';
  categoria: string;
  descricao: string;
  valor: number;
  dataLancamento: string;
  eventoId?: string;
  status: 'pendente' | 'pago' | 'recebido';
  formaPagamento?: string;
}
