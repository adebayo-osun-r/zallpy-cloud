
// Vip Status
 export type VipStatus = "Standard" | "Silver" | "Gold" | "Platinum";

// Guest Profile Types
export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  loyaltyPoints?: number;
  vipStatus?: VipStatus;
  notes?: string;
  profileImage?: string;
  lastStay?: string;
  totalStays?: number;
  totalSpent?: number;
  created_at: string;
  updated_at: string;
  full_name?: string;
}

// Room Types
export type RoomStatus = "Available" | "Occupied" | "Reserved" | "Maintenance" | "Cleaning";
export type RoomType = "Standard" | "Deluxe" | "Suite" | "Executive" | "Presidential";
export type CleaningStatus ="Clean" | "Dirty" | "Inspected";

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  floor: number;
  status: RoomStatus;
  cleaningStatus: CleaningStatus;
  maxOccupancy: number;
  basePrice: number;
  amenities: string[];
  images: string[];
  notes?: string;
  created_at?:string;
  updated_at?:string;
}

// Reservation Types
export type ReservationStatus = "Confirmed" | "Checked In" | "Checked Out" | "Cancelled" | "No Show";
export type ReservationPaymentStatus = "Pending" | "Partial" | "Paid" | "Refunded";
export type ReservationSource = "Direct" | "Online" | "Agent" | "Corporate" | "Other";

export interface Reservation {
  id: string;
  roomId: string;
  roomNumber: string;
  guestId: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: ReservationStatus;
  adults: number;
  children: number;
  totalAmount: number;
  paymentStatus: ReservationPaymentStatus;
  source: ReservationSource;
  created: string;
  updated: string;
  specialRequests?: string;
}

export type BillingItemCategories=  "Room" | "Food" | "Beverage" | "Service" | "Tax" | "Other";
export type BillingStatus = "Pending" | "Charged" | "Refunded";

// Billing Types
export interface BillingItem {
  id: string;
  invoiceId:string;
  reservationId: string;
  guestId: string;
  description: string;
  amount: number;
  category: BillingItemCategories;
  date: string;
  status: BillingStatus
}

export type InvoiceStatus = "Draft" | "Issued" | "Paid" | "Overdue" | "Cancelled";

export interface Invoice {
  id: string;
  reservationId: string;
  guestId: string;
  guestName: string;
  items: BillingItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus
}

// Housekeeping Types

export type HousekeepingTypes ="Regular Cleaning" | "Deep Cleaning" | "Turndown" | "Maintenance" | "Special Request";
export type HouseKeepingStatus = "Pending" | "In Progress" | "Completed" | "Verified";
export type HouseKeepingPriorities =  "Low" | "Medium" | "High" | "Urgent";

export interface HousekeepingTask {
  id: string;
  roomId: string;
  roomNumber: string;
  type: HousekeepingTypes;
  status: HouseKeepingStatus;
  assignedTo?: string;
  assignedToName?: string;
  priority: HouseKeepingPriorities;
  notes?: string;
  createdAt: string;
  scheduledFor: string;
  completedAt?: string;
}


// Analytics Types
export interface OccupancyData {
  date: string;
  occupied: number;
  available: number;
  occupancyRate: number;
}

export interface RevenueData {
  date: string;
  roomRevenue: number;
  foodRevenue: number;
  beverageRevenue: number;
  serviceRevenue: number;
  otherRevenue: number;
  totalRevenue: number;
}

export interface User{
  firstName:string;
  lastName:string;
  email:string;
  password:string;
  confirmPassword?:string;  
}


