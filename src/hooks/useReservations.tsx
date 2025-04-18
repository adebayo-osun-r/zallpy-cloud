import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Reservation } from '@/lib/types';

const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          id,
          room_id,
          guest_id,
          check_in,
          check_out,
          status,
          adults,
          children,
          total_amount,
          payment_status,
          source,
          created_at,
          updated_at,
          special_requests,
          rooms (
            number
          ),
          guests (
            first_name,
            last_name
          )
        `);

      if (error) {
        console.error("Error fetching reservations:", error.message);
        setError(error.message);
        return;
      }

      const mappedReservations: Reservation[] = data.map((item: any) => ({
        id: item.id,
        roomId: item.room_id,
        roomNumber: item.rooms?.number || "Unknown Room",
        guestId: item.guest_id,
        guestName: item.guests
          ? `${item.guests.first_name} ${item.guests.last_name}`
          : "Unknown Guest",
        checkIn: item.check_in,
        checkOut: item.check_out,
        status: item.status,
        adults: item.adults,
        children: item.children,
        totalAmount: item.total_amount,
        paymentStatus: item.payment_status,
        source: item.source,
        created: item.created_at,
        updated: item.updated_at,
        specialRequests: item.special_requests || "",
      }));

      setReservations(mappedReservations);
    };

    fetchReservations();
  }, []);

  return { reservations, error };
};

export default useReservations;
