import { useState } from "react"
import DashboardNavbar from "@/components/sidebar/dashboardNavbar"
import ActivityLogDialog from "@/components/ActivityLogDialog"
import ChartPieLabelList from "@/components/Charts/chart-pie-label-list"
import ChartLineWeekly from "@/components/Charts/chart-line-linear"


export default function Insights() {
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false)

  const handleAddActivity = () => {
    setIsActivityDialogOpen(true)
  }

  const handleActivitySaved = () => {
    setIsActivityDialogOpen(false)
    // Optionally refresh data or show success message
  }

  return (
    <div className="container">
      <DashboardNavbar 
        onAddActivity={handleAddActivity}
      />
      
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Insights content */}
            <div className="px-4 lg:px-6">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Carbon Footprint Insights
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Track your environmental impact across different activities
                </p>
              </div>
              
              {/* Chart Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartPieLabelList />
                <ChartLineWeekly />
                
                {/* You can add more charts or components here */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Additional Metrics</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    More insights coming soon...
                  </p>
                </div>
              </div>
            </div>
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