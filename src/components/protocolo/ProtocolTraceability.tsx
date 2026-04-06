import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDocMovements, useDocProtocols } from "@/hooks/useDocProtocol";
import { Route, Search, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";

const MOVEMENT_LABELS: Record<string, string> = {
  envio: "Envio", recebimento: "Recebimento", devolucao: "Devolução", reenvio: "Reenvio",
  transferencia: "Transferência", cancelamento: "Cancelamento",
};

const MOVEMENT_COLORS: Record<string, string> = {
  envio: "bg-blue-500", recebimento: "bg-emerald-500", devolucao: "bg-destructive", reenvio: "bg-yellow-500",
  transferencia: "bg-purple-500", cancelamento: "bg-muted-foreground",
};

export default function ProtocolTraceability() {
  const [search, setSearch] = useState("");
  const { data: movements, isLoading } = useDocMovements();
  const { data: protocols } = useDocProtocols();

  const protocolMap = new Map((protocols || []).map((p: any) => [p.id, p.protocol_number]));

  const filtered = (movements || []).filter((m: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const pNum = protocolMap.get(m.protocol_id) || "";
    return pNum.toLowerCase().includes(s) ||
      m.sector_origin?.name?.toLowerCase().includes(s) ||
      m.sector_destination?.name?.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por protocolo, setor..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
        <div className="space-y-2">
          {filtered.length === 0 && (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhuma movimentação encontrada</CardContent></Card>
          )}
          {filtered.map((m: any) => (
            <Card key={m.id} className="overflow-hidden">
              <div className="flex items-stretch">
                <div className={`w-1.5 ${MOVEMENT_COLORS[m.movement_type] || "bg-muted-foreground"}`} />
                <CardContent className="flex-1 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {MOVEMENT_LABELS[m.movement_type] || m.movement_type}
                      </Badge>
                      <span className="text-sm font-medium">{protocolMap.get(m.protocol_id) || "—"}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(m.created_at), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: m.sector_origin?.color || "#6b7280" }} />
                      <span>{m.sector_origin?.name || "—"}</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: m.sector_destination?.color || "#6b7280" }} />
                      <span>{m.sector_destination?.name || "—"}</span>
                    </div>
                  </div>
                  {m.notes && <p className="text-xs text-muted-foreground mt-1.5">{m.notes}</p>}
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
