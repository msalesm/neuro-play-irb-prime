# NeuroPlay 2.0 - Roadmap de Sprints

## Visão Geral
Este documento organiza todas as funcionalidades do NeuroPlay 2.0 em sprints de desenvolvimento, priorizadas para implementação em 30 dias usando desenvolvimento acelerado por IA.

---

## 🎯 FASE 1: FUNDAÇÃO (Sprints 1-4) - Semanas 1-2

### Sprint 1: Autenticação e Onboarding Clínico
**Duração:** 3-4 dias  
**Prioridade:** CRÍTICA

#### Objetivos:
- Sistema de autenticação completo com Lovable Cloud (Supabase Auth)
- Fluxo de onboarding LGPD-compliant
- Registro de consentimento seguro

#### Entregáveis:
- [x] Login com email/senha
- [x] Autenticação com Google (opcional)
- [x] Verificação de email
- [ ] Wizard de 4 etapas:
  - Etapa 1: Dados do usuário (nome, email, telefone)
  - Etapa 2: Termos de uso e política de privacidade
  - Etapa 3: Consentimentos granulares LGPD (dados anônimos, pesquisa, compartilhamento clínico)
  - Etapa 4: Perfil da criança + configuração sensorial
- [ ] Modal de disclaimer clínico (obrigatório)
- [ ] Tabela `data_consents` com registro de consentimentos
- [ ] Tabela `children` com perfil sensorial

#### Critérios de Aceitação:
- Usuário consegue criar conta e fazer login
- Todos os consentimentos são registrados no banco
- Disclaimer clínico é exibido e aceito obrigatoriamente
- Perfil da criança é criado com configurações sensoriais

---

### Sprint 2: Perfis de Usuário e RBAC
**Duração:** 2-3 dias  
**Prioridade:** CRÍTICA

#### Objetivos:
- Sistema de perfis multi-usuário
- Controle de acesso baseado em roles
- Gerenciamento de perfis infantis

#### Entregáveis:
- [ ] Perfil de pais/responsáveis
- [ ] Perfil de terapeutas
- [ ] Perfil de administradores IRB Prime
- [ ] Sistema de roles (`user_roles` table - já implementado)
- [ ] Acesso multi-criança por responsável
- [ ] Compartilhamento de acesso (responsável → terapeuta)
- [ ] Dashboard de seleção de perfil infantil

#### Critérios de Aceitação:
- Pais podem gerenciar múltiplos perfis infantis
- Terapeutas podem visualizar perfis compartilhados
- Controle de acesso por role funciona corretamente

---

### Sprint 3: Conectar useGameSession ao Backend Real
**Duração:** 2-3 dias  
**Prioridade:** CRÍTICA

#### Objetivos:
- Substituir dados mock por dados reais do banco
- Implementar rastreamento completo de sessões
- Habilitar análise histórica de desempenho

#### Entregáveis:
- [ ] Refatorar `useGameSession` hook para usar `game_sessions` table
- [ ] Implementar `game_metrics` para eventos granulares
- [ ] Criar função de agregação de métricas
- [ ] Atualizar `adaptive_progress` automaticamente após sessão
- [ ] Salvar session_data JSON com detalhes do jogo
- [ ] Implementar recovery de sessão interrompida

#### Critérios de Aceitação:
- Todas as sessões de jogo são salvas no banco
- Métricas granulares (tempo de reação, acertos, erros) são registradas
- Dashboard exibe dados históricos reais

---

### Sprint 4: Cognitive Analysis Edge Function
**Duração:** 2-3 dias  
**Prioridade:** CRÍTICA

#### Objetivos:
- Implementar análise cognitiva com IA real
- Gerar insights personalizados de desempenho
- Substituir análise placeholder

#### Entregáveis:
- [x] Edge function `cognitive-analysis` (já existe)
- [ ] Integração com Lovable AI (gemini-2.5-pro ou gpt-5)
- [ ] Análise de padrões de erro
- [ ] Detecção de pontos fortes/fracos
- [ ] Geração de recomendações personalizadas
- [ ] Atualização de `ai_insights` em `adaptive_progress`
- [ ] Sistema de cache para evitar re-análise

