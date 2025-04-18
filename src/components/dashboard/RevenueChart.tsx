
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { RevenueData } from "@/lib/types";

interface RevenueChartProps {
  data: RevenueData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Format the dates for display
  const formattedData = data.map((item) => ({
    ...item,
    date: formatDate(item.date),
  }));

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Daily Revenue</CardTitle>
        <CardDescription>
          Breakdown of hotel revenue by category
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis 
              tickFormatter={(value) => `₦${value / 1000}k`}
            />
            <Tooltip 
              formatter={(value) => [formatCurrency(value as number), "Revenue"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Bar dataKey="roomRevenue" name="Room" stackId="a" fill="#0ea5e9" />
            <Bar dataKey="foodRevenue" name="Food" stackId="a" fill="#f3b72e" />
            <Bar dataKey="beverageRevenue" name="Beverage" stackId="a" fill="#6366f1" />
            <Bar dataKey="serviceRevenue" name="Services" stackId="a" fill="#22c55e" />
            <Bar dataKey="otherRevenue" name="Other" stackId="a" fill="#94a3b8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
