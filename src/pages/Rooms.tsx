
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BedDouble, Filter, Search } from "lucide-react";
import { Room, RoomStatus } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AddRoomDialog } from "@/components/room/AddRoomDialog";

import {fromDbRoom}  from '@/lib/utils';


export default function Rooms() {
  const [dialogOpen, setDialogOpen] = useState(false);
const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  useEffect(() => {
    const fetchRooms = async () => {
      const { data, error } = await supabase.from("rooms").select("*");

      const convertedData = data.map( (d) => fromDbRoom(d));
      if (error) {
        console.error("Error fetching rooms:", error);
      } else {
        setRooms(convertedData as unknown as Room[]);
       
      }

      setLoading(false);
    };

    fetchRooms();
  }, []);
  
  
  // Get unique room types
  const roomTypes = ["All", ...Array.from(new Set(rooms.map(room => room.type)))];
  // Get unique statuses
  const roomStatuses = ["All", ...Array.from(new Set(rooms.map(room => room.status)))];
  
  // Apply filters
  const filteredRooms = rooms.filter(room => {
    return (
      (searchTerm === "" || 
       room.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
       room.type.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterType === "All" || room.type === filterType) &&
      (filterStatus === "All" || room.status === filterStatus)
    );
  });
  
  // Group rooms by floor
  const roomsByFloor = filteredRooms.reduce((acc, room) => {
    acc[room.floor] = [...(acc[room.floor] || []), room];
    return acc;
  }, {} as Record<number, Room[]>);
  
  // Sort floors
  const sortedFloors = Object.keys(roomsByFloor).map(Number).sort((a, b) => a - b);
  
  // Get color for room status
  const getRoomStatusColor = (status: RoomStatus) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "Occupied":
        return "bg-purple-100 text-purple-800";
      case "Reserved":
        return "bg-amber-100 text-amber-800";
      case "Maintenance":
        return "bg-red-100 text-red-800";
      case "Cleaning":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Get cleaning status color
  const getCleaningStatusColor = (status: string) => {
    switch (status) {
      case "Clean":
        return "text-green-600";
      case "Dirty":
        return "text-red-600";
      case "Inspected":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };



 
  
  return (
    <AppLayout title="Rooms">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:flex md:justify-between md:items-center gap-4">
          {/* Search and Filter */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search rooms..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {roomStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setFilterType("All");
              setFilterStatus("All");
            }}>
              Reset
            </Button>
          </div>
        </div>



      
<Button onClick={() => {
  setEditRoom(null);
  setDialogOpen(true);
}}>Add Room</Button>

<AddRoomDialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  initialData={editRoom}
  onSave={(savedRoom) => {
    setRooms(prev => {
      const exists = prev.some(r => r.id === savedRoom.id);
      return exists
        ? prev.map(r => (r.id === savedRoom.id ? savedRoom : r))
        : [...prev, savedRoom];
    });
  }}
/>

{loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (

        
        <Tabs defaultValue="grid" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="floors">By Floor</TabsTrigger>
            </TabsList>
            
            <div className="text-sm text-muted-foreground">
              Showing {filteredRooms.length} of {rooms.length} rooms
            </div>
          </div>
          
          {/* Grid View */}
          <TabsContent value="grid" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredRooms.map(room => (
                <Card key={room.id} className="overflow-hidden hover-scale">
                  <CardContent className="p-0">
                    <div className="relative h-32 bg-muted">
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                        <BedDouble className="h-16 w-16 text-gray-400" />
                      </div>
                      <Badge className={`absolute top-2 right-2 ${getRoomStatusColor(room.status)}`}>
                        {room.status}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">Room {room.number}</h3>
                          <p className="text-sm text-muted-foreground">{room.type}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${room.basePrice.toFixed(2)}</div>
                          <div className={`text-xs ${getCleaningStatusColor(room.cleaningStatus)}`}>
                            {room.cleaningStatus}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground flex flex-wrap gap-1 mt-2">
                        {room.amenities.slice(0, 3).map((amenity, index) => (
                          <Badge key={index} variant="outline" className="font-normal">
                            {amenity}
                          </Badge>
                        ))}
                        {room.amenities.length > 3 && (
                          <Badge variant="outline" className="font-normal">
                            +{room.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button onClick={() => {
                      setEditRoom(room);
                      setDialogOpen(true);
                    }}>Edit</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Floor View */}
          <TabsContent value="floors" className="mt-0 space-y-6">
            {sortedFloors.map(floor => (
              <div key={floor}>
                <h3 className="text-lg font-semibold mb-2">Floor {floor}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {roomsByFloor[floor].map(room => (
                    <Card key={room.id} className="overflow-hidden hover-scale">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">Room {room.number}</h3>
                            <p className="text-sm text-muted-foreground">{room.type}</p>
                          </div>
                          <Badge className={getRoomStatusColor(room.status)}>
                            {room.status}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm">
                            <span>Occupancy:</span>
                            <span>{room.maxOccupancy} guests</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Price:</span>
                            <span>${room.basePrice.toFixed(2)}/night</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Status:</span>
                            <span className={getCleaningStatusColor(room.cleaningStatus)}>
                              {room.cleaningStatus}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
          
        </Tabs>
            )}

      </div>
    </AppLayout>
  );
}
