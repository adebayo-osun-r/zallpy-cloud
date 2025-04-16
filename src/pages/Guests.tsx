
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AddGuestDialog } from "@/components/guests/AddGuestDialog";

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
  Edit, 
  Filter, 
  Plus, 
  Search, 
  Star,
  User
} from "lucide-react";
import { Guest } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Guests() {
  const [showDialog, setShowDialog] = useState(false);
const [selectedGuest, setSelectedGuest] = useState<Guest | undefined>();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchGuests() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('guests')
          .select('*')
          .order('last_name');

        if (error) throw error;

        // Map database fields to our Guest type
        const mappedGuests: Guest[] = data.map(guest => ({
          id: guest.id,
          firstName: guest.first_name,
          lastName: guest.last_name,
          email: guest.email,
          phone: guest.phone || undefined,
          address: guest.address || undefined,
          city: guest.city || undefined,
          state: guest.state || undefined,
          country: guest.country || undefined,
          postalCode: guest.postal_code || undefined,
          loyaltyPoints: guest.loyalty_points || undefined,
          vipStatus: guest.vip_status as any,
          notes: guest.notes || undefined,
          profileImage: guest.profile_image || undefined,
          lastStay: guest.last_stay || undefined,
          totalStays: guest.total_stays || undefined,
          totalSpent: guest.total_spent || undefined,
          created_at: guest.created_at,
          updated_at: guest.updated_at
        }));

        setGuests(mappedGuests);
      } catch (error: any) {
        toast({
          title: "Error fetching guests",
          description: error.message,
          variant: "destructive",
        });
        console.error("Error fetching guests:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGuests();
  }, []);

  const filteredGuests = guests.filter(guest => 
    guest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getVipStatusColor = (status?: string) => {
    switch (status) {
      case "Platinum": return "bg-purple-500";
      case "Gold": return "bg-amber-500";
      case "Silver": return "bg-gray-400";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <AppLayout title="Guests">

     <AddGuestDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSave={(newGuest) => {
          setGuests((prev) =>
            selectedGuest
              ? prev.map((g) => (g.id === newGuest.id ? newGuest : g))
              : [...prev, newGuest]
          );
          setSelectedGuest(undefined);
        }}
        guestToEdit={selectedGuest}
      />
  
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Guests</h1>
            <p className="text-muted-foreground">
              Manage guest profiles and information
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="default" size="sm" onClick={() => {
              setShowDialog(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              New Guest
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search guests..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Guest List</CardTitle>
            <CardDescription>View and manage guest profiles</CardDescription>
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
                    <TableHead>Name</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stays</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGuests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        No guests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredGuests.map((guest) => (
                      <TableRow key={guest.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={guest.profileImage} />
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{`${guest.firstName} ${guest.lastName}`}</div>
                              <div className="text-xs text-muted-foreground">
                                {guest.city && guest.country ? `${guest.city}, ${guest.country}` : 'Location not set'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{guest.email}</div>
                          <div className="text-xs text-muted-foreground">{guest.phone || 'No phone'}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getVipStatusColor(guest.vipStatus)} text-white`}>
                            {guest.vipStatus || 'Standard'}
                          </Badge>
                          {guest.loyaltyPoints ? (
                            <div className="flex items-center text-xs mt-1 text-amber-600">
                              <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                              {guest.loyaltyPoints} points
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell>{guest.totalStays || 0}</TableCell>
                        <TableCell>${(guest.totalSpent || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button onClick={()=>{
                            setShowDialog(true);
                            setSelectedGuest(guest);
                          }} variant="outline" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>

                      
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
