import { useState, useEffect } from 'react'
import { websocketService } from '@/services/websocketService'
import { AlertTriangle, Info, CheckCircle, TrendingUp, X, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function RealTimeTips() {
  const [tips, setTips] = useState([])
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    // Don't auto-connect here since Dashboard already handles connection
    const handleActivityTip = (data) => {
      const tipWithId = {
        id: Date.now() + Math.random(), // More unique ID
        timestamp: new Date(),
        ...data
      }
      
      setTips(prev => [tipWithId, ...prev.slice(0, 2)]) // Keep only 3 tips max
      
      // Auto-remove after 15 seconds (longer for better UX)
      setTimeout(() => {
        setTips(prev => prev.filter(tip => tip.id !== tipWithId.id))
      }, 15000)
    }

    websocketService.onActivityTip(handleActivityTip)
    
    return () => {
      websocketService.offActivityTip(handleActivityTip)
    }
  }, [])

  const getTipIcon = (type) => {
    switch (type) {
      case 'warning': return AlertTriangle
      case 'alert': return TrendingUp
      case 'success': return CheckCircle
      case 'info': return Lightbulb
      default: return Info
    }
  }

  const getTipColors = (type) => {
    switch (type) {
      case 'warning': return {
        card: 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800',
        icon: 'text-red-600 dark:text-red-400',
        title: 'text-red-800 dark:text-red-200',
        text: 'text-red-700 dark:text-red-300'
      }
      case 'alert': return {
        card: 'border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800',
        icon: 'text-amber-600 dark:text-amber-400',
        title: 'text-amber-800 dark:text-amber-200',
        text: 'text-amber-700 dark:text-amber-300'
      }
      case 'success': return {
        card: 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800',
        icon: 'text-green-600 dark:text-green-400',
        title: 'text-green-800 dark:text-green-200',
        text: 'text-green-700 dark:text-green-300'
      }
      default: return {
        card: 'border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800',
        icon: 'text-blue-600 dark:text-blue-400',
        title: 'text-blue-800 dark:text-blue-200',
        text: 'text-blue-700 dark:text-blue-300'
      }
    }
  }

  const removeTip = (tipId) => {
    setTips(prev => prev.filter(tip => tip.id !== tipId))
  }

  const clearAllTips = () => {
    setTips([])
  }

  if (tips.length === 0) return null

  return (
    <div className={`fixed top-20 right-4 z-50 w-80 space-y-2 transition-all duration-300 ${
      isMinimized ? 'translate-x-72' : 'translate-x-0'
    }`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="size-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Smart Tips
          </span>
          <Badge variant="secondary" className="text-xs">
            {tips.length}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 w-6 p-0"
          >
            {isMinimized ? '←' : '→'}
          </Button>
          {tips.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllTips}
              className="h-6 w-6 p-0"
            >
              <X className="size-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Tips */}
      {!isMinimized && tips.map((tipData) => {
        const Icon = getTipIcon(tipData.tip?.type)
        const colors = getTipColors(tipData.tip?.type)
        
        return (
          <Card
            key={tipData.id}
            className={`animate-in slide-in-from-right duration-300 ${colors.card} border shadow-lg`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Icon className={`size-5 mt-0.5 flex-shrink-0 ${colors.icon}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`font-medium text-sm ${colors.title}`}>
                      {tipData.tip?.title || 'Activity Tip'}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTip(tipData.id)}
                      className="h-5 w-5 p-0 opacity-60 hover:opacity-100"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                  
                  <p className={`text-sm mt-1 ${colors.text}`}>
                    {tipData.tip?.message}
                  </p>

                  {/* Activity Context */}
                  {tipData.activity && (
                    <div className="mt-2 text-xs opacity-75">
                      <span className="font-medium">Activity:</span> {tipData.activity.name} 
                      <span className="ml-2">({tipData.activity.emissions?.toFixed(1)} kg CO₂)</span>
                    </div>
                  )}
                  
                  {/* Suggestions */}
                  {tipData.tip?.suggestions?.length > 0 && tipData.tip.actionable && (
                    <div className="mt-3">
                      <p className={`text-xs font-medium ${colors.title} mb-1`}>
                        💡 Try these alternatives:
                      </p>
                      <ul className="text-xs space-y-1">
                        {tipData.tip.suggestions.slice(0, 2).map((suggestion, index) => (
                          <li key={index} className={`${colors.text} opacity-90`}>
                            • {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="mt-2 text-xs opacity-50">
                    {tipData.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Minimized indicator */}
      {isMinimized && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 p-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-4 text-blue-600" />
            <Badge variant="secondary" className="text-xs">
              {tips.length} tips
            </Badge>
          </div>
        </Card>
      )}
    </div>
  )
}