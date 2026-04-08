import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLabSamplesWithDetails, createLabLog } from "@/hooks/useLaboratory";
import { Printer, Search, Tag, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

const labelModels = [
  { id: "padrao", name: "Padrão", size: "50×25mm" },
  { id: "reduzida", name: "Reduzida", size: "40×15mm" },
  { id: "tubo", name: "Por Tubo", size: "45×10mm" },
];

export default function LabLabels() {
  const { data: samples, isLoading } = useLabSamplesWithDetails();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [showPrint, setShowPrint] = useState<any>(null);
  const [labelModel, setLabelModel] = useState("padrao");
  const [copies, setCopies] = useState(1);

  const filtered = samples?.filter((s: any) => {
    const q = search.toLowerCase();
    return s.barcode?.toLowerCase().includes(q) || s.patients?.full_name?.toLowerCase().includes(q);
  }) ?? [];

  const handlePrint = (sample: any) => {
    setShowPrint(sample);
    setLabelModel("padrao");
    setCopies(1);
  };

  const doPrint = () => {
    if (!showPrint) return;
    createLabLog("lab_samples", showPrint.id, "etiqueta_impressa", user?.id, { modelo: labelModel, copias: copies });
    const w = window.open("", "_blank", "width=400,height=300");
    if (!w) return;
    const content = generateLabelHTML(showPrint, labelModel, copies);
    w.document.write(content);
    w.document.close();
    setTimeout(() => w.print(), 200);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Tag className="h-5 w-5" />
          <span className="text-sm">Impressão e gestão de etiquetas de amostras</span>
        </div>
        <div className="flex gap-2">
          {labelModels.map(m => (
            <Badge key={m.id} variant="outline" className="text-xs">{m.name} ({m.size})</Badge>
          ))}
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por barcode, paciente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Barcode</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Tubo</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Coletada</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma amostra encontrada</TableCell></TableRow>
              ) : filtered.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-sm font-medium">{s.barcode}</TableCell>
                  <TableCell>{s.patients?.full_name ?? "—"}</TableCell>
                  <TableCell>{s.lab_materials?.name ?? "—"}</TableCell>
                  <TableCell>{s.lab_tubes?.name ? <Badge variant="outline" className="text-xs">{s.lab_tubes.name}</Badge> : "—"}</TableCell>
                  <TableCell>{(s as any).lab_sectors?.name ?? "—"}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{s.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.collected_at ? format(new Date(s.collected_at), "dd/MM HH:mm") : "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => handlePrint(s)}>
                        <Printer className="h-3.5 w-3.5" />Imprimir
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => handlePrint(s)}>
                        <RefreshCw className="h-3.5 w-3.5" />Reimprimir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Print Dialog */}
      <Dialog open={!!showPrint} onOpenChange={() => setShowPrint(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Imprimir Etiqueta</DialogTitle>
            <DialogDescription>Configure e visualize a etiqueta antes de imprimir</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Modelo</label>
                <Select value={labelModel} onValueChange={setLabelModel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {labelModels.map(m => <SelectItem key={m.id} value={m.id}>{m.name} — {m.size}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Vias</label>
                <Input type="number" min={1} max={5} value={copies} onChange={e => setCopies(parseInt(e.target.value) || 1)} />
              </div>
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-4 bg-white">
              <div className="border-2 border-dashed border-border rounded p-3 space-y-1" style={{ maxWidth: labelModel === "reduzida" ? 280 : 340 }}>
                <div className="flex justify-between items-start">
                  <span className="font-bold text-sm">{showPrint?.patients?.full_name ?? "Paciente"}</span>
                  <Badge variant="outline" className="text-[10px] h-4">{showPrint?.status}</Badge>
                </div>
                <div className="font-mono text-lg font-bold tracking-wider text-center py-1 border-y border-border">
                  {showPrint?.barcode ?? "SMP-0000-000000"}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                  <span>Mat: {showPrint?.lab_materials?.name ?? "—"}</span>
                  <span>Tubo: {showPrint?.lab_tubes?.name ?? "—"}</span>
                  <span>Setor: {(showPrint as any)?.lab_sectors?.name ?? "—"}</span>
                </div>
                <div className="text-[9px] text-muted-foreground">
                  {showPrint?.collected_at ? format(new Date(showPrint.collected_at), "dd/MM/yyyy HH:mm") : "—"}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrint(null)}>Cancelar</Button>
            <Button onClick={doPrint} className="gap-1"><Printer className="h-4 w-4" />Imprimir ({copies} via{copies > 1 ? "s" : ""})</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function generateLabelHTML(sample: any, model: string, copies: number): string {
  const isSmall = model === "reduzida";
  const labels = Array.from({ length: copies }, () => `
    <div style="border:1px solid #ccc;padding:${isSmall ? "4px 6px" : "6px 8px"};margin-bottom:4px;font-family:Arial,sans-serif;max-width:${isSmall ? "280px" : "340px"}">
      <div style="font-weight:bold;font-size:${isSmall ? "10px" : "12px"}">${sample.patients?.full_name ?? "—"}</div>
      <div style="font-family:monospace;font-size:${isSmall ? "16px" : "20px"};font-weight:bold;text-align:center;padding:4px 0;border-top:1px solid #ddd;border-bottom:1px solid #ddd;margin:3px 0;letter-spacing:2px">${sample.barcode}</div>
      <div style="font-size:9px;color:#666;display:flex;gap:8px">
        <span>Mat: ${sample.lab_materials?.name ?? "—"}</span>
        <span>Tubo: ${sample.lab_tubes?.name ?? "—"}</span>
      </div>
      <div style="font-size:8px;color:#999">${sample.collected_at ? format(new Date(sample.collected_at), "dd/MM/yyyy HH:mm") : "—"}</div>
    </div>
  `).join("");
  return `<!DOCTYPE html><html><head><title>Etiqueta ${sample.barcode}</title><style>@page{size:auto;margin:5mm}body{margin:0;padding:8px}</style></head><body>${labels}</body></html>`;
}
