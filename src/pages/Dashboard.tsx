
import { BedDouble, CalendarDays, ChartCandlestick, Percent, ShoppingCart, Users } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { OccupancyChart } from "@/components/dashboard/OccupancyChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentReservations } from "@/components/dashboard/RecentReservations";
import { RoomStatusOverview } from "@/components/dashboard/RoomStatusOverview";
import { TasksWidget } from "@/components/dashboard/TasksWidget";
import {useOccupancyData}  from "@/hooks/useOccupancyData";
import useRooms from '@/hooks/useRooms'
import useRevenueData from "@/hooks/useRevenueData";
import useReservations  from "@/hooks/useReservations";
import useHousekeepingTasks  from "@/hooks/useHousekeepingTasks";
import { OccupancyData } from "@/lib/types";





export default function Dashboard() {

  const { rooms } = useRooms();
  const { revenueData } = useRevenueData();
  const { reservations } = useReservations();
  const { housekeepingTasks } = useHousekeepingTasks();
  const { occupancyData, loading } = useOccupancyData(7);

  if (loading) return <p>Loading...</p>;

  // Calculate summary statistics
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(room => room.status === "Available").length;
  const upcomingCheckIns = reservations.filter(r => r.status === "Confirmed").length;
  const todayRevenue = revenueData[revenueData.length - 1].totalRevenue;
 


 
  
  // Format as currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(value);
  };

  const calculateAverageOccupancyRate = (data: OccupancyData[]): number => {
    if (!data.length) return 0;
    const totalRate = data.reduce((sum, day) => sum + day.occupancyRate, 0);
    return parseFloat((totalRate / data.length).toFixed(2)); // rounded to 2 decimals
  };

  const avgRate = calculateAverageOccupancyRate(occupancyData);
  
  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Occupancy Rate"
            value={`${avgRate.toFixed(0)}%`}
            icon={<Percent className="h-4 w-4" />}
            variant={avgRate > 70 ? "success" : avgRate > 40 ? "default" : "warning"}
            description={`${availableRooms} rooms available out of ${totalRooms}`}
          /> 
          <StatsCard
            title="Today's Revenue"
            value={formatCurrency(todayRevenue)}
            icon={<ChartCandlestick  className="h-4 w-4" />}
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
