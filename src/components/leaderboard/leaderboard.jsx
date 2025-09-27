import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/sidebar"
import DashboardNavbar from "@/components/sidebar/dashboardNavbar"
import { LeaderboardCards } from "@/components/leaderboard/leaderboard-cards"
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table"
import ActivityLogDialog from "@/components/ActivityLogDialog"

export default function Leaderboard() {
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false)

  const handleAddActivity = () => {
    setIsActivityDialogOpen(true)
  }

  const handleActivitySaved = () => {
    setIsActivityDialogOpen(false)
  }

  return (
    <div className="container">
      <DashboardNavbar 
        onAddActivity={handleAddActivity}
      />
      
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <LeaderboardCards />
            <LeaderboardTable />
          </div>
        </div>
      </div>

      {/* Activity Dialog */}
      <ActivityLogDialog 
        open={isActivityDialogOpen}
        onOpenChange={setIsActivityDialogOpen}
        onActivitySaved={handleActivitySaved}
      />
    </div>
  )
}