import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Room } from '@/lib/types' // adjust path if needed

const useRooms = () => {
    const [rooms, setRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
  
    useEffect(() => {
      const fetchRooms = async () => {
        setLoading(true)
  
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
  
        if (error) {
          setError(error.message)
          setRooms([])
        } else {
          const mappedRooms = data.map((room: any): Room => ({
            id: room.id,
            number: room.number,
            type: room.type,
            floor: room.floor,
            status: room.status,
            cleaningStatus: room.cleaning_status,
            maxOccupancy: room.max_occupancy,
            basePrice: room.base_price,
            amenities: room.amenities,
            images: room.images,
            notes: room.notes,
            created_at: room.created_at,
            updated_at: room.updated_at,
          }))
          setRooms(mappedRooms)
        }
  
        setLoading(false)
      }
  
      fetchRooms()
    }, [])
  
    return { rooms, loading, error }
  }
  
  export default useRooms