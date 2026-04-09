import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Search, Plus, Trash2, Send, Loader2, Pencil, UserRoundPlus, FolderInput } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BillingAccount, useBillingAccounts } from "@/hooks/useBilling";
import { Attendance, useAttendances } from "@/hooks/useAttendances";
import { Patient, usePatients } from "@/hooks/usePatients";
import {
  DocProtocolCreateItemPayload,
  DocProtocolSummary,
  useCreateProtocol,
  useDocReasons,
  useDocSectors,
  useDocTypes,
} from "@/hooks/useDocProtocol";
import { getProtocolSessionMetadata, ITEM_TYPE_LABELS, PRIORITY_LABELS } from "@/lib/docProtocol";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import ProtocolDetail from "./ProtocolDetail";

type SourceTab = "contas" | "atendimentos" | "pacientes" | "manual";

interface SelectedProtocolItem extends DocProtocolCreateItemPayload {
  tempId: string;
  patient_name?: string | null;
  item_reason_name?: string | null;
  document_type_name?: string | null;
  sourceLabel: string;
}

const MOVEMENT_TYPES = [
  { value: "envio", label: "Envio" },
  { value: "remessa", label: "Remessa" },
  { value: "devolucao", label: "Devolução" },
  { value: "reenvio", label: "Reenvio" },
  { value: "protocolo_interno", label: "Protocolo interno" },
  { value: "recebimento_manual", label: "Recebimento manual" },
];

const PRIORITIES = ["normal", "urgente", "alta", "alta_prioridade"];

const EMPTY_MANUAL = {
  item_type: "manual",
  manual_title: "",
  patient_name: "",
  account_number: "",
  insurance_name: "",
  document_reference: "",
  protocol_reference: "",
  competence: "",
  medical_record: "",
  notes: "",
};

function normalize(text?: string | null) {
  return (text || "").toLowerCase();
}

