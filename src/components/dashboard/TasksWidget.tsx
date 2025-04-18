
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HousekeepingTask } from "@/lib/types";

interface TasksWidgetProps {
  tasks: HousekeepingTask[];
}

export function TasksWidget({ tasks }: TasksWidgetProps) {
  // Sort tasks by priority and status
  const sortedTasks = [...tasks].sort((a, b) => {
    // First by status (pending and in progress first)
    const statusOrder = { "Pending": 0, "In Progress": 1, "Completed": 2, "Verified": 3 };
    const statusDiff = statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
    if (statusDiff !== 0) return statusDiff;
    
    // Then by priority
    const priorityOrder = { "Urgent": 0, "High": 1, "Medium": 2, "Low": 3 };
    return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
  });

  // Function to get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-800";
      case "High":
        return "bg-amber-100 text-amber-800";
      case "Medium":
        return "bg-blue-100 text-blue-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "text-amber-500";
      case "In Progress":
        return "text-blue-500";
      case "Completed":
        return "text-green-500";
      case "Verified":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Housekeeping Tasks</CardTitle>
        <CardDescription>Current housekeeping and maintenance tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No current tasks</p>
          ) : (
            sortedTasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{task.roomNumber}</h3>
                      <Badge className={getPriorityColor(task.priority)} variant="outline">
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-sm mt-1">{task.type}</p>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                {task.assignedToName && (
                  <div className="text-xs text-muted-foreground mt-2">
                    Assigned to: {task.assignedToName}
                  </div>
                )}
                {task.notes && (
                  <div className="text-xs italic mt-2 text-muted-foreground">
                    "{task.notes}"
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
