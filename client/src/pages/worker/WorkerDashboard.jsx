import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Wallet,
  Star,
  Users,
  CheckCircle,
  Clock,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Bell,
  PhoneCall,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Award,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { BOOKINGS, WORKERS } from '../../data/mockData';
import StarRating from '../../components/StarRating';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const worker = WORKERS.find((w) => w.id === user?.id) || WORKERS[0];
  const [isAvailable, setIsAvailable] = useState(worker.available);

  // Active jobs for this worker
  const activeJobs = BOOKINGS.filter(
    (b) => b.workerId === worker.id && ['accepted', 'en_route'].includes(b.status)
  );

  const pendingOffersCount = BOOKINGS.filter(
    (b) => b.workerId === worker.id && b.status === 'pending'
  ).length || 2;

  const handleToggleAvailability = () => {
    const nextState = !isAvailable;
    setIsAvailable(nextState);
    if (nextState) {
      toast.success('You are now ONLINE! Receiving nearby alerts 🟢');
    } else {
      toast('You are now OFFLINE. Enjoy your rest! 🔴');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* ========================================================= */}
        {/* HERO PARTNER STATUS & LIVE RADAR BANNER                   */}
        {/* ========================================================= */}
        <div
          className={`card p-6 rounded-3xl transition-all duration-300 text-white shadow-xl relative overflow-hidden ${
            isAvailable
              ? 'bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 border-2 border-teal-500/40'
              : 'bg-gradient-to-r from-slate-900 to-slate-950 border-2 border-slate-800'
          }`}
        >
          {/* Background Ambient Glow */}
          <div
            className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
              isAvailable ? 'bg-teal-400' : 'bg-red-500'
            }`}
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
            {/* Worker Avatar & Info */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className={`w-16 h-16 rounded-2xl ${worker.avatarColor} text-white font-black text-2xl flex items-center justify-center border-2 border-white/30 shadow-lg`}
                >
                  {worker.initials || 'RK'}
                </div>
                {isAvailable && (
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">{worker.name}</h1>
                  {worker.aadhaarVerified && (
                    <span
                      title="Aadhaar Verified Partner"
                      className="inline-flex items-center gap-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Aadhaar Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-teal-200 mt-0.5 font-medium">
                  {worker.skills[0]} Specialist • {worker.city} (PIN {worker.pincode})
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <StarRating rating={worker.rating} size="sm" readonly />
                  <span className="text-xs text-slate-300 font-semibold">
                    {worker.rating} ({worker.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Tactile Availability Switch */}
            <div className="flex items-center justify-between sm:justify-end gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
              <div className="text-left sm:text-right">
                <p className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">
                  Partner Duty
                </p>
                <p
                  className={`text-sm font-black ${
                    isAvailable ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {isAvailable ? 'ONLINE & VISIBLE' : 'OFFLINE (RESTING)'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleAvailability}
                className={`relative inline-flex h-8 w-15 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAvailable ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isAvailable ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STATS METRICS GRID                                        */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card p-4 text-center border border-slate-100">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Today's Completed
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1">3 Jobs</p>
            <span className="text-[10px] text-emerald-600 font-bold">100% on-time</span>
          </div>

          <div className="card p-4 text-center border border-slate-100">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Weekly Payout
            </span>
            <p className="text-2xl font-black text-teal-700 mt-1">₹4,850</p>
            <span className="text-[10px] text-teal-600 font-semibold">0% Commission</span>
          </div>

          <div className="card p-4 text-center border border-slate-100">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Rating
            </span>
            <p className="text-2xl font-black text-amber-500 mt-1">4.8 ★</p>
            <span className="text-[10px] text-slate-400">Top 5% Partner</span>
          </div>

          <div className="card p-4 text-center border border-slate-100">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Pending Offers
            </span>
            <p className="text-2xl font-black text-rose-600 mt-1">{pendingOffersCount}</p>
            <span className="text-[10px] text-rose-500 font-bold">Expiring soon</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PENDING JOB OFFERS RADAR BANNER                           */}
        {/* ========================================================= */}
        <Link
          to="/worker/jobs"
          className="card p-5 bg-gradient-to-r from-amber-50 via-amber-100/60 to-orange-50 border-2 border-amber-300 hover:border-amber-400 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/30 flex-shrink-0 group-hover:scale-105 transition-transform">
              <Bell className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="badge badge-amber text-[10px] font-bold">HIGH DEMAND</span>
                <span className="text-xs text-amber-800 font-semibold">• 5–15 km Area</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg mt-0.5">
                {pendingOffersCount} Customer Job Requests Awaiting Your Acceptance!
              </h3>
              <p className="text-xs text-slate-600">
                Guaranteed payment direct to your UPI with zero deduction.
              </p>
            </div>
          </div>

          <span className="btn-primary py-2.5 px-4 text-xs whitespace-nowrap bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1 self-start sm:self-center shadow">
            Inspect Offers <ChevronRight className="w-4 h-4" />
          </span>
        </Link>

        {/* ========================================================= */}
        {/* CURRENT ASSIGNED WORK (DOORSTEP OTP INLINE)               */}
        {/* ========================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" /> Active Job In Hand
            </h2>
            <span className="text-xs text-slate-400 font-medium">Auto-synced</span>
          </div>

          {activeJobs.length === 0 ? (
            <div className="card p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200">
              No current assignment in progress. Check Job Offers to accept a new customer.
            </div>
          ) : (
            activeJobs.map((job) => (
              <div
                key={job.id}
                className="card p-5 border-l-4 border-l-teal-600 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="badge badge-teal text-[11px] font-bold mb-1">
                      {job.service}
                    </span>
                    <h3 className="font-bold text-slate-900 text-lg">{job.customerName}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Agreed Budget</span>
                    <span className="text-xl font-black text-teal-700">₹{job.budget}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span className="font-medium text-slate-800">{job.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>Scheduled Arrival: {job.time}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => navigate('/worker/arrival-otp')}
                    className="btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    1. Enter Arrival OTP
                  </button>
                  <button
                    onClick={() => navigate('/worker/complete-otp')}
                    className="btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    2. Finish & Collect OTP
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ========================================================= */}
        {/* 4 QUICK ACTION HUB CARDS                                  */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/worker/earnings"
            className="card card-hover p-4 flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Earnings</p>
              <p className="text-[11px] text-slate-400">Instant UPI transfer</p>
            </div>
          </Link>

          <Link
            to="/worker/reviews"
            className="card card-hover p-4 flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">My Reviews</p>
              <p className="text-[11px] text-slate-400">Customer feedback</p>
            </div>
          </Link>

          <Link
            to="/worker/referral"
            className="card card-hover p-4 flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Refer & Earn</p>
              <p className="text-[11px] text-slate-400">₹100 bonus / worker</p>
            </div>
          </Link>

          <Link
            to="/ivr"
            className="card card-hover p-4 flex flex-col justify-between border-2 border-teal-500/30"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">IVR Simulator</p>
              <p className="text-[11px] text-slate-400">2G Feature Phone Mode</p>
            </div>
          </Link>
        </div>

        {/* ========================================================= */}
        {/* WEEKLY EARNINGS LEDGER & GOAL PROGRESS                     */}
        {/* ========================================================= */}
        <div className="card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Weekly Goal Progress</h3>
              <p className="text-xs text-slate-400">₹4,850 achieved of ₹6,000 target</p>
            </div>
            <span className="text-xs font-black text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
              81% Completed
            </span>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal-500 to-teal-700 rounded-full w-[81%]" />
          </div>

          {/* Day-by-Day Activity Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-24 pt-2">
            {[
              { day: 'Mon', h: 'h-10', val: '₹600' },
              { day: 'Tue', h: 'h-14', val: '₹850' },
              { day: 'Wed', h: 'h-6', val: '₹400' },
              { day: 'Thu', h: 'h-18', val: '₹1100' },
              { day: 'Fri', h: 'h-12', val: '₹700' },
              { day: 'Sat', h: 'h-20', val: '₹1200' },
              { day: 'Sun', h: 'h-1', val: '₹0' },
            ].map((bar) => (
              <div key={bar.day} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className={`w-full max-w-[28px] ${bar.h} bg-teal-600 rounded-t-md hover:bg-teal-700 transition-all`}
                  title={bar.val}
                />
                <span className="text-[10px] text-slate-400 font-medium">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
