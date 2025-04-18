
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Download } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OccupancyChart } from "@/components/dashboard/OccupancyChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RoomStatusOverview } from "@/components/dashboard/RoomStatusOverview";
import { RecentReservations } from "@/components/dashboard/RecentReservations";

import { useOccupancyData } from "@/hooks/useOccupancyData";
import useRooms from '@/hooks/useRooms'
import useRevenueData from "@/hooks/useRevenueData";
import useReservations from "@/hooks/useReservations";

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });

  // Function to calculate the total days between two dates
  const calculateTotalDays = (from: Date, to: Date): number => {
    const timeDifference = to.getTime() - from.getTime();
    return Math.ceil(timeDifference / (1000 * 3600 * 24)); // Convert from milliseconds to days
  };

  const { rooms } = useRooms();
  const { revenueData } = useRevenueData();
  const { reservations } = useReservations();
  const { occupancyData, loading } = useOccupancyData(calculateTotalDays(dateRange.from, dateRange.to));

  if (loading) return <p>Loading...</p>;

  // Function to calculate metrics for the last month
  const calculateLastMonthData = () => {
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

    // Get the start and end dates of last month
    const startOfLastMonth = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth(), 1);
    const endOfLastMonth = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth() + 1, 0);

    // Filter reservations and calculate metrics for the last month
    const lastMonthReservations = reservations.filter((reservation) => {
      const checkIn = new Date(reservation.checkIn);
      const checkOut = new Date(reservation.checkOut);
      return (
        (checkIn >= startOfLastMonth && checkIn <= endOfLastMonth) ||
        (checkOut >= startOfLastMonth && checkOut <= endOfLastMonth) ||
        (checkIn <= startOfLastMonth && checkOut >= endOfLastMonth)
      );
    });

    // Calculate last month total revenue
    const lastMonthRevenue = lastMonthReservations.reduce((total, reservation) => {
      return total + reservation.totalAmount;
    }, 0);

    // Calculate last month occupied rooms
    const lastMonthOccupiedRooms = lastMonthReservations.length;

    // Calculate last month occupancy rate
    const lastMonthOccupancyRate = (lastMonthOccupiedRooms / rooms.length) * 100;

    // Calculate last month ADR (Average Daily Rate)
    const lastMonthAdr = lastMonthRevenue / lastMonthOccupiedRooms || 0;

    // Calculate last month RevPAR (Revenue per Available Room)
    const lastMonthRevpar = lastMonthRevenue / rooms.length;

    return {
      totalRevenue: lastMonthRevenue,
      occupiedRooms: lastMonthOccupiedRooms,
      occupancyRate: lastMonthOccupancyRate,
      adr: lastMonthAdr,
      revpar: lastMonthRevpar,
    };
  };

  const lastMonthData = calculateLastMonthData();

  // Compute current month metrics
  const totalRevenue = revenueData.reduce((total, data) => total + data.totalRevenue, 0);
  const occupiedRooms = reservations.filter(
    (reservation) => new Date(reservation.checkIn) <= new Date() && new Date(reservation.checkOut) >= new Date()
  ).length;
  const occupancyRate = (occupiedRooms / rooms.length) * 100;
  const adr = totalRevenue / occupiedRooms || 0;
  const revpar = totalRevenue / rooms.length;

  const calculateImprovement = (current: number, lastMonth: number): string => {
    // Check if last month's value is 0
    if (lastMonth === 0) {
      // If last month's value is 0, return "Infinity" or "N/A" based on the context
      return current > 0 ? "Infinity" : "N/A"; // If current is positive, it implies an infinite improvement
    }
  
    // Normal percentage improvement calculation
    const improvement = ((current - lastMonth) / lastMonth) * 100;
    return improvement.toFixed(2); // Return the improvement as a percentage with two decimal points
  };
  
  const totalRevenueImprovement = calculateImprovement(totalRevenue, lastMonthData.totalRevenue);
  const occupancyRateImprovement = calculateImprovement(occupancyRate, lastMonthData.occupancyRate);
  const adrImprovement = calculateImprovement(adr, lastMonthData.adr);
  const revparImprovement = calculateImprovement(revpar, lastMonthData.revpar);


  return (
    <AppLayout title="Analytics">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Hotel performance metrics and insights
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[280px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+{totalRevenueImprovement}%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{occupancyRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+{occupancyRateImprovement}%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Daily Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{adr.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+{adrImprovement}%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">RevPAR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{revpar.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+{revparImprovement}%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>Monthly revenue breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <RevenueChart data={revenueData} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Room Status</CardTitle>
                  <CardDescription>Current room allocation</CardDescription>
                </CardHeader>
                <CardContent>
                  <RoomStatusOverview rooms={rooms} />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Occupancy Rate</CardTitle>
                  <CardDescription>Daily occupancy trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <OccupancyChart data={occupancyData} />
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Reservations</CardTitle>
                  <CardDescription>Latest booking activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentReservations reservations={reservations.slice(0, 4)} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
                <CardDescription>Detailed revenue breakdown</CardDescription>
              </CardHeader>
              <CardContent className="h-[450px]">
                <RevenueChart data={revenueData} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="occupancy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Occupancy Insights</CardTitle>
                <CardDescription>Room occupancy patterns</CardDescription>
              </CardHeader>
              <CardContent className="h-[450px]">
                <OccupancyChart data={occupancyData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
