import { useState } from "react";
import { useCreatePatient } from "@/hooks/usePatients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface PatientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (patientId: string) => void;
}

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function PatientForm({ open, onOpenChange, onSuccess }: PatientFormProps) {
  const createPatient = useCreatePatient();

  const [formData, setFormData] = useState({
    full_name: "",
    birth_date: "",
    gender: "M",
    cpf: "",
    rg: "",
    blood_type: "",
    phone: "",
    emergency_contact: "",
    emergency_phone: "",
    address: "",
    health_insurance: "",
    health_insurance_number: "",
    status: "ambulatorial" as "ambulatorial" | "internado" | "alta" | "transferido" | "obito",
    room: "",
    bed: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.birth_date) return;

    const result = await createPatient.mutateAsync({
      ...formData,
      cpf: formData.cpf || null,
      rg: formData.rg || null,
      blood_type: formData.blood_type || null,
      phone: formData.phone || null,
      emergency_contact: formData.emergency_contact || null,
      emergency_phone: formData.emergency_phone || null,
      address: formData.address || null,
      health_insurance: formData.health_insurance || null,
      health_insurance_number: formData.health_insurance_number || null,
      room: formData.room || null,
      bed: formData.bed || null,
      admission_date: formData.status === "internado" ? new Date().toISOString() : null,
      photo_url: null,
    });

    setFormData({
      full_name: "",
      birth_date: "",
      gender: "M",
      cpf: "",
      rg: "",
      blood_type: "",
      phone: "",
      emergency_contact: "",
      emergency_phone: "",
      address: "",
      health_insurance: "",
      health_insurance_number: "",
      status: "ambulatorial",
      room: "",
      bed: "",
    });
    
    onOpenChange(false);
    onSuccess?.(result.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Paciente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Dados Pessoais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  placeholder="Nome completo do paciente"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Data de Nascimento *</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Sexo *</Label>
                <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                    <SelectItem value="O">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rg">RG</Label>
                <Input
                  id="rg"
                  placeholder="Número do RG"
                  value={formData.rg}
                  onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo Sanguíneo</Label>
                <Select value={formData.blood_type} onValueChange={(v) => setFormData({ ...formData, blood_type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Contato de Emergência</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact">Nome</Label>
                <Input
                  id="emergency_contact"
                  placeholder="Nome do contato"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_phone">Telefone</Label>
                <Input
                  id="emergency_phone"
                  placeholder="(00) 00000-0000"
                  value={formData.emergency_phone}
                  onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Convênio e Internação</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="health_insurance">Convênio</Label>
                <Input
                  id="health_insurance"
                  placeholder="Nome do convênio"
                  value={formData.health_insurance}
                  onChange={(e) => setFormData({ ...formData, health_insurance: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="health_insurance_number">Número da Carteirinha</Label>
                <Input
                  id="health_insurance_number"
                  placeholder="Número"
                  value={formData.health_insurance_number}
                  onChange={(e) => setFormData({ ...formData, health_insurance_number: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v: "ambulatorial" | "internado") => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ambulatorial">Ambulatorial</SelectItem>
                    <SelectItem value="internado">Internado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.status === "internado" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="room">Quarto</Label>
                    <Input
                      id="room"
                      placeholder="Ex: 101"
                      value={formData.room}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bed">Leito</Label>
                    <Input
                      id="bed"
                      placeholder="Ex: A"
                      value={formData.bed}
                      onChange={(e) => setFormData({ ...formData, bed: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              placeholder="Endereço completo"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createPatient.isPending}>
              {createPatient.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Cadastrar Paciente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
