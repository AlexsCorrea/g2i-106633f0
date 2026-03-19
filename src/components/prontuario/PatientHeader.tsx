import { User, Calendar, Phone, MapPin, FileText, BedDouble, Building2, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PatientHeaderProps {
  patient: {
    name: string;
    birthDate: string;
    age: number;
    gender: string;
    cpf: string;
    phone: string;
    address: string;
    bloodType: string;
    recordNumber: string;
    photo?: string;
    status: "internado" | "ambulatorial" | "alta" | "transferido" | "obito";
    room?: string;
    bed?: string;
    healthInsurance?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
  };
}

const statusConfig = {
  internado: { label: "Internado", className: "bg-info/10 text-info border-info/20" },
  ambulatorial: { label: "Ambulatorial", className: "bg-success/10 text-success border-success/20" },
  alta: { label: "Alta Médica", className: "bg-muted text-muted-foreground" },
  transferido: { label: "Transferido", className: "bg-warning/10 text-warning border-warning/20" },
  obito: { label: "Óbito", className: "bg-muted text-muted-foreground border-muted" },
};

export function PatientHeader({ patient }: PatientHeaderProps) {
  const status = statusConfig[patient.status];

  return (
    <div className="medical-card p-6">
      <div className="flex items-start gap-6">
        <Avatar className="h-20 w-20 border-2 border-primary/20">
          <AvatarImage src={patient.photo} alt={patient.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
            {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground truncate">
              {patient.name}
            </h1>
            <Badge variant="outline" className={status.className}>
              {status.label}
            </Badge>
            {patient.room && patient.bed && (
              <Badge variant="secondary" className="gap-1 font-mono">
                <BedDouble className="h-3 w-3" />
                {patient.room} / Leito {patient.bed}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
            <div>
              <p className="data-label">Nascimento</p>
              <p className="data-value flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {patient.birthDate} ({patient.age}a)
              </p>
            </div>
            <div>
              <p className="data-label">Sexo / Tipo Sang.</p>
              <p className="data-value flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                {patient.gender} • <span className="text-destructive font-semibold">{patient.bloodType}</span>
              </p>
            </div>
            <div>
              <p className="data-label">CPF</p>
              <p className="data-value font-mono">{patient.cpf}</p>
            </div>
            <div>
              <p className="data-label">Prontuário</p>
              <p className="data-value flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-mono">{patient.recordNumber}</span>
              </p>
            </div>
            {patient.healthInsurance && (
              <div>
                <p className="data-label">Convênio</p>
                <p className="data-value flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                  {patient.healthInsurance}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 mt-3 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              {patient.phone}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {patient.address}
            </span>
            {patient.emergencyContact && (
              <span className="flex items-center gap-1.5 text-warning">
                <Phone className="h-3.5 w-3.5" />
                Emergência: {patient.emergencyContact} {patient.emergencyPhone ? `(${patient.emergencyPhone})` : ""}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
