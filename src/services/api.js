import axios from "axios"

// Use environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
})

// Request interceptor to add auth token
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token")
    if (token) {
      req.headers.Authorization = `Bearer ${token}`
    }
    return req
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export default API