

# Plano: Evolução Completa do Módulo Protocolo e Envio de Documentos

## Situação Atual

O módulo possui uma boa base com 7 tabelas, dashboard, envio, recebimento, rastreabilidade e cadastros de apoio. Porém opera de forma estrutural, sem vínculo real com contas do faturamento, sem relatórios/impressão e sem regras operacionais completas. Existem 10 protocolos e 15 movimentações de teste, mas 0 itens vinculados.

---

## Bloco 1 — Integração Real com Contas do Faturamento

**Objetivo:** Vincular protocolos a contas reais (billing_accounts), atendimentos e pacientes.

- Atualizar `ProtocolNewSend.tsx` para buscar contas com filtros avançados: paciente, convênio, competência, lote, tipo de atendimento, status da conta
- Exibir dados completos ao adicionar item: nº atendimento, prontuário, paciente, convênio, valor, competência
- Ao gerar protocolo, gravar `doc_protocol_items` com referências reais (`billing_account_id`, `patient_id`, `attendance_id`)
- Atualizar `ProtocolList.tsx` para exibir detalhes dos itens ao expandir/clicar um protocolo
- Povoar `billing_accounts` com dados de teste realistas (PA, internação, ambulatorial) para validação

---

## Bloco 2 — Protocolo Completo

**Objetivo:** Fortalecer a entidade de protocolo com fluxo operacional real.

- **Numeração automática:** Implementar numeração sequencial com prefixo configurável (ex: PROT-2026-0001) via query `MAX` + incremento
- **Fluxo de aceite:**
  - Aceite total: atualiza status para "recebido", grava movimento e data/hora/usuário
  - Aceite parcial: permite marcar itens individualmente como recebidos ou pendentes, status "recebido_parcial"
  - Devolução parcial: selecionar itens a devolver com motivo obrigatório
  - Reenvio: criar novo movimento a partir de protocolo devolvido
- **Histórico do protocolo:** Painel lateral ou modal mostrando timeline completa de movimentações de um protocolo específico
- **Comprovante de recebimento:** Geração de comprovante com dados do aceite, data, usuário, itens
- Garantir que cada ação gere registro em `doc_protocol_logs`

---

## Bloco 3 — Relatórios e Impressão/PDF Profissional

**Objetivo:** Relatórios operacionais e impressos institucionais.

- Criar página de relatórios do módulo (`ProtocolReports.tsx`) usando o `reportEngine` existente
- Adicionar tab "Relatórios" na página principal
- **Relatórios padrão:**
  1. Protocolo detalhado de envio (impresso com cabeçalho institucional)
  2. Comprovante de recebimento
  3. Rastreabilidade por conta
  4. Rastreabilidade por protocolo
  5. Documentos por setor
  6. Documentos por tipo
  7. Contas em auditoria in loco vs sem auditoria
  8. Protocolos pendentes de aceite
  9. Tempo médio por etapa
  10. Contas devolvidas e motivos
- **Impressão profissional:** Reutilizar `ReportPreview` com cabeçalho (logo, nome instituição), paginação, rodapé, dados do protocolo, layout limpo
- Botão "Imprimir Protocolo" direto na listagem e no detalhe

---

## Bloco 4 — Regras Operacionais e Auditoria

**Objetivo:** Regras de trânsito, SLA, permissões e auditoria completa.

- **Regras de trânsito:** Validar se o setor origem pode enviar para o setor destino (campo `allowed_destinations` no cadastro de setores — migração para adicionar coluna)
- **SLA por setor:** Exibir indicador visual de SLA no dashboard e na listagem (verde/amarelo/vermelho)
- **Flags de auditoria in loco:** Usar campo `requires_in_loco_audit` do tipo de documento para filtrar e categorizar
- **Auditoria completa:** Garantir que todas as ações geram log: criação, edição, envio, recebimento, devolução, reenvio, cancelamento, impressão, exportação, alteração de status
- Criar helper `createProtocolLog()` reutilizável para padronizar logs

---

## Bloco 5 — Dashboard Enriquecido e Dados de Teste

**Objetivo:** Dashboard operacional completo e cenários realistas.

- **Dashboard:** Adicionar gráficos de barras (volume por setor, por convênio, por tipo de documento), funil do fluxo, contas com/sem auditoria in loco, contas fora do SLA, tempo médio por etapa
- **Dados de teste:**
  - Criar ~30 billing_accounts mockadas (PA, internação, ambulatorial, SAME)
  - Criar ~15 protocolos com variação de status (concluído, devolvido, pendente, aceite parcial, em auditoria)
  - Vincular itens reais aos protocolos
  - Criar movimentações completas para rastreabilidade
  - Incluir cenários com/sem auditoria in loco

---

## Ordem de Execução

1. **Bloco 1** — Integração com contas + dados de teste billing
2. **Bloco 2** — Protocolo completo (aceite parcial, devolução, reenvio, histórico)
3. **Bloco 4** — Regras operacionais + auditoria (migração + lógica)
4. **Bloco 3** — Relatórios e impressão PDF
5. **Bloco 5** — Dashboard enriquecido + povoamento final

---

## Detalhes Técnicos

### Migração necessária
- Adicionar `allowed_destinations uuid[]` em `doc_protocol_sectors`
- Adicionar `accepted_items integer DEFAULT 0`, `returned_items integer DEFAULT 0` em `doc_protocols`

### Arquivos a criar
- `src/components/protocolo/ProtocolDetail.tsx` (painel de detalhe/histórico)
- `src/components/protocolo/ProtocolReports.tsx` (relatórios do módulo)
- `src/components/protocolo/ProtocolPrintLayout.tsx` (layout de impressão)

### Arquivos a editar
- `src/components/protocolo/ProtocolNewSend.tsx` (busca avançada, vínculo real)
- `src/components/protocolo/ProtocolReceipt.tsx` (aceite parcial, devolução parcial)
- `src/components/protocolo/ProtocolList.tsx` (expandir detalhes, ações)
- `src/components/protocolo/ProtocolDashboard.tsx` (gráficos adicionais)
- `src/components/protocolo/ProtocolSectors.tsx` (destinos permitidos)
- `src/hooks/useDocProtocol.ts` (novas queries e mutations)
- `src/pages/ProtocoloDocumentos.tsx` (nova tab Relatórios)

