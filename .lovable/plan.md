

# Plano: Corrigir Rastreabilidade Pedido → Resultado Externo

## Problema Raiz

Três pedidos marcados como "Resultado Final" não possuem nenhum registro em `lab_external_results`:
- **PED-EXT-008** (0 resultados)
- **PED-EXT-009** (0 resultados)
- **PED-EXT-HOM06** (0 resultados)

Além disso, existem 2 resultados órfãos (Gasometria Arterial) com `order_id = NULL`.

A causa: o botão FHIR foi acionado antes da correção que adicionou `order_id` na inserção de resultados, ou a edge function só insere **1 resultado por ciclo** (usa `body.exams?.[0]`), então pedidos com múltiplos exames ficam sem cobertura.

## Correções

### 1. Migração de dados — vincular órfãos e criar resultados faltantes

Uma migração SQL que:
- Vincula os 2 resultados órfãos aos pedidos corretos (match por `partner_id` e timing)
- Insere resultados simulados para PED-EXT-008, PED-EXT-009 e PED-EXT-HOM06, vinculados corretamente com `order_id`, `partner_id` e `patient_id` do pedido

### 2. Edge Function — suportar múltiplos exames no ciclo completo

Atualmente `simulate_full_cycle` só processa `exams[0]`. Corrigir para iterar sobre **todos** os exames do array, criando um resultado por exame no banco.

### 3. Busca resiliente em LabIntResults

Adicionar fallback na busca: se `order_id` for nulo, buscar também pelo `partner_id` + `external_protocol` parcial para evitar que resultados fiquem invisíveis.

---

## Arquivos Modificados

- **Migração SQL** — seed de resultados faltantes + fix de órfãos
- **`supabase/functions/fhir-sandbox/index.ts`** — loop sobre todos os exames
- **`src/components/laboratorio/LabIntResults.tsx`** — resilência na busca para resultados sem `order_id`

