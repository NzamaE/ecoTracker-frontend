import axios from "axios"

// Use environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

// How long to wait for a cold-boot Render instance (90 seconds)
const COLD_BOOT_TIMEOUT = 90000
const NORMAL_TIMEOUT = 15000

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: NORMAL_TIMEOUT,
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
  (error) => Promise.reject(error)
)

// Response interceptor to handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

/**
 * Detects whether an error looks like a cold-boot / server-waking issue.
 * Covers: network timeouts, connection refused, and no response at all.
 */
export function isColdBootError(error) {
  if (!error) return false
  // Axios timeout
  if (error.code === "ECONNABORTED") return true
  // No response received (server not up yet)
  if (!error.response) return true
  // Gateway timeout from Render's proxy
  if (error.response?.status === 502 || error.response?.status === 503) return true
  return false
}

/**
 * Wraps an API call with cold-boot retry logic.
 * - On first cold-boot error: calls onWaking() so the UI can show a banner
 * - Retries every ~5 seconds for up to `maxWaitMs` (default 90s)
 * - Calls onReady() when the server responds successfully
 *
 * @param {() => Promise} apiFn          The API call to attempt
 * @param {object}        opts
 * @param {Function}      opts.onWaking  Called when cold boot is detected
 * @param {Function}      opts.onReady   Called when server wakes up
 * @param {number}        opts.maxWaitMs Max time to keep retrying (default 90000)
 */
export async function withWakeUp(apiFn, { onWaking, onReady, maxWaitMs = COLD_BOOT_TIMEOUT } = {}) {
  // First attempt with normal timeout
  try {
    const result = await apiFn()
    return result
  } catch (firstError) {
    if (!isColdBootError(firstError)) {
      // Real error (e.g. wrong credentials) — surface it immediately
      throw firstError
    }

    // Server is cold — notify the UI
    onWaking?.()

    const deadline = Date.now() + maxWaitMs
    const retryInterval = 5000

    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, retryInterval))
      try {
        // Use a longer timeout for wake-up retries
        const result = await apiFn({ timeout: COLD_BOOT_TIMEOUT })
        onReady?.()
        return result
      } catch (retryError) {
        if (!isColdBootError(retryError)) {
          // Server is awake but returned a real error (e.g. wrong password)
          onReady?.()
          throw retryError
        }
        // Still booting — keep looping
      }
    }

    // Timed out waiting
    throw new Error("The server is taking too long to wake up. Please try again in a moment.")
  }
}

export default API
