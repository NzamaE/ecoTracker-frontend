import { useState, useEffect } from "react"
import {
  IconPlus,
  IconTarget,
  IconTrendingUp,
  IconTrendingDown,
  IconCalendar,
  IconFlame,
  IconLeaf,
  IconSettings
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from "sonner"

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export function GoalProgress({ onSetGoal, refreshTrigger, weeklyInsights }) {
  const [goalData, setGoalData] = useState(null)
  const [weeklyAnalysis, setWeeklyAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch goal progress data
  const fetchGoalProgress = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/insights/emission-goal-progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setGoalData(data)
      } else {
        setGoalData({ hasActiveGoal: false })
      }
    } catch (err) {
      console.error('Error fetching goal progress:', err)
      setError('Failed to load goal progress')
    }
  }

  // Fetch weekly analysis for insights
  const fetchWeeklyAnalysis = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/insights/weekly-analysis`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setWeeklyAnalysis(data)
      }
    } catch (err) {
      console.error('Error fetching weekly analysis:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoalProgress()
    fetchWeeklyAnalysis()
  }, [refreshTrigger])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    toast.error('Failed to load goal progress', {
      description: error
    })
    return null
  }

  // If no active goal, show insights from weekly analysis
  if (!goalData?.hasActiveGoal) {
    const highestCategory = weeklyAnalysis?.highestEmissionCategory
    const totalEmissions = weeklyAnalysis?.totalWeeklyEmissions || 0
    const categoryData = weeklyAnalysis?.categoryBreakdown?.find(c => c.category === highestCategory)

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <IconLeaf className="size-5 text-green-600" />
              Weekly Carbon Overview
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onSetGoal}
              className="flex items-center gap-2"
            >
              <IconTarget className="size-4" />
              Set Goal
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {highestCategory ? (
            <div className="space-y-4">
              {/* Highest Category Alert */}
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3">
                  <IconFlame className="size-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-800 dark:text-orange-200">
                      Highest Impact: {highestCategory.charAt(0).toUpperCase() + highestCategory.slice(1)}
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      {categoryData?.percentage}% of your emissions ({categoryData?.totalEmissions?.toFixed(1)} kg CO₂)
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="border-orange-300">
                  Focus Area
                </Badge>
              </div>

              {/* Weekly Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {totalEmissions.toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">kg CO₂ this week</p>
                </div>
                
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {weeklyAnalysis?.activitiesThisWeek || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">activities logged</p>
                </div>
                
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1">
                    {totalEmissions > 35 ? (
                      <>
                        <IconTrendingUp className="size-4 text-red-500" />
                        <p className="text-2xl font-bold text-red-600">Above</p>
                      </>
                    ) : (
                      <>
                        <IconTrendingDown className="size-4 text-green-500" />
                        <p className="text-2xl font-bold text-green-600">Below</p>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">global average</p>
                </div>
              </div>

              {/* Top Tip */}
              {weeklyAnalysis?.weeklyTips?.length > 0 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <IconLeaf className="size-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200 text-sm">
                        Weekly Tip
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        {weeklyAnalysis.weeklyTips[0].tip}
                        {weeklyAnalysis.weeklyTips[0].potentialSaving > 0 && (
                          <span className="font-medium ml-1">
                            (Save ~{weeklyAnalysis.weeklyTips[0].potentialSaving} kg CO₂)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <IconLeaf className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">Start Your Carbon Journey</h3>
              <p className="text-muted-foreground mb-4">
                Log your first activity to see personalized insights and set emission goals.
              </p>
              <Button onClick={onSetGoal} className="flex items-center gap-2">
                <IconTarget className="size-4" />
                Set Your First Goal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Active goal view
  const { goal, progress } = goalData
  const progressPercentage = Math.min(progress.progressPercentage, 100)
  const isOverBudget = progress.currentEmissions > goal.targetEmissions
  const daysLeft = progress.daysRemaining

  const getProgressColor = () => {
    if (isOverBudget) return "bg-gradient-to-r from-red-500 to-red-600"
    if (progressPercentage > 85) return "bg-gradient-to-r from-amber-500 to-orange-500"
    if (progressPercentage > 50) return "bg-gradient-to-r from-blue-500 to-blue-600"
    return "bg-gradient-to-r from-green-500 to-green-600"
  }

  const getStatusInfo = () => {
    if (isOverBudget) return { 
      variant: "destructive", 
      text: "Over Budget", 
      icon: IconTrendingUp,
      color: "text-red-600"
    }
    if (progress.isOnTrack) return { 
      variant: "default", 
      text: "On Track", 
      icon: IconTarget,
      color: "text-green-600"
    }
    return { 
      variant: "secondary", 
      text: "Behind Target", 
      icon: IconFlame,
      color: "text-amber-600"
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <StatusIcon className={`size-5 ${statusInfo.color}`} />
            {goal.timeframe.charAt(0).toUpperCase() + goal.timeframe.slice(1)} Emission Goal
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={statusInfo.variant}>
              {statusInfo.text}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={onSetGoal}
              className="flex items-center gap-2"
            >
              <IconSettings className="size-4" />
              Adjust
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              Progress: {progressPercentage}%
            </span>
            <span className="text-muted-foreground">
              {progress.currentEmissions.toFixed(1)} / {goal.targetEmissions} kg CO₂
            </span>
          </div>
          
          <div className="relative">
            <Progress value={progressPercentage} className="h-3 bg-muted" />
            <div 
              className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Goal Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <IconCalendar className="size-4 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold">{daysLeft}</p>
            <p className="text-xs text-muted-foreground">days left</p>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <IconTarget className="size-4 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold">{goal.targetEmissions}</p>
            <p className="text-xs text-muted-foreground">kg CO₂ target</p>
          </div>

          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              {progress.remainingBudget > 0 ? (
                <IconTrendingDown className="size-4 text-green-500" />
              ) : (
                <IconTrendingUp className="size-4 text-red-500" />
              )}
            </div>
            <p className={`text-lg font-semibold ${
              progress.remainingBudget > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {Math.abs(progress.remainingBudget).toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">
              {progress.remainingBudget > 0 ? 'remaining' : 'over budget'}
            </p>
          </div>

          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <IconFlame className="size-4 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold">{progress.activitiesLogged}</p>
            <p className="text-xs text-muted-foreground">activities</p>
          </div>
        </div>

        {/* Contextual Tip */}
        {weeklyInsights?.topTip && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <IconLeaf className="size-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Smart Recommendation
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  {weeklyInsights.topTip.tip}
                  {weeklyInsights.topTip.potentialSaving > 0 && (
                    <span className="font-semibold ml-2 text-blue-800 dark:text-blue-200">
                      Potential saving: {weeklyInsights.topTip.potentialSaving} kg CO₂
                    </span>
                  )}
                </p>
                <Badge variant="outline" className="mt-2 border-blue-300 text-blue-700">
                  {weeklyInsights.topTip.difficulty || 'Easy'} to implement
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Category Info */}
        {goal.category !== 'all' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded">
            <IconTarget className="size-4" />
            <span>This goal tracks only {goal.category} activities</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}