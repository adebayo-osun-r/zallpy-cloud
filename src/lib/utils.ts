import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { Room, RoomStatus, RoomType, CleaningStatus } from "@/lib/types";
import { Guest } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function fromDbRoom(dbRoom: any): Room {
  return {
    id: dbRoom.id,
    number: dbRoom.number,
    type: dbRoom.type as RoomType,
    status: dbRoom.status as RoomStatus,
    cleaningStatus: dbRoom.cleaning_status as CleaningStatus,
    basePrice: dbRoom.base_price,
    maxOccupancy: dbRoom.max_occupancy,
    floor: dbRoom.floor,
    notes: dbRoom.notes,
    amenities: dbRoom.amenities ?? [],
    images: dbRoom.images ?? [],
    created_at: dbRoom.created_at,
    updated_at: dbRoom.updated_at,
  };
}

export function mapDbGuestToGuest(dbGuest: any): Guest {
  return {
    id: dbGuest.id,
    firstName: dbGuest.first_name,
    lastName: dbGuest.last_name,
    email: dbGuest.email,
    phone: dbGuest.phone || undefined,
    address: dbGuest.address || undefined,
    city: dbGuest.city || undefined,
    state: dbGuest.state || undefined,
    country: dbGuest.country || undefined,
    postalCode: dbGuest.postal_code || undefined,
    loyaltyPoints: dbGuest.loyalty_points || undefined,
    vipStatus: dbGuest.vip_status || "Standard",
    notes: dbGuest.notes || undefined,
    profileImage: dbGuest.profile_image || undefined,
    lastStay: dbGuest.last_stay || undefined,
    totalStays: dbGuest.total_stays || undefined,
    totalSpent: dbGuest.total_spent || undefined,
    created_at: dbGuest.created_at,
    updated_at: dbGuest.updated_at,
  };
}