export interface Planeta {
  id: string;
  nome: string;
  diagnostico: string;
  cor: string;
  descricao: string;
  focos: string[];
  jogos: JogoPlaneta[];
  recompensa: string;
  icone: string;
  posicao: { x: number; y: number };
  tamanho: 'pequeno' | 'medio' | 'grande';
  desbloqueado: boolean;
  progressoAtual: number;
  totalMissoes: number;
}

export interface JogoPlaneta {
  id: string;
  nome: string;
  descricao: string;
  duracao: number;
  dificuldade: number;
  rota: string;
  icone: string;
  completado: boolean;
}

export interface MissaoSemanal {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'cognitiva' | 'sensorial' | 'emocional' | 'foco' | 'escolar';
  planetaId: string;
  progresso: number;
  meta: number;
  recompensa: string;
  dataInicio: string;
  dataFim: string;
  completada: boolean;
}

export interface ProgressoPlaneta {
  planetaId: string;
  criancaId: string;
  jogosCompletados: string[];
  pontuacao: number;
  estrelas: number;
  aneis: number;
  ultimaVisita: string;
}