
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { OccupancyData } from "@/lib/types";

interface OccupancyChartProps {
  data: OccupancyData[];
}

export function OccupancyChart({ data }: OccupancyChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Format data for display with percentages
  const formattedData = data.map((item) => ({
    ...item,
    // Convert to percentage
    occupancyRate: Math.round(item.occupancyRate * 100),
    date: formatDate(item.date),
  }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Occupancy Rate</CardTitle>
        <CardDescription>
          Hotel room occupancy over the last 7 days
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formattedData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis 
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <Tooltip 
              formatter={(value) => [`${value}%`, "Occupancy Rate"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="occupancyRate"
              name="Occupancy Rate"
              stroke="#0ea5e9"
              fill="#0ea5e9"
              fillOpacity={0.3}
              activeDot={{ r: 8 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
