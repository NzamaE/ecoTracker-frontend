import { io } from 'socket.io-client'

class WebSocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }

  getServerUrl() {
    if (import.meta.env.MODE === 'development') {
      return 'http://localhost:3000'
    }
    
    // For production, use dedicated WebSocket URL or derive from API URL
    return import.meta.env.VITE_WS_URL || 
           import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 
           'http://localhost:3000'
  }

  connect() {
    const token = localStorage.getItem('token')
    if (!token) {
      console.warn('No token found, skipping WebSocket connection')
      return null
    }

    const serverUrl = this.getServerUrl()
    console.log('🔌 Attempting to connect to WebSocket at:', serverUrl)
    
    this.socket = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true, // Force new connection for better reliability
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5
    })

    this.setupEventHandlers()
    return this.socket
  }

  setupEventHandlers() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server')
      console.log('🆔 Socket ID:', this.socket.id)
      this.isConnected = true
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from WebSocket server:', reason)
      this.isConnected = false
      
      // Handle different disconnect reasons
      if (reason === 'io server disconnect') {
        console.log('🔧 Server initiated disconnect - will not auto-reconnect')
        return
      }
      
      if (reason === 'ping timeout' || reason === 'transport close') {
        console.log('🔄 Connection lost - attempting reconnection...')
        this.handleReconnection()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error.message)
      this.isConnected = false
      
      // Handle authentication errors
      if (error.message === 'Authentication error') {
        console.error('🔐 Authentication failed - check your token')
        return
      }
      
      this.handleReconnection()
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected to WebSocket server after', attemptNumber, 'attempts')
      this.isConnected = true
      this.reconnectAttempts = 0
    })

    this.socket.on('reconnect_error', (error) => {
      console.error('🔄 Reconnection failed:', error.message)
    })

    this.socket.on('reconnect_failed', () => {
      console.error('💥 Failed to reconnect after maximum attempts')
    })

    // Server maintenance notification
    this.socket.on('server_shutdown', (data) => {
      console.log('🔧 Server maintenance:', data.message)
      // Don't attempt to reconnect on intentional shutdown
      this.maxReconnectAttempts = 0
    })

    // Server error notification
    this.socket.on('server_error', (data) => {
      console.error('💥 Server error:', data.message)
    })
  }

  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      
      // Exponential backoff with jitter for Render's wake-up time
      const baseDelay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
      const jitter = Math.random() * 1000 // Add randomness to avoid thundering herd
      const delay = baseDelay + jitter
      
      console.log(`🔄 Attempting to reconnect in ${Math.round(delay)}ms... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        if (!this.isConnected && this.reconnectAttempts <= this.maxReconnectAttempts) {
          // Refresh token before reconnecting
          const token = localStorage.getItem('token')
          if (token) {
            this.connect()
          } else {
            console.error('🔐 No token available for reconnection')
          }
        }
      }, delay)
    } else {
      console.error('❌ Max reconnection attempts reached. Please refresh the page.')
      // You could emit a custom event here to notify the UI
      // this.emit('max_reconnect_attempts_reached')
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Manually disconnecting WebSocket')
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
      console.log('📡 Sending ping to server')
      this.socket.emit('ping')
    }
  }

  // Listen for pong response
  onPong(callback) {
    if (this.socket) {
      this.socket.on('pong', (data) => {
        console.log('📡 Received pong from server:', data)
        callback(data)
      })
    }
  }

  // Generic event emitter for custom events
  emit(event, data) {
    if (this.socket && this.isConnected) {
      console.log(`📤 Emitting event: ${event}`, data)
      this.socket.emit(event, data)
    } else {
      console.warn(`Cannot emit ${event}: WebSocket not connected`)
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

  // Method to manually trigger reconnection (useful for UI buttons)
  forceReconnect() {
    console.log('🔄 Force reconnecting...')
    this.disconnect()
    setTimeout(() => {
      this.connect()
    }, 1000)
  }

  // Get connection status for UI
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
      socketId: this.socket?.id || null
    }
  }
}

export const websocketService = new WebSocketService()