import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "sonner"; // Add this import

import Navbar from '@/components/Navbar'
import Hero06 from '@/components/hero-06/hero-06'
import Features01 from '@/components/Features-01/features-01'
import Timeline06 from '@/components/Timeline-06/timeline-06'
import Footer05 from '@/components/Footer-05/footer-05'
import Login02 from '@/components/login-02/login-02'
import SignUp02 from '@/components/signup-02/signup-02'

import Dashboard from '@/components/dashboard/dashboard'
import Goals from '@/components/dashboard/goals'
import Leaderboard from '@/components/leaderboard/leaderboard'
import Insights from '@/components/insights/insights'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp02 />} />
        <Route path="/login" element={<Login02 />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/" element={
          <>
            <Navbar />
            <Hero06 />
            <Features01 />
            <Timeline06 />
            <Footer05 />
          </>
        } />
      </Routes>
      
      {/* Add Sonner Toaster at the end, outside of Routes */}
      <Toaster
        position="top-right"
        expand={true}
        richColors={true}
        closeButton={true}
        toastOptions={{
          style: {
            borderRadius: '8px',
          },
          className: 'sonner-toast',
          duration: 5000,
        }}
      />
    </Router>
  )
}

export default App