import fs from "node:fs";
import { performance } from "node:perf_hooks";
import { createClient } from "@supabase/supabase-js";

function parseEnv(path = ".env") {
  const content = fs.readFileSync(path, "utf8");
  const entries = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const idx = line.indexOf("=");
      const key = line.slice(0, idx).trim();
      const raw = line.slice(idx + 1).trim();
      const value = raw.replace(/^"|"$/g, "");
      return [key, value];
    });
  return Object.fromEntries(entries);
}

function asErrorMessage(error) {
  if (!error) return null;
  return `${error.code || "ERR"}: ${error.message || String(error)}`;
}

function isMissingFeature(error) {
  if (!error?.code) return false;
  return ["PGRST202", "PGRST205", "PGRST200", "42P01", "42703"].includes(error.code);
}

async function timed(label, fn) {
  const t0 = performance.now();
  const result = await fn();
  const ms = Number((performance.now() - t0).toFixed(1));
  return { label, ms, ...result };
}

function inferLegacyItemType(item) {
  if (item.item_type) return item.item_type;
  if (item.billing_account_id) return "billing_account";
  if (item.attendance_id) return "attendance";
  if (item.patient_id) return "patient_document";
  return "manual";
}

async function legacyNextNumber(supabase) {
  const year = new Date().getFullYear();
  const prefix = `PROT-${year}-`;
  const { data, error } = await supabase
    .from("doc_protocols")
    .select("protocol_number")
    .ilike("protocol_number", `${prefix}%`)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) throw error;
  const raw = data?.[0]?.protocol_number || "";
  const match = raw.match(/PROT-\d{4}-(\d+)/);
  const next = (match ? Number(match[1]) : 0) + 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

async function legacyCreateProtocol(supabase, payload, userId) {
  const protocolNumber = await legacyNextNumber(supabase);
  const { data: protocol, error: protocolError } = await supabase
    .from("doc_protocols")
    .insert({
      protocol_number: protocolNumber,
      protocol_date: new Date().toISOString(),
      protocol_type: payload.protocol_type || "envio",
      sector_origin_id: payload.sector_origin_id,
      sector_destination_id: payload.sector_destination_id,
      reason_id: payload.reason_id || null,
      status: "pendente_recebimento",
      priority: payload.priority || "normal",
      total_items: payload.items.length,
      accepted_items: 0,
      returned_items: 0,
      emitter_id: userId,
      external_protocol: payload.external_protocol || null,
      batch_number: payload.batch_number || null,
      notes: payload.notes || null,
    })
    .select("id,protocol_number,status")
    .single();
  if (protocolError) throw protocolError;

  for (const item of payload.items) {
    const { data: inserted, error: itemError } = await supabase
      .from("doc_protocol_items")
      .insert({
        protocol_id: protocol.id,
        billing_account_id: item.billing_account_id || null,
        attendance_id: item.attendance_id || null,
        patient_id: item.patient_id || null,
        document_type_id: item.document_type_id || null,
        account_number: item.account_number || null,
        medical_record: item.medical_record || null,
        insurance_name: item.insurance_name || null,
        attendance_type: item.attendance_type || null,
        attendance_date: item.attendance_date || null,
        competence: item.competence || null,
        current_status: "enviado",
        priority: item.priority || payload.priority || "normal",
        notes: item.notes || null,
      })
      .select("id,current_status")
      .single();
    if (itemError) throw itemError;

    const { error: movementError } = await supabase.from("doc_protocol_movements").insert({
      protocol_id: protocol.id,
      item_id: inserted.id,
      movement_type: "envio",
      sector_origin_id: payload.sector_origin_id,
      sector_destination_id: payload.sector_destination_id,
      reason_id: payload.reason_id || null,
      user_id: userId,
      status: inserted.current_status || "enviado",
      notes: item.notes || payload.notes || null,
    });
    if (movementError) throw movementError;
  }

  await supabase.from("doc_protocol_movements").insert({
    protocol_id: protocol.id,
    movement_type: "envio",
    sector_origin_id: payload.sector_origin_id,
    sector_destination_id: payload.sector_destination_id,
    reason_id: payload.reason_id || null,
    user_id: userId,
    status: "pendente_recebimento",
    notes: payload.notes || null,
  });

  return { protocol_id: protocol.id, protocol_number: protocol.protocol_number, status: protocol.status, legacy: true };
}

