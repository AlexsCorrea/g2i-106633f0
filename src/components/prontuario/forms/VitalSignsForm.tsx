import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateVitalSign } from "@/hooks/useVitalSigns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface VitalSignsFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VitalSignsForm({ patientId, open, onOpenChange }: VitalSignsFormProps) {
  const { profile } = useAuth();
  const createVitalSign = useCreateVitalSign();

  const [formData, setFormData] = useState({
    temperature: "",
    heart_rate: "",
    respiratory_rate: "",
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    oxygen_saturation: "",
    pain_level: "",
    glucose: "",
    weight: "",
    height: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    await createVitalSign.mutateAsync({
      patient_id: patientId,
      recorded_by: profile.id,
      temperature: formData.temperature ? parseFloat(formData.temperature) : null,
      heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : null,
      respiratory_rate: formData.respiratory_rate ? parseInt(formData.respiratory_rate) : null,
      blood_pressure_systolic: formData.blood_pressure_systolic ? parseInt(formData.blood_pressure_systolic) : null,
      blood_pressure_diastolic: formData.blood_pressure_diastolic ? parseInt(formData.blood_pressure_diastolic) : null,
      oxygen_saturation: formData.oxygen_saturation ? parseInt(formData.oxygen_saturation) : null,
      pain_level: formData.pain_level ? parseInt(formData.pain_level) : null,
      glucose: formData.glucose ? parseInt(formData.glucose) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      height: formData.height ? parseFloat(formData.height) : null,
      notes: formData.notes || null,
      recorded_at: new Date().toISOString(),
    });

    setFormData({
      temperature: "",
      heart_rate: "",
      respiratory_rate: "",
      blood_pressure_systolic: "",
      blood_pressure_diastolic: "",
      oxygen_saturation: "",
      pain_level: "",
      glucose: "",
      weight: "",
      height: "",
      notes: "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Sinais Vitais</DialogTitle>
          <DialogDescription className="sr-only">Formulário</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperatura (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="36.5"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heart_rate">Freq. Cardíaca (bpm)</Label>
              <Input
                id="heart_rate"
                type="number"
                placeholder="80"
                value={formData.heart_rate}
                onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="respiratory_rate">Freq. Respiratória (rpm)</Label>
              <Input
                id="respiratory_rate"
                type="number"
                placeholder="18"
                value={formData.respiratory_rate}
                onChange={(e) => setFormData({ ...formData, respiratory_rate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Pressão Arterial (mmHg)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="120"
                  value={formData.blood_pressure_systolic}
                  onChange={(e) => setFormData({ ...formData, blood_pressure_systolic: e.target.value })}
                />
                <span className="flex items-center text-muted-foreground">/</span>
                <Input
                  type="number"
                  placeholder="80"
                  value={formData.blood_pressure_diastolic}
                  onChange={(e) => setFormData({ ...formData, blood_pressure_diastolic: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="oxygen_saturation">Saturação O₂ (%)</Label>
              <Input
                id="oxygen_saturation"
                type="number"
                placeholder="98"
                value={formData.oxygen_saturation}
                onChange={(e) => setFormData({ ...formData, oxygen_saturation: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="glucose">Glicemia (mg/dL)</Label>
              <Input
                id="glucose"
                type="number"
                placeholder="100"
                value={formData.glucose}
                onChange={(e) => setFormData({ ...formData, glucose: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pain_level">Dor (0-10)</Label>
              <Input
                id="pain_level"
                type="number"
                min="0"
                max="10"
                placeholder="0"
                value={formData.pain_level}
                onChange={(e) => setFormData({ ...formData, pain_level: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="70.5"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="170"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações adicionais..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createVitalSign.isPending}>
              {createVitalSign.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Registrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
