import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/sidebar"
import DashboardNavbar from "@/components/sidebar/dashboardNavbar"
import { SectionCards } from "@/components/section-cards"
import { DataTable } from "@/components/data-table"
import ActivityLogDialog from "@/components/ActivityLogDialog"

import './dashboard.css'

export default function Dashboard() {
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false)

  const handleAddActivity = () => {
    setIsActivityDialogOpen(true)
  }

  const handleEditActivity = (activity) => {
    console.log("Edit activity:", activity)
    // You can implement edit functionality here
  }

  const handleActivitySaved = () => {
    setIsActivityDialogOpen(false)
    // Optionally refresh data or show success message
  }

  return (
    <div >
      <DashboardNavbar 
        onAddActivity={handleAddActivity}
      />
      
      <div className="flex flex-1 flex-col container">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <DataTable 
              onAddActivity={handleAddActivity}
              onEditActivity={handleEditActivity}
            />
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