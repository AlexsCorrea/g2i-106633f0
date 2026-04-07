

# Plano: Evolução do Submódulo Laboratórios de Apoio + Interfaceamento

## Estado Atual

O submódulo já possui uma base funcional:
- **8 tabelas** criadas: `lab_partners` (4 registros), `lab_exam_mappings` (7), `lab_external_orders` (5), `lab_external_results` (3), `lab_integration_queue` (6), `lab_integration_logs` (4), `lab_integration_issues` (4), `lab_equipment` (3)
- **10 componentes** existentes: Dashboard, Parceiros, Mapeamentos, Fila, Pedidos, Resultados, Logs, Pendências, Relatórios, Config
- **Hook** `useLabIntegration.ts` com CRUD genérico e queries com joins
- **Página** `Laboratorio.tsx` com alternância Laboratório/Integrações e tabs

Porém os componentes estão em nível MVP: listagens simples, sem edição inline, sem filtros avançados, sem ações em massa, sem formulários completos de pedido externo, sem gráficos no dashboard e sem relatórios funcionais.

---

## Bloco 1 — Parceiros de Apoio (Evolução)

**Arquivo:** `LabIntPartners.tsx`

- Adicionar edição inline e modal de edição completa (todos os campos: timeout, retries, aceita imagem, aceita parcial, permite recoleta, devolve rejeição)
- Adicionar ativar/inativar com toggle direto na tabela
- Adicionar duplicar cadastro
- Adicionar filtro por status (ativo/inativo) e busca por nome/código
- Adicionar visualização detalhada (expandir linha ou modal)
- Regra: parceiro inativo bloqueado para novos pedidos (validação no Bloco 3)

**Seed:** Adicionar mais 2 parceiros mockados (total 6)

---

## Bloco 2 — Mapeamento de Exames (Evolução)

**Arquivo:** `LabIntMappings.tsx`

- Adicionar formulário de criação com selects de exame interno, parceiro e equipamento
- Adicionar edição
- Adicionar filtros: por parceiro, por exame, por equipamento, por status
- Adicionar busca por código externo
- Adicionar toggle ativar/inativar
- Adicionar indicador de inconsistências (exames sem mapeamento para parceiros ativos)
- Exibir campos LOINC, TUSS, prazo, criticidade

**Seed:** Garantir pelo menos 12 mapeamentos cobrindo hemograma, glicose, ureia, creatinina, PCR, TSH, beta-HCG, urina, cultura, gasometria

---

## Bloco 3 — Pedido Externo + Fila (Evolução)

**Arquivo:** `LabIntOrders.tsx` (reformulação completa)

- Criar formulário completo de novo pedido: selecionar parceiro, buscar exames elegíveis (com mapeamento válido), observação clínica, prioridade, material
- Ações: salvar rascunho, enviar, reenviar, cancelar
- Filtros avançados: parceiro, período, status, paciente, protocolo
- Expandir pedido para ver itens e timeline de status
- Validação: bloquear envio sem mapeamento válido ou parceiro inativo

**Arquivo:** `LabIntQueue.tsx` (evolução)
- Adicionar visualização de payload (modal com JSON formatado)
- Adicionar filtro por período
- Melhorar ações: reprocessar, cancelar, abrir pedido vinculado

**Seed:** Adicionar mais pedidos com cenários variados (total ~10)

---

## Bloco 4 — Resultado Externo + Conferência (Evolução)

**Arquivo:** `LabIntResults.tsx` (reformulação)

- Adicionar agrupamento por pedido/protocolo
- Adicionar visualização de anexos (link simulado)
- Destaque visual mais forte para críticos e alterados
- Fluxo completo: conferir → aceitar/rejeitar → liberar
- Ao aceitar, vincular ao exame interno (preparar campo `linked_result_id`)
- Adicionar painel lateral com detalhes do resultado
- Adicionar filtros: parceiro, status conferência, crítico, período

**Seed:** Adicionar mais resultados (total ~8) com anexos simulados e cenários de parcial/final

---

## Bloco 5 — Equipamentos / Interfaceamento (Evolução)

**Arquivo novo:** `LabIntEquipment.tsx` (substituir reuso de `LabInterface`)

- Cadastro completo: nome, fabricante, modelo, setor, tipo conexão, protocolo, host/porta, formato mensagem, regras parsing
- CRUD completo com edição
- Ativar/inativar
- Vincular mapeamentos por equipamento (já existe na tabela)
- Tela de logs por equipamento (filtro no `LabIntLogs`)
- Resultados simulados vindos de equipamento na fila

**Seed:** Garantir 5 equipamentos: bioquímica (AU680), hematologia (XN-1000), imunologia, gasometria, coagulação. Criar resultados simulados vindos deles.

---

## Bloco 6 — Logs, Pendências, Dashboard e Relatórios (Evolução)

**`LabIntLogs.tsx`:** Adicionar filtro por parceiro/equipamento, visualização de payload em modal, separação visual técnico/funcional

**`LabIntIssues.tsx`:** Adicionar filtro por tipo/severidade, ações de reprocessar/reenviar/justificar, campo de resolução

**`LabIntDashboard.tsx`:** Adicionar gráficos Recharts: volume por parceiro (barras), volume por equipamento (barras), falhas por tipo (pizza), resultados por status (rosca)

**`LabIntReports.tsx`:** Conectar relatórios ao `reportEngine` existente para geração real de dados tabulares com preview e impressão

**Seed adicional:** Mais logs (total ~10), mais pendências (total ~8)

---

## Detalhes Técnicos

### Migração
Nenhuma nova tabela necessária. Possíveis adições de colunas:
- `lab_partners`: adicionar `partner_type text DEFAULT 'apoio'` se não existir
- Verificar se todos os campos do prompt já existem nas tabelas atuais

### Hook `useLabIntegration.ts`
- Adicionar query para exames sem mapeamento por parceiro
- Adicionar query para dashboard com gráficos (agrupamento por parceiro/equipamento)
- Adicionar mutation para duplicar parceiro

### Novos Componentes
- `LabIntEquipment.tsx` — Cadastro completo de equipamentos (substitui reuso de LabInterface)

### Componentes Editados
- `LabIntPartners.tsx` — Edição, filtros, duplicação, detalhes
- `LabIntMappings.tsx` — Formulário criação, filtros, inconsistências
- `LabIntOrders.tsx` — Formulário pedido externo, filtros avançados, timeline
- `LabIntResults.tsx` — Agrupamento, conferência completa, filtros
- `LabIntQueue.tsx` — Visualização payload, filtros período
- `LabIntLogs.tsx` — Filtros parceiro/equip, payload modal
- `LabIntIssues.tsx` — Filtros, ações, resolução
- `LabIntDashboard.tsx` — Gráficos Recharts
- `LabIntReports.tsx` — Relatórios funcionais
- `Laboratorio.tsx` — Atualizar tab equipamentos para novo componente

---

## Ordem de Execução

1. Verificar schema existente e ajustar migração se necessário + seed adicional
2. Bloco 1 — Parceiros (evolução completa)
3. Bloco 2 — Mapeamentos (evolução completa)
4. Bloco 5 — Equipamentos (novo componente)
5. Bloco 3 — Pedidos + Fila (evolução)
6. Bloco 4 — Resultados + Conferência (evolução)
7. Bloco 6 — Dashboard, Logs, Pendências, Relatórios

