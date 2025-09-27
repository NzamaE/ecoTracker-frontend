
import { useState, useEffect } from "react"
import { IconTrendingDown, IconTrendingUp, IconFlame, IconCalendarStats } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { activityService } from "@/services/activityService"

export function SectionCards() {
  const [dashboardData, setDashboardData] = useState(null)
  const [streakData, setStreakData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const data = await activityService.getDashboardData()
      setDashboardData(data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  // Fetch streak data
  const fetchStreakData = async () => {
    try {
      const data = await activityService.getStreakData()
      setStreakData(data)
    } catch (error) {
      console.error('Failed to fetch streak data:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchDashboardData(), fetchStreakData()])
      setLoading(false)
    }
    loadData()
  }, [])

  // Helper functions
  const formatCarbonFootprint = (value) => {
    if (!value) return "0.00 kg"
    return `${value.toFixed(2)} kg CO₂`
  }

  const getStreakIcon = () => {
    if (!streakData?.currentStreak) return null
    if (streakData.currentStreak >= 7) return <IconFlame className="size-4 text-orange-500" />
    return <IconCalendarStats className="size-4" />
  }

  const getEmissionTrend = () => {
    if (!dashboardData) return { icon: IconTrendingUp, text: "Loading...", variant: "secondary" }
    
    const comparison = dashboardData.comparisonToCommunity || 0
    if (comparison < 0) {
      return {
        icon: IconTrendingDown,
        text: `${Math.abs(comparison).toFixed(1)} kg below average`,
        variant: "success"
      }
    } else if (comparison > 0) {
      return {
        icon: IconTrendingUp,
        text: `${comparison.toFixed(1)} kg above average`,
        variant: "destructive"
      }
    }
    return {
      icon: IconTrendingUp,
      text: "At community average",
      variant: "secondary"
    }
  }

  if (loading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-8 bg-muted rounded w-32"></div>
            </CardHeader>
            <CardFooter>
              <div className="h-4 bg-muted rounded w-full"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  const emissionTrend = getEmissionTrend()

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 container">
      
      {/* Total Emissions Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Emissions (30 days)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCarbonFootprint(dashboardData?.totalEmissions)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={emissionTrend.variant === 'success' ? 'border-green-500 text-green-700' : emissionTrend.variant === 'destructive' ? 'border-red-500 text-red-700' : ''}>
              <emissionTrend.icon size={14} />
              {dashboardData?.comparisonToCommunity ? 
                (dashboardData.comparisonToCommunity < 0 ? 'Below Avg' : 'Above Avg') : 
                'Loading...'
              }
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {emissionTrend.text}
          </div>
          <div className="text-muted-foreground">
            Community average: {formatCarbonFootprint(dashboardData?.communityAverage)}
          </div>
        </CardFooter>
      </Card>

      {/* Current Streak Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Current Streak</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-2">
            {streakData?.currentStreak || 0}
            {getStreakIcon()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {streakData?.currentStreak >= streakData?.longestStreak ? (
                <>
                  <IconTrendingUp size={14} />
                  Personal Best!
                </>
              ) : (
                <>
                  <IconCalendarStats size={14} />
                  {streakData?.longestStreak || 0} max
                </>
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {streakData?.currentStreak > 0 ? (
              <>
                Keep it up! <IconFlame className="size-4 text-orange-500" />
              </>
            ) : (
              <>
                Start your streak today! <IconCalendarStats className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            Longest streak: {streakData?.longestStreak || 0} days
          </div>
        </CardFooter>
      </Card>

      {/* Activities This Month Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Activities Logged</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {dashboardData?.activitiesCount || 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp size={14} />
              {streakData?.totalDays || 0} active days
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {streakData?.averageActivitiesPerDay ? 
              `${streakData.averageActivitiesPerDay.toFixed(1)} per day average` :
              'Start logging activities'
            } <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {streakData?.totalDays || 0} days with activity logged
          </div>
        </CardFooter>
      </Card>

      {/* Weekly Progress Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>This Week's Progress</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {streakData?.weeklySummary?.[3]?.daysActive || 0}/7
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {streakData?.weeklySummary?.[3]?.totalActivities || 0 > 0 ? (
                <>
                  <IconTrendingUp size={14} />
                  {formatCarbonFootprint(streakData.weeklySummary[3].totalEmissions)}
                </>
              ) : (
                <>
                  <IconCalendarStats size={14} />
                  Get started
                </>
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {streakData?.weeklySummary?.[3]?.daysActive >= 5 ? (
              <>
                Great week! <IconTrendingUp className="size-4" />
              </>
            ) : (
              <>
                {7 - (streakData?.weeklySummary?.[3]?.daysActive || 0)} days to go
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            {streakData?.weeklySummary?.[3]?.totalActivities || 0} activities this week
          </div>
        </CardFooter>
      </Card>

    </div>
  );
}

