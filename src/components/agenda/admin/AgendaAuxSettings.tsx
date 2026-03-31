import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

interface AgendaAuxSettingsProps {
  title: string;
  description: string;
  mockData: Array<{ id: string; name: string; status: string; detail?: string }>;
}

export default function AgendaAuxSettings({ title, description, mockData }: AgendaAuxSettingsProps) {
  const [search, setSearch] = useState("");
  const [data] = useState(mockData);

  const filtered = data.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Registro
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar..." 
              className="pl-9" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                {data.some(d => d.detail) && <TableHead>Detalhes</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  {item.detail !== undefined && <TableCell className="text-sm text-muted-foreground">{item.detail}</TableCell>}
                  <TableCell>
                    <Badge variant="outline" className={item.status === "Ativo" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : ""}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
