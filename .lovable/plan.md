

# Plano: Módulo Financeiro Completo — Zurich 2.0

## Situação Atual
O módulo financeiro possui apenas duas tabelas operacionais (accounts_payable, accounts_receivable) e uma tela simples com duas abas. O pedido exige um módulo ERP financeiro completo com plano de contas, partida dobrada, fornecedores, fluxo de caixa, conciliação, despesas recorrentes, centros de custo e relatórios.

---

## Entrega em 3 Blocos

### Bloco 1 — Schema e Dados Base

**Migração SQL** criando as tabelas de configuração e operação:

| Tabela | Finalidade |
|--------|-----------|
| `fin_chart_of_accounts` | Plano de contas hierárquico (parent_id, tipo: ativo/passivo/receita/despesa/patrimonio, código, nível) |
| `fin_cost_centers` | Centros de custo |
| `fin_cost_center_groups` | Agrupamento de centros de custo |
| `fin_companies` | Empresas |
| `fin_company_groups` | Grupos de empresas |
| `fin_banks` | Bancos / contas correntes / caixas |
| `fin_payment_methods` | Formas de pagamento (dinheiro, pix, cartão, boleto, transferência) |
| `fin_document_types` | Tipos de documento (NF, recibo, boleto, OP) |
| `fin_classifications` | Classificações de receita/despesa |
| `fin_suppliers` | Fornecedores (CNPJ, dados bancários, condições pgto) |
| `fin_customers` | Clientes (vinculado a patients quando aplicável) |
| `fin_journal_entries` | Lançamentos contábeis (partida dobrada) |
| `fin_journal_lines` | Linhas do lançamento (conta, débito, crédito) |
| `fin_cash_movements` | Movimentações de caixa/banco |
| `fin_bank_statements` | Extratos bancários importados |
| `fin_reconciliations` | Conciliações bancárias |
| `fin_recurring_expenses` | Despesas recorrentes |
| `fin_budgets` | Orçamentos por conta/centro de custo |
| `fin_audit_log` | Log de auditoria financeiro |

Alterações nas tabelas existentes:
- `accounts_payable` — adicionar `supplier_id`, `document_type_id`, `classification_id`, `chart_account_id`, `installment_number`, `installment_total`, `discount`, `interest`, `penalty`
- `accounts_receivable` — adicionar `customer_id`, `document_type_id`, `classification_id`, `chart_account_id`, `installment_number`, `installment_total`, `discount`, `interest`, `penalty`

Seed com dados iniciais: plano de contas padrão hospitalar, formas de pagamento, tipos de documento, classificações básicas.

RLS habilitada em todas as tabelas, com políticas para `authenticated`.

### Bloco 2 — Hooks e Lógica

**Arquivo: `src/hooks/useFinancial.ts`** — Refatorar e expandir com:
- `useChartOfAccounts` — CRUD plano de contas
- `useCostCenters` / `useCostCenterGroups`
- `useCompanies` / `useCompanyGroups`
- `useBanks` — contas correntes e caixas
- `usePaymentMethods` / `useDocumentTypes` / `useClassifications`
- `useSuppliers` / `useCustomers`
- `useJournalEntries` — lançamentos em partida dobrada (validar débito = crédito)
- `useCashMovements` — entradas/saídas
- `useRecurringExpenses` — com geração automática de títulos
- `useBudgets` — orçado vs realizado
- `useReconciliation` — conciliação bancária
- Expandir hooks existentes de contas a pagar/receber com campos novos (juros, multa, desconto, parcelas, quitação parcial)

### Bloco 3 — Interface (Financeiro.tsx reescrito)

**Navegação principal por abas laterais** (sidebar interna), substituindo as duas abas atuais:

```text
┌─────────────────────┬──────────────────────────────────┐
│ Dashboard           │                                  │
│ Fluxo de Caixa      │   Conteúdo da aba selecionada    │
│ Fornecedores        │                                  │
│ Clientes            │                                  │
│ Contas a Pagar      │                                  │
│ Contas a Receber    │                                  │
│ Movimentos          │                                  │
│ Resultados          │                                  │
│ Dados Base          │                                  │
└─────────────────────┴──────────────────────────────────┘
```

**Sub-telas:**

1. **Dashboard** — Cards: saldo total, a pagar (30d), a receber (30d), inadimplência, fluxo projetado. Gráficos de receita x despesa (últimos 6 meses).

2. **Fluxo de Caixa** — Visão diária/mensal de entradas e saídas por banco/caixa. Projeção futura baseada em títulos e recorrentes.

3. **Fornecedores** — CRUD completo com CNPJ, dados bancários, condições de pagamento, saldo em aberto.

4. **Clientes** — CRUD, saldos, aging list.

5. **Contas a Pagar** — Lista com filtros (status, vencimento, fornecedor, classificação). Ações: novo, editar, quitar (total/parcial com juros/multa/desconto), anexar comprovante. Sub-aba "Despesas Recorrentes".

6. **Contas a Receber** — Lista com filtros. Ações: novo, editar, quitar, parcelar, gerar boleto/recibo. Sub-aba "Novo C. Receber" com parcelamento.

7. **Movimentos** — Sub-abas: Movimentação Geral, Conciliação Bancária, Abertura/Encerramento de Caixa.

8. **Resultados** — DRE, Balancete, análise por centro de custo. Filtros por período e empresa.

9. **Dados Base** — Accordion/tabs com: Plano de Contas (árvore hierárquica), Bancos, Classificações, Empresas/Grupos, Tipos de Documento, Formas de Pagamento, Centros de Custo.

**Navegação (TopNav.tsx):**
Expandir o grupo "Financeiro" dentro de Gerenciamento com sub-itens diretos para as principais seções.

---

## Detalhes Técnicos

- Partida dobrada: toda inserção em `fin_journal_entries` valida que sum(debito) = sum(credito) nas `fin_journal_lines`
- Quitação parcial: campo `amount_paid` + `remaining_balance` calculados
- Despesas recorrentes: função que gera títulos automaticamente (trigger ou chamada do front)
- Conciliação: importação de CSV de extrato e match automático por valor/data
- Relatórios no padrão Zurich 2.0 (usando reportEngine.ts existente)
- Paginação de 30 registros por página em todas as listagens
- Auditoria: toda operação financeira registra em `fin_audit_log`

## Arquivos Impactados

| Ação | Arquivo |
|------|---------|
| Migração | 1 arquivo SQL grande |
| Reescrever | `src/pages/Financeiro.tsx` |
| Reescrever | `src/hooks/useFinancial.ts` |
| Editar | `src/components/layout/TopNav.tsx` |
| Editar | `src/App.tsx` (rotas) |

## Massa de Testes

Inserir via migration seed:
- 15 fornecedores fictícios
- 10 clientes
- 50 contas a pagar (variados status/vencimentos)
- 40 contas a receber
- 20 movimentações de caixa
- 5 despesas recorrentes
- Plano de contas completo hospitalar (~40 contas)

