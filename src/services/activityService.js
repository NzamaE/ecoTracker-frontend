import API from './api';

// Activity API service functions
export const activityService = {
  // Create a new activity (carbon footprint calculated automatically)
  createActivity: async (activityData) => {
    try {
      const response = await API.post('/activities', {
        activityName: activityData.activityName,
        activityType: activityData.activityType,
        description: activityData.description,
        quantity: {
          value: activityData.quantity.value,
          unit: activityData.quantity.unit
        },
        activityDetails: activityData.activityDetails || {},
        date: activityData.date || new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all activities with optional filters and pagination
  getActivities: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.activityType) params.append('activityType', filters.activityType);
      if (filters.activityName) params.append('activityName', filters.activityName);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await API.get(`/activities?${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get a single activity by ID
  getActivity: async (activityId) => {
    try {
      const response = await API.get(`/activities/${activityId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update an existing activity (carbon footprint recalculated automatically)
  updateActivity: async (activityId, activityData) => {
    try {
      const response = await API.put(`/activities/${activityId}`, {
        activityName: activityData.activityName,
        activityType: activityData.activityType,
        description: activityData.description,
        quantity: {
          value: activityData.quantity.value,
          unit: activityData.quantity.unit
        },
        activityDetails: activityData.activityDetails || {},
        date: activityData.date
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete an activity
  deleteActivity: async (activityId) => {
    try {
      const response = await API.delete(`/activities/${activityId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get activity statistics
  getActivityStats: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.activityType) params.append('activityType', filters.activityType);

      const response = await API.get(`/activities/stats/summary?${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get emission factors reference
  getEmissionFactors: async () => {
    try {
      const response = await API.get('/activities/reference/emission-factors');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Calculate carbon footprint preview without saving
  calculateCarbonPreview: async (activityData) => {
    try {
      const response = await API.post('/activities/calculate-preview', {
        activityType: activityData.activityType,
        quantity: {
          value: activityData.quantity.value,
          unit: activityData.quantity.unit
        },
        activityDetails: activityData.activityDetails || {}
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ===================================
  // DASHBOARD & ANALYTICS FUNCTIONS
  // ===================================

  // Get dashboard data with community comparison
  getDashboardData: async () => {
    try {
      const response = await API.get('/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get streak and weekly tracking data
  getStreakData: async () => {
    try {
      const response = await API.get('/streak');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get leaderboard data
  getLeaderboardData: async (period = '30') => {
    try {
      const response = await API.get(`/leaderboard?period=${period}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user statistics with period filter
  getUserStats: async (period = '30') => {
    try {
      const response = await API.get(`/stats?period=${period}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },


  // ===================================  
// INSIGHTS & ANALYTICS FUNCTIONS
// ===================================

// Get weekly analysis and insights
getWeeklyAnalysis: async () => {
  try {
    const response = await API.get('/insights/weekly-analysis');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
},

// Get personalized recommendations
getRecommendations: async () => {
  try {
    const response = await API.get('/insights/recommendations');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
},

// Get trends data for charts
getTrendsData: async (period = '30') => {
  try {
    const response = await API.get(`/insights/trends?period=${period}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
},

// Set weekly reduction goal
setWeeklyGoal: async (goalData) => {
  try {
    const response = await API.post('/insights/set-weekly-goal', goalData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
},

// Get weekly goal progress
getWeeklyGoalProgress: async () => {
  try {
    const response = await API.get('/insights/weekly-goal-progress');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
},

setEmissionGoal: async (goalData) => {
  try {
    const response = await API.post('/insights/set-emission-goal', goalData)
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
},

getEmissionGoalProgress: async () => {
  try {
    const response = await API.get('/insights/emission-goal-progress')
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
}


};

// Helper functions for common operations
export const activityHelpers = {
  // Format quantity for display
  formatQuantity: (quantity) => {
    return `${quantity.value}${quantity.unit}`;
  },

  // Get activity types for dropdowns
  getActivityTypes: () => {
    return [
      { value: 'transport', label: 'Transport' },
      { value: 'energy', label: 'Energy' },
      { value: 'food', label: 'Food' },
      { value: 'waste', label: 'Waste' },
      { value: 'other', label: 'Other' }
    ];
  },

  // Get transport modes for dropdowns
  getTransportModes: () => {
    return [
      { value: 'car_gasoline', label: 'Gasoline Car', emissionIntensity: 'high' },
      { value: 'car_diesel', label: 'Diesel Car', emissionIntensity: 'medium-high' },
      { value: 'car_hybrid', label: 'Hybrid Car', emissionIntensity: 'medium' },
      { value: 'car_electric', label: 'Electric Car', emissionIntensity: 'low' },
      { value: 'motorcycle', label: 'Motorcycle', emissionIntensity: 'medium' },
      { value: 'bus', label: 'Public Bus', emissionIntensity: 'low-medium' },
      { value: 'train', label: 'Train', emissionIntensity: 'low' },
      { value: 'plane_domestic', label: 'Domestic Flight', emissionIntensity: 'high' },
      { value: 'plane_international', label: 'International Flight', emissionIntensity: 'very-high' },
      { value: 'bicycle', label: 'Bicycle', emissionIntensity: 'zero' },
      { value: 'walking', label: 'Walking', emissionIntensity: 'zero' }
    ];
  },

  // Get energy sources for dropdowns
  getEnergySources: () => {
    return [
      { value: 'grid_average', label: 'Grid Average', emissionIntensity: 'medium' },
      { value: 'coal', label: 'Coal Power', emissionIntensity: 'very-high' },
      { value: 'natural_gas', label: 'Natural Gas', emissionIntensity: 'medium-high' },
      { value: 'nuclear', label: 'Nuclear Power', emissionIntensity: 'low' },
      { value: 'solar', label: 'Solar Power', emissionIntensity: 'very-low' },
      { value: 'wind', label: 'Wind Power', emissionIntensity: 'very-low' },
      { value: 'hydro', label: 'Hydroelectric', emissionIntensity: 'very-low' }
    ];
  },

  // Get food types for dropdowns
  getFoodTypes: () => {
    return [
      { value: 'beef', label: 'Beef', emissionIntensity: 'very-high' },
      { value: 'dairy_cheese', label: 'Cheese', emissionIntensity: 'high' },
      { value: 'pork', label: 'Pork', emissionIntensity: 'medium-high' },
      { value: 'chicken', label: 'Chicken', emissionIntensity: 'medium' },
      { value: 'fish', label: 'Fish', emissionIntensity: 'medium' },
      { value: 'processed_food', label: 'Processed Food', emissionIntensity: 'medium' },
      { value: 'dairy_milk', label: 'Milk', emissionIntensity: 'medium' },
      { value: 'vegetables', label: 'Vegetables', emissionIntensity: 'low' },
      { value: 'grains', label: 'Grains', emissionIntensity: 'low' },
      { value: 'fruits', label: 'Fruits', emissionIntensity: 'very-low' }
    ];
  },

  // Get waste types for dropdowns
  getWasteTypes: () => {
    return [
      { value: 'general_waste', label: 'General Waste', emissionIntensity: 'medium' },
      { value: 'hazardous', label: 'Hazardous Waste', emissionIntensity: 'very-high' },
      { value: 'compost', label: 'Compostable', emissionIntensity: 'low' },
      { value: 'recycling', label: 'Recycling', emissionIntensity: 'negative' }
    ];
  },

  // Get disposal methods for dropdowns
  getDisposalMethods: () => {
    return [
      { value: 'landfill', label: 'Landfill', emissionIntensity: 'high' },
      { value: 'incineration', label: 'Incineration', emissionIntensity: 'medium' },
      { value: 'recycling', label: 'Recycling', emissionIntensity: 'negative' },
      { value: 'composting', label: 'Composting', emissionIntensity: 'low' }
    ];
  },

  // Get common quantity units based on activity type
  getQuantityUnitsByType: (activityType) => {
    const unitsByType = {
      transport: [
        { value: 'km', label: 'Kilometers (km)' },
        { value: 'miles', label: 'Miles' },
        { value: 'm', label: 'Meters (m)' }
      ],
      energy: [
        { value: 'kWh', label: 'Kilowatt Hours (kWh)' },
        { value: 'MWh', label: 'Megawatt Hours (MWh)' },
        { value: 'BTU', label: 'British Thermal Units (BTU)' }
      ],
      food: [
        { value: 'kg', label: 'Kilograms (kg)' },
        { value: 'lbs', label: 'Pounds (lbs)' },
        { value: 'g', label: 'Grams (g)' },
        { value: 'servings', label: 'Servings' }
      ],
      waste: [
        { value: 'kg', label: 'Kilograms (kg)' },
        { value: 'lbs', label: 'Pounds (lbs)' },
        { value: 'g', label: 'Grams (g)' }
      ],
      other: [
        { value: 'items', label: 'Items' },
        { value: 'pieces', label: 'Pieces' },
        { value: 'hours', label: 'Hours' },
        { value: 'days', label: 'Days' }
      ]
    };

    return unitsByType[activityType] || unitsByType.other;
  },

  // Validate activity data before submission
  validateActivity: (activityData) => {
    const errors = {};

    if (!activityData.activityName?.trim()) {
      errors.activityName = 'Activity name is required';
    }

    if (!activityData.activityType) {
      errors.activityType = 'Activity type is required';
    }

    if (!activityData.description?.trim()) {
      errors.description = 'Description is required';
    }

    if (!activityData.quantity?.value || activityData.quantity.value <= 0) {
      errors.quantity = 'Quantity value must be greater than 0';
    }

    if (!activityData.quantity?.unit) {
      errors.unit = 'Quantity unit is required';
    }

    if (!activityData.date) {
      errors.date = 'Date is required';
    }

    // Validate activity-specific details
    if (activityData.activityType === 'transport' && !activityData.activityDetails?.transportMode) {
      errors.transportMode = 'Transport mode is required for transport activities';
    }

    if (activityData.activityType === 'energy' && !activityData.activityDetails?.energySource) {
      errors.energySource = 'Energy source is required for energy activities';
    }

    if (activityData.activityType === 'food' && !activityData.activityDetails?.foodType) {
      errors.foodType = 'Food type is required for food activities';
    }

    if (activityData.activityType === 'waste' && !activityData.activityDetails?.wasteType) {
      errors.wasteType = 'Waste type is required for waste activities';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Format date for display
  formatDate: (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Calculate total carbon footprint from activities array
  calculateTotalCarbon: (activities) => {
    return activities.reduce((total, activity) => total + (activity.carbonFootprint || 0), 0);
  },

  // Format carbon footprint for display
  formatCarbonFootprint: (carbonFootprint) => {
    if (!carbonFootprint || carbonFootprint < 0.01) {
      return '<0.01 kg CO₂';
    }
    return `${carbonFootprint.toFixed(2)} kg CO₂`;
  },

  // Get emission intensity color for UI
  getEmissionIntensityColor: (intensity) => {
    const colors = {
      'zero': '#22c55e',        // green-500
      'very-low': '#65a30d',    // lime-600
      'low': '#eab308',         // yellow-500
      'low-medium': '#f59e0b',  // amber-500
      'medium': '#f97316',      // orange-500
      'medium-high': '#dc2626', // red-600
      'high': '#b91c1c',        // red-700
      'very-high': '#7f1d1d',   // red-900
      'negative': '#059669'     // emerald-600 (saves emissions)
    };
    return colors[intensity] || colors.medium;
  },

  // ===================================
  // DASHBOARD HELPER FUNCTIONS
  // ===================================

  // Format streak data for display
  formatStreak: (days) => {
    if (days === 0) return "No streak";
    if (days === 1) return "1 day";
    return `${days} days`;
  },

  // Get streak badge based on length
  getStreakBadge: (currentStreak, longestStreak) => {
    if (currentStreak === 0) return { text: "Start Today", color: "gray" };
    if (currentStreak >= longestStreak) return { text: "Personal Best!", color: "gold" };
    if (currentStreak >= 30) return { text: "Amazing!", color: "purple" };
    if (currentStreak >= 14) return { text: "Great Streak!", color: "green" };
    if (currentStreak >= 7) return { text: "Week Strong!", color: "blue" };
    return { text: "Building Up", color: "gray" };
  },

  // Calculate percentage vs community average
  getPerformanceVsCommunity: (userTotal, communityAverage) => {
    if (!communityAverage) return { percentage: 0, status: "unknown" };
    
    const difference = ((userTotal - communityAverage) / communityAverage) * 100;
    
    if (difference < -20) return { percentage: Math.abs(difference), status: "excellent" };
    if (difference < -10) return { percentage: Math.abs(difference), status: "good" };
    if (difference < 10) return { percentage: Math.abs(difference), status: "average" };
    return { percentage: difference, status: "needs_improvement" };
  }
  
};




export default activityService;