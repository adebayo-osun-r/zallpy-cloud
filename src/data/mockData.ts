import { 
  Guest, 
  Room,
  Reservation,
  HousekeepingTask,
  BillingItem,
  OccupancyData,
  RevenueData
} from "@/lib/types";

// Mock Guest Data
export const guests: Guest[] = [
  {
    id: "g1",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@example.com",
    phone: "555-123-4567",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    country: "USA",
    postalCode: "10001",
    loyaltyPoints: 2500,
    vipStatus: "Gold",
    notes: "Prefers high floor rooms",
    lastStay: "2023-03-15",
    totalStays: 12,
    totalSpent: 8750,
    created: "2022-01-15T10:30:00Z",
    updated: "2023-03-20T14:15:00Z"
  },
  {
    id: "g2",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.j@example.com",
    phone: "555-987-6543",
    city: "Chicago",
    state: "IL",
    country: "USA",
    loyaltyPoints: 1200,
    vipStatus: "Silver",
    totalStays: 5,
    totalSpent: 3200,
    created: "2022-06-10T09:45:00Z",
    updated: "2023-02-05T11:20:00Z"
  },
  {
    id: "g3",
    firstName: "Michael",
    lastName: "Chen",
    email: "m.chen@example.com",
    phone: "555-555-1212",
    address: "789 Oak Drive",
    city: "San Francisco",
    state: "CA",
    country: "USA",
    postalCode: "94102",
    loyaltyPoints: 3800,
    vipStatus: "Platinum",
    notes: "Allergic to feather pillows",
    lastStay: "2023-04-10",
    totalStays: 18,
    totalSpent: 12500,
    created: "2021-11-20T16:30:00Z",
    updated: "2023-04-12T10:10:00Z"
  },
  {
    id: "g4",
    firstName: "Emma",
    lastName: "Wilson",
    email: "e.wilson@example.com",
    city: "London",
    country: "UK",
    loyaltyPoints: 750,
    vipStatus: "Standard",
    totalStays: 2,
    totalSpent: 1450,
    created: "2023-01-05T13:15:00Z",
    updated: "2023-03-01T09:30:00Z"
  },
  {
    id: "g5",
    firstName: "Robert",
    lastName: "Garcia",
    email: "r.garcia@example.com",
    phone: "555-777-8888",
    city: "Miami",
    state: "FL",
    country: "USA",
    loyaltyPoints: 1800,
    vipStatus: "Gold",
    lastStay: "2023-02-28",
    totalStays: 8,
    totalSpent: 6200,
    created: "2022-04-18T11:20:00Z",
    updated: "2023-03-01T14:45:00Z"
  }
];

// Mock Room Data
export const rooms: Room[] = [
  {
    id: "r101",
    number: "101",
    type: "Standard",
    floor: 1,
    status: "Available",
    cleaningStatus: "Clean",
    maxOccupancy: 2,
    basePrice: 149.99,
    amenities: ["WiFi", "TV", "Air Conditioning", "Mini Fridge"],
    images: ["/placeholder.svg"]
  },
  {
    id: "r102",
    number: "102",
    type: "Standard",
    floor: 1,
    status: "Occupied",
    cleaningStatus: "Dirty",
    maxOccupancy: 2,
    basePrice: 149.99,
    amenities: ["WiFi", "TV", "Air Conditioning", "Mini Fridge"],
    images: ["/placeholder.svg"]
  },
  {
    id: "r201",
    number: "201",
    type: "Deluxe",
    floor: 2,
    status: "Reserved",
    cleaningStatus: "Clean",
    maxOccupancy: 3,
    basePrice: 199.99,
    amenities: ["WiFi", "TV", "Air Conditioning", "Mini Bar", "Room Service", "City View"],
    images: ["/placeholder.svg"]
  },
  {
    id: "r202",
    number: "202",
    type: "Deluxe",
    floor: 2,
    status: "Available",
    cleaningStatus: "Inspected",
    maxOccupancy: 3,
    basePrice: 199.99,
    amenities: ["WiFi", "TV", "Air Conditioning", "Mini Bar", "Room Service", "City View"],
    images: ["/placeholder.svg"]
  },
  {
    id: "r301",
    number: "301",
    type: "Suite",
    floor: 3,
    status: "Maintenance",
    cleaningStatus: "Dirty",
    maxOccupancy: 4,
    basePrice: 299.99,
    amenities: ["WiFi", "TV", "Air Conditioning", "Mini Bar", "Room Service", "City View", "Balcony", "Kitchenette"],
    images: ["/placeholder.svg"],
    notes: "Bathroom sink leaking"
  },
  {
    id: "r302",
    number: "302",
    type: "Suite",
    floor: 3,
    status: "Available",
    cleaningStatus: "Clean",
    maxOccupancy: 4,
    basePrice: 299.99,
    amenities: ["WiFi", "TV", "Air Conditioning", "Mini Bar", "Room Service", "City View", "Balcony", "Kitchenette"],
    images: ["/placeholder.svg"]
  },
  {
    id: "r401",
    number: "401",
    type: "Executive",
    floor: 4,
    status: "Reserved",
    cleaningStatus: "Clean",
    maxOccupancy: 2,
    basePrice: 349.99,
    amenities: ["WiFi", "TV", "Air Conditioning", "Mini Bar", "Room Service", "City View", "Balcony", "Executive Lounge Access", "Premium Toiletries"],
    images: ["/placeholder.svg"]
  },
  {
    id: "r501",
    number: "501",
    type: "Presidential",
    floor: 5,
    status: "Available",
    cleaningStatus: "Inspected",
    maxOccupancy: 6,
    basePrice: 599.99,
    amenities: ["WiFi", "TV", "Air Conditioning", "Full Bar", "Room Service", "City View", "Terrace", "Kitchenette", "Dining Area", "Executive Lounge Access", "Premium Toiletries", "Jacuzzi", "Personal Butler"],
    images: ["/placeholder.svg"]
  }
];

