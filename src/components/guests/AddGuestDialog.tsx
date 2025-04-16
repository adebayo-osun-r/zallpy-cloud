import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Guest } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AddGuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (guest: Guest) => void;
  guestToEdit?: Guest;
}

export function AddGuestDialog({
  open,
  onOpenChange,
  onSave,
  guestToEdit,
}: AddGuestDialogProps) {
  const isEditing = !!guestToEdit;
  const [formData, setFormData] = useState<Omit<Guest, "id" | "created_at" | "updated_at">>({
    firstName: "",
    lastName: "",
    email: "",
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
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (guestToEdit) {
      const {
        id, created_at, updated_at, ...rest
      } = guestToEdit;
      setFormData(rest);
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
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
      });
    }
  }, [guestToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "loyaltyPoints" || name === "totalStays" || name === "totalSpent"
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Validation Error",
        description: "First name, last name, and email are required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        const { error, data } = await supabase
          .from("guests")
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            postal_code: formData.postalCode,
            loyalty_points: formData.loyaltyPoints,
            vip_status: formData.vipStatus,
            notes: formData.notes,
            profile_image: formData.profileImage,
            last_stay: formData.lastStay,
            total_stays: formData.totalStays,
            total_spent: formData.totalSpent,
          })
          .eq("id", guestToEdit?.id)
          .select()
          .single();

        if (error) throw error;
        onSave({
          ...data,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          country: data.country || "",
          postalCode: data.postal_code || "",
          loyaltyPoints: data.loyalty_points || 0,
          vipStatus: (data.vip_status as "Standard" | "Silver" | "Gold" | "Platinum") || "Standard",
          notes: data.notes || "",
          profileImage: data.profile_image || "",
          lastStay: data.last_stay ? data.last_stay : null,  // Ensure it's null if empty
          totalStays: data.total_stays || 0,
          totalSpent: data.total_spent || 0,
          created_at: data.created_at || null,  // Ensure it's null if empty
          updated_at: data.updated_at || null,  // Ensure it's null if empty
        });
      } else {
        const { data, error } = await supabase
          .from("guests")
          .insert({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            postal_code: formData.postalCode,
            loyalty_points: formData.loyaltyPoints,
            vip_status: formData.vipStatus,
            notes: formData.notes,
            profile_image: formData.profileImage,
            last_stay: formData.lastStay || null,
            total_stays: formData.totalStays,
            total_spent: formData.totalSpent,
          })
          .select()
          .single();

        if (error) throw error;

        onSave({
          ...data,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          country: data.country || "",
          postalCode: data.postal_code || "",
          loyaltyPoints: data.loyalty_points || 0,
          vipStatus: (data.vip_status as "Standard" | "Silver" | "Gold" | "Platinum") || "Standard",
          notes: data.notes || "",
          profileImage: data.profile_image || "",
          lastStay: data.last_stay || "",
          totalStays: data.total_stays || 0,
          totalSpent: data.total_spent || 0,
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      }

      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving guest", error);
      toast({
        title: "Error saving guest",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Guest" : "Add New Guest"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input name="firstName" value={formData.firstName} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input name="lastName" value={formData.lastName} onChange={handleChange} />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input name="email" type="email" value={formData.email} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input name="phone" value={formData.phone} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="vipStatus">VIP Status</Label>
            <select
              name="vipStatus"
              value={formData.vipStatus}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="Standard">Standard</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
            </select>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea name="notes" value={formData.notes} onChange={handleChange} />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Update Guest" : "Add Guest"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
