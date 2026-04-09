import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowRight, Loader2, Route, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DocProtocolItem, DocProtocolSummary, useDocMovements, useDocProtocols } from "@/hooks/useDocProtocol";
import { safeLower, PROTOCOL_STATUS_LABELS } from "@/lib/docProtocol";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ProtocolDetail from "./ProtocolDetail";

function fmtDate(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return format(parsed, "dd/MM/yyyy HH:mm");
}

export default function ProtocolTraceability() {
  const [search, setSearch] = useState("");
  const [selectedProtocol, setSelectedProtocol] = useState<DocProtocolSummary | null>(null);
  const { data: protocols, isLoading: protocolsLoading } = useDocProtocols();
  const { data: movements, isLoading: movementsLoading } = useDocMovements();
  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ["doc_protocol_traceability_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doc_protocol_items")
        .select(`
          *,
          patient:patients(id, full_name, cpf),
          document_type:doc_protocol_document_types(id, name, color)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as DocProtocolItem[];
    },
  });

  const itemMap = useMemo(() => {
    const map = new Map<string, DocProtocolItem[]>();
    (items || []).forEach((item) => {
      const current = map.get(item.protocol_id) || [];
      current.push(item);
      map.set(item.protocol_id, current);
    });
    return map;
  }, [items]);

  const movementMap = useMemo(() => {
    const map = new Map<string, typeof movements>();
    (movements || []).forEach((movement) => {
      const protocolId = movement.protocol_id || "";
      const current = map.get(protocolId) || [];
      current.push(movement);
      map.set(protocolId, current);
    });
    return map;
  }, [movements]);

  const filteredProtocols = useMemo(() => {
    const term = safeLower(search);
    return (protocols || []).filter((protocol) => {
      if (!term) return true;
      const protocolItems = itemMap.get(protocol.id) || [];
      const latestMovement = (movementMap.get(protocol.id) || [])[0];
      return [
        protocol.protocol_number,
        protocol.sector_origin?.name,
        protocol.sector_destination?.name,
        protocol.reason?.name,
        protocol.batch_number,
        protocol.external_protocol,
        protocol.emitter?.full_name,
        latestMovement?.performed_profile?.full_name,
        ...protocolItems.flatMap((item) => [
          item.patient?.full_name,
          String(item.snapshot?.patient_name || ""),
          item.insurance_name,
          item.account_number,
          item.document_reference,
          item.protocol_reference,
          item.document_type?.name,
        ]),
      ].some((value) => safeLower(value).includes(term));
    });
  }, [itemMap, movementMap, protocols, search]);

  const loading = protocolsLoading || movementsLoading || itemsLoading;

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar protocolo, paciente, conta, convênio..." value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {filteredProtocols.map((protocol) => {
            const protocolItems = itemMap.get(protocol.id) || [];
            const protocolMovements = movementMap.get(protocol.id) || [];
            return (
              <Card key={protocol.id} className="cursor-pointer transition-colors hover:border-primary/40" onClick={() => setSelectedProtocol(protocol)}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle className="text-base font-semibold">{protocol.protocol_number}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{PROTOCOL_STATUS_LABELS[protocol.status] || protocol.status}</Badge>
                      <span className="text-xs text-muted-foreground">{fmtDate(protocol.last_movement_at || protocol.sent_at || protocol.created_at)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span>{protocol.sector_origin?.name || "—"}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span>{protocol.sector_destination?.name || "—"}</span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Itens do protocolo</div>
                      <div className="space-y-1">
                        {protocolItems.slice(0, 4).map((item) => (
                          <div key={item.id} className="rounded-md border px-3 py-2 text-sm">
                            <div className="font-medium">{String(item.snapshot?.patient_name || item.patient?.full_name || item.manual_title || "—")}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.account_number || item.document_reference || item.protocol_reference || "—"} • {item.document_type?.name || item.item_type}
                            </div>
                          </div>
                        ))}
                        {protocolItems.length === 0 && <div className="text-sm text-muted-foreground">Sem itens vinculados.</div>}
                        {protocolItems.length > 4 && <div className="text-xs text-muted-foreground">+ {protocolItems.length - 4} item(ns)</div>}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Linha do tempo</div>
                      <div className="space-y-2">
                        {protocolMovements.slice(0, 4).map((movement) => (
                          <div key={movement.id} className="border-l-2 border-primary/30 pl-3 text-sm">
                            <div className="font-medium capitalize">{movement.action?.replace(/_/g, " ") || movement.movement_type}</div>
                            <div className="text-xs text-muted-foreground">
                              {movement.performed_profile?.full_name || "Sistema"} • {fmtDate(movement.performed_at || movement.created_at)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {movement.sector_origin?.name || "—"} → {movement.sector_destination?.name || "—"}
                            </div>
                          </div>
                        ))}
                        {protocolMovements.length === 0 && <div className="text-sm text-muted-foreground">Sem movimentações registradas.</div>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredProtocols.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                Nenhum protocolo localizado para os filtros informados.
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <ProtocolDetail protocol={selectedProtocol} open={!!selectedProtocol} onClose={() => setSelectedProtocol(null)} />
    </div>
  );
}
