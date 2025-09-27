import { Calendar, Home, Inbox, Search, Settings, LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  IconChartBar,
  IconListDetails,
} from "@tabler/icons-react"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Leaderboard", 
    url: "/leaderboard",
    icon: IconListDetails,
  },
  {
    title: "Insights", 
    url: "/insights",
    icon: IconChartBar,
  },
  {
    title: "Goals",
    url: "/goals", 
    icon: Settings,
  },
]

export function AppSidebar() {
  const handleSignOut = () => {
    localStorage.removeItem("token")
    window.location.href = "/login"
  }

  return (
    <Sidebar className="h-full">
      <SidebarHeader className="border-b px-6 py-4">
        <h2 className="text-xl font-bold text-primary">ecoTracker</h2>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-4">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2">
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t px-4 py-4">
        <SidebarMenuButton onClick={handleSignOut} className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
          <LogOut size={18} />
          <span>Sign Out</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}