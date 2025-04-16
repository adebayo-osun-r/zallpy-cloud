import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo } from "react";
import { BillingItem, Guest, Invoice, InvoiceStatus } from "@/lib/types";
import { Plus, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface ReservationSummary {
    id: string;
    check_in_date: string;
    check_out_date: string;
}

interface NewInvoiceDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (newInvoice: Invoice) => void;
}

export function NewInvoiceDialog({ open, onClose, onSave }: NewInvoiceDialogProps) {

    const [guestList, setGuestList] = useState<Guest[]>([]);
    const [reservationList, setReservationList] = useState<{ id: string; display: string }[]>([]);
    const [selectedGuestId, setSelectedGuestId] = useState<string>("");
    const [issueDate, setIssueDate] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [loadingGuests, setLoadingGuests] = useState(false);
    const [newInvoice, setNewInvoice] = useState<Invoice>({
        id: "", // This will be generated when the invoice is saved
        guestId: "",
        reservationId: "",
        items: [],
        subtotal: 0,
        taxAmount: 0,
        totalAmount: 0,
        issueDate: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        status: "Draft",
        guestName: "",
    });
    const updateItem = (index: number, updated: Partial<BillingItem>) => {
        const updatedItems = [...newInvoice.items];
        updatedItems[index] = { ...updatedItems[index], ...updated };
    
        const subtotal = updatedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        const taxAmount = subtotal * 0.1; // Adjust if needed
        const totalAmount = subtotal + taxAmount;
    
        setNewInvoice({
            ...newInvoice,
            items: updatedItems,
            subtotal,
            taxAmount,
            totalAmount,
        });
    };  
 

    const fetchReservationsForGuest = async (guestId: string) => {
        const { data, error } = await supabase
            .from("reservations")
            .select("id, check_in, check_out")
            .eq("guest_id", guestId);

        if (!error && data) {
            const reservations = data.map((r) => ({
                id: r.id,
                display: `#${r.id.slice(0, 6)}: ${r.check_in} → ${r.check_out}`,
            }));
            setReservationList(reservations);
        }
    };

    useEffect(() => {
        const fetchGuests = async () => {
            setLoadingGuests(true);
            const { data, error } = await supabase
                .from("guests")
                .select("id, first_name, last_name, email, created_at, updated_at");

            if (!error && data) {
                const guests: Guest[] = data.map((g) => ({
                    id: g.id,
                    firstName: g.first_name,
                    lastName: g.last_name,
                    email: g.email,
                    created_at: g.created_at,
                    updated_at: g.updated_at,
                    full_name: g.first_name + " " + g.last_name,
                    // Fill with defaults or optional chaining
                    phone: "",
                    address: "",
                    city: "",
                    state: "",
                    country: "",
                    postalCode: "",
                    loyaltyPoints: 0,
                    vipStatus: "Standard",
                    notes: "",
                    profileImage: "",
                    lastStay: "",
                    totalStays: 0,
                    totalSpent: 0,
                }));
                setGuestList(guests);
            }
            setLoadingGuests(false);
        };
        fetchGuests();
    }, []);


    const subtotal = useMemo(() =>
        newInvoice.items.reduce((sum, item) => sum + (item.amount || 0), 0),
        [newInvoice.items]
    );
    const taxAmount = useMemo(() => subtotal * 0.1, [subtotal]);
    const totalAmount = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount]);

    // Remove an item from the invoice
    const handleRemoveItem = (index: number) => {
        const updatedItems = [...newInvoice.items];
        updatedItems.splice(index, 1);
        setNewInvoice({
            ...newInvoice,
            items: updatedItems,
            subtotal: updatedItems.reduce((sum, item) => sum + item.amount, 0),
            totalAmount: updatedItems.reduce((sum, item) => sum + item.amount, 0) + newInvoice.taxAmount,
        });
    };

    // Add a new item to the invoice
    const handleAddItem = () => {
        const newItem: BillingItem = {
          id: `${Math.random()}`, // Temporary unique ID
          reservationId: newInvoice.reservationId,
          invoiceId: newInvoice.id,
          guestId: newInvoice.guestId,
          description: "",
          amount: 0,
          category: "Room", // Default category
          date: new Date().toISOString(),
          status: "Pending",
        };
      
        setNewInvoice((prevInvoice) => {
          const updatedItems = [...prevInvoice.items, newItem];
          const updatedSubtotal = updatedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
          const updatedTotal = updatedSubtotal + (prevInvoice.taxAmount || 0);
      
          const updatedInvoice = {
            ...prevInvoice,
            items: updatedItems,
            subtotal: updatedSubtotal,
            totalAmount: updatedTotal,
          };
      
          console.log("Updated Invoice:", updatedInvoice); // Now this will log the correct value
          return updatedInvoice;
        });
      };
      

    // Handle saving the new invoice

    const handleSave = async () => {
        if (!selectedGuestId) return alert("Select a guest");
    
        const subtotal = newInvoice.items.reduce((sum, item) => sum + (item.amount || 0), 0);
        const taxAmount = subtotal * 0.1;
        const totalAmount = subtotal + taxAmount;
    
        const invoicePayload = {
            guest_id: selectedGuestId,
            reservation_id: newInvoice.reservationId || null,
            subtotal,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            issue_date: newInvoice.issueDate,
            due_date: newInvoice.dueDate,
            status: "Draft" as InvoiceStatus,
        };
    
        const { data: insertedInvoice, error: invoiceError } = await supabase
            .from("invoices")
            .insert([invoicePayload])
            .select()
            .single();
    
        if (invoiceError) {
            console.error(invoiceError);
            return;
        }
    
        const billingItemsToInsert = newInvoice.items.map(({ description, amount, reservationId }) => ({
            description,
            amount,
            reservation_id: reservationId || null,
            invoice_id: insertedInvoice.id,
            guest_id: selectedGuestId,
        }));
    
        const { error: billingError } = await supabase
            .from("billing_items")
            .insert(billingItemsToInsert);
    
        if (billingError) {
            console.error(billingError);
            return;
        }
    
     /*    onSave({
            id: insertedInvoice.id,
            reservationId: insertedInvoice.reservation_id ?? "",
            guestId: insertedInvoice.guest_id ?? "",
            guestName: "", // Optionally fetch this from guestList
            items: newInvoice.items,
            subtotal: insertedInvoice.subtotal,
            taxAmount: insertedInvoice.tax_amount,
            totalAmount: insertedInvoice.total_amount,
            issueDate: insertedInvoice.issue_date ?? "",
            dueDate: insertedInvoice.due_date ?? "",
            status: insertedInvoice.status as InvoiceStatus,
        }); */
    
        onClose();
    };
    

    // Handle guest selection
    const handleGuestSelection = (guestId: string) => {
        setSelectedGuestId(guestId);
        const selectedGuest = guestList.find((guest) => guest.id === guestId);
        if (selectedGuest) {
            setNewInvoice({
                ...newInvoice,
                guestId: selectedGuest.id,
                guestName: `${selectedGuest.firstName} ${selectedGuest.lastName}`,
            });
            fetchReservationsForGuest(guestId); // Fetch reservations when a guest is selected
        }
    };

    // Handle reservation selection
    const handleReservationSelection = (reservationId: string) => {
        setNewInvoice({
            ...newInvoice,
            reservationId: reservationId,
        });
    };

 

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">




                    <div className="flex gap-2 items-center">
                        <div>
                            {/* Guest Dropdown */}
                            <Label>Guest</Label>
                            <Select
                                value={newInvoice.guestId}
                                onValueChange={handleGuestSelection}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select guest" />
                                </SelectTrigger>
                                <SelectContent>
                                    {guestList.map((guest) => (
                                        <SelectItem key={guest.id} value={guest.id}>
                                            {`${guest.firstName} ${guest.lastName}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Reservation</Label>
                            <Select
                                value={newInvoice.reservationId}
                                onValueChange={(value) => setNewInvoice({ ...newInvoice, reservationId: value })}
                                disabled={!selectedGuestId}  // Disable until a guest is selected
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select reservation" />
                                </SelectTrigger>
                                <SelectContent>
                                    {reservationList.map((r) => (
                                        <SelectItem key={r.id} value={r.id}>
                                            {r.display}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                    </div>
                    <div className="flex gap-2 items-center">

                        <div>
                            <Input
                                type="date"
                                value={newInvoice.issueDate.substring(0, 10)}
                                onChange={(e) => setNewInvoice({ ...newInvoice, issueDate: e.target.value })}
                                className="w-28"
                            />
                        </div>

                        <div>
                        <Input
                            type="date"
                            value={newInvoice.dueDate.substring(0, 10)}
                            onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                            className="w-28"
                        />

                        </div>


                    
                    </div>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                        {newInvoice.items.map((item, index) => (
                            <div key={item.id} className="flex gap-2 items-center">
                                <Input
                                    value={item.description}
                                    onChange={(e) => updateItem(index, { description: e.target.value })}
                                    className="flex-1"
                                    placeholder="Item Description"
                                />
                                <Input
                                    type="number"
                                    value={item.amount}
                                    onChange={(e) => updateItem(index, { amount: parseFloat(e.target.value) })}
                                    className="w-28"
                                    placeholder="Amount"
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
                            <span>₦{newInvoice.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-start pt-4">
                            <Button variant="outline" onClick={handleAddItem} className="flex items-center">
                                <Plus className="mr-2" />
                                Add Item
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save Invoice</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
