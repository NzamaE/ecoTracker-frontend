import { useState, useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/sidebar"
import DashboardNavbar from "@/components/sidebar/dashboardNavbar"
import { SectionCards } from "@/components/goals-section-cards"
import { GoalProgress } from "@/components/goals-progress"
import ActivityLogDialog from "@/components/ActivityLogDialog"
import ChartPieLabelList from "@/components/Charts/chart-pie-label-list"
import ChartLineWeekly from "@/components/Charts/chart-line-linear"
import { RealTimeTips } from "@/components/RealTimeTips"
import { GoalDialog } from "@/components/GoalLogDialog"
import { websocketService } from "@/services/websocketService"
import { toast } from "sonner"
import './dashboard.css'

export default function Dashboard() {
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false)
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [goalData, setGoalData] = useState(null)
  const [weeklyInsights, setWeeklyInsights] = useState(null)

  useEffect(() => {
    // Initialize WebSocket connection for real-time updates
    websocketService.connect()

    // Listen for all WebSocket events
    const handleWeeklyInsights = (data) => {
      setWeeklyInsights(data)
      toast.info(`Weekly insight: ${data.keyInsight?.title}`, {
        description: data.keyInsight?.message
      })
    }

    const handleGoalSet = (data) => {
      toast.success(`Goal set successfully!`, {
        description: data.message
      })
      setRefreshTrigger(prev => prev + 1)
    }

    const handleGoalMilestone = (data) => {
      toast.info(`Goal Milestone: ${data.progress}%`, {
        description: data.message
      })
      setRefreshTrigger(prev => prev + 1)
    }

    const handleTrendAlert = (data) => {
      toast.warning('Emission Trend Alert', {
        description: data.message
      })
    }

    const handleGoalStatusUpdate = (data) => {
      const toastType = data.urgency === 'high' ? 'error' : 
                       data.urgency === 'medium' ? 'warning' : 'info'
      toast[toastType]('Goal Status Update', {
        description: data.message
      })
      setRefreshTrigger(prev => prev + 1)
    }

    // Register all WebSocket listeners
    websocketService.onWeeklyInsights(handleWeeklyInsights)
    websocketService.onGoalSet(handleGoalSet)
    websocketService.onGoalMilestone(handleGoalMilestone)
    websocketService.onTrendAlert(handleTrendAlert)
    websocketService.onGoalStatusUpdate(handleGoalStatusUpdate)

    return () => {
      websocketService.offWeeklyInsights(handleWeeklyInsights)
      websocketService.offGoalSet(handleGoalSet)
      websocketService.offGoalMilestone(handleGoalMilestone)
      websocketService.offTrendAlert(handleTrendAlert)
      websocketService.offGoalStatusUpdate(handleGoalStatusUpdate)
      websocketService.disconnect()
    }
  }, [])

  const handleAddActivity = () => {
    setIsActivityDialogOpen(true)
  }

  const handleSetGoal = () => {
    setIsGoalDialogOpen(true)
  }

  const handleEditActivity = (activity) => {
    console.log("Edit activity:", activity)
  }

  const handleActivitySaved = () => {
    setIsActivityDialogOpen(false)
    // Trigger refresh of all components
    setRefreshTrigger(prev => prev + 1)
  }

  const handleGoalSaved = () => {
    setIsGoalDialogOpen(false)
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div>
      <DashboardNavbar 
        onAddActivity={handleAddActivity}
      />
      
      <div className="flex flex-1 flex-col container">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <GoalProgress 
              onAddActivity={handleAddActivity}
              onEditActivity={handleEditActivity}
              onSetGoal={handleSetGoal}
              refreshTrigger={refreshTrigger}
              weeklyInsights={weeklyInsights}
            />
            <SectionCards refreshTrigger={refreshTrigger} />
            
            {/* Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartPieLabelList refreshTrigger={refreshTrigger} />
              <ChartLineWeekly refreshTrigger={refreshTrigger} />
              
              {/* Additional Metrics placeholder */}
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

      {/* Activity Dialog */}
      <ActivityLogDialog 
        open={isActivityDialogOpen}
        onOpenChange={setIsActivityDialogOpen}
        onActivitySaved={handleActivitySaved}
      />

      {/* Goal Dialog */}
      <GoalDialog 
        open={isGoalDialogOpen}
        onOpenChange={setIsGoalDialogOpen}
        onGoalSaved={handleGoalSaved}
      />

      {/* Real-time Tips Component */}
      <RealTimeTips />
    </div>
  )
}