import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  useLabExams, useLabSectors, useLabMaterials, useLabTubes, useLabMethods,
  useLabEquipment, useLabPanels, useLabRejectionReasons,
} from "@/hooks/useLaboratory";
import { Plus, Settings2 } from "lucide-react";

function SimpleTable({ hook, columns, entityName }: { hook: any; columns: { key: string; label: string }[]; entityName: string }) {
  const { list, create, remove } = hook();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    if (!newName.trim()) return;
    create.mutate({ name: newName.trim() } as any, { onSuccess: () => { setShowAdd(false); setNewName(""); } });
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-3.5 w-3.5 mr-1" />Novo</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(c => <TableHead key={c.key}>{c.label}</TableHead>)}
                <TableHead className="w-20">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.isLoading ? (
                <TableRow><TableCell colSpan={columns.length + 1} className="text-center py-6 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !list.data?.length ? (
                <TableRow><TableCell colSpan={columns.length + 1} className="text-center py-6 text-muted-foreground">Nenhum registro</TableCell></TableRow>
              ) : list.data.map((item: any) => (
                <TableRow key={item.id}>
                  {columns.map(c => (
                    <TableCell key={c.key}>
                      {c.key === "active" ? (
                        <Badge variant={item[c.key] ? "default" : "secondary"} className="text-xs">{item[c.key] ? "Ativo" : "Inativo"}</Badge>
                      ) : c.key === "color" ? (
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full border" style={{ backgroundColor: item[c.key] || "#999" }} />
                          <span>{item[c.key] ?? "—"}</span>
                        </div>
                      ) : (
                        String(item[c.key] ?? "—")
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-red-500" onClick={() => remove.mutate(item.id)}>×</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Novo {entityName}</DialogTitle></DialogHeader>
          <div><Label>Nome</Label><Input value={newName} onChange={e => setNewName(e.target.value)} /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancelar</Button>
            <Button onClick={handleAdd}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LabSettings() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Settings2 className="h-5 w-5" />
        <span className="text-sm">Cadastros e parametrizações do laboratório</span>
      </div>

      <Tabs defaultValue="exams">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="exams">Exames</TabsTrigger>
          <TabsTrigger value="sectors">Setores</TabsTrigger>
          <TabsTrigger value="materials">Materiais</TabsTrigger>
          <TabsTrigger value="tubes">Tubos</TabsTrigger>
          <TabsTrigger value="methods">Métodos</TabsTrigger>
          <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
          <TabsTrigger value="panels">Painéis</TabsTrigger>
          <TabsTrigger value="rejection">Motivos Recusa</TabsTrigger>
        </TabsList>

        <TabsContent value="exams">
          <SimpleTable
            hook={useLabExams}
            columns={[
              { key: "code", label: "Código" }, { key: "name", label: "Nome" },
              { key: "unit", label: "Unidade" }, { key: "criticality", label: "Criticidade" },
              { key: "active", label: "Status" },
            ]}
            entityName="Exame"
          />
        </TabsContent>
        <TabsContent value="sectors">
          <SimpleTable hook={useLabSectors} columns={[{ key: "code", label: "Código" }, { key: "name", label: "Nome" }, { key: "active", label: "Status" }]} entityName="Setor" />
        </TabsContent>
        <TabsContent value="materials">
          <SimpleTable hook={useLabMaterials} columns={[{ key: "code", label: "Código" }, { key: "name", label: "Nome" }, { key: "active", label: "Status" }]} entityName="Material" />
        </TabsContent>
        <TabsContent value="tubes">
          <SimpleTable hook={useLabTubes} columns={[{ key: "name", label: "Nome" }, { key: "color", label: "Cor" }, { key: "volume_ml", label: "Volume (mL)" }, { key: "active", label: "Status" }]} entityName="Tubo" />
        </TabsContent>
        <TabsContent value="methods">
          <SimpleTable hook={useLabMethods} columns={[{ key: "code", label: "Código" }, { key: "name", label: "Nome" }, { key: "active", label: "Status" }]} entityName="Método" />
        </TabsContent>
        <TabsContent value="equipment">
          <SimpleTable hook={useLabEquipment} columns={[{ key: "name", label: "Nome" }, { key: "model", label: "Modelo" }, { key: "manufacturer", label: "Fabricante" }, { key: "status", label: "Status" }]} entityName="Equipamento" />
        </TabsContent>
        <TabsContent value="panels">
          <SimpleTable hook={useLabPanels} columns={[{ key: "code", label: "Código" }, { key: "name", label: "Nome" }, { key: "active", label: "Status" }]} entityName="Painel" />
        </TabsContent>
        <TabsContent value="rejection">
          <SimpleTable hook={useLabRejectionReasons} columns={[{ key: "name", label: "Motivo" }, { key: "category", label: "Categoria" }]} entityName="Motivo" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
