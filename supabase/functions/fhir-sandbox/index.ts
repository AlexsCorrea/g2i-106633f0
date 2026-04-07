import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Public FHIR sandbox (HAPI FHIR R4)
const FHIR_BASE = "https://hapi.fhir.org/baseR4";

interface FHIRPayload {
  action: "send_order" | "check_results" | "simulate_full_cycle";
  order_id?: string;
  patient_name?: string;
  patient_id?: string;
  exams?: { code: string; name: string }[];
  external_protocol?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: FHIRPayload = await req.json();

    if (body.action === "send_order") {
      // 1. Create FHIR Patient
      const patientResource = {
        resourceType: "Patient",
        name: [{ family: body.patient_name?.split(" ").pop() || "Teste", given: [body.patient_name?.split(" ")[0] || "Paciente"] }],
        identifier: [{ system: "urn:zurich:patient", value: body.patient_id || "unknown" }],
      };

      const patientResp = await fetch(`${FHIR_BASE}/Patient`, {
        method: "POST",
        headers: { "Content-Type": "application/fhir+json" },
        body: JSON.stringify(patientResource),
      });
      const fhirPatient = await patientResp.json();
      const fhirPatientId = fhirPatient.id;

      // 2. Create FHIR ServiceRequest for each exam
      const serviceRequests = [];
      for (const exam of (body.exams || [])) {
        const sr = {
          resourceType: "ServiceRequest",
          status: "active",
          intent: "order",
          category: [{ coding: [{ system: "http://snomed.info/sct", code: "108252007", display: "Laboratory procedure" }] }],
          code: { coding: [{ system: "urn:zurich:lab", code: exam.code, display: exam.name }], text: exam.name },
          subject: { reference: `Patient/${fhirPatientId}` },
          identifier: [{ system: "urn:zurich:order", value: body.order_id || "unknown" }],
          priority: "routine",
          authoredOn: new Date().toISOString(),
        };

        const srResp = await fetch(`${FHIR_BASE}/ServiceRequest`, {
          method: "POST",
          headers: { "Content-Type": "application/fhir+json" },
          body: JSON.stringify(sr),
        });
        const fhirSR = await srResp.json();
        serviceRequests.push({ exam_code: exam.code, exam_name: exam.name, fhir_id: fhirSR.id, status: srResp.status });
      }

      // 3. Log integration
      if (body.order_id) {
        await supabase.from("lab_integration_logs").insert({
          log_level: "info",
          log_type: "tecnico",
          action: "fhir_service_request_sent",
          message: `Enviados ${serviceRequests.length} ServiceRequests ao FHIR sandbox (Patient/${fhirPatientId})`,
          order_id: body.order_id,
          endpoint: FHIR_BASE,
          http_status: patientResp.status,
        });

        // 4. Update order with external protocol
        await supabase.from("lab_external_orders").update({
          internal_status: "enviado",
          sent_at: new Date().toISOString(),
          external_protocol: `FHIR-${fhirPatientId}`,
        }).eq("id", body.order_id);

        // 5. Add to integration queue
        await supabase.from("lab_integration_queue").insert({
          queue_type: "envio",
          status: "processado",
          payload: JSON.stringify({ fhir_patient_id: fhirPatientId, service_requests: serviceRequests }),
          response_payload: JSON.stringify(fhirPatient),
          partner_id: null,
          order_id: body.order_id,
        });
      }

      return new Response(JSON.stringify({
        success: true,
        fhir_patient_id: fhirPatientId,
        service_requests: serviceRequests,
        message: `Enviados ${serviceRequests.length} exames ao FHIR sandbox`,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (body.action === "check_results") {
      // Search for DiagnosticReports linked to the order
      const searchUrl = `${FHIR_BASE}/DiagnosticReport?identifier=urn:zurich:order|${body.order_id}&_count=20`;
      const searchResp = await fetch(searchUrl, {
        headers: { Accept: "application/fhir+json" },
      });
      const bundle = await searchResp.json();
      const reports = bundle.entry?.map((e: any) => e.resource) || [];

      return new Response(JSON.stringify({
        success: true,
        reports_found: reports.length,
        reports,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (body.action === "simulate_full_cycle") {
      // Full cycle: create patient → ServiceRequest → DiagnosticReport → Observation
      const patientName = body.patient_name || "Paciente Teste FHIR";

      // 1. Patient
      const patientResp = await fetch(`${FHIR_BASE}/Patient`, {
        method: "POST",
        headers: { "Content-Type": "application/fhir+json" },
        body: JSON.stringify({
          resourceType: "Patient",
          name: [{ family: patientName.split(" ").pop(), given: [patientName.split(" ")[0]] }],
          identifier: [{ system: "urn:zurich:patient", value: body.patient_id || "sim-patient" }],
        }),
      });
      const fhirPatient = await patientResp.json();

      // 2-4. Loop over ALL exams
      const exams = body.exams?.length ? body.exams : [{ code: "HMG", name: "Hemograma Completo" }];
      const allFhirIds: { exam: string; sr: string; obs: string; dr: string }[] = [];

      for (const exam of exams) {
        // ServiceRequest
        const srResp = await fetch(`${FHIR_BASE}/ServiceRequest`, {
          method: "POST",
          headers: { "Content-Type": "application/fhir+json" },
          body: JSON.stringify({
            resourceType: "ServiceRequest",
            status: "completed",
            intent: "order",
            code: { coding: [{ system: "urn:zurich:lab", code: exam.code, display: exam.name }], text: exam.name },
            subject: { reference: `Patient/${fhirPatient.id}` },
            identifier: [{ system: "urn:zurich:order", value: body.order_id || "sim-order" }],
            authoredOn: new Date().toISOString(),
          }),
        });
        const fhirSR = await srResp.json();

        // Observation
        const obsResp = await fetch(`${FHIR_BASE}/Observation`, {
          method: "POST",
          headers: { "Content-Type": "application/fhir+json" },
          body: JSON.stringify({
            resourceType: "Observation",
            status: "final",
            category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "laboratory" }] }],
            code: { coding: [{ system: "urn:zurich:lab", code: exam.code, display: exam.name }], text: exam.name },
            subject: { reference: `Patient/${fhirPatient.id}` },
            basedOn: [{ reference: `ServiceRequest/${fhirSR.id}` }],
            valueString: "Valores dentro da normalidade",
            effectiveDateTime: new Date().toISOString(),
            referenceRange: [{ text: "Ref: normal" }],
          }),
        });
        const fhirObs = await obsResp.json();

        // DiagnosticReport
        const drResp = await fetch(`${FHIR_BASE}/DiagnosticReport`, {
          method: "POST",
          headers: { "Content-Type": "application/fhir+json" },
          body: JSON.stringify({
            resourceType: "DiagnosticReport",
            status: "final",
            category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/v2-0074", code: "LAB" }] }],
            code: { coding: [{ system: "urn:zurich:lab", code: exam.code, display: exam.name }], text: exam.name },
            subject: { reference: `Patient/${fhirPatient.id}` },
            basedOn: [{ reference: `ServiceRequest/${fhirSR.id}` }],
            result: [{ reference: `Observation/${fhirObs.id}` }],
            effectiveDateTime: new Date().toISOString(),
            issued: new Date().toISOString(),
            identifier: [{ system: "urn:zurich:order", value: body.order_id || "sim-order" }],
            conclusion: "Resultados dentro dos parâmetros de normalidade.",
          }),
        });
        const fhirDR = await drResp.json();

        allFhirIds.push({ exam: exam.name, sr: fhirSR.id, obs: fhirObs.id, dr: fhirDR.id });

        // Insert result for THIS exam
        if (body.order_id) {
          const { data: order } = await supabase.from("lab_external_orders").select("partner_id, patient_id").eq("id", body.order_id).single();
          await supabase.from("lab_external_results").insert({
            order_id: body.order_id,
            partner_id: order?.partner_id || null,
            patient_id: order?.patient_id || null,
            external_protocol: `FHIR-DR-${fhirDR.id}`,
            exam_code: exam.code,
            exam_name: exam.name,
            value: "Valores dentro da normalidade",
            reference_text: "Ref: normal",
            is_critical: false,
            is_abnormal: false,
            conference_status: "pendente",
            raw_payload: JSON.stringify(fhirDR),
            result_type: "texto",
          });
        }
      }

      // Update order status
      if (body.order_id) {
        await supabase.from("lab_external_orders").update({
          internal_status: "resultado_final",
          external_protocol: `FHIR-${fhirPatient.id}`,
        }).eq("id", body.order_id);

        await supabase.from("lab_integration_logs").insert({
          log_level: "info",
          log_type: "tecnico",
          action: "fhir_full_cycle_complete",
          message: `Ciclo FHIR completo: Patient/${fhirPatient.id} — ${allFhirIds.length} exame(s) processados: ${allFhirIds.map(e => `${e.exam}(DR/${e.dr})`).join(", ")}`,
          order_id: body.order_id,
          endpoint: FHIR_BASE,
          http_status: 201,
        });
      }

      return new Response(JSON.stringify({
        success: true,
        message: `Ciclo FHIR completo — ${allFhirIds.length} exame(s) processados`,
        fhir_ids: {
          patient: fhirPatient.id,
          exams: allFhirIds,
        },
        result_imported: !!body.order_id,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Ação inválida. Use: send_order, check_results, simulate_full_cycle" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
