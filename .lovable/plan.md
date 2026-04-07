

# Plano: Módulo Completo de Laboratório

## Situação Atual

O sistema possui apenas uma tabela `exam_requests` com campos básicos (exam_type, category, priority, status, result_text) e uma página `Diagnostico.tsx` simples com listagem de laudos. Não existe modelagem laboratorial real (amostras, coleta, triagem, setores técnicos, valores de referência, laudos formais). O menu já tem entrada "Laboratório" em Assistencial > Especializado, mas aponta para a página genérica `Assistencial`.

---

## Arquitetura do Módulo

### Novas Tabelas (migração)

1. **lab_exams** — Cadastro de exames (nome, código, setor técnico, material, método, preparo, valores de referência, criticidade, SLA)
2. **lab_materials** — Materiais biológicos (sangue, urina, fezes, etc.)
3. **lab_tubes** — Recipientes/tubos (tipo, cor, volume)
4. **lab_sectors** — Setores técnicos (hematologia, bioquímica, etc.)
5. **lab_methods** — Métodos analíticos
6. **lab_equipment** — Equipamentos/analisadores
7. **lab_panels** — Perfis/painéis de exame (agrupamento de exames)
8. **lab_panel_items** — Itens de cada painel
9. **lab_requests** — Solicitações de exame (paciente, atendimento, médico, convênio, prioridade, status)
10. **lab_request_items** — Itens da solicitação (exame, material, tubo, setor, status individual, SLA)
11. **lab_collections** — Coletas (coletor, data/hora, local, intercorrência)
12. **lab_samples** — Amostras (código, barcode, material, tubo, volume, condição, status, setor atual)
13. **lab_sample_triage** — Triagem/recebimento (aceite, recusa, motivo, responsável)
14. **lab_results** — Resultados (valor, unidade, referência, método, equipamento, crítico, status)
15. **lab_reports** — Laudos (número, paciente, data emissão, liberação, responsável, versão, status)
16. **lab_report_items** — Itens do laudo (vínculo resultado)
17. **lab_rejection_reasons** — Motivos de recusa/recoleta
18. **lab_reference_values** — Valores de referência por sexo/faixa etária
19. **lab_pending_issues** — Pendências (tipo, prioridade, SLA, status)
20. **lab_logs** — Auditoria completa (entidade, ação, usuário, antes/depois)

Todas com RLS para `authenticated`.

### Novos Arquivos

**Página principal:**
- `src/pages/Laboratorio.tsx` — Página com tabs para todos os submenus

**Componentes (src/components/laboratorio/):**
- `LabDashboard.tsx` — Dashboard com cards e gráficos (Recharts)
- `LabRequests.tsx` — Solicitações com filtros avançados e criação
- `LabCollection.tsx` — Fila de coletas, registro, etiquetas
- `LabTriage.tsx` — Recebimento e triagem de amostras (aceite/recusa)
- `LabSamples.tsx` — Gestão de amostras e rastreabilidade
- `LabProcessing.tsx` — Fila por setor, status por item
- `LabResults.tsx` — Digitação/conferência, destaque de críticos, histórico
- `LabReports.tsx` — Emissão de laudos, impressão PDF, retificação
- `LabInterface.tsx` — Fila de interfaceamento, logs, mapeamento
- `LabPending.tsx` — Central de pendências com filtros e SLA
- `LabModuleReports.tsx` — Relatórios operacionais (17 tipos)
- `LabSettings.tsx` — Cadastros: exames, materiais, tubos, setores, métodos, equipamentos, painéis, motivos de recusa, valores de referência

**Hook:**
- `src/hooks/useLaboratory.ts` — Queries e mutations para todas as entidades

### Arquivos Editados

- `src/App.tsx` — Nova rota `/laboratorio`
- `src/components/layout/TopNav.tsx` — Atualizar link do Laboratório para `/laboratorio`

---

## Ordem de Execução

1. **Migração SQL** — Criar todas as tabelas com RLS + seed de dados de teste (~50 solicitações, coletas, amostras, resultados, laudos, pendências, exames cadastrados como hemograma, glicose, ureia, creatinina, TSH, beta-HCG, etc.)
2. **Hook useLaboratory** — Queries para dashboard stats, listagens com filtros, mutations para CRUD
3. **Página + Componentes** — Dashboard, Solicitações, Coleta, Triagem, Amostras, Processamento, Resultados, Laudos, Interfaceamento, Pendências, Relatórios, Cadastros
4. **Roteamento + Menu** — Integrar no App.tsx e TopNav

---

## Detalhes Técnicos Relevantes

- **Rastreabilidade:** Toda ação gera registro em `lab_logs` via helper `createLabLog()`
- **Valores de referência:** Tabela separada com sexo, faixa etária mínima/máxima, valor mínimo/máximo, unidade
- **Resultados críticos:** Flag `is_critical` com alerta visual (badge vermelho) e exigência de dupla conferência
- **Laudos:** Numeração automática (LAB-YYYY-XXXX), controle de versão para retificação, layout institucional para impressão
- **Dashboard:** 12 cards operacionais + 4 gráficos (Recharts) — volume por setor, tempo médio por etapa, urgentes x rotina, amostras rejeitadas
- **Dados de teste:** ~15 exames cadastrados, ~10 pacientes com solicitações, amostras em vários estados (coletada, recebida, recusada, processando, concluída), laudos liberados e pendentes
- **Integração prontuário:** Manter compatibilidade com `exam_requests` existente, mas o novo módulo usa suas próprias tabelas `lab_*`

