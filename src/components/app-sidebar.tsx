import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  Swords,
  Utensils,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import "~/styles/globals.css";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "~/components/ui/sidebar";
import { SignOutButton } from "@clerk/nextjs";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  {
    title: "Scrims",
    url: "/scrims",
    icon: Swords,
  },
  {
    title: "Food",
    url: "/food",
    icon: Utensils,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent className="bg-zinc-950">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xl font-semibold text-white">
            Rogue Dashboard
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem className="pt-4 text-white" key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center gap-1">
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="text-m absolute inset-x-6 bottom-10 px-12 text-white">
          <button>
            <SignOutButton />
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
