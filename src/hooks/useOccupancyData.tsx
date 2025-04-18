import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { OccupancyData } from '@/lib/types';

export const useOccupancyData = (daysBack: number = 7) => {
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOccupancy = async () => {
      setLoading(true);

      const today = new Date();
      const dateArray: string[] = [];

      // Create date range
      for (let i = daysBack - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dateArray.push(d.toISOString().split('T')[0]);
      }

      // Fetch total rooms
      const { data: rooms, error: roomErr } = await supabase
        .from('rooms')
        .select('id');

      if (roomErr) {
        console.error('Error fetching rooms:', roomErr);
        setLoading(false);
        return;
      }

      const totalRooms = rooms.length;

      // Fetch reservations within range
      const { data: reservations, error: resErr } = await supabase
        .from('reservations')
        .select('check_in, check_out')
        .in('status', ['Confirmed', 'Checked In']);

      if (resErr) {
        console.error('Error fetching reservations:', resErr);
        setLoading(false);
        return;
      }

      // Process occupancy per day
      const result: OccupancyData[] = dateArray.map(date => {
        const occupied = reservations.filter(r =>
          r.check_in <= date && r.check_out > date
        ).length;

        const available = totalRooms - occupied;
        const occupancyRate = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;

        return {
          date,
          occupied,
          available,
          occupancyRate,
        };
      });

      setOccupancyData(result);
      setLoading(false);
    };

    fetchOccupancy();
  }, [daysBack]);

  return { occupancyData, loading };
};
