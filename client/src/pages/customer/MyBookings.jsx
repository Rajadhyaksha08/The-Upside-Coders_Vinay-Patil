import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ChevronRight, Plus } from 'lucide-react';
import { BOOKINGS } from '../../data/mockData';
import BookingStatusBadge from '../../components/BookingStatusBadge';
import EmptyState from '../../components/EmptyState';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';

export default function MyBookings() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const filteredBookings = BOOKINGS.filter((booking) => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['pending', 'accepted', 'en_route', 'arrived'].includes(booking.status);
    if (filter === 'completed') return booking.status === 'completed';
    if (filter === 'cancelled') return ['cancelled', 'disputed'].includes(booking.status);
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Bookings</h1>
            <p className="text-xs text-slate-500">Track and manage your scheduled home services</p>
          </div>
          <Link
            to="/customer/search"
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> New Booking
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'All Bookings' },
            { id: 'active', label: 'Active / Upcoming' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled / Disputed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No bookings found"
            description="You don't have any bookings matching this filter."
            actionLabel="Book a Service"
            onAction={() => navigate('/customer/search')}
          />
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                onClick={() => navigate(`/customer/track/${b.id}`)}
                className="card card-hover p-4 sm:p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                      {b.service}
                    </span>
                    <h3 className="font-bold text-slate-800 text-base mt-1">
                      {b.workerName}
                    </h3>
                  </div>
                  <BookingStatusBadge status={b.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 py-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{b.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{b.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{b.address}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 mr-1.5">Est. Budget:</span>
                    <span className="font-bold text-slate-800">₹{b.budget}</span>
                  </div>
                  <span className="text-teal-700 font-semibold flex items-center gap-0.5 hover:underline">
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
