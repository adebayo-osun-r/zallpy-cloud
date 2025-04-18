
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar, Check, Edit, Filter, Plus, Trash, X } from "lucide-react";
import { Reservation, ReservationStatus } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ReservationDialog } from "@/components/reservations/ReservationDialog";
import { DeleteReservationDialog } from "@/components/reservations/DeleteReservationDialog";

export default function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<string>("");

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          guests!inner (
            first_name,
            last_name
          ),
          rooms!inner (
            number
          )
        `)
        .order('check_in', { ascending: false });

      if (error) throw error;

      // Map database fields to our Reservation type with proper type casting
      const formattedData: Reservation[] = data.map((res) => ({
        id: res.id,
        roomId: res.room_id,
        roomNumber: res.rooms.number,
        guestId: res.guest_id,
        guestName: `${res.guests.first_name} ${res.guests.last_name}`,
        checkIn: res.check_in,
        checkOut: res.check_out,
        status: res.status as ReservationStatus,
        adults: res.adults,
        children: res.children,
        totalAmount: res.total_amount,
        paymentStatus: res.payment_status as "Pending" | "Partial" | "Paid" | "Refunded",
        source: res.source as "Direct" | "Online" | "Agent" | "Corporate" | "Other",
        created: res.created_at,
        updated: res.updated_at,
        specialRequests: res.special_requests
      }));

      setReservations(formattedData);
    } catch (error: any) {
      toast({
        title: "Error fetching reservations",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCreate = () => {
    setCreateDialogOpen(true);
  };

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
  };

  const handleDelete = (reservationId: string) => {
    setReservationToDelete(reservationId);
    setDeleteDialogOpen(true);
  };

  const handleUpdateStatus = async (reservationId: string, newStatus: ReservationStatus) => {
    try {
      // First, find the reservation to get the room ID
      const reservation = reservations.find(res => res.id === reservationId);
      if (!reservation) throw new Error("Reservation not found");
  
      // Determine the new room status based on reservation status
      let newRoomStatus: string | null = null;
      if (newStatus === "Checked In") newRoomStatus = "Occupied";
      else if (newStatus === "Checked Out") newRoomStatus = "Available";
  
      // Start the update process
      const updates = [];
  
      // Update reservation status
      updates.push(
        supabase.from("reservations").update({ status: newStatus }).eq("id", reservationId)
      );
  
      // If needed, update room status
      if (newRoomStatus) {
        updates.push(
          supabase.from("rooms").update({ status: newRoomStatus }).eq("id", reservation.roomId)
        );
      }
  
      const [reservationRes, roomRes] = await Promise.all(updates);
  
      if (reservationRes.error) throw reservationRes.error;
      if (roomRes && roomRes.error) throw roomRes.error;
  
      toast({
        title: "Status updated",
        description: `Reservation status updated to ${newStatus}`,
      });
  
      // Update local state
      setReservations(
        reservations.map((res) =>
          res.id === reservationId ? { ...res, status: newStatus } : res
        )
      );
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case "Confirmed": return "bg-blue-500";
      case "Checked In": return "bg-green-500";
      case "Checked Out": return "bg-purple-500";
      case "Cancelled": return "bg-red-500";
      case "No Show": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-500";
      case "Partial": return "bg-yellow-500";
      case "Pending": return "bg-red-500";
      case "Refunded": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <AppLayout title="Reservations">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
            <p className="text-muted-foreground">
              Manage guest reservations and bookings
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="default" size="sm" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Reservation
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reservation List</CardTitle>
            <CardDescription>View and manage all reservations</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Check In/Out</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        No reservations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    reservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>{reservation.roomNumber}</TableCell>
                        <TableCell>{reservation.guestName}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {format(new Date(reservation.checkIn), 'MMM dd, yyyy')}
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Calendar className="mr-1 h-3 w-3" />
                              {format(new Date(reservation.checkOut), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(reservation.status)} text-white`}>
                            {reservation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getPaymentStatusColor(reservation.paymentStatus)} text-white`}>
                            {reservation.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>₦{reservation.totalAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            {reservation.status === "Confirmed" && (
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleUpdateStatus(reservation.id, "Checked In")}
                                title="Check In"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            {reservation.status === "Checked In" && (
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleUpdateStatus(reservation.id, "Checked Out")}
                                title="Check Out"
                              >
                                <Check className="h-4 w-4 text-green-500" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(reservation)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDelete(reservation.id)}
                              title="Delete"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                            {reservation.status !== "Cancelled" && (
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleUpdateStatus(reservation.id, "Cancelled")}
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Reservation Dialog */}
      <ReservationDialog
        isOpen={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          fetchReservations();
        }}
        title="Create New Reservation"
        description="Fill in the details to create a new reservation."
      />

      {/* Edit Reservation Dialog */}
      {editingReservation && (
        <ReservationDialog
          isOpen={!!editingReservation}
          onClose={() => {
            setEditingReservation(undefined);
            fetchReservations();
          }}
          reservation={editingReservation}
          title="Edit Reservation"
          description="Update the reservation details."
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteReservationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        reservationId={reservationToDelete}
        onSuccess={fetchReservations}
      />
    </AppLayout>
  );
}
