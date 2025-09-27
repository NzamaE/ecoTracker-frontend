import { useState } from "react"
import {
  CompassIcon,
  FeatherIcon,
  HouseIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react"

import NotificationMenu from "@/components/notification-menu"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/sidebar"
import TeamSwitcher from "@/components/team-switcher"
import UserMenu from "@/components/user-menu"
import { Button } from "@/components/ui/button"


export default function DashboardNavbar({ onAddActivity }) {
  const handleLogActivity = () => {
    if (onAddActivity) {
      onAddActivity()
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b px-4 md:px-2 bg-background contain-to-nev">
      <div className="flex h-12 items-center justify-between gap-5">
        
        {/* Left side - Sidebar */}
       <SidebarProvider>
          <div className="flex">
            <AppSidebar />
          </div>
        </SidebarProvider>
                    
       
        
        {/* Right side */}
       <div className="flex flex-1 items-start justify-end gap-4 -mt-0">

          <Button
            size="sm"
            className="text-sm max-sm:aspect-square max-sm:p-0"
            onClick={handleLogActivity}
          >
            <PlusIcon
              className="opacity-60 sm:-ms-1"
              size={16}
              aria-hidden="true"
            />
            <span className="max-sm:sr-only">Log Activity</span>
          </Button>
          <NotificationMenu />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}