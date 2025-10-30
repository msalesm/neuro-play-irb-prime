# Neuro Play EDU - Sistema Completo de Triagem e Intervenção

## 📋 Visão Geral

O **Neuro Play EDU** é uma plataforma completa de identificação precoce e intervenção pedagógica para neurodiversidade, desenvolvida em conformidade com a **Lei 14.254/21**. O sistema integra triagem gamificada, geração automática de PEI (Plano Educacional Individualizado) e capacitação docente.

---

## 🎯 Funcionalidades Principais

### 1. **Triagem Gamificada** 
**Rota:** `/screening`

Identificação precoce através de jogos científicos validados:

#### Módulos de Triagem:
- **Dislexia** (`/games/dislexia-screening`)
  - Processamento fonológico
  - Consciência fonêmica
  - Reconhecimento de letras e sílabas
  - Duração: 10-15 minutos

- **TDAH** (`/games/tdah-screening`)
  - Atenção sustentada
  - Controle inibitório
  - Flexibilidade cognitiva
  - Duração: 10-15 minutos

- **TEA** (`/games/tea-screening`)
  - Cognição social
  - Teoria da mente
  - Reconhecimento emocional
  - Duração: 10-15 minutos

#### Métricas Geradas:
- **Score**: Pontuação bruta (0-100)
- **Percentil**: Classificação em relação à população
- **Duração**: Tempo de conclusão em minutos
- **Recomendação**: Ação sugerida baseada no percentil

#### Sistema de Classificação:
```
Percentil >= 70: "Desempenho adequado - continuar acompanhamento regular"
Percentil 40-69: "Atenção necessária - monitoramento próximo recomendado"
Percentil < 40: "Intervenção recomendada - PEI será gerado automaticamente"
```

---

### 2. **PEI Inteligente (Plano Educacional Individualizado)**
**Rota:** `/pei/:planId`

Geração automática de planos personalizados para estudantes com percentil < 40:

#### Componentes do PEI:
1. **Objetivos de Aprendizagem**
   - Metas específicas baseadas na triagem
   - Timeline de implementação
   - Critérios de sucesso mensuráveis

2. **Atividades Recomendadas**
   - Exercícios adaptativos
   - Recursos didáticos
   - Estratégias pedagógicas diferenciadas

3. **Recomendações**
   - Orientações para professores
   - Adaptações curriculares
   - Encaminhamentos profissionais

#### Funcionalidades:
- ✅ Geração automática por IA pedagógica
- ✏️ Edição completa pelo professor
- 📊 Acompanhamento de progresso (0-100%)
- 🔄 Status: Active / Completed / Archived
- 📅 Histórico de atualizações

#### Banco de Dados:
```sql
Table: pei_plans
- id: UUID
- user_id: UUID (estudante)
- screening_id: UUID (triagem relacionada)
- objectives: JSONB (lista de objetivos)
- activities: JSONB (atividades recomendadas)
- recommendations: TEXT
- generated_by_ai: BOOLEAN
- progress: INTEGER (0-100)
- status: TEXT (active/completed/archived)
- created_at, updated_at: TIMESTAMP
```

---

### 3. **Painel do Professor**
**Rota:** `/teacher-dashboard`

Dashboard completo para monitoramento e gestão:

#### Métricas Exibidas:
- 📊 **Total de Triagens**: Quantidade total realizada
- ⚠️ **Estudantes em Risco**: Percentil < 40
- 📝 **PEIs Ativos**: Planos em andamento
- 🎓 **Módulos Completados**: Progresso na capacitação

#### Funcionalidades:
- Listagem de todas as triagens
- Filtros por tipo (Dislexia, TDAH, TEA)
- Busca por estudante
- Acesso direto aos PEIs
- Status de cada triagem (percentil e ação recomendada)
- Links rápidos para visualizar/editar PEIs

#### Visualização de Dados:
- Cards com métricas principais
- Tabela com triagens ordenadas por data
- Badges coloridos por tipo de triagem
- Indicadores visuais de percentil

---

### 4. **Capacitação Docente Gamificada**
**Rota:** `/training`

Sistema completo de formação para professores:

#### Módulos Disponíveis:

