import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLabExternalOrdersWithDetails } from "@/hooks/useLabIntegration";
import { Send } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  rascunho: "bg-gray-100 text-gray-800",
  pronto_para_envio: "bg-blue-100 text-blue-800",
  enviado: "bg-cyan-100 text-cyan-800",
  recebido: "bg-teal-100 text-teal-800",
  resultado_parcial: "bg-amber-100 text-amber-800",
  resultado_final: "bg-green-100 text-green-800",
  falha_envio: "bg-red-100 text-red-800",
  rejeitado: "bg-red-100 text-red-800",
  cancelado: "bg-gray-100 text-gray-800",
  conferido: "bg-emerald-100 text-emerald-800",
  liberado: "bg-emerald-100 text-emerald-800",
};

export default function LabIntOrders() {
  const { data: orders, isLoading } = useLabExternalOrdersWithDetails();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Send className="h-5 w-5" />
        <span className="text-sm">Pedidos enviados a laboratórios de apoio — protocolos externos</span>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Pedido</TableHead>
                <TableHead>Parceiro</TableHead>
                <TableHead>Protocolo Ext.</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status Interno</TableHead>
                <TableHead>Status Externo</TableHead>
                <TableHead>Enviado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !orders?.length ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum pedido externo</TableCell></TableRow>
              ) : orders.map((o: any) => (
                <TableRow key={o.id} className={o.internal_status === "falha_envio" ? "bg-red-50/30" : ""}>
                  <TableCell className="font-mono text-sm">{o.order_number}</TableCell>
                  <TableCell>{o.lab_partners?.name ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{o.external_protocol ?? "—"}</TableCell>
                  <TableCell>{o.material ?? "—"}</TableCell>
                  <TableCell><Badge variant={o.priority === "urgente" ? "destructive" : "secondary"} className="text-xs">{o.priority}</Badge></TableCell>
                  <TableCell><Badge className={`text-xs ${statusColors[o.internal_status] || ""}`}>{o.internal_status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{o.external_status ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{o.sent_at ? format(new Date(o.sent_at), "dd/MM/yy HH:mm") : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
