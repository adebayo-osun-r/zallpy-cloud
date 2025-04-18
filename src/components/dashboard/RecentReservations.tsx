
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reservation } from "@/lib/types";

interface RecentReservationsProps {
  reservations: Reservation[];
}

export function RecentReservations({ reservations }: RecentReservationsProps) {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-blue-100 text-blue-800";
      case "Checked In":
        return "bg-green-100 text-green-800";
      case "Checked Out":
        return "bg-gray-100 text-gray-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "No Show":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reservations</CardTitle>
        <CardDescription>Latest reservation activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reservations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent reservations</p>
          ) : (
            reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium ">{reservation.guestName}</h3>
                    <Badge className={getStatusColor(reservation.status)} variant="outline">
                      {reservation.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                     {reservation.roomNumber} · {formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)}
                  </div>
                </div>
                <div className="mt-2 md:mt-0 text-sm font-medium">
                  {new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: 'NGN'
                  }).format(reservation.totalAmount)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
