import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { HousekeepingTask } from '@/lib/types';

const useHousekeepingTasks = () => {
  const [housekeepingTasks, setHousekeepingTasks] = useState<HousekeepingTask[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHousekeepingTasks = async () => {
      try {
        // 1. Fetch tasks
        const { data: tasks, error: taskError } = await supabase
          .from("housekeeping_tasks")
          .select("*");

        if (taskError) throw taskError;

        // 2. Get unique assigned user IDs and room IDs
        const assignedToIds = [...new Set(tasks.map(t => t.assigned_to).filter(Boolean))];
        const roomIds = [...new Set(tasks.map(t => t.room_id).filter(Boolean))];

        // 3. Fetch profiles
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", assignedToIds);

        if (profileError) throw profileError;

        const profileMap = Object.fromEntries(
          (profiles || []).map(p => [p.id, `${p.first_name} ${p.last_name}`])
        );

        // 4. Fetch rooms
        const { data: rooms, error: roomError } = await supabase
          .from("rooms")
          .select("id, number")
          .in("id", roomIds);

        if (roomError) throw roomError;

        const roomMap = Object.fromEntries(
          (rooms || []).map(r => [r.id, r.number])
        );

        // 5. Map final tasks
        const mappedTasks: HousekeepingTask[] = tasks.map((item: any) => ({
          id: item.id,
          roomId: item.room_id,
          roomNumber: roomMap[item.room_id] || "Unknown",
          type: item.type,
          status: item.status,
          assignedTo: item.assigned_to,
          assignedToName: profileMap[item.assigned_to] || "Unassigned",
          priority: item.priority,
          notes: item.notes || "",
          createdAt: item.created_at,
          scheduledFor: item.scheduled_for,
          completedAt: item.completed_at || "",
        }));

        setHousekeepingTasks(mappedTasks);
      } catch (err: any) {
        console.error("Error fetching housekeeping tasks:", err.message);
        setError(err.message);
      }
    };

    fetchHousekeepingTasks();
  }, []);

  return { housekeepingTasks, error };
};

export default useHousekeepingTasks;
