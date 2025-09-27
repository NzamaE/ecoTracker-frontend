import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { activityService } from "@/services/activityService"

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-emerald-600">
          CO₂ Emissions: {payload[0].value} kg
        </p>
      </div>
    )
  }
  return null
}

export default function EnhancedLineChart() {
  const [chartData, setChartData] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWeeklyTrends = async () => {
      try {
        setLoading(true)
        const trendsData = await activityService.getUserStats(7) // Get 7 days of data
        const weeklyAnalysis = await activityService.getDashboardData()
        
        // Transform data for line chart - weekly breakdown
        const transformedData = weeklyAnalysis.weeklyBreakdown?.map((week, index) => ({
          day: week.week,
          emissions: week.emissions
        })) || []

        setChartData(transformedData)
        
        // Calculate trend
        const totalEmissions = transformedData.reduce((sum, day) => sum + day.emissions, 0)
        const avgEmissions = totalEmissions / transformedData.length || 0
        
        setAnalytics({
          totalWeekEmissions: totalEmissions,
          avgDailyEmissions: avgEmissions,
          trend: trendsData.direction || 'stable',
          trendPercentage: trendsData.percentageChange || 0
        })
        
      } catch (error) {
        console.error('Failed to fetch weekly trends:', error)
        // Fallback data
        setChartData([
          { day: "Week 1", emissions: 12.5 },
          { day: "Week 2", emissions: 18.2 },
          { day: "Week 3", emissions: 15.8 },
          { day: "Week 4", emissions: 22.1 },
        ])
        setAnalytics({
          totalWeekEmissions: 68.6,
          avgDailyEmissions: 17.15,
          trend: 'increasing',
          trendPercentage: 8.3
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWeeklyTrends()
  }, [])

  const getTrendInfo = () => {
    if (!analytics) return { icon: Minus, color: 'text-gray-500', text: 'Loading...' }
    
    switch (analytics.trend) {
      case 'increasing':
        return { 
          icon: TrendingUp, 
          color: 'text-red-600', 
          text: `Trending up by ${Math.abs(analytics.trendPercentage).toFixed(1)}% this month` 
        }
      case 'decreasing':
        return { 
          icon: TrendingDown, 
          color: 'text-green-600', 
          text: `Trending down by ${Math.abs(analytics.trendPercentage).toFixed(1)}% this month` 
        }
      default:
        return { 
          icon: Minus, 
          color: 'text-blue-600', 
          text: 'Stable emissions this month' 
        }
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm animate-pulse">
        <div className="p-6">
          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-[300px] bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const trendInfo = getTrendInfo()
  const TrendIcon = trendInfo.icon

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-6 pb-0">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          Weekly Emission Trends
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          CO₂ emissions over the last 4 weeks
        </p>
      </div>
      
      <div className="p-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="day" 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8}
                fontSize={12}
                fill="#6b7280"
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8}
                fontSize={12}
                fill="#6b7280"
                tickFormatter={(value) => `${value}kg`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                dataKey="emissions" 
                type="monotone" 
                stroke="#059669" 
                strokeWidth={3}
                dot={{
                  fill: "#059669",
                  strokeWidth: 2,
                  r: 4
                }}
                activeDot={{
                  r: 6,
                  stroke: "#059669",
                  strokeWidth: 2,
                  fill: "#ffffff"
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="flex flex-col items-start gap-2 text-sm p-6 pt-0 border-t border-gray-100">
        <div className="flex gap-2 leading-none font-medium items-center">
          <TrendIcon className={`h-4 w-4 ${trendInfo.color}`} />
          <span className={trendInfo.color}>{trendInfo.text}</span>
        </div>
        <div className="text-gray-600 leading-none">
          Total this month: {analytics?.totalWeekEmissions?.toFixed(1)} kg CO₂
        </div>
      </div>
    </div>
  )
}
