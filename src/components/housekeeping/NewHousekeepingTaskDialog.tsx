import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Textarea } from "@/components/ui/textarea";
  import { Label } from "@/components/ui/label";
  import { useState, useEffect } from "react";
  import { HousekeepingTypes, HouseKeepingPriorities } from "@/lib/types";
  import { supabase } from "@/integrations/supabase/client";
  import { toast } from "@/hooks/use-toast";
  
  interface Props {
    onTaskCreated: () => void;
  }
  
  export function NewHousekeepingTaskDialog({ onTaskCreated }: Props) {
    const [open, setOpen] = useState(false);
    const [rooms, setRooms] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [form, setForm] = useState({
      roomId: "",
      type: "Regular Cleaning",
      priority: "Medium",
      assignedTo: "",
      notes: "",
      scheduledFor: "",
    });
  
    useEffect(() => {
      async function fetchData() {
        const [{ data: roomsData }, { data: profilesData }] = await Promise.all([
          supabase.from("rooms").select("id, number"),
          supabase.from("profiles").select("id, first_name, last_name"),
        ]);
        console.log(profilesData);
        setRooms(roomsData || []);
        setProfiles(profilesData || []);
      }
      fetchData();
    }, []);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    };
  
    const handleSubmit = async () => {
      const { error } = await supabase.from("housekeeping_tasks").insert({
        room_id: form.roomId,
        type: form.type,
        priority: form.priority,
        assigned_to: form.assignedTo || null,
        notes: form.notes,
        scheduled_for: form.scheduledFor,
        status: "Pending",
      });
  
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Task created successfully" });
        setOpen(false);
        onTaskCreated();
      }
    };
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default" size="sm">
            New Task
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Housekeeping Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Room</Label>
              <select name="roomId" value={form.roomId} onChange={handleChange} className="w-full border rounded px-3 py-2">
                <option value="">Select a room</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    Room {room.number}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Type</Label>
              <select name="type" value={form.type} onChange={handleChange} className="w-full border rounded px-3 py-2">
                {["Regular Cleaning", "Deep Cleaning", "Turndown", "Maintenance", "Special Request"].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Priority</Label>
              <select name="priority" value={form.priority} onChange={handleChange} className="w-full border rounded px-3 py-2">
                {["Low", "Medium", "High", "Urgent"].map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Assign To</Label>
              <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className="w-full border rounded px-3 py-2">
                <option value="">Unassigned</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Schedule</Label>
              <Input name="scheduledFor" type="datetime-local" value={form.scheduledFor} onChange={handleChange} />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea name="notes" value={form.notes} onChange={handleChange} />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleSubmit}>Create Task</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  