function nextTempId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ProtocolNewSend() {
  const { session } = useAuth();
  const [detailProtocol, setDetailProtocol] = useState<DocProtocolSummary | null>(null);
  const [sourceTab, setSourceTab] = useState<SourceTab>("contas");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterInsurance, setFilterInsurance] = useState("todos");
  const [filterCompetence, setFilterCompetence] = useState("todos");
  const [filterDocType, setFilterDocType] = useState("todos");
  const [editingItem, setEditingItem] = useState<SelectedProtocolItem | null>(null);
  const [manualItem, setManualItem] = useState(EMPTY_MANUAL);
  const [selectedItems, setSelectedItems] = useState<SelectedProtocolItem[]>([]);
  const [form, setForm] = useState({
    protocol_type: "envio",
    sector_origin_id: "",
    sector_destination_id: "",
    reason_id: "",
    priority: "normal",
    external_protocol: "",
    batch_number: "",
    notes: "",
  });

  const isBillingTab = sourceTab === "contas";
  const isAttendanceTab = sourceTab === "atendimentos";
  const isPatientTab = sourceTab === "pacientes";

  const { data: sectors } = useDocSectors();
  const { data: reasons } = useDocReasons();
  const { data: docTypes } = useDocTypes();
  const billingQuery = useBillingAccounts(undefined, { enabled: isBillingTab, staleTime: 120_000 });
  const attendanceQuery = useAttendances(undefined, { enabled: isAttendanceTab, staleTime: 120_000 });
  const patientQuery = usePatients(undefined, { enabled: isPatientTab, staleTime: 120_000 });
  const createProtocol = useCreateProtocol();

  const billingAccounts = useMemo(() => billingQuery.data ?? [], [billingQuery.data]);
  const attendances = useMemo(() => attendanceQuery.data ?? [], [attendanceQuery.data]);
  const patients = useMemo(() => patientQuery.data ?? [], [patientQuery.data]);

  const activeSectors = (sectors || []).filter((sector) => sector.active && sector.participates_flow);
  const activeReasons = (reasons || []).filter((reason) => reason.active);
  const activeDocTypes = (docTypes || []).filter((type) => type.active);
  const insurances = Array.from(new Set(billingAccounts.map((account) => account.insurance_name).filter(Boolean)));
  const competences = Array.from(new Set(billingAccounts.map((account) => account.competence).filter(Boolean)));

  const filteredBilling = useMemo(() => {
    return billingAccounts.filter((account) => {
      if (selectedItems.some((item) => item.billing_account_id === account.id)) return false;
      if (filterInsurance !== "todos" && account.insurance_name !== filterInsurance) return false;
      if (filterCompetence !== "todos" && account.competence !== filterCompetence) return false;
      const text = normalize(searchTerm);
      if (!text) return true;
      return [
        account.patients?.full_name,
        account.insurance_name,
        account.notes,
        account.id,
        account.competence,
      ].some((value) => normalize(value).includes(text));
    });
  }, [billingAccounts, selectedItems, filterInsurance, filterCompetence, searchTerm]);

  const filteredAttendances = useMemo(() => {
    const text = normalize(searchTerm);
    return attendances.filter((attendance) => {
      if (selectedItems.some((item) => item.attendance_id === attendance.id)) return false;
      if (!text) return true;
      return [
        attendance.id,
        attendance.patients?.full_name,
        attendance.insurance_name,
        attendance.sector,
      ].some((value) => normalize(value).includes(text));
    });
  }, [attendances, selectedItems, searchTerm]);

  const filteredPatients = useMemo(() => {
    const text = normalize(searchTerm);
    return patients.filter((patient) => {
      if (selectedItems.some((item) => item.patient_id === patient.id && item.item_type === "patient_document")) return false;
      if (!text) return true;
      return [
        patient.full_name,
        patient.health_insurance,
        patient.health_insurance_number,
        patient.cpf,
      ].some((value) => normalize(value).includes(text));
    });
  }, [patients, selectedItems, searchTerm]);

  const isSourceLoading =
    (isBillingTab && billingQuery.isLoading) ||
    (isAttendanceTab && attendanceQuery.isLoading) ||
    (isPatientTab && patientQuery.isLoading);

  const totalSelected = selectedItems.length;

  const addItem = (item: SelectedProtocolItem) => {
    setSelectedItems((prev) => [...prev, item]);
  };

  const updateSelectedItem = (item: SelectedProtocolItem) => {
    setSelectedItems((prev) => prev.map((current) => current.tempId === item.tempId ? item : current));
    setEditingItem(null);
  };

  const removeSelectedItem = (tempId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  const selectedDocTypeMap = new Map(activeDocTypes.map((type) => [type.id, type.name]));
  const selectedReasonMap = new Map(activeReasons.map((reason) => [reason.id, reason.name]));

  const addBillingItem = (account: BillingAccount) => {
    const typeId = filterDocType !== "todos" ? filterDocType : null;
    addItem({
      tempId: nextTempId(),
      item_type: "billing_account",
      billing_account_id: account.id,
      patient_id: account.patient_id,
      patient_name: account.patients?.full_name || "Sem paciente vinculado",
      insurance_name: account.insurance_name,
      competence: account.competence,
      account_number: account.id,
      notes: account.notes,
      document_type_id: typeId,
      document_type_name: typeId ? selectedDocTypeMap.get(typeId) || null : null,
      snapshot: {
        source: "billing_account",
        patient_name: account.patients?.full_name || null,
        amount: account.amount,
        status: account.status,
      },
      sourceLabel: "Conta do faturamento",
    });
  };

  const addAttendanceItem = (attendance: Attendance) => {
    const typeId = filterDocType !== "todos" ? filterDocType : null;
    addItem({
      tempId: nextTempId(),
      item_type: "attendance",
      attendance_id: attendance.id,
      patient_id: attendance.patient_id,
      patient_name: attendance.patients?.full_name || "Sem paciente",
      insurance_name: attendance.insurance_name,
      attendance_type: attendance.attendance_type,
      attendance_date: attendance.opened_at,
      document_type_id: typeId,
      document_type_name: typeId ? selectedDocTypeMap.get(typeId) || null : null,
      snapshot: {
        source: "attendance",
        patient_name: attendance.patients?.full_name || null,
        sector: attendance.sector,
        status: attendance.status,
      },
      sourceLabel: "Atendimento",
    });
  };

  const addPatientItem = (patient: Patient) => {
    const typeId = filterDocType !== "todos" ? filterDocType : null;
    addItem({
      tempId: nextTempId(),
      item_type: "patient_document",
      patient_id: patient.id,
      patient_name: patient.full_name,
      insurance_name: patient.health_insurance,
      medical_record: patient.id,
      document_type_id: typeId,
      document_type_name: typeId ? selectedDocTypeMap.get(typeId) || null : null,
      manual_title: "Documento / prontuário do paciente",
      snapshot: {
        source: "patient",
        patient_name: patient.full_name,
        cpf: patient.cpf,
      },
      sourceLabel: "Paciente / prontuário",
    });
  };

  const addManualItem = () => {
    if (!manualItem.manual_title.trim()) {
      toast.error("Informe um título para o item manual.");
      return;
    }
    const typeId = filterDocType !== "todos" ? filterDocType : null;
    addItem({
      tempId: nextTempId(),
      item_type: manualItem.item_type,
      manual_title: manualItem.manual_title,
      patient_name: manualItem.patient_name || null,
      account_number: manualItem.account_number || null,
      insurance_name: manualItem.insurance_name || null,
      document_reference: manualItem.document_reference || null,
      protocol_reference: manualItem.protocol_reference || null,
      competence: manualItem.competence || null,
      medical_record: manualItem.medical_record || null,
      notes: manualItem.notes || null,
      document_type_id: typeId,
      document_type_name: typeId ? selectedDocTypeMap.get(typeId) || null : null,
      snapshot: {
        source: "manual",
        patient_name: manualItem.patient_name || null,
      },
      sourceLabel: "Inclusão manual",
    });
    setManualItem(EMPTY_MANUAL);
  };

  const openEdit = (item: SelectedProtocolItem) => {
    setEditingItem({ ...item });
  };

  const fetchProtocolDetail = async (protocolId: string) => {
    const { data, error } = await supabase
      .from("doc_protocols")
      .select(`
        *,
        sector_origin:doc_protocol_sectors!doc_protocols_sector_origin_id_fkey(id, name, color, code),
        sector_destination:doc_protocol_sectors!doc_protocols_sector_destination_id_fkey(id, name, color, code),
        reason:doc_protocol_reasons(id, name, type),
        emitter:profiles!doc_protocols_emitter_id_fkey(full_name),
        receiver:profiles!doc_protocols_receiver_id_fkey(full_name),
        flow_profile:doc_protocol_flow_profiles(id, name, code)
      `)
      .eq("id", protocolId)
      .maybeSingle();
    if (!error && data) {
      setDetailProtocol(data as unknown as DocProtocolSummary);
      return;
    }

    const fallback = await supabase
      .from("doc_protocols")
      .select(`
        *,
        sector_origin:doc_protocol_sectors!doc_protocols_sector_origin_id_fkey(id, name, color, code),
        sector_destination:doc_protocol_sectors!doc_protocols_sector_destination_id_fkey(id, name, color, code),
        reason:doc_protocol_reasons(id, name, type),
        emitter:profiles!doc_protocols_emitter_id_fkey(full_name),
        receiver:profiles!doc_protocols_receiver_id_fkey(full_name)
      `)
      .eq("id", protocolId)
      .maybeSingle();

    if (fallback.data) setDetailProtocol(fallback.data as unknown as DocProtocolSummary);
  };

  const handleSubmit = async () => {
    if (!form.sector_origin_id || !form.sector_destination_id) {
      toast.error("Selecione setor origem e setor destino para continuar.");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Inclua ao menos um item para gerar o protocolo.");
      return;
    }

    const metadata = getProtocolSessionMetadata(session);
    const payload = {
      ...form,
      reason_id: form.reason_id || null,
      external_protocol: form.external_protocol || null,
      batch_number: form.batch_number || null,
      notes: form.notes || null,
      ...metadata,
      items: selectedItems.map((item) => ({
        billing_account_id: item.billing_account_id || null,
        attendance_id: item.attendance_id || null,
        patient_id: item.patient_id || null,
        document_type_id: item.document_type_id || null,
        item_reason_id: item.item_reason_id || null,
        item_type: item.item_type,
        account_number: item.account_number || null,
        medical_record: item.medical_record || null,
        insurance_name: item.insurance_name || null,
        attendance_type: item.attendance_type || null,
        attendance_date: item.attendance_date || null,
        competence: item.competence || null,
        priority: item.priority || form.priority,
        tags: item.tags || null,
        notes: item.notes || null,
        document_reference: item.document_reference || null,
        protocol_reference: item.protocol_reference || null,
        manual_title: item.manual_title || null,
        item_date: item.item_date || null,
        pending_reason: item.pending_reason || null,
        snapshot: {
          ...(item.snapshot || {}),
          patient_name: item.patient_name || null,
          item_reason_name: item.item_reason_name || null,
          document_type_name: item.document_type_name || null,
          source_label: item.sourceLabel,
        },
      })),
    };

    const result = await createProtocol.mutateAsync(payload);
    setSelectedItems([]);
    setForm({
      protocol_type: "envio",
      sector_origin_id: "",
      sector_destination_id: "",
      reason_id: "",
      priority: "normal",
      external_protocol: "",
      batch_number: "",
      notes: "",
    });
    await fetchProtocolDetail(result.protocol_id);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Send className="h-4 w-4" />
              Cabeçalho do protocolo
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Escolha sempre setor origem e setor destino, depois inclua os itens e gere o envio.
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <Label>Tipo de movimento</Label>
            <Select value={form.protocol_type} onValueChange={(value) => setForm((current) => ({ ...current, protocol_type: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MOVEMENT_TYPES.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Setor origem</Label>
            <Select value={form.sector_origin_id} onValueChange={(value) => setForm((current) => ({ ...current, sector_origin_id: value }))}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {activeSectors.map((sector) => (
                  <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Setor destino</Label>
            <Select value={form.sector_destination_id} onValueChange={(value) => setForm((current) => ({ ...current, sector_destination_id: value }))}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {activeSectors.map((sector) => (
                  <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Motivo geral</Label>
            <Select value={form.reason_id || "todos"} onValueChange={(value) => setForm((current) => ({ ...current, reason_id: value === "todos" ? "" : value }))}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Sem motivo geral</SelectItem>
                {activeReasons.map((reason) => (
                  <SelectItem key={reason.id} value={reason.id}>{reason.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Prioridade</Label>
            <Select value={form.priority} onValueChange={(value) => setForm((current) => ({ ...current, priority: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((priority) => <SelectItem key={priority} value={priority}>{PRIORITY_LABELS[priority]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tipo documental base</Label>
            <Select value={filterDocType} onValueChange={setFilterDocType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Sem tipo padrão</SelectItem>
                {activeDocTypes.map((type) => <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Protocolo externo</Label>
            <Input value={form.external_protocol} onChange={(event) => setForm((current) => ({ ...current, external_protocol: event.target.value }))} />
          </div>
          <div>
            <Label>Lote / remessa</Label>
            <Input value={form.batch_number} onChange={(event) => setForm((current) => ({ ...current, batch_number: event.target.value }))} />
          </div>
          <div className="md:col-span-3">
            <Label>Observação geral</Label>
            <Textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows={2} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FolderInput className="h-4 w-4" />
                Itens do protocolo
                <Badge variant="secondary">{totalSelected} item(ns)</Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Após preencher o cabeçalho, pesquise e adicione os itens abaixo.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-[260px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="Buscar paciente, conta, convênio..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
              </div>
              {isBillingTab && (
                <>
                  <Select value={filterInsurance} onValueChange={setFilterInsurance}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Convênio" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos convênios</SelectItem>
                      {insurances.map((insurance) => <SelectItem key={insurance} value={insurance!}>{insurance}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filterCompetence} onValueChange={setFilterCompetence}>
                    <SelectTrigger className="w-[150px]"><SelectValue placeholder="Competência" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      {competences.map((competence) => <SelectItem key={competence} value={competence!}>{competence}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={sourceTab} onValueChange={(value) => setSourceTab(value as SourceTab)}>
            <TabsList className="flex h-auto flex-wrap">
              <TabsTrigger value="contas">Contas</TabsTrigger>
              <TabsTrigger value="atendimentos">Atendimentos</TabsTrigger>
              <TabsTrigger value="pacientes">Pacientes / prontuários</TabsTrigger>
              <TabsTrigger value="manual">Inclusão manual</TabsTrigger>
            </TabsList>

            <TabsContent value="contas" className="mt-4">
              <div className="max-h-[380px] overflow-y-auto rounded-lg border">
                {isSourceLoading && (
                  <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                )}
                {!isSourceLoading && filteredBilling.slice(0, 12).map((account) => (
                  <div key={account.id} className="flex items-center justify-between border-b px-4 py-3 text-left last:border-b-0">
                    <div>
                      <div className="font-medium">{account.patients?.full_name || `Conta ${String(account.id).slice(0, 8)}`}</div>
                      <div className="text-xs text-muted-foreground">
                        Conta {String(account.id).slice(0, 8)} • {account.insurance_name || "—"} • Comp. {account.competence || "—"} • Status {account.status}
                      </div>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => addBillingItem(account)}>
                      <Plus className="h-3.5 w-3.5" />
                      Adicionar
                    </Button>
                  </div>
                ))}
                {!isSourceLoading && filteredBilling.length === 0 && <div className="px-4 py-6 text-sm text-muted-foreground">Nenhuma conta encontrada.</div>}
              </div>
            </TabsContent>

            <TabsContent value="atendimentos" className="mt-4">
              <div className="max-h-[380px] overflow-y-auto rounded-lg border">
                {isSourceLoading && (
                  <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                )}
                {!isSourceLoading && filteredAttendances.slice(0, 12).map((attendance) => (
                  <div key={attendance.id} className="flex items-center justify-between border-b px-4 py-3 text-left last:border-b-0">
                    <div>
                      <div className="font-medium">{attendance.patients?.full_name || `Atendimento ${String(attendance.id).slice(0, 8)}`}</div>
                      <div className="text-xs text-muted-foreground">
                        Atendimento {String(attendance.id).slice(0, 8)} • {attendance.insurance_name || "—"} • {attendance.attendance_type}
                      </div>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => addAttendanceItem(attendance)}>
                      <Plus className="h-3.5 w-3.5" />
                      Adicionar
                    </Button>
                  </div>
                ))}
                {!isSourceLoading && filteredAttendances.length === 0 && <div className="px-4 py-6 text-sm text-muted-foreground">Nenhum atendimento encontrado.</div>}
              </div>
            </TabsContent>

            <TabsContent value="pacientes" className="mt-4">
              <div className="max-h-[380px] overflow-y-auto rounded-lg border">
                {isSourceLoading && (
                  <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                )}
                {!isSourceLoading && filteredPatients.slice(0, 12).map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between border-b px-4 py-3 text-left last:border-b-0">
                    <div>
                      <div className="font-medium">{patient.full_name}</div>
                      <div className="text-xs text-muted-foreground">
                        CPF {patient.cpf || "—"} • Convênio {patient.health_insurance || "—"}
                      </div>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => addPatientItem(patient)}>
                      <Plus className="h-3.5 w-3.5" />
                      Adicionar
                    </Button>
                  </div>
                ))}
                {!isSourceLoading && filteredPatients.length === 0 && <div className="px-4 py-6 text-sm text-muted-foreground">Nenhum paciente encontrado.</div>}
              </div>
            </TabsContent>

            <TabsContent value="manual" className="mt-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <Label>Tipo do item</Label>
                  <Select value={manualItem.item_type} onValueChange={(value) => setManualItem((current) => ({ ...current, item_type: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ITEM_TYPE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label>Título / identificação</Label>
                  <Input value={manualItem.manual_title} onChange={(event) => setManualItem((current) => ({ ...current, manual_title: event.target.value }))} placeholder="Ex.: Prontuário 123 / Ficha de gasto" />
                </div>
                <div>
                  <Label>Paciente</Label>
                  <Input value={manualItem.patient_name} onChange={(event) => setManualItem((current) => ({ ...current, patient_name: event.target.value }))} />
                </div>
                <div>
                  <Label>Conta</Label>
                  <Input value={manualItem.account_number} onChange={(event) => setManualItem((current) => ({ ...current, account_number: event.target.value }))} />
                </div>
                <div>
                  <Label>Convênio</Label>
                  <Input value={manualItem.insurance_name} onChange={(event) => setManualItem((current) => ({ ...current, insurance_name: event.target.value }))} />
                </div>
                <div>
                  <Label>Documento</Label>
                  <Input value={manualItem.document_reference} onChange={(event) => setManualItem((current) => ({ ...current, document_reference: event.target.value }))} />
                </div>
                <div>
                  <Label>Protocolo relacionado</Label>
                  <Input value={manualItem.protocol_reference} onChange={(event) => setManualItem((current) => ({ ...current, protocol_reference: event.target.value }))} />
                </div>
                <div>
                  <Label>Competência</Label>
                  <Input value={manualItem.competence} onChange={(event) => setManualItem((current) => ({ ...current, competence: event.target.value }))} />
                </div>
                <div className="md:col-span-3">
                  <Label>Observação do item</Label>
                  <Textarea value={manualItem.notes} onChange={(event) => setManualItem((current) => ({ ...current, notes: event.target.value }))} rows={2} />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button type="button" onClick={addManualItem} className="gap-1.5">
                  <UserRoundPlus className="h-4 w-4" />
                  Incluir item manual
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Itens selecionados para envio</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[300px] overflow-y-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Convênio</TableHead>
                    <TableHead>Tipo documento</TableHead>
                    <TableHead>Motivo / observação</TableHead>
                    <TableHead className="w-[120px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedItems.map((item) => (
                    <TableRow key={item.tempId}>
                      <TableCell>
                        <div className="font-medium">{item.manual_title || item.account_number || item.document_reference || item.sourceLabel}</div>
                        <div className="text-xs text-muted-foreground">{ITEM_TYPE_LABELS[item.item_type] || item.item_type}</div>
                      </TableCell>
                      <TableCell>{item.patient_name || "—"}</TableCell>
                      <TableCell>{item.insurance_name || "—"}</TableCell>
                      <TableCell>{item.document_type_name || "—"}</TableCell>
                      <TableCell>
                        <div>{item.item_reason_name || "—"}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{item.notes || "—"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeSelectedItem(item.tempId)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {selectedItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        Nenhum item incluído no protocolo.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              {selectedItems.length > 0 ? `${selectedItems.length} item(ns) pronto(s) para envio.` : "Inclua ao menos um item para gerar o protocolo."}
            </div>
            <Button onClick={handleSubmit} disabled={createProtocol.isPending || selectedItems.length === 0} className="gap-2">
              {createProtocol.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Gerar protocolo e enviar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhe do item</DialogTitle>
            <DialogDescription>Defina motivo e observação específicos deste item antes do envio.</DialogDescription>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                <div className="font-medium">{editingItem.manual_title || editingItem.account_number || editingItem.document_reference || editingItem.sourceLabel}</div>
                <div className="text-xs text-muted-foreground">{editingItem.patient_name || "Sem paciente vinculado"}</div>
              </div>
              <div>
                <Label>Tipo de documento</Label>
                <Select value={editingItem.document_type_id || "todos"} onValueChange={(value) => setEditingItem((current) => current ? ({
                  ...current,
                  document_type_id: value === "todos" ? null : value,
                  document_type_name: value === "todos" ? null : selectedDocTypeMap.get(value) || null,
                }) : current)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Sem tipo</SelectItem>
                    {activeDocTypes.map((type) => <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Motivo do item</Label>
                <Select value={editingItem.item_reason_id || "todos"} onValueChange={(value) => setEditingItem((current) => current ? ({
                  ...current,
                  item_reason_id: value === "todos" ? null : value,
                  item_reason_name: value === "todos" ? null : selectedReasonMap.get(value) || null,
                }) : current)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Sem motivo específico</SelectItem>
                    {activeReasons.map((reason) => <SelectItem key={reason.id} value={reason.id}>{reason.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Observação do item</Label>
                <Textarea value={editingItem.notes || ""} onChange={(event) => setEditingItem((current) => current ? ({ ...current, notes: event.target.value }) : current)} rows={3} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingItem(null)}>Cancelar</Button>
                <Button onClick={() => editingItem && updateSelectedItem(editingItem)}>Salvar item</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ProtocolDetail protocol={detailProtocol} open={!!detailProtocol} onClose={() => setDetailProtocol(null)} />
    </div>
  );
}
