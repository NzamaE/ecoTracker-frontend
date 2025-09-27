
import { useState, useEffect } from "react"
import { IconTrophy, IconMedal, IconAward, IconTrendingDown } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { activityService, activityHelpers } from "@/services/activityService"

export function LeaderboardCards() {
  const [leaderboardData, setLeaderboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch leaderboard data
  const fetchLeaderboardData = async () => {
    try {
      const data = await activityService.getLeaderboardData(30) // Last 30 days
      setLeaderboardData(data)
    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error)
      // Use dummy data for now
      setLeaderboardData({
        leaderboard: [
          {
            rank: 1,
            username: "EcoWarrior123",
            totalEmissions: 45.2,
            activityCount: 28,
            averagePerActivity: 1.61
          },
          {
            rank: 2, 
            username: "GreenThumb",
            totalEmissions: 52.8,
            activityCount: 25,
            averagePerActivity: 2.11
          },
          {
            rank: 3,
            username: "ClimateHero",
            totalEmissions: 58.1,
            activityCount: 30,
            averagePerActivity: 1.94
          }
        ],
        currentUser: {
          rank: 7,
          totalEmissions: 78.5,
          activityCount: 22,
          averagePerActivity: 3.57
        }
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboardData()
  }, [])

  const getPositionIcon = (rank) => {
    switch(rank) {
      case 1: return <IconTrophy className="size-6 text-yellow-500" />
      case 2: return <IconMedal className="size-6 text-gray-400" />
      case 3: return <IconAward className="size-6 text-amber-600" />
      default: return null
    }
  }

  const getPositionColor = (rank) => {
    switch(rank) {
      case 1: return "border-yellow-500/20 bg-yellow-50 dark:bg-yellow-950/10"
      case 2: return "border-gray-400/20 bg-gray-50 dark:bg-gray-950/10" 
      case 3: return "border-amber-600/20 bg-amber-50 dark:bg-amber-950/10"
      default: return ""
    }
  }

  if (loading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="@container/card animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-8"></div>
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

  const topThree = leaderboardData?.leaderboard?.slice(0, 3) || []

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-3">
      {topThree.map((user, index) => (
        <Card key={user.rank} className={`@container/card ${getPositionColor(user.rank)}`}>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              {getPositionIcon(user.rank)}
              #{user.rank} Lowest Emissions
            </CardDescription>
            <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
              {user.username}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="border-green-500 text-green-700">
                <IconTrendingDown size={14} />
                {activityHelpers.formatCarbonFootprint(user.totalEmissions)}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {user.activityCount} activities logged
            </div>
            <div className="text-muted-foreground">
              Average: {activityHelpers.formatCarbonFootprint(user.averagePerActivity)} per activity
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}