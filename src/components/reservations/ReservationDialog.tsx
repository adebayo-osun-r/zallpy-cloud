
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Reservation } from "@/lib/types";
import { ReservationForm } from "./ReservationForm";

interface ReservationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reservation?: Reservation;
  title: string;
  description: string;
}

export function ReservationDialog({
  isOpen,
  onClose,
  reservation,
  title,
  description,
}: ReservationDialogProps) {
  const handleSuccess = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Scrollable form section */}
          <div className="max-h-[80vh] overflow-y-auto p-2 space-y-2">
            <ReservationForm
              reservation={reservation}
              onSuccess={handleSuccess}
              onCancel={onClose}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
