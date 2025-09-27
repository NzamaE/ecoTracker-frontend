import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, AlertTriangle, Target, Lightbulb } from "lucide-react"
import { LabelList, Pie, PieChart, Tooltip, ResponsiveContainer } from "recharts"
import { activityService } from "@/services/activityService"

const chartConfig = {
  emissions: {
    label: "Emissions",
  },
  transport: {
    label: "Transportation",
    color: "#dc2626",
  },
  energy: {
    label: "Energy", 
    color: "#ea580c",
  },
  food: {
    label: "Food",
    color: "#ca8a04",
  },
  waste: {
    label: "Waste",
    color: "#16a34a",
  },
  other: {
    label: "Other",
    color: "#6366f1",
  },
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">
          {chartConfig[data.category]?.label || data.category}
        </p>
        <p className="text-emerald-600">
          Emissions: {data.emissions} kg CO₂
        </p>
        <p className="text-sm text-gray-600">
          {data.percentage}% of total
        </p>
      </div>
    )
  }
  return null
}

const InsightCard = ({ insight }) => {
  const getInsightIcon = (type) => {
    switch (type) {
      case 'alert': return AlertTriangle
      case 'warning': return TrendingUp
      case 'success': return Target
      default: return Lightbulb
    }
  }

  const getInsightColors = (type, priority) => {
    if (type === 'alert' || priority === 'high') {
      return {
        bg: 'bg-red-50 border-red-200',
        icon: 'text-red-600',
        title: 'text-red-800',
        message: 'text-red-700'
      }
    } else if (type === 'warning' || priority === 'medium') {
      return {
        bg: 'bg-amber-50 border-amber-200',
        icon: 'text-amber-600',
        title: 'text-amber-800',
        message: 'text-amber-700'
      }
    } else if (type === 'success') {
      return {
        bg: 'bg-green-50 border-green-200',
        icon: 'text-green-600',
        title: 'text-green-800',
        message: 'text-green-700'
      }
    }
    return {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-800',
      message: 'text-blue-700'
    }
  }

  const Icon = getInsightIcon(insight.type)
  const colors = getInsightColors(insight.type, insight.priority)

  return (
    <div className={`p-4 rounded-lg border ${colors.bg}`}>
      <div className="flex items-start gap-3">
        <Icon className={`size-5 mt-0.5 ${colors.icon}`} />
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium text-sm ${colors.title}`}>
            {insight.title}
          </h4>
          <p className={`text-sm mt-1 ${colors.message}`}>
            {insight.message}
          </p>
          {insight.category && (
            <div className="flex items-center gap-2 mt-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: chartConfig[insight.category]?.color }}
              />
              <span className="text-xs capitalize text-gray-600">
                {chartConfig[insight.category]?.label}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function EnhancedPieChartWithInsights() {
  const [chartData, setChartData] = useState([])
  const [insights, setInsights] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch real analytics data
  useEffect(() => {
    const fetchWeeklyInsights = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get weekly analysis with insights
        const weeklyData = await activityService.getWeeklyAnalysis()
        
        console.log('Weekly analysis data:', weeklyData) // Debug log
        
        // Transform category breakdown for chart
        const transformedData = weeklyData.categoryBreakdown?.map(category => ({
          category: category.category,
          emissions: category.totalEmissions,
          percentage: category.percentage.toFixed(1),
          activityCount: category.activityCount,
          fill: chartConfig[category.category]?.color || "#6b7280"
        })) || []

        setChartData(transformedData)
        setInsights(weeklyData.insights || [])
        
        // Set analytics
        setAnalytics({
          totalEmissions: weeklyData.totalWeeklyEmissions || 0,
          highestCategory: weeklyData.highestEmissionCategory,
          activitiesThisWeek: weeklyData.activitiesThisWeek || 0,
          period: weeklyData.period || 'Last 7 days'
        })
        
      } catch (err) {
        console.error('Failed to fetch weekly insights:', err)
        setError('Failed to load insights data')
        
        // Fallback dummy data with insights
        setChartData([
          { category: "transport", emissions: 30.0, percentage: "50.0", activityCount: 8, fill: "#dc2626" },
          { category: "food", emissions: 18.5, percentage: "30.8", activityCount: 12, fill: "#ca8a04" },
          { category: "energy", emissions: 8.2, percentage: "13.7", activityCount: 5, fill: "#ea580c" },
          { category: "waste", emissions: 3.3, percentage: "5.5", activityCount: 3, fill: "#16a34a" },
        ])
        
        setInsights([
          {
            type: "alert",
            title: "Transport is your biggest contributor",
            message: "50% of your emissions (30.0 kg CO₂) come from transport activities.",
            category: "transport",
            priority: "high",
            actionable: true
          }
        ])
        
        setAnalytics({
          totalEmissions: 60.0,
          highestCategory: 'transport',
          activitiesThisWeek: 28,
          period: 'Last 7 days'
        })
        
      } finally {
        setLoading(false)
      }
    }

    fetchWeeklyInsights()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Insights</h3>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  const totalEmissions = analytics?.totalEmissions || 0
  const highestCategory = chartData.reduce((prev, current) => 
    (prev.emissions > current.emissions) ? prev : current
  , {})

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex flex-col items-center space-y-1.5 p-6 pb-0">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          Weekly Emissions Breakdown
        </h3>
        <p className="text-sm text-gray-600">
          {analytics?.period} • {analytics?.activitiesThisWeek} activities logged
        </p>
      </div>
      
      {/* Chart */}
      <div className="flex-1 p-6 pb-0">
        <div className="mx-auto aspect-square max-h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie 
                data={chartData} 
                dataKey="emissions"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={30}
                paddingAngle={2}
              >
                <LabelList
                  dataKey="percentage"
                  className="fill-white font-medium"
                  stroke="none"
                  fontSize={11}
                  formatter={(value) => `${value}%`}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
          {chartData.map((item) => (
            <div key={item.category} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.fill }}
              ></div>
              <span className="capitalize">{chartConfig[item.category]?.label}</span>
              <span className="text-gray-500 ml-auto">{item.emissions} kg</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 text-sm">
         
         
        </div>
      </div>

    </div>
  )
}