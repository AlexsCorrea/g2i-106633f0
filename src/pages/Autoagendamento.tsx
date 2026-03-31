import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, CheckCircle, Heart, ArrowLeft, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useScheduleAgendas } from "@/hooks/useScheduleAgendas";

const steps = ["Agenda", "Data e Horário", "Identificação", "Confirmação"];

export default function Autoagendamento() {
  const { data: agendas } = useScheduleAgendas({ status: "ativa" });
  const [step, setStep] = useState(0);
  const [selectedAgenda, setSelectedAgenda] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [patientData, setPatientData] = useState({ name: "", cpf: "", phone: "", email: "", birth_date: "" });
  const [confirmed, setConfirmed] = useState(false);

  const agenda = agendas?.find(a => a.id === selectedAgenda);

  // Mock available times
  const availableTimes = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00"];

  const canNext = () => {
    switch (step) {
      case 0: return !!selectedAgenda;
      case 1: return !!selectedDate && !!selectedTime;
      case 2: return !!patientData.name && !!patientData.phone;
      default: return true;
    }
  };

  const handleConfirm = () => {
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6 space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Agendamento Confirmado!</h2>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Agenda:</strong> {agenda?.name}</p>
              {selectedDate && <p><strong>Data:</strong> {format(selectedDate, "dd/MM/yyyy (EEEE)", { locale: ptBR })}</p>}
              <p><strong>Horário:</strong> {selectedTime}</p>
              <p><strong>Paciente:</strong> {patientData.name}</p>
            </div>
            <p className="text-xs text-muted-foreground">Você receberá uma confirmação no celular informado.</p>
            <Button onClick={() => { setConfirmed(false); setStep(0); setSelectedAgenda(""); setSelectedDate(undefined); setSelectedTime(""); setPatientData({ name: "", cpf: "", phone: "", email: "", birth_date: "" }); }}>
              Novo Agendamento
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Agendamento Online</h1>
            <p className="text-xs text-muted-foreground">Agende sua consulta de forma rápida e prática</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>{i + 1}</div>
              <span className={cn("text-xs hidden sm:inline", i <= step ? "text-foreground font-medium" : "text-muted-foreground")}>{s}</span>
              {i < steps.length - 1 && <div className={cn("h-px w-8 sm:w-12", i < step ? "bg-primary" : "bg-border")} />}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            {step === 0 && (
              <div className="space-y-4">
                <CardTitle className="text-base">Selecione a Agenda</CardTitle>
                <CardDescription>Escolha a especialidade ou serviço desejado</CardDescription>
                <div className="grid gap-2">
                  {agendas?.map(a => (
                    <button
                      key={a.id}
                      onClick={() => setSelectedAgenda(a.id)}
                      className={cn(
                        "text-left p-4 rounded-lg border-2 transition-all",
                        selectedAgenda === a.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      )}
                    >
                      <p className="font-medium text-sm">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.specialty || a.agenda_type} · {a.default_duration}min</p>
                    </button>
                  ))}
                  {!agendas?.length && <p className="text-sm text-muted-foreground text-center py-8">Nenhuma agenda disponível no momento</p>}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <CardTitle className="text-base">Escolha Data e Horário</CardTitle>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-xs mb-2 block">Data</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      locale={ptBR}
                      disabled={d => d < new Date()}
                      className="rounded-lg border p-3 pointer-events-auto"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-2 block">Horários Disponíveis</Label>
                    {selectedDate ? (
                      <div className="grid grid-cols-3 gap-2">
                        {availableTimes.map(t => (
                          <button
                            key={t}
                            onClick={() => setSelectedTime(t)}
                            className={cn(
                              "px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                              selectedTime === t ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/30"
                            )}
                          >{t}</button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-8 text-center">Selecione uma data primeiro</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <CardTitle className="text-base">Seus Dados</CardTitle>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Nome completo *</Label>
                    <Input value={patientData.name} onChange={e => setPatientData(d => ({ ...d, name: e.target.value }))} placeholder="Seu nome completo" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">CPF</Label>
                      <Input value={patientData.cpf} onChange={e => setPatientData(d => ({ ...d, cpf: e.target.value }))} placeholder="000.000.000-00" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Celular *</Label>
                      <Input value={patientData.phone} onChange={e => setPatientData(d => ({ ...d, phone: e.target.value }))} placeholder="(11) 99999-9999" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">E-mail</Label>
                      <Input type="email" value={patientData.email} onChange={e => setPatientData(d => ({ ...d, email: e.target.value }))} placeholder="email@exemplo.com" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Data de Nascimento</Label>
                      <Input type="date" value={patientData.birth_date} onChange={e => setPatientData(d => ({ ...d, birth_date: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <CardTitle className="text-base">Confirme seu Agendamento</CardTitle>
                <div className="p-4 bg-muted/30 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Agenda:</span><span className="font-medium">{agenda?.name}</span></div>
                  {selectedDate && <div className="flex justify-between"><span className="text-muted-foreground">Data:</span><span className="font-medium">{format(selectedDate, "dd/MM/yyyy (EEEE)", { locale: ptBR })}</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">Horário:</span><span className="font-medium">{selectedTime}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Duração:</span><span className="font-medium">{agenda?.default_duration || 30} min</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Paciente:</span><span className="font-medium">{patientData.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Celular:</span><span className="font-medium">{patientData.phone}</span></div>
                </div>
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex justify-between mt-6 pt-4 border-t">
              <Button variant="outline" disabled={step === 0} onClick={() => setStep(s => s - 1)}>
                <ArrowLeft className="h-4 w-4 mr-1" />Voltar
              </Button>
              {step < 3 ? (
                <Button disabled={!canNext()} onClick={() => setStep(s => s + 1)}>
                  Próximo<ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleConfirm} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <CheckCircle className="h-4 w-4 mr-1" />Confirmar Agendamento
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