async function main() {
  const env = parseEnv(".env");
  const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

  const email = `protocol.validation.${Date.now()}@example.com`;
  const password = "Protocolo#2026";

  const signUp = await supabase.auth.signUp({ email, password });
  if (signUp.error) throw signUp.error;
  const signIn = await supabase.auth.signInWithPassword({ email, password });
  if (signIn.error) throw signIn.error;
  const userId = signIn.data.user.id;

  const seedStamp = new Date().toISOString().slice(0, 10);

  const sectorsSeed = [
    { code: "TST-RCM", name: "TST 218 Recebimento CM", color: "#0ea5e9" },
    { code: "TST-FAT", name: "TST 152 Faturamento PA", color: "#6366f1" },
    { code: "TST-REM", name: "TST 217 Remessa", color: "#f59e0b" },
    { code: "TST-AUD", name: "TST 213 Auditoria Operadora", color: "#ef4444" },
    { code: "TST-PRT", name: "TST 175 Protocolo", color: "#10b981" },
    { code: "TST-SAM", name: "TST 52 SAME", color: "#22c55e" },
  ];
  const docTypesSeed = [
    { code: "TST-PRONT", name: "TST Prontuário", category: "clinico" },
    { code: "TST-CONTA", name: "TST Conta Hospitalar", category: "faturamento" },
    { code: "TST-FICHA", name: "TST Ficha de Gasto", category: "faturamento" },
    { code: "TST-LAUDO", name: "TST Laudo", category: "diagnostico" },
  ];
  const reasonsSeed = [
    { name: "TST Envio para Auditoria", type: "envio" },
    { name: "TST Conferência Documental", type: "envio" },
    { name: "TST Devolução por Divergência", type: "devolucao" },
  ];

  const sectors = [];
  for (let i = 0; i < sectorsSeed.length; i += 1) {
    const seed = sectorsSeed[i];
    const existing = await supabase.from("doc_protocol_sectors").select("id,name,code").eq("code", seed.code).maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data) {
      sectors.push(existing.data);
      continue;
    }
    const created = await supabase.from("doc_protocol_sectors").insert({
      name: seed.name,
      code: seed.code,
      active: true,
      participates_flow: true,
      requires_acceptance: true,
      can_return: true,
      sla_hours: 48,
      color: seed.color,
      display_order: i + 1,
      notes: `Cadastro de teste ${seedStamp}`,
    }).select("id,name,code").single();
    if (created.error) throw created.error;
    sectors.push(created.data);
  }

  const docTypes = [];
  for (let i = 0; i < docTypesSeed.length; i += 1) {
    const seed = docTypesSeed[i];
    const existing = await supabase.from("doc_protocol_document_types").select("id,name,code").eq("code", seed.code).maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data) {
      docTypes.push(existing.data);
      continue;
    }
    const created = await supabase.from("doc_protocol_document_types").insert({
      name: seed.name,
      code: seed.code,
      category: seed.category,
      active: true,
      requires_protocol: true,
      requires_acceptance: true,
      display_order: i + 1,
      notes: `Cadastro de teste ${seedStamp}`,
    }).select("id,name,code").single();
    if (created.error) throw created.error;
    docTypes.push(created.data);
  }

  const reasons = [];
  for (let i = 0; i < reasonsSeed.length; i += 1) {
    const seed = reasonsSeed[i];
    const existing = await supabase.from("doc_protocol_reasons").select("id,name,type").eq("name", seed.name).maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data) {
      reasons.push(existing.data);
      continue;
    }
    const created = await supabase.from("doc_protocol_reasons").insert({
      name: seed.name,
      type: seed.type,
      active: true,
      display_order: i + 1,
      notes: `Cadastro de teste ${seedStamp}`,
    }).select("id,name,type").single();
    if (created.error) throw created.error;
    reasons.push(created.data);
  }

  let flowMode = "missing";
  const flowProfilesCheck = await supabase.from("doc_protocol_flow_profiles").select("id,code").limit(1);
  if (!flowProfilesCheck.error) {
    flowMode = "available";
    const profile = (await supabase.from("doc_protocol_flow_profiles")
      .upsert({ code: "geral", name: "Geral", active: true, is_default: true }, { onConflict: "code" })
      .select("id,code")
      .single());
    if (profile.error) throw profile.error;
    const edges = [
      ["TST-FAT", "TST-REM"],
      ["TST-REM", "TST-PRT"],
      ["TST-REM", "TST-AUD"],
      ["TST-AUD", "TST-PRT"],
      ["TST-PRT", "TST-SAM"],
    ];
    for (const [fromCode, toCode] of edges) {
      const from = sectors.find((s) => s.code === fromCode);
      const to = sectors.find((s) => s.code === toCode);
      if (!from || !to) continue;
      const ruleExists = await supabase
        .from("doc_protocol_flow_rules")
        .select("id")
        .eq("flow_profile_id", profile.data.id)
        .eq("sector_origin_id", from.id)
        .eq("sector_destination_id", to.id)
        .maybeSingle();
      if (ruleExists.error) throw ruleExists.error;
      if (!ruleExists.data) {
        const inserted = await supabase.from("doc_protocol_flow_rules").insert({
          flow_profile_id: profile.data.id,
          sector_origin_id: from.id,
          sector_destination_id: to.id,
          active: true,
          rule_order: 1,
          allows_return: true,
          return_is_restricted: false,
        });
        if (inserted.error) throw inserted.error;
      }
    }
  } else if (!isMissingFeature(flowProfilesCheck.error)) {
    throw flowProfilesCheck.error;
  }

  const patientSeeds = ["Ana Souza", "Bruno Lima", "Carla Mendes", "Diego Alves", "Elisa Ramos"];
  const patientRows = [];
  for (let i = 0; i < patientSeeds.length; i += 1) {
    const inserted = await supabase.from("patients").insert({
      full_name: `${patientSeeds[i]} [TST ${seedStamp}]`,
      birth_date: `199${i}-0${(i % 9) + 1}-15`,
      gender: i % 2 === 0 ? "F" : "M",
      status: "ambulatorial",
      health_insurance: ["Unimed", "Bradesco Saúde", "SulAmérica", "Amil"][i % 4],
      health_insurance_number: `TST-${Date.now()}-${i}`,
    }).select("id,full_name,health_insurance").single();
    if (inserted.error) throw inserted.error;
    patientRows.push(inserted.data);
  }

  const attendanceRows = [];
  for (let i = 0; i < patientRows.length; i += 1) {
    const p = patientRows[i];
    const inserted = await supabase.from("attendances").insert({
      patient_id: p.id,
      attendance_type: i % 2 === 0 ? "ambulatorial" : "internacao",
      insurance_type: "convenio",
      insurance_name: p.health_insurance,
      unit: "Zurich Unidade Centro",
      sector: "Faturamento",
      status: "aberto",
      notes: `Atendimento teste ${seedStamp}`,
    }).select("id,patient_id,insurance_name,attendance_type").single();
    if (inserted.error) throw inserted.error;
    attendanceRows.push(inserted.data);
  }

  const billingRows = [];
  for (let i = 0; i < attendanceRows.length; i += 1) {
    const a = attendanceRows[i];
    const inserted = await supabase.from("billing_accounts").insert({
      attendance_id: a.id,
      patient_id: a.patient_id,
      insurance_name: a.insurance_name,
      competence: `2026-0${(i % 3) + 1}`,
      amount: 350 + i * 170,
      status: ["pendente", "liberado", "conferido"][i % 3],
      notes: `Conta teste protocolo ${seedStamp}`,
    }).select("id,patient_id,insurance_name,competence,status").single();
    if (inserted.error) throw inserted.error;
    billingRows.push(inserted.data);
  }

  const originSector = sectors.find((s) => s.code === "TST-FAT") || sectors[0];
  const destinationSector = sectors.find((s) => s.code === "TST-REM") || sectors[1];

  const protocolPayloadA = {
    protocol_type: "envio",
    sector_origin_id: originSector.id,
    sector_destination_id: destinationSector.id,
    reason_id: reasons[0]?.id || null,
    priority: "normal",
    external_protocol: `EXT-${Date.now()}`,
    batch_number: `LOTE-${new Date().getTime().toString().slice(-6)}`,
    notes: `Protocolo teste parcial ${seedStamp}`,
    items: [
      ...billingRows.slice(0, 3).map((b, idx) => ({
        billing_account_id: b.id,
        patient_id: b.patient_id,
        document_type_id: docTypes[1]?.id || null,
        item_type: "billing_account",
        insurance_name: b.insurance_name,
        competence: b.competence,
        account_number: b.id,
        notes: `Item conta ${idx + 1}`,
      })),
      {
        item_type: "manual",
        manual_title: "Ficha de gasto manual TST",
        document_type_id: docTypes[2]?.id || null,
        notes: "Item manual para validação de fluxo",
      },
      {
        item_type: "patient_document",
        patient_id: patientRows[0].id,
        document_type_id: docTypes[0]?.id || null,
        notes: "Prontuário do paciente",
      },
    ],
  };

  const protocolPayloadB = {
    protocol_type: "envio",
    sector_origin_id: originSector.id,
    sector_destination_id: destinationSector.id,
    reason_id: reasons[1]?.id || null,
    priority: "urgente",
    notes: `Protocolo teste integral ${seedStamp}`,
    items: attendanceRows.slice(0, 3).map((a, idx) => ({
      attendance_id: a.id,
      patient_id: a.patient_id,
      document_type_id: docTypes[0]?.id || null,
      item_type: "attendance",
      insurance_name: a.insurance_name,
      attendance_type: a.attendance_type,
      notes: `Atendimento ${idx + 1}`,
    })),
  };

  const createProtocol = async (payload) => {
    const result = await supabase.rpc("doc_protocol_create", { p_payload: payload });
    if (result.error) {
      if (!isMissingFeature(result.error)) throw result.error;
      return legacyCreateProtocol(supabase, payload, userId);
    }
    return { ...result.data, legacy: false };
  };

  const receivePartial = async (protocolId) => {
    const itemRes = await supabase.from("doc_protocol_items").select("*").eq("protocol_id", protocolId).order("created_at");
    if (itemRes.error) throw itemRes.error;
    const accepted = itemRes.data.slice(0, 3).map((i) => i.id);
    const returned = itemRes.data.slice(3).map((i) => ({
      item_id: i.id,
      return_reason: "Divergência documental em conferência",
      notes: "Retornar para correção",
    }));

    const rpc = await supabase.rpc("doc_protocol_receive_partially", {
      p_protocol_id: protocolId,
      p_accepted_item_ids: accepted,
      p_pending_item_ids: [],
      p_returned_items: returned,
      p_observation: "Recebimento parcial de teste",
      p_session_id: "seed-script",
      p_user_agent: "protocol-validation-script",
    });
    if (!rpc.error) return { mode: "rpc", result: rpc.data };

    if (!isMissingFeature(rpc.error)) throw rpc.error;

    for (const id of accepted) {
      await supabase.from("doc_protocol_items").update({ current_status: "aceito" }).eq("id", id);
    }
    for (const ret of returned) {
      await supabase.from("doc_protocol_items").update({ current_status: "devolvido", notes: ret.return_reason }).eq("id", ret.item_id);
    }
    const { data: items } = await supabase.from("doc_protocol_items").select("current_status").eq("protocol_id", protocolId);
    const acceptedCount = (items || []).filter((i) => i.current_status === "aceito").length;
    const returnedCount = (items || []).filter((i) => i.current_status === "devolvido").length;
    await supabase.from("doc_protocols").update({
      status: "aceito_parcialmente",
      accepted_items: acceptedCount,
      returned_items: returnedCount,
      accepted_at: new Date().toISOString(),
      receiver_id: userId,
    }).eq("id", protocolId);
    return { mode: "legacy", result: { status: "aceito_parcialmente", accepted_items: acceptedCount, returned_items: returnedCount } };
  };

  const receiveIntegral = async (protocolId) => {
    const rpc = await supabase.rpc("doc_protocol_receive", {
      p_protocol_id: protocolId,
      p_observation: "Recebimento integral de teste",
      p_session_id: "seed-script",
      p_user_agent: "protocol-validation-script",
    });
    if (!rpc.error) return { mode: "rpc", result: rpc.data };
    if (!isMissingFeature(rpc.error)) throw rpc.error;

    await supabase.from("doc_protocol_items").update({ current_status: "aceito" }).eq("protocol_id", protocolId);
    const { count } = await supabase.from("doc_protocol_items").select("id", { count: "exact", head: true }).eq("protocol_id", protocolId);
    await supabase.from("doc_protocols").update({
      status: "recebido",
      accepted_items: count || 0,
      returned_items: 0,
      accepted_at: new Date().toISOString(),
      receiver_id: userId,
    }).eq("id", protocolId);
    return { mode: "legacy", result: { status: "recebido", accepted_items: count || 0 } };
  };

  const createA = await timed("create_protocol_partial", async () => ({ value: await createProtocol(protocolPayloadA) }));
  const createB = await timed("create_protocol_integral", async () => ({ value: await createProtocol(protocolPayloadB) }));
  const partialResult = await timed("receive_partial", async () => ({ value: await receivePartial(createA.value.protocol_id) }));
  const integralResult = await timed("receive_integral", async () => ({ value: await receiveIntegral(createB.value.protocol_id) }));

  const validations = [];

  validations.push(await timed("dashboard_stats_query", async () => {
    const q = await supabase.from("doc_protocols").select("id,status,total_items,accepted_items,returned_items,created_at,sector_destination_id");
    return { ok: !q.error, rows: q.data?.length || 0, error: asErrorMessage(q.error) };
  }));

  validations.push(await timed("novo_protocolo_sources", async () => {
    const [sectorsQ, reasonsQ, typesQ, billingQ, attendancesQ, patientsQ] = await Promise.all([
      supabase.from("doc_protocol_sectors").select("id", { count: "exact", head: true }),
      supabase.from("doc_protocol_reasons").select("id", { count: "exact", head: true }),
      supabase.from("doc_protocol_document_types").select("id", { count: "exact", head: true }),
      supabase.from("billing_accounts").select("id", { count: "exact", head: true }),
      supabase.from("attendances").select("id", { count: "exact", head: true }),
      supabase.from("patients").select("id", { count: "exact", head: true }),
    ]);
    const errors = [sectorsQ, reasonsQ, typesQ, billingQ, attendancesQ, patientsQ].map((q) => q.error).filter(Boolean);
    return {
      ok: errors.length === 0,
      counts: {
        sectors: sectorsQ.count || 0,
        reasons: reasonsQ.count || 0,
        types: typesQ.count || 0,
        billing: billingQ.count || 0,
        attendances: attendancesQ.count || 0,
        patients: patientsQ.count || 0,
      },
      error: errors[0] ? asErrorMessage(errors[0]) : null,
    };
  }));

  validations.push(await timed("recebimento_list", async () => {
    const q = await supabase.from("doc_protocols")
      .select("id,status,protocol_number,total_items,accepted_items,returned_items")
      .in("status", ["pendente_recebimento", "enviado", "aceito_parcialmente", "recebido", "devolvido"]);
    return { ok: !q.error, rows: q.data?.length || 0, error: asErrorMessage(q.error) };
  }));

  validations.push(await timed("rastreabilidade_movements", async () => {
    const q = await supabase.from("doc_protocol_movements").select("id,protocol_id,item_id,movement_type,status,created_at").order("created_at", { ascending: false }).limit(50);
    return { ok: !q.error, rows: q.data?.length || 0, error: asErrorMessage(q.error) };
  }));

  validations.push(await timed("protocolos_listagem", async () => {
    const q = await supabase.from("doc_protocols").select("id,protocol_number,status,created_at").order("created_at", { ascending: false }).limit(50);
    return { ok: !q.error, rows: q.data?.length || 0, error: asErrorMessage(q.error) };
  }));

  validations.push(await timed("admin_flow_tables", async () => {
    const profiles = await supabase.from("doc_protocol_flow_profiles").select("id", { count: "exact", head: true });
    const rules = await supabase.from("doc_protocol_flow_rules").select("id", { count: "exact", head: true });
    return {
      ok: !profiles.error && !rules.error,
      counts: {
        flow_profiles: profiles.count || 0,
        flow_rules: rules.count || 0,
      },
      error: asErrorMessage(profiles.error || rules.error),
    };
  }));

  const summary = {
    user: { id: userId, email },
    seed: {
      sectors: sectors.length,
      document_types: docTypes.length,
      reasons: reasons.length,
      patients: patientRows.length,
      attendances: attendanceRows.length,
      billing_accounts: billingRows.length,
      flow_mode: flowMode,
    },
    operations: {
      create_partial: createA,
      create_integral: createB,
      receive_partial: partialResult,
      receive_integral: integralResult,
    },
    validations,
    protocols_created: [createA.value.protocol_number, createB.value.protocol_number],
    protocol_ids: [createA.value.protocol_id, createB.value.protocol_id],
  };

  const outputPath = `./tmp_protocol_validation_${Date.now()}.json`;
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), "utf8");
  console.log(`Validation report saved to ${outputPath}`);
  console.log(JSON.stringify({
    protocols_created: summary.protocols_created,
    flow_mode: flowMode,
    validation_checks: validations.map((v) => ({ label: v.label, ms: v.ms, ok: v.ok ?? null })),
  }, null, 2));
}

main().catch((error) => {
  console.error("Protocol validation failed:");
  console.error(error);
  process.exit(1);
});