// Mock Reservation Data
export const reservations: Reservation[] = [
  {
    id: "res1",
    roomId: "r102",
    roomNumber: "102",
    guestId: "g1",
    guestName: "John Smith",
    checkIn: "2023-04-15T15:00:00Z",
    checkOut: "2023-04-18T11:00:00Z",
    status: "Checked In",
    adults: 1,
    children: 0,
    totalAmount: 449.97,
    paymentStatus: "Partial",
    source: "Direct",
    created: "2023-03-20T14:30:00Z",
    updated: "2023-04-15T15:30:00Z"
  },
  {
    id: "res2",
    roomId: "r201",
    roomNumber: "201",
    guestId: "g3",
    guestName: "Michael Chen",
    checkIn: "2023-04-20T15:00:00Z",
    checkOut: "2023-04-22T11:00:00Z",
    status: "Confirmed",
    adults: 2,
    children: 0,
    totalAmount: 399.98,
    paymentStatus: "Pending",
    source: "Online",
    created: "2023-04-10T09:15:00Z",
    updated: "2023-04-10T09:15:00Z",
    specialRequests: "Early check-in if possible"
  },
  {
    id: "res3",
    roomId: "r401",
    roomNumber: "401",
    guestId: "g5",
    guestName: "Robert Garcia",
    checkIn: "2023-04-18T15:00:00Z",
    checkOut: "2023-04-21T11:00:00Z",
    status: "Confirmed",
    adults: 1,
    children: 1,
    totalAmount: 1049.97,
    paymentStatus: "Paid",
    source: "Agent",
    created: "2023-03-25T10:45:00Z",
    updated: "2023-04-01T13:20:00Z"
  },
  {
    id: "res4",
    roomId: "r202",
    roomNumber: "202",
    guestId: "g2",
    guestName: "Sarah Johnson",
    checkIn: "2023-04-10T15:00:00Z",
    checkOut: "2023-04-14T11:00:00Z",
    status: "Checked Out",
    adults: 2,
    children: 1,
    totalAmount: 799.96,
    paymentStatus: "Paid",
    source: "Direct",
    created: "2023-03-15T08:30:00Z",
    updated: "2023-04-14T11:15:00Z"
  },
  {
    id: "res5",
    roomId: "r301",
    roomNumber: "301",
    guestId: "g4",
    guestName: "Emma Wilson",
    checkIn: "2023-04-05T15:00:00Z",
    checkOut: "2023-04-08T11:00:00Z",
    status: "Cancelled",
    adults: 2,
    children: 0,
    totalAmount: 899.97,
    paymentStatus: "Refunded",
    source: "Online",
    created: "2023-03-10T12:20:00Z",
    updated: "2023-04-01T09:45:00Z"
  }
];

// Mock Housekeeping Tasks
export const housekeepingTasks: HousekeepingTask[] = [
  {
    id: "task1",
    roomId: "r102",
    roomNumber: "102",
    type: "Regular Cleaning",
    status: "Pending",
    assignedTo: "staff1",
    assignedToName: "Maria Rodriguez",
    priority: "High",
    createdAt: "2023-04-16T08:00:00Z",
    scheduledFor: "2023-04-16T12:00:00Z"
  },
  {
    id: "task2",
    roomId: "r202",
    roomNumber: "202",
    type: "Deep Cleaning",
    status: "Completed",
    assignedTo: "staff2",
    assignedToName: "James Wilson",
    priority: "Medium",
    notes: "Guest checking in at 3pm",
    createdAt: "2023-04-14T11:30:00Z",
    scheduledFor: "2023-04-14T13:00:00Z",
    completedAt: "2023-04-14T14:45:00Z"
  },
  {
    id: "task3",
    roomId: "r301",
    roomNumber: "301",
    type: "Maintenance",
    status: "In Progress",
    assignedTo: "staff3",
    assignedToName: "David Clark",
    priority: "Urgent",
    notes: "Fix leaking sink in bathroom",
    createdAt: "2023-04-15T09:15:00Z",
    scheduledFor: "2023-04-15T10:00:00Z"
  },
  {
    id: "task4",
    roomId: "r501",
    roomNumber: "501",
    type: "Turndown",
    status: "Pending",
    assignedTo: "staff1",
    assignedToName: "Maria Rodriguez",
    priority: "Low",
    createdAt: "2023-04-16T16:00:00Z",
    scheduledFor: "2023-04-16T18:00:00Z"
  },
  {
    id: "task5",
    roomId: "r401",
    roomNumber: "401",
    type: "Special Request",
    status: "Completed",
    assignedTo: "staff4",
    assignedToName: "Lisa Johnson",
    priority: "Medium",
    notes: "Add extra pillows and blankets",
    createdAt: "2023-04-14T16:30:00Z",
    scheduledFor: "2023-04-15T11:00:00Z",
    completedAt: "2023-04-15T11:25:00Z"
  }
];