#### Critérios de Aceitação:
- Análise é gerada após cada sessão de jogo
- Insights são exibidos no dashboard dos pais
- Recomendações são acionáveis e específicas

---

## 🎮 FASE 2: GAMIFICAÇÃO AVANÇADA (Sprints 5-7) - Semana 3

### Sprint 5: Sistema de Conquistas e Progressão
**Duração:** 3-4 dias  
**Prioridade:** ALTA

#### Objetivos:
- Sistema de conquistas terapêuticas
- Progressão por níveis
- Recompensas motivacionais

#### Entregáveis:
- [ ] Sistema de conquistas (`achievements` table - já existe)
- [ ] Badges desbloqueáveis por marcos terapêuticos
- [ ] Sistema de XP e níveis
- [ ] Avatares evolutivos (muda conforme progresso)
- [ ] Daily streaks (sequências diárias)
- [ ] Moedas virtuais para customização
- [ ] Loja de itens cosméticos (avatar, temas)
- [ ] Notificações de conquista com animação

#### Critérios de Aceitação:
- Criança visualiza conquistas desbloqueadas
- Sistema de níveis funciona corretamente
- Avatares evoluem visualmente

---

### Sprint 6: Recomendações de Jogos com IA
**Duração:** 2-3 dias  
**Prioridade:** ALTA (Feature prioritária Phase 2.0)

#### Objetivos:
- Sistema de recomendação inteligente de jogos
- Personalização baseada em desempenho e perfil

#### Entregáveis:
- [ ] Edge function para análise de perfil cognitivo
- [ ] Algoritmo de recomendação baseado em:
  - Desempenho histórico
  - Áreas de dificuldade
  - Preferências sensoriais
  - Nível atual
- [ ] Widget de "Jogos Recomendados" no dashboard
- [ ] Explicação do porquê da recomendação
- [ ] Atualização em tempo real conforme progresso

#### Critérios de Aceitação:
- Criança vê jogos personalizados no dashboard
- Recomendações mudam conforme desempenho
- Explicações são claras e motivadoras

---

### Sprint 7: Feedback Pós-Jogo Aprimorado
**Duração:** 2-3 dias  
**Prioridade:** ALTA (Feature prioritária Phase 2.0)

#### Objetivos:
- Substituir feedback genérico por insights acionáveis
- Educação dos pais sobre progresso terapêutico

#### Entregáveis:
- [ ] Tela de resultados redesenhada
- [ ] Insights para a criança (linguagem lúdica)
- [ ] Insights para os pais (linguagem clínica)
- [ ] Sugestões de atividades complementares
- [ ] Gráficos de evolução
- [ ] Comparação com sessões anteriores
- [ ] Botão de compartilhar com terapeuta
- [ ] Celebração de marcos importantes

#### Critérios de Aceitação:
- Feedback é específico e construtivo
- Pais entendem o progresso terapêutico
- Criança se sente motivada

---

## 🤖 FASE 3: IA TERAPÊUTICA (Sprints 8-10) - Semana 4

### Sprint 8: Chatbot de Check-in Emocional
**Duração:** 3-4 dias  
**Prioridade:** MÉDIA

#### Objetivos:
- Assistente virtual para check-ins diários
- Monitoramento de estado emocional

#### Entregáveis:
- [ ] Chatbot com Lovable AI (gemini-2.5-flash)
- [ ] Check-in emocional diário (escala de humor)
- [ ] Diálogo adaptativo baseado em resposta
- [ ] Registro de histórico emocional
- [ ] Alertas para responsáveis em casos críticos
- [ ] Sugestões de atividades calmantes
- [ ] Integração com biofeedback (futuro)

#### Critérios de Aceitação:
- Criança interage naturalmente com chatbot
- Estado emocional é registrado diariamente
- Pais recebem alertas quando necessário

---

### Sprint 9: Coaching para Pais via IA
**Duração:** 2-3 dias  
**Prioridade:** MÉDIA

#### Objetivos:
- Assistente de educação parental
- Respostas personalizadas a dúvidas

