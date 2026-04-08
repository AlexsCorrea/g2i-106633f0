

# Plano Consolidado: Resultados Estruturados + Laudos do Apoio Externo + Navegacao

Execucao dos dois planos aprovados em uma unica entrega.

---

## Parte 1 — Migracao SQL

Uma unica migracao cobrindo:

**1.1 Adicionar `result_mode` em `lab_exams`**
```sql
ALTER TABLE lab_exams ADD COLUMN IF NOT EXISTS result_mode text DEFAULT 'simples';
-- valores: simples, estruturado, texto_livre, tabelado
```

**1.2 Criar tabela `lab_exam_components`**
Analitos/parametros por exame, com agrupamento por `group_name` e preparacao para referencia por sexo/idade/metodo:
- `exam_id`, `name`, `code`, `group_name`, `unit`, `sort_order`
- `reference_min/max`, `reference_text`, `critical_min/max`
- `result_type` (numerico/texto/opcao), `options text[]`
- `ref_gender`, `ref_age_min`, `ref_age_max`, `ref_method` (campos futuros)

**1.3 Criar tabela `lab_result_components`**
Valores individuais por analito vinculados a um resultado:
- `result_id`, `component_id`, `value`, `numeric_value`
- `is_abnormal`, `is_critical` (auto-calculados)

**1.4 Seed de componentes**
- Hemograma Completo: 15 componentes em 3 grupos (Eritrograma, Leucograma, Plaquetas)
- Gasometria Arterial: 7 componentes
- Coagulograma: 4 componentes
- EAS/Urinalise: 10 componentes em 2 grupos
- Atualizar `result_mode = 'estruturado'` nesses exames

**1.5 RLS** — politicas basicas para as duas novas tabelas

---

## Parte 2 — Hooks (`useLaboratory.ts`)

Adicionar:
- `useLabExamComponents()` — CRUD generico via `useLabTable`
- `useLabResultComponents()` — CRUD generico via `useLabTable`
- `useExamComponentsByExamId(examId)` — query filtrada por exame
- `useResultComponentsByResultId(resultId)` — query filtrada por resultado

---

## Parte 3 — Navegacao (`Laboratorio.tsx`)

- Usar estado controlado (`value`/`onValueChange`) nos dois `<Tabs>` para forcar Dashboard ao trocar secao
- Adicionar aba "Laudos do Apoio" (`ext-ext-reports`) no array `extTabs` com icone `FileText`
- Import e render do novo `LabExtReports`

---

## Parte 4 — Cadastro de Componentes (`LabSettings.tsx`)

Dentro do formulario de exame:
- Adicionar campo `result_mode` (select: simples/estruturado/texto_livre/tabelado)
- Quando `result_mode === 'estruturado'`, exibir sub-secao para gerenciar componentes/analitos
- CRUD inline de componentes: nome, codigo, grupo, unidade, ref min/max, critico min/max, ordem, tipo
- Agrupamento visual por `group_name`

---

## Parte 5 — Dialog de Resultado Inteligente (`LabResults.tsx`)

O dialog de edicao passa a ter comportamento dinamico:

1. **Simples** (sem componentes): formulario atual com campo unico
2. **Estruturado**: tabela agrupada por `group_name`, cada linha com: nome, valor, unidade, referencia, flag auto-calculada
3. **Texto livre**: textarea expandido
4. **Tabelado**: grid configuravel (fallback para texto livre inicialmente)

**Auto-deteccao de criticos**: ao digitar valor numerico, comparar em tempo real com `critical_min/max` e `reference_min/max`. Flags visuais imediatas (vermelho = critico, amarelo = alterado). Se qualquer componente for critico, marcar resultado pai como `is_critical`.

**Auditoria**: ao salvar, gerar `lab_logs` com `entity_type: 'result_component'`, incluindo `origin: 'manual'`, flag status e valores.

---

## Parte 6 — Reflexo no Laudo (`LabReports.tsx`)

Na visualizacao/impressao do laudo:
- Buscar `lab_result_components` com join em `lab_exam_components`
- Se exame estruturado, renderizar tabela agrupada por `group_name` (parametro | resultado | unidade | referencia | flag)
- Se simples, manter exibicao atual

---

## Parte 7 — Reflexo no Prontuario (`LabResultsForPatient.tsx`)

Ao exibir resultados do paciente:
- Se exame estruturado, mostrar tabela resumida dos componentes com flags visuais
- Se simples, manter card atual

---

## Parte 8 — Laudos do Apoio Externo (`LabExtReports.tsx`)

Novo componente para gerenciar documentos/PDFs retornados por parceiros:
- Listar resultados externos com `attachment_url` ou status `liberado`
- Exibir: pedido interno, parceiro, exame, protocolo, data, anexo/PDF, conferencia
- Botao visualizar/baixar PDF
- Botao liberar laudo externo (marca `released_at`, `released_by`)

---

## Ordem de Execucao

1. Migracao SQL (tabelas + seed)
2. Hooks para novas tabelas
3. Navegacao controlada + aba Laudos do Apoio
4. LabExtReports (novo componente)
5. LabSettings (cadastro de componentes)
6. LabResults (dialog inteligente + auto-critico)
7. LabReports (reflexo no laudo)
8. LabResultsForPatient (reflexo no prontuario)

## Arquivos

| Acao | Arquivo |
|------|---------|
| Migracao | 1 arquivo SQL |
| Criar | `src/components/laboratorio/LabExtReports.tsx` |
| Editar | `src/hooks/useLaboratory.ts` |
| Editar | `src/pages/Laboratorio.tsx` |
| Editar | `src/components/laboratorio/LabSettings.tsx` |
| Editar | `src/components/laboratorio/LabResults.tsx` |
| Editar | `src/components/laboratorio/LabReports.tsx` |
| Editar | `src/components/prontuario/LabResultsForPatient.tsx` |