1. **Fundamentos da Dislexia** (`dislexia-fundamentals`)
   - Definição e características
   - Sinais de alerta por faixa etária
   - Processos cognitivos envolvidos
   - 30 questões | Duração: ~20 min

2. **Intervenções em Dislexia** (`dislexia-interventions`)
   - Estratégias pedagógicas
   - Tecnologias assistivas
   - Adaptações curriculares
   - 30 questões | Duração: ~20 min

3. **Fundamentos do TDAH** (`tdah-fundamentals`)
   - Sintomas e diagnóstico
   - Neurobiologia do TDAH
   - Impacto na aprendizagem
   - 30 questões | Duração: ~20 min

4. **Gestão de TDAH em Sala** (`tdah-classroom`)
   - Organização do ambiente
   - Estratégias de atenção
   - Manejo comportamental
   - 30 questões | Duração: ~20 min

5. **Fundamentos do TEA** (`tea-fundamentals`)
   - Espectro autista
   - Comunicação e linguagem
   - Características sensoriais
   - 30 questões | Duração: ~20 min

6. **Inclusão de Autistas** (`tea-inclusion`)
   - Práticas inclusivas
   - Adaptações pedagógicas
   - Comunicação alternativa
   - 30 questões | Duração: ~20 min

#### Sistema de Quiz:
- **Questões de múltipla escolha** (4 alternativas)
- **Feedback imediato** com explicações detalhadas
- **Sistema de pontuação**: 
  - Acerto = +10 pontos
  - Erro = +0 pontos
  - Score máximo: 300 pontos por módulo

#### Certificação:
- **Critério de Aprovação**: Score >= 240 pontos (80%)
- **Certificado Digital**: Gerado automaticamente ao completar
- **Múltiplas Tentativas**: Permitidas para melhoria

#### Ranking de Professores:
- Classificação por módulos completados
- Pontuação média entre módulos
- Sistema de badges por conquistas
- Incentivo à capacitação contínua

