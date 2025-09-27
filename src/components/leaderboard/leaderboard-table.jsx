import * as React from "react"
import { useState, useEffect } from "react"
import {
  IconTrophy,
  IconMedal, 
  IconAward,
  IconRefresh,
  IconLoader
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { activityService, activityHelpers } from "@/services/activityService"

export function LeaderboardTable() {
  const [leaderboardData, setLeaderboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true)
      const data = await activityService.getLeaderboardData(period)
      setLeaderboardData(data)
    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error)
      // Dummy data for demonstration
      setLeaderboardData({
        leaderboard: [
          { rank: 1, username: "EcoWarrior123", totalEmissions: 45.2, activityCount: 28, averagePerActivity: 1.61 },
          { rank: 2, username: "GreenThumb", totalEmissions: 52.8, activityCount: 25, averagePerActivity: 2.11 },
          { rank: 3, username: "ClimateHero", totalEmissions: 58.1, activityCount: 30, averagePerActivity: 1.94 },
          { rank: 4, username: "CarbonCutter", totalEmissions: 62.3, activityCount: 22, averagePerActivity: 2.83 },
          { rank: 5, username: "EcoFriendly", totalEmissions: 67.5, activityCount: 24, averagePerActivity: 2.81 },
          { rank: 6, username: "GreenLiving", totalEmissions: 71.2, activityCount: 26, averagePerActivity: 2.74 },
          { rank: 7, username: "PlanetSaver", totalEmissions: 78.5, activityCount: 22, averagePerActivity: 3.57 },
          { rank: 8, username: "EcoMinded", totalEmissions: 82.1, activityCount: 25, averagePerActivity: 3.28 },
          { rank: 9, username: "GreenGoals", totalEmissions: 89.4, activityCount: 27, averagePerActivity: 3.31 },
          { rank: 10, username: "ClimateAware", totalEmissions: 95.2, activityCount: 29, averagePerActivity: 3.28 }
        ],
        currentUser: {
          rank: 7,
          username: "PlanetSaver", 
          totalEmissions: 78.5,
          activityCount: 22,
          averagePerActivity: 3.57
        },
        period: `${period} days`
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboardData()
  }, [period])

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return <IconTrophy className="size-4 text-yellow-500" />
      case 2: return <IconMedal className="size-4 text-gray-400" />
      case 3: return <IconAward className="size-4 text-amber-600" />
      default: return <span className="text-sm font-medium w-4 text-center">#{rank}</span>
    }
  }

  const getRankRowClass = (rank, username, currentUser) => {
    if (currentUser && username === currentUser.username) {
      return "bg-blue-50 dark:bg-blue-950/20 border-l-2 border-l-blue-500"
    }
    if (rank <= 3) {
      return "bg-green-50 dark:bg-green-950/10"
    }
    return ""
  }

  return (
    <Tabs defaultValue="leaderboard" className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <TabsList>
          <TabsTrigger value="leaderboard">
            Community Leaderboard - Lowest Carbon Footprint
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchLeaderboardData}
            disabled={loading}
          >
            {loading ? (
              <IconLoader size={16} className="animate-spin" />
            ) : (
              <IconRefresh size={16} />
            )}
            <span className="hidden lg:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <TabsContent value="leaderboard" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <IconLoader className="animate-spin" />
              <span>Loading leaderboard...</span>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead className="text-right">Total CO₂ (kg)</TableHead>
                  <TableHead className="text-center">Activities</TableHead>
                  <TableHead className="text-right">Avg per Activity</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData?.leaderboard?.map((user) => (
                  <TableRow 
                    key={user.rank}
                    className={getRankRowClass(user.rank, user.username, leaderboardData.currentUser)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center justify-center">
                        {getRankIcon(user.rank)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {user.username}
                        {leaderboardData.currentUser?.username === user.username && (
                          <Badge variant="secondary" className="text-xs">You</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {activityHelpers.formatCarbonFootprint(user.totalEmissions)}
                    </TableCell>
                    <TableCell className="text-center">
                      {user.activityCount}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {activityHelpers.formatCarbonFootprint(user.averagePerActivity)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={user.rank <= 3 ? 'border-green-500 text-green-700' : 'border-gray-500 text-gray-700'}
                      >
                        {user.rank === 1 ? 'Champion' : 
                         user.rank <= 3 ? 'Top 3' : 
                         user.rank <= 10 ? 'Top 10' : 'Good'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Current User Summary */}
        {leaderboardData?.currentUser && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Your Position</h3>
                <p className="text-sm text-muted-foreground">
                  You are ranked #{leaderboardData.currentUser.rank} with {' '}
                  {activityHelpers.formatCarbonFootprint(leaderboardData.currentUser.totalEmissions)} total emissions
                </p>
              </div>
              <div className="text-right">
                <Badge variant="secondary">
                  {leaderboardData.currentUser.activityCount} activities
                </Badge>
              </div>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}