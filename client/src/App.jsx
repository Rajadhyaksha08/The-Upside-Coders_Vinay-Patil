import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Landing & Auth
import Landing from './pages/Landing'
import Login from './pages/Login'

// Customer
import CustomerHome    from './pages/customer/CustomerHome'
import ServiceSearch   from './pages/customer/ServiceSearch'
import WorkerList      from './pages/customer/WorkerList'
import WorkerProfile   from './pages/customer/WorkerProfile'
import BookingFlow     from './pages/customer/BookingFlow'
import BookingTrack    from './pages/customer/BookingTrack'
import MyBookings      from './pages/customer/MyBookings'
import PrivateCall     from './pages/customer/PrivateCall'
import CustomerProfile from './pages/customer/CustomerProfile'

// Worker
import WorkerRegister   from './pages/worker/WorkerRegister'
import WorkerDashboard  from './pages/worker/WorkerDashboard'
import JobOffers        from './pages/worker/JobOffers'
import ArrivalOTP       from './pages/worker/ArrivalOTP'
import CompletionOTP    from './pages/worker/CompletionOTP'
import Earnings         from './pages/worker/Earnings'
import WorkerReviews    from './pages/worker/WorkerReviews'
import Referral         from './pages/worker/Referral'

// Admin
import AdminDashboard    from './pages/admin/AdminDashboard'
import WorkerModeration  from './pages/admin/WorkerModeration'
import DisputeManagement from './pages/admin/DisputeManagement'

// IVR
import IVRSimulator from './pages/ivr/IVRSimulator'

// Protected route wrapper
function Protected({ children, role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"      element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/ivr"   element={<IVRSimulator />} />
      <Route path="/worker/register" element={<WorkerRegister />} />

      {/* Customer */}
      <Route path="/customer" element={<Protected role="customer"><CustomerHome /></Protected>} />
      <Route path="/customer/search"       element={<Protected role="customer"><ServiceSearch /></Protected>} />
      <Route path="/customer/workers"      element={<Protected role="customer"><WorkerList /></Protected>} />
      <Route path="/customer/workers/:id"  element={<Protected role="customer"><WorkerProfile /></Protected>} />
      <Route path="/customer/book/:id"     element={<Protected role="customer"><BookingFlow /></Protected>} />
      <Route path="/customer/track/:id"    element={<Protected role="customer"><BookingTrack /></Protected>} />
      <Route path="/customer/bookings"     element={<Protected role="customer"><MyBookings /></Protected>} />
      <Route path="/customer/call/:id"     element={<Protected role="customer"><PrivateCall /></Protected>} />
      <Route path="/customer/profile"      element={<Protected role="customer"><CustomerProfile /></Protected>} />

      {/* Worker */}
      <Route path="/worker"              element={<Protected role="worker"><WorkerDashboard /></Protected>} />
      <Route path="/worker/jobs"         element={<Protected role="worker"><JobOffers /></Protected>} />
      <Route path="/worker/arrival-otp"  element={<Protected role="worker"><ArrivalOTP /></Protected>} />
      <Route path="/worker/complete-otp" element={<Protected role="worker"><CompletionOTP /></Protected>} />
      <Route path="/worker/earnings"     element={<Protected role="worker"><Earnings /></Protected>} />
      <Route path="/worker/reviews"      element={<Protected role="worker"><WorkerReviews /></Protected>} />
      <Route path="/worker/referral"     element={<Protected role="worker"><Referral /></Protected>} />

      {/* Admin */}
      <Route path="/admin"           element={<Protected role="admin"><AdminDashboard /></Protected>} />
      <Route path="/admin/workers"   element={<Protected role="admin"><WorkerModeration /></Protected>} />
      <Route path="/admin/disputes"  element={<Protected role="admin"><DisputeManagement /></Protected>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
