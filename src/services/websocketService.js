import { io } from 'socket.io-client'

class WebSocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }

  connect() {
    const token = localStorage.getItem('token')
    if (!token) {
      console.warn('No token found, skipping WebSocket connection')
      return null
    }

    const serverUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000'
    
    this.socket = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
    })

    this.setupEventHandlers()
    return this.socket
  }

  setupEventHandlers() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server')
      this.isConnected = true
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from WebSocket server:', reason)
      this.isConnected = false
      
      // Auto-reconnect on certain disconnect reasons
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect automatically
        return
      }
      
      this.handleReconnection()
    })

    this.socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error)
      this.handleReconnection()
    })

    // Server maintenance notification
    this.socket.on('server_shutdown', (data) => {
      console.log('🔧 Server maintenance:', data.message)
    })

    // Server error notification
    this.socket.on('server_error', (data) => {
      console.error('💥 Server error:', data.message)
    })
  }

  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
      
      console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        if (!this.isConnected) {
          this.connect()
        }
      }, delay)
    } else {
      console.error('❌ Max reconnection attempts reached')
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.reconnectAttempts = 0
    }
  }

  // Activity tip events
  onActivityTip(callback) {
    if (this.socket) {
      this.socket.on('activity_tip', callback)
    }
  }

  offActivityTip(callback) {
    if (this.socket) {
      this.socket.off('activity_tip', callback)
    }
  }

  // Weekly insights events
  onWeeklyInsights(callback) {
    if (this.socket) {
      this.socket.on('weekly_insights', callback)
    }
  }

  offWeeklyInsights(callback) {
    if (this.socket) {
      this.socket.off('weekly_insights', callback)
    }
  }

  // Goal events
  onGoalSet(callback) {
    if (this.socket) {
      this.socket.on('goal_set', callback)
      this.socket.on('emission_goal_set', callback) // Handle both goal types
    }
  }

  offGoalSet(callback) {
    if (this.socket) {
      this.socket.off('goal_set', callback)
      this.socket.off('emission_goal_set', callback)
    }
  }

  onGoalMilestone(callback) {
    if (this.socket) {
      this.socket.on('goal_milestone', callback)
    }
  }

  offGoalMilestone(callback) {
    if (this.socket) {
      this.socket.off('goal_milestone', callback)
    }
  }

  onGoalStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('goal_status_update', callback)
    }
  }

  offGoalStatusUpdate(callback) {
    if (this.socket) {
      this.socket.off('goal_status_update', callback)
    }
  }

  // Trend alert events
  onTrendAlert(callback) {
    if (this.socket) {
      this.socket.on('trend_alert', callback)
    }
  }

  offTrendAlert(callback) {
    if (this.socket) {
      this.socket.off('trend_alert', callback)
    }
  }

  // Utility methods
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected
  }

  // Send ping to test connection
  ping() {
    if (this.socket && this.isConnected) {
      this.socket.emit('ping')
    }
  }

  // Listen for pong response
  onPong(callback) {
    if (this.socket) {
      this.socket.on('pong', callback)
    }
  }

  // Generic event emitter for custom events
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data)
    }
  }

  // Generic event listener for custom events
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }
}

export const websocketService = new WebSocketService()