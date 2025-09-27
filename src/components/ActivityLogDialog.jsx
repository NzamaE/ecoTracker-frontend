import { useState, useEffect } from "react"
import { CalendarIcon, Loader, Lightbulb, TrendingUp, AlertTriangle } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { activityService, activityHelpers } from "@/services/activityService"
import { websocketService } from "@/services/websocketService"
import { useForm } from "react-hook-form"

export default function ActivityLogDialog({ open, onOpenChange, onActivitySaved }) {
  const [loading, setLoading] = useState(false)
  const [calculatingPreview, setCalculatingPreview] = useState(false)
  const [carbonPreview, setCarbonPreview] = useState(null)
  const [realTimeTip, setRealTimeTip] = useState(null)
  const [goalStatus, setGoalStatus] = useState(null)
  
  const form = useForm({
    defaultValues: {
      activityName: "",
      activityType: "",
      description: "",
      quantity: {
        value: "",
        unit: ""
      },
      activityDetails: {}
    }
  })

  const watchedActivityType = form.watch("activityType")
  const watchedQuantity = form.watch("quantity")
  const watchedActivityDetails = form.watch("activityDetails")

  // Fetch current goal status when dialog opens
  useEffect(() => {
    if (open) {
      fetchGoalStatus()
    }
  }, [open])

  const fetchGoalStatus = async () => {
    try {
      const goalData = await activityService.getEmissionGoalProgress()
      if (goalData.hasActiveGoal) {
        setGoalStatus(goalData)
      }
    } catch (error) {
      console.error('Failed to fetch goal status:', error)
    }
  }

  // Calculate carbon preview when relevant fields change
  useEffect(() => {
    const calculatePreview = async () => {
      if (watchedActivityType && watchedQuantity?.value && watchedQuantity?.unit) {
        try {
          setCalculatingPreview(true)
          const preview = await activityService.calculateCarbonPreview({
            activityType: watchedActivityType,
            quantity: {
              value: parseFloat(watchedQuantity.value),
              unit: watchedQuantity.unit
            },
            activityDetails: watchedActivityDetails
          })
          setCarbonPreview(preview)
          
          // Generate preview tip based on goal status and emission level
          if (goalStatus && preview.calculatedCarbonFootprint) {
            generatePreviewTip(preview.calculatedCarbonFootprint)
          }
        } catch (error) {
          console.error("Failed to calculate preview:", error)
          setCarbonPreview(null)
          setRealTimeTip(null)
        } finally {
          setCalculatingPreview(false)
        }
      } else {
        setCarbonPreview(null)
        setRealTimeTip(null)
      }
    }

    const timeoutId = setTimeout(calculatePreview, 500) // Debounce
    return () => clearTimeout(timeoutId)
  }, [watchedActivityType, watchedQuantity, watchedActivityDetails, goalStatus])

  const generatePreviewTip = (carbonFootprint) => {
    if (!goalStatus || !goalStatus.hasActiveGoal) return

    const { goal, progress } = goalStatus
    const remainingBudget = progress.remainingBudget
    const daysRemaining = progress.daysRemaining

    // Check if this activity would exceed budget
    const newTotal = progress.currentEmissions + carbonFootprint
    const wouldExceedBudget = newTotal > goal.targetEmissions

    if (wouldExceedBudget) {
      const excess = newTotal - goal.targetEmissions
      setRealTimeTip({
        type: 'warning',
        title: 'Budget Alert!',
        message: `This activity would put you ${excess.toFixed(1)} kg CO₂ over your ${goal.timeframe} goal.`,
        suggestions: getAlternativeSuggestions(watchedActivityType)
      })
    } else if (carbonFootprint > remainingBudget * 0.5) {
      setRealTimeTip({
        type: 'alert',
        title: 'High Impact Activity',
        message: `This uses ${((carbonFootprint / remainingBudget) * 100).toFixed(0)}% of your remaining budget.`,
        suggestions: getOptimizationSuggestions(watchedActivityType, watchedActivityDetails)
      })
    } else if (carbonFootprint < 1) {
      setRealTimeTip({
        type: 'success',
        title: 'Low Carbon Choice!',
        message: `Great choice! This activity has minimal environmental impact.`,
        suggestions: []
      })
    } else {
      setRealTimeTip(null)
    }
  }

  const getAlternativeSuggestions = (activityType) => {
    const suggestions = {
      transport: ['Walk or cycle instead', 'Use public transport', 'Combine trips'],
      food: ['Try plant-based option', 'Choose local produce', 'Smaller portion'],
      energy: ['Use LED lighting', 'Lower thermostat', 'Unplug devices'],
      waste: ['Recycle if possible', 'Compost organic waste', 'Reduce packaging']
    }
    return suggestions[activityType] || ['Consider eco-friendly alternatives']
  }

  const getOptimizationSuggestions = (activityType, details) => {
    if (activityType === 'transport' && details?.transportMode === 'car_gasoline') {
      return ['Consider carpooling', 'Plan efficient route', 'Use hybrid next time']
    }
    if (activityType === 'food' && details?.foodType === 'beef') {
      return ['Try chicken instead', 'Reduce portion size', 'Add more vegetables']
    }
    return ['Look for more efficient options']
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      
      const activityData = {
        ...data,
        quantity: {
          value: parseFloat(data.quantity.value),
          unit: data.quantity.unit
        },
        date: new Date().toISOString(),
        activityDetails: data.activityDetails || {}
      }

      // Submit activity - this will trigger WebSocket real-time tips from backend
      const response = await activityService.createActivity(activityData)
      
      // Show success message
      toast.success("Activity logged successfully!", {
        description: `${activityHelpers.formatCarbonFootprint(response.activity.calculatedCarbonFootprint)} added to your footprint`
      })

      // Show any additional tip from the response
      if (response.realTimeTip) {
        const tipType = response.realTimeTip.type === 'warning' ? 'warning' : 
                       response.realTimeTip.type === 'success' ? 'success' : 'info'
        toast[tipType](response.realTimeTip.title, {
          description: response.realTimeTip.message
        })
      }

      // Reset form and close dialog
      form.reset()
      setCarbonPreview(null)
      setRealTimeTip(null)
      onActivitySaved?.()
      
    } catch (error) {
      console.error("Failed to log activity:", error)
      toast.error(error.message || "Failed to log activity. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    form.reset()
    setCarbonPreview(null)
    setRealTimeTip(null)
    onOpenChange(false)
  }

  const getTipIcon = (type) => {
    switch (type) {
      case 'warning': return AlertTriangle
      case 'alert': return TrendingUp
      case 'success': return Lightbulb
      default: return Lightbulb
    }
  }

  const getTipColors = (type) => {
    switch (type) {
      case 'warning': return 'border-red-200 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'
      case 'alert': return 'border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
      case 'success': return 'border-green-200 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200'
      default: return 'border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
    }
  }

  const getActivitySpecificFields = () => {
    switch (watchedActivityType) {
      case 'transport':
        return (
          <FormField
            control={form.control}
            name="activityDetails.transportMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transport Mode *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transport mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {activityHelpers.getTransportModes().map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{mode.label}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {mode.emissionIntensity}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      
      case 'energy':
        return (
          <FormField
            control={form.control}
            name="activityDetails.energySource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Energy Source *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select energy source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {activityHelpers.getEnergySources().map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{source.label}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {source.emissionIntensity}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      
      case 'food':
        return (
          <FormField
            control={form.control}
            name="activityDetails.foodType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Food Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select food type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {activityHelpers.getFoodTypes().map((food) => (
                      <SelectItem key={food.value} value={food.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{food.label}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {food.emissionIntensity}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      
      case 'waste':
        return (
          <>
            <FormField
              control={form.control}
              name="activityDetails.wasteType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Waste Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select waste type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activityHelpers.getWasteTypes().map((waste) => (
                        <SelectItem key={waste.value} value={waste.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{waste.label}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {waste.emissionIntensity}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="activityDetails.disposalMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disposal Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select disposal method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activityHelpers.getDisposalMethods().map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{method.label}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {method.emissionIntensity}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )
      
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log New Activity</DialogTitle>
          <DialogDescription>
            Add a new carbon footprint activity with real-time impact preview and smart recommendations.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="activityName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Morning commute" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activityHelpers.getActivityTypes().map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the activity..."
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity.value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity.unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activityHelpers.getQuantityUnitsByType(watchedActivityType).map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Activity-specific fields */}
            {getActivitySpecificFields()}

            {/* Timestamp info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              <CalendarIcon className="h-4 w-4" />
              <span>Activity will be logged at: <strong>{format(new Date(), "PPP 'at' p")}</strong></span>
            </div>

            {/* Carbon Footprint Preview */}
            {(carbonPreview || calculatingPreview) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb className="size-4" />
                    Impact Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {calculatingPreview ? (
                    <div className="flex items-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Calculating...</span>
                    </div>
                  ) : carbonPreview ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Estimated CO₂:</span>
                        <Badge variant="secondary" className="font-mono">
                          {activityHelpers.formatCarbonFootprint(carbonPreview.calculatedCarbonFootprint)}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Emission factor: {carbonPreview.emissionFactor} kg CO₂/{carbonPreview.calculation.quantity?.replace(/[\d.]/g, '')}
                      </div>

                      {/* Goal Context */}
                      {goalStatus && goalStatus.hasActiveGoal && (
                        <div className="pt-2 border-t">
                          <div className="text-xs text-muted-foreground mb-1">Goal Impact:</div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Remaining budget:</span>
                            <span className="font-medium">
                              {goalStatus.progress.remainingBudget.toFixed(1)} kg CO₂
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : null}
                </CardContent>
              </Card>
            )}

            {/* Real-time Tip Preview */}
            {realTimeTip && (
              <Alert className={getTipColors(realTimeTip.type)}>
                <div className="flex items-start gap-2">
                  {(() => {
                    const Icon = getTipIcon(realTimeTip.type)
                    return <Icon className="size-4 mt-0.5" />
                  })()}
                  <div className="flex-1">
                    <AlertDescription>
                      <div className="font-medium text-sm mb-1">{realTimeTip.title}</div>
                      <div className="text-sm mb-2">{realTimeTip.message}</div>
                      {realTimeTip.suggestions.length > 0 && (
                        <div className="text-xs">
                          <span className="font-medium">Consider: </span>
                          {realTimeTip.suggestions.slice(0, 2).join(', ')}
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Logging...
                  </>
                ) : (
                  "Log Activity"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}