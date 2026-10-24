import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  ShieldCheck,
  CheckCircle,
  Clock,
  MapPin,
  AlertTriangle,
  Send,
  Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { BOOKINGS, WORKERS, STATUS_CONFIG } from '../../data/mockData';
import BookingStatusBadge from '../../components/BookingStatusBadge';
import StarRating from '../../components/StarRating';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';

export default function BookingTrack() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find booking or use fallback mock
  const existingBooking = BOOKINGS.find((b) => b.id === id) || {
    id: id || 'b_new',
    customerId: 'c1',
    customerName: 'Priya Sharma',
    workerId: 'w1',
    workerName: 'Ramesh Kumar',
    service: 'Electrician',
    status: 'en_route',
    date: 'Today',
    time: '2:30 PM',
    address: '45, Rose Garden Society, Sector 14, Gurugram',
    pincode: '122001',
    budget: 550,
    amount: null,
    requestCode: '654321',
    arrivalOTP: '4821',
    completionOTP: '9034',
  };

  const [booking, setBooking] = useState(existingBooking);
  const worker = WORKERS.find((w) => w.id === booking.workerId) || WORKERS[0];

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Status progression steps
  const statusSteps = [
    { key: 'pending', label: 'Requested', icon: Clock, desc: 'Waiting for worker' },
    { key: 'accepted', label: 'Accepted', icon: CheckCircle, desc: 'Worker confirmed job' },
    { key: 'en_route', label: 'En Route', icon: MapPin, desc: 'Worker is on the way' },
    { key: 'arrived', label: 'Arrived', icon: CheckCircle, desc: 'OTP verified upon arrival' },
    { key: 'completed', label: 'Completed', icon: Star, desc: 'Service finished' },
  ];

  const getStepStatus = (stepKey) => {
    const order = ['pending', 'accepted', 'en_route', 'arrived', 'completed'];
    const currentIdx = order.indexOf(booking.status);
    const stepIdx = order.indexOf(stepKey);

    if (booking.status === 'cancelled' || booking.status === 'disputed') {
      return 'neutral';
    }
    if (stepIdx < currentIdx) return 'done';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setBooking((prev) => ({ ...prev, status: 'cancelled' }));
      toast.error('Booking has been cancelled');
    }
  };

  const handleSimulateArrive = () => {
    setBooking((prev) => ({ ...prev, status: 'arrived' }));
    toast.success('Worker marked as Arrived!');
  };

  const handleSimulateComplete = () => {
    setBooking((prev) => ({ ...prev, status: 'completed' }));
    toast.success('Work finished! Please confirm with completion OTP');
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setTimeout(() => {
      setSubmittingReview(false);
      setShowReviewModal(false);
      setBooking((prev) => ({ ...prev, rating, review: comment }));
      toast.success('Thank you for rating your Saathi!');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/customer/bookings')}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-teal-700"
          >
            <ArrowLeft className="w-4 h-4" /> My Bookings
          </button>
          <BookingStatusBadge status={booking.status} />
        </div>

        {/* Security / Request Code Alert */}
        <div className="card bg-gradient-to-r from-teal-900 to-slate-900 text-white p-5 rounded-2xl shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-teal-300 text-xs font-semibold uppercase tracking-wider mb-1">
                Security Request Code
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold tracking-widest font-mono text-teal-100">
                {booking.requestCode || '892401'}
              </p>
              <p className="text-slate-300 text-xs mt-1">
                Verify this code before letting the worker begin work.
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-800/60 flex items-center justify-center text-teal-300">
              <ShieldCheck className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* OTP Sharing Box (Conditional) */}
        {(booking.status === 'en_route' || booking.status === 'arrived') && (
          <div className="card border-2 border-teal-500 bg-teal-50/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-teal-800 uppercase tracking-wide">
                  Arrival OTP for Worker
                </p>
                <p className="text-3xl font-mono font-black text-teal-700 tracking-widest mt-0.5">
                  {booking.arrivalOTP || '4821'}
                </p>
                <p className="text-xs text-teal-900 mt-1">
                  Share this 4-digit code only when worker is at your doorstep.
                </p>
              </div>
              <span className="badge badge-teal py-1.5 px-3">Arrival Verification</span>
            </div>
          </div>
        )}

        {/* Worker Card */}
        <div className="card p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-14 h-14 rounded-full ${worker.avatarColor} text-white font-bold text-xl flex items-center justify-center shadow-sm`}
            >
              {worker.initials || 'WK'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-800 text-base">{worker.name}</h3>
                {worker.aadhaarVerified && (
                  <ShieldCheck className="w-4 h-4 text-teal-600 fill-teal-100" />
                )}
              </div>
              <p className="text-xs text-slate-500">{booking.service} Specialist</p>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={worker.rating} size="sm" readonly />
                <span className="text-xs text-slate-400">({worker.reviewCount})</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              to={`/customer/call/${worker.id}`}
              className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" /> Call Worker
            </Link>
          </div>
        </div>

        {/* Status Stepper */}
        <div className="card p-5">
          <h4 className="font-bold text-slate-800 text-sm mb-4">Service Timeline</h4>
          <div className="space-y-4">
            {statusSteps.map((step, idx) => {
              const state = getStepStatus(step.key);
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex items-start gap-3 relative">
                  {/* Connecting Line */}
                  {idx < statusSteps.length - 1 && (
                    <div
                      className={`absolute left-4 top-8 w-0.5 h-8 -ml-px ${
                        state === 'done' ? 'bg-teal-600' : 'bg-slate-200'
                      }`}
                    />
                  )}

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-colors ${
                      state === 'done'
                        ? 'bg-teal-600 text-white'
                        : state === 'active'
                        ? 'border-2 border-teal-600 bg-teal-50 text-teal-700 ring-4 ring-teal-100'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p
                      className={`text-sm font-semibold ${
                        state === 'active'
                          ? 'text-teal-700'
                          : state === 'done'
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-slate-500">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Simulation Controls */}
        <div className="card p-4 border border-dashed border-teal-300 bg-teal-50/40">
          <p className="text-xs font-bold text-teal-800 uppercase tracking-wide mb-2">
            Demo Simulator Controls
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={handleSimulateArrive}
              className="bg-white border border-teal-600 text-teal-700 px-3 py-1.5 rounded-lg font-medium hover:bg-teal-50"
            >
              Simulate: Worker Arrived
            </button>
            <button
              onClick={handleSimulateComplete}
              className="bg-white border border-teal-600 text-teal-700 px-3 py-1.5 rounded-lg font-medium hover:bg-teal-50"
            >
              Simulate: Work Completed
            </button>
            {booking.status !== 'cancelled' && (
              <button
                onClick={handleCancel}
                className="bg-white border border-red-400 text-red-600 px-3 py-1.5 rounded-lg font-medium hover:bg-red-50"
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>

        {/* Rate & Review Button if Completed */}
        {booking.status === 'completed' && (
          <div className="card p-5 bg-amber-50/70 border border-amber-200 text-center">
            <h4 className="font-bold text-amber-900 text-base mb-1">How was your service?</h4>
            <p className="text-xs text-amber-800 mb-4">
              Help your community find trusted workers with honest feedback.
            </p>
            {booking.review ? (
              <div className="bg-white p-3 rounded-xl border border-amber-200 inline-block text-left max-w-sm">
                <StarRating rating={booking.rating} size="sm" readonly />
                <p className="text-xs text-slate-700 mt-1 italic">"{booking.review}"</p>
              </div>
            ) : (
              <button
                onClick={() => setShowReviewModal(true)}
                className="btn-primary bg-amber-600 hover:bg-amber-700 text-xs py-2 px-5 inline-flex items-center gap-1.5"
              >
                <Star className="w-4 h-4 fill-white" /> Rate & Review Saathi
              </button>
            )}
          </div>
        )}

        {/* Booking Details */}
        <div className="card p-5 space-y-3 text-sm">
          <h4 className="font-bold text-slate-800 text-sm border-b pb-2">Order Information</h4>
          <div className="flex justify-between py-1 text-xs">
            <span className="text-slate-500">Booking ID</span>
            <span className="font-mono font-medium text-slate-800">#{booking.id}</span>
          </div>
          <div className="flex justify-between py-1 text-xs">
            <span className="text-slate-500">Service Scheduled</span>
            <span className="font-medium text-slate-800">{booking.date} at {booking.time}</span>
          </div>
          <div className="flex justify-between py-1 text-xs">
            <span className="text-slate-500">Agreed Estimated Budget</span>
            <span className="font-bold text-teal-700">₹{booking.budget}</span>
          </div>
          <div className="pt-2 text-xs">
            <span className="text-slate-500 block mb-1">Service Address:</span>
            <span className="text-slate-700 font-medium">{booking.address}</span>
          </div>
        </div>
      </main>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">Rate {worker.name}</h3>
            <div className="flex justify-center py-2">
              <StarRating rating={rating} onRate={setRating} size="lg" />
            </div>
            <div>
              <label className="label">Write your feedback</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Punctual, clean work, friendly behavior..."
                className="input-field resize-none text-xs"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="btn-ghost text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="btn-primary text-xs py-2 px-5 flex items-center gap-1"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
