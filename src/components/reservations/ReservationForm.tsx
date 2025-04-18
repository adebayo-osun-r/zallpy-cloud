
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Reservation, ReservationStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Form schema for validation
const reservationSchema = z.object({
  roomId: z.string().min(1, "Room is required"),
  guestId: z.string().min(1, "Guest is required"),
  checkIn: z.date({
    required_error: "Check-in date is required",
  }),
  checkOut: z.date({
    required_error: "Check-out date is required",
  }).refine(date => date > new Date(), {
    message: "Check-out date must be in the future",
  }),
  status: z.enum(["Confirmed", "Checked In", "Checked Out", "Cancelled", "No Show"]),
  adults: z.coerce.number().min(1, "At least 1 adult is required"),
  children: z.coerce.number().min(0, "Cannot be negative"),
  totalAmount: z.coerce.number().min(0, "Amount must be positive"),
  paymentStatus: z.enum(["Pending", "Partial", "Paid", "Refunded"]),
  source: z.enum(["Direct", "Online", "Agent", "Corporate", "Other"]),
  specialRequests: z.string().optional(),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

interface ReservationFormProps {
  reservation?: Reservation;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReservationForm({ reservation, onSuccess, onCancel }: ReservationFormProps) {
  const [rooms, setRooms] = useState<{ id: string; number: string }[]>([]);
  const [guests, setGuests] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const isEditing = !!reservation;

  // Initialize form with default values or existing reservation data
  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: reservation
      ? {
          roomId: reservation.roomId,
          guestId: reservation.guestId,
          checkIn: new Date(reservation.checkIn),
          checkOut: new Date(reservation.checkOut),
          status: reservation.status,
          adults: reservation.adults,
          children: reservation.children,
          totalAmount: reservation.totalAmount,
          paymentStatus: reservation.paymentStatus,
          source: reservation.source,
          specialRequests: reservation.specialRequests || "",
        }
      : {
          status: "Confirmed",
          paymentStatus: "Pending",
          source: "Direct",
          adults: 1,
          children: 0,
          totalAmount: 0,
        },
  });

  // Fetch rooms and guests for the selects
  useEffect(() => {
    async function fetchRoomsAndGuests() {
      try {
        // Fetch available rooms
        const { data: roomsData, error: roomsError } = await supabase
          .from("rooms")
          .select("id, number, status")
        .eq("status", "Available"); // Filter by status = "Available"

        if (roomsError) throw roomsError;
        setRooms(roomsData || []);

        // Fetch guests
        const { data: guestsData, error: guestsError } = await supabase
          .from("guests")
          .select("id, first_name, last_name");

        if (guestsError) throw guestsError;
        
        const formattedGuests = guestsData.map(guest => ({
          id: guest.id,
          name: `${guest.first_name} ${guest.last_name}`
        }));
        
        setGuests(formattedGuests || []);
      } catch (error: any) {
        toast({
          title: "Error fetching data",
          description: error.message,
          variant: "destructive",
        });
      }
    }

    fetchRoomsAndGuests();
  }, []);

  // Handle form submission
  async function onSubmit(data: ReservationFormData) {
    setLoading(true);
    try {
      const formattedData = {
        room_id: data.roomId,
        guest_id: data.guestId,
        check_in: data.checkIn.toISOString(),
        check_out: data.checkOut.toISOString(),
        status: data.status,
        adults: data.adults,
        children: data.children,
        total_amount: data.totalAmount,
        payment_status: data.paymentStatus,
        source: data.source,
        special_requests: data.specialRequests,
      };

      let result;
      
      if (isEditing) {
        // Update existing reservation
        result = await supabase
          .from("reservations")
          .update(formattedData)
          .eq("id", reservation.id);
      } else {
        // Create new reservation
        result = await supabase
          .from("reservations")
          .insert([formattedData]);

          if (result.error) throw result.error;

          // If the reservation was successfully created, update the room status
          const roomUpdateResult = await supabase
            .from("rooms")
            .update({ status: "Reserved" })
            .eq("id", data.roomId);
    
          if (roomUpdateResult.error) throw roomUpdateResult.error;
      }

     
      toast({
        title: isEditing ? "Reservation updated" : "Reservation created",
        description: isEditing
          ? "The reservation has been updated successfully."
          : "New reservation has been created successfully.",
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
  
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Room Selection */}
          <FormField
            control={form.control}
            name="roomId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Guest Selection */}
          <FormField
            control={form.control}
            name="guestId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Guest</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a guest" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {guests.map((guest) => (
                      <SelectItem key={guest.id} value={guest.id}>
                        {guest.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Check-in Date */}
          <FormField
            control={form.control}
            name="checkIn"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Check-in Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Check-out Date */}
          <FormField
            control={form.control}
            name="checkOut"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Check-out Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => 
                        date < (form.getValues().checkIn || new Date(new Date().setHours(0, 0, 0, 0)))
                      }
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Checked In">Checked In</SelectItem>
                    <SelectItem value="Checked Out">Checked Out</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="No Show">No Show</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Status */}
          <FormField
            control={form.control}
            name="paymentStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Adults */}
          <FormField
            control={form.control}
            name="adults"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adults</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Children */}
          <FormField
            control={form.control}
            name="children"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Children</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Total Amount */}
          <FormField
            control={form.control}
            name="totalAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Amount</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Source */}
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Direct">Direct</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Agent">Agent</SelectItem>
                    <SelectItem value="Corporate">Corporate</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Special Requests */}
        <FormField
          control={form.control}
          name="specialRequests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Requests</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter any special requests or notes"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit and Cancel buttons */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : isEditing ? "Update Reservation" : "Create Reservation"}
          </Button>
        </div>
      </form>
    </Form>
  
  );
}