#### Entregáveis:
- [ ] Chatbot para pais (RAG sobre conteúdo educacional)
- [ ] Base de conhecimento sobre TEA/TDAH/Dislexia
- [ ] Sugestões contextuais baseadas no perfil da criança
- [ ] Estratégias de intervenção em casa
- [ ] Biblioteca de recursos
- [ ] Histórico de conversas

#### Critérios de Aceitação:
- Pais recebem respostas relevantes e embasadas
- Sugestões são personalizadas ao perfil da criança

---

### Sprint 10: Análise Preditiva de Crises
**Duração:** 3-4 dias  
**Prioridade:** MÉDIA

#### Objetivos:
- Detecção precoce de padrões de risco
- Alertas preventivos

#### Entregáveis:
- [ ] Modelo de ML para análise de padrões
- [ ] Identificação de gatilhos comportamentais
- [ ] Alertas preditivos para responsáveis
- [ ] Dashboard de indicadores de risco
- [ ] Sugestões de intervenção preventiva
- [ ] Relatório semanal de tendências

#### Critérios de Aceitação:
- Sistema identifica padrões de risco
- Alertas são enviados com antecedência
- Sugestões de intervenção são práticas

---

## 👥 FASE 4: COLABORAÇÃO (Sprints 11-13) - Semana 5

### Sprint 11: Jogos Cooperativos Pais-Filhos
**Duração:** 3-4 dias  
**Prioridade:** MÉDIA

#### Objetivos:
- Experiências multiplayer para vínculo familiar
- Jogos terapêuticos cooperativos

#### Entregáveis:
- [ ] Sistema de sessões cooperativas (`cooperative_sessions` - já existe)
- [ ] Lobby de espera para multiplayer
- [ ] 3 jogos cooperativos:
  - Construção colaborativa
  - Quebra-cabeça em dupla
  - Aventura de comunicação
- [ ] Sistema de pontuação conjunta
- [ ] Conquistas de dupla
- [ ] Relatório de interação pais-filho

#### Critérios de Aceitação:
- Pais e filhos jogam juntos em tempo real
- Jogos incentivam comunicação e cooperação

---

### Sprint 12: Portal do Professor
**Duração:** 3-4 dias  
**Prioridade:** MÉDIA

#### Objetivos:
- Integração escola-família-clínica
- Dashboard para educadores

#### Entregáveis:
- [ ] Dashboard do professor
- [ ] Visualização de progresso dos alunos
- [ ] Relatórios simplificados
- [ ] Sugestões de adaptações em sala
- [ ] Sistema de comunicação escola-família
- [ ] Biblioteca de estratégias pedagógicas
- [ ] Rastreamento de PEI (já implementado)

#### Critérios de Aceitação:
- Professores visualizam progresso de alunos autorizados
- Comunicação escola-família funciona

---

### Sprint 13: Integração com Terapeuta
**Duração:** 2-3 dias  
**Prioridade:** ALTA

#### Objetivos:
- Dashboard clínico completo para terapeutas
- Exportação de relatórios profissionais

#### Entregáveis:
- [x] Dashboard clínico (já implementado parcialmente)
- [ ] Visualização de múltiplos pacientes
- [ ] Relatórios clínicos detalhados
- [ ] Exportação PDF com dados terapêuticos
- [ ] Gráficos de evolução temporal
- [ ] Anotações clínicas privadas
- [ ] Sistema de metas terapêuticas

#### Critérios de Aceitação:
- Terapeuta gerencia múltiplos pacientes
- Relatórios são clinicamente úteis
- Exportação PDF funciona perfeitamente

---

## ♿ FASE 5: ACESSIBILIDADE E BIOFEEDBACK (Sprints 14-15) - Semana 6

### Sprint 14: Modos de Acessibilidade Avançados
**Duração:** 2-3 dias  
**Prioridade:** ALTA

#### Objetivos:
- Suporte completo para neurodiversidade
- Modos sensoriais personalizáveis

#### Entregáveis:
- [ ] Modo de baixa estimulação sensorial
- [ ] Modo alto contraste
- [ ] Ajustes de velocidade de animação
- [ ] Controles de volume granulares
- [ ] Teclado navegável (acessibilidade)
- [ ] Leitura de tela (screen reader)
- [ ] Opções de tamanho de fonte
- [ ] Filtros de cor para daltonismo

