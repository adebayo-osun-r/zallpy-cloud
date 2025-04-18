
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  BedDouble,
  Calendar,
  ClipboardCheck,
  CreditCard,
  Home,
  LogOut,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Menu items for the sidebar
const menuItems = [
  {
    title: "Dashboard",
    path: "/",
    icon: Home,
  },
  {
    title: "Rooms",
    path: "/rooms",
    icon: BedDouble,
  },
  {
    title: "Reservations",
    path: "/reservations",
    icon: Calendar,
  },
  {
    title: "Guests",
    path: "/guests",
    icon: Users,
  },
  {
    title: "Housekeeping",
    path: "/housekeeping",
    icon: ClipboardCheck,
  },
  {
    title: "Billing",
    path: "/billing",
    icon: CreditCard,
  },
  {
    title: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
];

const bottomMenuItems = [
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
  },
  {
    title: "Profile",
    path: "/profile",
    icon: UserCircle,
  },
  {
    title: "Manage Users",
    path: "/users",
    icon: Users,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <div className="bg-hotel-600 text-white p-2 rounded-md">
              <BedDouble className="h-6 w-6" />
            </div>
            <h1 className="text-lg font-bold text-sidebar-foreground">Zallpy Cloud</h1>
          </div>
          <div className="mt-2 text-xs text-sidebar-foreground/70">Hotel Management System</div>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    className={cn(
                      isActive(item.path) && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                    asChild
                  >
                    <Link to={item.path}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <div className="mt-auto">
          <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {bottomMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      className={cn(
                        isActive(item.path) && "bg-sidebar-accent text-sidebar-accent-foreground"
                      )}
                      asChild
                    >
                      <Link to={item.path}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
