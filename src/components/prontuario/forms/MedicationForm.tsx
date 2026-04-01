import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateMedication } from "@/hooks/useMedications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface MedicationFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const routes = [
  "Via Oral",
  "Intramuscular",
  "Intravenoso",
  "Subcutâneo",
  "Sublingual",
  "Tópico",
  "Inalatório",
  "Retal",
  "Transdérmico",
];

export function MedicationForm({ patientId, open, onOpenChange }: MedicationFormProps) {
  const { profile } = useAuth();
  const createMedication = useCreateMedication();

  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "",
    route: "Via Oral",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    instructions: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !formData.name || !formData.dosage || !formData.frequency) return;

    await createMedication.mutateAsync({
      patient_id: patientId,
      prescribed_by: profile.id,
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency,
      route: formData.route,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      status: "ativo",
      instructions: formData.instructions || null,
    });

    setFormData({
      name: "",
      dosage: "",
      frequency: "",
      route: "Via Oral",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
      instructions: "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Prescrição</DialogTitle>
          <DialogDescription className="sr-only">Formulário</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Medicamento *</Label>
            <Input
              id="name"
              placeholder="Nome do medicamento"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosagem *</Label>
              <Input
                id="dosage"
                placeholder="Ex: 500mg"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequência *</Label>
              <Input
                id="frequency"
                placeholder="Ex: 8/8h"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="route">Via de Administração</Label>
            <Select value={formData.route} onValueChange={(value) => setFormData({ ...formData, route: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {routes.map((route) => (
                  <SelectItem key={route} value={route}>
                    {route}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Data Início *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Data Fim</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instruções</Label>
            <Textarea
              id="instructions"
              placeholder="Instruções de uso..."
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMedication.isPending}>
              {createMedication.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Prescrever
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
