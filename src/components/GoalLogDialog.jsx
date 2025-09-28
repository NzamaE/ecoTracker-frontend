import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Target, TrendingDown, Calendar } from "lucide-react"
import { toast } from "sonner"

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export function GoalDialog({ open, onOpenChange, onGoalSaved }) {
  const [loading, setLoading] = useState(false)
  const [baselineData, setBaselineData] = useState(null)
  const [formData, setFormData] = useState({
    targetEmissions: '',
    category: 'all',
    timeframe: 'weekly'
  })
  const [errors, setErrors] = useState({})

  // Fetch baseline data when dialog opens
  useEffect(() => {
    if (open) {
      fetchBaselineData()
    }
  }, [open, formData.timeframe, formData.category])

  const fetchBaselineData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const days = formData.timeframe === 'weekly' ? 7 : 30
      const endDate = new Date()
      const startDate = new Date(endDate - days * 24 * 60 * 60 * 1000)

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ...(formData.category !== 'all' && { activityType: formData.category })
      })

      const response = await fetch(`${API_BASE_URL}/activities/stats/summary?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBaselineData({
          emissions: data.summary.totalCarbonFootprint || 0,
          activities: data.summary.totalActivities || 0
        })
      }
    } catch (error) {
      console.error('Error fetching baseline data:', error)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.targetEmissions || formData.targetEmissions <= 0) {
      newErrors.targetEmissions = 'Target emissions must be greater than 0'
    }

    if (formData.targetEmissions && baselineData) {
      const target = parseFloat(formData.targetEmissions)
      const baseline = baselineData.emissions
      
      if (target >= baseline) {
        newErrors.targetEmissions = `Target should be lower than your current ${baseline.toFixed(1)} kg CO₂`
      }
      
      const reduction = ((baseline - target) / baseline) * 100
      if (reduction > 70) {
        newErrors.targetEmissions = 'Target reduction seems too ambitious (>70%). Consider a more achievable goal.'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${API_BASE_URL}/insights/set-emission-goal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetEmissions: parseFloat(formData.targetEmissions),
          category: formData.category,
          timeframe: formData.timeframe
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Emission goal set successfully!', {
          description: `${formData.timeframe} goal: ${formData.targetEmissions} kg CO₂`
        })
        onGoalSaved()
      } else {
        const errorData = await response.json()
        toast.error('Failed to set goal', {
          description: errorData.error || 'Please try again'
        })
      }
    } catch (error) {
      console.error('Error setting goal:', error)
      toast.error('Network error', {
        description: 'Please check your connection and try again'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({
        targetEmissions: '',
        category: 'all',
        timeframe: 'weekly'
      })
      setErrors({})
      setBaselineData(null)
      onOpenChange(false)
    }
  }

  const calculateReduction = () => {
    if (!baselineData || !formData.targetEmissions) return null
    
    const target = parseFloat(formData.targetEmissions)
    const baseline = baselineData.emissions
    
    if (baseline === 0) return null
    
    const reduction = ((baseline - target) / baseline) * 100
    return {
      percentage: Math.round(reduction),
      amount: baseline - target
    }
  }

  const reduction = calculateReduction()

  const getCategoryLabel = (category) => {
    const labels = {
      all: 'All Activities',
      transport: 'Transportation',
      energy: 'Energy Usage',
      food: 'Food & Diet',
      waste: 'Waste Management'
    }
    return labels[category] || category
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="size-5" />
            Set Emission Reduction Goal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Timeframe Selection */}
          <div className="space-y-2">
            <Label htmlFor="timeframe">Goal Period</Label>
            <Select
              value={formData.timeframe}
              onValueChange={(value) => setFormData(prev => ({ ...prev, timeframe: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly Goal</SelectItem>
                <SelectItem value="monthly">Monthly Goal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Activity Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="transport">Transportation</SelectItem>
                <SelectItem value="energy">Energy Usage</SelectItem>
                <SelectItem value="food">Food & Diet</SelectItem>
                <SelectItem value="waste">Waste Management</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Baseline Information */}
          {baselineData && (
            <Alert>
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    Current {formData.timeframe} emissions: <strong>{baselineData.emissions.toFixed(1)} kg CO₂</strong>
                  </span>
                  <Badge variant="outline">
                    {baselineData.activities} activities logged
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Target Emissions Input */}
          <div className="space-y-2">
            <Label htmlFor="targetEmissions">
              Target Emissions (kg CO₂)
              {baselineData && (
                <span className="text-sm text-muted-foreground ml-2">
                  • Must be less than {baselineData.emissions.toFixed(1)}
                </span>
              )}
            </Label>
            <Input
              id="targetEmissions"
              type="number"
              step="0.1"
              min="0.1"
              value={formData.targetEmissions}
              onChange={(e) => setFormData(prev => ({ ...prev, targetEmissions: e.target.value }))}
              placeholder="e.g., 20.0"
            />
            {errors.targetEmissions && (
              <p className="text-sm text-red-600">{errors.targetEmissions}</p>
            )}
          </div>

          {/* Reduction Preview */}
          {reduction && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <TrendingDown className="size-4" />
                <span className="font-medium">Goal Impact</span>
              </div>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Reduction target:</span>
                  <span className="font-medium">{reduction.percentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Emissions saved:</span>
                  <span className="font-medium">{reduction.amount.toFixed(1)} kg CO₂</span>
                </div>
                <div className="flex justify-between">
                  <span>Goal period:</span>
                  <span className="font-medium">{formData.timeframe}</span>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="font-medium">{getCategoryLabel(formData.category)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.targetEmissions}
            >
              {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
              Set Goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}