import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, GripVertical } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  data: {
    patientName: string;
    sourceAgenda: string;
    targetAgenda: string;
    sourceTime: string;
    targetTime: string;
    isTransfer: boolean;
  } | null;
}

export default function DragConfirmDialog({ open, onOpenChange, onConfirm, data }: Props) {
  if (!data) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <GripVertical className="h-4 w-4 text-primary" />
            {data.isTransfer ? "Transferir Agendamento" : "Remarcar Agendamento"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm font-medium">{data.patientName}</p>
          <div className="flex items-center gap-3 text-xs">
            <div className="text-center">
              <p className="text-muted-foreground mb-1">Origem</p>
              <Badge variant="outline" className="text-[10px]">{data.sourceAgenda}</Badge>
              <p className="font-mono font-semibold mt-1">{data.sourceTime}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="text-center">
              <p className="text-muted-foreground mb-1">Destino</p>
              <Badge variant="outline" className="text-[10px]">{data.targetAgenda}</Badge>
              <p className="font-mono font-semibold mt-1">{data.targetTime}</p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {data.isTransfer
              ? "O agendamento será transferido para outra agenda. Esta ação será registrada no histórico."
              : "O horário será alterado. Esta ação será registrada no histórico."}
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button size="sm" onClick={onConfirm}>Confirmar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
