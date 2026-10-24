import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Clock,
  ChevronRight,
  Bell,
  ShieldCheck,
  Zap,
  Star,
  Sparkles,
  Phone,
  ArrowRight,
  SlidersHorizontal,
  Flame,
  Award,
  CheckCircle2,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import ServiceCard from '../../components/ServiceCard';
import WorkerCard from '../../components/WorkerCard';
import { useAuth } from '../../context/AuthContext';
import { SERVICES, WORKERS, BOOKINGS } from '../../data/mockData';

export default function CustomerHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCity, setSelectedCity] = useState(user?.city || 'Delhi-NCR');
  const [selectedPincode, setSelectedPincode] = useState(user?.pincode || '110005');
  const [activeCategory, setActiveCategory] = useState('All');

  // Filter available workers
  const availableWorkers = WORKERS.filter((w) => w.available).slice(0, 4);

  // Active bookings in progress
  const activeBookings = BOOKINGS.filter(
    (b) => ['accepted', 'en_route', 'arrived'].includes(b.status)
  ).slice(0, 1);

  const quickFilterPills = [
    { id: 'All', label: 'All Services', icon: '✨' },
    { id: 'Emergency', label: '⚡ Emergency 15-Min', icon: '⚡' },
    { id: 'Cleaning', label: 'Deep Cleaning', icon: '🧹' },
    { id: 'Electrical', label: 'Wiring & Fans', icon: '💡' },
    { id: 'Plumbing', label: 'Leak Repair', icon: '🔧' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* ========================================================= */}
        {/* HERO GREETING & LOCATION HEADER                           */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Verified Hyperlocal Network
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              Namaste, {user?.name?.split(' ')[0] || 'Guest'}! 👋
            </h1>
            <p className="text-xs text-slate-500">
              Trusted, Aadhaar-verified local home experts within 5–15 km
            </p>
          </div>

          {/* Location Selector Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-white border border-slate-200 px-3.5 py-2 rounded-2xl shadow-sm text-xs">
            <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-800">{selectedCity}</span>
              <span className="text-slate-400 ml-1">({selectedPincode})</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODERN SEARCH BAR & EMERGENCY LAUNCHER                    */}
        {/* ========================================================= */}
        <div className="relative">
          <div
            onClick={() => navigate('/customer/search')}
            className="flex items-center gap-3 bg-white border-2 border-teal-500/30 hover:border-teal-500 rounded-2xl px-4 py-3.5 shadow-sm cursor-pointer transition-all duration-150 group"
          >
            <Search className="w-5 h-5 text-teal-600 group-hover:scale-110 transition-transform" />
            <span className="text-slate-400 text-sm flex-1 font-medium">
              Search for electrician, plumber, cook, maid...
            </span>
            <span className="bg-teal-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 group-hover:bg-teal-700">
              Find <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Quick Filter Horizontal Scroll Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {quickFilterPills.map((pill) => (
            <button
              key={pill.id}
              onClick={() => setActiveCategory(pill.id)}
              className={`px-3.5 py-2 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === pill.id
                  ? 'bg-teal-700 text-white shadow-sm ring-2 ring-teal-200 font-bold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{pill.icon}</span>
              <span>{pill.label}</span>
            </button>
          ))}
        </div>

        {/* ========================================================= */}
        {/* ACTIVE LIVE BOOKING PROGRESS WIDGET (IF ANY)              */}
        {/* ========================================================= */}
        {activeBookings.length > 0 && (
          <div
            onClick={() => navigate(`/customer/track/${activeBookings[0].id}`)}
            className="card p-4 sm:p-5 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white shadow-lg cursor-pointer hover:scale-[1.01] transition-transform"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                  Live Service In Progress
                </span>
              </div>
              <span className="badge bg-teal-500/20 text-teal-200 border border-teal-500/40 text-[11px]">
                Order #{activeBookings[0].id}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-white">
                  {activeBookings[0].workerName} is on the way 🛵
                </h3>
                <p className="text-xs text-teal-200 mt-0.5">
                  Service: {activeBookings[0].service} • Arriving by {activeBookings[0].time}
                </p>
              </div>
              <span className="btn-primary text-xs py-2 px-3 bg-white text-teal-900 font-bold hover:bg-teal-50">
                Track Live ➔
              </span>
            </div>

            {/* Doorstep Code Hint */}
            <div className="mt-3 pt-3 border-t border-teal-700/60 flex justify-between items-center text-xs">
              <span className="text-teal-200">Doorstep Arrival OTP:</span>
              <span className="font-mono font-bold tracking-widest text-teal-100 bg-teal-950 px-2 py-0.5 rounded border border-teal-600/40">
                {activeBookings[0].arrivalOTP || '4821'}
              </span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TRUST BANNER PROMO                                        */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="card p-3.5 bg-teal-50/60 border border-teal-200 flex items-center gap-3">
            <div className="p-2.5 bg-teal-600 text-white rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-xs">Aadhaar Verified</p>
              <p className="text-[11px] text-slate-500">100% background checked</p>
            </div>
          </div>

          <div className="card p-3.5 bg-amber-50/60 border border-amber-200 flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-xs">Number Masked</p>
              <p className="text-[11px] text-slate-500">Full contact privacy</p>
            </div>
          </div>

          <div className="card p-3.5 bg-indigo-50/60 border border-indigo-200 flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-xs">0% Hidden Charges</p>
              <p className="text-[11px] text-slate-500">Pay directly after OTP</p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SERVICE CATEGORIES GRID                                   */}
        {/* ========================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Explore Services
              </h2>
              <p className="text-xs text-slate-500">Transparent rates, upfront quotes</p>
            </div>
            <button
              onClick={() => navigate('/customer/search')}
              className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-0.5"
            >
              View All 10 <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {SERVICES.slice(0, 10).map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onClick={() =>
                  navigate('/customer/search', { state: { serviceId: service.id } })
                }
              />
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* TOP VERIFIED LOCAL WORKERS (NEAR YOU)                     */}
        {/* ========================================================= */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Top Rated Saathis Near You
              </h2>
              <p className="text-xs text-slate-500">Available right now for quick dispatch</p>
            </div>
            <button
              onClick={() => navigate('/customer/workers')}
              className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-0.5"
            >
              See All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {availableWorkers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* CALL IVR FLOATING PROMO BANNER                            */}
        {/* ========================================================= */}
        <div className="card p-5 bg-gradient-to-r from-slate-900 to-teal-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="badge bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px]">
              Toll-Free 1800-SEVA-SA
            </span>
            <h3 className="text-base font-bold text-white">Know a worker without a smartphone?</h3>
            <p className="text-xs text-slate-300">
              They can dial our 2G IVR simulator from any basic phone to receive jobs with 0 internet.
            </p>
          </div>
          <button
            onClick={() => navigate('/ivr')}
            className="btn-primary py-2.5 px-4 text-xs whitespace-nowrap bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold"
          >
            Launch IVR Simulator ➔
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