#### Banco de Dados:
```sql
Table: teacher_training_progress
- id: UUID
- user_id: UUID (professor)
- module_id: TEXT
- completed: BOOLEAN
- score: INTEGER (0-300)
- attempts: INTEGER
- answers: JSONB (histórico de respostas)
- time_spent_seconds: INTEGER
- certificate_url: TEXT
- completed_at: TIMESTAMP
- created_at, updated_at: TIMESTAMP
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Criadas:

#### 1. `screenings`
Armazena resultados das triagens:
```sql
- id, user_id
- type: 'dislexia' | 'tdah' | 'tea'
- score: NUMERIC (0-100)
- percentile: NUMERIC (0-100)
- duration: NUMERIC (minutos)
- game_data: JSONB (dados brutos do jogo)
- recommended_action: TEXT
- created_at
```

#### 2. `pei_plans`
Planos educacionais individualizados:
```sql
- id, user_id, screening_id
- objectives: JSONB
- activities: JSONB
- recommendations: TEXT
- generated_by_ai: BOOLEAN
- progress: INTEGER (0-100)
- status: 'active' | 'completed' | 'archived'
- created_at, updated_at
```

#### 3. `teacher_training_progress`
Progresso na capacitação docente:
```sql
- id, user_id
- module_id: TEXT
- completed: BOOLEAN
- score: INTEGER
- attempts: INTEGER
- answers: JSONB
- time_spent_seconds: INTEGER
- certificate_url: TEXT
- completed_at
- created_at, updated_at
```

### Políticas RLS (Row Level Security):
Todas as tabelas possuem políticas que garantem:
- ✅ Usuários só acessam seus próprios dados
- ✅ Inserção apenas pelo próprio usuário
- ✅ Atualização apenas dos próprios registros
- ✅ Segurança e privacidade dos dados

---

## 🎨 Componentes React Principais

### Hooks Customizados:

#### `useScreening.ts`
```typescript
- startScreening(type: string)
- saveScreening(score, duration, gameData)
- getScreeningHistory()
- generatePEI(screeningId, result)
```

#### `usePEI.ts`
```typescript
- fetchPEIPlans()
- createPEI(peiData)
- updatePEI(planId, updates)
- getPEIByScreening(screeningId)
```

#### `useTeacherTraining.ts`
```typescript
- fetchProgress()
- saveProgress(moduleId, score, answers)
- completeModule(moduleId, score)
- getModuleProgress(moduleId)
```

### Páginas:

#### Triagem:
- `ScreeningSelection.tsx` - Seleção do tipo de triagem
- `DislexiaScreening.tsx` - Jogo de triagem de dislexia
- `TDAHScreening.tsx` - Jogo de triagem de TDAH
- `TEAScreening.tsx` - Jogo de triagem de TEA
- `ScreeningResult.tsx` - Resultados e recomendações

#### PEI:
- `PEIView.tsx` - Visualização e edição de PEI
- `TeacherDashboard.tsx` - Painel do professor

#### Capacitação:
- `TeacherTraining.tsx` - Lista de módulos
- `TrainingModule.tsx` - Quiz do módulo
- `TeacherRanking.tsx` - Ranking de professores

---

## 🚀 Fluxo de Uso

### Para Professores:

1. **Acesse a Plataforma**
   - Navegue para `/` (página inicial)
   - Faça login/cadastro

2. **Realize Triagens**
   - Clique em "Triagem" ou acesse `/screening`
   - Selecione o tipo (Dislexia, TDAH ou TEA)
   - Acompanhe o estudante no jogo
   - Visualize resultados imediatos

3. **Gerencie PEIs**
   - Acesse "Painel do Professor" (`/teacher-dashboard`)
   - Visualize estudantes em risco (percentil < 40)
   - Clique para ver PEI gerado automaticamente
   - Edite objetivos, atividades e recomendações
   - Atualize progresso regularmente

4. **Capacite-se**
   - Acesse "Capacitação" (`/training`)
   - Escolha um módulo de interesse
   - Complete o quiz (30 questões)
   - Obtenha certificado digital (score >= 240)
   - Veja seu ranking entre outros professores

### Para Coordenadores/Gestores:

1. **Monitore Indicadores**
   - Use o Dashboard do Professor
   - Analise métricas agregadas:
     - Total de triagens realizadas
     - Percentual de estudantes em risco
     - PEIs ativos e em progresso
     - Taxa de capacitação da equipe

2. **Acompanhe Resultados**
   - Filtre triagens por tipo
   - Busque estudantes específicos
   - Verifique status dos PEIs
   - Monitore evolução do progresso

---

## 📊 Conformidade Legal

### Lei 14.254/21 - Dislexia, TDAH e Transtornos de Aprendizagem

O sistema atende aos requisitos da lei:

✅ **Art. 3º** - Identificação precoce através de triagem gamificada
✅ **Art. 4º** - Plano de acompanhamento pedagógico individualizado (PEI)
✅ **Art. 5º** - Capacitação de professores e equipe pedagógica
✅ **Art. 6º** - Acompanhamento integral do desenvolvimento
✅ **Art. 7º** - Apoio educacional especializado

---

## 🔧 Tecnologias Utilizadas

- **Frontend**: React + TypeScript + Vite
- **Estilização**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Roteamento**: React Router v6
- **Estado**: React Hooks + Context API
- **Validação**: Zod + React Hook Form

---

## 📈 Próximos Passos Sugeridos

### Fase 5 - Melhorias Avançadas:
- [ ] Integração com IA para análise preditiva
- [ ] Dashboard analítico para gestores
- [ ] Exportação de relatórios em PDF
- [ ] Notificações automáticas para prazos de PEI
- [ ] Sistema de agendamento de reavaliações
- [ ] Integração com sistemas escolares (SIEPE, etc.)
- [ ] Aplicativo móvel para professores
- [ ] Gamificação para estudantes (badges, conquistas)
- [ ] Biblioteca de recursos pedagógicos
- [ ] Fórum de compartilhamento entre professores

---

## 📞 Suporte

Para dúvidas ou sugestões sobre o sistema Neuro Play EDU:
- Acesse a documentação completa
- Entre em contato com o suporte técnico
- Participe dos treinamentos oferecidos

---

**Desenvolvido com ❤️ para transformar a educação inclusiva no Brasil**
