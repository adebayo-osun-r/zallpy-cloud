// components/invoice/InvoiceDetailsDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BillingItem, Invoice } from "@/lib/types";

interface Props {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
}

export function InvoiceDetailsDialog({ invoice, open, onClose }: Props) {
  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div><strong>Guest:</strong> {invoice.guestName}</div>
          <div><strong>Issue Date:</strong> {invoice.issueDate}</div>
          <div><strong>Due Date:</strong> {invoice.dueDate}</div>
          <div><strong>Status:</strong> {invoice.status}</div>

          <div className="border-t pt-4">
            <h3 className="text-md font-semibold mb-2">Billing Items</h3>
            <ul className="space-y-1">
              {invoice.items.map((item) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <span>{item.description}</span>
                  <span>${item.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-right font-bold">
              Total: ₦{invoice.totalAmount.toFixed(2)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
