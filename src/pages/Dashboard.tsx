
import { BedDouble, CalendarDays, DollarSign, Percent, ShoppingCart, Users } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { OccupancyChart } from "@/components/dashboard/OccupancyChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentReservations } from "@/components/dashboard/RecentReservations";
import { RoomStatusOverview } from "@/components/dashboard/RoomStatusOverview";
import { TasksWidget } from "@/components/dashboard/TasksWidget";
import { occupancyData, revenueData, reservations, rooms, housekeepingTasks } from "@/data/mockData";

export default function Dashboard() {
  // Calculate summary statistics
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(room => room.status === "Available").length;
  const upcomingCheckIns = reservations.filter(r => r.status === "Confirmed").length;
  const todayRevenue = revenueData[revenueData.length - 1].totalRevenue;
  const occupancyRate = occupancyData[occupancyData.length - 1].occupancyRate * 100;
  
  // Format as currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };
  
  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Occupancy Rate"
            value={`${occupancyRate.toFixed(0)}%`}
            icon={<Percent className="h-4 w-4" />}
            variant={occupancyRate > 70 ? "success" : occupancyRate > 40 ? "default" : "warning"}
            description={`${availableRooms} rooms available out of ${totalRooms}`}
          />
          <StatsCard
            title="Today's Revenue"
            value={formatCurrency(todayRevenue)}
            icon={<DollarSign className="h-4 w-4" />}
            variant="success"
            description="15% increase from yesterday"
          />
          <StatsCard
            title="Upcoming Check-ins"
            value={upcomingCheckIns}
            icon={<CalendarDays className="h-4 w-4" />}
            description="Next 7 days"
          />
          <StatsCard
            title="Active Guests"
            value={reservations.filter(r => r.status === "Checked In").length}
            icon={<Users className="h-4 w-4" />}
            description="Currently in-house"
          />
        </div>
        
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <OccupancyChart data={occupancyData} />
          <RevenueChart data={revenueData} />
        </div>
        
        {/* Widgets Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <RecentReservations reservations={reservations.slice(0, 4)} />
          <RoomStatusOverview rooms={rooms} />
          <TasksWidget tasks={housekeepingTasks.slice(0, 3)} />
        </div>
      </div>
    </AppLayout>
  );
}
