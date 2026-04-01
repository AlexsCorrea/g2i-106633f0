import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, GripVertical } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
  data: {
    patientName: string;
    sourceAgenda: string;
    targetAgenda: string;
    sourceTime: string;
    targetTime: string;
    isTransfer: boolean;
  } | null;
}

export default function DragConfirmDialog({ open, onOpenChange, onConfirm, data, loading }: Props) {
  if (!data) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm z-[120]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <GripVertical className="h-4 w-4 text-primary" />
            {data.isTransfer ? "Transferir Agendamento" : "Remarcar Agendamento"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {data.isTransfer
              ? "O agendamento será transferido para outra agenda."
              : "O horário do agendamento será alterado."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm font-medium">{data.patientName}</p>
          <div className="flex items-center gap-3 text-xs">
            <div className="text-center flex-1">
              <p className="text-muted-foreground mb-1">Origem</p>
              <Badge variant="outline" className="text-[10px]">{data.sourceAgenda}</Badge>
              <p className="font-mono font-semibold mt-1 text-base">{data.sourceTime}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-primary shrink-0" />
            <div className="text-center flex-1">
              <p className="text-muted-foreground mb-1">Destino</p>
              <Badge variant="outline" className="text-[10px]">{data.targetAgenda}</Badge>
              <p className="font-mono font-semibold mt-1 text-base">{data.targetTime}</p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Esta ação será registrada no histórico do agendamento.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
          <Button size="sm" onClick={onConfirm} disabled={loading}>
            {loading ? "Salvando..." : "Confirmar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
