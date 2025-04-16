// components/AddRoomDialog.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Room, RoomStatus, RoomType } from "@/lib/types";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

type AddRoomDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (room: Room) => void;
  initialData?: Room | null;
};

const roomTypeOptions: RoomType[] = ["Standard", "Deluxe", "Suite", "Executive", "Presidential"];

function toSupabaseRoom(room: Room) {
    return {
      id: room.id,
      number: room.number,
      type: room.type,
      status: room.status,
      floor: room.floor,
      base_price: room.basePrice,
      cleaning_status: room.cleaningStatus,
      max_occupancy: room.maxOccupancy,
      amenities: room.amenities,
      images: room.images,
      notes: room.notes,
      created_at: room.created_at,
      updated_at: room.updated_at,
    };
  }
  

export function AddRoomDialog({ open, onOpenChange, onSave, initialData }: AddRoomDialogProps) {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState<Room>({
    id:"",
    number: "",  // Make sure this is not empty
    type: "Standard",
    status: "Available",
    floor: 1,
    basePrice: 100,  // Ensure basePrice is set
    cleaningStatus: "Clean",
    amenities: [],  // Default to empty array if no amenities
    maxOccupancy: 2,
    notes: "",
    images: [],  // Set empty array if no images,
    created_at: new Date().toISOString(), // You might want to generate this
    updated_at: new Date().toISOString(), // Same here
  });
  

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        number: "",
        type: "Standard",
        floor: 1,
        status: "Available",
        basePrice: 100,
        cleaningStatus: "Clean",
        amenities: [],
        maxOccupancy: 2,
        id:"",
        images:[]
      });
    }
  }, [initialData]);

  const handleSubmit = async () => {
    if (isEditing && initialData?.id) {

        console.log("FormId = "+ formData.id);
      const { data, error } = await supabase
        .from("rooms")
        .update(toSupabaseRoom(formData))
        .eq("id", formData.id)
        .select()
        .single();

        if (!error && data) {
            const mappedRoom: Room = {
                id: data.id,
                number: data.number,
                type: data.type as RoomType,
                status: data.status as RoomStatus,
                floor: data.floor,
                amenities: data.amenities,
                basePrice: data.base_price,
                cleaningStatus: data.cleaning_status as "Clean" | "Dirty" | "Inspected",
                maxOccupancy: data.max_occupancy,
                notes: data.notes,
                images: data.images,
              };
          
            onSave(mappedRoom);
            onOpenChange(false);
          }else {
        console.error("Error updating room", error);
      }
    } else {
        const payload = {
            number: formData.number,
            type: formData.type,
            status: formData.status,
            floor: formData.floor,
            base_price: formData.basePrice,
            cleaning_status: formData.cleaningStatus,
            amenities: formData.amenities,
            max_occupancy: formData.maxOccupancy,
            notes: formData.notes,
            images: formData.images,
            created_at: formData.created_at,
            updated_at: new Date().toISOString(),
          };

      const { data, error } = await supabase.from("rooms").insert([payload]).select();

      if (!error && data && data.length > 0) {
        const dbRoom = data[0];
        const room: Room = {
            id: dbRoom.id,
            number: dbRoom.number,
            type: dbRoom.type as RoomType,
            status: dbRoom.status as RoomStatus,
            floor: dbRoom.floor,
            basePrice: dbRoom.base_price,
            cleaningStatus: dbRoom.cleaning_status as "Clean" | "Dirty" | "Inspected",
            maxOccupancy: dbRoom.max_occupancy,
            amenities: dbRoom.amenities || [],
            notes: dbRoom.notes || "",
            images: dbRoom.images || [],
            created_at: dbRoom.created_at || new Date().toISOString(),
            updated_at: dbRoom.updated_at || new Date().toISOString(),
          };
        onSave(room);
        onOpenChange(false);
      } else {
        console.error("Error adding room", error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Room" : "Add New Room"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Room Number</Label>
            <Input
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            />
          </div>
          <div>
            <Label>Room Type</Label>
            <Select
                value={formData.type}
                onValueChange={(value: RoomType) => setFormData({ ...formData, type: value })}
            >
                <SelectTrigger>
                <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                {roomTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                    {type}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>
          <div>
            <Label>Floor</Label>
            <Input
              type="number"
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <Label>Base Price</Label>
            <Input
              type="number"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <Label>Max Occupancy</Label>
            <Input
              type="number"
              value={formData.maxOccupancy}
              onChange={(e) => setFormData({ ...formData, maxOccupancy: parseInt(e.target.value) })}
            />
          </div>
          {/* You can add a multiselect dropdown for amenities if needed */}
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={handleSubmit}>{isEditing ? "Update" : "Add"} Room</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