#### Critérios de Aceitação:
- Todas as telas respeitam preferências sensoriais
- Navegação por teclado funciona completamente

---

### Sprint 15: Biofeedback e Detecção de Sobrecarga
**Duração:** 3-4 dias  
**Prioridade:** BAIXA (futuro)

#### Objetivos:
- Monitoramento de estado fisiológico
- Detecção de sobrecarga sensorial

#### Entregáveis:
- [ ] Integração com sensores externos (futuro)
- [ ] Simulação de biofeedback com métricas de jogo
- [ ] Detecção de padrões de frustração
- [ ] Pausas automáticas em sobrecarga
- [ ] Exercícios de autorregulação
- [ ] Dashboard de estado emocional
- [ ] Alertas para responsáveis

#### Critérios de Aceitação:
- Sistema detecta sinais de sobrecarga
- Intervenções automáticas funcionam

---

## 📊 FASE 6: ANALYTICS E WHITE-LABEL (Sprints 16-17) - Semana 7

### Sprint 16: Dashboard de Analytics Avançado
**Duração:** 3-4 dias  
**Prioridade:** MÉDIA

#### Objetivos:
- Visualização completa de dados agregados
- Insights para gestão clínica

#### Entregáveis:
- [ ] Dashboard administrativo IRB Prime
- [ ] Métricas agregadas de uso
- [ ] Análise de eficácia terapêutica
- [ ] Relatórios de engajamento
- [ ] Exportação de dados anonimizados
- [ ] Gráficos de tendências
- [ ] KPIs clínicos

#### Critérios de Aceitação:
- IRB Prime visualiza dados agregados
- Relatórios são úteis para gestão clínica

---

### Sprint 17: White-Label e Multi-Tenant
**Duração:** 4-5 dias  
**Prioridade:** BAIXA (futuro)

#### Objetivos:
- Suporte para múltiplas organizações
- Customização de marca

#### Entregáveis:
- [ ] Sistema multi-tenant
- [ ] Customização de logo e cores
- [ ] Domínios personalizados
- [ ] Isolamento de dados por organização
- [ ] Painéis administrativos por tenant
- [ ] Faturamento por organização

#### Critérios de Aceitação:
- Múltiplas clínicas usam a plataforma
- Dados são completamente isolados

---

## 📱 FASE 7: MICROLEARNING E MOBILE (Sprints 18-19) - Semana 8

### Sprint 18: Microlearning para Pais
**Duração:** 3-4 dias  
**Prioridade:** ALTA

#### Objetivos:
- Educação parental em doses pequenas
- Conteúdo multimídia engajador

#### Entregáveis:
- [ ] Sistema de módulos de 5 minutos
- [ ] Vídeos curtos educacionais
- [ ] Artigos de leitura rápida
- [ ] Áudios para consumo em movimento
- [ ] Quizzes de fixação
- [ ] Certificados de conclusão
- [ ] Trilhas de aprendizado personalizadas
- [ ] Notificações de novos conteúdos

#### Critérios de Aceitação:
- Pais completam módulos rapidamente
- Conteúdo é acessível e prático

---

### Sprint 19: Otimização Mobile e PWA
**Duração:** 2-3 dias  
**Prioridade:** CRÍTICA

#### Objetivos:
- Experiência mobile impecável
- Funcionalidade offline

#### Entregáveis:
- [ ] Progressive Web App (PWA)
- [ ] Instalação no dispositivo
- [ ] Funcionamento offline básico
- [ ] Notificações push
- [ ] Otimização de performance mobile
- [ ] Touch gestures
- [ ] Orientação adaptativa (retrato/paisagem)

#### Critérios de Aceitação:
- [x] App funciona perfeitamente em mobile (já responsivo)
- [ ] Usuário pode instalar como app
- [ ] Funcionalidades offline básicas funcionam

---

## 🔐 FASE 8: SEGURANÇA E COMPLIANCE (Sprint 20) - Semana 9