// Mock Billing Items
export const billingItems: BillingItem[] = [
  {
    id: "bill1",
    reservationId: "res1",
    guestId: "g1",
    description: "Room Charge - Standard Room",
    amount: 149.99,
    category: "Room",
    date: "2023-04-15",
    status: "Charged"
  },
  {
    id: "bill2",
    reservationId: "res1",
    guestId: "g1",
    description: "Room Charge - Standard Room",
    amount: 149.99,
    category: "Room",
    date: "2023-04-16",
    status: "Charged"
  },
  {
    id: "bill3",
    reservationId: "res1",
    guestId: "g1",
    description: "Room Service - Dinner",
    amount: 65.50,
    category: "Food",
    date: "2023-04-15",
    status: "Charged"
  },
  {
    id: "bill4",
    reservationId: "res1",
    guestId: "g1",
    description: "Mini Bar",
    amount: 28.75,
    category: "Beverage",
    date: "2023-04-15",
    status: "Charged"
  },
  {
    id: "bill5",
    reservationId: "res1",
    guestId: "g1",
    description: "Spa Services",
    amount: 120.00,
    category: "Service",
    date: "2023-04-16",
    status: "Pending"
  }
];

// Mock Occupancy Data for the past 7 days
export const occupancyData: OccupancyData[] = [
  {
    date: "2023-04-10",
    occupied: 42,
    available: 58,
    occupancyRate: 0.42
  },
  {
    date: "2023-04-11",
    occupied: 45,
    available: 55,
    occupancyRate: 0.45
  },
  {
    date: "2023-04-12",
    occupied: 50,
    available: 50,
    occupancyRate: 0.50
  },
  {
    date: "2023-04-13",
    occupied: 55,
    available: 45,
    occupancyRate: 0.55
  },
  {
    date: "2023-04-14",
    occupied: 60,
    available: 40,
    occupancyRate: 0.60
  },
  {
    date: "2023-04-15",
    occupied: 65,
    available: 35,
    occupancyRate: 0.65
  },
  {
    date: "2023-04-16",
    occupied: 68,
    available: 32,
    occupancyRate: 0.68
  }
];

// Mock Revenue Data for the past 7 days
export const revenueData: RevenueData[] = [
  {
    date: "2023-04-10",
    roomRevenue: 12500,
    foodRevenue: 3200,
    beverageRevenue: 1800,
    serviceRevenue: 2100,
    otherRevenue: 850,
    totalRevenue: 20450
  },
  {
    date: "2023-04-11",
    roomRevenue: 13200,
    foodRevenue: 3500,
    beverageRevenue: 1950,
    serviceRevenue: 2300,
    otherRevenue: 900,
    totalRevenue: 21850
  },
  {
    date: "2023-04-12",
    roomRevenue: 14500,
    foodRevenue: 3800,
    beverageRevenue: 2100,
    serviceRevenue: 2600,
    otherRevenue: 1200,
    totalRevenue: 24200
  },
  {
    date: "2023-04-13",
    roomRevenue: 15800,
    foodRevenue: 4100,
    beverageRevenue: 2300,
    serviceRevenue: 2800,
    otherRevenue: 1100,
    totalRevenue: 26100
  },
  {
    date: "2023-04-14",
    roomRevenue: 17200,
    foodRevenue: 5500,
    beverageRevenue: 3100,
    serviceRevenue: 3300,
    otherRevenue: 1500,
    totalRevenue: 30600
  },
  {
    date: "2023-04-15",
    roomRevenue: 18500,
    foodRevenue: 5900,
    beverageRevenue: 3400,
    serviceRevenue: 3600,
    otherRevenue: 1700,
    totalRevenue: 33100
  },
  {
    date: "2023-04-16",
    roomRevenue: 19200,
    foodRevenue: 6200,
    beverageRevenue: 3700,
    serviceRevenue: 3800,
    otherRevenue: 1800,
    totalRevenue: 34700
  }
];
