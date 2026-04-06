import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useDocReasons, useCreateDocReason, useDeleteDocReason } from "@/hooks/useDocProtocol";
import { Plus, Trash2, Loader2, MessageSquareText } from "lucide-react";

const TYPE_LABELS: Record<string, string> = { envio: "Envio", devolucao: "Devolução", rejeicao: "Rejeição" };
const TYPE_COLORS: Record<string, string> = { envio: "bg-blue-500/10 text-blue-700", devolucao: "bg-destructive/10 text-destructive", rejeicao: "bg-yellow-500/10 text-yellow-700" };

export default function ProtocolReasons() {
  const { data: reasons, isLoading } = useDocReasons();
  const createReason = useCreateDocReason();
  const deleteReason = useDeleteDocReason();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "envio" });

  const handleSave = async () => {
    if (!form.name.trim()) return;
    await createReason.mutateAsync(form);
    setOpen(false);
    setForm({ name: "", type: "envio" });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium flex items-center gap-2"><MessageSquareText className="h-4 w-4" /> Motivos de Envio / Devolução</h3>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Novo Motivo</Button>
      </div>

      <Card><CardContent className="p-0">
        {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Nome</TableHead><TableHead>Tipo</TableHead><TableHead>Ações</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {(reasons || []).map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell><Badge variant="secondary" className={TYPE_COLORS[r.type]}>{TYPE_LABELS[r.type] || r.type}</Badge></TableCell>
                  <TableCell><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteReason.mutate(r.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Motivo</DialogTitle>
            <DialogDescription className="sr-only">Formulário de motivo de envio ou devolução</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="envio">Envio</SelectItem>
                  <SelectItem value="devolucao">Devolução</SelectItem>
                  <SelectItem value="rejeicao">Rejeição</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end"><Button onClick={handleSave}>Salvar</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
