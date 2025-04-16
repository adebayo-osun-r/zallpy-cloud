
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
import {
  BedDouble,
  Check,
  Clock,
  Filter,
  Plus,
  SquareUserRound,
  AlertTriangle
} from "lucide-react";
import { HouseKeepingStatus, HousekeepingTask } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { NewHousekeepingTaskDialog } from "@/components/housekeeping/NewHousekeepingTaskDialog";



export default function Housekeeping() {
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  const fetchTasks = async () => {
    // same logic as current useEffect

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .select(`
            *,
            rooms!inner (
              number
            )
          `)
        .order('scheduled_for');

      if (error) throw error;

      // Since we have an issue with profiles relation, let's handle it differently
      const mappedTasks: HousekeepingTask[] = await Promise.all(
        data.map(async (task) => {
          // For each task, get the assigned person's name if available
          let assignedToName = 'Unassigned';

          if (task.assigned_to) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', task.assigned_to)
              .single();

            if (profileData) {
              assignedToName = `${profileData.first_name} ${profileData.last_name}`;
            }
          }

          return {
            id: task.id,
            roomId: task.room_id,
            roomNumber: task.rooms.number,
            type: task.type as "Regular Cleaning" | "Deep Cleaning" | "Turndown" | "Maintenance" | "Special Request",
            status: task.status as "Pending" | "In Progress" | "Completed" | "Verified",
            assignedTo: task.assigned_to,
            assignedToName,
            priority: task.priority as "Low" | "Medium" | "High" | "Urgent",
            notes: task.notes,
            createdAt: task.created_at,
            scheduledFor: task.scheduled_for,
            completedAt: task.completed_at
          };
        })
      );

      setTasks(mappedTasks);
    } catch (error: any) {
      toast({
        title: "Error fetching housekeeping tasks",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error fetching housekeeping tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: HouseKeepingStatus) => {
    try {
      // Optimistically update UI first
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      const { error } = await supabase
        .from("housekeeping_tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) {
        throw error;
      }

      toast({
        title: "Task updated",
        description: `Task marked as ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
      // If error occurs, refetch data to rollback optimistic update
      fetchTasks();
    }
  };


  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(task => {
    if (activeTab === "pending") return task.status === "Pending";
    if (activeTab === "inProgress") return task.status === "In Progress";
    if (activeTab === "completed") return task.status === "Completed" || task.status === "Verified";
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent": return "bg-red-500";
      case "High": return "bg-orange-500";
      case "Medium": return "bg-yellow-500";
      case "Low": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Verified": return "bg-green-700";
      case "Completed": return "bg-green-500";
      case "In Progress": return "bg-blue-500";
      case "Pending": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <AppLayout title="Housekeeping">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Housekeeping</h1>
            <p className="text-muted-foreground">
              Manage room cleaning and maintenance tasks
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <NewHousekeepingTaskDialog onTaskCreated={fetchTasks} />
          </div>
        </div>






        <Tabs defaultValue="pending" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="inProgress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <Card>
              <CardHeader>
                <CardTitle>Housekeeping Tasks</CardTitle>
                <CardDescription>Manage and track room cleaning tasks</CardDescription>
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
                        <TableHead>Type</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTasks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10">
                            No tasks found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTasks.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <BedDouble className="h-4 w-4" />
                                <span>Room {task.roomNumber}</span>
                              </div>
                            </TableCell>
                            <TableCell>{task.type}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <SquareUserRound className="h-4 w-4" />
                                <span>{task.assignedToName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <div className="flex items-center">
                                  <Clock className="mr-1 h-3 w-3" />
                                  {format(new Date(task.scheduledFor), 'MMM dd, HH:mm')}
                                </div>
                                {task.completedAt && (
                                  <div className="flex items-center text-xs text-green-600">
                                    <Check className="mr-1 h-3 w-3" />
                                    Completed: {format(new Date(task.completedAt), 'MMM dd, HH:mm')}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                                {task.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(task.status)} text-white`}>
                                {task.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                {task.status === "Pending" && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleStatusUpdate(task.id, "In Progress")}
                                    title="Mark as In Progress"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}

                                {task.status === "In Progress" && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleStatusUpdate(task.id, "Completed")}
                                    title="Mark as Completed"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}

                                {task.status === "Completed" && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleStatusUpdate(task.id, "Verified")}
                                    title="Mark as Verified"
                                  >
                                    <Check className="h-4 w-4 text-green-600" />
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
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