### Sprint 20: Auditoria de Segurança LGPD
**Duração:** 3-4 dias  
**Prioridade:** CRÍTICA

#### Objetivos:
- Compliance total com LGPD
- Segurança de dados sensíveis

#### Entregáveis:
- [x] RLS policies em todas as tabelas (já implementado)
- [x] Criptografia de dados sensíveis (Supabase nativo)
- [x] Sistema de auditoria (`audit_logs` - já existe)
- [ ] Portal de privacidade para usuários
- [ ] Exportação de dados pessoais (direito LGPD)
- [ ] Deleção completa de dados (direito ao esquecimento)
- [ ] Revisão de consentimentos
- [ ] Documentação de compliance
- [ ] Testes de penetração

#### Critérios de Aceitação:
- Plataforma está em compliance total com LGPD
- Auditorias de segurança aprovadas

---

## 🚀 FASE 9: LANÇAMENTO (Sprint 21) - Semana 10

### Sprint 21: Preparação para Produção
**Duração:** 3-4 dias  
**Prioridade:** CRÍTICA

#### Objetivos:
- Deploy em produção
- Monitoring e observabilidade

#### Entregáveis:
- [ ] Configuração de domínio customizado
- [ ] SSL e segurança HTTPS
- [ ] Monitoring com Sentry/LogRocket
- [ ] Backup automático de banco
- [ ] Disaster recovery plan
- [ ] Documentação de operação
- [ ] Treinamento de equipe IRB Prime
- [ ] Plano de rollout gradual
- [ ] Testes de carga

#### Critérios de Aceitação:
- Sistema está em produção estável
- Monitoring funciona corretamente
- Equipe está treinada

---

## 📋 Resumo de Prioridades

### CRÍTICO (Must Have - MVP):
- Sprint 1: Autenticação e Onboarding
- Sprint 2: Perfis e RBAC
- Sprint 3: useGameSession Real
- Sprint 4: Cognitive Analysis IA
- Sprint 13: Integração Terapeuta
- Sprint 14: Acessibilidade
- Sprint 19: Mobile/PWA
- Sprint 20: Segurança LGPD
- Sprint 21: Produção

### ALTO (Should Have):
- Sprint 5: Gamificação
- Sprint 6: Recomendações IA
- Sprint 7: Feedback Aprimorado
- Sprint 18: Microlearning

### MÉDIO (Nice to Have):
- Sprint 8: Chatbot Emocional
- Sprint 9: Coaching Pais
- Sprint 10: Análise Preditiva
- Sprint 11: Jogos Cooperativos
- Sprint 12: Portal Professor
- Sprint 16: Analytics

### BAIXO (Futuro):
- Sprint 15: Biofeedback
- Sprint 17: White-Label

---

## 🎯 Cronograma Acelerado (30 dias)

**Semana 1-2:** Fundação (Sprints 1-4)  
**Semana 3:** Gamificação (Sprints 5-7)  
**Semana 4:** IA Terapêutica (Sprints 8-10)  
**Semana 5:** Colaboração (Sprints 11-13)  
**Semana 6:** Acessibilidade (Sprints 14-15)  
**Semana 7:** Analytics (Sprint 16)  
**Semana 8:** Microlearning e Mobile (Sprints 18-19)  
**Semana 9:** Segurança (Sprint 20)  
**Semana 10:** Lançamento (Sprint 21)

---

## ✅ Status Atual

### Já Implementado:
- ✅ Autenticação básica (email/senha)
- ✅ Sistema de roles (`user_roles`)
- ✅ Tabelas de jogos (`cognitive_games`, `game_sessions`, `game_metrics`)
- ✅ Tabelas de triagem (`screenings`)
- ✅ Sistema de conquistas (`achievements`, `user_achievements`)
- ✅ Sistema cooperativo (`cooperative_sessions`)
- ✅ Edge function cognitive-analysis (estrutura)
- ✅ Dashboard clínico (estrutura básica)
- ✅ Traduções multilíngues (pt, en, es)
- ✅ Design responsivo mobile-first

### Próximo Passo Recomendado:
**Sprint 1: Completar Onboarding Clínico com Wizard de 4 Etapas**
