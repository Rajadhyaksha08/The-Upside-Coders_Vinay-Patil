import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, ChevronRight, Bell } from 'lucide-react';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import ServiceCard from '../../components/ServiceCard';
import WorkerCard from '../../components/WorkerCard';
import { useAuth } from '../../context/AuthContext';
import { SERVICES, WORKERS, BOOKINGS } from '../../data/mockData';

const ACTIVE_STATUSES = ['accepted', 'en_route', 'arrived', 'in_progress'];

const STATUS_LABEL = {
  accepted: 'Accepted',
  en_route: 'Worker En Route',
  arrived: 'Worker Arrived',
  in_progress: 'In Progress',
};

const STATUS_COLOR = {
  accepted: 'bg-blue-100 text-blue-700',
  en_route: 'bg-amber-100 text-amber-700',
  arrived: 'bg-green-100 text-green-700',
  in_progress: 'bg-teal-100 text-teal-700',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Suprabhat';
  if (h < 17) return 'Namaste';
  return 'Shubh Sandhya';
}

export default function CustomerHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const activeBookings = (BOOKINGS || []).filter(
    (b) => b.customerId === user?.id && ACTIVE_STATUSES.includes(b.status)
  );

  const availableWorkers = (WORKERS || [])
    .filter((w) => w.isAvailable)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 pt-4">
        {/* Greeting */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Customer'}! 👋
            </h2>
            <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{user?.city || 'Mumbai'}</span>
              <span className="mx-1 text-slate-300">·</span>
              <Clock className="w-3.5 h-3.5" />
              <span>{today}</span>
            </div>
          </div>
          <button
            className="relative w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm"
            onClick={() => {}}
          >
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>

        {/* Search bar */}
        <div
          className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 mb-6 shadow-sm cursor-pointer hover:border-teal-400 transition-colors"
          onClick={() => navigate('/customer/search')}
        >
          <Search className="w-5 h-5 text-teal-600 shrink-0" />
          <span className="text-slate-400 text-sm flex-1">
            Search for electrician, plumber, maid…
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Active bookings */}
        {activeBookings.length > 0 && (
          <div className="mb-6">
            <h3 className="text-base font-bold text-slate-900 mb-3">🔴 Active Bookings</h3>
            <div className="space-y-3">
              {activeBookings.map((b) => {
                const worker = (WORKERS || []).find((w) => w.id === b.workerId);
                const service = (SERVICES || []).find((s) => s.id === b.serviceId);
                return (
                  <div
                    key={b.id}
                    className="bg-white rounded-xl border border-teal-200 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{service?.icon || '🔧'}</span>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">
                            {service?.name || 'Service'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {worker?.name || 'Worker'}
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[b.status]}`}>
                        {STATUS_LABEL[b.status]}
                      </span>
                    </div>
                    <button
                      className="w-full btn-primary py-2 text-sm"
                      onClick={() => navigate(`/customer/track/${b.id}`)}
                    >
                      Track Booking
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Service Categories */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-900">Services</h3>
            <button
              className="text-sm text-teal-600 font-medium"
              onClick={() => navigate('/customer/search')}
            >
              See all
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {(SERVICES || []).slice(0, 8).map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                compact
                onClick={() =>
                  navigate('/customer/search', { state: { serviceId: service.id } })
                }
              />
            ))}
          </div>
        </div>

        {/* Nearby Workers */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-900">Nearby Workers</h3>
            <button
              className="text-sm text-teal-600 font-medium"
              onClick={() => navigate('/customer/workers')}
            >
              See all
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
            {availableWorkers.map((worker) => (
              <div key={worker.id} className="snap-start shrink-0 w-52">
                <WorkerCard
                  worker={worker}
                  compact
                  onClick={() => navigate(`/customer/worker/${worker.id}`)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
