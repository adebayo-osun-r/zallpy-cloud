import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { BillingItem, Invoice } from "@/lib/types";
import { Plus, Trash } from "lucide-react";

interface EditInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSave: (updatedInvoice: Invoice) => void;
}

export function EditInvoiceDialog({ open, onClose, invoice, onSave }: EditInvoiceDialogProps) {
  const [localInvoice, setLocalInvoice] = useState<Invoice | null>(invoice);

  if (!localInvoice) return null;

  const updateItem = (index: number, updated: Partial<BillingItem>) => {
    const updatedItems = [...localInvoice.items];
    updatedItems[index] = { ...updatedItems[index], ...updated };
    setLocalInvoice({
      ...localInvoice,
      items: updatedItems,
      subtotal: updatedItems.reduce((sum, item) => sum + item.amount, 0),
      totalAmount: updatedItems.reduce((sum, item) => sum + item.amount, 0) + localInvoice.taxAmount,
    });
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...localInvoice.items];
    updatedItems.splice(index, 1);
    setLocalInvoice({
      ...localInvoice,
      items: updatedItems,
      subtotal: updatedItems.reduce((sum, item) => sum + item.amount, 0),
      totalAmount: updatedItems.reduce((sum, item) => sum + item.amount, 0) + localInvoice.taxAmount,
    });
  };

  const handleAddItem = () => {
    const newItem: BillingItem = {
      id: `${Math.random()}`, // Temporary unique ID
      reservationId: localInvoice.reservationId,
      guestId: localInvoice.guestId,
      description: "",
      amount: 0,
      category: "Room", // Default category
      date: new Date().toISOString(),
      status: "Pending",
    };
    setLocalInvoice({
      ...localInvoice,
      items: [...localInvoice.items, newItem],
      subtotal: localInvoice.subtotal + newItem.amount,
      totalAmount: localInvoice.totalAmount + newItem.amount,
    });
  };

  const handleSave = () => {
    if (localInvoice) {
      onSave(localInvoice);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Invoice: INV-{localInvoice.id.slice(0, 8)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {localInvoice.items.map((item, index) => (
            <div key={item.id} className="flex gap-2 items-center">
              <Input
                value={item.description}
                onChange={(e) => updateItem(index, { description: e.target.value })}
                className="flex-1"
              />
              <Input
                type="number"
                value={item.amount}
                onChange={(e) => updateItem(index, { amount: parseFloat(e.target.value) })}
                className="w-28"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleRemoveItem(index)}
                className="h-8 w-8"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex justify-between font-medium pt-2 border-t">
            <span>Total</span>
            <span>${localInvoice.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-start pt-4">
            <Button variant="outline" onClick={handleAddItem} className="flex items-center">
              <Plus className="mr-2" />
              Add Item
            </Button>
          </div>
        </div>
        <div className="flex justify-between gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
