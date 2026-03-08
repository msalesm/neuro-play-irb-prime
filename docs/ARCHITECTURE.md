# 🏗️ NeuroPlay — Arquitetura em 7 Camadas

## Visão Geral

```
┌─────────────────────────────────────────────┐
│  7. AI LAYER                                │
│     Copilot · Insight Engine · Predição     │
├─────────────────────────────────────────────┤
│  6. ANALYTICS LAYER                         │
│     Behavioral Dataset · Metrics · Snapshots│
├─────────────────────────────────────────────┤
│  5. DATA LAYER                              │
│     Postgres + RLS + Audit + Encryption     │
├─────────────────────────────────────────────┤
│  4. SERVICE LAYER                           │
│     Edge Functions · API · AI Gateway       │
├─────────────────────────────────────────────┤
│  3. DOMAIN ENGINES                          │
│     Games · ABA · Behavioral · Assessment   │
│     Recommendations · Routines · Stories    │
├─────────────────────────────────────────────┤
│  2. APPLICATION LAYER                       │
│     Hooks · State · Role-Based Views        │
├─────────────────────────────────────────────┤
│  1. CLIENT LAYER                            │
│     React PWA · Mobile · Accessibility      │
└─────────────────────────────────────────────┘
```

## Fluxo de Dados

```
User Interaction
       ↓
Game / Routine / ABA Activity
       ↓
Session + Trial Data
       ↓
Behavior Engine
       ↓
Analytics Snapshot
       ↓
Insights / Copilot
```

---

## Camada 1 — Client Layer

```
src/components/ui/     → Componentes visuais puros (shadcn)
src/components/*/      → Componentes de domínio (games, aba, clinic, etc.)
src/pages/             → Páginas/rotas
```

**Regra:** UI não contém lógica de negócio.

## Camada 2 — Application Layer

```
src/hooks/             → Queries, estado, integração com engines
src/contexts/          → Providers globais (Auth, Theme)
src/core/roles.ts      → RBAC central
src/core/navigation.ts → Navegação por papel
```

**Regra:** Hooks devem ser curtos e delegar para engines/services.

## Camada 3 — Domain Engines

```
src/modules/
  games/          → Game Engine (sessões, trials, métricas cognitivas)
  aba/            → ABA Engine (programas, sessões, prompt fading)
  behavioral/     → Behavioral Engine (integra jogos+ABA+rotina+histórias)
  assessment/     → Assessment Engine (scores cognitivos 0-100)
  recommendations/→ Recommendation Engine (sugestões por papel)
  copilot/        → Copilot Engine (alertas, padrões, insights)
  adaptive/       → Adaptive Engine (dificuldade, intervenções)
  dataset/        → Dataset Engine (agregação, correlação, analytics)
  routines/       → Routine Engine (rotina executiva)
  stories/        → Story Engine (histórias interativas)
```

### Métricas Coletadas pelo Game Engine

| Métrica | Descrição |
|---------|-----------|
| `reactionTimeMs` | Tempo de reação |
| `reactionTimeVariability` | Variabilidade (desvio padrão) |
| `omissionErrors` | Erros de omissão |
| `commissionErrors` | Erros de comissão |
| `postErrorLatencyMs` | Latência pós-erro |
| `perseverationErrors` | Erros de perseveração |
| `blockPerformance` | Acurácia por bloco |

### Índices do Behavioral Engine

| Índice | Fontes |
|--------|--------|
| `attention_index` | Games + Routines |
| `persistence_index` | Games + ABA |
| `emotional_regulation` | Stories + Routines |
| `cognitive_flexibility` | Games + ABA |

## Camada 4 — Service Layer

```
src/services/
  user-service.ts      → Perfis, autenticação
  game-service.ts      → Persistência de sessões
  aba-service.ts       → Dados ABA
  report-service.ts    → Geração de relatórios
  analytics-service.ts → Snapshots, métricas agregadas

supabase/functions/
  cognitive-analysis/       → Análise cognitiva IA
  generate-clinical-report/ → Relatórios clínicos
  therapeutic-chat/         → Chat terapêutico
  aba-sync/                → Sincronização ABA
  smart-recommendations/   → Recomendações IA
  predictive-analysis/     → Análise preditiva
```

**Regra:** Frontend nunca fala direto com o banco — sempre via services.

## Camada 5 — Data Layer

```
Supabase (Postgres + RLS)

Tabelas Principais:
  profiles, children, child_profiles
  game_sessions, learning_sessions
  aba_np_programs, aba_np_sessions, aba_np_trials
  routine_events, story_decisions (futuro)
  analytics_snapshot
  clinical_reports, behavioral_insights

Segurança:
  Row Level Security em todas as tabelas
  SECURITY DEFINER helpers (has_role, is_parent_of, etc.)
  Audit logs imutáveis
  Encryption via pgcrypto (AES-256)
  Consent tracking (LGPD)
```

## Camada 6 — Analytics Layer

```
src/modules/dataset/
  behavioral-dataset.ts  → Estrutura de dados comportamentais
  dataset-aggregator.ts  → Agregação multi-fonte
  analytics-engine.ts    → Correlações e insights

src/modules/data-classification.ts → Classificação real/derivado/simulado
```

### Analytics Snapshot (tabela central)

```sql
analytics_snapshot
  child_id, institution_id, calculated_at
  active_children, engagement_rate
  avg_attention, avg_memory, avg_flexibility, avg_persistence
  risk_distribution, routine_completion_rate
```

**Regra:** Dashboards usam snapshots, não cálculos ao vivo.

## Camada 7 — AI Layer

```
src/modules/ai-provider.ts → Abstração multi-provider com fallback
src/modules/copilot/
  copilot-engine.ts          → Orquestrador central
  pattern-detector.ts        → Detecção de padrões
  insight-generator.ts       → Geração de insights
  recommendation-generator.ts→ Recomendações por papel
  alert-system.ts            → Alertas precoces

Providers (via Edge Functions):
  Lovable AI Gateway (primário)
  Future: OpenAI, Anthropic, Google, Local fallback
```

---

## Vantagens Competitivas

### 1. Dataset Comportamental
Dados longitudinais: reaction_time, error_patterns, decision_speed,
task_persistence, emotional_choices.

### 2. Motor Cognitivo
Métricas reais: response_variability, omission_errors,
post_error_latency — que 90% dos apps não coletam.

### 3. Copilot de Desenvolvimento
Integração de 5 fontes simultâneas (Games + ABA + Rotina + Histórias + Avaliação).

---

## Segurança

- RLS em todas as tabelas com dados sensíveis
- Audit logs imutáveis (clinical_audit_logs, data_access_logs)
- Encryption em repouso (pgcrypto)
- Rate limiting em edge functions de IA
- Consent tracking (LGPD + Lei 14.254/21)
- SECURITY DEFINER para queries cross-role

## Testes

```
src/modules/__tests__/     → Unit tests (engines)
Vitest                     → Framework
Playwright (futuro)        → E2E
```

## Escalabilidade

- Frontend: CDN/Vercel
- Backend: Supabase managed
- Analytics: Materialized views / snapshots
- AI: Edge Functions com rate limiting
