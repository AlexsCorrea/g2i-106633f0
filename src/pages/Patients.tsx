import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePatients } from "@/hooks/usePatients";
import { PatientForm } from "@/components/prontuario/forms/PatientForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Plus, Search, User, Loader2 } from "lucide-react";
import { format, differenceInYears, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors = {
  internado: "bg-primary/10 text-primary",
  ambulatorial: "bg-success/10 text-success",
  alta: "bg-muted text-muted-foreground",
  transferido: "bg-warning/10 text-warning",
  obito: "bg-destructive/10 text-destructive",
};

const statusLabels = {
  internado: "Internado",
  ambulatorial: "Ambulatorial",
  alta: "Alta",
  transferido: "Transferido",
  obito: "Óbito",
};

export default function Patients() {
  const navigate = useNavigate();
  const { data: patients, isLoading } = usePatients();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const filteredPatients = patients?.filter(
    (p) =>
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.cpf?.includes(search)
  );

  const calculateAge = (birthDate: string) => {
    return differenceInYears(new Date(), parseISO(birthDate));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground">Gerencie os pacientes cadastrados</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou CPF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="medical-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredPatients?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <User className="h-12 w-12 mb-4 opacity-50" />
            <p>Nenhum paciente encontrado</p>
            <Button variant="link" onClick={() => setShowForm(true)}>
              Cadastrar novo paciente
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Convênio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quarto/Leito</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients?.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/prontuario/${patient.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {patient.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{patient.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(patient.birth_date), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{calculateAge(patient.birth_date)} anos</TableCell>
                  <TableCell className="font-mono text-sm">{patient.cpf || "-"}</TableCell>
                  <TableCell>{patient.health_insurance || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[patient.status]}>
                      {statusLabels[patient.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {patient.room && patient.bed
                      ? `${patient.room} / ${patient.bed}`
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <PatientForm
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={(id) => navigate(`/prontuario/${id}`)}
      />
    </div>
  );
}
