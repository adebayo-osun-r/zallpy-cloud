
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  variant = "default",
  className,
}: StatsCardProps) {
  // Define color classes based on variant
  const colorClasses = {
    default: "text-hotel-500",
    success: "text-green-500",
    warning: "text-amber-500",
    danger: "text-red-500",
  };

  return (
    <Card className={cn("hover-scale overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className={cn("p-1 rounded-md", colorClasses[variant])}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", colorClasses[variant])}>
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
